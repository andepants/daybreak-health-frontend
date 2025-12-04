/**
 * Therapist Matching Page
 *
 * Displays matched therapists for the current onboarding session.
 * This is the page where parents see 2-3 recommended therapists
 * after completing the availability selection step.
 *
 * Route: /onboarding/[sessionId]/matching
 *
 * Flow:
 * - Previous: /onboarding/[sessionId]/availability
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

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApolloClient } from "@apollo/client/react";
import { AlertCircle, CheckCircle2, XCircle, ChevronRight, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

import { useGetMatchedTherapistsQuery, useGetSessionQuery, useCompleteAssessmentMutation } from "@/types/graphql";
import {
  MatchingLoadingState,
  TherapistMatchResults,
} from "@/features/matching";
import { Button } from "@/components/ui/button";
import { useCompletionStatus } from "@/lib/completion";
import { detectSyncNeeds, syncLocalStorageToBackend, type SyncResult } from "@/lib/utils/data-sync";

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
 * Section configuration for navigation
 */
interface SectionConfig {
  id: "assessment" | "info" | "insurance" | "availability";
  label: string;
  path: string;
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
/**
 * Sync status for tracking data synchronization state
 */
type SyncStatus = "pending" | "checking" | "syncing" | "complete" | "failed";

export default function MatchingPage({ params }: MatchingPageProps) {
  const { sessionId } = use(params);
  const router = useRouter();
  const apolloClient = useApolloClient();

  /**
   * Child name state for personalized messages
   * Using state + effect to avoid hydration mismatch since localStorage
   * is only available on the client
   */
  const [childName, setChildName] = useState<string | undefined>(undefined);

  /**
   * Track which sections are expanded in the checklist
   */
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  /**
   * Sync state for tracking localStorage to backend synchronization
   */
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("pending");
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  /**
   * Section configuration for navigation
   */
  const sectionConfigs: SectionConfig[] = [
    { id: "assessment", label: "Assessment", path: `/onboarding/${sessionId}/form/assessment` },
    { id: "info", label: "Info", path: `/onboarding/${sessionId}/demographics` },
    { id: "insurance", label: "Insurance / Payment", path: `/onboarding/${sessionId}/insurance` },
    { id: "availability", label: "Availability", path: `/onboarding/${sessionId}/availability` },
  ];

  /**
   * Use centralized completion status hook
   * Provides field-level tracking with human-readable labels
   */
  const completionState = useCompletionStatus({ sessionId });

  /**
   * Fetch session data from backend (still needed for child name fallback)
   */
  const { data: sessionData, refetch: refetchSession } = useGetSessionQuery({
    variables: { id: sessionId },
    fetchPolicy: "cache-and-network",
  });

  /**
   * Complete assessment mutation - ensures session is in correct status for booking
   * Called once on mount to transition session to assessment_complete status
   */
  const [completeAssessment] = useCompleteAssessmentMutation();

  /**
   * Sync localStorage data to backend on mount
   * This ensures data collected in forms is persisted to database before matching
   */
  useEffect(() => {
    async function performSync() {
      setSyncStatus("checking");

      try {
        // First check if sync is needed by comparing localStorage with backend
        const syncNeeds = detectSyncNeeds(sessionId, sessionData?.session);

        if (!syncNeeds.needsSync) {
          // No sync needed, proceed to matching
          console.log("[Matching] No sync needed, localStorage matches backend");
          setSyncStatus("complete");
          return;
        }

        console.log("[Matching] Sync needed for:", syncNeeds.itemsToSync);
        setSyncStatus("syncing");

        // Perform the sync
        const result = await syncLocalStorageToBackend(apolloClient, sessionId, {
          onProgress: (step, current, total) => {
            console.log(`[Matching] Sync progress: ${step} (${current}/${total})`);
          },
        });

        setSyncResult(result);

        if (result.success) {
          console.log("[Matching] Sync successful:", result.syncedItems);
          setSyncStatus("complete");
          // Refetch session data to get updated state
          refetchSession();
        } else {
          console.warn("[Matching] Sync had errors:", result.errors);
          // Still mark as complete to allow matching to proceed
          // The matching query will show any remaining validation errors
          setSyncStatus("complete");
        }
      } catch (error) {
        console.error("[Matching] Sync failed:", error);
        setSyncStatus("failed");
      }
    }

    // Only perform sync once we have session data (or it has loaded)
    if (sessionData !== undefined) {
      performSync();
    }
  }, [sessionId, sessionData, apolloClient, refetchSession]);

  /**
   * Auto-complete assessment status after sync completes
   * This ensures the session is in the correct status for booking
   * Uses force=true to bypass prerequisite validation during development
   */
  useEffect(() => {
    // Only complete assessment after sync is done
    if (syncStatus !== "complete") return;

    async function ensureAssessmentComplete() {
      try {
        const result = await completeAssessment({
          variables: {
            input: {
              sessionId,
              force: true, // Skip validation for testing - remove in production
            },
          },
        });

        if (result.data?.completeAssessment?.success) {
          console.log("Session status updated to assessment_complete");
        } else if (result.data?.completeAssessment?.errors?.length) {
          console.warn("Could not complete assessment:", result.data.completeAssessment.errors);
        }
      } catch (error) {
        console.error("Failed to update session status:", error);
      }
    }

    ensureAssessmentComplete();
  }, [sessionId, completeAssessment, syncStatus]);

  /**
   * Toggle section expansion in the checklist
   */
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  /**
   * Load child name from localStorage for personalization
   * This is only for display - not for validation
   */
  useEffect(() => {
    try {
      // Try localStorage first for quick display
      const stored = localStorage.getItem(`onboarding_session_${sessionId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setChildName(parsed?.data?.child?.firstName);
      }
    } catch {
      // Silently fail - personalization is optional
    }
  }, [sessionId]);

  /**
   * Update child name from session data if available (more reliable than localStorage)
   */
  useEffect(() => {
    if (sessionData?.session?.child?.first_name) {
      setChildName(sessionData.session.child.first_name);
    }
  }, [sessionData]);

  /**
   * Fetch matched therapists for this session
   * Uses generated Apollo hook from GraphQL codegen
   * Skips query until sync is complete to ensure backend has all data
   */
  const { data, loading, error, refetch } = useGetMatchedTherapistsQuery({
    variables: { sessionId },
    // Cache matched therapists for this session
    fetchPolicy: "cache-and-network",
    // Show loading state on first load only
    notifyOnNetworkStatusChange: true,
    // Skip query until sync is complete
    skip: syncStatus !== "complete",
  });

  /**
   * Handles back navigation to availability page
   */
  function handleBack() {
    router.push(`/onboarding/${sessionId}/availability`);
  }

  /**
   * Handles retry after error
   * Refetches matched therapists query
   */
  function handleRetry() {
    refetch();
  }

  // Syncing state - show sync progress indicator
  if (syncStatus === "checking" || syncStatus === "syncing" || syncStatus === "pending") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-10 w-10 text-daybreak-teal animate-spin mb-4" />
          <h2 className="text-xl font-semibold font-serif text-deep-text mb-2">
            {syncStatus === "syncing" ? "Syncing your information..." : "Preparing your profile..."}
          </h2>
          <p className="text-muted-foreground text-center max-w-md">
            {syncStatus === "syncing"
              ? "We're saving your information to ensure the best therapist matches."
              : "Getting everything ready for matching..."}
          </p>
        </div>
      </div>
    );
  }

  // Loading state - show skeleton cards with animation
  if (loading && !data) {
    return (
      <div className="space-y-6">
        <MatchingLoadingState childName={childName} />
      </div>
    );
  }

  // Error state - show error message with retry
  if (error) {
    // Check if this is a session incomplete error
    const isIncompleteSession = error.message?.includes(
      "Session must have complete"
    );

    // For incomplete sessions, show the detailed completion checklist
    // Note: Data syncs automatically on each form's Continue click, so if the session
    // is incomplete, it means the user hasn't finished filling out required fields.
    if (isIncompleteSession) {
      const { sections, overallPercentComplete, canProceedToMatching, matchingBlockers } = completionState;
      const totalBlockers = matchingBlockers.length;

      return (
        <div className="py-8">
          <div className="mx-auto" style={{ maxWidth: '576px' }}>
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold font-serif text-deep-text">
                Complete Your Profile
              </h2>
              <p className="text-muted-foreground mt-2">
                {totalBlockers > 0
                  ? `${totalBlockers} required field${totalBlockers === 1 ? '' : 's'} still need${totalBlockers === 1 ? 's' : ''} to be completed.`
                  : "Please complete the following steps before we can match you with a therapist."}
              </p>
            </div>

            {/* Completion Checklist with field-level detail */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Onboarding Progress
                  </span>
                  <span className="text-sm text-gray-500">
                    {overallPercentComplete}% complete
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-daybreak-teal transition-all duration-300"
                    style={{ width: `${overallPercentComplete}%` }}
                  />
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {sectionConfigs.map((config) => {
                  const sectionStatus = sections[config.id];
                  const isComplete = sectionStatus.isComplete;
                  const isExpanded = expandedSections.has(config.id);
                  const missingFields = sectionStatus.missingRequiredFields;
                  const hasMissingFields = missingFields.length > 0;

                  return (
                    <div key={config.id}>
                      {/* Section header row */}
                      <button
                        onClick={() => hasMissingFields ? toggleSection(config.id) : router.push(config.path)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          {isComplete ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${isComplete ? "text-gray-600" : "text-gray-900 font-medium"}`}>
                            {config.label}
                          </span>
                          {!isComplete && (
                            <span className="text-xs text-gray-400">
                              ({sectionStatus.requiredFieldsComplete}/{sectionStatus.requiredFieldsTotal})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isComplete
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {isComplete ? "Complete" : `${missingFields.length} missing`}
                          </span>
                          {hasMissingFields ? (
                            isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            )
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          )}
                        </div>
                      </button>

                      {/* Expanded field list */}
                      {isExpanded && hasMissingFields && (
                        <div className="bg-gray-50 border-t border-gray-100">
                          {missingFields.map((field) => (
                            <button
                              key={field.fieldName}
                              onClick={() => router.push(config.path)}
                              className="w-full flex items-center justify-between px-4 py-2.5 pl-12 hover:bg-gray-100 transition-colors group"
                            >
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                                <span className="text-sm text-gray-700">
                                  {field.displayLabel}
                                </span>
                              </div>
                              <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {canProceedToMatching && (
              <div className="mt-6 text-center">
                <Button
                  onClick={handleRetry}
                  className="bg-daybreak-teal hover:bg-daybreak-teal/90 text-white"
                >
                  Retry Matching
                </Button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // For other errors, show generic error message
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12 w-full">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>

        <div className="space-y-2 text-center w-full max-w-xl px-4">
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

  // Success state - show matched therapists with always-visible completion status
  if (data?.matchedTherapists) {
    const { sections, overallPercentComplete } = completionState;
    const completedSections = sectionConfigs.filter(c => sections[c.id].isComplete).length;

    return (
      <div className="space-y-6">
        {/* Compact always-visible completion status */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Profile Status
            </span>
            <span className="text-sm text-gray-500">
              {completedSections} of {sectionConfigs.length} sections complete ({overallPercentComplete}%)
            </span>
          </div>
          <div className="flex gap-2">
            {sectionConfigs.map((config) => {
              const sectionStatus = sections[config.id];
              const isComplete = sectionStatus.isComplete;
              const missingCount = sectionStatus.missingRequiredFields.length;
              return (
                <button
                  key={config.id}
                  onClick={() => router.push(config.path)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors ${
                    isComplete
                      ? "bg-green-50 text-green-700 hover:bg-green-100"
                      : "bg-red-50 text-red-700 hover:bg-red-100"
                  }`}
                  title={isComplete
                    ? `${config.label} - Complete`
                    : `${config.label} - ${missingCount} field${missingCount === 1 ? '' : 's'} missing`
                  }
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline truncate">{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <TherapistMatchResults
          results={data.matchedTherapists}
          sessionId={sessionId}
          childName={childName}
        />
      </div>
    );
  }

  // Fallback - should not normally reach here
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12 w-full">
      <div className="space-y-2 text-center w-full max-w-xl px-4">
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
