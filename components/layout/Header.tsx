/**
 * Header component for onboarding flow
 *
 * Displays Daybreak logo and optional Save & Exit action button.
 * Follows Daybreak brand guidelines with responsive sizing.
 */
"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Props for the Header component
 * @param showSaveExit - Whether to show the Save & Exit button (default: true)
 * @param onSaveExit - Callback fired when Save & Exit button is clicked
 * @param className - Additional CSS classes for customization
 */
interface HeaderProps {
  showSaveExit?: boolean;
  onSaveExit?: () => void;
  className?: string;
}

/**
 * Renders the header with Daybreak logo and optional Save & Exit button
 * Logo height: 56px on mobile, responsive on larger screens
 */
function Header({ showSaveExit = true, onSaveExit, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between px-4 py-3 md:px-6 md:py-4",
        "border-b border-border bg-background",
        className
      )}
    >
      <div className="flex items-center">
        {/* Daybreak Logo - 56px height on mobile */}
        <div
          className="flex items-center justify-center h-14 md:h-16"
          aria-label="Daybreak Health"
        >
          <svg
            viewBox="0 0 200 56"
            className="h-14 md:h-16 w-auto"
            aria-hidden="true"
            role="img"
          >
            <title>Daybreak Health Logo</title>
            {/* Sun/sunrise icon */}
            <circle cx="28" cy="28" r="16" fill="var(--daybreak-teal)" />
            <path
              d="M28 4 L28 10 M28 46 L28 52 M4 28 L10 28 M46 28 L52 28 M10 10 L14 14 M42 42 L46 46 M10 46 L14 42 M42 14 L46 10"
              stroke="var(--daybreak-teal)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Daybreak text */}
            <text
              x="60"
              y="35"
              fill="var(--deep-text)"
              fontFamily="var(--font-fraunces)"
              fontSize="24"
              fontWeight="600"
            >
              Daybreak
            </text>
          </svg>
        </div>
      </div>

      {showSaveExit && (
        <Button
          variant="ghost"
          onClick={onSaveExit}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Save progress and exit"
        >
          Save & Exit
        </Button>
      )}
    </header>
  );
}

export { Header };
export type { HeaderProps };
