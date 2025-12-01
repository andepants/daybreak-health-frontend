/**
 * Matching feature exports
 *
 * Centralized exports for therapist matching components and utilities
 */

export { TherapistCard } from "./TherapistCard";
export type { TherapistCardProps } from "./TherapistCard";

export { MatchingLoadingState } from "./MatchingLoadingState";
export type { MatchingLoadingStateProps } from "./MatchingLoadingState";

export { MatchRationale } from "./MatchRationale";
export type { MatchRationaleProps } from "./MatchRationale";

export { TherapistMatchResults } from "./TherapistMatchResults";
export type { TherapistMatchResultsProps } from "./TherapistMatchResults";

export { TherapistProfileSheet } from "./TherapistProfileSheet";
export type {
  TherapistProfileSheetProps,
  TherapistProfileData
} from "./TherapistProfileSheet";

export { ProfileMatchSection } from "./ProfileMatchSection";
export type { ProfileMatchSectionProps } from "./ProfileMatchSection";

export { ProfileAvailabilitySection } from "./ProfileAvailabilitySection";
export type {
  ProfileAvailabilitySectionProps,
  AvailabilitySlot
} from "./ProfileAvailabilitySection";

export {
  FALLBACK_THERAPISTS,
  createFallbackResults,
  isFallbackTherapist
} from "./fallbackTherapists";
export type {
  FallbackTherapist,
  FallbackResults,
  FallbackMatchReason
} from "./fallbackTherapists";
