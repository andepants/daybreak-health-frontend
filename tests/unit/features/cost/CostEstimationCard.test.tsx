/**
 * Unit tests for CostEstimationCard component
 *
 * Tests cost display, loading states, error handling, coverage breakdown,
 * and PHI protection per AC-6.1.1 through AC-6.1.5.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CostEstimationCard } from "@/features/cost/CostEstimationCard";
import type { CostEstimate } from "@/lib/validations/cost";

describe("CostEstimationCard", () => {
  const mockCostEstimate: CostEstimate = {
    sessionId: "session_123",
    perSessionCost: 2500, // $25.00
    insuranceCoverage: {
      percentage: 80,
      amount: null,
      description: "PPO coverage at 80%",
    },
    copay: 2500,
    coinsurance: 20,
    deductible: {
      total: 150000, // $1,500.00
      met: 50000, // $500.00
      remaining: 100000, // $1,000.00
    },
    insuranceCarrier: "Blue Cross Blue Shield",
    disclaimer: "Final cost may vary based on your specific plan",
    calculatedAt: "2025-11-30T12:00:00Z",
  };

  const defaultProps = {
    costEstimate: mockCostEstimate,
    memberId: "ABC123456789",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading State (AC-6.1.1)", () => {
    it("should show loading state when loading prop is true", () => {
      render(
        <CostEstimationCard
          {...defaultProps}
          costEstimate={null}
          loading={true}
        />
      );

      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText(/calculating your estimate/i)).toBeInTheDocument();
    });

    it("should display spinner animation during loading", () => {
      render(
        <CostEstimationCard
          {...defaultProps}
          costEstimate={null}
          loading={true}
        />
      );

      const loader = document.querySelector(".animate-spin");
      expect(loader).toBeInTheDocument();
    });

    it("should have accessible loading state", () => {
      render(
        <CostEstimationCard
          {...defaultProps}
          costEstimate={null}
          loading={true}
        />
      );

      const status = screen.getByRole("status");
      expect(status).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("Cost Display (AC-6.1.1, AC-6.1.2)", () => {
    it("should display per-session cost formatted as currency", () => {
      render(<CostEstimationCard {...defaultProps} />);

      expect(screen.getByText(/\$25\.00 per session/i)).toBeInTheDocument();
    });

    it("should display insurance carrier name", () => {
      render(<CostEstimationCard {...defaultProps} />);

      expect(screen.getByText("Blue Cross Blue Shield")).toBeInTheDocument();
    });

    it("should display carrier name in description", () => {
      render(<CostEstimationCard {...defaultProps} />);

      expect(screen.getByText(/based on blue cross blue shield coverage/i)).toBeInTheDocument();
    });

    it("should display coverage percentage", () => {
      render(<CostEstimationCard {...defaultProps} />);

      expect(screen.getByText("80%")).toBeInTheDocument();
    });

    it("should display coverage description when provided", () => {
      render(<CostEstimationCard {...defaultProps} />);

      expect(screen.getByText("PPO coverage at 80%")).toBeInTheDocument();
    });

    it("should display copay amount", () => {
      render(<CostEstimationCard {...defaultProps} />);

      expect(screen.getByText(/copay/i)).toBeInTheDocument();
      expect(screen.getByText("$25.00")).toBeInTheDocument();
    });

    it("should display coinsurance percentage", () => {
      render(<CostEstimationCard {...defaultProps} />);

      expect(screen.getByText(/coinsurance/i)).toBeInTheDocument();
      expect(screen.getByText("20%")).toBeInTheDocument();
    });
  });

  describe("Deductible Display", () => {
    it("should display deductible information when available", () => {
      render(<CostEstimationCard {...defaultProps} />);

      expect(screen.getByText(/deductible status/i)).toBeInTheDocument();
      expect(screen.getByText(/annual deductible/i)).toBeInTheDocument();
      expect(screen.getByText("$1,500.00")).toBeInTheDocument();
    });

    it("should display deductible met amount", () => {
      render(<CostEstimationCard {...defaultProps} />);

      expect(screen.getByText(/amount met/i)).toBeInTheDocument();
      expect(screen.getByText("$500.00")).toBeInTheDocument();
    });

    it("should display remaining deductible", () => {
      render(<CostEstimationCard {...defaultProps} />);

      expect(screen.getByText(/remaining/i)).toBeInTheDocument();
      expect(screen.getByText("$1,000.00")).toBeInTheDocument();
    });

    it("should not display deductible section when not available", () => {
      render(
        <CostEstimationCard
          {...defaultProps}
          costEstimate={{
            ...mockCostEstimate,
            deductible: null,
          }}
        />
      );

      expect(screen.queryByText(/deductible status/i)).not.toBeInTheDocument();
    });
  });

  describe("Disclaimer Display (AC-6.1.4)", () => {
    it("should display disclaimer text from API", () => {
      render(<CostEstimationCard {...defaultProps} />);

      expect(screen.getByText(/final cost may vary based on your specific plan/i)).toBeInTheDocument();
    });

    it("should display default disclaimer when none provided", () => {
      render(
        <CostEstimationCard
          {...defaultProps}
          costEstimate={{
            ...mockCostEstimate,
            disclaimer: null,
          }}
        />
      );

      expect(screen.getByText(/please note/i)).toBeInTheDocument();
      expect(screen.getByText(/this is an estimate only/i)).toBeInTheDocument();
    });
  });

  describe("Member ID Masking (AC-6.1.5)", () => {
    it("should display masked member ID showing only last 4 digits", () => {
      render(<CostEstimationCard {...defaultProps} />);

      expect(screen.getByText("****6789")).toBeInTheDocument();
    });

    it("should never display full member ID", () => {
      const { container } = render(<CostEstimationCard {...defaultProps} />);

      expect(container.textContent).not.toContain("ABC123456789");
    });

    it("should not display member ID row when not provided", () => {
      render(
        <CostEstimationCard
          {...defaultProps}
          memberId={undefined}
        />
      );

      expect(screen.queryByText(/member id/i)).not.toBeInTheDocument();
    });
  });

  describe("Error State (AC-6.1.3)", () => {
    it("should display error state when error prop is provided", () => {
      render(
        <CostEstimationCard
          {...defaultProps}
          costEstimate={null}
          error={new Error("Network connection failed")}
        />
      );

      expect(screen.getByText(/unable to estimate cost/i)).toBeInTheDocument();
      expect(screen.getByText(/network connection failed/i)).toBeInTheDocument();
    });

    it("should display support contact message in error state", () => {
      render(
        <CostEstimationCard
          {...defaultProps}
          costEstimate={null}
          error={new Error("Failed")}
        />
      );

      expect(screen.getByText(/contact our support team/i)).toBeInTheDocument();
    });

    it("should display retry button when onRetry is provided", () => {
      const onRetry = vi.fn();

      render(
        <CostEstimationCard
          {...defaultProps}
          costEstimate={null}
          error={new Error("Failed")}
          onRetry={onRetry}
        />
      );

      expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    });

    it("should call onRetry when retry button is clicked", async () => {
      const onRetry = vi.fn();
      const user = userEvent.setup();

      render(
        <CostEstimationCard
          {...defaultProps}
          costEstimate={null}
          error={new Error("Failed")}
          onRetry={onRetry}
        />
      );

      await user.click(screen.getByRole("button", { name: /try again/i }));

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("should have role=alert for error message", () => {
      render(
        <CostEstimationCard
          {...defaultProps}
          costEstimate={null}
          error={new Error("Test error")}
        />
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should display empty state when no cost estimate", () => {
      render(
        <CostEstimationCard
          {...defaultProps}
          costEstimate={null}
        />
      );

      expect(screen.getByText(/no cost estimate available/i)).toBeInTheDocument();
    });
  });

  describe("Coverage Amount Display", () => {
    it("should display coverage amount when provided instead of percentage", () => {
      render(
        <CostEstimationCard
          {...defaultProps}
          costEstimate={{
            ...mockCostEstimate,
            insuranceCoverage: {
              percentage: null,
              amount: 12000, // $120.00
              description: "Fixed coverage amount",
            },
          }}
        />
      );

      expect(screen.getByText(/coverage amount/i)).toBeInTheDocument();
      expect(screen.getByText("$120.00")).toBeInTheDocument();
    });

    it("should display both percentage and amount when both provided", () => {
      render(
        <CostEstimationCard
          {...defaultProps}
          costEstimate={{
            ...mockCostEstimate,
            insuranceCoverage: {
              percentage: 80,
              amount: 12000,
              description: "Coverage details",
            },
          }}
        />
      );

      expect(screen.getByText("80%")).toBeInTheDocument();
      expect(screen.getByText("$120.00")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      render(<CostEstimationCard {...defaultProps} />);

      const heading = screen.getByText("Your Estimated Cost");
      expect(heading).toBeInTheDocument();
    });

    it("should have accessible coverage details section", () => {
      render(<CostEstimationCard {...defaultProps} />);

      expect(screen.getByText(/coverage details/i)).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero cost correctly", () => {
      render(
        <CostEstimationCard
          {...defaultProps}
          costEstimate={{
            ...mockCostEstimate,
            perSessionCost: 0,
          }}
        />
      );

      expect(screen.getByText(/\$0\.00 per session/i)).toBeInTheDocument();
    });

    it("should handle null copay gracefully", () => {
      render(
        <CostEstimationCard
          {...defaultProps}
          costEstimate={{
            ...mockCostEstimate,
            copay: null,
          }}
        />
      );

      // Should not display copay row if null
      expect(screen.queryByText(/^copay$/i)).not.toBeInTheDocument();
    });

    it("should handle null coinsurance gracefully", () => {
      render(
        <CostEstimationCard
          {...defaultProps}
          costEstimate={{
            ...mockCostEstimate,
            coinsurance: null,
          }}
        />
      );

      // Should not display coinsurance row if null
      expect(screen.queryByText(/^coinsurance$/i)).not.toBeInTheDocument();
    });

    it("should handle missing coverage description", () => {
      render(
        <CostEstimationCard
          {...defaultProps}
          costEstimate={{
            ...mockCostEstimate,
            insuranceCoverage: {
              percentage: 80,
              amount: null,
              description: null,
            },
          }}
        />
      );

      expect(screen.getByText("80%")).toBeInTheDocument();
    });
  });
});
