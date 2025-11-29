# Story 2.6: Session Persistence and Resume

Status: ready-for-dev

## Story

As a **parent**,
I want **my progress saved automatically so I can leave and return later**,
so that **I don't lose everything if I get interrupted or need a break**.

## Acceptance Criteria

1. **AC-2.6.1:** Every message saves to backend on send (not batched)
2. **AC-2.6.2:** Closing browser preserves conversation state
3. **AC-2.6.3:** Returning to same session URL restores all messages
4. **AC-2.6.4:** AI acknowledges return ("Welcome back! Let's continue...")
5. **AC-2.6.5:** "Save & Exit" in header saves state and shows confirmation
6. **AC-2.6.6:** Confirmation shows session link for returning
7. **AC-2.6.7:** Option to receive email reminder in save confirmation
8. **AC-2.6.8:** Frontend supports session recovery (30-day expiry enforced by backend)
9. **AC-2.6.9:** Network failure shows "Saving..." indicator with retry option
10. **AC-2.6.10:** Session ID stored in localStorage as backup recovery method

## Tasks / Subtasks

- [ ] **Task 1: Implement auto-save on message send** (AC: 2.6.1)
  - [ ] Modify useAssessmentChat to save after every mutation
  - [ ] Use optimistic updates - show message immediately
  - [ ] Handle save failure gracefully (don't lose message)
  - [ ] Add retry logic for failed saves

- [ ] **Task 2: Implement session restoration on page load** (AC: 2.6.2, 2.6.3)
  - [ ] Fetch session data on assessment page mount
  - [ ] Populate chat with existing conversationHistory
  - [ ] Restore assessment state (structured progress, etc.)
  - [ ] Handle case where session doesn't exist (redirect to start)

- [ ] **Task 3: Implement "Welcome back" logic** (AC: 2.6.4)
  - [ ] Detect if session has existing messages
  - [ ] If returning, request welcome back message from API
  - [ ] Display welcome message before continuing
  - [ ] Track session resume events for analytics

- [ ] **Task 4: Implement "Save & Exit" functionality** (AC: 2.6.5, 2.6.6, 2.6.7)
  - [ ] Add "Save & Exit" button to Header component (from Story 1.3)
  - [ ] On click, trigger explicit save of current state
  - [ ] Show confirmation modal with:
    - Success message
    - Session URL for returning
    - Copy link button
    - Email reminder option (optional email input)
  - [ ] Use shadcn/ui Dialog for confirmation modal

- [ ] **Task 5: Implement email reminder option** (AC: 2.6.7)
  - [ ] Add email input to save confirmation modal
  - [ ] Pre-fill with parent email if already collected
  - [ ] Create GraphQL mutation to request reminder email
  - [ ] Show success feedback on email request

- [ ] **Task 6: Implement network failure handling** (AC: 2.6.9)
  - [ ] Detect network errors on save mutations
  - [ ] Show "Saving..." indicator with spinner
  - [ ] On failure, show error toast with retry button
  - [ ] Queue failed saves and retry on reconnection
  - [ ] Use Apollo Client error handling patterns

- [ ] **Task 7: Implement localStorage backup** (AC: 2.6.10)
  - [ ] Store session ID in localStorage on session start
  - [ ] On page load, check localStorage for session ID
  - [ ] If URL session ID missing, attempt recovery from localStorage
  - [ ] Clear localStorage on session completion

- [ ] **Task 8: Create useAutoSave hook** (AC: 2.6.1, 2.6.9)
  - [ ] Create `hooks/useAutoSave.ts` per Architecture
  - [ ] Implement debounced save (but not batched - each message triggers)
  - [ ] Track save status (idle, saving, error)
  - [ ] Expose retry function for manual retry
  - [ ] Integrate with useAssessmentChat

- [ ] **Task 9: Create useOnboardingSession hook** (AC: 2.6.2, 2.6.3, 2.6.8)
  - [ ] Create `hooks/useOnboardingSession.ts` per Architecture
  - [ ] Manage session state across onboarding steps
  - [ ] Handle session expiry gracefully (display expired message if backend returns 410/expired)
  - [ ] Provide session recovery utilities
  - [ ] Expose session status for UI display

- [ ] **Task 10: Write integration tests** (AC: all)
  - [ ] Test message persistence on send
  - [ ] Test session restoration on page load
  - [ ] Test "Save & Exit" flow
  - [ ] Test network failure handling
  - [ ] Test localStorage recovery
  - [ ] Mock GraphQL for persistence tests

## Prerequisites

- **Story 1-3:** Core Layout Components (Header component for Save & Exit button)
- **Story 2-1:** Chat Window and Message Display (ChatWindow)
- **Story 2-2:** Message Input and Quick Reply Chips (useAssessmentChat hook)
- **Story 2-4:** Assessment Flow (GraphQL operations, session state)

## Dev Notes

### Architecture Patterns

- **Hook Locations:**
  - `hooks/useAutoSave.ts` - per Architecture project structure
  - `hooks/useOnboardingSession.ts` - per Architecture project structure
- **Storage:** Apollo cache + backend persistence, localStorage backup
- **Error Handling:** Follow Architecture error handling patterns

### useAutoSave Hook Interface

```typescript
interface UseAutoSaveOptions {
  sessionId: string;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

interface UseAutoSaveReturn {
  saveStatus: 'idle' | 'saving' | 'error' | 'saved';
  lastSaved: Date | null;
  error: Error | null;
  retry: () => void;
  save: (data: any) => Promise<void>;
}

function useAutoSave(options: UseAutoSaveOptions): UseAutoSaveReturn;
```

### useOnboardingSession Hook Interface

```typescript
interface UseOnboardingSessionReturn {
  session: OnboardingSession | null;
  isLoading: boolean;
  error: Error | null;
  isReturningUser: boolean;
  sessionExpiresAt: Date | null;
  refetch: () => void;
}

function useOnboardingSession(sessionId: string): UseOnboardingSessionReturn;
```

### Save & Exit Confirmation Modal

```
┌────────────────────────────────────────────────┐
│                     ✓                          │
│                                                │
│   Your progress has been saved!                │
│                                                │
│   You can return anytime using this link:      │
│   ┌──────────────────────────────────────────┐│
│   │ https://daybreak.../onboarding/abc123    ││
│   └──────────────────────────────────────────┘│
│   [Copy link]                                  │
│                                                │
│   Want a reminder to come back?                │
│   ┌──────────────────────────────────────────┐│
│   │ email@example.com                        ││
│   └──────────────────────────────────────────┘│
│   [Send reminder]                              │
│                                                │
│   ┌──────────────────────────────────────────┐│
│   │              Done                        ││
│   └──────────────────────────────────────────┘│
│                                                │
└────────────────────────────────────────────────┘
```

### Network Error Handling

```typescript
// Apollo error link pattern
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (networkError) {
    // Queue for retry
    queueFailedSave(operation);
    toast.error('Connection lost. Retrying...', {
      action: { label: 'Retry now', onClick: () => retry() }
    });
  }
});
```

### Project Structure Notes

```
hooks/
├── useAutoSave.ts         # NEW - this story
├── useOnboardingSession.ts # NEW - this story
└── useWebSocketReconnect.ts # From Epic 1 (if implemented)

features/assessment/
├── ... (existing from 2.1-2.5)
├── useAssessmentChat.ts   # Modified - integrate useAutoSave

components/layout/
├── Header.tsx             # Modified - add Save & Exit button
└── SaveExitModal.tsx      # NEW - this story
```

### Learnings from Previous Stories

**From Stories 2.1-2.5:**
- Chat state management in useAssessmentChat
- GraphQL mutation patterns established
- Loading and error states handled
- Apollo cache integration working

**New Patterns This Story:**
- Custom hooks for cross-cutting concerns
- localStorage integration for resilience
- Error recovery and retry patterns
- Modal for confirmation with multiple actions

### PHI Considerations

- Session ID is safe to store in localStorage
- Do not store message content in localStorage
- Session recovery should re-fetch from backend
- Email reminder is optional, not stored client-side

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-2.md#AC-2.6]
- [Source: docs/architecture.md#Pre-mortem-Risk-Mitigations]
- [Source: docs/architecture.md#Fundamental-Truths]
- [Source: docs/epics.md#Story-2.6]

## Dev Agent Record

### Context Reference

- [Story Context XML](./2-6-session-persistence-and-resume.context.xml) - Generated 2025-11-29

### Agent Model Used

<!-- Will be filled by dev agent -->

### Debug Log References

<!-- Will be filled during implementation -->

### Completion Notes List

<!-- Will be filled during implementation -->

### File List

<!-- Will be filled during implementation -->
