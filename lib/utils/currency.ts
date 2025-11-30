/**
 * Currency formatting utilities for cost display
 *
 * Provides functions for formatting monetary values in USD format,
 * handling cents-to-dollars conversion, and percentage formatting
 * for insurance coverage displays.
 */

/**
 * Formats a monetary amount in cents to USD currency format
 *
 * Converts cents to dollars and formats with appropriate currency symbol,
 * thousands separators, and decimal places. Handles negative values and
 * edge cases like null/undefined inputs.
 *
 * @param amountInCents - The amount in cents (e.g., 2500 for $25.00)
 * @returns Formatted currency string (e.g., "$25.00")
 *
 * @example
 * formatCurrency(2500)      // "$25.00"
 * formatCurrency(150000)    // "$1,500.00"
 * formatCurrency(0)         // "$0.00"
 * formatCurrency(null)      // "$0.00"
 * formatCurrency(undefined) // "$0.00"
 */
export function formatCurrency(amountInCents: number | null | undefined): string {
  // Handle null/undefined by returning $0.00
  if (amountInCents == null) {
    return "$0.00";
  }

  // Convert cents to dollars
  const amountInDollars = amountInCents / 100;

  // Use Intl.NumberFormat for proper currency formatting
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInDollars);
}

/**
 * Formats a percentage value for insurance coverage display
 *
 * Converts decimal percentages (0-100) to formatted string with
 * percentage symbol. Handles decimal precision and edge cases.
 *
 * @param percentage - The percentage value (e.g., 80 for 80%)
 * @returns Formatted percentage string (e.g., "80%")
 *
 * @example
 * formatPercentage(80)      // "80%"
 * formatPercentage(66.67)   // "66.67%"
 * formatPercentage(0)       // "0%"
 * formatPercentage(null)    // "0%"
 * formatPercentage(100)     // "100%"
 */
export function formatPercentage(percentage: number | null | undefined): string {
  // Handle null/undefined by returning 0%
  if (percentage == null) {
    return "0%";
  }

  // Round to 2 decimal places if needed, but drop unnecessary decimals
  const rounded = Math.round(percentage * 100) / 100;

  // Format with percentage symbol
  return `${rounded}%`;
}

/**
 * Formats a monetary amount as "per session" rate
 *
 * Convenience function that formats a cents amount and appends
 * "per session" text for cost estimation displays.
 *
 * @param amountInCents - The per-session amount in cents
 * @returns Formatted per-session rate (e.g., "$25.00 per session")
 *
 * @example
 * formatPerSessionRate(2500)  // "$25.00 per session"
 * formatPerSessionRate(0)     // "$0.00 per session"
 */
export function formatPerSessionRate(amountInCents: number | null | undefined): string {
  return `${formatCurrency(amountInCents)} per session`;
}
