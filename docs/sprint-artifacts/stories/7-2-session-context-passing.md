# Story 7.2: Session Context Passing

Status: drafted

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

- [ ] Task 1: Create Intercom context hook (AC: #1, #2, #3)
  - [ ] Create `useIntercomContext` hook in `features/support-chat/`
  - [ ] Implement context update logic using Intercom `update` method
  - [ ] Define TypeScript interface for Intercom user attributes
  - [ ] Add PHI filtering utility

- [ ] Task 2: Integrate context updates on route changes (AC: #3)
  - [ ] Add `useEffect` in onboarding layout to detect route changes
  - [ ] Call context update on step transitions
  - [ ] Ensure session data is available before update

- [ ] Task 3: Map onboarding session state to Intercom attributes (AC: #1, #2, #5)
  - [ ] Extract parent name and email from session
  - [ ] Extract child name from session (if available)
  - [ ] Map current route to onboarding step name
  - [ ] Calculate boolean flags (assessment_complete, insurance_submitted)
  - [ ] Filter out PHI fields

- [ ] Task 4: Testing and validation (AC: #4, #5)
  - [ ] Write unit tests for `useIntercomContext` hook
  - [ ] Test PHI filtering utility
  - [ ] Verify Intercom receives correct attributes
  - [ ] Test context updates on navigation
  - [ ] Verify no PHI in Intercom payload

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

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

### Completion Notes List

### File List

## Change Log

**2025-11-30:** Story created from Epic 7 breakdown
