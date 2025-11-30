/**
 * Unit tests for insurance utility functions
 *
 * Tests maskMemberId and formatVerificationStatus utilities
 * per AC-4.2.2 (masked member ID display) and related requirements.
 *
 * Security note: These tests verify PHI protection behavior
 * by ensuring member IDs are properly masked in display contexts.
 */
import { describe, it, expect } from "vitest";
import { maskMemberId, formatVerificationStatus } from "@/features/insurance/utils";

describe("Insurance Utilities", () => {
  describe("maskMemberId (AC-4.2.2)", () => {
    describe("Standard masking behavior", () => {
      it("should mask member ID showing last 4 characters", () => {
        expect(maskMemberId("ABC123456789")).toBe("****6789");
      });

      it("should mask alphanumeric member ID correctly", () => {
        expect(maskMemberId("W123456789")).toBe("****6789");
      });

      it("should mask member ID with exactly 5 characters", () => {
        expect(maskMemberId("AB123")).toBe("****B123");
      });

      it("should mask member ID with hyphens", () => {
        expect(maskMemberId("ABC-123-456-789")).toBe("****-789");
      });

      it("should mask long member ID", () => {
        expect(maskMemberId("ABCDEFGHIJKLMNOP")).toBe("****MNOP");
      });
    });

    describe("Edge cases - short IDs", () => {
      it("should return as-is for 4-character ID", () => {
        expect(maskMemberId("AB12")).toBe("AB12");
      });

      it("should return as-is for 3-character ID", () => {
        expect(maskMemberId("ABC")).toBe("ABC");
      });

      it("should return as-is for 2-character ID", () => {
        expect(maskMemberId("AB")).toBe("AB");
      });

      it("should return as-is for 1-character ID", () => {
        expect(maskMemberId("A")).toBe("A");
      });
    });

    describe("Edge cases - empty/null input", () => {
      it("should return empty string for empty input", () => {
        expect(maskMemberId("")).toBe("");
      });

      it("should handle whitespace-only input", () => {
        // Whitespace counts as characters, so 4 spaces returns as-is
        expect(maskMemberId("    ")).toBe("    ");
      });
    });

    describe("PHI Protection verification", () => {
      it("should never expose more than last 4 characters", () => {
        const sensitiveId = "SSN-123-45-6789";
        const masked = maskMemberId(sensitiveId);

        // Verify original sensitive characters are hidden
        expect(masked).not.toContain("SSN");
        expect(masked).not.toContain("123-45");

        // Verify only last 4 are visible
        expect(masked).toBe("****6789");
      });

      it("should consistently mask regardless of ID format", () => {
        // Various insurance ID formats should all mask the same way
        const formats = [
          "W123456789",      // Aetna format
          "ABC123456789",    // BCBS format
          "U12345678",       // Cigna format
          "12345678901",     // Medicare MBI
        ];

        formats.forEach((id) => {
          const masked = maskMemberId(id);
          // All should start with **** and show exactly 4 trailing chars
          expect(masked).toMatch(/^\*{4}.{4}$/);
        });
      });
    });
  });

  describe("formatVerificationStatus", () => {
    it("should format pending status", () => {
      const result = formatVerificationStatus("pending");
      expect(result.label).toBe("Verification Pending");
      expect(result.colorClass).toContain("amber");
    });

    it("should format verified status", () => {
      const result = formatVerificationStatus("verified");
      expect(result.label).toBe("Verified");
      expect(result.colorClass).toContain("emerald");
    });

    it("should format failed status", () => {
      const result = formatVerificationStatus("failed");
      expect(result.label).toBe("Verification Failed");
      expect(result.colorClass).toContain("red");
    });

    it("should format self_pay status", () => {
      const result = formatVerificationStatus("self_pay");
      expect(result.label).toBe("Self-Pay");
      expect(result.colorClass).toContain("blue");
    });

    it("should return objects with both label and colorClass", () => {
      const statuses: Array<"pending" | "verified" | "failed" | "self_pay"> = [
        "pending",
        "verified",
        "failed",
        "self_pay",
      ];

      statuses.forEach((status) => {
        const result = formatVerificationStatus(status);
        expect(result).toHaveProperty("label");
        expect(result).toHaveProperty("colorClass");
        expect(typeof result.label).toBe("string");
        expect(typeof result.colorClass).toBe("string");
      });
    });
  });
});
