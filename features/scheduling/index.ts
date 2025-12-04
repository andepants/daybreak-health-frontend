/**
 * Scheduling Feature
 *
 * Components and utilities for appointment scheduling, booking, and confirmation flows.
 *
 * Scheduling Components:
 * - ScheduleContainer: Main orchestration component for recommended time slots
 * - RecommendedTimeSlots: Curated list of best-matching appointment times
 * - AppointmentCalendar: Calendar for selecting appointment date (legacy)
 * - TimeSlotPicker: Grid of available time slots (legacy)
 * - SessionDetails: Display session information and therapist details
 * - TimezoneSelector: Timezone selection dropdown with auto-detection
 *
 * Booking Confirmation Components:
 * - BookingReview: Review appointment details before confirming
 * - BookingProcessingState: Loading state during booking
 * - BookingSuccess: Success page with confetti and details
 * - AppointmentDetailsCard: Card showing appointment info
 * - CalendarLinks: Add to calendar buttons
 * - WhatsNext: Next steps information
 * - EmailConfirmationMessage: Email confirmation status display
 *
 * @module features/scheduling
 */

// Scheduling Components
export { ScheduleContainer } from "./ScheduleContainer";
export type { ScheduleContainerProps } from "./ScheduleContainer";

export { RecommendedTimeSlots } from "./RecommendedTimeSlots";
export type { RecommendedTimeSlotsProps } from "./RecommendedTimeSlots";

export { AppointmentCalendar } from "./AppointmentCalendar";
export type { AppointmentCalendarProps } from "./AppointmentCalendar";

export { TimeSlotPicker } from "./TimeSlotPicker";
export type { TimeSlotPickerProps, TimeSlot } from "./TimeSlotPicker";

export { SessionDetails } from "./SessionDetails";
export type { SessionDetailsProps } from "./SessionDetails";

export { TimezoneSelector, useDetectedTimezone } from "./TimezoneSelector";
export type { TimezoneSelectorProps } from "./TimezoneSelector";

// Booking Confirmation Components
export { Confirmation } from "./Confirmation";
export type { ConfirmationProps, BookingRequest } from "./Confirmation";
export { BookingReview } from "./BookingReview";
export type { BookingReviewProps } from "./BookingReview";
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
export { EmailConfirmationMessage } from "./EmailConfirmationMessage";
export type {
  EmailConfirmationMessageProps,
  EmailConfirmationStatus,
} from "./EmailConfirmationMessage";

// Hooks
export { useBooking } from "./useBooking";
export type { UseBookingResult, BookAppointmentInput } from "./useBooking";
