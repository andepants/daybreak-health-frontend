/**
 * Assessment Field Status Hook
 *
 * Tracks completion status of all assessment form fields across
 * all 3 pages. Returns field-level completion for inline indicators
 * and aggregate counts for the summary checklist.
 */

import { useMemo } from "react";
import type { UseFormReturn, FieldErrors } from "react-hook-form";
import type {
  Page1Input,
  Page2Input,
  Page3Input,
} from "@/lib/validations/assessment";

/**
 * Status for a single field
 */
export interface AssessmentFieldStatus {
  /** Field identifier (e.g., "primaryConcerns") */
  name: string;
  /** Human-readable label for display */
  label: string;
  /** Whether the field is required */
  isRequired: boolean;
  /** Whether the field has a valid value */
  isComplete: boolean;
  /** Which page the field is on (1, 2, or 3) */
  page: number;
}

/**
 * Status for a section (page)
 */
export interface SectionStatus {
  /** Section identifier (e.g., "page1") */
  name: string;
  /** Human-readable label for display */
  label: string;
  /** Page number (1, 2, or 3) */
  page: number;
  /** Whether all required fields in section are complete */
  isComplete: boolean;
  /** Number of required fields in this section */
  requiredCount: number;
  /** Number of completed required fields in this section */
  completedCount: number;
}

/**
 * Return type for useAssessmentFieldStatus hook
 */
export interface AssessmentFieldStatusReturn {
  /** All field statuses */
  fields: AssessmentFieldStatus[];
  /** Fields filtered to only required ones */
  requiredFields: AssessmentFieldStatus[];
  /** Count of completed required fields */
  requiredComplete: number;
  /** Total count of required fields */
  requiredTotal: number;
  /** Count of completed optional fields */
  optionalComplete: number;
  /** Total count of optional fields */
  optionalTotal: number;
  /** Overall completion percentage (based on required fields) */
  overallPercentage: number;
  /** Whether all required fields are complete */
  isAllRequiredComplete: boolean;
  /** Section-level completion status */
  sections: SectionStatus[];
  /** Count of completed sections */
  sectionsComplete: number;
  /** Total count of sections (always 3) */
  sectionsTotal: number;
  /** Section completion percentage */
  sectionPercentage: number;
}

/**
 * Check if a string field is valid (non-empty with min length)
 */
function isStringValid(value: string | undefined, minLength = 1): boolean {
  return typeof value === "string" && value.trim().length >= minLength;
}

/**
 * Check if a value is defined and not undefined/null/empty
 */
function isDefined(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return !isNaN(value) && value >= 1;
  return true;
}

interface UseAssessmentFieldStatusOptions {
  /** Page 1 form instance */
  page1Form?: UseFormReturn<Page1Input>;
  /** Page 2 form instance */
  page2Form?: UseFormReturn<Page2Input>;
  /** Page 3 form instance */
  page3Form?: UseFormReturn<Page3Input>;
  /** Combined form values (alternative to individual forms) */
  formValues?: Partial<Page1Input & Page2Input & Page3Input>;
}

/**
 * Hook to track completion status of all assessment fields
 *
 * Can be used with either:
 * 1. Individual form instances (page1Form, page2Form, page3Form)
 * 2. Combined form values object
 *
 * @example
 * ```tsx
 * // With individual forms
 * const status = useAssessmentFieldStatus({
 *   page1Form,
 *   page2Form,
 *   page3Form,
 * });
 *
 * // With combined values
 * const status = useAssessmentFieldStatus({
 *   formValues: allFormData,
 * });
 *
 * // Use the results
 * console.log(status.requiredComplete, "of", status.requiredTotal, "complete");
 * console.log(status.overallPercentage, "% complete");
 * ```
 */
export function useAssessmentFieldStatus({
  page1Form,
  page2Form,
  page3Form,
  formValues: externalValues,
}: UseAssessmentFieldStatusOptions): AssessmentFieldStatusReturn {
  // Watch form values if forms are provided
  const page1Values = page1Form?.watch();
  const page2Values = page2Form?.watch();
  const page3Values = page3Form?.watch();

  // Combine all values
  const formValues = useMemo(() => {
    if (externalValues) return externalValues;
    return {
      ...page1Values,
      ...page2Values,
      ...page3Values,
    };
  }, [page1Values, page2Values, page3Values, externalValues]);

  return useMemo(() => {
    // Define all assessment fields with their validation rules
    const fields: AssessmentFieldStatus[] = [
      // Page 1 - About Your Child (all required)
      {
        name: "primaryConcerns",
        label: "Primary Concerns",
        isRequired: true,
        page: 1,
        isComplete: isStringValid(formValues.primaryConcerns, 10),
      },
      {
        name: "concernDuration",
        label: "Duration of Concerns",
        isRequired: true,
        page: 1,
        isComplete: isDefined(formValues.concernDuration),
      },
      {
        name: "concernSeverity",
        label: "Severity Rating",
        isRequired: true,
        page: 1,
        isComplete:
          typeof formValues.concernSeverity === "number" &&
          formValues.concernSeverity >= 1 &&
          formValues.concernSeverity <= 5,
      },

      // Page 2 - Daily Life Impact (all optional)
      {
        name: "sleepPatterns",
        label: "Sleep Patterns",
        isRequired: false,
        page: 2,
        isComplete: isDefined(formValues.sleepPatterns),
      },
      {
        name: "appetiteChanges",
        label: "Appetite Changes",
        isRequired: false,
        page: 2,
        isComplete: isDefined(formValues.appetiteChanges),
      },
      {
        name: "schoolPerformance",
        label: "School Performance",
        isRequired: false,
        page: 2,
        isComplete: isDefined(formValues.schoolPerformance),
      },
      {
        name: "socialRelationships",
        label: "Social Relationships",
        isRequired: false,
        page: 2,
        isComplete: isDefined(formValues.socialRelationships),
      },

      // Page 3 - Additional Context
      {
        name: "recentEvents",
        label: "Recent Events",
        isRequired: false,
        page: 3,
        isComplete: isStringValid(formValues.recentEvents),
      },
      {
        name: "therapyGoals",
        label: "Therapy Goals",
        isRequired: true,
        page: 3,
        isComplete: isStringValid(formValues.therapyGoals, 10),
      },
    ];

    // Calculate aggregates
    const requiredFields = fields.filter((f) => f.isRequired);
    const optionalFields = fields.filter((f) => !f.isRequired);
    const requiredComplete = requiredFields.filter((f) => f.isComplete).length;
    const optionalComplete = optionalFields.filter((f) => f.isComplete).length;

    const overallPercentage =
      requiredFields.length > 0
        ? Math.round((requiredComplete / requiredFields.length) * 100)
        : 100;

    // Calculate section-level status
    const sectionLabels: Record<number, string> = {
      1: "About Your Child",
      2: "Daily Life Impact",
      3: "Additional Context",
    };

    const sections: SectionStatus[] = [1, 2, 3].map((page) => {
      const pageRequiredFields = requiredFields.filter((f) => f.page === page);
      const completedCount = pageRequiredFields.filter((f) => f.isComplete).length;
      const requiredCount = pageRequiredFields.length;
      // Section is complete if all required fields are done (or no required fields)
      const isComplete = requiredCount === 0 || completedCount === requiredCount;

      return {
        name: `page${page}`,
        label: sectionLabels[page],
        page,
        isComplete,
        requiredCount,
        completedCount,
      };
    });

    const sectionsComplete = sections.filter((s) => s.isComplete).length;
    const sectionsTotal = sections.length;
    const sectionPercentage = Math.round((sectionsComplete / sectionsTotal) * 100);

    return {
      fields,
      requiredFields,
      requiredComplete,
      requiredTotal: requiredFields.length,
      optionalComplete,
      optionalTotal: optionalFields.length,
      overallPercentage,
      isAllRequiredComplete: requiredComplete === requiredFields.length,
      sections,
      sectionsComplete,
      sectionsTotal,
      sectionPercentage,
    };
  }, [formValues]);
}
