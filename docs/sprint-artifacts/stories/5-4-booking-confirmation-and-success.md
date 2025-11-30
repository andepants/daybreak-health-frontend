# Story 5.4: Booking Confirmation and Success

Status: ready-for-dev

## Story

As a **parent**,
I want **confirmation that my appointment is booked**,
so that **I know help is on the way for my child**.

## Acceptance Criteria

1. **Given** I click "Confirm Booking"
   **When** the booking is processed
   **Then** I see a "Booking your appointment..." loading state with a brief loading indicator

2. **Given** the booking is successfully processed
   **When** the success state renders
   **Then** I see:
   - Celebration moment (confetti animation, warm illustration)
   - "You're all set!" heading
   - Appointment details card with:
     - Therapist name and photo
     - Date and time
     - "Video call" format indicator
     - "Add to calendar" buttons (Google, Apple, Outlook)
   - What's next section with:
     - "Check your email for confirmation"
     - "Join link will be sent before appointment"
     - "You can reschedule or cancel anytime"

3. **Given** the success state is displayed
   **When** I click "Add to calendar"
   **Then** an ICS calendar file is downloaded for the selected platform

4. **Given** the success state is displayed
   **When** I click "Done"
   **Then** I am returned to the landing page or dashboard

5. **Given** the booking mutation completes successfully
   **Then** a confirmation email is triggered (FR-015)

6. **Given** the booking is confirmed
   **Then** the appointment shows in any existing Daybreak dashboard

## Tasks / Subtasks

- [ ] Task 1: Create booking confirmation component (AC: 1, 2)
  - [ ] Subtask 1.1: Create `features/scheduling/Confirmation.tsx` component
  - [ ] Subtask 1.2: Implement processing/loading state UI
  - [ ] Subtask 1.3: Implement success state UI with celebration animation
  - [ ] Subtask 1.4: Design and implement appointment details card
  - [ ] Subtask 1.5: Create "What's next" information section
  - [ ] Subtask 1.6: Add confetti animation using canvas-confetti library

- [ ] Task 2: Implement "Add to calendar" functionality (AC: 3)
  - [ ] Subtask 2.1: Create ICS file generation utility function
  - [ ] Subtask 2.2: Implement calendar button components (Google, Apple, Outlook)
  - [ ] Subtask 2.3: Generate platform-specific calendar links/downloads
  - [ ] Subtask 2.4: Test ICS file format compatibility across platforms

- [ ] Task 3: Implement booking mutation and state management (AC: 1, 5)
  - [ ] Subtask 3.1: Create `BookAppointment.graphql` mutation file
  - [ ] Subtask 3.2: Implement mutation in `useScheduling.ts` hook
  - [ ] Subtask 3.3: Configure optimistic response for immediate UI feedback
  - [ ] Subtask 3.4: Handle mutation loading, success, and error states
  - [ ] Subtask 3.5: Verify email confirmation trigger on backend

- [ ] Task 4: Implement navigation and completion flow (AC: 4, 6)
  - [ ] Subtask 4.1: Implement "Done" button with proper navigation
  - [ ] Subtask 4.2: Update session status to "completed" in backend
  - [ ] Subtask 4.3: Clear local state on completion
  - [ ] Subtask 4.4: Verify dashboard integration (if dashboard exists)

- [ ] Task 5: Testing and error handling (AC: All)
  - [ ] Subtask 5.1: Write unit tests for Confirmation component
  - [ ] Subtask 5.2: Write unit tests for ICS generation utility
  - [ ] Subtask 5.3: Implement error state for failed booking
  - [ ] Subtask 5.4: Write E2E test for complete booking flow
  - [ ] Subtask 5.5: Test accessibility with screen readers
  - [ ] Subtask 5.6: Test calendar downloads on different platforms

## Dev Notes

### Architecture Patterns and Constraints

**Component Location:**
- Main component: `features/scheduling/Confirmation.tsx`
- ICS utility: `lib/utils/calendar.ts`
- GraphQL mutation: `features/scheduling/scheduling.graphql`
- Hook: `features/scheduling/useScheduling.ts`

**Styling Guidelines:**
- Use Daybreak theme colors (teal primary, warm orange for celebration)
- Cream background (#FEF7ED)
- Follow mobile-first responsive design
- Minimum 44x44px touch targets (WCAG compliance)

**State Management:**
- Use Apollo Client `useMutation` for booking
- Implement optimistic response for instant feedback
- Clear mutation state on unmount
- Store confirmation data in session for potential review

**Animation:**
- Confetti animation via `canvas-confetti` library (lightweight)
- Fade-in animation for success card
- Smooth transitions between states

**Calendar Integration:**
- Generate ICS format (RFC 5545 compliant)
- Support Google Calendar, Apple Calendar, Outlook
- Include therapist name, appointment time, video call link (placeholder)
- Set reminder 15 minutes before appointment

**Security Considerations:**
- No PHI in console logs
- Therapist details already visible in previous steps
- Video call link will be sent via email (not generated client-side)

### Testing Standards

**Unit Tests (Vitest + React Testing Library):**
- Confirmation component rendering states
- ICS file generation utility
- Mutation hook behavior
- Calendar button interactions

**E2E Tests (Playwright):**
- Complete booking flow from time selection to confirmation
- Calendar download functionality
- Navigation after completion
- Error recovery flow

**Accessibility:**
- Screen reader announcements for success state
- Keyboard navigation for all interactive elements
- ARIA labels for calendar buttons
- Focus management after booking completes

### References

[Source: docs/epics.md#Story-5.4]
[Source: docs/architecture.md#Implementation-Patterns]
[Source: docs/prd.md#FR-013-FR-015]

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/5-4-booking-confirmation-and-success.context.xml`

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
