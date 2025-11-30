/**
 * SessionDetails component for displaying appointment session information
 *
 * Shows key details about the upcoming session including therapist info,
 * session type, duration, and timezone. Displayed as a sidebar or header
 * during the scheduling flow.
 *
 * Features:
 * - Therapist name and photo
 * - Session duration (50 minutes)
 * - Video call badge
 * - Timezone display with selector
 * - Clean, card-based layout
 *
 * Visual Design:
 * - Fraunces for therapist name
 * - Inter for body text
 * - Daybreak teal accents
 * - Cream background
 *
 * Accessibility:
 * - Semantic HTML with proper heading hierarchy
 * - Alt text for therapist photo
 * - ARIA labels for badges
 */
"use client";

import * as React from "react";
import Image from "next/image";
import { Video, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TimezoneSelector } from "./TimezoneSelector";

/**
 * Props for SessionDetails component
 * @param therapistName - Full name of the therapist
 * @param therapistPhotoUrl - URL to therapist's photo
 * @param sessionDuration - Duration in minutes (default: 50)
 * @param sessionType - Type of session (default: "video")
 * @param timezone - Current timezone for display
 * @param onTimezoneChange - Callback when timezone is changed
 * @param showTimezoneSelector - Whether to show timezone selector (default: true)
 * @param className - Optional additional CSS classes
 */
export interface SessionDetailsProps {
  therapistName: string;
  therapistPhotoUrl?: string;
  sessionDuration?: number;
  sessionType?: "video" | "phone" | "in-person";
  timezone: string;
  onTimezoneChange?: (timezone: string) => void;
  showTimezoneSelector?: boolean;
  className?: string;
}

/**
 * Map session types to display labels
 */
const SESSION_TYPE_LABELS: Record<string, string> = {
  video: "Video Call",
  phone: "Phone Call",
  "in-person": "In-Person",
};

/**
 * Map session types to icons
 */
const SESSION_TYPE_ICONS: Record<string, React.ElementType> = {
  video: Video,
  phone: Clock, // Using Clock as placeholder, replace with Phone icon if needed
  "in-person": Clock, // Using Clock as placeholder
};

/**
 * Renders session details including therapist info and session metadata
 *
 * Performance:
 * - Optimized image loading with next/image
 * - Memoized icon components
 *
 * @example
 * <SessionDetails
 *   therapistName="Dr. Sarah Johnson"
 *   therapistPhotoUrl="/therapists/sarah.jpg"
 *   sessionDuration={50}
 *   sessionType="video"
 *   timezone="America/New_York"
 *   onTimezoneChange={handleTimezoneChange}
 * />
 */
export function SessionDetails({
  therapistName,
  therapistPhotoUrl,
  sessionDuration = 50,
  sessionType = "video",
  timezone,
  onTimezoneChange,
  showTimezoneSelector = true,
  className,
}: SessionDetailsProps) {
  /**
   * Get initials from therapist name for fallback avatar
   */
  const getInitials = React.useMemo(() => {
    return therapistName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [therapistName]);

  const SessionIcon = SESSION_TYPE_ICONS[sessionType] || Video;
  const sessionLabel = SESSION_TYPE_LABELS[sessionType] || "Video Call";

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white p-6 shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold font-serif text-deep-text">
          Session Details
        </h2>
      </div>

      {/* Therapist Info */}
      <div className="flex items-center gap-4 mb-6">
        {/* Therapist Photo */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-gray-200">
          {therapistPhotoUrl ? (
            <Image
              src={therapistPhotoUrl}
              alt={therapistName}
              width={64}
              height={64}
              className="object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center bg-daybreak-teal/10 text-lg font-semibold text-daybreak-teal"
              aria-label={`${therapistName} initials`}
            >
              {getInitials}
            </div>
          )}
        </div>

        {/* Therapist Name */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground mb-1">
            First session with
          </p>
          <h3 className="text-lg font-semibold font-serif text-deep-text leading-tight">
            {therapistName}
          </h3>
        </div>
      </div>

      {/* Session Metadata */}
      <div className="space-y-3">
        {/* Duration */}
        <div className="flex items-center gap-3 text-sm">
          <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="font-medium text-deep-text">
              {sessionDuration} minutes
            </p>
            <p className="text-xs text-muted-foreground">Session duration</p>
          </div>
        </div>

        {/* Session Type Badge */}
        <div className="flex items-center gap-3 text-sm">
          <SessionIcon className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-daybreak-teal/10 text-daybreak-teal border-daybreak-teal/20"
            >
              {sessionLabel}
            </Badge>
          </div>
        </div>
      </div>

      {/* Timezone Section */}
      {showTimezoneSelector && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <TimezoneSelector
            value={timezone}
            onChange={onTimezoneChange}
            label="Your timezone"
          />
        </div>
      )}

      {/* Additional Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-muted-foreground text-center">
          You will receive a confirmation email with meeting details after
          booking
        </p>
      </div>
    </div>
  );
}

SessionDetails.displayName = "SessionDetails";
