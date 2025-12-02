/**
 * useFormNavigation hook for multi-page form navigation
 *
 * Manages page state, completion tracking, and navigation logic
 * for the 3-page assessment form per AC-3.4.7.
 */
"use client";

import * as React from "react";

/**
 * Options for useFormNavigation hook
 * @param totalPages - Total number of pages (default 3)
 * @param initialPage - Starting page number (default 1)
 * @param onPageChange - Callback when page changes
 */
export interface UseFormNavigationOptions {
  totalPages?: number;
  initialPage?: number;
  onPageChange?: (page: number) => void;
}

/**
 * Return type for useFormNavigation hook
 */
export interface UseFormNavigationReturn {
  currentPage: number;
  totalPages: number;
  completedPages: Set<number>;
  canGoBack: boolean;
  canGoForward: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
  goToPage: (page: number) => void;
  goNext: () => void;
  goBack: () => void;
  markPageComplete: (page: number) => void;
  markPageIncomplete: (page: number) => void;
  isPageComplete: (page: number) => boolean;
}

/**
 * Hook for managing multi-page form navigation
 *
 * Features:
 * - Page state management
 * - Completion tracking for visited pages
 * - Navigation guards (can't skip ahead without completing)
 * - Back navigation to any completed page
 * - Page change callbacks for URL/state sync
 *
 * @param options - Configuration options
 * @returns Navigation state and controls
 *
 * @example
 * const {
 *   currentPage,
 *   completedPages,
 *   goNext,
 *   goBack,
 *   markPageComplete,
 * } = useFormNavigation({
 *   totalPages: 3,
 *   onPageChange: (page) => router.push(`?page=${page}`),
 * });
 */
export function useFormNavigation({
  totalPages = 3,
  initialPage = 1,
  onPageChange,
}: UseFormNavigationOptions = {}): UseFormNavigationReturn {
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [completedPages, setCompletedPages] = React.useState<Set<number>>(
    new Set()
  );

  /**
   * Navigate to a specific page
   * Allows navigation to any valid page for quick jumping
   */
  const goToPage = React.useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
      onPageChange?.(page);
    },
    [totalPages, onPageChange]
  );

  /**
   * Navigate to next page
   */
  const goNext = React.useCallback(() => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      onPageChange?.(nextPage);
    }
  }, [currentPage, totalPages, onPageChange]);

  /**
   * Navigate to previous page
   */
  const goBack = React.useCallback(() => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      onPageChange?.(prevPage);
    }
  }, [currentPage, onPageChange]);

  /**
   * Mark a page as complete
   */
  const markPageComplete = React.useCallback((page: number) => {
    setCompletedPages((prev) => new Set([...prev, page]));
  }, []);

  /**
   * Mark a page as incomplete (e.g., if data was cleared)
   */
  const markPageIncomplete = React.useCallback((page: number) => {
    setCompletedPages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(page);
      return newSet;
    });
  }, []);

  /**
   * Check if a specific page is complete
   */
  const isPageComplete = React.useCallback(
    (page: number) => completedPages.has(page),
    [completedPages]
  );

  // Computed navigation states
  const canGoBack = currentPage > 1;
  const canGoForward = currentPage < totalPages && completedPages.has(currentPage);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return {
    currentPage,
    totalPages,
    completedPages,
    canGoBack,
    canGoForward,
    isFirstPage,
    isLastPage,
    goToPage,
    goNext,
    goBack,
    markPageComplete,
    markPageIncomplete,
    isPageComplete,
  };
}
