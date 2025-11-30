/**
 * Zod validation schemas for cost estimation data
 *
 * Provides runtime validation for cost estimate responses from the API,
 * ensuring data integrity and type safety throughout the cost display flow.
 */

import { z } from "zod";

/**
 * Schema for coverage information
 *
 * Validates insurance coverage details including percentage or amount
 * covered by insurance, with optional description text.
 */
export const coverageSchema = z.object({
  percentage: z.number().min(0).max(100).nullable().optional(),
  amount: z.number().int().nonnegative().nullable().optional(),
  description: z.string().nullable().optional(),
});

/**
 * Schema for deductible information
 *
 * Validates annual deductible tracking data including total amount,
 * how much has been met, and remaining balance (all in cents).
 */
export const deductibleInfoSchema = z.object({
  total: z.number().int().nonnegative(),
  met: z.number().int().nonnegative(),
  remaining: z.number().int().nonnegative(),
});

/**
 * Schema for out-of-pocket maximum information
 *
 * Validates annual out-of-pocket maximum tracking data including
 * total maximum amount and how much has been applied toward it (all in cents).
 */
export const outOfPocketInfoSchema = z.object({
  max: z.number().int().nonnegative(),
  met: z.number().int().nonnegative(),
  remaining: z.number().int().nonnegative(),
});

/**
 * Schema for cost estimate data from API
 *
 * Validates the complete cost estimation response including:
 * - Session ID for tracking
 * - Per-session cost in cents
 * - Insurance coverage information
 * - Copay/coinsurance amounts in cents
 * - Deductible information (optional)
 * - Insurance carrier name for display
 * - Disclaimer text from backend
 * - Calculation timestamp
 *
 * @example
 * const result = costEstimateSchema.safeParse({
 *   sessionId: "session_123",
 *   perSessionCost: 2500, // $25.00
 *   insuranceCoverage: { percentage: 80, description: "PPO coverage" },
 *   copay: 2500,
 *   insuranceCarrier: "Blue Cross Blue Shield",
 *   disclaimer: "Final cost may vary based on your specific plan",
 *   calculatedAt: "2025-11-30T12:00:00Z"
 * });
 */
export const costEstimateSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),

  perSessionCost: z
    .number()
    .int("Per-session cost must be in cents (integer)")
    .nonnegative("Per-session cost cannot be negative"),

  insuranceCoverage: coverageSchema.nullable().optional(),

  copay: z
    .number()
    .int("Copay must be in cents (integer)")
    .nonnegative("Copay cannot be negative")
    .nullable()
    .optional(),

  coinsurance: z
    .number()
    .min(0, "Coinsurance percentage cannot be negative")
    .max(100, "Coinsurance percentage cannot exceed 100")
    .nullable()
    .optional(),

  deductible: deductibleInfoSchema.nullable().optional(),

  outOfPocket: outOfPocketInfoSchema.nullable().optional(),

  insuranceCarrier: z.string().min(1, "Insurance carrier name is required"),

  disclaimer: z.string().nullable().optional(),

  calculatedAt: z.string().datetime("Invalid calculation timestamp"),
});

/**
 * TypeScript type for coverage information
 */
export type Coverage = z.infer<typeof coverageSchema>;

/**
 * TypeScript type for deductible information
 */
export type DeductibleInfo = z.infer<typeof deductibleInfoSchema>;

/**
 * TypeScript type for out-of-pocket maximum information
 */
export type OutOfPocketInfo = z.infer<typeof outOfPocketInfoSchema>;

/**
 * TypeScript type for cost estimate
 * Use this type for component props and hook returns
 */
export type CostEstimate = z.infer<typeof costEstimateSchema>;

/**
 * Schema for self-pay package discount options
 *
 * Validates package pricing structures with bulk session discounts,
 * including total price, per-session price, and savings percentage.
 */
export const selfPayPackageSchema = z.object({
  id: z.string().min(1, "Package ID is required"),
  name: z.string().min(1, "Package name is required"),
  sessionCount: z.number().int().positive("Session count must be positive"),
  totalPrice: z
    .number()
    .int("Total price must be in cents (integer)")
    .positive("Total price must be positive"),
  pricePerSession: z
    .number()
    .int("Per-session price must be in cents (integer)")
    .positive("Per-session price must be positive"),
  savingsPercentage: z
    .number()
    .min(0, "Savings percentage cannot be negative")
    .max(100, "Savings percentage cannot exceed 100"),
});

/**
 * Schema for self-pay rate data from API
 *
 * Validates self-pay pricing information including:
 * - Base per-session rate in cents
 * - Package discount options (if available)
 * - Financial assistance availability flag
 *
 * @example
 * const result = selfPayRateSchema.safeParse({
 *   perSessionRate: 15000, // $150.00
 *   packages: [
 *     {
 *       id: "pkg_4",
 *       name: "4-Session Package",
 *       sessionCount: 4,
 *       totalPrice: 54000, // $540.00
 *       pricePerSession: 13500, // $135.00
 *       savingsPercentage: 10
 *     }
 *   ],
 *   financialAssistanceAvailable: true
 * });
 */
export const selfPayRateSchema = z.object({
  perSessionRate: z
    .number()
    .int("Per-session rate must be in cents (integer)")
    .positive("Per-session rate must be positive"),

  packages: z.array(selfPayPackageSchema).default([]),

  financialAssistanceAvailable: z.boolean().default(false),
});

/**
 * Schema for payment preference input
 *
 * Validates the payment preference mutation input including:
 * - Preference type (insurance or self-pay)
 * - Optional package ID for self-pay bulk purchases
 */
export const paymentPreferenceInputSchema = z.object({
  preferenceType: z.enum(["insurance", "self_pay"], {
    errorMap: () => ({ message: "Preference type must be 'insurance' or 'self_pay'" }),
  }),
  packageId: z.string().nullable().optional(),
});

/**
 * TypeScript type for self-pay package
 */
export type SelfPayPackage = z.infer<typeof selfPayPackageSchema>;

/**
 * TypeScript type for self-pay rate data
 */
export type SelfPayRate = z.infer<typeof selfPayRateSchema>;

/**
 * TypeScript type for payment preference input
 */
export type PaymentPreferenceInput = z.infer<typeof paymentPreferenceInputSchema>;

/**
 * Schema for payment plan frequency
 *
 * Defines available payment plan frequencies
 */
export const paymentFrequencySchema = z.enum(["per_session", "monthly", "prepaid"], {
  errorMap: () => ({ message: "Frequency must be 'per_session', 'monthly', or 'prepaid'" }),
});

/**
 * Schema for payment plan data
 *
 * Validates payment plan information including:
 * - Plan ID and name
 * - Description and frequency
 * - Installment and total amounts in cents
 * - Terms and conditions text
 *
 * @example
 * const result = paymentPlanSchema.safeParse({
 *   id: "plan_monthly",
 *   name: "Monthly Billing",
 *   description: "Pay monthly instead of per session",
 *   frequency: "monthly",
 *   installmentAmount: 60000, // $600.00 per month
 *   totalAmount: null,
 *   terms: "Cancel anytime with 30 days notice"
 * });
 */
export const paymentPlanSchema = z.object({
  id: z.string().min(1, "Plan ID is required"),
  name: z.string().min(1, "Plan name is required"),
  description: z.string().nullable().optional(),
  frequency: paymentFrequencySchema,
  installmentAmount: z
    .number()
    .int("Installment amount must be in cents (integer)")
    .nonnegative("Installment amount cannot be negative")
    .nullable()
    .optional(),
  totalAmount: z
    .number()
    .int("Total amount must be in cents (integer)")
    .nonnegative("Total amount cannot be negative")
    .nullable()
    .optional(),
  terms: z.string().nullable().optional(),
});

/**
 * TypeScript type for payment frequency
 */
export type PaymentFrequency = z.infer<typeof paymentFrequencySchema>;

/**
 * TypeScript type for payment plan
 */
export type PaymentPlan = z.infer<typeof paymentPlanSchema>;
