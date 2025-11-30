/**
 * Therapist Matching Page
 *
 * Displays matched therapists for the current onboarding session.
 * This is the page where parents see 2-3 recommended therapists
 * after completing the insurance submission step.
 *
 * Route: /onboarding/[sessionId]/matching
 *
 * Flow:
 * - Previous: /onboarding/[sessionId]/insurance
 * - Next: /onboarding/[sessionId]/schedule/[therapistId] (after booking)
 *
 * Features:
 * - Loading state while matching (1-3 seconds typically)
 * - 2-3 therapist cards ordered by match quality
 * - "Best Match" badge on top recommendation
 * - Match reasoning transparency
 * - Alternative options if no match feels right
 *
 * Implements:
 * - Story 5.1: Therapist Matching Results Display
 * - FR-011: Therapist suggestion based on assessment results
 */
"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { useGetMatchedTherapistsQuery } from "@/types/graphql";
import {
  MatchingLoadingState,
  TherapistMatchResults,
} from "@/features/matching";
import { Button } from "@/components/ui/button";

/**
 * Props for Matching page
 * Receives sessionId from dynamic route parameter
 */
interface MatchingPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

/**
 * Therapist Matching page component
 *
 * Fetches matched therapists via GraphQL and displays results.
 * Handles loading, success, and error states appropriately.
 *
 * Layout:
 * - Uses onboarding layout (header, progress bar, footer)
 * - Centered content with max-width 640px
 * - Mobile-first responsive design
 *
 * States:
 * - Loading: Shows animated skeleton with personalized message
 * - Success: Shows therapist cards with match reasons
 * - Error: Shows error message with retry option
 * - Empty: Handled by TherapistMatchResults component
 *
 * Performance:
 * - Apollo Client caching for instant re-renders
 * - Optimized images via next/image in TherapistCard
 * - Smooth animations and transitions
 *
 * @example
 * Route: /onboarding/sess_abc123/matching
 */
export default function MatchingPage({ params }: MatchingPageProps) {
  const { sessionId } = use(params);
  const router = useRouter();

  /**
   * Fetch matched therapists for this session
   * Uses generated Apollo hook from GraphQL codegen
   */
  const { data, loading, error, refetch } = useGetMatchedTherapistsQuery({
    variables: { sessionId },
    // Cache matched therapists for this session
    fetchPolicy: "cache-and-network",
    // Show loading state on first load only
    notifyOnNetworkStatusChange: true,
  });

  /**
   * Get child name from session for personalized loading message
   * In production, this would come from session query or context
   *
   * @returns Child's first name if available, undefined otherwise
   */
  function getChildName(): string | undefined {
    try {
      const stored = localStorage.getItem(`onboarding_session_${sessionId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.data?.child?.firstName;
      }
    } catch {
      // Silently fail - personalization is optional
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
   * Handles retry after error
   * Refetches matched therapists query
   */
  function handleRetry() {
    refetch();
  }

  // Loading state - show skeleton cards with animation
  if (loading && !data) {
    return (
      <div className="space-y-6">
        <MatchingLoadingState childName={getChildName()} />
      </div>
    );
  }

  // Error state - show error message with retry
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>

        <div className="space-y-2 text-center max-w-md">
          <h2 className="text-2xl font-semibold font-serif text-deep-text">
            We couldn&apos;t load your matches
          </h2>
          <p className="text-muted-foreground">
            Something went wrong while finding therapists. Please try again.
          </p>
          {error.message && (
            <p className="text-sm text-red-600 mt-2">
              Error: {error.message}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleBack}>
            Go Back
          </Button>
          <Button
            onClick={handleRetry}
            className="bg-daybreak-teal hover:bg-daybreak-teal/90 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Success state - show matched therapists
  if (data?.matchedTherapists) {
    return (
      <div className="space-y-6">
        <TherapistMatchResults
          results={data.matchedTherapists}
          sessionId={sessionId}
          childName={getChildName()}
        />
      </div>
    );
  }

  // Fallback - should not normally reach here
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12">
      <div className="space-y-2 text-center max-w-md">
        <h2 className="text-2xl font-semibold font-serif text-deep-text">
          No matching data available
        </h2>
        <p className="text-muted-foreground">
          We couldn&apos;t find any therapist matches. Please try again or
          contact support.
        </p>
      </div>
      <Button
        onClick={handleBack}
        variant="outline"
        className="border-daybreak-teal text-daybreak-teal hover:bg-daybreak-teal/10"
      >
        Go Back
      </Button>
    </div>
  );
}
