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
 *
 * Features a sidebar progress indicator (desktop) or header progress (mobile) showing
 * completion status and allowing navigation to previously completed sections.
 */
"use client";

import { use, useCallback, useMemo, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ParentInfoForm,
  ChildInfoForm,
  ClinicalIntakeForm,
  useDemographicsSave,
  InfoProgress,
  DemographicsCompletionSummary,
  useDemographicsFieldStatus,
  type DemographicsSection,
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
 * LocalStorage key helper for completed sections
 */
function getCompletedSectionsKey(sessionId: string): string {
  return `demographics_completed_${sessionId}`;
}

/**
 * Demographics page component
 *
 * Renders parent info form first, then child info form, then clinical intake.
 * Uses URL search params for section navigation to support browser back button.
 * Includes sidebar progress indicator on desktop.
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
 * - Two-column layout on desktop: sidebar (left) + form (right)
 * - Single-column on mobile with progress in header
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

  // Track which sections have been completed
  const [completedSections, setCompletedSections] = useState<Set<DemographicsSection>>(
    new Set()
  );

  // Track whether data has been loaded (for form key to force re-mount)
  const [dataLoaded, setDataLoaded] = useState(false);

  // Demographics save hook for persisting data to backend
  const {
    saveParentInfo,
    saveChildInfo,
    parentSaveStatus,
    childSaveStatus,
    error: saveError,
  } = useDemographicsSave({
    sessionId,
    onParentSaveSuccess: () => {
      console.info("Parent info saved to backend successfully");
    },
    onChildSaveSuccess: () => {
      console.info("Child info saved to backend successfully");
    },
    onError: (error) => {
      console.error("Failed to save demographics:", error);
    },
  });

  /**
   * Load stored session data and completed sections from localStorage on mount
   * This enables resume functionality and dev toolbar data fill
   */
  useEffect(() => {
    try {
      // Load session data
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

      // Load completed sections
      const completedStr = localStorage.getItem(getCompletedSectionsKey(sessionId));
      if (completedStr) {
        const completedArr = JSON.parse(completedStr) as DemographicsSection[];
        setCompletedSections(new Set(completedArr));
      }
    } catch (e) {
      console.warn("Failed to load session data from storage:", e);
    }
    // Mark data as loaded to trigger form re-mount with new defaults
    setDataLoaded(true);
  }, [sessionId]);

  /**
   * Persist completed sections to localStorage
   */
  function saveCompletedSections(sections: Set<DemographicsSection>): void {
    try {
      localStorage.setItem(
        getCompletedSectionsKey(sessionId),
        JSON.stringify(Array.from(sections))
      );
    } catch (e) {
      console.warn("Failed to save completed sections:", e);
    }
  }

  /**
   * Mark a section as completed and persist
   */
  function markSectionComplete(section: DemographicsSection): void {
    setCompletedSections((prev) => {
      const updated = new Set(prev);
      updated.add(section);
      saveCompletedSections(updated);
      return updated;
    });
  }

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
   * Handle sidebar section click navigation
   * Allows navigation to any section for quick jumping
   */
  function handleSectionClick(section: DemographicsSection): void {
    router.push(`/onboarding/${sessionId}/demographics?section=${section}`);
  }

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

    // Mark section complete and navigate
    markSectionComplete("parent");
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
    const dateOfBirth =
      data.dateOfBirth instanceof Date
        ? data.dateOfBirth.toISOString().split("T")[0]
        : String(data.dateOfBirth);

    // Save to backend
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

    // Mark section complete and navigate
    markSectionComplete("child");
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

    // Mark section complete and navigate
    markSectionComplete("clinical");
    router.push(`/onboarding/${sessionId}/insurance`);
  }

  /**
   * Handles back navigation from clinical form to child form
   */
  function handleClinicalBack(): void {
    router.push(`/onboarding/${sessionId}/demographics?section=child`);
  }

  /**
   * Handles parent form data changes for completion summary updates
   * Updates storedData.parent so useDemographicsFieldStatus reflects current values
   */
  const handleParentFormChange = useCallback((data: Partial<ParentInfoInput>) => {
    setStoredData(prev => ({ ...prev, parent: data }));
  }, []);

  /**
   * Handles child form data changes for completion summary updates
   * Updates storedData.child so useDemographicsFieldStatus reflects current values
   */
  const handleChildFormChange = useCallback((data: Partial<ChildInfoInput>) => {
    setStoredData(prev => ({ ...prev, child: data }));
  }, []);

  /**
   * Handles clinical form data changes for completion summary updates
   * Updates storedData.clinical so useDemographicsFieldStatus reflects current values
   */
  const handleClinicalFormChange = useCallback((data: Partial<ClinicalIntakeInput>) => {
    setStoredData(prev => ({ ...prev, clinical: data }));
  }, []);

  // Track field completion status for summary
  const fieldStatus = useDemographicsFieldStatus({
    parentData: storedData.parent,
    childData: storedData.child,
    clinicalData: storedData.clinical,
    completedSections,
  });

  /**
   * Render the current section's form content
   */
  function renderFormContent(): React.ReactNode {
    if (currentSection === "parent") {
      return (
        <div className="min-h-[400px] bg-card rounded-xl border shadow-sm p-6 md:p-8">
          <div className="space-y-2 text-center lg:text-left mb-6">
            <h2 className="text-xl font-semibold font-serif text-foreground">
              About You
            </h2>
            <p className="text-muted-foreground text-sm">
              Please provide your contact information so we can reach you about
              your child&apos;s care.
            </p>
          </div>

          <ParentInfoForm
            key={`parent-${dataLoaded}`}
            sessionId={sessionId}
            initialData={storedData.parent}
            onContinue={handleParentContinue}
            onBack={handleParentBack}
            onFormChange={handleParentFormChange}
          />
        </div>
      );
    }

    if (currentSection === "child") {
      return (
        <div className="min-h-[400px] bg-card rounded-xl border shadow-sm p-6 md:p-8">
          <div className="space-y-2 text-center lg:text-left mb-6">
            <h2 className="text-xl font-semibold font-serif text-foreground">
              About Your Child
            </h2>
            <p className="text-muted-foreground text-sm">
              Tell us about your child so we can find the best match for their
              needs.
            </p>
          </div>

          <ChildInfoForm
            key={`child-${dataLoaded}`}
            sessionId={sessionId}
            initialData={storedData.child}
            assessmentSummary={assessmentSummary}
            onContinue={handleChildContinue}
            onBack={handleChildBack}
            onFormChange={handleChildFormChange}
          />
        </div>
      );
    }

    // Clinical section
    return (
      <div className="min-h-[400px] bg-card rounded-xl border shadow-sm p-6 md:p-8">
        <div className="space-y-2 text-center lg:text-left mb-6">
          <h2 className="text-xl font-semibold font-serif text-foreground">
            Medical History
          </h2>
          <p className="text-muted-foreground text-sm">
            Help us understand your child&apos;s background to provide better
            care.
          </p>
        </div>

        <ClinicalIntakeForm
          key={`clinical-${dataLoaded}`}
          sessionId={sessionId}
          initialData={storedData.clinical}
          onContinue={handleClinicalContinue}
          onBack={handleClinicalBack}
          onFormChange={handleClinicalFormChange}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
      {/* Layout: Sidebar (Desktop) / Stacked (Mobile) - Matches Assessment page */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
        {/* Left Column: Progress Sidebar */}
        <div className="lg:col-span-1">
          <InfoProgress
            currentSection={currentSection}
            completedSections={completedSections}
            onSectionClick={handleSectionClick}
          />
        </div>

        {/* Right Column: Main Content Area */}
        <div className="lg:col-span-3">
          {/* Completion summary checklist */}
          <DemographicsCompletionSummary
            sections={fieldStatus.sections}
            requiredComplete={fieldStatus.requiredComplete}
            requiredTotal={fieldStatus.requiredTotal}
            percentage={fieldStatus.overallPercentage}
            onSectionClick={handleSectionClick}
            currentSection={currentSection}
          />

          {/* Form content */}
          {renderFormContent()}
        </div>
      </div>
    </div>
  );
}
