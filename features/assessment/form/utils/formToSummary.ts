/**
 * Form to Summary transformation utility
 *
 * Transforms form-based assessment data into the same summary structure
 * used by AI chat assessments per AC-3.4.8. Ensures parity between
 * both assessment methods.
 */

import {
  type FormAssessmentInput,
  CONCERN_DURATION_LABELS,
  SEVERITY_LABELS,
  SLEEP_PATTERN_LABELS,
  APPETITE_CHANGE_LABELS,
  SCHOOL_PERFORMANCE_LABELS,
  SOCIAL_RELATIONSHIP_LABELS,
} from "@/lib/validations/assessment";

/**
 * Assessment summary structure
 * Matches the AI chat summary format for downstream compatibility
 */
export interface AssessmentSummary {
  keyConcerns: string[];
  childName?: string;
  recommendedFocus: string[];
  generatedAt: string;
  source: "chat" | "form";
  metadata: {
    concernDuration: string;
    concernSeverity: number;
    dailyLifeImpact: {
      sleep?: string;
      appetite?: string;
      school?: string;
      social?: string;
    };
    recentEvents?: string;
    therapyGoals?: string;
  };
}

/**
 * Transforms form assessment data into summary structure
 *
 * Processing logic:
 * 1. Extracts key concerns from primaryConcerns text
 * 2. Maps severity and duration to human-readable labels
 * 3. Compiles daily life impact from Page 2 fields
 * 4. Generates recommended focus areas based on responses
 * 5. Includes therapy goals for therapist matching
 *
 * @param formData - Complete form assessment data
 * @param childName - Optional child name from demographics
 * @returns Structured assessment summary
 *
 * @example
 * const summary = formToSummary(formData, 'Alex');
 * // Returns { keyConcerns: [...], recommendedFocus: [...], ... }
 */
export function formToSummary(
  formData: FormAssessmentInput,
  childName?: string
): AssessmentSummary {
  const keyConcerns = extractKeyConcerns(formData.primaryConcerns);
  const recommendedFocus = generateRecommendedFocus(formData);

  return {
    keyConcerns,
    childName,
    recommendedFocus,
    generatedAt: new Date().toISOString(),
    source: "form",
    metadata: {
      concernDuration: CONCERN_DURATION_LABELS[formData.concernDuration],
      concernSeverity: formData.concernSeverity,
      dailyLifeImpact: {
        sleep: formData.sleepPatterns
          ? SLEEP_PATTERN_LABELS[formData.sleepPatterns]
          : undefined,
        appetite: formData.appetiteChanges
          ? APPETITE_CHANGE_LABELS[formData.appetiteChanges]
          : undefined,
        school: formData.schoolPerformance
          ? SCHOOL_PERFORMANCE_LABELS[formData.schoolPerformance]
          : undefined,
        social: formData.socialRelationships
          ? SOCIAL_RELATIONSHIP_LABELS[formData.socialRelationships]
          : undefined,
      },
      recentEvents: formData.recentEvents || undefined,
      therapyGoals: formData.therapyGoals,
    },
  };
}

/**
 * Extracts key concerns from primary concerns text
 *
 * Simple extraction:
 * - Splits on sentence boundaries
 * - Takes first 3 meaningful sentences
 * - Cleans up whitespace
 *
 * In production, this could use NLP for better extraction
 */
function extractKeyConcerns(primaryConcerns: string): string[] {
  // Split on sentence endings
  const sentences = primaryConcerns
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10); // Filter out very short fragments

  // Take up to 3 key concerns
  return sentences.slice(0, 3);
}

/**
 * Generates recommended focus areas based on form responses
 *
 * Logic:
 * - High severity (4-5) → recommend urgent support
 * - Sleep issues → recommend sleep hygiene
 * - School impact → recommend academic support
 * - Social issues → recommend social skills
 * - Therapy goals → extract focus from goals
 */
function generateRecommendedFocus(formData: FormAssessmentInput): string[] {
  const focus: string[] = [];

  // Extract focus from therapy goals FIRST (highest priority - user's explicit goals)
  if (formData.therapyGoals) {
    const goalKeywords = extractGoalFocus(formData.therapyGoals);
    focus.push(...goalKeywords);
  }

  // Severity-based recommendations
  if (formData.concernSeverity >= 4) {
    focus.push("Priority support needed - concerns rated as significant/severe");
  }

  // Duration-based recommendations
  if (formData.concernDuration === "6-plus-months") {
    focus.push("Long-standing concerns requiring comprehensive approach");
  }

  // Daily life impact recommendations
  if (
    formData.sleepPatterns &&
    formData.sleepPatterns !== "no-change"
  ) {
    focus.push("Sleep regulation and healthy sleep habits");
  }

  if (
    formData.appetiteChanges &&
    formData.appetiteChanges !== "no-change"
  ) {
    focus.push("Emotional eating patterns and nutrition awareness");
  }

  if (
    formData.schoolPerformance &&
    ["declining", "significantly-impacted", "not-attending"].includes(
      formData.schoolPerformance
    )
  ) {
    focus.push("Academic support and school engagement");
  }

  if (
    formData.socialRelationships &&
    ["withdrawing", "conflicts", "isolated"].includes(
      formData.socialRelationships
    )
  ) {
    focus.push("Social skills and peer relationship building");
  }

  // Ensure at least one focus area
  if (focus.length === 0) {
    focus.push("General mental health support and coping skills");
  }

  // Deduplicate and limit to 5 focus areas
  return [...new Set(focus)].slice(0, 5);
}

/**
 * Extracts focus areas from therapy goals text
 *
 * Simple keyword matching for common therapy focus areas
 */
function extractGoalFocus(goals: string): string[] {
  const focus: string[] = [];
  const lowerGoals = goals.toLowerCase();

  const focusKeywords: Record<string, string> = {
    anxiety: "Anxiety management and coping strategies",
    depress: "Mood improvement and emotional wellbeing",
    stress: "Stress management techniques",
    anger: "Anger management and emotional regulation",
    confidence: "Building self-esteem and confidence",
    friend: "Developing healthy friendships",
    school: "School-related support",
    family: "Family communication and relationships",
    bully: "Addressing bullying experiences",
    trauma: "Processing difficult experiences",
  };

  for (const [keyword, focusArea] of Object.entries(focusKeywords)) {
    if (lowerGoals.includes(keyword)) {
      focus.push(focusArea);
    }
  }

  return focus;
}

/**
 * Formats summary for display
 *
 * Creates a readable summary text from the structured data
 * for preview before submission.
 */
export function formatSummaryForDisplay(summary: AssessmentSummary): string {
  const lines: string[] = [];

  // Header
  lines.push("## Assessment Summary");
  if (summary.childName) {
    lines.push(`**Child:** ${summary.childName}`);
  }
  lines.push("");

  // Key concerns
  lines.push("### Key Concerns");
  summary.keyConcerns.forEach((concern, i) => {
    lines.push(`${i + 1}. ${concern}`);
  });
  lines.push("");

  // Context
  lines.push("### Context");
  lines.push(`- **Duration:** ${summary.metadata.concernDuration}`);
  lines.push(`- **Severity:** ${summary.metadata.concernSeverity}/5 (${SEVERITY_LABELS[summary.metadata.concernSeverity]})`);
  lines.push("");

  // Daily life impact
  const impact = summary.metadata.dailyLifeImpact;
  if (impact.sleep || impact.appetite || impact.school || impact.social) {
    lines.push("### Daily Life Impact");
    if (impact.sleep) lines.push(`- **Sleep:** ${impact.sleep}`);
    if (impact.appetite) lines.push(`- **Appetite:** ${impact.appetite}`);
    if (impact.school) lines.push(`- **School:** ${impact.school}`);
    if (impact.social) lines.push(`- **Social:** ${impact.social}`);
    lines.push("");
  }

  // Recent events
  if (summary.metadata.recentEvents) {
    lines.push("### Recent Events");
    lines.push(summary.metadata.recentEvents);
    lines.push("");
  }

  // Therapy goals
  if (summary.metadata.therapyGoals) {
    lines.push("### Therapy Goals");
    lines.push(summary.metadata.therapyGoals);
    lines.push("");
  }

  // Recommended focus
  lines.push("### Recommended Focus Areas");
  summary.recommendedFocus.forEach((area) => {
    lines.push(`- ${area}`);
  });

  return lines.join("\n");
}
