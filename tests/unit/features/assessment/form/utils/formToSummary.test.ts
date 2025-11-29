/**
 * Unit tests for formToSummary utility
 *
 * Tests form data transformation to assessment summary structure
 * ensuring parity with AI chat summaries.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  formToSummary,
  formatSummaryForDisplay,
  type AssessmentSummary,
} from "@/features/assessment/form/utils/formToSummary";
import type { FormAssessmentInput } from "@/lib/validations/assessment";

describe("formToSummary", () => {
  const baseFormData: FormAssessmentInput = {
    primaryConcerns: "My child has been experiencing anxiety at school. They don't want to go to class. They have trouble sleeping.",
    concernDuration: "3-6-months",
    concernSeverity: 4,
    sleepPatterns: "difficulty-falling-asleep",
    appetiteChanges: "decreased",
    schoolPerformance: "declining",
    socialRelationships: "withdrawing",
    recentEvents: "Started new school this fall",
    therapyGoals: "I hope therapy helps with anxiety and improves their confidence at school.",
  };

  it("should generate summary with all required fields", () => {
    const summary = formToSummary(baseFormData);

    expect(summary).toHaveProperty("keyConcerns");
    expect(summary).toHaveProperty("recommendedFocus");
    expect(summary).toHaveProperty("generatedAt");
    expect(summary).toHaveProperty("source", "form");
    expect(summary).toHaveProperty("metadata");
  });

  it("should extract key concerns from primary concerns text", () => {
    const summary = formToSummary(baseFormData);

    expect(summary.keyConcerns).toBeInstanceOf(Array);
    expect(summary.keyConcerns.length).toBeGreaterThan(0);
    expect(summary.keyConcerns.length).toBeLessThanOrEqual(3);
  });

  it("should include child name when provided", () => {
    const summary = formToSummary(baseFormData, "Alex");

    expect(summary.childName).toBe("Alex");
  });

  it("should map concern duration to human-readable label", () => {
    const summary = formToSummary(baseFormData);

    expect(summary.metadata.concernDuration).toBe("3-6 months");
  });

  it("should include concern severity", () => {
    const summary = formToSummary(baseFormData);

    expect(summary.metadata.concernSeverity).toBe(4);
  });

  it("should map daily life impact fields to labels", () => {
    const summary = formToSummary(baseFormData);
    const impact = summary.metadata.dailyLifeImpact;

    expect(impact.sleep).toBe("Difficulty falling asleep");
    expect(impact.appetite).toBe("Decreased appetite");
    expect(impact.school).toBe("Declining");
    expect(impact.social).toBe("Withdrawing from friends/activities");
  });

  it("should handle missing optional daily life impact fields", () => {
    const minimalData: FormAssessmentInput = {
      primaryConcerns: "My child has been experiencing anxiety at school.",
      concernDuration: "3-6-months",
      concernSeverity: 3,
      therapyGoals: "Help with anxiety management.",
    };

    const summary = formToSummary(minimalData);
    const impact = summary.metadata.dailyLifeImpact;

    expect(impact.sleep).toBeUndefined();
    expect(impact.appetite).toBeUndefined();
    expect(impact.school).toBeUndefined();
    expect(impact.social).toBeUndefined();
  });

  it("should include recent events when provided", () => {
    const summary = formToSummary(baseFormData);

    expect(summary.metadata.recentEvents).toBe("Started new school this fall");
  });

  it("should include therapy goals", () => {
    const summary = formToSummary(baseFormData);

    expect(summary.metadata.therapyGoals).toBe(
      "I hope therapy helps with anxiety and improves their confidence at school."
    );
  });

  it("should generate timestamp in ISO format", () => {
    const beforeTime = new Date().toISOString();
    const summary = formToSummary(baseFormData);
    const afterTime = new Date().toISOString();

    expect(summary.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(summary.generatedAt >= beforeTime).toBe(true);
    expect(summary.generatedAt <= afterTime).toBe(true);
  });

  describe("recommendedFocus generation", () => {
    it("should include priority support for high severity", () => {
      const highSeverityData = { ...baseFormData, concernSeverity: 5 };
      const summary = formToSummary(highSeverityData);

      expect(
        summary.recommendedFocus.some((f) =>
          f.toLowerCase().includes("priority")
        )
      ).toBe(true);
    });

    it("should include long-standing concerns recommendation for 6+ months", () => {
      const longTermData = { ...baseFormData, concernDuration: "6-plus-months" as const };
      const summary = formToSummary(longTermData);

      expect(
        summary.recommendedFocus.some((f) =>
          f.toLowerCase().includes("long")
        )
      ).toBe(true);
    });

    it("should include sleep focus for sleep issues", () => {
      const summary = formToSummary(baseFormData);

      expect(
        summary.recommendedFocus.some((f) =>
          f.toLowerCase().includes("sleep")
        )
      ).toBe(true);
    });

    it("should include school focus for academic issues", () => {
      const summary = formToSummary(baseFormData);

      expect(
        summary.recommendedFocus.some((f) =>
          f.toLowerCase().includes("school") || f.toLowerCase().includes("academic")
        )
      ).toBe(true);
    });

    it("should include social focus for relationship issues", () => {
      // Use minimal data to ensure social focus isn't cut off by 5-item limit
      const socialFocusData: FormAssessmentInput = {
        primaryConcerns: "My child is having social difficulties.",
        concernDuration: "1-3-months",
        concernSeverity: 2,
        socialRelationships: "withdrawing",
        therapyGoals: "I want to help my child make friends.",
      };
      const summary = formToSummary(socialFocusData);

      expect(
        summary.recommendedFocus.some((f) =>
          f.toLowerCase().includes("social")
        )
      ).toBe(true);
    });

    it("should extract focus from therapy goals mentioning anxiety", () => {
      const summary = formToSummary(baseFormData);

      expect(
        summary.recommendedFocus.some((f) =>
          f.toLowerCase().includes("anxiety")
        )
      ).toBe(true);
    });

    it("should limit recommended focus to 5 items", () => {
      const summary = formToSummary(baseFormData);

      expect(summary.recommendedFocus.length).toBeLessThanOrEqual(5);
    });

    it("should provide default focus when no specific issues", () => {
      const minimalData: FormAssessmentInput = {
        primaryConcerns: "Just want to check in on my child's wellbeing.",
        concernDuration: "less-than-1-month",
        concernSeverity: 1,
        therapyGoals: "General support and guidance.",
      };

      const summary = formToSummary(minimalData);

      expect(summary.recommendedFocus.length).toBeGreaterThan(0);
    });
  });
});

describe("formatSummaryForDisplay", () => {
  const mockSummary: AssessmentSummary = {
    keyConcerns: ["Anxiety at school", "Difficulty sleeping"],
    childName: "Alex",
    recommendedFocus: ["Anxiety management", "Sleep regulation"],
    generatedAt: "2024-01-15T10:30:00.000Z",
    source: "form",
    metadata: {
      concernDuration: "3-6 months",
      concernSeverity: 4,
      dailyLifeImpact: {
        sleep: "Difficulty falling asleep",
        school: "Declining",
      },
      recentEvents: "Started new school",
      therapyGoals: "Help with anxiety",
    },
  };

  it("should include header", () => {
    const formatted = formatSummaryForDisplay(mockSummary);

    expect(formatted).toContain("Assessment Summary");
  });

  it("should include child name when present", () => {
    const formatted = formatSummaryForDisplay(mockSummary);

    expect(formatted).toContain("Alex");
  });

  it("should list key concerns", () => {
    const formatted = formatSummaryForDisplay(mockSummary);

    expect(formatted).toContain("Anxiety at school");
    expect(formatted).toContain("Difficulty sleeping");
  });

  it("should include context section with duration and severity", () => {
    const formatted = formatSummaryForDisplay(mockSummary);

    expect(formatted).toContain("3-6 months");
    expect(formatted).toContain("4/5");
  });

  it("should include daily life impact when present", () => {
    const formatted = formatSummaryForDisplay(mockSummary);

    expect(formatted).toContain("Difficulty falling asleep");
    expect(formatted).toContain("Declining");
  });

  it("should include recent events when present", () => {
    const formatted = formatSummaryForDisplay(mockSummary);

    expect(formatted).toContain("Started new school");
  });

  it("should include therapy goals", () => {
    const formatted = formatSummaryForDisplay(mockSummary);

    expect(formatted).toContain("Help with anxiety");
  });

  it("should list recommended focus areas", () => {
    const formatted = formatSummaryForDisplay(mockSummary);

    expect(formatted).toContain("Anxiety management");
    expect(formatted).toContain("Sleep regulation");
  });
});
