/**
 * TherapistCard component for displaying matched therapist information
 *
 * Renders a card showing therapist details including photo, credentials,
 * specialties, match reasons, and availability. Includes "Book Now" and
 * "View Profile" actions.
 *
 * Visual Design:
 * - Professional photo (80x80, rounded)
 * - Name and credentials displayed prominently
 * - Specialty tags as badges
 * - Match reasons with icons
 * - Availability preview
 * - Primary "Book Now" button and secondary "View Profile" link
 *
 * Responsive:
 * - Mobile: Full width, stacked layout
 * - Desktop: Centered, max-width with grid layout
 */
"use client";

import * as React from "react";
import Image from "next/image";
import { CheckCircle, Clock, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Therapist } from "@/types/graphql";

/**
 * Props for TherapistCard component
 * @param therapist - Therapist data from GraphQL query
 * @param onBookNow - Callback when "Book Now" button is clicked
 * @param onViewProfile - Callback when "View Profile" link is clicked
 * @param className - Optional additional CSS classes
 */
export interface TherapistCardProps {
  therapist: Therapist;
  onBookNow?: (therapistId: string) => void;
  onViewProfile?: (therapistId: string) => void;
  className?: string;
}

/**
 * Maps match reason icon identifiers to Lucide icons
 */
const MATCH_REASON_ICONS: Record<string, React.ElementType> = {
  specialty: CheckCircle,
  availability: Clock,
  experience: Star,
};

/**
 * Renders a therapist card with photo, credentials, match reasons, and actions
 *
 * Accessibility:
 * - Semantic HTML with proper heading hierarchy
 * - Alt text for therapist photo
 * - Touch targets meet 44x44px minimum (WCAG)
 * - Keyboard navigable
 *
 * Performance:
 * - next/image for optimized photo loading
 * - Lazy loading for images below fold
 *
 * @example
 * <TherapistCard
 *   therapist={therapistData}
 *   onBookNow={(id) => router.push(`/schedule/${id}`)}
 *   onViewProfile={(id) => router.push(`/profile/${id}`)}
 * />
 */
export function TherapistCard({
  therapist,
  onBookNow,
  onViewProfile,
  className,
}: TherapistCardProps) {
  /**
   * Handles Book Now button click
   * Invokes the onBookNow callback with therapist ID if provided
   */
  function handleBookNow() {
    onBookNow?.(therapist.id);
  }

  /**
   * Handles View Profile link click
   * Invokes the onViewProfile callback with therapist ID if provided
   */
  function handleViewProfile() {
    onViewProfile?.(therapist.id);
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:shadow-lg",
        "border-[var(--daybreak-teal-light,#E8F5F4)]",
        className
      )}
    >
      {/* Best Match Badge */}
      {therapist.isBestMatch && (
        <div className="absolute top-0 right-0 z-10">
          <Badge
            variant="default"
            className="rounded-tl-none rounded-br-none bg-daybreak-teal text-white"
          >
            <Star className="h-3 w-3 mr-1 fill-current" />
            Best Match
          </Badge>
        </div>
      )}

      <CardHeader>
        <div className="flex items-start gap-4">
          {/* Therapist Photo */}
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-gray-200">
            {therapist.photoUrl ? (
              <Image
                src={therapist.photoUrl}
                alt={`${therapist.name}, ${therapist.credentials}`}
                width={80}
                height={80}
                className="object-cover"
                priority={therapist.isBestMatch} // Prioritize loading best match photo
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center bg-gray-100 text-2xl font-semibold text-gray-600"
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
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold font-serif text-deep-text leading-tight">
              {therapist.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {therapist.credentials}
            </p>
            {therapist.yearsOfExperience && (
              <p className="text-xs text-muted-foreground mt-1">
                {therapist.yearsOfExperience} years of experience
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Specialty Tags */}
        {therapist.specialties && therapist.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {therapist.specialties.map((specialty) => (
              <Badge key={specialty} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))}
          </div>
        )}

        {/* Match Reasons */}
        {therapist.matchReasons && therapist.matchReasons.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-deep-text">
              Matched because:
            </p>
            <ul className="space-y-2">
              {therapist.matchReasons.slice(0, 3).map((reason) => {
                const IconComponent =
                  MATCH_REASON_ICONS[reason.icon || ""] || CheckCircle;
                return (
                  <li key={reason.id} className="flex items-start gap-2">
                    <IconComponent className="h-4 w-4 mt-0.5 shrink-0 text-daybreak-teal" />
                    <span className="text-sm text-muted-foreground">
                      {reason.text}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Availability */}
        {therapist.availabilityText && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">
            <Clock className="h-4 w-4 text-green-700" />
            <span className="text-sm font-medium text-green-700">
              {therapist.availabilityText}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        {/* Book Now Button - Primary Action */}
        <Button
          onClick={handleBookNow}
          className="w-full bg-daybreak-teal hover:bg-daybreak-teal/90 text-white"
          size="lg"
          aria-label={`Book appointment with ${therapist.name}`}
        >
          Book Now
        </Button>

        {/* View Profile Link - Secondary Action */}
        <Button
          onClick={handleViewProfile}
          variant="ghost"
          className="text-sm text-daybreak-teal hover:text-daybreak-teal/80 hover:bg-daybreak-teal/10 underline underline-offset-2 transition-colors"
          aria-label={`View full profile for ${therapist.name}`}
        >
          View Full Profile
        </Button>
      </CardFooter>
    </Card>
  );
}

TherapistCard.displayName = "TherapistCard";
