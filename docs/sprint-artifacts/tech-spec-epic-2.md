# Epic Technical Specification: AI-Guided Assessment Experience

Date: 2025-11-29
Author: BMad
Epic ID: 2
Status: Draft

---

## Overview

Epic 2 delivers the core value proposition of the Parent Onboarding AI: a conversational AI interface that guides worried parents through a supportive mental health screening for their children. Rather than confronting parents with clinical forms during an already stressful time, this epic transforms the intake process into an adaptive conversation that feels like "texting a supportive friend who happens to be a healthcare expert."

This epic implements the primary user-facing feature that differentiates Daybreak Health's onboarding from traditional approaches. The AI chat interface collects clinical screening information through empathetic dialogue, adapts questions based on parent responses, and generates a summary to inform therapist matching.

## Objectives and Scope

### In Scope

- **FR-001:** Conversational AI interface for mental health screening questionnaire
- **FR-002:** Adaptive questioning based on previous responses
- **FR-003:** Assessment summary generation for therapist matching
- **FR-007:** Session persistence allowing parents to resume incomplete sessions
- Chat window with message display (AI and user messages)
- Message input with quick reply chips
- AI typing indicator with timeout handling
- Assessment flow with adaptive questions
- Assessment summary generation and confirmation
- Session persistence and resume functionality
- Form-based assessment fallback (parallel route)

### Out of Scope

- Therapist matching algorithm (Epic 5)
- Insurance submission (Epic 4)
- Real-time human support chat (Epic 6)
- Backend AI/GPT-4 integration (backend repository)
- Crisis detection logic (backend responsibility, frontend shows support option)

## System Architecture Alignment

### Component Mapping

This epic aligns with the Architecture document's project structure:

| Component | Location | Purpose |
|-----------|----------|---------|
| ChatWindow | `features/assessment/ChatWindow.tsx` | Main AI chat container |
| ChatBubble | `features/assessment/ChatBubble.tsx` | AI/user message display |
| QuickReplyChips | `features/assessment/QuickReplyChips.tsx` | Tap-to-respond options |
| TypingIndicator | `features/assessment/TypingIndicator.tsx` | AI "thinking" animation |
| useAssessmentChat | `features/assessment/useAssessmentChat.ts` | Chat state + mutations |
| assessment.graphql | `features/assessment/assessment.graphql` | GraphQL operations |

### Route Structure

```
app/onboarding/[sessionId]/
├── assessment/
│   └── page.tsx                # AI chat assessment (FR-001-003)
└── form/
    ├── page.tsx               # Form flow entry
    └── assessment/
        └── page.tsx           # Traditional form assessment (fallback)
```

### Architecture Constraints

- **PHI Protection:** No console.log of message content, no PHI in URLs
- **Mobile-first:** Chat optimized for 640px max-width, full viewport height
- **Session Persistence:** Every message saves to backend immediately (optimistic UI)
- **WebSocket Dependency:** Real-time updates via Apollo subscriptions if backend supports
- **Graceful Degradation:** Form fallback available if AI chat doesn't work for user

## Detailed Design

### Services and Modules

| Module | Responsibility | Inputs | Outputs |
|--------|----------------|--------|---------|
| `ChatWindow` | Renders scrollable message list, manages auto-scroll | Session ID, messages array | Rendered chat UI |
| `ChatBubble` | Displays individual message with avatar, timestamp | Message object, variant | Styled message bubble |
| `QuickReplyChips` | Renders quick reply options, handles selection | Options array, onSelect | Selected reply |
| `TypingIndicator` | Shows AI thinking state with animated dots | isTyping boolean | Animated indicator |
| `MessageInput` | Text input with send button, handles submission | onSend callback | Message text |
| `useAssessmentChat` | Manages chat state, mutations, subscriptions | Session ID | Chat state, actions |
| `AssessmentSummary` | Displays AI-generated summary for confirmation | Summary object | Confirmation UI |

### Data Models and Contracts

```typescript
// Assessment Message
interface Message {
  id: string;
  sender: 'AI' | 'USER' | 'SYSTEM';
  content: string;
  timestamp: string;        // ISO 8601
  suggestedReplies?: string[];  // Quick reply options (AI messages only)
}

// Assessment State (in OnboardingSession)
interface AssessmentState {
  conversationHistory: Message[];
  currentQuestion?: string;
  isComplete: boolean;
  summary?: AssessmentSummary;
}

// Assessment Summary
interface AssessmentSummary {
  keyConc: string[];       // Bullet points of identified concerns
  childName: string;
  recommendedFocus: string[];
  generatedAt: string;
}

// Quick Reply Option
interface QuickReplyOption {
  label: string;
  value: string;
  icon?: string;
}
```

### APIs and Interfaces

#### GraphQL Operations

```graphql
# Query: Get current assessment state
query GetAssessmentState($sessionId: ID!) {
  getOnboardingSession(id: $sessionId) {
    id
    status
    child {
      firstName
    }
    assessment {
      conversationHistory {
        id
        sender
        content
        timestamp
        suggestedReplies
      }
      currentQuestion
      isComplete
      summary {
        keyConcerns
        childName
        recommendedFocus
        generatedAt
      }
    }
  }
}

# Mutation: Submit user message
mutation SubmitAssessmentMessage($input: MessageInput!) {
  submitAssessmentMessage(input: $input) {
    message {
      id
      sender
      content
      timestamp
    }
    aiResponse {
      id
      sender
      content
      timestamp
      suggestedReplies
    }
    nextQuestion
    isComplete
  }
}

# Mutation: Complete assessment and generate summary
mutation CompleteAssessment($sessionId: ID!) {
  completeAssessment(sessionId: $sessionId) {
    summary {
      keyConcerns
      childName
      recommendedFocus
      generatedAt
    }
  }
}

# Mutation: Confirm assessment summary
mutation ConfirmAssessmentSummary($sessionId: ID!, $confirmed: Boolean!) {
  confirmAssessmentSummary(sessionId: $sessionId, confirmed: $confirmed) {
    session {
      id
      status
      assessment {
        isComplete
      }
    }
  }
}
```

#### Input Types

```graphql
input MessageInput {
  sessionId: ID!
  content: String!
  isQuickReply: Boolean
}
```

### Workflows and Sequencing

#### Happy Path: AI Assessment Flow

```
1. User navigates to /onboarding/[sessionId]/assessment
2. useAssessmentChat loads existing messages (if any)
3. If new session:
   - AI sends greeting message with child name (if known)
   - Quick replies appear: "Tell me what's been going on"
4. User sends message (text or quick reply)
   - Optimistic UI shows user message immediately
   - TypingIndicator appears
   - submitAssessmentMessage mutation fires
5. AI response arrives (1-3s typically)
   - Message appears with fade-in animation
   - Quick replies update based on context
6. Loop steps 4-5 until assessment complete
7. AI generates summary
   - Summary card displays
   - Confirmation options shown
8. User confirms summary
   - Navigate to /onboarding/[sessionId]/demographics
```

#### Timeout Handling Flow

```
1. User sends message
2. TypingIndicator appears
3. If no response after 5s:
   - Show "Still thinking..." text
4. If no response after 15s:
   - Show "Taking longer than usual..."
   - Display retry button
5. If retry clicked:
   - Resend last message
   - Reset timeout
```

#### Session Resume Flow

```
1. User returns to /onboarding/[sessionId]/assessment
2. useAssessmentChat fetches existing session
3. If messages exist:
   - Display all previous messages
   - AI sends "Welcome back! Let's continue..." message
   - User can continue where they left off
4. If no messages:
   - Start fresh with greeting
```

## Non-Functional Requirements

### Performance

| Metric | Target | Implementation |
|--------|--------|----------------|
| Message render time | < 100ms | React.memo on ChatBubble, virtualization if > 50 messages |
| Auto-scroll latency | < 50ms | useRef with scrollIntoView |
| AI response display | Immediate after receipt | Optimistic UI pattern |
| Initial load (LCP) | < 1.5s | Code split chat components |
| Bundle contribution | < 30KB gzipped | Tree-shake unused code |

### Security

| Requirement | Implementation |
|-------------|----------------|
| No PHI in logs | Use `phiGuard` utility for any logging |
| No PHI in URLs | Session ID only in URL, no message content |
| No PHI in history | Use `router.replace()` not `push()` for sensitive routes |
| Secure transmission | All mutations over HTTPS |
| Form autofill | Disable with `autoComplete="off"` for medical content |

### Reliability/Availability

| Scenario | Handling |
|----------|----------|
| Network disconnect | Show "Connection lost" toast, auto-reconnect with backoff |
| API timeout | Show retry option after 15s |
| Message send failure | Keep in input, show error, allow retry |
| Session recovery | All messages persisted, resume from any device |
| AI service down | Offer form fallback with prominent link |

### Observability

| Signal | Implementation |
|--------|----------------|
| Message send success/failure | Apollo mutation response handling |
| AI response time | Track time between send and response |
| Session abandonment | Track via session status changes |
| Quick reply usage | Track which options selected |
| Error rates | Error boundary catches + toast notifications |

## Dependencies and Integrations

### Package Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@apollo/client` | ^4.0.0 | GraphQL client, cache management |
| `@apollo/client-integration-nextjs` | latest | App Router integration |
| `react-hook-form` | ^7.x | Form handling (for fallback forms) |
| `zod` | ^3.23 | Schema validation |
| `clsx` | ^2.x | Conditional className joining |

### Integration Points

| Integration | Protocol | Notes |
|-------------|----------|-------|
| Backend GraphQL | HTTP POST | Queries and mutations |
| AI Service | Via Backend | Frontend doesn't call AI directly |
| Session Storage | Apollo Cache | Normalized session state |
| Browser localStorage | Direct | Session ID backup for recovery |

### Component Dependencies

| This Epic Needs | From |
|-----------------|------|
| Apollo Client configured | Epic 1 (Story 1.4) |
| GraphQL Codegen working | Epic 1 (Story 1.5) |
| Onboarding layout | Epic 1 (Story 1.3) |
| Design tokens | Epic 1 (Story 1.2) |
| shadcn/ui components | Epic 1 (Story 1.1) |

## Acceptance Criteria (Authoritative)

### AC-2.1: Chat Window and Message Display
1. Chat window renders full viewport height minus header on mobile
2. Chat window is centered with max-width 640px on desktop
3. Messages scroll from bottom up with newest visible
4. Auto-scroll to newest message on update
5. AI messages display with light teal background (#F0FDFA), left-aligned
6. User messages display with teal background (#2A9D8F), white text, right-aligned
7. Each message shows relative timestamp ("Just now", "2 min ago")
8. Messages have smooth fade-in animation on appear
9. Screen reader announces new messages with `aria-live="polite"`

### AC-2.2: Message Input and Quick Reply Chips
1. Quick reply chips appear as horizontal scrollable row
2. Tapping chip sends immediately and disappears
3. Text input fixed to bottom on mobile
4. Textarea expands to 3 lines max
5. Send button enabled only when text present
6. 2000 character limit with counter at 1800+
7. Enter sends, Shift+Enter adds newline
8. Input disabled while AI is responding
9. Touch targets minimum 44x44px

### AC-2.3: AI Typing Indicator
1. Typing indicator appears within 200ms of sending message
2. Shows three animated dots bouncing sequentially
3. Light teal background matching AI bubbles
4. Has `aria-label="AI is typing"`
5. Shows "Still thinking..." after 5 seconds
6. Shows "Taking longer than usual..." with retry after 15 seconds

### AC-2.4: Assessment Flow with Adaptive Questions
1. AI greets with open-ended question
2. Follow-up questions adapt based on keywords in responses
3. Structured questions (sleep, mood, etc.) show single-card format
4. Progress within structured section is visible
5. Back button allows revising previous answer
6. Total assessment completes in ~5 minutes typical case

### AC-2.5: Assessment Summary Generation
1. Summary displays as card (not chat bubble)
2. Heading: "Here's what I'm hearing..."
3. Bullet points of key concerns identified
4. Child's name used naturally
5. "Yes, continue" primary button proceeds to demographics
6. "I'd like to add something" returns to chat
7. "Start over" link available with confirmation

### AC-2.6: Session Persistence and Resume
1. Every message saves to backend on send (not batched)
2. Closing browser preserves conversation
3. Returning to same URL restores all messages
4. AI acknowledges return ("Welcome back!")
5. "Save & Exit" in header saves and shows confirmation
6. Session recoverable for 30 days
7. Network failure shows "Saving..." with retry option

### AC-2.7: Form-Based Fallback
1. Link visible in chat: "Prefer a traditional form?"
2. Form flow at `/onboarding/[sessionId]/form/assessment`
3. Multi-page form collects equivalent information
4. Form generates same summary as AI chat
5. Can switch between modes with data preserved

## Traceability Mapping

| AC | Spec Section | Component(s) | Test Approach |
|----|--------------|--------------|---------------|
| AC-2.1 | Detailed Design > ChatWindow, ChatBubble | ChatWindow.tsx, ChatBubble.tsx | Unit: render tests, E2E: visual regression |
| AC-2.2 | Detailed Design > QuickReplyChips, MessageInput | QuickReplyChips.tsx, MessageInput.tsx | Unit: interaction tests, E2E: chat flow |
| AC-2.3 | Detailed Design > TypingIndicator | TypingIndicator.tsx | Unit: timing tests, E2E: loading states |
| AC-2.4 | Workflows > Happy Path | useAssessmentChat.ts, AssessmentCard.tsx | E2E: full assessment flow |
| AC-2.5 | Detailed Design > AssessmentSummary | AssessmentSummary.tsx | Unit: render tests, E2E: confirmation flow |
| AC-2.6 | Workflows > Session Resume | useAssessmentChat.ts, useAutoSave.ts | E2E: session recovery |
| AC-2.7 | Route Structure > form/ | Form route pages | E2E: fallback flow |

## Risks, Assumptions, Open Questions

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| AI response times exceed 3s regularly | Medium | High | Implement timeout handling, form fallback |
| Parents abandon due to chat fatigue | Medium | High | Quick replies reduce typing, save progress |
| Message virtualization complexity | Low | Medium | Only implement if > 50 messages becomes common |
| WebSocket disconnects on mobile | Medium | Medium | Exponential backoff reconnection |

### Assumptions

1. Backend GraphQL API will be available with schemas defined in this spec
2. AI response times will average 1-3 seconds
3. Session IDs are stable and can be used for URL routing
4. Backend handles all AI/GPT-4 integration
5. Crisis keyword detection is handled by backend

### Open Questions

1. **Q:** Should we preload the demographics form while assessment completes?
   **A:** Defer to performance testing; add if LCP impacted.

2. **Q:** How do we handle assessment data for A/B testing chat vs forms?
   **A:** Backend should track assessment_mode in session for analytics.

3. **Q:** Maximum conversation length before suggesting completion?
   **A:** Backend should flag when sufficient data collected (suggest 20 messages max).

## Test Strategy Summary

### Unit Tests (Vitest + RTL)

| Component | Test Coverage |
|-----------|---------------|
| ChatBubble | Renders AI/user variants, timestamps, animations |
| QuickReplyChips | Renders options, handles click, disappears after selection |
| TypingIndicator | Shows dots animation, timeout states |
| MessageInput | Character limit, send button state, keyboard shortcuts |
| useAssessmentChat | State management, mutation calls, error handling |

### Integration Tests

| Flow | Test Coverage |
|------|---------------|
| Send message | Message appears optimistically, AI response arrives |
| Quick reply | Selection sends, chips update |
| Session resume | Messages load, AI acknowledges return |
| Timeout handling | Retry button appears, works correctly |

### E2E Tests (Playwright)

| Scenario | Steps |
|----------|-------|
| Complete assessment | Start → chat → summary → confirm → demographics |
| Session persistence | Start → send messages → close → return → verify messages |
| Form fallback | Start → click fallback → complete form → verify summary |
| Mobile viewport | All above tests at 375px width |

### Accessibility Tests

- Keyboard navigation through chat
- Screen reader announcement of new messages
- Focus management on quick reply selection
- Color contrast validation

---

_Generated by BMad Method Epic Tech Context Workflow v1.0_
_Date: 2025-11-29_
