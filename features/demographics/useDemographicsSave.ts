/**
 * useDemographicsSave hook for persisting parent and child data to backend
 *
 * Provides GraphQL mutation functions for saving parent and child demographics
 * to the Rails backend. Integrates with the existing localStorage auto-save
 * while also persisting to the database.
 */
"use client";

import * as React from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

/**
 * GraphQL mutation for submitting parent/guardian information
 */
const SUBMIT_PARENT_INFO = gql`
  mutation SubmitParentInfo(
    $session_id: ID!
    $parent_info: ParentInput!
  ) {
    submitParentInfo(
      sessionId: $session_id
      parentInfo: $parent_info
    ) {
      parent {
        id
        first_name
        last_name
        email
        phone
        relationship
        is_guardian
      }
      errors
    }
  }
`;

/**
 * GraphQL mutation for submitting child information
 */
const SUBMIT_CHILD_INFO = gql`
  mutation SubmitChildInfo(
    $session_id: ID!
    $child_info: ChildInput!
  ) {
    submitChildInfo(
      sessionId: $session_id
      childInfo: $child_info
    ) {
      child {
        id
        first_name
        last_name
        date_of_birth
        gender
        school_name
        grade
        primary_concerns
      }
      session {
        id
        status
      }
      errors
    }
  }
`;

/**
 * Parent info input for GraphQL mutation
 */
export interface ParentInfoData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  relationship: string;
  isGuardian: boolean;
}

/**
 * Child info input for GraphQL mutation
 */
export interface ChildInfoData {
  firstName: string;
  lastName?: string;
  dateOfBirth: string; // ISO 8601 format YYYY-MM-DD
  gender?: string;
  schoolName?: string;
  grade?: string;
  primaryConcerns?: string;
}

/**
 * Save status states
 */
export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Return type for useDemographicsSave hook
 */
export interface UseDemographicsSaveReturn {
  /** Save parent info to backend */
  saveParentInfo: (data: ParentInfoData) => Promise<{ success: boolean; errors: string[] }>;
  /** Save child info to backend */
  saveChildInfo: (data: ChildInfoData) => Promise<{ success: boolean; errors: string[] }>;
  /** Current save status for parent */
  parentSaveStatus: SaveStatus;
  /** Current save status for child */
  childSaveStatus: SaveStatus;
  /** Error message if save failed */
  error: string | null;
  /** Clear error state */
  clearError: () => void;
}

/**
 * Options for useDemographicsSave hook
 */
export interface UseDemographicsSaveOptions {
  /** Session ID for mutations */
  sessionId: string;
  /** Callback when parent info saved successfully */
  onParentSaveSuccess?: () => void;
  /** Callback when child info saved successfully */
  onChildSaveSuccess?: () => void;
  /** Callback when save fails */
  onError?: (error: string) => void;
}

/**
 * Parent mutation response type
 */
interface SubmitParentInfoResponse {
  submitParentInfo: {
    parent: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      relationship: string;
      is_guardian: boolean;
    } | null;
    errors: string[];
  };
}

/**
 * Child mutation response type
 */
interface SubmitChildInfoResponse {
  submitChildInfo: {
    child: {
      id: string;
      first_name: string;
      last_name: string;
      date_of_birth: string;
      gender: string | null;
      school_name: string | null;
      grade: string | null;
      primary_concerns: string | null;
    } | null;
    session: {
      id: string;
      status: string;
    } | null;
    errors: string[];
  };
}

/**
 * Hook for saving demographics data to the backend
 *
 * Features:
 * - GraphQL mutations for parent and child info
 * - Status tracking for UI feedback
 * - Error handling with user-friendly messages
 * - Callback support for success/error handling
 *
 * @param options - Configuration options
 * @returns Save functions and status
 *
 * @example
 * const { saveParentInfo, saveChildInfo, parentSaveStatus, childSaveStatus } = useDemographicsSave({
 *   sessionId,
 *   onParentSaveSuccess: () => console.log('Parent info saved!'),
 *   onChildSaveSuccess: () => console.log('Child info saved!'),
 * });
 */
export function useDemographicsSave({
  sessionId,
  onParentSaveSuccess,
  onChildSaveSuccess,
  onError,
}: UseDemographicsSaveOptions): UseDemographicsSaveReturn {
  const [parentSaveStatus, setParentSaveStatus] = React.useState<SaveStatus>("idle");
  const [childSaveStatus, setChildSaveStatus] = React.useState<SaveStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);

  // GraphQL mutations
  const [submitParentMutation] = useMutation<SubmitParentInfoResponse>(SUBMIT_PARENT_INFO);
  const [submitChildMutation] = useMutation<SubmitChildInfoResponse>(SUBMIT_CHILD_INFO);

  /**
   * Format phone number to E.164 format
   * Converts various formats like (555) 123-4567 or 555-123-4567 to +15551234567
   */
  const formatPhoneToE164 = React.useCallback((phone: string): string => {
    // Remove all non-numeric characters
    const digits = phone.replace(/\D/g, "");

    // If it already has 11 digits starting with 1, format it
    if (digits.length === 11 && digits.startsWith("1")) {
      return `+${digits}`;
    }

    // If it has 10 digits, assume US and add +1
    if (digits.length === 10) {
      return `+1${digits}`;
    }

    // Return original with + prefix if it looks like international
    return digits.startsWith("+") ? phone : `+${digits}`;
  }, []);

  /**
   * Save parent info to backend
   */
  const saveParentInfo = React.useCallback(
    async (data: ParentInfoData): Promise<{ success: boolean; errors: string[] }> => {
      setParentSaveStatus("saving");
      setError(null);

      try {
        const result = await submitParentMutation({
          variables: {
            session_id: sessionId,
            parent_info: {
              first_name: data.firstName,
              last_name: data.lastName,
              email: data.email,
              phone: formatPhoneToE164(data.phone),
              relationship: data.relationship.toLowerCase(),
              is_guardian: data.isGuardian,
            },
          },
        });

        const response = result.data?.submitParentInfo;
        const errors = response?.errors || [];

        if (errors.length > 0) {
          const errorMessage = errors.join(", ");
          setError(errorMessage);
          setParentSaveStatus("error");
          onError?.(errorMessage);
          return { success: false, errors };
        }

        setParentSaveStatus("saved");
        onParentSaveSuccess?.();

        // Also save to localStorage for backup
        saveToLocalStorage("parent", data);

        // Reset status after brief success indication
        setTimeout(() => setParentSaveStatus("idle"), 2000);

        return { success: true, errors: [] };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to save parent information";
        setError(errorMessage);
        setParentSaveStatus("error");
        onError?.(errorMessage);
        return { success: false, errors: [errorMessage] };
      }
    },
    [sessionId, submitParentMutation, formatPhoneToE164, onParentSaveSuccess, onError]
  );

  /**
   * Save child info to backend
   */
  const saveChildInfo = React.useCallback(
    async (data: ChildInfoData): Promise<{ success: boolean; errors: string[] }> => {
      setChildSaveStatus("saving");
      setError(null);

      try {
        // dateOfBirth should already be in ISO 8601 format (YYYY-MM-DD)
        const dateOfBirth = data.dateOfBirth;

        const result = await submitChildMutation({
          variables: {
            session_id: sessionId,
            child_info: {
              first_name: data.firstName,
              last_name: data.lastName || "",
              date_of_birth: dateOfBirth,
              gender: data.gender || null,
              school_name: data.schoolName || null,
              grade: data.grade || null,
              primary_concerns: data.primaryConcerns || null,
            },
          },
        });

        const response = result.data?.submitChildInfo;
        const errors = response?.errors || [];

        if (errors.length > 0) {
          const errorMessage = errors.join(", ");
          setError(errorMessage);
          setChildSaveStatus("error");
          onError?.(errorMessage);
          return { success: false, errors };
        }

        setChildSaveStatus("saved");
        onChildSaveSuccess?.();

        // Also save to localStorage for backup
        saveToLocalStorage("child", data);

        // Reset status after brief success indication
        setTimeout(() => setChildSaveStatus("idle"), 2000);

        return { success: true, errors: [] };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to save child information";
        setError(errorMessage);
        setChildSaveStatus("error");
        onError?.(errorMessage);
        return { success: false, errors: [errorMessage] };
      }
    },
    [sessionId, submitChildMutation, onChildSaveSuccess, onError]
  );

  /**
   * Save data to localStorage for backup/resume functionality
   */
  const saveToLocalStorage = React.useCallback(
    (type: "parent" | "child", data: ParentInfoData | ChildInfoData) => {
      try {
        const storageKey = `onboarding_session_${sessionId}`;
        const existing = localStorage.getItem(storageKey);
        const parsed = existing ? JSON.parse(existing) : { data: {} };
        parsed.data[type] = data;
        parsed.savedAt = new Date().toISOString();
        localStorage.setItem(storageKey, JSON.stringify(parsed));
      } catch (storageError) {
        console.warn("Failed to save to localStorage:", storageError);
      }
    },
    [sessionId]
  );

  /**
   * Clear error state
   */
  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    saveParentInfo,
    saveChildInfo,
    parentSaveStatus,
    childSaveStatus,
    error,
    clearError,
  };
}
