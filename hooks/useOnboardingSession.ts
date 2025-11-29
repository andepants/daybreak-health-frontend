/**
 * useOnboardingSession hook for session state management
 *
 * Manages onboarding session lifecycle including loading, persistence,
 * and restoration. Handles session expiry and provides recovery utilities.
 * Integrates with localStorage for backup recovery.
 */
"use client";

import * as React from "react";

/**
 * Onboarding session data structure
 */
export interface OnboardingSession {
  id: string;
  status: "in-progress" | "completed" | "expired";
  assessment?: {
    conversationHistory: unknown[];
    isComplete: boolean;
    currentQuestion?: string;
  };
  parent?: {
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  child?: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
  };
  demographics?: unknown;
  createdAt: string;
  expiresAt: string;
}

/**
 * Return type for useOnboardingSession hook
 */
export interface UseOnboardingSessionReturn {
  session: OnboardingSession | null;
  isLoading: boolean;
  error: Error | null;
  isReturningUser: boolean;
  sessionExpiresAt: Date | null;
  refetch: () => void;
}

/**
 * Hook for managing onboarding session state
 *
 * Features:
 * - Loads session data on mount
 * - Detects returning users
 * - Handles session expiry
 * - Provides localStorage backup
 * - Supports manual refresh
 *
 * Note: This is a simplified implementation for mock data.
 * In production, this would use GraphQL queries to fetch session state.
 *
 * @param sessionId - The session ID to manage
 * @returns Session state and utilities
 *
 * @example
 * const { session, isLoading, isReturningUser } =
 *   useOnboardingSession(sessionId);
 */
export function useOnboardingSession(
  sessionId: string
): UseOnboardingSessionReturn {
  const [session, setSession] = React.useState<OnboardingSession | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [isReturningUser, setIsReturningUser] = React.useState(false);

  /**
   * Load session data from API or localStorage
   */
  const loadSession = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual GraphQL query when backend is ready
      // const { data } = await getOnboardingSession({ variables: { sessionId } });

      // For now, try to load from localStorage
      let stored: string | null = null;
      let parsed: { data?: { messages?: unknown[]; assessment?: unknown }; savedAt?: string } | null = null;

      try {
        stored = localStorage.getItem(`onboarding_session_${sessionId}`);
        if (stored) {
          parsed = JSON.parse(stored);
        }
      } catch (parseError) {
        console.warn("Failed to parse localStorage data, clearing corrupted session:", parseError);
        // Clear corrupted data
        try {
          localStorage.removeItem(`onboarding_session_${sessionId}`);
        } catch (clearError) {
          console.warn("Failed to clear corrupted localStorage:", clearError);
        }
        parsed = null;
      }

      if (parsed) {
        const hasMessages = parsed.data?.messages && Array.isArray(parsed.data.messages) && parsed.data.messages.length > 0;
        setIsReturningUser(!!hasMessages);

        // Mock session object
        const mockSession: OnboardingSession = {
          id: sessionId,
          status: "in-progress",
          assessment: parsed.data?.assessment as OnboardingSession["assessment"],
          createdAt: parsed.savedAt || new Date().toISOString(),
          expiresAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30 days
        };

        setSession(mockSession);
      } else {
        // New session
        const newSession: OnboardingSession = {
          id: sessionId,
          status: "in-progress",
          createdAt: new Date().toISOString(),
          expiresAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        };

        setSession(newSession);
        setIsReturningUser(false);

        // Store session ID in localStorage for recovery
        try {
          localStorage.setItem("current_onboarding_session", sessionId);
        } catch (storageError) {
          console.warn("Failed to store session ID in localStorage:", storageError);
        }
      }

      setIsLoading(false);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to load session");
      setError(error);
      setIsLoading(false);
    }
  }, [sessionId]);

  /**
   * Load session on mount
   */
  React.useEffect(() => {
    loadSession();
  }, [loadSession]);

  /**
   * Compute session expiry date
   */
  const sessionExpiresAt = React.useMemo(() => {
    if (!session) return null;
    return new Date(session.expiresAt);
  }, [session]);

  return {
    session,
    isLoading,
    error,
    isReturningUser,
    sessionExpiresAt,
    refetch: loadSession,
  };
}
