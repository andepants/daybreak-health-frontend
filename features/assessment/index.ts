/**
 * Assessment feature module exports
 *
 * Centralizes exports for all assessment-related components and types.
 * Provides clean import paths for consuming code.
 */

// Shared types
export type { QuickReplyOption } from "./types";

// Components
export {
  ChatWindow,
  type ChatWindowProps,
  type AssessmentMode,
} from "./ChatWindow";
export { ChatBubble, type ChatBubbleProps, type Message } from "./ChatBubble";
export { MessageInput, type MessageInputProps } from "./MessageInput";
export {
  QuickReplyChips,
  type QuickReplyChipsProps,
} from "./QuickReplyChips";
export { TypingIndicator, type TypingIndicatorProps } from "./TypingIndicator";
export {
  AssessmentCard,
  type AssessmentCardProps,
  type StructuredQuestion,
} from "./AssessmentCard";
export {
  AssessmentSummary,
  type AssessmentSummaryProps,
  type AssessmentSummaryData,
} from "./AssessmentSummary";

// Hooks
export { useAssessmentChat, type UseAssessmentChatReturn } from "./useAssessmentChat";
