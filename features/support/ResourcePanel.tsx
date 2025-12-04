/**
 * ResourcePanel component for browsing support resources
 *
 * A sheet-based panel that displays all available support resources.
 * Opens from bottom on mobile, right side on desktop.
 * Includes topic filtering and search functionality.
 */
"use client";

import * as React from "react";
import { Search, BookOpen, Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  SUPPORT_RESOURCES,
  RESOURCE_TOPICS,
  type ResourceTopic,
  type SupportResource,
} from "@/lib/data/support-resources";
import { ResourceCard } from "./ResourceCard";

/**
 * Props for ResourcePanel component
 */
export interface ResourcePanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Optional topics to filter by default */
  filterTopics?: ResourceTopic[];
  /** Source context (affects display) */
  source?: "chat" | "form";
  /** Additional className */
  className?: string;
}

/**
 * Topic display names for filter buttons
 */
const TOPIC_DISPLAY_NAMES: Record<ResourceTopic, string> = {
  anxiety: "Anxiety",
  depression: "Depression",
  trauma: "Trauma",
  stress: "Stress",
  sleep: "Sleep",
  school: "School",
  social: "Social",
  family: "Family",
  "getting-started": "Getting Started",
  adhd: "ADHD",
  behavior: "Behavior",
};

/**
 * ResourcePanel component
 *
 * Displays a browsable panel of all support resources with filtering.
 * Responsive: bottom sheet on mobile, right panel on desktop.
 *
 * @example
 * ```tsx
 * <ResourcePanel
 *   isOpen={isResourcePanelOpen}
 *   onOpenChange={setIsResourcePanelOpen}
 *   source="chat"
 * />
 * ```
 */
export function ResourcePanel({
  isOpen,
  onOpenChange,
  filterTopics,
  source = "form",
  className,
}: ResourcePanelProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTopic, setSelectedTopic] = React.useState<ResourceTopic | null>(
    filterTopics?.[0] || null
  );

  /**
   * Filter resources based on search query and selected topic
   */
  const filteredResources = React.useMemo(() => {
    let resources = [...SUPPORT_RESOURCES];

    // Filter by topic
    if (selectedTopic) {
      resources = resources.filter((r) => r.topics.includes(selectedTopic));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      resources = resources.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query)
      );
    }

    return resources;
  }, [selectedTopic, searchQuery]);

  /**
   * Get featured topics for quick filter buttons
   */
  const featuredTopics: ResourceTopic[] = [
    "getting-started",
    "anxiety",
    "depression",
    "family",
    "school",
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={cn("p-0", className)}>
        <SheetHeader className="border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-daybreak-teal/10">
              {source === "chat" ? (
                <Heart className="h-5 w-5 text-daybreak-teal" />
              ) : (
                <BookOpen className="h-5 w-5 text-daybreak-teal" />
              )}
            </div>
            <div>
              <SheetTitle className="text-lg">Helpful Resources</SheetTitle>
              <SheetDescription>
                Curated content to support your journey
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="p-4 space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Topic filter buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedTopic === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTopic(null)}
              className={cn(
                selectedTopic === null &&
                  "bg-daybreak-teal hover:bg-daybreak-teal/90"
              )}
            >
              All
            </Button>
            {featuredTopics.map((topic) => (
              <Button
                key={topic}
                variant={selectedTopic === topic ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTopic(topic)}
                className={cn(
                  selectedTopic === topic &&
                    "bg-daybreak-teal hover:bg-daybreak-teal/90"
                )}
              >
                {TOPIC_DISPLAY_NAMES[topic]}
              </Button>
            ))}
          </div>
        </div>

        {/* Resource list */}
        <div className="px-4 pb-4 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
          {filteredResources.length > 0 ? (
            filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                variant="full"
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No resources found</p>
              <p className="text-xs mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>

        {/* Footer with count */}
        <div className="px-4 py-3 border-t bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground">
            {filteredResources.length} resource
            {filteredResources.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
