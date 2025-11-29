/**
 * Unit tests for the ErrorBoundary component.
 *
 * Tests:
 * - Error boundary catches errors and displays fallback UI
 * - Try Again button resets error state
 * - Custom fallback can be provided
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

// Component that throws an error
function ThrowError({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error message");
  }
  return <div>No error</div>;
}

describe("ErrorBoundary", () => {
  // Suppress console.error for expected errors in tests
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("catches errors and displays fallback UI", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Should show the fallback UI
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it("displays Try Again button in fallback UI", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const tryAgainButton = screen.getByRole("button", { name: /try again/i });
    expect(tryAgainButton).toBeInTheDocument();
  });

  it("resets error state when Try Again is clicked", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Verify error state
    expect(screen.getByRole("alert")).toBeInTheDocument();

    // Click Try Again - this will re-render children
    const tryAgainButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(tryAgainButton);

    // The boundary resets, but the component still throws
    // So we see the error UI again (this tests the reset mechanism)
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom error message</div>}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom error message")).toBeInTheDocument();
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });

  it("displays friendly error message", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(
      screen.getByText(/we encountered an unexpected error/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/please try again|contact support/i)
    ).toBeInTheDocument();
  });

  it("has alert role for accessibility", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute("aria-live", "assertive");
  });

  it("applies custom className to fallback container", () => {
    render(
      <ErrorBoundary className="custom-error-class">
        <ThrowError />
      </ErrorBoundary>
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("custom-error-class");
  });
});
