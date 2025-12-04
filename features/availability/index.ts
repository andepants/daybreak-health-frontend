/**
 * Patient availability feature exports
 *
 * This feature provides components and hooks for collecting patient
 * availability during onboarding. The availability data is used by
 * the AI matching service to find therapists with overlapping schedules.
 *
 * @module features/availability
 */

export { AvailabilityForm } from "./AvailabilityForm";
export type { AvailabilityFormProps } from "./AvailabilityForm";

export {
  usePatientAvailability,
  loadFromLocalStorage,
} from "./usePatientAvailability";
export type {
  UsePatientAvailabilityOptions,
  UsePatientAvailabilityResult,
} from "./usePatientAvailability";
