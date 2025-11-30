/**
 * WhatsNext Component
 *
 * Displays "What's Next" information after successful appointment booking.
 * Provides guidance on next steps and what to expect.
 *
 * Visual Design:
 * - Clean list of next steps
 * - Icons for visual hierarchy
 * - Easy-to-read typography
 * - Warm, reassuring tone
 *
 * @module features/scheduling/WhatsNext
 */

"use client";

import * as React from "react";
import { Mail, Link as LinkIcon, Calendar } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Props for WhatsNext component
 */
export interface WhatsNextProps {
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Information about next steps after booking
 */
const NEXT_STEPS = [
  {
    icon: Mail,
    title: "Check your email",
    description: "A confirmation email has been sent with all appointment details",
  },
  {
    icon: LinkIcon,
    title: "Join link coming soon",
    description: "You&apos;ll receive the video call link 24 hours before your appointment",
  },
  {
    icon: Calendar,
    title: "Flexible scheduling",
    description: "Need to change plans? You can reschedule or cancel anytime",
  },
] as const;

/**
 * Renders the "What's Next" information section
 *
 * Accessibility:
 * - Semantic HTML with proper list structure
 * - Clear headings and descriptions
 * - Icon labels for screen readers
 *
 * @example
 * <WhatsNext />
 */
export function WhatsNext({ className }: WhatsNextProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-serif font-semibold text-deep-text">
        What&apos;s next?
      </h3>

      <ul className="space-y-4">
        {NEXT_STEPS.map((step) => {
          const IconComponent = step.icon;

          return (
            <li key={step.title} className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-daybreak-teal/10">
                <IconComponent
                  className="h-5 w-5 text-daybreak-teal"
                  aria-hidden="true"
                />
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <h4 className="text-base font-medium text-deep-text">
                  {step.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Additional Help */}
      <div className="mt-6 rounded-lg bg-cream/50 border border-warm-orange/20 p-4">
        <p className="text-sm text-deep-text">
          <span className="font-medium">Need help?</span> Contact us at{" "}
          <a
            href="mailto:support@daybreakhealth.com"
            className="text-daybreak-teal hover:text-daybreak-teal/80 underline underline-offset-2"
          >
            support@daybreakhealth.com
          </a>
        </p>
      </div>
    </div>
  );
}

WhatsNext.displayName = "WhatsNext";
