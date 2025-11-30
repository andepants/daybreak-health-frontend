# Story 5.5: Email Confirmation and Reminders

Status: ready-for-dev

## Story

As a **parent**,
I want **to receive email confirmation of my appointment**,
So that **I have a record and won't forget**.

## Acceptance Criteria

1. **Confirmation Email Trigger**
   - Given I have successfully booked an appointment
   - When the booking is confirmed
   - Then within 1 minute I receive an email with:
     - Subject: "Your appointment with [Therapist] is confirmed!"
     - Daybreak branding and warm tone
     - Appointment details (date, time, therapist)
     - Add to calendar attachment (.ics file)
     - Join link for video call
     - Reschedule/cancel links
     - Support contact information

2. **Email Responsiveness**
   - Given the confirmation email is sent
   - When I open it on any device
   - Then the email is mobile-friendly and responsive

3. **PHI Protection**
   - Given the email contains appointment information
   - When I review the email content
   - Then the email does not contain excessive PHI (Protected Health Information)

4. **Frontend Confirmation Display**
   - Given the booking mutation succeeds
   - When I view the confirmation screen
   - Then I see "Confirmation email sent to [email]" message

5. **Email Failure Handling**
   - Given the backend email service fails
   - When I complete booking
   - Then I see "Email pending" with support contact information

## Tasks / Subtasks

- [ ] Task 1: Implement frontend confirmation messaging (AC: #4)
  - [ ] Add email confirmation message to booking confirmation screen
  - [ ] Display user's email address from session data
  - [ ] Add subtle email icon or indicator
  - [ ] Test message displays immediately after booking success

- [ ] Task 2: Handle email failure states (AC: #5)
  - [ ] Add error handling for email service failures
  - [ ] Display "Email pending" message when backend indicates failure
  - [ ] Show support contact information in failure state
  - [ ] Add retry mechanism if backend supports it
  - [ ] Test offline/failure scenarios

- [ ] Task 3: Update GraphQL types and mutations (AC: #1, #4, #5)
  - [ ] Review `bookAppointment` mutation response type
  - [ ] Ensure response includes email confirmation status field
  - [ ] Add email status to `types/graphql.ts` after codegen
  - [ ] Update mutation to handle email status response

- [ ] Task 4: Add email status to confirmation component (AC: #4, #5)
  - [ ] Update `features/scheduling/Confirmation.tsx`
  - [ ] Add conditional rendering based on email status
  - [ ] Style email confirmation message to match Daybreak theme
  - [ ] Ensure accessibility with proper ARIA labels

- [ ] Task 5: Documentation and backend coordination (AC: #1, #2, #3)
  - [ ] Document email template requirements for backend team
  - [ ] Confirm .ics calendar file attachment format
  - [ ] Verify join link generation is handled by backend
  - [ ] Document PHI protection requirements for email content
  - [ ] Add dev notes about backend email service integration

- [ ] Task 6: Testing (All ACs)
  - [ ] Write unit tests for email status display logic
  - [ ] Test success state with mocked successful email response
  - [ ] Test failure state with mocked failed email response
  - [ ] Add E2E test for complete booking flow with email confirmation
  - [ ] Verify no PHI exposed in frontend logs or state

## Dev Notes

### Architecture Patterns and Constraints

**Email Handling Responsibility:**
- **Backend Responsibility:** Email sending, template rendering, .ics file generation, delivery tracking
- **Frontend Responsibility:** Display confirmation message, handle email status responses, provide fallback UI for failures

**GraphQL Integration:**
- The `bookAppointment` mutation should return an email status field (e.g., `emailSent: Boolean`, `emailStatus: String`)
- Frontend does not trigger email directly - mutation side effect on backend handles email delivery
- Use Apollo Client's `useMutation` hook with proper error handling

**PHI Protection:**
- Per Architecture requirement: "No PHI in frontend state, logs, or URLs"
- Email address display is acceptable as it's contact information already collected
- Do not log appointment details, therapist names, or assessment information
- Use `phi-guard.ts` utility if logging email-related operations

**Error Handling:**
- Email failure should not block booking confirmation
- User should always see booking success even if email fails
- Provide clear path to support if email doesn't arrive
- Consider retry mechanism if backend supports it

### Project Structure Notes

**Files to Modify:**
- `/features/scheduling/Confirmation.tsx` - Add email confirmation message
- `/features/scheduling/useScheduling.ts` - Handle email status from mutation response
- `/features/scheduling/scheduling.graphql` - Ensure mutation includes email status in response
- `/types/graphql.ts` - Will be auto-generated after GraphQL schema update

**New Components (if needed):**
- Consider extracting email status message to reusable component if used elsewhere

**Styling:**
- Use Daybreak theme colors per Architecture (teal, cream, warm orange)
- Email icon from shadcn/ui icon set or similar
- Success message in success green (#10B981)
- Failure message in error red (#E85D5D) with supportive tone

### References

**From Epics.md:**
- [Source: docs/epics.md#Story-5.5-Email-Confirmation-and-Reminders]
- Epic 5: Therapist Matching & Booking
- Covers FR-015: Email notifications
- Note: "Email sending is a backend responsibility. This story covers the trigger from frontend and displaying 'Email sent' confirmation."

**From Architecture.md:**
- [Source: docs/architecture.md#Pre-mortem-Risk-Mitigations]
- PHI protection requirements
- [Source: docs/architecture.md#Project-Structure]
- Component organization in `features/scheduling/`

**Backend Integration:**
- Email template design is outside frontend scope
- .ics calendar file format: Standard RFC 5545
- Email delivery service (e.g., SendGrid, Postmark) configured on backend
- Join link generation handled by backend scheduling service

### Testing Standards Summary

**Unit Tests (Vitest):**
- Test email confirmation message renders with correct email address
- Test email pending state renders with support contact
- Test mutation success/failure handling
- Mock Apollo mutation responses

**E2E Tests (Playwright):**
- Complete booking flow ending with email confirmation message
- Verify email confirmation text appears on success screen
- Test that booking succeeds even if email status indicates failure

**Accessibility:**
- Email confirmation message should have appropriate ARIA labels
- Support contact link should be keyboard accessible
- Success/failure states should be announced to screen readers

### Learnings from Previous Story

First story in Epic 5 - no predecessor context

## Dev Agent Record

### Context Reference

- Story Context XML: `/Users/andre/coding/daybreak/daybreak-health-frontend/docs/sprint-artifacts/5-5-email-confirmation-and-reminders.context.xml`
- Generated: 2025-11-29
- Ready for implementation by dev agent

### Agent Model Used

<!-- Will be filled during implementation -->

### Debug Log References

<!-- Will be filled during implementation -->

### Completion Notes List

<!-- Will be filled during implementation -->

### File List

<!-- Will be filled during implementation -->

## Change Log

- 2025-11-29: Story created by SM agent via create-story workflow
