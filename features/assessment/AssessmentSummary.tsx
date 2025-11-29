/**
 * AssessmentSummary component for displaying assessment completion summary
 *
 * Shows a warm, empathetic summary of key concerns identified during conversation.
 * Provides options to continue, add more information, or start over.
 * Uses child's name naturally and maintains Daybreak's supportive tone.
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

/**
 * Summary data structure from API
 */
export interface AssessmentSummaryData {
  keyConcerns: string[];
  childName: string;
  recommendedFocus?: string[] | null;
  generatedAt: string;
}

/**
 * Props for AssessmentSummary component
 * @param summary - The summary data to display
 * @param sessionId - Current onboarding session ID for navigation
 * @param onAddMore - Callback fired when user wants to add more information
 * @param onStartOver - Callback fired when user confirms starting over
 * @param onConfirm - Callback fired when user confirms summary and continues
 * @param className - Additional CSS classes for customization
 */
export interface AssessmentSummaryProps {
  summary: AssessmentSummaryData;
  sessionId: string;
  onAddMore: () => void;
  onStartOver: () => void;
  onConfirm: () => void;
  className?: string;
}

/**
 * Renders assessment summary card with action buttons
 *
 * Visual specs:
 * - Centered card with max-width 640px
 * - "Here's what I'm hearing..." heading in Fraunces font
 * - Bullet points with key concerns
 * - Natural use of child's name
 * - Warm, empathetic tone
 * - Three action options: continue, add more, start over
 * - Confirmation modal for "start over"
 *
 * Actions:
 * - "Yes, continue" (primary teal button) → saves and navigates to demographics
 * - "I'd like to add something" (outline button) → returns to chat
 * - "Start over" (ghost link) → shows confirmation modal, then resets
 *
 * Accessibility:
 * - role="region" with aria-label
 * - Semantic heading structure
 * - Clear button labels
 * - Confirmation prevents accidental data loss
 *
 * @example
 * <AssessmentSummary
 *   summary={summaryData}
 *   sessionId={sessionId}
 *   onAddMore={handleAddMore}
 *   onStartOver={handleStartOver}
 *   onConfirm={handleConfirm}
 * />
 */
export const AssessmentSummary = React.memo(function AssessmentSummary({
  summary,
  sessionId,
  onAddMore,
  onStartOver,
  onConfirm,
  className,
}: AssessmentSummaryProps) {
  const router = useRouter();
  const [showStartOverDialog, setShowStartOverDialog] = React.useState(false);
  const [isConfirming, setIsConfirming] = React.useState(false);

  /**
   * Handles confirmation and navigation to demographics
   */
  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      // Navigate to demographics page
      router.push(`/onboarding/${sessionId}/demographics`);
    } catch (error) {
      console.error("Failed to confirm summary:", error);
      setIsConfirming(false);
    }
  };

  /**
   * Handles start over confirmation
   */
  const handleStartOverConfirm = () => {
    setShowStartOverDialog(false);
    onStartOver();
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center justify-center min-h-screen px-4 py-8",
          className
        )}
        role="region"
        aria-label="Assessment summary"
      >
        <div className="w-full max-w-2xl">
          {/* Summary card */}
          <div className="bg-card border-2 border-border rounded-2xl p-8 md:p-10 shadow-sm">
            {/* Heading */}
            <h2 className="font-fraunces text-3xl md:text-4xl font-semibold text-foreground mb-6">
              Here&apos;s what I&apos;m hearing...
            </h2>

            {/* Introduction text */}
            <p className="text-lg text-foreground mb-6 leading-relaxed">
              Based on our conversation about{" "}
              <span className="font-medium">{summary.childName}</span>, here are
              the main things I noticed:
            </p>

            {/* Key concerns bullet points */}
            <ul className="space-y-4 mb-8">
              {summary.keyConcerns.map((concern, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-daybreak-teal mt-1.5 shrink-0">•</span>
                  <span className="text-base text-foreground leading-relaxed">
                    {concern}
                  </span>
                </li>
              ))}
            </ul>

            {/* Confirmation question */}
            <p className="text-lg text-foreground mb-6 font-medium">
              Does this sound right?
            </p>

            {/* Action buttons */}
            <div className="space-y-3">
              {/* Primary: Continue */}
              <Button
                onClick={handleConfirm}
                disabled={isConfirming}
                className="w-full h-12 text-base bg-daybreak-teal hover:bg-daybreak-teal/90"
                size="lg"
              >
                {isConfirming ? "Saving..." : "Yes, continue →"}
              </Button>

              {/* Secondary: Add more */}
              <Button
                onClick={onAddMore}
                variant="outline"
                className="w-full h-12 text-base"
                size="lg"
                disabled={isConfirming}
              >
                I&apos;d like to add something
              </Button>

              {/* Ghost: Start over */}
              <Button
                onClick={() => setShowStartOverDialog(true)}
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
                disabled={isConfirming}
              >
                Start over
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Start over confirmation dialog */}
      <AlertDialog
        open={showStartOverDialog}
        onOpenChange={setShowStartOverDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start over?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to start the assessment from the beginning?
              Your conversation will be cleared and you&apos;ll need to answer the
              questions again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStartOverConfirm}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Yes, start over
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

AssessmentSummary.displayName = "AssessmentSummary";
