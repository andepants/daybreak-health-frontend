/**
 * Unit tests for phone formatting utility functions
 *
 * Tests formatPhoneNumber, toE164, fromE164, and extractPhoneDigits
 * per AC-3.1.5 (E.164 storage) and AC-3.1.12 (auto-format as user types).
 */
import { describe, it, expect } from "vitest";
import {
  formatPhoneNumber,
  toE164,
  fromE164,
  extractPhoneDigits,
  formatRelativeTime,
} from "@/lib/utils/formatters";

describe("Phone Formatting Utilities", () => {
  describe("formatPhoneNumber (AC-3.1.12)", () => {
    it("should return empty string for empty input", () => {
      expect(formatPhoneNumber("")).toBe("");
    });

    it("should format 1 digit with opening paren", () => {
      expect(formatPhoneNumber("5")).toBe("(5");
    });

    it("should format 2 digits with opening paren", () => {
      expect(formatPhoneNumber("55")).toBe("(55");
    });

    it("should format 3 digits with opening paren", () => {
      expect(formatPhoneNumber("555")).toBe("(555");
    });

    it("should format 4 digits with area code complete", () => {
      expect(formatPhoneNumber("5551")).toBe("(555) 1");
    });

    it("should format 5 digits correctly", () => {
      expect(formatPhoneNumber("55512")).toBe("(555) 12");
    });

    it("should format 6 digits correctly", () => {
      expect(formatPhoneNumber("555123")).toBe("(555) 123");
    });

    it("should format 7 digits with dash", () => {
      expect(formatPhoneNumber("5551234")).toBe("(555) 123-4");
    });

    it("should format 8 digits correctly", () => {
      expect(formatPhoneNumber("55512345")).toBe("(555) 123-45");
    });

    it("should format 9 digits correctly", () => {
      expect(formatPhoneNumber("555123456")).toBe("(555) 123-456");
    });

    it("should format full 10 digits correctly", () => {
      expect(formatPhoneNumber("5551234567")).toBe("(555) 123-4567");
    });

    it("should cap at 10 digits", () => {
      expect(formatPhoneNumber("55512345678")).toBe("(555) 123-4567");
    });

    it("should strip non-digit characters from input", () => {
      expect(formatPhoneNumber("(555) 123-4567")).toBe("(555) 123-4567");
    });

    it("should handle input with letters", () => {
      expect(formatPhoneNumber("555abc123")).toBe("(555) 123");
    });

    it("should handle partial input during typing", () => {
      // User is typing and has entered some digits
      expect(formatPhoneNumber("555 12")).toBe("(555) 12");
    });
  });

  describe("toE164 (AC-3.1.5)", () => {
    it("should convert raw digits to E.164 format", () => {
      expect(toE164("5551234567")).toBe("+15551234567");
    });

    it("should convert formatted phone to E.164", () => {
      expect(toE164("(555) 123-4567")).toBe("+15551234567");
    });

    it("should handle phone with spaces", () => {
      expect(toE164("555 123 4567")).toBe("+15551234567");
    });

    it("should handle empty input", () => {
      expect(toE164("")).toBe("+1");
    });

    it("should strip all non-digits before conversion", () => {
      expect(toE164("+1 (555) 123-4567")).toBe("+115551234567");
    });
  });

  describe("fromE164 (AC-3.1.5)", () => {
    it("should convert E.164 to raw 10 digits", () => {
      expect(fromE164("+15551234567")).toBe("5551234567");
    });

    it("should handle E.164 without plus sign", () => {
      expect(fromE164("15551234567")).toBe("15551234567");
    });

    it("should handle already raw digits", () => {
      expect(fromE164("5551234567")).toBe("5551234567");
    });

    it("should handle empty input", () => {
      expect(fromE164("")).toBe("");
    });

    it("should strip non-digit characters after prefix removal", () => {
      expect(fromE164("+1-555-123-4567")).toBe("5551234567");
    });
  });

  describe("extractPhoneDigits", () => {
    it("should extract digits from formatted phone", () => {
      expect(extractPhoneDigits("(555) 123-4567")).toBe("5551234567");
    });

    it("should return digits from raw input", () => {
      expect(extractPhoneDigits("5551234567")).toBe("5551234567");
    });

    it("should handle mixed input", () => {
      expect(extractPhoneDigits("555-abc-1234")).toBe("5551234");
    });

    it("should return empty for non-digit input", () => {
      expect(extractPhoneDigits("abc")).toBe("");
    });

    it("should return empty for empty input", () => {
      expect(extractPhoneDigits("")).toBe("");
    });
  });

  describe("Phone Format Round-Trip", () => {
    it("should round-trip from display to storage and back", () => {
      const original = "5551234567";
      const stored = toE164(original);
      const recovered = fromE164(stored);
      expect(recovered).toBe(original);
    });

    it("should round-trip from formatted display", () => {
      const formatted = "(555) 123-4567";
      const stored = toE164(formatted);
      const recovered = fromE164(stored);
      const reformatted = formatPhoneNumber(recovered);
      expect(reformatted).toBe(formatted);
    });
  });
});

describe("formatRelativeTime", () => {
  // These tests verify the existing functionality wasn't broken
  it("should return 'Just now' for recent timestamps", () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe("Just now");
  });

  it("should return minutes ago for timestamps < 1 hour old", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiveMinutesAgo)).toBe("5 min ago");
  });

  it("should return hours ago for timestamps < 24 hours old", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(twoHoursAgo)).toBe("2 hours ago");
  });

  it("should return singular hour for 1 hour", () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(oneHourAgo)).toBe("1 hour ago");
  });

  it("should return days ago for older timestamps", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(threeDaysAgo)).toBe("3 days ago");
  });

  it("should return singular day for 1 day", () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(oneDayAgo)).toBe("1 day ago");
  });
});
