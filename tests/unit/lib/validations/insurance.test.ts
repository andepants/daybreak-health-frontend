/**
 * Unit tests for insurance validation schema
 *
 * Tests insuranceSchema validation rules for carrier, member ID, group number,
 * subscriber name, and relationship fields per AC-4.1.1 through AC-4.1.5.
 */
import { describe, it, expect } from "vitest";
import {
  insuranceSchema,
  insuranceDefaults,
  RELATIONSHIP_TO_SUBSCRIBER_OPTIONS,
  RELATIONSHIP_TO_SUBSCRIBER_LABELS,
  type InsuranceFormData,
} from "@/lib/validations/insurance";

describe("insuranceSchema", () => {
  /**
   * Valid test data for happy path tests
   */
  const validData: InsuranceFormData = {
    carrier: "bcbs",
    memberId: "ABC123456789",
    groupNumber: "GRP-001",
    subscriberName: "Jane Doe",
    relationshipToSubscriber: "Self",
  };

  describe("Carrier Validation (AC-4.1.1)", () => {
    it("should accept valid carrier selection", () => {
      const result = insuranceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty carrier", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        carrier: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Please select an insurance carrier"
        );
      }
    });
  });

  describe("Member ID Validation (AC-4.1.2)", () => {
    it("should accept valid member ID (5-30 alphanumeric with hyphens)", () => {
      const result = insuranceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept member ID at minimum length (5 chars)", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        memberId: "ABC12",
      });
      expect(result.success).toBe(true);
    });

    it("should accept member ID at maximum length (30 chars)", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        memberId: "ABCDEFGHIJ1234567890ABCDEFGHIJ",
      });
      expect(result.success).toBe(true);
    });

    it("should accept member ID with hyphens", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        memberId: "ABC-123-456",
      });
      expect(result.success).toBe(true);
    });

    it("should reject member ID that is too short (< 5 chars)", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        memberId: "ABC1",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Member ID must be at least 5 characters"
        );
      }
    });

    it("should reject member ID that is too long (> 30 chars)", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        memberId: "A".repeat(31),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Member ID must be 30 characters or less"
        );
      }
    });

    it("should reject member ID with invalid characters (spaces)", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        memberId: "ABC 12345",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Member ID can only contain letters, numbers, and hyphens"
        );
      }
    });

    it("should reject member ID with special characters", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        memberId: "ABC@12345",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty member ID", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        memberId: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Group Number Validation (AC-4.1.3)", () => {
    it("should accept valid group number", () => {
      const result = insuranceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept empty group number (optional)", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        groupNumber: "",
      });
      expect(result.success).toBe(true);
    });

    it("should accept undefined group number (optional)", () => {
      const data = { ...validData };
      delete (data as Record<string, unknown>).groupNumber;
      const result = insuranceSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept group number at maximum length (30 chars)", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        groupNumber: "ABCDEFGHIJ1234567890ABCDEFGHIJ",
      });
      expect(result.success).toBe(true);
    });

    it("should accept group number with hyphens", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        groupNumber: "GRP-001-ABC",
      });
      expect(result.success).toBe(true);
    });

    it("should reject group number that is too long (> 30 chars)", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        groupNumber: "A".repeat(31),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Group number must be 30 characters or less"
        );
      }
    });

    it("should reject group number with invalid characters", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        groupNumber: "GRP@001",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Group number can only contain letters, numbers, and hyphens"
        );
      }
    });
  });

  describe("Subscriber Name Validation (AC-4.1.4)", () => {
    it("should accept valid subscriber name", () => {
      const result = insuranceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept subscriber name at minimum length (2 chars)", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        subscriberName: "Jo",
      });
      expect(result.success).toBe(true);
    });

    it("should accept subscriber name at maximum length (100 chars)", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        subscriberName: "A".repeat(100),
      });
      expect(result.success).toBe(true);
    });

    it("should reject subscriber name too short (< 2 chars)", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        subscriberName: "J",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Subscriber name must be at least 2 characters"
        );
      }
    });

    it("should reject subscriber name too long (> 100 chars)", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        subscriberName: "A".repeat(101),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Subscriber name must be 100 characters or less"
        );
      }
    });

    it("should reject empty subscriber name", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        subscriberName: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Relationship to Subscriber Validation (AC-4.1.4)", () => {
    it("should accept 'Self' relationship", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        relationshipToSubscriber: "Self",
      });
      expect(result.success).toBe(true);
    });

    it("should accept 'Spouse' relationship", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        relationshipToSubscriber: "Spouse",
      });
      expect(result.success).toBe(true);
    });

    it("should accept 'Child' relationship", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        relationshipToSubscriber: "Child",
      });
      expect(result.success).toBe(true);
    });

    it("should accept 'Other' relationship", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        relationshipToSubscriber: "Other",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid relationship value", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        relationshipToSubscriber: "Parent" as InsuranceFormData["relationshipToSubscriber"],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Please select your relationship to the subscriber"
        );
      }
    });
  });

  describe("Full Form Validation", () => {
    it("should accept fully valid form data", () => {
      const result = insuranceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should accept form with optional group number empty", () => {
      const result = insuranceSchema.safeParse({
        ...validData,
        groupNumber: "",
      });
      expect(result.success).toBe(true);
    });

    it("should return multiple errors for multiple invalid fields", () => {
      const result = insuranceSchema.safeParse({
        carrier: "",
        memberId: "AB",
        groupNumber: "A".repeat(31),
        subscriberName: "J",
        relationshipToSubscriber: "Invalid" as InsuranceFormData["relationshipToSubscriber"],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(1);
      }
    });
  });

  describe("Constants and Defaults", () => {
    it("should export RELATIONSHIP_TO_SUBSCRIBER_OPTIONS with correct values", () => {
      expect(RELATIONSHIP_TO_SUBSCRIBER_OPTIONS).toEqual([
        "Self",
        "Spouse",
        "Child",
        "Other",
      ]);
    });

    it("should export RELATIONSHIP_TO_SUBSCRIBER_LABELS with correct display names", () => {
      expect(RELATIONSHIP_TO_SUBSCRIBER_LABELS).toEqual({
        Self: "Self (I am the policyholder)",
        Spouse: "Spouse",
        Child: "Child",
        Other: "Other",
      });
    });

    it("should export insuranceDefaults with correct values", () => {
      expect(insuranceDefaults).toEqual({
        carrier: "",
        memberId: "",
        groupNumber: "",
        subscriberName: "",
        relationshipToSubscriber: "Self",
      });
    });
  });
});
