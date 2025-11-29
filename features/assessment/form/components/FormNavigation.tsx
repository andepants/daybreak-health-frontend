/**
 * FormNavigation component for multi-page form navigation buttons
 *
 * Renders Back and Continue/Submit buttons with appropriate states
 * for each page of the assessment form.
 */
"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Props for FormNavigation component
 * @param currentPage - Current page number (1-3)
 * @param totalPages - Total number of pages (default 3)
 * @param isValid - Whether current page form is valid
 * @param isSubmitting - Whether form is currently submitting
 * @param onBack - Callback for back button click
 * @param onNext - Callback for next/submit button click
 * @param backLabel - Custom back button label
 * @param nextLabel - Custom next button label
 */
export interface FormNavigationProps {
  currentPage: number;
  totalPages?: number;
  isValid: boolean;
  isSubmitting?: boolean;
  onBack: () => void;
  onNext: () => void;
  backLabel?: string;
  nextLabel?: string;
}

/**
 * Renders form navigation buttons
 *
 * Visual specs:
 * - Back button: outline variant, left-aligned on desktop
 * - Next/Submit button: primary teal, right-aligned on desktop
 * - Mobile: stacked vertically, reverse order (Next above Back)
 * - Final page shows "Submit" with send icon
 *
 * Accessibility:
 * - Proper button labels
 * - Disabled state when form invalid
 * - Loading state during submission
 *
 * @example
 * <FormNavigation
 *   currentPage={2}
 *   isValid={formState.isValid}
 *   onBack={() => setPage(1)}
 *   onNext={handleSubmit}
 * />
 */
export function FormNavigation({
  currentPage,
  totalPages = 3,
  isValid,
  isSubmitting = false,
  onBack,
  onNext,
  backLabel,
  nextLabel,
}: FormNavigationProps) {
  const isFinalPage = currentPage === totalPages;

  const defaultBackLabel = currentPage === 1 ? "Back to Chat" : "Back";
  const defaultNextLabel = isFinalPage ? "Submit Assessment" : "Continue";

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6">
      {/* Back button */}
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={isSubmitting}
        className="w-full sm:w-auto"
      >
        <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
        {backLabel || defaultBackLabel}
      </Button>

      {/* Next/Submit button */}
      <Button
        type="button"
        onClick={onNext}
        disabled={!isValid || isSubmitting}
        className={cn(
          "w-full sm:flex-1",
          "bg-daybreak-teal hover:bg-daybreak-teal/90 text-white"
        )}
      >
        {isSubmitting ? (
          <>
            <span className="animate-spin mr-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </span>
            Submitting...
          </>
        ) : (
          <>
            {nextLabel || defaultNextLabel}
            {isFinalPage ? (
              <Send className="h-4 w-4 ml-1" aria-hidden="true" />
            ) : (
              <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
            )}
          </>
        )}
      </Button>
    </div>
  );
}

FormNavigation.displayName = "FormNavigation";
