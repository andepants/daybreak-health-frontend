/**
 * Assessment Completion Summary Component
 *
 * Shows a checklist summary at the top of the assessment form
 * displaying "X of Y required fields complete" with a progress bar
 * and clickable field rows for navigation.
 *
 * Reuses styling patterns from the matching page checklist.
 */

"use client";

import { CheckCircle2, XCircle, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { SectionStatus } from "../hooks/useAssessmentFieldStatus";

interface AssessmentCompletionSummaryProps {
  /** Section statuses from useAssessmentFieldStatus hook */
  sections: SectionStatus[];
  /** Count of completed sections (based on field status) - used for row display */
  sectionsComplete: number;
  /** Total count of sections */
  sectionsTotal: number;
  /** Section completion percentage */
  percentage: number;
  /** Callback when a section row is clicked */
  onSectionClick?: (sectionName: string, page: number) => void;
  /** Current page number (to highlight current page section) */
  currentPage?: number;
  /** Set of completed page numbers (from navigation state) - used for header progress */
  completedPages?: Set<number>;
}

/**
 * Renders a completion summary checklist for the assessment form
 *
 * Features:
 * - Progress bar showing completion percentage
 * - Clickable section rows that navigate to the section's page
 * - CheckCircle2/XCircle icons for complete/incomplete status
 * - Status badges matching matching page styling
 * - Collapsible on mobile
 *
 * @example
 * ```tsx
 * const { sections, sectionsComplete, sectionsTotal, sectionPercentage } =
 *   useAssessmentFieldStatus({ page1Form, page2Form, page3Form });
 *
 * <AssessmentCompletionSummary
 *   sections={sections}
 *   sectionsComplete={sectionsComplete}
 *   sectionsTotal={sectionsTotal}
 *   percentage={sectionPercentage}
 *   onSectionClick={(sectionName, page) => {
 *     goToPage(page);
 *   }}
 * />
 * ```
 */
export function AssessmentCompletionSummary({
  sections,
  sectionsComplete,
  sectionsTotal,
  percentage,
  onSectionClick,
  currentPage,
  completedPages,
}: AssessmentCompletionSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Use completedPages count if provided (navigation-based), otherwise fall back to field-based count
  const displayComplete = completedPages ? completedPages.size : sectionsComplete;
  const displayPercentage = completedPages
    ? Math.round((completedPages.size / sectionsTotal) * 100)
    : percentage;

  // Check if all sections are complete (based on navigation state if available)
  const isAllComplete = displayComplete === sectionsTotal;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      {/* Header with progress bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Required Fields
            </span>
            {isAllComplete && (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {displayComplete} of {sectionsTotal} complete
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-daybreak-teal transition-all duration-300"
            style={{ width: `${displayPercentage}%` }}
          />
        </div>
      </button>

      {/* Section checklist - collapsible */}
      {isExpanded && (
        <div className="divide-y divide-gray-100">
          {sections.map((section) => {
            const isCurrentPageSection = section.page === currentPage;
            // Use completedPages if provided (navigation-based), otherwise fall back to field-based
            const isSectionComplete = completedPages
              ? completedPages.has(section.page)
              : section.isComplete;

            return (
              <button
                key={section.name}
                type="button"
                onClick={() => onSectionClick?.(section.name, section.page)}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group ${
                  isCurrentPageSection ? "bg-daybreak-teal/5" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {isSectionComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  )}
                  <div className="text-left">
                    <span
                      className={`text-sm ${
                        isSectionComplete
                          ? "text-gray-600"
                          : "text-gray-900 font-medium"
                      }`}
                    >
                      {section.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isSectionComplete
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {isSectionComplete ? "Complete" : "Missing"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export type { AssessmentCompletionSummaryProps };
