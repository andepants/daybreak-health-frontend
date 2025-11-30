/**
 * Unit tests for currency formatting utilities
 *
 * Tests currency and percentage formatting functions with edge cases,
 * null handling, and proper USD formatting conventions.
 */
import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatPercentage,
  formatPerSessionRate,
} from "@/lib/utils/currency";

describe("formatCurrency", () => {
  it("should format cents to USD currency with cents", () => {
    expect(formatCurrency(2500)).toBe("$25.00");
  });

  it("should format large amounts with thousands separator", () => {
    expect(formatCurrency(150000)).toBe("$1,500.00");
  });

  it("should format zero as $0.00", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("should handle null by returning $0.00", () => {
    expect(formatCurrency(null)).toBe("$0.00");
  });

  it("should handle undefined by returning $0.00", () => {
    expect(formatCurrency(undefined)).toBe("$0.00");
  });

  it("should format single cent correctly", () => {
    expect(formatCurrency(1)).toBe("$0.01");
  });

  it("should format 99 cents correctly", () => {
    expect(formatCurrency(99)).toBe("$0.99");
  });

  it("should format exactly $1.00", () => {
    expect(formatCurrency(100)).toBe("$1.00");
  });

  it("should format amounts over $1 million", () => {
    expect(formatCurrency(100000000)).toBe("$1,000,000.00");
  });

  it("should handle typical copay amount", () => {
    expect(formatCurrency(3500)).toBe("$35.00");
  });

  it("should handle typical session cost", () => {
    expect(formatCurrency(15000)).toBe("$150.00");
  });
});

describe("formatPercentage", () => {
  it("should format whole number percentage", () => {
    expect(formatPercentage(80)).toBe("80%");
  });

  it("should format decimal percentage", () => {
    expect(formatPercentage(66.67)).toBe("66.67%");
  });

  it("should format zero as 0%", () => {
    expect(formatPercentage(0)).toBe("0%");
  });

  it("should format 100% correctly", () => {
    expect(formatPercentage(100)).toBe("100%");
  });

  it("should handle null by returning 0%", () => {
    expect(formatPercentage(null)).toBe("0%");
  });

  it("should handle undefined by returning 0%", () => {
    expect(formatPercentage(undefined)).toBe("0%");
  });

  it("should round to 2 decimal places", () => {
    expect(formatPercentage(33.333333)).toBe("33.33%");
  });

  it("should handle very small percentages", () => {
    expect(formatPercentage(0.01)).toBe("0.01%");
  });

  it("should handle 50% correctly", () => {
    expect(formatPercentage(50)).toBe("50%");
  });

  it("should handle 25% correctly", () => {
    expect(formatPercentage(25)).toBe("25%");
  });
});

describe("formatPerSessionRate", () => {
  it("should format per-session rate with text", () => {
    expect(formatPerSessionRate(2500)).toBe("$25.00 per session");
  });

  it("should format zero with text", () => {
    expect(formatPerSessionRate(0)).toBe("$0.00 per session");
  });

  it("should handle null by formatting as $0.00 per session", () => {
    expect(formatPerSessionRate(null)).toBe("$0.00 per session");
  });

  it("should handle undefined by formatting as $0.00 per session", () => {
    expect(formatPerSessionRate(undefined)).toBe("$0.00 per session");
  });

  it("should format typical therapy session cost", () => {
    expect(formatPerSessionRate(15000)).toBe("$150.00 per session");
  });

  it("should format large session cost", () => {
    expect(formatPerSessionRate(25000)).toBe("$250.00 per session");
  });
});
