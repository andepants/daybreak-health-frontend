/**
 * Page3AdditionalContext component for assessment form Page 3
 *
 * Collects additional context including recent events (optional)
 * and therapy goals (required) per AC-3.4.5.
 */
"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { type Page3Input } from "@/lib/validations/assessment";
import {
  getContextualTips,
  getResourcesByTopic,
} from "@/lib/data/support-resources";
import { ResourceAccordion } from "@/features/support";
import { FieldStatusIndicator } from "./FieldStatusIndicator";

/**
 * Props for Page3AdditionalContext component
 * @param form - React Hook Form instance for Page 3
 * @param onFieldBlur - Callback for field blur events (triggers auto-save)
 */
export interface Page3AdditionalContextProps {
  form: UseFormReturn<Page3Input>;
  onFieldBlur: (fieldName: keyof Page3Input) => void;
}

/**
 * Error color from Daybreak design tokens
 */
const ERROR_COLOR = "#E85D5D";

/**
 * Success color from Daybreak design tokens
 */
const SUCCESS_COLOR = "#10B981";

/**
 * Renders Page 3 of the assessment form - Additional Context
 *
 * Fields:
 * - recentEvents: Textarea (optional, max 1000 chars)
 * - therapyGoals: Textarea (required, 10-1000 chars)
 *
 * @example
 * <Page3AdditionalContext
 *   form={form}
 *   onFieldBlur={(field) => handleAutoSave(field)}
 * />
 */
export function Page3AdditionalContext({
  form,
  onFieldBlur,
}: Page3AdditionalContextProps) {
  const {
    register,
    watch,
    trigger,
    formState: { errors, touchedFields, dirtyFields },
    getFieldState,
  } = form;

  const formValues = watch();

  /**
   * Checks if a field is valid and touched
   */
  const isFieldValid = (fieldName: keyof Page3Input): boolean => {
    const state = getFieldState(fieldName);
    const value = formValues[fieldName];
    // For optional fields, just check if it's been touched and has no errors
    if (fieldName === "recentEvents") {
      return Boolean(
        (touchedFields[fieldName] || dirtyFields[fieldName]) &&
        !state.invalid
      );
    }
    // For required fields, check for value too
    return Boolean(
      (touchedFields[fieldName] || dirtyFields[fieldName]) &&
      !state.invalid &&
      value !== undefined &&
      value !== ""
    );
  };

  /**
   * Handle blur with validation
   */
  const handleBlur = async (fieldName: keyof Page3Input) => {
    await trigger(fieldName);
    onFieldBlur(fieldName);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Additional Context
        </h2>
        <p className="text-sm text-muted-foreground">
          Share any additional information that might help us understand your situation better.
        </p>
      </div>

      {/* Final page indicator */}
      <div className="rounded-lg bg-daybreak-teal/10 border border-daybreak-teal/20 p-4">
        <p className="text-sm text-daybreak-teal font-medium">
          This is the final page. After completing, you&apos;ll be able to review a summary of your assessment.
        </p>
      </div>

      {/* Recent Events Textarea (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="recentEvents">
          Has anything significant happened recently?
        </Label>
        <p className="text-xs text-muted-foreground">
          This could include family changes, school transitions, loss of a loved one,
          or other events that might be affecting your child. (Optional)
        </p>
        <div className="relative">
          <Textarea
            id="recentEvents"
            rows={4}
            placeholder="Share any recent events that might be relevant... (optional)"
            aria-describedby={errors.recentEvents ? "recentEvents-error" : undefined}
            className={cn(
              errors.recentEvents && "border-destructive"
            )}
            {...register("recentEvents", {
              onBlur: () => handleBlur("recentEvents"),
            })}
          />
          {isFieldValid("recentEvents") && (formValues.recentEvents || "").length > 0 && (
            <Check
              className="absolute right-3 top-3 h-4 w-4"
              style={{ color: SUCCESS_COLOR }}
              aria-hidden="true"
            />
          )}
        </div>
        <div className="flex justify-between items-center">
          {errors.recentEvents ? (
            <p
              id="recentEvents-error"
              className="text-sm"
              style={{ color: ERROR_COLOR }}
              role="alert"
            >
              {errors.recentEvents.message}
            </p>
          ) : (
            <span className="text-xs text-muted-foreground italic">Optional</span>
          )}
          <span className="text-xs text-muted-foreground">
            {(formValues.recentEvents || "").length}/1000
          </span>
        </div>
      </div>

      {/* Therapy Goals Textarea (Required) */}
      <div className="space-y-2">
        <Label
          htmlFor="therapyGoals"
          className="flex items-center gap-2"
        >
          What are you hoping to get from therapy? <span className="text-destructive">*</span>
          <FieldStatusIndicator
            isValid={isFieldValid("therapyGoals")}
            isRequired={true}
            isTouched={!!touchedFields.therapyGoals}
            hasError={!!errors.therapyGoals}
          />
          <InfoTooltip
            tips={getContextualTips("assessment.goals")?.tips || []}
            title={getContextualTips("assessment.goals")?.title}
          />
        </Label>
        <p className="text-xs text-muted-foreground">
          Help us understand your goals and expectations for your child&apos;s therapy journey.
        </p>
        <div className="relative">
          <Textarea
            id="therapyGoals"
            rows={4}
            placeholder="Tell us what you hope therapy will help with..."
            aria-required="true"
            aria-invalid={!!errors.therapyGoals}
            aria-describedby={errors.therapyGoals ? "therapyGoals-error" : undefined}
            className={cn(
              errors.therapyGoals && "border-destructive"
            )}
            {...register("therapyGoals", {
              onBlur: () => handleBlur("therapyGoals"),
            })}
          />
          {isFieldValid("therapyGoals") && (
            <Check
              className="absolute right-3 top-3 h-4 w-4"
              style={{ color: SUCCESS_COLOR }}
              aria-hidden="true"
            />
          )}
        </div>
        <div className="flex justify-between items-center">
          {errors.therapyGoals ? (
            <p
              id="therapyGoals-error"
              className="text-sm"
              style={{ color: ERROR_COLOR }}
              role="alert"
            >
              {errors.therapyGoals.message}
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted-foreground">
            {(formValues.therapyGoals || "").length}/1000
          </span>
        </div>
      </div>

      {/* Helpful Resources Section */}
      <ResourceAccordion
        title="Helpful Resources for Your Journey"
        resources={getResourcesByTopic("getting-started")}
        maxVisible={3}
      />
    </div>
  );
}

Page3AdditionalContext.displayName = "Page3AdditionalContext";
