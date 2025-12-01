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
import type { AssessmentFieldStatus } from "../hooks/useAssessmentFieldStatus";

interface AssessmentCompletionSummaryProps {
  /** All field statuses from useAssessmentFieldStatus hook */
  fields: AssessmentFieldStatus[];
  /** Count of completed required fields */
  requiredComplete: number;
  /** Total count of required fields */
  requiredTotal: number;
  /** Overall completion percentage */
  percentage: number;
  /** Callback when a field row is clicked */
  onFieldClick?: (fieldName: string, page: number) => void;
  /** Current page number (to highlight current page fields) */
  currentPage?: number;
  /** Whether to show only required fields (default: true) */
  showOnlyRequired?: boolean;
}

/**
 * Renders a completion summary checklist for the assessment form
 *
 * Features:
 * - Progress bar showing completion percentage
 * - Clickable field rows that navigate to the field's page
 * - CheckCircle2/XCircle icons for complete/incomplete status
 * - Status badges matching matching page styling
 * - Collapsible on mobile
 *
 * @example
 * ```tsx
 * const { fields, requiredComplete, requiredTotal, overallPercentage } =
 *   useAssessmentFieldStatus({ page1Form, page2Form, page3Form });
 *
 * <AssessmentCompletionSummary
 *   fields={fields}
 *   requiredComplete={requiredComplete}
 *   requiredTotal={requiredTotal}
 *   percentage={overallPercentage}
 *   onFieldClick={(fieldName, page) => {
 *     goToPage(page);
 *     document.getElementById(fieldName)?.focus();
 *   }}
 * />
 * ```
 */
export function AssessmentCompletionSummary({
  fields,
  requiredComplete,
  requiredTotal,
  percentage,
  onFieldClick,
  currentPage,
  showOnlyRequired = true,
}: AssessmentCompletionSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter to required fields if specified
  const displayFields = showOnlyRequired
    ? fields.filter((f) => f.isRequired)
    : fields;

  // Check if all required are complete
  const isAllComplete = requiredComplete === requiredTotal;

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
              {requiredComplete} of {requiredTotal} complete
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
            style={{ width: `${percentage}%` }}
          />
        </div>
      </button>

      {/* Field checklist - collapsible */}
      {isExpanded && (
        <div className="divide-y divide-gray-100">
          {displayFields.map((field) => {
            const isCurrentPageField = field.page === currentPage;

            return (
              <button
                key={field.name}
                type="button"
                onClick={() => onFieldClick?.(field.name, field.page)}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group ${
                  isCurrentPageField ? "bg-daybreak-teal/5" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {field.isComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  )}
                  <div className="text-left">
                    <span
                      className={`text-sm ${
                        field.isComplete
                          ? "text-gray-600"
                          : "text-gray-900 font-medium"
                      }`}
                    >
                      {field.label}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      Page {field.page}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      field.isComplete
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {field.isComplete ? "Complete" : "Missing"}
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
