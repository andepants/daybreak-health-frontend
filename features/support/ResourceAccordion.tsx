/**
 * ResourceAccordion component for expandable resource sections
 *
 * Displays a collapsible "Learn More" section containing curated resources.
 * Uses progressive disclosure - collapsed by default to avoid overwhelming users.
 * Built on top of the base Accordion component.
 */
"use client";

import * as React from "react";
import { BookOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { type SupportResource } from "@/lib/data/support-resources";
import { ResourceCard } from "./ResourceCard";

/**
 * Props for ResourceAccordion component
 */
export interface ResourceAccordionProps {
  /** Section title */
  title: string;
  /** Array of resources to display */
  resources: SupportResource[];
  /** Whether to default open */
  defaultOpen?: boolean;
  /** Maximum number of resources to show initially */
  maxVisible?: number;
  /** Additional className */
  className?: string;
  /** Resource card variant */
  cardVariant?: "compact" | "full";
}

/**
 * ResourceAccordion component
 *
 * Renders an expandable section with curated resources.
 * Follows progressive disclosure pattern - collapsed by default
 * to keep forms clean and focused.
 *
 * @example
 * ```tsx
 * <ResourceAccordion
 *   title="Helpful Resources"
 *   resources={getResourcesByTopic("getting-started")}
 *   maxVisible={3}
 * />
 * ```
 */
export function ResourceAccordion({
  title,
  resources,
  defaultOpen = false,
  maxVisible = 3,
  className,
  cardVariant = "compact",
}: ResourceAccordionProps) {
  const [showAll, setShowAll] = React.useState(false);

  if (!resources.length) {
    return null;
  }

  const visibleResources = showAll ? resources : resources.slice(0, maxVisible);
  const hasMore = resources.length > maxVisible;

  return (
    <div className={cn("mt-6", className)}>
      <Accordion
        type="single"
        collapsible
        defaultValue={defaultOpen ? "resources" : undefined}
      >
        <AccordionItem
          value="resources"
          className="border rounded-lg bg-muted/30 px-4"
        >
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-daybreak-teal/10">
                <BookOpen className="h-4 w-4 text-daybreak-teal" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {title}
              </span>
              <span className="text-xs text-muted-foreground">
                ({resources.length} resource{resources.length !== 1 ? "s" : ""})
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="space-y-1 pt-1">
              {visibleResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  variant={cardVariant}
                />
              ))}
              {hasMore && !showAll && (
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="w-full py-2 text-sm text-daybreak-teal hover:underline"
                >
                  Show {resources.length - maxVisible} more resources
                </button>
              )}
              {showAll && hasMore && (
                <button
                  type="button"
                  onClick={() => setShowAll(false)}
                  className="w-full py-2 text-sm text-muted-foreground hover:underline"
                >
                  Show less
                </button>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
