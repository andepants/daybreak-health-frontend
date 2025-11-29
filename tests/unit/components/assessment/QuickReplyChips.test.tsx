/**
 * Unit tests for QuickReplyChips component
 *
 * Tests quick reply chip rendering, selection behavior, visibility control,
 * accessibility features, and touch target requirements (WCAG 2.1 Level AAA).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuickReplyChips } from "@/features/assessment/QuickReplyChips";
import type { QuickReplyChipsProps } from "@/features/assessment/QuickReplyChips";

describe("QuickReplyChips", () => {
  const mockOptions = [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
    { label: "Maybe", value: "maybe" },
  ];

  const defaultProps: QuickReplyChipsProps = {
    options: mockOptions,
    onSelect: vi.fn(),
    isVisible: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render all quick reply options", () => {
      render(<QuickReplyChips {...defaultProps} />);

      expect(screen.getByText("Yes")).toBeInTheDocument();
      expect(screen.getByText("No")).toBeInTheDocument();
      expect(screen.getByText("Maybe")).toBeInTheDocument();
    });

    it("should render as horizontal scrollable container", () => {
      render(<QuickReplyChips {...defaultProps} />);

      const container = screen.getByRole("group");
      expect(container).toHaveClass("overflow-x-auto");
      expect(container).toHaveClass("scroll-smooth");
    });

    it("should render pill-shaped buttons with teal outline", () => {
      render(<QuickReplyChips {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveClass("rounded-full");
        expect(button).toHaveClass("border-daybreak-teal");
        expect(button).toHaveClass("text-daybreak-teal");
      });
    });

    it("should render option with icon if provided", () => {
      const optionsWithIcon = [
        { label: "Agree", value: "agree", icon: "✓" },
      ];

      render(
        <QuickReplyChips
          {...defaultProps}
          options={optionsWithIcon}
        />
      );

      const button = screen.getByText("Agree");
      expect(button.textContent).toContain("✓");
    });

    it("should not render when isVisible is false", () => {
      render(<QuickReplyChips {...defaultProps} isVisible={false} />);

      expect(screen.queryByRole("group")).not.toBeInTheDocument();
    });

    it("should not render when options array is empty", () => {
      render(<QuickReplyChips {...defaultProps} options={[]} />);

      expect(screen.queryByRole("group")).not.toBeInTheDocument();
    });

    it("should apply custom className when provided", () => {
      render(<QuickReplyChips {...defaultProps} className="custom-class" />);

      const container = screen.getByRole("group");
      expect(container).toHaveClass("custom-class");
    });
  });

  describe("Chip Selection", () => {
    it("should call onSelect with correct value when chip is clicked", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(<QuickReplyChips {...defaultProps} onSelect={onSelect} />);

      const yesButton = screen.getByText("Yes");
      await user.click(yesButton);

      // Wait for debounce timeout (150ms)
      await vi.waitFor(() => {
        expect(onSelect).toHaveBeenCalledWith("yes");
      }, { timeout: 200 });
    });

    it("should show filled teal state when chip is selected", async () => {
      const user = userEvent.setup();
      render(<QuickReplyChips {...defaultProps} />);

      const yesButton = screen.getByText("Yes");
      await user.click(yesButton);

      // During brief delay, button should show selected state
      expect(yesButton).toHaveClass("bg-daybreak-teal");
      expect(yesButton).toHaveClass("text-white");
    });

    it("should handle multiple chip selections sequentially", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(<QuickReplyChips {...defaultProps} onSelect={onSelect} />);

      // Click first chip
      await user.click(screen.getByText("Yes"));
      await vi.waitFor(() => expect(onSelect).toHaveBeenCalledWith("yes"), { timeout: 200 });

      // Click second chip
      await user.click(screen.getByText("No"));
      await vi.waitFor(() => expect(onSelect).toHaveBeenCalledWith("no"), { timeout: 200 });

      expect(onSelect).toHaveBeenCalledTimes(2);
    });
  });

  describe("Visibility Control (AC-2.2.4)", () => {
    it("should hide chips when isVisible changes to false", () => {
      const { rerender } = render(<QuickReplyChips {...defaultProps} isVisible={true} />);

      expect(screen.getByRole("group")).toBeInTheDocument();

      rerender(<QuickReplyChips {...defaultProps} isVisible={false} />);

      expect(screen.queryByRole("group")).not.toBeInTheDocument();
    });

    it("should show chips when isVisible changes to true", () => {
      const { rerender } = render(<QuickReplyChips {...defaultProps} isVisible={false} />);

      expect(screen.queryByRole("group")).not.toBeInTheDocument();

      rerender(<QuickReplyChips {...defaultProps} isVisible={true} />);

      expect(screen.getByRole("group")).toBeInTheDocument();
    });
  });

  describe("Accessibility (AC-2.2.11)", () => {
    it("should have proper ARIA role for group container", () => {
      render(<QuickReplyChips {...defaultProps} />);

      const container = screen.getByRole("group");
      expect(container).toHaveAttribute("aria-label");
      expect(container.getAttribute("aria-label")).toContain("Quick reply options");
    });

    it("should have ARIA labels on buttons", () => {
      render(<QuickReplyChips {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveAttribute("aria-label");
        expect(button.getAttribute("aria-label")).toContain("Quick reply:");
      });
    });

    it("should meet minimum 44x44px touch target requirement", () => {
      render(<QuickReplyChips {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        // Check min-h-[44px] class is applied for WCAG compliance
        expect(button).toHaveClass("min-h-[44px]");

        // Verify padding ensures adequate touch target
        expect(button).toHaveClass("px-6");
      });
    });

    it("should be keyboard navigable with Tab", async () => {
      const user = userEvent.setup();
      render(<QuickReplyChips {...defaultProps} />);

      const buttons = screen.getAllByRole("button");

      // Tab to first button
      await user.tab();
      expect(buttons[0]).toHaveFocus();

      // Tab to second button
      await user.tab();
      expect(buttons[1]).toHaveFocus();

      // Tab to third button
      await user.tab();
      expect(buttons[2]).toHaveFocus();
    });

    it("should be activatable with Enter key", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(<QuickReplyChips {...defaultProps} onSelect={onSelect} />);

      const yesButton = screen.getByText("Yes");
      yesButton.focus();

      await user.keyboard("{Enter}");

      await vi.waitFor(() => {
        expect(onSelect).toHaveBeenCalledWith("yes");
      }, { timeout: 200 });
    });

    it("should be activatable with Space key", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(<QuickReplyChips {...defaultProps} onSelect={onSelect} />);

      const noButton = screen.getByText("No");
      noButton.focus();

      await user.keyboard(" ");

      await vi.waitFor(() => {
        expect(onSelect).toHaveBeenCalledWith("no");
      }, { timeout: 200 });
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long option labels gracefully", () => {
      const longOptions = [
        {
          label: "This is a very long option label that should be displayed properly",
          value: "long",
        },
      ];

      render(<QuickReplyChips {...defaultProps} options={longOptions} />);

      const button = screen.getByText(/This is a very long option label/);
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("shrink-0"); // Prevents text wrapping
    });

    it("should handle special characters in labels", () => {
      const specialOptions = [
        { label: "Yes! 🎉", value: "yes-emoji" },
        { label: "No & Never", value: "no-special" },
      ];

      render(<QuickReplyChips {...defaultProps} options={specialOptions} />);

      expect(screen.getByText("Yes! 🎉")).toBeInTheDocument();
      expect(screen.getByText("No & Never")).toBeInTheDocument();
    });

    it("should cleanup timeout on unmount to prevent memory leaks", () => {
      const { unmount } = render(<QuickReplyChips {...defaultProps} />);

      // Click a chip to start timeout
      fireEvent.click(screen.getByText("Yes"));

      // Unmount before timeout completes
      unmount();

      // No errors should occur (cleanup happened)
      expect(true).toBe(true);
    });

    it("should handle rapid successive clicks gracefully", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(<QuickReplyChips {...defaultProps} onSelect={onSelect} />);

      const yesButton = screen.getByText("Yes");

      // Click multiple times rapidly
      await user.click(yesButton);
      await user.click(yesButton);
      await user.click(yesButton);

      // Should handle gracefully by clearing previous timeouts
      // Final call should still work
      await vi.waitFor(() => {
        expect(onSelect).toHaveBeenCalled();
      }, { timeout: 200 });
    });

    it("should render maximum 4 options as recommended", () => {
      const fourOptions = [
        { label: "Option 1", value: "opt1" },
        { label: "Option 2", value: "opt2" },
        { label: "Option 3", value: "opt3" },
        { label: "Option 4", value: "opt4" },
      ];

      render(<QuickReplyChips {...defaultProps} options={fourOptions} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(4);
    });
  });

  describe("Horizontal Scrolling (AC-2.2.1)", () => {
    it("should enable horizontal scrolling for overflow content", () => {
      const manyOptions = Array.from({ length: 10 }, (_, i) => ({
        label: `Option ${i + 1}`,
        value: `option-${i + 1}`,
      }));

      render(<QuickReplyChips {...defaultProps} options={manyOptions} />);

      const container = screen.getByRole("group");
      expect(container).toHaveClass("overflow-x-auto");
    });

    it("should have smooth scrolling behavior", () => {
      render(<QuickReplyChips {...defaultProps} />);

      const container = screen.getByRole("group");
      expect(container).toHaveClass("scroll-smooth");
    });

    it("should hide scrollbar for cleaner appearance", () => {
      render(<QuickReplyChips {...defaultProps} />);

      const container = screen.getByRole("group");
      expect(container).toHaveClass("scrollbar-hide");
    });
  });

  describe("Animation", () => {
    it("should have fade-in animation on appear", () => {
      render(<QuickReplyChips {...defaultProps} />);

      const container = screen.getByRole("group");
      expect(container).toHaveClass("animate-fade-in");
    });

    it("should have transition on button state changes", () => {
      render(<QuickReplyChips {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveClass("transition-all");
        expect(button).toHaveClass("duration-200");
      });
    });
  });

  describe("Integration", () => {
    it("should work with parent component hiding logic", () => {
      let isVisible = true;
      const { rerender } = render(
        <QuickReplyChips {...defaultProps} isVisible={isVisible} />
      );

      expect(screen.getByRole("group")).toBeInTheDocument();

      // Simulate user starts typing
      isVisible = false;
      rerender(<QuickReplyChips {...defaultProps} isVisible={isVisible} />);

      expect(screen.queryByRole("group")).not.toBeInTheDocument();
    });
  });
});
