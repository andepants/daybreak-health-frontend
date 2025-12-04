/**
 * BookingReview Component
 *
 * Displays appointment details for user review before confirming the booking.
 * Shows therapist info, date/time, and duration with a confirm button.
 *
 * Visual Design:
 * - Clean review card with appointment details
 * - Prominent "Confirm Booking" button
 * - Option to go back
 * - Warm, reassuring design using Daybreak palette
 *
 * @module features/scheduling/BookingReview
 */

"use client";

import * as React from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { celebrateBooking, clearConfetti } from "@/lib/utils/confetti";
import { AppointmentDetailsCard } from "./AppointmentDetailsCard";
import type { TherapistInfo } from "./AppointmentDetailsCard";

/**
 * Props for BookingReview component
 */
export interface BookingReviewProps {
  /** Therapist information */
  therapist: TherapistInfo;
  /** Appointment start time (ISO string) */
  startTime: string;
  /** Appointment end time (ISO string) */
  endTime: string;
  /** Duration in minutes */
  duration?: number;
  /** Callback when user confirms booking */
  onConfirm: () => void;
  /** Callback when user wants to go back */
  onBack: () => void;
  /** Whether the confirm button should be disabled (loading state) */
  isConfirming?: boolean;
  /** Whether the booking was successful (success state) */
  isSuccess?: boolean;
  /** Callback when user clicks Done after successful booking */
  onDone?: () => void;
}

/**
 * Renders the booking review screen before final confirmation
 *
 * Accessibility:
 * - Semantic HTML structure
 * - Proper heading hierarchy
 * - Focus management
 * - Keyboard navigation
 *
 * @example
 * <BookingReview
 *   therapist={{
 *     id: "123",
 *     name: "Dr. Sarah Johnson",
 *     credentials: "PhD, LMFT",
 *     photoUrl: "/therapists/sarah.jpg"
 *   }}
 *   startTime="2024-01-15T14:00:00Z"
 *   endTime="2024-01-15T14:50:00Z"
 *   duration={50}
 *   onConfirm={() => handleConfirm()}
 *   onBack={() => router.back()}
 * />
 */
export function BookingReview({
  therapist,
  startTime,
  endTime,
  duration = 50,
  onConfirm,
  onBack,
  isConfirming = false,
  isSuccess = false,
  onDone,
}: BookingReviewProps) {
  /**
   * Trigger confetti celebration when booking succeeds
   * Clean up on unmount
   */
  React.useEffect(() => {
    if (isSuccess) {
      celebrateBooking();
      return () => clearConfetti();
    }
  }, [isSuccess]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        {isSuccess && (
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-50 p-3">
              <CheckCircle2
                className="h-12 w-12 text-green-600"
                aria-hidden="true"
              />
            </div>
          </div>
        )}
        <h1 className="text-3xl font-serif font-bold text-deep-text">
          {isSuccess ? "You're all set!" : "Review Your Appointment"}
        </h1>
        <p className="text-muted-foreground">
          {isSuccess
            ? "Your appointment has been confirmed"
            : "Please confirm your appointment details below"}
        </p>
      </div>

      {/* Appointment Details */}
      <AppointmentDetailsCard
        therapist={therapist}
        startTime={startTime}
        endTime={endTime}
        duration={duration}
      />

      {/* Confirmation Note - shown only before confirmation */}
      {!isSuccess && (
        <div className="rounded-lg bg-daybreak-teal/5 border border-daybreak-teal/20 p-4">
          <p className="text-sm text-muted-foreground text-center">
            By confirming, you&apos;ll receive an email with appointment details
            and a link to join your video session.
          </p>
        </div>
      )}

      {/* Success Note - shown after confirmation */}
      {isSuccess && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-sm text-muted-foreground text-center">
            A confirmation email has been sent with your appointment details
            and a link to join your video session.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        {isSuccess ? (
          <Button
            onClick={onDone}
            className="bg-green-600 hover:bg-green-700 text-white flex-1"
            size="lg"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Done
          </Button>
        ) : (
          <>
            <Button
              onClick={onConfirm}
              disabled={isConfirming}
              className="bg-daybreak-teal hover:bg-daybreak-teal/90 text-white flex-1"
              size="lg"
            >
              {isConfirming ? "Confirming..." : "Confirm Booking"}
            </Button>
            <Button
              onClick={onBack}
              variant="outline"
              size="lg"
              disabled={isConfirming}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

BookingReview.displayName = "BookingReview";
