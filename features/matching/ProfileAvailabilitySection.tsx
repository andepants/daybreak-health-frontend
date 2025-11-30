/**
 * ProfileAvailabilitySection Component
 *
 * Displays the next 3 available appointment slots for a therapist
 * with a link to view the full calendar. Provides quick visibility
 * into therapist availability within the profile sheet.
 *
 * Features:
 * - Shows next 3 available time slots
 * - Responsive day/date/time formatting
 * - "View full calendar" CTA button
 * - Loading and empty states
 *
 * Design:
 * - Clean, scannable slot cards
 * - daybreak-teal accent for CTA
 * - Accessible with proper ARIA labels
 */
"use client";

import * as React from "react";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { format, parseISO } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Represents a single available appointment slot
 */
export interface AvailabilitySlot {
  /** ISO 8601 datetime string */
  datetime: string;
  /** Optional slot ID */
  id?: string;
}

/**
 * Props for ProfileAvailabilitySection component
 */
export interface ProfileAvailabilitySectionProps {
  /** Therapist ID for linking to calendar */
  therapistId: string;
  /** Therapist name for display */
  therapistName: string;
  /** Array of next available slots (provide at least 3) */
  availableSlots?: AvailabilitySlot[];
  /** Callback when "View full calendar" is clicked */
  onViewCalendar?: (therapistId: string) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Formats a datetime slot for display
 *
 * @param datetimeString - ISO 8601 datetime string
 * @returns Object with formatted day, date, and time
 */
function formatSlot(datetimeString: string) {
  try {
    const date = parseISO(datetimeString);
    return {
      dayOfWeek: format(date, "EEEE"), // e.g., "Monday"
      date: format(date, "MMM d"), // e.g., "Dec 4"
      time: format(date, "h:mm a"), // e.g., "2:00 PM"
    };
  } catch {
    // Silently handle invalid date format - return placeholder values
    return {
      dayOfWeek: "—",
      date: "—",
      time: "—",
    };
  }
}

/**
 * Displays next available appointment slots with calendar link
 *
 * Shows up to 3 upcoming slots in a clean, scannable format.
 * Includes a CTA to view the full calendar for more options.
 *
 * Accessibility:
 * - Semantic HTML with proper heading hierarchy
 * - List structure for time slots
 * - Clear button labels for screen readers
 *
 * @example
 * <ProfileAvailabilitySection
 *   therapistId="therapist_123"
 *   therapistName="Dr. Sarah Johnson"
 *   availableSlots={slots}
 *   onViewCalendar={(id) => router.push(`/calendar/${id}`)}
 * />
 */
export function ProfileAvailabilitySection({
  therapistId,
  therapistName,
  availableSlots = [],
  onViewCalendar,
  isLoading = false,
  className,
}: ProfileAvailabilitySectionProps) {
  /**
   * Handles "View full calendar" button click
   */
  function handleViewCalendar() {
    onViewCalendar?.(therapistId);
  }

  // Limit to next 3 slots
  const nextSlots = availableSlots.slice(0, 3);

  return (
    <section
      className={cn("space-y-4", className)}
      aria-labelledby="availability-section-heading"
    >
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-daybreak-teal" aria-hidden="true" />
        <h3
          id="availability-section-heading"
          className="text-lg font-serif font-semibold text-deep-text"
        >
          Next Available
        </h3>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-2" aria-live="polite" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg bg-muted"
              aria-label="Loading availability"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && nextSlots.length === 0 && (
        <div
          className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center"
          role="status"
        >
          <Clock
            className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">
            No immediate availability. View calendar for upcoming slots.
          </p>
        </div>
      )}

      {/* Available Slots */}
      {!isLoading && nextSlots.length > 0 && (
        <ul className="space-y-2" role="list">
          {nextSlots.map((slot, index) => {
            const formatted = formatSlot(slot.datetime);

            return (
              <li
                key={slot.id || index}
                className={cn(
                  "flex items-center justify-between rounded-lg",
                  "border border-muted bg-card px-4 py-3",
                  "transition-colors hover:bg-muted/50"
                )}
              >
                {/* Date and Time */}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-md bg-daybreak-teal/10">
                    <span className="text-xs font-medium text-daybreak-teal">
                      {formatted.date.split(" ")[0]}
                    </span>
                    <span className="text-lg font-bold text-daybreak-teal">
                      {formatted.date.split(" ")[1]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-deep-text">
                      {formatted.dayOfWeek}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {formatted.time}
                    </p>
                  </div>
                </div>

                {/* Select Button (Optional - for future implementation) */}
                {/* Could add a "Select" button here for quick booking */}
              </li>
            );
          })}
        </ul>
      )}

      {/* View Full Calendar CTA */}
      <Button
        variant="outline"
        className={cn(
          "w-full text-daybreak-teal border-daybreak-teal/30",
          "hover:bg-daybreak-teal/10 hover:text-daybreak-teal"
        )}
        onClick={handleViewCalendar}
        aria-label={`View full calendar for ${therapistName}`}
      >
        View Full Calendar
        <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
      </Button>
    </section>
  );
}

ProfileAvailabilitySection.displayName = "ProfileAvailabilitySection";
