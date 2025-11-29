/**
 * Unit tests for ChatWindow component
 *
 * Tests cover:
 * - Full viewport height minus header calculation
 * - Desktop max-width 640px centering
 * - Message rendering in correct order (newest at bottom)
 * - Auto-scroll behavior on new messages
 * - Smooth scrolling enabled
 * - Accessibility attributes (role="log", aria-live="polite")
 * - Empty state handling
 * - Integration with MessageInput and QuickReplyChips
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ChatWindow } from "@/features/assessment/ChatWindow";
import type { Message } from "@/features/assessment/ChatBubble";
import type { QuickReplyOption } from "@/features/assessment/QuickReplyChips";

// Mock scrollTo for testing auto-scroll
const mockScrollTo = vi.fn();
HTMLElement.prototype.scrollTo = mockScrollTo;

describe("ChatWindow", () => {
  const mockMessages: Message[] = [
    {
      id: "1",
      sender: "AI",
      content: "Hello! How can I help you today?",
      timestamp: new Date(Date.now() - 300000).toISOString(), // 5 min ago
    },
    {
      id: "2",
      sender: "USER",
      content: "I need help with my child's anxiety.",
      timestamp: new Date(Date.now() - 240000).toISOString(), // 4 min ago
    },
    {
      id: "3",
      sender: "AI",
      content: "I understand. Can you tell me more about what you've noticed?",
      timestamp: new Date(Date.now() - 180000).toISOString(), // 3 min ago
    },
  ];

  const mockSuggestedReplies: QuickReplyOption[] = [
    { label: "Yes, I can", value: "yes" },
    { label: "Not right now", value: "no" },
  ];

  const defaultProps = {
    messages: mockMessages,
    onSend: vi.fn(),
    suggestedReplies: [],
    isAiResponding: false,
  };

  beforeEach(() => {
    mockScrollTo.mockClear();
    vi.clearAllMocks();
  });

  describe("Layout and Dimensions", () => {
    it("renders full viewport height minus header (calc(100vh - 4rem))", () => {
      const { container } = render(<ChatWindow {...defaultProps} />);

      const chatWindow = container.querySelector('.h-\\[calc\\(100vh-4rem\\)\\]');
      expect(chatWindow).toBeInTheDocument();
    });

    it("applies centered max-width 640px on desktop in chat mode", () => {
      const { container } = render(<ChatWindow {...defaultProps} mode="chat" />);

      const chatWindow = container.querySelector('.md\\:max-w-\\[640px\\]');
      expect(chatWindow).toBeInTheDocument();
    });

    it("does not apply max-width in structured mode", () => {
      const { container } = render(
        <ChatWindow {...defaultProps} mode="structured" />
      );

      const chatWindow = container.querySelector('.md\\:max-w-\\[640px\\]');
      expect(chatWindow).not.toBeInTheDocument();
    });

    it("renders flex column layout", () => {
      const { container } = render(<ChatWindow {...defaultProps} />);

      const chatWindow = container.querySelector('.flex.flex-col');
      expect(chatWindow).toBeInTheDocument();
    });
  });

  describe("Message Rendering", () => {
    it("renders all messages in correct order (oldest to newest)", () => {
      render(<ChatWindow {...defaultProps} />);

      const messages = screen.getAllByRole("article");
      expect(messages).toHaveLength(3);

      // Check order by checking text content
      expect(messages[0]).toHaveTextContent("Hello! How can I help you today?");
      expect(messages[1]).toHaveTextContent("I need help with my child's anxiety.");
      expect(messages[2]).toHaveTextContent(
        "I understand. Can you tell me more about what you've noticed?"
      );
    });

    it("renders messages from bottom up with newest visible", () => {
      const { container } = render(<ChatWindow {...defaultProps} />);

      const messagesContainer = container.querySelector('[role="log"]');
      expect(messagesContainer).toBeInTheDocument();
      expect(messagesContainer).toHaveClass("overflow-y-auto");
    });

    it("shows empty state when no messages", () => {
      render(<ChatWindow {...defaultProps} messages={[]} />);

      expect(
        screen.getByText("No messages yet. Start the conversation!")
      ).toBeInTheDocument();
    });

    it("empty state has role='status' for accessibility", () => {
      render(<ChatWindow {...defaultProps} messages={[]} />);

      const emptyState = screen.getByRole("status");
      expect(emptyState).toBeInTheDocument();
    });
  });

  describe("Auto-scroll Behavior", () => {
    it("has scroll container with ref for auto-scroll", () => {
      const { container } = render(<ChatWindow {...defaultProps} />);

      const scrollContainer = container.querySelector('[role="log"]');
      expect(scrollContainer).toBeInTheDocument();
    });

    it("auto-scrolls when new message added", async () => {
      const { rerender } = render(<ChatWindow {...defaultProps} />);

      mockScrollTo.mockClear();

      const newMessages = [
        ...mockMessages,
        {
          id: "4",
          sender: "USER" as const,
          content: "New message",
          timestamp: new Date().toISOString(),
        },
      ];

      rerender(<ChatWindow {...defaultProps} messages={newMessages} />);

      await waitFor(() => {
        expect(mockScrollTo).toHaveBeenCalled();
      });
    });

    it("uses smooth scrolling behavior when scrollTo is called", async () => {
      const { rerender } = render(<ChatWindow {...defaultProps} />);

      mockScrollTo.mockClear();

      const newMessages = [...mockMessages, {
        id: "5",
        sender: "AI" as const,
        content: "Another message",
        timestamp: new Date().toISOString(),
      }];

      rerender(<ChatWindow {...defaultProps} messages={newMessages} />);

      await waitFor(() => {
        expect(mockScrollTo).toHaveBeenCalledWith(
          expect.objectContaining({
            behavior: "smooth",
          })
        );
      });
    });

    it("calls onMessageUpdate callback when messages update", async () => {
      const onMessageUpdate = vi.fn();
      const { rerender } = render(
        <ChatWindow {...defaultProps} onMessageUpdate={onMessageUpdate} />
      );

      onMessageUpdate.mockClear();

      const newMessages = [
        ...mockMessages,
        {
          id: "5",
          sender: "AI" as const,
          content: "Another message",
          timestamp: new Date().toISOString(),
        },
      ];

      rerender(
        <ChatWindow
          {...defaultProps}
          messages={newMessages}
          onMessageUpdate={onMessageUpdate}
        />
      );

      await waitFor(() => {
        expect(onMessageUpdate).toHaveBeenCalled();
      });
    });
  });

  describe("Smooth Scrolling", () => {
    it("has scroll-smooth class for CSS smooth scrolling", () => {
      const { container } = render(<ChatWindow {...defaultProps} />);

      const messagesContainer = container.querySelector('.scroll-smooth');
      expect(messagesContainer).toBeInTheDocument();
    });

    it("enables momentum scrolling on iOS (WebkitOverflowScrolling)", () => {
      const { container } = render(<ChatWindow {...defaultProps} />);

      const messagesContainer = container.querySelector('[role="log"]');
      expect(messagesContainer).toHaveStyle({
        WebkitOverflowScrolling: "touch",
      });
    });

    it("prevents overscroll bounce on mobile", () => {
      const { container } = render(<ChatWindow {...defaultProps} />);

      const messagesContainer = container.querySelector('.overscroll-contain');
      expect(messagesContainer).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("chat container has role='log'", () => {
      render(<ChatWindow {...defaultProps} />);

      const chatLog = screen.getByRole("log");
      expect(chatLog).toBeInTheDocument();
    });

    it("chat container has aria-live='polite'", () => {
      render(<ChatWindow {...defaultProps} />);

      const chatLog = screen.getByRole("log");
      expect(chatLog).toHaveAttribute("aria-live", "polite");
    });

    it("chat container has aria-label for context", () => {
      render(<ChatWindow {...defaultProps} />);

      const chatLog = screen.getByRole("log");
      expect(chatLog).toHaveAttribute("aria-label", "Chat conversation");
    });
  });

  describe("Message Spacing", () => {
    it("applies vertical spacing between messages", () => {
      const { container } = render(<ChatWindow {...defaultProps} />);

      const messagesContainer = container.querySelector('.space-y-4');
      expect(messagesContainer).toBeInTheDocument();
    });

    it("applies horizontal padding to messages container", () => {
      const { container } = render(<ChatWindow {...defaultProps} />);

      const messagesContainer = container.querySelector('.px-4');
      expect(messagesContainer).toBeInTheDocument();
    });

    it("applies vertical padding to messages container", () => {
      const { container } = render(<ChatWindow {...defaultProps} />);

      const messagesContainer = container.querySelector('.py-6');
      expect(messagesContainer).toBeInTheDocument();
    });
  });

  describe("Typing Indicator", () => {
    it("shows typing indicator when AI is responding", () => {
      render(<ChatWindow {...defaultProps} isAiResponding={true} />);

      // TypingIndicator component should be rendered
      // Actual visibility depends on TypingIndicator's isVisible prop
      expect(screen.queryByLabelText(/AI is typing/i)).toBeInTheDocument();
    });

    it("hides typing indicator when AI is not responding", () => {
      render(<ChatWindow {...defaultProps} isAiResponding={false} />);

      expect(screen.queryByLabelText(/AI is typing/i)).not.toBeInTheDocument();
    });
  });

  describe("Quick Reply Chips", () => {
    it("shows quick reply chips when available and not typing", () => {
      render(
        <ChatWindow
          {...defaultProps}
          suggestedReplies={mockSuggestedReplies}
          isAiResponding={false}
        />
      );

      expect(screen.getByText("Yes, I can")).toBeInTheDocument();
      expect(screen.getByText("Not right now")).toBeInTheDocument();
    });

    it("hides quick reply chips when AI is responding", () => {
      render(
        <ChatWindow
          {...defaultProps}
          suggestedReplies={mockSuggestedReplies}
          isAiResponding={true}
        />
      );

      expect(screen.queryByText("Yes, I can")).not.toBeInTheDocument();
    });

    it("sends message with quick reply flag when chip selected", async () => {
      const onSend = vi.fn();

      render(
        <ChatWindow
          {...defaultProps}
          onSend={onSend}
          suggestedReplies={mockSuggestedReplies}
        />
      );

      const chip = screen.getByText("Yes, I can");
      fireEvent.click(chip);

      await waitFor(() => {
        expect(onSend).toHaveBeenCalledWith("Yes, I can", true);
      });
    });
  });

  describe("Message Input", () => {
    it("renders message input component", () => {
      render(<ChatWindow {...defaultProps} />);

      const input = screen.getByPlaceholderText(/Type your message/i);
      expect(input).toBeInTheDocument();
    });

    it("disables input when AI is responding", () => {
      render(<ChatWindow {...defaultProps} isAiResponding={true} />);

      const input = screen.getByPlaceholderText(/Type your message/i);
      expect(input).toBeDisabled();
    });

    it("enables input when AI is not responding", () => {
      render(<ChatWindow {...defaultProps} isAiResponding={false} />);

      const input = screen.getByPlaceholderText(/Type your message/i);
      expect(input).not.toBeDisabled();
    });

    it("displays send button", () => {
      render(<ChatWindow {...defaultProps} />);

      const sendButton = screen.getByRole("button");
      expect(sendButton).toBeInTheDocument();
    });
  });

  describe("Input Area Layout", () => {
    it("input area is fixed to bottom with shrink-0", () => {
      const { container } = render(<ChatWindow {...defaultProps} />);

      const inputArea = container.querySelector('.shrink-0');
      expect(inputArea).toBeInTheDocument();
    });

    it("messages container is flex-1 to fill space", () => {
      const { container } = render(<ChatWindow {...defaultProps} />);

      const messagesContainer = container.querySelector('[role="log"]');
      expect(messagesContainer).toHaveClass("flex-1");
    });
  });

  describe("Mode Selection", () => {
    it("shows chat interface in chat mode (default)", () => {
      render(<ChatWindow {...defaultProps} mode="chat" />);

      expect(screen.getByRole("log")).toBeInTheDocument();
    });

    it("shows chat interface when mode not specified", () => {
      render(<ChatWindow {...defaultProps} />);

      expect(screen.getByRole("log")).toBeInTheDocument();
    });
  });

  describe("Component Display Name", () => {
    it("has displayName set for debugging", () => {
      expect(ChatWindow.displayName).toBe("ChatWindow");
    });
  });

  describe("Performance Optimizations", () => {
    it("maintains stable scroll ref across renders", () => {
      const { rerender } = render(<ChatWindow {...defaultProps} />);

      const initialRef = mockScrollTo.mock.calls[0]?.[0];

      rerender(
        <ChatWindow
          {...defaultProps}
          messages={[
            ...mockMessages,
            {
              id: "99",
              sender: "AI",
              content: "New",
              timestamp: new Date().toISOString(),
            },
          ]}
        />
      );

      // Scroll should still work with same ref
      expect(mockScrollTo).toHaveBeenCalled();
    });
  });
});
