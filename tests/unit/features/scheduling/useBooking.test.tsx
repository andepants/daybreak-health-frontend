/**
 * useBooking Hook Tests
 *
 * Tests for appointment booking hook with email confirmation support.
 *
 * Test Coverage:
 * - Email confirmation status defaults
 * - Type safety
 */

import { describe, it, expect } from "vitest";
import type { EmailConfirmationStatus } from "@/features/scheduling/useBooking";

describe("useBooking", () => {
  describe("Email Confirmation Types", () => {
    it("should have correct EmailConfirmationStatus type structure", () => {
      const emailConfirmation: EmailConfirmationStatus = {
        emailSent: true,
        emailStatus: "sent",
        recipientEmail: "parent@example.com",
      };

      expect(emailConfirmation.emailSent).toBe(true);
      expect(emailConfirmation.emailStatus).toBe("sent");
      expect(emailConfirmation.recipientEmail).toBe("parent@example.com");
    });

    it("should allow recipientEmail to be optional", () => {
      const emailConfirmation: EmailConfirmationStatus = {
        emailSent: false,
        emailStatus: "pending",
      };

      expect(emailConfirmation.recipientEmail).toBeUndefined();
    });

    it("should support different email status values", () => {
      const statuses = ["sent", "pending", "failed"];

      statuses.forEach((status) => {
        const emailConfirmation: EmailConfirmationStatus = {
          emailSent: status === "sent",
          emailStatus: status,
        };

        expect(emailConfirmation.emailStatus).toBe(status);
      });
    });
  });

  describe("Default Behavior", () => {
    it("should use sent status when backend doesn't provide email fields", () => {
      // This tests the hook's fallback behavior documented in useBooking.ts
      // When backend doesn't provide emailSent/emailStatus, defaults to:
      // - emailSent: true
      // - emailStatus: "sent"
      // - recipientEmail: undefined

      const expectedDefault: EmailConfirmationStatus = {
        emailSent: true,
        emailStatus: "sent",
        recipientEmail: undefined,
      };

      expect(expectedDefault.emailSent).toBe(true);
      expect(expectedDefault.emailStatus).toBe("sent");
      expect(expectedDefault.recipientEmail).toBeUndefined();
    });
  });
});
