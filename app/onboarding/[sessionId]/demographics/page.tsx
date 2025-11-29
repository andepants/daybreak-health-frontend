/**
 * Demographics page - Parent, Child, and Clinical information collection
 *
 * Three-step demographics flow at `/onboarding/[sessionId]/demographics`.
 * Step 1 (section=parent): Collects parent/guardian contact information
 * Step 2 (section=child): Collects child demographics and primary concerns
 * Step 3 (section=clinical): Collects clinical intake information (optional fields)
 *
 * Uses URL search params (?section=parent|child|clinical) to manage which form is displayed.
 * All forms auto-save on blur. Child form pre-populates primary concerns from assessment.
 */
"use client";

import { use, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ParentInfoForm,
  ChildInfoForm,
  ClinicalIntakeForm,
} from "@/features/demographics";
import type {
  ParentInfoInput,
  ChildInfoInput,
  ClinicalIntakeInput,
} from "@/lib/validations/demographics";

/**
 * Props for Demographics page
 * Receives sessionId from dynamic route parameter
 */
interface DemographicsPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

/**
 * Section type for managing form visibility
 */
type DemographicsSection = "parent" | "child" | "clinical";

/**
 * Demographics page component
 *
 * Renders parent info form first, then child info form, then clinical intake.
 * Uses URL search params for section navigation to support browser back button.
 *
 * Route flow:
 * - /onboarding/[sessionId]/demographics (defaults to parent)
 * - /onboarding/[sessionId]/demographics?section=parent
 * - /onboarding/[sessionId]/demographics?section=child (after parent completes)
 * - /onboarding/[sessionId]/demographics?section=clinical (after child completes)
 * - Next: /onboarding/[sessionId]/insurance (after clinical completes)
 *
 * Layout:
 * - Uses onboarding layout (header, progress bar, footer)
 * - Single-column form centered with max-width 640px
 * - Mobile-first responsive design
 */
export default function DemographicsPage({ params }: DemographicsPageProps) {
  const { sessionId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive current section directly from URL params (no state needed)
  const sectionParam = searchParams.get("section");
  const currentSection: DemographicsSection =
    sectionParam === "child"
      ? "child"
      : sectionParam === "clinical"
        ? "clinical"
        : "parent";

  /**
   * Extract assessment summary for child form pre-population (AC-3.2.9)
   * Handles null/undefined/empty gracefully
   */
  const assessmentSummary = useCallback(() => {
    // Try to get from localStorage as backup
    try {
      const stored = localStorage.getItem(`onboarding_session_${sessionId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check for assessment summary in stored data
        if (parsed?.data?.assessmentSummary) {
          return parsed.data.assessmentSummary;
        }
        // Check for keyConcerns array format
        if (parsed?.data?.assessment?.keyConcerns) {
          const concerns = parsed.data.assessment.keyConcerns;
          if (Array.isArray(concerns) && concerns.length > 0) {
            return concerns.join("\n");
          }
        }
      }
    } catch (e) {
      console.warn("Failed to parse assessment summary from storage:", e);
    }
    return "";
  }, [sessionId]);

  /**
   * Handles parent form submission and navigation to child form
   * @param data - Validated parent info form data
   */
  function handleParentContinue(data: ParentInfoInput): void {
    console.info("Parent info submitted:", { sessionId, data });

    // Navigate to child section using URL params (AC-3.2.1)
    router.push(`/onboarding/${sessionId}/demographics?section=child`);
  }

  /**
   * Handles back navigation from parent form to assessment
   */
  function handleParentBack(): void {
    router.push(`/onboarding/${sessionId}/assessment`);
  }

  /**
   * Handles child form submission and navigation to clinical intake
   * @param data - Validated child info form data
   */
  function handleChildContinue(data: ChildInfoInput): void {
    console.info("Child info submitted:", { sessionId, data });

    // Navigate to clinical intake section (Story 3.3)
    router.push(`/onboarding/${sessionId}/demographics?section=clinical`);
  }

  /**
   * Handles back navigation from child form to parent form (AC-3.2.17)
   */
  function handleChildBack(): void {
    router.push(`/onboarding/${sessionId}/demographics?section=parent`);
  }

  /**
   * Handles clinical intake form submission and navigation to insurance
   * @param data - Clinical intake form data (all fields optional)
   */
  function handleClinicalContinue(data: ClinicalIntakeInput): void {
    console.info("Clinical intake submitted:", { sessionId, data });

    // Navigate to insurance form (AC-3.3.11)
    router.push(`/onboarding/${sessionId}/insurance`);
  }

  /**
   * Handles back navigation from clinical form to child form
   */
  function handleClinicalBack(): void {
    router.push(`/onboarding/${sessionId}/demographics?section=child`);
  }

  // Parent section content
  if (currentSection === "parent") {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold font-serif text-foreground">
            Your Information
          </h1>
          <p className="text-muted-foreground">
            Please provide your contact information so we can reach you about your
            child&apos;s care.
          </p>
        </div>

        <ParentInfoForm
          sessionId={sessionId}
          onContinue={handleParentContinue}
          onBack={handleParentBack}
        />
      </div>
    );
  }

  // Child section content (AC-3.2.1)
  if (currentSection === "child") {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold font-serif text-foreground">
            Child&apos;s Information
          </h1>
          <p className="text-muted-foreground">
            Tell us about your child so we can find the best match for their needs.
          </p>
        </div>

        <ChildInfoForm
          sessionId={sessionId}
          assessmentSummary={assessmentSummary()}
          onContinue={handleChildContinue}
          onBack={handleChildBack}
        />
      </div>
    );
  }

  // Clinical intake section content (Story 3.3, AC-3.3.1)
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold font-serif text-foreground">
          Clinical Information
        </h1>
        <p className="text-muted-foreground">
          Help us understand your child&apos;s background to provide better care.
        </p>
      </div>

      <ClinicalIntakeForm
        sessionId={sessionId}
        onContinue={handleClinicalContinue}
        onBack={handleClinicalBack}
      />
    </div>
  );
}
