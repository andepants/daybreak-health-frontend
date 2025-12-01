/**
 * Booking Confirmation Page
 *
 * Processes the appointment booking and shows success/error state.
 * Reads booking details from localStorage that were saved on the schedule page.
 *
 * Route: /onboarding/[sessionId]/confirmation
 *
 * Flow:
 * - Previous: /onboarding/[sessionId]/schedule (slot selection)
 * - Next: Dashboard or home (after successful booking)
 *
 * Features:
 * - Loading state while booking processes
 * - Success state with confetti animation
 * - Error state with retry option
 * - Email confirmation details
 *
 * Implements:
 * - Story 5.4: Booking Confirmation
 */
"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

import { Confirmation, type BookingRequest } from "@/features/scheduling";
import { Button } from "@/components/ui/button";

/**
 * Props for Confirmation page
 * Receives sessionId from dynamic route parameter
 */
interface ConfirmationPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

/**
 * Booking Confirmation page component
 *
 * Reads booking details from localStorage and triggers the booking mutation.
 * Shows appropriate states for loading, success, and error.
 *
 * @example
 * Route: /onboarding/sess_abc123/confirmation
 */
export default function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { sessionId } = use(params);
  const router = useRouter();

  const [bookingRequest, setBookingRequest] = useState<BookingRequest | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load booking details from localStorage on mount
   */
  useEffect(() => {
    try {
      const storageKey = `onboarding_session_${sessionId}`;
      const stored = localStorage.getItem(storageKey);

      if (!stored) {
        setError("No booking data found. Please select a time slot first.");
        setLoadingData(false);
        return;
      }

      const sessionData = JSON.parse(stored);
      const { selectedSlot, selectedTimezone, therapistId } = sessionData.data || {};

      if (!selectedSlot || !therapistId) {
        setError("Incomplete booking data. Please select a therapist and time slot.");
        setLoadingData(false);
        return;
      }

      // Build booking request from localStorage data
      const request: BookingRequest = {
        sessionId,
        therapistId,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        duration: 50, // Default 50-minute session
        timezone: selectedTimezone || selectedSlot.timezone,
      };

      setBookingRequest(request);
      setLoadingData(false);
    } catch (err) {
      console.error("Failed to load booking data:", err);
      setError("Failed to load booking data. Please try again.");
      setLoadingData(false);
    }
  }, [sessionId]);

  /**
   * Navigate back to schedule page
   */
  function handleGoBack() {
    router.push(`/onboarding/${sessionId}/schedule`);
  }

  /**
   * Handle completion - redirect to Daybreak Health main site
   */
  function handleComplete() {
    window.location.href = "https://www.daybreakhealth.com/";
  }

  // Loading state while reading localStorage
  if (loadingData) {
    return (
      <div className="min-h-screen bg-cream/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-daybreak-teal" />
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  // Error state - missing or invalid data
  if (error || !bookingRequest) {
    return (
      <div className="min-h-screen bg-cream/50 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-6 py-12 px-4 max-w-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <AlertCircle className="h-8 w-8 text-amber-600" />
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold font-serif text-deep-text">
              Missing Booking Information
            </h2>
            <p className="text-muted-foreground">
              {error || "Please go back and select a time slot for your appointment."}
            </p>
          </div>

          <Button
            onClick={handleGoBack}
            className="bg-daybreak-teal hover:bg-daybreak-teal/90 text-white"
          >
            Go to Scheduling
          </Button>
        </div>
      </div>
    );
  }

  // Render the confirmation flow
  return (
    <Confirmation
      bookingRequest={bookingRequest}
      onComplete={handleComplete}
      returnUrl="https://www.daybreakhealth.com/"
    />
  );
}
