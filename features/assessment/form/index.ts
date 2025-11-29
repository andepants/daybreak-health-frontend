/**
 * Form-based assessment module exports
 *
 * Provides components, hooks, and utilities for the traditional form-based
 * assessment fallback per Story 3.4.
 */

// Components
export { FormProgress } from "./components/FormProgress";
export { FormNavigation } from "./components/FormNavigation";
export { SaveIndicator } from "./components/SaveIndicator";
export { Page1AboutYourChild } from "./components/Page1AboutYourChild";
export { Page2DailyLifeImpact } from "./components/Page2DailyLifeImpact";
export { Page3AdditionalContext } from "./components/Page3AdditionalContext";

// Component prop types
export type { FormProgressProps } from "./components/FormProgress";
export type { FormNavigationProps } from "./components/FormNavigation";
export type { SaveIndicatorProps } from "./components/SaveIndicator";
export type { Page1AboutYourChildProps } from "./components/Page1AboutYourChild";
export type { Page2DailyLifeImpactProps } from "./components/Page2DailyLifeImpact";
export type { Page3AdditionalContextProps } from "./components/Page3AdditionalContext";

// Hooks
export { useFormAutoSave } from "./hooks/useFormAutoSave";
export { useFormNavigation } from "./hooks/useFormNavigation";

// Hook types
export type {
  UseFormAutoSaveOptions,
  UseFormAutoSaveReturn,
  SaveStatus,
} from "./hooks/useFormAutoSave";
export type {
  UseFormNavigationOptions,
  UseFormNavigationReturn,
} from "./hooks/useFormNavigation";

// Utilities
export { formToSummary, formatSummaryForDisplay } from "./utils/formToSummary";
export {
  chatToFormMapper,
  loadFormDataFromStorage,
  loadChatDataFromStorage,
} from "./utils/chatToFormMapper";

// Utility types
export type { AssessmentSummary } from "./utils/formToSummary";
export type { ChatMessage, ChatAssessmentData } from "./utils/chatToFormMapper";
