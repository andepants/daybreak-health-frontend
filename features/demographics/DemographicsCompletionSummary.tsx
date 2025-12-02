/**
 * Demographics Completion Summary Component
 *
 * Shows a checklist summary at the top of the demographics form
 * displaying "X of Y required fields complete" with a progress bar
 * and clickable section rows for navigation.
 *
 * Matches the styling of the Assessment form's completion summary.
 */

"use client";

import { CheckCircle2, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { DemographicsSectionStatus, DemographicsSection } from "./useDemographicsFieldStatus";

interface DemographicsCompletionSummaryProps {
  /** Section-level completion statuses */
  sections: DemographicsSectionStatus[];
  /** Count of completed required fields */
  requiredComplete: number;
  /** Total count of required fields */
  requiredTotal: number;
  /** Overall completion percentage */
  percentage: number;
  /** Callback when a section row is clicked */
  onSectionClick?: (section: DemographicsSection) => void;
  /** Current section being viewed */
  currentSection?: DemographicsSection;
}

/**
 * Renders a completion summary checklist for the demographics form
 *
 * Features:
 * - Progress bar showing completion percentage
 * - Clickable section rows that navigate to the section
 * - CheckCircle2 icons for complete status
 * - Status badges matching assessment page styling
 * - Collapsible on mobile
 *
 * @example
 * ```tsx
 * const { sections, requiredComplete, requiredTotal, overallPercentage } =
 *   useDemographicsFieldStatus({ parentData, childData, clinicalData });
 *
 * <DemographicsCompletionSummary
 *   sections={sections}
 *   requiredComplete={requiredComplete}
 *   requiredTotal={requiredTotal}
 *   percentage={overallPercentage}
 *   onSectionClick={(section) => navigateToSection(section)}
 *   currentSection={currentSection}
 * />
 * ```
 */
export function DemographicsCompletionSummary({
  sections,
  requiredComplete,
  requiredTotal,
  percentage,
  onSectionClick,
  currentSection,
}: DemographicsCompletionSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

      {/* Section checklist - collapsible */}
      {isExpanded && (
        <div className="divide-y divide-gray-100">
          {sections.map((section) => {
            const isCurrentSection = section.id === currentSection;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSectionClick?.(section.id)}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group ${
                  isCurrentSection ? "bg-daybreak-teal/5" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    className={`h-5 w-5 flex-shrink-0 ${
                      section.isComplete ? "text-green-600" : "text-gray-300"
                    }`}
                  />
                  <div className="text-left">
                    <span
                      className={`text-sm ${
                        section.isComplete
                          ? "text-gray-600"
                          : "text-gray-900 font-medium"
                      }`}
                    >
                      {section.label}
                    </span>
                    {section.requiredCount > 0 && (
                      <span className="text-xs text-gray-400 ml-2">
                        {section.completedCount}/{section.requiredCount} fields
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      section.isComplete
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {section.isComplete ? "Complete" : "Incomplete"}
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

export type { DemographicsCompletionSummaryProps };
