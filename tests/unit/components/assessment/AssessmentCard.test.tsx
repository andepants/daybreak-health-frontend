/**
 * Unit tests for AssessmentCard component
 *
 * Tests cover:
 * - Question and options rendering
 * - Option selection behavior
 * - "Other" text input toggle and submission
 * - Back button navigation
 * - Progress indicator accuracy
 * - Keyboard accessibility (Enter, Escape)
 * - Screen reader accessibility
 */

import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AssessmentCard, type StructuredQuestion } from "@/features/assessment/AssessmentCard";

describe("AssessmentCard", () => {
  const mockQuestion: StructuredQuestion = {
    id: "q1",
    type: "single-choice",
    question: "How has your child's sleep been lately?",
    options: ["Much worse", "Somewhat worse", "About the same", "Better"],
    allowOther: true,
  };

  const mockOnAnswer = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render question text", () => {
      render(
        <AssessmentCard
          question={mockQuestion}
          currentStep={1}
          totalSteps={5}
          onAnswer={mockOnAnswer}
        />
      );

      expect(screen.getByRole("heading", { name: mockQuestion.question })).toBeInTheDocument();
    });

    it("should render all answer options as buttons", () => {
      render(
        <AssessmentCard
          question={mockQuestion}
          currentStep={1}
          totalSteps={5}
          onAnswer={mockOnAnswer}
        />
      );

      mockQuestion.options.forEach((option) => {
        expect(screen.getByRole("button", { name: option })).toBeInTheDocument();
      });
    });

    it("should render progress indicator with correct values", () => {
      render(
        <AssessmentCard
          question={mockQuestion}
          currentStep={3}
          totalSteps={5}
          onAnswer={mockOnAnswer}
        />
      );

      expect(screen.getByText("3 of 5")).toBeInTheDocument();
    });

    it("should render back button when onBack is provided", () => {
      render(
        <AssessmentCard
          question={mockQuestion}
          currentStep={2}
          totalSteps={5}
          onAnswer={mockOnAnswer}
          onBack={mockOnBack}
        />
      );

      expect(
        screen.getByRole("button", { name: /go back to previous question/i })
      ).toBeInTheDocument();
    });

    it("should not render back button when onBack is not provided", () => {
      render(
        <AssessmentCard
          question={mockQuestion}
          currentStep={1}
          totalSteps={5}
          onAnswer={mockOnAnswer}
        />
      );

      expect(
        screen.queryByRole("button", { name: /go back to previous question/i })
      ).not.toBeInTheDocument();
    });

    it("should render 'Other' option when allowOther is true", () => {
      render(
        <AssessmentCard
          question={mockQuestion}
          currentStep={1}
          totalSteps={5}
          onAnswer={mockOnAnswer}
        />
      );

      expect(screen.getByRole("button", { name: /other \(tap to type\)/i })).toBeInTheDocument();
    });

    it("should not render 'Other' option when allowOther is false", () => {
      const questionWithoutOther: StructuredQuestion = {
        ...mockQuestion,
        allowOther: false,
      };

      render(
        <AssessmentCard
          question={questionWithoutOther}
          currentStep={1}
          totalSteps={5}
          onAnswer={mockOnAnswer}
        />
      );

      expect(
        screen.queryByRole("button", { name: /other \(tap to type\)/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("Option Selection", () => {
    it("should call onAnswer with selected option", async () => {
      vi.useFakeTimers();
      render(
        <AssessmentCard
          question={mockQuestion}
          currentStep={1}
          totalSteps={5}
          onAnswer={mockOnAnswer}
        />
      );

      const option = screen.getByRole("button", { name: "Much worse" });
      fireEvent.click(option);

      // Wait for the 200ms delay
      vi.advanceTimersByTime(200);

      expect(mockOnAnswer).toHaveBeenCalledWith("Much worse");
      vi.useRealTimers();
    });

    it("should show visual selection feedback before submitting", async () => {
      render(
        <AssessmentCard
          question={mockQuestion}
          currentStep={1}
          totalSteps={5}
          onAnswer={mockOnAnswer}
        />
      );

      const option = screen.getByRole("button", { name: "Much worse" });
      fireEvent.click(option);

      // Check for pressed state
      expect(option).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("Other Text Input", () => {
    it("should show text input when 'Other' is clicked", () => {
      render(
        <AssessmentCard
          question={mockQuestion}
          currentStep={1}
          totalSteps={5}
          onAnswer={mockOnAnswer}
        />
      );

      const otherButton = screen.getByRole("button", { name: /other \(tap to type\)/i });
      fireEvent.click(otherButton);

      expect(screen.getByRole("textbox", { name: /other answer text/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("should submit custom text when Continue is clicked", () => {
      render(
        <AssessmentCard
          question={mockQuestion}
          currentStep={1}
          totalSteps={5}
          onAnswer={mockOnAnswer}
        />
      );

      // Click Other
      const otherButton = screen.getByRole("button", { name: /other \(tap to type\)/i });
      fireEvent.click(otherButton);

      // Type custom text
      const textarea = screen.getByRole("textbox", { name: /other answer text/i });
      fireEvent.change(textarea, { target: { value: "My custom answer" } });

      // Click Continue
      const continueButton = screen.getByRole("button", { name: /continue/i });
      fireEvent.click(continueButton);

      expect(mockOnAnswer).toHaveBeenCalledWith("My custom answer");
    });

    it("should disable Continue button when text is empty", () => {
      render(
        <AssessmentCard
          question={mockQuestion}
          currentStep={1}
          totalSteps={5}
          onAnswer={mockOnAnswer}
        />
      );

      const otherButton = screen.getByRole("button", { name: /other \(tap to type\)/i });
      fireEvent.click(otherButton);

      const continueButton = screen.getByRole("button", { name: /continue/i });
      expect(continueButton).toBeDisabled();
    });

    it("should cancel and hide text input when Cancel is clicked", () => {
      render(
        <AssessmentCard
          question={mockQuestion}
          currentStep={1}
          totalSteps={5}
          onAnswer={mockOnAnswer}
        />
      );

      // Click Other
      const otherButton = screen.getByRole("button", { name: /other \(tap to type\)/i });
      fireEvent.click(otherButton);

      // Type some text
      const textarea = screen.getByRole("textbox", { name: /other answer text/i });
      fireEvent.change(textarea, { target: { value: "Some text" } });

      // Click Cancel
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      // Text input should be hidden
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      // Other button should be visible again
      expect(screen.getByRole("button", { name: /other \(tap to type\)/i })).toBeInTheDocument();
    });

    it("should trim whitespace from custom text", () => {
      render(
        <AssessmentCard
          question={mockQuestion}
          currentStep={1}
          totalSteps={5}
          onAnswer={mockOnAnswer}
        />
      );

      const otherButton = screen.getByRole("button", { name: /other \(tap to type\)/i });
      fireEvent.click(otherButton);

      const textarea = screen.getByRole("textbox", { name: /other answer text/i });
      fireEvent.change(textarea, { target: { value: "  Trimmed text  " } });

      const continueButton = screen.getByRole("button", { name: /continue/i });
      fireEvent.click(continueButton);

      expect(mockOnAnswer).toHaveBeenCalledWith("Trimmed text");
    });
  });

  describe("Keyboard Accessibility", () => {
    it("should submit on Enter key in textarea", () => {
      render(
        <AssessmentCard
          question={mockQuestion}
          currentStep={1}
          totalSteps={5}
          onAnswer={mockOnAnswer}
        />
      );

      const otherButton = screen.getByRole("button", { name: /other \(tap to type\)/i });
      fireEvent.click(otherButton);

      const textarea = screen.getByRole("textbox", { name: /other answer text/i });
      fireEvent.change(textarea, { target: { value: "Keyboard answer" } });
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

      expect(mockOnAnswer).toHaveBeenCalledWith("Keyboard answer");
    });

    it("should allow new line with Shift+Enter in textarea", () => {
      render(
        <AssessmentCard
          question={mockQuestion}
          currentStep={1}
          totalSteps={5}
          onAnswer={mockOnAnswer}
        />
      );

      const otherButton = screen.getByRole("button", { name: /other \(tap to type\)/i });
      fireEvent.click(otherButton);

      const textarea = screen.getByRole("textbox", { name: /other answer text/i });
      fireEvent.change(textarea, { target: { value: "Line 1" } });
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

      // Shift+Enter should not submit
      expect(mockOnAnswer).not.toHaveBeenCalled();
    });

    it("should cancel on Escape key in textarea", () => {
      render(
        <AssessmentCard
          question={mockQuestion}
          currentStep={1}
          totalSteps={5}
          onAnswer={mockOnAnswer}
        />
      );

      const otherButton = screen.getByRole("button", { name: /other \(tap to type\)/i });
      fireEvent.click(otherButton);

      const textarea = screen.getByRole("textbox", { name: /other answer text/i });
      fireEvent.change(textarea, { target: { value: "Some text" } });
      fireEvent.keyDown(textarea, { key: "Escape" });

      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      expect(mockOnAnswer).not.toHaveBeenCalled();
    });
  });

  describe("Back Navigation", () => {
    it("should call onBack when back button is clicked", () => {
      render(
        <AssessmentCard
          question={mockQuestion}
          currentStep={2}
          totalSteps={5}
          onAnswer={mockOnAnswer}
          onBack={mockOnBack}
        />
      );

      const backButton = screen.getByRole("button", { name: /go back to previous question/i });
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA region with label", () => {
      render(
        <AssessmentCard
          question={mockQuestion}
          currentStep={3}
          totalSteps={5}
          onAnswer={mockOnAnswer}
        />
      );

      const region = screen.getByRole("region", { name: /assessment question 3 of 5/i });
      expect(region).toBeInTheDocument();
    });

    it("should announce progress with aria-live", () => {
      render(
        <AssessmentCard
          question={mockQuestion}
          currentStep={3}
          totalSteps={5}
          onAnswer={mockOnAnswer}
        />
      );

      const progressElement = screen.getByText("3 of 5");
      expect(progressElement).toHaveAttribute("aria-live", "polite");
      expect(progressElement).toHaveAttribute("role", "status");
    });

    it("should have minimum touch target size for buttons", () => {
      render(
        <AssessmentCard
          question={mockQuestion}
          currentStep={1}
          totalSteps={5}
          onAnswer={mockOnAnswer}
        />
      );

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        const styles = window.getComputedStyle(button);
        // min-h-[60px] should be applied
        expect(button.className).toContain("min-h-[60px]");
      });
    });
  });

  describe("Responsive Layout", () => {
    it("should apply 2-column grid on desktop", () => {
      render(
        <AssessmentCard
          question={mockQuestion}
          currentStep={1}
          totalSteps={5}
          onAnswer={mockOnAnswer}
        />
      );

      const gridContainer = screen.getByRole("button", { name: "Much worse" }).parentElement;
      expect(gridContainer?.className).toContain("md:grid-cols-2");
    });

    it("should apply 1-column grid on mobile", () => {
      render(
        <AssessmentCard
          question={mockQuestion}
          currentStep={1}
          totalSteps={5}
          onAnswer={mockOnAnswer}
        />
      );

      const gridContainer = screen.getByRole("button", { name: "Much worse" }).parentElement;
      expect(gridContainer?.className).toContain("grid-cols-1");
    });
  });
});
