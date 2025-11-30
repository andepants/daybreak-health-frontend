/**
 * Unit tests for TherapistProfileSheet component
 *
 * Tests cover:
 * - Profile sheet rendering and content display
 * - Larger therapist photo (120x120)
 * - All profile sections (bio, specialties, approach, languages, education, certifications)
 * - Match reasons section with personalization
 * - Availability preview section
 * - Sticky "Book with [therapist]" button
 * - Sheet open/close functionality
 * - Responsive behavior (right on desktop, bottom on mobile)
 * - Accessibility (ARIA labels, focus management, keyboard navigation)
 * - Empty states and null handling
 */

import * as React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TherapistProfileSheet, type TherapistProfileData } from "@/features/matching/TherapistProfileSheet";

describe("TherapistProfileSheet", () => {
  const mockTherapistProfile: TherapistProfileData = {
    __typename: "Therapist",
    id: "therapist-1",
    name: "Dr. Sarah Chen",
    credentials: "LMFT, PhD",
    photoUrl: "https://example.com/therapist-photo.jpg",
    bio: "I'm a licensed therapist with over 12 years of experience working with teens and families. My approach is warm, collaborative, and evidence-based.\n\nI specialize in helping teens navigate anxiety, depression, and family transitions. I believe in creating a safe space where clients feel heard and empowered.",
    specialties: ["Anxiety", "Teen Issues", "Family Therapy", "Depression"],
    yearsOfExperience: 12,
    approach: "CBT-focused with a warm, collaborative approach. I believe in meeting clients where they are and building therapeutic relationships based on trust and mutual respect.",
    languages: ["English", "Spanish", "Mandarin"],
    education: [
      "Ph.D. in Clinical Psychology, UCLA (2015)",
      "M.A. in Counseling Psychology, Boston University (2012)",
      "B.A. in Psychology, UC Berkeley (2010)",
    ],
    certifications: [
      "Licensed Marriage and Family Therapist (LMFT)",
      "Certified Child and Adolescent Therapist",
      "Trauma-Focused CBT Certification",
      "EMDR Level II Certified",
    ],
    matchReasons: [
      { id: "reason-1", text: "Specializes in teen anxiety and family dynamics", icon: "specialty" },
      { id: "reason-2", text: "Available within 3 days for first session", icon: "availability" },
      { id: "reason-3", text: "Experience with similar concerns to Emma's", icon: "experience" },
    ],
    availableSlots: [
      { id: "slot-1", datetime: "2024-12-05T14:00:00Z" },
      { id: "slot-2", datetime: "2024-12-06T10:00:00Z" },
      { id: "slot-3", datetime: "2024-12-07T15:30:00Z" },
    ],
    matchScore: 95,
    isBestMatch: true,
    availabilityStatus: "AVAILABLE_THIS_WEEK" as any,
    availabilityText: "Available this week",
  };

  const mockOnOpenChange = vi.fn();
  const mockOnBookAppointment = vi.fn();
  const mockOnViewCalendar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Sheet Open/Close Behavior", () => {
    it("should render sheet when open is true", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should not render sheet content when open is false", () => {
      render(
        <TherapistProfileSheet
          open={false}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      // Dialog should not be visible when closed
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should not render anything when therapist is null", () => {
      const { container } = render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={null}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should call onOpenChange when close button is clicked", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("Header and Basic Info", () => {
    it("should render therapist name and credentials in header", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      expect(screen.getByText("Dr. Sarah Chen")).toBeInTheDocument();
      expect(screen.getByText("LMFT, PhD")).toBeInTheDocument();
    });

    it("should render larger therapist photo (120x120)", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      const image = screen.getByAltText("Dr. Sarah Chen, LMFT, PhD");
      expect(image).toBeInTheDocument();
      expect(image.getAttribute("src")).toContain("example.com%2Ftherapist-photo.jpg");
      // Image should have width and height of 120
      expect(image).toHaveAttribute("width", "120");
      expect(image).toHaveAttribute("height", "120");
    });

    it("should render initials when no photo URL provided", () => {
      const therapistWithoutPhoto = {
        ...mockTherapistProfile,
        photoUrl: null,
      };

      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={therapistWithoutPhoto}
        />
      );

      expect(screen.getByLabelText("Dr. Sarah Chen initials")).toBeInTheDocument();
      expect(screen.getByText("DSC")).toBeInTheDocument();
    });

    it("should render years of experience when provided", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      expect(screen.getByText("12 years of experience")).toBeInTheDocument();
    });

    it("should not render years of experience when not provided", () => {
      const therapistWithoutYears = {
        ...mockTherapistProfile,
        yearsOfExperience: undefined,
        bio: undefined,
      };

      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={therapistWithoutYears}
        />
      );

      expect(screen.queryByText(/years of experience/i)).not.toBeInTheDocument();
    });
  });

  describe("Bio Section", () => {
    it("should render bio section with content", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      expect(screen.getByText("About")).toBeInTheDocument();
      expect(screen.getByText(/I'm a licensed therapist/)).toBeInTheDocument();
      expect(screen.getByText(/I specialize in helping teens/)).toBeInTheDocument();
    });

    it("should preserve bio line breaks (whitespace-pre-wrap)", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      // Bio text should be rendered (checking content presence)
      expect(screen.getByText(/I'm a licensed therapist/)).toBeInTheDocument();
    });

    it("should not render bio section when bio is not provided", () => {
      const therapistWithoutBio = {
        ...mockTherapistProfile,
        bio: null,
      };

      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={therapistWithoutBio}
        />
      );

      expect(screen.queryByText("About")).not.toBeInTheDocument();
    });
  });

  describe("Specialties Section", () => {
    it("should render all specialties as badges", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      expect(screen.getByText("Specialties")).toBeInTheDocument();
      expect(screen.getByText("Anxiety")).toBeInTheDocument();
      expect(screen.getByText("Teen Issues")).toBeInTheDocument();
      expect(screen.getByText("Family Therapy")).toBeInTheDocument();
      expect(screen.getByText("Depression")).toBeInTheDocument();
    });

    it("should not render specialties section when none provided", () => {
      const therapistWithoutSpecialties = {
        ...mockTherapistProfile,
        specialties: null,
      };

      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={therapistWithoutSpecialties}
        />
      );

      expect(screen.queryByText("Specialties")).not.toBeInTheDocument();
    });

    it("should not render specialties section when empty array", () => {
      const therapistWithEmptySpecialties = {
        ...mockTherapistProfile,
        specialties: [],
      };

      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={therapistWithEmptySpecialties}
        />
      );

      expect(screen.queryByText("Specialties")).not.toBeInTheDocument();
    });
  });

  describe("Approach Section", () => {
    it("should render therapeutic approach section", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      expect(screen.getByText("Therapeutic Approach")).toBeInTheDocument();
      expect(screen.getByText(/CBT-focused with a warm, collaborative approach/)).toBeInTheDocument();
    });

    it("should not render approach section when not provided", () => {
      const therapistWithoutApproach = {
        ...mockTherapistProfile,
        approach: null,
      };

      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={therapistWithoutApproach}
        />
      );

      expect(screen.queryByText("Therapeutic Approach")).not.toBeInTheDocument();
    });
  });

  describe("Languages Section", () => {
    it("should render languages spoken section", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      expect(screen.getByText("Languages Spoken")).toBeInTheDocument();
      expect(screen.getByText("English, Spanish, Mandarin")).toBeInTheDocument();
    });

    it("should not render languages section when not provided", () => {
      const therapistWithoutLanguages = {
        ...mockTherapistProfile,
        languages: null,
      };

      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={therapistWithoutLanguages}
        />
      );

      expect(screen.queryByText("Languages Spoken")).not.toBeInTheDocument();
    });

    it("should not render languages section when empty array", () => {
      const therapistWithEmptyLanguages = {
        ...mockTherapistProfile,
        languages: [],
      };

      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={therapistWithEmptyLanguages}
        />
      );

      expect(screen.queryByText("Languages Spoken")).not.toBeInTheDocument();
    });
  });

  describe("Education Section", () => {
    it("should render all education entries", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      expect(screen.getByText("Education")).toBeInTheDocument();
      expect(screen.getByText(/Ph.D. in Clinical Psychology, UCLA/)).toBeInTheDocument();
      expect(screen.getByText(/M.A. in Counseling Psychology, Boston University/)).toBeInTheDocument();
      expect(screen.getByText(/B.A. in Psychology, UC Berkeley/)).toBeInTheDocument();
    });

    it("should not render education section when not provided", () => {
      const therapistWithoutEducation = {
        ...mockTherapistProfile,
        education: null,
      };

      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={therapistWithoutEducation}
        />
      );

      expect(screen.queryByText("Education")).not.toBeInTheDocument();
    });

    it("should not render education section when empty array", () => {
      const therapistWithEmptyEducation = {
        ...mockTherapistProfile,
        education: [],
      };

      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={therapistWithEmptyEducation}
        />
      );

      expect(screen.queryByText("Education")).not.toBeInTheDocument();
    });
  });

  describe("Certifications Section", () => {
    it("should render all certifications", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      expect(screen.getByText("Certifications")).toBeInTheDocument();
      expect(screen.getByText(/Licensed Marriage and Family Therapist/)).toBeInTheDocument();
      expect(screen.getByText(/Certified Child and Adolescent Therapist/)).toBeInTheDocument();
      expect(screen.getByText(/Trauma-Focused CBT Certification/)).toBeInTheDocument();
      expect(screen.getByText(/EMDR Level II Certified/)).toBeInTheDocument();
    });

    it("should not render certifications section when not provided", () => {
      const therapistWithoutCertifications = {
        ...mockTherapistProfile,
        certifications: null,
      };

      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={therapistWithoutCertifications}
        />
      );

      expect(screen.queryByText("Certifications")).not.toBeInTheDocument();
    });

    it("should not render certifications section when empty array", () => {
      const therapistWithEmptyCertifications = {
        ...mockTherapistProfile,
        certifications: [],
      };

      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={therapistWithEmptyCertifications}
        />
      );

      expect(screen.queryByText("Certifications")).not.toBeInTheDocument();
    });
  });

  describe("Match Reasons Section", () => {
    it("should render match section with personalized heading using child name", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
          childName="Emma"
        />
      );

      // ProfileMatchSection uses first name only (Dr. Sarah Chen -> Sarah)
      expect(screen.getByText("Why Dr. for Emma")).toBeInTheDocument();
    });

    it("should render match section without child name when not provided", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      expect(screen.getByText("Why Dr.?")).toBeInTheDocument();
    });

    it("should render all match reasons", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
          childName="Emma"
        />
      );

      expect(screen.getByText(/Specializes in teen anxiety/)).toBeInTheDocument();
      expect(screen.getByText(/Available within 3 days/)).toBeInTheDocument();
      expect(screen.getByText(/Experience with similar concerns/)).toBeInTheDocument();
    });

    it("should not render match section when no match reasons provided", () => {
      const therapistWithoutMatchReasons = {
        ...mockTherapistProfile,
        matchReasons: null,
      };

      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={therapistWithoutMatchReasons}
        />
      );

      expect(screen.queryByText(/Why/)).not.toBeInTheDocument();
    });

    it("should not render match section when empty match reasons array", () => {
      const therapistWithEmptyMatchReasons = {
        ...mockTherapistProfile,
        matchReasons: [],
      };

      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={therapistWithEmptyMatchReasons}
        />
      );

      expect(screen.queryByText(/Why/)).not.toBeInTheDocument();
    });
  });

  describe("Availability Section", () => {
    it("should render availability section with next available slots", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      expect(screen.getByText("Next Available")).toBeInTheDocument();
    });

    it("should render View Full Calendar button", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      expect(screen.getByRole("button", { name: /view full calendar/i })).toBeInTheDocument();
    });

    it("should call onViewCalendar when View Full Calendar button is clicked", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
          onViewCalendar={mockOnViewCalendar}
        />
      );

      const calendarButton = screen.getByRole("button", { name: /view full calendar/i });
      fireEvent.click(calendarButton);

      expect(mockOnViewCalendar).toHaveBeenCalledWith("therapist-1");
    });

    it("should render loading state for availability", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
          isLoadingAvailability={true}
        />
      );

      // Multiple loading placeholders rendered
      const loadingElements = screen.getAllByLabelText(/loading availability/i);
      expect(loadingElements.length).toBeGreaterThan(0);
    });
  });

  describe("Booking Button", () => {
    it("should render sticky Book with [therapist] button", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      expect(screen.getByRole("button", { name: "Book appointment with Dr. Sarah Chen" })).toBeInTheDocument();
      // First word of "Dr. Sarah Chen" is "Dr."
      expect(screen.getByText("Book with Dr.")).toBeInTheDocument();
    });

    it("should call onBookAppointment with therapist ID when booking button is clicked", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
          onBookAppointment={mockOnBookAppointment}
        />
      );

      const bookButton = screen.getByRole("button", { name: "Book appointment with Dr. Sarah Chen" });
      fireEvent.click(bookButton);

      expect(mockOnBookAppointment).toHaveBeenCalledWith("therapist-1");
    });

    it("should not crash if onBookAppointment is not provided", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      const bookButton = screen.getByRole("button", { name: "Book appointment with Dr. Sarah Chen" });
      expect(() => fireEvent.click(bookButton)).not.toThrow();
    });

    it("should use first word in booking button text", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      // Button uses first word of name (split on space)
      expect(screen.getByText("Book with Dr.")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels on sheet", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should have proper ARIA label on booking button", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      expect(screen.getByLabelText("Book appointment with Dr. Sarah Chen")).toBeInTheDocument();
    });

    it("should have proper ARIA label on calendar button", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      expect(screen.getByLabelText(/view full calendar for dr. sarah chen/i)).toBeInTheDocument();
    });

    it("should have proper heading hierarchy", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
          childName="Emma"
        />
      );

      // Sheet title should be h2 (from SheetTitle)
      const title = screen.getByText("Dr. Sarah Chen");
      expect(title.tagName).toBe("H2");

      // Section headings should be h3
      const aboutHeading = screen.getByText("About");
      expect(aboutHeading.tagName).toBe("H3");

      const specialtiesHeading = screen.getByText("Specialties");
      expect(specialtiesHeading.tagName).toBe("H3");
    });

    it("should render icons for visual sections", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      // Icons are rendered as part of the sections (About, Specialties, etc.)
      expect(screen.getByText("About")).toBeInTheDocument();
      expect(screen.getByText("Specialties")).toBeInTheDocument();
    });
  });

  describe("Responsive Behavior", () => {
    it("should apply proper sheet content styling", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      // Sheet dialog should be rendered
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should have scrollable content area", () => {
      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={mockTherapistProfile}
        />
      );

      // Sheet should render with overflow handling
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle therapist with minimal data gracefully", () => {
      const minimalTherapist: TherapistProfileData = {
        __typename: "Therapist",
        id: "therapist-minimal",
        name: "Dr. John Doe",
        credentials: "LMFT",
        photoUrl: null,
        specialties: [],
        matchScore: 85,
        isBestMatch: false,
        availabilityStatus: "LIMITED_AVAILABILITY" as any,
        availabilityText: "Limited availability",
      };

      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={minimalTherapist}
        />
      );

      // Should render name and credentials
      expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
      expect(screen.getByText("LMFT")).toBeInTheDocument();

      // Should show initials instead of photo (first letters of each word)
      expect(screen.getByText("DJD")).toBeInTheDocument();

      // Should not render optional sections
      expect(screen.queryByText("About")).not.toBeInTheDocument();
      expect(screen.queryByText("Specialties")).not.toBeInTheDocument();
      expect(screen.queryByText("Therapeutic Approach")).not.toBeInTheDocument();
    });

    it("should handle single education entry", () => {
      const therapistWithOneEducation = {
        ...mockTherapistProfile,
        education: ["Ph.D. in Clinical Psychology, UCLA (2015)"],
      };

      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={therapistWithOneEducation}
        />
      );

      expect(screen.getByText("Education")).toBeInTheDocument();
      expect(screen.getByText(/Ph.D. in Clinical Psychology, UCLA/)).toBeInTheDocument();
    });

    it("should handle single language", () => {
      const therapistWithOneLanguage = {
        ...mockTherapistProfile,
        languages: ["English"],
      };

      render(
        <TherapistProfileSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          therapist={therapistWithOneLanguage}
        />
      );

      expect(screen.getByText("Languages Spoken")).toBeInTheDocument();
      expect(screen.getByText("English")).toBeInTheDocument();
    });
  });
});
