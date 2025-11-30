/**
 * MatchRationale component for explaining therapist matching criteria
 *
 * Displays an expandable "Why these therapists?" section that explains
 * the matching algorithm and criteria used to recommend therapists.
 * Provides transparency per architecture pre-mortem requirement.
 *
 * Visual Design:
 * - Accordion-based expandable section
 * - Clear, warm, supportive tone
 * - Organized list of matching criteria
 * - Icons for visual interest
 *
 * Accessibility:
 * - Keyboard navigable accordion
 * - Screen reader friendly
 * - Clear focus indicators
 */
"use client";

import * as React from "react";
import { CheckCircle, Clock, Heart, Star, Target } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * Props for MatchRationale component
 * @param matchingCriteria - General explanation of matching criteria from backend
 * @param className - Optional additional CSS classes
 */
export interface MatchRationaleProps {
  matchingCriteria?: string;
  className?: string;
}

/**
 * Default matching criteria if backend doesn't provide custom explanation
 */
const DEFAULT_CRITERIA = [
  {
    icon: Target,
    title: "Specialty Match",
    description:
      "We match therapists based on their specialized training and experience with concerns similar to yours.",
  },
  {
    icon: Clock,
    title: "Availability",
    description:
      "We prioritize therapists who can see you soon and have regular availability that fits your schedule.",
  },
  {
    icon: Star,
    title: "Experience & Credentials",
    description:
      "All our therapists are licensed professionals with verified credentials and proven experience working with teens and families.",
  },
  {
    icon: Heart,
    title: "Personal Fit",
    description:
      "We consider communication styles, therapeutic approaches, and personal preferences to ensure a comfortable, supportive relationship.",
  },
];

/**
 * Renders expandable section explaining therapist matching criteria
 *
 * Features:
 * - Accordion interface for showing/hiding details
 * - Icons for each matching criterion
 * - Warm, reassuring tone
 * - Transparency about matching algorithm
 *
 * Accessibility:
 * - Keyboard navigable (Space/Enter to toggle)
 * - ARIA attributes via Radix Accordion
 * - Clear focus states
 *
 * @example
 * <MatchRationale
 *   matchingCriteria="We matched therapists based on anxiety specialization..."
 * />
 */
export function MatchRationale({
  matchingCriteria,
  className,
}: MatchRationaleProps) {
  return (
    <div className={cn("w-full max-w-[640px] mx-auto", className)}>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="matching-criteria" className="border-none">
          <AccordionTrigger className="text-base font-medium text-deep-text hover:text-daybreak-teal hover:no-underline transition-colors">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-daybreak-teal" />
              <span>Why these therapists?</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-2">
            <div className="space-y-6">
              {/* Custom matching criteria from backend (if provided) */}
              {matchingCriteria && (
                <div className="rounded-lg bg-cream/50 border border-daybreak-teal/20 p-4">
                  <p className="text-sm text-muted-foreground">
                    {matchingCriteria}
                  </p>
                </div>
              )}

              {/* Standard matching criteria */}
              <div className="space-y-4">
                <p className="text-sm font-medium text-deep-text">
                  Our matching considers several factors:
                </p>

                <div className="space-y-4">
                  {DEFAULT_CRITERIA.map((criterion) => {
                    const IconComponent = criterion.icon;
                    return (
                      <div
                        key={criterion.title}
                        className="flex items-start gap-3"
                      >
                        <div className="mt-0.5 shrink-0">
                          <IconComponent className="h-5 w-5 text-daybreak-teal" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-deep-text">
                            {criterion.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {criterion.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reassurance message */}
              <div className="rounded-lg bg-warm-orange/10 border border-warm-orange/30 p-4">
                <p className="text-sm text-deep-text">
                  <strong className="font-medium">Remember:</strong> You can
                  always switch therapists if the first match isn&apos;t quite
                  right. We&apos;re here to help you find the best fit for your
                  family.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

MatchRationale.displayName = "MatchRationale";
