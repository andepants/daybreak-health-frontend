/**
 * AvailabilityForm - Time selection grid for patient availability
 *
 * Displays a weekly calendar grid where users can select time blocks
 * when they're available for therapy sessions. This data is used by
 * the AI matching algorithm to find therapists with overlapping availability.
 *
 * Features:
 * - 7-day × 13-hour grid (8am-8pm)
 * - Click to toggle individual slots
 * - Timezone selector
 * - Selection count display
 * - Responsive: stacked on mobile, grid on desktop
 *
 * Flow:
 * - Previous: /onboarding/[sessionId]/insurance
 * - Next: /onboarding/[sessionId]/matching
 *
 * User Story:
 * As a parent, I want to indicate when I'm available for therapy sessions
 * so that the system can match us with therapists who have compatible schedules.
 */
"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TimezoneSelector } from "@/features/scheduling";
import {
  DAY_OPTIONS,
  TIME_SLOT_OPTIONS,
  type TimeBlock,
  slotsToTimeBlocks,
  timeBlocksToSlots,
} from "@/lib/validations/availability";

/**
 * Props for AvailabilityForm component
 */
export interface AvailabilityFormProps {
  /** Onboarding session ID */
  sessionId: string;
  /** Initial availability data (from localStorage or API) */
  initialData?: {
    availabilities: TimeBlock[];
    timezone: string;
  };
  /** Called when form is submitted with valid data */
  onSubmit: (availabilities: TimeBlock[], timezone: string) => Promise<void>;
  /** Called when back button is clicked */
  onBack: () => void;
  /** Whether submission is in progress */
  isSubmitting?: boolean;
}

/**
 * Renders the availability selection form
 *
 * @example
 * <AvailabilityForm
 *   sessionId={sessionId}
 *   onSubmit={handleSubmit}
 *   onBack={handleBack}
 * />
 */
export function AvailabilityForm({
  sessionId,
  initialData,
  onSubmit,
  onBack,
  isSubmitting = false,
}: AvailabilityFormProps) {
  // Track selected time blocks as a Set of "day-time" keys (e.g., "1-09:00")
  const [selectedSlots, setSelectedSlots] = React.useState<Set<string>>(() => {
    if (initialData?.availabilities) {
      return timeBlocksToSlots(initialData.availabilities);
    }
    return new Set();
  });

  // Timezone state with auto-detection
  const [timezone, setTimezone] = React.useState(
    initialData?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  /**
   * Toggle a slot selection
   */
  const toggleSlot = React.useCallback((day: number, time: string) => {
    const key = `${day}-${time}`;
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    const availabilities = slotsToTimeBlocks(selectedSlots);
    await onSubmit(availabilities, timezone);
  };

  const hasSelection = selectedSlots.size > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-xl font-semibold font-serif text-foreground">
          When are you available?
        </h2>
        <p className="text-muted-foreground text-sm">
          Select all the times that typically work for your family. This helps us
          find therapists with matching availability.
        </p>
      </div>

      {/* Timezone Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <span className="text-sm text-muted-foreground">Your timezone:</span>
        <TimezoneSelector value={timezone} onChange={setTimezone} />
      </div>

      {/* Time Grid */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="min-w-[640px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 gap-1 mb-2">
            <div className="w-16" /> {/* Empty corner */}
            {DAY_OPTIONS.map((day) => (
              <div
                key={day.value}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                <span className="hidden sm:inline">{day.label}</span>
                <span className="sm:hidden">{day.short}</span>
              </div>
            ))}
          </div>

          {/* Time Rows */}
          {TIME_SLOT_OPTIONS.map((time) => (
            <div key={time.value} className="grid grid-cols-8 gap-1 mb-1">
              {/* Time Label */}
              <div className="w-16 text-xs text-muted-foreground flex items-center justify-end pr-2">
                {time.label}
              </div>

              {/* Day Slots */}
              {DAY_OPTIONS.map((day) => {
                const key = `${day.value}-${time.value}`;
                const isSelected = selectedSlots.has(key);

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleSlot(day.value, time.value)}
                    className={cn(
                      "h-10 rounded-md border-2 transition-all",
                      "hover:border-daybreak-teal/50 focus:outline-none focus:ring-2 focus:ring-daybreak-teal/50",
                      isSelected
                        ? "bg-daybreak-teal border-daybreak-teal"
                        : "bg-white border-gray-200 hover:bg-daybreak-teal/10"
                    )}
                    aria-label={`${day.label} at ${time.label} - ${
                      isSelected ? "Selected" : "Available"
                    }`}
                    aria-pressed={isSelected}
                  >
                    {isSelected && (
                      <Check className="h-4 w-4 text-white mx-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selection Summary */}
      <div className="text-center text-sm text-muted-foreground">
        {selectedSlots.size === 0 ? (
          <span className="text-amber-600">
            Please select at least one available time
          </span>
        ) : (
          <span>
            {selectedSlots.size} time slot{selectedSlots.size === 1 ? "" : "s"}{" "}
            selected
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!hasSelection || isSubmitting}
          className="bg-daybreak-teal hover:bg-daybreak-teal/90 text-white"
        >
          {isSubmitting ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
