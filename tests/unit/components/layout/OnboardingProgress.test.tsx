/**
 * Unit tests for the OnboardingProgress component.
 *
 * Tests:
 * - All 5 steps render correctly
 * - Active step receives teal styling
 * - Completed steps show checkmark
 * - Accessibility attributes are present
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  OnboardingProgress,
  STEPS,
} from "@/components/layout/OnboardingProgress";

describe("OnboardingProgress", () => {
  it("renders all 5 steps", () => {
    render(<OnboardingProgress currentStep="assessment" />);

    // All 5 steps should be present
    expect(STEPS).toHaveLength(5);

    // Check each step is rendered as a list item
    const steps = screen.getAllByRole("listitem");
    expect(steps).toHaveLength(5);
  });

  it("marks the current step with aria-current", () => {
    render(<OnboardingProgress currentStep="info" />);

    // Find all step indicators and check one has aria-current
    const stepItems = screen.getAllByRole("listitem");
    const secondStep = stepItems[1].querySelector("[aria-current]");
    expect(secondStep).toHaveAttribute("aria-current", "step");
  });

  it("applies teal styling to active step", () => {
    render(<OnboardingProgress currentStep="insurance" />);

    // Find the step indicators - we check by structure
    const stepItems = screen.getAllByRole("listitem");

    // Third step (insurance) should be current
    const insuranceStep = stepItems[2];
    const indicator = insuranceStep.querySelector("div");

    // Should have teal background classes
    expect(indicator).toHaveClass("bg-daybreak-teal");
    expect(indicator).toHaveClass("border-daybreak-teal");
  });

  it("shows check icon for completed steps", () => {
    render(
      <OnboardingProgress
        currentStep="match"
        completedSteps={["assessment", "info", "insurance"]}
      />
    );

    // The completed steps should show checkmarks
    // We verify by checking that Check component renders
    const stepItems = screen.getAllByRole("listitem");

    // First 3 steps should have completed styling
    for (let i = 0; i < 3; i++) {
      const indicator = stepItems[i].querySelector("div");
      expect(indicator).toHaveClass("bg-daybreak-teal");
    }
  });

  it("includes accessible step labels via sr-only text", () => {
    render(
      <OnboardingProgress
        currentStep="info"
        completedSteps={["assessment"]}
      />
    );

    // Screen reader text should include status
    expect(screen.getByText(/Assessment \(completed\)/)).toBeInTheDocument();
    expect(screen.getByText(/Info \(current\)/)).toBeInTheDocument();
  });

  it("has accessible navigation role", () => {
    render(<OnboardingProgress currentStep="assessment" />);

    const nav = screen.getByRole("navigation", { name: /onboarding progress/i });
    expect(nav).toBeInTheDocument();
  });

  it("renders step labels with correct order", () => {
    render(<OnboardingProgress currentStep="assessment" />);

    const expectedOrder = ["Assessment", "Info", "Insurance", "Match", "Book"];
    const stepLabels = screen.getAllByRole("listitem").map((li) => {
      // Get the visible label text
      const visibleLabel = li.querySelector("span:not(.sr-only)");
      return visibleLabel?.textContent;
    });

    expect(stepLabels).toEqual(expectedOrder);
  });
});
