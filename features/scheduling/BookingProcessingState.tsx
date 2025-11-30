/**
 * BookingProcessingState Component
 *
 * Displays a loading state while an appointment booking is being processed.
 * Shows a spinner and message to reassure the user.
 *
 * Visual Design:
 * - Centered spinner in Daybreak teal
 * - "Booking your appointment..." message
 * - Clean, minimal design
 * - Accessible loading state
 *
 * @module features/scheduling/BookingProcessingState
 */

"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

/**
 * Renders a loading state for appointment booking
 *
 * Accessibility:
 * - aria-live region for screen readers
 * - Descriptive loading message
 * - Semantic HTML
 *
 * @example
 * {isBooking && <BookingProcessingState />}
 */
export function BookingProcessingState() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cream p-6"
      role="status"
      aria-live="polite"
      aria-label="Booking appointment"
    >
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Animated Spinner */}
        <Loader2
          className="h-12 w-12 animate-spin text-daybreak-teal"
          aria-hidden="true"
        />

        {/* Loading Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-semibold text-deep-text">
            Booking your appointment...
          </h2>
          <p className="text-muted-foreground">
            This will only take a moment
          </p>
        </div>
      </div>
    </div>
  );
}

BookingProcessingState.displayName = "BookingProcessingState";
