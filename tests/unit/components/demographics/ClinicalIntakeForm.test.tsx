/**
 * Unit tests for ClinicalIntakeForm component
 *
 * Tests form rendering, validation, accessibility, auto-save integration,
 * character counters, multi-select checkboxes, and navigation per AC-3.3.1
 * through AC-3.3.13.
 *
 * Note: Select/Checkbox tests involving Radix UI may require E2E verification
 * due to jsdom limitations with pointer events.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClinicalIntakeForm } from "@/features/demographics/ClinicalIntakeForm";

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

// Mock window.HTMLElement.prototype methods for Radix UI
beforeEach(() => {
  window.HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  window.HTMLElement.prototype.setPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe("ClinicalIntakeForm", () => {
  const defaultProps = {
    sessionId: "test-session-123",
    onContinue: vi.fn(),
    onBack: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAutoSave).mockReturnValue({
      save: vi.fn(),
      saveStatus: "idle",
      lastSaved: null,
      error: null,
      retry: vi.fn(),
    });
  });

  describe("Rendering (AC-3.3.1)", () => {
    it("should render all clinical intake form fields", () => {
      render(<ClinicalIntakeForm {...defaultProps} />);

      expect(screen.getByLabelText(/current medications/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/previous therapy experience/i)).toBeInTheDocument();
      expect(screen.getByText(/mental health diagnoses/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/school accommodations/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/anything else we should know/i)).toBeInTheDocument();
    });

    it("should render Continue and Back buttons", () => {
      render(<ClinicalIntakeForm {...defaultProps} />);

      expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
    });

    it("should apply max-width constraint for single-column layout", () => {
      const { container } = render(<ClinicalIntakeForm {...defaultProps} />);

      const form = container.querySelector("form");
      expect(form).toHaveClass("max-w-[640px]");
    });
  });

  describe("All Fields Optional (AC-3.3.7)", () => {
    it("should show (Optional) indicator on all fields", () => {
      render(<ClinicalIntakeForm {...defaultProps} />);

      const optionalIndicators = screen.getAllByText(/\(optional\)/i);
      expect(optionalIndicators.length).toBe(5);
    });

    it("should enable Continue button without filling any fields", () => {
      render(<ClinicalIntakeForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: /continue/i });
      expect(submitButton).not.toBeDisabled();
    });

    it("should allow form submission with no fields filled", async () => {
      const onContinue = vi.fn();
      const user = userEvent.setup();
      render(<ClinicalIntakeForm {...defaultProps} onContinue={onContinue} />);

      const submitButton = screen.getByRole("button", { name: /continue/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onContinue).toHaveBeenCalled();
      });
    });
  });

  describe("Current Medications Field (AC-3.3.2, AC-3.3.10, AC-3.3.12)", () => {
    it("should render medications textarea", () => {
      render(<ClinicalIntakeForm {...defaultProps} />);

      const textarea = screen.getByLabelText(/current medications/i);
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName.toLowerCase()).toBe("textarea");
    });

    it("should show placeholder text", () => {
      render(<ClinicalIntakeForm {...defaultProps} />);

      const textarea = screen.getByLabelText(/current medications/i);
      expect(textarea).toHaveAttribute(
        "placeholder",
        expect.stringContaining("medications")
      );
    });

    it("should show character counter", () => {
      render(<ClinicalIntakeForm {...defaultProps} />);

      expect(screen.getAllByText(/0\/500/)).toHaveLength(2); // Two textareas
    });

    it("should update character counter as user types", async () => {
      const user = userEvent.setup();
      render(<ClinicalIntakeForm {...defaultProps} />);

      const textarea = screen.getByLabelText(/current medications/i);
      await user.type(textarea, "Adderall 10mg");

      await waitFor(() => {
        expect(screen.getByText(/13\/500/)).toBeInTheDocument();
      });
    });

    it("should enforce 500 character maximum via maxLength", () => {
      render(<ClinicalIntakeForm {...defaultProps} />);

      const textarea = screen.getByLabelText(/current medications/i);
      expect(textarea).toHaveAttribute("maxLength", "500");
    });
  });

  describe("Previous Therapy Experience Field (AC-3.3.3, AC-3.3.10)", () => {
    it("should render previous therapy select field", () => {
      render(<ClinicalIntakeForm {...defaultProps} />);

      expect(screen.getByLabelText(/previous therapy experience/i)).toBeInTheDocument();
    });

    it("should have correct placeholder text", () => {
      render(<ClinicalIntakeForm {...defaultProps} />);

      expect(screen.getByText(/select previous therapy experience/i)).toBeInTheDocument();
    });

    // Note: Full select interaction testing requires E2E due to Radix UI Portal
  });

  describe("Mental Health Diagnoses Multi-Select (AC-3.3.4, AC-3.3.10, AC-3.3.13)", () => {
    it("should render all diagnosis checkbox options", () => {
      render(<ClinicalIntakeForm {...defaultProps} />);

      expect(screen.getByLabelText(/anxiety/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/depression/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/adhd/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/autism/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^other$/i)).toBeInTheDocument();
    });

    it("should render checkboxes with proper role", () => {
      render(<ClinicalIntakeForm {...defaultProps} />);

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBe(5);
    });

    it("should allow selecting multiple diagnoses", async () => {
      const user = userEvent.setup();
      render(<ClinicalIntakeForm {...defaultProps} />);

      const anxietyCheckbox = screen.getByLabelText(/anxiety/i);
      const adhdCheckbox = screen.getByLabelText(/adhd/i);

      await user.click(anxietyCheckbox);
      await user.click(adhdCheckbox);

      await waitFor(() => {
        expect(anxietyCheckbox).toHaveAttribute("data-state", "checked");
        expect(adhdCheckbox).toHaveAttribute("data-state", "checked");
      });
    });

    it("should allow deselecting a diagnosis", async () => {
      const user = userEvent.setup();
      render(<ClinicalIntakeForm {...defaultProps} />);

      const anxietyCheckbox = screen.getByLabelText(/anxiety/i);

      await user.click(anxietyCheckbox);
      await waitFor(() => {
        expect(anxietyCheckbox).toHaveAttribute("data-state", "checked");
      });

      await user.click(anxietyCheckbox);
      await waitFor(() => {
        expect(anxietyCheckbox).toHaveAttribute("data-state", "unchecked");
      });
    });

    it("should have helper text for diagnosis field", () => {
      render(<ClinicalIntakeForm {...defaultProps} />);

      expect(screen.getByText(/select any that apply/i)).toBeInTheDocument();
    });
  });

  describe("School Accommodations Field (AC-3.3.5, AC-3.3.10)", () => {
    it("should render school accommodations select field", () => {
      render(<ClinicalIntakeForm {...defaultProps} />);

      expect(screen.getByLabelText(/school accommodations/i)).toBeInTheDocument();
    });

    it("should have correct placeholder text", () => {
      render(<ClinicalIntakeForm {...defaultProps} />);

      expect(screen.getByText(/select school accommodations/i)).toBeInTheDocument();
    });
  });

  describe("Additional Information Field (AC-3.3.6, AC-3.3.10, AC-3.3.12)", () => {
    it("should render additional info textarea", () => {
      render(<ClinicalIntakeForm {...defaultProps} />);

      const textarea = screen.getByLabelText(/anything else we should know/i);
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName.toLowerCase()).toBe("textarea");
    });

    it("should show character counter", () => {
      render(<ClinicalIntakeForm {...defaultProps} />);

      const counters = screen.getAllByText(/\/500/);
      expect(counters.length).toBe(2); // Two textareas
    });

    it("should enforce 500 character maximum via maxLength", () => {
      render(<ClinicalIntakeForm {...defaultProps} />);

      const textarea = screen.getByLabelText(/anything else we should know/i);
      expect(textarea).toHaveAttribute("maxLength", "500");
    });
  });

  describe("Helper Message (AC-3.3.8)", () => {
    it("should display therapist matching message", () => {
      render(<ClinicalIntakeForm {...defaultProps} />);

      expect(
        screen.getByText(/this information helps us match with the right therapist/i)
      ).toBeInTheDocument();
    });
  });

  describe("HIPAA Privacy Notice (AC-3.3.9)", () => {
    it("should display HIPAA notice", () => {
      render(<ClinicalIntakeForm {...defaultProps} />);

      expect(
        screen.getByText(/your information is protected by hipaa/i)
      ).toBeInTheDocument();
    });

    it("should display shield icon with HIPAA notice", () => {
      const { container } = render(<ClinicalIntakeForm {...defaultProps} />);

      // Look for Shield icon (SVG) near HIPAA notice
      const svgs = container.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe("Auto-Save Integration (AC-3.3.10)", () => {
    it("should call save on medications field blur", async () => {
      const mockSave = vi.fn();
      vi.mocked(useAutoSave).mockReturnValue({
        save: mockSave,
        saveStatus: "idle",
        lastSaved: null,
        error: null,
        retry: vi.fn(),
      });

      const user = userEvent.setup();
      render(<ClinicalIntakeForm {...defaultProps} />);

      const textarea = screen.getByLabelText(/current medications/i);
      await user.type(textarea, "Test medication");
      await user.tab();

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalled();
      });
    });

    it("should call save on checkbox change", async () => {
      const mockSave = vi.fn();
      vi.mocked(useAutoSave).mockReturnValue({
        save: mockSave,
        saveStatus: "idle",
        lastSaved: null,
        error: null,
        retry: vi.fn(),
      });

      const user = userEvent.setup();
      render(<ClinicalIntakeForm {...defaultProps} />);

      const anxietyCheckbox = screen.getByLabelText(/anxiety/i);
      await user.click(anxietyCheckbox);

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

      render(<ClinicalIntakeForm {...defaultProps} />);

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

      render(<ClinicalIntakeForm {...defaultProps} />);

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

      render(<ClinicalIntakeForm {...defaultProps} />);

      expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
    });
  });

  describe("Continue Button Navigation (AC-3.3.11)", () => {
    it("should call onContinue when Continue button is clicked", async () => {
      const onContinue = vi.fn();
      const user = userEvent.setup();
      render(<ClinicalIntakeForm {...defaultProps} onContinue={onContinue} />);

      const continueButton = screen.getByRole("button", { name: /continue/i });
      await user.click(continueButton);

      await waitFor(() => {
        expect(onContinue).toHaveBeenCalled();
      });
    });

    it("should call onBack when Back button is clicked", async () => {
      const onBack = vi.fn();
      const user = userEvent.setup();
      render(<ClinicalIntakeForm {...defaultProps} onBack={onBack} />);

      const backButton = screen.getByRole("button", { name: /back/i });
      await user.click(backButton);

      expect(onBack).toHaveBeenCalled();
    });
  });

  describe("Character Counter Warning (AC-3.3.12)", () => {
    it("should show warning color when approaching character limit", async () => {
      const user = userEvent.setup();
      render(<ClinicalIntakeForm {...defaultProps} />);

      const textarea = screen.getByLabelText(/current medications/i);
      // Type 451 characters to trigger warning
      const longText = "a".repeat(451);
      await user.type(textarea, longText);

      await waitFor(() => {
        const counter = screen.getByText(/451\/500/);
        expect(counter).toHaveClass("text-amber-500");
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper aria-label on checkbox group", () => {
      render(<ClinicalIntakeForm {...defaultProps} />);

      expect(
        screen.getByRole("group", { name: /mental health diagnoses/i })
      ).toBeInTheDocument();
    });

    it("should have aria-describedby on textareas", () => {
      render(<ClinicalIntakeForm {...defaultProps} />);

      const medicationsTextarea = screen.getByLabelText(/current medications/i);
      expect(medicationsTextarea).toHaveAttribute("aria-describedby");
    });

    it("should have aria-live on character counters for screen readers", () => {
      const { container } = render(<ClinicalIntakeForm {...defaultProps} />);

      const liveRegions = container.querySelectorAll('[aria-live="polite"]');
      expect(liveRegions.length).toBe(2); // Two textareas with counters
    });

    it("should be keyboard navigable", async () => {
      const user = userEvent.setup();
      render(<ClinicalIntakeForm {...defaultProps} />);

      // Tab through form fields
      await user.tab();
      expect(screen.getByLabelText(/current medications/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/previous therapy experience/i)).toHaveFocus();
    });

    it("should have proper htmlFor on checkbox labels", () => {
      render(<ClinicalIntakeForm {...defaultProps} />);

      const anxietyLabel = screen.getByText(/anxiety/i).closest("label");
      expect(anxietyLabel).toHaveAttribute("for", "diagnosis-anxiety");
    });
  });

  describe("Initial Data", () => {
    it("should populate form with initial data when provided", () => {
      render(
        <ClinicalIntakeForm
          {...defaultProps}
          initialData={{
            currentMedications: "Adderall 10mg",
            additionalInfo: "Prefers morning sessions",
          }}
        />
      );

      expect(screen.getByLabelText(/current medications/i)).toHaveValue(
        "Adderall 10mg"
      );
      expect(screen.getByLabelText(/anything else we should know/i)).toHaveValue(
        "Prefers morning sessions"
      );
    });

    it("should pre-check diagnoses from initial data", async () => {
      render(
        <ClinicalIntakeForm
          {...defaultProps}
          initialData={{
            diagnoses: ["anxiety", "adhd"],
          }}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/anxiety/i)).toHaveAttribute(
          "data-state",
          "checked"
        );
        expect(screen.getByLabelText(/adhd/i)).toHaveAttribute(
          "data-state",
          "checked"
        );
        expect(screen.getByLabelText(/depression/i)).toHaveAttribute(
          "data-state",
          "unchecked"
        );
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty diagnoses array gracefully", () => {
      render(
        <ClinicalIntakeForm
          {...defaultProps}
          initialData={{
            diagnoses: [],
          }}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox");
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toHaveAttribute("data-state", "unchecked");
      });
    });

    it("should handle undefined initialData gracefully", () => {
      render(<ClinicalIntakeForm {...defaultProps} initialData={undefined} />);

      expect(screen.getByLabelText(/current medications/i)).toHaveValue("");
    });

    it("should call save on form submission", async () => {
      const mockSave = vi.fn();
      vi.mocked(useAutoSave).mockReturnValue({
        save: mockSave,
        saveStatus: "idle",
        lastSaved: null,
        error: null,
        retry: vi.fn(),
      });

      const user = userEvent.setup();
      render(<ClinicalIntakeForm {...defaultProps} />);

      const continueButton = screen.getByRole("button", { name: /continue/i });
      await user.click(continueButton);

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalled();
      });
    });
  });
});
