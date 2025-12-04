/**
 * Slot scoring utility for ranking time slots by user preference
 *
 * Scores available time slots based on how well they match the user's
 * stated availability preferences. Used to show recommended appointment
 * times that are most convenient for the user.
 *
 * Scoring weights:
 * - Day of week match: 40 points
 * - Time of day match: 35 points
 * - Proximity to now: 15 points
 * - Convenience (mid-day): 10 points
 */

import type { TimeSlot } from "../TimeSlotPicker";
import type { TimeBlock } from "@/lib/validations/availability";
import { getDayName } from "@/lib/validations/availability";

/**
 * Extended TimeSlot with preference scoring information
 */
export interface ScoredSlot extends TimeSlot {
  /** Preference score 0-100 (higher = better match) */
  preferenceScore: number;
  /** Human-readable reason why this slot was recommended */
  matchReason: string;
}

/**
 * Score slots by how well they match user's availability preferences
 *
 * @param slots - Available time slots from therapist
 * @param userAvailability - User's preferred availability times
 * @param timezone - User's timezone for date calculations
 * @returns Sorted array of slots with preference scores (highest first)
 */
export function scoreSlotsByPreference(
  slots: TimeSlot[],
  userAvailability: TimeBlock[] | undefined,
  timezone: string
): ScoredSlot[] {
  // Filter to only available slots
  const availableSlots = slots.filter((slot) => slot.isAvailable);

  // If no user availability preferences, use fallback scoring
  if (!userAvailability || userAvailability.length === 0) {
    return availableSlots
      .map((slot) => {
        const proximityScore = calculateProximityScore(slot.startTime);
        const convenienceScore = calculateConvenienceScore(
          slot.startTime,
          timezone
        );

        return {
          ...slot,
          preferenceScore: proximityScore + convenienceScore,
          matchReason: "Available soon",
        };
      })
      .sort((a, b) => b.preferenceScore - a.preferenceScore);
  }

  // Build lookup sets for O(1) preference matching
  const preferredDays = new Set(userAvailability.map((a) => a.dayOfWeek));
  const preferredHours = new Set(
    userAvailability.map((a) => parseInt(a.startTime.split(":")[0], 10))
  );

  return availableSlots
    .map((slot) => {
      const slotDate = new Date(slot.startTime);

      // Convert to user's timezone for day/hour extraction
      const localDate = new Date(
        slotDate.toLocaleString("en-US", { timeZone: timezone })
      );
      const slotDay = localDate.getDay();
      const slotHour = localDate.getHours();

      let score = 0;
      const reasons: string[] = [];

      // Day of week match (40 points max)
      if (preferredDays.has(slotDay)) {
        score += 40;
        reasons.push(`Matches your ${getDayName(slotDay)} preference`);
      }

      // Time of day match (35 points max)
      if (preferredHours.has(slotHour)) {
        score += 35;
        reasons.push("At your preferred time");
      } else if (
        preferredHours.has(slotHour - 1) ||
        preferredHours.has(slotHour + 1)
      ) {
        // Close to preferred time (partial points)
        score += 20;
        reasons.push("Close to your preferred time");
      }

      // Proximity score (15 points max)
      score += calculateProximityScore(slot.startTime);

      // Convenience score (10 points max)
      score += calculateConvenienceScore(slot.startTime, timezone);

      // Build match reason
      const matchReason =
        reasons.length > 0
          ? reasons[0]
          : score > 15
            ? "Good availability"
            : "Available";

      return {
        ...slot,
        preferenceScore: score,
        matchReason,
      };
    })
    .sort((a, b) => b.preferenceScore - a.preferenceScore);
}

/**
 * Calculate proximity score based on how soon the slot is
 *
 * Slots 1-3 days out score highest, as they're soon but give
 * enough time to prepare. Very immediate slots score lower.
 *
 * @param startTime - ISO 8601 datetime string
 * @returns Score 0-15
 */
function calculateProximityScore(startTime: string): number {
  const slotDate = new Date(startTime);
  const now = new Date();
  const daysFromNow = Math.floor(
    (slotDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Ideal: 1-3 days out
  if (daysFromNow >= 1 && daysFromNow <= 3) return 15;
  // Good: 4-7 days out
  if (daysFromNow >= 4 && daysFromNow <= 7) return 12;
  // Okay: 1-2 weeks out
  if (daysFromNow >= 8 && daysFromNow <= 14) return 8;
  // Less ideal: today (rushed) or far out
  if (daysFromNow === 0) return 5;
  return 4;
}

/**
 * Calculate convenience score based on time of day
 *
 * Mid-day slots (10am-4pm) are generally most convenient
 * for therapy sessions.
 *
 * @param startTime - ISO 8601 datetime string
 * @param timezone - User's timezone
 * @returns Score 0-10
 */
function calculateConvenienceScore(startTime: string, timezone: string): number {
  const slotDate = new Date(startTime);
  const localDate = new Date(
    slotDate.toLocaleString("en-US", { timeZone: timezone })
  );
  const hour = localDate.getHours();

  // Prime time: 10am-4pm
  if (hour >= 10 && hour <= 16) return 10;
  // Good: 8-10am or 4-6pm
  if ((hour >= 8 && hour < 10) || (hour > 16 && hour <= 18)) return 6;
  // Less ideal: early morning or evening
  return 2;
}

/**
 * Group scored slots by date for expanded view
 *
 * @param slots - Array of scored slots
 * @param timezone - User's timezone for date formatting
 * @returns Map of date strings to slots for that date
 */
export function groupSlotsByDate(
  slots: ScoredSlot[],
  timezone: string
): Map<string, ScoredSlot[]> {
  const grouped = new Map<string, ScoredSlot[]>();

  for (const slot of slots) {
    const slotDate = new Date(slot.startTime);
    const dateKey = slotDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: timezone,
    });

    const existing = grouped.get(dateKey) || [];
    existing.push(slot);
    grouped.set(dateKey, existing);
  }

  return grouped;
}

/**
 * Format a slot's datetime for display in the recommendation card
 *
 * @param startTime - ISO 8601 datetime string
 * @param timezone - User's timezone
 * @returns Formatted string like "Wednesday, Dec 11 at 3:00 PM"
 */
export function formatSlotForDisplay(
  startTime: string,
  timezone: string
): string {
  const date = new Date(startTime);

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: timezone,
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  };

  const formattedDate = date.toLocaleDateString("en-US", dateOptions);
  const formattedTime = date.toLocaleTimeString("en-US", timeOptions);

  return `${formattedDate} at ${formattedTime}`;
}
