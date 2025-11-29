/**
 * Shared type definitions for assessment chat feature
 *
 * Contains common interfaces and types used across assessment components
 * to ensure type consistency and prevent duplication.
 */

/**
 * Quick reply option data structure
 * Represents a single suggested response option
 */
export interface QuickReplyOption {
  label: string;
  value: string;
  icon?: string;
}
