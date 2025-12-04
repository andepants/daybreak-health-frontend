/**
 * Assessment Client Component
 *
 * Client-side component for managing assessment chat state and interactions.
 * Separated from page.tsx to support Next.js server/client component architecture.
 * Shows chat interface during assessment, then displays summary card when complete.
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChatWindow, useAssessmentChat } from "@/features/assessment";
import { ResourcePanel } from "@/features/support";
import { getAuthToken } from "@/lib/apollo/client";

/**
 * Props for AssessmentClient component
 */
interface AssessmentClientProps {
  sessionId: string;
}

/**
 * Client component for assessment chat
 *
 * Manages message state and handles user interactions using the useAssessmentChat hook.
 * Provides full chat experience with adaptive questioning modes, structured questions,
 * crisis detection, and completeness validation.
 */
export function AssessmentClient({ sessionId }: AssessmentClientProps) {
  const router = useRouter();
  const [isResourcePanelOpen, setIsResourcePanelOpen] = React.useState(false);
  const {
    messages,
    sendMessage,
    retryLastMessage,
    isAiResponding,
    suggestedReplies,
    error,
    assessmentMode,
    structuredQuestion,
    structuredProgress,
    selectOption,
    goBack,
    isComplete,
    crisisDetected,
    handleConfirmSummary,
  } = useAssessmentChat(sessionId);

  /**
   * Check for auth token and redirect if missing.
   * This handles cases where users navigate directly to assessment page
   * without going through the session creation flow.
   */
  React.useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      console.warn("No auth token found, redirecting to home page");
      router.replace("/");
    }
  }, [router]);

  /**
   * Handle auth errors by redirecting to home page.
   * Common errors: "Session not found", "Unauthorized", "Invalid token"
   */
  React.useEffect(() => {
    if (error) {
      const errorMessage = error.message.toLowerCase();
      const isAuthError =
        errorMessage.includes("unauthorized") ||
        errorMessage.includes("session not found") ||
        errorMessage.includes("invalid token") ||
        errorMessage.includes("authentication");

      if (isAuthError) {
        console.error("Auth error detected, redirecting to home:", error.message);
        router.replace("/");
      }
    }
  }, [error, router]);

  /**
   * Handle message updates
   * In production, this would trigger analytics/logging
   */
  const handleMessageUpdate = React.useCallback(() => {
    // Could add analytics tracking here
    // TODO: Integrate with analytics service when available
  }, []);

  // Show error message for non-auth errors
  const showError = error && !error.message.toLowerCase().includes("unauthorized") &&
    !error.message.toLowerCase().includes("session not found") &&
    !error.message.toLowerCase().includes("invalid token") &&
    !error.message.toLowerCase().includes("authentication");

  /**
   * Handle continue button click - navigate to next step
   */
  const handleContinue = React.useCallback(async () => {
    await handleConfirmSummary();
    router.push(`/onboarding/${sessionId}/demographics`);
  }, [handleConfirmSummary, router, sessionId]);

  // Show chat interface (Continue button shown when complete)
  return (
    <main className="flex flex-col h-full flex-1 bg-background overflow-hidden">
      {/* Error banner for non-auth errors */}
      {showError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-amber-800 font-medium">
              Something went wrong: {error?.message}
            </p>
            <p className="text-xs text-amber-600 mt-1">
              You can try sending your message again.
            </p>
          </div>
        </div>
      )}

      {/* Crisis detection banner */}
      {crisisDetected && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-red-800 font-medium">
              If you or someone you know is in crisis, please reach out for immediate help:
            </p>
            <div className="mt-2 flex flex-col sm:flex-row gap-3 text-sm">
              <a
                href="tel:988"
                className="text-red-700 hover:text-red-900 font-semibold"
              >
                988 - Suicide & Crisis Lifeline
              </a>
              <span className="hidden sm:inline text-red-400">|</span>
              <span className="text-red-700">
                Text <strong>HELLO</strong> to <strong>741741</strong> - Crisis Text Line
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chat window in constrained container to ensure Continue button visibility */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatWindow
          messages={messages}
          sessionId={sessionId}
          onMessageUpdate={handleMessageUpdate}
          onSend={sendMessage}
          onRetry={retryLastMessage}
          suggestedReplies={suggestedReplies}
          isAiResponding={isAiResponding}
          mode={assessmentMode}
          structuredQuestion={structuredQuestion || undefined}
          structuredProgress={structuredProgress || undefined}
          onStructuredAnswer={selectOption}
          onStructuredBack={goBack}
          onOpenResources={() => setIsResourcePanelOpen(true)}
        />
      </div>

      {/* Continue button when assessment is complete - shrink-0 ensures visibility */}
      {isComplete && (
        <div className="shrink-0 border-t border-border bg-background px-4 py-4 safe-area-bottom">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleContinue}
              className="w-full bg-daybreak-teal hover:bg-daybreak-teal/90 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Resource Panel for helpful content */}
      <ResourcePanel
        isOpen={isResourcePanelOpen}
        onOpenChange={setIsResourcePanelOpen}
        source="chat"
      />
    </main>
  );
}
