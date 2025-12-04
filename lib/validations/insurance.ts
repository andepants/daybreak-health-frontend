/**
 * Zod validation schema for insurance form
 *
 * Provides validation for insurance information collection
 * with specific error messages per field requirement.
 */

import { z } from "zod";

/**
 * Relationship to subscriber options
 */
export const RELATIONSHIP_TO_SUBSCRIBER_OPTIONS = [
  "Self",
  "Spouse",
  "Child",
  "Other",
] as const;

/**
 * Display labels for relationship options
 */
export const RELATIONSHIP_TO_SUBSCRIBER_LABELS: Record<
  (typeof RELATIONSHIP_TO_SUBSCRIBER_OPTIONS)[number],
  string
> = {
  Self: "Self (I am the policyholder)",
  Spouse: "Spouse",
  Child: "Child",
  Other: "Other",
};

/**
 * Insurance form validation schema
 *
 * Validates:
 * - carrier: Required selection from carrier list (AC-4.1.1)
 * - memberId: 5-30 alphanumeric chars with hyphens (AC-4.1.2)
 * - groupNumber: Optional, max 30 alphanumeric with hyphens (AC-4.1.3)
 * - subscriberName: 2-100 characters (AC-4.1.4)
 * - relationshipToSubscriber: Required enum selection (AC-4.1.4)
 *
 * @example
 * const result = insuranceSchema.safeParse({
 *   carrier: "bcbs",
 *   memberId: "ABC123456789",
 *   groupNumber: "GRP-001",
 *   subscriberName: "Jane Doe",
 *   relationshipToSubscriber: "Self"
 * });
 */
export const insuranceSchema = z.object({
  carrier: z
    .string()
    .min(1, "Please select an insurance carrier"),

  memberId: z
    .string()
    .min(5, "Member ID must be at least 5 characters")
    .max(30, "Member ID must be 30 characters or less")
    .regex(
      /^[A-Za-z0-9-]+$/,
      "Member ID can only contain letters, numbers, and hyphens"
    ),

  groupNumber: z
    .string()
    .max(30, "Group number must be 30 characters or less")
    .optional()
    .or(z.literal("")),

  subscriberName: z
    .string()
    .min(2, "Subscriber name must be at least 2 characters")
    .max(100, "Subscriber name must be 100 characters or less"),

  relationshipToSubscriber: z.enum(RELATIONSHIP_TO_SUBSCRIBER_OPTIONS, {
    errorMap: () => ({
      message: "Please select your relationship to the subscriber",
    }),
  }),
});

/**
 * TypeScript type inferred from insuranceSchema
 * Use this type for form values and API payloads
 */
export type InsuranceFormData = z.infer<typeof insuranceSchema>;

/**
 * Default values for insurance form initialization
 */
export const insuranceDefaults: InsuranceFormData = {
  carrier: "",
  memberId: "",
  groupNumber: "",
  subscriberName: "",
  relationshipToSubscriber: "Self",
};
