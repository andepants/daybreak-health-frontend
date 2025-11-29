# Story 2.4: Assessment Flow with Adaptive Questions

Status: ready-for-dev

## Story

As a **parent**,
I want **the AI to ask follow-up questions based on my answers**,
so that **it truly understands my child's situation instead of following a rigid script**.

## Acceptance Criteria

1. **AC-2.4.1:** AI greets with open-ended question like "Tell me what's been going on with [child name if known]"
2. **AC-2.4.2:** AI asks relevant follow-up questions based on keywords in responses (duration, severity, impact)
3. **AC-2.4.3:** Structured questions (sleep, appetite, mood) display in single-card format (Typeform style)
4. **AC-2.4.4:** One question per screen in structured section
5. **AC-2.4.5:** Quick reply options plus "Other" text option in structured questions
6. **AC-2.4.6:** Progress indicator visible within structured section
7. **AC-2.4.7:** Back button allows revising previous answer in structured section
8. **AC-2.4.8:** Assessment flow supports branching without frontend timeouts (UX target: ~5 min typical completion)
9. **AC-2.4.9:** AI validates completeness before allowing transition to summary
10. **AC-2.4.10:** Crisis keywords trigger support option visibility (backend-detected)

## Tasks / Subtasks

- [ ] **Task 1: Create AssessmentCard component** (AC: 2.4.3, 2.4.4, 2.4.5)
  - [ ] Create `features/assessment/AssessmentCard.tsx`
  - [ ] Implement single-question card layout
  - [ ] Center card on screen with appropriate padding
  - [ ] Add question text with large readable font
  - [ ] Add quick reply options as selectable buttons
  - [ ] Add "Other" option that reveals text input
  - [ ] Style to match Daybreak design system

- [ ] **Task 2: Implement structured question progress** (AC: 2.4.6, 2.4.7)
  - [ ] Create progress indicator showing current/total (e.g., "3 of 5")
  - [ ] Add back button in card header
  - [ ] Implement `onBack` callback to revise previous answer
  - [ ] Store previous answers for back navigation
  - [ ] Animate card transitions (slide left/right)

- [ ] **Task 3: Implement assessment mode switching** (AC: 2.4.3)
  - [ ] Add `assessmentMode` state: 'chat' | 'structured'
  - [ ] Detect when AI response contains `structuredQuestion` type
  - [ ] Switch to AssessmentCard display for structured questions
  - [ ] Return to chat mode after structured section complete

- [ ] **Task 4: Create GraphQL operations for assessment** (AC: 2.4.1, 2.4.2, 2.4.9)
  - [ ] Create `features/assessment/assessment.graphql`
  - [ ] Define `SubmitAssessmentMessage` mutation
  - [ ] Define `GetAssessmentState` query
  - [ ] Run `pnpm codegen` to generate typed hooks
  - [ ] Implement mutation call in useAssessmentChat hook

- [ ] **Task 5: Implement greeting and adaptive flow** (AC: 2.4.1, 2.4.2)
  - [ ] On new session, trigger initial AI greeting
  - [ ] Parse AI response for `suggestedReplies` (quick replies)
  - [ ] Parse AI response for `nextQuestion` context
  - [ ] Update chat state with new messages from API response

- [ ] **Task 6: Implement completeness validation** (AC: 2.4.9)
  - [ ] Track assessment progress via `isComplete` flag from API
  - [ ] Show transition prompt when assessment complete
  - [ ] Prevent transition until API confirms completeness
  - [ ] Display "Almost done!" messaging near completion

- [ ] **Task 7: Handle crisis detection display** (AC: 2.4.10)
  - [ ] Parse API response for `crisisDetected` flag
  - [ ] If flagged, show prominent support button
  - [ ] Display crisis resource information (988, Crisis Text Line)
  - [ ] Continue assessment flow while showing resources

- [ ] **Task 8: Write integration tests** (AC: all)
  - [ ] Create `tests/unit/components/assessment/AssessmentCard.test.tsx`
  - [ ] Test card renders question and options
  - [ ] Test option selection behavior
  - [ ] Test "Other" text input toggle
  - [ ] Test back button navigation
  - [ ] Test progress indicator accuracy
  - [ ] Mock GraphQL responses for flow testing

## Prerequisites

- **Story 2-1:** Chat Window and Message Display (ChatWindow, ChatBubble)
- **Story 2-2:** Message Input and Quick Reply Chips (MessageInput, QuickReplyChips, useAssessmentChat)
- **Story 2-3:** AI Typing Indicator (TypingIndicator)

## Dev Notes

### Architecture Patterns

- **Component Location:** `features/assessment/AssessmentCard.tsx`
- **GraphQL Location:** `features/assessment/assessment.graphql`
- **Backend Responsibility:** AI adaptation logic, crisis detection, question branching, completeness validation
- **Frontend Responsibility:** Display responses, render structured cards, handle user input, show crisis resources when flagged

**Note:** The adaptive/branching logic is entirely backend-driven. Frontend simply renders what the API returns (`suggestedReplies`, `structuredQuestion`, `crisisDetected` flags) without client-side decision logic.

### AssessmentCard Layout

```
┌────────────────────────────────────────┐
│  ← Back                    3 of 5      │
├────────────────────────────────────────┤
│                                        │
│   How has [child]'s sleep been         │
│   lately?                              │
│                                        │
│   ┌──────────────┐ ┌──────────────┐   │
│   │  Much worse  │ │ Somewhat     │   │
│   │              │ │ worse        │   │
│   └──────────────┘ └──────────────┘   │
│                                        │
│   ┌──────────────┐ ┌──────────────┐   │
│   │  About the   │ │ Better       │   │
│   │  same        │ │              │   │
│   └──────────────┘ └──────────────┘   │
│                                        │
│   ┌──────────────────────────────────┐│
│   │  Other (tap to type)             ││
│   └──────────────────────────────────┘│
│                                        │
└────────────────────────────────────────┘
```

### GraphQL Operations

```graphql
# features/assessment/assessment.graphql

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
      structuredQuestion {
        id
        type
        question
        options
        allowOther
      }
    }
    nextQuestion
    isComplete
    crisisDetected
  }
}

query GetAssessmentState($sessionId: ID!) {
  getOnboardingSession(id: $sessionId) {
    id
    assessment {
      conversationHistory {
        id
        sender
        content
        timestamp
      }
      currentQuestion
      isComplete
      structuredProgress {
        current
        total
      }
    }
  }
}
```

### Project Structure Notes

```
features/assessment/
├── ChatWindow.tsx          # From Story 2.1 - add mode switching
├── ChatBubble.tsx          # From Story 2.1
├── QuickReplyChips.tsx     # From Story 2.2
├── MessageInput.tsx        # From Story 2.2
├── TypingIndicator.tsx     # From Story 2.3
├── AssessmentCard.tsx      # NEW - this story
├── assessment.graphql      # NEW - this story
├── useAssessmentChat.ts    # Modified - add GraphQL integration
└── index.ts
```

### Learnings from Previous Stories

**From Stories 2.1-2.3:**
- ChatWindow layout established for chat mode
- Message styling patterns defined
- useAssessmentChat hook created with local state
- Typing indicator with timeout handling implemented

**New Patterns This Story:**
- Dual-mode display (chat vs structured card)
- GraphQL integration for real API calls
- Progress tracking within structured sections

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-2.md#AC-2.4]
- [Source: docs/sprint-artifacts/tech-spec-epic-2.md#Workflows]
- [Source: docs/architecture.md#API-Contracts]
- [Source: docs/epics.md#Story-2.4]

## Dev Agent Record

### Context Reference

- [Story Context XML](./2-4-assessment-flow-with-adaptive-questions.context.xml)

### Agent Model Used

<!-- Will be filled by dev agent -->

### Debug Log References

<!-- Will be filled during implementation -->

### Completion Notes List

<!-- Will be filled during implementation -->

### File List

<!-- Will be filled during implementation -->
