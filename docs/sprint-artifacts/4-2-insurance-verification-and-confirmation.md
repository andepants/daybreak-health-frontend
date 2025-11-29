# Story 4.2: Insurance Verification and Confirmation

Status: drafted

## Story

As a parent,
I want to see a confirmation of my submitted insurance information,
so that I can verify the details are correct before proceeding.

## Acceptance Criteria

| # | Criterion | Testable Assertion |
|---|-----------|-------------------|
| AC-4.2.1 | Processing state shows during mutation | Loading indicator visible while `isSaving` is true |
| AC-4.2.2 | Confirmation shows carrier and masked member ID | Member ID shows `****XXXX` format (last 4 visible) |
| AC-4.2.3 | Edit link returns to form with data preserved | Clicking edit shows form with previously entered values |
| AC-4.2.4 | Error state shows specific message and retry | Error displayed with "Try again" action |
| AC-4.2.5 | Success confirmation completes in < 2s | Mutation + UI update within 2000ms |
| AC-4.2.6 | Insurance data persists in session | Refresh page shows confirmation view |

## Tasks / Subtasks

- [ ] Task 1: Create loading/processing state UI (AC: 4.2.1)
  - [ ] Create InsuranceConfirmation.tsx component
  - [ ] Add loading indicator during mutation
  - [ ] Use existing loading animation patterns from Epic 2
  - [ ] Write unit test for loading state display

- [ ] Task 2: Build confirmation display with masked member ID (AC: 4.2.2)
  - [ ] Display carrier name from saved data
  - [ ] Create maskMemberId utility function (show last 4 only: ****XXXX)
  - [ ] Display masked member ID in confirmation view
  - [ ] Write unit test for masking utility

- [ ] Task 3: Implement edit functionality (AC: 4.2.3)
  - [ ] Add Edit link/button to confirmation view
  - [ ] Wire edit to return to form with preserved data
  - [ ] Ensure form pre-populates with existing values from cache
  - [ ] Write integration test for edit flow

- [ ] Task 4: Implement error handling with retry (AC: 4.2.4)
  - [ ] Display specific error messages on mutation failure
  - [ ] Add "Try again" retry button
  - [ ] Clear error on retry attempt
  - [ ] Write integration test for error recovery

- [ ] Task 5: Ensure performance target (AC: 4.2.5)
  - [ ] Measure mutation + UI update time
  - [ ] Optimize if exceeds 2s target
  - [ ] Write E2E test verifying timing constraint

- [ ] Task 6: Implement session persistence (AC: 4.2.6)
  - [ ] Ensure Apollo cache persistence for insurance data
  - [ ] Verify refresh shows confirmation view
  - [ ] Write integration test for data persistence on refresh

- [ ] Task 7: Integration testing
  - [ ] Write full flow tests: submit → processing → confirmation
  - [ ] Test error scenarios (network failure, validation errors)
  - [ ] Test edit and resubmit flow

## Dev Notes

### Dependencies from Story 4.1
- Requires InsuranceForm.tsx from Story 4.1
- Requires useInsurance hook with submitInsurance mutation
- Requires insurance.graphql operations
- Builds on form validation from lib/validations/insurance.ts

### Architecture Patterns
- Use Apollo Client mutation states (loading, error, data)
- PHI Protection: Mask member ID in display (****XXXX format)
- Never log PHI to console
- Use optimistic response for immediate UI feedback
[Source: docs/sprint-artifacts/tech-spec-epic-4.md#Security]

### Component Structure
- Confirmation component: features/insurance/InsuranceConfirmation.tsx
- Masking utility: lib/utils/phiGuard.ts or features/insurance/utils.ts
- Follow co-located pattern: component + logic + GraphQL ops
[Source: docs/sprint-artifacts/tech-spec-epic-4.md#Components-Referenced]

### Testing Standards
- Unit tests for masking utility (phiGuard)
- Integration tests for mutation flow and error handling
- E2E test for timing verification (< 2s requirement)
- Test refresh persistence via cache
[Source: docs/sprint-artifacts/tech-spec-epic-4.md#Test-Strategy-Summary]

### Project Structure Notes
- Place in features/insurance/ alongside InsuranceForm from Story 4.1
- Follow existing component patterns from Epic 2 and Epic 3
- Use shadcn/ui components for consistent styling

### Data Models
**InsuranceInformation Type (from GraphQL Schema):**
```typescript
type InsuranceInformation = {
  id: string;
  provider: string;       // Insurance carrier name
  planName?: string;      // Optional plan name
  memberId: string;       // Member/subscriber ID
  groupId?: string;       // Group number (optional)
  imageFileUrl?: string;  // Reserved for Growth (OCR)
};
```

**Confirmation Display:**
- Show carrier name (full)
- Show masked member ID (e.g., "****1234")
- Show group ID if provided
- Green checkmark icon for success
- Edit button to return to form

### PHI Protection Requirements
- NEVER log member ID to console
- Mask member ID in all UI displays
- Use phiGuard utility for any debugging
- No PHI in URLs or error messages
[Source: docs/architecture.md#Security-Architecture]

### Performance Requirements
- Mutation + UI update must complete in < 2s (AC-4.2.5)
- Use optimistic response for immediate feedback
- Loading state should appear within 200ms
[Source: docs/sprint-artifacts/tech-spec-epic-4.md#NFR-Performance]

### References
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md#Story-4.2]
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md#Workflows-and-Sequencing]
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md#NFR-Performance]
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md#Security]
- [Source: docs/architecture.md#Security-Architecture]

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
