/**
 * Confirmation Component
 *
 * Main orchestrator component for the booking confirmation flow.
 * Manages the booking state machine: review -> processing -> success/error.
 *
 * State Flow:
 * 1. Component shows BookingReview with appointment details
 * 2. User clicks "Confirm Booking" button
 * 3. Component shows BookingProcessingState
 * 4. GraphQL mutation executes
 * 5. On success: Shows BookingSuccess with confetti
 * 6. On error: Shows error state with retry option
 *
 * @module features/scheduling/Confirmation
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BookingProcessingState } from "./BookingProcessingState";
import { BookingReview } from "./BookingReview";
import { BookingSuccess } from "./BookingSuccess";
import type { AppointmentData } from "./BookingSuccess";
import { useBooking } from "./useBooking";

/**
 * Booking request details from previous scheduling step
 */
export interface BookingRequest {
  /** Session ID from matching flow */
  sessionId: string;
  /** Selected therapist ID */
  therapistId: string;
  /** Appointment start time (ISO string) */
  startTime: string;
  /** Appointment end time (ISO string) */
  endTime: string;
  /** Appointment duration in minutes */
  duration?: number;
  /** User's timezone */
  timezone?: string;
  /** Therapist name for display (used in mock appointments) */
  therapistName?: string;
  /** Therapist photo URL (used in mock appointments) */
  therapistPhotoUrl?: string;
}

/**
 * Props for Confirmation component
 */
export interface ConfirmationProps {
  /** Booking details to submit */
  bookingRequest: BookingRequest;
}

/**
 * Renders the booking confirmation flow with loading and success states
 *
 * Features:
 * - Automatic booking on mount
 * - Loading state during mutation
 * - Success state with celebration
 * - Error state with retry option
 * - GraphQL mutation with optimistic response
 *
 * Accessibility:
 * - Loading state announcements
 * - Success announcements
 * - Error messages
 * - Keyboard navigation
 *
 * @example
 * <Confirmation
 *   bookingRequest={{
 *     sessionId: "session-123",
 *     therapistId: "therapist-456",
 *     startTime: "2024-01-15T14:00:00Z",
 *     endTime: "2024-01-15T14:50:00Z",
 *     duration: 50,
 *     timezone: "America/New_York"
 *   }}
 * />
 */
/**
 * Check if therapist ID is a fallback/mock therapist
 * Fallback therapists cannot be booked as they don't exist in the backend
 */
function isFallbackTherapist(therapistId: string): boolean {
  return therapistId.startsWith("fallback_");
}

/**
 * Generate mock appointment data for fallback therapists
 * Allows users to experience the full booking flow in demo mode
 */
function generateMockAppointment(request: BookingRequest): AppointmentData {
  return {
    id: `mock_appointment_${Date.now()}`,
    therapist: {
      id: request.therapistId,
      name: request.therapistName || "Your Therapist",
      credentials: "PhD, LMFT",
      photoUrl: request.therapistPhotoUrl,
    },
    startTime: request.startTime,
    endTime: request.endTime,
    duration: request.duration || 50,
    meetingUrl: `https://meet.daybreakhealth.com/demo-session`,
  };
}

export function Confirmation({
  bookingRequest,
}: ConfirmationProps) {
  const router = useRouter();
  const { bookAppointment, loading, error, appointment, emailConfirmation } = useBooking();

  /**
   * Track whether user has confirmed the booking
   */
  const [hasConfirmed, setHasConfirmed] = React.useState(false);

  /**
   * Check if attempting to book with a fallback therapist
   */
  const isUsingFallbackTherapist = isFallbackTherapist(bookingRequest.therapistId);

  /**
   * Mock appointment for fallback therapists
   */
  const [mockAppointment, setMockAppointment] = React.useState<AppointmentData | null>(null);

  /**
   * Redirect to Daybreak website after successful booking
   * Triggered when appointment is confirmed (real or mock)
   */
  React.useEffect(() => {
    const displayAppointment = isUsingFallbackTherapist ? mockAppointment : appointment;

    if (displayAppointment) {
      // Brief delay to show processing state, then redirect
      const timer = setTimeout(() => {
        window.location.href = "https://www.daybreakhealth.com/";
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [appointment, mockAppointment, isUsingFallbackTherapist]);

  /**
   * Trigger booking when user confirms
   * For fallback therapists, show mock success after a brief delay
   */
  React.useEffect(() => {
    if (!hasConfirmed) return;

    if (isUsingFallbackTherapist) {
      // Show mock success for fallback therapists after a brief loading state
      const timer = setTimeout(() => {
        setMockAppointment(generateMockAppointment(bookingRequest));
      }, 1500);
      return () => clearTimeout(timer);
    }

    const performBooking = async () => {
      await bookAppointment({
        sessionId: bookingRequest.sessionId,
        therapistId: bookingRequest.therapistId,
        startTime: bookingRequest.startTime,
        endTime: bookingRequest.endTime,
        duration: bookingRequest.duration,
        timezone: bookingRequest.timezone,
      });
    };

    performBooking();
  }, [hasConfirmed, isUsingFallbackTherapist, bookingRequest, bookAppointment]);

  /**
   * Handles confirm button click from review screen
   */
  function handleConfirm() {
    setHasConfirmed(true);
  }

  /**
   * Handles retry button click after error
   */
  async function handleRetry() {
    await bookAppointment({
      sessionId: bookingRequest.sessionId,
      therapistId: bookingRequest.therapistId,
      startTime: bookingRequest.startTime,
      endTime: bookingRequest.endTime,
      duration: bookingRequest.duration,
      timezone: bookingRequest.timezone,
    });
  }

  /**
   * Handles cancel button click from error state
   */
  function handleCancel() {
    router.back();
  }

  // Show review screen before user confirms
  if (!hasConfirmed) {
    return (
      <BookingReview
        therapist={{
          id: bookingRequest.therapistId,
          name: bookingRequest.therapistName || "Your Therapist",
          credentials: "PhD, LMFT",
          photoUrl: bookingRequest.therapistPhotoUrl,
        }}
        startTime={bookingRequest.startTime}
        endTime={bookingRequest.endTime}
        duration={bookingRequest.duration}
        onConfirm={handleConfirm}
        onBack={handleCancel}
      />
    );
  }

  // Show loading state while booking is in progress
  // For fallback therapists, show loading while waiting for mock appointment
  if (loading || (isUsingFallbackTherapist && !mockAppointment)) {
    return <BookingProcessingState />;
  }

  // Show error state if booking failed (not applicable for fallback therapists)
  if (error && !isUsingFallbackTherapist) {
    return (
      <div className="space-y-6">
        {/* Error Alert */}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Booking Failed</AlertTitle>
          <AlertDescription>
            We couldn&apos;t complete your appointment booking. Please try
            again or contact support if the problem persists.
          </AlertDescription>
        </Alert>

        {/* Error Details (for debugging, not shown in production) */}
        {process.env.NODE_ENV === "development" && error.message && (
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-700 font-mono">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <Button
            onClick={handleRetry}
            className="bg-daybreak-teal hover:bg-daybreak-teal/90 text-white"
            size="lg"
          >
            Try Again
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            size="lg"
          >
            Go Back
          </Button>
        </div>

        {/* Support Contact */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need help?{" "}
            <a
              href="mailto:support@daybreakhealth.com"
              className="text-daybreak-teal hover:text-daybreak-teal/80 underline underline-offset-2"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Show success state if appointment was booked (real or mock)
  const displayAppointment = isUsingFallbackTherapist ? mockAppointment : appointment;

  if (displayAppointment) {
    return (
      <BookingSuccess
        appointment={displayAppointment}
        emailConfirmation={isUsingFallbackTherapist ? {
          emailSent: true,
          emailStatus: "sent",
          recipientEmail: "demo@example.com",
        } : emailConfirmation}
      />
    );
  }

  // Show processing state while waiting for booking to complete
  return <BookingProcessingState />;
}

Confirmation.displayName = "Confirmation";
