/**
 * RecommendationBanner component for displaying cost recommendation
 *
 * Prominently displays a personalized recommendation about whether
 * insurance or self-pay is the better option, along with potential
 * savings information when applicable.
 *
 * Features:
 * - Highlighted banner with contextual styling
 * - Personalized recommendation text from API
 * - Savings display when self-pay is cheaper
 * - Visual differentiation based on recommendation type
 * - Accessible with proper ARIA roles
 *
 * Visual Design:
 * - Green styling when self-pay recommended
 * - Daybreak teal styling when insurance recommended
 * - CheckCircle icon for positive reinforcement
 * - Clear visual hierarchy for quick scanning
 */
"use client";

import * as React from "react";
import { CheckCircle2, Lightbulb, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/currency";

/**
 * Props for RecommendationBanner component
 * @param recommendation - Personalized recommendation text from API
 * @param savingsIfSelfPay - Amount saved per session if choosing self-pay (in cents)
 * @param highlightSelfPay - Whether self-pay is the recommended option
 * @param className - Optional additional CSS classes
 */
export interface RecommendationBannerProps {
  recommendation: string | null | undefined;
  savingsIfSelfPay?: number | null;
  highlightSelfPay?: boolean;
  className?: string;
}

/**
 * Renders a prominent recommendation banner
 *
 * Displays the API-provided recommendation with contextual styling
 * based on whether insurance or self-pay is recommended. Shows
 * savings information when self-pay offers cost benefits.
 *
 * @example
 * <RecommendationBanner
 *   recommendation="Based on your coverage, insurance is your best option."
 *   highlightSelfPay={false}
 * />
 *
 * @example
 * <RecommendationBanner
 *   recommendation="Self-pay offers simpler billing and potentially lower costs."
 *   savingsIfSelfPay={2500}
 *   highlightSelfPay={true}
 * />
 */
export function RecommendationBanner({
  recommendation,
  savingsIfSelfPay,
  highlightSelfPay = false,
  className,
}: RecommendationBannerProps) {
  // Don't render if no recommendation
  if (!recommendation) {
    return null;
  }

  // Determine if there are meaningful savings to display
  const hasSavings = savingsIfSelfPay && savingsIfSelfPay > 0;

  return (
    <div
      className={cn(
        "rounded-lg p-4 border",
        highlightSelfPay
          ? "bg-green-50 border-green-200"
          : "bg-daybreak-teal/10 border-daybreak-teal/30",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "rounded-full p-2 flex-shrink-0 mt-0.5",
            highlightSelfPay ? "bg-green-100" : "bg-daybreak-teal/20"
          )}
          aria-hidden="true"
        >
          {highlightSelfPay ? (
            <TrendingDown
              className={cn(
                "h-5 w-5",
                highlightSelfPay ? "text-green-600" : "text-daybreak-teal"
              )}
            />
          ) : (
            <Lightbulb
              className={cn(
                "h-5 w-5",
                highlightSelfPay ? "text-green-600" : "text-daybreak-teal"
              )}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1">
          {/* Recommendation header */}
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                "text-sm font-semibold",
                highlightSelfPay ? "text-green-900" : "text-daybreak-teal"
              )}
            >
              {highlightSelfPay ? "Self-Pay Recommended" : "Our Recommendation"}
            </h3>
            <CheckCircle2
              className={cn(
                "h-4 w-4",
                highlightSelfPay ? "text-green-600" : "text-daybreak-teal"
              )}
              aria-hidden="true"
            />
          </div>

          {/* Recommendation text */}
          <p
            className={cn(
              "text-sm",
              highlightSelfPay ? "text-green-800" : "text-foreground"
            )}
          >
            {recommendation}
          </p>

          {/* Savings indicator (when self-pay is cheaper) */}
          {hasSavings && highlightSelfPay && (
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                Save {formatCurrency(savingsIfSelfPay)} per session
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

RecommendationBanner.displayName = "RecommendationBanner";
