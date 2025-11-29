/**
 * FormProgress component for multi-page form navigation
 *
 * Displays progress through the 3-page assessment form with visual indicators
 * for completed, current, and upcoming pages. Supports click navigation to
 * previously completed pages per AC-3.4.7.
 */
"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for FormProgress component
 * @param currentPage - Current page number (1-3)
 * @param completedPages - Set of page numbers that have been completed
 * @param onPageClick - Optional callback for navigating to a page
 */
export interface FormProgressProps {
  currentPage: number;
  completedPages: Set<number>;
  onPageClick?: (page: number) => void;
}

/**
 * Page titles for display
 */
const PAGE_TITLES = [
  "About Your Child",
  "Daily Life Impact",
  "Additional Context",
];

/**
 * Renders form progress indicator
 *
 * Visual specs:
 * - Horizontal step indicator with circles and connecting lines
 * - Completed steps: teal background with checkmark
 * - Current step: teal border with teal text
 * - Future steps: gray border with gray text
 * - Clickable completed steps for back navigation
 *
 * Accessibility:
 * - ARIA labels for step status
 * - Keyboard navigable completed steps
 * - Screen reader announces current position
 *
 * @example
 * <FormProgress
 *   currentPage={2}
 *   completedPages={new Set([1])}
 *   onPageClick={(page) => setCurrentPage(page)}
 * />
 */
export function FormProgress({
  currentPage,
  completedPages,
  onPageClick,
}: FormProgressProps) {
  return (
    <nav
      aria-label="Form progress"
      className="w-full max-w-[640px] mx-auto"
    >
      {/* Step text indicator */}
      <p className="text-sm text-muted-foreground text-center mb-4">
        Page {currentPage} of 3
      </p>

      {/* Visual progress bar */}
      <div className="flex items-center justify-between relative">
        {/* Connecting line background */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />

        {/* Progress line (completed portion) */}
        <div
          className="absolute top-4 left-0 h-0.5 bg-daybreak-teal transition-all duration-300"
          style={{
            width: `${((Math.max(...Array.from(completedPages), 0)) / 2) * 100}%`,
          }}
        />

        {[1, 2, 3].map((page) => {
          const isCompleted = completedPages.has(page);
          const isCurrent = currentPage === page;
          const isClickable = isCompleted && page !== currentPage;

          return (
            <div
              key={page}
              className="flex flex-col items-center relative z-10"
            >
              {/* Step circle */}
              <button
                type="button"
                onClick={() => isClickable && onPageClick?.(page)}
                disabled={!isClickable}
                tabIndex={!isClickable ? -1 : 0}
                aria-label={`Step ${page}: ${PAGE_TITLES[page - 1]}${isCompleted ? " (completed)" : ""}${isCurrent ? " (current)" : ""}`}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  "text-sm font-medium transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-daybreak-teal focus-visible:ring-offset-2",
                  isCompleted && !isCurrent && "bg-daybreak-teal text-white",
                  isCurrent && "border-2 border-daybreak-teal bg-background text-daybreak-teal",
                  !isCompleted && !isCurrent && "border-2 border-border bg-background text-muted-foreground",
                  isClickable && "cursor-pointer hover:ring-2 hover:ring-daybreak-teal/50"
                )}
              >
                {isCompleted && !isCurrent ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  page
                )}
              </button>

              {/* Step title */}
              <span
                className={cn(
                  "mt-2 text-xs text-center max-w-[80px]",
                  isCurrent && "text-daybreak-teal font-medium",
                  isCompleted && !isCurrent && "text-foreground",
                  !isCompleted && !isCurrent && "text-muted-foreground"
                )}
              >
                {PAGE_TITLES[page - 1]}
              </span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

FormProgress.displayName = "FormProgress";
