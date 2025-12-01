/**
 * Data Sync Hook
 *
 * React hook for managing localStorage-to-backend data synchronization.
 * Detects when localStorage has data that hasn't been synced to the database
 * and provides methods to trigger sync operations.
 *
 * This is used on the matching page to handle cases where frontend shows
 * "100% complete" but backend is missing the actual database records.
 *
 * @example
 * ```tsx
 * const {
 *   needsSync,
 *   syncStatus,
 *   sync,
 *   isSyncing,
 *   progress,
 *   errors,
 * } = useDataSync(sessionId, sessionData);
 *
 * if (needsSync) {
 *   return <DataSyncPrompt onSync={sync} isSyncing={isSyncing} progress={progress} />;
 * }
 * ```
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { useApolloClient } from "@apollo/client/react";
import {
  detectSyncNeeds,
  syncLocalStorageToBackend,
  type SyncStatus,
  type SyncResult,
} from "@/lib/utils/data-sync";

/**
 * Backend session data structure (subset of GetSession query result)
 * Uses loose typing to accept GraphQL response variations (null vs undefined)
 */
interface BackendSession {
  child?: { id: string; first_name?: string | null } | null;
  insurance?: { id: string; memberId?: string | null; payerName?: string | null } | null;
  assessment?: { id: string; status?: string | null } | null;
  parent?: { id: string; firstName?: string | null } | null;
}

/**
 * Hook options
 */
export interface UseDataSyncOptions {
  /** Session ID to sync */
  sessionId: string;
  /** Current backend session data from GetSession query */
  backendSession?: BackendSession | null;
}

/**
 * Hook return type
 */
export interface UseDataSyncReturn {
  /** Whether any data needs to be synced */
  needsSync: boolean;
  /** Detailed sync status */
  syncStatus: SyncStatus;
  /** Trigger sync operation */
  sync: () => Promise<SyncResult>;
  /** Whether sync is currently in progress */
  isSyncing: boolean;
  /** Current sync progress (0-100) */
  progress: number;
  /** Current step being synced */
  currentStep: string;
  /** Total number of steps */
  totalSteps: number;
  /** Errors from last sync attempt */
  errors: string[];
  /** Items successfully synced */
  syncedItems: string[];
  /** Whether sync has completed (successfully or not) */
  isComplete: boolean;
  /** Whether last sync was successful */
  wasSuccessful: boolean;
  /** Reset state to try again */
  reset: () => void;
}

/**
 * Hook for managing localStorage-to-backend data synchronization
 *
 * Detects sync needs by comparing localStorage data against backend session,
 * and provides methods to trigger sync operations with progress tracking.
 *
 * @param options - Hook configuration
 * @returns Sync state and methods
 */
export function useDataSync({
  sessionId,
  backendSession,
}: UseDataSyncOptions): UseDataSyncReturn {
  const client = useApolloClient();

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [totalSteps, setTotalSteps] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [syncedItems, setSyncedItems] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [wasSuccessful, setWasSuccessful] = useState(false);

  /**
   * Compute sync status from localStorage vs backend comparison
   */
  const syncStatus = useMemo((): SyncStatus => {
    return detectSyncNeeds(sessionId, backendSession);
  }, [sessionId, backendSession]);

  /**
   * Reset state to allow retry
   */
  const reset = useCallback(() => {
    setIsSyncing(false);
    setProgress(0);
    setCurrentStep("");
    setTotalSteps(0);
    setErrors([]);
    setSyncedItems([]);
    setIsComplete(false);
    setWasSuccessful(false);
  }, []);

  /**
   * Trigger sync operation
   */
  const sync = useCallback(async (): Promise<SyncResult> => {
    // Reset state
    setIsSyncing(true);
    setProgress(0);
    setCurrentStep("Starting sync...");
    setErrors([]);
    setSyncedItems([]);
    setIsComplete(false);
    setWasSuccessful(false);

    try {
      const result = await syncLocalStorageToBackend(client, sessionId, {
        onProgress: (step, current, total, success) => {
          setCurrentStep(step);
          setTotalSteps(total);
          setProgress(Math.round((current / total) * 100));

          // Log for debugging
          if (process.env.NODE_ENV === "development") {
            console.log(
              `[useDataSync] ${step}: ${current}/${total} - ${success ? "OK" : "FAIL"}`
            );
          }
        },
        delayMs: 100,
      });

      setErrors(result.errors);
      setSyncedItems(result.syncedItems);
      setIsComplete(true);
      setWasSuccessful(result.success);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setErrors([errorMessage]);
      setIsComplete(true);
      setWasSuccessful(false);

      return {
        success: false,
        errors: [errorMessage],
        syncedItems: [],
      };
    } finally {
      setIsSyncing(false);
    }
  }, [client, sessionId]);

  return {
    needsSync: syncStatus.needsSync,
    syncStatus,
    sync,
    isSyncing,
    progress,
    currentStep,
    totalSteps,
    errors,
    syncedItems,
    isComplete,
    wasSuccessful,
    reset,
  };
}
