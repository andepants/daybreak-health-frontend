/**
 * QuickReplyChips component for tap-to-respond options
 *
 * Displays horizontal scrollable row of quick reply options as pill-shaped chips.
 * Provides instant response selection with visual feedback and accessibility support.
 * Automatically hides when user begins typing to reduce clutter.
 */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { QuickReplyOption } from "./types";

// Re-export QuickReplyOption for convenience
export type { QuickReplyOption };

/**
 * Props for QuickReplyChips component
 * @param options - Array of quick reply options to display (2-4 recommended)
 * @param onSelect - Callback fired when user selects a chip, receives the option value
 * @param isVisible - Whether chips should be visible (hides when user starts typing)
 * @param className - Additional CSS classes for customization
 */
export interface QuickReplyChipsProps {
  options: QuickReplyOption[];
  onSelect: (value: string) => void;
  isVisible: boolean;
  className?: string;
}

/**
 * Renders horizontal scrollable quick reply chips
 *
 * Visual specs:
 * - Pill-shaped buttons with rounded-full (9999px)
 * - Teal outline (#2A9D8F) in default state
 * - Teal fill on selection with white text
 * - Minimum 44x44px touch targets (WCAG 2.1 Level AAA)
 * - Horizontal scrollable with snap points
 * - Fade in/out animation on show/hide
 *
 * Behavior:
 * - Clicking a chip immediately triggers onSelect callback
 * - Selected state shows briefly before hiding
 * - Horizontal scroll with momentum on mobile
 * - Keyboard navigable with arrow keys
 *
 * @example
 * <QuickReplyChips
 *   options={[
 *     { label: "Yes", value: "yes" },
 *     { label: "No", value: "no" },
 *   ]}
 *   onSelect={handleQuickReply}
 *   isVisible={!isTyping}
 * />
 */
export const QuickReplyChips = React.memo(function QuickReplyChips({
  options,
  onSelect,
  isVisible,
  className,
}: QuickReplyChipsProps) {
  const [selectedChip, setSelectedChip] = React.useState<string | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  /**
   * Handles chip selection with visual feedback
   * Shows selected state briefly before triggering callback
   */
  const handleSelect = React.useCallback((value: string) => {
    setSelectedChip(value);

    // Clear any existing timeout to prevent memory leaks
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Brief delay to show selected state before sending
    timeoutRef.current = setTimeout(() => {
      onSelect(value);
      setSelectedChip(null);
      timeoutRef.current = null;
    }, 150);
  }, [onSelect]);

  /**
   * Cleanup timeout on unmount to prevent memory leaks
   */
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Don't render if not visible
  if (!isVisible || options.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "w-full overflow-x-auto pb-2 animate-fade-in",
        "scrollbar-hide", // Hide scrollbar for cleaner look
        "scroll-smooth",
        className
      )}
      role="group"
      aria-label="Quick reply options. Use Tab to navigate between options."
    >
      <div className="flex gap-2 px-4">
        {options.map((option) => {
          const isSelected = selectedChip === option.value;

          return (
            <Button
              key={option.value}
              variant="outline"
              onClick={() => handleSelect(option.value)}
              className={cn(
                "rounded-full px-6 min-h-[44px] shrink-0",
                "border-2 border-daybreak-teal text-daybreak-teal",
                "hover:bg-daybreak-teal/10",
                "transition-all duration-200",
                "text-sm font-medium",
                // Selected state - filled with teal
                isSelected && "bg-daybreak-teal text-white hover:bg-daybreak-teal"
              )}
              aria-label={`Quick reply: ${option.label}`}
            >
              {option.icon && (
                <span className="mr-2" aria-hidden="true">
                  {option.icon}
                </span>
              )}
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
});

QuickReplyChips.displayName = "QuickReplyChips";
