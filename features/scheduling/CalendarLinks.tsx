/**
 * CalendarLinks Component
 *
 * Provides "Add to Calendar" buttons for Google Calendar, Apple Calendar (iCal),
 * and Outlook. Generates appropriate links/downloads for each platform.
 *
 * Visual Design:
 * - Three button options in a column
 * - Icons for each calendar type
 * - Clean, accessible button design
 * - Responsive layout
 *
 * @module features/scheduling/CalendarLinks
 */

"use client";

import * as React from "react";
import { Calendar, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  generateGoogleCalendarUrl,
  downloadICSFile,
  type CalendarEventDetails,
} from "@/lib/utils/calendar-links";

/**
 * Props for CalendarLinks component
 */
export interface CalendarLinksProps {
  /** Therapist name for event title */
  therapistName: string;
  /** Appointment start time (ISO string) */
  startTime: string;
  /** Appointment end time (ISO string) */
  endTime: string;
  /** Video call meeting URL */
  meetingUrl?: string;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Renders add to calendar buttons for multiple platforms
 *
 * Features:
 * - Google Calendar: Opens in new tab
 * - Apple Calendar: Downloads .ics file
 * - Outlook: Downloads .ics file
 *
 * Accessibility:
 * - Clear button labels
 * - Keyboard navigable
 * - Focus indicators
 *
 * @example
 * <CalendarLinks
 *   therapistName="Dr. Sarah Johnson"
 *   startTime="2024-01-15T14:00:00Z"
 *   endTime="2024-01-15T14:50:00Z"
 *   meetingUrl="https://daybreak.health/meet/abc123"
 * />
 */
export function CalendarLinks({
  therapistName,
  startTime,
  endTime,
  meetingUrl = "",
  className,
}: CalendarLinksProps) {
  /**
   * Calendar event details for all platforms
   */
  const eventDetails: CalendarEventDetails = {
    title: `Therapy Appointment with ${therapistName}`,
    description: [
      "Your scheduled therapy appointment with Daybreak Health.",
      "",
      "Join the video call using the link below:",
      meetingUrl || "Link will be sent before the appointment",
      "",
      "If you need to reschedule or cancel, please contact us at least 24 hours in advance.",
    ].join("\n"),
    location: meetingUrl,
    startTime,
    endTime,
  };

  /**
   * Handles Google Calendar button click
   * Opens Google Calendar in a new tab
   */
  function handleGoogleCalendar() {
    const url = generateGoogleCalendarUrl(eventDetails);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  /**
   * Handles Apple Calendar button click
   * Downloads ICS file for Apple Calendar
   */
  function handleAppleCalendar() {
    downloadICSFile(eventDetails, "daybreak-appointment.ics");
  }

  /**
   * Handles Outlook button click
   * Downloads ICS file for Outlook
   */
  function handleOutlook() {
    downloadICSFile(eventDetails, "daybreak-appointment.ics");
  }

  return (
    <div className={className}>
      <h3 className="text-sm font-medium text-deep-text mb-3">
        Add to your calendar
      </h3>

      <div className="flex flex-col gap-2">
        {/* Google Calendar Button */}
        <Button
          variant="outline"
          onClick={handleGoogleCalendar}
          className="w-full justify-start gap-2 hover:bg-gray-50"
        >
          <Calendar className="h-4 w-4" aria-hidden="true" />
          <span>Google Calendar</span>
        </Button>

        {/* Apple Calendar Button */}
        <Button
          variant="outline"
          onClick={handleAppleCalendar}
          className="w-full justify-start gap-2 hover:bg-gray-50"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          <span>Apple Calendar</span>
        </Button>

        {/* Outlook Button */}
        <Button
          variant="outline"
          onClick={handleOutlook}
          className="w-full justify-start gap-2 hover:bg-gray-50"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          <span>Outlook</span>
        </Button>
      </div>
    </div>
  );
}

CalendarLinks.displayName = "CalendarLinks";
