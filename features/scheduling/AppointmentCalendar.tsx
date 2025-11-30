/**
 * AppointmentCalendar component for selecting an appointment date
 *
 * Displays a month-view calendar with available dates highlighted.
 * Integrates with the base Calendar component from shadcn/ui and adds
 * Daybreak-specific styling and availability logic.
 *
 * Features:
 * - Month navigation with arrow buttons
 * - Available dates highlighted in teal
 * - Today's date marked
 * - Unavailable dates grayed out and disabled
 * - Selected date highlighted with teal background
 *
 * Visual Design:
 * - Uses daybreak-teal for available and selected states
 * - Fraunces font for month/year header
 * - Inter for day numbers
 * - Cream background for calendar container
 *
 * Accessibility:
 * - Keyboard navigation (arrow keys, Tab, Enter)
 * - ARIA labels for date states
 * - Screen reader announcements for selection
 */
"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

/**
 * Props for AppointmentCalendar component
 * @param availableDates - Array of Date objects representing days with available slots
 * @param selectedDate - Currently selected date
 * @param onDateSelect - Callback when a date is selected
 * @param minDate - Earliest date that can be selected (default: today)
 * @param maxDate - Latest date that can be selected (default: 3 months from today)
 * @param className - Optional additional CSS classes
 */
export interface AppointmentCalendarProps {
  availableDates: Date[];
  selectedDate?: Date;
  onDateSelect: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

/**
 * Renders a calendar for appointment date selection with availability highlighting
 *
 * Performance:
 * - Memoized date comparison functions
 * - Efficient availability lookup using Set
 *
 * @example
 * <AppointmentCalendar
 *   availableDates={[new Date('2024-01-15'), new Date('2024-01-16')]}
 *   selectedDate={selectedDate}
 *   onDateSelect={setSelectedDate}
 * />
 */
export function AppointmentCalendar({
  availableDates,
  selectedDate,
  onDateSelect,
  minDate = new Date(),
  maxDate = new Date(new Date().setMonth(new Date().getMonth() + 3)),
  className,
}: AppointmentCalendarProps) {
  /**
   * Create a Set of date strings for O(1) availability lookup
   * Format: YYYY-MM-DD
   */
  const availableDateStrings = React.useMemo(() => {
    return new Set(
      availableDates.map((date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      })
    );
  }, [availableDates]);

  /**
   * Check if a date is available for booking
   * @param date - Date to check
   * @returns true if date has available slots
   */
  const isDateAvailable = React.useCallback(
    (date: Date): boolean => {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      return availableDateStrings.has(dateStr);
    },
    [availableDateStrings]
  );

  /**
   * Disable dates that are:
   * - Before minDate
   * - After maxDate
   * - Not in availableDates array (no available slots)
   */
  const disabledMatcher = React.useCallback(
    (date: Date): boolean => {
      // Normalize dates to midnight for comparison
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      const normalizedMin = new Date(minDate);
      normalizedMin.setHours(0, 0, 0, 0);

      const normalizedMax = new Date(maxDate);
      normalizedMax.setHours(0, 0, 0, 0);

      // Check if date is outside range
      if (normalizedDate < normalizedMin || normalizedDate > normalizedMax) {
        return true;
      }

      // Check if date has no available slots
      return !isDateAvailable(date);
    },
    [minDate, maxDate, isDateAvailable]
  );

  /**
   * Custom day cell modifier for available dates
   * Adds teal border/background to dates with availability
   */
  const modifiers = React.useMemo(
    () => ({
      available: (date: Date) => isDateAvailable(date),
    }),
    [isDateAvailable]
  );

  /**
   * Custom class names for modified day cells
   */
  const modifiersClassNames = React.useMemo(
    () => ({
      available:
        "border-2 border-daybreak-teal/30 hover:border-daybreak-teal/50 font-medium",
    }),
    []
  );

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-cream/30 p-4 shadow-sm",
        className
      )}
    >
      {/* Calendar Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold font-serif text-deep-text">
          Select a Date
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Dates with available time slots are highlighted
        </p>
      </div>

      {/* Calendar Component */}
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        disabled={disabledMatcher}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        className="mx-auto"
        classNames={{
          month_caption: "flex justify-center pt-1 relative items-center mb-4",
          caption_label: "text-base font-semibold font-serif text-deep-text",
          nav: "space-x-1 flex items-center",
          button_previous: cn(
            "absolute left-1 h-8 w-8 bg-white hover:bg-gray-50 border border-gray-200 rounded-md transition-colors"
          ),
          button_next: cn(
            "absolute right-1 h-8 w-8 bg-white hover:bg-gray-50 border border-gray-200 rounded-md transition-colors"
          ),
          month_grid: "w-full border-collapse space-y-1",
          weekdays: "flex",
          weekday:
            "text-muted-foreground rounded-md w-10 font-medium text-sm uppercase",
          week: "flex w-full mt-2",
          day_button: cn(
            "h-10 w-10 p-0 font-normal transition-all hover:bg-daybreak-teal/10",
            "aria-selected:bg-daybreak-teal aria-selected:text-white",
            "aria-selected:hover:bg-daybreak-teal/90 aria-selected:hover:text-white"
          ),
          selected:
            "bg-daybreak-teal text-white hover:bg-daybreak-teal/90 hover:text-white focus:bg-daybreak-teal focus:text-white",
          today: "bg-warm-orange/20 text-deep-text font-semibold",
          outside: "text-muted-foreground opacity-30",
          disabled: "text-muted-foreground opacity-30 cursor-not-allowed",
        }}
        fromDate={minDate}
        toDate={maxDate}
        defaultMonth={selectedDate || minDate}
      />

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-daybreak-teal/30 bg-white" />
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-daybreak-teal" />
            <span className="text-muted-foreground">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-warm-orange/20" />
            <span className="text-muted-foreground">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}

AppointmentCalendar.displayName = "AppointmentCalendar";
