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

import { useState, use, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { SaveExitModal } from "@/components/layout/SaveExitModal";
import { OnboardingProgress, type StepId } from "@/components/layout/OnboardingProgress";
import { Footer } from "@/components/layout/Footer";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { useOnboardingSession } from "@/hooks/useOnboardingSession";

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
  match: "match",
  book: "book",
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

  // Derive current step and completed steps from pathname (AC-3.2.15)
  const currentStep = useMemo(() => getStepFromPathname(pathname), [pathname]);
  const completedSteps = useMemo(() => getCompletedSteps(currentStep), [currentStep]);

  const [isSaveExitModalOpen, setIsSaveExitModalOpen] = useState(false);

  // Load session for parent email pre-fill
  const { session } = useOnboardingSession(sessionId);

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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with logo and Save & Exit */}
      <Header onSaveExit={handleSaveExit} />

      {/* Progress stepper */}
      <OnboardingProgress
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      {/* Main content area with max-width constraint */}
      <main className="flex-1 flex flex-col">
        <ErrorBoundary>
          <div className="flex-1 w-full max-w-[640px] mx-auto px-4 py-6 md:px-6 md:py-8">
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
    </div>
  );
}

export default OnboardingLayout;
