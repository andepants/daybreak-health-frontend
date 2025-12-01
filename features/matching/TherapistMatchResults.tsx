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
 * - Book Now → /onboarding/[sessionId]/schedule?therapistId=[therapistId]
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
import { createFallbackResults } from "./fallbackTherapists";
// import type { TherapistMatchResults as TherapistMatchResultsType } from "@/types/graphql";

/**
 * Props for TherapistMatchResults component
 * @param results - Therapist matching results from GraphQL query
 * @param sessionId - Current onboarding session ID
 * @param childName - Optional child's first name for personalization
 * @param className - Optional additional CSS classes
 */
export interface TherapistMatchResultsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any;
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
   * Determine if we should show fallback data
   * Triggered when backend returns empty therapists array
   * Shows sample therapists as suggestions in production
   */
  const displayResults = React.useMemo(() => {
    if (results.therapists && results.therapists.length > 0) {
      return { ...results, isFallbackData: false };
    }
    return createFallbackResults();
  }, [results]);

  const isFallbackMode = displayResults.isFallbackData;

  /**
   * Handles "Book Now" button click
   * Saves selected therapist to localStorage and navigates to scheduling page
   *
   * @param therapistId - ID of the therapist to book
   */
  function handleBookNow(therapistId: string) {
    // Find therapist details and save to localStorage for schedule page
    const therapist = displayResults.therapists.find((t: any) => t.id === therapistId);
    if (therapist) {
      try {
        const storageKey = `onboarding_session_${sessionId}`;
        const stored = localStorage.getItem(storageKey);
        const sessionData = stored ? JSON.parse(stored) : { data: {} };

        // Save selected therapist details
        sessionData.data.selectedTherapist = {
          id: therapist.id,
          name: therapist.name,
          photoUrl: therapist.photoUrl,
          credentials: therapist.credentials,
        };

        localStorage.setItem(storageKey, JSON.stringify(sessionData));
      } catch (error) {
        console.error("Failed to save selected therapist:", error);
      }
    }

    router.push(`/onboarding/${sessionId}/schedule?therapistId=${therapistId}`);
  }

  /**
   * Handles "View Profile" link click
   * Opens the therapist profile sheet with full details
   *
   * @param therapistId - ID of the therapist whose profile to view
   */
  function handleViewProfile(therapistId: string) {
    console.log('[handleViewProfile] Called with therapistId:', therapistId);
    console.log('[handleViewProfile] displayResults.therapists:', displayResults.therapists.map((t: any) => ({ id: t.id, name: t.name })));

    // Find the therapist in displayResults (handles both real and fallback)
    const therapist = displayResults.therapists.find((t: any) => t.id === therapistId);
    console.log('[handleViewProfile] Found therapist:', therapist ? therapist.name : 'NOT FOUND');

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

      console.log('[handleViewProfile] Setting selectedTherapist and opening sheet');
      setSelectedTherapist(profileData);
      setIsProfileOpen(true);
    } else {
      console.error('[handleViewProfile] Therapist not found! Check if IDs match.');
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
    // Save therapist and navigate to scheduling (reuse handleBookNow logic)
    handleBookNow(therapistId);
  }

  /**
   * Handles "None of these feel right?" click
   * Opens Intercom chat widget for support assistance
   */
  function handleContactSupport() {
    if (window.Intercom) {
      window.Intercom('show');
    }
  }

  // Sort therapists by match score (already sorted by backend, but ensure best match is first)
  // Uses displayResults which includes fallback data when no real matches exist
  const sortedTherapists = [...displayResults.therapists].sort((a: any, b: any) => {
    if (a.isBestMatch) return -1;
    if (b.isBestMatch) return 1;
    return b.matchScore - a.matchScore;
  });

  return (
    <>
      <div
        className={cn("space-y-8 animate-in fade-in duration-700", className)}
      >
        {/* Fallback Notice Banner - shown when displaying sample therapists */}
        {isFallbackMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-800">
                  Suggested Therapists
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  We&apos;re showing you sample therapist profiles while we work on finding
                  your perfect match. Contact our team for personalized recommendations.
                </p>
                <Button
                  onClick={handleContactSupport}
                  variant="link"
                  className="text-amber-800 hover:text-amber-900 p-0 h-auto mt-2 underline text-sm"
                >
                  Contact Support for Help
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold font-serif text-deep-text">
            {isFallbackMode
              ? "Meet Some of Our Therapists"
              : `We found ${displayResults.totalCount} great ${displayResults.totalCount === 1 ? "match" : "matches"} for you`
            }
          </h2>
          <p className="text-muted-foreground">
            {isFallbackMode
              ? "Here are some example therapist profiles. Contact us for personalized matching."
              : "These therapists are selected based on your needs, preferences, and availability."
            }
          </p>
        </div>

        {/* Therapist Cards */}
        <div className="space-y-4 max-w-[640px] mx-auto">
          {sortedTherapists.map((therapist: any, index: number) => (
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

        {/* Match Rationale - hide in fallback mode since criteria don't apply */}
        {!isFallbackMode && displayResults.matchingCriteria && (
          <MatchRationale matchingCriteria={displayResults.matchingCriteria} />
        )}

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
              {isFallbackMode ? "Need help finding a therapist?" : "None of these feel right?"}
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
