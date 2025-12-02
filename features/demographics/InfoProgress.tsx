/**
 * InfoProgress component for demographics section navigation
 *
 * Displays progress through the 3-step demographics form with visual indicators
 * for completed, current, and upcoming sections. Supports click navigation to
 * previously completed sections.
 *
 * Matches the FormProgress component styling from the Assessment form.
 */
"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Section type for demographics progress
 */
export type DemographicsSection = "parent" | "child" | "clinical";

/**
 * Props for InfoProgress component
 * @param currentSection - Current section being viewed
 * @param completedSections - Set of sections that have been completed
 * @param onSectionClick - Optional callback for navigating to a section
 */
export interface InfoProgressProps {
  currentSection: DemographicsSection;
  completedSections: Set<DemographicsSection>;
  onSectionClick?: (section: DemographicsSection) => void;
}

/**
 * Section configuration with labels and order
 */
const SECTIONS: { id: DemographicsSection; label: string }[] = [
  { id: "parent", label: "About You" },
  { id: "child", label: "About Your Child" },
  { id: "clinical", label: "Medical History" },
];

/**
 * Get section number (1-indexed) from section id
 */
function getSectionNumber(section: DemographicsSection): number {
  const index = SECTIONS.findIndex((s) => s.id === section);
  return index + 1;
}

/**
 * Renders info progress indicator
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
 * <InfoProgress
 *   currentSection="child"
 *   completedSections={new Set(["parent"])}
 *   onSectionClick={(section) => navigateToSection(section)}
 * />
 */
export function InfoProgress({
  currentSection,
  completedSections,
  onSectionClick,
}: InfoProgressProps) {
  const currentSectionNumber = getSectionNumber(currentSection);

  return (
    <nav
      aria-label="Info section progress"
      className="w-full lg:sticky lg:top-6"
    >
      {/* Desktop Header - Matches FormProgress styling */}
      <div className="mb-8 hidden lg:block">
        <h1 className="text-3xl font-serif text-foreground mb-2">
          Complete<br />Your<br />Profile
        </h1>
        <p className="text-muted-foreground text-sm max-w-[200px]">
          Please complete the following steps before we can match you with a therapist.
        </p>
      </div>

      {/* Mobile Header (visible only on small screens) */}
      <div className="lg:hidden mb-6">
        <h1 className="text-2xl font-serif text-foreground">
          Complete Your Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Step {currentSectionNumber} of 3:{" "}
          {SECTIONS[currentSectionNumber - 1].label}
        </p>
      </div>

      {/* Visual progress bar */}
      <div className="relative pl-4 lg:pl-0">
        {/* Vertical Line Background */}
        <div className="absolute left-[27px] lg:left-[15px] top-2 bottom-2 w-0.5 bg-border -z-10" />

        {/* Progress Line (completed portion) */}
        <div
          className="absolute left-[27px] lg:left-[15px] top-2 w-0.5 bg-daybreak-teal transition-all duration-500 ease-in-out -z-10"
          style={{
            height: `${Math.max(0, (currentSectionNumber - 1) * 50)}%`,
            maxHeight: "calc(100% - 16px)",
          }}
        />

        <div className="space-y-8">
          {SECTIONS.map((section, index) => {
            const stepNumber = index + 1;
            const isCompleted = completedSections.has(section.id);
            const isCurrent = currentSection === section.id;
            const isClickable = section.id !== currentSection; // All non-current steps clickable

            return (
              <div key={section.id} className="flex items-start gap-4">
                {/* Step circle */}
                <button
                  type="button"
                  onClick={() => isClickable && onSectionClick?.(section.id)}
                  disabled={!isClickable}
                  tabIndex={!isClickable ? -1 : 0}
                  aria-label={`Step ${stepNumber}: ${section.label}${isCompleted ? " (completed)" : ""}${isCurrent ? " (current)" : ""}`}
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    "text-sm font-medium transition-all duration-200 bg-background",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-daybreak-teal focus-visible:ring-offset-2",
                    isCompleted &&
                      !isCurrent &&
                      "bg-daybreak-teal text-white border-2 border-daybreak-teal",
                    isCurrent && "border-2 border-daybreak-teal text-daybreak-teal",
                    !isCompleted &&
                      !isCurrent &&
                      "border-2 border-border text-muted-foreground",
                    isClickable &&
                      "cursor-pointer hover:ring-2 hover:ring-daybreak-teal/50"
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    stepNumber
                  )}
                </button>

                {/* Step title - Hidden on mobile to save space, shown on desktop */}
                <div
                  className={cn(
                    "pt-1 hidden lg:block",
                    isCurrent ? "opacity-100" : "opacity-70"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium block",
                      isCurrent && "text-daybreak-teal",
                      !isCurrent && "text-foreground"
                    )}
                  >
                    {section.label}
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

InfoProgress.displayName = "InfoProgress";
