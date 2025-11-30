/**
 * CostComparisonView component for side-by-side cost comparison
 *
 * Displays insurance estimate and self-pay rates side-by-side to help
 * users make informed decisions about payment options. Highlights the
 * more affordable option and shows relevant trade-offs.
 *
 * Features:
 * - Side-by-side insurance vs self-pay comparison
 * - Visual highlighting of more affordable option
 * - Trade-offs and considerations display
 * - Responsive layout (stacks on mobile)
 * - Conditional rendering based on data availability
 *
 * Visual Design:
 * - Daybreak teal highlight for recommended option
 * - Equal-width columns on desktop
 * - Stacked cards on mobile
 * - Clear visual hierarchy
 *
 * Accessibility:
 * - Semantic comparison structure
 * - ARIA labels for recommendation
 * - Screen reader friendly
 * - Keyboard navigable
 *
 * AC-6.2.3: Given insurance estimate available, show side-by-side comparison
 * AC-6.2.4: Highlight more affordable option visually
 */
"use client";

import * as React from "react";
import { Shield, DollarSign, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import type { CostEstimate } from "@/lib/validations/cost";
import type { SelfPayRate } from "@/lib/validations/cost";

/**
 * Props for CostComparisonView component
 * @param costEstimate - Insurance-based cost estimate data
 * @param selfPayRates - Self-pay rate data
 * @param onSelectInsurance - Callback when insurance option is selected
 * @param onSelectSelfPay - Callback when self-pay option is selected
 * @param className - Optional additional CSS classes
 */
export interface CostComparisonViewProps {
  costEstimate: CostEstimate | null;
  selfPayRates: SelfPayRate | null;
  onSelectInsurance?: () => void;
  onSelectSelfPay?: () => void;
  className?: string;
}

/**
 * Determines which payment option is more affordable
 *
 * Compares insurance per-session cost with self-pay base rate
 * and returns which option costs less for the user.
 *
 * @param insuranceCost - Per-session cost with insurance (in cents)
 * @param selfPayCost - Per-session self-pay rate (in cents)
 * @returns "insurance" | "self_pay" | "equal"
 */
function determineMoreAffordable(
  insuranceCost: number,
  selfPayCost: number
): "insurance" | "self_pay" | "equal" {
  if (insuranceCost < selfPayCost) return "insurance";
  if (selfPayCost < insuranceCost) return "self_pay";
  return "equal";
}

/**
 * Comparison card for a single payment option
 *
 * Displays pricing and key features for insurance or self-pay option
 */
function ComparisonCard({
  type,
  title,
  description,
  perSessionCost,
  isRecommended,
  features,
  tradeOffs,
  icon: Icon,
  onSelect,
}: {
  type: "insurance" | "self_pay";
  title: string;
  description: string;
  perSessionCost: number;
  isRecommended: boolean;
  features: string[];
  tradeOffs?: string[];
  icon: React.ElementType;
  onSelect?: () => void;
}) {
  return (
    <Card
      className={cn(
        "relative flex-1 transition-all",
        isRecommended && "border-2 border-daybreak-teal shadow-lg"
      )}
    >
      {/* Recommended badge - AC-6.2.4 */}
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span
            className="inline-flex items-center gap-1 bg-daybreak-teal text-white text-xs font-semibold px-4 py-1 rounded-full"
            role="status"
            aria-label="Recommended option"
          >
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            More Affordable
          </span>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "rounded-full p-2",
              isRecommended
                ? "bg-daybreak-teal/10"
                : "bg-muted"
            )}
            aria-hidden="true"
          >
            <Icon
              className={cn(
                "h-5 w-5",
                isRecommended ? "text-daybreak-teal" : "text-muted-foreground"
              )}
            />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Per-session cost */}
        <div className="text-center py-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">
            Per Session
          </p>
          <p
            className={cn(
              "text-3xl font-bold font-serif",
              isRecommended ? "text-daybreak-teal" : "text-foreground"
            )}
          >
            {formatCurrency(perSessionCost)}
          </p>
        </div>

        {/* Features */}
        {features.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Benefits
            </h4>
            <ul className="space-y-1.5">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <CheckCircle2
                    className="h-4 w-4 text-daybreak-teal mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Trade-offs */}
        {tradeOffs && tradeOffs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Info className="h-3 w-3" aria-hidden="true" />
              Considerations
            </h4>
            <ul className="space-y-1.5">
              {tradeOffs.map((tradeOff, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {tradeOff}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Select button */}
        {onSelect && (
          <button
            onClick={onSelect}
            className={cn(
              "w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors",
              isRecommended
                ? "bg-daybreak-teal text-white hover:bg-daybreak-teal/90"
                : "bg-muted text-foreground hover:bg-muted/80"
            )}
          >
            {type === "insurance" ? "Use Insurance" : "Choose Self-Pay"}
          </button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Renders side-by-side comparison of insurance and self-pay options
 *
 * Main component that displays both payment options with visual highlighting
 * of the more affordable choice. Shows trade-offs and considerations to help
 * users make informed decisions.
 *
 * AC-6.2.3: Given insurance estimate available, show side-by-side comparison
 * AC-6.2.4: Highlight more affordable option visually
 *
 * @example
 * <CostComparisonView
 *   costEstimate={insuranceEstimate}
 *   selfPayRates={selfPayRates}
 *   onSelectInsurance={handleInsuranceSelect}
 *   onSelectSelfPay={handleSelfPaySelect}
 * />
 */
export function CostComparisonView({
  costEstimate,
  selfPayRates,
  onSelectInsurance,
  onSelectSelfPay,
  className,
}: CostComparisonViewProps) {
  // Only render if both options are available - AC-6.2.3
  if (!costEstimate || !selfPayRates) {
    return null;
  }

  // Determine which option is more affordable - AC-6.2.4
  const moreAffordable = determineMoreAffordable(
    costEstimate.perSessionCost,
    selfPayRates.perSessionRate
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Comparison header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-foreground font-serif mb-2">
          Compare Your Options
        </h3>
        <p className="text-muted-foreground">
          Choose the payment method that works best for you
        </p>
      </div>

      {/* Side-by-side comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Insurance option */}
        <ComparisonCard
          type="insurance"
          title="Insurance Coverage"
          description={costEstimate.insuranceCarrier}
          perSessionCost={costEstimate.perSessionCost}
          isRecommended={moreAffordable === "insurance"}
          icon={Shield}
          features={[
            "Leverages your existing coverage",
            costEstimate.copay
              ? `${formatCurrency(costEstimate.copay)} copay per session`
              : "Coverage applies to deductible",
            "May reduce out-of-pocket maximum",
          ]}
          tradeOffs={[
            "May require using in-network therapists",
            "Subject to deductible and plan terms",
            "Final cost may vary based on specific services",
          ]}
          onSelect={onSelectInsurance}
        />

        {/* Self-pay option */}
        <ComparisonCard
          type="self_pay"
          title="Self-Pay"
          description="Pay directly without insurance"
          perSessionCost={selfPayRates.perSessionRate}
          isRecommended={moreAffordable === "self_pay"}
          icon={DollarSign}
          features={[
            "Predictable pricing every session",
            "No insurance paperwork required",
            "Choose any therapist regardless of network",
            selfPayRates.packages.length > 0
              ? "Package discounts available"
              : "Straightforward payment",
          ]}
          tradeOffs={[
            "Does not count toward insurance deductible",
            "Full payment due at time of service",
            selfPayRates.financialAssistanceAvailable
              ? "Financial assistance may be available"
              : undefined,
          ].filter(Boolean) as string[]}
          onSelect={onSelectSelfPay}
        />
      </div>

      {/* Additional context */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Not sure which to choose?</strong> You can always change your
          payment preference later. Our support team is here to help you understand
          your options and make the best choice for your family.
        </p>
      </div>
    </div>
  );
}

CostComparisonView.displayName = "CostComparisonView";
