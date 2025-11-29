# Story 3.2: Child Information Form

Status: ready-for-dev

## Story

As a **parent**,
I want **to provide my child's information with appropriate options**,
so that **Daybreak understands who they'll be helping**.

## Acceptance Criteria

1. **AC-3.2.1:** Child info form loads after completing parent info form at `/onboarding/[sessionId]/demographics` (child section)
2. **AC-3.2.2:** First Name field displays with validation (required, 2-50 chars)
3. **AC-3.2.3:** Date of Birth picker displays calendar component with month/year dropdown navigation
4. **AC-3.2.4:** Date of Birth picker defaults to ~13 years ago for quick navigation
5. **AC-3.2.5:** Date of Birth validation ensures child is between 10-19 years old with clear error message if outside range
6. **AC-3.2.6:** Preferred Pronouns field displays as optional select with options: She/Her, He/Him, They/Them, Other, Prefer not to say
7. **AC-3.2.7:** When "Other" is selected for pronouns, custom text input appears
8. **AC-3.2.8:** Grade field displays as optional select with options: 5th through 12th grade, Not in school
9. **AC-3.2.9:** Primary Concerns field pre-fills with assessment summary from cache
10. **AC-3.2.10:** Primary Concerns field is editable textarea with clear indication it can be modified
11. **AC-3.2.11:** Form validation displays on blur with specific error messages in error red (#E85D5D)
12. **AC-3.2.12:** Valid fields show subtle green checkmark indicator
13. **AC-3.2.13:** "Continue" button is disabled until all required fields are valid
14. **AC-3.2.14:** "Continue" button navigates to insurance step when enabled
15. **AC-3.2.15:** Progress bar updates to show step 3 of 5
16. **AC-3.2.16:** Form auto-saves on blur for each field
17. **AC-3.2.17:** Back button returns to parent info form without losing data

## Tasks / Subtasks

- [ ] **Task 1: Create ChildInfoForm component** (AC: 3.2.1, 3.2.2, 3.2.8, 3.2.11, 3.2.12, 3.2.13, 3.2.16)
  - [ ] Create `features/demographics/ChildInfoForm.tsx`
  - [ ] Implement form structure with React Hook Form
  - [ ] Add First Name input with 2-50 character validation
  - [ ] Add Grade select field with options (5th-12th, Not in school)
  - [ ] Add validation on blur behavior
  - [ ] Add visual indicators for valid/invalid states
  - [ ] Implement disabled state for Continue button based on form validity
  - [ ] Integrate `useAutoSave` hook for auto-save on blur

- [ ] **Task 2: Implement Date of Birth picker** (AC: 3.2.3, 3.2.4, 3.2.5)
  - [ ] Add shadcn/ui Calendar component wrapped in Popover
  - [ ] Implement month/year dropdown navigation
  - [ ] Set default date to ~13 years ago (current year - 13)
  - [ ] Create age validation function (validates 10-19 years old)
  - [ ] Add clear error message for age outside range: "Child must be between 10-19 years old for Daybreak services"
  - [ ] Display selected date in readable format (MM/DD/YYYY)
  - [ ] Ensure calendar opens on input focus/click

- [ ] **Task 3: Implement Pronouns field** (AC: 3.2.6, 3.2.7)
  - [ ] Add pronouns select field with options array
  - [ ] Include options: "She/Her", "He/Him", "They/Them", "Other", "Prefer not to say"
  - [ ] Implement conditional rendering for custom text input when "Other" selected
  - [ ] Style custom input to match form aesthetics
  - [ ] Mark field as optional with clear indication
  - [ ] Store pronouns value as flexible string in form data

- [ ] **Task 4: Implement Primary Concerns field** (AC: 3.2.9, 3.2.10)
  - [ ] Add textarea for Primary Concerns
  - [ ] Query Apollo cache for `assessment.summary` field
  - [ ] Pre-populate textarea with assessment summary data
  - [ ] Add helper text: "Review and edit what we learned from your conversation"
  - [ ] Style textarea with minimum 4 rows height
  - [ ] Add character counter if needed (consider 500-1000 char max)
  - [ ] Ensure editable state is clear (cursor changes, focus styles)

- [ ] **Task 5: Create ChildInfoSchema Zod validation** (AC: 3.2.2, 3.2.5)
  - [ ] Create or update `lib/validations/demographics.ts`
  - [ ] Define `ChildInfoSchema` with Zod
  - [ ] Add firstName validation: z.string().min(2).max(50)
  - [ ] Add dateOfBirth validation with custom age check (10-19 years)
  - [ ] Add pronouns as optional string
  - [ ] Add grade as optional string
  - [ ] Add primaryConcerns as required string
  - [ ] Export schema for use in form

- [ ] **Task 6: Integrate with onboarding flow** (AC: 3.2.1, 3.2.14, 3.2.15, 3.2.17)
  - [ ] Update demographics page route to handle child info section
  - [ ] Implement Continue button navigation to `/onboarding/[sessionId]/insurance`
  - [ ] Update OnboardingProgress component to show step 3 of 5
  - [ ] Implement Back button to return to parent info
  - [ ] Ensure session data persists on navigation
  - [ ] Test full navigation flow: parent info → child info → insurance

- [ ] **Task 7: Write unit tests** (AC: all)
  - [ ] Create `tests/unit/components/demographics/ChildInfoForm.test.tsx`
  - [ ] Test form renders with all required fields
  - [ ] Test Date of Birth age validation (valid and invalid ages)
  - [ ] Test pronouns field with "Other" custom input
  - [ ] Test pre-population of primary concerns from cache
  - [ ] Test form validation states (valid/invalid)
  - [ ] Test Continue button disabled/enabled state
  - [ ] Test auto-save behavior on field blur
  - [ ] **Edge Case Tests:**
    - [ ] Test age boundary: child exactly 10 years old (valid)
    - [ ] Test age boundary: child exactly 19 years old (valid)
    - [ ] Test age boundary: child 9 years 11 months (invalid)
    - [ ] Test age boundary: child 19 years 1 month (invalid)
    - [ ] Test primary concerns when assessment.summary is null/undefined
    - [ ] Test primary concerns when assessment.summary is empty string
    - [ ] Test custom pronouns input appears when "Other" selected
    - [ ] Test custom pronouns input hides when different option selected
    - [ ] Test form behavior when Apollo cache has no assessment data

## Prerequisites

- **Story 3.1:** Parent Information Form (parent info must be completed first)
- **Story 1.2:** Daybreak Design System and Theme Configuration (design tokens)
- **Story 2.5:** Assessment Summary Generation (assessment.summary in cache)

## Dev Notes

### Architecture Patterns

- **Component Location:** `features/demographics/ChildInfoForm.tsx` [Source: docs/architecture.md#Project Structure - features/demographics/]
- **Validation Location:** `lib/validations/demographics.ts` [Source: docs/architecture.md#Project Structure - lib/validations/]
- **Route Location:** Part of `app/onboarding/[sessionId]/demographics/page.tsx` [Source: docs/architecture.md#FR Category to Architecture Mapping]
- **Styling:** Use Tailwind utilities with Daybreak design tokens [Source: docs/architecture.md#Technology Stack Details]
- **Component Library:** Use shadcn/ui Calendar, Popover, Select, Input components [Source: docs/architecture.md#Core Technologies]
- **Form Patterns:** React Hook Form with Zod resolver [Source: docs/architecture.md#Implementation Patterns - Forms]

### Design Token References

From UX Design Specification (Section 3.1):
- Error color: `#E85D5D` (error red)
- Success color: `#10B981` (success green)
- Primary: `#2A9D8F` (daybreak-teal)
- Background: `#FEF7ED` (cream)
- Text: `#1A3C34` (deep-text)
- Border radius: `md` (12px) for form inputs

### Date Picker Implementation

```tsx
// Example Date of Birth picker implementation
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

// Default to ~13 years ago
const defaultDate = new Date()
defaultDate.setFullYear(defaultDate.getFullYear() - 13)

// Age validation
function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

function isValidAge(birthDate: Date): boolean {
  const age = calculateAge(birthDate)
  return age >= 10 && age <= 19
}
```

### Zod Schema Example

```typescript
// lib/validations/demographics.ts
import { z } from "zod"

export const ChildInfoSchema = z.object({
  firstName: z.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),
  dateOfBirth: z.date()
    .refine((date) => {
      const age = calculateAge(date)
      return age >= 10 && age <= 19
    }, "Child must be between 10-19 years old for Daybreak services"),
  pronouns: z.string().optional(),
  customPronouns: z.string().optional(),
  grade: z.string().optional(),
  primaryConcerns: z.string()
    .min(1, "Primary concerns are required")
})

export type ChildInfo = z.infer<typeof ChildInfoSchema>
```

### Apollo Cache Integration

```typescript
// Pre-populate Primary Concerns from assessment summary
const { data: sessionData } = useGetOnboardingSessionQuery({
  variables: { id: sessionId }
})

const assessmentSummary = sessionData?.onboardingSession?.assessment?.summary

// Use as default value in form
const defaultValues = {
  // ... other fields
  primaryConcerns: assessmentSummary || ""
}
```

### Project Structure Notes

```
features/demographics/
├── ParentInfoForm.tsx       # From Story 3.1
├── ChildInfoForm.tsx        # This story
└── index.ts                 # Re-exports

lib/validations/
├── demographics.ts          # Zod schemas for both parent and child

tests/unit/components/demographics/
├── ParentInfoForm.test.tsx
└── ChildInfoForm.test.tsx   # This story
```

### Accessibility Requirements

- WCAG 2.1 AA compliance required
- All form fields must have associated labels
- Error messages must be announced to screen readers
- Date picker must be keyboard navigable
- Color contrast must meet 4.5:1 for body text
- Focus indicators must be visible on all interactive elements

### Auto-Save Implementation

Use the `useAutoSave` hook per Architecture patterns:

```typescript
import { useAutoSave } from "@/hooks/useAutoSave"

// In component
const { watch } = useForm<ChildInfo>({ ... })
const formData = watch()

useAutoSave({
  data: formData,
  onSave: async (data) => {
    await updateChildInfo({
      variables: { sessionId, childInfo: data }
    })
  },
  debounceMs: 500
})
```

### Pronouns Field Considerations

- Pronouns stored as string for maximum flexibility
- "Prefer not to say" is distinct from empty/null
- Custom pronouns input appears inline when "Other" selected
- Store custom value in same field (not separate)
- Respectful, optional field with clear skip option

### References

- [Source: docs/prd.md#6.2 Onboarding & Data Collection]
- [Source: docs/architecture.md#Project Structure]
- [Source: docs/epics.md#Story 3.2]
- [Source: docs/ux-design-specification.md#Section 4 - Form Components]

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/3-2-child-information-form.context.xml

### Agent Model Used

<!-- Will be filled by dev agent -->

### Debug Log References

<!-- Will be filled during implementation -->

### Completion Notes List

<!-- Will be filled during implementation -->

### File List

- features/demographics/ChildInfoForm.tsx (NEW)
- components/ui/calendar.tsx (NEW)
- components/ui/popover.tsx (NEW)
- lib/utils/age-validation.ts (NEW)
- lib/validations/demographics.ts (MODIFIED - added childInfoSchema)
- features/demographics/index.ts (MODIFIED - added ChildInfoForm export)
- app/onboarding/[sessionId]/demographics/page.tsx (MODIFIED - added child section)
- app/onboarding/[sessionId]/layout.tsx (MODIFIED - dynamic progress bar)
- tests/unit/lib/utils/age-validation.test.ts (NEW)
- tests/unit/lib/validations/demographics.test.ts (MODIFIED - added childInfoSchema tests)
- tests/unit/components/demographics/ChildInfoForm.test.tsx (NEW)

---

## Senior Developer Review (AI)

### Reviewer
BMad (Amelia - Dev Agent)

### Date
2025-11-29

### Outcome
**APPROVED** - All 17 ACs implemented

### Summary
Story 3.2 implementation is well-structured with comprehensive test coverage. All form fields, validation, auto-save, and navigation are correctly implemented. Progress bar now dynamically updates based on current route.

### Key Findings

#### HIGH Severity
- [x] **[HIGH] AC-3.2.15 Fixed**: Progress bar now dynamically updates based on route. Implemented `getStepFromPathname()` and `getCompletedSteps()` functions in layout. [file: app/onboarding/[sessionId]/layout.tsx:36-70]

#### MEDIUM Severity
- None

#### LOW Severity
- Note: Task checkboxes in story file were not updated to reflect completion (all show `[ ]` despite implementation being done). This is documentation debt, not a code issue.

### Acceptance Criteria Coverage

| AC# | Description | Status | Evidence |
|-----|-------------|--------|----------|
| AC-3.2.1 | Child info form loads at demographics (child section) | IMPLEMENTED | `demographics/page.tsx:162-181` |
| AC-3.2.2 | First Name field with 2-50 char validation | IMPLEMENTED | `ChildInfoForm.tsx:193-229`, `demographics.ts:childInfoSchema` |
| AC-3.2.3 | DOB picker with calendar + month/year dropdown | IMPLEMENTED | `ChildInfoForm.tsx:231-306`, `calendar.tsx` |
| AC-3.2.4 | DOB defaults to ~13 years ago | IMPLEMENTED | `ChildInfoForm.tsx:185`, `age-validation.ts:66-71` |
| AC-3.2.5 | DOB validation 10-19 years with clear error | IMPLEMENTED | `demographics.ts:childInfoSchema`, `age-validation.ts` |
| AC-3.2.6 | Pronouns select with all options | IMPLEMENTED | `ChildInfoForm.tsx:308-343` |
| AC-3.2.7 | Custom pronouns input when "Other" selected | IMPLEMENTED | `ChildInfoForm.tsx:346-369` |
| AC-3.2.8 | Grade field optional with all options | IMPLEMENTED | `ChildInfoForm.tsx:372-405` |
| AC-3.2.9 | Primary concerns pre-fill from assessment | IMPLEMENTED | `demographics/page.tsx:79-101`, `ChildInfoForm.tsx:115` |
| AC-3.2.10 | Primary concerns editable with helper text | IMPLEMENTED | `ChildInfoForm.tsx:407-453` |
| AC-3.2.11 | Validation on blur with error red (#E85D5D) | IMPLEMENTED | `ChildInfoForm.tsx:130,69,219-228` |
| AC-3.2.12 | Green checkmark for valid fields | IMPLEMENTED | `ChildInfoForm.tsx:74,211-217` |
| AC-3.2.13 | Continue disabled until valid | IMPLEMENTED | `ChildInfoForm.tsx:486` |
| AC-3.2.14 | Continue navigates to insurance | IMPLEMENTED | `demographics/page.tsx:129` |
| AC-3.2.15 | Progress bar shows step 3 of 5 | IMPLEMENTED | `layout.tsx:36-70` dynamic step detection |
| AC-3.2.16 | Auto-save on blur | IMPLEMENTED | `ChildInfoForm.tsx:137-143,149-161` |
| AC-3.2.17 | Back button returns to parent info | IMPLEMENTED | `demographics/page.tsx:136` |

**Summary:** 17 of 17 acceptance criteria fully implemented

### Task Completion Validation

| Task | Marked As | Verified As | Evidence |
|------|-----------|-------------|----------|
| Task 1: Create ChildInfoForm component | [ ] | DONE | `features/demographics/ChildInfoForm.tsx` created |
| Task 2: Implement Date of Birth picker | [ ] | DONE | Calendar + Popover + age-validation implemented |
| Task 3: Implement Pronouns field | [ ] | DONE | Select with "Other" custom input |
| Task 4: Implement Primary Concerns field | [ ] | DONE | Textarea with pre-fill and helper text |
| Task 5: Create ChildInfoSchema validation | [ ] | DONE | `lib/validations/demographics.ts` updated |
| Task 6: Integrate with onboarding flow | [ ] | DONE | Demographics page + progress bar updated |
| Task 7: Write unit tests | [ ] | DONE | 138 tests passing |

**Summary:** 7 of 7 tasks verified complete

### Test Coverage and Gaps
- **age-validation.test.ts**: 20 tests covering calculateAge, isValidAge, boundary conditions
- **demographics.test.ts**: 79 tests including childInfoSchema validation
- **ChildInfoForm.test.tsx**: 39 tests covering rendering, validation, auto-save, navigation
- **Total new tests**: 138 tests, all passing
- **Test Gap**: No E2E test for progress bar step update (AC-3.2.15)

### Architectural Alignment
- Component follows established patterns from ParentInfoForm
- Zod schema properly integrated with React Hook Form
- Auto-save hook correctly implemented
- shadcn/ui components (Calendar, Popover, Select) properly installed and configured

### Security Notes
- No security concerns identified
- Form validation prevents invalid data submission
- No sensitive data exposed in client-side code

### Best-Practices and References
- React Hook Form + Zod pattern: Correctly implemented
- Date handling: Uses date-fns for reliable date formatting
- Accessibility: ARIA attributes properly applied

### Action Items

**Code Changes Required:**
- [x] [High] Implement dynamic step management in onboarding layout to update progress bar based on current route (AC-3.2.15) [file: app/onboarding/[sessionId]/layout.tsx:36-70] - **FIXED**

**Advisory Notes:**
- Note: Update task checkboxes in story file to reflect actual completion status
- Note: Consider adding E2E test for full onboarding flow navigation

---

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2025-11-29 | 1.0 | Initial implementation - all tasks except progress bar |
| 2025-11-29 | 1.1 | Senior Developer Review - Changes Requested |
| 2025-11-29 | 1.2 | Fixed AC-3.2.15 - dynamic progress bar implementation |
| 2025-11-29 | 1.2 | Senior Developer Review - APPROVED |
