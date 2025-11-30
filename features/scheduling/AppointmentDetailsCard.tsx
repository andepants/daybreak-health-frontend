/**
 * AppointmentDetailsCard Component
 *
 * Displays confirmed appointment details including therapist info,
 * date/time, format, and duration.
 *
 * Visual Design:
 * - Therapist photo (circular, 80x80)
 * - Therapist name and credentials
 * - Date and time formatted nicely
 * - "Video call" badge
 * - 50-minute duration indicator
 * - Clean card layout with proper spacing
 *
 * @module features/scheduling/AppointmentDetailsCard
 */

"use client";

import * as React from "react";
import Image from "next/image";
import { Calendar, Clock, Video } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Therapist information subset for appointment display
 */
export interface TherapistInfo {
  id: string;
  name: string;
  credentials: string;
  photoUrl?: string | null;
}

/**
 * Props for AppointmentDetailsCard component
 */
export interface AppointmentDetailsCardProps {
  /** Therapist information */
  therapist: TherapistInfo;
  /** Appointment start time (ISO string) */
  startTime: string;
  /** Appointment end time (ISO string) */
  endTime: string;
  /** Duration in minutes */
  duration?: number;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Formats the appointment date and time for display
 * Example: "Monday, January 15 at 2:00 PM"
 *
 * @param startTime - ISO date string
 * @returns Formatted date and time string
 */
function formatAppointmentDateTime(startTime: string): string {
  const date = new Date(startTime);
  return format(date, "EEEE, MMMM d 'at' h:mm a");
}

/**
 * Renders appointment details card with therapist and scheduling info
 *
 * Accessibility:
 * - Semantic HTML with proper heading hierarchy
 * - Alt text for therapist photo
 * - ARIA labels for icons
 * - High contrast text
 *
 * Performance:
 * - next/image for optimized photo loading
 *
 * @example
 * <AppointmentDetailsCard
 *   therapist={{
 *     id: "123",
 *     name: "Dr. Sarah Johnson",
 *     credentials: "PhD, LMFT",
 *     photoUrl: "/therapists/sarah.jpg"
 *   }}
 *   startTime="2024-01-15T14:00:00Z"
 *   endTime="2024-01-15T14:50:00Z"
 *   duration={50}
 * />
 */
export function AppointmentDetailsCard({
  therapist,
  startTime,
  duration = 50,
  className,
}: AppointmentDetailsCardProps) {
  const formattedDateTime = formatAppointmentDateTime(startTime);

  return (
    <Card
      className={cn(
        "border-daybreak-teal/20 bg-white shadow-sm",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Therapist Info Section */}
          <div className="flex items-center gap-4">
            {/* Therapist Photo */}
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-gray-200">
              {therapist.photoUrl ? (
                <Image
                  src={therapist.photoUrl}
                  alt={`${therapist.name}, ${therapist.credentials}`}
                  width={80}
                  height={80}
                  className="object-cover"
                  priority
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

            {/* Therapist Name and Credentials */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-serif font-semibold text-deep-text leading-tight">
                {therapist.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {therapist.credentials}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Appointment Details Section */}
          <div className="space-y-4">
            {/* Date and Time */}
            <div className="flex items-start gap-3">
              <Calendar
                className="h-5 w-5 shrink-0 text-daybreak-teal mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Date & Time
                </p>
                <p className="text-base font-medium text-deep-text mt-1">
                  {formattedDateTime}
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-start gap-3">
              <Clock
                className="h-5 w-5 shrink-0 text-daybreak-teal mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Duration
                </p>
                <p className="text-base font-medium text-deep-text mt-1">
                  {duration} minutes
                </p>
              </div>
            </div>

            {/* Format (Video Call) */}
            <div className="flex items-start gap-3">
              <Video
                className="h-5 w-5 shrink-0 text-daybreak-teal mt-0.5"
                aria-hidden="true"
              />
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Format
                </p>
                <Badge
                  variant="secondary"
                  className="bg-daybreak-teal/10 text-daybreak-teal border-daybreak-teal/20"
                >
                  Video Call
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

AppointmentDetailsCard.displayName = "AppointmentDetailsCard";
