/**
 * Page1AboutYourChild component for assessment form Page 1
 *
 * Collects primary concerns, duration, and severity rating.
 * All fields required per AC-3.4.3.
 */
"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type Page1Input,
  CONCERN_DURATION_OPTIONS,
  CONCERN_DURATION_LABELS,
  SEVERITY_OPTIONS,
  SEVERITY_LABELS,
} from "@/lib/validations/assessment";

/**
 * Props for Page1AboutYourChild component
 * @param form - React Hook Form instance for Page 1
 * @param onFieldBlur - Callback for field blur events (triggers auto-save)
 */
export interface Page1AboutYourChildProps {
  form: UseFormReturn<Page1Input>;
  onFieldBlur: (fieldName: keyof Page1Input) => void;
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
 * Renders Page 1 of the assessment form - About Your Child
 *
 * Fields:
 * - primaryConcerns: Textarea (required, 10-2000 chars)
 * - concernDuration: Select (required)
 * - concernSeverity: 1-5 scale radio buttons (required)
 *
 * @example
 * <Page1AboutYourChild
 *   form={form}
 *   onFieldBlur={(field) => handleAutoSave(field)}
 * />
 */
export function Page1AboutYourChild({
  form,
  onFieldBlur,
}: Page1AboutYourChildProps) {
  const {
    register,
    watch,
    setValue,
    trigger,
    formState: { errors, touchedFields, dirtyFields },
    getFieldState,
  } = form;

  const formValues = watch();

  /**
   * Checks if a field is valid and touched
   */
  const isFieldValid = (fieldName: keyof Page1Input): boolean => {
    const state = getFieldState(fieldName);
    return Boolean(
      (touchedFields[fieldName] || dirtyFields[fieldName]) &&
      !state.invalid &&
      formValues[fieldName] !== undefined &&
      formValues[fieldName] !== ""
    );
  };

  /**
   * Handle blur with validation
   */
  const handleBlur = async (fieldName: keyof Page1Input) => {
    await trigger(fieldName);
    onFieldBlur(fieldName);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          About Your Child
        </h2>
        <p className="text-sm text-muted-foreground">
          Help us understand what brings you here today. All fields are required.
        </p>
      </div>

      {/* Primary Concerns Textarea */}
      <div className="space-y-2">
        <Label
          htmlFor="primaryConcerns"
          className="flex items-center gap-1"
        >
          What concerns bring you here today? <span className="text-destructive">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">
          Please describe what you&apos;ve been noticing about your child&apos;s behavior, mood, or wellbeing.
        </p>
        <div className="relative">
          <Textarea
            id="primaryConcerns"
            rows={5}
            placeholder="Tell us about the concerns that led you to seek support..."
            aria-required="true"
            aria-invalid={!!errors.primaryConcerns}
            aria-describedby={errors.primaryConcerns ? "primaryConcerns-error" : undefined}
            className={cn(
              errors.primaryConcerns && "border-destructive"
            )}
            {...register("primaryConcerns", {
              onBlur: () => handleBlur("primaryConcerns"),
            })}
          />
          {isFieldValid("primaryConcerns") && (
            <Check
              className="absolute right-3 top-3 h-4 w-4"
              style={{ color: SUCCESS_COLOR }}
              aria-hidden="true"
            />
          )}
        </div>
        <div className="flex justify-between items-center">
          {errors.primaryConcerns ? (
            <p
              id="primaryConcerns-error"
              className="text-sm"
              style={{ color: ERROR_COLOR }}
              role="alert"
            >
              {errors.primaryConcerns.message}
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted-foreground">
            {(formValues.primaryConcerns || "").length}/2000
          </span>
        </div>
      </div>

      {/* Concern Duration Select */}
      <div className="space-y-2">
        <Label
          htmlFor="concernDuration"
          className="flex items-center gap-1"
        >
          How long have you noticed these concerns? <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Select
            value={formValues.concernDuration}
            onValueChange={(value: typeof CONCERN_DURATION_OPTIONS[number]) => {
              setValue("concernDuration", value, { shouldValidate: true });
              setTimeout(() => handleBlur("concernDuration"), 0);
            }}
          >
            <SelectTrigger
              id="concernDuration"
              aria-required="true"
              aria-invalid={!!errors.concernDuration}
              aria-describedby={errors.concernDuration ? "concernDuration-error" : undefined}
              className={cn(
                "w-full",
                errors.concernDuration && "border-destructive"
              )}
            >
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {CONCERN_DURATION_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {CONCERN_DURATION_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isFieldValid("concernDuration") && (
            <Check
              className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: SUCCESS_COLOR }}
              aria-hidden="true"
            />
          )}
        </div>
        {errors.concernDuration && (
          <p
            id="concernDuration-error"
            className="text-sm"
            style={{ color: ERROR_COLOR }}
            role="alert"
          >
            {errors.concernDuration.message}
          </p>
        )}
      </div>

      {/* Severity Rating */}
      <div className="space-y-3">
        <Label className="flex items-center gap-1">
          How severe would you rate the concerns? <span className="text-destructive">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">
          1 = Mild, 5 = Severe
        </p>

        <fieldset className="space-y-1" aria-required="true">
          <legend className="sr-only">Severity rating from 1 to 5</legend>
          <div
            className="flex gap-2 sm:gap-4"
            role="radiogroup"
            aria-label="Severity rating"
            aria-invalid={!!errors.concernSeverity}
            aria-describedby={errors.concernSeverity ? "concernSeverity-error" : undefined}
          >
            {SEVERITY_OPTIONS.map((value) => {
              const isSelected = formValues.concernSeverity === value;
              return (
                <label
                  key={value}
                  className={cn(
                    "flex flex-col items-center gap-1 cursor-pointer",
                    "transition-all duration-200"
                  )}
                >
                  <input
                    type="radio"
                    name="concernSeverity"
                    value={value}
                    checked={isSelected}
                    onChange={() => {
                      setValue("concernSeverity", value, { shouldValidate: true });
                      setTimeout(() => handleBlur("concernSeverity"), 0);
                    }}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center",
                      "text-lg font-medium border-2 transition-all duration-200",
                      "focus-within:ring-2 focus-within:ring-daybreak-teal focus-within:ring-offset-2",
                      isSelected
                        ? "border-daybreak-teal bg-daybreak-teal text-white"
                        : "border-border bg-background text-foreground hover:border-daybreak-teal/50"
                    )}
                  >
                    {value}
                  </span>
                  <span
                    className={cn(
                      "text-xs text-center",
                      isSelected ? "text-daybreak-teal font-medium" : "text-muted-foreground"
                    )}
                  >
                    {SEVERITY_LABELS[value]}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
        {errors.concernSeverity && (
          <p
            id="concernSeverity-error"
            className="text-sm"
            style={{ color: ERROR_COLOR }}
            role="alert"
          >
            {errors.concernSeverity.message}
          </p>
        )}
      </div>
    </div>
  );
}

Page1AboutYourChild.displayName = "Page1AboutYourChild";
