/**
 * InfoTooltip component for contextual help and tips
 *
 * Displays a help icon (?) that reveals tips in a popover on click.
 * Used throughout forms to provide non-essential contextual information
 * without cluttering the interface.
 *
 * Best practices:
 * - Keep tips to 3-5 items maximum
 * - Use reassuring, non-judgmental language
 * - Never put essential information in tooltips (they can be skipped)
 */
"use client";

import * as React from "react";
import { HelpCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * Props for the InfoTooltip component
 */
export interface InfoTooltipProps {
  /** Array of tip strings to display (3-5 recommended) */
  tips: string[];
  /** Optional title displayed at the top of the popover */
  title?: string;
  /** Optional URL for "Learn more" link */
  learnMoreUrl?: string;
  /** Optional text for learn more link (defaults to "Learn more") */
  learnMoreText?: string;
  /** Alignment relative to trigger */
  align?: "start" | "center" | "end";
  /** Size variant for the icon */
  size?: "sm" | "default";
  /** Additional className for the trigger button */
  className?: string;
  /** Custom trigger element (defaults to HelpCircle icon) */
  children?: React.ReactNode;
}

/**
 * InfoTooltip component
 *
 * Renders a help icon that reveals contextual tips in a popover.
 * Follows accessibility best practices with proper ARIA attributes.
 *
 * @example
 * ```tsx
 * <Label className="flex items-center gap-1">
 *   Medications
 *   <InfoTooltip
 *     tips={[
 *       "Include prescription medications",
 *       "Note any supplements",
 *       "This helps therapists understand the full picture"
 *     ]}
 *     title="Medication Information"
 *   />
 * </Label>
 * ```
 */
export function InfoTooltip({
  tips,
  title,
  learnMoreUrl,
  learnMoreText = "Learn more",
  align = "center",
  size = "default",
  className,
  children,
}: InfoTooltipProps) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-full",
            "text-muted-foreground hover:text-daybreak-teal",
            "transition-colors focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-ring focus-visible:ring-offset-2",
            className
          )}
          aria-label={title || "More information"}
        >
          {children || <HelpCircle className={cn(iconSize, "shrink-0")} />}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-72 p-3"
        sideOffset={8}
      >
        <div className="space-y-2">
          {title && (
            <p className="font-medium text-sm text-foreground">{title}</p>
          )}
          <ul className="space-y-1.5" role="list">
            {tips.map((tip, index) => (
              <li
                key={index}
                className="text-sm text-muted-foreground flex items-start gap-2"
              >
                <span
                  className="mt-1.5 h-1 w-1 rounded-full bg-daybreak-teal shrink-0"
                  aria-hidden="true"
                />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
          {learnMoreUrl && (
            <a
              href={learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm text-daybreak-teal hover:underline"
            >
              {learnMoreText} →
            </a>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
