/**
 * TherapistMatchResults container component
 *
 * Orchestrates the display of matched therapists including:
 * - List of therapist cards (2-3 typically)
 * - Therapist profile detail sheet (Story 4.2)
 * - Match rationale expandable section
 * - Alternative options link
 * - Empty state handling
 *
 * Features:
 * - Cards ordered by match quality (best first)
 * - "Best Match" badge on top recommendation
 * - Responsive profile sheet (right on desktop, bottom on mobile)
 * - Smooth fade-in animation
 * - Responsive layout
 *
 * Navigation:
 * - Book Now → /onboarding/[sessionId]/schedule/[therapistId]
 * - View Profile → Opens TherapistProfileSheet
 * - None feel right → Contact support or view more
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TherapistCard } from "./TherapistCard";
import { TherapistProfileSheet, type TherapistProfileData } from "./TherapistProfileSheet";
import { MatchRationale } from "./MatchRationale";
import type { TherapistMatchResults as TherapistMatchResultsType } from "@/types/graphql";

/**
 * Props for TherapistMatchResults component
 * @param results - Therapist matching results from GraphQL query
 * @param sessionId - Current onboarding session ID
 * @param childName - Optional child's first name for personalization
 * @param className - Optional additional CSS classes
 */
export interface TherapistMatchResultsProps {
  results: TherapistMatchResultsType;
  sessionId: string;
  childName?: string;
  className?: string;
}

/**
 * Renders matched therapist results with cards, rationale, and fallback options
 *
 * Visual Layout:
 * - Heading with result count
 * - Therapist cards (2-3) in vertical stack
 * - Match rationale accordion
 * - "None of these feel right?" link
 * - Mobile: Full width, single column
 * - Desktop: Centered, max-width 640px
 *
 * Accessibility:
 * - Semantic HTML with proper heading hierarchy
 * - Keyboard navigable
 * - Screen reader announcements for result count
 * - ARIA labels on interactive elements
 *
 * Performance:
 * - Fade-in animation on mount
 * - Optimized image loading via TherapistCard
 * - Minimal re-renders
 *
 * @example
 * <TherapistMatchResults
 *   results={matchResults}
 *   sessionId="sess_abc123"
 * />
 */
export function TherapistMatchResults({
  results,
  sessionId,
  childName,
  className,
}: TherapistMatchResultsProps) {
  const router = useRouter();

  // Sheet state management
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [selectedTherapist, setSelectedTherapist] = React.useState<TherapistProfileData | null>(null);

  /**
   * Handles "Book Now" button click
   * Navigates to scheduling page for selected therapist
   *
   * @param therapistId - ID of the therapist to book
   */
  function handleBookNow(therapistId: string) {
    router.push(`/onboarding/${sessionId}/schedule/${therapistId}`);
  }

  /**
   * Handles "View Profile" link click
   * Opens the therapist profile sheet with full details
   *
   * @param therapistId - ID of the therapist whose profile to view
   */
  function handleViewProfile(therapistId: string) {
    // Find the therapist in results
    const therapist = results.therapists.find((t) => t.id === therapistId);
    if (therapist) {
      // Extend therapist data with mock profile details
      // In production, this could fetch additional data or use existing data
      const profileData: TherapistProfileData = {
        ...therapist,
        // Mock extended data - in production, fetch from API or GraphQL
        approach: "CBT-focused with a warm, collaborative approach. I believe in meeting clients where they are and building therapeutic relationships based on trust and mutual respect.",
        languages: ["English", "Spanish"],
        education: [
          "Ph.D. in Clinical Psychology, UCLA (2015)",
          "M.A. in Counseling Psychology, Boston University (2012)",
          "B.A. in Psychology, UC Berkeley (2010)",
        ],
        certifications: [
          "Licensed Marriage and Family Therapist (LMFT)",
          "Certified Child and Adolescent Therapist",
          "Trauma-Focused CBT Certification",
        ],
        // Mock availability slots - in production, fetch from calendar API
        availableSlots: [
          { id: "slot1", datetime: "2024-12-05T14:00:00Z" },
          { id: "slot2", datetime: "2024-12-06T10:00:00Z" },
          { id: "slot3", datetime: "2024-12-07T15:30:00Z" },
        ],
      };

      setSelectedTherapist(profileData);
      setIsProfileOpen(true);
    }
  }

  /**
   * Handles booking from within the profile sheet
   * Closes sheet and navigates to scheduling
   *
   * @param therapistId - ID of the therapist to book
   */
  function handleBookFromProfile(therapistId: string) {
    setIsProfileOpen(false);
    handleBookNow(therapistId);
  }

  /**
   * Handles viewing calendar from profile sheet
   * Navigate to calendar view or scheduling page
   *
   * @param therapistId - ID of the therapist
   */
  function handleViewCalendar(therapistId: string) {
    setIsProfileOpen(false);
    // For now, navigate to scheduling (could be separate calendar view)
    router.push(`/onboarding/${sessionId}/schedule/${therapistId}`);
  }

  /**
   * Handles "None of these feel right?" click
   * Shows support contact or additional options
   */
  function handleContactSupport() {
    // TODO: Implement support contact flow
    // Could show a modal with contact options or chat widget
    // Placeholder for future implementation
  }

  // Empty state - no therapists matched
  if (!results.therapists || results.therapists.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center space-y-6 py-12",
          className
        )}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warm-orange/10">
          <AlertCircle className="h-8 w-8 text-warm-orange" />
        </div>

        <div className="space-y-2 text-center max-w-md">
          <h2 className="text-2xl font-semibold font-serif text-deep-text">
            We&apos;re having trouble finding matches
          </h2>
          <p className="text-muted-foreground">
            Don&apos;t worry! Our team can help find the perfect therapist for
            your needs. Let&apos;s connect you with someone who can assist.
          </p>
        </div>

        <Button
          onClick={handleContactSupport}
          className="bg-daybreak-teal hover:bg-daybreak-teal/90 text-white"
          size="lg"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Contact Support
        </Button>
      </div>
    );
  }

  // Sort therapists by match score (already sorted by backend, but ensure best match is first)
  const sortedTherapists = [...results.therapists].sort((a, b) => {
    if (a.isBestMatch) return -1;
    if (b.isBestMatch) return 1;
    return b.matchScore - a.matchScore;
  });

  return (
    <>
      <div
        className={cn("space-y-8 animate-in fade-in duration-700", className)}
      >
        {/* Results Header */}
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold font-serif text-deep-text">
            We found {results.totalCount} great{" "}
            {results.totalCount === 1 ? "match" : "matches"} for you
          </h2>
          <p className="text-muted-foreground">
            These therapists are selected based on your needs, preferences, and
            availability.
          </p>
        </div>

        {/* Therapist Cards */}
        <div className="space-y-4 max-w-[640px] mx-auto">
          {sortedTherapists.map((therapist, index) => (
            <div
              key={therapist.id}
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{
                animationDelay: `${index * 150}ms`,
                animationFillMode: "backwards",
              }}
            >
              <TherapistCard
                therapist={therapist}
                onBookNow={handleBookNow}
                onViewProfile={handleViewProfile}
              />
            </div>
          ))}
        </div>

        {/* Match Rationale */}
        <MatchRationale matchingCriteria={results.matchingCriteria} />

        {/* Alternative Options */}
        <div className="text-center pt-4">
          <Button
            onClick={handleContactSupport}
            variant="ghost"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-daybreak-teal hover:bg-daybreak-teal/10 transition-colors group"
            aria-label="Contact support for alternative therapist options"
          >
            <MessageCircle className="h-4 w-4 group-hover:text-daybreak-teal transition-colors" />
            <span className="underline underline-offset-2">
              None of these feel right?
            </span>
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Our team can help you find more options or answer any questions.
          </p>
        </div>
      </div>

      {/* Therapist Profile Sheet */}
      <TherapistProfileSheet
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        therapist={selectedTherapist}
        childName={childName}
        onBookAppointment={handleBookFromProfile}
        onViewCalendar={handleViewCalendar}
      />
    </>
  );
}

TherapistMatchResults.displayName = "TherapistMatchResults";
