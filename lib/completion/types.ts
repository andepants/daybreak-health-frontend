/**
 * Type definitions for onboarding completion tracking
 *
 * Provides strongly-typed interfaces for tracking field-level
 * and section-level completion status throughout the onboarding flow.
 */

/**
 * Step identifiers matching OnboardingProgress component
 */
export type StepId = "assessment" | "info" | "insurance" | "match" | "book";

/**
 * Completion status for a single form field
 */
export interface FieldCompletionStatus {
  /** Field identifier (e.g., "primaryConcerns", "parent.firstName") */
  fieldName: string;
  /** Human-readable label for display */
  displayLabel: string;
  /** Whether the field has a valid value */
  isComplete: boolean;
  /** Whether the field is required for section completion */
  isRequired: boolean;
  /** Which section this field belongs to */
  section: StepId;
  /** Page number within the section (for multi-page forms like assessment) */
  page?: number;
}

/**
 * Completion status for a section/step
 */
export interface SectionCompletionStatus {
  /** Section identifier */
  sectionId: StepId;
  /** Whether all required fields are complete */
  isComplete: boolean;
  /** Percentage of required fields completed (0-100) */
  percentComplete: number;
  /** Count of completed required fields */
  requiredFieldsComplete: number;
  /** Total count of required fields */
  requiredFieldsTotal: number;
  /** Count of completed optional fields */
  optionalFieldsComplete: number;
  /** Total count of optional fields */
  optionalFieldsTotal: number;
  /** List of missing required fields */
  missingRequiredFields: FieldCompletionStatus[];
  /** List of completed required fields */
  completedRequiredFields: FieldCompletionStatus[];
}

/**
 * Full onboarding completion state
 */
export interface OnboardingCompletionState {
  /** Session identifier */
  sessionId: string;
  /** Completion status per section */
  sections: Record<StepId, SectionCompletionStatus>;
  /** Overall completion percentage across all sections */
  overallPercentComplete: number;
  /** Whether all prerequisites for matching are satisfied */
  canProceedToMatching: boolean;
  /** Human-readable list of what's blocking matching */
  matchingBlockers: string[];
  /** Timestamp of last calculation */
  lastUpdated: string;
}

/**
 * Field configuration for validation
 */
export interface FieldConfig {
  /** Field path in localStorage data (e.g., "parent.firstName") */
  path: string;
  /** Human-readable display label */
  displayLabel: string;
  /** Section this field belongs to */
  section: StepId;
  /** Whether field is required */
  isRequired: boolean;
  /** Page number for multi-page forms */
  page?: number;
  /** Custom validation function (returns true if valid) */
  validate?: (value: unknown) => boolean;
}

/**
 * Backend-verified completion status
 *
 * Derived from actual GraphQL session query, not localStorage.
 * Used to detect when frontend shows "complete" but backend is missing data.
 */
export interface BackendCompletionStatus {
  /** Progress percentage from backend (0-100) */
  percentage: number;
  /** Completed phases from backend Progress type */
  completedPhases: string[];
  /** Current phase from backend */
  currentPhase: string;
  /** Whether parent record exists in database */
  hasParent: boolean;
  /** Whether child record exists in database */
  hasChild: boolean;
  /** Whether assessment is marked complete in backend */
  hasAssessment: boolean;
  /** Whether insurance/self-pay is complete in backend */
  hasInsurance: boolean;
  /** Query loading state */
  loading: boolean;
  /** Query error if any */
  error: Error | undefined;
  /** Whether all prerequisites for matching exist in backend */
  canProceedToMatching: boolean;
  /** Human-readable list of what's missing from backend */
  missingBackendData: string[];
  /** Function to refetch backend status */
  refetch: () => void;
}
