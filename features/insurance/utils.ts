/**
 * Insurance utility functions
 *
 * Provides helper functions for insurance-related operations
 * including PHI protection utilities for member ID masking.
 */

/**
 * Masks member ID for PHI protection in UI display
 *
 * Shows only the last 4 characters of the member ID for security,
 * replacing all preceding characters with asterisks.
 *
 * Security note: This is for display purposes only. Never log
 * the full member ID to console or include in URLs.
 *
 * @param memberId - Full member ID string
 * @returns Masked member ID in format ****XXXX (last 4 visible)
 *
 * @example
 * maskMemberId("ABC123456789") // Returns "****6789"
 * maskMemberId("W123456789")   // Returns "****6789"
 * maskMemberId("AB12")         // Returns "AB12" (too short to mask)
 * maskMemberId("")             // Returns ""
 */
export function maskMemberId(memberId: string): string {
  // Handle empty or null input
  if (!memberId) {
    return "";
  }

  // If member ID is 4 characters or less, return as-is
  // (no point in masking if we'd show the whole thing)
  if (memberId.length <= 4) {
    return memberId;
  }

  // Show last 4 characters, mask the rest with asterisks
  const visibleChars = memberId.slice(-4);
  return `****${visibleChars}`;
}

/**
 * Formats verification status for display
 *
 * @param status - Verification status from API
 * @returns Human-readable status string and color class
 */
export function formatVerificationStatus(
  status: "pending" | "verified" | "failed" | "self_pay"
): { label: string; colorClass: string } {
  const statusMap = {
    pending: {
      label: "Verification Pending",
      colorClass: "text-amber-600 bg-amber-50",
    },
    verified: {
      label: "Verified",
      colorClass: "text-emerald-600 bg-emerald-50",
    },
    failed: {
      label: "Verification Failed",
      colorClass: "text-red-600 bg-red-50",
    },
    self_pay: {
      label: "Self-Pay",
      colorClass: "text-blue-600 bg-blue-50",
    },
  };

  return statusMap[status];
}
