/**
 * Onboarding Layout Component
 *
 * Composition layout for the onboarding flow at `/onboarding/[sessionId]`.
 * Wraps children with Header, OnboardingProgress, Footer, and ErrorBoundary.
 *
 * Features:
 * - Max-width constraint (640px) for content area
 * - Centered content on desktop viewports
 * - Error boundary for graceful error handling
 * - Responsive design following Daybreak specs
 * - Save & Exit modal with session URL and email reminder
 * - Dynamic progress bar based on current route
 */
"use client";

import { useState, use, useMemo, useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { SaveExitModal } from "@/components/layout/SaveExitModal";
import { OnboardingProgress, type StepId } from "@/components/layout/OnboardingProgress";
import { Footer } from "@/components/layout/Footer";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { useOnboardingSession } from "@/hooks/useOnboardingSession";
import { useIntercomContext } from "@/features/support-chat";
import { useIntercom } from "@/features/support";
import { DevToolbar } from "@/components/dev";
import { useCompletionStatus } from "@/lib/completion";
import { cn } from "@/lib/utils";

/**
 * Props for the OnboardingLayout component
 * @param children - Page content to render within the layout
 * @param params - Route parameters including sessionId
 */
interface OnboardingLayoutProps {
  children: React.ReactNode;
  params: Promise<{ sessionId: string }>;
}

/**
 * Maps route segments to step IDs
 * Used to determine current progress step from pathname
 * Note: "confirmation" maps to "book" as it represents completion of the booking step
 */
const ROUTE_TO_STEP: Record<string, StepId> = {
  assessment: "assessment",
  demographics: "info",
  insurance: "insurance",
  matching: "match",
  schedule: "book",
  confirmation: "book", // Confirmation is part of the booking step
};

/**
 * Maps step IDs to route segments
 * Used for navigation when clicking on progress steps
 */
const STEP_TO_ROUTE: Record<StepId, string> = {
  assessment: "assessment",
  info: "demographics",
  insurance: "insurance",
  match: "matching",
  book: "schedule",
};

/**
 * Determines the current step from the pathname
 * @param pathname - Current route pathname
 * @returns The StepId corresponding to the current route
 */
function getStepFromPathname(pathname: string): StepId {
  // Extract route segment after sessionId (e.g., /onboarding/abc123/demographics -> demographics)
  const segments = pathname.split("/");
  const routeSegment = segments[3] || "assessment"; // Default to assessment if no segment
  return ROUTE_TO_STEP[routeSegment] || "assessment";
}

/**
 * Checks if the current route is the confirmation page
 * @param pathname - Current route pathname
 * @returns True if on confirmation page
 */
function isConfirmationPage(pathname: string): boolean {
  const segments = pathname.split("/");
  return segments[3] === "confirmation";
}

/**
 * Determines completed steps based on current step and page
 * Steps before the current step are considered completed
 * On confirmation page, ALL steps are marked as completed
 * @param currentStep - Currently active step
 * @param allComplete - If true, marks all steps as completed (for confirmation page)
 * @returns Array of completed step IDs
 */
function getCompletedSteps(currentStep: StepId, allComplete: boolean = false): StepId[] {
  const stepOrder: StepId[] = ["assessment", "info", "insurance", "match", "book"];

  // On confirmation page, all steps are complete
  if (allComplete) {
    return stepOrder;
  }

  const currentIndex = stepOrder.indexOf(currentStep);
  return currentIndex > 0 ? stepOrder.slice(0, currentIndex) : [];
}

/**
 * Renders the onboarding layout with header, progress, content area, and footer
 * Content is constrained to 640px max-width and centered on desktop
 */
function OnboardingLayout({ children, params }: OnboardingLayoutProps) {
  const { sessionId } = use(params);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for dev mode via query param (?dev=true) or environment
  const isDevMode = searchParams.get("dev") === "true" || process.env.NODE_ENV === "development";

  // Derive current step and completed steps from pathname (AC-3.2.15)
  const currentStep = useMemo(() => getStepFromPathname(pathname), [pathname]);
  const isOnConfirmation = useMemo(() => isConfirmationPage(pathname), [pathname]);
  // Assessment page needs special layout (no padding, no scroll on main)
  const isAssessmentPage = useMemo(() => {
    const segments = pathname.split("/");
    return segments[3] === "assessment";
  }, [pathname]);
  const completedSteps = useMemo(
    () => getCompletedSteps(currentStep, isOnConfirmation),
    [currentStep, isOnConfirmation]
  );

  // Get real completion status from localStorage data
  const completionStatus = useCompletionStatus({ sessionId });

  // Map completion percentages to step IDs
  const stepPercentages = useMemo(() => ({
    assessment: completionStatus.sections.assessment?.percentComplete ?? 0,
    info: completionStatus.sections.info?.percentComplete ?? 0,
    insurance: completionStatus.sections.insurance?.percentComplete ?? 0,
    match: completionStatus.sections.match?.percentComplete ?? 0,
    book: completionStatus.sections.book?.percentComplete ?? 0,
  }), [completionStatus.sections]);

  const [isSaveExitModalOpen, setIsSaveExitModalOpen] = useState(false);

  // Load session for parent email pre-fill
  const { session } = useOnboardingSession(sessionId);

  // Story 7.1: Intercom identity verification
  // Initialize Intercom with HMAC identity hash from backend
  const { initializeWithIdentity } = useIntercom();
  const intercomInitializedRef = useRef(false);

  useEffect(() => {
    // Only initialize once when sessionId is available
    if (!sessionId || intercomInitializedRef.current) {
      return;
    }

    const initializeIntercomIdentity = async () => {
      try {
        await initializeWithIdentity(sessionId);
        intercomInitializedRef.current = true;
      } catch (error) {
        // Log but don't block - Intercom will still work without identity verification
        console.warn('[OnboardingLayout] Failed to initialize Intercom identity:', error);
      }
    };

    initializeIntercomIdentity();
  }, [sessionId, initializeWithIdentity]);

  // Update Intercom context when route or session changes (Story 7.2)
  useIntercomContext(session, pathname);

  /**
   * Handle step navigation when clicking on progress steps
   * Navigates to the corresponding route for the selected step
   */
  const handleStepClick = useCallback(
    (stepId: StepId) => {
      const route = STEP_TO_ROUTE[stepId];
      router.push(`/onboarding/${sessionId}/${route}`);
    },
    [router, sessionId]
  );

  /**
   * Handle save and exit action
   * Shows confirmation modal with session URL and email reminder option
   */
  function handleSaveExit(): void {
    // Session is already auto-saved by useAutoSave hook in useAssessmentChat
    // Just show the confirmation modal
    setIsSaveExitModalOpen(true);
  }

  return (
    <div className="h-dvh flex flex-col bg-background">
      {/* Header with logo and Save & Exit */}
      <Header onSaveExit={handleSaveExit} />

      {/* Progress stepper - clickable in dev mode for testing */}
      <OnboardingProgress
        currentStep={currentStep}
        completedSteps={completedSteps}
        stepPercentages={stepPercentages}
        onStepClick={handleStepClick}
        allowAllNavigation={isDevMode}
      />

      {/* Main content area with max-width constraint */}
      {/* Assessment page: no scroll on main, chat handles its own scrolling */}
      <main className={cn(
        "flex-1 min-h-0",
        isAssessmentPage ? "overflow-hidden flex flex-col" : "overflow-y-auto"
      )}>
        <ErrorBoundary>
          <div className={cn(
            "w-full max-w-4xl mx-auto",
            isAssessmentPage ? "h-full flex flex-col" : "px-4 py-6"
          )}>
            {children}
          </div>
        </ErrorBoundary>
      </main>

      {/* Footer with legal links */}
      <Footer variant="minimal" />

      {/* Save & Exit confirmation modal */}
      <SaveExitModal
        isOpen={isSaveExitModalOpen}
        onClose={() => setIsSaveExitModalOpen(false)}
        sessionId={sessionId}
        parentEmail={session?.parent?.email}
      />

      {/* Dev toolbar for testing (development only) */}
      <DevToolbar sessionId={sessionId} />
    </div>
  );
}

export default OnboardingLayout;
