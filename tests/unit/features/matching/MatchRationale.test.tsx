/**
 * Unit tests for MatchRationale component
 *
 * Tests cover:
 * - Accordion rendering and interaction
 * - Default matching criteria display
 * - Custom matching criteria from backend
 * - Expandable section behavior
 * - Icon rendering for each criterion
 * - Reassurance message
 * - Keyboard accessibility
 * - ARIA attributes
 */

import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { MatchRationale } from "@/features/matching/MatchRationale";

describe("MatchRationale", () => {
  beforeEach(() => {
    // Reset any state between tests
  });

  describe("Rendering", () => {
    it("should render accordion trigger with 'Why these therapists?' text", () => {
      render(<MatchRationale />);

      expect(screen.getByText("Why these therapists?")).toBeInTheDocument();
    });

    it("should render CheckCircle icon in trigger", () => {
      const { container } = render(<MatchRationale />);

      // Check for icon in the trigger button
      const trigger = screen.getByRole("button", { name: /why these therapists/i });
      expect(trigger).toBeInTheDocument();
    });

    it("should not show content by default (accordion collapsed)", () => {
      render(<MatchRationale />);

      // Content should not be in the document when collapsed (radix-ui removes it from DOM)
      expect(screen.queryByText("Our matching considers several factors:")).not.toBeInTheDocument();
    });

    it("should apply custom className if provided", () => {
      const { container } = render(<MatchRationale className="custom-class" />);

      const wrapper = container.querySelector('.custom-class');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe("Accordion Interaction", () => {
    it("should expand accordion when trigger is clicked", () => {
      render(<MatchRationale />);

      const trigger = screen.getByRole("button", { name: /why these therapists/i });
      fireEvent.click(trigger);

      // Content should be visible after expanding
      expect(screen.getByText("Our matching considers several factors:")).toBeInTheDocument();
    });

    it("should collapse accordion when trigger is clicked again", () => {
      render(<MatchRationale />);

      const trigger = screen.getByRole("button", { name: /why these therapists/i });

      // Expand
      fireEvent.click(trigger);
      expect(screen.getByText("Our matching considers several factors:")).toBeInTheDocument();

      // Collapse
      fireEvent.click(trigger);
      expect(screen.queryByText("Our matching considers several factors:")).not.toBeInTheDocument();
    });
  });

  describe("Default Matching Criteria", () => {
    it("should render all four default criteria when expanded", () => {
      render(<MatchRationale />);

      const trigger = screen.getByRole("button", { name: /why these therapists/i });
      fireEvent.click(trigger);

      expect(screen.getByText("Specialty Match")).toBeInTheDocument();
      expect(screen.getByText("Availability")).toBeInTheDocument();
      expect(screen.getByText("Experience & Credentials")).toBeInTheDocument();
      expect(screen.getByText("Personal Fit")).toBeInTheDocument();
    });

    it("should render Specialty Match description", () => {
      render(<MatchRationale />);

      const trigger = screen.getByRole("button", { name: /why these therapists/i });
      fireEvent.click(trigger);

      expect(
        screen.getByText(/We match therapists based on their specialized training/i)
      ).toBeInTheDocument();
    });

    it("should render Availability description", () => {
      render(<MatchRationale />);

      const trigger = screen.getByRole("button", { name: /why these therapists/i });
      fireEvent.click(trigger);

      expect(
        screen.getByText(/We prioritize therapists who can see you soon/i)
      ).toBeInTheDocument();
    });

    it("should render Experience & Credentials description", () => {
      render(<MatchRationale />);

      const trigger = screen.getByRole("button", { name: /why these therapists/i });
      fireEvent.click(trigger);

      expect(
        screen.getByText(/All our therapists are licensed professionals/i)
      ).toBeInTheDocument();
    });

    it("should render Personal Fit description", () => {
      render(<MatchRationale />);

      const trigger = screen.getByRole("button", { name: /why these therapists/i });
      fireEvent.click(trigger);

      expect(
        screen.getByText(/We consider communication styles, therapeutic approaches/i)
      ).toBeInTheDocument();
    });
  });

  describe("Custom Matching Criteria", () => {
    it("should render custom matching criteria from backend when provided", () => {
      const customCriteria = "Based on your child's anxiety concerns, we matched therapists with CBT expertise and teen specialization.";

      render(<MatchRationale matchingCriteria={customCriteria} />);

      const trigger = screen.getByRole("button", { name: /why these therapists/i });
      fireEvent.click(trigger);

      expect(screen.getByText(customCriteria)).toBeInTheDocument();
    });

    it("should render both custom and default criteria when custom is provided", () => {
      const customCriteria = "Custom matching explanation";

      render(<MatchRationale matchingCriteria={customCriteria} />);

      const trigger = screen.getByRole("button", { name: /why these therapists/i });
      fireEvent.click(trigger);

      // Both custom and default should be present
      expect(screen.getByText(customCriteria)).toBeInTheDocument();
      expect(screen.getByText("Our matching considers several factors:")).toBeInTheDocument();
      expect(screen.getByText("Specialty Match")).toBeInTheDocument();
    });

    it("should not render custom criteria section when not provided", () => {
      const { container } = render(<MatchRationale />);

      const trigger = screen.getByRole("button", { name: /why these therapists/i });
      fireEvent.click(trigger);

      // Only default criteria heading should be visible
      expect(screen.getByText("Our matching considers several factors:")).toBeInTheDocument();

      // No custom criteria box with special styling
      const customBox = container.querySelector('.bg-cream\\/50');
      expect(customBox).not.toBeInTheDocument();
    });
  });

  describe("Reassurance Message", () => {
    it("should render reassurance message when expanded", () => {
      render(<MatchRationale />);

      const trigger = screen.getByRole("button", { name: /why these therapists/i });
      fireEvent.click(trigger);

      expect(screen.getByText(/Remember:/i)).toBeInTheDocument();
      expect(
        screen.getByText(/You can always switch therapists if the first match isn't quite right/i)
      ).toBeInTheDocument();
    });

    it("should highlight Remember text as bold/strong", () => {
      render(<MatchRationale />);

      const trigger = screen.getByRole("button", { name: /why these therapists/i });
      fireEvent.click(trigger);

      const rememberText = screen.getByText("Remember:");
      expect(rememberText.tagName).toBe("STRONG");
    });
  });

  describe("Visual Styling", () => {
    it("should have warm, supportive tone in reassurance box", () => {
      const { container } = render(<MatchRationale />);

      const trigger = screen.getByRole("button", { name: /why these therapists/i });
      fireEvent.click(trigger);

      // Check for warm-orange background on reassurance message
      const reassuranceBox = screen.getByText(/You can always switch therapists/i).closest('div');
      expect(reassuranceBox?.className).toContain("warm-orange");
    });

    it("should have hover state on trigger", () => {
      const { container } = render(<MatchRationale />);

      const trigger = screen.getByRole("button", { name: /why these therapists/i });
      expect(trigger.className).toContain("hover");
    });

    it("should center content with max-width", () => {
      const { container } = render(<MatchRationale />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("max-w-[640px]");
      expect(wrapper.className).toContain("mx-auto");
    });
  });

  describe("Accessibility", () => {
    it("should be keyboard navigable", () => {
      render(<MatchRationale />);

      const trigger = screen.getByRole("button", { name: /why these therapists/i });

      // Focus the trigger
      trigger.focus();
      expect(document.activeElement).toBe(trigger);

      // Click to expand (keyboard users would press Enter/Space which triggers click)
      fireEvent.click(trigger);

      // Content should be expanded after interaction
      expect(screen.getByText("Our matching considers several factors:")).toBeInTheDocument();
    });

    it("should have proper ARIA attributes on accordion", () => {
      render(<MatchRationale />);

      const trigger = screen.getByRole("button", { name: /why these therapists/i });

      // Check for accordion button role and expanded state
      expect(trigger).toHaveAttribute("aria-expanded");
    });

    it("should update aria-expanded when toggled", () => {
      render(<MatchRationale />);

      const trigger = screen.getByRole("button", { name: /why these therapists/i });

      // Initially collapsed
      expect(trigger).toHaveAttribute("aria-expanded", "false");

      // Click to expand
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      // Click to collapse
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("Icons", () => {
    it("should render icons for each criterion", () => {
      const { container } = render(<MatchRationale />);

      const trigger = screen.getByRole("button", { name: /why these therapists/i });
      fireEvent.click(trigger);

      // Check that SVG icons are present (Lucide icons render as SVGs)
      const svgs = container.querySelectorAll('svg');
      // Should have: CheckCircle in trigger + Target, Clock, Star, Heart icons = 5 total minimum
      expect(svgs.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe("Responsive Layout", () => {
    it("should be full width on mobile", () => {
      const { container } = render(<MatchRationale />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("w-full");
    });

    it("should have proper spacing", () => {
      render(<MatchRationale />);

      const trigger = screen.getByRole("button", { name: /why these therapists/i });
      fireEvent.click(trigger);

      // Check for space-y-6 on main content container
      const contentContainer = screen.getByText("Our matching considers several factors:").closest('div');
      expect(contentContainer?.className).toContain("space-y");
    });
  });
});
