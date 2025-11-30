/**
 * BookingSuccess Component
 *
 * Displays the success state after an appointment is successfully booked.
 * Includes celebration (confetti), appointment details, calendar links,
 * and next steps information.
 *
 * Visual Design:
 * - Celebration heading with confetti animation
 * - Appointment details card
 * - Add to calendar buttons
 * - What's next section
 * - "Done" button to navigate away
 * - Warm, reassuring design using Daybreak palette
 *
 * @module features/scheduling/BookingSuccess
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { celebrateBooking, clearConfetti } from "@/lib/utils/confetti";
import { AppointmentDetailsCard } from "./AppointmentDetailsCard";
import { CalendarLinks } from "./CalendarLinks";
import { WhatsNext } from "./WhatsNext";
import { EmailConfirmationMessage } from "./EmailConfirmationMessage";
import type { TherapistInfo } from "./AppointmentDetailsCard";
import type { EmailConfirmationStatus } from "./EmailConfirmationMessage";

/**
 * Appointment data for success display
 */
export interface AppointmentData {
  id: string;
  therapist: TherapistInfo;
  startTime: string;
  endTime: string;
  duration?: number;
  meetingUrl?: string;
}

/**
 * Props for BookingSuccess component
 */
export interface BookingSuccessProps {
  /** Appointment data to display */
  appointment: AppointmentData;
  /** Email confirmation status from booking mutation */
  emailConfirmation?: EmailConfirmationStatus | null;
  /** Callback when "Done" button is clicked (optional) */
  onDone?: () => void;
  /** Return URL for Done button (default: "/") */
  returnUrl?: string;
}

/**
 * Renders the booking success celebration and details
 *
 * Features:
 * - Triggers confetti animation on mount
 * - Shows appointment details
 * - Provides calendar export options
 * - Displays next steps
 * - Done button for navigation
 *
 * Accessibility:
 * - Semantic HTML structure
 * - Proper heading hierarchy
 * - Focus management
 * - Screen reader announcements
 *
 * Performance:
 * - Cleans up confetti on unmount
 *
 * @example
 * <BookingSuccess
 *   appointment={{
 *     id: "123",
 *     therapist: {
 *       id: "456",
 *       name: "Dr. Sarah Johnson",
 *       credentials: "PhD, LMFT",
 *       photoUrl: "/therapists/sarah.jpg"
 *     },
 *     startTime: "2024-01-15T14:00:00Z",
 *     endTime: "2024-01-15T14:50:00Z",
 *     duration: 50,
 *     meetingUrl: "https://daybreak.health/meet/abc123"
 *   }}
 *   returnUrl="/dashboard"
 * />
 */
export function BookingSuccess({
  appointment,
  emailConfirmation,
  onDone,
  returnUrl = "/",
}: BookingSuccessProps) {
  const router = useRouter();

  /**
   * Trigger confetti celebration on mount
   * Clean up on unmount
   */
  React.useEffect(() => {
    celebrateBooking();

    return () => {
      clearConfetti();
    };
  }, []);

  /**
   * Handles Done button click
   * Calls callback if provided, otherwise navigates to return URL
   */
  function handleDone() {
    if (onDone) {
      onDone();
    } else {
      router.push(returnUrl);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Success announcement for screen readers */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        Appointment successfully booked
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Celebration Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-50 p-3">
                <CheckCircle2
                  className="h-12 w-12 text-green-600"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-serif font-bold text-deep-text">
                You&apos;re all set!
              </h1>
              <p className="text-lg text-muted-foreground">
                Your appointment has been confirmed
              </p>
            </div>
          </div>

          {/* Email Confirmation Status */}
          <EmailConfirmationMessage
            emailConfirmation={emailConfirmation ?? null}
          />

          {/* Appointment Details Card */}
          <AppointmentDetailsCard
            therapist={appointment.therapist}
            startTime={appointment.startTime}
            endTime={appointment.endTime}
            duration={appointment.duration}
          />

          {/* Calendar Links */}
          <CalendarLinks
            therapistName={appointment.therapist.name}
            startTime={appointment.startTime}
            endTime={appointment.endTime}
            meetingUrl={appointment.meetingUrl}
          />

          {/* What's Next Section */}
          <WhatsNext />

          {/* Done Button */}
          <div className="pt-4">
            <Button
              onClick={handleDone}
              className="w-full bg-daybreak-teal hover:bg-daybreak-teal/90 text-white"
              size="lg"
            >
              Done
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-center text-sm text-muted-foreground">
            We&apos;re excited to support your family on this journey
          </p>
        </div>
      </div>
    </div>
  );
}

BookingSuccess.displayName = "BookingSuccess";
