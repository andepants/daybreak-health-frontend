/**
 * SaveIndicator component for auto-save status display
 *
 * Shows visual feedback for auto-save operations including
 * saving, saved, and error states per AC-3.4.6.
 */
"use client";

import * as React from "react";
import { Check, AlertCircle, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SaveStatus } from "../hooks/useFormAutoSave";

/**
 * Props for SaveIndicator component
 * @param status - Current save status
 * @param className - Optional additional CSS classes
 */
export interface SaveIndicatorProps {
  status: SaveStatus;
  className?: string;
}

/**
 * Success color from Daybreak design tokens
 */
const SUCCESS_COLOR = "#10B981";

/**
 * Error color from Daybreak design tokens
 */
const ERROR_COLOR = "#E85D5D";

/**
 * Renders auto-save status indicator
 *
 * Visual specs:
 * - idle: Hidden
 * - saving: Gray text with spinner "Saving..."
 * - saved: Green text with checkmark "Saved" (fades after 2s)
 * - error: Red text with warning icon "Failed to save"
 *
 * Accessibility:
 * - Uses aria-live for status updates
 * - Icon hidden from screen readers (text provides context)
 *
 * @example
 * <SaveIndicator status={saveStatus} />
 */
export function SaveIndicator({ status, className }: SaveIndicatorProps) {
  if (status === "idle") {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-1.5 text-xs transition-opacity duration-200",
        status === "saving" && "text-muted-foreground",
        status === "saved" && "text-emerald-600",
        status === "error" && "text-red-500",
        className
      )}
    >
      {status === "saving" && (
        <>
          <Loader2
            className="h-3 w-3 animate-spin"
            aria-hidden="true"
          />
          <span>Saving...</span>
        </>
      )}

      {status === "saved" && (
        <>
          <Check
            className="h-3 w-3"
            style={{ color: SUCCESS_COLOR }}
            aria-hidden="true"
          />
          <span>Saved</span>
        </>
      )}

      {status === "error" && (
        <>
          <AlertCircle
            className="h-3 w-3"
            style={{ color: ERROR_COLOR }}
            aria-hidden="true"
          />
          <span>Failed to save</span>
        </>
      )}
    </div>
  );
}

SaveIndicator.displayName = "SaveIndicator";
