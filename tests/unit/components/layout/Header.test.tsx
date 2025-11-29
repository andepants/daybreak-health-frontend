/**
 * Unit tests for the Header component.
 *
 * Tests:
 * - Logo renders at correct height
 * - Save & Exit button renders and callback fires
 * - Button can be hidden via prop
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "@/components/layout/Header";

describe("Header", () => {
  it("renders the Daybreak logo", () => {
    render(<Header />);

    // Check for the logo container with aria-label
    const logoContainer = screen.getByLabelText("Daybreak Health");
    expect(logoContainer).toBeInTheDocument();
  });

  it("renders logo at 56px height on mobile (h-14)", () => {
    render(<Header />);

    const logoContainer = screen.getByLabelText("Daybreak Health");
    // The container has h-14 class (56px) for mobile
    expect(logoContainer).toHaveClass("h-14");
  });

  it("renders Save & Exit button by default", () => {
    render(<Header />);

    const button = screen.getByRole("button", { name: /save.*exit/i });
    expect(button).toBeInTheDocument();
  });

  it("fires onSaveExit callback when Save & Exit button is clicked", () => {
    const handleSaveExit = vi.fn();
    render(<Header onSaveExit={handleSaveExit} />);

    const button = screen.getByRole("button", { name: /save.*exit/i });
    fireEvent.click(button);

    expect(handleSaveExit).toHaveBeenCalledTimes(1);
  });

  it("hides Save & Exit button when showSaveExit is false", () => {
    render(<Header showSaveExit={false} />);

    const button = screen.queryByRole("button", { name: /save.*exit/i });
    expect(button).not.toBeInTheDocument();
  });

  it("applies custom className to header element", () => {
    render(<Header className="custom-class" />);

    const header = screen.getByRole("banner");
    expect(header).toHaveClass("custom-class");
  });
});
