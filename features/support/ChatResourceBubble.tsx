/**
 * ChatResourceBubble component for displaying resources in chat
 *
 * Renders a special message bubble showing recommended resources
 * during the AI assessment conversation. Visually distinct from
 * regular chat messages with a warm, supportive appearance.
 */
"use client";

import * as React from "react";
import { Lightbulb, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { type SupportResource } from "@/lib/data/support-resources";
import { ResourceCard } from "./ResourceCard";

/**
 * Props for ChatResourceBubble component
 */
export interface ChatResourceBubbleProps {
  /** Resources to display (max 3 recommended) */
  resources: SupportResource[];
  /** Optional title for the bubble */
  title?: string;
  /** Callback when "See all" is clicked */
  onSeeAll?: () => void;
  /** Additional className */
  className?: string;
}

/**
 * ChatResourceBubble component
 *
 * Displays recommended resources in a chat-style bubble.
 * Limited to 3 resources with "See all" link for more.
 *
 * @example
 * ```tsx
 * <ChatResourceBubble
 *   resources={getFeaturedResources().slice(0, 3)}
 *   title="While you're here..."
 *   onSeeAll={() => setIsResourcePanelOpen(true)}
 * />
 * ```
 */
export function ChatResourceBubble({
  resources,
  title = "Helpful Resources",
  onSeeAll,
  className,
}: ChatResourceBubbleProps) {
  // Limit to 3 resources max
  const displayResources = resources.slice(0, 3);

  if (displayResources.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "max-w-[85%] rounded-2xl p-4 space-y-3",
        "bg-amber-50 border border-amber-200/50",
        "dark:bg-amber-950/30 dark:border-amber-800/30",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50">
          <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
          {title}
        </span>
      </div>

      {/* Resources */}
      <div className="space-y-2">
        {displayResources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            variant="compact"
            className="bg-white/60 dark:bg-background/60 hover:bg-white dark:hover:bg-background"
          />
        ))}
      </div>

      {/* See all link */}
      {onSeeAll && resources.length > 0 && (
        <button
          type="button"
          onClick={onSeeAll}
          className={cn(
            "w-full flex items-center justify-center gap-1",
            "py-2 text-sm font-medium",
            "text-amber-700 dark:text-amber-300",
            "hover:text-amber-900 dark:hover:text-amber-100",
            "transition-colors"
          )}
        >
          Browse all resources
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
