/**
 * Utility functions for formatting data display
 *
 * Provides formatters for timestamps, dates, numbers, phone numbers, and other
 * common display formats used throughout the Daybreak Health application.
 */

/**
 * Formats a timestamp into a relative time string
 *
 * Converts ISO 8601 timestamps into human-readable relative time strings:
 * - "Just now" for messages < 1 minute old
 * - "X min ago" for messages 1-59 minutes old
 * - "X hours ago" for messages 1-23 hours old
 * - "X days ago" for older messages
 *
 * @param timestamp - ISO 8601 formatted timestamp string
 * @returns Human-readable relative time string
 *
 * @example
 * formatRelativeTime("2025-11-29T10:00:00Z") // "2 min ago"
 * formatRelativeTime("2025-11-29T08:00:00Z") // "2 hours ago"
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const messageDate = new Date(timestamp);
  const diffInMs = now.getTime() - messageDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
}

/**
 * Formats a phone number string for display as (XXX) XXX-XXXX
 *
 * Handles partial input gracefully during typing, progressively
 * formatting as digits are entered. Only US phone numbers supported.
 *
 * @param value - Raw phone number string (may contain non-digits)
 * @returns Formatted phone number string for display
 *
 * @example
 * formatPhoneNumber("5551234567") // "(555) 123-4567"
 * formatPhoneNumber("555123")     // "(555) 123"
 * formatPhoneNumber("555")        // "(555"
 * formatPhoneNumber("")           // ""
 */
export function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, "");

  // Return empty for no input
  if (digits.length === 0) return "";

  // Format progressively based on digit count
  if (digits.length <= 3) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }
  // Cap at 10 digits for US phone numbers
  const capped = digits.slice(0, 10);
  return `(${capped.slice(0, 3)}) ${capped.slice(3, 6)}-${capped.slice(6)}`;
}

/**
 * Converts a formatted phone number to E.164 format for storage
 *
 * E.164 is the international standard format: +1XXXXXXXXXX for US numbers.
 * This format is used for backend storage and API communication.
 *
 * @param phone - Phone number in any format (formatted or raw digits)
 * @returns E.164 formatted phone number (+1XXXXXXXXXX)
 *
 * @example
 * toE164("(555) 123-4567") // "+15551234567"
 * toE164("5551234567")      // "+15551234567"
 */
export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `+1${digits}`;
}

/**
 * Converts E.164 format phone number to raw 10-digit format
 *
 * Used when loading stored phone numbers back into form fields.
 * Strips the +1 country code prefix.
 *
 * @param phone - Phone number in E.164 format (+1XXXXXXXXXX)
 * @returns Raw 10-digit phone number string
 *
 * @example
 * fromE164("+15551234567") // "5551234567"
 * fromE164("5551234567")   // "5551234567"
 */
export function fromE164(phone: string): string {
  // Remove +1 prefix if present, then extract digits
  const withoutPrefix = phone.replace(/^\+1/, "");
  return withoutPrefix.replace(/\D/g, "");
}

/**
 * Extracts raw digits from any phone format
 *
 * Utility function for validation - extracts only numeric characters.
 *
 * @param phone - Phone number in any format
 * @returns String containing only digits
 *
 * @example
 * extractPhoneDigits("(555) 123-4567") // "5551234567"
 */
export function extractPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}
