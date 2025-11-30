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
import { Check, Copy, Mail, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

  // Generate session URL using configured public URL or fallback to window origin
  const sessionUrl = React.useMemo(() => {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    return `${baseUrl}/onboarding/${sessionId}/assessment`;
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
    // Note: sessionId will be needed when GraphQL mutation is implemented (see TODO above)
  }, [email]);

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
      <DialogContent showCloseButton={false} className="sm:max-w-[480px] p-0 overflow-visible gap-0 border-0 shadow-2xl rounded-3xl">
        <div className="relative p-8 bg-white rounded-3xl">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-5 w-5 text-gray-400" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <DialogHeader className="flex flex-col items-center mb-8 space-y-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 ring-8 ring-teal-50/50">
              <Check className="w-8 h-8 text-teal-600" strokeWidth={3} />
            </div>
            <div className="space-y-2 text-center">
              <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight whitespace-nowrap">
                Your progress has been saved!
              </DialogTitle>
              <p className="text-gray-500 text-base max-w-[320px] mx-auto leading-relaxed">
                You can return anytime using this link:
              </p>
            </div>
          </DialogHeader>

          <div className="space-y-8">
            {/* Session URL Display */}
            <div className="space-y-3">
              <div className="relative group">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 transition-colors group-hover:border-gray-200 group-hover:bg-gray-50/80">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 truncate font-medium font-mono">
                      {sessionUrl}
                    </p>
                  </div>
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Button
                    onClick={handleCopyLink}
                    size="sm"
                    className={cn(
                      "h-8 px-3 transition-all duration-200",
                      isCopied
                        ? "bg-teal-600 hover:bg-teal-700 text-white"
                        : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm"
                    )}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Email Reminder Section */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <div className="space-y-1.5">
                <Label
                  htmlFor="reminder-email"
                  className="text-sm font-semibold text-gray-900"
                >
                  Want a reminder to come back?
                </Label>
                <p className="text-sm text-gray-500">
                  We'll send you a secure link to resume later.
                </p>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Input
                    id="reminder-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(null);
                    }}
                    onKeyDown={handleEmailKeyDown}
                    disabled={isSendingReminder || reminderSent}
                    className={cn(
                      "h-11 px-4 bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 transition-all",
                      emailError &&
                      "border-red-300 focus:border-red-500 focus:ring-red-500/20",
                      reminderSent &&
                      "border-teal-500 bg-teal-50/30 text-teal-900"
                    )}
                  />
                  {reminderSent && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600">
                      <Check className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {emailError && (
                  <p className="text-sm text-red-600 flex items-center animate-in slide-in-from-top-1 fade-in">
                    <span className="w-1 h-1 rounded-full bg-red-600 mr-2" />
                    {emailError}
                  </p>
                )}

                <Button
                  onClick={handleSendReminder}
                  className={cn(
                    "w-full h-11 text-base font-medium transition-all duration-200",
                    reminderSent
                      ? "bg-teal-100 text-teal-900 hover:bg-teal-200 border-transparent"
                      : "bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/10"
                  )}
                  disabled={isSendingReminder || reminderSent || !email.trim()}
                >
                  {reminderSent ? (
                    "Reminder sent!"
                  ) : (
                    <>
                      {isSendingReminder ? (
                        <span className="flex items-center">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 opacity-80" />
                          Send reminder
                        </span>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
