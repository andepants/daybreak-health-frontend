/**
 * Footer Component
 *
 * Displays copyright information.
 * Supports 'default' and 'minimal' variants for different contexts.
 *
 * Features:
 * - Daybreak design tokens for styling
 * - ARIA labels for accessibility
 */
"use client";

import { cn } from "@/lib/utils";

/**
 * Props for the Footer component
 * @param variant - Visual variant ('default' or 'minimal')
 * @param className - Additional CSS classes for customization
 */
interface FooterProps {
  variant?: "default" | "minimal";
  className?: string;
}

/**
 * Renders the footer with copyright information
 * Default variant includes more padding and border, minimal is compact
 */
function Footer({ variant = "default", className }: FooterProps) {
  return (
    <footer
      className={cn(
        "w-full",
        variant === "default" &&
          "border-t border-border bg-background py-4 px-4 md:px-6",
        variant === "minimal" && "py-2 px-4",
        className
      )}
      role="contentinfo"
    >
      {variant === "default" && (
        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Daybreak Health. All rights reserved.
        </p>
      )}
    </footer>
  );
}

export { Footer };
export type { FooterProps };
