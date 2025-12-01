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

import { use, useCallback, useMemo, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ParentInfoForm,
  ChildInfoForm,
  ClinicalIntakeForm,
  useDemographicsSave,
} from "@/features/demographics";
import type {
  ParentInfoInput,
  ChildInfoInput,
  ClinicalIntakeInput,
} from "@/lib/validations/demographics";
// Note: Toast notifications disabled until sonner package is installed
// import { toast } from "sonner";

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

  // State to hold loaded session data
  const [storedData, setStoredData] = useState<{
    parent?: Partial<ParentInfoInput>;
    child?: Partial<ChildInfoInput>;
    clinical?: Partial<ClinicalIntakeInput>;
    assessmentSummary?: string;
  }>({});

  // Track whether data has been loaded (for form key to force re-mount)
  const [dataLoaded, setDataLoaded] = useState(false);

  // Demographics save hook for persisting data to backend
  const { saveParentInfo, saveChildInfo, parentSaveStatus, childSaveStatus, error: saveError } = useDemographicsSave({
    sessionId,
    onParentSaveSuccess: () => {
      console.info("Parent info saved to backend successfully");
    },
    onChildSaveSuccess: () => {
      console.info("Child info saved to backend successfully");
    },
    onError: (error) => {
      console.error("Failed to save demographics:", error);
      // TODO: Add toast notification when sonner is installed
      // toast.error(error);
    },
  });

  /**
   * Load stored session data from localStorage on mount
   * This enables resume functionality and dev toolbar data fill
   */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`onboarding_session_${sessionId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.data) {
          // Parse child dateOfBirth string to Date object for form compatibility
          let childData = parsed.data.child;
          if (childData?.dateOfBirth && typeof childData.dateOfBirth === "string") {
            childData = {
              ...childData,
              dateOfBirth: new Date(childData.dateOfBirth),
            };
          }

          setStoredData({
            parent: parsed.data.parent,
            child: childData,
            clinical: parsed.data.clinical,
            assessmentSummary: parsed.data.assessmentSummary,
          });
        }
      }
    } catch (e) {
      console.warn("Failed to load session data from storage:", e);
    }
    // Mark data as loaded to trigger form re-mount with new defaults
    setDataLoaded(true);
  }, [sessionId]);

  /**
   * Extract assessment summary for child form pre-population (AC-3.2.9)
   * Uses stored data which is loaded via useEffect (client-side only)
   */
  const assessmentSummary = useMemo(() => {
    if (storedData.assessmentSummary) {
      return storedData.assessmentSummary;
    }
    // Check for child's primaryConcerns from stored data
    if (storedData.child?.primaryConcerns) {
      return storedData.child.primaryConcerns;
    }
    return "";
  }, [storedData.assessmentSummary, storedData.child?.primaryConcerns]);

  /**
   * Handles parent form submission and navigation to child form
   * Saves parent info to backend before navigating
   * @param data - Validated parent info form data
   */
  async function handleParentContinue(data: ParentInfoInput): Promise<void> {
    console.info("Parent info submitted:", { sessionId, data });

    // Determine if the person is the legal guardian based on relationship
    const isGuardian = ["parent", "guardian", "foster_parent"].includes(
      data.relationshipToChild
    );

    // Save to backend
    const result = await saveParentInfo({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      relationship: data.relationshipToChild,
      isGuardian,
    });

    if (!result.success) {
      // Error already handled by hook's onError callback
      return;
    }

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
   * Saves child info to backend before navigating
   * @param data - Validated child info form data
   */
  async function handleChildContinue(data: ChildInfoInput): Promise<void> {
    console.info("Child info submitted:", { sessionId, data });

    // Format date to ISO 8601 string
    const dateOfBirth = data.dateOfBirth instanceof Date
      ? data.dateOfBirth.toISOString().split("T")[0]
      : String(data.dateOfBirth);

    // Save to backend
    // Note: Frontend child form doesn't collect lastName, so we pass empty string
    // Gender is derived from pronouns selection
    const result = await saveChildInfo({
      firstName: data.firstName,
      dateOfBirth,
      gender: data.pronouns || data.pronounsCustom || undefined,
      grade: data.grade || undefined,
      primaryConcerns: data.primaryConcerns,
    });

    if (!result.success) {
      // Error already handled by hook's onError callback
      return;
    }

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
          key={`parent-${dataLoaded}`}
          sessionId={sessionId}
          initialData={storedData.parent}
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
          key={`child-${dataLoaded}`}
          sessionId={sessionId}
          initialData={storedData.child}
          assessmentSummary={assessmentSummary}
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
        key={`clinical-${dataLoaded}`}
        sessionId={sessionId}
        initialData={storedData.clinical}
        onContinue={handleClinicalContinue}
        onBack={handleClinicalBack}
      />
    </div>
  );
}
