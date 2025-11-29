# Story 2.3: AI Typing Indicator

Status: ready-for-dev

## Story

As a **parent**,
I want **to see when the AI is "thinking" about my response**,
so that **I know help is coming and the system hasn't frozen**.

## Acceptance Criteria

1. **AC-2.3.1:** Typing indicator appears within 200ms of sending a message
2. **AC-2.3.2:** Indicator shows three animated dots bouncing sequentially
3. **AC-2.3.3:** Light teal background (#F0FDFA) matching AI bubbles
4. **AC-2.3.4:** Daybreak avatar present (40x40px)
5. **AC-2.3.5:** Smooth fade-in animation on appear
6. **AC-2.3.6:** Has `aria-label="AI is typing"` for accessibility
7. **AC-2.3.7:** Shows "Still thinking..." text after 5 seconds
8. **AC-2.3.8:** Shows "Taking longer than usual..." with retry option after 15 seconds
9. **AC-2.3.9:** Indicator is replaced by actual AI response when ready
10. **AC-2.3.10:** Indicator positioned in message flow as AI chat bubble

## Tasks / Subtasks

- [ ] **Task 1: Create TypingIndicator component** (AC: 2.3.1, 2.3.2, 2.3.3, 2.3.4, 2.3.5, 2.3.10)
  - [ ] Create `features/assessment/TypingIndicator.tsx`
  - [ ] Style as AI chat bubble (light teal background, left-aligned)
  - [ ] Add Daybreak avatar (40x40px) matching ChatBubble
  - [ ] Implement three-dot animation using CSS keyframes
  - [ ] Add fade-in animation on mount
  - [ ] Position in message flow (renders at end of messages list)

- [ ] **Task 2: Implement dot animation** (AC: 2.3.2)
  - [ ] Create CSS keyframe for bounce animation
  - [ ] Stagger animation delay for sequential effect (0ms, 150ms, 300ms)
  - [ ] Use Tailwind `animate-bounce` as base or custom keyframes
  - [ ] Dots should be 8px circles with teal color

- [ ] **Task 3: Implement timeout states** (AC: 2.3.7, 2.3.8)
  - [ ] Add `useState` for timeout stages: 'typing' | 'still-thinking' | 'taking-long'
  - [ ] Set 5-second timer for "Still thinking..." state
  - [ ] Set 15-second timer for "Taking longer than usual..." state
  - [ ] Add retry button in "taking-long" state
  - [ ] Reset timers when new response arrives

- [ ] **Task 4: Implement accessibility** (AC: 2.3.6)
  - [ ] Add `aria-label="AI is typing"` to container
  - [ ] Add `role="status"` for screen reader announcement
  - [ ] Ensure timeout state changes are announced
  - [ ] Add `aria-live="polite"` for state transitions

- [ ] **Task 5: Integrate with ChatWindow and useAssessmentChat** (AC: 2.3.1, 2.3.9)
  - [ ] Add `isTyping` state to useAssessmentChat hook
  - [ ] Set `isTyping=true` immediately on message send (within 200ms)
  - [ ] Set `isTyping=false` when AI response received
  - [ ] Conditionally render TypingIndicator in ChatWindow
  - [ ] Ensure indicator replaced by response seamlessly

- [ ] **Task 6: Implement retry functionality** (AC: 2.3.8)
  - [ ] Add `onRetry` callback prop to TypingIndicator
  - [ ] Wire retry button to resend last message
  - [ ] Reset timeout timers on retry
  - [ ] Show feedback on retry initiation

- [ ] **Task 7: Write unit tests** (AC: all)
  - [ ] Create `tests/unit/components/assessment/TypingIndicator.test.tsx`
  - [ ] Test initial render with dots animation
  - [ ] Test 5-second timeout transition
  - [ ] Test 15-second timeout with retry button
  - [ ] Test retry button click handler
  - [ ] Test accessibility attributes
  - [ ] Test fade-in animation presence

## Prerequisites

- **Story 2-1:** Chat Window and Message Display (ChatWindow, ChatBubble, avatar pattern)
- **Story 2-2:** Message Input and Quick Reply Chips (useAssessmentChat hook)

## Dev Notes

### Architecture Patterns

- **Component Location:** `features/assessment/TypingIndicator.tsx`
- **Styling:** Match ChatBubble AI variant styling exactly
- **State Management:** Typing state in useAssessmentChat hook

### CSS Animation

```css
@keyframes bounce-dot {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
}

.dot-1 { animation-delay: 0ms; }
.dot-2 { animation-delay: 150ms; }
.dot-3 { animation-delay: 300ms; }
```

Or with Tailwind custom animation:
```typescript
const dotClasses = "h-2 w-2 rounded-full bg-daybreak-teal animate-bounce";
```

### Timeout Logic

```typescript
useEffect(() => {
  if (!isVisible) return;

  const stillThinkingTimer = setTimeout(() => {
    setTimeoutState('still-thinking');
  }, 5000);

  const takingLongTimer = setTimeout(() => {
    setTimeoutState('taking-long');
  }, 15000);

  return () => {
    clearTimeout(stillThinkingTimer);
    clearTimeout(takingLongTimer);
  };
}, [isVisible]);
```

### Project Structure Notes

```
features/assessment/
├── ChatWindow.tsx          # From Story 2.1
├── ChatBubble.tsx          # From Story 2.1
├── QuickReplyChips.tsx     # From Story 2.2
├── MessageInput.tsx        # From Story 2.2
├── TypingIndicator.tsx     # NEW - this story
├── useAssessmentChat.ts    # Modified - add isTyping state
└── index.ts
```

### Learnings from Previous Stories

**From Story 2-1 (ChatWindow/ChatBubble):**
- ChatBubble AI variant styling available for reference
- Avatar component pattern established
- Fade-in animation pattern can be reused

**From Story 2-2 (MessageInput/QuickReplyChips):**
- useAssessmentChat hook created - add isTyping state here
- Message send flow established - trigger typing indicator on send

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-2.md#AC-2.3]
- [Source: docs/architecture.md#Lifecycle-Patterns]
- [Source: docs/ux-design-specification.md#Section-6.2]
- [Source: docs/epics.md#Story-2.3]

## Dev Agent Record

### Context Reference

- [Story Context XML](./2-3-ai-typing-indicator.context.xml)

### Agent Model Used

<!-- Will be filled by dev agent -->

### Debug Log References

<!-- Will be filled during implementation -->

### Completion Notes List

<!-- Will be filled during implementation -->

### File List

<!-- Will be filled during implementation -->
