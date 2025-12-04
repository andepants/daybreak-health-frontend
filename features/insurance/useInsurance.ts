/**
 * useInsurance hook for insurance form state and mutations
 *
 * Provides insurance submission functionality with loading states,
 * error handling, and self-pay option support.
 */
"use client";

import * as React from "react";

import type { InsuranceFormData } from "@/lib/validations/insurance";
import { useSubmitInsuranceInfoMutation, useSelectSelfPayMutation } from "@/types/graphql";
import { getCarrierById } from "@/lib/data/insurance-carriers";

/**
 * Insurance information returned from API
 */
export interface InsuranceInformation {
  id: string;
  payerName: string;
  subscriberName: string;
  memberId: string;
  groupNumber: string | null;
  verificationStatus: "pending" | "verified" | "failed" | "self_pay";
}

/**
 * Return type for useInsurance hook
 */
export interface UseInsuranceReturn {
  insuranceInfo: InsuranceInformation | null;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  submitInsurance: (data: InsuranceFormData) => Promise<void>;
  setSelfPay: () => Promise<void>;
  clearError: () => void;
}

/**
 * Options for useInsurance hook
 */
export interface UseInsuranceOptions {
  sessionId: string;
  onSubmitSuccess?: () => void;
  onSelfPaySuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for managing insurance form state and submissions
 *
 * Features:
 * - Submit insurance information for verification
 * - Set self-pay option (no insurance)
 * - Loading and error state management
 * - Optimistic UI updates
 *
 * @param options - Configuration options
 * @returns Insurance state and control functions
 *
 * @example
 * const { submitInsurance, isSaving } = useInsurance({
 *   sessionId,
 *   onSubmitSuccess: () => router.push('/matching'),
 * });
 */
export function useInsurance({
  sessionId,
  onSubmitSuccess,
  onSelfPaySuccess,
  onError,
}: UseInsuranceOptions): UseInsuranceReturn {
  const [insuranceInfo, setInsuranceInfo] =
    React.useState<InsuranceInformation | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  // Apollo mutations for backend persistence
  const [submitInsuranceInfoMutation] = useSubmitInsuranceInfoMutation();
  const [selectSelfPayMutation] = useSelectSelfPayMutation();

  /**
   * Submit insurance information for verification
   * Calls GraphQL mutation and updates local state
   */
  const submitInsurance = React.useCallback(
    async (data: InsuranceFormData): Promise<void> => {
      setIsSaving(true);
      setError(null);

      try {
        // Convert carrier ID to name (backend expects the full name, not ID)
        const carrier = getCarrierById(data.carrier);
        const payerName = carrier?.name || data.carrier;

        // Call the real GraphQL mutation to persist to backend
        const result = await submitInsuranceInfoMutation({
          variables: {
            sessionId,
            payerName,
            memberId: data.memberId,
            groupNumber: data.groupNumber || null,
            subscriberName: data.subscriberName,
          },
        });

        // Check for errors from backend
        const errors = result.data?.submitInsuranceInfo?.errors;
        if (errors && errors.length > 0) {
          throw new Error(errors[0].message || "Failed to submit insurance");
        }

        const insurance = result.data?.submitInsuranceInfo?.insurance;

        // Also store in localStorage as backup for offline resilience
        try {
          const existing = localStorage.getItem(`onboarding_session_${sessionId}`);
          const parsed = existing ? JSON.parse(existing) : { data: {} };
          parsed.data.insurance = {
            ...data,
            verificationStatus: insurance?.verificationStatus || "pending",
            savedAt: new Date().toISOString(),
          };
          localStorage.setItem(
            `onboarding_session_${sessionId}`,
            JSON.stringify(parsed)
          );
        } catch (storageError) {
          console.warn("Failed to save insurance to localStorage:", storageError);
        }

        // Update local state with response from backend
        if (insurance) {
          setInsuranceInfo({
            id: insurance.id,
            payerName: insurance.payerName || data.carrier,
            subscriberName: insurance.subscriberName || data.subscriberName,
            memberId: insurance.memberId || data.memberId,
            groupNumber: insurance.groupNumber || null,
            verificationStatus: insurance.verificationStatus as InsuranceInformation["verificationStatus"] || "pending",
          });
        }

        onSubmitSuccess?.();
      } catch (err) {
        const submitError =
          err instanceof Error ? err : new Error("Failed to submit insurance");
        setError(submitError);
        onError?.(submitError);
      } finally {
        setIsSaving(false);
      }
    },
    [sessionId, submitInsuranceInfoMutation, onSubmitSuccess, onError]
  );

  /**
   * Set self-pay option (no insurance)
   * Marks session as self-pay and skips verification
   */
  const setSelfPay = React.useCallback(async (): Promise<void> => {
    setIsSaving(true);
    setError(null);

    try {
      // Call the real GraphQL mutation to persist to backend
      const result = await selectSelfPayMutation({
        variables: {
          input: { sessionId },
        },
      });

      // Check for success from backend
      if (!result.data?.selectSelfPay?.success) {
        throw new Error("Failed to set self-pay option");
      }

      const session = result.data.selectSelfPay.session;

      // Also store in localStorage as backup
      try {
        const existing = localStorage.getItem(`onboarding_session_${sessionId}`);
        const parsed = existing ? JSON.parse(existing) : { data: {} };
        parsed.data.insurance = {
          isSelfPay: true,
          verificationStatus: "self_pay",
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(
          `onboarding_session_${sessionId}`,
          JSON.stringify(parsed)
        );
      } catch (storageError) {
        console.warn("Failed to save self-pay to localStorage:", storageError);
      }

      // Update local state
      setInsuranceInfo({
        id: session?.insurance?.id || `ins_${Date.now()}`,
        payerName: "Self-Pay",
        subscriberName: "",
        memberId: "",
        groupNumber: null,
        verificationStatus: "self_pay",
      });

      onSelfPaySuccess?.();
    } catch (err) {
      const selfPayError =
        err instanceof Error ? err : new Error("Failed to set self-pay");
      setError(selfPayError);
      onError?.(selfPayError);
    } finally {
      setIsSaving(false);
    }
  }, [sessionId, selectSelfPayMutation, onSelfPaySuccess, onError]);

  /**
   * Clear error state
   */
  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  /**
   * Load existing insurance info on mount
   */
  React.useEffect(() => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem(`onboarding_session_${sessionId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.data?.insurance && !parsed.data.insurance.isSelfPay) {
          setInsuranceInfo({
            id: parsed.data.insurance.id || `ins_${Date.now()}`,
            payerName: parsed.data.insurance.carrier || "",
            subscriberName: parsed.data.insurance.subscriberName || "",
            memberId: parsed.data.insurance.memberId || "",
            groupNumber: parsed.data.insurance.groupNumber || null,
            verificationStatus:
              parsed.data.insurance.verificationStatus || "pending",
          });
        }
      }
    } catch (e) {
      console.warn("Failed to load insurance from storage:", e);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  return {
    insuranceInfo,
    isLoading,
    isSaving,
    error,
    submitInsurance,
    setSelfPay,
    clearError,
  };
}
