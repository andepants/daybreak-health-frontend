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
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  /** Whether the confirm button should be disabled */
  isConfirming?: boolean;
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
}: BookingReviewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif font-bold text-deep-text">
          Review Your Appointment
        </h1>
        <p className="text-muted-foreground">
          Please confirm your appointment details below
        </p>
      </div>

      {/* Appointment Details */}
      <AppointmentDetailsCard
        therapist={therapist}
        startTime={startTime}
        endTime={endTime}
        duration={duration}
      />

      {/* Confirmation Note */}
      <div className="rounded-lg bg-daybreak-teal/5 border border-daybreak-teal/20 p-4">
        <p className="text-sm text-muted-foreground text-center">
          By confirming, you&apos;ll receive an email with appointment details
          and a link to join your video session.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row-reverse">
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
      </div>
    </div>
  );
}

BookingReview.displayName = "BookingReview";
