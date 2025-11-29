/**
 * SaveExitModal component for session save confirmation
 *
 * Displays confirmation after user saves and exits, showing:
 * - Success message
 * - Session URL for returning
 * - Copy link button
 * - Optional email reminder input
 *
 * Follows Daybreak design system with warm, supportive messaging.
 */
"use client";

import * as React from "react";
import { Check, Copy, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Props for SaveExitModal component
 * @param isOpen - Whether the modal is displayed
 * @param onClose - Callback when modal is closed
 * @param sessionId - Current session ID for generating URL
 * @param parentEmail - Pre-filled parent email if already collected
 */
export interface SaveExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  parentEmail?: string;
}

/**
 * Renders save confirmation modal with session URL and email reminder option
 *
 * Features:
 * - Session URL display with copy button
 * - Email reminder input (pre-filled if available)
 * - Send reminder button with loading state
 * - Success feedback on copy and send
 * - Accessible keyboard navigation
 *
 * @param props - Component props
 */
export function SaveExitModal({
  isOpen,
  onClose,
  sessionId,
  parentEmail = "",
}: SaveExitModalProps) {
  const [email, setEmail] = React.useState(parentEmail);
  const [isCopied, setIsCopied] = React.useState(false);
  const [isSendingReminder, setIsSendingReminder] = React.useState(false);
  const [reminderSent, setReminderSent] = React.useState(false);
  const [emailError, setEmailError] = React.useState<string | null>(null);

  // Generate session URL
  const sessionUrl = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/onboarding/${sessionId}/assessment`;
  }, [sessionId]);

  /**
   * Copies session URL to clipboard
   * Shows success feedback for 2 seconds
   */
  const handleCopyLink = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(sessionUrl);
      setIsCopied(true);

      // Reset after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  }, [sessionUrl]);

  /**
   * Validates email format
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Sends email reminder
   * Validates email and calls GraphQL mutation
   */
  const handleSendReminder = React.useCallback(async () => {
    // Validate email
    if (!email.trim()) {
      setEmailError("Please enter an email address");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError(null);
    setIsSendingReminder(true);

    try {
      // TODO: Replace with actual GraphQL mutation when backend is ready
      // await sendSessionReminder({
      //   variables: {
      //     input: {
      //       sessionId,
      //       email,
      //     },
      //   },
      // });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setReminderSent(true);

      // Reset sent state after 3 seconds
      setTimeout(() => {
        setReminderSent(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to send reminder:", err);
      setEmailError("Failed to send reminder. Please try again.");
    } finally {
      setIsSendingReminder(false);
    }
  }, [email, sessionId]);

  /**
   * Reset state when modal opens
   */
  React.useEffect(() => {
    if (isOpen) {
      setEmail(parentEmail);
      setIsCopied(false);
      setReminderSent(false);
      setEmailError(null);
    }
  }, [isOpen, parentEmail]);

  /**
   * Handle Enter key in email input
   */
  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSendingReminder) {
      handleSendReminder();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-teal-50">
            <Check className="w-8 h-8 text-teal-600" />
          </div>
          <DialogTitle className="text-center text-xl">
            Your progress has been saved!
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            You can return anytime using this link:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session URL Display */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted text-sm break-all">
              <span className="flex-1">{sessionUrl}</span>
            </div>
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full"
              disabled={isCopied}
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy link
                </>
              )}
            </Button>
          </div>

          {/* Email Reminder Section */}
          <div className="space-y-3">
            <Label htmlFor="reminder-email" className="text-base font-medium">
              Want a reminder to come back?
            </Label>
            <div className="space-y-2">
              <Input
                id="reminder-email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(null);
                }}
                onKeyDown={handleEmailKeyDown}
                disabled={isSendingReminder || reminderSent}
                className={emailError ? "border-red-500" : ""}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "email-error" : undefined}
              />
              {emailError && (
                <p id="email-error" className="text-sm text-red-500">
                  {emailError}
                </p>
              )}
              <Button
                onClick={handleSendReminder}
                variant="secondary"
                className="w-full"
                disabled={isSendingReminder || reminderSent || !email.trim()}
              >
                {reminderSent ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Reminder sent!
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    {isSendingReminder ? "Sending..." : "Send reminder"}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Save & Exit Button */}
          <Button onClick={onClose} className="w-full" size="lg" variant="outline">
            Save & Exit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
