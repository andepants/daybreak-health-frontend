/**
 * Scheduling Feature
 *
 * Components and utilities for appointment booking confirmation and success flows.
 *
 * Exports:
 * - BookingProcessingState: Loading state during booking
 * - BookingSuccess: Success page with confetti and details
 * - AppointmentDetailsCard: Card showing appointment info
 * - CalendarLinks: Add to calendar buttons
 * - WhatsNext: Next steps information
 *
 * @module features/scheduling
 */

export { BookingProcessingState } from "./BookingProcessingState";
export { BookingSuccess } from "./BookingSuccess";
export type { BookingSuccessProps, AppointmentData } from "./BookingSuccess";
export { AppointmentDetailsCard } from "./AppointmentDetailsCard";
export type {
  AppointmentDetailsCardProps,
  TherapistInfo,
} from "./AppointmentDetailsCard";
export { CalendarLinks } from "./CalendarLinks";
export type { CalendarLinksProps } from "./CalendarLinks";
export { WhatsNext } from "./WhatsNext";
export type { WhatsNextProps } from "./WhatsNext";
