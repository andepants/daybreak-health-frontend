/**
 * Calendar component built with react-day-picker
 *
 * Provides a date selection interface with month/year navigation.
 * Styled to match Daybreak design system with custom navigation.
 * Supports single date selection, range selection, and disabled dates.
 * Includes dropdown selectors for easy month and year navigation.
 */
"use client";

import * as React from "react";
import { DayPicker, DayPickerProps } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = DayPickerProps & {
  /** Enable dropdown selectors for month and year navigation */
  showDropdowns?: boolean;
};

/**
 * Calendar component for date selection
 *
 * Features:
 * - Month/year navigation with dropdowns
 * - Keyboard accessible (arrow keys, Enter, Escape)
 * - Customizable date range restrictions
 * - Daybreak-themed styling
 *
 * @param className - Additional CSS classes
 * @param classNames - Object to customize internal element classes
 * @param showOutsideDays - Whether to show days from adjacent months
 *
 * @example
 * <Calendar
 *   mode="single"
 *   selected={date}
 *   onSelect={setDate}
 *   disabled={(date) => date > new Date()}
 * />
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  showDropdowns = false,
  ...props
}: CalendarProps) {
  // Default year range: 10 years back to 10 years forward
  const currentYear = new Date().getFullYear();
  const defaultStartMonth = new Date(currentYear - 10, 0);
  const defaultEndMonth = new Date(currentYear + 10, 11);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={showDropdowns ? "dropdown" : "label"}
      startMonth={showDropdowns ? (props.startMonth ?? defaultStartMonth) : props.startMonth}
      endMonth={showDropdowns ? (props.endMonth ?? defaultEndMonth) : props.endMonth}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: cn(
          "text-base font-semibold font-serif text-deep-text",
          showDropdowns && "hidden"
        ),
        dropdowns: "flex gap-2 items-center justify-center",
        dropdown: cn(
          "appearance-none bg-white border border-gray-200 rounded-md",
          "px-2 py-1 text-sm font-medium text-deep-text",
          "hover:border-daybreak-teal/50 focus:outline-none focus:ring-2 focus:ring-daybreak-teal/30",
          "cursor-pointer transition-colors duration-150"
        ),
        months_dropdown: "font-serif",
        years_dropdown: "font-serif",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          "absolute left-3 h-8 w-8 flex items-center justify-center",
          "bg-white border border-gray-200 rounded-md",
          "hover:bg-gray-50 hover:border-daybreak-teal/50",
          "transition-colors duration-150",
          showDropdowns && "hidden"
        ),
        button_next: cn(
          "absolute right-3 h-8 w-8 flex items-center justify-center",
          "bg-white border border-gray-200 rounded-md",
          "hover:bg-gray-50 hover:border-daybreak-teal/50",
          "transition-colors duration-150",
          showDropdowns && "hidden"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
        ),
        range_start: "day-range-start",
        range_end: "day-range-end",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className="h-4 w-4 text-gray-600" />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
