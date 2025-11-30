/**
 * SelfPayModal component for self-pay option selection
 *
 * Displays information about self-pay pricing and allows users
 * to choose self-pay when they don't have insurance (AC-4.1.6).
 */
"use client";

import * as React from "react";
import { DollarSign, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
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
      <DialogContent showCloseButton={false} className="sm:max-w-[480px] p-0 overflow-visible gap-0 border-0 shadow-2xl rounded-3xl">
        <div className="relative p-8 bg-white rounded-3xl">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-5 w-5 text-gray-400" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <DialogHeader className="flex flex-col items-center mb-8 space-y-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 ring-8 ring-teal-50/50">
              <DollarSign className="w-8 h-8 text-teal-600" strokeWidth={3} />
            </div>
            <div className="space-y-2 text-center">
              <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight whitespace-nowrap">
                Self-Pay Option
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-base max-w-[320px] mx-auto leading-relaxed">
                If you don&apos;t have insurance or prefer to pay out of pocket,
                we offer competitive self-pay rates.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">
                  Individual therapy session
                </span>
                <span className="font-bold text-gray-900">$120/session</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">
                  Family therapy session
                </span>
                <span className="font-bold text-gray-900">$150/session</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">
                  Initial assessment
                </span>
                <span className="font-bold text-gray-900">$75</span>
              </div>
            </div>

            <div className="space-y-3 text-center">
              <p className="text-sm text-gray-500">
                Payment is collected at the time of each session.
                We accept all major credit cards and HSA/FSA cards.
              </p>
              <p className="text-sm text-gray-500">
                You can add insurance information later if your situation changes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="w-full sm:w-auto flex-1 h-11 text-base font-medium border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isLoading}
                className="w-full sm:flex-1 h-11 text-base font-medium bg-daybreak-teal hover:bg-daybreak-teal/90 text-white shadow-lg shadow-teal-900/10"
              >
                {isLoading ? "Processing..." : "Continue with Self-Pay"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

SelfPayModal.displayName = "SelfPayModal";
