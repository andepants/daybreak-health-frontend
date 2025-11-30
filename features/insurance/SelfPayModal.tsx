/**
 * SelfPayModal component for self-pay option selection
 *
 * Displays information about self-pay pricing and allows users
 * to choose self-pay when they don't have insurance (AC-4.1.6).
 */
"use client";

import * as React from "react";
import { DollarSign } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Props for SelfPayModal component
 * @param open - Whether the modal is open
 * @param onOpenChange - Callback when open state changes
 * @param onConfirm - Callback when user confirms self-pay
 * @param isLoading - Whether self-pay action is in progress
 */
export interface SelfPayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

/**
 * Self-pay modal component
 *
 * Displays:
 * - Self-pay pricing information
 * - Payment options description
 * - Confirm and cancel buttons
 *
 * Accessibility:
 * - Uses Dialog component with proper ARIA attributes
 * - Focus management handled by Radix Dialog
 * - Keyboard navigation supported (Escape to close)
 *
 * @example
 * <SelfPayModal
 *   open={isSelfPayOpen}
 *   onOpenChange={setIsSelfPayOpen}
 *   onConfirm={handleSelfPayConfirm}
 * />
 */
export function SelfPayModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: SelfPayModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-daybreak-teal/10">
            <DollarSign className="h-6 w-6 text-daybreak-teal" />
          </div>
          <DialogTitle className="text-center">Self-Pay Option</DialogTitle>
          <DialogDescription className="text-center">
            If you don&apos;t have insurance or prefer to pay out of pocket,
            we offer competitive self-pay rates.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Individual therapy session
              </span>
              <span className="font-semibold">$120/session</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Family therapy session
              </span>
              <span className="font-semibold">$150/session</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Initial assessment
              </span>
              <span className="font-semibold">$75</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Payment is collected at the time of each session.
            We accept all major credit cards and HSA/FSA cards.
          </p>

          <p className="text-sm text-muted-foreground text-center">
            You can add insurance information later if your situation changes.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:flex-1 bg-daybreak-teal hover:bg-daybreak-teal/90 text-white"
          >
            {isLoading ? "Processing..." : "Continue with Self-Pay"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

SelfPayModal.displayName = "SelfPayModal";
