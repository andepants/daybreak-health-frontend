/**
 * Footer Component
 *
 * Displays Privacy Policy and Terms of Service links.
 * Supports 'default' and 'minimal' variants for different contexts.
 *
 * Features:
 * - Keyboard accessible links with focus states
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
 * Footer link configuration
 */
const FOOTER_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
] as const;

/**
 * Renders the footer with Privacy and Terms links
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
      <nav
        className="flex items-center justify-center gap-4 md:gap-6"
        aria-label="Footer navigation"
      >
        {FOOTER_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={cn(
              "text-xs md:text-sm text-muted-foreground",
              "hover:text-foreground hover:underline",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "rounded-sm transition-colors"
            )}
          >
            {link.label}
          </a>
        ))}
      </nav>
      {variant === "default" && (
        <p className="text-center text-xs text-muted-foreground mt-2">
          &copy; {new Date().getFullYear()} Daybreak Health. All rights reserved.
        </p>
      )}
    </footer>
  );
}

export { Footer, FOOTER_LINKS };
export type { FooterProps };
