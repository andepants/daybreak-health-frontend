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
 * - Vertical step indicator with circles and connecting lines
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
      className="w-full md:w-64 flex-shrink-0"
    >
      <div className="mb-8 hidden md:block">
        <h1 className="text-3xl font-serif text-foreground mb-2">
          Complete<br />Your<br />Profile
        </h1>
        <p className="text-muted-foreground text-sm max-w-[200px]">
          Please complete the following steps before we can match you with a therapist.
        </p>
      </div>

      {/* Mobile Header (visible only on small screens) */}
      <div className="md:hidden mb-6">
        <h1 className="text-2xl font-serif text-foreground">
          Complete Your Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Step {currentPage} of 3: {PAGE_TITLES[currentPage - 1]}
        </p>
      </div>

      {/* Visual progress bar */}
      <div className="relative pl-4 md:pl-0">
        {/* Vertical Line Background */}
        <div className="absolute left-[27px] md:left-[15px] top-2 bottom-2 w-0.5 bg-border -z-10" />

        {/* Progress Line (completed portion) */}
        <div
          className="absolute left-[27px] md:left-[15px] top-2 w-0.5 bg-daybreak-teal transition-all duration-500 ease-in-out -z-10"
          style={{
            height: `${Math.max(0, (currentPage - 1) * 50)}%`, // Approximate progress
            maxHeight: "calc(100% - 16px)"
          }}
        />

        <div className="space-y-8">
          {[1, 2, 3].map((page) => {
            const isCompleted = completedPages.has(page);
            const isCurrent = currentPage === page;
            const isClickable = isCompleted && page !== currentPage;

            return (
              <div
                key={page}
                className="flex items-start gap-4"
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
                    "relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    "text-sm font-medium transition-all duration-200 bg-background",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-daybreak-teal focus-visible:ring-offset-2",
                    isCompleted && !isCurrent && "bg-daybreak-teal text-white border-2 border-daybreak-teal",
                    isCurrent && "border-2 border-daybreak-teal text-daybreak-teal",
                    !isCompleted && !isCurrent && "border-2 border-border text-muted-foreground",
                    isClickable && "cursor-pointer hover:ring-2 hover:ring-daybreak-teal/50"
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    page
                  )}
                </button>

                {/* Step title - Hidden on mobile to save space, shown on desktop */}
                <div className={cn(
                  "pt-1 hidden md:block",
                  isCurrent ? "opacity-100" : "opacity-70"
                )}>
                  <span
                    className={cn(
                      "text-sm font-medium block",
                      isCurrent && "text-daybreak-teal",
                      !isCurrent && "text-foreground"
                    )}
                  >
                    {PAGE_TITLES[page - 1]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

FormProgress.displayName = "FormProgress";
