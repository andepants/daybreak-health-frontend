/**
 * Unit tests for form assessment validation schemas
 *
 * Tests Zod validation schemas for all three form pages
 * and the combined form assessment schema.
 */

import { describe, it, expect } from "vitest";
import {
  page1Schema,
  page2Schema,
  page3Schema,
  formAssessmentSchema,
  type Page1Input,
  type Page2Input,
  type Page3Input,
} from "@/lib/validations/assessment";

describe("Page 1 Schema - About Your Child", () => {
  describe("primaryConcerns field", () => {
    it("should accept valid concerns text", () => {
      const result = page1Schema.safeParse({
        primaryConcerns: "My child has been struggling with anxiety at school for the past few months.",
        concernDuration: "3-6-months",
        concernSeverity: 3,
      });
      expect(result.success).toBe(true);
    });

    it("should reject concerns less than 10 characters", () => {
      const result = page1Schema.safeParse({
        primaryConcerns: "Short",
        concernDuration: "3-6-months",
        concernSeverity: 3,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("primaryConcerns");
      }
    });

    it("should reject concerns over 2000 characters", () => {
      const result = page1Schema.safeParse({
        primaryConcerns: "a".repeat(2001),
        concernDuration: "3-6-months",
        concernSeverity: 3,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("primaryConcerns");
      }
    });

    it("should require primaryConcerns field", () => {
      const result = page1Schema.safeParse({
        concernDuration: "3-6-months",
        concernSeverity: 3,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("concernDuration field", () => {
    it("should accept valid duration options", () => {
      const durations = ["less-than-1-month", "1-3-months", "3-6-months", "6-plus-months"];
      durations.forEach((duration) => {
        const result = page1Schema.safeParse({
          primaryConcerns: "Valid concerns text here",
          concernDuration: duration,
          concernSeverity: 3,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid duration options", () => {
      const result = page1Schema.safeParse({
        primaryConcerns: "Valid concerns text here",
        concernDuration: "invalid-duration",
        concernSeverity: 3,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("concernSeverity field", () => {
    it("should accept severity values 1-5", () => {
      [1, 2, 3, 4, 5].forEach((severity) => {
        const result = page1Schema.safeParse({
          primaryConcerns: "Valid concerns text here",
          concernDuration: "3-6-months",
          concernSeverity: severity,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject severity below 1", () => {
      const result = page1Schema.safeParse({
        primaryConcerns: "Valid concerns text here",
        concernDuration: "3-6-months",
        concernSeverity: 0,
      });
      expect(result.success).toBe(false);
    });

    it("should reject severity above 5", () => {
      const result = page1Schema.safeParse({
        primaryConcerns: "Valid concerns text here",
        concernDuration: "3-6-months",
        concernSeverity: 6,
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("Page 2 Schema - Daily Life Impact", () => {
  it("should accept all valid options", () => {
    const result = page2Schema.safeParse({
      sleepPatterns: "difficulty-falling-asleep",
      appetiteChanges: "decreased",
      schoolPerformance: "declining",
      socialRelationships: "withdrawing",
    });
    expect(result.success).toBe(true);
  });

  it("should accept empty object (all fields optional)", () => {
    const result = page2Schema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should accept partial data", () => {
    const result = page2Schema.safeParse({
      sleepPatterns: "no-change",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid sleep pattern option", () => {
    const result = page2Schema.safeParse({
      sleepPatterns: "invalid-option",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid appetite change option", () => {
    const result = page2Schema.safeParse({
      appetiteChanges: "invalid-option",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid school performance option", () => {
    const result = page2Schema.safeParse({
      schoolPerformance: "invalid-option",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid social relationships option", () => {
    const result = page2Schema.safeParse({
      socialRelationships: "invalid-option",
    });
    expect(result.success).toBe(false);
  });
});

describe("Page 3 Schema - Additional Context", () => {
  describe("recentEvents field", () => {
    it("should accept valid recent events text", () => {
      const result = page3Schema.safeParse({
        recentEvents: "We recently moved to a new city and my child started a new school.",
        therapyGoals: "I hope therapy will help with the adjustment.",
      });
      expect(result.success).toBe(true);
    });

    it("should accept empty recent events (optional)", () => {
      const result = page3Schema.safeParse({
        recentEvents: "",
        therapyGoals: "I hope therapy will help with anxiety.",
      });
      expect(result.success).toBe(true);
    });

    it("should accept undefined recent events (optional)", () => {
      const result = page3Schema.safeParse({
        therapyGoals: "I hope therapy will help with anxiety.",
      });
      expect(result.success).toBe(true);
    });

    it("should reject recent events over 1000 characters", () => {
      const result = page3Schema.safeParse({
        recentEvents: "a".repeat(1001),
        therapyGoals: "I hope therapy will help with anxiety.",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("therapyGoals field", () => {
    it("should accept valid therapy goals", () => {
      const result = page3Schema.safeParse({
        therapyGoals: "I hope therapy will help my child manage their anxiety and improve their confidence.",
      });
      expect(result.success).toBe(true);
    });

    it("should reject therapy goals less than 10 characters", () => {
      const result = page3Schema.safeParse({
        therapyGoals: "Help",
      });
      expect(result.success).toBe(false);
    });

    it("should reject therapy goals over 1000 characters", () => {
      const result = page3Schema.safeParse({
        therapyGoals: "a".repeat(1001),
      });
      expect(result.success).toBe(false);
    });

    it("should require therapy goals", () => {
      const result = page3Schema.safeParse({
        recentEvents: "Some recent events",
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("Combined Form Assessment Schema", () => {
  it("should accept complete valid form data", () => {
    const validData = {
      // Page 1
      primaryConcerns: "My child has been showing signs of anxiety and depression for several months.",
      concernDuration: "3-6-months",
      concernSeverity: 4,
      // Page 2
      sleepPatterns: "difficulty-falling-asleep",
      appetiteChanges: "decreased",
      schoolPerformance: "declining",
      socialRelationships: "withdrawing",
      // Page 3
      recentEvents: "Started new school this year",
      therapyGoals: "Help my child cope with anxiety and improve their overall wellbeing.",
    };

    const result = formAssessmentSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should accept form data with optional fields omitted", () => {
    const minimalData = {
      // Page 1 (all required)
      primaryConcerns: "My child has been showing signs of anxiety for several months.",
      concernDuration: "3-6-months",
      concernSeverity: 3,
      // Page 2 (all optional) - omitted
      // Page 3
      therapyGoals: "Help my child cope with anxiety.",
    };

    const result = formAssessmentSchema.safeParse(minimalData);
    expect(result.success).toBe(true);
  });

  it("should reject form data missing required fields", () => {
    const invalidData = {
      primaryConcerns: "My child has been showing signs of anxiety.",
      // Missing concernDuration
      concernSeverity: 3,
      therapyGoals: "Help my child cope with anxiety.",
    };

    const result = formAssessmentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
