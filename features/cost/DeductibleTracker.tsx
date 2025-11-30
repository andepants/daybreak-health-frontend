/**
 * DeductibleTracker component for displaying annual deductible progress
 *
 * Shows deductible status with visual progress bar, amount tracking,
 * and helpful messaging about cost implications. Handles graceful
 * degradation when deductible data is unavailable from the insurance API.
 *
 * Features:
 * - Progress bar visualization of deductible met vs total
 * - Displays remaining deductible amount in currency format
 * - Shows "Costs may decrease after deductible is met" note
 * - Graceful handling of unavailable data with helpful messaging
 * - Loading skeleton state
 * - Accessible ARIA labels and screen reader support
 *
 * Visual Design:
 * - Daybreak teal for progress indicator
 * - Gray background for remaining progress
 * - Clear visual hierarchy
 * - Responsive mobile-first layout
 *
 * Accessibility:
 * - ARIA labels for progress bar
 * - Screen reader announcements for progress percentage
 * - Semantic HTML structure
 * - Keyboard navigation support
 *
 * AC-6.3.1: Given deductible data available, display progress bar visualization
 * AC-6.3.2: Show remaining deductible amount in currency format
 * AC-6.3.4: Given deductible data unavailable, hide tracker with explanation link
 */
"use client";

import * as React from "react";
import { TrendingDown, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils/currency";
import type { DeductibleInfo } from "@/lib/validations/cost";

/**
 * Props for DeductibleTracker component
 * @param deductibleInfo - Deductible tracking data from API
 * @param isLoading - Whether deductible data is loading
 * @param isAvailable - Whether deductible data is available from insurance
 * @param onContactInsurance - Callback when "Contact insurance" link is clicked
 * @param className - Optional additional CSS classes
 */
export interface DeductibleTrackerProps {
  deductibleInfo: DeductibleInfo | null;
  isLoading?: boolean;
  isAvailable?: boolean;
  onContactInsurance?: () => void;
  className?: string;
}

/**
 * Loading skeleton state for deductible tracker
 *
 * Displays animated loading state matching the tracker's final layout
 * to minimize layout shift when data loads.
 */
function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 text-daybreak-teal animate-spin" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Loading deductible information...</p>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full animate-pulse" />
    </div>
  );
}

/**
 * Unavailable state component with helpful messaging
 *
 * Displays when insurance API cannot provide deductible information,
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
            Unable to Determine Deductible Status
          </h4>
          <p className="text-sm text-amber-800">
            We're unable to retrieve your deductible information from your insurance provider.
            Please contact your insurance directly for details about your annual deductible
            and how much you've met.
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
 * Calculates progress percentage for deductible
 *
 * @param met - Amount of deductible met in cents
 * @param total - Total annual deductible in cents
 * @returns Progress percentage (0-100)
 */
function calculateProgress(met: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((met / total) * 100), 100);
}

/**
 * Renders deductible tracker with progress visualization
 *
 * Main component that displays deductible tracking information including
 * progress bar, remaining amount, and helpful messaging. Handles loading
 * and unavailable states gracefully.
 *
 * AC-6.3.1: Displays progress bar visualization when data available
 * AC-6.3.2: Shows remaining deductible amount in currency format
 * AC-6.3.4: Hides tracker with explanation when data unavailable
 *
 * @example
 * <DeductibleTracker
 *   deductibleInfo={{ total: 150000, met: 50000, remaining: 100000 }}
 *   isAvailable={true}
 * />
 */
export function DeductibleTracker({
  deductibleInfo,
  isLoading = false,
  isAvailable = true,
  onContactInsurance,
  className,
}: DeductibleTrackerProps) {
  // Show loading state
  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        <LoadingState />
      </div>
    );
  }

  // Show unavailable state if data not available
  if (!isAvailable || !deductibleInfo) {
    return (
      <div className={cn("w-full", className)}>
        <UnavailableState onContactInsurance={onContactInsurance} />
      </div>
    );
  }

  // Calculate progress percentage
  const progress = calculateProgress(deductibleInfo.met, deductibleInfo.total);
  const isDeductibleMet = deductibleInfo.remaining === 0;

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-daybreak-teal/10 p-2" aria-hidden="true">
            <TrendingDown className="h-4 w-4 text-daybreak-teal" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Annual Deductible</h4>
            <p className="text-xs text-muted-foreground">
              {isDeductibleMet ? "Deductible met" : "Tracking your progress"}
            </p>
          </div>
        </div>
        {/* Progress percentage */}
        <span className="text-sm font-medium text-daybreak-teal">{progress}%</span>
      </div>

      {/* Progress bar - AC-6.3.1 */}
      <div className="space-y-2">
        <Progress
          value={progress}
          aria-label="Deductible progress"
          className="h-3"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(deductibleInfo.met)} met</span>
          <span>{formatCurrency(deductibleInfo.total)} total</span>
        </div>
      </div>

      {/* Remaining amount - AC-6.3.2 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-blue-900">Remaining Deductible</span>
            <span className="text-lg font-semibold text-blue-900">
              {formatCurrency(deductibleInfo.remaining)}
            </span>
          </div>
          {!isDeductibleMet && (
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Costs may decrease after your deductible is met.
              Contact your insurance for specific details about your coverage.
            </p>
          )}
          {isDeductibleMet && (
            <p className="text-xs text-blue-800">
              <strong>Great news:</strong> You've met your annual deductible!
              Your out-of-pocket costs may be lower for the rest of the year.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

DeductibleTracker.displayName = "DeductibleTracker";
