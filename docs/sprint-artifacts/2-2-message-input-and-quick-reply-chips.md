# Story 2.2: Message Input and Quick Reply Chips

Status: ready-for-dev

## Story

As a **parent**,
I want **to respond to the AI via text input or quick reply buttons**,
so that **I can share as much or as little as I want with minimal effort**.

## Acceptance Criteria

1. **AC-2.2.1:** Quick reply chips appear as horizontal scrollable row of 2-4 options
2. **AC-2.2.2:** Quick reply chips are pill-shaped buttons with teal outline
3. **AC-2.2.3:** Tapping a chip fills it with teal and sends immediately
4. **AC-2.2.4:** Quick replies disappear after selection or when typing starts
5. **AC-2.2.5:** Text input bar is fixed to bottom on mobile
6. **AC-2.2.6:** Textarea expands to 3 lines maximum
7. **AC-2.2.7:** Send button is teal and enabled only when text is present
8. **AC-2.2.8:** Character limit of 2000 with counter appearing at 1800+
9. **AC-2.2.9:** Pressing Enter sends message (Shift+Enter for newline)
10. **AC-2.2.10:** Input is disabled while AI is responding (with visual indicator)
11. **AC-2.2.11:** Touch targets are minimum 44x44px (WCAG 2.1 AAA / Apple HIG)
12. **AC-2.2.12:** Placeholder text shows "Type your message..."

## Tasks / Subtasks

- [ ] **Task 1: Create QuickReplyChips component** (AC: 2.2.1, 2.2.2, 2.2.3, 2.2.4, 2.2.11)
  - [ ] Create `features/assessment/QuickReplyChips.tsx`
  - [ ] Implement horizontal scrollable container
  - [ ] Style pill-shaped buttons with teal outline
  - [ ] Add filled state on selection
  - [ ] Implement `onSelect` callback that sends immediately
  - [ ] Add hide/show logic based on typing state
  - [ ] Ensure 44x44px minimum touch targets
  - [ ] Export `QuickReplyChipsProps` interface

- [ ] **Task 2: Create MessageInput component** (AC: 2.2.5, 2.2.6, 2.2.7, 2.2.9, 2.2.10, 2.2.12)
  - [ ] Create `features/assessment/MessageInput.tsx`
  - [ ] Implement fixed bottom positioning on mobile
  - [ ] Use textarea that auto-expands to 3 lines max
  - [ ] Style send button with teal color
  - [ ] Implement send button enabled/disabled state
  - [ ] Add Enter to send, Shift+Enter for newline logic
  - [ ] Add disabled state with visual indicator when AI responding
  - [ ] Add "Type your message..." placeholder

- [ ] **Task 3: Implement character limit** (AC: 2.2.8)
  - [ ] Add 2000 character limit to textarea
  - [ ] Show character counter when input exceeds 1800 characters
  - [ ] Style counter with muted text, warning color near limit
  - [ ] Prevent input beyond 2000 characters

- [ ] **Task 4: Integrate with ChatWindow** (AC: all)
  - [ ] Add MessageInput to ChatWindow component
  - [ ] Add QuickReplyChips above input area
  - [ ] Wire up `onSend` callback to parent
  - [ ] Pass `suggestedReplies` prop to QuickReplyChips
  - [ ] Implement `isAiResponding` state management
  - [ ] Hide chips when user starts typing

- [ ] **Task 5: Implement optimistic message sending** (AC: 2.2.3)
  - [ ] Create `useAssessmentChat` hook in `features/assessment/useAssessmentChat.ts`
  - [ ] Implement `sendMessage` function with optimistic UI
  - [ ] Handle quick reply sends
  - [ ] Clear input after successful send
  - [ ] Store draft message in sessionStorage for persistence

- [ ] **Task 6: Write unit tests** (AC: all)
  - [ ] Create `tests/unit/components/assessment/QuickReplyChips.test.tsx`
  - [ ] Create `tests/unit/components/assessment/MessageInput.test.tsx`
  - [ ] Test chip selection triggers callback
  - [ ] Test chips hide on typing
  - [ ] Test send button state changes
  - [ ] Test character counter display
  - [ ] Test keyboard shortcuts (Enter, Shift+Enter)
  - [ ] Test disabled state during AI response

## Prerequisites

- **Story 2-1:** Chat Window and Message Display (ChatWindow, ChatBubble components)

## Dev Notes

### Architecture Patterns

- **Component Location:** `features/assessment/` per Architecture project structure
- **Hook Location:** `features/assessment/useAssessmentChat.ts`
- **Styling:** Use Tailwind utilities with Daybreak design tokens
- **State Management:** Local state for UI, Apollo cache for messages

### Design Token References

From UX Design Specification (Section 6.2):
- Quick reply outline: `daybreak-teal` (#2A9D8F)
- Quick reply selected fill: `daybreak-teal` (#2A9D8F)
- Send button: `daybreak-teal` (#2A9D8F)

### Project Structure Notes

```
features/assessment/
├── ChatWindow.tsx          # From Story 2.1
├── ChatBubble.tsx          # From Story 2.1
├── QuickReplyChips.tsx     # NEW - this story
├── MessageInput.tsx        # NEW - this story
├── useAssessmentChat.ts    # NEW - this story
└── index.ts
```

### Keyboard Handling

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};
```

### Accessibility Requirements

- Touch targets minimum 44x44px (WCAG 2.1 Level AAA)
- Focus visible on input and chips
- Disabled state communicated via `aria-disabled`
- Character count announced to screen readers

### Learnings from Previous Story

**From Story 2-1-chat-window-and-message-display:**
- ChatWindow component structure established
- ChatBubble component with variants created
- Design tokens integrated
- Accessibility patterns for chat established

**Integration Points:**
- MessageInput slots into ChatWindow at bottom
- QuickReplyChips slot above MessageInput
- useAssessmentChat hook manages message state

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-2.md#AC-2.2]
- [Source: docs/architecture.md#Implementation-Patterns]
- [Source: docs/ux-design-specification.md#Section-6.2-Custom-Components]
- [Source: docs/epics.md#Story-2.2]

## Dev Agent Record

### Context Reference

- [Story Context XML](./2-2-message-input-and-quick-reply-chips.context.xml)

### Agent Model Used

<!-- Will be filled by dev agent -->

### Debug Log References

<!-- Will be filled during implementation -->

### Completion Notes List

<!-- Will be filled during implementation -->

### File List

<!-- Will be filled during implementation -->
