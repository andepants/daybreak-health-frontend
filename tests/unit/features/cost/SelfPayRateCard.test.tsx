/**
 * Unit tests for SelfPayRateCard component
 *
 * Tests rendering of self-pay pricing, package options, selection
 * functionality, and all acceptance criteria.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelfPayRateCard } from "@/features/cost/SelfPayRateCard";
import type { SelfPayRate } from "@/lib/validations/cost";

describe("SelfPayRateCard", () => {
  const mockSelfPayRates: SelfPayRate = {
    perSessionRate: 15000, // $150.00
    packages: [
      {
        id: "pkg_4",
        name: "4-Session Package",
        sessionCount: 4,
        totalPrice: 54000, // $540.00
        pricePerSession: 13500, // $135.00
        savingsPercentage: 10,
      },
      {
        id: "pkg_8",
        name: "8-Session Package",
        sessionCount: 8,
        totalPrice: 96000, // $960.00
        pricePerSession: 12000, // $120.00
        savingsPercentage: 20,
      },
    ],
    financialAssistanceAvailable: true,
  };

  describe("Loading State", () => {
    it("should display loading spinner when loading is true", () => {
      render(<SelfPayRateCard selfPayRates={null} loading={true} />);

      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText(/loading pricing options/i)).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should display error message when error is provided", () => {
      const error = new Error("Failed to load rates");
      render(
        <SelfPayRateCard selfPayRates={null} error={error} />
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(
        screen.getByText(/unable to load self-pay rates/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/failed to load rates/i)).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should display no data message when selfPayRates is null", () => {
      render(<SelfPayRateCard selfPayRates={null} />);

      expect(
        screen.getByText(/no self-pay rates available/i)
      ).toBeInTheDocument();
    });
  });

  describe("AC-6.2.1: Per-Session Rate Display", () => {
    it("should always display the per-session self-pay rate", () => {
      render(<SelfPayRateCard selfPayRates={mockSelfPayRates} />);

      // Check for "Self-Pay Rate" heading (exact match)
      expect(screen.getByText("Self-Pay Rate")).toBeInTheDocument();

      // Check for per-session rate display
      expect(screen.getByText("$150.00")).toBeInTheDocument();
      expect(screen.getByText(/per session rate/i)).toBeInTheDocument();
    });

    it("should display rate with proper formatting", () => {
      const ratesWithDifferentAmount: SelfPayRate = {
        ...mockSelfPayRates,
        perSessionRate: 12500, // $125.00
      };

      render(<SelfPayRateCard selfPayRates={ratesWithDifferentAmount} />);
      expect(screen.getByText("$125.00")).toBeInTheDocument();
    });
  });

  describe("AC-6.2.2: Package Discounts Display", () => {
    it("should show package options with savings percentage", () => {
      render(<SelfPayRateCard selfPayRates={mockSelfPayRates} />);

      // Check for package heading
      expect(screen.getByText(/package options/i)).toBeInTheDocument();

      // Check for first package
      expect(screen.getByText("4-Session Package")).toBeInTheDocument();
      expect(screen.getByText("4 sessions")).toBeInTheDocument();
      expect(screen.getByText("$540.00")).toBeInTheDocument();
      expect(screen.getByText("$135.00 per session")).toBeInTheDocument();
      expect(screen.getByText(/save 10%/i)).toBeInTheDocument();

      // Check for second package
      expect(screen.getByText("8-Session Package")).toBeInTheDocument();
      expect(screen.getByText("8 sessions")).toBeInTheDocument();
      expect(screen.getByText("$960.00")).toBeInTheDocument();
      expect(screen.getByText("$120.00 per session")).toBeInTheDocument();
      expect(screen.getByText(/save 20%/i)).toBeInTheDocument();
    });

    it("should not show package section when no packages available", () => {
      const ratesWithoutPackages: SelfPayRate = {
        ...mockSelfPayRates,
        packages: [],
      };

      render(<SelfPayRateCard selfPayRates={ratesWithoutPackages} />);
      expect(screen.queryByText(/package options/i)).not.toBeInTheDocument();
    });
  });

  describe("Package Selection", () => {
    it("should call onSelectPackage when package is clicked", async () => {
      const user = userEvent.setup();
      const onSelectPackage = vi.fn();

      render(
        <SelfPayRateCard
          selfPayRates={mockSelfPayRates}
          onSelectPackage={onSelectPackage}
        />
      );

      // Click the first package's select button
      const selectButtons = screen.getAllByRole("button", { name: /select/i });
      await user.click(selectButtons[0]);

      expect(onSelectPackage).toHaveBeenCalledWith("pkg_4");
    });

    it("should show selected state for selected package", () => {
      render(
        <SelfPayRateCard
          selfPayRates={mockSelfPayRates}
          selectedPackageId="pkg_4"
        />
      );

      expect(screen.getByRole("button", { name: /selected/i })).toBeInTheDocument();
    });

    it("should show selecting state when selection is in progress", () => {
      render(
        <SelfPayRateCard
          selfPayRates={mockSelfPayRates}
          selectedPackageId="pkg_4"
          isSelecting={true}
        />
      );

      expect(screen.getByText(/selecting/i)).toBeInTheDocument();
    });
  });

  describe("AC-6.2.5: Choose Self-Pay Button", () => {
    it("should display 'Choose Self-Pay' button when onSelectSelfPay is provided", () => {
      const onSelectSelfPay = vi.fn();

      render(
        <SelfPayRateCard
          selfPayRates={mockSelfPayRates}
          onSelectSelfPay={onSelectSelfPay}
        />
      );

      expect(
        screen.getByRole("button", { name: /choose self-pay/i })
      ).toBeInTheDocument();
    });

    it("should call onSelectSelfPay when button is clicked", async () => {
      const user = userEvent.setup();
      const onSelectSelfPay = vi.fn();

      render(
        <SelfPayRateCard
          selfPayRates={mockSelfPayRates}
          onSelectSelfPay={onSelectSelfPay}
        />
      );

      await user.click(
        screen.getByRole("button", { name: /choose self-pay/i })
      );

      expect(onSelectSelfPay).toHaveBeenCalledTimes(1);
    });

    it("should disable button when selection is in progress", () => {
      const onSelectSelfPay = vi.fn();

      render(
        <SelfPayRateCard
          selfPayRates={mockSelfPayRates}
          onSelectSelfPay={onSelectSelfPay}
          isSelecting={true}
        />
      );

      const button = screen.getByRole("button", { name: /selecting/i });
      expect(button).toBeDisabled();
    });

    it("should not display button when onSelectSelfPay is not provided", () => {
      render(<SelfPayRateCard selfPayRates={mockSelfPayRates} />);

      expect(
        screen.queryByRole("button", { name: /choose self-pay/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("Financial Assistance", () => {
    it("should display financial assistance notice when available", () => {
      render(<SelfPayRateCard selfPayRates={mockSelfPayRates} />);

      expect(
        screen.getByText(/financial assistance available/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/sliding scale options/i)
      ).toBeInTheDocument();
    });

    it("should not display notice when financial assistance is not available", () => {
      const ratesWithoutAssistance: SelfPayRate = {
        ...mockSelfPayRates,
        financialAssistanceAvailable: false,
      };

      render(<SelfPayRateCard selfPayRates={ratesWithoutAssistance} />);

      expect(
        screen.queryByText(/financial assistance available/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("Disclaimer", () => {
    it("should always display self-pay disclaimer", () => {
      render(<SelfPayRateCard selfPayRates={mockSelfPayRates} />);

      expect(screen.getByText(/please note/i)).toBeInTheDocument();
      expect(
        screen.getByText(/self-pay rates are set in advance/i)
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<SelfPayRateCard selfPayRates={mockSelfPayRates} loading={true} />);

      const loadingStatus = screen.getByRole("status");
      expect(loadingStatus).toHaveAttribute(
        "aria-label",
        "Loading self-pay rates"
      );
    });

    it("should have semantic card structure", () => {
      render(<SelfPayRateCard selfPayRates={mockSelfPayRates} />);

      // Card should be rendered - use exact text match
      const card = screen.getByText("Self-Pay Rate").closest("[class*='card']");
      expect(card).toBeInTheDocument();
    });
  });

  describe("Custom className", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <SelfPayRateCard
          selfPayRates={mockSelfPayRates}
          className="custom-class"
        />
      );

      const card = container.querySelector(".custom-class");
      expect(card).toBeInTheDocument();
    });
  });
});
