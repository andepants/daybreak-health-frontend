/**
 * ScheduleContainer component - orchestrates the appointment scheduling flow
 *
 * Main container component that brings together the calendar, time slot picker,
 * and session details to create a complete scheduling experience. Manages
 * state for date/time selection and coordinates data fetching.
 *
 * Features:
 * - Two-step selection: date then time
 * - Session details sidebar (desktop) or header (mobile)
 * - "Confirm Booking" button (enabled when time selected)
 * - "Back to Matching" navigation
 * - Real-time availability updates
 * - Loading and error states
 *
 * Layout:
 * - Desktop: Calendar + Time slots (left) | Session details (right sidebar)
 * - Mobile: Stacked layout with session details at top
 *
 * Visual Design:
 * - Cream background
 * - Teal primary actions
 * - Clear visual hierarchy
 *
 * Accessibility:
 * - Logical tab order
 * - ARIA live regions for updates
 * - Keyboard navigable
 */
"use client";

import * as React from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AppointmentCalendar } from "./AppointmentCalendar";
import { TimeSlotPicker, type TimeSlot } from "./TimeSlotPicker";
import { SessionDetails } from "./SessionDetails";
import { useDetectedTimezone } from "./TimezoneSelector";
import { useGetTherapistAvailabilityQuery } from "@/types/graphql";

/**
 * Check if a therapist is a fallback/mock therapist
 * Fallback therapists have IDs prefixed with "fallback_"
 */
function isFallbackTherapist(therapistId: string): boolean {
  return therapistId.startsWith("fallback_");
}

/**
 * Generate mock availability data for fallback therapists
 * Creates availability for the next 14 days with realistic time slots
 */
function generateMockAvailability(therapistId: string, therapistName: string, timezone: string) {
  const availableDates = [];
  const today = new Date();

  // Generate availability for next 14 days
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    // Skip weekends for more realistic availability
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue;
    }

    const dateStr = date.toISOString().split("T")[0];

    // Generate 3-5 time slots per day
    const slots = [];
    const slotTimes = [9, 10, 11, 14, 15, 16]; // 9am, 10am, 11am, 2pm, 3pm, 4pm

    // Randomly select 3-5 slots
    const numSlots = 3 + Math.floor(Math.random() * 3);
    const selectedTimes = slotTimes.slice(0, numSlots);

    for (const hour of selectedTimes) {
      const startTime = new Date(date);
      startTime.setHours(hour, 0, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(50); // 50-minute sessions

      slots.push({
        __typename: "AvailableSlot" as const,
        id: `mock_slot_${dateStr}_${hour}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        isAvailable: true,
        timezone,
      });
    }

    availableDates.push({
      __typename: "AvailableDate" as const,
      date: dateStr,
      hasAvailability: slots.length > 0,
      slots,
    });
  }

  return {
    __typename: "TherapistAvailabilityResult" as const,
    therapistId,
    therapistName,
    therapistPhotoUrl: null,
    timezone,
    availableDates,
  };
}

/**
 * Props for ScheduleContainer component
 * @param therapistId - ID of the selected therapist
 * @param therapistName - Name of the therapist
 * @param therapistPhotoUrl - URL to therapist's photo
 * @param onBack - Callback when "Back to Matching" is clicked
 * @param onConfirmBooking - Callback when booking is confirmed with selected slot
 * @param sessionId - Current onboarding session ID
 * @param className - Optional additional CSS classes
 */
export interface ScheduleContainerProps {
  therapistId: string;
  therapistName: string;
  therapistPhotoUrl?: string;
  onBack: () => void;
  onConfirmBooking: (slot: TimeSlot, timezone: string) => void;
  sessionId?: string;
  className?: string;
}

/**
 * Orchestrates the appointment scheduling flow with calendar and time selection
 *
 * State Management:
 * - Selected date (calendar)
 * - Selected time slot
 * - User timezone (with auto-detection)
 *
 * Data Fetching:
 * - GraphQL query for therapist availability
 * - Refetch on timezone change
 * - Loading and error states
 *
 * @example
 * <ScheduleContainer
 *   therapistId="123"
 *   therapistName="Dr. Sarah Johnson"
 *   onBack={() => router.push('/matching')}
 *   onConfirmBooking={(slot, tz) => handleBooking(slot, tz)}
 * />
 */
export function ScheduleContainer({
  therapistId,
  therapistName,
  therapistPhotoUrl,
  onBack,
  onConfirmBooking,
  sessionId,
  className,
}: ScheduleContainerProps) {
  // State
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = React.useState<TimeSlot | undefined>();
  const detectedTimezone = useDetectedTimezone();
  const [timezone, setTimezone] = React.useState<string>(detectedTimezone);

  // Update timezone when detection completes
  React.useEffect(() => {
    if (detectedTimezone) {
      setTimezone(detectedTimezone);
    }
  }, [detectedTimezone]);

  /**
   * Check if this is a fallback therapist (for mock data)
   */
  const isFallback = isFallbackTherapist(therapistId);

  /**
   * Calculate date range for availability query
   * Start: today, End: 3 months from today
   */
  const dateRange = React.useMemo(() => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }, []);

  /**
   * Fetch therapist availability from GraphQL API
   * Skip query for fallback therapists - use mock data instead
   */
  const { data: queryData, loading, error } = useGetTherapistAvailabilityQuery({
    variables: {
      therapistId,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      timezone,
    },
    skip: !therapistId || isFallback,
    fetchPolicy: "cache-and-network",
  });

  /**
   * Generate mock availability for fallback therapists
   * Memoized to prevent regeneration on every render
   */
  const mockData = React.useMemo(() => {
    if (!isFallback) return null;
    return {
      therapistAvailability: generateMockAvailability(therapistId, therapistName, timezone),
    };
  }, [isFallback, therapistId, therapistName, timezone]);

  /**
   * Combined data source - use mock data for fallback therapists, query data otherwise
   */
  const data = isFallback ? mockData : queryData;

  /**
   * Extract available dates from query response
   */
  const availableDates = React.useMemo(() => {
    if (!data?.therapistAvailability?.availableDates) return [];

    return data.therapistAvailability.availableDates
      .filter((d) => d.hasAvailability)
      .map((d) => new Date(d.date));
  }, [data]);

  /**
   * Get time slots for selected date
   */
  const timeSlotsForSelectedDate = React.useMemo(() => {
    if (!selectedDate || !data?.therapistAvailability?.availableDates) {
      return [];
    }

    const dateStr = selectedDate.toISOString().split("T")[0];
    const dateData = data.therapistAvailability.availableDates.find(
      (d) => d.date.startsWith(dateStr)
    );

    return dateData?.slots || [];
  }, [selectedDate, data]);

  /**
   * Handle date selection from calendar
   * Reset selected slot when date changes
   */
  const handleDateSelect = React.useCallback((date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(undefined); // Reset time slot when date changes
  }, []);

  /**
   * Handle time slot selection
   */
  const handleSlotSelect = React.useCallback((slot: TimeSlot) => {
    setSelectedSlot(slot);
  }, []);

  /**
   * Handle timezone change
   * Reset selections as times will change
   */
  const handleTimezoneChange = React.useCallback((newTimezone: string) => {
    setTimezone(newTimezone);
    setSelectedDate(undefined);
    setSelectedSlot(undefined);
  }, []);

  /**
   * Handle confirm booking button click
   */
  const handleConfirmBooking = React.useCallback(() => {
    if (selectedSlot) {
      onConfirmBooking(selectedSlot, timezone);
    }
  }, [selectedSlot, timezone, onConfirmBooking]);

  /**
   * Check if booking can be confirmed
   */
  const canConfirmBooking = Boolean(selectedDate && selectedSlot);

  return (
    <div className={cn("min-h-screen bg-cream/50", className)}>
      {/* Header with Back Button */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-daybreak-teal hover:text-daybreak-teal/80 hover:bg-daybreak-teal/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Matching
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-serif text-deep-text mb-2">
            Schedule Your First Session
          </h1>
          <p className="text-muted-foreground">
            Select a convenient date and time for your appointment
          </p>
        </div>

        {/* Layout: Sidebar (Desktop) / Stacked (Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Calendar + Time Slots */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calendar */}
            <AppointmentCalendar
              availableDates={availableDates}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />

            {/* Time Slots (only show when date selected) */}
            {selectedDate && (
              <div role="region" aria-live="polite" aria-atomic="true">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-daybreak-teal" />
                    <span className="ml-3 text-muted-foreground">
                      Loading available times...
                    </span>
                  </div>
                ) : (
                  <TimeSlotPicker
                    slots={timeSlotsForSelectedDate}
                    selectedSlot={selectedSlot}
                    onSlotSelect={handleSlotSelect}
                    timezone={timezone}
                  />
                )}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div
                className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                role="alert"
              >
                <p className="font-medium">Unable to load availability</p>
                <p className="mt-1 text-xs">
                  Please try again or contact support if the problem persists.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Session Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <SessionDetails
                therapistName={therapistName}
                therapistPhotoUrl={therapistPhotoUrl}
                sessionDuration={50}
                sessionType="video"
                timezone={timezone}
                onTimezoneChange={handleTimezoneChange}
              />

              {/* Confirm Booking Button */}
              <Button
                onClick={handleConfirmBooking}
                disabled={!canConfirmBooking || loading}
                className="w-full mt-6 bg-daybreak-teal hover:bg-daybreak-teal/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {canConfirmBooking ? "Confirm Booking" : "Select Date & Time"}
              </Button>

              {/* Selection Summary */}
              {selectedDate && selectedSlot && (
                <div
                  className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200"
                  role="status"
                  aria-live="polite"
                >
                  <p className="text-sm font-medium text-green-800">
                    Ready to book!
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(selectedSlot.startTime).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                        timeZone: timezone,
                      }
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ScheduleContainer.displayName = "ScheduleContainer";
