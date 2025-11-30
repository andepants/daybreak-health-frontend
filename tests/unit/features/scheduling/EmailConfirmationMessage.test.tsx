/**
 * EmailConfirmationMessage Component Tests
 *
 * Tests for email confirmation status display component.
 *
 * Test Coverage:
 * - Success state display
 * - Pending state display
 * - Failed state display
 * - Accessibility requirements
 * - PHI protection (no sensitive data logged)
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  EmailConfirmationMessage,
  type EmailConfirmationStatus,
} from "@/features/scheduling/EmailConfirmationMessage";

describe("EmailConfirmationMessage", () => {
  describe("AC-5.5.4: Email Confirmation Display", () => {
    it("should display success message when email is sent", () => {
      const emailConfirmation: EmailConfirmationStatus = {
        emailSent: true,
        emailStatus: "sent",
        recipientEmail: "parent@example.com",
      };

      render(<EmailConfirmationMessage emailConfirmation={emailConfirmation} />);

      expect(
        screen.getByText(/confirmation email sent to/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/parent@example.com/i)).toBeInTheDocument();
    });

    it("should use userEmail fallback when recipientEmail is not provided", () => {
      const emailConfirmation: EmailConfirmationStatus = {
        emailSent: true,
        emailStatus: "sent",
      };

      render(
        <EmailConfirmationMessage
          emailConfirmation={emailConfirmation}
          userEmail="fallback@example.com"
        />
      );

      expect(screen.getByText(/fallback@example.com/i)).toBeInTheDocument();
    });

    it("should display generic message when no email is available", () => {
      const emailConfirmation: EmailConfirmationStatus = {
        emailSent: true,
        emailStatus: "sent",
      };

      render(<EmailConfirmationMessage emailConfirmation={emailConfirmation} />);

      expect(screen.getByText(/your email/i)).toBeInTheDocument();
    });
  });

  describe("AC-5.5.5: Email Failure Handling", () => {
    it("should display pending message when emailStatus is pending", () => {
      const emailConfirmation: EmailConfirmationStatus = {
        emailSent: false,
        emailStatus: "pending",
        recipientEmail: "parent@example.com",
      };

      render(<EmailConfirmationMessage emailConfirmation={emailConfirmation} />);

      expect(
        screen.getByText(/confirmation email is being sent/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/check parent@example.com in a few moments/i)
      ).toBeInTheDocument();
    });

    it("should display failure message when emailSent is false", () => {
      const emailConfirmation: EmailConfirmationStatus = {
        emailSent: false,
        emailStatus: "failed",
      };

      render(<EmailConfirmationMessage emailConfirmation={emailConfirmation} />);

      expect(screen.getByText(/email confirmation pending/i)).toBeInTheDocument();
      expect(screen.getByText(/your appointment is confirmed!/i)).toBeInTheDocument();
    });

    it("should display support contact in failure state", () => {
      const emailConfirmation: EmailConfirmationStatus = {
        emailSent: false,
        emailStatus: "failed",
      };

      render(<EmailConfirmationMessage emailConfirmation={emailConfirmation} />);

      const supportLink = screen.getByRole("link", { name: /contact support/i });
      expect(supportLink).toBeInTheDocument();
      expect(supportLink).toHaveAttribute(
        "href",
        "mailto:support@daybreakhealth.com"
      );
    });

    it("should handle unknown status gracefully", () => {
      const emailConfirmation: EmailConfirmationStatus = {
        emailSent: true,
        emailStatus: "unknown",
      };

      render(<EmailConfirmationMessage emailConfirmation={emailConfirmation} />);

      // Should render fallback message
      expect(
        screen.getByText(/confirmation email will be sent/i)
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA role for success state", () => {
      const emailConfirmation: EmailConfirmationStatus = {
        emailSent: true,
        emailStatus: "sent",
        recipientEmail: "parent@example.com",
      };

      const { container } = render(
        <EmailConfirmationMessage emailConfirmation={emailConfirmation} />
      );

      const alert = container.querySelector('[role="status"]');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute("aria-live", "polite");
    });

    it("should have proper ARIA role for pending state", () => {
      const emailConfirmation: EmailConfirmationStatus = {
        emailSent: false,
        emailStatus: "pending",
      };

      const { container } = render(
        <EmailConfirmationMessage emailConfirmation={emailConfirmation} />
      );

      const alert = container.querySelector('[role="status"]');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute("aria-live", "polite");
    });

    it("should have proper ARIA role for failed state", () => {
      const emailConfirmation: EmailConfirmationStatus = {
        emailSent: false,
        emailStatus: "failed",
      };

      const { container } = render(
        <EmailConfirmationMessage emailConfirmation={emailConfirmation} />
      );

      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute("aria-live", "assertive");
    });

    it("should mark icons as aria-hidden", () => {
      const emailConfirmation: EmailConfirmationStatus = {
        emailSent: true,
        emailStatus: "sent",
      };

      const { container } = render(
        <EmailConfirmationMessage emailConfirmation={emailConfirmation} />
      );

      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute("aria-hidden", "true");
    });

    it("should have keyboard accessible support link", () => {
      const emailConfirmation: EmailConfirmationStatus = {
        emailSent: false,
        emailStatus: "failed",
      };

      render(<EmailConfirmationMessage emailConfirmation={emailConfirmation} />);

      const supportLink = screen.getByRole("link", { name: /contact support/i });
      expect(supportLink).toBeVisible();
      // Link should be focusable by default
      supportLink.focus();
      expect(supportLink).toHaveFocus();
    });
  });

  describe("Visual States", () => {
    it("should apply success styling for sent state", () => {
      const emailConfirmation: EmailConfirmationStatus = {
        emailSent: true,
        emailStatus: "sent",
      };

      const { container } = render(
        <EmailConfirmationMessage emailConfirmation={emailConfirmation} />
      );

      const alert = container.querySelector('[role="status"]');
      expect(alert).toHaveClass("bg-green-50", "border-green-200");
    });

    it("should apply pending styling for pending state", () => {
      const emailConfirmation: EmailConfirmationStatus = {
        emailSent: false,
        emailStatus: "pending",
      };

      const { container } = render(
        <EmailConfirmationMessage emailConfirmation={emailConfirmation} />
      );

      const alert = container.querySelector('[role="status"]');
      expect(alert).toHaveClass("bg-blue-50", "border-blue-200");
    });

    it("should apply warning styling for failed state", () => {
      const emailConfirmation: EmailConfirmationStatus = {
        emailSent: false,
        emailStatus: "failed",
      };

      const { container } = render(
        <EmailConfirmationMessage emailConfirmation={emailConfirmation} />
      );

      const alert = container.querySelector('[role="alert"]');
      expect(alert).toHaveClass("bg-orange-50", "border-orange-200");
    });
  });

  describe("Edge Cases", () => {
    it("should not render when emailConfirmation is null", () => {
      const { container } = render(
        <EmailConfirmationMessage emailConfirmation={null} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should handle empty recipientEmail gracefully", () => {
      const emailConfirmation: EmailConfirmationStatus = {
        emailSent: true,
        emailStatus: "sent",
        recipientEmail: "",
      };

      render(
        <EmailConfirmationMessage
          emailConfirmation={emailConfirmation}
          userEmail="fallback@example.com"
        />
      );

      // Should use fallback since recipientEmail is empty
      expect(screen.getByText(/fallback@example.com/i)).toBeInTheDocument();
    });

    it("should handle pending state without email address", () => {
      const emailConfirmation: EmailConfirmationStatus = {
        emailSent: false,
        emailStatus: "pending",
      };

      render(<EmailConfirmationMessage emailConfirmation={emailConfirmation} />);

      expect(
        screen.getByText(/confirmation email is being sent/i)
      ).toBeInTheDocument();
      // Should not show specific email message when no email available
      expect(screen.queryByText(/check.*in a few moments/i)).not.toBeInTheDocument();
    });
  });

  describe("PHI Protection", () => {
    it("should not log email addresses to console", () => {
      const consoleSpy = vi.spyOn(console, "log");

      const emailConfirmation: EmailConfirmationStatus = {
        emailSent: true,
        emailStatus: "sent",
        recipientEmail: "parent@example.com",
      };

      render(<EmailConfirmationMessage emailConfirmation={emailConfirmation} />);

      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("parent@example.com")
      );

      consoleSpy.mockRestore();
    });
  });
});
