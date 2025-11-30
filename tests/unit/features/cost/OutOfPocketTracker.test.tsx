/**
 * Unit tests for OutOfPocketTracker component
 *
 * Tests coverage for:
 * - Rendering with available data (partial progress)
 * - Rendering with max reached (100%)
 * - Rendering with unavailable data
 * - Loading state display
 * - Progress calculation logic
 * - "You've reached your max" indicator
 * - Accessibility attributes
 * - Currency formatting
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OutOfPocketTracker } from "@/features/cost/OutOfPocketTracker";
import type { OutOfPocketInfo } from "@/lib/validations/cost";

describe("OutOfPocketTracker", () => {
  describe("with available data", () => {
    it("renders out-of-pocket information with partial progress", () => {
      const outOfPocketInfo: OutOfPocketInfo = {
        max: 500000, // $5,000
        met: 200000, // $2,000
        remaining: 300000, // $3,000
      };

      render(
        <OutOfPocketTracker
          outOfPocketInfo={outOfPocketInfo}
          isAvailable={true}
        />
      );

      // Check header
      expect(screen.getByText("Out-of-Pocket Maximum")).toBeInTheDocument();
      expect(screen.getByText("Annual maximum")).toBeInTheDocument();

      // Check progress percentage (2000/5000 = 40%)
      expect(screen.getByText("40%")).toBeInTheDocument();

      // Check amounts with currency formatting
      expect(screen.getByText("$2,000.00 applied")).toBeInTheDocument();
      expect(screen.getByText("$5,000.00 maximum")).toBeInTheDocument();

      // Check remaining amount
      expect(screen.getByText("Remaining Until Max")).toBeInTheDocument();
      expect(screen.getByText("$3,000.00")).toBeInTheDocument();

      // Check helpful note
      expect(
        screen.getByText(/After reaching your out-of-pocket maximum/i)
      ).toBeInTheDocument();
    });

    it("renders max reached state with indicator - AC-6.3.5", () => {
      const outOfPocketInfo: OutOfPocketInfo = {
        max: 500000, // $5,000
        met: 500000, // $5,000
        remaining: 0, // $0
      };

      render(
        <OutOfPocketTracker
          outOfPocketInfo={outOfPocketInfo}
          isAvailable={true}
        />
      );

      // Check max reached indicator
      expect(screen.getByText("Maximum reached")).toBeInTheDocument();
      expect(screen.getByText("100%")).toBeInTheDocument();

      // Check "You've reached your max" message
      expect(screen.getByText("You've Reached Your Maximum!")).toBeInTheDocument();
      expect(
        screen.getByText(/You've met your annual out-of-pocket maximum/i)
      ).toBeInTheDocument();

      // Should not show "Remaining Until Max" section
      expect(screen.queryByText("Remaining Until Max")).not.toBeInTheDocument();
    });

    it("calculates progress correctly for various scenarios", () => {
      // 0% progress
      const { rerender } = render(
        <OutOfPocketTracker
          outOfPocketInfo={{ max: 500000, met: 0, remaining: 500000 }}
          isAvailable={true}
        />
      );
      expect(screen.getByText("0%")).toBeInTheDocument();

      // 25% progress
      rerender(
        <OutOfPocketTracker
          outOfPocketInfo={{ max: 500000, met: 125000, remaining: 375000 }}
          isAvailable={true}
        />
      );
      expect(screen.getByText("25%")).toBeInTheDocument();

      // 50% progress
      rerender(
        <OutOfPocketTracker
          outOfPocketInfo={{ max: 500000, met: 250000, remaining: 250000 }}
          isAvailable={true}
        />
      );
      expect(screen.getByText("50%")).toBeInTheDocument();

      // 100% progress
      rerender(
        <OutOfPocketTracker
          outOfPocketInfo={{ max: 500000, met: 500000, remaining: 0 }}
          isAvailable={true}
        />
      );
      expect(screen.getByText("100%")).toBeInTheDocument();
    });

    it("displays progress bar with correct ARIA attributes", () => {
      const outOfPocketInfo: OutOfPocketInfo = {
        max: 500000,
        met: 200000,
        remaining: 300000,
      };

      render(
        <OutOfPocketTracker
          outOfPocketInfo={outOfPocketInfo}
          isAvailable={true}
        />
      );

      const progressBar = screen.getByRole("progressbar", {
        name: /out-of-pocket progress/i,
      });
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute("aria-valuemin", "0");
      expect(progressBar).toHaveAttribute("aria-valuemax", "100");
      expect(progressBar).toHaveAttribute("aria-valuenow", "40");
    });

    it("applies green styling when max is reached", () => {
      const outOfPocketInfo: OutOfPocketInfo = {
        max: 500000,
        met: 500000,
        remaining: 0,
      };

      const { container } = render(
        <OutOfPocketTracker
          outOfPocketInfo={outOfPocketInfo}
          isAvailable={true}
        />
      );

      // Check for green success indicator
      expect(screen.getByText("You've Reached Your Maximum!")).toBeInTheDocument();

      // Verify green visual elements are present
      const greenIndicators = container.querySelectorAll(".text-green-600, .bg-green-50");
      expect(greenIndicators.length).toBeGreaterThan(0);
    });
  });

  describe("with unavailable data", () => {
    it("renders unavailable state when isAvailable is false - AC-6.3.4", () => {
      render(
        <OutOfPocketTracker
          outOfPocketInfo={null}
          isAvailable={false}
        />
      );

      expect(
        screen.getByText("Unable to Determine Out-of-Pocket Maximum")
      ).toBeInTheDocument();
      expect(
        screen.getByText(/We're unable to retrieve your out-of-pocket maximum information/i)
      ).toBeInTheDocument();
    });

    it("renders unavailable state when outOfPocketInfo is null", () => {
      render(
        <OutOfPocketTracker
          outOfPocketInfo={null}
          isAvailable={true}
        />
      );

      expect(
        screen.getByText("Unable to Determine Out-of-Pocket Maximum")
      ).toBeInTheDocument();
    });

    it("renders contact insurance link when callback provided", async () => {
      const user = userEvent.setup();
      const onContactInsurance = vi.fn();

      render(
        <OutOfPocketTracker
          outOfPocketInfo={null}
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
        <OutOfPocketTracker
          outOfPocketInfo={null}
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
        <OutOfPocketTracker
          outOfPocketInfo={null}
          isLoading={true}
          isAvailable={true}
        />
      );

      expect(screen.getByText("Loading out-of-pocket information...")).toBeInTheDocument();

      // Should not show data or unavailable state
      expect(screen.queryByText("Out-of-Pocket Maximum")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Unable to Determine Out-of-Pocket Maximum")
      ).not.toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("handles zero max value", () => {
      const outOfPocketInfo: OutOfPocketInfo = {
        max: 0,
        met: 0,
        remaining: 0,
      };

      render(
        <OutOfPocketTracker
          outOfPocketInfo={outOfPocketInfo}
          isAvailable={true}
        />
      );

      // When max is 0 and remaining is 0, it's treated as "max reached"
      expect(screen.getByText("Maximum reached")).toBeInTheDocument();
      expect(screen.getByText("100%")).toBeInTheDocument();
      expect(screen.getByText("$0.00 applied")).toBeInTheDocument();
      expect(screen.getByText("$0.00 maximum")).toBeInTheDocument();
      expect(screen.getByText("You've Reached Your Maximum!")).toBeInTheDocument();
    });

    it("handles met exceeding max (edge case)", () => {
      const outOfPocketInfo: OutOfPocketInfo = {
        max: 500000,
        met: 600000, // Met exceeds max
        remaining: 0,
      };

      render(
        <OutOfPocketTracker
          outOfPocketInfo={outOfPocketInfo}
          isAvailable={true}
        />
      );

      // Should cap at 100% and show max reached state
      expect(screen.getByText("100%")).toBeInTheDocument();
      expect(screen.getByText("You've Reached Your Maximum!")).toBeInTheDocument();
    });

    it("treats remaining as 0 as max reached", () => {
      const outOfPocketInfo: OutOfPocketInfo = {
        max: 500000,
        met: 490000,
        remaining: 0, // Remaining is 0 even though met < max
      };

      render(
        <OutOfPocketTracker
          outOfPocketInfo={outOfPocketInfo}
          isAvailable={true}
        />
      );

      // Should show max reached indicator
      expect(screen.getByText("Maximum reached")).toBeInTheDocument();
      expect(screen.getByText("You've Reached Your Maximum!")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const outOfPocketInfo: OutOfPocketInfo = {
        max: 500000,
        met: 200000,
        remaining: 300000,
      };

      const { container } = render(
        <OutOfPocketTracker
          outOfPocketInfo={outOfPocketInfo}
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
      const outOfPocketInfo: OutOfPocketInfo = {
        max: 500000,
        met: 200000,
        remaining: 300000,
      };

      render(
        <OutOfPocketTracker
          outOfPocketInfo={outOfPocketInfo}
          isAvailable={true}
        />
      );

      // Check for proper heading
      expect(screen.getByText("Out-of-Pocket Maximum")).toBeInTheDocument();

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
        <OutOfPocketTracker
          outOfPocketInfo={null}
          isLoading={true}
        />
      );

      // Check for loading message that would be read by screen readers
      const loadingText = screen.getByText("Loading out-of-pocket information...");
      expect(loadingText).toBeInTheDocument();
    });

    it("provides accessible success message for max reached", () => {
      const outOfPocketInfo: OutOfPocketInfo = {
        max: 500000,
        met: 500000,
        remaining: 0,
      };

      render(
        <OutOfPocketTracker
          outOfPocketInfo={outOfPocketInfo}
          isAvailable={true}
        />
      );

      // Check for accessible success message
      const successHeading = screen.getByText("You've Reached Your Maximum!");
      expect(successHeading).toBeInTheDocument();

      // Verify explanatory text is present
      expect(
        screen.getByText(/Your insurance should cover 100% of covered services/i)
      ).toBeInTheDocument();
    });
  });

  describe("visual consistency with DeductibleTracker", () => {
    it("uses consistent structure and styling", () => {
      const outOfPocketInfo: OutOfPocketInfo = {
        max: 500000,
        met: 200000,
        remaining: 300000,
      };

      const { container } = render(
        <OutOfPocketTracker
          outOfPocketInfo={outOfPocketInfo}
          isAvailable={true}
        />
      );

      // Check for consistent class patterns
      expect(container.querySelector(".space-y-4")).toBeInTheDocument();
      expect(container.querySelector(".rounded-full.bg-daybreak-teal\\/10")).toBeInTheDocument();

      // Check for progress bar
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });
});
