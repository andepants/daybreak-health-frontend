/**
 * Page2DailyLifeImpact component for assessment form Page 2
 *
 * Collects daily life impact information including sleep, appetite,
 * school performance, and social relationships. All fields optional
 * per AC-3.4.4.
 */
"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { Check } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type Page2Input,
  SLEEP_PATTERN_OPTIONS,
  SLEEP_PATTERN_LABELS,
  APPETITE_CHANGE_OPTIONS,
  APPETITE_CHANGE_LABELS,
  SCHOOL_PERFORMANCE_OPTIONS,
  SCHOOL_PERFORMANCE_LABELS,
  SOCIAL_RELATIONSHIP_OPTIONS,
  SOCIAL_RELATIONSHIP_LABELS,
} from "@/lib/validations/assessment";

/**
 * Props for Page2DailyLifeImpact component
 * @param form - React Hook Form instance for Page 2
 * @param onFieldBlur - Callback for field blur events (triggers auto-save)
 */
export interface Page2DailyLifeImpactProps {
  form: UseFormReturn<Page2Input>;
  onFieldBlur: (fieldName: keyof Page2Input) => void;
}

/**
 * Success color from Daybreak design tokens
 */
const SUCCESS_COLOR = "#10B981";

/**
 * Renders Page 2 of the assessment form - Daily Life Impact
 *
 * Fields (all optional):
 * - sleepPatterns: Select
 * - appetiteChanges: Select
 * - schoolPerformance: Select
 * - socialRelationships: Select
 *
 * @example
 * <Page2DailyLifeImpact
 *   form={form}
 *   onFieldBlur={(field) => handleAutoSave(field)}
 * />
 */
export function Page2DailyLifeImpact({
  form,
  onFieldBlur,
}: Page2DailyLifeImpactProps) {
  const {
    watch,
    setValue,
    trigger,
    formState: { touchedFields, dirtyFields },
    getFieldState,
  } = form;

  const formValues = watch();

  /**
   * Checks if a field has been set (for checkmark display)
   */
  const isFieldSet = (fieldName: keyof Page2Input): boolean => {
    const state = getFieldState(fieldName);
    return Boolean(
      (touchedFields[fieldName] || dirtyFields[fieldName]) &&
      !state.invalid &&
      formValues[fieldName] !== undefined
    );
  };

  /**
   * Handle select change with auto-save
   */
  const handleSelectChange = async <K extends keyof Page2Input>(
    fieldName: K,
    value: Page2Input[K]
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue(fieldName, value as any, { shouldValidate: true });
    await trigger(fieldName);
    onFieldBlur(fieldName);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Daily Life Impact
        </h2>
        <p className="text-sm text-muted-foreground">
          Have you noticed any changes in these areas? All fields are optional,
          but the more information you provide, the better we can help.
        </p>
      </div>

      {/* Sleep Patterns Select */}
      <div className="space-y-2">
        <Label htmlFor="sleepPatterns">
          Sleep patterns
        </Label>
        <p className="text-xs text-muted-foreground">
          Have you noticed any changes in your child&apos;s sleep?
        </p>
        <div className="relative">
          <Select
            value={formValues.sleepPatterns || ""}
            onValueChange={(value: typeof SLEEP_PATTERN_OPTIONS[number]) => {
              handleSelectChange("sleepPatterns", value);
            }}
          >
            <SelectTrigger
              id="sleepPatterns"
              className="w-full"
            >
              <SelectValue placeholder="Select sleep pattern (optional)" />
            </SelectTrigger>
            <SelectContent>
              {SLEEP_PATTERN_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {SLEEP_PATTERN_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isFieldSet("sleepPatterns") && (
            <Check
              className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: SUCCESS_COLOR }}
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {/* Appetite Changes Select */}
      <div className="space-y-2">
        <Label htmlFor="appetiteChanges">
          Appetite changes
        </Label>
        <p className="text-xs text-muted-foreground">
          Have you noticed any changes in eating habits?
        </p>
        <div className="relative">
          <Select
            value={formValues.appetiteChanges || ""}
            onValueChange={(value: typeof APPETITE_CHANGE_OPTIONS[number]) => {
              handleSelectChange("appetiteChanges", value);
            }}
          >
            <SelectTrigger
              id="appetiteChanges"
              className="w-full"
            >
              <SelectValue placeholder="Select appetite changes (optional)" />
            </SelectTrigger>
            <SelectContent>
              {APPETITE_CHANGE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {APPETITE_CHANGE_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isFieldSet("appetiteChanges") && (
            <Check
              className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: SUCCESS_COLOR }}
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {/* School Performance Select */}
      <div className="space-y-2">
        <Label htmlFor="schoolPerformance">
          School performance
        </Label>
        <p className="text-xs text-muted-foreground">
          How is your child doing academically?
        </p>
        <div className="relative">
          <Select
            value={formValues.schoolPerformance || ""}
            onValueChange={(value: typeof SCHOOL_PERFORMANCE_OPTIONS[number]) => {
              handleSelectChange("schoolPerformance", value);
            }}
          >
            <SelectTrigger
              id="schoolPerformance"
              className="w-full"
            >
              <SelectValue placeholder="Select school performance (optional)" />
            </SelectTrigger>
            <SelectContent>
              {SCHOOL_PERFORMANCE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {SCHOOL_PERFORMANCE_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isFieldSet("schoolPerformance") && (
            <Check
              className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: SUCCESS_COLOR }}
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {/* Social Relationships Select */}
      <div className="space-y-2">
        <Label htmlFor="socialRelationships">
          Social relationships
        </Label>
        <p className="text-xs text-muted-foreground">
          How are your child&apos;s friendships and social interactions?
        </p>
        <div className="relative">
          <Select
            value={formValues.socialRelationships || ""}
            onValueChange={(value: typeof SOCIAL_RELATIONSHIP_OPTIONS[number]) => {
              handleSelectChange("socialRelationships", value);
            }}
          >
            <SelectTrigger
              id="socialRelationships"
              className="w-full"
            >
              <SelectValue placeholder="Select social relationships (optional)" />
            </SelectTrigger>
            <SelectContent>
              {SOCIAL_RELATIONSHIP_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {SOCIAL_RELATIONSHIP_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isFieldSet("socialRelationships") && (
            <Check
              className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: SUCCESS_COLOR }}
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {/* Optional fields note */}
      <p className="text-xs text-muted-foreground italic">
        All fields on this page are optional. You can skip any that don&apos;t apply.
      </p>
    </div>
  );
}

Page2DailyLifeImpact.displayName = "Page2DailyLifeImpact";
