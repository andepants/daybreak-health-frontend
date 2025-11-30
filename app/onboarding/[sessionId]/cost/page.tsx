/**
 * Cost Estimation Page
 *
 * Displays estimated therapy session costs based on insurance information.
 * Shows per-session pricing, coverage breakdown, and disclaimer text.
 *
 * Route: /onboarding/[sessionId]/cost
 *
 * Flow:
 * - Previous: /onboarding/[sessionId]/insurance
 * - Next: /onboarding/[sessionId]/matching
 *
 * Features:
 * - Per-session cost estimate from backend
 * - Insurance carrier name and coverage details
 * - Copay and coinsurance display
 * - Deductible tracking (when available)
 * - Disclaimer text from API
 * - Graceful error handling with support contact
 * - Loading state with cost calculation message
 *
 * Implements:
 * - Story 6.1: Cost Estimation Display
 * - AC-6.1.1: Display per-session estimate within 2 seconds
 * - AC-6.1.2: Show carrier name and coverage breakdown
 * - AC-6.1.3: Show "Unable to estimate" with support contact
 * - AC-6.1.4: Display disclaimer text from API
 * - AC-6.1.5: Mask member ID showing only last 4 digits
 */
"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { CostEstimationCard } from "@/features/cost";
import { useCostEstimate } from "@/features/cost/useCostEstimate";
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
 * Fetches cost estimate via GraphQL and displays results.
 * Handles loading, success, and error states appropriately.
 *
 * Layout:
 * - Uses onboarding layout (header, progress bar, footer)
 * - Centered content with max-width 640px
 * - Mobile-first responsive design
 *
 * States:
 * - Loading: Shows animated spinner with calculation message
 * - Success: Shows cost card with breakdown
 * - Error: Shows error message with support contact option
 * - Empty: Shows message if no estimate available
 *
 * Performance:
 * - Apollo Client caching for instant re-renders
 * - Optimized loading states to minimize layout shift
 * - Error boundaries for graceful failure handling
 *
 * @example
 * Route: /onboarding/sess_abc123/cost
 */
export default function CostPage({ params }: CostPageProps) {
  const { sessionId } = use(params);
  const router = useRouter();

  /**
   * Fetch cost estimate for this session
   * Uses custom hook that wraps Apollo query
   */
  const { costEstimate, loading, error, refetch } = useCostEstimate(sessionId);

  /**
   * Get member ID from session for masked display
   * In production, this would come from session query or context
   *
   * @returns Member ID if available in localStorage
   */
  function getMemberId(): string | undefined {
    try {
      const stored = localStorage.getItem(`onboarding_session_${sessionId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.data?.insurance?.memberId;
      }
    } catch {
      // Silently fail - member ID display is optional
      return undefined;
    }
    return undefined;
  }

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
   * Handles retry after error
   * Refetches cost estimate query
   */
  function handleRetry() {
    refetch();
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-serif text-deep-text mb-2">
          Your Estimated Cost
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Based on your insurance information, here&apos;s what you can expect to pay
          per therapy session.
        </p>
      </div>

      {/* Cost Estimation Card */}
      <CostEstimationCard
        costEstimate={costEstimate}
        memberId={getMemberId()}
        loading={loading}
        error={error}
        onRetry={handleRetry}
      />

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 max-w-[640px] mx-auto">
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
      <div className="text-center max-w-[640px] mx-auto">
        <p className="text-sm text-muted-foreground">
          Have questions about costs?{" "}
          <button
            onClick={() => {
              // This would open Intercom widget in production
              console.log("Open support chat");
            }}
            className="text-daybreak-teal hover:text-daybreak-teal/80 underline"
          >
            Contact our support team
          </button>
        </p>
      </div>
    </div>
  );
}
