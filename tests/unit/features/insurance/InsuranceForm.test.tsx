/**
 * Unit tests for InsuranceForm component
 *
 * Tests form rendering, validation, accessibility, auto-save integration,
 * self-pay modal, and subscriber auto-population per AC-4.1.1 through AC-4.1.8.
 *
 * Note: Some tests involving Radix UI Select are skipped due to jsdom
 * compatibility issues (hasPointerCapture not available). These features
 * should be verified via E2E tests.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InsuranceForm } from "@/features/insurance/InsuranceForm";

// Mock useAutoSave hook
vi.mock("@/hooks/useAutoSave", () => ({
  useAutoSave: vi.fn(() => ({
    save: vi.fn(),
    saveStatus: "idle",
    lastSaved: null,
    error: null,
    retry: vi.fn(),
  })),
}));

// Mock useInsurance hook
vi.mock("@/features/insurance/useInsurance", () => ({
  useInsurance: vi.fn(() => ({
    insuranceInfo: null,
    isLoading: false,
    isSaving: false,
    error: null,
    submitInsurance: vi.fn(),
    setSelfPay: vi.fn(),
    clearError: vi.fn(),
  })),
}));

// Import the mocked hooks for assertions
import { useAutoSave } from "@/hooks/useAutoSave";
import { useInsurance } from "@/features/insurance/useInsurance";

// Mock window.HTMLElement.prototype.hasPointerCapture for Radix UI
beforeEach(() => {
  window.HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  window.HTMLElement.prototype.setPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
});

describe("InsuranceForm", () => {
  const defaultProps = {
    sessionId: "test-session-123",
    parentName: "Jane Doe",
    onContinue: vi.fn(),
    onBack: vi.fn(),
    onSelfPay: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementations
    vi.mocked(useAutoSave).mockReturnValue({
      save: vi.fn(),
      saveStatus: "idle",
      lastSaved: null,
      error: null,
      retry: vi.fn(),
    });
    vi.mocked(useInsurance).mockReturnValue({
      insuranceInfo: null,
      isLoading: false,
      isSaving: false,
      error: null,
      submitInsurance: vi.fn(),
      setSelfPay: vi.fn(),
      clearError: vi.fn(),
    });
  });

  describe("Rendering (AC-4.1.1)", () => {
    it("should render all required form fields", () => {
      render(<InsuranceForm {...defaultProps} />);

      expect(screen.getByLabelText(/insurance carrier/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/member id/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/group number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/relationship to policyholder/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/name on insurance card/i)).toBeInTheDocument();
    });

    it("should render Continue and Back buttons", () => {
      render(<InsuranceForm {...defaultProps} />);

      expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
    });

    it("should render self-pay link (AC-4.1.6)", () => {
      render(<InsuranceForm {...defaultProps} />);

      expect(screen.getByText(/i don't have insurance/i)).toBeInTheDocument();
    });

    it("should render required field indicators (*)", () => {
      render(<InsuranceForm {...defaultProps} />);

      // Required fields: carrier, member ID, relationship, subscriber name (4 total)
      // Group number is optional
      const requiredIndicators = screen.getAllByText("*");
      expect(requiredIndicators.length).toBe(4);
    });

    it("should render optional indicator for group number", () => {
      render(<InsuranceForm {...defaultProps} />);

      expect(screen.getByText(/optional/i)).toBeInTheDocument();
    });

    it("should apply max-width constraint for single-column layout", () => {
      const { container } = render(<InsuranceForm {...defaultProps} />);

      const form = container.querySelector("form");
      expect(form).toHaveClass("max-w-[640px]");
    });
  });

  describe("Member ID Validation (AC-4.1.2)", () => {
    it("should accept valid member ID", async () => {
      const user = userEvent.setup();
      render(<InsuranceForm {...defaultProps} />);

      const input = screen.getByLabelText(/member id/i);
      await user.type(input, "ABC123456");
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/member id must be/i)).not.toBeInTheDocument();
      });
    });

    it("should show error for member ID too short (< 5 chars)", async () => {
      const user = userEvent.setup();
      render(<InsuranceForm {...defaultProps} />);

      const input = screen.getByLabelText(/member id/i);
      await user.type(input, "ABC1");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/member id must be at least 5 characters/i)).toBeInTheDocument();
      });
    });

    it("should show error for member ID with invalid characters", async () => {
      const user = userEvent.setup();
      render(<InsuranceForm {...defaultProps} />);

      const input = screen.getByLabelText(/member id/i);
      await user.type(input, "ABC@12345");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/only contain letters, numbers, and hyphens/i)).toBeInTheDocument();
      });
    });
  });

  describe("Group Number Validation (AC-4.1.3)", () => {
    it("should accept empty group number (optional)", async () => {
      const user = userEvent.setup();
      render(<InsuranceForm {...defaultProps} />);

      const input = screen.getByLabelText(/group number/i);
      await user.click(input);
      await user.tab(); // Leave empty and blur

      await waitFor(() => {
        expect(screen.queryByText(/group number must be/i)).not.toBeInTheDocument();
      });
    });

    it("should accept valid group number", async () => {
      const user = userEvent.setup();
      render(<InsuranceForm {...defaultProps} />);

      const input = screen.getByLabelText(/group number/i);
      await user.type(input, "GRP-001");
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/group number/i)).toBeInTheDocument(); // Label exists
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });
  });

  describe("Subscriber Auto-populate (AC-4.1.4)", () => {
    it("should auto-populate subscriber name when Self is selected", async () => {
      render(
        <InsuranceForm
          {...defaultProps}
          parentName="Jane Doe"
          initialData={{ relationshipToSubscriber: "Self" }}
        />
      );

      // With Self selected and parentName provided, subscriber should be auto-filled
      const subscriberInput = screen.getByLabelText(/name on insurance card/i);

      await waitFor(() => {
        expect(subscriberInput).toHaveValue("Jane Doe");
      });
    });
  });

  describe("Validation Timing (AC-4.1.5)", () => {
    it("should NOT validate on keystroke", async () => {
      const user = userEvent.setup();
      render(<InsuranceForm {...defaultProps} />);

      const input = screen.getByLabelText(/member id/i);
      await user.type(input, "A"); // Too short, but should not show error yet

      // Error should not appear during typing
      expect(screen.queryByText(/member id must be/i)).not.toBeInTheDocument();
    });

    it("should validate on blur", async () => {
      const user = userEvent.setup();
      render(<InsuranceForm {...defaultProps} />);

      const input = screen.getByLabelText(/member id/i);
      await user.type(input, "A");
      await user.tab(); // Trigger blur

      await waitFor(() => {
        expect(screen.getByText(/member id must be at least 5 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe("Self-Pay Modal (AC-4.1.6)", () => {
    it("should open self-pay modal when link is clicked", async () => {
      const user = userEvent.setup();
      render(<InsuranceForm {...defaultProps} />);

      const link = screen.getByText(/i don't have insurance/i);
      await user.click(link);

      await waitFor(() => {
        expect(screen.getByText(/self-pay option/i)).toBeInTheDocument();
      });
    });

    it("should display pricing information in modal", async () => {
      const user = userEvent.setup();
      render(<InsuranceForm {...defaultProps} />);

      await user.click(screen.getByText(/i don't have insurance/i));

      await waitFor(() => {
        expect(screen.getByText(/\$120\/session/i)).toBeInTheDocument();
      });
    });
  });

  describe("Continue Button State (AC-4.1.7)", () => {
    it("should disable Continue button when form is invalid", () => {
      render(<InsuranceForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: /continue/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Auto-Save on Blur (AC-4.1.8)", () => {
    it("should call save on field blur with debounce", async () => {
      const mockSave = vi.fn();
      vi.mocked(useAutoSave).mockReturnValue({
        save: mockSave,
        saveStatus: "idle",
        lastSaved: null,
        error: null,
        retry: vi.fn(),
      });

      const user = userEvent.setup();
      render(<InsuranceForm {...defaultProps} />);

      const input = screen.getByLabelText(/member id/i);
      await user.type(input, "ABC123456");
      await user.tab();

      // Auto-save is debounced by 500ms
      await waitFor(
        () => {
          expect(mockSave).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );
    });

    it("should display saving status", () => {
      vi.mocked(useAutoSave).mockReturnValue({
        save: vi.fn(),
        saveStatus: "saving",
        lastSaved: null,
        error: null,
        retry: vi.fn(),
      });

      render(<InsuranceForm {...defaultProps} />);

      expect(screen.getByText(/saving/i)).toBeInTheDocument();
    });

    it("should display saved status", () => {
      vi.mocked(useAutoSave).mockReturnValue({
        save: vi.fn(),
        saveStatus: "saved",
        lastSaved: new Date(),
        error: null,
        retry: vi.fn(),
      });

      render(<InsuranceForm {...defaultProps} />);

      expect(screen.getByText(/all changes saved/i)).toBeInTheDocument();
    });

    it("should display error status", () => {
      vi.mocked(useAutoSave).mockReturnValue({
        save: vi.fn(),
        saveStatus: "error",
        lastSaved: null,
        error: new Error("Save failed"),
        retry: vi.fn(),
      });

      render(<InsuranceForm {...defaultProps} />);

      expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("should call onBack when Back button is clicked", async () => {
      const onBack = vi.fn();
      const user = userEvent.setup();
      render(<InsuranceForm {...defaultProps} onBack={onBack} />);

      const backButton = screen.getByRole("button", { name: /back/i });
      await user.click(backButton);

      expect(onBack).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have aria-required on required fields", () => {
      render(<InsuranceForm {...defaultProps} />);

      expect(screen.getByLabelText(/member id/i)).toHaveAttribute("aria-required", "true");
      expect(screen.getByLabelText(/name on insurance card/i)).toHaveAttribute("aria-required", "true");
    });

    it("should have aria-invalid on fields with errors", async () => {
      const user = userEvent.setup();
      render(<InsuranceForm {...defaultProps} />);

      const input = screen.getByLabelText(/member id/i);
      await user.type(input, "A");
      await user.tab();

      await waitFor(() => {
        expect(input).toHaveAttribute("aria-invalid", "true");
      });
    });

    it("should have autoComplete=off on member ID for PHI protection", () => {
      render(<InsuranceForm {...defaultProps} />);

      const memberIdInput = screen.getByLabelText(/member id/i);
      expect(memberIdInput).toHaveAttribute("autocomplete", "off");
    });

    it("should be keyboard navigable", async () => {
      const user = userEvent.setup();
      render(<InsuranceForm {...defaultProps} />);

      // Tab through form fields
      await user.tab(); // First focusable element

      // Form should be navigable - just verify we can tab
      const activeElement = document.activeElement;
      expect(activeElement).not.toBe(document.body);
    });

    it("should have proper form labels", () => {
      render(<InsuranceForm {...defaultProps} />);

      expect(screen.getByLabelText(/insurance carrier/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/member id/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/group number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/relationship to policyholder/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/name on insurance card/i)).toBeInTheDocument();
    });
  });

  describe("Initial Data", () => {
    it("should populate form with initial data when provided", () => {
      render(
        <InsuranceForm
          {...defaultProps}
          initialData={{
            carrier: "bcbs",
            memberId: "ABC123456789",
            groupNumber: "GRP-001",
            subscriberName: "Jane Doe",
            relationshipToSubscriber: "Self",
          }}
        />
      );

      expect(screen.getByLabelText(/member id/i)).toHaveValue("ABC123456789");
      expect(screen.getByLabelText(/group number/i)).toHaveValue("GRP-001");
      expect(screen.getByLabelText(/name on insurance card/i)).toHaveValue("Jane Doe");
    });
  });
});
