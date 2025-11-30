/**
 * MatchingLoadingState component for therapist matching page
 *
 * Displays an animated loading state while the backend matches therapists.
 * Shows personalized message with child's name and progress indicator.
 *
 * Visual Design:
 * - Centered layout with animated spinner or progress indicator
 * - Warm, reassuring message
 * - Child's name interpolated for personalization
 * - Skeleton cards matching actual therapist card layout
 *
 * Duration: Typically 1-3 seconds
 */
"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Props for MatchingLoadingState component
 * @param childName - Child's first name for personalization
 * @param className - Optional additional CSS classes
 */
export interface MatchingLoadingStateProps {
  childName?: string;
  className?: string;
}

/**
 * Renders skeleton placeholder matching TherapistCard layout
 * Used to show loading state while therapist data is being fetched
 *
 * @returns Skeleton card component with animated pulse effects
 */
function TherapistCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start gap-4">
          {/* Photo skeleton */}
          <div className="h-20 w-20 shrink-0 animate-pulse rounded-full bg-gray-200" />

          {/* Name and credentials skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Specialty tags skeleton */}
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />
        </div>

        {/* Match reasons skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        {/* Availability skeleton */}
        <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
      </CardContent>

      {/* Footer skeleton */}
      <div className="px-6 pb-6 space-y-3">
        <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/3 mx-auto animate-pulse rounded bg-gray-200" />
      </div>
    </Card>
  );
}

/**
 * Renders loading state for therapist matching page
 *
 * Features:
 * - Animated spinner with rotating icon
 * - Personalized message with child's name
 * - 3 skeleton cards matching therapist card layout
 * - Smooth fade-in animation
 *
 * Accessibility:
 * - aria-live="polite" for status updates
 * - Semantic HTML
 * - Screen reader friendly loading message
 *
 * @example
 * <MatchingLoadingState childName="Emma" />
 */
export function MatchingLoadingState({
  childName,
  className,
}: MatchingLoadingStateProps) {
  return (
    <div
      className={cn("space-y-8 animate-in fade-in duration-500", className)}
      role="status"
      aria-live="polite"
      aria-label={`Finding the best matches${childName ? ` for ${childName}` : ""}`}
    >
      {/* Loading Message */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-daybreak-teal" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold font-serif text-deep-text">
            Finding the best matches{childName ? ` for ${childName}` : ""}...
          </h2>
          <p className="text-muted-foreground">
            We&apos;re reviewing therapist specialties, availability, and
            experience to find the perfect fit.
          </p>
        </div>
      </div>

      {/* Skeleton Cards */}
      <div className="space-y-4 max-w-[640px] mx-auto">
        <TherapistCardSkeleton />
        <TherapistCardSkeleton />
        <TherapistCardSkeleton />
      </div>

      {/* Hidden text for screen readers */}
      <span className="sr-only">
        Please wait while we match therapists based on your needs and
        preferences. This typically takes a few seconds.
      </span>
    </div>
  );
}

MatchingLoadingState.displayName = "MatchingLoadingState";
