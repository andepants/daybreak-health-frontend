/**
 * Age validation utilities for child information forms
 *
 * Provides accurate age calculation accounting for leap years and
 * month/day differences. Used for validating Daybreak's 10-19 age range.
 */

/**
 * Calculates exact age in years from a birth date
 *
 * Accounts for:
 * - Leap years
 * - Month differences
 * - Day differences within the same month
 *
 * @param birthDate - Date of birth
 * @returns Age in whole years (floor)
 *
 * @example
 * // If today is 2025-03-15
 * calculateAge(new Date('2012-03-15')) // 13 (birthday today)
 * calculateAge(new Date('2012-03-16')) // 12 (birthday tomorrow)
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Subtract 1 if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Validates if a birth date results in age within Daybreak's service range
 *
 * Daybreak services are for children aged 10-19 years (inclusive).
 *
 * @param birthDate - Date of birth to validate
 * @returns true if age is between 10 and 19 inclusive
 *
 * @example
 * isValidAge(new Date('2012-01-01')) // true if child is 10-19
 * isValidAge(new Date('2020-01-01')) // false (too young)
 * isValidAge(new Date('2000-01-01')) // false (too old)
 */
export function isValidAge(birthDate: Date): boolean {
  const age = calculateAge(birthDate);
  return age >= 10 && age <= 19;
}

/**
 * Returns the minimum valid birth date (19 years ago from today)
 * Child would be exactly 19 years old
 */
export function getMinBirthDate(): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 19);
  return date;
}

/**
 * Returns the maximum valid birth date (10 years ago from today)
 * Child would be exactly 10 years old
 */
export function getMaxBirthDate(): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 10);
  return date;
}

/**
 * Returns the default calendar date (~13 years ago)
 * For quick navigation when opening the date picker (AC-3.2.4)
 */
export function getDefaultCalendarDate(): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 13);
  return date;
}
