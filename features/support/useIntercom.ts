/**
 * useIntercom Hook
 *
 * Manages Intercom identity verification and session context.
 * Fetches identity hash from backend and updates Intercom widget.
 *
 * Features:
 * - Identity verification via HMAC-SHA256 hash
 * - PHI-safe session context passing
 * - Automatic updates when session state changes
 *
 * Story 7.1: Intercom Widget Integration
 * Story 7.2: Session Context Passing
 */
import { useEffect, useCallback } from 'react';
import { gql } from '@apollo/client';
import { useLazyQuery } from '@apollo/client/react';

/**
 * GraphQL query for Intercom identity verification
 */
const GET_INTERCOM_IDENTITY = gql`
  query GetIntercomIdentity($sessionId: ID!) {
    intercomIdentity(sessionId: $sessionId) {
      appId
      userJwt
      userId
      enabled
    }
  }
`;

/**
 * GraphQL query for PHI-safe session context
 */
const GET_INTERCOM_CONTEXT = gql`
  query GetIntercomContext($sessionId: ID!) {
    generateIntercomContext(sessionId: $sessionId) {
      sessionId
      onboardingPhase
      parentFirstName
      childAge
      insuranceStatus
      hasErrors
      errorType
      adminLink
    }
  }
`;

/**
 * Intercom identity data from backend
 */
interface IntercomIdentity {
  appId: string | null;
  userJwt: string | null;
  userId: string;
  enabled: boolean;
}

/**
 * Intercom context data from backend (PHI-safe)
 */
interface IntercomContext {
  sessionId: string;
  onboardingPhase: string;
  parentFirstName: string | null;
  childAge: number | null;
  insuranceStatus: string | null;
  hasErrors: boolean;
  errorType: string | null;
  adminLink: string;
}

/**
 * Hook return type
 */
interface UseIntercomReturn {
  /** Initialize Intercom with identity verification */
  initializeWithIdentity: (sessionId: string) => Promise<void>;
  /** Update Intercom with session context */
  updateContext: (sessionId: string) => Promise<void>;
  /** Whether identity verification is loading */
  identityLoading: boolean;
  /** Whether context update is loading */
  contextLoading: boolean;
  /** Any error from identity or context fetching */
  error: Error | null;
}

/**
 * Hook for managing Intercom identity verification and context.
 *
 * Usage:
 * ```tsx
 * const { initializeWithIdentity, updateContext } = useIntercom();
 *
 * // After session is created
 * await initializeWithIdentity(sessionId);
 *
 * // After major state changes
 * await updateContext(sessionId);
 * ```
 */
export function useIntercom(): UseIntercomReturn {
  const [fetchIdentity, { loading: identityLoading, error: identityError }] =
    useLazyQuery<{ intercomIdentity: IntercomIdentity }>(GET_INTERCOM_IDENTITY, {
      fetchPolicy: 'network-only',
    });

  const [fetchContext, { loading: contextLoading, error: contextError }] =
    useLazyQuery<{ generateIntercomContext: IntercomContext }>(GET_INTERCOM_CONTEXT, {
      fetchPolicy: 'network-only',
    });

  /**
   * Initialize Intercom with identity verification from backend.
   * This enables secure identity verification to prevent user impersonation.
   */
  const initializeWithIdentity = useCallback(
    async (sessionId: string): Promise<void> => {
      if (!sessionId) {
        console.warn('[useIntercom] Cannot initialize: sessionId is required');
        return;
      }

      try {
        const { data } = await fetchIdentity({ variables: { sessionId } });

        if (!data?.intercomIdentity) {
          console.warn('[useIntercom] No identity data returned from backend');
          return;
        }

        const { appId, userJwt, userId, enabled } = data.intercomIdentity;

        if (!enabled) {
          console.info('[useIntercom] Intercom integration is disabled on backend');
          return;
        }

        if (!appId) {
          console.warn('[useIntercom] Intercom app_id not configured on backend');
          return;
        }

        // Boot Intercom with JWT identity verification
        // We use 'boot' (not 'update') because IntercomProvider only loads the script
        // without auto-booting, to avoid "Forbidden" errors when identity verification is required
        if (window.Intercom) {
          const settings: Record<string, unknown> = {
            app_id: appId,
            user_id: userId,
            // Required for JWT-based identity verification
            api_base: 'https://api-iam.intercom.io',
            // Daybreak brand styling
            alignment: 'right',
            horizontal_padding: 20,
            vertical_padding: 20,
            action_color: '#2A9D8F', // Daybreak teal
          };

          // Add JWT for identity verification (required when enabled in Intercom)
          if (userJwt) {
            settings.intercom_user_jwt = userJwt;
          }

          window.Intercom('boot', settings);
          console.info('[useIntercom] Intercom booted with JWT identity verification');
        }
      } catch (err) {
        console.error('[useIntercom] Failed to initialize identity:', err);
        throw err;
      }
    },
    [fetchIdentity]
  );

  /**
   * Update Intercom with PHI-safe session context.
   * This allows support agents to see relevant session info.
   */
  const updateContext = useCallback(
    async (sessionId: string): Promise<void> => {
      if (!sessionId) {
        console.warn('[useIntercom] Cannot update context: sessionId is required');
        return;
      }

      try {
        const { data } = await fetchContext({ variables: { sessionId } });

        if (!data?.generateIntercomContext) {
          console.warn('[useIntercom] No context data returned from backend');
          return;
        }

        const context = data.generateIntercomContext;

        // Update Intercom with custom attributes (PHI-safe)
        if (window.Intercom) {
          window.Intercom('update', {
            // Custom attributes for support agents (all PHI-safe)
            session_id: context.sessionId,
            onboarding_phase: context.onboardingPhase,
            parent_first_name: context.parentFirstName,
            child_age: context.childAge,
            insurance_status: context.insuranceStatus,
            has_errors: context.hasErrors,
            error_type: context.errorType,
            // Note: admin_link is for internal use, not sent to Intercom for security
          });
          console.info('[useIntercom] Intercom context updated');
        }
      } catch (err) {
        console.error('[useIntercom] Failed to update context:', err);
        throw err;
      }
    },
    [fetchContext]
  );

  // Combine errors
  const error = identityError || contextError || null;

  return {
    initializeWithIdentity,
    updateContext,
    identityLoading,
    contextLoading,
    error,
  };
}

export default useIntercom;
