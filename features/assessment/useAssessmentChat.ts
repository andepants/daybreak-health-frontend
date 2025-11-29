/**
 * useAssessmentChat hook for managing chat message state and sending
 *
 * Handles message sending with optimistic UI updates, AI response state,
 * session storage persistence, mode switching, and structured question flow.
 * Integrates with Apollo Client for GraphQL mutations.
 */
"use client";

import * as React from "react";
import type { Message } from "./ChatBubble";
import type { QuickReplyOption } from "./types";
import type { StructuredQuestion } from "./AssessmentCard";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useOnboardingSession } from "@/hooks/useOnboardingSession";
import {
  useCompleteAssessmentMutation,
  useConfirmAssessmentSummaryMutation,
  useResetAssessmentMutation,
  type SubmitAssessmentMessageInput,
  type AssessmentSummary,
} from "@/types/graphql";

/**
 * Progress tracking for structured question sections
 * TODO: Move to GraphQL schema when backend supports this
 */
export interface StructuredProgress {
  current: number;
  total: number;
}

/**
 * Extended AI response type with additional metadata
 * TODO: Replace with actual GraphQL type when backend ready
 */
interface AIResponseWithMetadata extends Message {
  suggestedReplies?: string[];
  structuredQuestion?: StructuredQuestion | null;
  structuredProgress?: StructuredProgress | null;
}

/**
 * Mock response type for submit assessment message
 * TODO: Replace with actual GraphQL response type when backend ready
 */
interface SubmitAssessmentMessageResponse {
  message: Message;
  aiResponse: AIResponseWithMetadata;
  suggestedReplies?: QuickReplyOption[];
  structuredQuestion?: StructuredQuestion | null;
  structuredProgress?: StructuredProgress | null;
  nextQuestion?: string;
  isComplete?: boolean;
  crisisDetected?: boolean;
}

/**
 * Assessment display modes
 */
export type AssessmentMode = "chat" | "structured";

/**
 * Answer history entry for back navigation in structured sections
 */
export interface AnswerHistory {
  questionId: string;
  question: StructuredQuestion;
  answer: string;
  timestamp: string;
}

/**
 * Hook return type
 */
export interface UseAssessmentChatReturn {
  messages: Message[];
  sendMessage: (content: string, isQuickReply?: boolean) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  isAiResponding: boolean;
  suggestedReplies: QuickReplyOption[];
  error: Error | null;
  saveStatus: "idle" | "saving" | "saved" | "error";
  retrySave: () => void;
  assessmentMode: AssessmentMode;
  structuredQuestion: StructuredQuestion | null;
  structuredProgress: StructuredProgress | null;
  answerHistory: AnswerHistory[];
  goBack: () => void;
  canGoBack: boolean;
  isComplete: boolean;
  crisisDetected: boolean;
  selectOption: (value: string) => Promise<void>;
  summary: AssessmentSummary | null;
  handleConfirmSummary: () => Promise<void>;
  handleAddMore: () => void;
  handleStartOver: () => Promise<void>;
}

/**
 * Custom hook for managing assessment chat state
 *
 * Features:
 * - Optimistic UI updates for user messages
 * - AI response simulation (mock until backend ready)
 * - Session storage persistence for draft messages
 * - Quick reply handling
 * - Mode switching between chat and structured questions
 * - Back navigation in structured section
 * - Crisis detection display
 * - Completeness validation
 * - Error state management
 *
 * @param sessionId - Current onboarding session ID
 * @returns Chat state and message sending function
 *
 * @example
 * const {
 *   messages,
 *   sendMessage,
 *   assessmentMode,
 *   structuredQuestion,
 *   isComplete,
 * } = useAssessmentChat(sessionId);
 */
export function useAssessmentChat(sessionId: string): UseAssessmentChatReturn {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isAiResponding, setIsAiResponding] = React.useState(false);
  const [suggestedReplies, setSuggestedReplies] = React.useState<QuickReplyOption[]>([]);
  const [error, setError] = React.useState<Error | null>(null);
  const [assessmentMode, setAssessmentMode] = React.useState<AssessmentMode>("chat");
  const [structuredQuestion, setStructuredQuestion] = React.useState<StructuredQuestion | null>(null);
  const [structuredProgress, setStructuredProgress] = React.useState<StructuredProgress | null>(null);
  const [answerHistory, setAnswerHistory] = React.useState<AnswerHistory[]>([]);
  const [isComplete, setIsComplete] = React.useState(false);
  const [crisisDetected, setCrisisDetected] = React.useState(false);
  const [summary, setSummary] = React.useState<AssessmentSummary | null>(null);
  const aiResponseTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastUserMessageRef = React.useRef<{ content: string; isQuickReply: boolean } | null>(null);

  // GraphQL mutations for summary flow
  const [completeAssessment] = useCompleteAssessmentMutation();
  const [confirmAssessmentSummary] = useConfirmAssessmentSummaryMutation();
  const [resetAssessment] = useResetAssessmentMutation();

  // Session restoration integration
  const { session, isReturningUser } = useOnboardingSession(sessionId);

  // Auto-save integration with proper error handling
  const { save: autoSave, saveStatus, retry: retrySave } = useAutoSave({
    sessionId,
    onSaveSuccess: () => {
      if (process.env.NODE_ENV === 'development') {
        console.log("Chat state saved");
      }
    },
    onSaveError: (err) => {
      console.error("Failed to save chat state:", err);
      setError(err);
    },
  });

  /**
   * Generates a unique message ID
   */
  const generateMessageId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Sends a message with optimistic UI update
   * Handles both chat and structured question responses
   *
   * @param content - Message content to send
   * @param isQuickReply - Whether this is a quick reply selection
   */
  const sendMessage = React.useCallback(
    async (content: string, isQuickReply = false): Promise<void> => {
      try {
        // Clear previous error on new send attempt
        setError(null);

        // Store last user message for retry functionality
        lastUserMessageRef.current = { content, isQuickReply };

        // Create user message with optimistic ID
        const userMessage: Message = {
          id: generateMessageId(),
          sender: "USER",
          content,
          timestamp: new Date().toISOString(),
        };

        // Optimistically add user message to UI
        setMessages((prev) => [...prev, userMessage]);

        // Hide suggested replies after selection
        if (isQuickReply) {
          setSuggestedReplies([]);
        }

        // Set AI responding state
        setIsAiResponding(true);

        // TODO: Replace with actual GraphQL mutation when backend is ready
        // const { data } = await submitAssessmentMessage({
        //   variables: {
        //     input: {
        //       sessionId,
        //       content,
        //       isQuickReply,
        //     },
        //   },
        // });

        // Clear any existing AI response timer
        if (aiResponseTimerRef.current) {
          clearTimeout(aiResponseTimerRef.current);
        }

        // Simulate AI response delay (500-1500ms)
        const delay = 500 + Math.random() * 1000;
        await new Promise((resolve) => {
          aiResponseTimerRef.current = setTimeout(resolve, delay);
        });

        // Mock AI response with structured question simulation
        const mockResponse: SubmitAssessmentMessageResponse = {
          message: userMessage,
          aiResponse: {
            id: generateMessageId(),
            sender: "AI",
            content: `Thank you for sharing that. Can you tell me more about how long this has been going on?`,
            timestamp: new Date().toISOString(),
            suggestedReplies: ["A few weeks", "A few months", "More than 6 months", "I'm not sure"],
          },
          nextQuestion: "duration_context",
          isComplete: false,
          crisisDetected: false,
        };

        // Process AI response
        const { aiResponse, nextQuestion, isComplete: responseComplete, crisisDetected: crisis } = mockResponse;

        // Check if response contains structured question
        if (aiResponse.structuredQuestion) {
          // Switch to structured mode
          setAssessmentMode("structured");
          setStructuredQuestion(aiResponse.structuredQuestion);

          // Set structured progress if available
          // Mock progress for now
          setStructuredProgress({ current: 1, total: 5 });
        } else {
          // Stay in chat mode
          setAssessmentMode("chat");
          setStructuredQuestion(null);

          // Add AI message
          const aiMessage: Message = {
            id: aiResponse.id,
            sender: aiResponse.sender,
            content: aiResponse.content,
            timestamp: aiResponse.timestamp,
            suggestedReplies: aiResponse.suggestedReplies,
          };

          setMessages((prev) => [...prev, aiMessage]);

          // Update suggested replies if provided
          if (aiResponse.suggestedReplies) {
            setSuggestedReplies(
              aiResponse.suggestedReplies.map((label) => ({
                label,
                value: label.toLowerCase().replace(/\s+/g, "-"),
              }))
            );
          }
        }

        // Update completeness state
        setIsComplete(responseComplete ?? false);

        // Update crisis detection state
        setCrisisDetected(crisis ?? false);

        // Auto-save after state update completes
        setMessages((prev) => {
          autoSave({ messages: prev, sessionId });
          return prev;
        });

        setIsAiResponding(false);
        aiResponseTimerRef.current = null;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to send message"));
        setIsAiResponding(false);
        aiResponseTimerRef.current = null;
        console.error("Error sending message:", err);
      }
    },
    [sessionId, autoSave]
  );

  /**
   * Handles selection of an option in structured question mode
   * Adds answer to history and sends to backend
   *
   * @param value - Selected option value
   */
  const selectOption = React.useCallback(
    async (value: string): Promise<void> => {
      if (!structuredQuestion) return;

      // Add to answer history for back navigation
      setAnswerHistory((prev) => [
        ...prev,
        {
          questionId: structuredQuestion.id,
          question: structuredQuestion,
          answer: value,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Send answer as message
      await sendMessage(value, true);

      // Simulate progression through structured section
      // In reality, backend will determine when to return to chat mode
      setStructuredProgress((prev) => {
        if (!prev) return null;

        const nextStep = prev.current + 1;

        // If completed structured section, return to chat mode
        if (nextStep > prev.total) {
          setAssessmentMode("chat");
          setStructuredQuestion(null);
          return null;
        }

        return { ...prev, current: nextStep };
      });
    },
    [structuredQuestion, sendMessage]
  );

  /**
   * Initialize with welcome message or restore session on mount
   * Handles both new sessions and returning users
   */
  React.useEffect(() => {
    if (messages.length === 0 && session) {
      // Try to restore messages from session
      const storedData = localStorage.getItem(`onboarding_session_${sessionId}`);
      let restoredMessages: Message[] | null = null;

      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          if (parsed.data?.messages && Array.isArray(parsed.data.messages)) {
            restoredMessages = parsed.data.messages;
          }
        } catch (err) {
          console.warn("Failed to restore messages from localStorage:", err);
        }
      }

      if (restoredMessages && restoredMessages.length > 0) {
        // Restore messages for returning user
        setMessages(restoredMessages);

        // Add welcome back message if this is a returning user
        if (isReturningUser) {
          const welcomeBackMessage: Message = {
            id: generateMessageId(),
            sender: "AI",
            content: "Welcome back! Let's continue where we left off.",
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, welcomeBackMessage]);
        }

        // Restore suggested replies from last AI message if available
        const lastAiMessage = restoredMessages
          .filter((msg) => msg.sender === "AI")
          .pop();
        if (lastAiMessage?.suggestedReplies) {
          setSuggestedReplies(
            lastAiMessage.suggestedReplies.map((label) => ({
              label,
              value: label.toLowerCase().replace(/\s+/g, "-"),
            }))
          );
        }
      } else {
        // New session - show personalized greeting with child name if available
        const childName = session.child?.firstName || "your child";
        const welcomeMessage: Message = {
          id: generateMessageId(),
          sender: "AI",
          content: `Hi! I'm here to help you get started with Daybreak Health. Tell me what's been going on with ${childName}.`,
          timestamp: new Date().toISOString(),
          suggestedReplies: [
            "They've been struggling lately",
            "I want to explore therapy options",
            "I'm just looking",
          ],
        };

        setMessages([welcomeMessage]);
        setSuggestedReplies(
          welcomeMessage.suggestedReplies!.map((label) => ({
            label,
            value: label.toLowerCase().replace(/\s+/g, "-"),
          }))
        );
      }
    }
  }, [messages.length, session, sessionId, isReturningUser]);

  /**
   * Cleanup timers on unmount to prevent memory leaks
   */
  React.useEffect(() => {
    return () => {
      if (aiResponseTimerRef.current) {
        clearTimeout(aiResponseTimerRef.current);
      }
    };
  }, []);

  /**
   * Navigates back to previous question in structured section
   * Removes last answer from history and restores previous state
   */
  const goBack = React.useCallback((): void => {
    if (answerHistory.length === 0) return;

    // Remove last answer from history
    const previousAnswers = answerHistory.slice(0, -1);
    setAnswerHistory(previousAnswers);

    // Update progress
    setStructuredProgress((prev) => {
      if (!prev || prev.current <= 1) return prev;
      return { ...prev, current: prev.current - 1 };
    });

    // Restore previous question
    if (previousAnswers.length > 0) {
      const previousAnswer = previousAnswers[previousAnswers.length - 1];
      setStructuredQuestion(previousAnswer.question);
    }

    // TODO: When backend is integrated, notify API of state change
    // await undoLastAnswer({ variables: { sessionId } });
  }, [answerHistory]);

  /**
   * Determines if back navigation is available
   */
  const canGoBack = assessmentMode === "structured" && answerHistory.length > 0;

  /**
   * Retries sending the last user message
   * Used when AI response times out or fails
   */
  const retryLastMessage = React.useCallback(async (): Promise<void> => {
    if (!lastUserMessageRef.current) {
      console.warn("No message to retry");
      return;
    }

    const { content, isQuickReply } = lastUserMessageRef.current;

    // Reset AI responding state to clear timeout indicator
    setIsAiResponding(false);

    // Give a brief moment for UI to reset
    await new Promise(resolve => setTimeout(resolve, 100));

    // Resend the message
    await sendMessage(content, isQuickReply);
  }, [sendMessage]);

  /**
   * Persist draft message to sessionStorage
   * This is cleared after messages are added
   */
  React.useEffect(() => {
    const storageKey = `draft_message_${sessionId}`;
    // Clear draft after messages are added
    if (messages.length > 0) {
      sessionStorage.removeItem(storageKey);
    }
  }, [messages.length, sessionId]);

  /**
   * Trigger summary generation when assessment is complete
   * Automatically calls CompleteAssessment mutation
   */
  React.useEffect(() => {
    if (isComplete && !summary) {
      const generateSummary = async () => {
        try {
          const { data } = await completeAssessment({
            variables: { sessionId },
          });

          if (data?.completeAssessment?.summary) {
            setSummary(data.completeAssessment.summary);
          }
        } catch (err) {
          console.error("Failed to generate summary:", err);
          // For now, create a mock summary so UI can be tested
          setSummary({
            keyConcerns: [
              "Child has been feeling sad and withdrawn for the past few months",
              "Sleep has been difficult, often staying up late or waking early",
              "School performance has dropped, especially in subjects they used to enjoy",
            ],
            childName: session?.child?.firstName || "your child",
            recommendedFocus: ["Depression", "Sleep", "Academic"],
            generatedAt: new Date().toISOString(),
          });
        }
      };
      generateSummary();
    }
  }, [isComplete, summary, sessionId, completeAssessment, session?.child?.firstName]);

  /**
   * Confirms the assessment summary
   * Calls ConfirmAssessmentSummary mutation and sets flag for navigation
   */
  const handleConfirmSummary = React.useCallback(async (): Promise<void> => {
    try {
      await confirmAssessmentSummary({
        variables: {
          sessionId,
          confirmed: true,
        },
      });
      // Navigation is handled by AssessmentSummary component
    } catch (err) {
      console.error("Failed to confirm summary:", err);
      setError(err instanceof Error ? err : new Error("Failed to confirm summary"));
      throw err;
    }
  }, [sessionId, confirmAssessmentSummary]);

  /**
   * Returns to chat mode to add more information
   * Sends AI prompt asking what else they'd like to share
   */
  const handleAddMore = React.useCallback((): void => {
    // Reset completion state to allow more conversation
    setIsComplete(false);
    setSummary(null);

    // Add AI message prompting for more information
    const addMoreMessage: Message = {
      id: generateMessageId(),
      sender: "AI",
      content: "Of course! What else would you like to share?",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, addMoreMessage]);
  }, []);

  /**
   * Resets the assessment to start from the beginning
   * Calls ResetAssessment mutation and clears local state
   */
  const handleStartOver = React.useCallback(async (): Promise<void> => {
    try {
      await resetAssessment({
        variables: { sessionId },
      });

      // Clear all local state
      setMessages([]);
      setSuggestedReplies([]);
      setIsComplete(false);
      setSummary(null);
      setCrisisDetected(false);
      setAssessmentMode("chat");
      setStructuredQuestion(null);
      setStructuredProgress(null);
      setAnswerHistory([]);

      // Clear localStorage
      localStorage.removeItem(`onboarding_session_${sessionId}`);
      sessionStorage.removeItem(`draft_message_${sessionId}`);

      // The useEffect will re-initialize with welcome message
    } catch (err) {
      console.error("Failed to reset assessment:", err);
      setError(err instanceof Error ? err : new Error("Failed to reset assessment"));
      throw err;
    }
  }, [sessionId, resetAssessment]);

  return {
    messages,
    sendMessage,
    retryLastMessage,
    isAiResponding,
    suggestedReplies,
    error,
    saveStatus,
    retrySave,
    assessmentMode,
    structuredQuestion,
    structuredProgress,
    answerHistory,
    goBack,
    canGoBack,
    isComplete,
    crisisDetected,
    selectOption,
    summary,
    handleConfirmSummary,
    handleAddMore,
    handleStartOver,
  };
}
