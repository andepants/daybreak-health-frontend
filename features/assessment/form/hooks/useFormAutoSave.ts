/**
 * useFormAutoSave hook for form-based assessment auto-save
 *
 * Provides debounced auto-save functionality with visual feedback
 * for the multi-page assessment form. Saves on field blur with
 * 500ms debounce per AC-3.4.6.
 */
"use client";

import * as React from "react";
import type { FormAssessmentInput } from "@/lib/validations/assessment";

/**
 * Save status states
 */
export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Options for useFormAutoSave hook
 * @param sessionId - Current session ID for saving
 * @param debounceMs - Debounce delay in milliseconds (default 500)
 * @param onSaveSuccess - Optional callback fired after successful save
 * @param onSaveError - Optional callback fired on save error
 */
export interface UseFormAutoSaveOptions {
  sessionId: string;
  debounceMs?: number;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

/**
 * Return type for useFormAutoSave hook
 */
export interface UseFormAutoSaveReturn {
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  error: Error | null;
  saveField: (fieldName: string, data: Partial<FormAssessmentInput>) => void;
  saveAll: (data: Partial<FormAssessmentInput>) => Promise<void>;
  retry: () => void;
}

/**
 * Hook for form-based assessment auto-save
 *
 * Features:
 * - Debounced save on field changes (500ms default)
 * - Field-level save for granular persistence
 * - Full form save for page transitions
 * - Status tracking for UI feedback
 * - Error handling with retry capability
 * - LocalStorage backup for offline resilience
 *
 * @param options - Configuration options
 * @returns Save utilities and status
 *
 * @example
 * const { saveField, saveStatus } = useFormAutoSave({
 *   sessionId,
 *   onSaveSuccess: () => console.log('Saved!'),
 * });
 *
 * // On field blur
 * saveField('primaryConcerns', formValues);
 */
export function useFormAutoSave({
  sessionId,
  debounceMs = 500,
  onSaveSuccess,
  onSaveError,
}: UseFormAutoSaveOptions): UseFormAutoSaveReturn {
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const [pendingData, setPendingData] = React.useState<Partial<FormAssessmentInput> | null>(null);

  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveQueueRef = React.useRef<Partial<FormAssessmentInput>>({});

  /**
   * Persist data to backend (mock implementation)
   * In production, this would call a GraphQL mutation
   */
  const persistData = React.useCallback(
    async (data: Partial<FormAssessmentInput>): Promise<void> => {
      setSaveStatus("saving");
      setError(null);

      try {
        // TODO: Replace with actual GraphQL mutation when backend is ready
        // await saveFormAssessmentMutation({ variables: { sessionId, data } });

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Use unified storage key for consistency with other forms
        const storageKey = `onboarding_session_${sessionId}`;
        let existingSession: Record<string, unknown> = { data: {} };
        let existingFormData: Partial<FormAssessmentInput> = {};

        try {
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            existingSession = JSON.parse(stored);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            existingFormData = (existingSession as any).data?.formAssessment || {};
          }
        } catch {
          // Ignore parse errors
        }

        const merged = { ...existingFormData, ...data };

        try {
          // Store under formAssessment key within unified storage
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              ...existingSession,
              data: {
                ...(existingSession.data || {}),
                formAssessment: merged,
              },
              savedAt: new Date().toISOString(),
            })
          );
        } catch (storageError) {
          if (
            storageError instanceof Error &&
            (storageError.name === "QuotaExceededError" ||
              storageError.message.includes("quota"))
          ) {
            const quotaError = new Error(
              "Storage quota exceeded. Please clear browser data."
            );
            setSaveStatus("error");
            setError(quotaError);
            onSaveError?.(quotaError);
            return;
          }
          // Log generic message to avoid exposing PHI in console
          console.warn("Failed to persist assessment data to browser storage");
        }

        setSaveStatus("saved");
        setLastSaved(new Date());
        setPendingData(null);
        saveQueueRef.current = {};
        onSaveSuccess?.();

        // Clear any existing reset timer
        if (resetTimerRef.current) {
          clearTimeout(resetTimerRef.current);
        }

        // Reset to idle after brief success indication
        resetTimerRef.current = setTimeout(() => {
          setSaveStatus("idle");
          resetTimerRef.current = null;
        }, 2000);
      } catch (err) {
        const saveError = err instanceof Error ? err : new Error("Save failed");
        setSaveStatus("error");
        setError(saveError);
        setPendingData(data);
        onSaveError?.(saveError);
      }
    },
    [sessionId, onSaveSuccess, onSaveError]
  );

  /**
   * Save a specific field with debounce
   * Queues field updates and saves after debounce delay
   */
  const saveField = React.useCallback(
    (fieldName: string, data: Partial<FormAssessmentInput>) => {
      // Queue the field update
      saveQueueRef.current = { ...saveQueueRef.current, ...data };

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounce timer
      debounceTimerRef.current = setTimeout(() => {
        persistData(saveQueueRef.current);
        debounceTimerRef.current = null;
      }, debounceMs);
    },
    [debounceMs, persistData]
  );

  /**
   * Save all form data immediately (no debounce)
   * Used for page transitions
   */
  const saveAll = React.useCallback(
    async (data: Partial<FormAssessmentInput>): Promise<void> => {
      // Clear any pending debounced save
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      await persistData(data);
    },
    [persistData]
  );

  /**
   * Retry last failed save
   */
  const retry = React.useCallback(() => {
    if (pendingData) {
      persistData(pendingData);
    }
  }, [pendingData, persistData]);

  /**
   * Cleanup timers on unmount
   */
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  return {
    saveStatus,
    lastSaved,
    error,
    saveField,
    saveAll,
    retry,
  };
}
