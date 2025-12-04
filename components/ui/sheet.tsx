/**
 * Sheet Component - Radix UI Dialog-based sliding panel
 *
 * A responsive sheet component that slides in from the side (desktop)
 * or bottom (mobile). Built on Radix UI Dialog primitives with
 * custom Daybreak Health styling.
 *
 * Features:
 * - Responsive: Right-side on desktop, bottom on mobile
 * - Accessible: Focus trap, escape key, ARIA attributes
 * - Animated: Smooth slide-in/out transitions
 * - Customizable: Multiple size variants
 *
 * Usage:
 * @example
 * <Sheet open={isOpen} onOpenChange={setIsOpen}>
 *   <SheetTrigger>Open</SheetTrigger>
 *   <SheetContent>
 *     <SheetHeader>
 *       <SheetTitle>Profile</SheetTitle>
 *       <SheetDescription>View details</SheetDescription>
 *     </SheetHeader>
 *     <div>Content here</div>
 *   </SheetContent>
 * </Sheet>
 */
"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

/**
 * Sheet Overlay - Dark backdrop behind the sheet
 * Appears with fade-in animation and blocks interaction with content behind
 */
const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

/**
 * Sheet content variants configuration
 * Defines slide-in directions and sizes for different use cases
 */
const sheetVariants = cva(
  cn(
    "fixed z-50 gap-4 bg-background shadow-lg transition ease-in-out",
    "data-[state=closed]:duration-300 data-[state=open]:duration-500",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
  ),
  {
    variants: {
      side: {
        top: cn(
          "inset-x-0 top-0 border-b",
          "data-[state=closed]:slide-out-to-top",
          "data-[state=open]:slide-in-from-top"
        ),
        bottom: cn(
          "inset-x-0 bottom-0 border-t rounded-t-2xl",
          "data-[state=closed]:slide-out-to-bottom",
          "data-[state=open]:slide-in-from-bottom",
          // Mobile-specific: Add safe area padding
          "pb-[env(safe-area-inset-bottom)]"
        ),
        left: cn(
          "inset-y-0 left-0 h-full w-3/4 border-r",
          "data-[state=closed]:slide-out-to-left",
          "data-[state=open]:slide-in-from-left",
          // Use explicit pixel values for Tailwind v4 compatibility
          "sm:max-w-[384px]"
        ),
        right: cn(
          "inset-y-0 right-0 h-full w-3/4 border-l",
          "data-[state=closed]:slide-out-to-right",
          "data-[state=open]:slide-in-from-right",
          // Use explicit pixel values for Tailwind v4 compatibility
          "sm:max-w-[384px] md:max-w-[448px] lg:max-w-[512px]"
        ),
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  /**
   * Whether to show the close button (X icon)
   * @default true
   */
  showClose?: boolean;
}

/**
 * Sheet Content - The main container for sheet content
 *
 * Responsive behavior:
 * - Desktop: Slides from specified side (default: right)
 * - Mobile (<640px): Always slides from bottom for better UX
 *
 * Accessibility:
 * - Focus trap keeps keyboard navigation within sheet
 * - Escape key closes sheet
 * - Close button with proper ARIA label
 * - Auto-focuses first focusable element on open
 */
const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, showClose = true, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        sheetVariants({ side }),
        // Responsive: Use bottom sheet on mobile, side sheet on desktop
        // Override the side positioning for mobile to become bottom sheet
        "max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:right-auto",
        "max-sm:h-auto max-sm:w-full max-sm:rounded-t-2xl max-sm:border-t max-sm:border-l-0",
        "max-sm:data-[state=closed]:slide-out-to-bottom",
        "max-sm:data-[state=open]:slide-in-from-bottom",
        // Add max height for mobile bottom sheet
        "max-sm:max-h-[90vh]",
        // Overflow handling
        "overflow-y-auto",
        className
      )}
      {...props}
    >
      {children}
      {showClose && (
        <SheetPrimitive.Close
          className={cn(
            "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background",
            "transition-opacity hover:opacity-100",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:pointer-events-none",
            "data-[state=open]:bg-secondary"
          )}
          aria-label="Close profile"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      )}
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

/**
 * Sheet Header - Container for title and description
 * Provides consistent spacing and layout for sheet headers
 */
const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      "px-6 pt-6 pb-4",
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

/**
 * Sheet Footer - Container for actions/buttons
 * Provides consistent spacing and layout for sheet footers
 * Includes safe area padding for mobile devices
 */
const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      "px-6 pb-6 pt-4",
      // Mobile: Add sticky footer with safe area
      "max-sm:sticky max-sm:bottom-0 max-sm:bg-background max-sm:border-t",
      "max-sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))]",
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

/**
 * Sheet Title - Accessible heading for sheet
 * Required for accessibility (screen readers announce this)
 */
const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn(
      "text-2xl font-serif font-semibold text-deep-text",
      className
    )}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

/**
 * Sheet Description - Optional subtitle/description
 * Provides additional context about the sheet content
 */
const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
