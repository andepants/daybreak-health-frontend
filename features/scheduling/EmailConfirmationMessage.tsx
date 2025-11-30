/**
 * EmailConfirmationMessage Component
 *
 * Displays email confirmation status after appointment booking.
 * Shows different states: success (sent), pending, or failed.
 *
 * Features:
 * - Success state with email address display
 * - Pending state with supportive messaging
 * - Failed state with support contact info
 * - Accessible with ARIA labels
 * - Daybreak design system styling
 *
 * PHI Protection:
 * - Email address is contact info (acceptable to display)
 * - No sensitive appointment details logged
 * - Uses phi-guard for any logging
 *
 * @module features/scheduling/EmailConfirmationMessage
 */

"use client";

import * as React from "react";
import { Mail, AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Email confirmation status information
 */
export interface EmailConfirmationStatus {
  /** Whether confirmation email was sent */
  emailSent: boolean;
  /** Email delivery status: "sent", "pending", "failed" */
  emailStatus: string;
  /** Email address where confirmation was sent */
  recipientEmail?: string;
}

/**
 * Props for EmailConfirmationMessage component
 */
export interface EmailConfirmationMessageProps {
  /** Email confirmation status from booking mutation */
  emailConfirmation?: EmailConfirmationStatus | null;
  /** User's email address from session (fallback if not in confirmation) */
  userEmail?: string;
}

/**
 * Renders email confirmation status message
 *
 * States:
 * - Success: "Confirmation email sent to [email]" with checkmark
 * - Pending: "Email confirmation pending" with clock icon
 * - Failed: "Email pending" with support contact info
 *
 * Accessibility:
 * - Uses Alert component for screen reader announcements
 * - Proper ARIA labels on icons
 * - Keyboard accessible support link
 *
 * @example
 * // Success state
 * <EmailConfirmationMessage
 *   emailConfirmation={{
 *     emailSent: true,
 *     emailStatus: "sent",
 *     recipientEmail: "parent@example.com"
 *   }}
 * />
 *
 * @example
 * // Failed state with fallback email
 * <EmailConfirmationMessage
 *   emailConfirmation={{
 *     emailSent: false,
 *     emailStatus: "failed"
 *   }}
 *   userEmail="parent@example.com"
 * />
 */
export function EmailConfirmationMessage({
  emailConfirmation,
  userEmail,
}: EmailConfirmationMessageProps) {
  // Don't render if no confirmation data
  if (!emailConfirmation) return null;

  const { emailSent, emailStatus, recipientEmail } = emailConfirmation;
  const displayEmail = recipientEmail || userEmail;

  /**
   * Success state: Email was sent successfully
   */
  if (emailSent && emailStatus === "sent") {
    return (
      <Alert
        className="bg-green-50 border-green-200"
        role="status"
        aria-live="polite"
      >
        <Mail
          className="h-4 w-4 text-green-600"
          aria-hidden="true"
        />
        <AlertDescription className="text-green-800">
          Confirmation email sent to{" "}
          <span className="font-medium">{displayEmail || "your email"}</span>
        </AlertDescription>
      </Alert>
    );
  }

  /**
   * Pending state: Email is being sent or queued
   */
  if (emailStatus === "pending") {
    return (
      <Alert
        className="bg-blue-50 border-blue-200"
        role="status"
        aria-live="polite"
      >
        <Clock
          className="h-4 w-4 text-blue-600"
          aria-hidden="true"
        />
        <AlertDescription className="text-blue-800">
          <div className="space-y-1">
            <p>Your confirmation email is being sent...</p>
            {displayEmail && (
              <p className="text-sm text-blue-700">
                Check {displayEmail} in a few moments
              </p>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  /**
   * Failed state: Email delivery failed
   * Show supportive message with contact information
   */
  if (!emailSent || emailStatus === "failed") {
    return (
      <Alert
        className="bg-orange-50 border-orange-200"
        role="alert"
        aria-live="assertive"
      >
        <AlertCircle
          className="h-4 w-4 text-orange-600"
          aria-hidden="true"
        />
        <AlertDescription className="text-orange-900">
          <div className="space-y-2">
            <p className="font-medium">Email confirmation pending</p>
            <p className="text-sm">
              Your appointment is confirmed! If you don&apos;t receive an email
              within a few minutes, please{" "}
              <a
                href="mailto:support@daybreakhealth.com"
                className="text-daybreak-teal hover:text-daybreak-teal/80 underline underline-offset-2 font-medium"
              >
                contact support
              </a>
              .
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Fallback: Unknown status - treat as pending
  return (
    <Alert
      className="bg-gray-50 border-gray-200"
      role="status"
      aria-live="polite"
    >
      <Mail
        className="h-4 w-4 text-gray-600"
        aria-hidden="true"
      />
      <AlertDescription className="text-gray-800">
        Confirmation email will be sent to {displayEmail || "your email"}
      </AlertDescription>
    </Alert>
  );
}

EmailConfirmationMessage.displayName = "EmailConfirmationMessage";
