/**
 * useAutoSave hook for automatic session state persistence
 *
 * Provides automatic saving functionality with retry logic and status tracking.
 * Saves immediately on changes (not debounced/batched) to ensure no data loss.
 * Handles network failures gracefully with retry capabilities.
 */
"use client";

import * as React from "react";

/**
 * Save status states
 */
export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Options for useAutoSave hook
 * @param sessionId - Current session ID for saving
 * @param onSaveSuccess - Optional callback fired after successful save
 * @param onSaveError - Optional callback fired on save error
 */
export interface UseAutoSaveOptions {
  sessionId: string;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

/**
 * Return type for useAutoSave hook
 */
export interface UseAutoSaveReturn {
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  error: Error | null;
  retry: () => void;
  save: (data: unknown) => Promise<void>;
}

/**
 * Hook for automatic session state saving
 *
 * Features:
 * - Immediate save on data changes (no batching)
 * - Optimistic UI updates
 * - Retry logic for failed saves
 * - Status tracking for UI feedback
 * - Error handling with recovery
 *
 * Note: This is a simplified implementation for mock data.
 * In production, this would integrate with GraphQL mutations
 * and Apollo Client for persistent storage.
 *
 * @param options - Configuration options for auto-save
 * @returns Save status and control functions
 *
 * @example
 * const { saveStatus, save, retry } = useAutoSave({
 *   sessionId,
 *   onSaveSuccess: () => console.log('Saved!'),
 * });
 */
export function useAutoSave({
  sessionId,
  onSaveSuccess,
  onSaveError,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const [pendingData, setPendingData] = React.useState<unknown>(null);
  const resetTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  /**
   * Save function - persists data to backend
   * In production, this would call a GraphQL mutation
   */
  const save = React.useCallback(
    async (data: unknown): Promise<void> => {
      setSaveStatus("saving");
      setError(null);

      try {
        // TODO: Replace with actual GraphQL mutation when backend is ready
        // await saveMutation({ variables: { sessionId, data } });

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Store in localStorage as backup
        try {
          localStorage.setItem(
            `onboarding_session_${sessionId}`,
            JSON.stringify({
              data,
              savedAt: new Date().toISOString(),
            })
          );
        } catch (storageError) {
          // Handle quota exceeded errors specifically
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
          console.warn("Failed to save to localStorage:", storageError);
        }

        setSaveStatus("saved");
        setLastSaved(new Date());
        setPendingData(null);
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
        const error = err instanceof Error ? err : new Error("Save failed");
        setSaveStatus("error");
        setError(error);
        setPendingData(data); // Store for retry
        onSaveError?.(error);
      }
    },
    [sessionId, onSaveSuccess, onSaveError]
  );

  /**
   * Retry last failed save
   */
  const retry = React.useCallback(() => {
    if (pendingData) {
      save(pendingData);
    }
  }, [pendingData, save]);

  /**
   * Cleanup timers on unmount
   */
  React.useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  return {
    saveStatus,
    lastSaved,
    error,
    retry,
    save,
  };
}
