# Story 2.5: Assessment Summary Generation

Status: drafted

## Story

As a **parent**,
I want **to see a summary of what the AI understood about my child**,
so that **I can confirm it's accurate before moving forward**.

## Acceptance Criteria

1. **AC-2.5.1:** Summary displays as a card (not chat bubble) when assessment complete
2. **AC-2.5.2:** Heading shows "Here's what I'm hearing..."
3. **AC-2.5.3:** Bullet points list key concerns identified from conversation
4. **AC-2.5.4:** Child's name used naturally in summary text
5. **AC-2.5.5:** Warm, empathetic tone (not clinical language)
6. **AC-2.5.6:** "Yes, continue" primary button (teal) proceeds to demographics
7. **AC-2.5.7:** "I'd like to add something" secondary button returns to chat
8. **AC-2.5.8:** "Start over" link (ghost style) available with confirmation modal
9. **AC-2.5.9:** Confirming summary saves to session and triggers navigation
10. **AC-2.5.10:** Summary is stored for therapist matching (FR-003)

## Tasks / Subtasks

- [ ] **Task 1: Create AssessmentSummary component** (AC: 2.5.1, 2.5.2, 2.5.3, 2.5.4, 2.5.5)
  - [ ] Create `features/assessment/AssessmentSummary.tsx`
  - [ ] Design card layout with appropriate padding
  - [ ] Add "Here's what I'm hearing..." heading (Fraunces font)
  - [ ] Render bullet points from summary data
  - [ ] Interpolate child's name in summary text
  - [ ] Style with warm Daybreak colors

- [ ] **Task 2: Implement action buttons** (AC: 2.5.6, 2.5.7, 2.5.8)
  - [ ] Add primary "Yes, continue" button (teal, full-width)
  - [ ] Add secondary "I'd like to add something" button (outline style)
  - [ ] Add "Start over" ghost link
  - [ ] Implement confirmation modal for "Start over"
  - [ ] Use shadcn/ui Button and AlertDialog components

- [ ] **Task 3: Create GraphQL operations** (AC: 2.5.9, 2.5.10)
  - [ ] Add `CompleteAssessment` mutation to assessment.graphql
  - [ ] Add `ConfirmAssessmentSummary` mutation
  - [ ] Generate typed hooks with `pnpm codegen`
  - [ ] Implement mutation calls in component

- [ ] **Task 4: Implement summary display logic** (AC: 2.5.1)
  - [ ] Detect `isComplete=true` from assessment state
  - [ ] Fetch summary from API when complete
  - [ ] Replace chat view with summary card
  - [ ] Handle loading state while summary generates

- [ ] **Task 5: Implement "add something" flow** (AC: 2.5.7)
  - [ ] On "add something" click, return to chat mode
  - [ ] Send AI message: "What else would you like to share?"
  - [ ] Allow continuation of conversation
  - [ ] Re-trigger summary when user indicates done

- [ ] **Task 6: Implement "start over" flow** (AC: 2.5.8)
  - [ ] Show AlertDialog confirmation: "Are you sure? Your conversation will be cleared."
  - [ ] On confirm, call API to reset session assessment
  - [ ] Clear local state and return to greeting
  - [ ] Handle cancellation gracefully

- [ ] **Task 7: Implement confirmation and navigation** (AC: 2.5.9)
  - [ ] On "Yes, continue", call ConfirmAssessmentSummary mutation
  - [ ] On success, navigate to `/onboarding/[sessionId]/demographics`
  - [ ] Use `router.push()` for navigation
  - [ ] Show loading state during confirmation

- [ ] **Task 8: Write unit tests** (AC: all)
  - [ ] Create `tests/unit/components/assessment/AssessmentSummary.test.tsx`
  - [ ] Test summary card renders with correct data
  - [ ] Test button click handlers
  - [ ] Test confirmation modal appears on "Start over"
  - [ ] Test navigation on confirmation
  - [ ] Mock GraphQL mutations for testing

## Dev Notes

### Architecture Patterns

- **Component Location:** `features/assessment/AssessmentSummary.tsx`
- **Navigation:** Next.js `useRouter` for page transitions
- **State:** Summary comes from API, stored in Apollo cache

### Summary Card Layout

```
┌────────────────────────────────────────────────┐
│                                                │
│   Here's what I'm hearing...                   │
│                                                │
│   Based on our conversation about [Emma],      │
│   here are the main things I noticed:          │
│                                                │
│   • Emma has been feeling sad and              │
│     withdrawn for the past few months          │
│                                                │
│   • Sleep has been difficult, often            │
│     staying up late or waking early            │
│                                                │
│   • School performance has dropped,            │
│     especially in subjects she used            │
│     to enjoy                                   │
│                                                │
│   Does this sound right?                       │
│                                                │
│   ┌──────────────────────────────────────────┐│
│   │         Yes, continue →                  ││
│   └──────────────────────────────────────────┘│
│                                                │
│   ┌──────────────────────────────────────────┐│
│   │    I'd like to add something             ││
│   └──────────────────────────────────────────┘│
│                                                │
│               Start over                       │
│                                                │
└────────────────────────────────────────────────┘
```

### GraphQL Operations

```graphql
# Add to features/assessment/assessment.graphql

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

### Project Structure Notes

```
features/assessment/
├── ChatWindow.tsx          # From Story 2.1
├── ChatBubble.tsx          # From Story 2.1
├── QuickReplyChips.tsx     # From Story 2.2
├── MessageInput.tsx        # From Story 2.2
├── TypingIndicator.tsx     # From Story 2.3
├── AssessmentCard.tsx      # From Story 2.4
├── AssessmentSummary.tsx   # NEW - this story
├── assessment.graphql      # Modified - add new mutations
├── useAssessmentChat.ts    # Modified - add summary state
└── index.ts
```

### UX Considerations

- Summary should feel like a "pause and check" moment
- Warm, conversational tone essential (not clinical bullet points)
- Consider animation/celebration moment for completing assessment
- Ensure user feels in control with clear options

### Learnings from Previous Stories

**From Stories 2.1-2.4:**
- Chat and card layouts established
- GraphQL patterns for assessment operations defined
- Mode switching between chat and card implemented
- Button styling patterns from design system

**New Patterns This Story:**
- Summary card as distinct from assessment card
- Multi-action card with primary/secondary/ghost buttons
- Confirmation modal pattern
- Navigation between onboarding steps

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-2.md#AC-2.5]
- [Source: docs/architecture.md#API-Contracts]
- [Source: docs/ux-design-specification.md#Section-7.1]
- [Source: docs/epics.md#Story-2.5]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

<!-- Will be filled by dev agent -->

### Debug Log References

<!-- Will be filled during implementation -->

### Completion Notes List

<!-- Will be filled during implementation -->

### File List

<!-- Will be filled during implementation -->
