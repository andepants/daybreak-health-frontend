/**
 * Data Sync Prompt Component
 *
 * Displays a UI for syncing localStorage data to the backend when a mismatch
 * is detected. Shows what will be synced, progress during sync, and results.
 *
 * Used on the matching page when frontend shows "100% complete" but backend
 * is missing the actual database records.
 *
 * @example
 * ```tsx
 * <DataSyncPrompt
 *   syncStatus={syncStatus}
 *   onSync={handleSync}
 *   isSyncing={isSyncing}
 *   progress={progress}
 *   currentStep={currentStep}
 *   errors={errors}
 *   isComplete={isComplete}
 *   wasSuccessful={wasSuccessful}
 *   onRetry={handleRetry}
 *   onContinue={handleContinue}
 * />
 * ```
 */

"use client";

import { AlertCircle, CloudUpload, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SyncStatus } from "@/lib/utils/data-sync";

/**
 * Props for DataSyncPrompt component
 */
export interface DataSyncPromptProps {
  /** Detailed sync status showing what needs to be synced */
  syncStatus: SyncStatus;
  /** Callback to trigger sync operation */
  onSync: () => void;
  /** Whether sync is currently in progress */
  isSyncing: boolean;
  /** Current sync progress (0-100) */
  progress: number;
  /** Current step being synced */
  currentStep: string;
  /** Errors from sync attempt */
  errors: string[];
  /** Items successfully synced */
  syncedItems: string[];
  /** Whether sync has completed */
  isComplete: boolean;
  /** Whether last sync was successful */
  wasSuccessful: boolean;
  /** Callback to retry sync */
  onRetry: () => void;
  /** Callback when user wants to continue after successful sync */
  onContinue: () => void;
}

/**
 * Data Sync Prompt Component
 *
 * Provides a user-friendly interface for syncing localStorage data to the backend.
 * Shows different states:
 * - Initial: Explains what will be synced with a "Sync Now" button
 * - Syncing: Shows progress bar and current step
 * - Success: Shows what was synced with a "Continue" button
 * - Error: Shows errors with a "Retry" button
 */
export function DataSyncPrompt({
  syncStatus,
  onSync,
  isSyncing,
  progress,
  currentStep,
  errors,
  syncedItems,
  isComplete,
  wasSuccessful,
  onRetry,
  onContinue,
}: DataSyncPromptProps) {
  // Success state
  if (isComplete && wasSuccessful) {
    return (
      <div className="py-8">
        <div className="mx-auto" style={{ maxWidth: "576px" }}>
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold font-serif text-deep-text">
              Data Synced Successfully
            </h2>
            <p className="text-muted-foreground mt-2">
              Your information has been saved to our servers.
            </p>
          </div>

          {syncedItems.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
              <div className="px-4 py-3 bg-green-50 border-b border-green-100">
                <span className="text-sm font-medium text-green-800">
                  Synced Items
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {syncedItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <Button
              onClick={onContinue}
              className="bg-daybreak-teal hover:bg-daybreak-teal/90 text-white"
            >
              Continue to Matching
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isComplete && !wasSuccessful) {
    return (
      <div className="py-8">
        <div className="mx-auto" style={{ maxWidth: "576px" }}>
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold font-serif text-deep-text">
              Sync Failed
            </h2>
            <p className="text-muted-foreground mt-2">
              We encountered some issues saving your data. Please try again.
            </p>
          </div>

          {errors.length > 0 && (
            <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden mb-6">
              <div className="px-4 py-3 bg-red-50 border-b border-red-100">
                <span className="text-sm font-medium text-red-800">
                  Errors
                </span>
              </div>
              <div className="p-4 space-y-2">
                {errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-700">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}

          {syncedItems.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
              <div className="px-4 py-3 bg-green-50 border-b border-green-100">
                <span className="text-sm font-medium text-green-800">
                  Successfully Synced
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {syncedItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <Button
              onClick={onRetry}
              className="bg-daybreak-teal hover:bg-daybreak-teal/90 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Syncing state
  if (isSyncing) {
    return (
      <div className="py-8">
        <div className="mx-auto" style={{ maxWidth: "576px" }}>
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-daybreak-teal/10">
              <Loader2 className="h-8 w-8 text-daybreak-teal animate-spin" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold font-serif text-deep-text">
              Syncing Your Data
            </h2>
            <p className="text-muted-foreground mt-2">
              Please wait while we save your information...
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {currentStep || "Starting..."}
                </span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-daybreak-teal transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Initial state - show what will be synced
  return (
    <div className="py-8">
      <div className="mx-auto" style={{ maxWidth: "576px" }}>
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <AlertCircle className="h-8 w-8 text-amber-600" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold font-serif text-deep-text">
            Data Not Saved
          </h2>
          <p className="text-muted-foreground mt-2">
            Your information was saved locally but hasn&apos;t been sent to our
            servers yet. Click below to sync your data.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
            <span className="text-sm font-medium text-amber-800">
              Ready to Sync
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {syncStatus.itemsToSync.map((item) => (
              <div key={item} className="flex items-center gap-3 px-4 py-3">
                <CloudUpload className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={onSync}
            className="bg-daybreak-teal hover:bg-daybreak-teal/90 text-white"
          >
            <CloudUpload className="h-4 w-4 mr-2" />
            Sync Now
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          This can happen if you navigated away before your data was fully
          saved, or if there was a network issue.
        </p>
      </div>
    </div>
  );
}
