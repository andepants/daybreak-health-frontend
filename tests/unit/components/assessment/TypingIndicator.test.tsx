/**
 * Unit tests for the TypingIndicator component.
 *
 * Tests:
 * - Initial render with dots animation
 * - 5-second timeout transition to "Still thinking..."
 * - 15-second timeout transition to "Taking longer than usual..." with retry button
 * - Retry button click handler
 * - Accessibility attributes (aria-label, role, aria-live)
 * - Fade-in animation presence
 * - State reset on visibility change
 * - Proper cleanup of timers
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { TypingIndicator } from "@/features/assessment/TypingIndicator";

describe("TypingIndicator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("Rendering and Visibility", () => {
    it("does not render when isVisible is false", () => {
      const { container } = render(<TypingIndicator isVisible={false} />);
      expect(container.firstChild).toBeNull();
    });

    it("renders when isVisible is true", () => {
      render(<TypingIndicator isVisible={true} />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("has fade-in animation class", () => {
      render(<TypingIndicator isVisible={true} />);
      const container = screen.getByRole("status");
      expect(container).toHaveClass("animate-fade-in");
    });
  });

  describe("Accessibility", () => {
    it("has role='status' for screen reader announcement", () => {
      render(<TypingIndicator isVisible={true} />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("has aria-live='polite' for state changes", () => {
      render(<TypingIndicator isVisible={true} />);
      const status = screen.getByRole("status");
      expect(status).toHaveAttribute("aria-live", "polite");
    });

    it("has aria-label='AI is typing' in initial state", () => {
      render(<TypingIndicator isVisible={true} />);
      const status = screen.getByRole("status");
      expect(status).toHaveAttribute("aria-label", "AI is typing");
    });

    it("updates aria-label to 'AI is still thinking' after 5 seconds", () => {
      render(<TypingIndicator isVisible={true} />);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      const status = screen.getByRole("status");
      expect(status).toHaveAttribute("aria-label", "AI is still thinking");
    });

    it("updates aria-label to 'AI is taking longer than usual' after 15 seconds", () => {
      render(<TypingIndicator isVisible={true} />);

      act(() => {
        vi.advanceTimersByTime(15000);
      });

      const status = screen.getByRole("status");
      expect(status).toHaveAttribute("aria-label", "AI is taking longer than usual");
    });

    it("has aria-hidden on timeout state text to prevent duplicate announcements", () => {
      render(<TypingIndicator isVisible={true} />);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      const stillThinkingText = screen.getByText("Still thinking...");
      expect(stillThinkingText).toHaveAttribute("aria-hidden", "true");
    });

    it("marks decorative icons as aria-hidden", () => {
      render(<TypingIndicator isVisible={true} onRetry={vi.fn()} />);

      act(() => {
        vi.advanceTimersByTime(15000);
      });

      const button = screen.getByRole("button", { name: /retry/i });
      const icon = button.querySelector('svg');
      expect(icon).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Animated Dots", () => {
    it("renders three animated dots", () => {
      const { container } = render(<TypingIndicator isVisible={true} />);

      const dots = container.querySelectorAll(".animate-typing-dot");
      expect(dots).toHaveLength(3);
    });

    it("applies sequential animation delays to dots", () => {
      const { container } = render(<TypingIndicator isVisible={true} />);

      const dots = container.querySelectorAll(".animate-typing-dot");

      expect(dots[0]).toHaveClass("[animation-delay:0ms]");
      expect(dots[1]).toHaveClass("[animation-delay:150ms]");
      expect(dots[2]).toHaveClass("[animation-delay:300ms]");
    });

    it("dots have correct size and color classes", () => {
      const { container } = render(<TypingIndicator isVisible={true} />);

      const dots = container.querySelectorAll(".animate-typing-dot");

      dots.forEach((dot) => {
        expect(dot).toHaveClass("h-2");
        expect(dot).toHaveClass("w-2");
        expect(dot).toHaveClass("rounded-full");
        expect(dot).toHaveClass("bg-daybreak-teal");
      });
    });

    it("marks dots as aria-hidden", () => {
      const { container } = render(<TypingIndicator isVisible={true} />);

      const dots = container.querySelectorAll(".animate-typing-dot");

      dots.forEach((dot) => {
        expect(dot).toHaveAttribute("aria-hidden", "true");
      });
    });
  });

  describe("Avatar", () => {
    it("renders Daybreak avatar", () => {
      render(<TypingIndicator isVisible={true} />);

      const avatar = screen.getByLabelText("Daybreak AI");
      expect(avatar).toBeInTheDocument();
    });

    it("avatar has correct size (40x40px)", () => {
      const { container } = render(<TypingIndicator isVisible={true} />);

      const avatar = container.querySelector(".h-10.w-10");
      expect(avatar).toBeInTheDocument();
    });

    it("avatar has teal background matching AI chat bubbles", () => {
      const { container } = render(<TypingIndicator isVisible={true} />);

      const avatarFallback = container.querySelector(".bg-daybreak-teal\\/10");
      expect(avatarFallback).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("has light teal background matching AI chat bubbles", () => {
      const { container } = render(<TypingIndicator isVisible={true} />);

      const bubble = container.querySelector(".bg-\\[\\#F0FDFA\\]");
      expect(bubble).toBeInTheDocument();
    });

    it("has rounded-3xl border radius", () => {
      const { container } = render(<TypingIndicator isVisible={true} />);

      const bubble = container.querySelector(".rounded-3xl");
      expect(bubble).toBeInTheDocument();
    });

    it("is left-aligned with gap between avatar and bubble", () => {
      render(<TypingIndicator isVisible={true} />);

      const container = screen.getByRole("status");
      expect(container).toHaveClass("flex");
      expect(container).toHaveClass("gap-2");
    });

    it("bubble max width is 75%", () => {
      const { container } = render(<TypingIndicator isVisible={true} />);

      const bubbleContainer = container.querySelector(".max-w-\\[75\\%\\]");
      expect(bubbleContainer).toBeInTheDocument();
    });
  });

  describe("Timeout States", () => {
    it("shows only dots in initial 'typing' state (0-5s)", () => {
      render(<TypingIndicator isVisible={true} />);

      expect(screen.queryByText("Still thinking...")).not.toBeInTheDocument();
      expect(screen.queryByText("Taking longer than usual...")).not.toBeInTheDocument();
    });

    it("shows 'Still thinking...' text after 5 seconds", () => {
      render(<TypingIndicator isVisible={true} />);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.getByText("Still thinking...")).toBeInTheDocument();
    });

    it("does not show retry button in 'still-thinking' state", () => {
      render(<TypingIndicator isVisible={true} onRetry={vi.fn()} />);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
    });

    it("shows 'Taking longer than usual...' text after 15 seconds", () => {
      render(<TypingIndicator isVisible={true} />);

      act(() => {
        vi.advanceTimersByTime(15000);
      });

      expect(screen.getByText("Taking longer than usual...")).toBeInTheDocument();
    });

    it("shows retry button after 15 seconds when onRetry prop provided", () => {
      render(<TypingIndicator isVisible={true} onRetry={vi.fn()} />);

      act(() => {
        vi.advanceTimersByTime(15000);
      });

      expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    });

    it("does not show retry button if onRetry prop not provided", () => {
      render(<TypingIndicator isVisible={true} />);

      act(() => {
        vi.advanceTimersByTime(15000);
      });

      expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
    });

    it("resets to 'typing' state when isVisible changes from true to false to true", () => {
      const { rerender } = render(<TypingIndicator isVisible={true} />);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.getByText("Still thinking...")).toBeInTheDocument();

      rerender(<TypingIndicator isVisible={false} />);
      rerender(<TypingIndicator isVisible={true} />);

      expect(screen.queryByText("Still thinking...")).not.toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveAttribute("aria-label", "AI is typing");
    });
  });

  describe("Retry Functionality", () => {
    it("calls onRetry callback when retry button is clicked", () => {
      const handleRetry = vi.fn();
      render(<TypingIndicator isVisible={true} onRetry={handleRetry} />);

      act(() => {
        vi.advanceTimersByTime(15000);
      });

      const retryButton = screen.getByRole("button", { name: /retry/i });
      fireEvent.click(retryButton);

      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it("resets timeout state to 'typing' when retry is clicked", () => {
      const handleRetry = vi.fn();
      render(<TypingIndicator isVisible={true} onRetry={handleRetry} />);

      act(() => {
        vi.advanceTimersByTime(15000);
      });

      const retryButton = screen.getByRole("button", { name: /retry/i });
      fireEvent.click(retryButton);

      expect(screen.queryByText("Taking longer than usual...")).not.toBeInTheDocument();
    });

    it("retry button has accessible label", () => {
      render(<TypingIndicator isVisible={true} onRetry={vi.fn()} />);

      act(() => {
        vi.advanceTimersByTime(15000);
      });

      const retryButton = screen.getByRole("button", { name: "Retry sending message" });
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe("Timer Cleanup", () => {
    it("clears timers when component unmounts", () => {
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

      const { unmount } = render(<TypingIndicator isVisible={true} />);
      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it("clears timers when isVisible changes to false", () => {
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

      const { rerender } = render(<TypingIndicator isVisible={true} />);
      rerender(<TypingIndicator isVisible={false} />);

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe("Custom className", () => {
    it("applies custom className to root element", () => {
      render(<TypingIndicator isVisible={true} className="custom-test-class" />);

      const container = screen.getByRole("status");
      expect(container).toHaveClass("custom-test-class");
    });

    it("preserves default classes when custom className added", () => {
      render(<TypingIndicator isVisible={true} className="custom-test-class" />);

      const container = screen.getByRole("status");
      expect(container).toHaveClass("flex");
      expect(container).toHaveClass("gap-2");
      expect(container).toHaveClass("animate-fade-in");
      expect(container).toHaveClass("custom-test-class");
    });
  });
});
