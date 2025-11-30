/**
 * Onboarding Progress Stepper Component
 *
 * Shows 5-step progress indicator for the onboarding flow:
 * Assessment -> Info -> Insurance -> Match -> Book
 *
 * Features:
 * - Responsive: Icons only on mobile, labels + icons on desktop
 * - Accessible: ARIA labels for step status
 * - Daybreak branding: Teal active state, completion indicators
 */
"use client";

import { cn } from "@/lib/utils";
import {
  ClipboardList,
  User,
  Shield,
  Users,
  Calendar,
  Check,
} from "lucide-react";

/**
 * Step identifiers for the onboarding flow
 */
type StepId = "assessment" | "info" | "insurance" | "match" | "book";

/**
 * Props for the OnboardingProgress component
 * @param currentStep - Currently active step in the onboarding flow
 * @param completedSteps - Array of completed step identifiers
 * @param className - Additional CSS classes for customization
 * @param onStepClick - Callback when a step is clicked (for navigation)
 * @param allowAllNavigation - If true, all steps are clickable (for testing)
 */
interface OnboardingProgressProps {
  currentStep: StepId;
  completedSteps?: StepId[];
  className?: string;
  onStepClick?: (stepId: StepId) => void;
  allowAllNavigation?: boolean;
}

/**
 * Step configuration with labels and icons
 */
const STEPS: { id: StepId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "assessment", label: "Assessment", icon: ClipboardList },
  { id: "info", label: "Info", icon: User },
  { id: "insurance", label: "Insurance", icon: Shield },
  { id: "match", label: "Match", icon: Users },
  { id: "book", label: "Book", icon: Calendar },
];

/**
 * Renders the progress stepper with 5 steps
 * Active step receives teal styling, completed steps show checkmark
 * Steps are clickable when onStepClick is provided
 */
function OnboardingProgress({
  currentStep,
  completedSteps = [],
  className,
  onStepClick,
  allowAllNavigation = false,
}: OnboardingProgressProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav
      className={cn("w-full py-4 px-4 md:px-6", className)}
      aria-label="Onboarding progress"
    >
      <ol className="flex items-center justify-between md:justify-center md:gap-4">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isPast = index < currentIndex;
          const Icon = step.icon;

          // Step is clickable if: allowAllNavigation OR (has callback AND (completed OR past))
          const isClickable = onStepClick && (allowAllNavigation || isCompleted || isPast);

          const stepIndicator = (
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200",
                "border-2",
                isCompleted || isPast
                  ? "bg-daybreak-teal border-daybreak-teal text-white"
                  : isCurrent
                  ? "bg-daybreak-teal border-daybreak-teal text-white"
                  : "bg-background border-border text-muted-foreground"
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              {isCompleted ? (
                <Check className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Icon className="w-5 h-5" aria-hidden="true" />
              )}
            </div>
          );

          const stepLabel = (
            <span
              className={cn(
                "text-xs md:text-sm font-medium transition-colors",
                "hidden md:block",
                isCurrent || isCompleted || isPast
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          );

          return (
            <li
              key={step.id}
              className="flex flex-col items-center gap-1 md:flex-row md:gap-2"
            >
              {isClickable ? (
                <button
                  type="button"
                  onClick={() => onStepClick(step.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 md:flex-row md:gap-2",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-daybreak-teal focus-visible:ring-offset-2",
                    "rounded-lg cursor-pointer group",
                    "hover:scale-105 active:scale-95 transition-transform duration-150"
                  )}
                  aria-label={`Go to ${step.label} step`}
                >
                  <div className="group-hover:shadow-md group-hover:shadow-daybreak-teal/30 rounded-full transition-shadow duration-200">
                    {stepIndicator}
                  </div>
                  {stepLabel}
                </button>
              ) : (
                <>
                  {stepIndicator}
                  {stepLabel}
                </>
              )}

              {/* Screen reader text */}
              <span className="sr-only">
                {step.label}
                {isCompleted ? " (completed)" : isCurrent ? " (current)" : ""}
              </span>

              {/* Connector line - not after last step */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "hidden md:block w-8 lg:w-16 h-0.5 mx-2",
                    index < currentIndex || completedSteps.includes(STEPS[index + 1].id)
                      ? "bg-daybreak-teal"
                      : "bg-border"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { OnboardingProgress, STEPS };
export type { OnboardingProgressProps, StepId };
