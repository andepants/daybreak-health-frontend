/**
 * Unit tests for the Footer component.
 *
 * Tests:
 * - Privacy and Terms links render
 * - Links are accessible with keyboard
 * - Variant styling applies correctly
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer, FOOTER_LINKS } from "@/components/layout/Footer";

describe("Footer", () => {
  it("renders Privacy Policy link", () => {
    render(<Footer />);

    const privacyLink = screen.getByRole("link", { name: /privacy policy/i });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute("href", "/privacy");
  });

  it("renders Terms of Service link", () => {
    render(<Footer />);

    const termsLink = screen.getByRole("link", { name: /terms of service/i });
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute("href", "/terms");
  });

  it("renders all footer links", () => {
    render(<Footer />);

    FOOTER_LINKS.forEach((link) => {
      const linkElement = screen.getByRole("link", { name: link.label });
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute("href", link.href);
    });
  });

  it("links have accessible focus states", () => {
    render(<Footer />);

    const privacyLink = screen.getByRole("link", { name: /privacy policy/i });

    // Check that focus-visible classes are present
    expect(privacyLink).toHaveClass("focus-visible:ring-2");
    expect(privacyLink).toHaveClass("focus-visible:ring-ring");
  });

  it("has contentinfo role for accessibility", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
  });

  it("has navigation with proper aria-label", () => {
    render(<Footer />);

    const nav = screen.getByRole("navigation", { name: /footer navigation/i });
    expect(nav).toBeInTheDocument();
  });

  it("applies default variant styling with border and copyright", () => {
    render(<Footer variant="default" />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("border-t");

    // Copyright text should be present in default variant
    expect(screen.getByText(/daybreak health/i)).toBeInTheDocument();
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument();
  });

  it("applies minimal variant styling without border", () => {
    render(<Footer variant="minimal" />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).not.toHaveClass("border-t");

    // Copyright should not be present in minimal variant
    expect(screen.queryByText(/all rights reserved/i)).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Footer className="custom-footer" />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("custom-footer");
  });
});
