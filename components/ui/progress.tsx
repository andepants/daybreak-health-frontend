/**
 * Progress component for displaying progress bars
 *
 * A component for displaying progress indicators, based on shadcn/ui patterns.
 * Used primarily for deductible and out-of-pocket tracking visualizations.
 *
 * Features:
 * - Customizable progress value (0-100)
 * - Accessible ARIA attributes
 * - Smooth animation transitions
 * - Theming support via CSS variables
 * - Screen reader friendly
 *
 * Accessibility:
 * - Uses ARIA progressbar role
 * - Announces current value to screen readers
 * - Supports aria-label for context
 */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Props for Progress component
 * @param value - Progress value from 0 to 100
 * @param className - Optional additional CSS classes
 * @param indicatorClassName - Optional CSS classes for the indicator bar
 * @param aria-label - Accessible label for screen readers
 */
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  indicatorClassName?: string;
}

/**
 * Progress bar component
 *
 * Displays a horizontal progress bar with customizable value and styling.
 * Uses native HTML with proper ARIA attributes for accessibility.
 *
 * @example
 * <Progress value={65} aria-label="Deductible progress" />
 * <Progress value={100} className="h-3" indicatorClassName="bg-green-500" />
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, indicatorClassName, ...props }, ref) => {
    // Clamp value between 0 and 100
    const clampedValue = Math.min(Math.max(value, 0), 100);

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clampedValue}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-gray-200",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full bg-daybreak-teal transition-all duration-300 ease-in-out",
            indicatorClassName
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
