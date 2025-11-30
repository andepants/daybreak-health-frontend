/**
 * Unit tests for SessionDetails component
 *
 * Tests cover:
 * - Therapist name and photo display
 * - "First session with [therapist]" text
 * - Session duration display (50 minutes)
 * - Video call badge
 * - Timezone display and selector
 * - Timezone change callback
 * - Confirmation email note
 * - Accessibility (alt text, ARIA labels)
 * - Fallback avatar with initials
 *
 * Acceptance Criteria Tested:
 * - AC-5.3.7: Session details show therapist name and duration
 * - AC-5.3.8: Timezone is displayed and editable
 */

import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SessionDetails } from "@/features/scheduling/SessionDetails";

// Mock TimezoneSelector since it's tested separately
vi.mock("@/features/scheduling/TimezoneSelector", () => ({
  TimezoneSelector: ({ value, onChange, label }: any) => (
    <div data-testid="timezone-selector">
      <label>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        aria-label="Select timezone"
      >
        <option value="America/New_York">Eastern Time</option>
        <option value="America/Los_Angeles">Pacific Time</option>
      </select>
    </div>
  ),
}));

describe("SessionDetails", () => {
  const mockOnTimezoneChange = vi.fn();

  const defaultProps = {
    therapistName: "Dr. Sarah Chen",
    therapistPhotoUrl: "https://example.com/sarah.jpg",
    sessionDuration: 50,
    sessionType: "video" as const,
    timezone: "America/New_York",
    onTimezoneChange: mockOnTimezoneChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering (AC-5.3.7)", () => {
    it("should render session details header", () => {
      render(<SessionDetails {...defaultProps} />);

      expect(screen.getByText("Session Details")).toBeInTheDocument();
    });

    it('should render "First session with" text', () => {
      render(<SessionDetails {...defaultProps} />);

      expect(screen.getByText("First session with")).toBeInTheDocument();
    });

    it("should render therapist name", () => {
      render(<SessionDetails {...defaultProps} />);

      expect(screen.getByText("Dr. Sarah Chen")).toBeInTheDocument();
    });

    it("should render therapist photo with proper alt text", () => {
      render(<SessionDetails {...defaultProps} />);

      const image = screen.getByAltText("Dr. Sarah Chen");
      expect(image).toBeInTheDocument();
    });

    it("should render session duration", () => {
      render(<SessionDetails {...defaultProps} />);

      expect(screen.getByText("50 minutes")).toBeInTheDocument();
      expect(screen.getByText("Session duration")).toBeInTheDocument();
    });

    it("should render custom session duration", () => {
      render(<SessionDetails {...defaultProps} sessionDuration={60} />);

      expect(screen.getByText("60 minutes")).toBeInTheDocument();
    });
  });

  describe("Session Type Badge (AC-5.3.7)", () => {
    it("should render Video Call badge by default", () => {
      render(<SessionDetails {...defaultProps} />);

      expect(screen.getByText("Video Call")).toBeInTheDocument();
    });

    it("should render Phone Call badge when sessionType is phone", () => {
      render(<SessionDetails {...defaultProps} sessionType="phone" />);

      expect(screen.getByText("Phone Call")).toBeInTheDocument();
    });

    it("should render In-Person badge when sessionType is in-person", () => {
      render(<SessionDetails {...defaultProps} sessionType="in-person" />);

      expect(screen.getByText("In-Person")).toBeInTheDocument();
    });

    it("should show badge with teal styling", () => {
      render(<SessionDetails {...defaultProps} />);

      const badge = screen.getByText("Video Call");

      // Badge should have teal background
      expect(badge).toHaveClass("bg-daybreak-teal/10");
      expect(badge).toHaveClass("text-daybreak-teal");
    });
  });

  describe("Therapist Photo", () => {
    it("should render therapist photo when URL provided", () => {
      render(<SessionDetails {...defaultProps} />);

      const image = screen.getByAltText("Dr. Sarah Chen");
      expect(image).toHaveAttribute("src");
    });

    it("should render initials when no photo URL provided", () => {
      render(
        <SessionDetails {...defaultProps} therapistPhotoUrl={undefined} />
      );

      expect(
        screen.getByLabelText("Dr. Sarah Chen initials")
      ).toBeInTheDocument();
      expect(screen.getByText("DSC")).toBeInTheDocument();
    });

    it("should extract correct initials from multi-word names", () => {
      render(
        <SessionDetails
          {...defaultProps}
          therapistName="John Michael Smith"
          therapistPhotoUrl={undefined}
        />
      );

      // Should take first two initials
      expect(screen.getByText("JM")).toBeInTheDocument();
    });

    it("should handle single-word names", () => {
      render(
        <SessionDetails
          {...defaultProps}
          therapistName="Madonna"
          therapistPhotoUrl={undefined}
        />
      );

      expect(screen.getByText("M")).toBeInTheDocument();
    });
  });

  describe("Timezone Section (AC-5.3.8)", () => {
    it("should render timezone selector by default", () => {
      render(<SessionDetails {...defaultProps} />);

      expect(screen.getByTestId("timezone-selector")).toBeInTheDocument();
    });

    it("should hide timezone selector when showTimezoneSelector is false", () => {
      render(
        <SessionDetails {...defaultProps} showTimezoneSelector={false} />
      );

      expect(
        screen.queryByTestId("timezone-selector")
      ).not.toBeInTheDocument();
    });

    it("should pass timezone value to TimezoneSelector", () => {
      render(<SessionDetails {...defaultProps} timezone="America/New_York" />);

      const select = screen.getByLabelText("Select timezone");
      expect(select).toHaveValue("America/New_York");
    });

    it("should call onTimezoneChange when timezone is changed", () => {
      render(<SessionDetails {...defaultProps} />);

      const select = screen.getByLabelText("Select timezone");
      fireEvent.change(select, { target: { value: "America/Los_Angeles" } });

      expect(mockOnTimezoneChange).toHaveBeenCalledWith(
        "America/Los_Angeles"
      );
    });

    it("should work without onTimezoneChange callback", () => {
      render(
        <SessionDetails {...defaultProps} onTimezoneChange={undefined} />
      );

      // Should render without errors
      expect(screen.getByTestId("timezone-selector")).toBeInTheDocument();
    });
  });

  describe("Confirmation Email Note", () => {
    it("should show confirmation email message", () => {
      render(<SessionDetails {...defaultProps} />);

      expect(
        screen.getByText(
          /You will receive a confirmation email with meeting details after booking/i
        )
      ).toBeInTheDocument();
    });
  });

  describe("Icons", () => {
    it("should render clock icon for duration", () => {
      const { container } = render(<SessionDetails {...defaultProps} />);

      // Look for Clock icon (lucide-react)
      const clockIcons = container.querySelectorAll('svg');
      expect(clockIcons.length).toBeGreaterThan(0);
    });

    it("should render Video icon for video session type", () => {
      const { container } = render(
        <SessionDetails {...defaultProps} sessionType="video" />
      );

      // Should have Video icon
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe("Layout", () => {
    it("should render therapist info in flex layout", () => {
      const { container } = render(<SessionDetails {...defaultProps} />);

      // Find flex container with therapist info
      const flexDiv = container.querySelector(".flex.items-center.gap-4");
      expect(flexDiv).toBeInTheDocument();
    });

    it("should render metadata in vertical stack", () => {
      const { container } = render(<SessionDetails {...defaultProps} />);

      const metadataDiv = container.querySelector(".space-y-3");
      expect(metadataDiv).toBeInTheDocument();
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <SessionDetails {...defaultProps} className="custom-details-class" />
      );

      const detailsDiv = container.querySelector(".custom-details-class");
      expect(detailsDiv).toBeInTheDocument();
    });

    it("should have card styling with border and shadow", () => {
      const { container } = render(<SessionDetails {...defaultProps} />);

      const card = container.firstChild;
      expect(card).toHaveClass("rounded-lg");
      expect(card).toHaveClass("border");
      expect(card).toHaveClass("bg-white");
      expect(card).toHaveClass("shadow-sm");
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      render(<SessionDetails {...defaultProps} />);

      // Should have h2 for main heading
      const h2 = screen.getByRole("heading", { level: 2 });
      expect(h2).toHaveTextContent("Session Details");

      // Should have h3 for therapist name
      const h3 = screen.getByRole("heading", { level: 3 });
      expect(h3).toHaveTextContent("Dr. Sarah Chen");
    });

    it("should have alt text for therapist photo", () => {
      render(<SessionDetails {...defaultProps} />);

      const image = screen.getByAltText("Dr. Sarah Chen");
      expect(image).toBeInTheDocument();
    });

    it("should have aria-label for initials fallback", () => {
      render(
        <SessionDetails {...defaultProps} therapistPhotoUrl={undefined} />
      );

      const initialsDiv = screen.getByLabelText("Dr. Sarah Chen initials");
      expect(initialsDiv).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long therapist names", () => {
      const longName = "Dr. Elizabeth Alexandra Mary Windsor-Mountbatten";
      render(<SessionDetails {...defaultProps} therapistName={longName} />);

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it("should handle missing session duration", () => {
      render(
        <SessionDetails
          {...defaultProps}
          sessionDuration={undefined as any}
        />
      );

      // Should use default of 50 minutes
      expect(screen.getByText("50 minutes")).toBeInTheDocument();
    });

    it("should handle missing session type", () => {
      render(<SessionDetails {...defaultProps} sessionType={undefined as any} />);

      // Should default to "Video Call"
      expect(screen.getByText("Video Call")).toBeInTheDocument();
    });

    it("should handle empty therapist name gracefully", () => {
      render(<SessionDetails {...defaultProps} therapistName="" />);

      // Should still render without crashing
      expect(screen.getByText("First session with")).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("should have responsive padding", () => {
      const { container } = render(<SessionDetails {...defaultProps} />);

      const card = container.firstChild;
      expect(card).toHaveClass("p-6");
    });

    it("should handle small photo size", () => {
      render(<SessionDetails {...defaultProps} />);

      const image = screen.getByAltText("Dr. Sarah Chen");
      // Next.js Image sets width/height attributes
      expect(image).toHaveAttribute("width", "64");
      expect(image).toHaveAttribute("height", "64");
    });
  });
});
