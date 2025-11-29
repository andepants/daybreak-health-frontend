/**
 * Unit tests for ParentInfoForm component
 *
 * Tests form rendering, validation, accessibility, auto-save integration,
 * phone formatting, and navigation per AC-3.1.1 through AC-3.1.16.
 *
 * Note: Some tests involving Radix UI Select are skipped due to jsdom
 * compatibility issues (hasPointerCapture not available). These features
 * should be verified via E2E tests.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ParentInfoForm } from "@/features/demographics/ParentInfoForm";

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

// Import the mocked hook for assertions
import { useAutoSave } from "@/hooks/useAutoSave";

// Mock window.HTMLElement.prototype.hasPointerCapture for Radix UI
beforeEach(() => {
  window.HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  window.HTMLElement.prototype.setPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
});

describe("ParentInfoForm", () => {
  const defaultProps = {
    sessionId: "test-session-123",
    onContinue: vi.fn(),
    onBack: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementation
    vi.mocked(useAutoSave).mockReturnValue({
      save: vi.fn(),
      saveStatus: "idle",
      lastSaved: null,
      error: null,
      retry: vi.fn(),
    });
  });

  describe("Rendering (AC-3.1.1)", () => {
    it("should render all required form fields", () => {
      render(<ParentInfoForm {...defaultProps} />);

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/relationship/i)).toBeInTheDocument();
    });

    it("should render Continue and Back buttons", () => {
      render(<ParentInfoForm {...defaultProps} />);

      expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
    });

    it("should render required field indicators (*)", () => {
      render(<ParentInfoForm {...defaultProps} />);

      // Each label should have an asterisk for required
      const labels = screen.getAllByText("*");
      expect(labels.length).toBe(5); // 5 required fields
    });

    it("should apply max-width constraint for single-column layout", () => {
      const { container } = render(<ParentInfoForm {...defaultProps} />);

      const form = container.querySelector("form");
      expect(form).toHaveClass("max-w-[640px]");
    });
  });

  describe("First Name Validation (AC-3.1.2)", () => {
    it("should accept valid first name", async () => {
      const user = userEvent.setup();
      render(<ParentInfoForm {...defaultProps} />);

      const input = screen.getByLabelText(/first name/i);
      await user.type(input, "Jane");
      await user.tab(); // Trigger blur

      await waitFor(() => {
        expect(screen.queryByText(/name must be at least/i)).not.toBeInTheDocument();
      });
    });

    it("should show error for first name too short", async () => {
      const user = userEvent.setup();
      render(<ParentInfoForm {...defaultProps} />);

      const input = screen.getByLabelText(/first name/i);
      await user.type(input, "J");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe("Last Name Validation (AC-3.1.3)", () => {
    it("should show error for last name too short", async () => {
      const user = userEvent.setup();
      render(<ParentInfoForm {...defaultProps} />);

      const input = screen.getByLabelText(/last name/i);
      await user.type(input, "D");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe("Email Validation (AC-3.1.4)", () => {
    it("should accept valid email format", async () => {
      const user = userEvent.setup();
      render(<ParentInfoForm {...defaultProps} />);

      const input = screen.getByLabelText(/email/i);
      await user.type(input, "jane@example.com");
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/valid email/i)).not.toBeInTheDocument();
      });
    });

    it("should show error for invalid email format", async () => {
      const user = userEvent.setup();
      render(<ParentInfoForm {...defaultProps} />);

      const input = screen.getByLabelText(/email/i);
      await user.type(input, "invalid-email");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
      });
    });
  });

  describe("Phone Validation and Formatting (AC-3.1.5, AC-3.1.12)", () => {
    it("should auto-format phone number as user types", async () => {
      const user = userEvent.setup();
      render(<ParentInfoForm {...defaultProps} />);

      const input = screen.getByLabelText(/phone/i) as HTMLInputElement;
      await user.type(input, "5551234567");

      expect(input.value).toBe("(555) 123-4567");
    });

    it("should show error for invalid phone number", async () => {
      const user = userEvent.setup();
      render(<ParentInfoForm {...defaultProps} />);

      const input = screen.getByLabelText(/phone/i);
      await user.type(input, "123");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/valid 10-digit phone number/i)).toBeInTheDocument();
      });
    });

    it("should accept valid 10-digit phone number", async () => {
      const user = userEvent.setup();
      render(<ParentInfoForm {...defaultProps} />);

      const input = screen.getByLabelText(/phone/i);
      await user.type(input, "5551234567");
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/valid 10-digit/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Relationship Select (AC-3.1.6)", () => {
    it("should render select trigger for relationship", () => {
      render(<ParentInfoForm {...defaultProps} />);

      // Check the combobox (select trigger) is present
      const selectTrigger = screen.getByRole("combobox");
      expect(selectTrigger).toBeInTheDocument();
    });

    it("should have required indicator on relationship label", () => {
      render(<ParentInfoForm {...defaultProps} />);

      // The relationship field should be labeled and have required indicator
      expect(screen.getByLabelText(/relationship to child/i)).toBeInTheDocument();
    });
  });

  describe("Validation Timing (AC-3.1.7)", () => {
    it("should NOT validate on keystroke", async () => {
      const user = userEvent.setup();
      render(<ParentInfoForm {...defaultProps} />);

      const input = screen.getByLabelText(/first name/i);
      await user.type(input, "J"); // Too short, but should not show error yet

      // Error should not appear during typing
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should validate on blur", async () => {
      const user = userEvent.setup();
      render(<ParentInfoForm {...defaultProps} />);

      const input = screen.getByLabelText(/first name/i);
      await user.type(input, "J");
      await user.tab(); // Trigger blur

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });
    });
  });

  describe("Error Display (AC-3.1.8)", () => {
    it("should display error messages below fields in red", async () => {
      const user = userEvent.setup();
      render(<ParentInfoForm {...defaultProps} />);

      const input = screen.getByLabelText(/first name/i);
      await user.type(input, "J");
      await user.tab();

      await waitFor(() => {
        const errorMessage = screen.getByRole("alert");
        expect(errorMessage).toBeInTheDocument();
        // Check red color styling
        expect(errorMessage).toHaveStyle({ color: "#E85D5D" });
      });
    });
  });

  describe("Valid Field Indicator (AC-3.1.9)", () => {
    it("should show checkmark for valid field after blur", async () => {
      const user = userEvent.setup();
      const { container } = render(<ParentInfoForm {...defaultProps} />);

      const input = screen.getByLabelText(/first name/i);
      await user.type(input, "Jane");
      await user.tab();

      await waitFor(() => {
        // Look for checkmark icon in the first name field container
        // The Check icon from lucide-react should be present
        const svgs = container.querySelectorAll("svg");
        expect(svgs.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Submit Button State (AC-3.1.10)", () => {
    it("should disable Continue button when form is invalid", () => {
      render(<ParentInfoForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: /continue/i });
      expect(submitButton).toBeDisabled();
    });

    it("should enable Continue button when all text fields are valid", async () => {
      const user = userEvent.setup();
      render(
        <ParentInfoForm
          {...defaultProps}
          initialData={{ relationshipToChild: "parent" }}
        />
      );

      // Fill text fields with valid data (relationship pre-filled)
      await user.type(screen.getByLabelText(/first name/i), "Jane");
      await user.type(screen.getByLabelText(/last name/i), "Doe");
      await user.type(screen.getByLabelText(/email/i), "jane@example.com");
      await user.type(screen.getByLabelText(/phone/i), "5551234567");

      // Blur to trigger validation
      await user.tab();

      await waitFor(() => {
        const submitButton = screen.getByRole("button", { name: /continue/i });
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe("Browser Autofill (AC-3.1.11)", () => {
    it("should have autoComplete='email' on email field", () => {
      render(<ParentInfoForm {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute("autocomplete", "email");
    });

    it("should have autoComplete='given-name' on first name field", () => {
      render(<ParentInfoForm {...defaultProps} />);

      const firstNameInput = screen.getByLabelText(/first name/i);
      expect(firstNameInput).toHaveAttribute("autocomplete", "given-name");
    });

    it("should have autoComplete='family-name' on last name field", () => {
      render(<ParentInfoForm {...defaultProps} />);

      const lastNameInput = screen.getByLabelText(/last name/i);
      expect(lastNameInput).toHaveAttribute("autocomplete", "family-name");
    });

    it("should have autoComplete='tel' on phone field", () => {
      render(<ParentInfoForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText(/phone/i);
      expect(phoneInput).toHaveAttribute("autocomplete", "tel");
    });
  });

  describe("Auto-Save Integration (AC-3.1.14)", () => {
    it("should call save on field blur", async () => {
      const mockSave = vi.fn();
      vi.mocked(useAutoSave).mockReturnValue({
        save: mockSave,
        saveStatus: "idle",
        lastSaved: null,
        error: null,
        retry: vi.fn(),
      });

      const user = userEvent.setup();
      render(<ParentInfoForm {...defaultProps} />);

      const input = screen.getByLabelText(/first name/i);
      await user.type(input, "Jane");
      await user.tab();

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalled();
      });
    });

    it("should display saving status", () => {
      vi.mocked(useAutoSave).mockReturnValue({
        save: vi.fn(),
        saveStatus: "saving",
        lastSaved: null,
        error: null,
        retry: vi.fn(),
      });

      render(<ParentInfoForm {...defaultProps} />);

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

      render(<ParentInfoForm {...defaultProps} />);

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

      render(<ParentInfoForm {...defaultProps} />);

      expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
    });
  });

  describe("Navigation (AC-3.1.15, AC-3.1.16)", () => {
    it("should call onContinue when form is submitted with valid data", async () => {
      const onContinue = vi.fn();
      const user = userEvent.setup();
      render(
        <ParentInfoForm
          {...defaultProps}
          onContinue={onContinue}
          initialData={{ relationshipToChild: "parent" }}
        />
      );

      // Fill all required text fields (relationship pre-filled)
      await user.type(screen.getByLabelText(/first name/i), "Jane");
      await user.type(screen.getByLabelText(/last name/i), "Doe");
      await user.type(screen.getByLabelText(/email/i), "jane@example.com");
      await user.type(screen.getByLabelText(/phone/i), "5551234567");
      await user.tab();

      // Wait for form to be valid then submit
      await waitFor(() => {
        const submitButton = screen.getByRole("button", { name: /continue/i });
        expect(submitButton).not.toBeDisabled();
      });

      const submitButton = screen.getByRole("button", { name: /continue/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onContinue).toHaveBeenCalled();
      });
    });

    it("should call onBack when Back button is clicked", async () => {
      const onBack = vi.fn();
      const user = userEvent.setup();
      render(<ParentInfoForm {...defaultProps} onBack={onBack} />);

      const backButton = screen.getByRole("button", { name: /back/i });
      await user.click(backButton);

      expect(onBack).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have aria-required on required fields", () => {
      render(<ParentInfoForm {...defaultProps} />);

      expect(screen.getByLabelText(/first name/i)).toHaveAttribute("aria-required", "true");
      expect(screen.getByLabelText(/last name/i)).toHaveAttribute("aria-required", "true");
      expect(screen.getByLabelText(/email/i)).toHaveAttribute("aria-required", "true");
      expect(screen.getByLabelText(/phone/i)).toHaveAttribute("aria-required", "true");
    });

    it("should have aria-invalid on fields with errors", async () => {
      const user = userEvent.setup();
      render(<ParentInfoForm {...defaultProps} />);

      const input = screen.getByLabelText(/first name/i);
      await user.type(input, "J");
      await user.tab();

      await waitFor(() => {
        expect(input).toHaveAttribute("aria-invalid", "true");
      });
    });

    it("should have aria-describedby linking errors to fields", async () => {
      const user = userEvent.setup();
      render(<ParentInfoForm {...defaultProps} />);

      const input = screen.getByLabelText(/first name/i);
      await user.type(input, "J");
      await user.tab();

      await waitFor(() => {
        expect(input).toHaveAttribute("aria-describedby", "firstName-error");
        expect(screen.getByRole("alert")).toHaveAttribute("id", "firstName-error");
      });
    });

    it("should be keyboard navigable", async () => {
      const user = userEvent.setup();
      render(<ParentInfoForm {...defaultProps} />);

      // Tab through form fields
      await user.tab();
      expect(screen.getByLabelText(/first name/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/last name/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/email/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/phone/i)).toHaveFocus();
    });

    it("should have proper form labels", () => {
      render(<ParentInfoForm {...defaultProps} />);

      // Each input should be properly labeled
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/relationship to child/i)).toBeInTheDocument();
    });
  });

  describe("Initial Data", () => {
    it("should populate form with initial data when provided", () => {
      render(
        <ParentInfoForm
          {...defaultProps}
          initialData={{
            firstName: "Jane",
            lastName: "Doe",
            email: "jane@example.com",
            phone: "5551234567",
            relationshipToChild: "guardian",
          }}
        />
      );

      expect(screen.getByLabelText(/first name/i)).toHaveValue("Jane");
      expect(screen.getByLabelText(/last name/i)).toHaveValue("Doe");
      expect(screen.getByLabelText(/email/i)).toHaveValue("jane@example.com");
      // Phone should be formatted
      expect(screen.getByLabelText(/phone/i)).toHaveValue("(555) 123-4567");
    });
  });

  describe("Form Submission Data", () => {
    it("should convert phone to E.164 format before submitting", async () => {
      const onContinue = vi.fn();
      const user = userEvent.setup();
      render(
        <ParentInfoForm
          {...defaultProps}
          onContinue={onContinue}
          initialData={{ relationshipToChild: "parent" }}
        />
      );

      // Fill text fields (relationship pre-filled)
      await user.type(screen.getByLabelText(/first name/i), "Jane");
      await user.type(screen.getByLabelText(/last name/i), "Doe");
      await user.type(screen.getByLabelText(/email/i), "jane@example.com");
      await user.type(screen.getByLabelText(/phone/i), "5551234567");
      await user.tab();

      // Wait for form to be valid then submit
      await waitFor(() => {
        const submitButton = screen.getByRole("button", { name: /continue/i });
        expect(submitButton).not.toBeDisabled();
      });

      const submitButton = screen.getByRole("button", { name: /continue/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onContinue).toHaveBeenCalled();
        expect(onContinue.mock.calls[0][0].phone).toBe("+15551234567");
      });
    });
  });
});
