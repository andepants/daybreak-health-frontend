/**
 * Unit tests for Confirmation component
 *
 * Tests cover:
 * - Automatic booking on mount
 * - Loading state display
 * - Success state display
 * - Error state display
 * - Retry functionality
 * - Done button functionality
 * - Cancel/Go back functionality
 *
 * Acceptance Criteria Tested:
 * - AC-5.4.1: Loading state shows "Booking your appointment..."
 * - AC-5.4.2: Success state renders with celebration
 * - AC-5.4.4: Done button navigates appropriately
 */

import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Confirmation } from "@/features/scheduling/Confirmation";
import type { BookingRequest } from "@/features/scheduling/Confirmation";
import * as useBookingModule from "@/features/scheduling/useBooking";
import type { AppointmentData } from "@/features/scheduling/BookingSuccess";

// Mock Next.js router
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

// Mock useBooking hook
const mockBookAppointment = vi.fn();
vi.mock("@/features/scheduling/useBooking", () => ({
  useBooking: vi.fn(),
}));

// Mock confetti utilities
vi.mock("@/lib/utils/confetti", () => ({
  celebrateBooking: vi.fn(),
  clearConfetti: vi.fn(),
}));

describe("Confirmation", () => {
  const mockBookingRequest: BookingRequest = {
    sessionId: "session-123",
    therapistId: "therapist-456",
    startTime: "2024-01-15T14:00:00Z",
    endTime: "2024-01-15T14:50:00Z",
    duration: 50,
    timezone: "America/New_York",
  };

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

  describe("Loading State (AC-5.4.1)", () => {
    it("should show loading state initially", () => {
      vi.mocked(useBookingModule.useBooking).mockReturnValue({
        bookAppointment: mockBookAppointment,
        loading: true,
        error: undefined,
        appointment: null,
        emailConfirmation: null,
      });

      render(<Confirmation bookingRequest={mockBookingRequest} />);

      expect(screen.getByText("Booking your appointment...")).toBeInTheDocument();
      expect(screen.getByText("This will only take a moment")).toBeInTheDocument();
    });

    it("should have accessible loading state", () => {
      vi.mocked(useBookingModule.useBooking).mockReturnValue({
        bookAppointment: mockBookAppointment,
        loading: true,
        error: undefined,
        appointment: null,
        emailConfirmation: null,
      });

      render(<Confirmation bookingRequest={mockBookingRequest} />);

      const loadingState = screen.getByRole("status");
      expect(loadingState).toHaveAttribute("aria-live", "polite");
      expect(loadingState).toHaveAttribute("aria-label", "Booking appointment");
    });

    it("should show loading spinner", () => {
      vi.mocked(useBookingModule.useBooking).mockReturnValue({
        bookAppointment: mockBookAppointment,
        loading: true,
        error: undefined,
        appointment: null,
        emailConfirmation: null,
      });

      const { container } = render(
        <Confirmation bookingRequest={mockBookingRequest} />
      );

      const spinner = container.querySelector('[class*="animate-spin"]');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("Automatic Booking on Mount", () => {
    it("should trigger booking mutation on mount", async () => {
      vi.mocked(useBookingModule.useBooking).mockReturnValue({
        bookAppointment: mockBookAppointment,
        loading: false,
        error: undefined,
        appointment: null,
        emailConfirmation: null,
      });

      render(<Confirmation bookingRequest={mockBookingRequest} />);

      await waitFor(() => {
        expect(mockBookAppointment).toHaveBeenCalledTimes(1);
        expect(mockBookAppointment).toHaveBeenCalledWith({
          sessionId: "session-123",
          therapistId: "therapist-456",
          startTime: "2024-01-15T14:00:00Z",
          endTime: "2024-01-15T14:50:00Z",
          duration: 50,
          timezone: "America/New_York",
        });
      });
    });

    it("should only trigger booking once", async () => {
      vi.mocked(useBookingModule.useBooking).mockReturnValue({
        bookAppointment: mockBookAppointment,
        loading: false,
        error: undefined,
        appointment: null,
        emailConfirmation: null,
      });

      const { rerender } = render(
        <Confirmation bookingRequest={mockBookingRequest} />
      );

      // Rerender component
      rerender(<Confirmation bookingRequest={mockBookingRequest} />);

      await waitFor(() => {
        expect(mockBookAppointment).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Success State (AC-5.4.2)", () => {
    it("should show success component when appointment is booked", () => {
      vi.mocked(useBookingModule.useBooking).mockReturnValue({
        bookAppointment: mockBookAppointment,
        loading: false,
        error: undefined,
        appointment: mockAppointment,
        emailConfirmation: null,
      });

      render(<Confirmation bookingRequest={mockBookingRequest} />);

      expect(screen.getByText("You're all set!")).toBeInTheDocument();
      expect(screen.getByText("Dr. Sarah Johnson")).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    const mockError = new Error("Network error");

    it("should show error state when booking fails", () => {
      vi.mocked(useBookingModule.useBooking).mockReturnValue({
        bookAppointment: mockBookAppointment,
        loading: false,
        error: mockError as any,
        appointment: null,
        emailConfirmation: null,
      });

      render(<Confirmation bookingRequest={mockBookingRequest} />);

      expect(screen.getByText("Booking Failed")).toBeInTheDocument();
      expect(
        screen.getByText(/We couldn't complete your appointment booking/i)
      ).toBeInTheDocument();
    });

    it("should show retry button on error", () => {
      vi.mocked(useBookingModule.useBooking).mockReturnValue({
        bookAppointment: mockBookAppointment,
        loading: false,
        error: mockError as any,
        appointment: null,
        emailConfirmation: null,
      });

      render(<Confirmation bookingRequest={mockBookingRequest} />);

      expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    });

    it("should show go back button on error", () => {
      vi.mocked(useBookingModule.useBooking).mockReturnValue({
        bookAppointment: mockBookAppointment,
        loading: false,
        error: mockError as any,
        appointment: null,
        emailConfirmation: null,
      });

      render(<Confirmation bookingRequest={mockBookingRequest} />);

      expect(screen.getByRole("button", { name: /go back/i })).toBeInTheDocument();
    });

    it("should show support contact on error", () => {
      vi.mocked(useBookingModule.useBooking).mockReturnValue({
        bookAppointment: mockBookAppointment,
        loading: false,
        error: mockError as any,
        appointment: null,
        emailConfirmation: null,
      });

      render(<Confirmation bookingRequest={mockBookingRequest} />);

      const supportLink = screen.getByRole("link", { name: /contact support/i });
      expect(supportLink).toHaveAttribute("href", "mailto:support@daybreakhealth.com");
    });

    it("should show error message in development mode", () => {
      vi.stubEnv("NODE_ENV", "development");

      vi.mocked(useBookingModule.useBooking).mockReturnValue({
        bookAppointment: mockBookAppointment,
        loading: false,
        error: mockError as any,
        appointment: null,
        emailConfirmation: null,
      });

      render(<Confirmation bookingRequest={mockBookingRequest} />);

      expect(screen.getByText("Network error")).toBeInTheDocument();

      vi.unstubAllEnvs();
    });

    it("should hide error details in production mode", () => {
      vi.stubEnv("NODE_ENV", "production");

      vi.mocked(useBookingModule.useBooking).mockReturnValue({
        bookAppointment: mockBookAppointment,
        loading: false,
        error: mockError as any,
        appointment: null,
        emailConfirmation: null,
      });

      render(<Confirmation bookingRequest={mockBookingRequest} />);

      expect(screen.queryByText("Network error")).not.toBeInTheDocument();

      vi.unstubAllEnvs();
    });
  });

  describe("Retry Functionality", () => {
    it("should retry booking when Try Again is clicked", async () => {
      const mockError = new Error("Network error");

      vi.mocked(useBookingModule.useBooking).mockReturnValue({
        bookAppointment: mockBookAppointment,
        loading: false,
        error: mockError as any,
        appointment: null,
        emailConfirmation: null,
      });

      render(<Confirmation bookingRequest={mockBookingRequest} />);

      const retryButton = screen.getByRole("button", { name: /try again/i });
      retryButton.click();

      await waitFor(() => {
        // Should be called twice: once on mount, once on retry
        expect(mockBookAppointment).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Cancel Functionality", () => {
    it("should go back when Go Back is clicked", () => {
      const mockError = new Error("Network error");

      vi.mocked(useBookingModule.useBooking).mockReturnValue({
        bookAppointment: mockBookAppointment,
        loading: false,
        error: mockError as any,
        appointment: null,
        emailConfirmation: null,
      });

      render(<Confirmation bookingRequest={mockBookingRequest} />);

      const backButton = screen.getByRole("button", { name: /go back/i });
      backButton.click();

      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("Done Functionality (AC-5.4.4)", () => {
    it("should navigate to default URL when done is clicked", () => {
      vi.mocked(useBookingModule.useBooking).mockReturnValue({
        bookAppointment: mockBookAppointment,
        loading: false,
        error: undefined,
        appointment: mockAppointment,
        emailConfirmation: null,
      });

      render(<Confirmation bookingRequest={mockBookingRequest} />);

      const doneButton = screen.getByRole("button", { name: /done/i });
      doneButton.click();

      expect(mockPush).toHaveBeenCalledWith("/");
    });

    it("should navigate to custom return URL when provided", () => {
      vi.mocked(useBookingModule.useBooking).mockReturnValue({
        bookAppointment: mockBookAppointment,
        loading: false,
        error: undefined,
        appointment: mockAppointment,
        emailConfirmation: null,
      });

      render(
        <Confirmation
          bookingRequest={mockBookingRequest}
          returnUrl="/dashboard"
        />
      );

      const doneButton = screen.getByRole("button", { name: /done/i });
      doneButton.click();

      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    it("should call onComplete callback when provided", () => {
      const mockOnComplete = vi.fn();

      vi.mocked(useBookingModule.useBooking).mockReturnValue({
        bookAppointment: mockBookAppointment,
        loading: false,
        error: undefined,
        appointment: mockAppointment,
        emailConfirmation: null,
      });

      render(
        <Confirmation
          bookingRequest={mockBookingRequest}
          onComplete={mockOnComplete}
        />
      );

      const doneButton = screen.getByRole("button", { name: /done/i });
      doneButton.click();

      expect(mockOnComplete).toHaveBeenCalledTimes(1);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing optional booking request fields", async () => {
      const minimalBookingRequest: BookingRequest = {
        sessionId: "session-123",
        therapistId: "therapist-456",
        startTime: "2024-01-15T14:00:00Z",
        endTime: "2024-01-15T14:50:00Z",
      };

      vi.mocked(useBookingModule.useBooking).mockReturnValue({
        bookAppointment: mockBookAppointment,
        loading: false,
        error: undefined,
        appointment: null,
        emailConfirmation: null,
      });

      render(<Confirmation bookingRequest={minimalBookingRequest} />);

      await waitFor(() => {
        expect(mockBookAppointment).toHaveBeenCalledWith({
          sessionId: "session-123",
          therapistId: "therapist-456",
          startTime: "2024-01-15T14:00:00Z",
          endTime: "2024-01-15T14:50:00Z",
          duration: undefined,
          timezone: undefined,
        });
      });
    });
  });
});
