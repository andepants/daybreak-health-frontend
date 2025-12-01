/**
 * Onboarding Completion Tracking Module
 *
 * Provides centralized tracking of form completion status across
 * the onboarding flow. Used by navigation progress indicators
 * and form validation UI.
 *
 * @example
 * ```tsx
 * import { useCompletionStatus, notifyCompletionUpdate } from "@/lib/completion";
 *
 * // In a component
 * const { sections, canProceedToMatching, matchingBlockers } = useCompletionStatus({
 *   sessionId
 * });
 *
 * // After saving data
 * notifyCompletionUpdate();
 * ```
 */

export * from "./types";
export * from "./field-config";
export {
  useCompletionStatus,
  notifyCompletionUpdate,
  ONBOARDING_DATA_UPDATED_EVENT,
} from "./useCompletionStatus";
export { useBackendCompletionStatus } from "./useBackendCompletionStatus";
