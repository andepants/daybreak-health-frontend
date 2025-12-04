/**
 * usePatientAvailability Hook
 *
 * Custom hook for managing patient availability submission via GraphQL mutation.
 * Handles mutation state, localStorage backup, and error management.
 *
 * Features:
 * - Apollo Client useMutation wrapper
 * - localStorage backup for recovery
 * - Error handling with user-friendly messages
 * - Type-safe mutation interface
 *
 * @module features/availability/usePatientAvailability
 */

"use client";

import * as React from "react";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import type { TimeBlock } from "@/lib/validations/availability";

/**
 * GraphQL mutation for submitting patient availability
 * Uses JWT auth to identify the session - no need to pass sessionId
 */
const SUBMIT_PATIENT_AVAILABILITY = gql`
  mutation SubmitPatientAvailability(
    $availabilities: [PatientAvailabilityInput!]!
    $timezone: String!
  ) {
    submitPatientAvailability(
      input: { availabilities: $availabilities, timezone: $timezone }
    ) {
      success
      patientAvailabilities {
        id
        dayOfWeek
        dayName
        startTime
        durationMinutes
      }
      errors
    }
  }
`;

/**
 * GraphQL query for getting existing patient availability
 */
const GET_PATIENT_AVAILABILITY = gql`
  query GetPatientAvailability($sessionId: ID!) {
    patientAvailability(sessionId: $sessionId) {
      id
      dayOfWeek
      dayName
      startTime
      durationMinutes
      timezone
    }
  }
`;

/**
 * Type for the query result
 */
interface PatientAvailabilityQueryResult {
  patientAvailability: Array<{
    id: string;
    dayOfWeek: number;
    dayName: string;
    startTime: string;
    durationMinutes: number;
    timezone: string;
  }>;
}

/**
 * Type for the mutation result
 */
interface SubmitPatientAvailabilityResult {
  submitPatientAvailability: {
    success: boolean;
    patientAvailabilities: Array<{
      id: string;
      dayOfWeek: number;
      dayName: string;
      startTime: string;
      durationMinutes: number;
    }> | null;
    errors: string[];
  };
}

/**
 * Hook options
 */
export interface UsePatientAvailabilityOptions {
  /** Onboarding session ID */
  sessionId: string;
  /** Called on successful submission */
  onSuccess?: () => void;
  /** Called on error */
  onError?: (error: string) => void;
}

/**
 * Hook return type
 */
export interface UsePatientAvailabilityResult {
  /** Submit availability to backend */
  submitAvailability: (
    availabilities: TimeBlock[],
    timezone: string
  ) => Promise<{ success: boolean; errors: string[] }>;
  /** Whether submission is in progress */
  isSubmitting: boolean;
  /** Load existing availability from API */
  existingAvailability: TimeBlock[] | null;
  /** Whether loading existing availability */
  isLoading: boolean;
}

/**
 * Custom hook for managing patient availability
 *
 * Handles GraphQL mutation for submitting availability blocks,
 * with localStorage backup for recovery on page refresh.
 *
 * @example
 * const { submitAvailability, isSubmitting } = usePatientAvailability({
 *   sessionId,
 *   onSuccess: () => router.push('/matching'),
 *   onError: (error) => toast.error(error),
 * });
 */
export function usePatientAvailability({
  sessionId,
  onSuccess,
  onError,
}: UsePatientAvailabilityOptions): UsePatientAvailabilityResult {
  // GraphQL mutation
  const [submitMutation, { loading: isSubmitting }] = useMutation<SubmitPatientAvailabilityResult>(
    SUBMIT_PATIENT_AVAILABILITY
  );

  // GraphQL query for existing availability
  const { data: existingData, loading: isLoading } = useQuery<PatientAvailabilityQueryResult>(
    GET_PATIENT_AVAILABILITY,
    {
      variables: { sessionId },
      fetchPolicy: "cache-and-network",
    }
  );

  // Convert API response to TimeBlock array
  const existingAvailability: TimeBlock[] | null = React.useMemo(() => {
    if (!existingData?.patientAvailability?.length) return null;

    return existingData.patientAvailability.map(
      (avail: {
        dayOfWeek: number;
        startTime: string;
        durationMinutes: number;
      }) => ({
        dayOfWeek: avail.dayOfWeek,
        startTime: avail.startTime,
        durationMinutes: avail.durationMinutes,
      })
    );
  }, [existingData]);

  /**
   * Submit availability to backend
   */
  const submitAvailability = React.useCallback(
    async (
      availabilities: TimeBlock[],
      timezone: string
    ): Promise<{ success: boolean; errors: string[] }> => {
      try {
        // Format availabilities for GraphQL input
        const formattedAvailabilities = availabilities.map((a) => ({
          day_of_week: a.dayOfWeek,
          start_time: a.startTime,
          duration_minutes: a.durationMinutes,
        }));

        const result = await submitMutation({
          variables: {
            availabilities: formattedAvailabilities,
            timezone,
          },
        });

        const response = result.data?.submitPatientAvailability;

        if (response?.success) {
          // Save to localStorage as backup
          saveToLocalStorage(sessionId, availabilities, timezone);
          onSuccess?.();
          return { success: true, errors: [] };
        }

        const errors = response?.errors || ["Failed to save availability"];
        onError?.(errors.join(", "));
        return { success: false, errors };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to save availability";
        onError?.(message);
        return { success: false, errors: [message] };
      }
    },
    [sessionId, submitMutation, onSuccess, onError]
  );

  return {
    submitAvailability,
    isSubmitting,
    existingAvailability,
    isLoading,
  };
}

/**
 * Save availability to localStorage for recovery
 */
function saveToLocalStorage(
  sessionId: string,
  availabilities: TimeBlock[],
  timezone: string
): void {
  try {
    const key = `onboarding_session_${sessionId}`;
    const existingStr = localStorage.getItem(key);
    const existing = existingStr ? JSON.parse(existingStr) : { data: {} };

    existing.data.availability = { availabilities, timezone };
    existing.savedAt = new Date().toISOString();

    localStorage.setItem(key, JSON.stringify(existing));
  } catch {
    console.warn("Failed to save availability to localStorage");
  }
}

/**
 * Load availability from localStorage
 */
export function loadFromLocalStorage(
  sessionId: string
): { availabilities: TimeBlock[]; timezone: string } | null {
  try {
    const key = `onboarding_session_${sessionId}`;
    const stored = localStorage.getItem(key);

    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return parsed?.data?.availability || null;
  } catch {
    return null;
  }
}
