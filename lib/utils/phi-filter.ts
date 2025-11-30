/**
 * PHI (Protected Health Information) Filtering Utility
 *
 * Provides utilities to filter out sensitive protected health information
 * before transmitting data to third-party services like Intercom.
 *
 * CRITICAL: Always use this utility before sending any user data to external services.
 *
 * PHI includes:
 * - Assessment conversation history and clinical details
 * - Date of birth and specific age information
 * - Detailed medical/mental health concerns
 * - Specific treatment history or diagnoses
 *
 * Safe to share:
 * - First names (non-unique identifiers)
 * - Email addresses (already known to third party)
 * - Session IDs (non-PHI lookup tokens)
 * - Boolean flags (assessment complete, insurance submitted)
 * - Step names (non-clinical process tracking)
 */

/**
 * List of field names that contain PHI and should be filtered
 * These fields will be removed from any object before external transmission
 */
const PHI_FIELDS = [
  'conversationHistory',
  'assessment',
  'dateOfBirth',
  'age',
  'concerns',
  'symptoms',
  'diagnosis',
  'medications',
  'treatmentHistory',
  'clinicalNotes',
  'therapistNotes',
  'assessmentDetails',
  'currentQuestion',
  'demographics', // May contain sensitive data
  'insurance', // May contain policy details
] as const;

/**
 * Filters out PHI fields from an object
 *
 * Creates a shallow copy of the input object with PHI fields removed.
 * Nested objects are handled by removing top-level PHI keys only.
 *
 * @param data - Object potentially containing PHI fields
 * @returns New object with PHI fields removed
 *
 * @example
 * ```ts
 * const userData = {
 *   firstName: 'Jane',
 *   email: 'jane@example.com',
 *   conversationHistory: [...], // PHI - will be removed
 *   dateOfBirth: '2010-05-15', // PHI - will be removed
 * };
 *
 * const safe = filterPHI(userData);
 * // { firstName: 'Jane', email: 'jane@example.com' }
 * ```
 */
export function filterPHI<T extends Record<string, unknown>>(data: T): Partial<T> {
  const filtered: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    // Skip PHI fields
    if (PHI_FIELDS.includes(key as typeof PHI_FIELDS[number])) {
      continue;
    }

    // Include non-PHI fields
    filtered[key] = value;
  }

  return filtered as Partial<T>;
}

/**
 * Checks if an object contains any PHI fields
 *
 * Useful for validation before external transmission.
 * Returns true if any PHI field is present, even if empty.
 *
 * @param data - Object to check for PHI
 * @returns True if object contains PHI fields
 *
 * @example
 * ```ts
 * const safeData = { firstName: 'Jane', email: 'jane@example.com' };
 * containsPHI(safeData); // false
 *
 * const unsafeData = { ...safeData, conversationHistory: [] };
 * containsPHI(unsafeData); // true
 * ```
 */
export function containsPHI(data: Record<string, unknown>): boolean {
  return Object.keys(data).some((key) =>
    PHI_FIELDS.includes(key as typeof PHI_FIELDS[number])
  );
}

/**
 * Validates that an object is safe for external transmission
 *
 * Throws an error if PHI is detected in the object.
 * Use this as a guard before sending data to third-party services.
 *
 * @param data - Object to validate
 * @param context - Context description for error message (e.g., 'Intercom update')
 * @throws Error if PHI is detected
 *
 * @example
 * ```ts
 * const userData = { firstName: 'Jane', email: 'jane@example.com' };
 * validateNoPHI(userData, 'Intercom update'); // Passes
 *
 * const unsafeData = { ...userData, conversationHistory: [...] };
 * validateNoPHI(unsafeData, 'Intercom update'); // Throws error
 * ```
 */
export function validateNoPHI(
  data: Record<string, unknown>,
  context: string
): void {
  if (containsPHI(data)) {
    const phiKeys = Object.keys(data).filter((key) =>
      PHI_FIELDS.includes(key as typeof PHI_FIELDS[number])
    );
    throw new Error(
      `PHI detected in ${context}: Found restricted fields [${phiKeys.join(', ')}]. ` +
      'Use filterPHI() before external transmission.'
    );
  }
}
