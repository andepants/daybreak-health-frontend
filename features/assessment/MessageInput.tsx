/**
 * MessageInput component for chat message composition
 *
 * Text input with send button, character limit, and keyboard shortcuts.
 * Auto-expands up to 3 lines and provides visual feedback for all states.
 * Optimized for mobile-first with fixed bottom positioning.
 */
"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/**
 * Props for MessageInput component
 * @param onSend - Callback fired when user sends a message, receives message content
 * @param isDisabled - Whether input is disabled (e.g., while AI is responding)
 * @param placeholder - Placeholder text for input (default: "Type your message...")
 * @param maxLength - Maximum character length (default: 2000)
 * @param className - Additional CSS classes for customization
 */
export interface MessageInputProps {
  onSend: (message: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

const DEFAULT_MAX_LENGTH = 2000;
const CHARACTER_WARNING_THRESHOLD = 1800;
const LINE_HEIGHT = 24; // Base line height in px
const MAX_LINES = 3;
const MAX_HEIGHT = LINE_HEIGHT * MAX_LINES; // 72px for 3 lines

/**
 * Renders message input with send button and character counter
 *
 * Visual specs:
 * - Fixed to bottom on mobile with safe area padding
 * - Textarea auto-expands to max 3 lines
 * - Send button: Teal (#2A9D8F), 44x44px minimum touch target
 * - Character counter appears at 1800+ characters
 * - Warning state when approaching 2000 character limit
 * - Disabled state with visual opacity reduction
 *
 * Keyboard behavior:
 * - Enter: Send message (if not empty)
 * - Shift+Enter: Add newline without sending
 * - Disabled when input is empty or isDisabled prop is true
 *
 * Accessibility:
 * - aria-label on send button
 * - aria-disabled on input when disabled
 * - Character count announced to screen readers
 * - Clear focus indicators
 *
 * @example
 * <MessageInput
 *   onSend={handleSendMessage}
 *   isDisabled={isAiResponding}
 * />
 */
export const MessageInput = React.memo(function MessageInput({
  onSend,
  isDisabled = false,
  placeholder = "Type your message...",
  maxLength = DEFAULT_MAX_LENGTH,
  className,
}: MessageInputProps) {
  const [message, setMessage] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const characterCount = message.length;
  const showCharacterCount = characterCount >= CHARACTER_WARNING_THRESHOLD;
  const isNearLimit = characterCount >= maxLength - 100;
  const canSend = message.trim().length > 0 && !isDisabled;

  /**
   * Handles sending the message
   * Clears input after successful send
   */
  const handleSend = React.useCallback(() => {
    if (!canSend) return;

    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      onSend(trimmedMessage);
      setMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }, [message, canSend, onSend]);

  /**
   * Handles keyboard shortcuts
   * Enter to send, Shift+Enter for newline
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Handles textarea auto-resize up to 3 lines
   * Adjusts height based on content
   */
  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    // Enforce max length
    if (newValue.length <= maxLength) {
      setMessage(newValue);

      // Auto-resize textarea
      const textarea = e.target;
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(scrollHeight, MAX_HEIGHT)}px`;
    }
  }, [maxLength]);

  return (
    <div
      className={cn(
        "w-full border-t bg-background",
        "px-4 py-3",
        "safe-area-bottom", // iOS safe area
        className
      )}
    >
      {/* Character counter - only visible when approaching limit */}
      {showCharacterCount && (
        <div
          className={cn(
            "text-xs mb-2 text-right",
            isNearLimit ? "text-destructive" : "text-muted-foreground"
          )}
          role="status"
          aria-live={isNearLimit ? "assertive" : "polite"}
        >
          {characterCount}/{maxLength}
        </div>
      )}

      {/* Input container */}
      <div className="flex gap-2 items-end">
        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          aria-label="Message input"
          aria-disabled={isDisabled}
          className={cn(
            "min-h-[44px] max-h-[72px] resize-none",
            "rounded-xl",
            "text-sm",
            isDisabled && "opacity-60 cursor-not-allowed"
          )}
          rows={1}
        />

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className={cn(
            "min-w-[44px] min-h-[44px] shrink-0",
            "rounded-xl",
            "bg-daybreak-teal hover:bg-daybreak-teal/90",
            "text-white",
            "transition-all duration-200"
          )}
          size="icon"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* Disabled state indicator */}
      {isDisabled && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          AI is responding...
        </p>
      )}
    </div>
  );
});

MessageInput.displayName = "MessageInput";
