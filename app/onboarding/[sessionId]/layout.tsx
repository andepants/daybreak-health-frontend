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
 */
"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { OnboardingProgress, type StepId } from "@/components/layout/OnboardingProgress";
import { Footer } from "@/components/layout/Footer";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

/**
 * Props for the OnboardingLayout component
 * @param children - Page content to render within the layout
 */
interface OnboardingLayoutProps {
  children: React.ReactNode;
}

/**
 * Renders the onboarding layout with header, progress, content area, and footer
 * Content is constrained to 640px max-width and centered on desktop
 */
function OnboardingLayout({ children }: OnboardingLayoutProps) {
  // TODO: Replace with actual step management from session/context
  const [currentStep] = useState<StepId>("assessment");
  const [completedSteps] = useState<StepId[]>([]);

  /**
   * Handle save and exit action
   * TODO: Implement actual save logic with session data
   */
  function handleSaveExit(): void {
    // TODO: Save current progress to backend
    console.log("Save & Exit clicked");
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
    </div>
  );
}

export default OnboardingLayout;
