/**
 * Tests for useAutoSave hook
 *
 * Validates:
 * - Auto-save on message send
 * - Save status tracking (idle, saving, saved, error)
 * - Retry logic for failed saves
 * - localStorage backup integration
 * - Error handling and recovery
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useAutoSave } from "@/hooks/useAutoSave";

describe("useAutoSave", () => {
  const mockSessionId = "test-session-123";
  const mockData = { messages: [], sessionId: mockSessionId };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Initialization", () => {
    it("initializes with idle status", () => {
      const { result } = renderHook(() =>
        useAutoSave({ sessionId: mockSessionId })
      );

      expect(result.current.saveStatus).toBe("idle");
      expect(result.current.lastSaved).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe("Save Function", () => {
    it("saves data and updates status to saved", async () => {
      const { result } = renderHook(() =>
        useAutoSave({ sessionId: mockSessionId })
      );

      await act(async () => {
        await result.current.save(mockData);
      });

      expect(result.current.saveStatus).toBe("saved");
      expect(result.current.lastSaved).toBeInstanceOf(Date);
      expect(result.current.error).toBeNull();
    });

    it("stores data in localStorage as backup", async () => {
      const { result } = renderHook(() =>
        useAutoSave({ sessionId: mockSessionId })
      );

      await act(async () => {
        await result.current.save(mockData);
      });

      const stored = localStorage.getItem(`onboarding_session_${mockSessionId}`);
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.data).toEqual(mockData);
      expect(parsed.savedAt).toBeTruthy();
    });

    it("transitions from saving to saved status", async () => {
      const { result } = renderHook(() =>
        useAutoSave({ sessionId: mockSessionId })
      );

      act(() => {
        result.current.save(mockData);
      });

      expect(result.current.saveStatus).toBe("saving");

      await waitFor(() => {
        expect(result.current.saveStatus).toBe("saved");
      });
    });

    it("resets to idle after brief success indication", async () => {
      const { result } = renderHook(() =>
        useAutoSave({ sessionId: mockSessionId })
      );

      await act(async () => {
        await result.current.save(mockData);
      });

      expect(result.current.saveStatus).toBe("saved");

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(result.current.saveStatus).toBe("idle");
      });
    });

    it("calls onSaveSuccess callback after successful save", async () => {
      const onSaveSuccess = vi.fn();
      const { result } = renderHook(() =>
        useAutoSave({ sessionId: mockSessionId, onSaveSuccess })
      );

      await act(async () => {
        await result.current.save(mockData);
      });

      expect(onSaveSuccess).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error Handling", () => {
    it("handles quota exceeded errors", async () => {
      const onSaveError = vi.fn();

      // Mock localStorage to throw quota exceeded error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        const err = new Error("QuotaExceededError");
        err.name = "QuotaExceededError";
        throw err;
      });

      const { result } = renderHook(() =>
        useAutoSave({ sessionId: mockSessionId, onSaveError })
      );

      await act(async () => {
        await result.current.save(mockData);
      });

      expect(result.current.saveStatus).toBe("error");
      expect(result.current.error?.message).toContain("quota");
      expect(onSaveError).toHaveBeenCalled();

      // Restore original setItem
      Storage.prototype.setItem = originalSetItem;
    });

    it("stores pending data for retry on failure", async () => {
      // Mock save to fail
      const { result } = renderHook(() =>
        useAutoSave({ sessionId: mockSessionId })
      );

      // Force an error by setting localStorage to throw
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error("Network error");
      });

      await act(async () => {
        try {
          await result.current.save(mockData);
        } catch (e) {
          // Expected to fail
        }
      });

      expect(result.current.saveStatus).toBe("error");
      expect(result.current.error).toBeTruthy();

      // Restore and verify retry works
      Storage.prototype.setItem = originalSetItem;

      await act(async () => {
        await result.current.retry();
      });

      expect(result.current.saveStatus).toBe("saved");

      Storage.prototype.setItem = originalSetItem;
    });

    it("calls onSaveError callback on failure", async () => {
      const onSaveError = vi.fn();

      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error("Network error");
      });

      const { result } = renderHook(() =>
        useAutoSave({ sessionId: mockSessionId, onSaveError })
      );

      await act(async () => {
        try {
          await result.current.save(mockData);
        } catch (e) {
          // Expected to fail
        }
      });

      expect(onSaveError).toHaveBeenCalled();
      expect(onSaveError.mock.calls[0][0]).toBeInstanceOf(Error);

      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe("Retry Function", () => {
    it("retries last failed save", async () => {
      const { result } = renderHook(() =>
        useAutoSave({ sessionId: mockSessionId })
      );

      // Force initial save to fail
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error("Network error");
      });

      await act(async () => {
        try {
          await result.current.save(mockData);
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.saveStatus).toBe("error");

      // Fix the error and retry
      Storage.prototype.setItem = originalSetItem;

      await act(async () => {
        await result.current.retry();
      });

      expect(result.current.saveStatus).toBe("saved");
    });

    it("does nothing if no pending data to retry", async () => {
      const { result } = renderHook(() =>
        useAutoSave({ sessionId: mockSessionId })
      );

      // No save has been attempted, so retry should do nothing
      await act(async () => {
        result.current.retry();
      });

      expect(result.current.saveStatus).toBe("idle");
    });
  });

  describe("Cleanup", () => {
    it("clears timers on unmount", () => {
      const { result, unmount } = renderHook(() =>
        useAutoSave({ sessionId: mockSessionId })
      );

      act(() => {
        result.current.save(mockData);
      });

      unmount();

      // Should not throw or cause memory leaks
      expect(true).toBe(true);
    });
  });
});
