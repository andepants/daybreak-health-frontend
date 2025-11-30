/**
 * Confirmation Component
 *
 * Main orchestrator component for the booking confirmation flow.
 * Manages the booking state machine: processing -> success/error.
 *
 * State Flow:
 * 1. User clicks "Confirm Booking" on previous screen
 * 2. Component shows BookingProcessingState
 * 3. GraphQL mutation executes
 * 4. On success: Shows BookingSuccess with confetti
 * 5. On error: Shows error state with retry option
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
}

/**
 * Props for Confirmation component
 */
export interface ConfirmationProps {
  /** Booking details to submit */
  bookingRequest: BookingRequest;
  /** Callback when user clicks "Done" after success */
  onComplete?: () => void;
  /** Return URL after completion (default: "/") */
  returnUrl?: string;
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
 *   returnUrl="/dashboard"
 *   onComplete={() => console.log("Booking completed")}
 * />
 */
export function Confirmation({
  bookingRequest,
  onComplete,
  returnUrl = "/",
}: ConfirmationProps) {
  const router = useRouter();
  const { bookAppointment, loading, error, appointment, emailConfirmation } = useBooking();

  /**
   * Automatically trigger booking on mount
   */
  React.useEffect(() => {
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
  }, []); // Empty deps - only run once on mount

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
   * Handles done button click after success
   */
  function handleDone() {
    if (onComplete) {
      onComplete();
    } else {
      router.push(returnUrl);
    }
  }

  /**
   * Handles cancel button click from error state
   */
  function handleCancel() {
    router.back();
  }

  // Show loading state while booking is in progress
  if (loading) {
    return <BookingProcessingState />;
  }

  // Show error state if booking failed
  if (error) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
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
        </div>
      </div>
    );
  }

  // Show success state if appointment was booked
  if (appointment) {
    return (
      <BookingSuccess
        appointment={appointment}
        emailConfirmation={emailConfirmation}
        onDone={handleDone}
        returnUrl={returnUrl}
      />
    );
  }

  // This should never happen, but handle gracefully
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-muted-foreground">
          Initializing booking...
        </p>
      </div>
    </div>
  );
}

Confirmation.displayName = "Confirmation";
