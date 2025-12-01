/**
 * Intercom Identity Provider Component
 *
 * Wraps components that have session context to enable Intercom identity verification.
 * Uses the useIntercom hook to fetch identity from backend and update the widget.
 *
 * This provider should be used inside the onboarding layout where session context
 * is available, nested within the base IntercomProvider.
 *
 * Story 7.1: Intercom Widget Integration (AC 7.1.4, 7.1.5)
 * Story 7.2: Session Context Passing (AC 7.2.1, 7.2.2)
 *
 * Usage:
 * ```tsx
 * <IntercomProvider>
 *   <IntercomIdentityProvider sessionId={sessionId}>
 *     <OnboardingContent />
 *   </IntercomIdentityProvider>
 * </IntercomProvider>
 * ```
 */
'use client';

import { useEffect, useRef } from 'react';
import { useIntercom } from '@/features/support';

/**
 * Props for IntercomIdentityProvider
 */
interface IntercomIdentityProviderProps {
  /** Session ID for identity verification */
  sessionId: string | null;
  /** React children */
  children: React.ReactNode;
  /** Optional: Onboarding phase for context updates */
  onboardingPhase?: string;
}

/**
 * IntercomIdentityProvider - Enables identity verification for Intercom
 *
 * Automatically initializes Intercom with identity verification when a
 * session ID is provided. Also updates context when session state changes.
 *
 * Features:
 * - Identity verification via HMAC-SHA256 hash
 * - Automatic context updates on phase changes
 * - Prevents duplicate initialization
 */
export function IntercomIdentityProvider({
  sessionId,
  children,
  onboardingPhase,
}: IntercomIdentityProviderProps) {
  const { initializeWithIdentity, updateContext } = useIntercom();

  // Track whether we've initialized to prevent duplicate calls
  const initializedRef = useRef(false);
  const lastPhaseRef = useRef<string | undefined>(undefined);

  // Initialize identity verification when session becomes available
  useEffect(() => {
    if (!sessionId || initializedRef.current) {
      return;
    }

    const initialize = async () => {
      try {
        await initializeWithIdentity(sessionId);
        initializedRef.current = true;
      } catch (error) {
        console.error('[IntercomIdentityProvider] Failed to initialize:', error);
        // Don't set initialized to true so we can retry
      }
    };

    initialize();
  }, [sessionId, initializeWithIdentity]);

  // Update context when onboarding phase changes
  useEffect(() => {
    if (!sessionId || !onboardingPhase || !initializedRef.current) {
      return;
    }

    // Only update if phase actually changed
    if (lastPhaseRef.current === onboardingPhase) {
      return;
    }

    lastPhaseRef.current = onboardingPhase;

    const update = async () => {
      try {
        await updateContext(sessionId);
      } catch (error) {
        console.error('[IntercomIdentityProvider] Failed to update context:', error);
      }
    };

    update();
  }, [sessionId, onboardingPhase, updateContext]);

  return <>{children}</>;
}

export default IntercomIdentityProvider;
