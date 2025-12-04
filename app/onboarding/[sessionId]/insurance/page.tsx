/**
 * Insurance page - Insurance information collection
 *
 * Collects insurance information at `/onboarding/[sessionId]/insurance`.
 * This is step 3 of the onboarding flow, after demographics/clinical.
 * Users can enter insurance details or choose self-pay option.
 *
 * Flow:
 * - Previous: /onboarding/[sessionId]/demographics?section=clinical
 * - Next: /onboarding/[sessionId]/availability (after submission)
 */
"use client";

import { use, useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { InsuranceForm } from "@/features/insurance";
import { useStorageSync } from "@/hooks";
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
  const [initialData, setInitialData] = useState<Partial<InsuranceFormData> | undefined>(undefined);
  const [parentName, setParentName] = useState("");

  // Use storage sync for reactive updates
  const { extractedData } = useStorageSync({
    sessionId,
    formType: "insurance",
  });

  /**
   * Load initial data from localStorage on mount
   */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`onboarding_session_${sessionId}`);
      if (stored) {
        const parsed = JSON.parse(stored);

        // Load parent name for subscriber auto-fill
        const firstName = parsed?.data?.parent?.firstName || parsed?.data?.firstName || "";
        const lastName = parsed?.data?.parent?.lastName || parsed?.data?.lastName || "";
        if (firstName && lastName) {
          setParentName(`${firstName} ${lastName}`);
        }

        // Load insurance data if available
        if (parsed?.data?.insurance) {
          setInitialData(parsed.data.insurance);
        }
      }
    } catch (e) {
      console.warn("Failed to load data from storage:", e);
    }
  }, [sessionId]);

  /**
   * Update initial data when storage changes (from useStorageSync)
   */
  useEffect(() => {
    if (extractedData && Object.keys(extractedData).length > 0) {
      setInitialData(extractedData as Partial<InsuranceFormData>);
    }
  }, [extractedData]);

  /**
   * Get parent name from session storage for subscriber auto-fill (AC-4.1.4)
   * @deprecated Use parentName state instead
   */
  const getParentName = useCallback((): string => {
    return parentName;
  }, [parentName]);

  /**
   * Handles insurance form submission
   * Navigates to availability selection
   * @param data - Validated insurance form data
   */
  function handleContinue(data: InsuranceFormData): void {
    console.info("Insurance submitted:", { sessionId });
    // PHI Protection: Do not log member ID

    // Navigate to availability selection
    router.push(`/onboarding/${sessionId}/availability`);
  }

  /**
   * Handles back navigation to clinical intake form
   */
  function handleBack(): void {
    router.push(`/onboarding/${sessionId}/demographics?section=clinical`);
  }

  /**
   * Handles self-pay selection
   * Navigates to availability selection without insurance verification
   */
  function handleSelfPay(): void {
    console.info("Self-pay selected:", { sessionId });

    // Navigate to availability selection (skip insurance verification)
    router.push(`/onboarding/${sessionId}/availability`);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
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
        parentName={parentName}
        initialData={initialData}
        onContinue={handleContinue}
        onBack={handleBack}
        onSelfPay={handleSelfPay}
      />
    </div>
  );
}
