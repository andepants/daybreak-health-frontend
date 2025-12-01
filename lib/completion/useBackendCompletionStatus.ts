/**
 * Backend Completion Status Hook
 *
 * Verifies completion status against actual backend database records,
 * not just localStorage. This is used to detect the mismatch where
 * frontend shows "100% complete" but backend is missing the actual data.
 *
 * Unlike useCompletionStatus which reads localStorage, this hook queries
 * the GraphQL API to determine what data actually exists in the database.
 *
 * @example
 * ```tsx
 * const backendStatus = useBackendCompletionStatus({ sessionId });
 *
 * if (!backendStatus.canProceedToMatching) {
 *   console.log("Missing from backend:", backendStatus.missingBackendData);
 * }
 * ```
 */

"use client";

import { useMemo } from "react";
import { useGetSessionQuery } from "@/types/graphql";
import type { BackendCompletionStatus } from "./types";

/**
 * Hook options
 */
interface UseBackendCompletionStatusOptions {
  /** Session ID to check */
  sessionId: string;
}

/**
 * Hook to verify completion status against backend data
 *
 * Queries the actual backend session to determine what data exists
 * in the database, as opposed to what's stored in localStorage.
 *
 * @param options - Hook configuration
 * @returns Backend completion status with data presence flags
 */
export function useBackendCompletionStatus({
  sessionId,
}: UseBackendCompletionStatusOptions): BackendCompletionStatus {
  const { data, loading, error, refetch } = useGetSessionQuery({
    variables: { id: sessionId },
    fetchPolicy: "network-only", // Always fetch fresh data for validation
    skip: !sessionId,
  });

  return useMemo((): BackendCompletionStatus => {
    const session = data?.session;
    const progress = session?.progress;

    // Check actual backend data presence
    const hasParent = Boolean(
      session?.parent?.firstName &&
      session?.parent?.email
    );

    const hasChild = Boolean(
      session?.child?.first_name &&
      session?.child?.date_of_birth
    );

    // Assessment is complete when status is "complete"
    const hasAssessment = session?.assessment?.status === "complete";

    // Insurance is complete if has memberId/payerName OR self-pay status
    const insuranceStatus = session?.insurance?.verificationStatus;
    const isSelfPay = insuranceStatus === "self_pay";
    const hasInsurance = isSelfPay || Boolean(
      session?.insurance?.memberId &&
      session?.insurance?.payerName
    );

    // Build list of what's missing from backend
    const missingBackendData: string[] = [];
    if (!hasParent) missingBackendData.push("Parent Information");
    if (!hasChild) missingBackendData.push("Child Information");
    if (!hasAssessment) missingBackendData.push("Assessment");
    if (!hasInsurance) missingBackendData.push("Insurance / Payment");

    const canProceedToMatching = hasParent && hasChild && hasAssessment && hasInsurance;

    return {
      percentage: progress?.percentage ?? 0,
      completedPhases: progress?.completedPhases ?? [],
      currentPhase: progress?.currentPhase ?? "assessment",
      hasParent,
      hasChild,
      hasAssessment,
      hasInsurance,
      loading,
      error: error as Error | undefined,
      canProceedToMatching,
      missingBackendData,
      refetch: () => { refetch(); },
    };
  }, [data, loading, error, refetch]);
}
