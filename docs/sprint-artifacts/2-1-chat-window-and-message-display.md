# Story 2.1: Chat Window and Message Display

Status: drafted

## Story

As a **parent**,
I want **to see my conversation with the AI in a familiar chat interface**,
so that **the experience feels natural and supportive, not like filling out forms**.

## Acceptance Criteria

1. **AC-2.1.1:** Chat window renders full viewport height minus header on mobile
2. **AC-2.1.2:** Chat window is centered with max-width 640px on desktop
3. **AC-2.1.3:** Messages scroll from bottom up with newest visible
4. **AC-2.1.4:** Auto-scroll to newest message on update
5. **AC-2.1.5:** AI messages display with light teal background (#F0FDFA), left-aligned, 75% max-width
6. **AC-2.1.6:** User messages display with teal background (#2A9D8F), white text, right-aligned, 75% max-width
7. **AC-2.1.7:** AI messages show Daybreak mountain icon avatar (40x40px)
8. **AC-2.1.8:** Each message shows relative timestamp ("Just now", "2 min ago")
9. **AC-2.1.9:** Messages have smooth fade-in animation on appear
10. **AC-2.1.10:** Scrolling is smooth with momentum on mobile
11. **AC-2.1.11:** Screen reader announces new messages with `aria-live="polite"`
12. **AC-2.1.12:** Chat container has `role="log"` for accessibility

## Tasks / Subtasks

- [ ] **Task 1: Create ChatWindow component** (AC: 2.1.1, 2.1.2, 2.1.3, 2.1.4, 2.1.10)
  - [ ] Create `features/assessment/ChatWindow.tsx`
  - [ ] Implement full viewport height minus header calculation
  - [ ] Add centered max-width 640px container for desktop
  - [ ] Implement scroll container with `useRef` for programmatic scroll
  - [ ] Add auto-scroll on message array change
  - [ ] Add smooth scroll with CSS `scroll-behavior: smooth`
  - [ ] Test mobile momentum scrolling

- [ ] **Task 2: Create ChatBubble component** (AC: 2.1.5, 2.1.6, 2.1.7, 2.1.9)
  - [ ] Create `features/assessment/ChatBubble.tsx`
  - [ ] Implement `variant="ai"` with light teal background, left-aligned
  - [ ] Implement `variant="user"` with teal background, white text, right-aligned
  - [ ] Add Daybreak mountain icon avatar for AI messages (40x40px)
  - [ ] Implement 75% max-width constraint
  - [ ] Add fade-in animation using CSS keyframes or Tailwind `animate-`
  - [ ] Export `ChatBubbleProps` interface

- [ ] **Task 3: Implement timestamp display** (AC: 2.1.8)
  - [ ] Create relative time formatter utility in `lib/utils/formatters.ts`
  - [ ] Handle "Just now", "X min ago", "X hours ago" formats
  - [ ] Add timestamp element to ChatBubble
  - [ ] Style timestamp with muted color below message

- [ ] **Task 4: Implement accessibility features** (AC: 2.1.11, 2.1.12)
  - [ ] Add `role="log"` to chat container
  - [ ] Add `aria-live="polite"` region for new messages
  - [ ] Ensure focus management doesn't break on new messages
  - [ ] Test with VoiceOver - verify each message announces

- [ ] **Task 5: Create assessment page route** (AC: all)
  - [ ] Create `app/onboarding/[sessionId]/assessment/page.tsx`
  - [ ] Integrate ChatWindow component
  - [ ] Add mock message data for development
  - [ ] Verify layout at mobile (375px) and desktop (1280px) viewports

- [ ] **Task 6: Write unit tests** (AC: all)
  - [ ] Create `tests/unit/components/assessment/ChatWindow.test.tsx`
  - [ ] Create `tests/unit/components/assessment/ChatBubble.test.tsx`
  - [ ] Test AI message rendering with correct styles
  - [ ] Test user message rendering with correct styles
  - [ ] Test auto-scroll behavior
  - [ ] Test accessibility attributes

## Dev Notes

### Architecture Patterns

- **Component Location:** `features/assessment/` per Architecture project structure
- **Route Location:** `app/onboarding/[sessionId]/assessment/page.tsx`
- **Styling:** Use Tailwind utilities with Daybreak design tokens from Story 1.2
- **Component Library:** Use shadcn/ui Avatar for message avatars

### Design Token References

From UX Design Specification (Section 3.1):
- AI bubble background: `#F0FDFA` (light teal tint)
- User bubble background: `#2A9D8F` (daybreak-teal)
- User bubble text: `#FFFFFF`
- Border radius: `xl` (24px) for chat bubbles

### Project Structure Notes

```
features/assessment/
├── ChatWindow.tsx          # Main chat container
├── ChatBubble.tsx          # Message display component
├── ChatBubble.test.tsx     # Unit tests (in tests/ mirror)
└── index.ts                # Re-exports
```

### Performance Considerations

- Use `React.memo` on ChatBubble to prevent unnecessary re-renders
- If conversation exceeds 50 messages, consider virtualization with `react-window`
- Keep scroll container ref stable across renders

### Accessibility Requirements

- WCAG 2.1 AA compliance required
- `role="log"` indicates a region where new information is added
- `aria-live="polite"` announces new messages without interrupting user
- Ensure color contrast meets 4.5:1 for body text

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-2.md#AC-2.1]
- [Source: docs/architecture.md#Implementation-Patterns]
- [Source: docs/ux-design-specification.md#Section-6.2-Custom-Components]
- [Source: docs/epics.md#Story-2.1]

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
