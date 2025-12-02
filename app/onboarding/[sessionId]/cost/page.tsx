/**
 * Cost Estimation Page
 *
 * Displays comprehensive cost comparison between insurance and self-pay options.
 * Shows per-session pricing, coverage breakdown, deductible tracking,
 * out-of-pocket progress, and personalized recommendations.
 *
 * Route: /onboarding/[sessionId]/cost
 *
 * Flow:
 * - Previous: /onboarding/[sessionId]/insurance
 * - Next: /onboarding/[sessionId]/matching
 *
 * Features:
 * - Side-by-side insurance vs self-pay comparison
 * - All cost fields: perSessionCost, coverage, copay, coinsurance
 * - Deductible and out-of-pocket maximum tracking
 * - Package options for self-pay
 * - Personalized recommendation banner
 * - Insurance card thumbnail preview
 * - Graceful error handling with support contact
 * - Loading state with comparison calculation message
 *
 * Implements:
 * - Story 6.1: Cost Estimation Display
 * - Story 6.2: Self-Pay Rate Display
 * - Story 6.3: Deductible and Out-of-Pocket Tracking
 */
"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { EnhancedCostComparisonView } from "@/features/cost/EnhancedCostComparisonView";
import { useCostComparison } from "@/features/cost/hooks/useCostComparison";
import { Button } from "@/components/ui/button";

/**
 * Props for Cost page
 * Receives sessionId from dynamic route parameter
 */
interface CostPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

/**
 * Cost Estimation page component
 *
 * Fetches comprehensive cost comparison data via GraphQL and displays
 * a side-by-side comparison of insurance vs self-pay options.
 *
 * Layout:
 * - Uses onboarding layout (header, progress bar, footer)
 * - Centered content with max-width for readability
 * - Mobile-first responsive design with stacked cards on mobile
 *
 * States:
 * - Loading: Shows animated skeleton with loading message
 * - Success: Shows full comparison with all cost fields
 * - Error: Shows error message with retry and support options
 * - No Insurance: Shows self-pay only with option to add insurance
 *
 * Performance:
 * - Apollo Client caching for instant re-renders
 * - Cache-and-network policy for fresh data with fast initial load
 * - Optimized loading states to minimize layout shift
 *
 * @example
 * Route: /onboarding/sess_abc123/cost
 */
export default function CostPage({ params }: CostPageProps) {
  const { sessionId } = use(params);
  const router = useRouter();

  /**
   * Fetch comprehensive cost comparison data
   * Includes insurance estimate, self-pay, deductible, OOP, and card images
   */
  const {
    insuranceEstimate,
    selfPayEstimate,
    deductibleStatus,
    insuranceDetails,
    recommendation,
    savingsIfSelfPay,
    highlightSelfPay,
    loading,
    error,
    refetch,
  } = useCostComparison(sessionId);

  /**
   * Handles back navigation to insurance page
   */
  function handleBack() {
    router.push(`/onboarding/${sessionId}/insurance`);
  }

  /**
   * Handles continue to matching page
   */
  function handleContinue() {
    router.push(`/onboarding/${sessionId}/matching`);
  }

  /**
   * Handles insurance selection
   * Stores preference and continues to matching
   */
  function handleSelectInsurance() {
    try {
      // Store payment preference in localStorage
      const stored = localStorage.getItem(`onboarding_session_${sessionId}`);
      const data = stored ? JSON.parse(stored) : { data: {} };
      data.data.paymentPreference = "insurance";
      localStorage.setItem(`onboarding_session_${sessionId}`, JSON.stringify(data));

      // Continue to matching
      router.push(`/onboarding/${sessionId}/matching`);
    } catch (err) {
      console.error("Failed to save payment preference:", err);
      // Still continue - preference can be set later
      router.push(`/onboarding/${sessionId}/matching`);
    }
  }

  /**
   * Handles self-pay selection
   * Stores preference and continues to matching
   */
  function handleSelectSelfPay() {
    try {
      // Store payment preference in localStorage
      const stored = localStorage.getItem(`onboarding_session_${sessionId}`);
      const data = stored ? JSON.parse(stored) : { data: {} };
      data.data.paymentPreference = "self_pay";
      localStorage.setItem(`onboarding_session_${sessionId}`, JSON.stringify(data));

      // Continue to matching
      router.push(`/onboarding/${sessionId}/matching`);
    } catch (err) {
      console.error("Failed to save payment preference:", err);
      // Still continue - preference can be set later
      router.push(`/onboarding/${sessionId}/matching`);
    }
  }

  /**
   * Handles retry after error
   * Refetches cost comparison query
   */
  function handleRetry() {
    refetch();
  }

  /**
   * Opens support chat (Intercom)
   */
  function handleContactSupport() {
    // Open Intercom widget
    if (typeof window !== "undefined" && (window as any).Intercom) {
      (window as any).Intercom("show");
    } else {
      console.log("Support chat not available");
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-serif text-deep-text mb-2">
          Your Cost Options
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Compare your insurance coverage with our self-pay rates to find the
          best option for you.
        </p>
      </div>

      {/* Enhanced Cost Comparison View */}
      <EnhancedCostComparisonView
        insuranceEstimate={insuranceEstimate}
        selfPayEstimate={selfPayEstimate}
        deductibleStatus={deductibleStatus}
        insuranceDetails={insuranceDetails}
        recommendation={recommendation}
        savingsIfSelfPay={savingsIfSelfPay}
        highlightSelfPay={highlightSelfPay}
        loading={loading}
        error={error}
        onSelectInsurance={handleSelectInsurance}
        onSelectSelfPay={handleSelectSelfPay}
        onRetry={handleRetry}
      />

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 max-w-4xl mx-auto">
        <Button
          variant="outline"
          onClick={handleBack}
          className="w-full sm:w-auto"
        >
          Back to Insurance
        </Button>

        <Button
          onClick={handleContinue}
          disabled={loading || !!error}
          className="w-full sm:flex-1 bg-daybreak-teal hover:bg-daybreak-teal/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Matching
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-center max-w-4xl mx-auto">
        <p className="text-sm text-muted-foreground">
          Have questions about costs?{" "}
          <button
            onClick={handleContactSupport}
            className="text-daybreak-teal hover:text-daybreak-teal/80 underline"
          >
            Contact our support team
          </button>
        </p>
      </div>
    </div>
  );
}
