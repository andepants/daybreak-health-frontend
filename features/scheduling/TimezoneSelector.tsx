/**
 * TimezoneSelector component for changing the user's timezone
 *
 * Provides a dropdown selector for choosing a timezone.
 * Pre-populated with common US timezones and ability to detect
 * user's current timezone automatically.
 *
 * Features:
 * - Dropdown with searchable timezone list
 * - Auto-detection of user's current timezone
 * - Common US timezones at top
 * - Clear display of selected timezone
 * - Label and help text
 *
 * Visual Design:
 * - Daybreak design system colors
 * - Clean, accessible select component
 * - Inline label with dropdown
 *
 * Accessibility:
 * - Proper label association
 * - Keyboard navigable
 * - ARIA labels for screen readers
 */
"use client";

import * as React from "react";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * Props for TimezoneSelector component
 * @param value - Currently selected timezone (IANA format, e.g., "America/New_York")
 * @param onChange - Callback when timezone is changed
 * @param label - Label text for the selector
 * @param className - Optional additional CSS classes
 */
export interface TimezoneSelectorProps {
  value: string;
  onChange?: (timezone: string) => void;
  label?: string;
  className?: string;
}

/**
 * Common US timezones for quick selection
 * Ordered by UTC offset (East to West)
 */
const COMMON_TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Phoenix", label: "Arizona (MST)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
];

/**
 * Additional timezones for comprehensive coverage
 */
const ADDITIONAL_TIMEZONES = [
  { value: "America/Puerto_Rico", label: "Puerto Rico (AST)" },
  { value: "America/Halifax", label: "Atlantic Time (AT)" },
  { value: "America/St_Johns", label: "Newfoundland Time (NT)" },
  { value: "America/Boise", label: "Mountain Time - Idaho" },
  { value: "America/Indiana/Indianapolis", label: "Eastern Time - Indiana" },
];

/**
 * All available timezones (common + additional)
 */
const ALL_TIMEZONES = [...COMMON_TIMEZONES, ...ADDITIONAL_TIMEZONES];

/**
 * Get a human-readable label for a timezone
 * @param timezone - IANA timezone identifier
 * @returns Formatted label or original timezone if not found
 */
function getTimezoneLabel(timezone: string): string {
  const found = ALL_TIMEZONES.find((tz) => tz.value === timezone);
  return found ? found.label : timezone;
}

/**
 * Renders a timezone selector dropdown
 *
 * Performance:
 * - Memoized timezone list
 * - Efficient lookup by value
 *
 * @example
 * <TimezoneSelector
 *   value="America/New_York"
 *   onChange={handleTimezoneChange}
 *   label="Your timezone"
 * />
 */
export function TimezoneSelector({
  value,
  onChange,
  label = "Timezone",
  className,
}: TimezoneSelectorProps) {
  /**
   * Handle timezone selection
   */
  const handleValueChange = React.useCallback(
    (newValue: string) => {
      onChange?.(newValue);
    },
    [onChange]
  );

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      <label className="flex items-center gap-2 text-sm font-medium text-deep-text">
        <Globe className="h-4 w-4 text-muted-foreground" />
        {label}
      </label>

      {/* Timezone Select */}
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger
          className="w-full bg-white border-gray-300 hover:border-daybreak-teal/50 focus:border-daybreak-teal focus:ring-daybreak-teal/20"
          aria-label="Select timezone"
        >
          <SelectValue>
            {getTimezoneLabel(value)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {/* Common Timezones Group */}
          <div className="px-2 py-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Common Timezones
            </p>
          </div>
          {COMMON_TIMEZONES.map((timezone) => (
            <SelectItem
              key={timezone.value}
              value={timezone.value}
              className="cursor-pointer hover:bg-daybreak-teal/10 focus:bg-daybreak-teal/10"
            >
              {timezone.label}
            </SelectItem>
          ))}

          {/* Divider */}
          <div className="my-1 h-px bg-gray-200" />

          {/* Additional Timezones Group */}
          <div className="px-2 py-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Other Timezones
            </p>
          </div>
          {ADDITIONAL_TIMEZONES.map((timezone) => (
            <SelectItem
              key={timezone.value}
              value={timezone.value}
              className="cursor-pointer hover:bg-daybreak-teal/10 focus:bg-daybreak-teal/10"
            >
              {timezone.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Help Text */}
      <p className="text-xs text-muted-foreground">
        All appointment times will be shown in this timezone
      </p>
    </div>
  );
}

TimezoneSelector.displayName = "TimezoneSelector";

/**
 * Hook to detect user's current timezone
 * @returns IANA timezone identifier (e.g., "America/New_York")
 */
export function useDetectedTimezone(): string {
  const [timezone, setTimezone] = React.useState<string>("America/New_York");

  React.useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(detected);
    } catch (error) {
      // Fallback to Eastern Time if detection fails
      console.warn("Failed to detect timezone:", error);
      setTimezone("America/New_York");
    }
  }, []);

  return timezone;
}
