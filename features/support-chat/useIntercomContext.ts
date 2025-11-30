/**
 * useIntercomContext Hook
 *
 * Manages Intercom user context and attributes throughout the onboarding flow.
 * Automatically updates Intercom when session state or route changes.
 *
 * Features:
 * - Maps onboarding session data to Intercom attributes
 * - Filters PHI before transmission
 * - Updates context on route changes
 * - Gracefully handles missing session data
 * - Error handling without blocking user flow
 *
 * @example
 * ```tsx
 * function OnboardingLayout({ sessionId, currentStep }) {
 *   useIntercomContext(sessionId, currentStep);
 *   return <div>...</div>;
 * }
 * ```
 */
'use client';

import { useEffect } from 'react';
import type { OnboardingSession } from '@/hooks/useOnboardingSession';
import { filterPHI, validateNoPHI } from '@/lib/utils/phi-filter';
import type {
  IntercomUserAttributes,
  OnboardingStep,
  IntercomContextOptions,
} from './types';

/**
 * Route segment to onboarding step mapping
 * Converts URL segments to standardized step names
 */
const ROUTE_TO_STEP: Record<string, OnboardingStep> = {
  assessment: 'assessment',
  demographics: 'demographics',
  info: 'demographics', // Alias
  insurance: 'insurance',
  match: 'matching',
  matching: 'matching',
  book: 'scheduling',
  schedule: 'scheduling',
  scheduling: 'scheduling',
  complete: 'complete',
  confirmation: 'complete',
};

/**
 * Maps onboarding session data to Intercom user attributes
 *
 * Extracts non-PHI data from session and formats it for Intercom.
 * All PHI fields are filtered before return.
 *
 * @param session - Onboarding session data
 * @param currentStep - Current onboarding step
 * @returns Intercom user attributes with PHI filtered
 */
function mapSessionToIntercomAttributes(
  session: OnboardingSession,
  currentStep: OnboardingStep
): IntercomUserAttributes {
  // Extract safe fields from session
  const parentName = session.parent?.firstName && session.parent?.lastName
    ? `${session.parent.firstName} ${session.parent.lastName}`
    : session.parent?.firstName;

  const attributes: IntercomUserAttributes = {
    session_id: session.id,
    onboarding_step: currentStep,
    name: parentName,
    email: session.parent?.email,
    child_first_name: session.child?.firstName,
    assessment_complete: session.assessment?.isComplete ?? false,
    insurance_submitted: false, // TODO: Add insurance state when available
    therapist_matched: false, // TODO: Add matching state when available
    appointment_scheduled: false, // TODO: Add scheduling state when available
  };

  // Filter out any PHI that might have slipped through
  const filtered = filterPHI(attributes as Record<string, unknown>);

  return filtered as IntercomUserAttributes;
}

/**
 * Updates Intercom with user context
 *
 * Calls the Intercom update API with user attributes.
 * Validates no PHI before transmission in development mode.
 *
 * @param attributes - Intercom user attributes
 * @param options - Configuration options
 */
function updateIntercomContext(
  attributes: IntercomUserAttributes,
  options: IntercomContextOptions = {}
): void {
  const { enableLogging = false, validateNoPHI: shouldValidate = true } = options;

  // Check if Intercom is loaded
  if (typeof window === 'undefined' || !window.Intercom) {
    if (enableLogging) {
      console.warn('[Intercom] Intercom not loaded, skipping context update');
    }
    return;
  }

  // Validate no PHI in development/test environments
  if (shouldValidate && process.env.NODE_ENV !== 'production') {
    try {
      validateNoPHI(attributes, 'Intercom update');
    } catch (error) {
      console.error('[Intercom] PHI validation failed:', error);
      // Don't send if PHI detected
      return;
    }
  }

  try {
    // Update Intercom with user attributes
    window.Intercom('update', attributes);

    if (enableLogging) {
      console.log('[Intercom] Context updated:', {
        session_id: attributes.session_id,
        step: attributes.onboarding_step,
        // Don't log other fields to avoid PHI in logs
      });
    }
  } catch (error) {
    // Log error but don't block user flow
    console.error('[Intercom] Failed to update context:', error);
  }
}

/**
 * Hook to manage Intercom context updates during onboarding
 *
 * Automatically updates Intercom when session data or route changes.
 * Handles missing session data gracefully (early onboarding).
 *
 * @param session - Onboarding session data (can be null early in flow)
 * @param pathname - Current route pathname
 * @param options - Configuration options (should be memoized to prevent unnecessary updates)
 *
 * @example
 * ```tsx
 * function OnboardingLayout({ children, params }) {
 *   const { sessionId } = use(params);
 *   const pathname = usePathname();
 *   const { session } = useOnboardingSession(sessionId);
 *
 *   useIntercomContext(session, pathname);
 *
 *   return <div>{children}</div>;
 * }
 * ```
 */
export function useIntercomContext(
  session: OnboardingSession | null,
  pathname: string,
  options: IntercomContextOptions = {}
): void {
  // Extract stable values from options to avoid dependency issues
  const { enableLogging = false, validateNoPHI: shouldValidate = true } = options;

  useEffect(() => {
    // Skip if no session data yet (early in onboarding)
    if (!session) {
      return;
    }

    // Determine current step from pathname
    const segments = pathname.split('/');
    const routeSegment = segments[3] || 'assessment'; // /onboarding/[sessionId]/[step]
    const currentStep: OnboardingStep = ROUTE_TO_STEP[routeSegment] || 'assessment';

    // Map session to Intercom attributes
    const attributes = mapSessionToIntercomAttributes(session, currentStep);

    // Update Intercom with stable options
    updateIntercomContext(attributes, { enableLogging, validateNoPHI: shouldValidate });
  }, [session, pathname, enableLogging, shouldValidate]);
}

/**
 * Manually update Intercom context
 *
 * Useful for updating context outside of the main hook flow,
 * such as after a specific user action.
 *
 * @param session - Onboarding session data
 * @param currentStep - Current onboarding step
 * @param options - Configuration options
 */
export function updateIntercom(
  session: OnboardingSession,
  currentStep: OnboardingStep,
  options: IntercomContextOptions = {}
): void {
  const attributes = mapSessionToIntercomAttributes(session, currentStep);
  updateIntercomContext(attributes, options);
}
