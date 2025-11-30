/**
 * PaymentPlanModal component for displaying and selecting payment plan options
 *
 * Shows available payment plans in an accessible dialog modal, allowing users
 * to understand payment options and select their preferred plan.
 *
 * Features:
 * - Displays all available payment plans with details
 * - Shows payment frequency, amounts, and terms
 * - "Select this plan" action for each option
 * - Financial assistance link to open support chat
 * - Keyboard navigation and screen reader support
 * - Loading and error states
 *
 * Visual Design:
 * - Daybreak teal accents for primary actions
 * - Clear plan differentiation
 * - Responsive layout (mobile-first)
 *
 * Accessibility:
 * - WCAG AA compliant
 * - Focus trap within modal
 * - Escape key to close
 * - ARIA labels for all interactive elements
 * - Screen reader announcements for plan selection
 *
 * AC-6.4.1: "Payment options" click opens accessible modal
 * AC-6.4.2: Display all available payment plans with frequency and amounts
 * AC-6.4.3: Show terms link for each plan
 * AC-6.4.4: "Select this plan" triggers setPaymentPreference mutation
 * AC-6.4.5: "Financial assistance" link opens support chat (Intercom)
 * AC-6.4.6: Modal keyboard navigable and screen reader accessible
 */
"use client";

import * as React from "react";
import {
  Calendar,
  CreditCard,
  DollarSign,
  ExternalLink,
  Loader2,
  AlertCircle,
  Check,
  HeartHandshake,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/currency";
import type { PaymentPlan, PaymentFrequency } from "@/lib/validations/cost";
import { usePaymentPlans } from "./hooks/usePaymentPlans";

/**
 * Props for PaymentPlanModal component
 * @param sessionId - Onboarding session ID for fetching plans
 * @param open - Whether modal is open
 * @param onOpenChange - Callback when modal open state changes
 * @param onPlanSelected - Callback when a plan is successfully selected
 * @param className - Optional additional CSS classes
 */
export interface PaymentPlanModalProps {
  sessionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanSelected?: (planId: string) => void;
  className?: string;
}

/**
 * Map payment frequency to display text
 */
const FREQUENCY_LABELS: Record<PaymentFrequency, string> = {
  per_session: "Per Session",
  monthly: "Monthly Billing",
  prepaid: "Prepaid Package",
};

/**
 * Map payment frequency to icon
 */
function FrequencyIcon({ frequency }: { frequency: PaymentFrequency }) {
  const iconClass = "h-5 w-5 text-daybreak-teal";

  switch (frequency) {
    case "per_session":
      return <DollarSign className={iconClass} aria-hidden="true" />;
    case "monthly":
      return <Calendar className={iconClass} aria-hidden="true" />;
    case "prepaid":
      return <CreditCard className={iconClass} aria-hidden="true" />;
    default:
      return <DollarSign className={iconClass} aria-hidden="true" />;
  }
}

/**
 * Loading skeleton state for payment plans
 *
 * Displays animated loading state while payment plans are being fetched
 */
function LoadingState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-12"
      role="status"
      aria-live="polite"
      aria-label="Loading payment plans"
    >
      <Loader2
        className="h-12 w-12 text-daybreak-teal animate-spin"
        aria-hidden="true"
      />
      <p className="mt-4 text-muted-foreground text-sm">
        Loading payment options...
      </p>
    </div>
  );
}

/**
 * Error state component
 *
 * Displays friendly error message when payment plans are unavailable
 */
function ErrorState({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div
        className="rounded-full bg-amber-50 p-3 mb-4"
        aria-hidden="true"
      >
        <AlertCircle className="h-8 w-8 text-amber-600" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Unable to Load Payment Plans
      </h3>
      <p
        className="text-sm text-muted-foreground text-center mb-4 max-w-sm"
        role="alert"
      >
        We're unable to load payment plan options at this time.
        {error.message ? ` ${error.message}` : ""}
      </p>
    </div>
  );
}

/**
 * Individual payment plan card component
 *
 * Displays a single payment plan option with selection capability
 */
function PaymentPlanCard({
  plan,
  isSelected,
  onSelect,
  isSelecting,
}: {
  plan: PaymentPlan;
  isSelected: boolean;
  onSelect: () => void;
  isSelecting: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-lg border-2 p-5 transition-all",
        isSelected
          ? "border-daybreak-teal bg-daybreak-teal/5"
          : "border-border bg-white hover:border-daybreak-teal/50"
      )}
      role="group"
      aria-labelledby={`plan-${plan.id}-name`}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute -top-3 right-4">
          <span className="inline-flex items-center gap-1 bg-daybreak-teal text-white text-xs font-semibold px-3 py-1 rounded-full">
            <Check className="h-3 w-3" aria-hidden="true" />
            Selected
          </span>
        </div>
      )}

      <div className="space-y-4">
        {/* Plan name and frequency */}
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-daybreak-teal/10 p-2 mt-1">
            <FrequencyIcon frequency={plan.frequency} />
          </div>
          <div className="flex-1">
            <h3
              id={`plan-${plan.id}-name`}
              className="font-semibold text-foreground text-lg"
            >
              {plan.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {FREQUENCY_LABELS[plan.frequency]}
            </p>
            {plan.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {plan.description}
              </p>
            )}
          </div>
        </div>

        {/* Pricing information - AC-6.4.2 */}
        <div className="bg-cream/30 rounded-lg p-4">
          {plan.installmentAmount && (
            <div className="mb-2">
              <p className="text-xs text-muted-foreground mb-1">
                {plan.frequency === "per_session"
                  ? "Per Session"
                  : plan.frequency === "monthly"
                  ? "Per Month"
                  : "Total Prepaid"}
              </p>
              <p className="text-2xl font-bold text-daybreak-teal font-serif">
                {formatCurrency(plan.installmentAmount)}
              </p>
            </div>
          )}
          {plan.totalAmount && plan.frequency === "prepaid" && (
            <p className="text-xs text-muted-foreground">
              Total: {formatCurrency(plan.totalAmount)}
            </p>
          )}
        </div>

        {/* Terms link - AC-6.4.3 */}
        {plan.terms && (
          <div className="border-t pt-3">
            <button
              className="text-sm text-daybreak-teal hover:text-daybreak-teal/80 flex items-center gap-1 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                // In a real implementation, this would open a terms modal or link
                // For now, we'll just log it
                console.log("Terms for plan:", plan.id, plan.terms);
              }}
              aria-label={`View terms for ${plan.name}`}
            >
              View Terms
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Select button - AC-6.4.4 */}
        <Button
          variant={isSelected ? "default" : "outline"}
          size="lg"
          onClick={onSelect}
          disabled={isSelecting || isSelected}
          className={cn(
            "w-full",
            isSelected && "bg-daybreak-teal hover:bg-daybreak-teal/90"
          )}
          aria-label={
            isSelected
              ? `${plan.name} is selected`
              : `Select ${plan.name}`
          }
        >
          {isSelecting && isSelected ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Selecting...
            </>
          ) : isSelected ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Selected
            </>
          ) : (
            "Select This Plan"
          )}
        </Button>
      </div>
    </div>
  );
}

/**
 * Opens Intercom support chat with financial assistance context
 *
 * Triggers Intercom messenger with a pre-filled message about financial assistance
 */
function openFinancialAssistanceChat() {
  if (typeof window !== "undefined" && window.Intercom) {
    try {
      // Open Intercom with pre-filled message about financial assistance
      window.Intercom("showNewMessage", "I'd like to learn about financial assistance options.");
    } catch (error) {
      console.error("Failed to open Intercom:", error);
      // Fallback: just show the messenger
      window.Intercom("show");
    }
  } else {
    console.warn("Intercom not available");
    // Fallback: Could redirect to a contact form or support email
  }
}

/**
 * Renders payment plan selection modal
 *
 * Main component that displays payment plan options in an accessible modal dialog.
 * Fetches payment plans for the given session and allows user to select a plan.
 *
 * AC-6.4.1: "Payment options" click opens accessible modal
 * AC-6.4.2: Display all available payment plans with frequency and amounts
 * AC-6.4.3: Show terms link for each plan
 * AC-6.4.4: "Select this plan" triggers setPaymentPreference mutation
 * AC-6.4.5: "Financial assistance" link opens support chat (Intercom)
 * AC-6.4.6: Modal keyboard navigable and screen reader accessible
 *
 * @example
 * <PaymentPlanModal
 *   sessionId="session_123"
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onPlanSelected={(planId) => console.log("Selected plan:", planId)}
 * />
 */
export function PaymentPlanModal({
  sessionId,
  open,
  onOpenChange,
  onPlanSelected,
  className,
}: PaymentPlanModalProps) {
  const { paymentPlans, loading, error, selectPlan, selecting } =
    usePaymentPlans(sessionId);

  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);

  /**
   * Handle plan selection
   */
  const handleSelectPlan = async (planId: string) => {
    setSelectedPlanId(planId);

    try {
      await selectPlan(planId);
      onPlanSelected?.(planId);

      // Announce selection to screen readers
      const announcement = document.createElement("div");
      announcement.setAttribute("role", "status");
      announcement.setAttribute("aria-live", "polite");
      announcement.className = "sr-only";
      announcement.textContent = `Payment plan selected successfully`;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    } catch (err) {
      console.error("Failed to select plan:", err);
      setSelectedPlanId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("max-w-2xl max-h-[90vh] overflow-y-auto", className)}
        aria-describedby="payment-plan-description"
      >
        {/* Modal header - AC-6.4.1 */}
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Flexible Payment Options
          </DialogTitle>
          <DialogDescription id="payment-plan-description">
            Choose a payment plan that works best for your family.
          </DialogDescription>
        </DialogHeader>

        {/* Modal content */}
        <div className="space-y-6 mt-4">
          {/* Loading state */}
          {loading && <LoadingState />}

          {/* Error state */}
          {error && <ErrorState error={error} />}

          {/* Payment plans list - AC-6.4.2 */}
          {!loading && !error && paymentPlans && paymentPlans.length > 0 && (
            <div className="space-y-4" role="list" aria-label="Payment plan options">
              {paymentPlans.map((plan) => (
                <div key={plan.id} role="listitem">
                  <PaymentPlanCard
                    plan={plan}
                    isSelected={selectedPlanId === plan.id}
                    onSelect={() => handleSelectPlan(plan.id)}
                    isSelecting={selecting && selectedPlanId === plan.id}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && (!paymentPlans || paymentPlans.length === 0) && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No payment plans available at this time.
              </p>
            </div>
          )}

          {/* Financial assistance link - AC-6.4.5 */}
          {!loading && !error && (
            <div className="border-t pt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-100 p-2 mt-1">
                    <HeartHandshake className="h-5 w-5 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-1">
                      Need Financial Assistance?
                    </h4>
                    <p className="text-sm text-blue-800 mb-3">
                      We offer sliding scale options for families who need support.
                      Our team is here to help you find an affordable solution.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openFinancialAssistanceChat}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      Talk to Us About Financial Assistance
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

PaymentPlanModal.displayName = "PaymentPlanModal";
