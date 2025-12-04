/**
 * ChildInfoForm component for collecting child demographic information
 *
 * Renders a form with child's name, date of birth, pronouns, grade, and primary concerns.
 * Uses React Hook Form with Zod validation. Validates on blur per AC-3.2.11.
 * Pre-populates primary concerns from assessment summary per AC-3.2.9.
 */
"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronLeft, Loader2 } from "lucide-react";

import { cn, scrollToFirstError } from "@/lib/utils";
import { SyncErrorBanner } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAutoSave } from "@/hooks/useAutoSave";
import {
  childInfoSchema,
  childInfoDefaults,
  PRONOUN_OPTIONS,
  PRONOUN_LABELS,
  GRADE_OPTIONS,
  GRADE_LABELS,
  type ChildInfoInput,
} from "@/lib/validations/demographics";
import {
  getDefaultCalendarDate,
  getMinBirthDate,
  getMaxBirthDate,
} from "@/lib/utils/age-validation";
import { useDemographicsSave } from "./useDemographicsSave";

/**
 * Props for ChildInfoForm component
 * @param sessionId - Current onboarding session ID for auto-save
 * @param initialData - Optional pre-filled form data (for resume sessions)
 * @param assessmentSummary - Pre-populated primary concerns from assessment
 * @param onContinue - Callback fired when form is submitted successfully
 * @param onBack - Callback fired when back button is clicked
 * @param onFormChange - Callback fired when form data changes (for parent state sync)
 */
export interface ChildInfoFormProps {
  sessionId: string;
  initialData?: Partial<ChildInfoInput>;
  assessmentSummary?: string;
  onContinue?: (data: ChildInfoInput) => void;
  onBack?: () => void;
  onFormChange?: (data: Partial<ChildInfoInput>) => void;
}

/**
 * Error color from Daybreak design tokens (AC-3.2.11)
 */
const ERROR_COLOR = "#E85D5D";

/**
 * Success color from Daybreak design tokens (AC-3.2.12)
 */
const SUCCESS_COLOR = "#10B981";

/**
 * Renders child information collection form
 *
 * Visual specs:
 * - Single-column layout, max-width 640px
 * - Labels above inputs with required asterisk indicator
 * - Error messages in red (#E85D5D) below fields
 * - Green checkmark for valid fields
 * - Primary teal Continue button, secondary Back button
 * - Mobile-first responsive design
 *
 * Form fields:
 * - First Name (required, 2-50 chars)
 * - Date of Birth (required, calendar picker, 10-19 years)
 * - Pronouns (optional, with "Other" custom input)
 * - Grade (optional, select dropdown)
 * - Primary Concerns (required, pre-filled from assessment)
 *
 * @example
 * <ChildInfoForm
 *   sessionId="sess_123"
 *   assessmentSummary="Child is experiencing anxiety..."
 *   onContinue={(data) => router.push('/insurance')}
 *   onBack={() => router.back()}
 * />
 */
export function ChildInfoForm({
  sessionId,
  initialData,
  assessmentSummary = "",
  onContinue,
  onBack,
  onFormChange,
}: ChildInfoFormProps) {
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  // Merge defaults with initial data and assessment summary
  const defaultValues = React.useMemo(() => ({
    ...childInfoDefaults,
    ...initialData,
    primaryConcerns: initialData?.primaryConcerns || assessmentSummary || "",
  }), [initialData, assessmentSummary]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    trigger,
    setValue,
    getFieldState,
    formState: { errors, isValid, touchedFields, dirtyFields },
  } = useForm<ChildInfoInput>({
    resolver: zodResolver(childInfoSchema),
    defaultValues,
    mode: "onChange", // Validate in real-time as user types
  });

  // Watch form values for auto-save and conditional rendering
  const formValues = watch();
  const selectedPronouns = watch("pronouns");

  // Form ref for scrolling to errors
  const formRef = React.useRef<HTMLFormElement>(null);

  // Auto-save integration (AC-3.2.16)
  const { save, saveStatus } = useAutoSave({
    sessionId,
    onSaveSuccess: () => {
      // Optional: show toast notification
    },
  });

  // Backend sync for persisting data on Continue
  const {
    saveChildInfo,
    childSaveStatus,
    error: syncError,
    clearError: clearSyncError,
  } = useDemographicsSave({ sessionId });

  /**
   * Handles blur event for auto-save
   * Saves valid form data on field blur and notifies parent of changes
   */
  const handleFieldBlur = React.useCallback(
    async (fieldName: keyof ChildInfoInput) => {
      // Trigger validation for the field
      await trigger(fieldName);

      // Prepare data for saving (with ISO date string)
      const dataToSave = {
        ...formValues,
        dateOfBirth: formValues.dateOfBirth?.toISOString(),
      };

      // Auto-save current form state
      // Save nested under 'child' key to match useStorageSync expectations
      save({ child: dataToSave });

      // Notify parent component of form changes for completion summary
      onFormChange?.(formValues);
    },
    [trigger, save, formValues, onFormChange]
  );

  /**
   * Handles Continue button click
   * 1. Clears any previous sync errors
   * 2. Validates all form fields
   * 3. If invalid, scrolls to first error
   * 4. If valid, syncs to backend
   * 5. If sync succeeds, calls onContinue
   */
  const handleContinueClick = React.useCallback(async () => {
    // Clear previous errors
    clearSyncError();

    // Trigger full form validation
    const isFormValid = await trigger();

    if (!isFormValid) {
      scrollToFirstError(formRef.current);
      return;
    }

    // Prepare data for backend (with ISO date string)
    const submissionData = {
      firstName: formValues.firstName,
      lastName: "", // Not collected in this form
      dateOfBirth: formValues.dateOfBirth
        ? format(formValues.dateOfBirth, "yyyy-MM-dd")
        : "",
      gender: formValues.pronouns || undefined,
      grade: formValues.grade || undefined,
      primaryConcerns: formValues.primaryConcerns || undefined,
    };

    // Sync to backend
    const result = await saveChildInfo(submissionData);

    if (result.success) {
      onContinue?.(formValues);
    }
    // If sync fails, error will be displayed via syncError state
  }, [trigger, formValues, saveChildInfo, clearSyncError, onContinue]);

  /**
   * Handles form submission (prevents default, calls handleContinueClick)
   */
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleContinueClick();
  };

  /**
   * Checks if a field is valid and touched (for checkmark display)
   */
  const isFieldValid = (fieldName: keyof ChildInfoInput): boolean => {
    const state = getFieldState(fieldName);
    return Boolean(
      (touchedFields[fieldName] || dirtyFields[fieldName]) &&
      !state.invalid &&
      formValues[fieldName]
    );
  };

  // Date constraints for calendar (AC-3.2.5)
  const minDate = getMinBirthDate();
  const maxDate = getMaxBirthDate();
  const defaultMonth = getDefaultCalendarDate();

  // Check if syncing
  const isSyncing = childSaveStatus === "saving";

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="w-full max-w-[640px] mx-auto space-y-6"
      noValidate
    >
      {/* Sync Error Banner */}
      <SyncErrorBanner
        error={syncError}
        onDismiss={clearSyncError}
        onRetry={handleContinueClick}
      />

      {/* First Name Field (AC-3.2.2) */}
      <div className="space-y-2">
        <Label htmlFor="firstName" className="flex items-center gap-1">
          Child&apos;s First Name <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="firstName"
            type="text"
            autoComplete="given-name"
            aria-required="true"
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
            className={cn("pr-10", errors.firstName && "border-destructive")}
            {...register("firstName", {
              onBlur: () => handleFieldBlur("firstName"),
            })}
          />
          {isFieldValid("firstName") && (
            <Check
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: SUCCESS_COLOR }}
              aria-hidden="true"
            />
          )}
        </div>
        {errors.firstName && (
          <p
            id="firstName-error"
            className="text-sm"
            style={{ color: ERROR_COLOR }}
            role="alert"
          >
            {errors.firstName.message}
          </p>
        )}
      </div>

      {/* Date of Birth Field (AC-3.2.3, AC-3.2.4, AC-3.2.5) */}
      <div className="space-y-2">
        <Label htmlFor="dateOfBirth" className="flex items-center gap-1">
          Date of Birth <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="dateOfBirth"
          control={control}
          render={({ field }) => (
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="dateOfBirth"
                  variant="outline"
                  role="combobox"
                  aria-required="true"
                  aria-invalid={!!errors.dateOfBirth}
                  aria-describedby={
                    errors.dateOfBirth ? "dateOfBirth-error" : undefined
                  }
                  aria-expanded={calendarOpen}
                  className={cn(
                    "w-full justify-start text-left font-normal pr-10",
                    !field.value && "text-muted-foreground",
                    errors.dateOfBirth && "border-destructive"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? (
                    format(field.value, "MM/dd/yyyy")
                  ) : (
                    <span>Select date of birth</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date);
                    setCalendarOpen(false);
                    // Trigger validation and auto-save
                    setTimeout(() => handleFieldBlur("dateOfBirth"), 0);
                  }}
                  defaultMonth={field.value || defaultMonth}
                  disabled={(date) => date > maxDate || date < minDate}
                  fromDate={minDate}
                  toDate={maxDate}
                  showDropdowns
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        />
        {isFieldValid("dateOfBirth") && !calendarOpen && (
          <div className="relative">
            <Check
              className="absolute right-3 -top-10 h-4 w-4"
              style={{ color: SUCCESS_COLOR }}
              aria-hidden="true"
            />
          </div>
        )}
        {errors.dateOfBirth && (
          <p
            id="dateOfBirth-error"
            className="text-sm"
            style={{ color: ERROR_COLOR }}
            role="alert"
          >
            {errors.dateOfBirth.message}
          </p>
        )}
      </div>

      {/* Pronouns Field (AC-3.2.6, AC-3.2.7) */}
      <div className="space-y-2">
        <Label htmlFor="pronouns" className="flex items-center gap-1">
          Preferred Pronouns{" "}
          <span className="text-muted-foreground text-sm">(optional)</span>
        </Label>
        <Controller
          name="pronouns"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value || ""}
              onValueChange={(value) => {
                field.onChange(value as (typeof PRONOUN_OPTIONS)[number]);
                // Clear custom pronouns if not "other"
                if (value !== "other") {
                  setValue("pronounsCustom", "");
                }
                setTimeout(() => handleFieldBlur("pronouns"), 0);
              }}
            >
              <SelectTrigger
                id="pronouns"
                className={cn("w-full", errors.pronouns && "border-destructive")}
              >
                <SelectValue placeholder="Select pronouns" />
              </SelectTrigger>
              <SelectContent>
                {PRONOUN_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {PRONOUN_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        {/* Custom Pronouns Input (AC-3.2.7) */}
        {selectedPronouns === "other" && (
          <div className="mt-2">
            <Input
              id="pronounsCustom"
              type="text"
              placeholder="Enter custom pronouns"
              aria-label="Custom pronouns"
              className={cn(errors.pronounsCustom && "border-destructive")}
              {...register("pronounsCustom", {
                onBlur: () => handleFieldBlur("pronounsCustom"),
              })}
            />
            {errors.pronounsCustom && (
              <p
                className="text-sm mt-1"
                style={{ color: ERROR_COLOR }}
                role="alert"
              >
                {errors.pronounsCustom.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Grade Field (AC-3.2.8) */}
      <div className="space-y-2">
        <Label htmlFor="grade" className="flex items-center gap-1">
          Current Grade{" "}
          <span className="text-muted-foreground text-sm">(optional)</span>
        </Label>
        <Controller
          name="grade"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value || ""}
              onValueChange={(value) => {
                field.onChange(value as (typeof GRADE_OPTIONS)[number]);
                setTimeout(() => handleFieldBlur("grade"), 0);
              }}
            >
              <SelectTrigger
                id="grade"
                className={cn("w-full", errors.grade && "border-destructive")}
              >
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {GRADE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {GRADE_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Primary Concerns Field (AC-3.2.9, AC-3.2.10) */}
      <div className="space-y-2">
        <Label htmlFor="primaryConcerns" className="flex items-center gap-1">
          Primary Concerns <span className="text-destructive">*</span>
        </Label>
        <p className="text-sm text-muted-foreground">
          Review and edit what we learned from your conversation
        </p>
        <div className="relative">
          <Textarea
            id="primaryConcerns"
            rows={4}
            aria-required="true"
            aria-invalid={!!errors.primaryConcerns}
            aria-describedby={
              errors.primaryConcerns ? "primaryConcerns-error" : undefined
            }
            className={cn(
              "min-h-[120px] resize-y",
              errors.primaryConcerns && "border-destructive"
            )}
            {...register("primaryConcerns", {
              onBlur: () => handleFieldBlur("primaryConcerns"),
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
        {errors.primaryConcerns && (
          <p
            id="primaryConcerns-error"
            className="text-sm"
            style={{ color: ERROR_COLOR }}
            role="alert"
          >
            {errors.primaryConcerns.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground text-right">
          {formValues.primaryConcerns?.length || 0} / 2000 characters
        </p>
      </div>

      {/* Action buttons (AC-3.2.13, AC-3.2.14, AC-3.2.17) */}
      <div className="pt-4">
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          {/* Back button (AC-3.2.17) */}
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full sm:w-auto"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          {/* Continue button - validates and syncs on click */}
          <Button
            type="submit"
            disabled={isSyncing}
            className={cn(
              "w-full sm:flex-1",
              "bg-daybreak-teal hover:bg-daybreak-teal/90 text-white"
            )}
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Continue"
            )}
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
            <p className="text-xs" style={{ color: ERROR_COLOR }}>
              Failed to save. Please try again.
            </p>
          )}
        </div>
      </div>
    </form>
  );
}

ChildInfoForm.displayName = "ChildInfoForm";
