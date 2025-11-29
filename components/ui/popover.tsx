/**
 * Popover component built with Radix UI Popover primitive
 *
 * Provides a floating panel that appears next to a trigger element.
 * Used for tooltips, dropdown menus, and date pickers.
 * Follows shadcn/ui patterns for consistent styling.
 */
"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

/**
 * Root Popover component
 * Manages open state for the popover
 */
const Popover = PopoverPrimitive.Root;

/**
 * Trigger element that opens the popover
 * Should wrap the element that activates the popover
 */
const PopoverTrigger = PopoverPrimitive.Trigger;

/**
 * Anchor element for custom positioning
 * Allows positioning relative to an element other than the trigger
 */
const PopoverAnchor = PopoverPrimitive.Anchor;

/**
 * Content panel that appears when popover is open
 *
 * @param className - Additional CSS classes
 * @param align - Alignment relative to trigger (start, center, end)
 * @param sideOffset - Distance from trigger in pixels
 */
const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
