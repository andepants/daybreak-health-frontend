# Story 4.1: Manual Insurance Entry Form

Status: drafted

## Story

As a parent,
I want to enter my insurance information through a user-friendly form,
so that I can verify my coverage for my child's therapy sessions.

## Acceptance Criteria

| # | Criterion | Testable Assertion |
|---|-----------|-------------------|
| AC-4.1.1 | Form displays with searchable carrier dropdown | Dropdown contains 20+ carriers with search filtering |
| AC-4.1.2 | Member ID field validates 5-30 alphanumeric characters | Error shown for < 5 or > 30 chars, or invalid chars |
| AC-4.1.3 | Group number is optional but validates format if provided | Form submits with empty group number, validates if entered |
| AC-4.1.4 | Subscriber name defaults to parent name when relationship is "Self" | Selecting "Self" populates subscriber name from session |
| AC-4.1.5 | Form validates on blur with specific error messages | Error appears below field on blur, clears on valid input |
| AC-4.1.6 | "I don't have insurance" link opens self-pay modal | Click triggers modal with self-pay information |
| AC-4.1.7 | Continue button disabled until form valid | Button state matches form validity |
| AC-4.1.8 | Auto-save triggers on field blur | Network request fires 500ms after blur |

## Tasks / Subtasks

- [ ] Task 1: Create insurance carrier dropdown component (AC: 4.1.1)
  - [ ] Create INSURANCE_CARRIERS data file with top 20+ carriers
  - [ ] Implement searchable Select component with carrier options
  - [ ] Add format hints per carrier (member ID examples)
  - [ ] Write unit tests for carrier search filtering

- [ ] Task 2: Build insurance form with validation (AC: 4.1.2, 4.1.3, 4.1.5)
  - [ ] Create InsuranceForm.tsx component in features/insurance/
  - [ ] Implement insuranceSchema Zod validation in lib/validations/insurance.ts
  - [ ] Add member ID validation (5-30 alphanumeric with hyphens)
  - [ ] Add optional group number validation (max 30 alphanumeric with hyphens)
  - [ ] Implement blur validation with error display below fields
  - [ ] Write unit tests for all validation rules

- [ ] Task 3: Implement subscriber relationship logic (AC: 4.1.4)
  - [ ] Add relationship dropdown (Self, Spouse, Child, Other)
  - [ ] Add subscriber name field
  - [ ] Auto-populate subscriber name when "Self" selected
  - [ ] Write integration test for auto-population

- [ ] Task 4: Add self-pay modal trigger (AC: 4.1.6)
  - [ ] Add "I don't have insurance" link below form
  - [ ] Wire click handler to open SelfPayModal
  - [ ] Write unit test for link click behavior

- [ ] Task 5: Implement form state and continue button (AC: 4.1.7)
  - [ ] Track form validity state with React Hook Form
  - [ ] Disable Continue button until form is valid
  - [ ] Write integration test for button state transitions

- [ ] Task 6: Implement auto-save on blur (AC: 4.1.8)
  - [ ] Integrate useAutoSave hook with form
  - [ ] Debounce saves by 500ms after blur
  - [ ] Write unit test for debounced save calls

- [ ] Task 7: Create GraphQL operations
  - [ ] Create insurance.graphql with SubmitInsuranceInfo mutation
  - [ ] Generate TypeScript types with GraphQL codegen
  - [ ] Create useInsurance.ts hook with mutation and state

- [ ] Task 8: Create insurance route page
  - [ ] Create app/onboarding/[sessionId]/insurance/page.tsx
  - [ ] Integrate InsuranceForm component
  - [ ] Add progress indicator update (step 3 of 5)
  - [ ] Add navigation to matching on success

- [ ] Task 9: Integration testing
  - [ ] Write integration tests for full form flow
  - [ ] Test validation error display and clearing
  - [ ] Test auto-save triggering and persistence
  - [ ] Test form submission and success flow

## Dev Notes

### Architecture Patterns
- Use React Hook Form with Zod resolver for form state management
- Follow component patterns from existing form components (check features/assessment/form/ and features/demographics/)
- PHI Protection: Never log member ID to console, use phiGuard utility
- Mobile-first design with touch targets minimum 44x44px
- Form validates on blur, not on every keystroke
[Source: docs/architecture.md, docs/sprint-artifacts/tech-spec-epic-4.md#Security]

### Component Structure
- Main form: features/insurance/InsuranceForm.tsx
- Hook: features/insurance/useInsurance.ts
- GraphQL: features/insurance/insurance.graphql
- Validation: lib/validations/insurance.ts
- Data: lib/data/insurance-carriers.ts
- Route: app/onboarding/[sessionId]/insurance/page.tsx
[Source: docs/sprint-artifacts/tech-spec-epic-4.md#Components-Referenced]

### Data Models

**InsuranceFormState (Frontend)**
```typescript
interface InsuranceFormState {
  carrier: string;             // Selected carrier from dropdown
  memberId: string;            // Member ID (5-30 alphanumeric)
  groupNumber: string;         // Group number (optional, max 30)
  subscriberName: string;      // Name on insurance card
  relationshipToSubscriber: 'Self' | 'Spouse' | 'Child' | 'Other';
}
```

**Zod Schema**
```typescript
// lib/validations/insurance.ts
import { z } from 'zod';

export const insuranceSchema = z.object({
  carrier: z.string().min(1, 'Please select an insurance carrier'),
  memberId: z.string()
    .min(5, 'Member ID must be at least 5 characters')
    .max(30, 'Member ID must be 30 characters or less')
    .regex(/^[A-Za-z0-9-]+$/, 'Member ID can only contain letters, numbers, and hyphens'),
  groupNumber: z.string()
    .max(30, 'Group number must be 30 characters or less')
    .regex(/^[A-Za-z0-9-]*$/, 'Group number can only contain letters, numbers, and hyphens')
    .optional()
    .or(z.literal('')),
  subscriberName: z.string()
    .min(2, 'Subscriber name must be at least 2 characters')
    .max(100, 'Subscriber name must be 100 characters or less'),
  relationshipToSubscriber: z.enum(['Self', 'Spouse', 'Child', 'Other']),
});

export type InsuranceFormData = z.infer<typeof insuranceSchema>;
```

**Insurance Carriers List**
```typescript
// lib/data/insurance-carriers.ts
export const INSURANCE_CARRIERS = [
  { id: 'aetna', name: 'Aetna', idFormat: 'W followed by 9 digits' },
  { id: 'anthem', name: 'Anthem Blue Cross', idFormat: '3 letters + 9 digits' },
  { id: 'bcbs', name: 'Blue Cross Blue Shield', idFormat: '3 letters + 9-12 digits' },
  { id: 'cigna', name: 'Cigna', idFormat: 'U followed by 8 digits' },
  { id: 'humana', name: 'Humana', idFormat: 'H followed by 8 digits' },
  { id: 'kaiser', name: 'Kaiser Permanente', idFormat: '8-10 digits' },
  { id: 'united', name: 'UnitedHealthcare', idFormat: '9-11 alphanumeric' },
  // ... add 13+ more carriers
  { id: 'other', name: 'Other', idFormat: 'Check your insurance card' },
];
```

### GraphQL Operations

```graphql
# features/insurance/insurance.graphql

# Submit manual insurance entry
mutation SubmitInsuranceInfo($input: SubmitInsuranceInfoInput!) {
  submitInsuranceInfo(input: $input) {
    id
    status
    insuranceInfo {
      id
      provider
      planName
      memberId
      groupId
    }
  }
}

# Query to check existing insurance info
query GetInsuranceInfo($sessionId: ID!) {
  getOnboardingSession(id: $sessionId) {
    id
    status
    insuranceInfo {
      id
      provider
      planName
      memberId
      groupId
    }
  }
}
```

**useInsurance Hook Interface**
```typescript
// features/insurance/useInsurance.ts
interface UseInsuranceReturn {
  insuranceInfo: InsuranceInformation | null;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  submitInsurance: (data: InsuranceFormData) => Promise<void>;
  setSelfPay: () => void;
  clearError: () => void;
}
```

### Testing Standards
- Unit tests with Vitest + RTL for form components and Zod schemas
- Integration tests for form submission flow and auto-save
- Test PHI protection: verify no member ID in console logs
- Test accessibility: WCAG 2.1 AA compliance, touch targets
[Source: docs/sprint-artifacts/tech-spec-epic-4.md#Test-Strategy-Summary]

### Project Structure Notes
- Place components in features/insurance/ directory
- Follow existing patterns from features/assessment/ and features/demographics/
- Use shadcn/ui components (Input, Select, Button, Dialog) styled to Daybreak theme
- Auto-save pattern matches existing implementation in demographics forms

### Performance Requirements
| Metric | Target | Source |
|--------|--------|--------|
| Form render (LCP) | < 1.5s | Architecture NFR |
| Mutation response | < 500ms | PRD NFR |
| Auto-save debounce | 500ms | Architecture pattern |
| Carrier search | < 100ms | UX responsiveness |

### Security Requirements
- **PHI Protection**: Insurance data (member ID, group number) is PHI
  - Never log PHI to console
  - Never include PHI in URLs or query parameters
  - Use `phiGuard` utility for any debugging
  - Mask member ID in confirmation display (show last 4 only)
- **Form Security**: `autoComplete="off"` on member ID field
- **Data Encryption**: All data transmitted over TLS 1.2+ to backend
- **Session Validation**: Verify session ownership before accepting insurance data

### References
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md#Story-4.1]
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md#Data-Models-and-Contracts]
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md#Detailed-Design]
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md#Acceptance-Criteria]
- [Source: docs/architecture.md#PHI-Protection-Checklist]
- [Source: docs/epics.md#Story-4.1]

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
