/**
 * Unit tests for CostComparisonView component
 *
 * Tests side-by-side comparison display, affordability highlighting,
 * and conditional rendering based on data availability.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CostComparisonView } from "@/features/cost/CostComparisonView";
import type { CostEstimate, SelfPayRate } from "@/lib/validations/cost";

describe("CostComparisonView", () => {
  const mockCostEstimate: CostEstimate = {
    sessionId: "session_123",
    perSessionCost: 2500, // $25.00
    insuranceCoverage: {
      percentage: 80,
      amount: null,
      description: "PPO coverage",
    },
    copay: 2500,
    coinsurance: null,
    deductible: null,
    insuranceCarrier: "Blue Cross Blue Shield",
    disclaimer: "This is an estimate",
    calculatedAt: "2025-11-30T12:00:00Z",
  };

  const mockSelfPayRates: SelfPayRate = {
    perSessionRate: 15000, // $150.00
    packages: [
      {
        id: "pkg_4",
        name: "4-Session Package",
        sessionCount: 4,
        totalPrice: 54000,
        pricePerSession: 13500,
        savingsPercentage: 10,
      },
    ],
    financialAssistanceAvailable: true,
  };

  describe("AC-6.2.3: Conditional Rendering", () => {
    it("should not render when costEstimate is null", () => {
      const { container } = render(
        <CostComparisonView
          costEstimate={null}
          selfPayRates={mockSelfPayRates}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should not render when selfPayRates is null", () => {
      const { container } = render(
        <CostComparisonView
          costEstimate={mockCostEstimate}
          selfPayRates={null}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should not render when both are null", () => {
      const { container } = render(
        <CostComparisonView costEstimate={null} selfPayRates={null} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should render comparison when both options are available", () => {
      render(
        <CostComparisonView
          costEstimate={mockCostEstimate}
          selfPayRates={mockSelfPayRates}
        />
      );

      expect(screen.getByText(/compare your options/i)).toBeInTheDocument();
    });
  });

  describe("Comparison Display", () => {
    it("should display heading and description", () => {
      render(
        <CostComparisonView
          costEstimate={mockCostEstimate}
          selfPayRates={mockSelfPayRates}
        />
      );

      expect(screen.getByText(/compare your options/i)).toBeInTheDocument();
      expect(
        screen.getByText(/choose the payment method that works best/i)
      ).toBeInTheDocument();
    });

    it("should display both insurance and self-pay cards", () => {
      render(
        <CostComparisonView
          costEstimate={mockCostEstimate}
          selfPayRates={mockSelfPayRates}
        />
      );

      expect(screen.getByText("Insurance Coverage")).toBeInTheDocument();
      expect(screen.getByText("Blue Cross Blue Shield")).toBeInTheDocument();
      expect(screen.getByText("Self-Pay")).toBeInTheDocument();
      expect(
        screen.getByText("Pay directly without insurance")
      ).toBeInTheDocument();
    });

    it("should display per-session costs for both options", () => {
      render(
        <CostComparisonView
          costEstimate={mockCostEstimate}
          selfPayRates={mockSelfPayRates}
        />
      );

      expect(screen.getByText("$25.00")).toBeInTheDocument(); // Insurance
      expect(screen.getByText("$150.00")).toBeInTheDocument(); // Self-pay
    });
  });

  describe("AC-6.2.4: Highlight More Affordable Option", () => {
    it("should highlight insurance when it is cheaper", () => {
      render(
        <CostComparisonView
          costEstimate={mockCostEstimate} // $25.00
          selfPayRates={mockSelfPayRates} // $150.00
        />
      );

      // Should show "More Affordable" badge (only one)
      const badges = screen.getAllByText(/more affordable/i);
      expect(badges).toHaveLength(1);

      // Verify the badge exists in the document
      expect(badges[0]).toBeInTheDocument();

      // Insurance card should exist
      const insuranceCard = screen.getByText("Insurance Coverage");
      expect(insuranceCard).toBeInTheDocument();
    });

    it("should highlight self-pay when it is cheaper", () => {
      const cheaperSelfPay: SelfPayRate = {
        ...mockSelfPayRates,
        perSessionRate: 2000, // $20.00 - cheaper than $25 insurance
      };

      render(
        <CostComparisonView
          costEstimate={mockCostEstimate} // $25.00
          selfPayRates={cheaperSelfPay} // $20.00
        />
      );

      // Should show "More Affordable" badge
      const badges = screen.getAllByText(/more affordable/i);
      expect(badges).toHaveLength(1);

      // Verify the badge exists in the document
      expect(badges[0]).toBeInTheDocument();

      // Self-pay card should exist
      const selfPayCard = screen.getByText("Self-Pay");
      expect(selfPayCard).toBeInTheDocument();
    });

    it("should not highlight when costs are equal", () => {
      const equalCostSelfPay: SelfPayRate = {
        ...mockSelfPayRates,
        perSessionRate: 2500, // $25.00 - same as insurance
      };

      render(
        <CostComparisonView
          costEstimate={mockCostEstimate} // $25.00
          selfPayRates={equalCostSelfPay} // $25.00
        />
      );

      // Should not show "More Affordable" badge when equal
      expect(screen.queryByText(/more affordable/i)).not.toBeInTheDocument();
    });
  });

  describe("Features and Trade-offs", () => {
    it("should display insurance benefits", () => {
      render(
        <CostComparisonView
          costEstimate={mockCostEstimate}
          selfPayRates={mockSelfPayRates}
        />
      );

      expect(
        screen.getByText(/leverages your existing coverage/i)
      ).toBeInTheDocument();
    });

    it("should display self-pay benefits", () => {
      render(
        <CostComparisonView
          costEstimate={mockCostEstimate}
          selfPayRates={mockSelfPayRates}
        />
      );

      expect(
        screen.getByText(/predictable pricing every session/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/no insurance paperwork required/i)
      ).toBeInTheDocument();
    });

    it("should display package availability for self-pay", () => {
      render(
        <CostComparisonView
          costEstimate={mockCostEstimate}
          selfPayRates={mockSelfPayRates}
        />
      );

      expect(
        screen.getByText(/package discounts available/i)
      ).toBeInTheDocument();
    });

    it("should display trade-offs for insurance", () => {
      render(
        <CostComparisonView
          costEstimate={mockCostEstimate}
          selfPayRates={mockSelfPayRates}
        />
      );

      expect(
        screen.getByText(/may require using in-network therapists/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/subject to deductible and plan terms/i)
      ).toBeInTheDocument();
    });

    it("should display trade-offs for self-pay", () => {
      render(
        <CostComparisonView
          costEstimate={mockCostEstimate}
          selfPayRates={mockSelfPayRates}
        />
      );

      expect(
        screen.getByText(/does not count toward insurance deductible/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/full payment due at time of service/i)
      ).toBeInTheDocument();
    });
  });

  describe("Selection Buttons", () => {
    it("should display 'Use Insurance' button when callback provided", () => {
      const onSelectInsurance = vi.fn();

      render(
        <CostComparisonView
          costEstimate={mockCostEstimate}
          selfPayRates={mockSelfPayRates}
          onSelectInsurance={onSelectInsurance}
        />
      );

      expect(
        screen.getByRole("button", { name: /use insurance/i })
      ).toBeInTheDocument();
    });

    it("should display 'Choose Self-Pay' button when callback provided", () => {
      const onSelectSelfPay = vi.fn();

      render(
        <CostComparisonView
          costEstimate={mockCostEstimate}
          selfPayRates={mockSelfPayRates}
          onSelectSelfPay={onSelectSelfPay}
        />
      );

      expect(
        screen.getByRole("button", { name: /choose self-pay/i })
      ).toBeInTheDocument();
    });

    it("should call onSelectInsurance when insurance button clicked", async () => {
      const user = userEvent.setup();
      const onSelectInsurance = vi.fn();

      render(
        <CostComparisonView
          costEstimate={mockCostEstimate}
          selfPayRates={mockSelfPayRates}
          onSelectInsurance={onSelectInsurance}
        />
      );

      await user.click(screen.getByRole("button", { name: /use insurance/i }));
      expect(onSelectInsurance).toHaveBeenCalledTimes(1);
    });

    it("should call onSelectSelfPay when self-pay button clicked", async () => {
      const user = userEvent.setup();
      const onSelectSelfPay = vi.fn();

      render(
        <CostComparisonView
          costEstimate={mockCostEstimate}
          selfPayRates={mockSelfPayRates}
          onSelectSelfPay={onSelectSelfPay}
        />
      );

      await user.click(screen.getByRole("button", { name: /choose self-pay/i }));
      expect(onSelectSelfPay).toHaveBeenCalledTimes(1);
    });

    it("should not display buttons when callbacks not provided", () => {
      render(
        <CostComparisonView
          costEstimate={mockCostEstimate}
          selfPayRates={mockSelfPayRates}
        />
      );

      expect(
        screen.queryByRole("button", { name: /use insurance/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /choose self-pay/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("Additional Context", () => {
    it("should display help text about changing preferences", () => {
      render(
        <CostComparisonView
          costEstimate={mockCostEstimate}
          selfPayRates={mockSelfPayRates}
        />
      );

      expect(screen.getByText(/not sure which to choose/i)).toBeInTheDocument();
      expect(
        screen.getByText(/you can always change your payment preference later/i)
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper semantic structure", () => {
      render(
        <CostComparisonView
          costEstimate={mockCostEstimate}
          selfPayRates={mockSelfPayRates}
        />
      );

      // Should have heading
      const heading = screen.getByText(/compare your options/i);
      expect(heading.tagName).toBe("H3");
    });

    it("should have ARIA label for recommended option", () => {
      render(
        <CostComparisonView
          costEstimate={mockCostEstimate}
          selfPayRates={mockSelfPayRates}
        />
      );

      const recommendedBadge = screen.getByText(/more affordable/i);
      const statusElement = recommendedBadge.closest("[role='status']");
      expect(statusElement).toHaveAttribute(
        "aria-label",
        "Recommended option"
      );
    });
  });

  describe("Custom className", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <CostComparisonView
          costEstimate={mockCostEstimate}
          selfPayRates={mockSelfPayRates}
          className="custom-comparison-class"
        />
      );

      const comparisonDiv = container.querySelector(".custom-comparison-class");
      expect(comparisonDiv).toBeInTheDocument();
    });
  });
});
