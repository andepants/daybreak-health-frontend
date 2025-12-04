/**
 * RecommendedTimeSlots component for appointment scheduling
 *
 * Displays a curated list of recommended time slots based on the user's
 * availability preferences. Designed to limit self-scheduling by showing
 * only the best matching times, with an option to expand and see all.
 *
 * Features:
 * - Shows top 5 slots ranked by preference score
 * - "Best Match" badge on highest-scoring slot
 * - Match reason displayed for each slot
 * - Expandable list to see all available times
 * - Expanded view groups slots by date
 *
 * Visual Design:
 * - Teal accent for selected state
 * - Cream background cards
 * - Clear hierarchy with badges and reasons
 */
"use client";

import * as React from "react";
import { Check, ChevronDown, ChevronUp, Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { TimeSlot } from "./TimeSlotPicker";
import type { TimeBlock } from "@/lib/validations/availability";
import {
  scoreSlotsByPreference,
  groupSlotsByDate,
  formatSlotForDisplay,
  type ScoredSlot,
} from "./utils/slotScoring";

/**
 * Props for RecommendedTimeSlots component
 */
export interface RecommendedTimeSlotsProps {
  /** All available time slots from therapist */
  allSlots: TimeSlot[];
  /** User's availability preferences (from onboarding) */
  userAvailability?: TimeBlock[];
  /** Currently selected slot */
  selectedSlot?: TimeSlot;
  /** Callback when a slot is selected */
  onSlotSelect: (slot: TimeSlot) => void;
  /** User's timezone for display */
  timezone: string;
  /** Loading state */
  isLoading?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

/** Number of slots to show in the initial recommendation view */
const INITIAL_SLOT_COUNT = 5;

/**
 * Renders recommended time slots with preference-based ranking
 *
 * Shows a concise list of best-matching times with the option
 * to expand and see all available slots grouped by date.
 */
export function RecommendedTimeSlots({
  allSlots,
  userAvailability,
  selectedSlot,
  onSlotSelect,
  timezone,
  isLoading = false,
  className,
}: RecommendedTimeSlotsProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  /**
   * Score and sort all slots by user preference
   */
  const scoredSlots = React.useMemo(() => {
    return scoreSlotsByPreference(allSlots, userAvailability, timezone);
  }, [allSlots, userAvailability, timezone]);

  /**
   * Top recommendations (first 5 slots)
   */
  const topRecommendations = React.useMemo(() => {
    return scoredSlots.slice(0, INITIAL_SLOT_COUNT);
  }, [scoredSlots]);

  /**
   * Remaining slots grouped by date for expanded view
   */
  const remainingByDate = React.useMemo(() => {
    return groupSlotsByDate(scoredSlots.slice(INITIAL_SLOT_COUNT), timezone);
  }, [scoredSlots, timezone]);

  /**
   * Count of additional slots beyond initial recommendations
   */
  const remainingCount = scoredSlots.length - INITIAL_SLOT_COUNT;

  /**
   * Handle slot selection
   */
  const handleSlotSelect = React.useCallback(
    (slot: TimeSlot) => {
      onSlotSelect(slot);
    },
    [onSlotSelect]
  );

  /**
   * Check if a slot is selected
   */
  const isSlotSelected = React.useCallback(
    (slot: TimeSlot): boolean => {
      return selectedSlot?.id === slot.id;
    },
    [selectedSlot]
  );

  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-lg border border-gray-200 bg-cream/30 p-6",
          className
        )}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-64" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No slots available
  if (scoredSlots.length === 0) {
    return (
      <div
        className={cn(
          "rounded-lg border border-gray-200 bg-cream/30 p-8 text-center",
          className
        )}
      >
        <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">
          No available time slots found.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Please contact us for assistance with scheduling.
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
          Recommended Times
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {userAvailability && userAvailability.length > 0
            ? "Based on your availability preferences"
            : "Based on upcoming availability"}
        </p>
      </div>

      {/* Recommended Slots */}
      <div className="space-y-3">
        {topRecommendations.map((slot, index) => (
          <SlotCard
            key={slot.id}
            slot={slot}
            isSelected={isSlotSelected(slot)}
            isBestMatch={index === 0}
            onSelect={handleSlotSelect}
            timezone={timezone}
          />
        ))}
      </div>

      {/* Expand Button */}
      {remainingCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-sm text-daybreak-teal hover:text-daybreak-teal/80 hover:bg-daybreak-teal/5"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Show recommended only
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                See all available times ({remainingCount} more)
              </>
            )}
          </Button>
        </div>
      )}

      {/* Expanded View - Slots Grouped by Date */}
      {isExpanded && remainingCount > 0 && (
        <div className="mt-4 space-y-6">
          {Array.from(remainingByDate.entries()).map(([dateLabel, slots]) => (
            <div key={dateLabel}>
              <h4 className="text-sm font-medium text-deep-text mb-3">
                {dateLabel}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <TimeButton
                    key={slot.id}
                    slot={slot}
                    isSelected={isSlotSelected(slot)}
                    onSelect={handleSlotSelect}
                    timezone={timezone}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-muted-foreground text-center">
          All times shown in {timezone.replace(/_/g, " ")}
        </p>
      </div>
    </div>
  );
}

RecommendedTimeSlots.displayName = "RecommendedTimeSlots";

/**
 * Props for SlotCard component
 */
interface SlotCardProps {
  slot: ScoredSlot;
  isSelected: boolean;
  isBestMatch: boolean;
  onSelect: (slot: TimeSlot) => void;
  timezone: string;
}

/**
 * Individual slot card for recommendation view
 *
 * Shows full date/time, match reason, and best match badge
 */
function SlotCard({
  slot,
  isSelected,
  isBestMatch,
  onSelect,
  timezone,
}: SlotCardProps) {
  const formattedDateTime = formatSlotForDisplay(slot.startTime, timezone);

  return (
    <button
      onClick={() => onSelect(slot)}
      className={cn(
        "w-full p-4 rounded-lg border text-left transition-all",
        "focus:outline-none focus:ring-2 focus:ring-daybreak-teal/50",
        isSelected
          ? "bg-daybreak-teal/10 border-daybreak-teal"
          : "bg-white border-gray-200 hover:border-daybreak-teal/50 hover:bg-daybreak-teal/5"
      )}
      aria-pressed={isSelected}
      aria-label={`${formattedDateTime} - ${slot.matchReason}${isBestMatch ? " - Best match" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Best Match Badge */}
          {isBestMatch && (
            <div className="inline-flex items-center gap-1 text-xs font-medium text-daybreak-teal mb-1">
              <Star className="h-3 w-3 fill-current" />
              Best Match
            </div>
          )}

          {/* Date and Time */}
          <p
            className={cn(
              "font-medium",
              isSelected ? "text-daybreak-teal" : "text-deep-text"
            )}
          >
            {formattedDateTime}
          </p>

          {/* Match Reason */}
          <p className="text-sm text-muted-foreground mt-0.5">
            {slot.matchReason}
          </p>
        </div>

        {/* Selected Checkmark */}
        {isSelected && (
          <div className="flex-shrink-0">
            <div className="h-6 w-6 rounded-full bg-daybreak-teal flex items-center justify-center">
              <Check className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
      </div>
    </button>
  );
}

/**
 * Props for TimeButton component
 */
interface TimeButtonProps {
  slot: ScoredSlot;
  isSelected: boolean;
  onSelect: (slot: TimeSlot) => void;
  timezone: string;
}

/**
 * Compact time button for expanded grid view
 *
 * Shows just the time, no date (date is in section header)
 */
function TimeButton({ slot, isSelected, onSelect, timezone }: TimeButtonProps) {
  const time = new Date(slot.startTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  });

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      onClick={() => onSelect(slot)}
      className={cn(
        "relative h-auto py-2 px-3 text-sm font-medium transition-all",
        isSelected
          ? "bg-daybreak-teal hover:bg-daybreak-teal/90 text-white border-daybreak-teal"
          : "bg-white hover:bg-daybreak-teal/10 hover:border-daybreak-teal/50 text-deep-text border-gray-300"
      )}
      aria-pressed={isSelected}
    >
      {time}
      {isSelected && (
        <Check className="absolute top-1 right-1 h-3 w-3" aria-hidden="true" />
      )}
    </Button>
  );
}
