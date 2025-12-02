/**
 * InsuranceForm component for collecting insurance information
 *
 * Renders a form with carrier dropdown, member ID, group number,
 * subscriber name, and relationship fields. Includes auto-save on blur,
 * validation, self-pay modal trigger, and OCR card upload support.
 */
"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronLeft, Search } from "lucide-react";

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
  insuranceSchema,
  insuranceDefaults,
  RELATIONSHIP_TO_SUBSCRIBER_OPTIONS,
  RELATIONSHIP_TO_SUBSCRIBER_LABELS,
  type InsuranceFormData,
} from "@/lib/validations/insurance";
import {
  INSURANCE_CARRIERS,
  filterCarriers,
  getCarrierById,
  findCarrierByName,
} from "@/lib/data/insurance-carriers";
import { SelfPayModal } from "./SelfPayModal";
import { useInsurance } from "./useInsurance";
import { InsuranceCardUpload } from "./InsuranceCardUpload";
import type { OcrExtractedData, OcrConfidenceData } from "./useInsuranceCardUpload";

/**
 * Props for InsuranceForm component
 * @param sessionId - Current onboarding session ID
 * @param parentName - Parent's full name for auto-population (AC-4.1.4)
 * @param initialData - Optional pre-filled form data
 * @param onContinue - Callback fired when form is submitted successfully
 * @param onBack - Callback fired when back button is clicked
 * @param onSelfPay - Callback fired when self-pay is selected
 */
export interface InsuranceFormProps {
  sessionId: string;
  parentName?: string;
  initialData?: Partial<InsuranceFormData>;
  onContinue?: (data: InsuranceFormData) => void;
  onBack?: () => void;
  onSelfPay?: () => void;
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
 * Renders insurance information collection form
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
 * - Triggers on blur, not keystroke (AC-4.1.5)
 * - Member ID: 5-30 alphanumeric with hyphens (AC-4.1.2)
 * - Group number: optional, max 30 alphanumeric (AC-4.1.3)
 * - Submit disabled until all fields valid (AC-4.1.7)
 *
 * Features:
 * - Searchable carrier dropdown (AC-4.1.1)
 * - Auto-populate subscriber name when "Self" selected (AC-4.1.4)
 * - Auto-save on blur with 500ms debounce (AC-4.1.8)
 * - Self-pay modal trigger (AC-4.1.6)
 *
 * Accessibility:
 * - aria-invalid on error fields
 * - aria-describedby linking errors to fields
 * - aria-required on required fields
 * - autoComplete="off" on member ID for PHI protection
 *
 * @example
 * <InsuranceForm
 *   sessionId="sess_123"
 *   parentName="Jane Doe"
 *   onContinue={(data) => router.push('/matching')}
 *   onBack={() => router.back()}
 * />
 */
export function InsuranceForm({
  sessionId,
  parentName = "",
  initialData,
  onContinue,
  onBack,
  onSelfPay,
}: InsuranceFormProps) {
  const [carrierSearch, setCarrierSearch] = React.useState("");
  const [isSelfPayOpen, setIsSelfPayOpen] = React.useState(false);
  // Show manual entry immediately if initial data is provided (e.g., from dev autofill)
  const [showManualEntry, setShowManualEntry] = React.useState(
    Boolean(initialData && Object.keys(initialData).length > 0)
  );
  const [ocrCompleted, setOcrCompleted] = React.useState(false);
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  /**
   * Show manual entry form when initial data becomes available
   * (e.g., from dev autofill or storage sync)
   */
  React.useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0 && !showManualEntry) {
      setShowManualEntry(true);
    }
  }, [initialData, showManualEntry]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    trigger,
    setValue,
    getFieldState,
    reset,
    formState: { errors, isValid, touchedFields, dirtyFields },
  } = useForm<InsuranceFormData>({
    resolver: zodResolver(insuranceSchema),
    defaultValues: { ...insuranceDefaults, ...initialData },
    mode: "onBlur", // AC-4.1.5: Validate on blur, not keystroke
  });

  // Track if we've applied initial data to avoid re-applying on every render
  const appliedInitialDataRef = React.useRef<string | null>(null);

  /**
   * Update form values when initialData changes
   * Only applies once per unique initialData to prevent infinite loops
   */
  React.useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // Create a hash of initialData to track if it's changed
      const dataHash = JSON.stringify(initialData);

      // Skip if we've already applied this exact data
      if (appliedInitialDataRef.current === dataHash) {
        return;
      }

      appliedInitialDataRef.current = dataHash;
      reset({ ...insuranceDefaults, ...initialData }, { keepDirtyValues: true });
    }
  }, [initialData, reset]);

  // Watch form values for auto-save and relationship changes
  const formValues = watch();
  const relationshipValue = watch("relationshipToSubscriber");

  // Insurance hook for submission
  const { submitInsurance, setSelfPay, isSaving } = useInsurance({
    sessionId,
    onSubmitSuccess: () => {
      onContinue?.(formValues);
    },
    onSelfPaySuccess: () => {
      setIsSelfPayOpen(false);
      onSelfPay?.();
    },
  });

  // Auto-save integration (AC-4.1.8)
  const { save, saveStatus } = useAutoSave({
    sessionId,
    onSaveSuccess: () => {
      // Optional: show toast notification
    },
  });

  /**
   * Handles OCR data extraction and auto-fills form fields
   * Maps OCR-extracted data to form fields with carrier matching
   */
  const handleOcrComplete = React.useCallback(
    (data: OcrExtractedData, confidence: OcrConfidenceData) => {
      // Auto-fill carrier if found
      if (data.payer_name) {
        const matchedCarrier = findCarrierByName(data.payer_name);
        if (matchedCarrier) {
          setValue("carrier", matchedCarrier.id, { shouldValidate: true });
        }
      }

      // Auto-fill member ID
      if (data.member_id) {
        setValue("memberId", data.member_id, { shouldValidate: true });
      }

      // Auto-fill group number
      if (data.group_number) {
        setValue("groupNumber", data.group_number, { shouldValidate: true });
      }

      // Auto-fill subscriber name
      if (data.subscriber_name) {
        setValue("subscriberName", data.subscriber_name, { shouldValidate: true });
      }

      setOcrCompleted(true);
      setShowManualEntry(true);
    },
    [setValue]
  );

  /**
   * Shows manual entry form when user skips OCR
   */
  const handleSkipOcr = React.useCallback(() => {
    setShowManualEntry(true);
  }, []);

  // Filter carriers based on search (AC-4.1.1)
  const filteredCarriers = React.useMemo(
    () => filterCarriers(carrierSearch),
    [carrierSearch]
  );

  // Get selected carrier for format hint
  const selectedCarrier = React.useMemo(
    () => getCarrierById(formValues.carrier),
    [formValues.carrier]
  );

  /**
   * Auto-populate subscriber name when "Self" selected (AC-4.1.4)
   */
  React.useEffect(() => {
    if (relationshipValue === "Self" && parentName) {
      setValue("subscriberName", parentName, { shouldValidate: true });
    }
  }, [relationshipValue, parentName, setValue]);

  /**
   * Handles blur event for auto-save with 500ms debounce (AC-4.1.8)
   */
  const handleFieldBlur = React.useCallback(
    async (fieldName: keyof InsuranceFormData) => {
      // Trigger validation for the field
      await trigger(fieldName);

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce auto-save by 500ms (AC-4.1.8)
      debounceTimerRef.current = setTimeout(() => {
        // Save the actual form data (PHI protection is handled at logging level, not storage)
        // Data is saved nested under 'insurance' key to match useStorageSync expectations
        save({
          insurance: {
            carrier: formValues.carrier,
            memberId: formValues.memberId,
            groupNumber: formValues.groupNumber || "",
            subscriberName: formValues.subscriberName,
            relationshipToSubscriber: formValues.relationshipToSubscriber,
          },
        });
        debounceTimerRef.current = null;
      }, 500);
    },
    [trigger, save, formValues]
  );

  /**
   * Cleanup debounce timer on unmount
   */
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /**
   * Handles form submission
   */
  const onSubmit = async (data: InsuranceFormData) => {
    await submitInsurance(data);
  };

  /**
   * Handles self-pay confirmation
   */
  const handleSelfPayConfirm = async () => {
    await setSelfPay();
  };

  /**
   * Checks if a field is valid and touched (for checkmark display)
   */
  const isFieldValid = (fieldName: keyof InsuranceFormData): boolean => {
    const state = getFieldState(fieldName);
    return Boolean(
      (touchedFields[fieldName] || dirtyFields[fieldName]) &&
        !state.invalid &&
        formValues[fieldName]
    );
  };

  return (
    <>
      <div className="w-full max-w-[640px] mx-auto space-y-6">
        {/* Insurance Card Upload Section */}
        {!showManualEntry && (
          <InsuranceCardUpload
            sessionId={sessionId}
            onOcrComplete={handleOcrComplete}
            onSkip={handleSkipOcr}
          />
        )}

        {/* OCR Success Banner */}
        {ocrCompleted && showManualEntry && (
          <div
            className="flex items-center gap-2 p-3 rounded-lg text-sm"
            style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}
            role="status"
          >
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>
              We&apos;ve filled in your information from your card. Please review and make any corrections below.
            </span>
          </div>
        )}

        {/* Manual Entry Form - shown after OCR or when skipped */}
        {showManualEntry && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            {/* Insurance Carrier Dropdown (AC-4.1.1) */}
        <div className="space-y-2">
          <Label htmlFor="carrier" className="flex items-center gap-1">
            Insurance Carrier <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Controller
              name="carrier"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setCarrierSearch(""); // Clear search on selection
                    setTimeout(() => handleFieldBlur("carrier"), 0);
                  }}
                >
                  <SelectTrigger
                    id="carrier"
                    aria-required="true"
                    aria-invalid={!!errors.carrier}
                    aria-describedby={errors.carrier ? "carrier-error" : undefined}
                    className={cn(
                      "w-full",
                      errors.carrier && "border-destructive"
                    )}
                  >
                    <SelectValue placeholder="Select insurance carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Search input for filtering (AC-4.1.1) */}
                    <div className="flex items-center px-2 pb-2 sticky top-0 bg-popover">
                      <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search carriers..."
                        value={carrierSearch}
                        onChange={(e) => setCarrierSearch(e.target.value)}
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {filteredCarriers.map((carrier) => (
                      <SelectItem key={carrier.id} value={carrier.id}>
                        {carrier.name}
                      </SelectItem>
                    ))}
                    {filteredCarriers.length === 0 && (
                      <div className="py-2 px-2 text-sm text-muted-foreground">
                        No carriers found
                      </div>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {isFieldValid("carrier") && (
              <Check
                className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: SUCCESS_COLOR }}
                aria-hidden="true"
              />
            )}
          </div>
          {errors.carrier && (
            <p
              id="carrier-error"
              className="text-sm"
              style={{ color: ERROR_COLOR }}
              role="alert"
            >
              {errors.carrier.message}
            </p>
          )}
          {selectedCarrier && (
            <p className="text-xs text-muted-foreground">
              Member ID format: {selectedCarrier.idFormat}
            </p>
          )}
        </div>

        {/* Member ID Field (AC-4.1.2) */}
        <div className="space-y-2">
          <Label htmlFor="memberId" className="flex items-center gap-1">
            Member ID <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="memberId"
              type="text"
              autoComplete="off" // PHI Protection: Prevent browser autofill
              aria-required="true"
              aria-invalid={!!errors.memberId}
              aria-describedby={errors.memberId ? "memberId-error" : undefined}
              className={cn("pr-10", errors.memberId && "border-destructive")}
              {...register("memberId", {
                onBlur: () => handleFieldBlur("memberId"),
              })}
            />
            {isFieldValid("memberId") && (
              <Check
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: SUCCESS_COLOR }}
                aria-hidden="true"
              />
            )}
          </div>
          {errors.memberId && (
            <p
              id="memberId-error"
              className="text-sm"
              style={{ color: ERROR_COLOR }}
              role="alert"
            >
              {errors.memberId.message}
            </p>
          )}
        </div>

        {/* Group Number Field (AC-4.1.3 - Optional) */}
        <div className="space-y-2">
          <Label htmlFor="groupNumber" className="flex items-center gap-1">
            Group Number{" "}
            <span className="text-muted-foreground text-xs">(optional)</span>
          </Label>
          <div className="relative">
            <Input
              id="groupNumber"
              type="text"
              autoComplete="off"
              aria-invalid={!!errors.groupNumber}
              aria-describedby={
                errors.groupNumber ? "groupNumber-error" : undefined
              }
              className={cn(
                "pr-10",
                errors.groupNumber && "border-destructive"
              )}
              {...register("groupNumber", {
                onBlur: () => handleFieldBlur("groupNumber"),
              })}
            />
            {isFieldValid("groupNumber") && (
              <Check
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: SUCCESS_COLOR }}
                aria-hidden="true"
              />
            )}
          </div>
          {errors.groupNumber && (
            <p
              id="groupNumber-error"
              className="text-sm"
              style={{ color: ERROR_COLOR }}
              role="alert"
            >
              {errors.groupNumber.message}
            </p>
          )}
        </div>

        {/* Relationship to Subscriber (AC-4.1.4) */}
        <div className="space-y-2">
          <Label
            htmlFor="relationshipToSubscriber"
            className="flex items-center gap-1"
          >
            Your Relationship to Policyholder{" "}
            <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Controller
              name="relationshipToSubscriber"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setTimeout(
                      () => handleFieldBlur("relationshipToSubscriber"),
                      0
                    );
                  }}
                >
                  <SelectTrigger
                    id="relationshipToSubscriber"
                    aria-required="true"
                    aria-invalid={!!errors.relationshipToSubscriber}
                    aria-describedby={
                      errors.relationshipToSubscriber
                        ? "relationshipToSubscriber-error"
                        : undefined
                    }
                    className={cn(
                      "w-full",
                      errors.relationshipToSubscriber && "border-destructive"
                    )}
                  >
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_TO_SUBSCRIBER_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {RELATIONSHIP_TO_SUBSCRIBER_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {isFieldValid("relationshipToSubscriber") && (
              <Check
                className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: SUCCESS_COLOR }}
                aria-hidden="true"
              />
            )}
          </div>
          {errors.relationshipToSubscriber && (
            <p
              id="relationshipToSubscriber-error"
              className="text-sm"
              style={{ color: ERROR_COLOR }}
              role="alert"
            >
              {errors.relationshipToSubscriber.message}
            </p>
          )}
        </div>

        {/* Subscriber Name Field (AC-4.1.4) */}
        <div className="space-y-2">
          <Label htmlFor="subscriberName" className="flex items-center gap-1">
            Name on Insurance Card <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="subscriberName"
              type="text"
              autoComplete="name"
              aria-required="true"
              aria-invalid={!!errors.subscriberName}
              aria-describedby={
                errors.subscriberName ? "subscriberName-error" : undefined
              }
              className={cn(
                "pr-10",
                errors.subscriberName && "border-destructive"
              )}
              {...register("subscriberName", {
                onBlur: () => handleFieldBlur("subscriberName"),
              })}
            />
            {isFieldValid("subscriberName") && (
              <Check
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: SUCCESS_COLOR }}
                aria-hidden="true"
              />
            )}
          </div>
          {errors.subscriberName && (
            <p
              id="subscriberName-error"
              className="text-sm"
              style={{ color: ERROR_COLOR }}
              role="alert"
            >
              {errors.subscriberName.message}
            </p>
          )}
          {relationshipValue === "Self" && parentName && (
            <p className="text-xs text-muted-foreground">
              Auto-filled from your information
            </p>
          )}
        </div>

            {/* Self-pay link (AC-4.1.6) */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSelfPayOpen(true)}
                className="text-sm text-daybreak-teal hover:text-daybreak-teal/80 underline underline-offset-2"
              >
                I don&apos;t have insurance
              </button>
            </div>

            {/* Action buttons */}
            <div className="pt-4">
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="w-full sm:w-auto"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>

                {/* Continue button (AC-4.1.7) */}
                <Button
                  type="submit"
                  disabled={!isValid || isSaving}
                  className={cn(
                    "w-full sm:flex-1",
                    "bg-daybreak-teal hover:bg-daybreak-teal/90 text-white"
                  )}
                >
                  {isSaving ? "Submitting..." : "Continue"}
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
        )}

        {/* Back button when in upload mode */}
        {!showManualEntry && (
          <div className="flex justify-start pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="w-full sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
        )}
      </div>

      {/* Self-pay modal (AC-4.1.6) */}
      <SelfPayModal
        open={isSelfPayOpen}
        onOpenChange={setIsSelfPayOpen}
        onConfirm={handleSelfPayConfirm}
        isLoading={isSaving}
      />
    </>
  );
}

InsuranceForm.displayName = "InsuranceForm";
