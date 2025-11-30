# Story 7.2: Session Context Passing

Status: done

## Story

As a **support staff member**,
I want **to see the parent's onboarding context when they reach out**,
so that **I can help them quickly without asking repetitive questions**.

## Acceptance Criteria

1. **Context Data Passed to Intercom**
   - When parent opens Intercom chat during onboarding, the following User Attributes are passed:
     - Parent name (if collected)
     - Email address
     - Current onboarding step (e.g., "assessment", "insurance", "scheduling")
     - Session ID for lookup
     - Child's name (if collected, for context)

2. **Custom Attributes Configuration**
   - `onboarding_step`: Current step in flow
   - `session_id`: Onboarding session ID
   - `assessment_complete`: Boolean
   - `insurance_submitted`: Boolean

3. **Context Updates**
   - Context updates as parent progresses through onboarding
   - Updates triggered on route changes

4. **Backend Integration**
   - Staff can view full session in Daybreak admin via session ID
   - Session lookup uses the passed session ID

5. **PHI Protection**
   - No sensitive PHI is passed to Intercom (assessment details stay in backend)
   - Only non-sensitive identifiers are transmitted
   - Filter out any protected health information

## Tasks / Subtasks

- [x] Task 1: Create Intercom context hook (AC: #1, #2, #3)
  - [x] Create `useIntercomContext` hook in `features/support-chat/`
  - [x] Implement context update logic using Intercom `update` method
  - [x] Define TypeScript interface for Intercom user attributes
  - [x] Add PHI filtering utility

- [x] Task 2: Integrate context updates on route changes (AC: #3)
  - [x] Add `useEffect` in onboarding layout to detect route changes
  - [x] Call context update on step transitions
  - [x] Ensure session data is available before update

- [x] Task 3: Map onboarding session state to Intercom attributes (AC: #1, #2, #5)
  - [x] Extract parent name and email from session
  - [x] Extract child name from session (if available)
  - [x] Map current route to onboarding step name
  - [x] Calculate boolean flags (assessment_complete, insurance_submitted)
  - [x] Filter out PHI fields

- [x] Task 4: Testing and validation (AC: #4, #5)
  - [x] Write unit tests for `useIntercomContext` hook
  - [x] Test PHI filtering utility
  - [x] Verify Intercom receives correct attributes
  - [x] Test context updates on navigation
  - [x] Verify no PHI in Intercom payload

## Dev Notes

### Relevant Architecture Patterns and Constraints

**Intercom Integration:**
- Use Intercom JavaScript API `window.Intercom('update', { ... })` to pass attributes
- Call on route changes via `useEffect` in onboarding layout
- Initialize Intercom widget first (Story 7.1 prerequisite)

**PHI Protection (Critical):**
- **NEVER** pass assessment content, specific concerns, or clinical details to Intercom
- Only pass non-sensitive identifiers: session ID, step names, boolean flags
- Assessment details must remain in backend only
- Use PHI filtering utility before any third-party data transmission

**State Management:**
- Context data sourced from Apollo Client cache (OnboardingSession)
- Session state includes: demographics, assessment completion, insurance submission status
- Route detection via Next.js router or layout props

**Error Handling:**
- Gracefully handle missing session data (early in onboarding)
- Don't block user flow if Intercom update fails
- Log errors for debugging but continue

### Source Tree Components to Touch

**New Files:**
- `features/support-chat/useIntercomContext.ts` - Hook for managing Intercom context updates
- `lib/utils/phi-filter.ts` - Utility to strip PHI from data before external transmission

**Modified Files:**
- `app/onboarding/[sessionId]/layout.tsx` - Add context update on route changes
- `features/support-chat/types.ts` - TypeScript types for Intercom attributes

**Patterns to Follow:**
- Co-locate Intercom logic in `features/support-chat/`
- Follow PHI protection checklist from Architecture (lines 652-662)
- Use existing session state hooks (`useOnboardingSession`)

### Testing Standards Summary

**Unit Tests (Vitest):**
- Test `useIntercomContext` hook with mock session data
- Test PHI filtering utility removes sensitive fields
- Test attribute mapping logic
- Test graceful handling of incomplete session data

**Integration Tests:**
- Verify Intercom `update` called with correct attributes on mount
- Verify context updates when navigating between onboarding steps
- Verify no PHI in any Intercom payloads

**E2E Tests (Optional):**
- Navigate through onboarding flow
- Verify Intercom widget shows updated context at each step

### Project Structure Notes

**Alignment with Unified Project Structure:**
- Follows feature-based organization: `features/support-chat/`
- Utilities in `lib/utils/` per Architecture conventions
- Hook naming: `useIntercomContext` (camelCase with `use` prefix)

**No Conflicts Detected:**
- Story 7.1 (Intercom Widget Integration) provides foundation
- This story extends existing Intercom integration
- No overlapping responsibilities with other features

### References

- [Source: docs/epics.md#Story-7.2-Session-Context-Passing]
- [Source: docs/architecture.md#Security-Architecture] - PHI Protection Checklist (lines 652-662)
- [Source: docs/architecture.md#API-Contracts] - Session state structure
- [Source: docs/architecture.md#Data-Architecture] - OnboardingSession interface (lines 482-527)
- [Source: docs/architecture.md#Consistency-Rules] - Logging strategy and PHI guard utility (lines 456-472)

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/stories/7-2-session-context-passing.context.xml` - Story context generated on 2025-11-30

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

### Completion Notes List

**2025-11-30:** Story implementation completed
- Created PHI filtering utility (`lib/utils/phi-filter.ts`) with comprehensive filtering and validation
- Created Intercom types (`features/support-chat/types.ts`) for user attributes with index signature
- Created `useIntercomContext` hook with automatic context updates on session/route changes
- Integrated hook into onboarding layout for real-time context updates
- Updated Intercom TypeScript definitions to support user data attributes
- Wrote comprehensive unit tests (48 total tests, all passing):
  - 25 tests for PHI filter utility (100% coverage of filtering, validation, and edge cases)
  - 23 tests for useIntercomContext hook (session mapping, route changes, PHI filtering, error handling)
- All TypeScript compilation passes with no errors in new code
- PHI protection verified through automated tests - no sensitive data leaks to Intercom

### File List

**New Files Created:**
- `lib/utils/phi-filter.ts` - PHI filtering utility with filterPHI(), containsPHI(), and validateNoPHI() functions
- `features/support-chat/types.ts` - TypeScript interfaces for Intercom user attributes and configuration
- `features/support-chat/useIntercomContext.ts` - Hook for managing Intercom context updates
- `features/support-chat/index.ts` - Feature exports barrel file
- `tests/unit/lib/utils/phi-filter.test.ts` - Comprehensive PHI filter tests (25 tests)
- `tests/unit/features/support-chat/useIntercomContext.test.ts` - Hook tests (23 tests)

**Modified Files:**
- `app/onboarding/[sessionId]/layout.tsx` - Added useIntercomContext hook integration
- `types/intercom.d.ts` - Enhanced with IntercomUserData interface for user attributes

## Change Log

**2025-11-30:** Story created from Epic 7 breakdown
