/**
 * OutOfPocketTracker component for displaying annual out-of-pocket maximum progress
 *
 * Shows out-of-pocket maximum status with visual progress bar, amount tracking,
 * and "You've reached your max" indicator when applicable. Handles graceful
 * degradation when OOP data is unavailable from the insurance API.
 *
 * Features:
 * - Progress bar visualization of OOP met vs maximum
 * - Displays amount applied toward annual maximum in currency format
 * - Shows "You've reached your max" indicator when OOP met >= OOP max
 * - Graceful handling of unavailable data with helpful messaging
 * - Loading skeleton state
 * - Accessible ARIA labels and screen reader support
 * - Consistent styling with DeductibleTracker
 *
 * Visual Design:
 * - Daybreak teal for progress indicator
 * - Gray background for remaining progress
 * - Special indicator for maximum reached
 * - Responsive mobile-first layout
 *
 * Accessibility:
 * - ARIA labels for progress bar
 * - Screen reader announcements for progress percentage
 * - Semantic HTML structure
 * - Keyboard navigation support
 *
 * AC-6.3.3: Display out-of-pocket maximum progress if available
 * AC-6.3.4: Given OOP data unavailable, hide tracker with explanation link
 * AC-6.3.5: Show "You've reached your max" indicator when applicable
 */
"use client";

import * as React from "react";
import { Shield, AlertCircle, ExternalLink, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils/currency";
import type { OutOfPocketInfo } from "@/lib/validations/cost";

/**
 * Props for OutOfPocketTracker component
 * @param outOfPocketInfo - Out-of-pocket maximum tracking data from API
 * @param isLoading - Whether OOP data is loading
 * @param isAvailable - Whether OOP data is available from insurance
 * @param onContactInsurance - Callback when "Contact insurance" link is clicked
 * @param className - Optional additional CSS classes
 */
export interface OutOfPocketTrackerProps {
  outOfPocketInfo: OutOfPocketInfo | null;
  isLoading?: boolean;
  isAvailable?: boolean;
  onContactInsurance?: () => void;
  className?: string;
}

/**
 * Loading skeleton state for OOP tracker
 *
 * Displays animated loading state matching the tracker's final layout
 * to minimize layout shift when data loads.
 */
function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 text-daybreak-teal animate-spin" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Loading out-of-pocket information...</p>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full animate-pulse" />
    </div>
  );
}

/**
 * Unavailable state component with helpful messaging
 *
 * Displays when insurance API cannot provide OOP maximum information,
 * with clear explanation and action link to contact insurance directly.
 */
function UnavailableState({ onContactInsurance }: { onContactInsurance?: () => void }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-amber-100 p-2 mt-0.5" aria-hidden="true">
          <AlertCircle className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="text-sm font-semibold text-amber-900">
            Unable to Determine Out-of-Pocket Maximum
          </h4>
          <p className="text-sm text-amber-800">
            We're unable to retrieve your out-of-pocket maximum information from your insurance
            provider. Please contact your insurance directly for details about your annual
            maximum and how much you've applied toward it.
          </p>
          {onContactInsurance && (
            <button
              onClick={onContactInsurance}
              className="inline-flex items-center gap-1 text-sm font-medium text-daybreak-teal hover:text-daybreak-teal/80 transition-colors"
            >
              Contact your insurance
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Calculates progress percentage for out-of-pocket maximum
 *
 * @param met - Amount applied toward OOP maximum in cents
 * @param max - Annual out-of-pocket maximum in cents
 * @returns Progress percentage (0-100)
 */
function calculateProgress(met: number, max: number): number {
  if (max === 0) return 0;
  return Math.min(Math.round((met / max) * 100), 100);
}

/**
 * Renders out-of-pocket tracker with progress visualization
 *
 * Main component that displays OOP maximum tracking information including
 * progress bar, remaining amount, and "max reached" indicator. Handles
 * loading and unavailable states gracefully.
 *
 * AC-6.3.3: Displays out-of-pocket maximum progress if available
 * AC-6.3.4: Hides tracker with explanation when data unavailable
 * AC-6.3.5: Shows "You've reached your max" indicator when applicable
 *
 * @example
 * <OutOfPocketTracker
 *   outOfPocketInfo={{ max: 500000, met: 320000, remaining: 180000 }}
 *   isAvailable={true}
 * />
 */
export function OutOfPocketTracker({
  outOfPocketInfo,
  isLoading = false,
  isAvailable = true,
  onContactInsurance,
  className,
}: OutOfPocketTrackerProps) {
  // Show loading state
  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        <LoadingState />
      </div>
    );
  }

  // Show unavailable state if data not available - AC-6.3.4
  if (!isAvailable || !outOfPocketInfo) {
    return (
      <div className={cn("w-full", className)}>
        <UnavailableState onContactInsurance={onContactInsurance} />
      </div>
    );
  }

  // Calculate progress percentage
  const progress = calculateProgress(outOfPocketInfo.met, outOfPocketInfo.max);
  const isMaxReached = outOfPocketInfo.remaining === 0 || outOfPocketInfo.met >= outOfPocketInfo.max;

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-daybreak-teal/10 p-2" aria-hidden="true">
            <Shield className="h-4 w-4 text-daybreak-teal" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Out-of-Pocket Maximum</h4>
            <p className="text-xs text-muted-foreground">
              {isMaxReached ? "Maximum reached" : "Annual maximum"}
            </p>
          </div>
        </div>
        {/* Progress percentage or max indicator */}
        {isMaxReached ? (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm font-medium">100%</span>
          </div>
        ) : (
          <span className="text-sm font-medium text-daybreak-teal">{progress}%</span>
        )}
      </div>

      {/* Progress bar - AC-6.3.3 */}
      <div className="space-y-2">
        <Progress
          value={progress}
          aria-label="Out-of-pocket progress"
          className="h-3"
          indicatorClassName={cn(isMaxReached && "bg-green-500")}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(outOfPocketInfo.met)} applied</span>
          <span>{formatCurrency(outOfPocketInfo.max)} maximum</span>
        </div>
      </div>

      {/* Maximum reached indicator - AC-6.3.5 */}
      {isMaxReached ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <h5 className="text-sm font-semibold text-green-900">
                You've Reached Your Maximum!
              </h5>
              <p className="text-xs text-green-800">
                You've met your annual out-of-pocket maximum. Your insurance should cover
                100% of covered services for the rest of the year. Verify with your
                insurance provider for specific details.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-blue-900">Remaining Until Max</span>
              <span className="text-lg font-semibold text-blue-900">
                {formatCurrency(outOfPocketInfo.remaining)}
              </span>
            </div>
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> After reaching your out-of-pocket maximum, your insurance
              typically covers 100% of covered services. Contact your insurance for details.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

OutOfPocketTracker.displayName = "OutOfPocketTracker";
