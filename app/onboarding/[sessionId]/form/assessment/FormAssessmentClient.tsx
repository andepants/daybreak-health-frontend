/**
 * Form Assessment Client Component
 *
 * Client-side component managing multi-page form state, navigation,
 * auto-save, and summary generation. Implements AC-3.4.2 through AC-3.4.10.
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  FormProgress,
  FormNavigation,
  SaveIndicator,
  Page1AboutYourChild,
  Page2DailyLifeImpact,
  Page3AdditionalContext,
  useFormAutoSave,
  useFormNavigation,
  formToSummary,
  formatSummaryForDisplay,
  chatToFormMapper,
  loadFormDataFromStorage,
  loadChatDataFromStorage,
  type AssessmentSummary,
} from "@/features/assessment/form";
import {
  page1Schema,
  page1Defaults,
  page2Schema,
  page2Defaults,
  page3Schema,
  page3Defaults,
  type Page1Input,
  type Page2Input,
  type Page3Input,
  type FormAssessmentInput,
} from "@/lib/validations/assessment";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

/**
 * Props for FormAssessmentClient component
 */
interface FormAssessmentClientProps {
  sessionId: string;
}

/**
 * Form Assessment Client component
 *
 * Manages the 3-page assessment form with:
 * - Page-specific validation schemas
 * - Auto-save on field blur
 * - Progress tracking and navigation
 * - Mode switching to/from chat
 * - Summary generation on completion
 *
 * Layout:
 * - Progress indicator at top
 * - Form content in center (max-width 640px)
 * - Navigation buttons at bottom
 * - Save status indicator
 */
export function FormAssessmentClient({ sessionId }: FormAssessmentClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [summary, setSummary] = React.useState<AssessmentSummary | null>(null);
  const [showSummary, setShowSummary] = React.useState(false);

  // Load existing data from storage on mount
  const [initialData, setInitialData] = React.useState<Partial<FormAssessmentInput>>({});
  const [dataLoaded, setDataLoaded] = React.useState(false);

  React.useEffect(() => {
    // Try to load existing form data first
    const formData = loadFormDataFromStorage(sessionId);

    if (Object.keys(formData).length > 0) {
      setInitialData(formData);
    } else {
      // Try to load from chat data for mode switching (AC-3.4.9)
      const chatData = loadChatDataFromStorage(sessionId);
      if (chatData.conversationHistory?.length || chatData.extractedData) {
        const mappedData = chatToFormMapper(chatData);
        setInitialData(mappedData);
      }
    }

    setDataLoaded(true);
  }, [sessionId]);

  // Navigation hook
  const {
    currentPage,
    completedPages,
    goToPage,
    goNext,
    goBack,
    markPageComplete,
    isLastPage,
  } = useFormNavigation({
    totalPages: 3,
    initialPage: 1,
  });

  // Auto-save hook
  const { saveField, saveAll, saveStatus } = useFormAutoSave({
    sessionId,
  });

  // Page 1 form
  const page1Form = useForm<Page1Input>({
    resolver: zodResolver(page1Schema),
    defaultValues: page1Defaults,
    mode: "onBlur",
  });

  // Page 2 form
  const page2Form = useForm<Page2Input>({
    resolver: zodResolver(page2Schema),
    defaultValues: page2Defaults,
    mode: "onBlur",
  });

  // Page 3 form
  const page3Form = useForm<Page3Input>({
    resolver: zodResolver(page3Schema),
    defaultValues: page3Defaults,
    mode: "onBlur",
  });

  // Apply initial data to forms once loaded
  React.useEffect(() => {
    if (dataLoaded && Object.keys(initialData).length > 0) {
      // Page 1 fields
      if (initialData.primaryConcerns) {
        page1Form.setValue("primaryConcerns", initialData.primaryConcerns);
      }
      if (initialData.concernDuration) {
        page1Form.setValue("concernDuration", initialData.concernDuration);
      }
      if (initialData.concernSeverity) {
        page1Form.setValue("concernSeverity", initialData.concernSeverity);
      }

      // Page 2 fields
      if (initialData.sleepPatterns) {
        page2Form.setValue("sleepPatterns", initialData.sleepPatterns);
      }
      if (initialData.appetiteChanges) {
        page2Form.setValue("appetiteChanges", initialData.appetiteChanges);
      }
      if (initialData.schoolPerformance) {
        page2Form.setValue("schoolPerformance", initialData.schoolPerformance);
      }
      if (initialData.socialRelationships) {
        page2Form.setValue("socialRelationships", initialData.socialRelationships);
      }

      // Page 3 fields
      if (initialData.recentEvents) {
        page3Form.setValue("recentEvents", initialData.recentEvents);
      }
      if (initialData.therapyGoals) {
        page3Form.setValue("therapyGoals", initialData.therapyGoals);
      }
    }
  }, [dataLoaded, initialData, page1Form, page2Form, page3Form]);

  /**
   * Get all form data combined
   */
  const getAllFormData = React.useCallback((): Partial<FormAssessmentInput> => {
    return {
      ...page1Form.getValues(),
      ...page2Form.getValues(),
      ...page3Form.getValues(),
    };
  }, [page1Form, page2Form, page3Form]);

  /**
   * Handle page 1 field blur for auto-save
   */
  const handlePage1Blur = React.useCallback(
    (fieldName: keyof Page1Input) => {
      saveField(fieldName, page1Form.getValues());
    },
    [saveField, page1Form]
  );

  /**
   * Handle page 2 field blur for auto-save
   */
  const handlePage2Blur = React.useCallback(
    (fieldName: keyof Page2Input) => {
      saveField(fieldName, page2Form.getValues());
    },
    [saveField, page2Form]
  );

  /**
   * Handle page 3 field blur for auto-save
   */
  const handlePage3Blur = React.useCallback(
    (fieldName: keyof Page3Input) => {
      saveField(fieldName, page3Form.getValues());
    },
    [saveField, page3Form]
  );

  /**
   * Handle next button click
   * Validates current page and advances
   */
  const handleNext = React.useCallback(async () => {
    let isValid = false;

    if (currentPage === 1) {
      isValid = await page1Form.trigger();
      if (isValid) {
        await saveAll(getAllFormData());
        markPageComplete(1);
        goNext();
      }
    } else if (currentPage === 2) {
      // Page 2 is all optional, always valid
      isValid = true;
      await saveAll(getAllFormData());
      markPageComplete(2);
      goNext();
    } else if (currentPage === 3) {
      isValid = await page3Form.trigger();
      if (isValid) {
        // Final page - submit
        await handleSubmit();
      }
    }
  }, [currentPage, page1Form, page3Form, saveAll, getAllFormData, markPageComplete, goNext]);

  /**
   * Handle back button click
   */
  const handleBack = React.useCallback(() => {
    if (currentPage === 1) {
      // Go back to chat assessment (AC-3.4.10)
      router.push(`/onboarding/${sessionId}/assessment`);
    } else {
      goBack();
    }
  }, [currentPage, router, sessionId, goBack]);

  /**
   * Handle form submission
   */
  const handleSubmit = React.useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = getAllFormData() as FormAssessmentInput;

      // Save all data
      await saveAll(formData);
      markPageComplete(3);

      // Generate summary (AC-3.4.8)
      const generatedSummary = formToSummary(formData);
      setSummary(generatedSummary);
      setShowSummary(true);

      // Store summary in localStorage for session continuity
      try {
        localStorage.setItem(
          `assessment_summary_${sessionId}`,
          JSON.stringify({
            summary: generatedSummary,
            formData,
            generatedAt: new Date().toISOString(),
          })
        );
      } catch {
        // Non-critical error - summary is still generated
        console.warn("Failed to persist summary to browser storage");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit assessment. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [getAllFormData, saveAll, markPageComplete, sessionId]);

  /**
   * Handle summary confirmation
   */
  const handleConfirmSummary = React.useCallback(() => {
    // Navigate to demographics
    router.push(`/onboarding/${sessionId}/demographics`);
  }, [router, sessionId]);

  /**
   * Handle edit request from summary
   */
  const handleEditSummary = React.useCallback(() => {
    setShowSummary(false);
    goToPage(1);
  }, [goToPage]);

  /**
   * Switch to chat mode (AC-3.4.10)
   */
  const handleSwitchToChat = React.useCallback(() => {
    // Save current form data before switching
    saveAll(getAllFormData());
    router.push(`/onboarding/${sessionId}/assessment`);
  }, [saveAll, getAllFormData, router, sessionId]);

  // Show loading state while data loads
  if (!dataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-daybreak-teal mx-auto" />
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  // Show summary view
  if (showSummary && summary) {
    return (
      <div className="w-full max-w-[640px] mx-auto space-y-6 p-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold font-serif text-foreground">
            Assessment Summary
          </h1>
          <p className="text-muted-foreground">
            Review your assessment summary before continuing.
          </p>
        </div>

        {/* Summary content */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm font-sans">
              {formatSummaryForDisplay(summary)}
            </pre>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleEditSummary}
            className="w-full sm:w-auto"
          >
            Edit Responses
          </Button>
          <Button
            type="button"
            onClick={handleConfirmSummary}
            className="w-full sm:flex-1 bg-daybreak-teal hover:bg-daybreak-teal/90 text-white"
          >
            Confirm & Continue
          </Button>
        </div>
      </div>
    );
  }

  // Determine which form is valid for navigation
  const currentFormValid =
    currentPage === 1
      ? page1Form.formState.isValid
      : currentPage === 2
        ? true // Page 2 all optional
        : page3Form.formState.isValid;

  return (
    <div className="w-full max-w-[640px] mx-auto space-y-6 p-4">
      {/* Progress indicator (AC-3.4.7) */}
      <FormProgress
        currentPage={currentPage}
        completedPages={completedPages}
        onPageClick={goToPage}
      />

      {/* Mode switch link (AC-3.4.10) */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSwitchToChat}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Switch to AI chat
        </button>
      </div>

      {/* Page content */}
      <div className="min-h-[400px]">
        {currentPage === 1 && (
          <Page1AboutYourChild form={page1Form} onFieldBlur={handlePage1Blur} />
        )}
        {currentPage === 2 && (
          <Page2DailyLifeImpact form={page2Form} onFieldBlur={handlePage2Blur} />
        )}
        {currentPage === 3 && (
          <Page3AdditionalContext form={page3Form} onFieldBlur={handlePage3Blur} />
        )}
      </div>

      {/* Save status indicator (AC-3.4.6) */}
      <SaveIndicator status={saveStatus} />

      {/* Submit error display */}
      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{submitError}</p>
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation buttons */}
      <FormNavigation
        currentPage={currentPage}
        totalPages={3}
        isValid={currentFormValid}
        isSubmitting={isSubmitting}
        onBack={handleBack}
        onNext={handleNext}
      />
    </div>
  );
}
