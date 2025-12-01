/**
 * Field Status Indicator Component
 *
 * Shows inline completion status next to form field labels.
 * Displays green checkmark for valid fields, red X for
 * incomplete required fields (only after user interaction).
 *
 * Reuses icon patterns from the matching page checklist.
 */

import { CheckCircle2, XCircle } from "lucide-react";

interface FieldStatusIndicatorProps {
  /** Whether the field has a valid value */
  isValid: boolean;
  /** Whether the field is required */
  isRequired: boolean;
  /** Whether the user has interacted with the field */
  isTouched: boolean;
  /** Whether the field has a validation error */
  hasError: boolean;
}

/**
 * Renders an inline status indicator for form fields
 *
 * Only shows status after the field has been touched to avoid
 * showing errors before the user has had a chance to fill in the field.
 *
 * @example
 * ```tsx
 * <Label className="flex items-center gap-2">
 *   Primary Concerns
 *   <span className="text-destructive">*</span>
 *   <FieldStatusIndicator
 *     isValid={isFieldValid("primaryConcerns")}
 *     isRequired={true}
 *     isTouched={touchedFields.primaryConcerns ?? false}
 *     hasError={!!errors.primaryConcerns}
 *   />
 * </Label>
 * ```
 */
export function FieldStatusIndicator({
  isValid,
  isRequired,
  isTouched,
  hasError,
}: FieldStatusIndicatorProps) {
  // Only show status after field has been touched
  if (!isTouched && !isValid) return null;

  // Valid field - show green checkmark
  if (isValid) {
    return (
      <CheckCircle2
        className="h-4 w-4 text-green-600 flex-shrink-0"
        aria-hidden="true"
      />
    );
  }

  // Invalid required field after touched - show red X
  if (hasError && isRequired) {
    return (
      <XCircle
        className="h-4 w-4 text-red-400 flex-shrink-0"
        aria-hidden="true"
      />
    );
  }

  return null;
}

export type { FieldStatusIndicatorProps };
