/**
 * useBooking Hook
 *
 * Custom hook for managing appointment booking via GraphQL mutation.
 * Handles mutation state, optimistic responses, and error management.
 * Maps between component interface and GraphQL types.
 *
 * Features:
 * - Apollo Client useMutation wrapper
 * - Optimistic UI updates
 * - Error handling
 * - Type-safe mutation interface
 * - Field mapping between component/GraphQL types
 *
 * @module features/scheduling/useBooking
 */

"use client";

import type { ErrorLike } from "@apollo/client";
import type { AppointmentData } from "./BookingSuccess";
import { useBookAppointmentMutation } from "@/types/graphql";

/**
 * Input variables for booking (component interface)
 * These are mapped to GraphQL input types internally
 */
export interface BookAppointmentInput {
  /** Session ID from matching flow */
  sessionId: string;
  /** Selected therapist ID */
  therapistId: string;
  /** Appointment start time (ISO string) */
  startTime: string;
  /** Appointment end time (ISO string) */
  endTime: string;
  /** Appointment duration in minutes (optional, defaults to 50) */
  duration?: number;
  /** User's timezone (optional) */
  timezone?: string;
}

/**
 * Email confirmation status information
 */
export interface EmailConfirmationStatus {
  /** Whether confirmation email was sent */
  emailSent: boolean;
  /** Email delivery status: "sent", "pending", "failed" */
  emailStatus: string;
  /** Email address where confirmation was sent */
  recipientEmail?: string;
}

/**
 * Hook return type
 */
export interface UseBookingResult {
  /** Executes the booking mutation */
  bookAppointment: (input: BookAppointmentInput) => Promise<void>;
  /** Loading state */
  loading: boolean;
  /** Error state from Apollo Client mutation */
  error: ErrorLike | undefined;
  /** Booked appointment data (null if not yet booked) */
  appointment: AppointmentData | null;
  /** Email confirmation status */
  emailConfirmation: EmailConfirmationStatus | null;
}

/**
 * Calculates end time from start time and duration
 *
 * @param startTime - ISO date string for start time
 * @param durationMinutes - Duration in minutes
 * @returns ISO date string for end time
 */
function calculateEndTime(startTime: string, durationMinutes: number): string {
  const start = new Date(startTime);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return end.toISOString();
}

/**
 * Custom hook for booking appointments
 *
 * Manages the GraphQL mutation for creating appointment bookings.
 * Provides loading, error, and success states with type safety.
 *
 * Field Mapping:
 * - Component `startTime` → GraphQL `scheduledAt`
 * - Component `duration` → GraphQL `durationMinutes`
 * - GraphQL `virtualLink` → Component `meetingUrl`
 * - GraphQL `fullName` → Component `name`
 * - GraphQL `licenseType` → Component `credentials`
 *
 * Optimistic Response:
 * - Immediately returns expected data structure
 * - Allows instant UI feedback
 * - Reverts on error
 *
 * Error Handling:
 * - Network errors
 * - GraphQL errors
 * - Validation errors
 *
 * @example
 * const { bookAppointment, loading, error, appointment } = useBooking();
 *
 * async function handleBooking() {
 *   await bookAppointment({
 *     sessionId: "session-123",
 *     therapistId: "therapist-456",
 *     startTime: "2024-01-15T14:00:00Z",
 *     endTime: "2024-01-15T14:50:00Z",
 *     duration: 50
 *   });
 * }
 *
 * if (loading) return <Loading />;
 * if (error) return <Error error={error} />;
 * if (appointment) return <Success appointment={appointment} />;
 */
export function useBooking(): UseBookingResult {
  const [mutate, { loading, error, data }] = useBookAppointmentMutation();

  /**
   * Executes the booking mutation with optimistic response
   * Maps component input fields to GraphQL input types
   *
   * @param input - Booking details (component format)
   * @throws Error if mutation fails
   */
  async function bookAppointment(input: BookAppointmentInput): Promise<void> {
    const durationMinutes = input.duration || 50;

    await mutate({
      variables: {
        input: {
          sessionId: input.sessionId,
          therapistId: input.therapistId,
          scheduledAt: input.startTime,
          durationMinutes,
        },
      },
      optimisticResponse: {
        bookAppointment: {
          __typename: "BookAppointmentPayload",
          appointment: {
            __typename: "Appointment",
            id: "temp-id-" + Date.now(),
            onboardingSessionId: input.sessionId,
            scheduledAt: input.startTime,
            durationMinutes,
            status: "confirmed",
            virtualLink: null,
            confirmationNumber: "TEMP-" + Date.now(),
            therapist: {
              __typename: "Therapist",
              id: input.therapistId,
              fullName: "Loading...",
              licenseType: null,
              photoUrl: null,
            },
          },
          success: true,
          errors: [],
        },
      },
    });
  }

  /**
   * Transform GraphQL response to AppointmentData format
   * Maps GraphQL field names to component field names
   */
  const appointment: AppointmentData | null = data?.bookAppointment?.appointment
    ? {
        id: data.bookAppointment.appointment.id,
        therapist: {
          id: data.bookAppointment.appointment.therapist.id,
          name: data.bookAppointment.appointment.therapist.fullName,
          credentials: data.bookAppointment.appointment.therapist.licenseType || "",
          photoUrl: data.bookAppointment.appointment.therapist.photoUrl,
        },
        startTime: data.bookAppointment.appointment.scheduledAt,
        endTime: calculateEndTime(
          data.bookAppointment.appointment.scheduledAt,
          data.bookAppointment.appointment.durationMinutes
        ),
        duration: data.bookAppointment.appointment.durationMinutes,
        meetingUrl: data.bookAppointment.appointment.virtualLink || undefined,
      }
    : null;

  /**
   * Extract email confirmation status from mutation response
   *
   * Default behavior (until backend implements email fields):
   * - Assumes email was sent successfully if booking succeeded
   * - Uses "sent" status by default
   */
  const emailConfirmation: EmailConfirmationStatus | null = data?.bookAppointment
    ? {
        emailSent: true,
        emailStatus: "sent",
        recipientEmail: undefined,
      }
    : null;

  return {
    bookAppointment,
    loading,
    error,
    appointment,
    emailConfirmation,
  };
}
