/**
 * Demographics Field Status Hook
 *
 * Tracks completion status of all demographics form fields across
 * all 3 sections (parent, child, clinical). Returns field-level completion
 * for inline indicators and aggregate counts for the summary checklist.
 */

import { useMemo } from "react";
import type {
  ParentInfoInput,
  ChildInfoInput,
  ClinicalIntakeInput,
} from "@/lib/validations/demographics";

/**
 * Section identifiers for demographics
 */
export type DemographicsSection = "parent" | "child" | "clinical";

/**
 * Status for a single field
 */
export interface DemographicsFieldStatus {
  /** Field identifier (e.g., "firstName") */
  name: string;
  /** Human-readable label for display */
  label: string;
  /** Whether the field is required */
  isRequired: boolean;
  /** Whether the field has a valid value */
  isComplete: boolean;
  /** Which section the field is in */
  section: DemographicsSection;
}

/**
 * Status for a section
 */
export interface DemographicsSectionStatus {
  /** Section identifier */
  id: DemographicsSection;
  /** Human-readable label for display */
  label: string;
  /** Whether all required fields in section are complete */
  isComplete: boolean;
  /** Number of required fields in this section */
  requiredCount: number;
  /** Number of completed required fields in this section */
  completedCount: number;
}

/**
 * Return type for useDemographicsFieldStatus hook
 */
export interface DemographicsFieldStatusReturn {
  /** All field statuses */
  fields: DemographicsFieldStatus[];
  /** Fields filtered to only required ones */
  requiredFields: DemographicsFieldStatus[];
  /** Count of completed required fields */
  requiredComplete: number;
  /** Total count of required fields */
  requiredTotal: number;
  /** Overall completion percentage (based on required fields) */
  overallPercentage: number;
  /** Whether all required fields are complete */
  isAllRequiredComplete: boolean;
  /** Section-level completion status */
  sections: DemographicsSectionStatus[];
  /** Count of completed sections */
  sectionsComplete: number;
  /** Total count of sections (always 3) */
  sectionsTotal: number;
}

/**
 * Check if a string field is valid (non-empty)
 */
function isStringValid(value: string | undefined, minLength = 1): boolean {
  return typeof value === "string" && value.trim().length >= minLength;
}

/**
 * Check if a date is valid
 */
function isDateValid(value: Date | string | undefined): boolean {
  if (!value) return false;
  if (value instanceof Date) return !isNaN(value.getTime());
  if (typeof value === "string") {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
  return false;
}

/**
 * Section labels for display
 */
const SECTION_LABELS: Record<DemographicsSection, string> = {
  parent: "About You",
  child: "About Your Child",
  clinical: "Medical History",
};

interface UseDemographicsFieldStatusOptions {
  /** Parent form data */
  parentData?: Partial<ParentInfoInput>;
  /** Child form data */
  childData?: Partial<ChildInfoInput>;
  /** Clinical form data */
  clinicalData?: Partial<ClinicalIntakeInput>;
  /** Set of completed sections */
  completedSections?: Set<DemographicsSection>;
}

/**
 * Hook to track completion status of all demographics fields
 *
 * @example
 * ```tsx
 * const status = useDemographicsFieldStatus({
 *   parentData: storedData.parent,
 *   childData: storedData.child,
 *   clinicalData: storedData.clinical,
 *   completedSections,
 * });
 *
 * console.log(status.requiredComplete, "of", status.requiredTotal, "complete");
 * console.log(status.overallPercentage, "% complete");
 * ```
 */
export function useDemographicsFieldStatus({
  parentData = {},
  childData = {},
  clinicalData = {},
  completedSections = new Set(),
}: UseDemographicsFieldStatusOptions): DemographicsFieldStatusReturn {
  return useMemo(() => {
    // Define all demographics fields with their validation rules
    const fields: DemographicsFieldStatus[] = [
      // Parent section (all required)
      {
        name: "firstName",
        label: "First Name",
        isRequired: true,
        section: "parent",
        isComplete: isStringValid(parentData.firstName, 2),
      },
      {
        name: "lastName",
        label: "Last Name",
        isRequired: true,
        section: "parent",
        isComplete: isStringValid(parentData.lastName, 2),
      },
      {
        name: "email",
        label: "Email",
        isRequired: true,
        section: "parent",
        isComplete: isStringValid(parentData.email) &&
          parentData.email?.includes("@") === true,
      },
      {
        name: "phone",
        label: "Phone Number",
        isRequired: true,
        section: "parent",
        isComplete: isStringValid(parentData.phone, 10),
      },
      {
        name: "relationshipToChild",
        label: "Relationship to Child",
        isRequired: true,
        section: "parent",
        isComplete: isStringValid(parentData.relationshipToChild),
      },

      // Child section (mixed required/optional)
      {
        name: "childFirstName",
        label: "Child's First Name",
        isRequired: true,
        section: "child",
        isComplete: isStringValid(childData.firstName, 2),
      },
      {
        name: "dateOfBirth",
        label: "Date of Birth",
        isRequired: true,
        section: "child",
        isComplete: isDateValid(childData.dateOfBirth),
      },
      {
        name: "primaryConcerns",
        label: "Primary Concerns",
        isRequired: true,
        section: "child",
        isComplete: isStringValid(childData.primaryConcerns, 1),
      },

      // Clinical section (all optional - section marked complete when visited)
      {
        name: "previousTherapy",
        label: "Previous Therapy",
        isRequired: false,
        section: "clinical",
        isComplete: isStringValid(clinicalData.previousTherapy) ||
          completedSections.has("clinical"),
      },
      {
        name: "currentMedications",
        label: "Current Medications",
        isRequired: false,
        section: "clinical",
        isComplete: isStringValid(clinicalData.currentMedications) ||
          completedSections.has("clinical"),
      },
    ];

    // Calculate aggregates
    const requiredFields = fields.filter((f) => f.isRequired);
    const requiredComplete = requiredFields.filter((f) => f.isComplete).length;

    const overallPercentage =
      requiredFields.length > 0
        ? Math.round((requiredComplete / requiredFields.length) * 100)
        : 100;

    // Calculate section-level status
    const sectionIds: DemographicsSection[] = ["parent", "child", "clinical"];

    const sections: DemographicsSectionStatus[] = sectionIds.map((sectionId) => {
      const sectionRequiredFields = requiredFields.filter(
        (f) => f.section === sectionId
      );
      const completedCount = sectionRequiredFields.filter(
        (f) => f.isComplete
      ).length;
      const requiredCount = sectionRequiredFields.length;

      // Section is complete if all required fields are done (or no required fields)
      // Also check if explicitly marked as completed
      const isComplete =
        completedSections.has(sectionId) ||
        requiredCount === 0 ||
        completedCount === requiredCount;

      return {
        id: sectionId,
        label: SECTION_LABELS[sectionId],
        isComplete,
        requiredCount,
        completedCount,
      };
    });

    const sectionsComplete = sections.filter((s) => s.isComplete).length;
    const sectionsTotal = sections.length;

    return {
      fields,
      requiredFields,
      requiredComplete,
      requiredTotal: requiredFields.length,
      overallPercentage,
      isAllRequiredComplete: requiredComplete === requiredFields.length,
      sections,
      sectionsComplete,
      sectionsTotal,
    };
  }, [parentData, childData, clinicalData, completedSections]);
}
