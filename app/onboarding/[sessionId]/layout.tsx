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

import { useState, use, useMemo, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { SaveExitModal } from "@/components/layout/SaveExitModal";
import { OnboardingProgress, type StepId } from "@/components/layout/OnboardingProgress";
import { Footer } from "@/components/layout/Footer";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { useOnboardingSession } from "@/hooks/useOnboardingSession";
import { useIntercomContext } from "@/features/support-chat";
import { DevToolbar } from "@/components/dev";

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
 */
const ROUTE_TO_STEP: Record<string, StepId> = {
  assessment: "assessment",
  demographics: "info",
  insurance: "insurance",
  matching: "match",
  schedule: "book",
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
 * Determines completed steps based on current step
 * Steps before the current step are considered completed
 * @param currentStep - Currently active step
 * @returns Array of completed step IDs
 */
function getCompletedSteps(currentStep: StepId): StepId[] {
  const stepOrder: StepId[] = ["assessment", "info", "insurance", "match", "book"];
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
  const completedSteps = useMemo(() => getCompletedSteps(currentStep), [currentStep]);

  const [isSaveExitModalOpen, setIsSaveExitModalOpen] = useState(false);

  // Load session for parent email pre-fill
  const { session } = useOnboardingSession(sessionId);

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
        onStepClick={handleStepClick}
        allowAllNavigation={isDevMode}
      />

      {/* Main content area with max-width constraint */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0">
        <ErrorBoundary>
          <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-4 min-h-0">
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
