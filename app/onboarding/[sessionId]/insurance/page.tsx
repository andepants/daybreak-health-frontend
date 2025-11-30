/**
 * Insurance page - Insurance information collection
 *
 * Collects insurance information at `/onboarding/[sessionId]/insurance`.
 * This is step 3 of the onboarding flow, after demographics/clinical.
 * Users can enter insurance details or choose self-pay option.
 *
 * Flow:
 * - Previous: /onboarding/[sessionId]/demographics?section=clinical
 * - Next: /onboarding/[sessionId]/matching (after submission)
 */
"use client";

import { use, useCallback } from "react";
import { useRouter } from "next/navigation";

import { InsuranceForm } from "@/features/insurance";
import type { InsuranceFormData } from "@/lib/validations/insurance";

/**
 * Props for Insurance page
 * Receives sessionId from dynamic route parameter
 */
interface InsurancePageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

/**
 * Insurance page component
 *
 * Renders insurance form with:
 * - Carrier selection with search
 * - Member ID and group number fields
 * - Subscriber relationship and name
 * - Self-pay option modal
 *
 * Route flow:
 * - From: /onboarding/[sessionId]/demographics?section=clinical
 * - To: /onboarding/[sessionId]/matching (or therapist matching)
 *
 * Layout:
 * - Uses onboarding layout (header, progress bar, footer)
 * - Single-column form centered with max-width 640px
 * - Mobile-first responsive design
 */
export default function InsurancePage({ params }: InsurancePageProps) {
  const { sessionId } = use(params);
  const router = useRouter();

  /**
   * Get parent name from session storage for subscriber auto-fill (AC-4.1.4)
   */
  const getParentName = useCallback((): string => {
    try {
      const stored = localStorage.getItem(`onboarding_session_${sessionId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        const firstName = parsed?.data?.firstName || "";
        const lastName = parsed?.data?.lastName || "";
        if (firstName && lastName) {
          return `${firstName} ${lastName}`;
        }
      }
    } catch (e) {
      console.warn("Failed to get parent name from storage:", e);
    }
    return "";
  }, [sessionId]);

  /**
   * Handles insurance form submission
   * Navigates to matching/therapist selection
   * @param data - Validated insurance form data
   */
  function handleContinue(data: InsuranceFormData): void {
    console.info("Insurance submitted:", { sessionId });
    // PHI Protection: Do not log member ID

    // Navigate to therapist matching
    router.push(`/onboarding/${sessionId}/matching`);
  }

  /**
   * Handles back navigation to clinical intake form
   */
  function handleBack(): void {
    router.push(`/onboarding/${sessionId}/demographics?section=clinical`);
  }

  /**
   * Handles self-pay selection
   * Navigates to matching without insurance verification
   */
  function handleSelfPay(): void {
    console.info("Self-pay selected:", { sessionId });

    // Navigate to therapist matching (skip insurance verification)
    router.push(`/onboarding/${sessionId}/matching`);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold font-serif text-foreground">
          Insurance Information
        </h1>
        <p className="text-muted-foreground">
          Enter your insurance details so we can verify your coverage for therapy
          sessions.
        </p>
      </div>

      <InsuranceForm
        sessionId={sessionId}
        parentName={getParentName()}
        onContinue={handleContinue}
        onBack={handleBack}
        onSelfPay={handleSelfPay}
      />
    </div>
  );
}
