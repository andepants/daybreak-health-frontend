/**
 * ProfileMatchSection Component
 *
 * Displays personalized match reasons explaining why a specific therapist
 * is recommended for the child. Shows up to 3 match reasons with icons
 * and connections to assessment responses.
 *
 * Features:
 * - Personalized headline with therapist and child names
 * - Up to 3 match reasons with contextual icons
 * - Visual design aligned with Daybreak brand
 * - Accessible with proper ARIA labels
 *
 * Design:
 * - Uses warm-orange accent for section header
 * - daybreak-teal for icons
 * - Clean, scannable layout
 */
"use client";

import * as React from "react";
import {
  Heart,
  CheckCircle,
  Clock,
  Star,
  Target,
  Users,
  Sparkles,
  Brain,
  Shield,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { MatchReason } from "@/types/graphql";

/**
 * Maps match reason icon identifiers to Lucide icons
 * Provides semantic, recognizable icons for different match types
 */
const MATCH_REASON_ICON_MAP: Record<string, React.ElementType> = {
  specialty: Target,
  experience: Star,
  availability: Clock,
  approach: Heart,
  demographic: Users,
  expertise: Brain,
  credentials: Shield,
  match: Sparkles,
  default: CheckCircle,
};

/**
 * Gets the appropriate icon component for a match reason
 * Falls back to CheckCircle if icon identifier not found
 *
 * @param iconIdentifier - Icon identifier from GraphQL (e.g., 'specialty', 'experience')
 * @returns Lucide icon component
 */
function getMatchIcon(iconIdentifier?: string | null): React.ElementType {
  if (!iconIdentifier) return MATCH_REASON_ICON_MAP.default;
  return MATCH_REASON_ICON_MAP[iconIdentifier] || MATCH_REASON_ICON_MAP.default;
}

/**
 * Props for ProfileMatchSection component
 */
export interface ProfileMatchSectionProps {
  /** Full name of the therapist */
  therapistName: string;
  /** Child's first name for personalization */
  childName?: string;
  /** Array of match reasons from GraphQL */
  matchReasons: MatchReason[];
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Displays personalized match reasons for therapist recommendation
 *
 * Shows a headline like "Why Dr. Smith for Emma" followed by
 * 3 specific match reasons with icons explaining the recommendation.
 *
 * Accessibility:
 * - Semantic HTML with proper heading hierarchy
 * - Icon decorations are aria-hidden
 * - List structure for screen readers
 *
 * @example
 * <ProfileMatchSection
 *   therapistName="Dr. Sarah Johnson"
 *   childName="Emma"
 *   matchReasons={therapist.matchReasons}
 * />
 */
export function ProfileMatchSection({
  therapistName,
  childName,
  matchReasons,
  className,
}: ProfileMatchSectionProps) {
  // Get first name from full therapist name for headline
  const therapistFirstName = therapistName.split(" ")[0];

  // Limit to top 3 match reasons for focus
  const topReasons = matchReasons.slice(0, 3);

  if (topReasons.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        "rounded-lg bg-gradient-to-br from-cream to-white",
        "border border-warm-orange/20 p-6 shadow-sm",
        className
      )}
      aria-labelledby="match-section-heading"
    >
      {/* Section Header */}
      <div className="mb-4 border-b border-warm-orange/20 pb-3">
        <h3
          id="match-section-heading"
          className="text-lg font-serif font-semibold text-deep-text"
        >
          {childName
            ? `Why ${therapistFirstName} for ${childName}`
            : `Why ${therapistFirstName}?`}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Based on your assessment responses
        </p>
      </div>

      {/* Match Reasons List */}
      <ul className="space-y-4" role="list">
        {topReasons.map((reason, index) => {
          const IconComponent = getMatchIcon(reason.icon);

          return (
            <li
              key={reason.id || index}
              className="flex items-start gap-3"
            >
              {/* Icon Container */}
              <div
                className={cn(
                  "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center",
                  "rounded-full bg-daybreak-teal/10"
                )}
                aria-hidden="true"
              >
                <IconComponent className="h-5 w-5 text-daybreak-teal" />
              </div>

              {/* Reason Text */}
              <div className="flex-1 pt-1">
                <p className="text-sm leading-relaxed text-deep-text">
                  {reason.text}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Additional Context */}
      {matchReasons.length > 3 && (
        <p className="mt-4 pt-3 border-t border-muted text-xs text-muted-foreground text-center">
          +{matchReasons.length - 3} more matching factor
          {matchReasons.length - 3 === 1 ? "" : "s"}
        </p>
      )}
    </section>
  );
}

ProfileMatchSection.displayName = "ProfileMatchSection";
