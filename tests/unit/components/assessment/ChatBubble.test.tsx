/**
 * Unit tests for ChatBubble component
 *
 * Tests cover:
 * - AI message rendering with correct styles and avatar
 * - User message rendering with correct styles (right-aligned, no avatar)
 * - System message rendering (centered, muted)
 * - Timestamp display with relative time format
 * - Fade-in animation
 * - Max-width constraint (75%)
 * - Accessibility attributes
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatBubble, type Message } from "@/features/assessment/ChatBubble";

describe("ChatBubble", () => {
  const mockAIMessage: Message = {
    id: "1",
    sender: "AI",
    content: "Hello! How can I help you today?",
    timestamp: new Date(Date.now() - 120000).toISOString(), // 2 min ago
  };

  const mockUserMessage: Message = {
    id: "2",
    sender: "USER",
    content: "I need help with my child's anxiety.",
    timestamp: new Date(Date.now() - 60000).toISOString(), // 1 min ago
  };

  const mockSystemMessage: Message = {
    id: "3",
    sender: "SYSTEM",
    content: "Assessment saved successfully",
    timestamp: new Date(Date.now() - 30000).toISOString(), // 30 sec ago
  };

  describe("AI message variant", () => {
    it("renders AI message with light teal background (#F0FDFA)", () => {
      const { container } = render(
        <ChatBubble message={mockAIMessage} variant="ai" />
      );

      const bubble = container.querySelector('[class*="bg-[#F0FDFA]"]');
      expect(bubble).toBeInTheDocument();
    });

    it("renders AI message left-aligned", () => {
      const { container } = render(
        <ChatBubble message={mockAIMessage} variant="ai" />
      );

      const wrapper = container.querySelector('.flex');
      expect(wrapper).not.toHaveClass('flex-row-reverse');
    });

    it("shows Daybreak mountain icon avatar for AI messages", () => {
      render(<ChatBubble message={mockAIMessage} variant="ai" />);

      const avatar = screen.getByLabelText("Daybreak AI");
      expect(avatar).toBeInTheDocument();
    });

    it("avatar is 40x40px (h-10 w-10)", () => {
      const { container } = render(
        <ChatBubble message={mockAIMessage} variant="ai" />
      );

      const avatar = container.querySelector('.h-10.w-10');
      expect(avatar).toBeInTheDocument();
    });

    it("displays message content", () => {
      render(<ChatBubble message={mockAIMessage} variant="ai" />);

      expect(screen.getByText(mockAIMessage.content)).toBeInTheDocument();
    });

    it("displays relative timestamp", () => {
      render(<ChatBubble message={mockAIMessage} variant="ai" />);

      expect(screen.getByText(/min ago/i)).toBeInTheDocument();
    });
  });

  describe("User message variant", () => {
    it("renders user message with teal background (#2A9D8F)", () => {
      const { container } = render(
        <ChatBubble message={mockUserMessage} variant="user" />
      );

      const bubble = container.querySelector('[class*="bg-daybreak-teal"]');
      expect(bubble).toBeInTheDocument();
    });

    it("renders user message with white text", () => {
      const { container } = render(
        <ChatBubble message={mockUserMessage} variant="user" />
      );

      const bubble = container.querySelector('[class*="text-white"]');
      expect(bubble).toBeInTheDocument();
    });

    it("renders user message right-aligned", () => {
      const { container } = render(
        <ChatBubble message={mockUserMessage} variant="user" />
      );

      const wrapper = container.querySelector('.flex-row-reverse');
      expect(wrapper).toBeInTheDocument();
    });

    it("does not show avatar for user messages", () => {
      render(<ChatBubble message={mockUserMessage} variant="user" />);

      const avatar = screen.queryByLabelText("Daybreak AI");
      expect(avatar).not.toBeInTheDocument();
    });

    it("displays message content", () => {
      render(<ChatBubble message={mockUserMessage} variant="user" />);

      expect(screen.getByText(mockUserMessage.content)).toBeInTheDocument();
    });

    it("displays relative timestamp right-aligned", () => {
      const { container } = render(
        <ChatBubble message={mockUserMessage} variant="user" />
      );

      const timestamp = screen.getByText(/min ago/i);
      expect(timestamp).toBeInTheDocument();
      expect(timestamp).toHaveClass("text-right");
    });
  });

  describe("System message variant", () => {
    it("renders system message centered", () => {
      const { container } = render(
        <ChatBubble message={mockSystemMessage} variant="system" />
      );

      const wrapper = container.querySelector('.justify-center');
      expect(wrapper).toBeInTheDocument();
    });

    it("renders system message with muted styling", () => {
      const { container } = render(
        <ChatBubble message={mockSystemMessage} variant="system" />
      );

      const bubble = container.querySelector('[class*="bg-muted"]');
      expect(bubble).toBeInTheDocument();
    });

    it("does not show timestamp for system messages", () => {
      render(<ChatBubble message={mockSystemMessage} variant="system" />);

      const timestamp = screen.queryByText(/ago/i);
      expect(timestamp).not.toBeInTheDocument();
    });
  });

  describe("Max-width constraint", () => {
    it("applies max-width 75% to AI messages", () => {
      const { container } = render(
        <ChatBubble message={mockAIMessage} variant="ai" />
      );

      const contentContainer = container.querySelector('.max-w-\\[75\\%\\]');
      expect(contentContainer).toBeInTheDocument();
    });

    it("applies max-width 75% to user messages", () => {
      const { container } = render(
        <ChatBubble message={mockUserMessage} variant="user" />
      );

      const contentContainer = container.querySelector('.max-w-\\[75\\%\\]');
      expect(contentContainer).toBeInTheDocument();
    });

    it("system messages have full width", () => {
      const { container } = render(
        <ChatBubble message={mockSystemMessage} variant="system" />
      );

      const contentContainer = container.querySelector('.max-w-full');
      expect(contentContainer).toBeInTheDocument();
    });
  });

  describe("Fade-in animation", () => {
    it("applies fade-in animation class", () => {
      const { container } = render(
        <ChatBubble message={mockAIMessage} variant="ai" />
      );

      const wrapper = container.querySelector('.animate-fade-in');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe("Border radius", () => {
    it("applies xl border radius (24px)", () => {
      const { container } = render(
        <ChatBubble message={mockAIMessage} variant="ai" />
      );

      const bubble = container.querySelector('.rounded-xl');
      expect(bubble).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has role='article' for semantic structure", () => {
      const { container } = render(
        <ChatBubble message={mockAIMessage} variant="ai" />
      );

      const article = container.querySelector('[role="article"]');
      expect(article).toBeInTheDocument();
    });

    it("has aria-label describing message content", () => {
      render(<ChatBubble message={mockAIMessage} variant="ai" />);

      const article = screen.getByRole("article");
      expect(article).toHaveAttribute("aria-label");
      expect(article.getAttribute("aria-label")).toContain("ai message");
    });

    it("truncates long messages in aria-label", () => {
      const longMessage: Message = {
        id: "4",
        sender: "AI",
        content: "A".repeat(100),
        timestamp: new Date().toISOString(),
      };

      render(<ChatBubble message={longMessage} variant="ai" />);

      const article = screen.getByRole("article");
      const ariaLabel = article.getAttribute("aria-label");
      expect(ariaLabel?.length).toBeLessThan(100);
      expect(ariaLabel).toContain("...");
    });
  });

  describe("Timestamp formatting", () => {
    it('shows "Just now" for messages less than 1 minute old', () => {
      const recentMessage: Message = {
        id: "5",
        sender: "AI",
        content: "Test",
        timestamp: new Date(Date.now() - 30000).toISOString(), // 30 sec ago
      };

      render(<ChatBubble message={recentMessage} variant="ai" />);

      expect(screen.getByText("Just now")).toBeInTheDocument();
    });

    it('shows "X min ago" for messages 1-59 minutes old', () => {
      const message: Message = {
        id: "6",
        sender: "AI",
        content: "Test",
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 min ago
      };

      render(<ChatBubble message={message} variant="ai" />);

      expect(screen.getByText("5 min ago")).toBeInTheDocument();
    });

    it('shows "X hours ago" for messages 1-23 hours old', () => {
      const message: Message = {
        id: "7",
        sender: "AI",
        content: "Test",
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      };

      render(<ChatBubble message={message} variant="ai" />);

      expect(screen.getByText("2 hours ago")).toBeInTheDocument();
    });
  });

  describe("Message content handling", () => {
    it("preserves whitespace and line breaks", () => {
      const multilineMessage: Message = {
        id: "8",
        sender: "AI",
        content: "Line 1\nLine 2\n  Indented",
        timestamp: new Date().toISOString(),
      };

      const { container } = render(
        <ChatBubble message={multilineMessage} variant="ai" />
      );

      const content = container.querySelector('.whitespace-pre-wrap');
      expect(content).toBeInTheDocument();
    });

    it("allows word breaks for long content", () => {
      const { container } = render(
        <ChatBubble message={mockAIMessage} variant="ai" />
      );

      const bubble = container.querySelector('.break-words');
      expect(bubble).toBeInTheDocument();
    });
  });

  describe("React.memo optimization", () => {
    it("has displayName set for debugging", () => {
      expect(ChatBubble.displayName).toBe("ChatBubble");
    });
  });
});
