/**
 * Unit tests for GraphQL Code Generator output.
 *
 * Tests:
 * - Generated types exist
 * - Generated hooks are available
 * - Operation types match schema
 */
import { describe, it, expect } from "vitest";
import type {
  // Types
  OnboardingSession,
  Assessment,
  ChatMessage,
  User,
  Child,
  // Enum types (generated as TypeScript union types)
  OnboardingStatus,
  MessageSender,
  UserRole,
  // Input types
  StartOnboardingInput,
  SubmitAssessmentMessageInput,
} from "@/types/graphql";

import {
  // Query hooks
  useGetOnboardingSessionQuery,
  useGetOnboardingSessionLazyQuery,
  useGetCurrentUserQuery,
  // Mutation hooks
  useStartOnboardingMutation,
  useSubmitAssessmentMessageMutation,
  // Subscription hooks
  useSupportChatMessagesSubscription,
} from "@/types/graphql";

describe("GraphQL Codegen Output", () => {
  describe("Types", () => {
    it("exports OnboardingSession type", () => {
      // Type check - this will fail at compile time if type doesn't exist
      const session: Partial<OnboardingSession> = {
        id: "1",
        status: "ASSESSMENT_STARTED",
      };
      expect(session.id).toBe("1");
    });

    it("exports Assessment type", () => {
      const assessment: Partial<Assessment> = {
        id: "1",
        summary: "test",
      };
      expect(assessment.id).toBe("1");
    });

    it("exports ChatMessage type", () => {
      const message: Partial<ChatMessage> = {
        id: "1",
        content: "Hello",
        sender: "USER",
      };
      expect(message.id).toBe("1");
    });

    it("exports User type", () => {
      const user: Partial<User> = {
        id: "1",
        email: "test@example.com",
      };
      expect(user.id).toBe("1");
    });

    it("exports Child type", () => {
      const child: Partial<Child> = {
        id: "1",
        firstName: "Test",
      };
      expect(child.id).toBe("1");
    });
  });

  describe("Enums (as types)", () => {
    it("OnboardingStatus type allows valid values", () => {
      // Enums are generated as TypeScript union types
      const status: OnboardingStatus = "ASSESSMENT_STARTED";
      expect(status).toBe("ASSESSMENT_STARTED");
    });

    it("MessageSender type allows valid values", () => {
      const sender: MessageSender = "USER";
      expect(sender).toBe("USER");
    });

    it("UserRole type allows valid values", () => {
      const role: UserRole = "PARENT";
      expect(role).toBe("PARENT");
    });
  });

  describe("Input Types", () => {
    it("exports StartOnboardingInput type", () => {
      const input: StartOnboardingInput = {
        parentEmail: "test@example.com",
        childFirstName: "Test",
        childDateOfBirth: "2010-01-01",
      };
      expect(input.parentEmail).toBe("test@example.com");
    });

    it("exports SubmitAssessmentMessageInput type", () => {
      const input: SubmitAssessmentMessageInput = {
        onboardingSessionId: "1",
        messageContent: "Hello",
      };
      expect(input.onboardingSessionId).toBe("1");
    });
  });

  describe("Query Hooks", () => {
    it("exports useGetOnboardingSessionQuery", () => {
      expect(useGetOnboardingSessionQuery).toBeDefined();
      expect(typeof useGetOnboardingSessionQuery).toBe("function");
    });

    it("exports useGetOnboardingSessionLazyQuery", () => {
      expect(useGetOnboardingSessionLazyQuery).toBeDefined();
      expect(typeof useGetOnboardingSessionLazyQuery).toBe("function");
    });

    it("exports useGetCurrentUserQuery", () => {
      expect(useGetCurrentUserQuery).toBeDefined();
      expect(typeof useGetCurrentUserQuery).toBe("function");
    });
  });

  describe("Mutation Hooks", () => {
    it("exports useStartOnboardingMutation", () => {
      expect(useStartOnboardingMutation).toBeDefined();
      expect(typeof useStartOnboardingMutation).toBe("function");
    });

    it("exports useSubmitAssessmentMessageMutation", () => {
      expect(useSubmitAssessmentMessageMutation).toBeDefined();
      expect(typeof useSubmitAssessmentMessageMutation).toBe("function");
    });
  });

  describe("Subscription Hooks", () => {
    it("exports useSupportChatMessagesSubscription", () => {
      expect(useSupportChatMessagesSubscription).toBeDefined();
      expect(typeof useSupportChatMessagesSubscription).toBe("function");
    });
  });
});
