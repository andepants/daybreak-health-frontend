/**
 * SyncErrorBanner component
 *
 * Displays API/network sync errors at the top of a form.
 * Used when backend sync fails during form submission.
 * Shows dismissible error with optional retry action.
 */
"use client";

import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Props for SyncErrorBanner component
 * @param error - Error message to display, or null to hide banner
 * @param onDismiss - Callback when user dismisses the error
 * @param onRetry - Optional callback for retry action
 */
export interface SyncErrorBannerProps {
  error: string | null;
  onDismiss: () => void;
  onRetry?: () => void;
}

/**
 * Renders an error banner for sync/API failures
 *
 * Visual specs:
 * - Red background with red border
 * - Alert icon with error message
 * - Dismissible via X button
 * - Optional "Try again" link
 * - Accessible with role="alert" and aria-live
 *
 * @example
 * <SyncErrorBanner
 *   error={syncError}
 *   onDismiss={clearError}
 *   onRetry={handleRetry}
 * />
 */
export function SyncErrorBanner({
  error,
  onDismiss,
  onRetry,
}: SyncErrorBannerProps) {
  if (!error) return null;

  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 p-4 mb-6"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-red-800 font-medium">
            Unable to save your information
          </p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          {onRetry && (
            <Button
              type="button"
              variant="link"
              onClick={onRetry}
              className="text-red-700 hover:text-red-800 p-0 h-auto mt-2 text-sm"
            >
              Try again
            </Button>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 transition-colors"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
