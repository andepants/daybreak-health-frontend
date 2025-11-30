/**
 * TherapistProfileSheet Component
 *
 * A comprehensive therapist profile view displayed in a responsive sheet.
 * Shows detailed information including bio, credentials, specialties,
 * therapy approach, languages, education, match reasons, and availability.
 *
 * Features:
 * - Responsive: Right sheet on desktop, bottom sheet on mobile
 * - Larger therapist photo (120x120)
 * - Full profile information
 * - Personalized match section
 * - Availability preview with calendar link
 * - Sticky "Book with [therapist]" button
 * - Accessible with proper focus management
 *
 * Design System:
 * - Daybreak brand colors and typography
 * - Clean, scannable sections
 * - Professional yet warm aesthetic
 */
"use client";

import * as React from "react";
import Image from "next/image";
import {
  GraduationCap,
  Languages,
  Sparkles,
  Award,
  Heart,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileMatchSection } from "./ProfileMatchSection";
import { ProfileAvailabilitySection, type AvailabilitySlot } from "./ProfileAvailabilitySection";
import type { Therapist } from "@/types/graphql";

/**
 * Extended therapist data for profile sheet
 * Includes fields not necessarily available in card view
 */
export interface TherapistProfileData extends Therapist {
  /** Detailed approach to therapy (e.g., "CBT-focused, warm and collaborative") */
  approach?: string;
  /** Languages spoken by therapist */
  languages?: string[];
  /** Education background (degree, institution, year) */
  education?: string[];
  /** Professional certifications */
  certifications?: string[];
  /** Next available appointment slots */
  availableSlots?: AvailabilitySlot[];
}

/**
 * Props for TherapistProfileSheet component
 */
export interface TherapistProfileSheetProps {
  /** Whether the sheet is open */
  open: boolean;
  /** Callback when sheet open state changes */
  onOpenChange: (open: boolean) => void;
  /** Full therapist profile data */
  therapist: TherapistProfileData | null;
  /** Child's first name for personalization */
  childName?: string;
  /** Callback when "Book with [therapist]" is clicked */
  onBookAppointment?: (therapistId: string) => void;
  /** Callback when "View full calendar" is clicked */
  onViewCalendar?: (therapistId: string) => void;
  /** Loading state for availability */
  isLoadingAvailability?: boolean;
}

/**
 * Therapist profile detail sheet with comprehensive information
 *
 * Displays full therapist profile in a responsive sheet that slides
 * from the right on desktop and bottom on mobile. Includes all relevant
 * information for making an informed booking decision.
 *
 * Responsive Behavior:
 * - Desktop (≥640px): Right-side sheet, max 32rem wide
 * - Mobile (<640px): Bottom sheet, rounded top corners, max 90vh height
 *
 * Accessibility:
 * - Proper heading hierarchy (h2 for title, h3 for sections)
 * - Focus trap within sheet when open
 * - Escape key closes sheet
 * - Close button with ARIA label
 * - Semantic HTML throughout
 *
 * @example
 * <TherapistProfileSheet
 *   open={isProfileOpen}
 *   onOpenChange={setIsProfileOpen}
 *   therapist={selectedTherapist}
 *   childName="Emma"
 *   onBookAppointment={(id) => router.push(`/book/${id}`)}
 *   onViewCalendar={(id) => router.push(`/calendar/${id}`)}
 * />
 */
export function TherapistProfileSheet({
  open,
  onOpenChange,
  therapist,
  childName,
  onBookAppointment,
  onViewCalendar,
  isLoadingAvailability = false,
}: TherapistProfileSheetProps) {
  /**
   * Handles booking button click
   */
  function handleBookAppointment() {
    if (therapist) {
      onBookAppointment?.(therapist.id);
    }
  }

  // Don't render if no therapist data
  if (!therapist) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto p-0"
      >
        {/* Header with Photo and Basic Info */}
        <SheetHeader className="px-6 pt-8 pb-6 border-b">
          <div className="flex items-start gap-4">
            {/* Larger Therapist Photo */}
            <div className="relative h-[120px] w-[120px] shrink-0 overflow-hidden rounded-full border-4 border-daybreak-teal/20 shadow-md">
              {therapist.photoUrl ? (
                <Image
                  src={therapist.photoUrl}
                  alt={`${therapist.name}, ${therapist.credentials}`}
                  width={120}
                  height={120}
                  className="object-cover"
                  priority
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center bg-daybreak-teal/10 text-3xl font-bold text-daybreak-teal"
                  aria-label={`${therapist.name} initials`}
                >
                  {therapist.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
              )}
            </div>

            {/* Name and Credentials */}
            <div className="flex-1 min-w-0 pt-2">
              <SheetTitle className="text-2xl">
                {therapist.name}
              </SheetTitle>
              <SheetDescription className="text-base mt-2">
                {therapist.credentials}
              </SheetDescription>
              {therapist.yearsOfExperience && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {therapist.yearsOfExperience} years of experience
                </p>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Bio Section */}
          {therapist.bio && (
            <section>
              <h3 className="text-lg font-serif font-semibold text-deep-text mb-3 flex items-center gap-2">
                <Heart className="h-5 w-5 text-warm-orange" aria-hidden="true" />
                About
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {therapist.bio}
              </p>
            </section>
          )}

          {/* Specialties Section */}
          {therapist.specialties && therapist.specialties.length > 0 && (
            <section>
              <h3 className="text-lg font-serif font-semibold text-deep-text mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-warm-orange" aria-hidden="true" />
                Specialties
              </h3>
              <div className="flex flex-wrap gap-2">
                {therapist.specialties.map((specialty) => (
                  <Badge
                    key={specialty}
                    variant="outline"
                    className="text-sm px-3 py-1 border-daybreak-teal/30 text-daybreak-teal"
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Approach Section */}
          {therapist.approach && (
            <section>
              <h3 className="text-lg font-serif font-semibold text-deep-text mb-3">
                Therapeutic Approach
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {therapist.approach}
              </p>
            </section>
          )}

          {/* Languages Section */}
          {therapist.languages && therapist.languages.length > 0 && (
            <section>
              <h3 className="text-lg font-serif font-semibold text-deep-text mb-3 flex items-center gap-2">
                <Languages className="h-5 w-5 text-warm-orange" aria-hidden="true" />
                Languages Spoken
              </h3>
              <p className="text-sm text-muted-foreground">
                {therapist.languages.join(", ")}
              </p>
            </section>
          )}

          {/* Education Section */}
          {therapist.education && therapist.education.length > 0 && (
            <section>
              <h3 className="text-lg font-serif font-semibold text-deep-text mb-3 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-warm-orange" aria-hidden="true" />
                Education
              </h3>
              <ul className="space-y-2" role="list">
                {therapist.education.map((degree, index) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-daybreak-teal mt-1">•</span>
                    <span>{degree}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Certifications Section */}
          {therapist.certifications && therapist.certifications.length > 0 && (
            <section>
              <h3 className="text-lg font-serif font-semibold text-deep-text mb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-warm-orange" aria-hidden="true" />
                Certifications
              </h3>
              <ul className="space-y-2" role="list">
                {therapist.certifications.map((cert, index) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-daybreak-teal mt-1">•</span>
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Match Reasons Section */}
          {therapist.matchReasons && therapist.matchReasons.length > 0 && (
            <ProfileMatchSection
              therapistName={therapist.name}
              childName={childName}
              matchReasons={therapist.matchReasons}
            />
          )}

          {/* Availability Section */}
          <ProfileAvailabilitySection
            therapistId={therapist.id}
            therapistName={therapist.name}
            availableSlots={therapist.availableSlots}
            onViewCalendar={onViewCalendar}
            isLoading={isLoadingAvailability}
          />

          {/* Bottom padding for sticky footer */}
          <div className="h-24" aria-hidden="true" />
        </div>

        {/* Sticky Footer with Book Button */}
        <SheetFooter className="border-t bg-background">
          <Button
            onClick={handleBookAppointment}
            className="w-full bg-daybreak-teal hover:bg-daybreak-teal/90 text-white font-medium py-6 text-base"
            size="lg"
            aria-label={`Book appointment with ${therapist.name}`}
          >
            Book with {therapist.name.split(" ")[0]}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

TherapistProfileSheet.displayName = "TherapistProfileSheet";
