/**
 * useSuggestedReplies hook for fetching dynamic AI-generated suggestions
 *
 * Fetches contextual quick reply suggestions after an AI response loads.
 * Uses lazy query to fetch on-demand, not on component mount.
 * Returns empty array on any error (non-critical feature).
 */
"use client";

import * as React from "react";
import { useGetSuggestedRepliesLazyQuery } from "@/types/graphql";
import type { QuickReplyOption } from "./types";

/**
 * Return type for useSuggestedReplies hook
 */
export interface UseSuggestedRepliesReturn {
  /** Current suggestions array */
  suggestions: QuickReplyOption[];
  /** Whether suggestions are currently being fetched */
  isLoading: boolean;
  /** Fetch suggestions for a specific message (or latest if no ID provided) */
  fetchSuggestions: (messageId?: string) => Promise<void>;
  /** Clear all suggestions */
  clearSuggestions: () => void;
  /** Manually set suggestions (for initialization or static suggestions) */
  setSuggestions: (suggestions: QuickReplyOption[]) => void;
}

/**
 * Custom hook for managing AI-generated quick reply suggestions
 *
 * Features:
 * - Lazy loading (only fetches when explicitly called)
 * - Network-only fetch policy (always fresh suggestions)
 * - Graceful error handling (returns empty on failure)
 * - Loading state for UI feedback
 *
 * @param sessionId - Current onboarding session ID
 * @returns Suggestions state and control functions
 *
 * @example
 * const {
 *   suggestions,
 *   isLoading,
 *   fetchSuggestions,
 *   clearSuggestions,
 * } = useSuggestedReplies(sessionId);
 *
 * // After AI response arrives:
 * fetchSuggestions(assistantMessage.id);
 *
 * // When user selects a suggestion:
 * clearSuggestions();
 */
export function useSuggestedReplies(sessionId: string): UseSuggestedRepliesReturn {
  const [suggestions, setSuggestionsState] = React.useState<QuickReplyOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Use lazy query - only fetches when explicitly called
  const [fetchQuery] = useGetSuggestedRepliesLazyQuery({
    fetchPolicy: "network-only", // Always fetch fresh suggestions
  });

  /**
   * Fetch suggestions for the given message (or latest AI message)
   *
   * @param messageId - Optional specific message ID to base suggestions on
   */
  const fetchSuggestions = React.useCallback(
    async (messageId?: string): Promise<void> => {
      if (!sessionId) {
        console.warn("Cannot fetch suggestions without sessionId");
        return;
      }

      setIsLoading(true);
      setSuggestionsState([]); // Clear previous suggestions while loading

      try {
        const { data } = await fetchQuery({
          variables: {
            sessionId,
            messageId: messageId || null,
          },
        });

        if (data?.suggestedReplies) {
          // Map GraphQL response to QuickReplyOption format
          const mappedSuggestions: QuickReplyOption[] = data.suggestedReplies.map(
            (suggestion) => ({
              label: suggestion.label,
              value: suggestion.value,
              icon: suggestion.icon || undefined,
            })
          );
          setSuggestionsState(mappedSuggestions);
        } else {
          setSuggestionsState([]);
        }
      } catch (error) {
        // Non-critical - log and return empty
        console.warn("Error fetching suggestions:", error);
        setSuggestionsState([]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, fetchQuery]
  );

  /**
   * Clear all suggestions (e.g., when user starts typing or selects one)
   */
  const clearSuggestions = React.useCallback((): void => {
    setSuggestionsState([]);
    setIsLoading(false);
  }, []);

  /**
   * Manually set suggestions (for initialization or static suggestions)
   * Used for welcome message and session restoration
   */
  const setManualSuggestions = React.useCallback(
    (newSuggestions: QuickReplyOption[]): void => {
      setSuggestionsState(newSuggestions);
      setIsLoading(false);
    },
    []
  );

  return {
    suggestions,
    isLoading,
    fetchSuggestions,
    clearSuggestions,
    setSuggestions: setManualSuggestions,
  };
}
