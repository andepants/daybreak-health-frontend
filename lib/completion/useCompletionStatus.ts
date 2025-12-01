/**
 * Centralized hook for computing onboarding completion status
 *
 * Reads session data from localStorage and computes real-time completion
 * percentages for each section. Updates automatically when data changes.
 *
 * Features:
 * - Real-time completion percentage per section
 * - Field-level completion tracking
 * - Human-readable missing field lists
 * - Cross-tab synchronization via storage events
 * - Same-tab updates via custom event
 */

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type {
  StepId,
  OnboardingCompletionState,
  SectionCompletionStatus,
  FieldCompletionStatus,
} from "./types";
import { FIELD_CONFIG } from "./field-config";

/**
 * Custom event name for same-tab data updates
 * Fired by auto-save hooks when localStorage is updated
 */
export const ONBOARDING_DATA_UPDATED_EVENT = "onboarding_data_updated";

/**
 * Helper to safely get a nested value from an object using dot notation
 * @param obj - Object to traverse
 * @param path - Dot-notation path (e.g., "parent.firstName")
 * @returns The value at the path, or undefined
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((acc, part) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj as unknown);
}

/**
 * Compute completion status for a single section
 */
function computeSectionStatus(
  sectionId: StepId,
  data: Record<string, unknown>,
  isSelfPay: boolean
): SectionCompletionStatus {
  // Get fields for this section
  const sectionFields = FIELD_CONFIG.filter((f) => f.section === sectionId);

  // Process each field
  const fieldStatuses: FieldCompletionStatus[] = sectionFields.map((field) => {
    const value = getNestedValue(data, field.path);

    // Handle conditional requirements for insurance
    let isRequired = field.isRequired;
    if (sectionId === "insurance" && isSelfPay) {
      isRequired = false; // Insurance fields not required if self-pay
    }

    // Validate field
    const isComplete = field.validate ? field.validate(value) : Boolean(value);

    return {
      fieldName: field.path,
      displayLabel: field.displayLabel,
      isComplete,
      isRequired,
      section: sectionId,
      page: field.page,
    };
  });

  // Calculate counts
  const requiredFields = fieldStatuses.filter((f) => f.isRequired);
  const optionalFields = fieldStatuses.filter((f) => !f.isRequired);
  const requiredComplete = requiredFields.filter((f) => f.isComplete).length;
  const optionalComplete = optionalFields.filter((f) => f.isComplete).length;

  // Calculate percentage (only based on required fields)
  const percentComplete =
    requiredFields.length > 0
      ? Math.round((requiredComplete / requiredFields.length) * 100)
      : 100; // If no required fields, section is complete

  return {
    sectionId,
    isComplete: requiredComplete === requiredFields.length,
    percentComplete,
    requiredFieldsComplete: requiredComplete,
    requiredFieldsTotal: requiredFields.length,
    optionalFieldsComplete: optionalComplete,
    optionalFieldsTotal: optionalFields.length,
    missingRequiredFields: requiredFields.filter((f) => !f.isComplete),
    completedRequiredFields: requiredFields.filter((f) => f.isComplete),
  };
}

/**
 * Create empty completion state for initial/error states
 */
function createEmptyState(sessionId: string): OnboardingCompletionState {
  const emptySectionStatus = (sectionId: StepId): SectionCompletionStatus => ({
    sectionId,
    isComplete: false,
    percentComplete: 0,
    requiredFieldsComplete: 0,
    requiredFieldsTotal: 0,
    optionalFieldsComplete: 0,
    optionalFieldsTotal: 0,
    missingRequiredFields: [],
    completedRequiredFields: [],
  });

  return {
    sessionId,
    sections: {
      assessment: emptySectionStatus("assessment"),
      info: emptySectionStatus("info"),
      insurance: emptySectionStatus("insurance"),
      match: emptySectionStatus("match"),
      book: emptySectionStatus("book"),
    },
    overallPercentComplete: 0,
    canProceedToMatching: false,
    matchingBlockers: [],
    lastUpdated: new Date().toISOString(),
  };
}

interface UseCompletionStatusOptions {
  sessionId: string;
}

/**
 * Hook to compute and track onboarding completion status
 *
 * @param options - Hook configuration
 * @returns Current completion state
 *
 * @example
 * ```tsx
 * const { sections, canProceedToMatching, matchingBlockers } = useCompletionStatus({
 *   sessionId: "abc123"
 * });
 *
 * // Show assessment progress
 * console.log(sections.assessment.percentComplete); // 75
 *
 * // Check what's blocking matching
 * if (!canProceedToMatching) {
 *   console.log(matchingBlockers); // ["Child's First Name", "Child's Date of Birth"]
 * }
 * ```
 */
export function useCompletionStatus({
  sessionId,
}: UseCompletionStatusOptions): OnboardingCompletionState {
  const [localData, setLocalData] = useState<Record<string, unknown>>({});

  /**
   * Load data from localStorage
   */
  const loadData = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(`onboarding_session_${sessionId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setLocalData(parsed.data || parsed || {});
      } else {
        setLocalData({});
      }
    } catch (error) {
      console.error("[useCompletionStatus] Failed to load data:", error);
      setLocalData({});
    }
  }, [sessionId]);

  /**
   * Set up data loading and event listeners
   */
  useEffect(() => {
    // Initial load
    loadData();

    // Listen for cross-tab storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `onboarding_session_${sessionId}`) {
        loadData();
      }
    };

    // Listen for same-tab updates (custom event)
    const handleCustomEvent = () => {
      loadData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(ONBOARDING_DATA_UPDATED_EVENT, handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        ONBOARDING_DATA_UPDATED_EVENT,
        handleCustomEvent
      );
    };
  }, [sessionId, loadData]);

  /**
   * Compute completion state from loaded data
   */
  const completionState = useMemo((): OnboardingCompletionState => {
    if (!sessionId) {
      return createEmptyState("");
    }

    // Check if self-pay (insurance not required)
    const isSelfPay =
      getNestedValue(localData, "insurance.verificationStatus") === "self_pay" ||
      getNestedValue(localData, "insurance.isSelfPay") === true;

    // Compute status for each section
    const sections: Record<StepId, SectionCompletionStatus> = {
      assessment: computeSectionStatus("assessment", localData, isSelfPay),
      info: computeSectionStatus("info", localData, isSelfPay),
      insurance: computeSectionStatus("insurance", localData, isSelfPay),
      // Match and Book don't have form fields - they're complete based on actions
      match: {
        sectionId: "match",
        isComplete: Boolean(getNestedValue(localData, "selectedTherapistId")),
        percentComplete: getNestedValue(localData, "selectedTherapistId")
          ? 100
          : 0,
        requiredFieldsComplete: 0,
        requiredFieldsTotal: 0,
        optionalFieldsComplete: 0,
        optionalFieldsTotal: 0,
        missingRequiredFields: [],
        completedRequiredFields: [],
      },
      book: {
        sectionId: "book",
        isComplete: Boolean(getNestedValue(localData, "appointmentId")),
        percentComplete: getNestedValue(localData, "appointmentId") ? 100 : 0,
        requiredFieldsComplete: 0,
        requiredFieldsTotal: 0,
        optionalFieldsComplete: 0,
        optionalFieldsTotal: 0,
        missingRequiredFields: [],
        completedRequiredFields: [],
      },
    };

    // Calculate overall percentage (assessment, info, insurance sections)
    const trackableSections = [sections.assessment, sections.info, sections.insurance];
    const totalRequired = trackableSections.reduce(
      (sum, s) => sum + s.requiredFieldsTotal,
      0
    );
    const totalComplete = trackableSections.reduce(
      (sum, s) => sum + s.requiredFieldsComplete,
      0
    );
    const overallPercentComplete =
      totalRequired > 0 ? Math.round((totalComplete / totalRequired) * 100) : 0;

    // Determine matching blockers
    const matchingBlockers: string[] = [];

    // Check assessment
    if (!sections.assessment.isComplete) {
      sections.assessment.missingRequiredFields.forEach((f) => {
        matchingBlockers.push(f.displayLabel);
      });
    }

    // Check info (parent + child)
    if (!sections.info.isComplete) {
      sections.info.missingRequiredFields.forEach((f) => {
        matchingBlockers.push(f.displayLabel);
      });
    }

    // Check insurance (unless self-pay)
    if (!isSelfPay && !sections.insurance.isComplete) {
      sections.insurance.missingRequiredFields.forEach((f) => {
        matchingBlockers.push(f.displayLabel);
      });
    }

    const canProceedToMatching =
      sections.assessment.isComplete &&
      sections.info.isComplete &&
      (isSelfPay || sections.insurance.isComplete);

    return {
      sessionId,
      sections,
      overallPercentComplete,
      canProceedToMatching,
      matchingBlockers,
      lastUpdated: new Date().toISOString(),
    };
  }, [sessionId, localData]);

  return completionState;
}

/**
 * Dispatch event to notify completion status listeners of data update
 * Call this after saving data to localStorage
 */
export function notifyCompletionUpdate(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ONBOARDING_DATA_UPDATED_EVENT));
  }
}
