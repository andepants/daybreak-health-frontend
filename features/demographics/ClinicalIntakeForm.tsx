/**
 * ClinicalIntakeForm component for collecting clinical intake information
 *
 * Renders a form with medications, therapy history, diagnoses, accommodations,
 * and additional information fields. All fields are optional per AC-3.3.7.
 * Uses React Hook Form with Zod validation. Auto-saves on blur per AC-3.3.10.
 *
 * @see Story 3.3: Clinical Intake Information
 */
"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Shield } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAutoSave } from "@/hooks/useAutoSave";
import {
  clinicalIntakeSchema,
  clinicalIntakeDefaults,
  PREVIOUS_THERAPY_OPTIONS,
  PREVIOUS_THERAPY_LABELS,
  DIAGNOSIS_OPTIONS,
  DIAGNOSIS_LABELS,
  SCHOOL_ACCOMMODATIONS_OPTIONS,
  SCHOOL_ACCOMMODATIONS_LABELS,
  type ClinicalIntakeInput,
} from "@/lib/validations/demographics";

/**
 * Props for ClinicalIntakeForm component
 * @param sessionId - Current onboarding session ID for auto-save
 * @param initialData - Optional pre-filled form data (for resume sessions)
 * @param onContinue - Callback fired when Continue button is clicked
 * @param onBack - Callback fired when Back button is clicked
 * @param onFormChange - Callback fired when form data changes (for parent state sync)
 */
export interface ClinicalIntakeFormProps {
  sessionId: string;
  initialData?: Partial<ClinicalIntakeInput>;
  onContinue?: (data: ClinicalIntakeInput) => void;
  onBack?: () => void;
  onFormChange?: (data: Partial<ClinicalIntakeInput>) => void;
}

/**
 * Character limit warning threshold
 * Shows warning color when character count exceeds this value (AC-3.3.12)
 */
const CHAR_WARNING_THRESHOLD = 450;

/**
 * Maximum character limit for textarea fields
 */
const CHAR_LIMIT = 500;

/**
 * Renders clinical intake information collection form
 *
 * Visual specs:
 * - Single-column layout, max-width 640px
 * - Labels above inputs with (Optional) indicator
 * - HIPAA privacy notice with shield icon (AC-3.3.9)
 * - Helper text about therapist matching (AC-3.3.8)
 * - Character counter for textareas (AC-3.3.12)
 * - Primary teal Continue button, secondary Back button
 * - Mobile-first responsive design
 *
 * Form fields (all optional per AC-3.3.7):
 * - Current Medications (textarea, 500 char limit)
 * - Previous Therapy Experience (select dropdown)
 * - Mental Health Diagnoses (multi-select checkboxes)
 * - School Accommodations (select dropdown)
 * - Additional Information (textarea, 500 char limit)
 *
 * @example
 * <ClinicalIntakeForm
 *   sessionId="sess_123"
 *   onContinue={(data) => router.push('/insurance')}
 *   onBack={() => router.back()}
 * />
 */
export function ClinicalIntakeForm({
  sessionId,
  initialData,
  onContinue,
  onBack,
  onFormChange,
}: ClinicalIntakeFormProps) {
  // Merge defaults with initial data
  const defaultValues = React.useMemo(
    () => ({
      ...clinicalIntakeDefaults,
      ...initialData,
    }),
    [initialData]
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ClinicalIntakeInput>({
    resolver: zodResolver(clinicalIntakeSchema),
    defaultValues,
    mode: "onBlur",
  });

  // Watch form values for character counter and auto-save
  const formValues = watch();

  // Auto-save integration (AC-3.3.10)
  const { save, saveStatus } = useAutoSave({
    sessionId,
  });

  /**
   * Handles blur event for auto-save
   * Saves current form state on field blur and notifies parent of changes
   */
  const handleFieldBlur = React.useCallback(
    async (fieldName: keyof ClinicalIntakeInput) => {
      await trigger(fieldName);
      // Save nested under 'clinical' key to match demographics page expectations
      save({ clinical: formValues });

      // Notify parent component of form changes for completion summary
      onFormChange?.(formValues);
    },
    [trigger, save, formValues, onFormChange]
  );

  /**
   * Handles form submission
   * Since all fields are optional, form is always valid
   */
  const onSubmit = (data: ClinicalIntakeInput) => {
    // Final save before navigation
    save({ clinical: data });
    onContinue?.(data);
  };

  /**
   * Handles checkbox change for multi-select diagnoses field
   * Updates array field value when checkbox is toggled
   */
  const handleDiagnosisChange = (
    diagnosis: (typeof DIAGNOSIS_OPTIONS)[number],
    checked: boolean,
    currentValue: (typeof DIAGNOSIS_OPTIONS)[number][] = []
  ) => {
    if (checked) {
      return [...currentValue, diagnosis];
    }
    return currentValue.filter((d) => d !== diagnosis);
  };

  /**
   * Gets character counter styling based on current count
   * Returns warning color at 450+ and destructive at 500 (AC-3.3.12)
   */
  const getCharCounterClass = (count: number): string => {
    if (count >= CHAR_LIMIT) return "text-destructive";
    if (count >= CHAR_WARNING_THRESHOLD) return "text-amber-500";
    return "text-muted-foreground";
  };

  const medicationsLength = formValues.currentMedications?.length || 0;
  const additionalInfoLength = formValues.additionalInfo?.length || 0;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-[640px] mx-auto space-y-6"
      noValidate
    >
      {/* Helper message (AC-3.3.8) */}
      <div className="rounded-lg bg-daybreak-teal/10 border border-daybreak-teal/20 p-4">
        <p className="text-sm text-foreground">
          This information helps us match with the right therapist
        </p>
      </div>

      {/* HIPAA Privacy Notice (AC-3.3.9) */}
      <div className="flex items-center gap-2 rounded-lg bg-muted/50 border p-4">
        <Shield
          className="h-5 w-5 text-daybreak-teal shrink-0"
          aria-hidden="true"
        />
        <p className="text-sm text-muted-foreground">
          Your information is protected by HIPAA
        </p>
      </div>

      {/* Current Medications Field (AC-3.3.2, AC-3.3.10, AC-3.3.12) */}
      <div className="space-y-2">
        <Label htmlFor="currentMedications" className="flex items-center gap-1">
          Current Medications{" "}
          <span className="text-muted-foreground text-sm">(Optional)</span>
        </Label>
        <Textarea
          id="currentMedications"
          placeholder="List any medications your child is currently taking..."
          aria-describedby={
            errors.currentMedications
              ? "currentMedications-error"
              : "currentMedications-hint"
          }
          aria-invalid={!!errors.currentMedications}
          className={cn(
            "min-h-[100px] resize-y",
            errors.currentMedications && "border-destructive"
          )}
          maxLength={CHAR_LIMIT}
          {...register("currentMedications", {
            onBlur: () => handleFieldBlur("currentMedications"),
          })}
        />
        <div className="flex justify-between items-center">
          {errors.currentMedications ? (
            <p
              id="currentMedications-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {errors.currentMedications.message}
            </p>
          ) : (
            <span id="currentMedications-hint" className="sr-only">
              Optional. Maximum 500 characters.
            </span>
          )}
          <p
            className={cn("text-xs ml-auto", getCharCounterClass(medicationsLength))}
            aria-live="polite"
          >
            {medicationsLength}/{CHAR_LIMIT}
          </p>
        </div>
      </div>

      {/* Previous Therapy Experience Field (AC-3.3.3, AC-3.3.10) */}
      <div className="space-y-2">
        <Label htmlFor="previousTherapy" className="flex items-center gap-1">
          Previous Therapy Experience{" "}
          <span className="text-muted-foreground text-sm">(Optional)</span>
        </Label>
        <Controller
          name="previousTherapy"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value || ""}
              onValueChange={(value) => {
                field.onChange(
                  value as (typeof PREVIOUS_THERAPY_OPTIONS)[number]
                );
                setTimeout(() => handleFieldBlur("previousTherapy"), 0);
              }}
            >
              <SelectTrigger
                id="previousTherapy"
                className={cn(
                  "w-full",
                  errors.previousTherapy && "border-destructive"
                )}
                aria-describedby={
                  errors.previousTherapy ? "previousTherapy-error" : undefined
                }
              >
                <SelectValue placeholder="Select previous therapy experience" />
              </SelectTrigger>
              <SelectContent>
                {PREVIOUS_THERAPY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {PREVIOUS_THERAPY_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.previousTherapy && (
          <p
            id="previousTherapy-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.previousTherapy.message}
          </p>
        )}
      </div>

      {/* Mental Health Diagnoses Multi-Select (AC-3.3.4, AC-3.3.10, AC-3.3.13) */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1">
          Mental Health Diagnoses{" "}
          <span className="text-muted-foreground text-sm">(Optional)</span>
        </Label>
        <p className="text-sm text-muted-foreground">
          Select any that apply to your child
        </p>
        <Controller
          name="diagnoses"
          control={control}
          render={({ field }) => (
            <div
              className="space-y-3 pt-1"
              role="group"
              aria-label="Mental health diagnoses"
            >
              {DIAGNOSIS_OPTIONS.map((diagnosis) => (
                <div
                  key={diagnosis}
                  className="flex items-center space-x-3"
                >
                  <Checkbox
                    id={`diagnosis-${diagnosis}`}
                    checked={field.value?.includes(diagnosis) || false}
                    onCheckedChange={(checked) => {
                      const newValue = handleDiagnosisChange(
                        diagnosis,
                        checked === true,
                        field.value || []
                      );
                      field.onChange(newValue);
                      setTimeout(() => handleFieldBlur("diagnoses"), 0);
                    }}
                    aria-describedby={`diagnosis-${diagnosis}-label`}
                  />
                  <Label
                    id={`diagnosis-${diagnosis}-label`}
                    htmlFor={`diagnosis-${diagnosis}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {DIAGNOSIS_LABELS[diagnosis]}
                  </Label>
                </div>
              ))}
            </div>
          )}
        />
      </div>

      {/* School Accommodations Field (AC-3.3.5, AC-3.3.10) */}
      <div className="space-y-2">
        <Label
          htmlFor="schoolAccommodations"
          className="flex items-center gap-1"
        >
          School Accommodations{" "}
          <span className="text-muted-foreground text-sm">(Optional)</span>
        </Label>
        <Controller
          name="schoolAccommodations"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value || ""}
              onValueChange={(value) => {
                field.onChange(
                  value as (typeof SCHOOL_ACCOMMODATIONS_OPTIONS)[number]
                );
                setTimeout(() => handleFieldBlur("schoolAccommodations"), 0);
              }}
            >
              <SelectTrigger
                id="schoolAccommodations"
                className={cn(
                  "w-full",
                  errors.schoolAccommodations && "border-destructive"
                )}
                aria-describedby={
                  errors.schoolAccommodations
                    ? "schoolAccommodations-error"
                    : undefined
                }
              >
                <SelectValue placeholder="Select school accommodations" />
              </SelectTrigger>
              <SelectContent>
                {SCHOOL_ACCOMMODATIONS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {SCHOOL_ACCOMMODATIONS_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.schoolAccommodations && (
          <p
            id="schoolAccommodations-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.schoolAccommodations.message}
          </p>
        )}
      </div>

      {/* Additional Information Field (AC-3.3.6, AC-3.3.10, AC-3.3.12) */}
      <div className="space-y-2">
        <Label htmlFor="additionalInfo" className="flex items-center gap-1">
          Anything else we should know?{" "}
          <span className="text-muted-foreground text-sm">(Optional)</span>
        </Label>
        <Textarea
          id="additionalInfo"
          placeholder="Share any additional information that might help us..."
          aria-describedby={
            errors.additionalInfo
              ? "additionalInfo-error"
              : "additionalInfo-hint"
          }
          aria-invalid={!!errors.additionalInfo}
          className={cn(
            "min-h-[100px] resize-y",
            errors.additionalInfo && "border-destructive"
          )}
          maxLength={CHAR_LIMIT}
          {...register("additionalInfo", {
            onBlur: () => handleFieldBlur("additionalInfo"),
          })}
        />
        <div className="flex justify-between items-center">
          {errors.additionalInfo ? (
            <p
              id="additionalInfo-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {errors.additionalInfo.message}
            </p>
          ) : (
            <span id="additionalInfo-hint" className="sr-only">
              Optional. Maximum 500 characters.
            </span>
          )}
          <p
            className={cn("text-xs ml-auto", getCharCounterClass(additionalInfoLength))}
            aria-live="polite"
          >
            {additionalInfoLength}/{CHAR_LIMIT}
          </p>
        </div>
      </div>

      {/* Action buttons (AC-3.3.11) */}
      <div className="pt-4">
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          {/* Back button */}
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full sm:w-auto"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          {/* Continue button - always enabled since all fields optional (AC-3.3.7) */}
          <Button
            type="submit"
            className={cn(
              "w-full sm:flex-1",
              "bg-daybreak-teal hover:bg-daybreak-teal/90 text-white"
            )}
          >
            Continue
          </Button>
        </div>
        {/* Save status indicator - positioned below buttons */}
        <div className="mt-3 text-center">
          {saveStatus === "saving" && (
            <p className="text-xs text-muted-foreground">Saving...</p>
          )}
          {saveStatus === "saved" && (
            <p className="text-xs text-muted-foreground">All changes saved</p>
          )}
          {saveStatus === "error" && (
            <p className="text-xs text-destructive">
              Failed to save. Please try again.
            </p>
          )}
        </div>
      </div>
    </form>
  );
}

ClinicalIntakeForm.displayName = "ClinicalIntakeForm";
