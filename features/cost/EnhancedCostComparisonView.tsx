/**
 * EnhancedCostComparisonView component for comprehensive cost comparison
 *
 * Main component that displays a complete side-by-side comparison of
 * insurance vs self-pay options with all available cost fields,
 * deductible/OOP tracking, recommendations, and insurance card preview.
 *
 * Features:
 * - Side-by-side cards comparing insurance vs self-pay
 * - All cost fields: perSessionCost, coverage, copay, coinsurance
 * - Deductible progress tracking with visual bar
 * - Out-of-pocket maximum tracking
 * - Recommendation banner with savings info
 * - Insurance card thumbnail with modal preview
 * - Loading and error states
 * - Responsive mobile-first layout
 *
 * Visual Design:
 * - Daybreak teal accents for recommended option
 * - Clear visual hierarchy for cost information
 * - Progress bars for deductible/OOP tracking
 * - Highlighted recommendation banner
 *
 * Accessibility:
 * - ARIA labels for all interactive elements
 * - Keyboard navigation support
 * - Screen reader announcements
 */
"use client";

import * as React from "react";
import { useState } from "react";
import { AlertCircle, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComparisonDetailCard } from "./ComparisonDetailCard";
import { DeductibleTracker } from "./DeductibleTracker";
import { OutOfPocketTracker } from "./OutOfPocketTracker";
import { RecommendationBanner } from "./RecommendationBanner";
import { InsuranceCardThumbnail } from "./InsuranceCardThumbnail";
import { InsuranceCardModal } from "./InsuranceCardModal";
import type {
  InsuranceEstimateData,
  SelfPayEstimateData,
  DeductibleStatusData,
  InsuranceDetailsData,
} from "./hooks/useCostComparison";

/**
 * Props for EnhancedCostComparisonView component
 */
export interface EnhancedCostComparisonViewProps {
  /** Insurance estimate data (null if not verified) */
  insuranceEstimate: InsuranceEstimateData | null;
  /** Self-pay estimate data */
  selfPayEstimate: SelfPayEstimateData | null;
  /** Deductible and OOP tracking data */
  deductibleStatus: DeductibleStatusData | null;
  /** Insurance details including card images */
  insuranceDetails: InsuranceDetailsData | null;
  /** Personalized recommendation text */
  recommendation: string | null;
  /** Amount saved if choosing self-pay (in cents) */
  savingsIfSelfPay: number | null;
  /** Whether self-pay is the recommended option */
  highlightSelfPay: boolean;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Callback when insurance is selected */
  onSelectInsurance?: () => void;
  /** Callback when self-pay is selected */
  onSelectSelfPay?: () => void;
  /** Callback to retry on error */
  onRetry?: () => void;
  /** Optional CSS classes */
  className?: string;
}

/**
 * Loading skeleton component
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-live="polite">
      {/* Recommendation skeleton */}
      <div className="h-20 bg-muted rounded-lg" />

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-80 bg-muted rounded-lg" />
        <div className="h-80 bg-muted rounded-lg" />
      </div>

      {/* Tracker skeletons */}
      <div className="h-32 bg-muted rounded-lg" />
      <div className="h-32 bg-muted rounded-lg" />

      <p className="text-center text-sm text-muted-foreground">
        <Loader2 className="inline h-4 w-4 animate-spin mr-2" aria-hidden="true" />
        Loading your cost comparison...
      </p>
    </div>
  );
}

/**
 * Error display component
 */
function ErrorDisplay({
  error,
  onRetry,
}: {
  error: Error;
  onRetry?: () => void;
}) {
  return (
    <Card className="p-8 text-center">
      <div className="space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-amber-600" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Unable to Load Cost Information</h3>
          <p className="text-muted-foreground">
            {error.message || "We're having trouble loading your cost comparison."}
          </p>
        </div>
        <div className="flex justify-center gap-3">
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              Try Again
            </Button>
          )}
          <Button variant="ghost" asChild>
            <a href="tel:+1-800-555-0100">Contact Support</a>
          </Button>
        </div>
      </div>
    </Card>
  );
}

/**
 * No insurance state - shows only self-pay
 */
function NoInsuranceState({
  selfPayEstimate,
  onSelectSelfPay,
}: {
  selfPayEstimate: SelfPayEstimateData | null;
  onSelectSelfPay?: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Insurance Not Verified
            </h3>
            <p className="text-sm text-blue-800">
              We don't have verified insurance information for you yet.
              You can proceed with self-pay now and add insurance later.
            </p>
          </div>
        </div>
      </div>

      <ComparisonDetailCard
        type="self_pay"
        title="Self-Pay"
        perSessionCost={selfPayEstimate?.baseRate || null}
        isRecommended
        packages={selfPayEstimate?.packageOptions}
        slidingScaleInfo={selfPayEstimate?.slidingScaleInfo}
        onSelect={onSelectSelfPay}
      />
    </div>
  );
}

/**
 * Renders a comprehensive cost comparison view
 *
 * Main component for the cost page that displays side-by-side
 * comparison of insurance vs self-pay options with all available
 * cost fields, trackers, and recommendations.
 *
 * @example
 * <EnhancedCostComparisonView
 *   insuranceEstimate={insuranceEstimate}
 *   selfPayEstimate={selfPayEstimate}
 *   deductibleStatus={deductibleStatus}
 *   insuranceDetails={insuranceDetails}
 *   recommendation={recommendation}
 *   highlightSelfPay={highlightSelfPay}
 *   onSelectInsurance={handleSelectInsurance}
 *   onSelectSelfPay={handleSelectSelfPay}
 * />
 */
export function EnhancedCostComparisonView({
  insuranceEstimate,
  selfPayEstimate,
  deductibleStatus,
  insuranceDetails,
  recommendation,
  savingsIfSelfPay,
  highlightSelfPay,
  loading = false,
  error,
  onSelectInsurance,
  onSelectSelfPay,
  onRetry,
  className,
}: EnhancedCostComparisonViewProps) {
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // Loading state
  if (loading) {
    return (
      <div className={cn("w-full max-w-4xl mx-auto", className)}>
        <LoadingSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("w-full max-w-4xl mx-auto", className)}>
        <ErrorDisplay error={error} onRetry={onRetry} />
      </div>
    );
  }

  // No insurance - show self-pay only
  if (!insuranceEstimate) {
    return (
      <div className={cn("w-full max-w-4xl mx-auto", className)}>
        <NoInsuranceState
          selfPayEstimate={selfPayEstimate}
          onSelectSelfPay={onSelectSelfPay}
        />
      </div>
    );
  }

  // Full comparison view
  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-6", className)}>
      {/* Recommendation banner */}
      <RecommendationBanner
        recommendation={recommendation}
        savingsIfSelfPay={savingsIfSelfPay}
        highlightSelfPay={highlightSelfPay}
      />

      {/* Section header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold font-serif text-foreground">
          Compare Your Options
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review your estimated costs for therapy sessions
        </p>
      </div>

      {/* Side-by-side comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Insurance card */}
        <ComparisonDetailCard
          type="insurance"
          title="With Insurance"
          perSessionCost={insuranceEstimate.perSessionCost}
          isRecommended={!highlightSelfPay}
          insuranceCarrier={insuranceDetails?.payerName}
          copayAmount={insuranceDetails?.copayAmount}
          coinsurancePercentage={insuranceDetails?.coinsurancePercentage}
          cardThumbnail={
            insuranceDetails?.cardImageFrontUrl ? (
              <InsuranceCardThumbnail
                imageUrl={insuranceDetails.cardImageFrontUrl}
                onClick={() => setIsCardModalOpen(true)}
                size={80}
              />
            ) : undefined
          }
          onSelect={onSelectInsurance}
        />

        {/* Self-pay card */}
        <ComparisonDetailCard
          type="self_pay"
          title="Self-Pay"
          perSessionCost={selfPayEstimate?.baseRate || null}
          isRecommended={highlightSelfPay}
          packages={selfPayEstimate?.packageOptions}
          slidingScaleInfo={selfPayEstimate?.slidingScaleInfo}
          onSelect={onSelectSelfPay}
        />
      </div>

      {/* Deductible and OOP trackers */}
      {deductibleStatus && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-serif">
              Your Insurance Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Deductible tracker */}
            <DeductibleTracker
              deductibleInfo={{
                total: Math.round(deductibleStatus.amount * 100), // Convert to cents
                met: Math.round(deductibleStatus.met * 100),
                remaining: Math.round(deductibleStatus.remaining * 100),
              }}
              isAvailable
            />

            {/* Out-of-pocket tracker */}
            {deductibleStatus.oopMaxAmount !== null && (
              <OutOfPocketTracker
                outOfPocketInfo={{
                  max: Math.round((deductibleStatus.oopMaxAmount || 0) * 100),
                  met: Math.round((deductibleStatus.oopMet || 0) * 100),
                  remaining: Math.round((deductibleStatus.oopRemaining || 0) * 100),
                }}
                isAvailable
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Important Note</p>
            <p>
              These are estimates based on the information we have. Final costs may vary
              depending on your specific insurance plan, deductible status, and benefits.
              Contact your insurance provider for exact coverage details.
            </p>
          </div>
        </div>
      </div>

      {/* Insurance card modal */}
      <InsuranceCardModal
        open={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        frontImageUrl={insuranceDetails?.cardImageFrontUrl}
        backImageUrl={insuranceDetails?.cardImageBackUrl}
        payerName={insuranceDetails?.payerName}
      />
    </div>
  );
}

EnhancedCostComparisonView.displayName = "EnhancedCostComparisonView";
