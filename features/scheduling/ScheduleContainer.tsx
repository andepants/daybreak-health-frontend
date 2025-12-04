/**
 * ScheduleContainer component - orchestrates the appointment scheduling flow
 *
 * Main container component that displays recommended time slots based on
 * user preferences and therapist availability. Shows a curated list of
 * best-matching times with the option to expand and see all.
 *
 * Features:
 * - Recommended time slots ranked by user preference match
 * - Expandable list to see all available times
 * - Session details sidebar (desktop) or header (mobile)
 * - "Confirm Booking" button (enabled when time selected)
 * - "Back to Matching" navigation
 * - Loading and error states
 *
 * Layout:
 * - Desktop: Recommended slots (left) | Session details (right sidebar)
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
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RecommendedTimeSlots } from "./RecommendedTimeSlots";
import { type TimeSlot } from "./TimeSlotPicker";
import { SessionDetails } from "./SessionDetails";
import { useDetectedTimezone } from "./TimezoneSelector";
import { useGetTherapistAvailabilityQuery } from "@/types/graphql";
import { usePatientAvailability } from "../availability/usePatientAvailability";

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
 * Orchestrates the appointment scheduling flow with recommended time slots
 *
 * State Management:
 * - Selected time slot
 * - User timezone (with auto-detection)
 *
 * Data Fetching:
 * - GraphQL query for therapist availability
 * - GraphQL query for user availability preferences
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
   * Fetch user's availability preferences for scoring
   */
  const { existingAvailability: userAvailability, isLoading: isLoadingUserAvailability } =
    usePatientAvailability({
      sessionId: sessionId || "",
    });

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
   * Queries real availability data from the database for all therapists
   * When sessionId is provided, filters slots to only show those that
   * overlap with the patient's submitted availability preferences
   */
  const { data, loading, error } = useGetTherapistAvailabilityQuery({
    variables: {
      therapistId,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      timezone,
      sessionId: sessionId || undefined,
    },
    skip: !therapistId,
    fetchPolicy: "cache-and-network",
  });

  /**
   * Flatten all available time slots into a single array
   * Used by RecommendedTimeSlots for scoring and display
   */
  const allSlots = React.useMemo(() => {
    if (!data?.therapistAvailability?.availableDates) return [];

    return data.therapistAvailability.availableDates
      .flatMap((dateData) => dateData.slots || [])
      .filter((slot) => slot.isAvailable);
  }, [data]);

  /**
   * Handle time slot selection
   */
  const handleSlotSelect = React.useCallback((slot: TimeSlot) => {
    setSelectedSlot(slot);
  }, []);

  /**
   * Handle timezone change
   * Reset selection as times will change
   */
  const handleTimezoneChange = React.useCallback((newTimezone: string) => {
    setTimezone(newTimezone);
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
  const canConfirmBooking = Boolean(selectedSlot);

  /**
   * Combined loading state
   */
  const isLoading = loading || isLoadingUserAvailability;

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
            Choose a time that works best for you
          </p>
        </div>

        {/* Layout: Sidebar (Desktop) / Stacked (Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Recommended Time Slots */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recommended Time Slots */}
            <div role="region" aria-live="polite" aria-atomic="true">
              <RecommendedTimeSlots
                allSlots={allSlots}
                userAvailability={userAvailability || undefined}
                selectedSlot={selectedSlot}
                onSlotSelect={handleSlotSelect}
                timezone={timezone}
                isLoading={isLoading}
              />
            </div>

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
                disabled={!canConfirmBooking || isLoading}
                className="w-full mt-6 bg-daybreak-teal hover:bg-daybreak-teal/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {canConfirmBooking ? "Confirm Booking" : "Select a Time"}
              </Button>

              {/* Selection Summary */}
              {selectedSlot && (
                <div
                  className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200"
                  role="status"
                  aria-live="polite"
                >
                  <p className="text-sm font-medium text-green-800">
                    Ready to book!
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {new Date(selectedSlot.startTime).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      timeZone: timezone,
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
