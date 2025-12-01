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
import { Check, ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";
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
} from "@/lib/utils/formatters";

/**
 * Props for ParentInfoForm component
 * @param sessionId - Current onboarding session ID for auto-save
 * @param initialData - Optional pre-filled form data (for resume sessions)
 * @param onContinue - Callback fired when form is submitted successfully
 * @param onBack - Callback fired when back button is clicked
 */
export interface ParentInfoFormProps {
  sessionId: string;
  initialData?: Partial<ParentInfoInput>;
  onContinue?: (data: ParentInfoInput) => void;
  onBack?: () => void;
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
}: ParentInfoFormProps) {
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
    defaultValues: { ...parentInfoDefaults, ...initialData },
    mode: "onBlur", // AC-3.1.7: Validate on blur, not keystroke
  });

  // Watch form values for auto-save
  const formValues = watch();

  // Auto-save integration (AC-3.1.14)
  const { save, saveStatus } = useAutoSave({
    sessionId,
    onSaveSuccess: () => {
      // Optional: show toast notification
    },
  });

  /**
   * Handles blur event for auto-save
   * Saves valid form data on field blur
   */
  const handleFieldBlur = React.useCallback(
    async (fieldName: keyof ParentInfoInput) => {
      // Trigger validation for the field
      await trigger(fieldName);

      // Auto-save current form state (even partial data)
      // Save nested under 'parent' key to match useStorageSync expectations
      save({
        parent: {
          ...formValues,
          // Convert phone to E.164 format for storage
          phone: formValues.phone ? toE164(formValues.phone) : "",
        },
      });
    },
    [trigger, save, formValues]
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
   * Handles form submission
   * Converts phone to E.164 before passing to callback
   */
  const onSubmit = (data: ParentInfoInput) => {
    const submissionData = {
      ...data,
      phone: toE164(data.phone),
    };
    onContinue?.(submissionData);
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-[640px] mx-auto space-y-6"
      noValidate
    >
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

      {/* Save status indicator */}
      {saveStatus === "saving" && (
        <p className="text-xs text-muted-foreground text-center">
          Saving...
        </p>
      )}
      {saveStatus === "saved" && (
        <p className="text-xs text-muted-foreground text-center">
          All changes saved
        </p>
      )}
      {saveStatus === "error" && (
        <p className="text-xs text-center" style={{ color: ERROR_COLOR }}>
          Failed to save. Please try again.
        </p>
      )}

      {/* Action buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
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

        {/* Continue button (AC-3.1.10, AC-3.1.15) */}
        <Button
          type="submit"
          disabled={!isValid}
          className={cn(
            "w-full sm:flex-1",
            "bg-daybreak-teal hover:bg-daybreak-teal/90 text-white"
          )}
        >
          Continue
        </Button>
      </div>
    </form>
  );
}

ParentInfoForm.displayName = "ParentInfoForm";
