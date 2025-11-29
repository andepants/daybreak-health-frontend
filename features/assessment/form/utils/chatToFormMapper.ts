/**
 * Chat to Form data mapper utility
 *
 * Maps AI chat conversation history to form field values for
 * mode switching per AC-3.4.9. Extracts structured data from
 * chat messages to pre-populate form fields.
 */

import type { FormAssessmentInput } from "@/lib/validations/assessment";

/**
 * Chat message structure from AI assessment
 */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  metadata?: {
    questionType?: string;
    extractedData?: Record<string, unknown>;
  };
}

/**
 * Chat assessment data that may be stored
 */
export interface ChatAssessmentData {
  conversationHistory?: ChatMessage[];
  extractedData?: Partial<FormAssessmentInput>;
  summary?: {
    keyConcerns?: string[];
    childName?: string;
    recommendedFocus?: string[];
  };
}

/**
 * Maps chat conversation history to form field values
 *
 * Extraction strategy:
 * 1. Check for pre-extracted data in message metadata
 * 2. Parse user responses for structured answers
 * 3. Use keyword matching for unstructured responses
 * 4. Return partial form data (only fields that can be extracted)
 *
 * @param chatData - Chat assessment data including conversation history
 * @returns Partial form assessment data for pre-population
 *
 * @example
 * const chatData = {
 *   conversationHistory: [...],
 *   extractedData: { primaryConcerns: '...' }
 * };
 * const formData = chatToFormMapper(chatData);
 * // Returns { primaryConcerns: '...', concernSeverity: 3, ... }
 */
export function chatToFormMapper(
  chatData: ChatAssessmentData
): Partial<FormAssessmentInput> {
  const formData: Partial<FormAssessmentInput> = {};

  // First, use any pre-extracted data
  if (chatData.extractedData) {
    Object.assign(formData, chatData.extractedData);
  }

  // If no conversation history, still try to extract from summary
  if (!chatData.conversationHistory?.length) {
    // Try to construct therapy goals from summary's recommended focus
    if (!formData.therapyGoals && chatData.summary?.recommendedFocus?.length) {
      formData.therapyGoals = `Focus areas identified: ${chatData.summary.recommendedFocus.join(", ")}`;
    }
    return formData;
  }

  // Extract from conversation history
  const userMessages = chatData.conversationHistory.filter(
    (m) => m.role === "user"
  );

  // Try to extract primary concerns from early user messages
  if (!formData.primaryConcerns && userMessages.length > 0) {
    formData.primaryConcerns = extractPrimaryConcerns(userMessages);
  }

  // Extract concern duration from messages
  if (!formData.concernDuration) {
    formData.concernDuration = extractConcernDuration(userMessages);
  }

  // Extract severity from messages
  if (!formData.concernSeverity) {
    formData.concernSeverity = extractSeverity(userMessages);
  }

  // Extract daily life impacts
  if (!formData.sleepPatterns) {
    formData.sleepPatterns = extractSleepPatterns(userMessages);
  }

  if (!formData.appetiteChanges) {
    formData.appetiteChanges = extractAppetiteChanges(userMessages);
  }

  if (!formData.schoolPerformance) {
    formData.schoolPerformance = extractSchoolPerformance(userMessages);
  }

  if (!formData.socialRelationships) {
    formData.socialRelationships = extractSocialRelationships(userMessages);
  }

  // Extract recent events and therapy goals from longer responses
  if (!formData.recentEvents) {
    formData.recentEvents = extractRecentEvents(userMessages);
  }

  if (!formData.therapyGoals) {
    formData.therapyGoals = extractTherapyGoals(userMessages, chatData.summary);
  }

  return formData;
}

/**
 * Extracts primary concerns from user messages
 * Takes the first substantial user message about concerns
 */
function extractPrimaryConcerns(messages: ChatMessage[]): string | undefined {
  // Look for messages that seem to describe concerns
  for (const msg of messages) {
    const content = msg.content.trim();

    // Skip very short messages (likely single-word responses)
    if (content.length < 20) continue;

    // Check for concern-related keywords
    const concernKeywords = [
      "worried",
      "concern",
      "notice",
      "problem",
      "issue",
      "struggling",
      "difficult",
      "behavior",
      "mood",
      "anxiety",
      "depress",
      "sad",
      "angry",
      "stress",
    ];

    const lowerContent = content.toLowerCase();
    if (concernKeywords.some((kw) => lowerContent.includes(kw))) {
      return content;
    }
  }

  // Fallback: combine first few substantial messages
  const substantial = messages
    .filter((m) => m.content.length > 30)
    .slice(0, 2)
    .map((m) => m.content)
    .join("\n\n");

  return substantial || undefined;
}

/**
 * Extracts concern duration from messages
 * Looks for time-related phrases
 */
function extractConcernDuration(
  messages: ChatMessage[]
): FormAssessmentInput["concernDuration"] | undefined {
  const allContent = messages.map((m) => m.content.toLowerCase()).join(" ");

  // Check for explicit duration mentions
  if (
    allContent.includes("few weeks") ||
    allContent.includes("couple weeks") ||
    allContent.includes("this month") ||
    allContent.includes("recently") ||
    allContent.includes("just started")
  ) {
    return "less-than-1-month";
  }

  if (
    allContent.includes("few months") ||
    allContent.includes("couple months") ||
    allContent.includes("month or two") ||
    allContent.includes("1-3 months") ||
    allContent.includes("since") && allContent.includes("started school")
  ) {
    return "1-3-months";
  }

  if (
    allContent.includes("several months") ||
    allContent.includes("half year") ||
    allContent.includes("3-6 months") ||
    allContent.includes("past few months")
  ) {
    return "3-6-months";
  }

  if (
    allContent.includes("long time") ||
    allContent.includes("years") ||
    allContent.includes("year") ||
    allContent.includes("always") ||
    allContent.includes("6 months") ||
    allContent.includes("6+ months")
  ) {
    return "6-plus-months";
  }

  return undefined;
}

/**
 * Extracts severity from messages
 * Looks for severity indicators
 */
function extractSeverity(messages: ChatMessage[]): number | undefined {
  const allContent = messages.map((m) => m.content.toLowerCase()).join(" ");

  // Look for explicit severity mentions
  if (allContent.match(/\b[1-5]\s*(out of|\/)\s*5/)) {
    const match = allContent.match(/\b([1-5])\s*(out of|\/)\s*5/);
    if (match) return parseInt(match[1], 10);
  }

  // Look for severity keywords
  if (
    allContent.includes("severe") ||
    allContent.includes("extreme") ||
    allContent.includes("crisis") ||
    allContent.includes("emergency")
  ) {
    return 5;
  }

  if (
    allContent.includes("significant") ||
    allContent.includes("serious") ||
    allContent.includes("very worried")
  ) {
    return 4;
  }

  if (
    allContent.includes("moderate") ||
    allContent.includes("concerning") ||
    allContent.includes("worried")
  ) {
    return 3;
  }

  if (
    allContent.includes("mild") ||
    allContent.includes("slight") ||
    allContent.includes("little")
  ) {
    return 2;
  }

  if (
    allContent.includes("minimal") ||
    allContent.includes("not too bad") ||
    allContent.includes("just checking")
  ) {
    return 1;
  }

  return undefined;
}

/**
 * Extracts sleep pattern from messages
 */
function extractSleepPatterns(
  messages: ChatMessage[]
): FormAssessmentInput["sleepPatterns"] | undefined {
  const allContent = messages.map((m) => m.content.toLowerCase()).join(" ");

  if (
    allContent.includes("trouble falling asleep") ||
    allContent.includes("can't fall asleep") ||
    allContent.includes("takes forever to sleep")
  ) {
    return "difficulty-falling-asleep";
  }

  if (
    allContent.includes("wakes up") ||
    allContent.includes("waking up") ||
    allContent.includes("nightmares") ||
    allContent.includes("restless")
  ) {
    return "waking-frequently";
  }

  if (
    allContent.includes("sleeps too much") ||
    allContent.includes("always tired") ||
    allContent.includes("oversleeping")
  ) {
    return "sleeping-too-much";
  }

  if (
    allContent.includes("irregular") ||
    allContent.includes("inconsistent") ||
    allContent.includes("all over the place")
  ) {
    return "irregular-schedule";
  }

  if (
    allContent.includes("sleep is fine") ||
    allContent.includes("sleeps well") ||
    allContent.includes("no sleep issues")
  ) {
    return "no-change";
  }

  return undefined;
}

/**
 * Extracts appetite changes from messages
 */
function extractAppetiteChanges(
  messages: ChatMessage[]
): FormAssessmentInput["appetiteChanges"] | undefined {
  const allContent = messages.map((m) => m.content.toLowerCase()).join(" ");

  if (
    allContent.includes("not eating") ||
    allContent.includes("lost appetite") ||
    allContent.includes("doesn't eat") ||
    allContent.includes("skipping meals")
  ) {
    return "decreased";
  }

  if (
    allContent.includes("eating more") ||
    allContent.includes("always hungry") ||
    allContent.includes("overeating")
  ) {
    return "increased";
  }

  if (
    allContent.includes("eating habits") ||
    allContent.includes("irregular eating") ||
    allContent.includes("picky")
  ) {
    return "irregular";
  }

  if (
    allContent.includes("eating fine") ||
    allContent.includes("appetite is normal") ||
    allContent.includes("no food issues")
  ) {
    return "no-change";
  }

  return undefined;
}

/**
 * Extracts school performance from messages
 */
function extractSchoolPerformance(
  messages: ChatMessage[]
): FormAssessmentInput["schoolPerformance"] | undefined {
  const allContent = messages.map((m) => m.content.toLowerCase()).join(" ");

  if (
    allContent.includes("not going to school") ||
    allContent.includes("refusing") && allContent.includes("school") ||
    allContent.includes("school avoidance") ||
    allContent.includes("won't go to school")
  ) {
    return "not-attending";
  }

  if (
    allContent.includes("failing") ||
    allContent.includes("can't focus") ||
    allContent.includes("falling behind") ||
    allContent.includes("dropped significantly")
  ) {
    return "significantly-impacted";
  }

  if (
    (allContent.includes("grades") && allContent.includes("dropping")) ||
    allContent.includes("declining") ||
    allContent.includes("worse at school")
  ) {
    return "declining";
  }

  if (
    allContent.includes("doing better") ||
    allContent.includes("improved") ||
    allContent.includes("grades up")
  ) {
    return "improved";
  }

  if (
    allContent.includes("school is fine") ||
    allContent.includes("no school issues") ||
    allContent.includes("grades are ok")
  ) {
    return "no-change";
  }

  return undefined;
}

/**
 * Extracts social relationships from messages
 */
function extractSocialRelationships(
  messages: ChatMessage[]
): FormAssessmentInput["socialRelationships"] | undefined {
  const allContent = messages.map((m) => m.content.toLowerCase()).join(" ");

  if (
    allContent.includes("no friends") ||
    allContent.includes("alone") ||
    allContent.includes("isolated") ||
    allContent.includes("won't leave room")
  ) {
    return "isolated";
  }

  if (
    allContent.includes("fighting") ||
    allContent.includes("conflicts") ||
    allContent.includes("arguing") ||
    allContent.includes("bullying")
  ) {
    return "conflicts";
  }

  if (
    allContent.includes("withdrawing") ||
    allContent.includes("pulling away") ||
    allContent.includes("less social") ||
    allContent.includes("stopped seeing friends")
  ) {
    return "withdrawing";
  }

  if (
    allContent.includes("more social") ||
    allContent.includes("making friends") ||
    allContent.includes("better relationships")
  ) {
    return "improved";
  }

  if (
    allContent.includes("friends are fine") ||
    allContent.includes("social is ok") ||
    allContent.includes("no issues with friends")
  ) {
    return "no-change";
  }

  return undefined;
}

/**
 * Extracts recent events from messages
 */
function extractRecentEvents(messages: ChatMessage[]): string | undefined {
  const eventKeywords = [
    "divorce",
    "moved",
    "death",
    "lost",
    "passed away",
    "new school",
    "new baby",
    "sick",
    "hospital",
    "accident",
    "separation",
    "covid",
    "pandemic",
  ];

  for (const msg of messages) {
    const lowerContent = msg.content.toLowerCase();
    if (eventKeywords.some((kw) => lowerContent.includes(kw))) {
      return msg.content;
    }
  }

  return undefined;
}

/**
 * Extracts therapy goals from messages or summary
 */
function extractTherapyGoals(
  messages: ChatMessage[],
  summary?: ChatAssessmentData["summary"]
): string | undefined {
  // Check for explicit goal mentions in messages
  const goalKeywords = [
    "hope",
    "want",
    "wish",
    "goal",
    "help with",
    "looking for",
    "need support",
    "want to",
    "would like",
  ];

  for (const msg of messages) {
    const lowerContent = msg.content.toLowerCase();
    if (goalKeywords.some((kw) => lowerContent.includes(kw))) {
      // Check if this seems like a goal statement
      if (
        lowerContent.includes("therapy") ||
        lowerContent.includes("help") ||
        lowerContent.includes("support") ||
        lowerContent.includes("better") ||
        lowerContent.includes("improve")
      ) {
        return msg.content;
      }
    }
  }

  // Try to construct from summary's recommended focus
  if (summary?.recommendedFocus?.length) {
    return `Focus areas identified: ${summary.recommendedFocus.join(", ")}`;
  }

  return undefined;
}

/**
 * Loads existing form assessment data from storage
 *
 * @param sessionId - Session ID to load data for
 * @returns Stored form data or empty object
 */
export function loadFormDataFromStorage(
  sessionId: string
): Partial<FormAssessmentInput> & { currentPage?: number } {
  try {
    const stored = localStorage.getItem(`form_assessment_${sessionId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed.data,
        currentPage: parsed.currentPage,
      };
    }
  } catch (e) {
    console.warn("Failed to load form data from storage:", e);
  }
  return {};
}

/**
 * Loads chat assessment data from storage for mode switching
 *
 * @param sessionId - Session ID to load data for
 * @returns Chat assessment data or empty object
 */
export function loadChatDataFromStorage(sessionId: string): ChatAssessmentData {
  try {
    const stored = localStorage.getItem(`onboarding_session_${sessionId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        conversationHistory: parsed.data?.messages || [],
        extractedData: parsed.data?.extractedData,
        summary: parsed.data?.assessment,
      };
    }
  } catch (e) {
    console.warn("Failed to load chat data from storage:", e);
  }
  return {};
}
