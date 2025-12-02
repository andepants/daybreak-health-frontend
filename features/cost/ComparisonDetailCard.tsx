/**
 * ComparisonDetailCard component for displaying insurance or self-pay details
 *
 * Renders a detailed card for either the insurance or self-pay option in the
 * side-by-side cost comparison. Displays all relevant fields including cost,
 * coverage details, and action buttons.
 *
 * Features:
 * - Per-session cost with prominent display
 * - Insurance-specific fields (coverage, copay, coinsurance)
 * - Self-pay specific fields (packages, sliding scale)
 * - Recommended badge with visual highlighting
 * - Insurance card thumbnail integration
 * - Responsive layout
 *
 * Visual Design:
 * - Card with border highlighting for recommended option
 * - Daybreak teal accent for recommended badge
 * - Clear visual hierarchy for pricing information
 * - Consistent spacing and typography
 */
"use client";

import * as React from "react";
import { Shield, CreditCard, Package, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/currency";
import type { PackageOptionData } from "./hooks/useCostComparison";

/**
 * Props for ComparisonDetailCard component
 */
export interface ComparisonDetailCardProps {
  /** Card type: insurance or self-pay */
  type: "insurance" | "self_pay";
  /** Card title */
  title: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Per-session cost as formatted string (e.g., "$25" or "$150 per session") */
  perSessionCost: string | null | undefined;
  /** Whether this option is recommended */
  isRecommended?: boolean;

  // Insurance-specific props
  /** Insurance carrier name */
  insuranceCarrier?: string | null;
  /** Coverage percentage (0-100) */
  coveragePercentage?: number | null;
  /** Copay amount in dollars */
  copayAmount?: number | null;
  /** Coinsurance percentage (0-100) */
  coinsurancePercentage?: number | null;
  /** Insurance card thumbnail element */
  cardThumbnail?: React.ReactNode;

  // Self-pay specific props
  /** Package options with bulk pricing */
  packages?: PackageOptionData[];
  /** Whether financial assistance is available */
  financialAssistanceAvailable?: boolean;
  /** Sliding scale information */
  slidingScaleInfo?: string | null;

  // Actions
  /** Callback when select button is clicked */
  onSelect?: () => void;
  /** Whether selection is in progress */
  isSelecting?: boolean;

  /** Optional CSS classes */
  className?: string;
}

/**
 * Formats a coverage percentage for display
 */
function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${value}%`;
}

/**
 * Package option display component
 */
function PackageOptionItem({ pkg }: { pkg: PackageOptionData }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-daybreak-teal" aria-hidden="true" />
        <span className="text-sm font-medium">{pkg.sessions} sessions</span>
      </div>
      <div className="text-right">
        <span className="text-sm font-semibold">{pkg.totalPrice}</span>
        {pkg.savings && pkg.savings !== "$0" && (
          <Badge
            variant="secondary"
            className="ml-2 bg-green-100 text-green-700 text-xs"
          >
            Save {pkg.savings}
          </Badge>
        )}
      </div>
    </div>
  );
}

/**
 * Renders a detail card for either insurance or self-pay option
 *
 * Displays comprehensive cost information with type-specific fields.
 * Insurance cards show coverage, copay, and coinsurance; self-pay
 * cards show package options and financial assistance info.
 *
 * @example
 * // Insurance card
 * <ComparisonDetailCard
 *   type="insurance"
 *   title="With Insurance"
 *   perSessionCost="$25"
 *   isRecommended={true}
 *   insuranceCarrier="Blue Cross Blue Shield"
 *   coveragePercentage={80}
 *   copayAmount={25}
 *   coinsurancePercentage={20}
 *   onSelect={() => handleSelectInsurance()}
 * />
 *
 * @example
 * // Self-pay card
 * <ComparisonDetailCard
 *   type="self_pay"
 *   title="Self-Pay"
 *   perSessionCost="$150 per session"
 *   packages={[{ sessions: 4, totalPrice: "$540", ... }]}
 *   onSelect={() => handleSelectSelfPay()}
 * />
 */
export function ComparisonDetailCard({
  type,
  title,
  subtitle,
  perSessionCost,
  isRecommended = false,
  insuranceCarrier,
  coveragePercentage,
  copayAmount,
  coinsurancePercentage,
  cardThumbnail,
  packages,
  financialAssistanceAvailable,
  slidingScaleInfo,
  onSelect,
  isSelecting,
  className,
}: ComparisonDetailCardProps) {
  const isInsurance = type === "insurance";

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all",
        isRecommended && "border-2 border-daybreak-teal shadow-lg",
        className
      )}
    >
      {/* Recommended badge */}
      {isRecommended && (
        <div className="absolute top-0 right-0 bg-daybreak-teal text-white text-xs font-semibold px-3 py-1 rounded-bl-lg flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
          Recommended
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn(
              "rounded-full p-2 flex-shrink-0",
              isRecommended ? "bg-daybreak-teal/20" : "bg-muted"
            )}
            aria-hidden="true"
          >
            {isInsurance ? (
              <Shield
                className={cn(
                  "h-5 w-5",
                  isRecommended ? "text-daybreak-teal" : "text-muted-foreground"
                )}
              />
            ) : (
              <CreditCard
                className={cn(
                  "h-5 w-5",
                  isRecommended ? "text-daybreak-teal" : "text-muted-foreground"
                )}
              />
            )}
          </div>

          {/* Title and subtitle */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {subtitle || (isInsurance ? insuranceCarrier : "Pay directly without insurance")}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Per-session cost - prominent display */}
        <div className="bg-cream/30 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Per Session</p>
          <p
            className={cn(
              "text-3xl font-bold font-serif",
              isRecommended ? "text-daybreak-teal" : "text-foreground"
            )}
          >
            {perSessionCost || "—"}
          </p>
        </div>

        {/* Insurance-specific fields */}
        {isInsurance && (
          <div className="space-y-3">
            {/* Insurance card thumbnail */}
            {cardThumbnail && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                {cardThumbnail}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Insurance Card</p>
                  <p className="text-sm font-medium truncate">
                    {insuranceCarrier || "Card uploaded"}
                  </p>
                </div>
              </div>
            )}

            {/* Coverage details */}
            <div className="space-y-2">
              {coveragePercentage !== null && coveragePercentage !== undefined && (
                <div className="flex justify-between items-center py-1.5 border-b border-border">
                  <span className="text-sm text-muted-foreground">Coverage</span>
                  <span className="text-sm font-medium">
                    {formatPercentage(coveragePercentage)}
                  </span>
                </div>
              )}

              {copayAmount !== null && copayAmount !== undefined && (
                <div className="flex justify-between items-center py-1.5 border-b border-border">
                  <span className="text-sm text-muted-foreground">Copay</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(copayAmount * 100)}
                  </span>
                </div>
              )}

              {coinsurancePercentage !== null && coinsurancePercentage !== undefined && (
                <div className="flex justify-between items-center py-1.5 border-b border-border">
                  <span className="text-sm text-muted-foreground">Coinsurance</span>
                  <span className="text-sm font-medium">
                    {formatPercentage(coinsurancePercentage)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Self-pay specific fields */}
        {!isInsurance && (
          <div className="space-y-3">
            {/* Package options */}
            {packages && packages.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-daybreak-teal" aria-hidden="true" />
                  <span className="text-sm font-semibold">Package Options</span>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  {packages.map((pkg, index) => (
                    <PackageOptionItem key={index} pkg={pkg} />
                  ))}
                </div>
              </div>
            )}

            {/* Sliding scale info */}
            {slidingScaleInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">{slidingScaleInfo}</p>
              </div>
            )}

            {/* Financial assistance */}
            {financialAssistanceAvailable && (
              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>Financial assistance available</span>
              </div>
            )}
          </div>
        )}

        {/* Select button */}
        {onSelect && (
          <Button
            onClick={onSelect}
            disabled={isSelecting}
            className={cn(
              "w-full",
              isRecommended && "bg-daybreak-teal hover:bg-daybreak-teal/90"
            )}
            size="lg"
          >
            {isSelecting
              ? "Selecting..."
              : isInsurance
                ? "Use Insurance"
                : "Choose Self-Pay"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

ComparisonDetailCard.displayName = "ComparisonDetailCard";
