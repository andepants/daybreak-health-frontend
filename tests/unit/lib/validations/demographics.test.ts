/**
 * Unit tests for demographics validation schemas
 *
 * Tests parentInfoSchema validation rules for first name, last name,
 * email, phone, and relationship fields per AC-3.1.2 through AC-3.1.6.
 * Tests childInfoSchema validation rules for name, DOB, pronouns,
 * grade, and primary concerns per AC-3.2.2, AC-3.2.5 through AC-3.2.10.
 * Tests clinicalIntakeSchema validation rules per AC-3.3.2 through AC-3.3.6.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  parentInfoSchema,
  parentInfoDefaults,
  RELATIONSHIP_OPTIONS,
  RELATIONSHIP_LABELS,
  childInfoSchema,
  childInfoDefaults,
  PRONOUN_OPTIONS,
  PRONOUN_LABELS,
  GRADE_OPTIONS,
  GRADE_LABELS,
  clinicalIntakeSchema,
  clinicalIntakeDefaults,
  PREVIOUS_THERAPY_OPTIONS,
  PREVIOUS_THERAPY_LABELS,
  DIAGNOSIS_OPTIONS,
  DIAGNOSIS_LABELS,
  SCHOOL_ACCOMMODATIONS_OPTIONS,
  SCHOOL_ACCOMMODATIONS_LABELS,
  type ParentInfoInput,
  type ChildInfoInput,
  type ClinicalIntakeInput,
} from "@/lib/validations/demographics";

describe("parentInfoSchema", () => {
  /**
   * Valid test data for happy path tests
   */
  const validData: ParentInfoInput = {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@example.com",
    phone: "5551234567",
    relationshipToChild: "parent",
  };

  describe("First Name Validation (AC-3.1.2)", () => {
    it("should accept valid first name (2-50 chars)", () => {
      const result = parentInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept first name at minimum length (2 chars)", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        firstName: "Jo",
      });
      expect(result.success).toBe(true);
    });

    it("should accept first name at maximum length (50 chars)", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        firstName: "A".repeat(50),
      });
      expect(result.success).toBe(true);
    });

    it("should reject first name that is too short (1 char)", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        firstName: "J",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Name must be at least 2 characters"
        );
      }
    });

    it("should reject first name that is too long (51+ chars)", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        firstName: "A".repeat(51),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Name must be no more than 50 characters"
        );
      }
    });

    it("should reject empty first name", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        firstName: "",
      });
      expect(result.success).toBe(false);
    });

    it("should trim whitespace from first name", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        firstName: "  Jane  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.firstName).toBe("Jane");
      }
    });
  });

  describe("Last Name Validation (AC-3.1.3)", () => {
    it("should accept valid last name (2-50 chars)", () => {
      const result = parentInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept last name at minimum length (2 chars)", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        lastName: "Li",
      });
      expect(result.success).toBe(true);
    });

    it("should accept last name at maximum length (50 chars)", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        lastName: "B".repeat(50),
      });
      expect(result.success).toBe(true);
    });

    it("should reject last name that is too short (1 char)", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        lastName: "D",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Name must be at least 2 characters"
        );
      }
    });

    it("should reject last name that is too long (51+ chars)", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        lastName: "B".repeat(51),
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty last name", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        lastName: "",
      });
      expect(result.success).toBe(false);
    });

    it("should trim whitespace from last name", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        lastName: "  Doe  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.lastName).toBe("Doe");
      }
    });
  });

  describe("Email Validation (AC-3.1.4)", () => {
    it("should accept valid email format", () => {
      const result = parentInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept email with subdomain", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        email: "user@mail.example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should accept email with plus addressing", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        email: "user+tag@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should reject email without @ symbol", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        email: "invalidemail.com",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Please enter a valid email address"
        );
      }
    });

    it("should reject email without domain", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        email: "user@",
      });
      expect(result.success).toBe(false);
    });

    it("should reject email without local part", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        email: "@example.com",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty email", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        email: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Please enter your email address"
        );
      }
    });
  });

  describe("Phone Validation (AC-3.1.5)", () => {
    it("should accept valid 10-digit phone number", () => {
      const result = parentInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept phone number with exactly 10 digits", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        phone: "1234567890",
      });
      expect(result.success).toBe(true);
    });

    it("should reject phone number with fewer than 10 digits", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        phone: "123456789",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Please enter a valid 10-digit phone number"
        );
      }
    });

    it("should reject phone number with more than 10 digits", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        phone: "12345678901",
      });
      expect(result.success).toBe(false);
    });

    it("should reject phone with non-numeric characters", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        phone: "555-123-4567",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty phone", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        phone: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Please enter your phone number"
        );
      }
    });
  });

  describe("Relationship Validation (AC-3.1.6)", () => {
    it("should accept 'parent' relationship", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        relationshipToChild: "parent",
      });
      expect(result.success).toBe(true);
    });

    it("should accept 'guardian' relationship", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        relationshipToChild: "guardian",
      });
      expect(result.success).toBe(true);
    });

    it("should accept 'grandparent' relationship", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        relationshipToChild: "grandparent",
      });
      expect(result.success).toBe(true);
    });

    it("should accept 'other' relationship", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        relationshipToChild: "other",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid relationship value", () => {
      const result = parentInfoSchema.safeParse({
        ...validData,
        relationshipToChild: "uncle" as typeof validData.relationshipToChild,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Please select your relationship to the child"
        );
      }
    });
  });

  describe("Full Form Validation", () => {
    it("should accept fully valid form data", () => {
      const result = parentInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should return multiple errors for multiple invalid fields", () => {
      const result = parentInfoSchema.safeParse({
        firstName: "J",
        lastName: "",
        email: "invalid",
        phone: "123",
        relationshipToChild: "invalid" as typeof validData.relationshipToChild,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(1);
      }
    });
  });

  describe("Constants and Defaults", () => {
    it("should export RELATIONSHIP_OPTIONS with correct values", () => {
      expect(RELATIONSHIP_OPTIONS).toEqual([
        "parent",
        "guardian",
        "grandparent",
        "other",
      ]);
    });

    it("should export RELATIONSHIP_LABELS with correct display names", () => {
      expect(RELATIONSHIP_LABELS).toEqual({
        parent: "Parent",
        guardian: "Guardian",
        grandparent: "Grandparent",
        other: "Other",
      });
    });

    it("should export parentInfoDefaults with empty strings", () => {
      expect(parentInfoDefaults).toEqual({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        relationshipToChild: "parent",
      });
    });
  });
});

// ============================================================================
// Child Info Schema Tests (Story 3.2)
// ============================================================================

describe("childInfoSchema", () => {
  // Mock date for consistent age validation
  const mockDate = new Date("2025-06-15T12:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Valid test data for happy path tests
   */
  const validData: ChildInfoInput = {
    firstName: "Alex",
    dateOfBirth: new Date("2012-03-15"), // 13 years old
    primaryConcerns: "Anxiety about school and social situations",
  };

  describe("First Name Validation (AC-3.2.2)", () => {
    it("should accept valid first name (2-50 chars)", () => {
      const result = childInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept first name at minimum length (2 chars)", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        firstName: "Jo",
      });
      expect(result.success).toBe(true);
    });

    it("should accept first name at maximum length (50 chars)", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        firstName: "A".repeat(50),
      });
      expect(result.success).toBe(true);
    });

    it("should reject first name too short (1 char)", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        firstName: "A",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "First name must be at least 2 characters"
        );
      }
    });

    it("should reject first name too long (51+ chars)", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        firstName: "A".repeat(51),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "First name must not exceed 50 characters"
        );
      }
    });

    it("should reject empty first name", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        firstName: "",
      });
      expect(result.success).toBe(false);
    });

    it("should trim whitespace from first name", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        firstName: "  Alex  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.firstName).toBe("Alex");
      }
    });
  });

  describe("Date of Birth Validation (AC-3.2.5)", () => {
    it("should accept child exactly 10 years old (valid boundary)", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        dateOfBirth: new Date("2015-06-15"), // Exactly 10 today
      });
      expect(result.success).toBe(true);
    });

    it("should accept child exactly 19 years old (valid boundary)", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        dateOfBirth: new Date("2006-06-15"), // Exactly 19 today
      });
      expect(result.success).toBe(true);
    });

    it("should reject child 9 years 11 months old (invalid - too young)", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        dateOfBirth: new Date("2015-07-15"), // Still 9, birthday next month
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Child must be between 10-19 years old for Daybreak services"
        );
      }
    });

    it("should reject child just turned 20 (invalid - too old)", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        dateOfBirth: new Date("2005-06-15"), // Exactly 20 today
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Child must be between 10-19 years old for Daybreak services"
        );
      }
    });

    it("should accept child in middle of range (14 years)", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        dateOfBirth: new Date("2011-03-15"), // 14 years old
      });
      expect(result.success).toBe(true);
    });

    it("should reject missing date of birth", () => {
      const result = childInfoSchema.safeParse({
        firstName: "Alex",
        primaryConcerns: "Anxiety",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid date type", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        dateOfBirth: "invalid-date",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Pronouns Validation (AC-3.2.6)", () => {
    it("should accept she-her pronouns", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        pronouns: "she-her",
      });
      expect(result.success).toBe(true);
    });

    it("should accept he-him pronouns", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        pronouns: "he-him",
      });
      expect(result.success).toBe(true);
    });

    it("should accept they-them pronouns", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        pronouns: "they-them",
      });
      expect(result.success).toBe(true);
    });

    it("should accept other pronouns", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        pronouns: "other",
      });
      expect(result.success).toBe(true);
    });

    it("should accept prefer-not-to-say pronouns", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        pronouns: "prefer-not-to-say",
      });
      expect(result.success).toBe(true);
    });

    it("should accept undefined pronouns (optional field)", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        pronouns: undefined,
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid pronouns value", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        pronouns: "invalid" as (typeof PRONOUN_OPTIONS)[number],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Custom Pronouns Validation (AC-3.2.7)", () => {
    it("should accept custom pronouns when 'other' is selected", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        pronouns: "other",
        pronounsCustom: "ze/zir",
      });
      expect(result.success).toBe(true);
    });

    it("should accept custom pronouns at max length (50 chars)", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        pronouns: "other",
        pronounsCustom: "A".repeat(50),
      });
      expect(result.success).toBe(true);
    });

    it("should reject custom pronouns over 50 chars", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        pronouns: "other",
        pronounsCustom: "A".repeat(51),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Custom pronouns must not exceed 50 characters"
        );
      }
    });

    it("should accept empty custom pronouns (optional)", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        pronouns: "other",
        pronounsCustom: "",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Grade Validation (AC-3.2.8)", () => {
    it("should accept 5th grade", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        grade: "5th",
      });
      expect(result.success).toBe(true);
    });

    it("should accept 12th grade", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        grade: "12th",
      });
      expect(result.success).toBe(true);
    });

    it("should accept not-in-school", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        grade: "not-in-school",
      });
      expect(result.success).toBe(true);
    });

    it("should accept undefined grade (optional field)", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        grade: undefined,
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid grade value", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        grade: "4th" as (typeof GRADE_OPTIONS)[number],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Primary Concerns Validation (AC-3.2.9, AC-3.2.10)", () => {
    it("should accept valid primary concerns", () => {
      const result = childInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept primary concerns at max length (2000 chars)", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        primaryConcerns: "A".repeat(2000),
      });
      expect(result.success).toBe(true);
    });

    it("should reject primary concerns over 2000 chars", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        primaryConcerns: "A".repeat(2001),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Primary concerns must not exceed 2000 characters"
        );
      }
    });

    it("should reject empty primary concerns (required field)", () => {
      const result = childInfoSchema.safeParse({
        ...validData,
        primaryConcerns: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Please describe the primary concerns"
        );
      }
    });
  });

  describe("Full Form Validation", () => {
    it("should accept fully valid form data with all optional fields", () => {
      const fullData: ChildInfoInput = {
        firstName: "Alex",
        dateOfBirth: new Date("2012-03-15"),
        pronouns: "they-them",
        pronounsCustom: undefined,
        grade: "7th",
        primaryConcerns: "Anxiety about social situations",
      };
      const result = childInfoSchema.safeParse(fullData);
      expect(result.success).toBe(true);
    });

    it("should accept minimal valid form data (required fields only)", () => {
      const result = childInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should return multiple errors for multiple invalid fields", () => {
      const result = childInfoSchema.safeParse({
        firstName: "A",
        dateOfBirth: new Date("2020-01-01"), // Too young
        primaryConcerns: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(1);
      }
    });
  });

  describe("Constants and Defaults", () => {
    it("should export PRONOUN_OPTIONS with correct values", () => {
      expect(PRONOUN_OPTIONS).toEqual([
        "she-her",
        "he-him",
        "they-them",
        "other",
        "prefer-not-to-say",
      ]);
    });

    it("should export PRONOUN_LABELS with correct display names", () => {
      expect(PRONOUN_LABELS).toEqual({
        "she-her": "She/Her",
        "he-him": "He/Him",
        "they-them": "They/Them",
        "other": "Other",
        "prefer-not-to-say": "Prefer not to say",
      });
    });

    it("should export GRADE_OPTIONS with correct values", () => {
      expect(GRADE_OPTIONS).toEqual([
        "5th",
        "6th",
        "7th",
        "8th",
        "9th",
        "10th",
        "11th",
        "12th",
        "not-in-school",
      ]);
    });

    it("should export GRADE_LABELS with correct display names", () => {
      expect(GRADE_LABELS["5th"]).toBe("5th Grade");
      expect(GRADE_LABELS["12th"]).toBe("12th Grade");
      expect(GRADE_LABELS["not-in-school"]).toBe("Not in school");
    });

    it("should export childInfoDefaults with correct values", () => {
      expect(childInfoDefaults).toEqual({
        firstName: "",
        pronouns: undefined,
        pronounsCustom: "",
        grade: undefined,
        primaryConcerns: "",
      });
    });
  });
});

// ============================================================================
// Clinical Intake Schema Tests (Story 3.3)
// ============================================================================

describe("clinicalIntakeSchema", () => {
  /**
   * Valid test data for happy path tests - all fields optional
   */
  const validData: ClinicalIntakeInput = {
    currentMedications: "Adderall 10mg",
    previousTherapy: "previously",
    diagnoses: ["anxiety", "adhd"],
    schoolAccommodations: "iep",
    additionalInfo: "Prefers morning sessions",
  };

  describe("All Fields Optional (AC-3.3.7)", () => {
    it("should accept empty form data (all optional)", () => {
      const result = clinicalIntakeSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should accept form with only some fields filled", () => {
      const result = clinicalIntakeSchema.safeParse({
        currentMedications: "Test medication",
      });
      expect(result.success).toBe(true);
    });

    it("should accept form with all fields as undefined", () => {
      const result = clinicalIntakeSchema.safeParse({
        currentMedications: undefined,
        previousTherapy: undefined,
        diagnoses: undefined,
        schoolAccommodations: undefined,
        additionalInfo: undefined,
      });
      expect(result.success).toBe(true);
    });

    it("should accept empty string for optional text fields", () => {
      const result = clinicalIntakeSchema.safeParse({
        currentMedications: "",
        additionalInfo: "",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Current Medications Validation (AC-3.3.2)", () => {
    it("should accept valid medications text", () => {
      const result = clinicalIntakeSchema.safeParse({
        currentMedications: "Adderall 10mg, Prozac 20mg",
      });
      expect(result.success).toBe(true);
    });

    it("should accept medications at max length (500 chars)", () => {
      const result = clinicalIntakeSchema.safeParse({
        currentMedications: "A".repeat(500),
      });
      expect(result.success).toBe(true);
    });

    it("should reject medications over 500 chars", () => {
      const result = clinicalIntakeSchema.safeParse({
        currentMedications: "A".repeat(501),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Medications description must not exceed 500 characters"
        );
      }
    });

    it("should accept empty medications (optional)", () => {
      const result = clinicalIntakeSchema.safeParse({
        currentMedications: "",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Previous Therapy Validation (AC-3.3.3)", () => {
    it("should accept 'never' option", () => {
      const result = clinicalIntakeSchema.safeParse({
        previousTherapy: "never",
      });
      expect(result.success).toBe(true);
    });

    it("should accept 'currently' option", () => {
      const result = clinicalIntakeSchema.safeParse({
        previousTherapy: "currently",
      });
      expect(result.success).toBe(true);
    });

    it("should accept 'previously' option", () => {
      const result = clinicalIntakeSchema.safeParse({
        previousTherapy: "previously",
      });
      expect(result.success).toBe(true);
    });

    it("should accept undefined (optional field)", () => {
      const result = clinicalIntakeSchema.safeParse({
        previousTherapy: undefined,
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid previous therapy value", () => {
      const result = clinicalIntakeSchema.safeParse({
        previousTherapy: "invalid" as (typeof PREVIOUS_THERAPY_OPTIONS)[number],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Diagnoses Multi-Select Validation (AC-3.3.4)", () => {
    it("should accept single diagnosis", () => {
      const result = clinicalIntakeSchema.safeParse({
        diagnoses: ["anxiety"],
      });
      expect(result.success).toBe(true);
    });

    it("should accept multiple diagnoses", () => {
      const result = clinicalIntakeSchema.safeParse({
        diagnoses: ["anxiety", "depression", "adhd"],
      });
      expect(result.success).toBe(true);
    });

    it("should accept all diagnosis options", () => {
      const result = clinicalIntakeSchema.safeParse({
        diagnoses: ["anxiety", "depression", "adhd", "autism", "other"],
      });
      expect(result.success).toBe(true);
    });

    it("should accept empty diagnoses array", () => {
      const result = clinicalIntakeSchema.safeParse({
        diagnoses: [],
      });
      expect(result.success).toBe(true);
    });

    it("should accept undefined diagnoses (optional)", () => {
      const result = clinicalIntakeSchema.safeParse({
        diagnoses: undefined,
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid diagnosis value in array", () => {
      const result = clinicalIntakeSchema.safeParse({
        diagnoses: ["anxiety", "invalid" as (typeof DIAGNOSIS_OPTIONS)[number]],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("School Accommodations Validation (AC-3.3.5)", () => {
    it("should accept 'none' option", () => {
      const result = clinicalIntakeSchema.safeParse({
        schoolAccommodations: "none",
      });
      expect(result.success).toBe(true);
    });

    it("should accept 'iep' option", () => {
      const result = clinicalIntakeSchema.safeParse({
        schoolAccommodations: "iep",
      });
      expect(result.success).toBe(true);
    });

    it("should accept '504-plan' option", () => {
      const result = clinicalIntakeSchema.safeParse({
        schoolAccommodations: "504-plan",
      });
      expect(result.success).toBe(true);
    });

    it("should accept 'other' option", () => {
      const result = clinicalIntakeSchema.safeParse({
        schoolAccommodations: "other",
      });
      expect(result.success).toBe(true);
    });

    it("should accept undefined (optional field)", () => {
      const result = clinicalIntakeSchema.safeParse({
        schoolAccommodations: undefined,
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid accommodations value", () => {
      const result = clinicalIntakeSchema.safeParse({
        schoolAccommodations: "invalid" as (typeof SCHOOL_ACCOMMODATIONS_OPTIONS)[number],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Additional Info Validation (AC-3.3.6)", () => {
    it("should accept valid additional info text", () => {
      const result = clinicalIntakeSchema.safeParse({
        additionalInfo: "Prefers video sessions over in-person",
      });
      expect(result.success).toBe(true);
    });

    it("should accept additional info at max length (500 chars)", () => {
      const result = clinicalIntakeSchema.safeParse({
        additionalInfo: "A".repeat(500),
      });
      expect(result.success).toBe(true);
    });

    it("should reject additional info over 500 chars", () => {
      const result = clinicalIntakeSchema.safeParse({
        additionalInfo: "A".repeat(501),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Additional information must not exceed 500 characters"
        );
      }
    });

    it("should accept empty additional info (optional)", () => {
      const result = clinicalIntakeSchema.safeParse({
        additionalInfo: "",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Full Form Validation", () => {
    it("should accept fully valid form data with all fields", () => {
      const result = clinicalIntakeSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentMedications).toBe("Adderall 10mg");
        expect(result.data.previousTherapy).toBe("previously");
        expect(result.data.diagnoses).toEqual(["anxiety", "adhd"]);
        expect(result.data.schoolAccommodations).toBe("iep");
        expect(result.data.additionalInfo).toBe("Prefers morning sessions");
      }
    });

    it("should return errors for multiple invalid fields", () => {
      const result = clinicalIntakeSchema.safeParse({
        currentMedications: "A".repeat(501),
        previousTherapy: "invalid" as (typeof PREVIOUS_THERAPY_OPTIONS)[number],
        additionalInfo: "B".repeat(501),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(1);
      }
    });
  });

  describe("Constants and Defaults", () => {
    it("should export PREVIOUS_THERAPY_OPTIONS with correct values", () => {
      expect(PREVIOUS_THERAPY_OPTIONS).toEqual([
        "never",
        "currently",
        "previously",
      ]);
    });

    it("should export PREVIOUS_THERAPY_LABELS with correct display names", () => {
      expect(PREVIOUS_THERAPY_LABELS).toEqual({
        never: "Never",
        currently: "Currently in therapy",
        previously: "Previously in therapy",
      });
    });

    it("should export DIAGNOSIS_OPTIONS with correct values", () => {
      expect(DIAGNOSIS_OPTIONS).toEqual([
        "anxiety",
        "depression",
        "adhd",
        "autism",
        "other",
      ]);
    });

    it("should export DIAGNOSIS_LABELS with correct display names", () => {
      expect(DIAGNOSIS_LABELS).toEqual({
        anxiety: "Anxiety",
        depression: "Depression",
        adhd: "ADHD",
        autism: "Autism",
        other: "Other",
      });
    });

    it("should export SCHOOL_ACCOMMODATIONS_OPTIONS with correct values", () => {
      expect(SCHOOL_ACCOMMODATIONS_OPTIONS).toEqual([
        "none",
        "iep",
        "504-plan",
        "other",
      ]);
    });

    it("should export SCHOOL_ACCOMMODATIONS_LABELS with correct display names", () => {
      expect(SCHOOL_ACCOMMODATIONS_LABELS).toEqual({
        none: "None",
        iep: "IEP",
        "504-plan": "504 Plan",
        other: "Other",
      });
    });

    it("should export clinicalIntakeDefaults with correct values", () => {
      expect(clinicalIntakeDefaults).toEqual({
        currentMedications: "",
        previousTherapy: undefined,
        diagnoses: [],
        schoolAccommodations: undefined,
        additionalInfo: "",
      });
    });
  });
});
