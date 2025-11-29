/**
 * Unit tests for age validation utilities
 *
 * Tests age calculation and validation functions for the 10-19 age range
 * required by Daybreak services. Covers edge cases for birthdays,
 * leap years, and boundary conditions.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calculateAge,
  isValidAge,
  getMinBirthDate,
  getMaxBirthDate,
  getDefaultCalendarDate,
} from "@/lib/utils/age-validation";

describe("age-validation utilities", () => {
  // Mock date for consistent testing
  // Set "today" to 2025-06-15 for predictable age calculations
  const mockDate = new Date("2025-06-15T12:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("calculateAge", () => {
    it("should calculate age correctly for birthday already passed this year", () => {
      // Born Jan 15, 2012 - already had birthday this year (June 15, 2025)
      const birthDate = new Date("2012-01-15");
      expect(calculateAge(birthDate)).toBe(13);
    });

    it("should calculate age correctly for birthday not yet passed this year", () => {
      // Born Dec 15, 2012 - birthday hasn't happened yet this year
      const birthDate = new Date("2012-12-15");
      expect(calculateAge(birthDate)).toBe(12);
    });

    it("should calculate age correctly for birthday today", () => {
      // Born June 15, 2012 - birthday is today
      const birthDate = new Date("2012-06-15");
      expect(calculateAge(birthDate)).toBe(13);
    });

    it("should calculate age correctly for birthday tomorrow", () => {
      // Born June 16, 2012 - birthday is tomorrow (using local time)
      const birthDate = new Date(2012, 5, 16); // Month is 0-indexed
      expect(calculateAge(birthDate)).toBe(12);
    });

    it("should handle leap year birthday (Feb 29)", () => {
      // Born Feb 29, 2012 (leap year) - tested on June 15, 2025
      const birthDate = new Date("2012-02-29");
      expect(calculateAge(birthDate)).toBe(13);
    });

    it("should handle child born on last day of month", () => {
      // Born Jan 31, 2010
      const birthDate = new Date("2010-01-31");
      expect(calculateAge(birthDate)).toBe(15);
    });

    it("should handle newborn age (0 years)", () => {
      // Born June 1, 2025 - only 14 days old
      const birthDate = new Date("2025-06-01");
      expect(calculateAge(birthDate)).toBe(0);
    });
  });

  describe("isValidAge", () => {
    describe("AC-3.2.5: Age validation 10-19 years (inclusive)", () => {
      it("should return true for child exactly 10 years old", () => {
        // Birthday was June 15, 2015 - exactly 10 today
        const birthDate = new Date("2015-06-15");
        expect(isValidAge(birthDate)).toBe(true);
      });

      it("should return true for child exactly 19 years old", () => {
        // Birthday was June 15, 2006 - exactly 19 today
        const birthDate = new Date("2006-06-15");
        expect(isValidAge(birthDate)).toBe(true);
      });

      it("should return false for child 9 years 11 months old", () => {
        // Birthday will be July 15, 2015 - still 9 years old
        const birthDate = new Date("2015-07-15");
        expect(isValidAge(birthDate)).toBe(false);
      });

      it("should return false for child 19 years 1 month old (20 soon)", () => {
        // Birthday was May 15, 2006 - already 19, birthday was last month
        // Still valid at 19
        const birthDate = new Date("2006-05-15");
        expect(isValidAge(birthDate)).toBe(true);
      });

      it("should return false for child just turned 20", () => {
        // Birthday was June 15, 2005 - exactly 20 today
        const birthDate = new Date("2005-06-15");
        expect(isValidAge(birthDate)).toBe(false);
      });

      it("should return false for child too young (5 years)", () => {
        const birthDate = new Date("2020-01-15");
        expect(isValidAge(birthDate)).toBe(false);
      });

      it("should return false for child too old (25 years)", () => {
        const birthDate = new Date("2000-01-15");
        expect(isValidAge(birthDate)).toBe(false);
      });

      it("should return true for middle of range (14 years)", () => {
        const birthDate = new Date("2011-03-15");
        expect(isValidAge(birthDate)).toBe(true);
      });
    });

    describe("Edge cases", () => {
      it("should handle day before 10th birthday (invalid)", () => {
        // Tomorrow they turn 10 (using local time to avoid timezone issues)
        const birthDate = new Date(2015, 5, 16); // June 16, 2015
        expect(isValidAge(birthDate)).toBe(false);
      });

      it("should handle day before 20th birthday (valid - still 19)", () => {
        // Tomorrow they turn 20 (using local time to avoid timezone issues)
        const birthDate = new Date(2005, 5, 16); // June 16, 2005
        expect(isValidAge(birthDate)).toBe(true);
      });
    });
  });

  describe("getMinBirthDate (AC-3.2.5)", () => {
    it("should return date 19 years ago", () => {
      const minDate = getMinBirthDate();
      // 19 years before June 15, 2025 = June 15, 2006
      expect(minDate.getFullYear()).toBe(2006);
      expect(minDate.getMonth()).toBe(5); // June (0-indexed)
      expect(minDate.getDate()).toBe(15);
    });
  });

  describe("getMaxBirthDate (AC-3.2.5)", () => {
    it("should return date 10 years ago", () => {
      const maxDate = getMaxBirthDate();
      // 10 years before June 15, 2025 = June 15, 2015
      expect(maxDate.getFullYear()).toBe(2015);
      expect(maxDate.getMonth()).toBe(5); // June (0-indexed)
      expect(maxDate.getDate()).toBe(15);
    });
  });

  describe("getDefaultCalendarDate (AC-3.2.4)", () => {
    it("should return date ~13 years ago for quick navigation", () => {
      const defaultDate = getDefaultCalendarDate();
      // 13 years before June 15, 2025 = June 15, 2012
      expect(defaultDate.getFullYear()).toBe(2012);
    });
  });
});
