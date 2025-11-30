/**
 * Unit tests for insurance carriers data
 *
 * Tests carrier list, search filtering, and carrier lookup functionality
 * per AC-4.1.1 (searchable carrier dropdown).
 */
import { describe, it, expect } from "vitest";
import {
  INSURANCE_CARRIERS,
  filterCarriers,
  getCarrierById,
  type InsuranceCarrier,
} from "@/lib/data/insurance-carriers";

describe("INSURANCE_CARRIERS", () => {
  it("should contain 20+ carriers (AC-4.1.1)", () => {
    expect(INSURANCE_CARRIERS.length).toBeGreaterThanOrEqual(20);
  });

  it("should have 'Other' as the last carrier option", () => {
    const lastCarrier = INSURANCE_CARRIERS[INSURANCE_CARRIERS.length - 1];
    expect(lastCarrier.id).toBe("other");
    expect(lastCarrier.name).toBe("Other");
  });

  it("should have all carriers with required fields", () => {
    INSURANCE_CARRIERS.forEach((carrier) => {
      expect(carrier.id).toBeDefined();
      expect(carrier.name).toBeDefined();
      expect(carrier.idFormat).toBeDefined();
      expect(typeof carrier.id).toBe("string");
      expect(typeof carrier.name).toBe("string");
      expect(typeof carrier.idFormat).toBe("string");
    });
  });

  it("should include major national carriers", () => {
    const carrierNames = INSURANCE_CARRIERS.map((c) => c.name.toLowerCase());

    expect(carrierNames).toContain("aetna");
    expect(carrierNames).toContain("blue cross blue shield");
    expect(carrierNames).toContain("cigna");
    expect(carrierNames).toContain("humana");
    expect(carrierNames).toContain("unitedhealthcare");
    expect(carrierNames).toContain("kaiser permanente");
  });

  it("should have unique carrier IDs", () => {
    const ids = INSURANCE_CARRIERS.map((c) => c.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids.length).toBe(uniqueIds.length);
  });
});

describe("filterCarriers", () => {
  it("should return all carriers for empty query (AC-4.1.1)", () => {
    const result = filterCarriers("");
    expect(result).toEqual(INSURANCE_CARRIERS);
  });

  it("should return all carriers for whitespace-only query", () => {
    const result = filterCarriers("   ");
    expect(result).toEqual(INSURANCE_CARRIERS);
  });

  it("should filter by carrier name (case insensitive)", () => {
    const result = filterCarriers("Blue");
    expect(result.length).toBeGreaterThan(0);
    result.forEach((carrier) => {
      expect(
        carrier.name.toLowerCase().includes("blue") ||
        carrier.id.toLowerCase().includes("blue")
      ).toBe(true);
    });
  });

  it("should filter by carrier ID", () => {
    const result = filterCarriers("bcbs");
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("bcbs");
  });

  it("should return empty array for no matches", () => {
    const result = filterCarriers("xyznonexistent");
    expect(result).toEqual([]);
  });

  it("should be case insensitive for name search", () => {
    const resultLower = filterCarriers("aetna");
    const resultUpper = filterCarriers("AETNA");
    const resultMixed = filterCarriers("AeTnA");

    expect(resultLower).toEqual(resultUpper);
    expect(resultUpper).toEqual(resultMixed);
  });

  it("should find carriers with partial name match", () => {
    const result = filterCarriers("health");
    expect(result.length).toBeGreaterThan(0);
    // Should match carriers with "health" in name like "Health Net", "EmblemHealth", etc.
  });
});

describe("getCarrierById", () => {
  it("should return carrier for valid ID", () => {
    const carrier = getCarrierById("aetna");
    expect(carrier).toBeDefined();
    expect(carrier?.name).toBe("Aetna");
  });

  it("should return undefined for invalid ID", () => {
    const carrier = getCarrierById("nonexistent");
    expect(carrier).toBeUndefined();
  });

  it("should return carrier with ID format hint", () => {
    const carrier = getCarrierById("bcbs");
    expect(carrier).toBeDefined();
    expect(carrier?.idFormat).toBeDefined();
    expect(carrier?.idFormat.length).toBeGreaterThan(0);
  });

  it("should find 'other' carrier", () => {
    const carrier = getCarrierById("other");
    expect(carrier).toBeDefined();
    expect(carrier?.name).toBe("Other");
    expect(carrier?.idFormat).toBe("Check your insurance card");
  });
});
