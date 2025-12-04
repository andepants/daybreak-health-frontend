/**
 * ParentInfoForm component for collecting parent/guardian contact information
 *
 * Renders a single-column form with validation, auto-save, and accessibility features.
 * Uses React Hook Form with Zod validation schema for type-safe form handling.
 * Validates on blur (not keystroke) per AC-3.1.7.
 */
"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronLeft, Loader2 } from "lucide-react";

import { cn, scrollToFirstError } from "@/lib/utils";
import { SyncErrorBanner } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAutoSave } from "@/hooks/useAutoSave";
import {
  parentInfoSchema,
  parentInfoDefaults,
  RELATIONSHIP_OPTIONS,
  RELATIONSHIP_LABELS,
  type ParentInfoInput,
} from "@/lib/validations/demographics";
import {
  formatPhoneNumber,
  extractPhoneDigits,
  toE164,
  fromE164,
} from "@/lib/utils/formatters";
import { useDemographicsSave } from "./useDemographicsSave";

/**
 * Props for ParentInfoForm component
 * @param sessionId - Current onboarding session ID for auto-save
 * @param initialData - Optional pre-filled form data (for resume sessions)
 * @param onContinue - Callback fired when form is submitted successfully
 * @param onBack - Callback fired when back button is clicked
 * @param onFormChange - Callback fired when form data changes (for parent state sync)
 */
export interface ParentInfoFormProps {
  sessionId: string;
  initialData?: Partial<ParentInfoInput>;
  onContinue?: (data: ParentInfoInput) => void;
  onBack?: () => void;
  onFormChange?: (data: Partial<ParentInfoInput>) => void;
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
 * Renders parent information collection form
 *
 * Visual specs:
 * - Single-column layout, max-width 640px
 * - Labels above inputs with required asterisk indicator
 * - Error messages in red (#E85D5D) below fields
 * - Green checkmark for valid fields
 * - Primary teal Continue button, secondary Back button
 * - Mobile-first responsive design
 *
 * Validation behavior:
 * - Triggers on blur, not keystroke (AC-3.1.7)
 * - Phone auto-formats as user types (AC-3.1.12)
 * - Submit disabled until all fields valid (AC-3.1.10)
 *
 * Accessibility:
 * - aria-invalid on error fields
 * - aria-describedby linking errors to fields
 * - aria-required on required fields
 * - Proper label associations
 * - Keyboard navigable
 *
 * @example
 * <ParentInfoForm
 *   sessionId="sess_123"
 *   onContinue={(data) => router.push('/child-info')}
 *   onBack={() => router.back()}
 * />
 */
export function ParentInfoForm({
  sessionId,
  initialData,
  onContinue,
  onBack,
  onFormChange,
}: ParentInfoFormProps) {
  // Process initialData to convert phone from E.164 format if needed
  // Also filter out empty relationshipToChild so default value isn't overwritten
  const processedInitialData = React.useMemo(() => {
    if (!initialData) return undefined;
    const processed: Partial<ParentInfoInput> = {
      ...initialData,
      // Convert E.164 phone format (+1XXXXXXXXXX) back to 10-digit format for validation
      phone: initialData.phone ? fromE164(initialData.phone) : undefined,
    };
    // Remove empty relationshipToChild to preserve default value
    if (!processed.relationshipToChild) {
      delete processed.relationshipToChild;
    }
    return processed;
  }, [initialData]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    trigger,
    setValue,
    getFieldState,
    formState: { errors, isValid, touchedFields, dirtyFields },
  } = useForm<ParentInfoInput>({
    resolver: zodResolver(parentInfoSchema),
    defaultValues: { ...parentInfoDefaults, ...processedInitialData },
    mode: "onChange", // Validate in real-time as user types
  });

  // Watch form values for auto-save
  const formValues = watch();

  // Trigger initial validation when form loads with pre-filled data
  // Without this, fields filled via initialData are never validated
  React.useEffect(() => {
    if (processedInitialData && Object.keys(processedInitialData).length > 0) {
      trigger();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Form ref for scrolling to errors
  const formRef = React.useRef<HTMLFormElement>(null);

  // Auto-save integration (AC-3.1.14)
  const { save, saveStatus } = useAutoSave({
    sessionId,
    onSaveSuccess: () => {
      // Optional: show toast notification
    },
  });

  // Auto-save default values on mount to persist relationshipToChild default
  // This ensures the default "parent" value is saved even if user never interacts with the field
  const hasSavedDefaults = React.useRef(false);
  React.useEffect(() => {
    if (!hasSavedDefaults.current && formValues.relationshipToChild) {
      hasSavedDefaults.current = true;
      // Prepare data with E.164 phone format
      const dataToSave = {
        ...formValues,
        phone: formValues.phone ? toE164(formValues.phone) : "",
      };
      // Save nested under 'parent' key to match useStorageSync expectations
      save({ parent: dataToSave });
      // Notify parent component of initial form state
      onFormChange?.(dataToSave);
    }
  }, [formValues, save, onFormChange]);

  // Backend sync for persisting data on Continue
  const {
    saveParentInfo,
    parentSaveStatus,
    error: syncError,
    clearError: clearSyncError,
  } = useDemographicsSave({ sessionId });

  /**
   * Handles blur event for auto-save
   * Saves valid form data on field blur and notifies parent of changes
   */
  const handleFieldBlur = React.useCallback(
    async (fieldName: keyof ParentInfoInput) => {
      // Trigger validation for the field
      await trigger(fieldName);

      // Prepare data with E.164 phone format
      const dataToSave = {
        ...formValues,
        // Convert phone to E.164 format for storage
        phone: formValues.phone ? toE164(formValues.phone) : "",
      };

      // Auto-save current form state (even partial data)
      // Save nested under 'parent' key to match useStorageSync expectations
      save({ parent: dataToSave });

      // Notify parent component of form changes for completion summary
      onFormChange?.(dataToSave);
    },
    [trigger, save, formValues, onFormChange]
  );

  /**
   * Handles phone input with auto-formatting
   * Formats display while maintaining raw digits for validation
   */
  const handlePhoneChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const digits = extractPhoneDigits(rawValue);
      // Store raw digits for validation, display formatted
      setValue("phone", digits, { shouldValidate: false });
    },
    [setValue]
  );

  /**
   * Gets formatted phone value for display
   */
  const displayPhone = React.useMemo(
    () => formatPhoneNumber(formValues.phone || ""),
    [formValues.phone]
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

    // Prepare data for backend
    const submissionData = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      email: formValues.email,
      phone: formValues.phone, // Will be converted to E.164 by saveParentInfo
      relationship: formValues.relationshipToChild,
      isGuardian: true, // Default to true as parent is guardian
    };

    // Sync to backend
    const result = await saveParentInfo(submissionData);

    if (result.success) {
      // Convert phone to E.164 for callback
      const callbackData = {
        ...formValues,
        phone: toE164(formValues.phone),
      };
      onContinue?.(callbackData);
    }
    // If sync fails, error will be displayed via syncError state
  }, [trigger, formValues, saveParentInfo, clearSyncError, onContinue]);

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
  const isFieldValid = (fieldName: keyof ParentInfoInput): boolean => {
    const state = getFieldState(fieldName);
    return Boolean(
      (touchedFields[fieldName] || dirtyFields[fieldName]) &&
      !state.invalid &&
      formValues[fieldName]
    );
  };

  // Check if syncing
  const isSyncing = parentSaveStatus === "saving";

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

      {/* First Name Field */}
      <div className="space-y-2">
        <Label
          htmlFor="firstName"
          className="flex items-center gap-1"
        >
          First Name <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="firstName"
            type="text"
            autoComplete="given-name"
            aria-required="true"
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
            className={cn(
              "pr-10",
              errors.firstName && "border-destructive"
            )}
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

      {/* Last Name Field */}
      <div className="space-y-2">
        <Label
          htmlFor="lastName"
          className="flex items-center gap-1"
        >
          Last Name <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="lastName"
            type="text"
            autoComplete="family-name"
            aria-required="true"
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
            className={cn(
              "pr-10",
              errors.lastName && "border-destructive"
            )}
            {...register("lastName", {
              onBlur: () => handleFieldBlur("lastName"),
            })}
          />
          {isFieldValid("lastName") && (
            <Check
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: SUCCESS_COLOR }}
              aria-hidden="true"
            />
          )}
        </div>
        {errors.lastName && (
          <p
            id="lastName-error"
            className="text-sm"
            style={{ color: ERROR_COLOR }}
            role="alert"
          >
            {errors.lastName.message}
          </p>
        )}
      </div>

      {/* Email Field (AC-3.1.11: autoComplete="email") */}
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="flex items-center gap-1"
        >
          Email <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={cn(
              "pr-10",
              errors.email && "border-destructive"
            )}
            {...register("email", {
              onBlur: () => handleFieldBlur("email"),
            })}
          />
          {isFieldValid("email") && (
            <Check
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: SUCCESS_COLOR }}
              aria-hidden="true"
            />
          )}
        </div>
        {errors.email && (
          <p
            id="email-error"
            className="text-sm"
            style={{ color: ERROR_COLOR }}
            role="alert"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Phone Field with auto-formatting (AC-3.1.12) */}
      <div className="space-y-2">
        <Label
          htmlFor="phone"
          className="flex items-center gap-1"
        >
          Phone Number <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            inputMode="numeric"
            placeholder="(555) 123-4567"
            value={displayPhone}
            onChange={handlePhoneChange}
            onBlur={() => handleFieldBlur("phone")}
            aria-required="true"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            className={cn(
              "pr-10",
              errors.phone && "border-destructive"
            )}
          />
          {isFieldValid("phone") && (
            <Check
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: SUCCESS_COLOR }}
              aria-hidden="true"
            />
          )}
        </div>
        {errors.phone && (
          <p
            id="phone-error"
            className="text-sm"
            style={{ color: ERROR_COLOR }}
            role="alert"
          >
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Relationship to Child Select (AC-3.1.6) */}
      <div className="space-y-2">
        <Label
          htmlFor="relationshipToChild"
          className="flex items-center gap-1"
        >
          Relationship to Child <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Controller
            name="relationshipToChild"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  // Trigger validation and auto-save after selection
                  setTimeout(() => handleFieldBlur("relationshipToChild"), 0);
                }}
              >
                <SelectTrigger
                  id="relationshipToChild"
                  aria-required="true"
                  aria-invalid={!!errors.relationshipToChild}
                  aria-describedby={
                    errors.relationshipToChild
                      ? "relationshipToChild-error"
                      : undefined
                  }
                  className={cn(
                    "w-full",
                    errors.relationshipToChild && "border-destructive"
                  )}
                >
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {RELATIONSHIP_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {isFieldValid("relationshipToChild") && (
            <Check
              className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: SUCCESS_COLOR }}
              aria-hidden="true"
            />
          )}
        </div>
        {errors.relationshipToChild && (
          <p
            id="relationshipToChild-error"
            className="text-sm"
            style={{ color: ERROR_COLOR }}
            role="alert"
          >
            {errors.relationshipToChild.message}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="pt-4">
        <div className="flex flex-col-reverse sm:flex-row gap-3">
        {/* Back button (AC-3.1.16) */}
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

ParentInfoForm.displayName = "ParentInfoForm";
