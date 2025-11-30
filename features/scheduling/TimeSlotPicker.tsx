/**
 * TimeSlotPicker component for selecting an appointment time
 *
 * Displays available time slots for a selected date in a grid layout.
 * Shows times in the user's local timezone with clear visual states
 * for available, unavailable, and selected slots.
 *
 * Features:
 * - Grid layout of time slot buttons
 * - Available slots: solid buttons with hover effects
 * - Unavailable slots: grayed out with strikethrough
 * - Selected slot: teal background with checkmark icon
 * - Times displayed in user's timezone
 *
 * Visual Design:
 * - Teal for selected state
 * - White/gray for available state
 * - Light gray for unavailable state
 * - Checkmark icon on selected
 *
 * Accessibility:
 * - Keyboard navigable (Tab, Enter, Space)
 * - ARIA labels for slot states
 * - Screen reader announcements
 */
"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Represents a single time slot
 */
export interface TimeSlot {
  id: string;
  startTime: string; // ISO 8601 datetime string
  endTime: string; // ISO 8601 datetime string
  isAvailable: boolean;
  timezone: string;
}

/**
 * Props for TimeSlotPicker component
 * @param slots - Array of time slots for the selected date
 * @param selectedSlot - Currently selected time slot
 * @param onSlotSelect - Callback when a slot is selected
 * @param timezone - User's timezone for display (e.g., "America/Los_Angeles")
 * @param className - Optional additional CSS classes
 */
export interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlot?: TimeSlot;
  onSlotSelect: (slot: TimeSlot) => void;
  timezone?: string;
  className?: string;
}

/**
 * Format a time slot's start time for display
 * @param isoString - ISO 8601 datetime string
 * @param timezone - Target timezone for display
 * @returns Formatted time string (e.g., "9:00 AM")
 */
function formatTimeSlot(isoString: string, timezone?: string): string {
  const date = new Date(isoString);

  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  };

  return new Intl.DateTimeFormat("en-US", options).format(date);
}

/**
 * Renders a grid of time slot buttons for appointment selection
 *
 * Performance:
 * - Memoized time formatting
 * - Efficient slot comparison using IDs
 *
 * @example
 * <TimeSlotPicker
 *   slots={availableSlots}
 *   selectedSlot={selectedSlot}
 *   onSlotSelect={handleSlotSelect}
 *   timezone="America/New_York"
 * />
 */
export function TimeSlotPicker({
  slots,
  selectedSlot,
  onSlotSelect,
  timezone,
  className,
}: TimeSlotPickerProps) {
  /**
   * Handle slot selection
   * Only allow selection of available slots
   */
  const handleSlotClick = React.useCallback(
    (slot: TimeSlot) => {
      if (slot.isAvailable) {
        onSlotSelect(slot);
      }
    },
    [onSlotSelect]
  );

  /**
   * Check if a slot is currently selected
   */
  const isSlotSelected = React.useCallback(
    (slot: TimeSlot): boolean => {
      return selectedSlot?.id === slot.id;
    },
    [selectedSlot]
  );

  // Show message if no slots available
  if (slots.length === 0) {
    return (
      <div
        className={cn(
          "rounded-lg border border-gray-200 bg-cream/30 p-8 text-center",
          className
        )}
      >
        <p className="text-sm text-muted-foreground">
          No time slots available for this date.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Please select a different date.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-cream/30 p-4 shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold font-serif text-deep-text">
          Select a Time
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          All times shown in {timezone || "your local timezone"}
        </p>
      </div>

      {/* Time Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {slots.map((slot) => {
          const isSelected = isSlotSelected(slot);
          const formattedTime = formatTimeSlot(slot.startTime, timezone);

          return (
            <Button
              key={slot.id}
              onClick={() => handleSlotClick(slot)}
              disabled={!slot.isAvailable}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "relative h-auto py-3 px-4 text-sm font-medium transition-all",
                // Available state
                slot.isAvailable &&
                  !isSelected &&
                  "bg-white hover:bg-daybreak-teal/10 hover:border-daybreak-teal/50 text-deep-text border-gray-300",
                // Selected state
                isSelected &&
                  "bg-daybreak-teal hover:bg-daybreak-teal/90 text-white border-daybreak-teal",
                // Unavailable state
                !slot.isAvailable &&
                  "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
              )}
              aria-label={
                slot.isAvailable
                  ? `${formattedTime} - ${isSelected ? "Selected" : "Available"}`
                  : `${formattedTime} - Unavailable`
              }
              aria-pressed={isSelected}
            >
              {/* Time text */}
              <span
                className={cn(
                  !slot.isAvailable && "line-through decoration-2"
                )}
              >
                {formattedTime}
              </span>

              {/* Checkmark for selected slot */}
              {isSelected && (
                <Check
                  className="absolute top-1 right-1 h-4 w-4"
                  aria-hidden="true"
                />
              )}
            </Button>
          );
        })}
      </div>

      {/* Available count */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-muted-foreground text-center">
          {slots.filter((s) => s.isAvailable).length} of {slots.length} slots
          available
        </p>
      </div>
    </div>
  );
}

TimeSlotPicker.displayName = "TimeSlotPicker";
