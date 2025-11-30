/**
 * CostEstimationCard component for displaying therapy session cost estimates
 *
 * Shows per-session cost estimate with insurance coverage breakdown,
 * carrier information, and disclaimer text. Handles loading and error
 * states gracefully with fallback messaging.
 *
 * Features:
 * - Per-session cost display with formatting
 * - Insurance carrier name
 * - Coverage breakdown (percentage/amount)
 * - Copay and coinsurance display
 * - Disclaimer text from API
 * - Loading skeleton state
 * - Error state with support contact
 *
 * Visual Design:
 * - Daybreak teal accents
 * - Cream background sections
 * - Clear visual hierarchy
 * - Responsive mobile-first layout
 *
 * Accessibility:
 * - Semantic HTML structure
 * - ARIA labels for status regions
 * - Screen reader friendly
 */
"use client";

import * as React from "react";
import { DollarSign, Shield, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatPerSessionRate, formatPercentage } from "@/lib/utils/currency";
import { maskMemberId } from "@/features/insurance/utils";
import type { CostEstimate } from "@/lib/validations/cost";
import { DeductibleTracker } from "./DeductibleTracker";
import { OutOfPocketTracker } from "./OutOfPocketTracker";

/**
 * Props for CostEstimationCard component
 * @param costEstimate - Cost estimate data from API
 * @param memberId - Member ID to display masked (optional)
 * @param loading - Whether cost data is loading
 * @param error - Error object if fetch failed
 * @param onRetry - Callback for retry action
 * @param className - Optional additional CSS classes
 */
export interface CostEstimationCardProps {
  costEstimate: CostEstimate | null;
  memberId?: string;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
}

/**
 * Loading skeleton state for cost card
 *
 * Displays animated loading state matching the card's final layout
 * to minimize layout shift when data loads.
 */
function LoadingState() {
  return (
    <Card className="w-full max-w-[640px] mx-auto">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div
          className="relative"
          role="status"
          aria-live="polite"
          aria-label="Calculating your cost estimate"
        >
          <Loader2
            className="h-12 w-12 text-daybreak-teal animate-spin"
            aria-hidden="true"
          />
        </div>
        <p className="mt-4 text-muted-foreground text-sm">
          Calculating your estimate...
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Error state component with support contact
 *
 * Displays friendly error message with actionable support options
 * when cost estimation is unavailable.
 */
function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <Card className="w-full max-w-[640px] mx-auto border-amber-200">
      <CardContent className="flex flex-col items-center justify-center py-8">
        <div
          className="rounded-full bg-amber-50 p-3 mb-4"
          aria-hidden="true"
        >
          <AlertCircle className="h-8 w-8 text-amber-600" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Unable to Estimate Cost
        </h3>
        <p
          className="text-sm text-muted-foreground text-center mb-4 max-w-sm"
          role="alert"
        >
          We're unable to calculate your cost estimate at this time.
          {error.message ? ` ${error.message}` : ""}
        </p>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Please contact our support team for assistance with cost information.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-daybreak-teal hover:text-daybreak-teal/80 text-sm font-medium"
          >
            Try again
          </button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Coverage details display row
 */
function CoverageRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

/**
 * Renders cost estimation card with coverage breakdown
 *
 * Main component that displays cost estimate information including
 * per-session pricing, insurance coverage, and disclaimers.
 *
 * AC-6.1.1: Displays per-session estimate within 2 seconds
 * AC-6.1.2: Shows carrier name and coverage breakdown
 * AC-6.1.3: Shows "Unable to estimate" with support contact on error
 * AC-6.1.4: Displays disclaimer text from API
 * AC-6.1.5: Masks member ID showing only last 4 digits
 *
 * @example
 * <CostEstimationCard
 *   costEstimate={estimate}
 *   memberId="ABC123456789"
 *   loading={false}
 * />
 */
export function CostEstimationCard({
  costEstimate,
  memberId,
  loading = false,
  error = null,
  onRetry,
  className,
}: CostEstimationCardProps) {
  // Show loading state
  if (loading) {
    return <LoadingState />;
  }

  // Show error state
  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  // Show empty state if no cost estimate
  if (!costEstimate) {
    return (
      <Card className="w-full max-w-[640px] mx-auto">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            No cost estimate available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full max-w-[640px] mx-auto", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Cost icon */}
            <div
              className="rounded-full bg-daybreak-teal/10 p-2"
              aria-hidden="true"
            >
              <DollarSign className="h-5 w-5 text-daybreak-teal" />
            </div>
            <div>
              <CardTitle className="text-lg">Your Estimated Cost</CardTitle>
              <CardDescription>
                Based on {costEstimate.insuranceCarrier} coverage
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Per-session cost display */}
        <div className="text-center py-6 bg-cream/30 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">
            Per Session Cost
          </p>
          <p className="text-4xl font-bold text-daybreak-teal font-serif">
            {formatPerSessionRate(costEstimate.perSessionCost)}
          </p>
        </div>

        {/* Coverage breakdown */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-daybreak-teal" aria-hidden="true" />
            Coverage Details
          </h4>
          <div className="space-y-0 border rounded-lg p-4">
            {/* Insurance coverage percentage or amount */}
            {costEstimate.insuranceCoverage && (
              <>
                {costEstimate.insuranceCoverage.percentage != null && (
                  <CoverageRow
                    label="Insurance Coverage"
                    value={formatPercentage(costEstimate.insuranceCoverage.percentage)}
                  />
                )}
                {costEstimate.insuranceCoverage.amount != null && (
                  <CoverageRow
                    label="Coverage Amount"
                    value={formatCurrency(costEstimate.insuranceCoverage.amount)}
                  />
                )}
                {costEstimate.insuranceCoverage.description && (
                  <p className="text-xs text-muted-foreground pt-2">
                    {costEstimate.insuranceCoverage.description}
                  </p>
                )}
              </>
            )}

            {/* Copay */}
            {costEstimate.copay != null && (
              <CoverageRow
                label="Copay"
                value={formatCurrency(costEstimate.copay)}
              />
            )}

            {/* Coinsurance */}
            {costEstimate.coinsurance != null && (
              <CoverageRow
                label="Coinsurance"
                value={formatPercentage(costEstimate.coinsurance)}
              />
            )}

            {/* Member ID (masked) */}
            {memberId && (
              <CoverageRow
                label="Member ID"
                value={maskMemberId(memberId)}
              />
            )}
          </div>
        </div>

        {/* Deductible Tracker - AC-6.3.1, AC-6.3.2, AC-6.3.4 */}
        <DeductibleTracker
          deductibleInfo={costEstimate.deductible || null}
          isLoading={false}
          isAvailable={!!costEstimate.deductible}
        />

        {/* Out-of-Pocket Tracker - AC-6.3.3, AC-6.3.4, AC-6.3.5 */}
        <OutOfPocketTracker
          outOfPocketInfo={costEstimate.outOfPocket || null}
          isLoading={false}
          isAvailable={!!costEstimate.outOfPocket}
        />

        {/* Disclaimer */}
        {costEstimate.disclaimer && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs text-amber-800">
              <strong>Important:</strong> {costEstimate.disclaimer}
            </p>
          </div>
        )}

        {/* Default disclaimer if none provided */}
        {!costEstimate.disclaimer && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-700">
              <strong>Please note:</strong> Final cost may vary based on your specific plan
              and the services provided. This is an estimate only.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

CostEstimationCard.displayName = "CostEstimationCard";
