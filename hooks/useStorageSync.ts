/**
 * useStorageSync hook for reactive localStorage watching
 *
 * Provides real-time sync between localStorage and form components.
 * Polls for changes since storage events don't fire in same tab.
 * Used to sync AI chat extracted data to form fields.
 */
"use client";

import * as React from "react";

/**
 * Form types that can be synced
 */
export type SyncFormType = "parent" | "child" | "insurance" | "assessment";

/**
 * Options for useStorageSync hook
 */
export interface UseStorageSyncOptions {
  /** Current session ID */
  sessionId: string;
  /** Type of form to sync */
  formType: SyncFormType;
  /** Polling interval in milliseconds (default 500) */
  pollingIntervalMs?: number;
  /** Whether to enable sync (default true) */
  enabled?: boolean;
}

/**
 * Return type for useStorageSync hook
 */
export interface UseStorageSyncReturn {
  /** Extracted data for the form type */
  extractedData: Record<string, unknown> | null;
  /** Timestamp of last update */
  lastUpdated: Date | null;
  /** Whether initial load is in progress */
  isLoading: boolean;
  /** Manually trigger a refresh */
  refresh: () => void;
}

/**
 * Storage data structure
 */
interface StoredSessionData {
  data?: {
    parent?: Record<string, unknown>;
    child?: Record<string, unknown>;
    insurance?: Record<string, unknown>;
    assessment?: Record<string, unknown>;
    extractedData?: Record<string, unknown>;
    formAssessment?: Record<string, unknown>;
    firstName?: string;
    lastName?: string;
  };
  savedAt?: string;
}

/**
 * Extracts form-specific data from storage based on form type
 *
 * @param stored - Parsed storage data
 * @param formType - Type of form to extract data for
 * @returns Extracted data for the form type
 */
function extractFormData(
  stored: StoredSessionData,
  formType: SyncFormType
): Record<string, unknown> | null {
  const data = stored?.data;
  if (!data) return null;

  switch (formType) {
    case "parent": {
      // Merge from parent field and top-level firstName/lastName
      const parentData = data.parent || {};
      const extractedParent = (data.extractedData as Record<string, unknown>)?.parent;
      const result: Record<string, unknown> = { ...parentData };

      if (data.firstName) result.firstName = data.firstName;
      if (data.lastName) result.lastName = data.lastName;
      if (extractedParent && typeof extractedParent === "object") {
        Object.assign(result, extractedParent);
      }

      return Object.keys(result).length > 0 ? result : null;
    }

    case "child": {
      // Merge from child field and extractedData
      const childData = data.child || {};
      const extractedChild = (data.extractedData as Record<string, unknown>)?.child;
      const result: Record<string, unknown> = { ...childData };

      if (extractedChild && typeof extractedChild === "object") {
        Object.assign(result, extractedChild);
      }

      return Object.keys(result).length > 0 ? result : null;
    }

    case "insurance":
      // Insurance data from insurance field
      return data.insurance || null;

    case "assessment": {
      // Merge from multiple sources: formAssessment, assessment, and extractedData
      const result: Record<string, unknown> = {};

      if (data.assessment) Object.assign(result, data.assessment);
      if (data.extractedData) Object.assign(result, data.extractedData);
      if (data.formAssessment) Object.assign(result, data.formAssessment);

      return Object.keys(result).length > 0 ? result : null;
    }

    default:
      return null;
  }
}

/**
 * Hook for reactive localStorage sync
 *
 * Polls localStorage for changes and returns form-specific data.
 * Used to sync AI chat extracted data to form fields in real-time.
 *
 * @param options - Configuration options
 * @returns Extracted data and sync status
 *
 * @example
 * const { extractedData, lastUpdated } = useStorageSync({
 *   sessionId,
 *   formType: "parent",
 * });
 *
 * // React to changes
 * useEffect(() => {
 *   if (extractedData && !dirtyFields.firstName) {
 *     setValue("firstName", extractedData.firstName);
 *   }
 * }, [extractedData]);
 */
export function useStorageSync({
  sessionId,
  formType,
  pollingIntervalMs = 500,
  enabled = true,
}: UseStorageSyncOptions): UseStorageSyncReturn {
  const [extractedData, setExtractedData] = React.useState<Record<string, unknown> | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Track last savedAt timestamp to detect changes
  const lastSavedAtRef = React.useRef<string | null>(null);

  /**
   * Load data from localStorage
   */
  const loadData = React.useCallback(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    try {
      const storageKey = `onboarding_session_${sessionId}`;
      const storedRaw = localStorage.getItem(storageKey);

      if (!storedRaw) {
        setIsLoading(false);
        return;
      }

      const stored: StoredSessionData = JSON.parse(storedRaw);

      // Check if data has changed
      if (stored.savedAt === lastSavedAtRef.current) {
        // No change, skip update
        setIsLoading(false);
        return;
      }

      // Update reference
      lastSavedAtRef.current = stored.savedAt || null;

      // Extract form-specific data
      const formData = extractFormData(stored, formType);

      if (formData && Object.keys(formData).length > 0) {
        setExtractedData(formData);
        setLastUpdated(stored.savedAt ? new Date(stored.savedAt) : new Date());
      }

      setIsLoading(false);
    } catch (error) {
      console.warn(`[useStorageSync] Failed to load ${formType} data:`, error);
      setIsLoading(false);
    }
  }, [sessionId, formType]);

  /**
   * Manual refresh function
   */
  const refresh = React.useCallback(() => {
    lastSavedAtRef.current = null; // Force reload
    loadData();
  }, [loadData]);

  /**
   * Initial load
   */
  React.useEffect(() => {
    if (enabled) {
      loadData();
    }
  }, [enabled, loadData]);

  /**
   * Set up polling interval for same-tab updates
   * (storage events only fire for cross-tab changes)
   */
  React.useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(loadData, pollingIntervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, loadData, pollingIntervalMs]);

  /**
   * Listen for cross-tab storage events
   */
  React.useEffect(() => {
    if (!enabled) return;

    function handleStorageChange(event: StorageEvent): void {
      if (event.key === `onboarding_session_${sessionId}`) {
        loadData();
      }
    }

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [enabled, sessionId, loadData]);

  return {
    extractedData,
    lastUpdated,
    isLoading,
    refresh,
  };
}
