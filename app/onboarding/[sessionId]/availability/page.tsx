/**
 * Patient Availability Page
 *
 * Collects when the patient is available for therapy sessions.
 * This data is used by the AI matching algorithm to find therapists
 * with overlapping availability, improving match quality.
 *
 * Route: /onboarding/[sessionId]/availability
 *
 * Flow:
 * - Previous: /onboarding/[sessionId]/insurance
 * - Next: /onboarding/[sessionId]/matching
 *
 * Features:
 * - Weekly time grid selection
 * - Timezone detection and selection
 * - Required step (must select at least one time)
 * - Persists to backend and localStorage
 *
 * User Story:
 * As a parent, I want to indicate when I'm available so the system
 * can match us with therapists who have compatible schedules.
 */
"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AvailabilityForm, usePatientAvailability, loadFromLocalStorage } from "@/features/availability";
import type { TimeBlock } from "@/lib/validations/availability";

/**
 * Page props with dynamic route parameter
 */
interface AvailabilityPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

/**
 * Availability page component
 *
 * Renders the availability selection form and handles navigation.
 */
export default function AvailabilityPage({ params }: AvailabilityPageProps) {
  const { sessionId } = use(params);
  const router = useRouter();

  // Track initial data loaded from localStorage or API
  const [initialData, setInitialData] = useState<{
    availabilities: TimeBlock[];
    timezone: string;
  } | undefined>(undefined);

  // Load initial data from localStorage on mount
  useEffect(() => {
    const stored = loadFromLocalStorage(sessionId);
    if (stored) {
      setInitialData(stored);
    }
  }, [sessionId]);

  // Use the availability hook for API operations
  const { submitAvailability, isSubmitting, existingAvailability } =
    usePatientAvailability({
      sessionId,
      onSuccess: () => {
        router.push(`/onboarding/${sessionId}/matching`);
      },
      onError: (error) => {
        console.error("Failed to save availability:", error);
        // Could show a toast notification here
      },
    });

  // Update initial data when API data loads
  useEffect(() => {
    if (existingAvailability && !initialData) {
      setInitialData({
        availabilities: existingAvailability,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    }
  }, [existingAvailability, initialData]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (
    availabilities: TimeBlock[],
    timezone: string
  ) => {
    await submitAvailability(availabilities, timezone);
  };

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    router.push(`/onboarding/${sessionId}/insurance`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-card rounded-xl border shadow-sm p-6 md:p-8">
        <AvailabilityForm
          sessionId={sessionId}
          initialData={initialData}
          onSubmit={handleSubmit}
          onBack={handleBack}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
