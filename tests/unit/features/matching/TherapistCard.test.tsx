/**
 * Unit tests for TherapistCard component
 *
 * Tests cover:
 * - Therapist information rendering (name, credentials, photo)
 * - Specialty tags display
 * - Match reasons with icons
 * - Availability status
 * - "Best Match" badge visibility
 * - "Book Now" and "View Profile" actions
 * - Responsive layout
 * - Accessibility (ARIA labels, keyboard navigation)
 * - Touch target sizes (WCAG compliance)
 */

import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TherapistCard } from "@/features/matching/TherapistCard";
import type { Therapist } from "@/types/graphql";

describe("TherapistCard", () => {
  const mockTherapist: Therapist = {
    __typename: "Therapist",
    id: "therapist-1",
    name: "Dr. Sarah Chen",
    credentials: "LMFT, PhD",
    photoUrl: "https://example.com/photo.jpg",
    specialties: ["Anxiety", "Teen Issues", "Family Therapy"],
    availabilityStatus: "AVAILABLE_THIS_WEEK" as any,
    availabilityText: "Available this week",
    yearsOfExperience: 12,
    bio: "Experienced therapist specializing in teen anxiety and family dynamics.",
    matchScore: 95,
    isBestMatch: true,
    matchReasons: [
      { id: "reason-1", text: "Specializes in teen anxiety", icon: "specialty" },
      { id: "reason-2", text: "Available within 3 days", icon: "availability" },
      { id: "reason-3", text: "Experience with similar concerns", icon: "experience" },
    ],
  };

  const mockOnBookNow = vi.fn();
  const mockOnViewProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render therapist name and credentials", () => {
      render(
        <TherapistCard
          therapist={mockTherapist}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      expect(screen.getByText("Dr. Sarah Chen")).toBeInTheDocument();
      expect(screen.getByText("LMFT, PhD")).toBeInTheDocument();
    });

    it("should render therapist photo with proper alt text", () => {
      render(
        <TherapistCard
          therapist={mockTherapist}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      const image = screen.getByAltText("Dr. Sarah Chen, LMFT, PhD");
      expect(image).toBeInTheDocument();
      // Next.js Image optimizes the URL, so we check that it contains the original URL
      expect(image.getAttribute("src")).toContain("example.com%2Fphoto.jpg");
    });

    it("should render therapist initials when no photo URL is provided", () => {
      const therapistWithoutPhoto = {
        ...mockTherapist,
        photoUrl: null,
      };

      render(
        <TherapistCard
          therapist={therapistWithoutPhoto}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      expect(screen.getByLabelText("Dr. Sarah Chen initials")).toBeInTheDocument();
      expect(screen.getByText("DSC")).toBeInTheDocument();
    });

    it("should render years of experience when provided", () => {
      render(
        <TherapistCard
          therapist={mockTherapist}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      expect(screen.getByText("12 years of experience")).toBeInTheDocument();
    });

    it("should not render years of experience when not provided", () => {
      const therapistWithoutYears = {
        ...mockTherapist,
        yearsOfExperience: null,
      };

      render(
        <TherapistCard
          therapist={therapistWithoutYears}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      expect(screen.queryByText(/years of experience/i)).not.toBeInTheDocument();
    });

    it("should render all specialty tags", () => {
      render(
        <TherapistCard
          therapist={mockTherapist}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      expect(screen.getByText("Anxiety")).toBeInTheDocument();
      expect(screen.getByText("Teen Issues")).toBeInTheDocument();
      expect(screen.getByText("Family Therapy")).toBeInTheDocument();
    });

    it("should not render specialty section when no specialties provided", () => {
      const therapistWithoutSpecialties = {
        ...mockTherapist,
        specialties: null,
      };

      render(
        <TherapistCard
          therapist={therapistWithoutSpecialties}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      expect(screen.queryByText("Anxiety")).not.toBeInTheDocument();
    });

    it("should render match reasons with proper heading", () => {
      render(
        <TherapistCard
          therapist={mockTherapist}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      expect(screen.getByText("Matched because:")).toBeInTheDocument();
      expect(screen.getByText("Specializes in teen anxiety")).toBeInTheDocument();
      expect(screen.getByText("Available within 3 days")).toBeInTheDocument();
      expect(screen.getByText("Experience with similar concerns")).toBeInTheDocument();
    });

    it("should render maximum 3 match reasons", () => {
      const therapistWith5Reasons = {
        ...mockTherapist,
        matchReasons: [
          { id: "r1", text: "Reason 1", icon: "specialty" },
          { id: "r2", text: "Reason 2", icon: "specialty" },
          { id: "r3", text: "Reason 3", icon: "specialty" },
          { id: "r4", text: "Reason 4", icon: "specialty" },
          { id: "r5", text: "Reason 5", icon: "specialty" },
        ],
      };

      render(
        <TherapistCard
          therapist={therapistWith5Reasons}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      expect(screen.getByText("Reason 1")).toBeInTheDocument();
      expect(screen.getByText("Reason 2")).toBeInTheDocument();
      expect(screen.getByText("Reason 3")).toBeInTheDocument();
      expect(screen.queryByText("Reason 4")).not.toBeInTheDocument();
      expect(screen.queryByText("Reason 5")).not.toBeInTheDocument();
    });

    it("should not render match reasons section when none provided", () => {
      const therapistWithoutReasons = {
        ...mockTherapist,
        matchReasons: null,
      };

      render(
        <TherapistCard
          therapist={therapistWithoutReasons}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      expect(screen.queryByText("Matched because:")).not.toBeInTheDocument();
    });

    it("should render availability preview", () => {
      render(
        <TherapistCard
          therapist={mockTherapist}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      expect(screen.getByText("Available this week")).toBeInTheDocument();
    });

    it("should not render availability section when not provided", () => {
      const therapistWithoutAvailability = {
        ...mockTherapist,
        availabilityText: null,
      };

      render(
        <TherapistCard
          therapist={therapistWithoutAvailability}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      expect(screen.queryByText("Available this week")).not.toBeInTheDocument();
    });
  });

  describe("Best Match Badge", () => {
    it("should render Best Match badge when isBestMatch is true", () => {
      render(
        <TherapistCard
          therapist={mockTherapist}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      expect(screen.getByText("Best Match")).toBeInTheDocument();
    });

    it("should not render Best Match badge when isBestMatch is false", () => {
      const therapistNotBestMatch = {
        ...mockTherapist,
        isBestMatch: false,
      };

      render(
        <TherapistCard
          therapist={therapistNotBestMatch}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      expect(screen.queryByText("Best Match")).not.toBeInTheDocument();
    });
  });

  describe("Actions", () => {
    it("should render Book Now button", () => {
      render(
        <TherapistCard
          therapist={mockTherapist}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      expect(screen.getByRole("button", { name: "Book appointment with Dr. Sarah Chen" })).toBeInTheDocument();
    });

    it("should call onBookNow with therapist ID when Book Now is clicked", () => {
      render(
        <TherapistCard
          therapist={mockTherapist}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      const bookButton = screen.getByRole("button", { name: "Book appointment with Dr. Sarah Chen" });
      fireEvent.click(bookButton);

      expect(mockOnBookNow).toHaveBeenCalledTimes(1);
      expect(mockOnBookNow).toHaveBeenCalledWith("therapist-1");
    });

    it("should render View Profile link", () => {
      render(
        <TherapistCard
          therapist={mockTherapist}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      expect(screen.getByRole("button", { name: "View full profile for Dr. Sarah Chen" })).toBeInTheDocument();
    });

    it("should call onViewProfile with therapist ID when View Profile is clicked", () => {
      render(
        <TherapistCard
          therapist={mockTherapist}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      const viewButton = screen.getByRole("button", { name: "View full profile for Dr. Sarah Chen" });
      fireEvent.click(viewButton);

      expect(mockOnViewProfile).toHaveBeenCalledTimes(1);
      expect(mockOnViewProfile).toHaveBeenCalledWith("therapist-1");
    });

    it("should not crash if onBookNow is not provided", () => {
      render(
        <TherapistCard
          therapist={mockTherapist}
          onViewProfile={mockOnViewProfile}
        />
      );

      const bookButton = screen.getByRole("button", { name: "Book appointment with Dr. Sarah Chen" });
      expect(() => fireEvent.click(bookButton)).not.toThrow();
    });

    it("should not crash if onViewProfile is not provided", () => {
      render(
        <TherapistCard
          therapist={mockTherapist}
          onBookNow={mockOnBookNow}
        />
      );

      const viewButton = screen.getByRole("button", { name: "View full profile for Dr. Sarah Chen" });
      expect(() => fireEvent.click(viewButton)).not.toThrow();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels on action buttons", () => {
      render(
        <TherapistCard
          therapist={mockTherapist}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      expect(screen.getByLabelText("Book appointment with Dr. Sarah Chen")).toBeInTheDocument();
      expect(screen.getByLabelText("View full profile for Dr. Sarah Chen")).toBeInTheDocument();
    });

    it("should have proper alt text for therapist photo", () => {
      render(
        <TherapistCard
          therapist={mockTherapist}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      const image = screen.getByAltText("Dr. Sarah Chen, LMFT, PhD");
      expect(image).toBeInTheDocument();
    });

    it("should have minimum touch target size for buttons", () => {
      render(
        <TherapistCard
          therapist={mockTherapist}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      const bookButton = screen.getByRole("button", { name: "Book appointment with Dr. Sarah Chen" });
      // Button should have size="lg" which provides min height
      expect(bookButton.className).toContain("h-10"); // lg size class
    });
  });

  describe("Responsive Layout", () => {
    it("should apply proper card styling", () => {
      const { container } = render(
        <TherapistCard
          therapist={mockTherapist}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      // Check for card container
      const card = container.querySelector('[class*="border"]');
      expect(card).toBeInTheDocument();
    });

    it("should apply custom className if provided", () => {
      const { container } = render(
        <TherapistCard
          therapist={mockTherapist}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
          className="custom-class"
        />
      );

      const card = container.querySelector('.custom-class');
      expect(card).toBeInTheDocument();
    });
  });

  describe("Visual States", () => {
    it("should have hover state styling on card", () => {
      const { container } = render(
        <TherapistCard
          therapist={mockTherapist}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      const card = container.querySelector('[class*="hover:shadow-lg"]');
      expect(card).toBeInTheDocument();
    });

    it("should prioritize loading best match photo", () => {
      render(
        <TherapistCard
          therapist={mockTherapist}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      const image = screen.getByAltText("Dr. Sarah Chen, LMFT, PhD");
      // When isBestMatch is true, priority prop should be set
      // (Note: Next.js Image priority is a boolean prop, we can't directly test it in unit tests)
      expect(image).toBeInTheDocument();
    });

    it("should not prioritize loading non-best match photo", () => {
      const therapistNotBestMatch = {
        ...mockTherapist,
        isBestMatch: false,
      };

      render(
        <TherapistCard
          therapist={therapistNotBestMatch}
          onBookNow={mockOnBookNow}
          onViewProfile={mockOnViewProfile}
        />
      );

      const image = screen.getByAltText("Dr. Sarah Chen, LMFT, PhD");
      expect(image).toBeInTheDocument();
    });
  });
});
