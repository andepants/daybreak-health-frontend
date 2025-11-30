/**
 * Type definitions for Intercom support chat integration
 *
 * Defines TypeScript interfaces for Intercom user attributes and context data.
 * All types are designed to exclude PHI (Protected Health Information).
 */

/**
 * Onboarding step identifier
 * Maps to user's current position in the onboarding flow
 */
export type OnboardingStep =
  | 'assessment'
  | 'demographics'
  | 'insurance'
  | 'matching'
  | 'scheduling'
  | 'complete';

/**
 * User attributes passed to Intercom
 *
 * These attributes provide context to support staff without exposing PHI.
 * All fields are optional to handle early onboarding stages gracefully.
 *
 * PHI Protection:
 * - No clinical assessment details
 * - No date of birth or age
 * - No specific concerns or symptoms
 * - Only non-sensitive identifiers and flags
 */
export interface IntercomUserAttributes {
  /** Parent's full name (if collected) */
  name?: string;

  /** Parent's email address */
  email?: string;

  /** Current step in onboarding flow */
  onboarding_step: OnboardingStep;

  /** Session ID for backend lookup */
  session_id: string;

  /** Child's first name (non-PHI context) */
  child_first_name?: string;

  /** Whether assessment has been completed */
  assessment_complete: boolean;

  /** Whether insurance information has been submitted */
  insurance_submitted: boolean;

  /** Whether therapist has been matched */
  therapist_matched?: boolean;

  /** Whether first appointment has been scheduled */
  appointment_scheduled?: boolean;

  /** Allow additional custom attributes */
  [key: string]: unknown;
}

/**
 * Configuration options for Intercom context updates
 */
export interface IntercomContextOptions {
  /** Whether to log context updates (for debugging) */
  enableLogging?: boolean;

  /** Whether to validate no PHI before sending */
  validateNoPHI?: boolean;
}
