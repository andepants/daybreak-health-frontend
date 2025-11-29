/**
 * ChatWindow component for AI-guided assessment conversation
 *
 * Main container for the chat interface. Displays conversation history
 * with auto-scroll to newest messages and proper accessibility features.
 * Optimized for mobile-first experience with responsive desktop layout.
 */
"use client";

import * as React from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatBubble, type Message } from "./ChatBubble";
import { MessageInput } from "./MessageInput";
import { QuickReplyChips, type QuickReplyOption } from "./QuickReplyChips";
import { TypingIndicator } from "./TypingIndicator";
import { AssessmentCard, type StructuredQuestion } from "./AssessmentCard";

/**
 * Assessment display modes
 */
export type AssessmentMode = "chat" | "structured";

/**
 * Props for ChatWindow component
 * @param messages - Array of message objects to display
 * @param sessionId - Current onboarding session ID
 * @param onMessageUpdate - Optional callback fired when messages update
 * @param onSend - Callback for sending messages
 * @param onRetry - Optional callback for retrying last message when AI times out
 * @param suggestedReplies - Quick reply options to display
 * @param isAiResponding - Whether AI is currently responding
 * @param mode - Display mode: 'chat' or 'structured'
 * @param structuredQuestion - Current structured question (when mode is 'structured')
 * @param structuredProgress - Progress tracking for structured section
 * @param onStructuredAnswer - Callback for structured question answers
 * @param onStructuredBack - Callback for back navigation in structured mode
 * @param className - Additional CSS classes for customization
 */
export interface ChatWindowProps {
  messages: Message[];
  sessionId?: string; // Optional - reserved for future use with API integration
  onMessageUpdate?: () => void;
  onSend: (message: string, isQuickReply?: boolean) => void;
  onRetry?: () => void;
  suggestedReplies?: QuickReplyOption[];
  isAiResponding?: boolean;
  mode?: AssessmentMode;
  structuredQuestion?: StructuredQuestion;
  structuredProgress?: { current: number; total: number };
  onStructuredAnswer?: (answer: string) => void;
  onStructuredBack?: () => void;
  className?: string;
}

/**
 * Renders the main chat interface with message history
 *
 * Layout specs:
 * - Mobile: Full viewport height minus header (calc(100vh - 64px))
 * - Desktop: Centered with max-width 640px
 * - Auto-scrolls to newest message on update
 * - Smooth scroll behavior with momentum on mobile
 * - Messages scroll from bottom up
 *
 * Accessibility:
 * - role="log" indicates region where new information is added
 * - aria-live="polite" announces new messages without interrupting
 * - Maintains focus management on updates
 *
 * Performance:
 * - Uses React.memo on ChatBubble to prevent unnecessary re-renders
 * - Stable ref for scroll container across renders
 * - Consider virtualization if conversation exceeds 50 messages
 *
 * @example
 * <ChatWindow
 *   messages={conversationHistory}
 *   sessionId={sessionId}
 *   onMessageUpdate={handleUpdate}
 * />
 */
export function ChatWindow({
  messages,
  sessionId,
  onMessageUpdate,
  onSend,
  onRetry,
  suggestedReplies = [],
  isAiResponding = false,
  mode = "chat",
  structuredQuestion,
  structuredProgress,
  onStructuredAnswer,
  onStructuredBack,
  className,
}: ChatWindowProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const lastMessageCountRef = React.useRef(messages.length);
  const [isTyping, setIsTyping] = React.useState(false);

  /**
   * Auto-scroll to bottom when new messages arrive
   * Uses scrollIntoView for smooth scroll to newest message
   */
  React.useEffect(() => {
    if (messages.length !== lastMessageCountRef.current) {
      lastMessageCountRef.current = messages.length;

      if (scrollContainerRef.current) {
        const scrollContainer = scrollContainerRef.current;
        // Scroll to bottom with smooth behavior
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: "smooth",
        });
      }

      // Trigger optional callback
      onMessageUpdate?.();
    }
  }, [messages.length, onMessageUpdate]);

  /**
   * Handles message send from input
   * Clears typing state and forwards to parent
   */
  const handleSend = React.useCallback((message: string) => {
    setIsTyping(false);
    onSend(message, false);
  }, [onSend]);

  /**
   * Handles quick reply selection
   * Immediately sends as quick reply
   */
  const handleQuickReply = React.useCallback((value: string) => {
    // Find the label for the selected value
    const option = suggestedReplies.find((r) => r.value === value);
    if (option) {
      onSend(option.label, true);
    }
  }, [suggestedReplies, onSend]);

  return (
    <div
      className={cn(
        "flex flex-col w-full mx-auto",
        "h-[calc(100vh-4rem)]", // Full viewport minus header (64px)
        mode === "chat" && "md:max-w-[640px]", // Centered max-width on desktop in chat mode
        className
      )}
    >
      {/* Structured question mode */}
      {mode === "structured" && structuredQuestion && structuredProgress ? (
        <AssessmentCard
          question={structuredQuestion}
          currentStep={structuredProgress.current}
          totalSteps={structuredProgress.total}
          onAnswer={onStructuredAnswer || (() => {})}
          onBack={onStructuredBack}
        />
      ) : (
        <>
          {/* Chat mode - messages container */}
          <div
        ref={scrollContainerRef}
        role="log"
        aria-live="polite"
        aria-label="Chat conversation"
        className={cn(
          "flex-1 overflow-y-auto px-4 py-6",
          "scroll-smooth", // Smooth scrolling
          "overscroll-contain", // Prevent bounce on mobile
          "space-y-4" // Vertical spacing between messages
        )}
        style={{
          WebkitOverflowScrolling: "touch", // Enable momentum scrolling on iOS
        }}
      >
        {/* Messages list */}
        {messages.length > 0 ? (
          messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
              variant={
                message.sender === "AI"
                  ? "ai"
                  : message.sender === "USER"
                  ? "user"
                  : "system"
              }
            />
          ))
        ) : (
          // Empty state
          <div
            className="flex items-center justify-center h-full text-muted-foreground"
            role="status"
          >
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        )}

        {/* Typing indicator - shows when AI is responding */}
        <TypingIndicator isVisible={isAiResponding} onRetry={onRetry} />

        {/* Scroll anchor - invisible element at bottom for auto-scroll target */}
        <div aria-hidden="true" />
      </div>

      {/* Input area - fixed to bottom */}
      <div className="shrink-0">
        {/* Quick reply chips */}
        <QuickReplyChips
          options={suggestedReplies}
          onSelect={handleQuickReply}
          isVisible={suggestedReplies.length > 0 && !isTyping && !isAiResponding}
        />

        {/* Message input */}
        <MessageInput
          onSend={handleSend}
          isDisabled={isAiResponding}
        />

        {/* Form fallback link (AC-3.4.1) */}
        {sessionId && (
          <div className="px-4 pb-3 pt-1 text-center border-t border-border/50">
            <Link
              href={`/onboarding/${sessionId}/form/assessment`}
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <FileText className="h-3 w-3" />
              Prefer a traditional form? Click here
            </Link>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}

ChatWindow.displayName = "ChatWindow";
