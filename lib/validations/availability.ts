/**
 * Zod validation schemas for patient availability
 *
 * Provides validation for patient availability time block selection
 * used in the onboarding flow before therapist matching.
 */

import { z } from "zod";

/**
 * Day of week options (0=Sunday, 6=Saturday)
 */
export const DAY_OPTIONS = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
] as const;

/**
 * Time slot options (hourly from 8am to 8pm)
 */
export const TIME_SLOT_OPTIONS = [
  { value: "08:00", label: "8:00 AM" },
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "17:00", label: "5:00 PM" },
  { value: "18:00", label: "6:00 PM" },
  { value: "19:00", label: "7:00 PM" },
  { value: "20:00", label: "8:00 PM" },
] as const;

/**
 * Single time block schema
 */
export const timeBlockSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  durationMinutes: z.number().min(30).max(480).default(60),
});

/**
 * Full availability submission schema
 */
export const patientAvailabilitySchema = z.object({
  availabilities: z
    .array(timeBlockSchema)
    .min(1, "Please select at least one available time"),
  timezone: z.string().min(1, "Timezone is required"),
});

/**
 * TypeScript types inferred from schemas
 */
export type TimeBlock = z.infer<typeof timeBlockSchema>;
export type PatientAvailabilityInput = z.infer<typeof patientAvailabilitySchema>;

/**
 * Convert selected slots (Set of "day-time" keys) to TimeBlock array
 *
 * @param selectedSlots Set of keys like "1-09:00" (Monday 9am)
 * @returns Array of TimeBlock objects
 */
export function slotsToTimeBlocks(selectedSlots: Set<string>): TimeBlock[] {
  return Array.from(selectedSlots).map((key) => {
    const [day, time] = key.split("-");
    return {
      dayOfWeek: parseInt(day, 10),
      startTime: time,
      durationMinutes: 60,
    };
  });
}

/**
 * Convert TimeBlock array to Set of slot keys
 *
 * @param timeBlocks Array of TimeBlock objects
 * @returns Set of keys like "1-09:00"
 */
export function timeBlocksToSlots(timeBlocks: TimeBlock[]): Set<string> {
  return new Set(
    timeBlocks.map((block) => `${block.dayOfWeek}-${block.startTime}`)
  );
}

/**
 * Get human-readable day name from day number
 *
 * @param dayOfWeek Day number (0-6)
 * @returns Day name (e.g., "Monday")
 */
export function getDayName(dayOfWeek: number): string {
  const day = DAY_OPTIONS.find((d) => d.value === dayOfWeek);
  return day?.label ?? "Unknown";
}

/**
 * Format time for display
 *
 * @param time Time string in HH:MM format
 * @returns Formatted time (e.g., "9:00 AM")
 */
export function formatTime(time: string): string {
  const slot = TIME_SLOT_OPTIONS.find((t) => t.value === time);
  return slot?.label ?? time;
}
