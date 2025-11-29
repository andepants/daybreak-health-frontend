/**
 * Tests for SaveExitModal component
 *
 * Validates:
 * - Modal rendering and visibility
 * - Session URL display and copy functionality
 * - Email reminder input and validation
 * - Send reminder mutation integration
 * - Accessibility and keyboard navigation
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SaveExitModal } from "@/components/layout/SaveExitModal";

/**
 * Mock navigator.clipboard API
 */
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe("SaveExitModal", () => {
  const mockOnClose = vi.fn();
  const mockSessionId = "test-session-123";
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    sessionId: mockSessionId,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders modal when isOpen is true", () => {
      render(<SaveExitModal {...defaultProps} />);

      expect(
        screen.getByText(/your progress has been saved/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/you can return anytime using this link/i)
      ).toBeInTheDocument();
    });

    it("does not render modal when isOpen is false", () => {
      render(<SaveExitModal {...defaultProps} isOpen={false} />);

      expect(
        screen.queryByText(/your progress has been saved/i)
      ).not.toBeInTheDocument();
    });

    it("displays session URL correctly", () => {
      render(<SaveExitModal {...defaultProps} />);

      const expectedUrl = `${window.location.origin}/onboarding/${mockSessionId}/assessment`;
      expect(screen.getByText(expectedUrl)).toBeInTheDocument();
    });

    it("shows email reminder section", () => {
      render(<SaveExitModal {...defaultProps} />);

      expect(
        screen.getByText(/want a reminder to come back/i)
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/email@example.com/i)).toBeInTheDocument();
    });
  });

  describe("Copy Link Functionality", () => {
    it("copies session URL to clipboard on button click", async () => {
      const user = userEvent.setup();
      render(<SaveExitModal {...defaultProps} />);

      const copyButton = screen.getByRole("button", { name: /copy link/i });
      await user.click(copyButton);

      const expectedUrl = `${window.location.origin}/onboarding/${mockSessionId}/assessment`;
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedUrl);
    });

    it("shows success feedback after copying", async () => {
      const user = userEvent.setup();
      render(<SaveExitModal {...defaultProps} />);

      const copyButton = screen.getByRole("button", { name: /copy link/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText(/copied!/i)).toBeInTheDocument();
      });
    });

    it("resets copy feedback after 2 seconds", async () => {
      const user = userEvent.setup();
      vi.useFakeTimers();

      render(<SaveExitModal {...defaultProps} />);

      const copyButton = screen.getByRole("button", { name: /copy link/i });
      await user.click(copyButton);

      expect(screen.getByText(/copied!/i)).toBeInTheDocument();

      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.getByText(/copy link/i)).toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  describe("Email Reminder", () => {
    it("pre-fills email if parentEmail is provided", () => {
      const parentEmail = "parent@example.com";
      render(<SaveExitModal {...defaultProps} parentEmail={parentEmail} />);

      const emailInput = screen.getByPlaceholderText(/email@example.com/i);
      expect(emailInput).toHaveValue(parentEmail);
    });

    it("validates email format on send", async () => {
      const user = userEvent.setup();
      render(<SaveExitModal {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText(/email@example.com/i);
      const sendButton = screen.getByRole("button", { name: /send reminder/i });

      // Enter invalid email
      await user.type(emailInput, "invalid-email");
      await user.click(sendButton);

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a valid email address/i)
        ).toBeInTheDocument();
      });
    });

    it("shows error if email is empty on send", async () => {
      const user = userEvent.setup();
      render(<SaveExitModal {...defaultProps} />);

      const sendButton = screen.getByRole("button", { name: /send reminder/i });
      await user.click(sendButton);

      await waitFor(() => {
        expect(
          screen.getByText(/please enter an email address/i)
        ).toBeInTheDocument();
      });
    });

    it("sends reminder with valid email", async () => {
      const user = userEvent.setup();
      render(<SaveExitModal {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText(/email@example.com/i);
      const sendButton = screen.getByRole("button", { name: /send reminder/i });

      await user.type(emailInput, "parent@example.com");
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/reminder sent!/i)).toBeInTheDocument();
      });
    });

    it("disables send button when sending", async () => {
      const user = userEvent.setup();
      render(<SaveExitModal {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText(/email@example.com/i);
      const sendButton = screen.getByRole("button", { name: /send reminder/i });

      await user.type(emailInput, "parent@example.com");
      await user.click(sendButton);

      expect(sendButton).toBeDisabled();
    });

    it("allows sending reminder with Enter key", async () => {
      const user = userEvent.setup();
      render(<SaveExitModal {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText(/email@example.com/i);

      await user.type(emailInput, "parent@example.com");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(screen.getByText(/reminder sent!/i)).toBeInTheDocument();
      });
    });
  });

  describe("Modal Close", () => {
    it("calls onClose when Save & Exit button is clicked", async () => {
      const user = userEvent.setup();
      render(<SaveExitModal {...defaultProps} />);

      const doneButton = screen.getByRole("button", { name: /save & exit/i });
      await user.click(doneButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("resets state when modal reopens", () => {
      const { rerender } = render(
        <SaveExitModal {...defaultProps} isOpen={false} />
      );

      rerender(
        <SaveExitModal
          {...defaultProps}
          isOpen={true}
          parentEmail="new@example.com"
        />
      );

      const emailInput = screen.getByPlaceholderText(/email@example.com/i);
      expect(emailInput).toHaveValue("new@example.com");
    });
  });

  describe("Accessibility", () => {
    it("has correct ARIA attributes", () => {
      render(<SaveExitModal {...defaultProps} />);

      // Dialog should have role and labels
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("email input has aria-invalid when error exists", async () => {
      const user = userEvent.setup();
      render(<SaveExitModal {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText(/email@example.com/i);
      const sendButton = screen.getByRole("button", { name: /send reminder/i });

      await user.type(emailInput, "invalid");
      await user.click(sendButton);

      await waitFor(() => {
        expect(emailInput).toHaveAttribute("aria-invalid", "true");
      });
    });

    it("error message is associated with email input", async () => {
      const user = userEvent.setup();
      render(<SaveExitModal {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText(/email@example.com/i);
      const sendButton = screen.getByRole("button", { name: /send reminder/i });

      await user.click(sendButton);

      await waitFor(() => {
        const errorId = emailInput.getAttribute("aria-describedby");
        expect(errorId).toBeTruthy();
        expect(screen.getByText(/please enter an email address/i)).toHaveAttribute(
          "id",
          errorId!
        );
      });
    });
  });
});
