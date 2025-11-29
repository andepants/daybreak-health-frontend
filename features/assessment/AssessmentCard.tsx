/**
 * AssessmentCard component for structured question display
 *
 * Displays single-question cards in Typeform style for structured assessment sections.
 * Supports multiple choice with quick reply buttons and "Other" text input option.
 * Includes progress tracking and back navigation for answer revision.
 */
"use client";

import * as React from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * Animation delay for option selection visual feedback
 */
const SELECTION_ANIMATION_DELAY_MS = 200;

/**
 * Structured question data from API
 */
export interface StructuredQuestion {
  id: string;
  type: "single-choice" | "multi-choice" | "text";
  question: string;
  options: string[];
  allowOther: boolean;
}

/**
 * Props for AssessmentCard component
 * @param question - The structured question to display
 * @param currentStep - Current question number (1-indexed)
 * @param totalSteps - Total number of questions in this section
 * @param onAnswer - Callback fired when user selects an answer
 * @param onBack - Optional callback for back navigation
 * @param className - Additional CSS classes for customization
 */
export interface AssessmentCardProps {
  question: StructuredQuestion;
  currentStep: number;
  totalSteps: number;
  onAnswer: (answer: string) => void;
  onBack?: () => void;
  className?: string;
}

/**
 * Renders a single-question card for structured assessment
 *
 * Visual specs:
 * - Centered card with max-width 640px
 * - Large readable question text (text-xl)
 * - Grid layout for answer options (2 columns on desktop, 1 on mobile)
 * - Progress indicator in header (e.g., "3 of 5")
 * - Back button in top-left if onBack provided
 * - "Other" option expands to text input when selected
 * - Smooth slide transitions between questions
 *
 * Accessibility:
 * - role="region" with aria-label for section
 * - Keyboard navigable options
 * - Clear focus indicators
 * - Screen reader announcements for progress
 *
 * @example
 * <AssessmentCard
 *   question={structuredQuestion}
 *   currentStep={3}
 *   totalSteps={5}
 *   onAnswer={handleAnswer}
 *   onBack={handleBack}
 * />
 */
export const AssessmentCard = React.memo(function AssessmentCard({
  question,
  currentStep,
  totalSteps,
  onAnswer,
  onBack,
  className,
}: AssessmentCardProps) {
  const [showOther, setShowOther] = React.useState(false);
  const [otherText, setOtherText] = React.useState("");
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);

  /**
   * Handles option selection
   * For "Other", toggles text input; otherwise sends answer immediately
   */
  const handleOptionSelect = (option: string): void => {
    if (option === "Other") {
      setShowOther(true);
      setSelectedOption(option);
    } else {
      setSelectedOption(option);
      // Brief delay to show selection before proceeding
      setTimeout(() => {
        onAnswer(option);
        setSelectedOption(null);
      }, SELECTION_ANIMATION_DELAY_MS);
    }
  };

  /**
   * Handles "Other" text submission
   */
  const handleOtherSubmit = (): void => {
    if (otherText.trim()) {
      onAnswer(otherText.trim());
      setOtherText("");
      setShowOther(false);
      setSelectedOption(null);
    }
  };

  /**
   * Handles keyboard events for textarea
   * Enter: Submit (Shift+Enter for new line)
   * Escape: Cancel
   */
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleOtherSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowOther(false);
      setOtherText("");
      setSelectedOption(null);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center min-h-screen px-4 py-8 animate-fade-in",
        className
      )}
      role="region"
      aria-label={`Assessment question ${currentStep} of ${totalSteps}`}
    >
      <div className="w-full max-w-2xl">
        {/* Card header */}
        <div className="flex items-center justify-between mb-8">
          {/* Back button */}
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              aria-label="Go back to previous question"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}

          {/* Progress indicator */}
          <div
            className="ml-auto text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            {currentStep} of {totalSteps}
          </div>
        </div>

        {/* Question */}
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-8 leading-tight">
          {question.question}
        </h2>

        {/* Answer options */}
        <div className="space-y-3">
          {/* Standard options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options.map((option) => (
              <Button
                key={option}
                variant="outline"
                size="lg"
                onClick={() => handleOptionSelect(option)}
                className={cn(
                  "h-auto min-h-[60px] text-left justify-start p-4",
                  "border-2 transition-all duration-200",
                  "hover:border-daybreak-teal hover:bg-daybreak-teal/5",
                  selectedOption === option &&
                    "border-daybreak-teal bg-daybreak-teal/10"
                )}
                aria-pressed={selectedOption === option}
              >
                <span className="text-base">{option}</span>
              </Button>
            ))}
          </div>

          {/* "Other" option */}
          {question.allowOther && (
            <>
              {!showOther ? (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleOptionSelect("Other")}
                  className={cn(
                    "w-full h-auto min-h-[60px] text-left justify-start p-4",
                    "border-2 transition-all duration-200",
                    "hover:border-daybreak-teal hover:bg-daybreak-teal/5",
                    selectedOption === "Other" &&
                      "border-daybreak-teal bg-daybreak-teal/10"
                  )}
                >
                  <span className="text-base">Other (tap to type)</span>
                </Button>
              ) : (
                <div className="space-y-3 animate-fade-in">
                  <Textarea
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    onKeyDown={handleTextareaKeyDown}
                    placeholder="Please specify... (Press Enter to submit, Shift+Enter for new line)"
                    className="min-h-[100px] text-base"
                    autoFocus
                    aria-label="Other answer text"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowOther(false);
                        setOtherText("");
                        setSelectedOption(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleOtherSubmit}
                      disabled={!otherText.trim()}
                      className="bg-daybreak-teal hover:bg-daybreak-teal/90"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});

AssessmentCard.displayName = "AssessmentCard";
