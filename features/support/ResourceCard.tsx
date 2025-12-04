/**
 * ResourceCard component for displaying individual support resources
 *
 * Renders a clickable card with resource metadata including title,
 * description, type icon, duration, and source badge.
 * Used within ResourceAccordion, ResourcePanel, and ChatResourceBubble.
 */
"use client";

import * as React from "react";
import {
  FileText,
  Video,
  BookOpen,
  Play,
  ExternalLink,
  Clock,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  type SupportResource,
  getSourceDisplayName,
} from "@/lib/data/support-resources";

/**
 * Props for ResourceCard component
 */
export interface ResourceCardProps {
  /** Resource data to display */
  resource: SupportResource;
  /** Display variant */
  variant?: "compact" | "full";
  /** Optional click handler (defaults to opening URL) */
  onClick?: () => void;
  /** Additional className */
  className?: string;
}

/**
 * Icon component mapping for resource types
 */
const RESOURCE_TYPE_ICONS = {
  article: FileText,
  webinar: Video,
  guide: BookOpen,
  "one-pager": FileText,
  video: Play,
  external: ExternalLink,
} as const;

/**
 * Source badge colors
 */
const SOURCE_COLORS = {
  daybreak: "bg-daybreak-teal/10 text-daybreak-teal",
  nimh: "bg-blue-100 text-blue-700",
  aap: "bg-green-100 text-green-700",
  aacap: "bg-purple-100 text-purple-700",
} as const;

/**
 * ResourceCard component
 *
 * Displays a resource with icon, metadata, and link functionality.
 * Supports compact (single line) and full (with description) variants.
 *
 * @example
 * ```tsx
 * <ResourceCard
 *   resource={resource}
 *   variant="full"
 * />
 * ```
 */
export function ResourceCard({
  resource,
  variant = "compact",
  onClick,
  className,
}: ResourceCardProps) {
  const Icon = RESOURCE_TYPE_ICONS[resource.type] || FileText;
  const sourceColor = SOURCE_COLORS[resource.source] || SOURCE_COLORS.daybreak;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.open(resource.url, "_blank", "noopener,noreferrer");
    }
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "w-full flex items-center gap-3 p-2 rounded-lg",
          "text-left transition-colors",
          "hover:bg-muted/50 focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
      >
        <div className="shrink-0 p-1.5 rounded-md bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {resource.title}
          </p>
        </div>
        {resource.duration && (
          <span className="text-xs text-muted-foreground shrink-0">
            {resource.duration}
          </span>
        )}
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      </button>
    );
  }

  // Full variant
  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "w-full flex items-start gap-3 p-3 rounded-lg border",
        "text-left transition-colors bg-card",
        "hover:bg-muted/30 hover:border-daybreak-teal/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <div className="shrink-0 p-2 rounded-md bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground leading-tight">
            {resource.title}
          </p>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {resource.description}
        </p>
        <div className="flex items-center gap-2 pt-1">
          <span
            className={cn(
              "inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium",
              sourceColor
            )}
          >
            {getSourceDisplayName(resource.source)}
          </span>
          {resource.duration && (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {resource.duration}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
