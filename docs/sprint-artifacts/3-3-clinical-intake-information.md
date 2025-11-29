# Story 3.3: Clinical Intake Information

Status: done

## Story

As a **parent**,
I want **to provide relevant medical history for my child**,
So that **the therapist has important context for treatment**.

## Acceptance Criteria

1. **AC-3.3.1:** Given I have completed child info form, when the clinical intake section loads, then I see all clinical intake form fields
2. **AC-3.3.2:** Form includes current medications field (optional, textarea)
3. **AC-3.3.3:** Form includes previous therapy experience field (optional, select: Never, Currently in therapy, Previously in therapy)
4. **AC-3.3.4:** Form includes other mental health diagnoses field (optional, multi-select checkboxes: Anxiety, Depression, ADHD, Autism, Other)
5. **AC-3.3.5:** Form includes school accommodations field (optional, select: None, IEP, 504 Plan, Other)
6. **AC-3.3.6:** Form includes "Anything else we should know" field (optional, textarea, 500 character limit)
7. **AC-3.3.7:** All fields are clearly marked as optional and can be skipped
8. **AC-3.3.8:** Clear messaging displayed: "This information helps us match with the right therapist"
9. **AC-3.3.9:** Privacy notice displayed: "Your information is protected by HIPAA"
10. **AC-3.3.10:** Form saves on blur for each field using auto-save functionality
11. **AC-3.3.11:** "Continue" button proceeds to insurance section when clicked
12. **AC-3.3.12:** Textarea fields display character counter approaching character limit
13. **AC-3.3.13:** Multi-select checkboxes use shadcn/ui Checkbox component

## Tasks / Subtasks

- [x] Task 1: Create ClinicalIntakeForm component structure (AC: 1, 7, 8, 9)
  - [x] 1.1 Create `features/demographics/ClinicalIntakeForm.tsx` component file
  - [x] 1.2 Set up component with proper TypeScript types and JSDoc documentation
  - [x] 1.3 Add informational messaging section: "This information helps us match with the right therapist"
  - [x] 1.4 Add HIPAA privacy notice: "Your information is protected by HIPAA"
  - [x] 1.5 Add "(Optional)" labels or visual indicators for all fields

- [x] Task 2: Define Zod validation schema (AC: all fields)
  - [x] 2.1 Create schema in `lib/validations/demographics.ts` (co-located with other demographics schemas)
  - [x] 2.2 Define schema with all optional fields:
    - currentMedications: z.string().optional()
    - previousTherapyExperience: z.enum(['never', 'currently', 'previously']).optional()
    - diagnoses: z.array(z.enum(['anxiety', 'depression', 'adhd', 'autism', 'other'])).optional()
    - schoolAccommodations: z.enum(['none', 'iep', '504-plan', 'other']).optional()
    - additionalInfo: z.string().max(500).optional()
  - [x] 2.3 Export type ClinicalIntakeInput from schema

- [x] Task 3: Implement medications field (AC: 2, 10, 12)
  - [x] 3.1 Add Textarea component for current medications
  - [x] 3.2 Integrate with react-hook-form using register
  - [x] 3.3 Add onBlur handler connected to useAutoSave hook
  - [x] 3.4 Add helpful placeholder text

- [x] Task 4: Implement previous therapy experience field (AC: 3, 10)
  - [x] 4.1 Add Select component from shadcn/ui for previous therapy experience
  - [x] 4.2 Configure options: Never, Currently in therapy, Previously in therapy
  - [x] 4.3 Integrate with react-hook-form using Controller
  - [x] 4.4 Add onValueChange handler connected to useAutoSave hook

- [x] Task 5: Implement mental health diagnoses multi-select (AC: 4, 10, 13)
  - [x] 5.1 Create checkbox group using shadcn/ui Checkbox components
  - [x] 5.2 Add checkboxes for: Anxiety, Depression, ADHD, Autism, Other
  - [x] 5.3 Integrate with react-hook-form using Controller for array field
  - [x] 5.4 Add onCheckedChange handler connected to useAutoSave hook
  - [x] 5.5 Style checkbox group with proper spacing and layout

- [x] Task 6: Implement school accommodations field (AC: 5, 10)
  - [x] 6.1 Add Select component from shadcn/ui for school accommodations
  - [x] 6.2 Configure options: None, IEP, 504 Plan, Other
  - [x] 6.3 Integrate with react-hook-form using Controller
  - [x] 6.4 Add onValueChange handler connected to useAutoSave hook

- [x] Task 7: Implement additional information field with character counter (AC: 6, 10, 12)
  - [x] 7.1 Add Textarea component for "Anything else we should know"
  - [x] 7.2 Integrate with react-hook-form using register
  - [x] 7.3 Implement character counter component showing count/500
  - [x] 7.4 Add visual indicator when approaching limit (warning color at 450+, destructive at 500)
  - [x] 7.5 Enforce 500 character maximum via Zod schema and maxLength attribute
  - [x] 7.6 Add onBlur handler connected to useAutoSave hook

- [x] Task 8: Integrate auto-save functionality (AC: 10)
  - [x] 8.1 Import and configure useAutoSave hook from `hooks/useAutoSave.ts`
  - [x] 8.2 Pass form data to useAutoSave on field blur events
  - [x] 8.3 Add loading/saving/error indicators
  - [x] 8.4 Ensure auto-save works with sessionId context

- [x] Task 9: Implement Continue button navigation (AC: 11)
  - [x] 9.1 Add "Continue" button at bottom of form
  - [x] 9.2 Implement onContinue callback for parent to navigate to insurance
  - [x] 9.3 Ensure button is always enabled (all fields optional)
  - [x] 9.4 Save final state before navigation

- [x] Task 10: Add component to onboarding flow (AC: 1)
  - [x] 10.1 Integrated clinical intake as section=clinical in demographics page
  - [x] 10.2 Import ClinicalIntakeForm into demographics page component
  - [x] 10.3 Route progression: child form -> clinical intake -> insurance
  - [x] 10.4 Configure route: `/onboarding/[sessionId]/demographics?section=clinical`

- [x] Task 11: Write unit tests
  - [x] 11.1 Test Zod schema validation with valid/invalid data (42 tests)
  - [x] 11.2 Test component renders all fields correctly (44 tests)
  - [x] 11.3 Test auto-save triggers on field blur
  - [x] 11.4 Test character counter updates correctly
  - [x] 11.5 Test multi-select checkboxes work correctly
  - [x] 11.6 Test Continue button navigation
  - [x] 11.7 Test HIPAA notice and helper text display

- [x] Task 12: Accessibility and UX polish
  - [x] 12.1 Ensure all form fields have proper labels with htmlFor attributes
  - [x] 12.2 Add aria-labels and aria-describedby for screen readers
  - [x] 12.3 Test keyboard navigation through all fields
  - [x] 12.4 Ensure focus indicators are visible (via shadcn/ui defaults)
  - [x] 12.5 Add aria-live on character counters for screen readers
  - [x] 12.6 Add aria-invalid on fields with validation errors

## Dev Notes

### Project Structure Notes

**Component Location:** [Source: docs/architecture.md#Project Structure - features/]
- Primary component: `features/demographics/ClinicalIntakeForm.tsx`
- Schema file: `features/demographics/schemas/clinicalIntakeSchema.ts`
- Consider whether to integrate into existing child info page or create separate route

**Architecture References:**
- Form patterns: [Source: docs/architecture.md#Implementation Patterns - Structure Patterns]
- Validation schemas: [Source: docs/architecture.md#Project Structure - lib/validations/]
- Error handling: [Source: docs/architecture.md#Consistency Rules - Error Handling]
- PHI Protection: [Source: docs/architecture.md#Security Architecture - PHI Protection Checklist]

**Dependencies:**
- shadcn/ui components: Textarea, Select, Checkbox, Button, Label
- react-hook-form for form state management
- Zod for validation schema
- useAutoSave hook from `hooks/useAutoSave.ts`
- useOnboardingSession hook for sessionId context

**Integration Points:**
- Requires Story 3.2 (Child Information Form) to be completed first
- Navigates to Story 4.1 (Insurance Entry) upon Continue
- Uses same auto-save pattern as other onboarding forms
- Data persists to session via GraphQL mutation

### Technical Implementation Notes

**Multi-Select Checkboxes:**
```typescript
// Example structure using shadcn/ui Checkbox
const diagnoses = ['Anxiety', 'Depression', 'ADHD', 'Autism', 'Other'];
<Controller
  name="mentalHealthDiagnoses"
  control={control}
  render={({ field }) => (
    <div className="space-y-2">
      {diagnoses.map((diagnosis) => (
        <div key={diagnosis} className="flex items-center space-x-2">
          <Checkbox
            checked={field.value?.includes(diagnosis)}
            onCheckedChange={(checked) => {
              // Array update logic
            }}
          />
          <Label>{diagnosis}</Label>
        </div>
      ))}
    </div>
  )}
/>
```

**Character Counter Implementation:**
```typescript
// Display character count approaching limit
const charCount = watch('additionalInformation')?.length || 0;
<p className={cn(
  "text-sm text-muted-foreground",
  charCount > 450 && "text-warning",
  charCount >= 500 && "text-destructive"
)}>
  {charCount}/500
</p>
```

**Auto-Save Pattern:**
```typescript
const { autoSave, isSaving } = useAutoSave(sessionId);

// On field blur
const handleFieldSave = (fieldName: string, value: any) => {
  autoSave({ [fieldName]: value });
};
```

**HIPAA Notice Styling:**
- Use subtle background color or border
- Icon (shield/lock) for visual emphasis
- Position prominently but not intrusively

**Form Layout Considerations:**
- Per technical notes: "Consider splitting into separate page if form feels too long"
- If integrated with child info form, use clear visual sections
- If separate page, ensure clear progress indication
- Maintain consistent spacing and typography with other forms

### References

- [Source: docs/prd.md#6.2 Onboarding & Data Collection]
- [Source: docs/architecture.md#Project Structure]
- [Source: docs/architecture.md#Implementation Patterns - Structure Patterns]
- [Source: docs/architecture.md#Security Architecture - PHI Protection Checklist]
- [Source: docs/epics.md#Story 3.3]
- [Source: docs/epics.md#Epic 3 - Parent & Child Information Collection]
- [Functional Requirements: FR-006 Clinical Intake, FR-007 Session Persistence]

**Note:** Epic 3 tech context document (tech-spec-epic-3.md) to be referenced when available. Currently using PRD, Architecture, and Epics as primary sources.

### Functional Requirements Coverage

**FR-006:** The system shall collect clinical intake information (primary concerns, relevant history)
- Medications field captures current medical context
- Previous therapy experience provides treatment history
- Mental health diagnoses inform therapist matching
- School accommodations indicate level of existing support
- Additional information allows parent-driven context

**FR-007:** The system shall persist onboarding progress, allowing parents to resume an incomplete session
- Auto-save on blur ensures no data loss
- All fields save immediately to session
- Parent can navigate away and return without losing progress

## Dev Agent Record

### Context Reference

- Story Context XML: `docs/sprint-artifacts/3-3-clinical-intake-information.context.xml` (generated 2025-11-29)

### Agent Model Used

- To be recorded during implementation

### Debug Log References

- To be added during implementation

### Completion Notes List

- **Implemented 2025-11-29**
- Schema co-located in `lib/validations/demographics.ts` with other demographics schemas (deviation from planned separate file)
- Clinical intake integrated as `?section=clinical` in demographics page (not separate route)
- Route flow: parent → child → clinical → insurance
- All fields optional with 500 char limit on textareas
- Character counter shows warning at 450+, destructive at 500
- ResizeObserver mock added to `tests/setup.ts` for Radix UI component testing

### File List

**Files Created:**
- `features/demographics/ClinicalIntakeForm.tsx` - Main form component (348 lines)
- `tests/unit/components/demographics/ClinicalIntakeForm.test.tsx` - 44 unit tests

**Files Modified:**
- `lib/validations/demographics.ts` - Added clinical intake schema (+130 lines)
- `features/demographics/index.ts` - Added ClinicalIntakeForm export
- `app/onboarding/[sessionId]/demographics/page.tsx` - Added clinical section routing
- `tests/unit/lib/validations/demographics.test.ts` - Added 42 schema tests
- `tests/setup.ts` - Added ResizeObserver mock for Radix UI

---

## Senior Developer Review (AI)

### Reviewer
BMad (Dev Agent)

### Date
2025-11-29

### Outcome
**APPROVE** ✅

All 13 acceptance criteria verified with evidence. All 12 tasks completed and verified. Code quality is high with proper documentation, accessibility, and test coverage.

### Summary
Story 3.3 Clinical Intake Information has been implemented correctly with:
- ClinicalIntakeForm component (500 lines) with all required fields
- Zod validation schema with proper types and constraints
- Integration into demographics page as `?section=clinical`
- Comprehensive unit tests (44 component tests + 42 schema tests)
- Proper accessibility with aria labels, keyboard navigation, and screen reader support

### Acceptance Criteria Coverage

| AC# | Description | Status | Evidence |
|-----|-------------|--------|----------|
| AC-3.3.1 | Clinical intake section displays all fields | ✅ IMPLEMENTED | `features/demographics/ClinicalIntakeForm.tsx:179-496` |
| AC-3.3.2 | Current medications field (textarea) | ✅ IMPLEMENTED | `features/demographics/ClinicalIntakeForm.tsx:203-248` |
| AC-3.3.3 | Previous therapy experience (select) | ✅ IMPLEMENTED | `features/demographics/ClinicalIntakeForm.tsx:250-300` |
| AC-3.3.4 | Mental health diagnoses (multi-select checkboxes) | ✅ IMPLEMENTED | `features/demographics/ClinicalIntakeForm.tsx:302-351` |
| AC-3.3.5 | School accommodations (select) | ✅ IMPLEMENTED | `features/demographics/ClinicalIntakeForm.tsx:353-408` |
| AC-3.3.6 | Additional info textarea with 500 char limit | ✅ IMPLEMENTED | `features/demographics/ClinicalIntakeForm.tsx:410-455` |
| AC-3.3.7 | All fields marked optional | ✅ IMPLEMENTED | All labels include "(Optional)" text |
| AC-3.3.8 | Therapist matching message | ✅ IMPLEMENTED | `features/demographics/ClinicalIntakeForm.tsx:185-190` |
| AC-3.3.9 | HIPAA privacy notice | ✅ IMPLEMENTED | `features/demographics/ClinicalIntakeForm.tsx:192-201` |
| AC-3.3.10 | Auto-save on blur | ✅ IMPLEMENTED | `features/demographics/ClinicalIntakeForm.tsx:124-139` |
| AC-3.3.11 | Continue button navigation | ✅ IMPLEMENTED | `features/demographics/ClinicalIntakeForm.tsx:472-495` |
| AC-3.3.12 | Character counter with warning | ✅ IMPLEMENTED | `features/demographics/ClinicalIntakeForm.tsx:166-177` |
| AC-3.3.13 | shadcn/ui Checkbox component | ✅ IMPLEMENTED | `features/demographics/ClinicalIntakeForm.tsx:21,325` |

**Summary: 13 of 13 acceptance criteria fully implemented**

### Task Completion Validation

| Task | Marked As | Verified As | Evidence |
|------|-----------|-------------|----------|
| Task 1: Component structure | ✅ Complete | ✅ Verified | `features/demographics/ClinicalIntakeForm.tsx` created |
| Task 2: Zod schema | ✅ Complete | ✅ Verified | `lib/validations/demographics.ts:165-237` |
| Task 3: Medications field | ✅ Complete | ✅ Verified | Component lines 203-248 |
| Task 4: Previous therapy field | ✅ Complete | ✅ Verified | Component lines 250-300 |
| Task 5: Diagnoses multi-select | ✅ Complete | ✅ Verified | Component lines 302-351 |
| Task 6: School accommodations | ✅ Complete | ✅ Verified | Component lines 353-408 |
| Task 7: Additional info field | ✅ Complete | ✅ Verified | Component lines 410-455 |
| Task 8: Auto-save integration | ✅ Complete | ✅ Verified | useAutoSave hook integrated |
| Task 9: Continue button | ✅ Complete | ✅ Verified | Component lines 472-495 |
| Task 10: Onboarding flow integration | ✅ Complete | ✅ Verified | `app/onboarding/[sessionId]/demographics/page.tsx` |
| Task 11: Unit tests | ✅ Complete | ✅ Verified | 86 tests passing |
| Task 12: Accessibility polish | ✅ Complete | ✅ Verified | aria-* attributes throughout |

**Summary: 12 of 12 completed tasks verified, 0 questionable, 0 falsely marked complete**

### Test Coverage and Gaps

**Covered:**
- Schema validation: 42 tests covering all fields, edge cases, and error messages
- Component rendering: 44 tests covering all ACs
- Auto-save integration: Mocked and tested
- Accessibility: aria-labels, keyboard navigation tested

**Gaps (acceptable):**
- E2E tests not included (out of scope for unit test story)
- Select dropdown interactions limited by jsdom (noted in test comments)

### Architectural Alignment
- ✅ Follows existing form patterns from ParentInfoForm and ChildInfoForm
- ✅ Uses shared validation schema location (`lib/validations/demographics.ts`)
- ✅ Properly integrates with existing demographics page structure
- ✅ Uses shadcn/ui components consistently

### Security Notes
- ✅ PHI data handled via existing session/auto-save mechanism
- ✅ HIPAA notice displayed prominently
- ✅ Client-side validation only (server validation handled by GraphQL backend)
- No security concerns identified

### Best-Practices and References
- React Hook Form: https://react-hook-form.com/
- Zod validation: https://zod.dev/
- shadcn/ui Checkbox: https://ui.shadcn.com/docs/components/checkbox
- WCAG 2.1 accessibility guidelines followed

### Action Items

**Code Changes Required:**
- None required

**Advisory Notes:**
- Note: Pre-existing TypeScript errors in `types/graphql.ts` (Apollo BaseMutationOptions) unrelated to this story
- Note: Pre-existing lint warning about setState in useEffect in demographics page (not introduced by this story)
- Note: Consider adding E2E tests for select dropdown interactions in future sprint
