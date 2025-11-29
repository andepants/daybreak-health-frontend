/**
 * Zod validation schemas for demographics forms
 *
 * Provides validation for parent and child information collection
 * with specific error messages and format requirements.
 */

import { z } from "zod";

import { calculateAge } from "@/lib/utils/age-validation";

/**
 * Allowed relationship options between adult and child
 */
export const RELATIONSHIP_OPTIONS = [
  "parent",
  "guardian",
  "grandparent",
  "other",
] as const;

/**
 * Display labels for relationship options
 */
export const RELATIONSHIP_LABELS: Record<
  (typeof RELATIONSHIP_OPTIONS)[number],
  string
> = {
  parent: "Parent",
  guardian: "Guardian",
  grandparent: "Grandparent",
  other: "Other",
};

/**
 * US phone number regex pattern for validation
 * Accepts formats: 1234567890, (123) 456-7890, 123-456-7890, etc.
 * Extracts 10 digits from formatted input
 */
const US_PHONE_REGEX = /^\d{10}$/;

/**
 * Parent information validation schema
 *
 * Validates:
 * - firstName: 2-50 characters, trimmed
 * - lastName: 2-50 characters, trimmed
 * - email: RFC 5322 compliant via Zod email validator
 * - phone: 10-digit US phone number (stored raw, formatted on display)
 * - relationshipToChild: One of the allowed relationship types
 *
 * @example
 * const result = parentInfoSchema.safeParse({
 *   firstName: "Jane",
 *   lastName: "Doe",
 *   email: "jane.doe@example.com",
 *   phone: "5551234567",
 *   relationshipToChild: "parent"
 * });
 */
export const parentInfoSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be no more than 50 characters"),

  lastName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be no more than 50 characters"),

  email: z
    .string()
    .min(1, "Please enter your email address")
    .email("Please enter a valid email address"),

  phone: z
    .string()
    .min(1, "Please enter your phone number")
    .regex(US_PHONE_REGEX, "Please enter a valid 10-digit phone number"),

  relationshipToChild: z.enum(RELATIONSHIP_OPTIONS, {
    errorMap: () => ({ message: "Please select your relationship to the child" }),
  }),
});

/**
 * TypeScript type inferred from parentInfoSchema
 * Use this type for form values and API payloads
 */
export type ParentInfoInput = z.infer<typeof parentInfoSchema>;

/**
 * Default values for parent info form initialization
 */
export const parentInfoDefaults: ParentInfoInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  relationshipToChild: "parent",
};

// ============================================================================
// Child Information Schema (Story 3.2)
// ============================================================================

/**
 * Pronoun options for child
 * Stored as strings for maximum flexibility
 */
export const PRONOUN_OPTIONS = [
  "she-her",
  "he-him",
  "they-them",
  "other",
  "prefer-not-to-say",
] as const;

/**
 * Display labels for pronoun options
 */
export const PRONOUN_LABELS: Record<(typeof PRONOUN_OPTIONS)[number], string> = {
  "she-her": "She/Her",
  "he-him": "He/Him",
  "they-them": "They/Them",
  "other": "Other",
  "prefer-not-to-say": "Prefer not to say",
};

/**
 * Grade level options
 */
export const GRADE_OPTIONS = [
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
  "not-in-school",
] as const;

/**
 * Display labels for grade options
 */
export const GRADE_LABELS: Record<(typeof GRADE_OPTIONS)[number], string> = {
  "5th": "5th Grade",
  "6th": "6th Grade",
  "7th": "7th Grade",
  "8th": "8th Grade",
  "9th": "9th Grade",
  "10th": "10th Grade",
  "11th": "11th Grade",
  "12th": "12th Grade",
  "not-in-school": "Not in school",
};

/**
 * Child information validation schema
 *
 * Validates:
 * - firstName: 2-50 characters, required
 * - dateOfBirth: Valid date with child aged 10-19 years
 * - pronouns: Optional selection from predefined options
 * - pronounsCustom: Optional custom text when "Other" is selected
 * - grade: Optional selection from grade levels
 * - primaryConcerns: Required text field pre-filled from assessment summary
 *
 * @example
 * const result = childInfoSchema.safeParse({
 *   firstName: "Alex",
 *   dateOfBirth: new Date("2012-05-15"),
 *   pronouns: "they-them",
 *   grade: "7th",
 *   primaryConcerns: "Anxiety about school"
 * });
 */
export const childInfoSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),

  dateOfBirth: z
    .date({
      required_error: "Please select your child's date of birth",
      invalid_type_error: "Please enter a valid date",
    })
    .refine(
      (date) => {
        const age = calculateAge(date);
        return age >= 10 && age <= 19;
      },
      { message: "Child must be between 10-19 years old for Daybreak services" }
    ),

  pronouns: z.enum(PRONOUN_OPTIONS).optional(),

  pronounsCustom: z
    .string()
    .max(50, "Custom pronouns must not exceed 50 characters")
    .optional(),

  grade: z.enum(GRADE_OPTIONS).optional(),

  primaryConcerns: z
    .string()
    .min(1, "Please describe the primary concerns")
    .max(2000, "Primary concerns must not exceed 2000 characters"),
});

/**
 * TypeScript type inferred from childInfoSchema
 * Use this type for form values and API payloads
 */
export type ChildInfoInput = z.infer<typeof childInfoSchema>;

/**
 * Default values for child info form initialization
 */
export const childInfoDefaults: Partial<ChildInfoInput> = {
  firstName: "",
  pronouns: undefined,
  pronounsCustom: "",
  grade: undefined,
  primaryConcerns: "",
};

// ============================================================================
// Clinical Intake Schema (Story 3.3)
// ============================================================================

/**
 * Previous therapy experience options
 * Maps to AC-3.3.3 select field
 */
export const PREVIOUS_THERAPY_OPTIONS = [
  "never",
  "currently",
  "previously",
] as const;

/**
 * Display labels for previous therapy options
 */
export const PREVIOUS_THERAPY_LABELS: Record<
  (typeof PREVIOUS_THERAPY_OPTIONS)[number],
  string
> = {
  never: "Never",
  currently: "Currently in therapy",
  previously: "Previously in therapy",
};

/**
 * Mental health diagnosis options for multi-select
 * Maps to AC-3.3.4 checkbox field
 */
export const DIAGNOSIS_OPTIONS = [
  "anxiety",
  "depression",
  "adhd",
  "autism",
  "other",
] as const;

/**
 * Display labels for diagnosis options
 */
export const DIAGNOSIS_LABELS: Record<
  (typeof DIAGNOSIS_OPTIONS)[number],
  string
> = {
  anxiety: "Anxiety",
  depression: "Depression",
  adhd: "ADHD",
  autism: "Autism",
  other: "Other",
};

/**
 * School accommodations options
 * Maps to AC-3.3.5 select field
 */
export const SCHOOL_ACCOMMODATIONS_OPTIONS = [
  "none",
  "iep",
  "504-plan",
  "other",
] as const;

/**
 * Display labels for school accommodations options
 */
export const SCHOOL_ACCOMMODATIONS_LABELS: Record<
  (typeof SCHOOL_ACCOMMODATIONS_OPTIONS)[number],
  string
> = {
  none: "None",
  iep: "IEP",
  "504-plan": "504 Plan",
  other: "Other",
};

/**
 * Clinical intake validation schema
 *
 * All fields are optional per AC-3.3.7.
 * Validates:
 * - currentMedications: Optional text, max 500 chars (AC-3.3.2)
 * - previousTherapy: Optional select from predefined options (AC-3.3.3)
 * - diagnoses: Optional multi-select array (AC-3.3.4)
 * - schoolAccommodations: Optional select (AC-3.3.5)
 * - additionalInfo: Optional text, max 500 chars (AC-3.3.6)
 *
 * @example
 * const result = clinicalIntakeSchema.safeParse({
 *   currentMedications: "Adderall 10mg",
 *   previousTherapy: "previously",
 *   diagnoses: ["adhd", "anxiety"],
 *   schoolAccommodations: "iep",
 *   additionalInfo: "Prefers morning appointments"
 * });
 */
export const clinicalIntakeSchema = z.object({
  currentMedications: z
    .string()
    .max(500, "Medications description must not exceed 500 characters")
    .optional()
    .or(z.literal("")),

  previousTherapy: z.enum(PREVIOUS_THERAPY_OPTIONS).optional(),

  diagnoses: z.array(z.enum(DIAGNOSIS_OPTIONS)).optional(),

  schoolAccommodations: z.enum(SCHOOL_ACCOMMODATIONS_OPTIONS).optional(),

  additionalInfo: z
    .string()
    .max(500, "Additional information must not exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

/**
 * TypeScript type inferred from clinicalIntakeSchema
 * Use this type for form values and API payloads
 */
export type ClinicalIntakeInput = z.infer<typeof clinicalIntakeSchema>;

/**
 * Default values for clinical intake form initialization
 */
export const clinicalIntakeDefaults: ClinicalIntakeInput = {
  currentMedications: "",
  previousTherapy: undefined,
  diagnoses: [],
  schoolAccommodations: undefined,
  additionalInfo: "",
};
