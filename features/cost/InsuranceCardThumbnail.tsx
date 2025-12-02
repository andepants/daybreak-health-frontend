/**
 * InsuranceCardThumbnail component for displaying insurance card preview
 *
 * Shows a small (100px default) clickable thumbnail of the uploaded insurance
 * card that expands to full size when clicked. Handles loading and error states
 * gracefully with placeholder display.
 *
 * Features:
 * - Responsive thumbnail with credit card aspect ratio (1.586:1)
 * - Loading spinner while image loads
 * - Placeholder display on error or missing image
 * - Click to expand to full modal view
 * - Hover effects for interactive feedback
 * - Accessible with ARIA labels and focus states
 *
 * Visual Design:
 * - Daybreak teal hover border accent
 * - Rounded corners matching design system
 * - Shadow on hover for depth
 * - Zoom icon indicator for expandability
 */
"use client";

import * as React from "react";
import { useState } from "react";
import { CreditCard, Loader2, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for InsuranceCardThumbnail component
 * @param imageUrl - Presigned S3 URL for the insurance card image
 * @param alt - Alt text for accessibility
 * @param size - Width of thumbnail in pixels (default: 100)
 * @param onClick - Callback when thumbnail is clicked (opens modal)
 * @param className - Optional additional CSS classes
 */
export interface InsuranceCardThumbnailProps {
  imageUrl: string | null | undefined;
  alt?: string;
  size?: number;
  onClick?: () => void;
  className?: string;
}

/**
 * Renders a small clickable thumbnail of an insurance card image
 *
 * Displays the insurance card at a configurable size (default 100px width)
 * with proper credit card aspect ratio. Shows loading state while image
 * fetches and placeholder on error or missing URL.
 *
 * @example
 * <InsuranceCardThumbnail
 *   imageUrl={cardImageFrontUrl}
 *   onClick={() => setModalOpen(true)}
 *   size={100}
 * />
 */
export function InsuranceCardThumbnail({
  imageUrl,
  alt = "Insurance card",
  size = 100,
  onClick,
  className,
}: InsuranceCardThumbnailProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Credit card aspect ratio: 3.375" x 2.125" ≈ 1.586:1
  const height = Math.round(size / 1.586);

  /**
   * Handle image load error
   * Sets error state to show placeholder
   */
  function handleError() {
    setIsLoading(false);
    setHasError(true);
  }

  /**
   * Handle successful image load
   * Clears loading state
   */
  function handleLoad() {
    setIsLoading(false);
  }

  // Show placeholder if no URL or error occurred
  if (!imageUrl || hasError) {
    return (
      <div
        className={cn(
          "rounded-lg border-2 border-dashed border-muted",
          "flex items-center justify-center bg-muted/20",
          className
        )}
        style={{ width: size, height }}
        role="img"
        aria-label="Insurance card not available"
      >
        <CreditCard className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "relative rounded-lg overflow-hidden border border-border shadow-sm",
        "transition-all duration-200",
        onClick && [
          "cursor-pointer",
          "hover:border-daybreak-teal hover:shadow-md",
          "focus:outline-none focus:ring-2 focus:ring-daybreak-teal focus:ring-offset-2",
        ],
        !onClick && "cursor-default",
        className
      )}
      style={{ width: size, height }}
      aria-label={onClick ? "Click to view insurance card" : alt}
    >
      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <Loader2
            className="h-4 w-4 animate-spin text-muted-foreground"
            aria-label="Loading insurance card image"
          />
        </div>
      )}

      {/* Card image */}
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-full object-cover"
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* Hover overlay with zoom icon */}
      {onClick && (
        <div
          className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-end justify-end p-1"
          aria-hidden="true"
        >
          <ZoomIn className="h-3 w-3 text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </button>
  );
}

InsuranceCardThumbnail.displayName = "InsuranceCardThumbnail";
