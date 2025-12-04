/**
 * Confirmation Component
 *
 * Simple confirmation screen that shows appointment details and
 * transitions to success state when user confirms.
 *
 * Flow:
 * 1. Shows appointment details with "Confirm Booking" button
 * 2. User clicks confirm → shows success with confetti + "Done" button
 * 3. User clicks Done → redirects to daybreakhealth.com
 *
 * @module features/scheduling/Confirmation
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { BookingReview } from "./BookingReview";

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
  /** Callback when booking is complete and user dismisses success screen */
  onComplete?: () => void;
}

/**
 * Renders the booking confirmation screen with success state
 *
 * Simple flow:
 * 1. Shows appointment details with "Confirm Booking" button
 * 2. User clicks confirm → shows success with confetti and "Done" button
 * 3. User clicks Done → redirects to daybreakhealth.com
 *
 * @example
 * <Confirmation
 *   bookingRequest={{
 *     sessionId: "session-123",
 *     therapistId: "therapist-456",
 *     startTime: "2024-01-15T14:00:00Z",
 *     endTime: "2024-01-15T14:50:00Z",
 *     duration: 50
 *   }}
 * />
 */
export function Confirmation({
  bookingRequest,
}: ConfirmationProps) {
  const router = useRouter();

  /**
   * Track whether user has confirmed the booking (shows success state)
   */
  const [isSuccess, setIsSuccess] = React.useState(false);

  /**
   * Handles confirm button click - immediately show success
   */
  function handleConfirm() {
    setIsSuccess(true);
  }

  /**
   * Handles Done button click - redirect to Daybreak website
   */
  function handleDone() {
    window.location.href = "https://www.daybreakhealth.com/";
  }

  /**
   * Handles back button click
   */
  function handleCancel() {
    router.back();
  }

  // Single-screen flow: BookingReview handles review and success states
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
      isConfirming={false}
      isSuccess={isSuccess}
      onDone={handleDone}
    />
  );
}

Confirmation.displayName = "Confirmation";
