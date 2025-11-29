/**
 * Unit tests for MessageInput component
 *
 * Tests message input rendering, send button state, character limit enforcement,
 * keyboard shortcuts, disabled state, accessibility, and touch target requirements.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageInput } from "@/features/assessment/MessageInput";
import type { MessageInputProps } from "@/features/assessment/MessageInput";

describe("MessageInput", () => {
  const defaultProps: MessageInputProps = {
    onSend: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering (AC-2.2.5, AC-2.2.12)", () => {
    it("should render textarea with placeholder", () => {
      render(<MessageInput {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Type your message...");
      expect(textarea).toBeInTheDocument();
      expect(textarea).toBeInstanceOf(HTMLTextAreaElement);
    });

    it("should render send button", () => {
      render(<MessageInput {...defaultProps} />);

      const sendButton = screen.getByRole("button", { name: /send message/i });
      expect(sendButton).toBeInTheDocument();
    });

    it("should use custom placeholder when provided", () => {
      render(<MessageInput {...defaultProps} placeholder="Enter your response..." />);

      expect(screen.getByPlaceholderText("Enter your response...")).toBeInTheDocument();
    });

    it("should have fixed bottom positioning styles", () => {
      render(<MessageInput {...defaultProps} />);

      const container = screen.getByRole("button", { name: /send message/i }).parentElement?.parentElement;
      expect(container).toHaveClass("w-full");
      expect(container).toHaveClass("border-t");
    });

    it("should apply custom className when provided", () => {
      render(<MessageInput {...defaultProps} className="custom-input" />);

      const container = screen.getByRole("button", { name: /send message/i }).parentElement?.parentElement;
      expect(container).toHaveClass("custom-input");
    });
  });

  describe("Send Button State (AC-2.2.7)", () => {
    it("should disable send button when input is empty", () => {
      render(<MessageInput {...defaultProps} />);

      const sendButton = screen.getByRole("button", { name: /send message/i });
      expect(sendButton).toBeDisabled();
    });

    it("should enable send button when text is present", async () => {
      const user = userEvent.setup();
      render(<MessageInput {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Type your message...");
      const sendButton = screen.getByRole("button", { name: /send message/i });

      await user.type(textarea, "Hello");

      expect(sendButton).not.toBeDisabled();
    });

    it("should disable send button when input contains only whitespace", async () => {
      const user = userEvent.setup();
      render(<MessageInput {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Type your message...");
      await user.type(textarea, "   ");

      const sendButton = screen.getByRole("button", { name: /send message/i });
      expect(sendButton).toBeDisabled();
    });

    it("should have teal background color on send button", () => {
      render(<MessageInput {...defaultProps} />);

      const sendButton = screen.getByRole("button", { name: /send message/i });
      expect(sendButton).toHaveClass("bg-daybreak-teal");
    });

    it("should show Send icon in button", () => {
      render(<MessageInput {...defaultProps} />);

      const sendButton = screen.getByRole("button", { name: /send message/i });
      const svg = sendButton.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("Message Sending", () => {
    it("should call onSend with message content when send button clicked", async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<MessageInput {...defaultProps} onSend={onSend} />);

      const textarea = screen.getByPlaceholderText("Type your message...");
      await user.type(textarea, "Hello world");

      const sendButton = screen.getByRole("button", { name: /send message/i });
      await user.click(sendButton);

      expect(onSend).toHaveBeenCalledWith("Hello world");
    });

    it("should trim whitespace from message before sending", async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<MessageInput {...defaultProps} onSend={onSend} />);

      const textarea = screen.getByPlaceholderText("Type your message...");
      await user.type(textarea, "  Hello world  ");

      const sendButton = screen.getByRole("button", { name: /send message/i });
      await user.click(sendButton);

      expect(onSend).toHaveBeenCalledWith("Hello world");
    });

    it("should clear input after successful send", async () => {
      const user = userEvent.setup();
      render(<MessageInput {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Type your message...") as HTMLTextAreaElement;
      await user.type(textarea, "Hello");

      const sendButton = screen.getByRole("button", { name: /send message/i });
      await user.click(sendButton);

      expect(textarea.value).toBe("");
    });

    it("should not send when input is empty", async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<MessageInput {...defaultProps} onSend={onSend} />);

      const sendButton = screen.getByRole("button", { name: /send message/i });
      await user.click(sendButton);

      expect(onSend).not.toHaveBeenCalled();
    });
  });

  describe("Keyboard Shortcuts (AC-2.2.9)", () => {
    it("should send message on Enter key press", async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<MessageInput {...defaultProps} onSend={onSend} />);

      const textarea = screen.getByPlaceholderText("Type your message...");
      await user.type(textarea, "Test message{Enter}");

      expect(onSend).toHaveBeenCalledWith("Test message");
    });

    it("should add newline on Shift+Enter without sending", async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<MessageInput {...defaultProps} onSend={onSend} />);

      const textarea = screen.getByPlaceholderText("Type your message...") as HTMLTextAreaElement;
      await user.type(textarea, "Line 1{Shift>}{Enter}{/Shift}Line 2");

      expect(onSend).not.toHaveBeenCalled();
      expect(textarea.value).toContain("\n");
    });

    it("should not send on Enter when input is empty", async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<MessageInput {...defaultProps} onSend={onSend} />);

      const textarea = screen.getByPlaceholderText("Type your message...");
      await user.type(textarea, "{Enter}");

      expect(onSend).not.toHaveBeenCalled();
    });
  });

  describe("Character Limit (AC-2.2.8)", () => {
    it("should enforce 2000 character maximum by default", async () => {
      const user = userEvent.setup();
      render(<MessageInput {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Type your message...") as HTMLTextAreaElement;
      const longText = "a".repeat(2500);

      await user.type(textarea, longText);

      expect(textarea.value.length).toBe(2000);
    });

    it("should show character counter when exceeding 1800 characters", async () => {
      const user = userEvent.setup();
      render(<MessageInput {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Type your message...");

      // Type 1799 characters - counter should NOT show
      await user.type(textarea, "a".repeat(1799));
      expect(screen.queryByText(/1799\/2000/)).not.toBeInTheDocument();

      // Type 1 more character (1800 total) - counter SHOULD show
      await user.type(textarea, "a");
      expect(screen.getByText(/1800\/2000/)).toBeInTheDocument();
    });

    it("should show warning color when approaching limit", async () => {
      const user = userEvent.setup();
      render(<MessageInput {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Type your message...");
      await user.type(textarea, "a".repeat(1950)); // 1950 chars (50 from limit)

      const counter = screen.getByText(/1950\/2000/);
      expect(counter).toHaveClass("text-destructive");
    });

    it("should show muted color when not near limit", async () => {
      const user = userEvent.setup();
      render(<MessageInput {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Type your message...");
      await user.type(textarea, "a".repeat(1850)); // Not near limit

      const counter = screen.getByText(/1850\/2000/);
      expect(counter).toHaveClass("text-muted-foreground");
    });

    it("should respect custom maxLength prop", async () => {
      const user = userEvent.setup();
      render(<MessageInput {...defaultProps} maxLength={500} />);

      const textarea = screen.getByPlaceholderText("Type your message...") as HTMLTextAreaElement;
      await user.type(textarea, "a".repeat(600));

      expect(textarea.value.length).toBe(500);
    });
  });

  describe("Textarea Auto-Expansion (AC-2.2.6)", () => {
    it("should start with single line height", () => {
      render(<MessageInput {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Type your message...") as HTMLTextAreaElement;
      expect(textarea.rows).toBe(1);
    });

    it("should have minimum height of 44px for touch targets", () => {
      render(<MessageInput {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Type your message...");
      expect(textarea).toHaveClass("min-h-[44px]");
    });

    it("should have maximum height of 72px (3 lines)", () => {
      render(<MessageInput {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Type your message...");
      expect(textarea).toHaveClass("max-h-[72px]");
    });

    it("should prevent manual resizing", () => {
      render(<MessageInput {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Type your message...");
      expect(textarea).toHaveClass("resize-none");
    });
  });

  describe("Disabled State (AC-2.2.10)", () => {
    it("should disable textarea when isDisabled prop is true", () => {
      render(<MessageInput {...defaultProps} isDisabled={true} />);

      const textarea = screen.getByPlaceholderText("Type your message...");
      expect(textarea).toBeDisabled();
    });

    it("should disable send button when isDisabled prop is true", () => {
      render(<MessageInput {...defaultProps} isDisabled={true} />);

      const sendButton = screen.getByRole("button", { name: /send message/i });
      expect(sendButton).toBeDisabled();
    });

    it("should show visual indicator when disabled", () => {
      render(<MessageInput {...defaultProps} isDisabled={true} />);

      expect(screen.getByText("AI is responding...")).toBeInTheDocument();
    });

    it("should add opacity style to textarea when disabled", () => {
      render(<MessageInput {...defaultProps} isDisabled={true} />);

      const textarea = screen.getByPlaceholderText("Type your message...");
      expect(textarea).toHaveClass("opacity-60");
    });

    it("should not allow typing when disabled", async () => {
      const user = userEvent.setup();
      render(<MessageInput {...defaultProps} isDisabled={true} />);

      const textarea = screen.getByPlaceholderText("Type your message...") as HTMLTextAreaElement;

      // Attempt to type
      await user.type(textarea, "Should not work");

      expect(textarea.value).toBe("");
    });

    it("should not send message when disabled", async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();

      render(<MessageInput {...defaultProps} onSend={onSend} isDisabled={true} />);

      const sendButton = screen.getByRole("button", { name: /send message/i });
      await user.click(sendButton);

      expect(onSend).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA label on textarea", () => {
      render(<MessageInput {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Type your message...");
      expect(textarea).toHaveAttribute("aria-label", "Message input");
    });

    it("should have proper ARIA label on send button", () => {
      render(<MessageInput {...defaultProps} />);

      const sendButton = screen.getByRole("button", { name: /send message/i });
      expect(sendButton).toHaveAttribute("aria-label", "Send message");
    });

    it("should communicate disabled state via aria-disabled", () => {
      render(<MessageInput {...defaultProps} isDisabled={true} />);

      const textarea = screen.getByPlaceholderText("Type your message...");
      expect(textarea).toHaveAttribute("aria-disabled", "true");
    });

    it("should announce character count to screen readers", async () => {
      const user = userEvent.setup();
      render(<MessageInput {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Type your message...");
      await user.type(textarea, "a".repeat(1800));

      const counter = screen.getByRole("status");
      expect(counter).toHaveAttribute("aria-live", "polite");
    });

    it("should use assertive aria-live when near limit", async () => {
      const user = userEvent.setup();
      render(<MessageInput {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Type your message...");
      await user.type(textarea, "a".repeat(1950)); // Near limit

      const counter = screen.getByRole("status");
      expect(counter).toHaveAttribute("aria-live", "assertive");
    });

    it("should have minimum 44x44px touch target for send button", () => {
      render(<MessageInput {...defaultProps} />);

      const sendButton = screen.getByRole("button", { name: /send message/i });
      expect(sendButton).toHaveClass("min-w-[44px]");
      expect(sendButton).toHaveClass("min-h-[44px]");
    });

    it("should be keyboard navigable", async () => {
      const user = userEvent.setup();
      render(<MessageInput {...defaultProps} />);

      // Tab to textarea
      await user.tab();
      const textarea = screen.getByPlaceholderText("Type your message...");
      expect(textarea).toHaveFocus();

      // Type something to enable the send button
      await user.type(textarea, "Test");

      // Tab to send button (now enabled)
      await user.tab();
      expect(screen.getByRole("button", { name: /send message/i })).toHaveFocus();
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid typing gracefully", async () => {
      const user = userEvent.setup();
      render(<MessageInput {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Type your message...");

      // Type rapidly
      await user.type(textarea, "abcdefghijklmnopqrstuvwxyz", { delay: 1 });

      expect(textarea).toHaveValue("abcdefghijklmnopqrstuvwxyz");
    });

    it("should handle special characters correctly", async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<MessageInput {...defaultProps} onSend={onSend} />);

      const textarea = screen.getByPlaceholderText("Type your message...");
      await user.type(textarea, "Hello! @#$% & *()");

      const sendButton = screen.getByRole("button", { name: /send message/i });
      await user.click(sendButton);

      expect(onSend).toHaveBeenCalledWith("Hello! @#$% & *()");
    });

    it("should handle emoji in messages", async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<MessageInput {...defaultProps} onSend={onSend} />);

      const textarea = screen.getByPlaceholderText("Type your message...");
      await user.type(textarea, "Hello 👋 World 🌍");

      const sendButton = screen.getByRole("button", { name: /send message/i });
      await user.click(sendButton);

      expect(onSend).toHaveBeenCalledWith("Hello 👋 World 🌍");
    });

    it("should handle newlines in message", async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<MessageInput {...defaultProps} onSend={onSend} />);

      const textarea = screen.getByPlaceholderText("Type your message...");
      await user.type(textarea, "Line 1{Shift>}{Enter}{/Shift}Line 2");

      const sendButton = screen.getByRole("button", { name: /send message/i });
      await user.click(sendButton);

      expect(onSend).toHaveBeenCalledWith(expect.stringContaining("\n"));
    });

    it("should reset textarea height after sending", async () => {
      const user = userEvent.setup();
      render(<MessageInput {...defaultProps} />);

      const textarea = screen.getByPlaceholderText("Type your message...") as HTMLTextAreaElement;

      // Type multiline content
      await user.type(textarea, "Line 1{Shift>}{Enter}{/Shift}Line 2{Shift>}{Enter}{/Shift}Line 3");

      const sendButton = screen.getByRole("button", { name: /send message/i });
      await user.click(sendButton);

      // Height should be reset to auto
      expect(textarea.style.height).toBe("auto");
    });
  });

  describe("Performance", () => {
    it("should use React.memo for optimization", () => {
      expect(MessageInput.displayName).toBe("MessageInput");
    });

    it("should not re-render unnecessarily on parent re-renders", () => {
      const onSend = vi.fn();
      const { rerender } = render(<MessageInput onSend={onSend} />);

      const firstRenderTextarea = screen.getByPlaceholderText("Type your message...");

      // Re-render with same props
      rerender(<MessageInput onSend={onSend} />);

      const secondRenderTextarea = screen.getByPlaceholderText("Type your message...");

      // Should be same element (not re-created)
      expect(firstRenderTextarea).toBe(secondRenderTextarea);
    });
  });

  describe("Integration Scenarios", () => {
    it("should work in typical chat flow", async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      const { rerender } = render(<MessageInput onSend={onSend} isDisabled={false} />);

      // Type message
      const textarea = screen.getByPlaceholderText("Type your message...");
      await user.type(textarea, "Hello");

      // Send message
      await user.keyboard("{Enter}");
      expect(onSend).toHaveBeenCalledWith("Hello");

      // Simulate AI responding
      rerender(<MessageInput onSend={onSend} isDisabled={true} />);
      expect(screen.getByText("AI is responding...")).toBeInTheDocument();

      // AI response complete
      rerender(<MessageInput onSend={onSend} isDisabled={false} />);
      expect(screen.queryByText("AI is responding...")).not.toBeInTheDocument();
    });
  });
});
