/**
 * Unit tests for useFormAutoSave hook
 *
 * Tests auto-save functionality including initialization and basic behavior.
 * Note: Complex async timing tests are better suited for integration tests.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFormAutoSave } from "@/features/assessment/form/hooks/useFormAutoSave";

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

describe("useFormAutoSave", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  it("should initialize with idle status", () => {
    const { result } = renderHook(() =>
      useFormAutoSave({ sessionId: "test-session" })
    );

    expect(result.current.saveStatus).toBe("idle");
    expect(result.current.lastSaved).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should expose saveField function", () => {
    const { result } = renderHook(() =>
      useFormAutoSave({ sessionId: "test-session" })
    );

    expect(typeof result.current.saveField).toBe("function");
  });

  it("should expose saveAll function", () => {
    const { result } = renderHook(() =>
      useFormAutoSave({ sessionId: "test-session" })
    );

    expect(typeof result.current.saveAll).toBe("function");
  });

  it("should expose retry function", () => {
    const { result } = renderHook(() =>
      useFormAutoSave({ sessionId: "test-session" })
    );

    expect(typeof result.current.retry).toBe("function");
  });

  it("should accept custom debounce delay", () => {
    const { result } = renderHook(() =>
      useFormAutoSave({ sessionId: "test-session", debounceMs: 1000 })
    );

    // Hook should initialize correctly with custom debounce
    expect(result.current.saveStatus).toBe("idle");
  });

  it("should accept onSaveSuccess callback", () => {
    const onSaveSuccess = vi.fn();
    const { result } = renderHook(() =>
      useFormAutoSave({ sessionId: "test-session", onSaveSuccess })
    );

    // Hook should initialize correctly with callback
    expect(result.current.saveStatus).toBe("idle");
  });

  it("should accept onSaveError callback", () => {
    const onSaveError = vi.fn();
    const { result } = renderHook(() =>
      useFormAutoSave({ sessionId: "test-session", onSaveError })
    );

    // Hook should initialize correctly with callback
    expect(result.current.saveStatus).toBe("idle");
  });
});
