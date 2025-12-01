/**
 * Partial Fill Circle Component
 *
 * SVG-based circular progress indicator showing percentage completion.
 * Used in the onboarding progress stepper to show real completion status
 * instead of binary complete/incomplete.
 *
 * Features:
 * - Smooth animated progress arc
 * - Customizable size and stroke width
 * - Center icon support (checkmark when complete, custom icon otherwise)
 * - Accessible with ARIA progressbar role
 */

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface PartialFillCircleProps {
  /** Completion percentage (0-100) */
  percentage: number;
  /** Circle diameter in pixels (default: 40) */
  size?: number;
  /** Stroke width in pixels (default: 3) */
  strokeWidth?: number;
  /** Icon to show in center when not complete (lucide-react icons work great) */
  icon?: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
    "aria-hidden"?: boolean | "true" | "false";
  }>;
  /** Whether the section is 100% complete */
  isComplete?: boolean;
  /** Whether this is the current active step */
  isCurrent?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Renders a circular progress indicator with partial fill
 *
 * Uses SVG stroke-dasharray/dashoffset for the progress arc effect.
 * The circle is rotated -90 degrees so progress starts from the top.
 *
 * @example
 * ```tsx
 * <PartialFillCircle
 *   percentage={75}
 *   icon={ClipboardList}
 *   isComplete={false}
 *   isCurrent={true}
 * />
 * ```
 */
export function PartialFillCircle({
  percentage,
  size = 40,
  strokeWidth = 3,
  icon: Icon,
  isComplete = false,
  isCurrent = false,
  className,
}: PartialFillCircleProps) {
  // Calculate SVG values
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));
  const offset = circumference - (normalizedPercentage / 100) * circumference;

  // Determine visual state
  const showCheckmark = isComplete || percentage >= 100;
  const hasProgress = percentage > 0;

  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={normalizedPercentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${normalizedPercentage}% complete`}
    >
      {/* SVG Circle */}
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Background circle (always visible) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
          className={cn(
            "transition-colors duration-200",
            showCheckmark || isCurrent
              ? "stroke-daybreak-teal"
              : "stroke-border"
          )}
        />

        {/* Progress arc (only visible when there's partial progress) */}
        {hasProgress && !showCheckmark && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            className="stroke-daybreak-teal transition-all duration-300"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        )}
      </svg>

      {/* Center fill for complete/current state */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center rounded-full",
          "transition-colors duration-200",
          showCheckmark
            ? "bg-daybreak-teal"
            : isCurrent
            ? "bg-daybreak-teal"
            : hasProgress
            ? "bg-background"
            : "bg-background"
        )}
        style={{
          margin: strokeWidth / 2,
          width: size - strokeWidth,
          height: size - strokeWidth,
        }}
      >
        {showCheckmark ? (
          <Check
            className="text-white"
            style={{ width: size * 0.4, height: size * 0.4 }}
            aria-hidden="true"
          />
        ) : Icon ? (
          <Icon
            className={cn(
              "transition-colors duration-200",
              isCurrent ? "text-white" : "text-muted-foreground"
            )}
            style={{ width: size * 0.45, height: size * 0.45 }}
            aria-hidden="true"
          />
        ) : (
          <span
            className={cn(
              "text-sm font-medium transition-colors duration-200",
              isCurrent ? "text-white" : "text-muted-foreground"
            )}
          >
            {Math.round(normalizedPercentage)}%
          </span>
        )}
      </div>
    </div>
  );
}

export type { PartialFillCircleProps };
