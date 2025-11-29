/**
 * Zod validation schemas for form-based assessment
 *
 * Provides validation for the 3-page assessment fallback form.
 * Schema structure matches backend GraphQL FormAssessmentInput type.
 * Used by form components and chat-to-form data mapping.
 */

import { z } from "zod";

// ============================================================================
// Page 1: About Your Child - Concern Fields
// ============================================================================

/**
 * Concern duration options
 * Maps to AC-3.4.3 select field
 */
export const CONCERN_DURATION_OPTIONS = [
  "less-than-1-month",
  "1-3-months",
  "3-6-months",
  "6-plus-months",
] as const;

/**
 * Display labels for concern duration options
 */
export const CONCERN_DURATION_LABELS: Record<
  (typeof CONCERN_DURATION_OPTIONS)[number],
  string
> = {
  "less-than-1-month": "Less than 1 month",
  "1-3-months": "1-3 months",
  "3-6-months": "3-6 months",
  "6-plus-months": "6+ months",
};

/**
 * Severity rating options (1-5 scale)
 * Maps to AC-3.4.3 scale input
 */
export const SEVERITY_OPTIONS = [1, 2, 3, 4, 5] as const;

/**
 * Display labels for severity options
 */
export const SEVERITY_LABELS: Record<number, string> = {
  1: "Mild",
  2: "Somewhat concerning",
  3: "Moderate",
  4: "Significant",
  5: "Severe",
};

// ============================================================================
// Page 2: Daily Life Impact Fields
// ============================================================================

/**
 * Sleep pattern options
 * Maps to AC-3.4.4 select field
 */
export const SLEEP_PATTERN_OPTIONS = [
  "no-change",
  "difficulty-falling-asleep",
  "waking-frequently",
  "sleeping-too-much",
  "irregular-schedule",
] as const;

/**
 * Display labels for sleep pattern options
 */
export const SLEEP_PATTERN_LABELS: Record<
  (typeof SLEEP_PATTERN_OPTIONS)[number],
  string
> = {
  "no-change": "No change",
  "difficulty-falling-asleep": "Difficulty falling asleep",
  "waking-frequently": "Waking frequently",
  "sleeping-too-much": "Sleeping too much",
  "irregular-schedule": "Irregular schedule",
};

/**
 * Appetite change options
 * Maps to AC-3.4.4 select field
 */
export const APPETITE_CHANGE_OPTIONS = [
  "no-change",
  "decreased",
  "increased",
  "irregular",
] as const;

/**
 * Display labels for appetite change options
 */
export const APPETITE_CHANGE_LABELS: Record<
  (typeof APPETITE_CHANGE_OPTIONS)[number],
  string
> = {
  "no-change": "No change",
  "decreased": "Decreased appetite",
  "increased": "Increased appetite",
  "irregular": "Irregular eating patterns",
};

/**
 * School performance options
 * Maps to AC-3.4.4 select field
 */
export const SCHOOL_PERFORMANCE_OPTIONS = [
  "no-change",
  "improved",
  "declining",
  "significantly-impacted",
  "not-attending",
] as const;

/**
 * Display labels for school performance options
 */
export const SCHOOL_PERFORMANCE_LABELS: Record<
  (typeof SCHOOL_PERFORMANCE_OPTIONS)[number],
  string
> = {
  "no-change": "No change",
  "improved": "Improved",
  "declining": "Declining",
  "significantly-impacted": "Significantly impacted",
  "not-attending": "Not attending school",
};

/**
 * Social relationship options
 * Maps to AC-3.4.4 select field
 */
export const SOCIAL_RELATIONSHIP_OPTIONS = [
  "no-change",
  "improved",
  "withdrawing",
  "conflicts",
  "isolated",
] as const;

/**
 * Display labels for social relationship options
 */
export const SOCIAL_RELATIONSHIP_LABELS: Record<
  (typeof SOCIAL_RELATIONSHIP_OPTIONS)[number],
  string
> = {
  "no-change": "No change",
  "improved": "Improved",
  "withdrawing": "Withdrawing from friends/activities",
  "conflicts": "More conflicts with peers",
  "isolated": "Isolated / no social interaction",
};

// ============================================================================
// Page-Specific Schemas
// ============================================================================

/**
 * Page 1 validation schema - About Your Child
 * All fields required per AC-3.4.3
 */
export const page1Schema = z.object({
  primaryConcerns: z
    .string()
    .min(10, "Please provide more detail about your concerns (at least 10 characters)")
    .max(2000, "Please keep your response under 2000 characters"),

  concernDuration: z.enum(CONCERN_DURATION_OPTIONS, {
    errorMap: () => ({ message: "Please select how long you've noticed these concerns" }),
  }),

  concernSeverity: z
    .number()
    .min(1, "Please rate the severity of your concerns")
    .max(5, "Severity must be between 1 and 5"),
});

/**
 * TypeScript type for Page 1 form values
 */
export type Page1Input = z.infer<typeof page1Schema>;

/**
 * Default values for Page 1 form
 */
export const page1Defaults: Partial<Page1Input> = {
  primaryConcerns: "",
  concernDuration: undefined,
  concernSeverity: undefined,
};

/**
 * Page 2 validation schema - Daily Life Impact
 * All fields optional per AC-3.4.4
 */
export const page2Schema = z.object({
  sleepPatterns: z.enum(SLEEP_PATTERN_OPTIONS).optional(),
  appetiteChanges: z.enum(APPETITE_CHANGE_OPTIONS).optional(),
  schoolPerformance: z.enum(SCHOOL_PERFORMANCE_OPTIONS).optional(),
  socialRelationships: z.enum(SOCIAL_RELATIONSHIP_OPTIONS).optional(),
});

/**
 * TypeScript type for Page 2 form values
 */
export type Page2Input = z.infer<typeof page2Schema>;

/**
 * Default values for Page 2 form
 */
export const page2Defaults: Page2Input = {
  sleepPatterns: undefined,
  appetiteChanges: undefined,
  schoolPerformance: undefined,
  socialRelationships: undefined,
};

/**
 * Page 3 validation schema - Additional Context
 * recentEvents optional, therapyGoals required per AC-3.4.5
 */
export const page3Schema = z.object({
  recentEvents: z
    .string()
    .max(1000, "Please keep your response under 1000 characters")
    .optional()
    .or(z.literal("")),

  therapyGoals: z
    .string()
    .min(10, "Please provide more detail about your therapy goals (at least 10 characters)")
    .max(1000, "Please keep your response under 1000 characters"),
});

/**
 * TypeScript type for Page 3 form values
 */
export type Page3Input = z.infer<typeof page3Schema>;

/**
 * Default values for Page 3 form
 */
export const page3Defaults: Page3Input = {
  recentEvents: "",
  therapyGoals: "",
};

// ============================================================================
// Combined Assessment Schema
// ============================================================================

/**
 * Full form assessment validation schema
 * Combines all three pages for final submission validation
 */
export const formAssessmentSchema = z.object({
  // Page 1 fields
  primaryConcerns: z
    .string()
    .min(10, "Please provide more detail about your concerns")
    .max(2000, "Please keep your response under 2000 characters"),
  concernDuration: z.enum(CONCERN_DURATION_OPTIONS),
  concernSeverity: z.number().min(1).max(5),

  // Page 2 fields (all optional)
  sleepPatterns: z.enum(SLEEP_PATTERN_OPTIONS).optional(),
  appetiteChanges: z.enum(APPETITE_CHANGE_OPTIONS).optional(),
  schoolPerformance: z.enum(SCHOOL_PERFORMANCE_OPTIONS).optional(),
  socialRelationships: z.enum(SOCIAL_RELATIONSHIP_OPTIONS).optional(),

  // Page 3 fields
  recentEvents: z.string().max(1000).optional().or(z.literal("")),
  therapyGoals: z.string().min(10).max(1000),
});

/**
 * TypeScript type for complete form assessment data
 */
export type FormAssessmentInput = z.infer<typeof formAssessmentSchema>;

/**
 * Default values for complete form assessment
 */
export const formAssessmentDefaults: Partial<FormAssessmentInput> = {
  ...page1Defaults,
  ...page2Defaults,
  ...page3Defaults,
};
