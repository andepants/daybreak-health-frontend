/**
 * Unit tests for useFormNavigation hook
 *
 * Tests multi-page form navigation including page transitions,
 * completion tracking, and navigation guards.
 */

import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFormNavigation } from "@/features/assessment/form/hooks/useFormNavigation";

describe("useFormNavigation", () => {
  it("should initialize with default values", () => {
    const { result } = renderHook(() => useFormNavigation());

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.completedPages.size).toBe(0);
    expect(result.current.isFirstPage).toBe(true);
    expect(result.current.isLastPage).toBe(false);
    expect(result.current.canGoBack).toBe(false);
    expect(result.current.canGoForward).toBe(false);
  });

  it("should initialize with custom values", () => {
    const { result } = renderHook(() =>
      useFormNavigation({ totalPages: 5, initialPage: 2 })
    );

    expect(result.current.currentPage).toBe(2);
    expect(result.current.totalPages).toBe(5);
    expect(result.current.isFirstPage).toBe(false);
    expect(result.current.isLastPage).toBe(false);
    expect(result.current.canGoBack).toBe(true);
  });

  describe("goNext", () => {
    it("should advance to next page", () => {
      const { result } = renderHook(() => useFormNavigation());

      act(() => {
        result.current.goNext();
      });

      expect(result.current.currentPage).toBe(2);
      expect(result.current.isFirstPage).toBe(false);
    });

    it("should not exceed total pages", () => {
      const { result } = renderHook(() =>
        useFormNavigation({ totalPages: 3, initialPage: 3 })
      );

      act(() => {
        result.current.goNext();
      });

      expect(result.current.currentPage).toBe(3);
    });

    it("should call onPageChange callback", () => {
      const onPageChange = vi.fn();
      const { result } = renderHook(() =>
        useFormNavigation({ onPageChange })
      );

      act(() => {
        result.current.goNext();
      });

      expect(onPageChange).toHaveBeenCalledWith(2);
    });
  });

  describe("goBack", () => {
    it("should go to previous page", () => {
      const { result } = renderHook(() =>
        useFormNavigation({ initialPage: 2 })
      );

      act(() => {
        result.current.goBack();
      });

      expect(result.current.currentPage).toBe(1);
    });

    it("should not go below page 1", () => {
      const { result } = renderHook(() => useFormNavigation());

      act(() => {
        result.current.goBack();
      });

      expect(result.current.currentPage).toBe(1);
    });

    it("should call onPageChange callback", () => {
      const onPageChange = vi.fn();
      const { result } = renderHook(() =>
        useFormNavigation({ initialPage: 2, onPageChange })
      );

      act(() => {
        result.current.goBack();
      });

      expect(onPageChange).toHaveBeenCalledWith(1);
    });
  });

  describe("goToPage", () => {
    it("should navigate to completed pages", () => {
      const { result } = renderHook(() => useFormNavigation());

      // Mark pages 1 and 2 as complete
      act(() => {
        result.current.markPageComplete(1);
        result.current.markPageComplete(2);
      });

      // Navigate to page 3 (next after completed)
      act(() => {
        result.current.goToPage(3);
      });

      expect(result.current.currentPage).toBe(3);
    });

    it("should not navigate to pages beyond accessible range", () => {
      const { result } = renderHook(() => useFormNavigation());

      // Only page 1 is accessible (nothing completed)
      act(() => {
        result.current.goToPage(3);
      });

      expect(result.current.currentPage).toBe(1);
    });

    it("should allow navigation back to completed pages", () => {
      const { result } = renderHook(() =>
        useFormNavigation({ initialPage: 3 })
      );

      // Mark pages 1 and 2 as complete
      act(() => {
        result.current.markPageComplete(1);
        result.current.markPageComplete(2);
      });

      // Navigate back to page 1
      act(() => {
        result.current.goToPage(1);
      });

      expect(result.current.currentPage).toBe(1);
    });

    it("should not navigate to invalid page numbers", () => {
      const { result } = renderHook(() => useFormNavigation());

      act(() => {
        result.current.goToPage(0);
      });
      expect(result.current.currentPage).toBe(1);

      act(() => {
        result.current.goToPage(4);
      });
      expect(result.current.currentPage).toBe(1);
    });
  });

  describe("markPageComplete", () => {
    it("should add page to completed set", () => {
      const { result } = renderHook(() => useFormNavigation());

      act(() => {
        result.current.markPageComplete(1);
      });

      expect(result.current.completedPages.has(1)).toBe(true);
      expect(result.current.isPageComplete(1)).toBe(true);
    });

    it("should enable canGoForward when current page is complete", () => {
      const { result } = renderHook(() => useFormNavigation());

      expect(result.current.canGoForward).toBe(false);

      act(() => {
        result.current.markPageComplete(1);
      });

      expect(result.current.canGoForward).toBe(true);
    });
  });

  describe("markPageIncomplete", () => {
    it("should remove page from completed set", () => {
      const { result } = renderHook(() => useFormNavigation());

      act(() => {
        result.current.markPageComplete(1);
      });
      expect(result.current.isPageComplete(1)).toBe(true);

      act(() => {
        result.current.markPageIncomplete(1);
      });
      expect(result.current.isPageComplete(1)).toBe(false);
    });
  });

  describe("computed states", () => {
    it("should correctly identify first page", () => {
      const { result } = renderHook(() => useFormNavigation());
      expect(result.current.isFirstPage).toBe(true);

      act(() => {
        result.current.goNext();
      });
      expect(result.current.isFirstPage).toBe(false);
    });

    it("should correctly identify last page", () => {
      // Start at page 3 (last page)
      const { result } = renderHook(() =>
        useFormNavigation({ totalPages: 3, initialPage: 3 })
      );
      expect(result.current.isLastPage).toBe(true);

      // Go back using goBack and verify no longer last page
      act(() => {
        result.current.goBack();
      });
      expect(result.current.currentPage).toBe(2);
      expect(result.current.isLastPage).toBe(false);
    });

    it("should correctly compute canGoBack", () => {
      const { result } = renderHook(() => useFormNavigation());

      expect(result.current.canGoBack).toBe(false);

      act(() => {
        result.current.goNext();
      });
      expect(result.current.canGoBack).toBe(true);

      act(() => {
        result.current.goBack();
      });
      expect(result.current.canGoBack).toBe(false);
    });
  });
});
