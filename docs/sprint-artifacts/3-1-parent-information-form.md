# Story 3.1: Parent Information Form

Status: done

## Story

As a **parent**,
I want **to enter my contact information with helpful validation**,
so that **Daybreak can reach me and I feel confident the information is correct**.

## Acceptance Criteria

1. **AC-3.1.1:** Page renders at `/onboarding/[sessionId]/demographics` with clean, single-column form layout
2. **AC-3.1.2:** First Name field accepts 2-50 characters, required
3. **AC-3.1.3:** Last Name field accepts 2-50 characters, required
4. **AC-3.1.4:** Email field validates against RFC 5322 format, required
5. **AC-3.1.5:** Phone field accepts US phone numbers, formats as (XXX) XXX-XXXX, stores as E.164
6. **AC-3.1.6:** Relationship to Child field provides options: Parent, Guardian, Grandparent, Other (required select)
7. **AC-3.1.7:** Validation triggers on blur, not on every keystroke
8. **AC-3.1.8:** Error messages display below field in red (#E85D5D) with specific messaging
9. **AC-3.1.9:** Valid fields show subtle green checkmark icon
10. **AC-3.1.10:** Submit button disabled until all required fields are valid
11. **AC-3.1.11:** Email field has `autoComplete="email"` for browser autofill
12. **AC-3.1.12:** Phone input auto-formats as user types
13. **AC-3.1.13:** Form state managed by React Hook Form with Zod schema validation
14. **AC-3.1.14:** Form auto-saves on blur via `useAutoSave` hook
15. **AC-3.1.15:** "Continue" button leads to child info form (next step)
16. **AC-3.1.16:** Back button returns to assessment summary

## Tasks / Subtasks

- [x] **Task 1: Create Zod validation schemas** (AC: 3.1.2, 3.1.3, 3.1.4, 3.1.5, 3.1.6)
  - [x] Create `lib/validations/demographics.ts`
  - [x] Define `parentInfoSchema` with Zod
  - [x] Add first name validation (required, 2-50 chars, trim whitespace)
  - [x] Add last name validation (required, 2-50 chars, trim whitespace)
  - [x] Add email validation (required, RFC 5322 via Zod email validator)
  - [x] Add phone validation (required, US format, regex pattern)
  - [x] Add relationship validation (required, enum of allowed values)
  - [x] Export TypeScript type from schema: `export type ParentInfoInput = z.infer<typeof parentInfoSchema>`

- [x] **Task 2: Create phone formatting utility** (AC: 3.1.5, 3.1.12)
  - [x] Create `lib/utils/formatters.ts` if not exists
  - [x] Add `formatPhoneNumber()` function for display format (XXX) XXX-XXXX
  - [x] Add `toE164()` function to convert to +1XXXXXXXXXX format
  - [x] Add `fromE164()` function to parse stored format back to display
  - [x] Handle partial input during typing (e.g., "(555) 12" while typing)
  - [x] Export all phone utilities

- [x] **Task 3: Create ParentInfoForm component** (AC: all)
  - [x] Create `features/demographics/ParentInfoForm.tsx`
  - [x] Import React Hook Form `useForm` hook
  - [x] Import Zod resolver `zodResolver`
  - [x] Initialize form with `useForm<ParentInfoInput>()` and zodResolver
  - [x] Create controlled Input for First Name with error display
  - [x] Create controlled Input for Last Name with error display
  - [x] Create controlled Input for Email with `autoComplete="email"`
  - [x] Create controlled Input for Phone with format-on-change handler
  - [x] Create Select component for Relationship to Child
  - [x] Add error message display below each field (red text, specific messages)
  - [x] Add checkmark icon for valid fields (conditional render)
  - [x] Add "Continue" button (primary, disabled when form invalid)
  - [x] Add "Back" link/button
  - [x] Export component and props interface

- [x] **Task 4: Integrate useAutoSave hook** (AC: 3.1.14)
  - [x] Import `useAutoSave` from `@/hooks/useAutoSave`
  - [x] Call `useAutoSave()` with form values and session ID
  - [x] Configure to save on blur events
  - [x] Add visual indicator when saving (optional loading state)
  - [x] Ensure auto-save doesn't interfere with form validation

- [x] **Task 5: Create demographics page route** (AC: 3.1.1, 3.1.15, 3.1.16)
  - [x] Create `app/onboarding/[sessionId]/demographics/page.tsx`
  - [x] Import and render ParentInfoForm component
  - [x] Handle session ID from URL params
  - [x] Implement "Continue" navigation to child info form (same page, different section)
  - [x] Implement "Back" navigation to assessment summary
  - [x] Add page title and descriptive heading
  - [x] Ensure page uses onboarding layout (progress bar, header, footer)

- [x] **Task 6: Style form with shadcn/ui and Daybreak theme** (AC: 3.1.8, 3.1.9)
  - [x] Use shadcn/ui `Input` component for text fields
  - [x] Use shadcn/ui `Select` component for dropdown
  - [x] Use shadcn/ui `Button` component for actions
  - [x] Apply error red (#E85D5D) for error messages
  - [x] Apply success green checkmark for valid fields
  - [x] Ensure single-column layout with proper spacing (Daybreak spacing tokens)
  - [x] Ensure mobile-first responsive design
  - [x] Add focus states and hover states per Daybreak theme

- [x] **Task 7: Create GraphQL mutation for demographics** (AC: 3.1.14)
  - [x] Create `features/demographics/demographics.graphql`
  - [x] Define `UpdateParentInfo` mutation
  - [x] Include input type with all parent info fields
  - [x] Return updated session with parent info
  - [x] Run `npm codegen` to generate TypeScript types

- [x] **Task 8: Write unit tests** (AC: all)
  - [x] Create `tests/unit/components/demographics/ParentInfoForm.test.tsx`
  - [x] Test form renders all required fields
  - [x] Test first name validation (too short, too long, valid)
  - [x] Test last name validation
  - [x] Test email validation (invalid format, valid format)
  - [x] Test phone formatting and validation
  - [x] Test relationship select options
  - [x] Test error messages display on blur
  - [x] Test submit button disabled state
  - [x] Test form submission with valid data
  - [x] Test auto-save trigger on blur
  - [x] Mock `useAutoSave` hook in tests

## Prerequisites

- **Epic 1:** Foundation & Project Setup (done)
- **Epic 2:** AI-Guided Assessment Experience (ready-for-dev - can proceed in parallel)
- **Story 1.2:** Daybreak Design System and Theme Configuration
- **Story 1.3:** Core Layout Components
- **Story 1.4:** Apollo Client Configuration with WebSocket Support
- **Story 2.5:** Assessment Summary Generation (user completes assessment before demographics)

**Note:** This is the first story in Epic 3. Epic 2 stories are ready-for-dev but not yet implemented, so no "Learnings from Previous Story" section is included. This story can proceed in parallel with Epic 2 development.

## Dev Notes

### Architecture Patterns

- **Component Location:** `features/demographics/ParentInfoForm.tsx` [Source: docs/architecture.md#Project Structure - features/]
- **Validation Location:** `lib/validations/demographics.ts` [Source: docs/architecture.md#Project Structure - lib/validations/]
- **Route Location:** `app/onboarding/[sessionId]/demographics/page.tsx` [Source: docs/architecture.md#Project Structure - app/onboarding/]
- **Form Library:** React Hook Form 7.x with Zod 3.x resolver [Source: docs/architecture.md#Decision Summary]
- **UI Components:** shadcn/ui Input, Select, Button components [Source: docs/architecture.md#Technology Stack Details]
- **Naming Patterns:** Follow camelCase for hooks, PascalCase for components [Source: docs/architecture.md#Naming Patterns]

### Design Token References

From UX Design Specification:
- Error color: `#E85D5D` (error red)
- Success color: `#10B981` (success green)
- Primary button: Daybreak teal `#2A9D8F`
- Background: Cream `#FEF7ED`
- Text color: Deep text `#1A3C34`
- Border radius: `md` (12px) for form fields

### Project Structure Notes

```
features/demographics/
├── ParentInfoForm.tsx       # Main form component
├── ChildInfoForm.tsx        # Next story (3.2)
├── demographics.graphql     # GraphQL operations
└── index.ts                 # Re-exports

lib/validations/
├── demographics.ts          # Zod schemas
└── common.ts                # Shared validation utilities

lib/utils/
└── formatters.ts            # Phone, date, name formatting utilities

tests/unit/components/demographics/
└── ParentInfoForm.test.tsx  # Unit tests
```

### Validation Rules

**First Name & Last Name:**
- Required: "Please enter your first name" / "Please enter your last name"
- Min length 2: "Name must be at least 2 characters"
- Max length 50: "Name must be no more than 50 characters"
- Auto-trim whitespace

**Email:**
- Required: "Please enter your email address"
- Format: "Please enter a valid email address"
- Use Zod's built-in `.email()` validator (RFC 5322 compliant)

**Phone:**
- Required: "Please enter your phone number"
- Format: "Please enter a valid 10-digit phone number"
- Display format: `(555) 123-4567`
- Storage format: `+15551234567` (E.164)
- Handle partial input gracefully during typing

**Relationship to Child:**
- Required: "Please select your relationship to the child"
- Options: `["Parent", "Guardian", "Grandparent", "Other"]`

### Auto-save Implementation

```typescript
// Example usage in ParentInfoForm.tsx
const { watch } = useForm<ParentInfoInput>();
const formValues = watch();

useAutoSave({
  sessionId,
  data: formValues,
  onSave: async (data) => {
    await updateParentInfo({
      variables: { sessionId, input: data }
    });
  },
  debounceMs: 500, // Wait 500ms after blur before saving
});
```

### Accessibility Requirements

- All form fields must have associated `<label>` elements
- Error messages must be associated with fields via `aria-describedby`
- Form must be keyboard navigable (tab order logical)
- Required fields indicated with `aria-required="true"`
- Error states indicated with `aria-invalid="true"`
- WCAG 2.1 AA color contrast on all text

### Browser Autofill Support

- Email field: `autoComplete="email"`
- First name: `autoComplete="given-name"`
- Last name: `autoComplete="family-name"`
- Phone: `autoComplete="tel"`
- Relationship: No autocomplete (custom field)

### Phone Formatting Example

```typescript
// lib/utils/formatters.ts
export function formatPhoneNumber(value: string): string {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `+1${digits}`; // US numbers only for MVP
}
```

### FRs Covered

- **FR-004:** The system shall collect parent demographic information (name, contact, relationship to child)
- **FR-007:** The system shall persist onboarding progress, allowing parents to resume an incomplete session (via auto-save)

### Testing Standards Summary

- Minimum 80% code coverage for components
- Test happy path and all error states
- Test accessibility attributes
- Mock external dependencies (Apollo mutations, hooks)
- Use React Testing Library best practices (query by role, not test IDs)

### References

- [Source: docs/prd.md#6.2 Onboarding & Data Collection]
- [Source: docs/architecture.md#Project Structure]
- [Source: docs/architecture.md#Implementation Patterns]
- [Source: docs/epics.md#Story 3.1]
- [Source: docs/ux-design-specification.md#Section 3 - Design Tokens]

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/3-1-parent-information-form.context.xml

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20250929)

### Debug Log References

- Tests run via `npm test` - 112/112 story-specific tests pass
- GraphQL codegen run successfully via `npm run codegen`

### Completion Notes List

- All 8 tasks completed
- All 16 acceptance criteria implemented
- 112 unit tests written and passing
- Follows architecture patterns and Daybreak design tokens

### File List

**Created:**
- `lib/validations/demographics.ts` - Zod validation schemas
- `lib/utils/formatters.ts` - Phone formatting utilities (extended)
- `features/demographics/ParentInfoForm.tsx` - Main form component
- `features/demographics/index.ts` - Module exports
- `features/demographics/demographics.graphql` - GraphQL mutation
- `app/onboarding/[sessionId]/demographics/page.tsx` - Route page
- `tests/unit/lib/validations/demographics.test.ts` - 37 validation tests
- `tests/unit/lib/utils/formatters.test.ts` - 38 formatter tests
- `tests/unit/components/demographics/ParentInfoForm.test.tsx` - 37 component tests

**Modified:**
- `docs/sprint-artifacts/api_schema.graphql` - Added ParentInfo types and mutation
- `docs/sprint-artifacts/sprint-status.yaml` - Status updated

---

## Senior Developer Review (AI)

**Reviewer:** BMad
**Date:** 2025-11-29
**Outcome:** ✅ **APPROVE**

### Summary

Story 3.1 implementation is complete and well-executed. All 16 acceptance criteria are implemented with evidence. All 8 tasks marked complete are verified. Code quality is high with comprehensive JSDoc documentation, proper TypeScript types, and 112 passing tests. The implementation follows architecture patterns and Daybreak design tokens correctly.

### Acceptance Criteria Coverage

| AC# | Description | Status | Evidence |
|-----|-------------|--------|----------|
| 3.1.1 | Page at `/onboarding/[sessionId]/demographics` | ✅ | `app/onboarding/[sessionId]/demographics/page.tsx:1-91` |
| 3.1.2 | First Name 2-50 chars | ✅ | `lib/validations/demographics.ts:60-64` |
| 3.1.3 | Last Name 2-50 chars | ✅ | `lib/validations/demographics.ts:66-70` |
| 3.1.4 | Email RFC 5322 | ✅ | `lib/validations/demographics.ts:72-75` |
| 3.1.5 | Phone US format, E.164 storage | ✅ | `lib/utils/formatters.ts:53-88`, `lib/validations/demographics.ts:77-80` |
| 3.1.6 | Relationship dropdown | ✅ | `lib/validations/demographics.ts:13-18,82-84` |
| 3.1.7 | Validate on blur | ✅ | `ParentInfoForm.tsx:112` (`mode: "onBlur"`) |
| 3.1.8 | Error red #E85D5D | ✅ | `ParentInfoForm.tsx:57,233` |
| 3.1.9 | Green checkmark valid | ✅ | `ParentInfoForm.tsx:62,221-227` |
| 3.1.10 | Submit disabled until valid | ✅ | `ParentInfoForm.tsx:475` |
| 3.1.11 | autoComplete="email" | ✅ | `ParentInfoForm.tsx:297` |
| 3.1.12 | Phone auto-formats | ✅ | `ParentInfoForm.tsx:149-157,344-345` |
| 3.1.13 | React Hook Form + Zod | ✅ | `ParentInfoForm.tsx:109-112` |
| 3.1.14 | Auto-save on blur | ✅ | `ParentInfoForm.tsx:118-143` |
| 3.1.15 | Continue → child-info | ✅ | `demographics/page.tsx:59` |
| 3.1.16 | Back → assessment | ✅ | `demographics/page.tsx:67` |

**Summary: 16/16 acceptance criteria implemented**

### Task Completion Validation

| Task | Marked | Verified | Evidence |
|------|--------|----------|----------|
| Task 1: Zod schemas | ✅ | ✅ | `lib/validations/demographics.ts:1-102` |
| Task 2: Phone formatters | ✅ | ✅ | `lib/utils/formatters.ts:38-122` |
| Task 3: ParentInfoForm | ✅ | ✅ | `features/demographics/ParentInfoForm.tsx:1-489` |
| Task 4: useAutoSave integration | ✅ | ✅ | `ParentInfoForm.tsx:118-143` |
| Task 5: Demographics route | ✅ | ✅ | `app/onboarding/[sessionId]/demographics/page.tsx:1-91` |
| Task 6: Styling | ✅ | ✅ | Daybreak tokens applied |
| Task 7: GraphQL mutation | ✅ | ✅ | `features/demographics/demographics.graphql` |
| Task 8: Unit tests | ✅ | ✅ | 112 tests passing |

**Summary: 8/8 tasks verified, 0 false completions**

### Test Coverage

- Validation Schema: 37 tests ✅
- Phone Formatters: 38 tests ✅
- ParentInfoForm Component: 37 tests ✅
- Total: 112/112 passing

### Architectural Alignment

- ✅ Follows `features/demographics/` structure
- ✅ Uses React Hook Form 7.x + Zod 3.x
- ✅ Mobile-first with max-width 640px
- ✅ Auto-save on blur pattern
- ✅ Proper component exports

### Security Notes

- ✅ No PHI in console logs
- ✅ Form validation prevents malformed input
- ✅ E.164 phone format standardizes storage

### Action Items

**Advisory Notes:**
- Note: Consider removing `console.info` in `demographics/page.tsx:56` before production
- Note: Pre-existing test failures in other hooks should be addressed separately

**No blocking issues.**

---

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2025-11-29 | 1.0 | Initial implementation complete |
| 2025-11-29 | 1.0 | Senior Developer Review notes appended - APPROVED |
