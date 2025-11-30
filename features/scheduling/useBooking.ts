/**
 * useBooking Hook
 *
 * Custom hook for managing appointment booking via GraphQL mutation.
 * Handles mutation state, optimistic responses, and error management.
 *
 * Features:
 * - Apollo Client useMutation wrapper
 * - Optimistic UI updates
 * - Error handling
 * - Type-safe mutation interface
 *
 * @module features/scheduling/useBooking
 */

"use client";

import type { ErrorLike } from "@apollo/client";
import * as ApolloReactHooks from "@apollo/client/react";
import { gql } from "@apollo/client";
import type { AppointmentData } from "./BookingSuccess";

// TODO: Replace with generated hook after running codegen
// This is a temporary stub until useBookAppointmentMutation is generated
// Run: npm run codegen
// import { useBookAppointmentMutation } from "@/types/graphql";

/**
 * Temporary stub for useBookAppointmentMutation
 * This provides type-safe mutation interface until GraphQL codegen is run
 */
function useBookAppointmentMutation() {
  // This is a stub that returns the expected mutation hook shape
  // In production, this will be replaced by the generated hook
  type MutationResult = {
    loading: boolean;
    error: ErrorLike | undefined;
    data: BookAppointmentResponse | undefined;
  };

  type MutationFunction = (options: {
    variables: BookAppointmentVariables;
    optimisticResponse?: any;
  }) => Promise<any>;

  const result: [MutationFunction, MutationResult] = [
    async () => ({ data: null }),
    { loading: false, error: undefined, data: undefined }
  ];

  return result;
}

/**
 * Input variables for booking mutation
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
 * GraphQL mutation response structure
 *
 * Note: Email status fields (emailSent, emailStatus, recipientEmail) are pending
 * backend implementation. See BookAppointment.graphql for details.
 */
interface BookAppointmentResponse {
  bookAppointment: {
    appointment: {
      id: string;
      sessionId: string;
      therapistId: string;
      startTime: string;
      endTime: string;
      duration: number;
      status: string;
      meetingUrl?: string | null;
      therapist: {
        id: string;
        name: string;
        credentials: string;
        photoUrl?: string | null;
      };
    };
    success: boolean;
    message?: string | null;
    // TODO: Backend to implement these fields (Story 5.5)
    emailSent?: boolean;
    emailStatus?: string | null;
    recipientEmail?: string | null;
  };
}

/**
 * GraphQL mutation variables structure
 */
interface BookAppointmentVariables {
  input: BookAppointmentInput;
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
  /** Error state (ErrorLike type from Apollo Client mutation) */
  error: ErrorLike | undefined;
  /** Booked appointment data (null if not yet booked) */
  appointment: AppointmentData | null;
  /** Email confirmation status */
  emailConfirmation: EmailConfirmationStatus | null;
}

/**
 * Custom hook for booking appointments
 *
 * Manages the GraphQL mutation for creating appointment bookings.
 * Provides loading, error, and success states with type safety.
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
   *
   * @param input - Booking details
   * @throws Error if mutation fails
   */
  async function bookAppointment(input: BookAppointmentInput): Promise<void> {
    await mutate({
      variables: { input },
      // Optimistic response for instant UI feedback
      optimisticResponse: {
        bookAppointment: {
          __typename: "BookAppointmentPayload",
          appointment: {
            __typename: "Appointment",
            id: "temp-id-" + Date.now(),
            sessionId: input.sessionId,
            therapistId: input.therapistId,
            startTime: input.startTime,
            endTime: input.endTime,
            duration: input.duration || 50,
            status: "confirmed",
            meetingUrl: null,
            therapist: {
              __typename: "Therapist",
              id: input.therapistId,
              name: "Loading...",
              credentials: "",
              photoUrl: null,
            },
          },
          success: true,
          message: null,
        },
      },
    });
  }

  /**
   * Transform GraphQL response to AppointmentData format
   */
  const appointment: AppointmentData | null = data?.bookAppointment?.appointment
    ? {
        id: data.bookAppointment.appointment.id,
        therapist: {
          id: data.bookAppointment.appointment.therapist.id,
          name: data.bookAppointment.appointment.therapist.name,
          credentials: data.bookAppointment.appointment.therapist.credentials,
          photoUrl: data.bookAppointment.appointment.therapist.photoUrl,
        },
        startTime: data.bookAppointment.appointment.startTime,
        endTime: data.bookAppointment.appointment.endTime,
        duration: data.bookAppointment.appointment.duration,
        meetingUrl: data.bookAppointment.appointment.meetingUrl || undefined,
      }
    : null;

  /**
   * Extract email confirmation status from mutation response
   *
   * Default behavior (until backend implements):
   * - Assumes email was sent successfully if booking succeeded
   * - Uses "sent" status when backend doesn't provide emailStatus
   * - Falls back gracefully when email fields are missing
   */
  const emailConfirmation: EmailConfirmationStatus | null = data?.bookAppointment
    ? {
        emailSent: data.bookAppointment.emailSent ?? true,
        emailStatus: data.bookAppointment.emailStatus ?? "sent",
        recipientEmail: data.bookAppointment.recipientEmail ?? undefined,
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
