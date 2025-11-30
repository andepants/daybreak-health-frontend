/**
 * Unit tests for DeductibleTracker component
 *
 * Tests coverage for:
 * - Rendering with available data (partial progress)
 * - Rendering with completed deductible (100%)
 * - Rendering with unavailable data
 * - Loading state display
 * - Progress calculation logic
 * - Accessibility attributes
 * - Currency formatting
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeductibleTracker } from "@/features/cost/DeductibleTracker";
import type { DeductibleInfo } from "@/lib/validations/cost";

describe("DeductibleTracker", () => {
  describe("with available data", () => {
    it("renders deductible information with partial progress", () => {
      const deductibleInfo: DeductibleInfo = {
        total: 150000, // $1,500
        met: 50000, // $500
        remaining: 100000, // $1,000
      };

      render(
        <DeductibleTracker
          deductibleInfo={deductibleInfo}
          isAvailable={true}
        />
      );

      // Check header
      expect(screen.getByText("Annual Deductible")).toBeInTheDocument();
      expect(screen.getByText("Tracking your progress")).toBeInTheDocument();

      // Check progress percentage (500/1500 = 33%)
      expect(screen.getByText("33%")).toBeInTheDocument();

      // Check amounts with currency formatting
      expect(screen.getByText("$500.00 met")).toBeInTheDocument();
      expect(screen.getByText("$1,500.00 total")).toBeInTheDocument();

      // Check remaining amount
      expect(screen.getByText("Remaining Deductible")).toBeInTheDocument();
      expect(screen.getByText("$1,000.00")).toBeInTheDocument();

      // Check helpful note
      expect(screen.getByText(/Costs may decrease after your deductible is met/i)).toBeInTheDocument();
    });

    it("renders completed deductible state (100%)", () => {
      const deductibleInfo: DeductibleInfo = {
        total: 150000, // $1,500
        met: 150000, // $1,500
        remaining: 0, // $0
      };

      render(
        <DeductibleTracker
          deductibleInfo={deductibleInfo}
          isAvailable={true}
        />
      );

      // Check completed state indicator
      expect(screen.getByText("Deductible met")).toBeInTheDocument();
      expect(screen.getByText("100%")).toBeInTheDocument();

      // Check remaining shows $0
      expect(screen.getByText("$0.00")).toBeInTheDocument();

      // Check congratulatory message
      expect(screen.getByText(/You've met your annual deductible/i)).toBeInTheDocument();
    });

    it("calculates progress correctly for various scenarios", () => {
      // 0% progress
      const { rerender } = render(
        <DeductibleTracker
          deductibleInfo={{ total: 100000, met: 0, remaining: 100000 }}
          isAvailable={true}
        />
      );
      expect(screen.getByText("0%")).toBeInTheDocument();

      // 50% progress
      rerender(
        <DeductibleTracker
          deductibleInfo={{ total: 100000, met: 50000, remaining: 50000 }}
          isAvailable={true}
        />
      );
      expect(screen.getByText("50%")).toBeInTheDocument();

      // 75% progress
      rerender(
        <DeductibleTracker
          deductibleInfo={{ total: 100000, met: 75000, remaining: 25000 }}
          isAvailable={true}
        />
      );
      expect(screen.getByText("75%")).toBeInTheDocument();

      // 100% progress
      rerender(
        <DeductibleTracker
          deductibleInfo={{ total: 100000, met: 100000, remaining: 0 }}
          isAvailable={true}
        />
      );
      expect(screen.getByText("100%")).toBeInTheDocument();
    });

    it("displays progress bar with correct ARIA attributes", () => {
      const deductibleInfo: DeductibleInfo = {
        total: 150000,
        met: 50000,
        remaining: 100000,
      };

      render(
        <DeductibleTracker
          deductibleInfo={deductibleInfo}
          isAvailable={true}
        />
      );

      const progressBar = screen.getByRole("progressbar", { name: /deductible progress/i });
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute("aria-valuemin", "0");
      expect(progressBar).toHaveAttribute("aria-valuemax", "100");
      expect(progressBar).toHaveAttribute("aria-valuenow", "33");
    });
  });

  describe("with unavailable data", () => {
    it("renders unavailable state when isAvailable is false", () => {
      render(
        <DeductibleTracker
          deductibleInfo={null}
          isAvailable={false}
        />
      );

      expect(screen.getByText("Unable to Determine Deductible Status")).toBeInTheDocument();
      expect(
        screen.getByText(/We're unable to retrieve your deductible information/i)
      ).toBeInTheDocument();
    });

    it("renders unavailable state when deductibleInfo is null", () => {
      render(
        <DeductibleTracker
          deductibleInfo={null}
          isAvailable={true}
        />
      );

      expect(screen.getByText("Unable to Determine Deductible Status")).toBeInTheDocument();
    });

    it("renders contact insurance link when callback provided", async () => {
      const user = userEvent.setup();
      const onContactInsurance = vi.fn();

      render(
        <DeductibleTracker
          deductibleInfo={null}
          isAvailable={false}
          onContactInsurance={onContactInsurance}
        />
      );

      const contactLink = screen.getByRole("button", { name: /contact your insurance/i });
      expect(contactLink).toBeInTheDocument();

      await user.click(contactLink);
      expect(onContactInsurance).toHaveBeenCalledTimes(1);
    });

    it("does not render contact insurance link when callback not provided", () => {
      render(
        <DeductibleTracker
          deductibleInfo={null}
          isAvailable={false}
        />
      );

      const contactLink = screen.queryByRole("button", { name: /contact your insurance/i });
      expect(contactLink).not.toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("renders loading skeleton when isLoading is true", () => {
      render(
        <DeductibleTracker
          deductibleInfo={null}
          isLoading={true}
          isAvailable={true}
        />
      );

      expect(screen.getByText("Loading deductible information...")).toBeInTheDocument();

      // Should not show data or unavailable state
      expect(screen.queryByText("Annual Deductible")).not.toBeInTheDocument();
      expect(screen.queryByText("Unable to Determine Deductible Status")).not.toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("handles zero deductible total", () => {
      const deductibleInfo: DeductibleInfo = {
        total: 0,
        met: 0,
        remaining: 0,
      };

      render(
        <DeductibleTracker
          deductibleInfo={deductibleInfo}
          isAvailable={true}
        />
      );

      // Should show 0% progress
      expect(screen.getByText("0%")).toBeInTheDocument();
      expect(screen.getByText("$0.00 met")).toBeInTheDocument();
      expect(screen.getByText("$0.00 total")).toBeInTheDocument();
    });

    it("handles met exceeding total (edge case)", () => {
      const deductibleInfo: DeductibleInfo = {
        total: 100000,
        met: 120000, // Met exceeds total
        remaining: 0,
      };

      render(
        <DeductibleTracker
          deductibleInfo={deductibleInfo}
          isAvailable={true}
        />
      );

      // Should cap at 100%
      expect(screen.getByText("100%")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const deductibleInfo: DeductibleInfo = {
        total: 150000,
        met: 50000,
        remaining: 100000,
      };

      const { container } = render(
        <DeductibleTracker
          deductibleInfo={deductibleInfo}
          isAvailable={true}
          className="custom-class"
        />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("custom-class");
    });
  });

  describe("accessibility", () => {
    it("has proper semantic structure", () => {
      const deductibleInfo: DeductibleInfo = {
        total: 150000,
        met: 50000,
        remaining: 100000,
      };

      const { container } = render(
        <DeductibleTracker
          deductibleInfo={deductibleInfo}
          isAvailable={true}
        />
      );

      // Check for proper heading
      expect(screen.getByText("Annual Deductible")).toBeInTheDocument();

      // Check progress bar role
      expect(screen.getByRole("progressbar")).toBeInTheDocument();

      // Verify no accessibility violations (basic check)
      const buttons = screen.queryAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName();
      });
    });

    it("announces loading state to screen readers", () => {
      render(
        <DeductibleTracker
          deductibleInfo={null}
          isLoading={true}
        />
      );

      // Check for loading message that would be read by screen readers
      const loadingText = screen.getByText("Loading deductible information...");
      expect(loadingText).toBeInTheDocument();
    });
  });
});
