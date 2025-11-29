# Story 4.3: Self-Pay Option Flow

Status: drafted

## Story

As a parent without insurance or preferring self-pay,
I want to choose self-pay as my payment option,
so that I can proceed with booking therapy sessions for my child.

## Acceptance Criteria

| # | Criterion | Testable Assertion |
|---|-----------|-------------------|
| AC-4.3.1 | Modal displays clear pricing information | Price per session visible in modal |
| AC-4.3.2 | Supportive, non-judgmental messaging present | Copy includes empathy language |
| AC-4.3.3 | "Proceed with self-pay" marks session as self-pay | Session `isSelfPay` flag set to true |
| AC-4.3.4 | "I'll add insurance later" closes modal | Modal dismisses, form remains |
| AC-4.3.5 | Self-pay selection navigates to matching | User proceeds to therapist matching |
| AC-4.3.6 | Self-pay can be changed before first appointment | Flag is updatable in session |

## Tasks / Subtasks

- [ ] Task 1: Create SelfPayModal component with pricing (AC: 4.3.1)
  - [ ] Create SelfPayModal.tsx using Radix Dialog
  - [ ] Display clear pricing information (price per session)
  - [ ] Source pricing from environment config
  - [ ] Write unit test for pricing display

- [ ] Task 2: Add supportive messaging (AC: 4.3.2)
  - [ ] Write empathetic, non-judgmental copy
  - [ ] Include supportive language for stressful situation
  - [ ] Write unit test verifying empathy copy present

- [ ] Task 3: Implement "Proceed with self-pay" action (AC: 4.3.3)
  - [ ] Add setSelfPay function to useInsurance hook
  - [ ] Update session isSelfPay flag on click
  - [ ] Write integration test for session update

- [ ] Task 4: Implement "I'll add insurance later" action (AC: 4.3.4)
  - [ ] Add close handler that dismisses modal
  - [ ] Ensure form remains with no changes
  - [ ] Write unit test for modal dismiss

- [ ] Task 5: Implement navigation after self-pay (AC: 4.3.5)
  - [ ] Navigate to therapist matching after setSelfPay
  - [ ] Ensure proper routing
  - [ ] Write integration test for navigation

- [ ] Task 6: Implement self-pay changeability (AC: 4.3.6)
  - [ ] Ensure isSelfPay flag is updatable
  - [ ] Allow changing before first appointment
  - [ ] Write integration test for flag update

- [ ] Task 7: Integrate with insurance form
  - [ ] Wire "I don't have insurance" link to open modal
  - [ ] Handle modal open/close state
  - [ ] Write integration test for modal trigger

- [ ] Task 8: Add Contact Us option
  - [ ] Add "Contact us" link/button in modal
  - [ ] Wire to support chat opening
  - [ ] Write unit test for contact action

## Dev Notes

### Dependencies from Story 4.1 & 4.2
- Modal triggered from InsuranceForm (Story 4.1)
- Uses useInsurance hook patterns
- Session state management from earlier stories

### Architecture Patterns
- Use Radix Dialog for modal (consistent with existing UI patterns)
- Supportive, non-judgmental UX copy
- Mobile-first with minimum touch targets (44x44px)
[Source: docs/sprint-artifacts/tech-spec-epic-4.md#Services-and-Modules]

### Component Structure
- Modal: features/insurance/SelfPayModal.tsx
- Hook addition: useInsurance.setSelfPay()
[Source: docs/sprint-artifacts/tech-spec-epic-4.md#Components-Referenced]

### Pricing Configuration
- Store self-pay price in environment config
- Fallback if backend unavailable
[Source: docs/sprint-artifacts/tech-spec-epic-4.md#Assumptions]

### Testing Standards
- Unit tests for modal content and interactions
- Integration tests for session flag updates
- Integration tests for navigation flow
[Source: docs/sprint-artifacts/tech-spec-epic-4.md#Test-Strategy-Summary]

### Project Structure Notes
- Place in features/insurance/ alongside other insurance components
- Follow existing modal patterns (check components/ui/dialog.tsx)

### Self-Pay Flow Sequence
From tech spec section "Workflows and Sequencing":
```
1. User clicks "I don't have insurance" link
2. SelfPayModal opens
3. Modal displays pricing info and supportive messaging
4. User can:
   a. Click "Proceed with self-pay" → Session marked as self-pay, continue to matching
   b. Click "I'll add insurance later" → Close modal, return to form
   c. Click "Contact us" → Opens support chat
5. If self-pay selected → Update session, navigate to matching
```

### PHI Protection
- No pricing or payment info is PHI
- Session flag update follows standard security patterns
- No PHI logging or exposure

### UI/UX Considerations
- Modal should be dismissible (ESC key, outside click, close button)
- Supportive messaging example: "We believe every family deserves access to care"
- No judgment language
- Warm, Daybreak brand tone
[Source: docs/architecture.md#UX-Design-Specification]

### References
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md#Story-4.3]
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md#Workflows-and-Sequencing]
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md#Services-and-Modules]
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md#Acceptance-Criteria]
- [Source: docs/epics.md#Story-4.3]

## Dev Agent Record

### Context Reference
<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used
<!-- Will be filled by dev agent -->

### Debug Log References

### Completion Notes List

### File List

## Change Log
- 2025-11-29: Story drafted from tech-spec-epic-4.md
