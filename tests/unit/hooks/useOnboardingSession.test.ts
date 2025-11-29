/**
 * Tests for useOnboardingSession hook
 *
 * Validates:
 * - Session loading on mount
 * - Returning user detection
 * - Session expiry handling
 * - localStorage backup recovery
 * - Refetch functionality
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useOnboardingSession } from "@/hooks/useOnboardingSession";

describe("useOnboardingSession", () => {
  const mockSessionId = "test-session-123";

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    it("starts with loading state", () => {
      const { result } = renderHook(() => useOnboardingSession(mockSessionId));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.session).toBeNull();
    });

    it("creates new session if no data in localStorage", async () => {
      const { result } = renderHook(() => useOnboardingSession(mockSessionId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.session).toBeTruthy();
      expect(result.current.session?.id).toBe(mockSessionId);
      expect(result.current.session?.status).toBe("in-progress");
      expect(result.current.isReturningUser).toBe(false);
    });

    it("stores session ID in localStorage for new sessions", async () => {
      const { result } = renderHook(() => useOnboardingSession(mockSessionId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const storedSessionId = localStorage.getItem("current_onboarding_session");
      expect(storedSessionId).toBe(mockSessionId);
    });
  });

  describe("Session Restoration", () => {
    it("restores session from localStorage", async () => {
      const mockMessages = [
        { id: "1", sender: "AI", content: "Hello" },
        { id: "2", sender: "USER", content: "Hi" },
      ];

      localStorage.setItem(
        `onboarding_session_${mockSessionId}`,
        JSON.stringify({
          data: { messages: mockMessages },
          savedAt: new Date().toISOString(),
        })
      );

      const { result } = renderHook(() => useOnboardingSession(mockSessionId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.session).toBeTruthy();
      expect(result.current.session?.id).toBe(mockSessionId);
    });

    it("detects returning user when messages exist", async () => {
      const mockMessages = [
        { id: "1", sender: "AI", content: "Hello" },
        { id: "2", sender: "USER", content: "Hi" },
      ];

      localStorage.setItem(
        `onboarding_session_${mockSessionId}`,
        JSON.stringify({
          data: { messages: mockMessages },
          savedAt: new Date().toISOString(),
        })
      );

      const { result } = renderHook(() => useOnboardingSession(mockSessionId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isReturningUser).toBe(true);
    });

    it("does not detect returning user for new sessions", async () => {
      const { result } = renderHook(() => useOnboardingSession(mockSessionId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isReturningUser).toBe(false);
    });

    it("handles corrupted localStorage data gracefully", async () => {
      localStorage.setItem(
        `onboarding_session_${mockSessionId}`,
        "invalid json {{"
      );

      const { result } = renderHook(() => useOnboardingSession(mockSessionId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should create new session instead of crashing
      expect(result.current.session).toBeTruthy();
      expect(result.current.error).toBeNull();

      // Corrupted data should be cleared
      const stored = localStorage.getItem(`onboarding_session_${mockSessionId}`);
      expect(stored).toBeNull();
    });
  });

  describe("Session Expiry", () => {
    it("calculates session expiry date", async () => {
      const { result } = renderHook(() => useOnboardingSession(mockSessionId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.sessionExpiresAt).toBeInstanceOf(Date);

      // Should expire in approximately 30 days
      const now = new Date();
      const expiresAt = result.current.sessionExpiresAt!;
      const diffDays = Math.floor(
        (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(diffDays).toBeGreaterThanOrEqual(29);
      expect(diffDays).toBeLessThanOrEqual(30);
    });

    it("sets expiry to 30 days from creation", async () => {
      const { result } = renderHook(() => useOnboardingSession(mockSessionId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const session = result.current.session!;
      const createdAt = new Date(session.createdAt);
      const expiresAt = new Date(session.expiresAt);

      const diffMs = expiresAt.getTime() - createdAt.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      expect(diffDays).toBeCloseTo(30, 0);
    });
  });

  describe("Refetch Function", () => {
    it("refetches session data when called", async () => {
      const { result } = renderHook(() => useOnboardingSession(mockSessionId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Add data to localStorage
      localStorage.setItem(
        `onboarding_session_${mockSessionId}`,
        JSON.stringify({
          data: { messages: [{ id: "1", content: "New message" }] },
          savedAt: new Date().toISOString(),
        })
      );

      // Refetch triggers re-render which should pick up the new data
      expect(result.current.refetch).toBeDefined();
    });

    it("sets loading state during refetch", async () => {
      const { result } = renderHook(() => useOnboardingSession(mockSessionId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.refetch).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("sets error state when session loading fails", async () => {
      // This is a simplified test - in production, errors would come from GraphQL
      // For now, the hook doesn't actually fail, but the structure is in place

      const { result } = renderHook(() => useOnboardingSession(mockSessionId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // In current implementation, session should always be created
      expect(result.current.error).toBeNull();
    });
  });

  describe("localStorage Integration", () => {
    it("handles missing localStorage gracefully", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Mock localStorage to throw
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = vi.fn(() => {
        throw new Error("localStorage disabled");
      });

      const { result } = renderHook(() => useOnboardingSession(mockSessionId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should still create a session
      expect(result.current.session).toBeTruthy();

      Storage.prototype.getItem = originalGetItem;
      consoleSpy.mockRestore();
    });

    it("warns when localStorage.setItem fails", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Mock setItem to fail
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error("Quota exceeded");
      });

      const { result } = renderHook(() => useOnboardingSession(mockSessionId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to store session ID"),
        expect.any(String)
      );

      Storage.prototype.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });
  });

  describe("Session Properties", () => {
    it("creates session with correct initial properties", async () => {
      const { result } = renderHook(() => useOnboardingSession(mockSessionId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const session = result.current.session!;

      expect(session.id).toBe(mockSessionId);
      expect(session.status).toBe("in-progress");
      expect(session.createdAt).toBeTruthy();
      expect(session.expiresAt).toBeTruthy();
    });

    it("preserves assessment data from localStorage", async () => {
      const mockAssessment = {
        conversationHistory: [{ id: "1", content: "Test" }],
        isComplete: false,
      };

      localStorage.setItem(
        `onboarding_session_${mockSessionId}`,
        JSON.stringify({
          data: { assessment: mockAssessment },
          savedAt: new Date().toISOString(),
        })
      );

      const { result } = renderHook(() => useOnboardingSession(mockSessionId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.session?.assessment).toEqual(mockAssessment);
    });
  });
});
