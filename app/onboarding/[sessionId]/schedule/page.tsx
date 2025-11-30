/**
 * Appointment Scheduling Page
 *
 * Allows users to select a date and time for their first session
 * with their matched therapist after completing therapist selection.
 *
 * Route: /onboarding/[sessionId]/schedule
 *
 * Flow:
 * - Previous: /onboarding/[sessionId]/matching (therapist selection)
 * - Next: /onboarding/[sessionId]/confirmation (after booking)
 *
 * Features:
 * - Calendar view with available dates highlighted
 * - Time slot picker showing available times
 * - Timezone selection and display
 * - Session details sidebar
 * - Confirm booking button (enabled when time selected)
 * - Back navigation to matching page
 *
 * Implements:
 * - Story 5.3: Appointment Calendar and Time Selection
 * - AC-5.3.1 through AC-5.3.11
 * - FR-013: Appointment booking functionality
 */
"use client";

import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { ScheduleContainer, type TimeSlot } from "@/features/scheduling";
import { Button } from "@/components/ui/button";
import { useAutoSave } from "@/hooks/useAutoSave";

/**
 * Props for Schedule page
 * Receives sessionId from dynamic route parameter
 */
interface SchedulePageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

/**
 * Appointment Scheduling page component
 *
 * Integrates all scheduling components (calendar, time slots, session details)
 * and handles booking flow with state management and auto-save.
 *
 * Layout:
 * - Uses onboarding layout (header, progress bar, footer)
 * - Desktop: Two-column layout (calendar/slots | session details)
 * - Mobile: Stacked layout with session details at top
 *
 * States:
 * - Loading: Shows while fetching therapist availability
 * - Success: Shows calendar and time slot picker
 * - Error: Shows error message with retry option
 *
 * Performance:
 * - Apollo Client caching for instant re-renders
 * - Auto-save selected date/time to session storage
 * - Optimized re-renders with React.memo
 *
 * Accessibility:
 * - WCAG 2.1 Level AA compliance
 * - Keyboard navigation support
 * - Screen reader announcements
 * - Minimum 44x44px touch targets
 *
 * @example
 * Route: /onboarding/sess_abc123/schedule?therapistId=therapist_123
 */
export default function SchedulePage({ params }: SchedulePageProps) {
  const { sessionId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * Get therapist ID from query params or localStorage
   * Therapist should be selected from matching page
   */
  const therapistId = searchParams.get("therapistId");

  /**
   * Auto-save hook for persisting selected date/time
   * Saves to localStorage and optionally to backend
   */
  const { save } = useAutoSave({
    sessionId,
    onSaveSuccess: () => {
      // Optional: show toast notification
      console.log("Scheduling preference saved");
    },
    onSaveError: (error) => {
      console.error("Failed to save scheduling preference:", error);
    },
  });

  /**
   * Get therapist details from localStorage (set during matching)
   * In production, this could come from GraphQL query or session context
   */
  function getTherapistDetails(): {
    name: string;
    photoUrl?: string;
  } {
    try {
      const stored = localStorage.getItem(`onboarding_session_${sessionId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        const selectedTherapist = parsed?.data?.selectedTherapist;

        if (selectedTherapist) {
          return {
            name: selectedTherapist.name || "Your Therapist",
            photoUrl: selectedTherapist.photoUrl,
          };
        }
      }
    } catch (error) {
      console.error("Failed to get therapist details:", error);
    }

    // Fallback if not found in localStorage
    return {
      name: "Your Therapist",
      photoUrl: undefined,
    };
  }

  /**
   * Handles back navigation to matching page
   * Preserves session state and selections
   */
  function handleBack() {
    router.push(`/onboarding/${sessionId}/matching`);
  }

  /**
   * Handles booking confirmation
   * Saves selected slot to session and navigates to confirmation page
   */
  async function handleConfirmBooking(slot: TimeSlot, timezone: string) {
    try {
      // Save booking details to session storage
      await save({
        selectedSlot: {
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          timezone: slot.timezone,
        },
        selectedTimezone: timezone,
        therapistId,
      });

      // Navigate to confirmation page
      // In Story 5.4, this will show booking confirmation
      router.push(`/onboarding/${sessionId}/confirmation`);
    } catch (error) {
      console.error("Failed to save booking:", error);
      // TODO: Show error toast or modal
      // For now, just log the error
    }
  }

  /**
   * Error state - missing therapist ID
   * User should select a therapist from matching page first
   */
  if (!therapistId) {
    return (
      <div className="min-h-screen bg-cream/50 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-6 py-12 px-4 max-w-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <AlertCircle className="h-8 w-8 text-amber-600" />
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold font-serif text-deep-text">
              No Therapist Selected
            </h2>
            <p className="text-muted-foreground">
              Please select a therapist from the matching results before
              scheduling an appointment.
            </p>
          </div>

          <Button
            onClick={handleBack}
            className="bg-daybreak-teal hover:bg-daybreak-teal/90 text-white"
          >
            Go to Therapist Matching
          </Button>
        </div>
      </div>
    );
  }

  /**
   * Get therapist details for display
   */
  const therapist = getTherapistDetails();

  /**
   * Success state - show scheduling interface
   */
  return (
    <ScheduleContainer
      therapistId={therapistId}
      therapistName={therapist.name}
      therapistPhotoUrl={therapist.photoUrl}
      onBack={handleBack}
      onConfirmBooking={handleConfirmBooking}
      sessionId={sessionId}
    />
  );
}
