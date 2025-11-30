/**
 * SelfPayRateCard component for displaying self-pay therapy pricing
 *
 * Shows per-session self-pay rate with optional package discount options.
 * Allows users to select self-pay as their payment preference and choose
 * bulk session packages for savings.
 *
 * Features:
 * - Base per-session rate display
 * - Package discount cards with savings percentage
 * - "Choose self-pay" action button
 * - Package selection for bulk purchase
 * - Financial assistance information
 * - Loading and error states
 *
 * Visual Design:
 * - Daybreak teal accents for primary actions
 * - Cream background for package cards
 * - Clear savings indicators
 * - Responsive mobile-first layout
 *
 * Accessibility:
 * - Semantic HTML structure
 * - ARIA labels for interactive elements
 * - Keyboard navigation support
 * - Screen reader friendly pricing
 *
 * AC-6.2.1: Always display self-pay per-session rate
 * AC-6.2.2: Show package discounts with savings percentage
 * AC-6.2.5: "Choose self-pay" button updates session preference
 */
"use client";

import * as React from "react";
import { DollarSign, Package, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercentage } from "@/lib/utils/currency";
import type { SelfPayRate, SelfPayPackage } from "@/lib/validations/cost";

/**
 * Props for SelfPayRateCard component
 * @param selfPayRates - Self-pay rate data from API
 * @param loading - Whether rate data is loading
 * @param error - Error object if fetch failed
 * @param onSelectSelfPay - Callback when "Choose self-pay" is clicked
 * @param onSelectPackage - Callback when a package is selected
 * @param selectedPackageId - Currently selected package ID (if any)
 * @param isSelecting - Whether a selection mutation is in progress
 * @param className - Optional additional CSS classes
 */
export interface SelfPayRateCardProps {
  selfPayRates: SelfPayRate | null;
  loading?: boolean;
  error?: Error | null;
  onSelectSelfPay?: () => void;
  onSelectPackage?: (packageId: string) => void;
  selectedPackageId?: string | null;
  isSelecting?: boolean;
  className?: string;
}

/**
 * Loading skeleton state for self-pay card
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
          aria-label="Loading self-pay rates"
        >
          <Loader2
            className="h-12 w-12 text-daybreak-teal animate-spin"
            aria-hidden="true"
          />
        </div>
        <p className="mt-4 text-muted-foreground text-sm">
          Loading pricing options...
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Error state component
 *
 * Displays friendly error message when self-pay rates are unavailable
 */
function ErrorState({ error }: { error: Error }) {
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
          Unable to Load Self-Pay Rates
        </h3>
        <p
          className="text-sm text-muted-foreground text-center mb-4 max-w-sm"
          role="alert"
        >
          We're unable to load self-pay pricing at this time.
          {error.message ? ` ${error.message}` : ""}
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Package discount card component
 *
 * Displays individual package option with savings and selection
 */
function PackageCard({
  pkg,
  isSelected,
  onSelect,
  isSelecting,
}: {
  pkg: SelfPayPackage;
  isSelected: boolean;
  onSelect: () => void;
  isSelecting: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-lg border-2 p-4 transition-all",
        isSelected
          ? "border-daybreak-teal bg-daybreak-teal/5"
          : "border-border bg-cream/30 hover:border-daybreak-teal/50"
      )}
    >
      {/* Savings badge */}
      {pkg.savingsPercentage > 0 && (
        <div className="absolute -top-3 right-4">
          <span className="inline-flex items-center gap-1 bg-daybreak-teal text-white text-xs font-semibold px-3 py-1 rounded-full">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Save {formatPercentage(pkg.savingsPercentage)}
          </span>
        </div>
      )}

      <div className="space-y-3">
        {/* Package name and session count */}
        <div>
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Package className="h-4 w-4 text-daybreak-teal" aria-hidden="true" />
            {pkg.name}
          </h4>
          <p className="text-sm text-muted-foreground">
            {pkg.sessionCount} sessions
          </p>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-2xl font-bold text-daybreak-teal font-serif">
              {formatCurrency(pkg.totalPrice)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(pkg.pricePerSession)} per session
            </p>
          </div>

          {/* Select button */}
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={onSelect}
            disabled={isSelecting}
            className={cn(
              isSelected && "bg-daybreak-teal hover:bg-daybreak-teal/90"
            )}
          >
            {isSelecting && isSelected ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Selecting...
              </>
            ) : isSelected ? (
              "Selected"
            ) : (
              "Select"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Renders self-pay rate card with package options
 *
 * Main component that displays self-pay pricing information including
 * base rate and package discount options with selection capability.
 *
 * AC-6.2.1: Always display self-pay per-session rate
 * AC-6.2.2: Show package discounts with savings percentage
 * AC-6.2.5: "Choose self-pay" button updates session preference
 *
 * @example
 * <SelfPayRateCard
 *   selfPayRates={rates}
 *   onSelectSelfPay={handleSelectSelfPay}
 *   onSelectPackage={handleSelectPackage}
 *   loading={false}
 * />
 */
export function SelfPayRateCard({
  selfPayRates,
  loading = false,
  error = null,
  onSelectSelfPay,
  onSelectPackage,
  selectedPackageId = null,
  isSelecting = false,
  className,
}: SelfPayRateCardProps) {
  // Show loading state
  if (loading) {
    return <LoadingState />;
  }

  // Show error state
  if (error) {
    return <ErrorState error={error} />;
  }

  // Show empty state if no rates
  if (!selfPayRates) {
    return (
      <Card className="w-full max-w-[640px] mx-auto">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            No self-pay rates available.
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
            {/* Self-pay icon */}
            <div
              className="rounded-full bg-daybreak-teal/10 p-2"
              aria-hidden="true"
            >
              <DollarSign className="h-5 w-5 text-daybreak-teal" />
            </div>
            <div>
              <CardTitle className="text-lg">Self-Pay Rate</CardTitle>
              <CardDescription>
                Pay directly without insurance
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Base per-session rate - AC-6.2.1 */}
        <div className="text-center py-6 bg-cream/30 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">
            Per Session Rate
          </p>
          <p className="text-4xl font-bold text-daybreak-teal font-serif">
            {formatCurrency(selfPayRates.perSessionRate)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            No insurance needed
          </p>
        </div>

        {/* Package options - AC-6.2.2 */}
        {selfPayRates.packages.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Package Options
            </h4>
            <div className="space-y-4">
              {selfPayRates.packages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  isSelected={selectedPackageId === pkg.id}
                  onSelect={() => onSelectPackage?.(pkg.id)}
                  isSelecting={isSelecting && selectedPackageId === pkg.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Financial assistance notice */}
        {selfPayRates.financialAssistanceAvailable && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Financial assistance available:</strong> We offer sliding
              scale options for families who need support. Contact our team to
              learn more.
            </p>
          </div>
        )}

        {/* Choose self-pay button - AC-6.2.5 */}
        {onSelectSelfPay && (
          <Button
            onClick={onSelectSelfPay}
            disabled={isSelecting}
            className="w-full bg-daybreak-teal hover:bg-daybreak-teal/90"
            size="lg"
          >
            {isSelecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Selecting...
              </>
            ) : (
              "Choose Self-Pay"
            )}
          </Button>
        )}

        {/* Disclaimer */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-700">
            <strong>Please note:</strong> Self-pay rates are set in advance and
            provide price certainty. You can always add insurance later if your
            coverage changes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

SelfPayRateCard.displayName = "SelfPayRateCard";
