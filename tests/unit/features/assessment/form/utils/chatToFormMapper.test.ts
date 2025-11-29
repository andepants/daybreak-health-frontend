/**
 * Unit tests for chatToFormMapper utility
 *
 * Tests data extraction from chat conversation history
 * for mode switching from chat to form.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  chatToFormMapper,
  loadFormDataFromStorage,
  loadChatDataFromStorage,
  type ChatMessage,
  type ChatAssessmentData,
} from "@/features/assessment/form/utils/chatToFormMapper";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("chatToFormMapper", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
  });

  it("should return pre-extracted data when available", () => {
    const chatData: ChatAssessmentData = {
      extractedData: {
        primaryConcerns: "Pre-extracted concerns",
        concernSeverity: 4,
      },
    };

    const result = chatToFormMapper(chatData);

    expect(result.primaryConcerns).toBe("Pre-extracted concerns");
    expect(result.concernSeverity).toBe(4);
  });

  it("should return empty object when no data available", () => {
    const chatData: ChatAssessmentData = {};

    const result = chatToFormMapper(chatData);

    expect(Object.keys(result).length).toBe(0);
  });

  describe("primaryConcerns extraction", () => {
    it("should extract concerns from message with concern keywords", () => {
      const chatData: ChatAssessmentData = {
        conversationHistory: [
          {
            id: "1",
            role: "user",
            content: "I'm worried about my child's anxiety at school. They've been having trouble sleeping and don't want to go to class.",
          },
        ],
      };

      const result = chatToFormMapper(chatData);

      expect(result.primaryConcerns).toContain("worried");
    });

    it("should combine substantial messages when no clear concern message", () => {
      const chatData: ChatAssessmentData = {
        conversationHistory: [
          { id: "1", role: "user", content: "Hello" },
          { id: "2", role: "user", content: "This is a longer message about my child that provides some context about our situation and why we're here." },
        ],
      };

      const result = chatToFormMapper(chatData);

      expect(result.primaryConcerns).toBeDefined();
    });
  });

  describe("concernDuration extraction", () => {
    it("should extract less-than-1-month duration", () => {
      const chatData: ChatAssessmentData = {
        conversationHistory: [
          { id: "1", role: "user", content: "This just started a few weeks ago." },
        ],
      };

      const result = chatToFormMapper(chatData);

      expect(result.concernDuration).toBe("less-than-1-month");
    });

    it("should extract 1-3-months duration", () => {
      const chatData: ChatAssessmentData = {
        conversationHistory: [
          { id: "1", role: "user", content: "It's been going on for a few months now." },
        ],
      };

      const result = chatToFormMapper(chatData);

      expect(result.concernDuration).toBe("1-3-months");
    });

    it("should extract 6-plus-months duration", () => {
      const chatData: ChatAssessmentData = {
        conversationHistory: [
          { id: "1", role: "user", content: "This has been going on for about a year now." },
        ],
      };

      const result = chatToFormMapper(chatData);

      expect(result.concernDuration).toBe("6-plus-months");
    });
  });

  describe("severity extraction", () => {
    it("should extract explicit severity rating", () => {
      const chatData: ChatAssessmentData = {
        conversationHistory: [
          { id: "1", role: "user", content: "I'd rate it about 4 out of 5." },
        ],
      };

      const result = chatToFormMapper(chatData);

      expect(result.concernSeverity).toBe(4);
    });

    it("should infer severity from keywords", () => {
      const chatData: ChatAssessmentData = {
        conversationHistory: [
          { id: "1", role: "user", content: "The situation is severe and we need urgent help." },
        ],
      };

      const result = chatToFormMapper(chatData);

      expect(result.concernSeverity).toBe(5);
    });

    it("should infer moderate severity from worried keyword", () => {
      const chatData: ChatAssessmentData = {
        conversationHistory: [
          { id: "1", role: "user", content: "I'm worried about what's happening." },
        ],
      };

      const result = chatToFormMapper(chatData);

      expect(result.concernSeverity).toBe(3);
    });
  });

  describe("sleep patterns extraction", () => {
    it("should extract difficulty-falling-asleep", () => {
      const chatData: ChatAssessmentData = {
        conversationHistory: [
          { id: "1", role: "user", content: "She has trouble falling asleep every night." },
        ],
      };

      const result = chatToFormMapper(chatData);

      expect(result.sleepPatterns).toBe("difficulty-falling-asleep");
    });

    it("should extract waking-frequently", () => {
      const chatData: ChatAssessmentData = {
        conversationHistory: [
          { id: "1", role: "user", content: "He keeps waking up during the night with nightmares." },
        ],
      };

      const result = chatToFormMapper(chatData);

      expect(result.sleepPatterns).toBe("waking-frequently");
    });
  });

  describe("school performance extraction", () => {
    it("should extract declining performance", () => {
      const chatData: ChatAssessmentData = {
        conversationHistory: [
          { id: "1", role: "user", content: "Her grades have been dropping lately." },
        ],
      };

      const result = chatToFormMapper(chatData);

      expect(result.schoolPerformance).toBe("declining");
    });

    it("should extract not-attending", () => {
      const chatData: ChatAssessmentData = {
        conversationHistory: [
          { id: "1", role: "user", content: "He's been refusing to go to school." },
        ],
      };

      const result = chatToFormMapper(chatData);

      expect(result.schoolPerformance).toBe("not-attending");
    });
  });

  describe("social relationships extraction", () => {
    it("should extract isolated state", () => {
      const chatData: ChatAssessmentData = {
        conversationHistory: [
          { id: "1", role: "user", content: "She has no friends and stays alone in her room." },
        ],
      };

      const result = chatToFormMapper(chatData);

      expect(result.socialRelationships).toBe("isolated");
    });

    it("should extract withdrawing state", () => {
      const chatData: ChatAssessmentData = {
        conversationHistory: [
          { id: "1", role: "user", content: "He's been pulling away from his friends lately." },
        ],
      };

      const result = chatToFormMapper(chatData);

      expect(result.socialRelationships).toBe("withdrawing");
    });
  });

  describe("recent events extraction", () => {
    it("should extract messages mentioning life events", () => {
      const chatData: ChatAssessmentData = {
        conversationHistory: [
          { id: "1", role: "user", content: "We recently went through a divorce and it's been hard on everyone." },
        ],
      };

      const result = chatToFormMapper(chatData);

      expect(result.recentEvents).toContain("divorce");
    });
  });

  describe("therapy goals extraction", () => {
    it("should extract explicit goal statements", () => {
      const chatData: ChatAssessmentData = {
        conversationHistory: [
          { id: "1", role: "user", content: "I hope therapy can help him manage his anxiety better." },
        ],
      };

      const result = chatToFormMapper(chatData);

      expect(result.therapyGoals).toContain("hope");
    });

    it("should fall back to summary focus areas", () => {
      const chatData: ChatAssessmentData = {
        conversationHistory: [],
        summary: {
          recommendedFocus: ["Anxiety management", "Social skills"],
        },
      };

      const result = chatToFormMapper(chatData);

      expect(result.therapyGoals).toContain("Anxiety management");
    });
  });
});

describe("loadFormDataFromStorage", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
  });

  it("should load stored form data", () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({
        data: { primaryConcerns: "Test concerns" },
        currentPage: 2,
      })
    );

    const result = loadFormDataFromStorage("test-session");

    expect(result.primaryConcerns).toBe("Test concerns");
    expect(result.currentPage).toBe(2);
  });

  it("should return empty object when no data stored", () => {
    localStorageMock.getItem.mockReturnValue(null);

    const result = loadFormDataFromStorage("test-session");

    expect(Object.keys(result).length).toBe(0);
  });

  it("should handle corrupted storage data gracefully", () => {
    localStorageMock.getItem.mockReturnValue("invalid json");

    const result = loadFormDataFromStorage("test-session");

    expect(Object.keys(result).length).toBe(0);
  });
});

describe("loadChatDataFromStorage", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
  });

  it("should load stored chat data", () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({
        data: {
          messages: [{ id: "1", role: "user", content: "Test" }],
          extractedData: { concernSeverity: 3 },
          assessment: { keyConcerns: ["Anxiety"] },
        },
      })
    );

    const result = loadChatDataFromStorage("test-session");

    expect(result.conversationHistory).toHaveLength(1);
    expect(result.extractedData?.concernSeverity).toBe(3);
    expect(result.summary?.keyConcerns).toContain("Anxiety");
  });

  it("should return empty object when no data stored", () => {
    localStorageMock.getItem.mockReturnValue(null);

    const result = loadChatDataFromStorage("test-session");

    expect(result.conversationHistory).toBeUndefined();
  });

  it("should handle corrupted storage data gracefully", () => {
    localStorageMock.getItem.mockReturnValue("invalid json");

    const result = loadChatDataFromStorage("test-session");

    expect(result.conversationHistory).toBeUndefined();
  });
});
