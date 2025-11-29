/**
 * ChatBubble component for displaying chat messages
 *
 * Renders individual chat messages with appropriate styling based on sender type.
 * Supports AI, user, and system message variants with distinct visual treatments.
 * Includes avatar, message content, and relative timestamp display.
 */
"use client";

import * as React from "react";
import { Mountain } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils/formatters";

/**
 * Message data structure
 * Represents a single message in the conversation
 */
export interface Message {
  id: string;
  sender: "AI" | "USER" | "SYSTEM";
  content: string;
  timestamp: string; // ISO 8601 format
  suggestedReplies?: string[];
}

/**
 * Props for ChatBubble component
 * @param message - The message object containing content and metadata
 * @param variant - Visual variant matching sender type (ai, user, or system)
 * @param showAvatar - Whether to display the avatar (default: true for AI, false for others)
 * @param className - Additional CSS classes for customization
 */
export interface ChatBubbleProps {
  message: Message;
  variant?: "ai" | "user" | "system";
  showAvatar?: boolean;
  className?: string;
}

/**
 * Renders a single chat message bubble with styling based on sender type
 *
 * Visual specs:
 * - AI messages: Light teal background (#F0FDFA), left-aligned, mountain icon avatar
 * - User messages: Teal background (#2A9D8F), white text, right-aligned, no avatar
 * - System messages: Centered, muted styling
 * - Max width: 75% to maintain readability
 * - Border radius: xl (24px) for warm, friendly feel
 * - Fade-in animation on mount
 * - Relative timestamp below message
 *
 * @example
 * <ChatBubble
 *   message={aiMessage}
 *   variant="ai"
 * />
 */
export const ChatBubble = React.memo(function ChatBubble({
  message,
  variant = "ai",
  showAvatar = variant === "ai",
  className,
}: ChatBubbleProps) {
  // Determine styling based on variant
  const isAI = variant === "ai";
  const isUser = variant === "user";
  const isSystem = variant === "system";

  return (
    <div
      className={cn(
        "flex gap-2 w-full animate-fade-in",
        isUser && "flex-row-reverse",
        isSystem && "justify-center",
        className
      )}
      role="article"
      aria-label={`${variant} message: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`}
    >
      {/* Avatar - only shown for AI messages */}
      {showAvatar && isAI && (
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="bg-daybreak-teal/10">
            <Mountain
              className="h-5 w-5 text-daybreak-teal"
              aria-label="Daybreak AI"
            />
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message content container */}
      <div
        className={cn(
          "flex flex-col max-w-[75%]",
          isSystem && "max-w-full items-center"
        )}
      >
        {/* Message bubble */}
        <div
          className={cn(
            "rounded-xl px-4 py-3 break-words",
            isAI && "bg-[#F0FDFA] text-foreground",
            isUser && "bg-daybreak-teal text-white",
            isSystem && "bg-muted/50 text-muted-foreground text-center"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Timestamp */}
        {!isSystem && (
          <span
            className={cn(
              "text-xs text-muted-foreground mt-1 px-2",
              isUser && "text-right"
            )}
          >
            {formatRelativeTime(message.timestamp)}
          </span>
        )}
      </div>
    </div>
  );
});

ChatBubble.displayName = "ChatBubble";
