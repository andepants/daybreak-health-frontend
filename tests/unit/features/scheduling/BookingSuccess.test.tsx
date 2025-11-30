/**
 * Unit tests for BookingSuccess component
 *
 * Tests cover:
 * - Success celebration rendering
 * - Confetti animation trigger
 * - Appointment details display
 * - Calendar links rendering
 * - What's next section
 * - Done button functionality
 * - Accessibility features
 *
 * Acceptance Criteria Tested:
 * - AC-5.4.2: Success state displays celebration, appointment details, and next steps
 */

import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BookingSuccess } from "@/features/scheduling/BookingSuccess";
import type { AppointmentData } from "@/features/scheduling/BookingSuccess";
import * as confettiUtils from "@/lib/utils/confetti";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock confetti utilities
vi.mock("@/lib/utils/confetti", () => ({
  celebrateBooking: vi.fn(),
  clearConfetti: vi.fn(),
}));

describe("BookingSuccess", () => {
  const mockAppointment: AppointmentData = {
    id: "appt-123",
    therapist: {
      id: "therapist-456",
      name: "Dr. Sarah Johnson",
      credentials: "PhD, LMFT",
      photoUrl: "/therapists/sarah.jpg",
    },
    startTime: "2024-01-15T14:00:00Z",
    endTime: "2024-01-15T14:50:00Z",
    duration: 50,
    meetingUrl: "https://daybreak.health/meet/abc123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering (AC-5.4.2)", () => {
    it("should render success heading", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      expect(screen.getByText("You're all set!")).toBeInTheDocument();
    });

    it("should render confirmation message", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      expect(
        screen.getByText("Your appointment has been confirmed")
      ).toBeInTheDocument();
    });

    it("should render success icon", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      const icon = document.querySelector('[class*="CheckCircle"]');
      expect(icon).toBeInTheDocument();
    });

    it("should render done button", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      expect(screen.getByRole("button", { name: /done/i })).toBeInTheDocument();
    });

    it("should render footer message", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      expect(
        screen.getByText(/We're excited to support your family on this journey/i)
      ).toBeInTheDocument();
    });
  });

  describe("Confetti Animation", () => {
    it("should trigger confetti celebration on mount", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      expect(confettiUtils.celebrateBooking).toHaveBeenCalledTimes(1);
    });

    it("should clear confetti on unmount", () => {
      const { unmount } = render(<BookingSuccess appointment={mockAppointment} />);

      unmount();

      expect(confettiUtils.clearConfetti).toHaveBeenCalledTimes(1);
    });
  });

  describe("Appointment Details", () => {
    it("should render therapist name", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      expect(screen.getByText("Dr. Sarah Johnson")).toBeInTheDocument();
    });

    it("should render therapist credentials", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      expect(screen.getByText("PhD, LMFT")).toBeInTheDocument();
    });

    it("should render appointment date and time", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      // Date formatting: "Monday, January 15 at 2:00 PM"
      expect(screen.getByText(/January 15/i)).toBeInTheDocument();
    });

    it("should render duration", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      expect(screen.getByText("50 minutes")).toBeInTheDocument();
    });

    it("should render video call badge", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      expect(screen.getByText("Video Call")).toBeInTheDocument();
    });
  });

  describe("Calendar Links", () => {
    it("should render calendar section heading", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      expect(screen.getByText("Add to your calendar")).toBeInTheDocument();
    });

    it("should render Google Calendar button", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      expect(screen.getByText("Google Calendar")).toBeInTheDocument();
    });

    it("should render Apple Calendar button", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      expect(screen.getByText("Apple Calendar")).toBeInTheDocument();
    });

    it("should render Outlook button", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      expect(screen.getByText("Outlook")).toBeInTheDocument();
    });
  });

  describe("What's Next Section", () => {
    it("should render What's Next heading", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      expect(screen.getByText("What's next?")).toBeInTheDocument();
    });

    it("should mention email confirmation", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      expect(screen.getByText(/Check your email/i)).toBeInTheDocument();
      expect(
        screen.getByText(/confirmation email has been sent/i)
      ).toBeInTheDocument();
    });

    it("should mention join link timing", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      expect(screen.getByText(/Join link coming soon/i)).toBeInTheDocument();
      expect(
        screen.getByText(/24 hours before your appointment/i)
      ).toBeInTheDocument();
    });

    it("should mention flexible scheduling", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      expect(screen.getByText(/Flexible scheduling/i)).toBeInTheDocument();
      expect(
        screen.getByText(/reschedule or cancel anytime/i)
      ).toBeInTheDocument();
    });

    it("should render support contact", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      const supportLink = screen.getByRole("link", {
        name: /support@daybreakhealth.com/i,
      });
      expect(supportLink).toBeInTheDocument();
      expect(supportLink).toHaveAttribute(
        "href",
        "mailto:support@daybreakhealth.com"
      );
    });
  });

  describe("Done Button Functionality (AC-5.4.4)", () => {
    it("should navigate to default return URL when clicked", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      const doneButton = screen.getByRole("button", { name: /done/i });
      fireEvent.click(doneButton);

      expect(mockPush).toHaveBeenCalledWith("/");
    });

    it("should navigate to custom return URL when provided", () => {
      render(
        <BookingSuccess
          appointment={mockAppointment}
          returnUrl="/dashboard"
        />
      );

      const doneButton = screen.getByRole("button", { name: /done/i });
      fireEvent.click(doneButton);

      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    it("should call onDone callback when provided", () => {
      const mockOnDone = vi.fn();

      render(
        <BookingSuccess appointment={mockAppointment} onDone={mockOnDone} />
      );

      const doneButton = screen.getByRole("button", { name: /done/i });
      fireEvent.click(doneButton);

      expect(mockOnDone).toHaveBeenCalledTimes(1);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have screen reader announcement for success", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      const announcement = screen.getByRole("status");
      expect(announcement).toHaveTextContent("Appointment successfully booked");
      expect(announcement).toHaveAttribute("aria-live", "polite");
    });

    it("should have semantic heading hierarchy", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      const mainHeading = screen.getByRole("heading", {
        level: 1,
        name: /You're all set!/i,
      });
      expect(mainHeading).toBeInTheDocument();

      const whatNextHeading = screen.getByRole("heading", {
        level: 3,
        name: /What's next?/i,
      });
      expect(whatNextHeading).toBeInTheDocument();
    });

    it("should have accessible therapist image alt text", () => {
      render(<BookingSuccess appointment={mockAppointment} />);

      const therapistImage = screen.getByAltText(
        "Dr. Sarah Johnson, PhD, LMFT"
      );
      expect(therapistImage).toBeInTheDocument();
    });

    it("should hide decorative icons from screen readers", () => {
      const { container } = render(
        <BookingSuccess appointment={mockAppointment} />
      );

      const decorativeIcons = container.querySelectorAll('[aria-hidden="true"]');
      expect(decorativeIcons.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing meeting URL", () => {
      const appointmentWithoutUrl: AppointmentData = {
        ...mockAppointment,
        meetingUrl: undefined,
      };

      render(<BookingSuccess appointment={appointmentWithoutUrl} />);

      // Should still render successfully
      expect(screen.getByText("You're all set!")).toBeInTheDocument();
    });

    it("should handle missing therapist photo", () => {
      const appointmentWithoutPhoto: AppointmentData = {
        ...mockAppointment,
        therapist: {
          ...mockAppointment.therapist,
          photoUrl: null,
        },
      };

      render(<BookingSuccess appointment={appointmentWithoutPhoto} />);

      // Should render initials instead
      expect(screen.getByText("SJ")).toBeInTheDocument();
    });

    it("should handle default duration when not provided", () => {
      const appointmentWithoutDuration: AppointmentData = {
        ...mockAppointment,
        duration: undefined,
      };

      render(<BookingSuccess appointment={appointmentWithoutDuration} />);

      // Should default to 50 minutes
      expect(screen.getByText("50 minutes")).toBeInTheDocument();
    });
  });
});
