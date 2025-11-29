/**
 * TypingIndicator component for AI thinking state
 *
 * Displays animated dots to show AI is processing a response.
 * Includes timeout states for long-running responses and retry functionality.
 * Matches AI chat bubble styling for seamless integration.
 *
 * @component
 * @example
 * ```tsx
 * <TypingIndicator
 *   isVisible={isAiResponding}
 *   onRetry={handleRetry}
 * />
 * ```
 */
"use client";

import * as React from "react";
import { Mountain, RotateCw } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Timeout state for progressively informing user of delays
 */
type TimeoutState = "typing" | "still-thinking" | "taking-long";

/**
 * Props for TypingIndicator component
 * @param isVisible - Whether the indicator should be displayed
 * @param onRetry - Optional callback fired when user clicks retry button
 * @param className - Additional CSS classes for customization
 */
export interface TypingIndicatorProps {
  isVisible: boolean;
  onRetry?: () => void;
  className?: string;
}

/**
 * Renders AI typing indicator with progressive timeout states
 *
 * Visual specs:
 * - Light teal background (#F0FDFA) matching AI chat bubbles
 * - Left-aligned with Daybreak avatar (40x40px)
 * - Three animated dots bouncing sequentially
 * - Fade-in animation on appear
 *
 * Timeout states:
 * - 0-5s: Three animated dots (default "typing" state)
 * - 5-15s: Dots + "Still thinking..." text
 * - 15s+: Dots + "Taking longer than usual..." + retry button
 *
 * Accessibility:
 * - role="status" for screen reader announcement
 * - aria-live="polite" for state changes
 * - aria-label describes current state
 *
 * @example
 * <TypingIndicator
 *   isVisible={isAiResponding}
 *   onRetry={handleRetry}
 * />
 */
export const TypingIndicator = React.memo(function TypingIndicator({
  isVisible,
  onRetry,
  className,
}: TypingIndicatorProps) {
  const [timeoutState, setTimeoutState] = React.useState<TimeoutState>("typing");

  /**
   * Manage timeout states with progressive delays
   * Cleans up timers on unmount or when visibility changes
   */
  React.useEffect(() => {
    if (!isVisible) {
      // Reset state when hidden
      setTimeoutState("typing");
      return;
    }

    // Set timeout for "Still thinking..." state (5 seconds)
    const stillThinkingTimer = setTimeout(() => {
      setTimeoutState("still-thinking");
    }, 5000);

    // Set timeout for "Taking longer..." state (15 seconds)
    const takingLongTimer = setTimeout(() => {
      setTimeoutState("taking-long");
    }, 15000);

    // Cleanup timers on unmount or visibility change
    return () => {
      clearTimeout(stillThinkingTimer);
      clearTimeout(takingLongTimer);
    };
  }, [isVisible]);

  /**
   * Handles retry button click
   * Resets timeout state and triggers parent callback
   */
  const handleRetry = () => {
    setTimeoutState("typing");
    onRetry?.();
  };

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  // Generate aria-label based on current state
  const ariaLabel =
    timeoutState === "typing"
      ? "AI is typing"
      : timeoutState === "still-thinking"
      ? "AI is still thinking"
      : "AI is taking longer than usual";

  return (
    <div
      className={cn("flex gap-2 w-full animate-fade-in", className)}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      {/* Daybreak avatar - matches AI ChatBubble */}
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback className="bg-daybreak-teal/10">
          <Mountain
            className="h-5 w-5 text-daybreak-teal"
            aria-label="Daybreak AI"
          />
        </AvatarFallback>
      </Avatar>

      {/* Indicator bubble */}
      <div className="flex flex-col max-w-[75%]">
        {/* Bubble container */}
        <div className="rounded-3xl px-4 py-3 bg-[#F0FDFA]">
          {/* Animated dots - sequential bounce animation */}
          <div className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full bg-daybreak-teal animate-typing-dot [animation-delay:0ms]"
              aria-hidden="true"
            />
            <span
              className="h-2 w-2 rounded-full bg-daybreak-teal animate-typing-dot [animation-delay:150ms]"
              aria-hidden="true"
            />
            <span
              className="h-2 w-2 rounded-full bg-daybreak-teal animate-typing-dot [animation-delay:300ms]"
              aria-hidden="true"
            />
          </div>

          {/* Timeout state messages */}
          {timeoutState === "still-thinking" && (
            <p className="text-sm text-muted-foreground mt-2" aria-hidden="true">
              Still thinking...
            </p>
          )}

          {timeoutState === "taking-long" && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground mb-2" aria-hidden="true">
                Taking longer than usual...
              </p>
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="text-xs"
                  aria-label="Retry sending message"
                >
                  <RotateCw className="h-3 w-3 mr-1" aria-hidden="true" />
                  Retry
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

TypingIndicator.displayName = "TypingIndicator";
