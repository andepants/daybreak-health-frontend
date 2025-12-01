/**
 * Field configuration for onboarding completion tracking
 *
 * Defines all tracked fields across the onboarding flow with their
 * validation rules, display labels, and section assignments.
 */

import type { FieldConfig } from "./types";

/**
 * Validates that a string has minimum length
 */
function minLength(min: number): (value: unknown) => boolean {
  return (value) =>
    typeof value === "string" && value.trim().length >= min;
}

/**
 * Validates that a value is defined and not empty
 */
function isDefined(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return !isNaN(value);
  if (value instanceof Date) return !isNaN(value.getTime());
  return true;
}

/**
 * Validates severity is between 1-5
 */
function isSeverityValid(value: unknown): boolean {
  return typeof value === "number" && value >= 1 && value <= 5;
}

/**
 * Configuration for all tracked fields in the onboarding flow
 *
 * Assessment fields:
 * - Page 1: primaryConcerns (10+ chars), concernDuration (required), concernSeverity (1-5)
 * - Page 2: All optional (sleepPatterns, appetiteChanges, schoolPerformance, socialRelationships)
 * - Page 3: recentEvents (optional), therapyGoals (10+ chars)
 *
 * Info (Demographics) fields:
 * - Parent: firstName, lastName, email, phone, relationshipToChild (all required)
 * - Child: firstName, dateOfBirth (required); pronouns, grade (optional)
 * - Note: primaryConcerns is pre-filled from assessment, tracked there
 *
 * Insurance fields:
 * - Conditional: carrier, memberId, subscriberName required unless self-pay
 */
export const FIELD_CONFIG: FieldConfig[] = [
  // ============================================================================
  // Assessment Section - Page 1: About Your Child
  // ============================================================================
  {
    path: "formAssessment.primaryConcerns",
    displayLabel: "Primary Concerns",
    section: "assessment",
    isRequired: true,
    page: 1,
    validate: minLength(10),
  },
  {
    path: "formAssessment.concernDuration",
    displayLabel: "Duration of Concerns",
    section: "assessment",
    isRequired: true,
    page: 1,
    validate: isDefined,
  },
  {
    path: "formAssessment.concernSeverity",
    displayLabel: "Severity Rating",
    section: "assessment",
    isRequired: true,
    page: 1,
    validate: isSeverityValid,
  },

  // ============================================================================
  // Assessment Section - Page 2: Daily Life Impact (all optional)
  // ============================================================================
  {
    path: "formAssessment.sleepPatterns",
    displayLabel: "Sleep Patterns",
    section: "assessment",
    isRequired: false,
    page: 2,
    validate: isDefined,
  },
  {
    path: "formAssessment.appetiteChanges",
    displayLabel: "Appetite Changes",
    section: "assessment",
    isRequired: false,
    page: 2,
    validate: isDefined,
  },
  {
    path: "formAssessment.schoolPerformance",
    displayLabel: "School Performance",
    section: "assessment",
    isRequired: false,
    page: 2,
    validate: isDefined,
  },
  {
    path: "formAssessment.socialRelationships",
    displayLabel: "Social Relationships",
    section: "assessment",
    isRequired: false,
    page: 2,
    validate: isDefined,
  },

  // ============================================================================
  // Assessment Section - Page 3: Additional Context
  // ============================================================================
  {
    path: "formAssessment.recentEvents",
    displayLabel: "Recent Events",
    section: "assessment",
    isRequired: false,
    page: 3,
    validate: isDefined,
  },
  {
    path: "formAssessment.therapyGoals",
    displayLabel: "Therapy Goals",
    section: "assessment",
    isRequired: true,
    page: 3,
    validate: minLength(10),
  },

  // ============================================================================
  // Info Section - Parent Information
  // ============================================================================
  {
    path: "parent.firstName",
    displayLabel: "Parent First Name",
    section: "info",
    isRequired: true,
    validate: minLength(2),
  },
  {
    path: "parent.lastName",
    displayLabel: "Parent Last Name",
    section: "info",
    isRequired: true,
    validate: minLength(2),
  },
  {
    path: "parent.email",
    displayLabel: "Parent Email",
    section: "info",
    isRequired: true,
    validate: (value) =>
      typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  },
  {
    path: "parent.phone",
    displayLabel: "Parent Phone",
    section: "info",
    isRequired: true,
    validate: (value) => {
      if (typeof value !== "string") return false;
      const digits = value.replace(/\D/g, "");
      // Accept 10 digits (raw) or 11 digits starting with 1 (E.164 format)
      return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
    },
  },
  {
    path: "parent.relationshipToChild",
    displayLabel: "Relationship to Child",
    section: "info",
    isRequired: true,
    validate: isDefined,
  },

  // ============================================================================
  // Info Section - Child Information
  // ============================================================================
  {
    path: "child.firstName",
    displayLabel: "Child's First Name",
    section: "info",
    isRequired: true,
    validate: minLength(2),
  },
  {
    path: "child.dateOfBirth",
    displayLabel: "Child's Date of Birth",
    section: "info",
    isRequired: true,
    validate: (value) => {
      if (!value) return false;
      const date = value instanceof Date ? value : new Date(value as string);
      if (isNaN(date.getTime())) return false;
      // Check age is between 10-19
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      return age >= 10 && age <= 19;
    },
  },
  {
    path: "child.pronouns",
    displayLabel: "Child's Pronouns",
    section: "info",
    isRequired: false,
    validate: isDefined,
  },
  {
    path: "child.grade",
    displayLabel: "Child's Grade",
    section: "info",
    isRequired: false,
    validate: isDefined,
  },

  // ============================================================================
  // Insurance Section
  // Note: These are conditionally required - not required if self-pay
  // The hook will handle the conditional logic
  // ============================================================================
  {
    path: "insurance.carrier",
    displayLabel: "Insurance Carrier",
    section: "insurance",
    isRequired: true, // Conditional - checked in hook
    validate: isDefined,
  },
  {
    path: "insurance.memberId",
    displayLabel: "Member ID",
    section: "insurance",
    isRequired: true, // Conditional - checked in hook
    validate: isDefined,
  },
  {
    path: "insurance.subscriberName",
    displayLabel: "Subscriber Name",
    section: "insurance",
    isRequired: true, // Conditional - checked in hook
    validate: isDefined,
  },
];

/**
 * Get field configurations for a specific section
 */
export function getFieldsForSection(section: string): FieldConfig[] {
  return FIELD_CONFIG.filter((f) => f.section === section);
}

/**
 * Get required field configurations for a specific section
 */
export function getRequiredFieldsForSection(section: string): FieldConfig[] {
  return FIELD_CONFIG.filter((f) => f.section === section && f.isRequired);
}

/**
 * Get field configurations for a specific page within a section
 */
export function getFieldsForPage(section: string, page: number): FieldConfig[] {
  return FIELD_CONFIG.filter((f) => f.section === section && f.page === page);
}
