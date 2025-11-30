/**
 * InsuranceConfirmation component for displaying submitted insurance info
 *
 * Shows a confirmation view of the insurance information with:
 * - Loading/processing state during submission
 * - Masked member ID for PHI protection (****XXXX format)
 * - Edit functionality to return to form with preserved data
 * - Error handling with retry option
 *
 * Security: Member IDs are masked and never logged to console.
 */
"use client";

import * as React from "react";
import { Check, Edit2, Loader2, RefreshCw, Shield, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCarrierById } from "@/lib/data/insurance-carriers";
import { maskMemberId, formatVerificationStatus } from "./utils";
import type { InsuranceInformation } from "./useInsurance";

/**
 * Props for InsuranceConfirmation component
 * @param insuranceInfo - Insurance information to display
 * @param isLoading - Whether initial data is loading
 * @param isSaving - Whether a save/submit operation is in progress
 * @param error - Error object if submission failed
 * @param onEdit - Callback fired when edit button is clicked
 * @param onRetry - Callback fired when retry button is clicked
 * @param onContinue - Callback fired when continue button is clicked
 */
export interface InsuranceConfirmationProps {
  insuranceInfo: InsuranceInformation | null;
  isLoading?: boolean;
  isSaving?: boolean;
  error?: Error | null;
  onEdit?: () => void;
  onRetry?: () => void;
  onContinue?: () => void;
}

/**
 * Loading state component during initial load or submission
 *
 * Displays animated spinner with contextual message.
 * Matches TypingIndicator pattern from Epic 2.
 */
function LoadingState({ message = "Processing..." }: { message?: string }) {
  return (
    <Card className="w-full max-w-[640px] mx-auto">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div
          className="relative"
          role="status"
          aria-live="polite"
          aria-label={message}
        >
          {/* Animated spinner */}
          <Loader2
            className="h-12 w-12 text-daybreak-teal animate-spin"
            aria-hidden="true"
          />
        </div>
        <p className="mt-4 text-muted-foreground text-sm">{message}</p>
      </CardContent>
    </Card>
  );
}

/**
 * Error state component with retry functionality
 *
 * Displays error message with actionable retry button.
 * Follows UX design spec: inline errors, persistent until fixed.
 */
function ErrorState({
  error,
  onRetry,
}: {
  error: Error;
  onRetry?: () => void;
}) {
  return (
    <Card className="w-full max-w-[640px] mx-auto border-red-200">
      <CardContent className="flex flex-col items-center justify-center py-8">
        <div
          className="rounded-full bg-red-50 p-3 mb-4"
          aria-hidden="true"
        >
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Submission Failed
        </h3>
        <p
          className="text-sm text-muted-foreground text-center mb-4 max-w-sm"
          role="alert"
        >
          {error.message || "We couldn't save your insurance information. Please try again."}
        </p>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="gap-2"
            aria-label="Try submitting again"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Displays confirmation row with label and value
 */
function ConfirmationRow({
  label,
  value,
  masked = false,
}: {
  label: string;
  value: string;
  masked?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-border last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-medium text-foreground mt-1 sm:mt-0",
          masked && "font-mono tracking-wider"
        )}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Renders insurance confirmation with verification status
 *
 * Visual specs:
 * - Card with rounded corners (xl: 24px per design system)
 * - Success checkmark icon for confirmed status
 * - Edit button in card header for corrections
 * - Mobile-first layout with stacked rows on small screens
 *
 * PHI Protection:
 * - Member ID shown masked (****XXXX format) via maskMemberId
 * - No PHI logged to console
 * - autoComplete="off" prevented in source form
 *
 * Accessibility:
 * - ARIA labels on interactive elements
 * - role="status" for loading/error states
 * - Focus management for edit flow
 *
 * @example
 * <InsuranceConfirmation
 *   insuranceInfo={insuranceData}
 *   isSaving={false}
 *   onEdit={() => setShowForm(true)}
 *   onContinue={() => router.push('/matching')}
 * />
 */
export function InsuranceConfirmation({
  insuranceInfo,
  isLoading = false,
  isSaving = false,
  error = null,
  onEdit,
  onRetry,
  onContinue,
}: InsuranceConfirmationProps) {
  // Show loading state during initial load or submission
  if (isLoading) {
    return <LoadingState message="Loading insurance information..." />;
  }

  if (isSaving) {
    return <LoadingState message="Saving your insurance information..." />;
  }

  // Show error state if submission failed
  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  // Show empty state if no insurance info
  if (!insuranceInfo) {
    return (
      <Card className="w-full max-w-[640px] mx-auto">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            No insurance information found.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get carrier display name from ID
  const carrier = getCarrierById(insuranceInfo.payerName);
  const carrierName = carrier?.name || insuranceInfo.payerName;

  // Get verification status display
  const status = formatVerificationStatus(insuranceInfo.verificationStatus);

  // Check if this is self-pay
  const isSelfPay = insuranceInfo.verificationStatus === "self_pay";

  return (
    <Card className="w-full max-w-[640px] mx-auto">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Success indicator */}
            <div
              className="rounded-full bg-emerald-50 p-2"
              aria-hidden="true"
            >
              {isSelfPay ? (
                <Shield className="h-5 w-5 text-blue-600" />
              ) : (
                <Check className="h-5 w-5 text-emerald-600" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">
                {isSelfPay ? "Self-Pay Selected" : "Insurance Information"}
              </CardTitle>
              <CardDescription>
                {isSelfPay
                  ? "You've chosen to pay out of pocket"
                  : "Your insurance details have been saved"}
              </CardDescription>
            </div>
          </div>

          {/* Edit button (AC-4.2.3) */}
          {!isSelfPay && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="gap-1.5 text-daybreak-teal hover:text-daybreak-teal/80 hover:bg-daybreak-teal/10"
              aria-label="Edit insurance information"
            >
              <Edit2 className="h-4 w-4" aria-hidden="true" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Verification status badge */}
        <div className="mb-4">
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
              status.colorClass
            )}
          >
            {status.label}
          </span>
        </div>

        {/* Insurance details - only show for non-self-pay */}
        {!isSelfPay && (
          <div className="space-y-0">
            <ConfirmationRow
              label="Insurance Carrier"
              value={carrierName}
            />
            <ConfirmationRow
              label="Member ID"
              value={maskMemberId(insuranceInfo.memberId)}
              masked
            />
            {insuranceInfo.groupNumber && (
              <ConfirmationRow
                label="Group Number"
                value={insuranceInfo.groupNumber}
              />
            )}
            {insuranceInfo.subscriberName && (
              <ConfirmationRow
                label="Name on Card"
                value={insuranceInfo.subscriberName}
              />
            )}
          </div>
        )}

        {/* Self-pay message */}
        {isSelfPay && (
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              You&apos;ll receive cost information before your appointment.
              We offer competitive self-pay rates and can discuss payment
              options with you.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col-reverse sm:flex-row gap-3">
        {/* Edit option for self-pay users */}
        {isSelfPay && onEdit && (
          <Button
            variant="outline"
            onClick={onEdit}
            className="w-full sm:w-auto"
          >
            Add Insurance Instead
          </Button>
        )}

        {/* Continue button */}
        {onContinue && (
          <Button
            onClick={onContinue}
            className={cn(
              "w-full sm:flex-1",
              "bg-daybreak-teal hover:bg-daybreak-teal/90 text-white"
            )}
          >
            Continue
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

InsuranceConfirmation.displayName = "InsuranceConfirmation";
