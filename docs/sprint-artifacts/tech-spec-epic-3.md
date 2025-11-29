# Epic Technical Specification: Parent & Child Information Collection

Date: 2025-11-29
Author: BMad
Epic ID: 3
Status: Draft

---

## Overview

Epic 3 implements the demographics and clinical intake collection phase of the Daybreak Health parent onboarding flow. Following the AI-guided assessment (Epic 2), parents provide structured information about themselves and their child through validated, auto-saving forms. This epic creates the data foundation required for therapist matching and clinical context.

The implementation prioritizes form UX excellence: real-time validation, auto-save on blur, clear error messages, and accessibility. A form-based assessment fallback route provides an alternative path for parents who prefer traditional forms over AI chat.

## Objectives and Scope

**Objectives:**
- Collect parent demographic information (FR-004)
- Collect child demographic information including age validation for 10-19 range (FR-005)
- Capture clinical intake context: medications, therapy history, diagnoses (FR-006)
- Maintain session persistence with aggressive auto-save (FR-007)
- Provide form-based assessment fallback as parallel flow (Architecture ADR-003)

**In Scope:**
- ParentInfoForm component with validation and auto-save
- ChildInfoForm component with date picker and age validation
- Clinical intake fields (medications, history, diagnoses, accommodations)
- Form-based assessment fallback at `/onboarding/[sessionId]/form/assessment`
- Zod validation schemas for all forms
- Integration with Apollo Client cache and backend mutations
- Accessibility compliance (WCAG 2.1 AA)

**Out of Scope:**
- Insurance card OCR (FR-009 - Growth phase)
- Cost estimation display (FR-010 - Growth phase)
- Educational content library (FR-016, FR-017 - Vision phase)
- Real-time support chat widget (covered in Epic 6)

## System Architecture Alignment

**Affected Components (per Architecture project structure):**
- `features/demographics/ParentInfoForm.tsx` - Parent contact form
- `features/demographics/ChildInfoForm.tsx` - Child details form
- `features/demographics/useDemographics.ts` - Form state + mutations
- `features/demographics/demographics.graphql` - GraphQL operations
- `app/onboarding/[sessionId]/demographics/page.tsx` - Demographics route
- `app/onboarding/[sessionId]/form/assessment/page.tsx` - Form fallback route
- `lib/validations/demographics.ts` - Zod schemas
- `hooks/useAutoSave.ts` - Aggressive auto-save hook

**Architecture Constraints Applied:**
- Forms use React Hook Form 7.x with Zod 3.x resolver (ADR-004)
- All form state synchronized to Apollo cache and backend
- No PHI in console.log, URLs, or browser history
- Mobile-first responsive design (max-width 640px for form content)
- Auto-save triggers on blur for every field
- Session ID in URL provides recovery mechanism

**Integration Points:**
- Apollo Client mutations for data persistence
- Assessment summary pre-populates child primary concerns
- Demographics completion triggers transition to insurance step

## Detailed Design

### Services and Modules

| Module | Responsibility | Inputs | Outputs |
|--------|---------------|--------|---------|
| `ParentInfoForm` | Collect parent demographics with validation | Session context, existing data | Validated parent info, mutation trigger |
| `ChildInfoForm` | Collect child info with age validation | Session context, assessment summary | Validated child info, clinical intake |
| `useDemographics` | State management, mutations, auto-save | Form values, session ID | Mutation status, cached data |
| `FormAssessment` | Alternative structured assessment flow | Session ID | Assessment summary (same as AI) |
| `useAutoSave` | Debounced auto-save on field blur | Field name, value, mutation | Save status indicator |

### Data Models and Contracts

```typescript
// lib/validations/demographics.ts

import { z } from 'zod';

/**
 * Parent Information Schema
 * Validates parent/guardian contact information
 */
export const parentInfoSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z.string()
    .email('Please enter a valid email address'),
  phone: z.string()
    .regex(/^\+1\d{10}$/, 'Please enter a valid US phone number')
    .transform(val => val), // Stored as E.164 format
  relationshipToChild: z.enum(['parent', 'guardian', 'grandparent', 'other'], {
    errorMap: () => ({ message: 'Please select your relationship to the child' })
  })
});

/**
 * Child Information Schema
 * Validates child demographics with age range 10-19
 */
export const childInfoSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  dateOfBirth: z.string()
    .refine(val => {
      const dob = new Date(val);
      const today = new Date();
      const age = Math.floor((today.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      return age >= 10 && age <= 19;
    }, 'Child must be between 10 and 19 years old'),
  pronouns: z.enum(['she/her', 'he/him', 'they/them', 'other', 'prefer-not-to-say']).optional(),
  pronounsCustom: z.string().max(50).optional(),
  grade: z.enum(['5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', 'not-in-school']).optional(),
  primaryConcerns: z.string().max(2000).optional()
});

/**
 * Clinical Intake Schema
 * Optional clinical context for therapist matching
 */
export const clinicalIntakeSchema = z.object({
  currentMedications: z.string().max(500).optional(),
  previousTherapy: z.enum(['never', 'currently', 'previously']).optional(),
  diagnoses: z.array(z.enum(['anxiety', 'depression', 'adhd', 'autism', 'other'])).optional(),
  schoolAccommodations: z.enum(['none', 'iep', '504-plan', 'other']).optional(),
  additionalInfo: z.string().max(500).optional()
});

/**
 * Form Assessment Schema
 * Structured alternative to AI chat assessment
 */
export const formAssessmentSchema = z.object({
  primaryConcerns: z.string()
    .min(10, 'Please describe your concerns in more detail')
    .max(2000),
  concernDuration: z.enum(['less-than-1-month', '1-3-months', '3-6-months', '6-plus-months']),
  concernSeverity: z.number().min(1).max(5),
  sleepPatterns: z.enum(['normal', 'difficulty-falling-asleep', 'waking-frequently', 'sleeping-too-much']),
  appetiteChanges: z.enum(['normal', 'decreased', 'increased', 'irregular']),
  schoolPerformance: z.enum(['normal', 'declining', 'significantly-impacted', 'not-attending']),
  socialRelationships: z.enum(['normal', 'withdrawing', 'conflicts', 'isolated']),
  recentEvents: z.string().max(1000).optional(),
  therapyGoals: z.string().max(1000).optional()
});

export type ParentInfo = z.infer<typeof parentInfoSchema>;
export type ChildInfo = z.infer<typeof childInfoSchema>;
export type ClinicalIntake = z.infer<typeof clinicalIntakeSchema>;
export type FormAssessment = z.infer<typeof formAssessmentSchema>;
```

### APIs and Interfaces

```graphql
# features/demographics/demographics.graphql

mutation UpdateParentInfo($sessionId: ID!, $input: ParentInfoInput!) {
  updateParentInfo(sessionId: $sessionId, input: $input) {
    id
    demographics {
      parent {
        firstName
        lastName
        email
        phone
        relationshipToChild
      }
      isComplete
    }
  }
}

mutation UpdateChildInfo($sessionId: ID!, $input: ChildInfoInput!) {
  updateChildInfo(sessionId: $sessionId, input: $input) {
    id
    demographics {
      child {
        firstName
        dateOfBirth
        pronouns
        grade
        primaryConcerns
      }
      isComplete
    }
  }
}

mutation UpdateClinicalIntake($sessionId: ID!, $input: ClinicalIntakeInput!) {
  updateClinicalIntake(sessionId: $sessionId, input: $input) {
    id
    demographics {
      clinicalIntake {
        currentMedications
        previousTherapy
        diagnoses
        schoolAccommodations
        additionalInfo
      }
    }
  }
}

mutation SubmitFormAssessment($sessionId: ID!, $input: FormAssessmentInput!) {
  submitFormAssessment(sessionId: $sessionId, input: $input) {
    id
    assessment {
      summary
      isComplete
    }
  }
}

query GetDemographics($sessionId: ID!) {
  getOnboardingSession(id: $sessionId) {
    id
    demographics {
      parent {
        firstName
        lastName
        email
        phone
        relationshipToChild
      }
      child {
        firstName
        dateOfBirth
        pronouns
        grade
        primaryConcerns
      }
      clinicalIntake {
        currentMedications
        previousTherapy
        diagnoses
        schoolAccommodations
        additionalInfo
      }
      isComplete
    }
    assessment {
      summary
    }
  }
}
```

### Workflows and Sequencing

```
Parent Onboarding Flow - Demographics Phase:

1. Assessment Complete
   ↓
2. /onboarding/[sessionId]/demographics
   ├── Load existing data from cache/backend
   ├── Pre-populate child concerns from assessment summary
   └── Show parent info form first
   ↓
3. Parent Info Form
   ├── Auto-save on blur for each field
   ├── Real-time validation feedback
   └── "Continue" when valid → Child Info
   ↓
4. Child Info Form
   ├── Date picker with age validation (10-19)
   ├── Pronouns with optional custom text
   └── "Continue" when valid → Clinical Intake
   ↓
5. Clinical Intake (Optional fields)
   ├── All fields optional, skip allowed
   ├── Auto-save preserves partial data
   └── "Continue" → Insurance Step
   ↓
6. Navigate to /onboarding/[sessionId]/insurance

Alternative Flow - Form Assessment:

1. Chat screen shows "Prefer a traditional form?" link
   ↓
2. /onboarding/[sessionId]/form/assessment
   ├── Page 1: Primary concerns, duration, severity
   ├── Page 2: Sleep, appetite, school, social
   └── Page 3: Recent events, therapy goals
   ↓
3. Form submission generates assessment summary
   ↓
4. Merge with main flow at Demographics step
```

## Non-Functional Requirements

### Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| Form render | < 100ms | Chrome DevTools |
| Auto-save latency | < 500ms | Network panel |
| Validation feedback | < 50ms | User perception |
| Page transition | < 200ms | Lighthouse |
| Total form completion | < 5 minutes | Analytics |

**Implementation:**
- React Hook Form uses uncontrolled inputs (minimal re-renders)
- Auto-save uses 300ms debounce to batch rapid changes
- Validation runs client-side first, server validates on save
- Skeleton loading for initial data fetch

### Security

| Requirement | Implementation |
|-------------|----------------|
| PHI Protection | No console.log of form data, use phiGuard utility |
| Input Sanitization | Zod schemas strip unknown fields |
| XSS Prevention | React's built-in escaping, no dangerouslySetInnerHTML |
| CSRF | Apollo includes CSRF token in headers |
| Session Security | JWT in memory, not localStorage |

**PHI Checklist for Demographics:**
- [ ] No form values logged to console
- [ ] No PHI in URL parameters
- [ ] Form autofill disabled for sensitive fields
- [ ] Error messages don't expose PHI

### Reliability/Availability

| Scenario | Behavior |
|----------|----------|
| Network failure during save | Retry with exponential backoff, show "Saving..." |
| Backend timeout | Queue save, retry when connection restored |
| Session expired | Redirect to start with "session expired" message |
| Browser refresh | Data restored from backend (session ID in URL) |
| Multiple tabs | Last-write-wins with timestamp reconciliation |

### Observability

| Signal | Implementation |
|--------|----------------|
| Form completion rate | Analytics event on demographics submit |
| Field abandonment | Track last focused field before exit |
| Validation errors | Count by field type (anonymized) |
| Save failures | Error tracking with retry count |
| Time to complete | Duration from first focus to submit |

## Dependencies and Integrations

### External Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react-hook-form | ^7.67.0 | Form state management |
| @hookform/resolvers | ^5.2.2 | Zod integration |
| zod | ^3.25.76 | Schema validation |
| @apollo/client | ^4.0.9 | GraphQL client, cache |
| @radix-ui/react-select | ^2.2.6 | Accessible select component |
| @radix-ui/react-checkbox | ^2.1.8 | Accessible checkbox |
| @radix-ui/react-label | ^2.1.8 | Accessible labels |

### Internal Dependencies

| Component | Dependency |
|-----------|------------|
| ParentInfoForm | useAutoSave, useDemographics, shadcn Input/Select |
| ChildInfoForm | useDemographics, Calendar component, parentInfoSchema |
| useDemographics | Apollo cache, demographics mutations |
| FormAssessment | useAutoSave, same summary generation endpoint |

### Backend Integration Points

| Endpoint | Purpose | Contract |
|----------|---------|----------|
| `updateParentInfo` | Save parent demographics | ParentInfoInput → OnboardingSession |
| `updateChildInfo` | Save child demographics | ChildInfoInput → OnboardingSession |
| `updateClinicalIntake` | Save clinical intake | ClinicalIntakeInput → OnboardingSession |
| `submitFormAssessment` | Generate summary from form | FormAssessmentInput → Assessment |

## Acceptance Criteria (Authoritative)

### Story 3.1: Parent Information Form

| AC# | Criterion | Testable Statement |
|-----|-----------|-------------------|
| 3.1.1 | First name validation | Given empty first name, when blur, then error "First name must be at least 2 characters" |
| 3.1.2 | Email format validation | Given invalid email, when blur, then error "Please enter a valid email address" |
| 3.1.3 | Phone formatting | Given "5551234567", when typing, then displays "(555) 123-4567" |
| 3.1.4 | Phone storage | Given formatted phone, when saved, then stored as "+15551234567" |
| 3.1.5 | Relationship required | Given no selection, when submit, then error appears |
| 3.1.6 | Auto-save on blur | Given valid field, when blur, then data saved within 500ms |
| 3.1.7 | Browser autofill | Given email field focused, then `autoComplete="email"` triggers browser autofill |
| 3.1.8 | Submit navigation | Given valid form, when Continue clicked, then navigate to child info |

### Story 3.2: Child Information Form

| AC# | Criterion | Testable Statement |
|-----|-----------|-------------------|
| 3.2.1 | Age validation (low) | Given DOB making child 9 years old, then error "Child must be between 10 and 19" |
| 3.2.2 | Age validation (high) | Given DOB making child 20 years old, then error "Child must be between 10 and 19" |
| 3.2.3 | Age validation (valid) | Given DOB making child 14 years old, then no error, form valid |
| 3.2.4 | Date picker default | Given date picker opened, then defaults to ~13 years ago for quick selection |
| 3.2.5 | Custom pronouns | Given "other" pronouns selected, then custom text field appears |
| 3.2.6 | Concerns pre-population | Given assessment summary exists, then primaryConcerns pre-filled |
| 3.2.7 | Concerns editable | Given pre-filled concerns, then user can edit text |

### Story 3.3: Clinical Intake Information

| AC# | Criterion | Testable Statement |
|-----|-----------|-------------------|
| 3.3.1 | All fields optional | Given no fields filled, when Continue, then form submits successfully |
| 3.3.2 | Medications character limit | Given 501+ characters, then error "Maximum 500 characters" |
| 3.3.3 | Multi-select diagnoses | Given anxiety and ADHD checked, then both stored in array |
| 3.3.4 | HIPAA notice visible | Given clinical intake section, then privacy notice displayed |
| 3.3.5 | Auto-save partial | Given 2 of 5 fields filled, when exit, then 2 fields persisted |

### Story 3.4: Form-Based Assessment Fallback

| AC# | Criterion | Testable Statement |
|-----|-----------|-------------------|
| 3.4.1 | Fallback link visible | Given assessment chat screen, then "Prefer a traditional form?" link visible |
| 3.4.2 | Navigation to form | Given link clicked, then navigate to `/onboarding/[sessionId]/form/assessment` |
| 3.4.3 | Three-page wizard | Given form assessment, then 3 distinct pages with progress |
| 3.4.4 | Summary generation | Given form completed, then summary matches AI chat format |
| 3.4.5 | Data persistence | Given partial form, when return, then data restored |
| 3.4.6 | Flow merge | Given form assessment complete, then continues to demographics normally |

## Traceability Mapping

| AC | Spec Section | Component | Test Type |
|----|--------------|-----------|-----------|
| 3.1.1-3.1.8 | Data Models, APIs | ParentInfoForm | Unit + Integration |
| 3.2.1-3.2.7 | Data Models, APIs | ChildInfoForm | Unit + Integration |
| 3.3.1-3.3.5 | Data Models, APIs | ChildInfoForm (clinical section) | Unit |
| 3.4.1-3.4.6 | Workflows | FormAssessment pages | E2E |

**FR Traceability:**

| FR | AC Coverage | Component |
|----|-------------|-----------|
| FR-004 | 3.1.1-3.1.8 | ParentInfoForm |
| FR-005 | 3.2.1-3.2.7 | ChildInfoForm |
| FR-006 | 3.3.1-3.3.5 | Clinical intake section |
| FR-007 | 3.1.6, 3.3.5, 3.4.5 | useAutoSave hook |

## Risks, Assumptions, Open Questions

### Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Phone format varies internationally | Medium | Low | MVP supports US only (+1), document for future |
| Age calculation edge cases (leap years) | Low | Low | Use date-fns or dayjs for precise calculation |
| Large clinical history text | Low | Medium | Character limits + textarea auto-resize |
| Assessment summary format mismatch | Medium | Low | Same backend endpoint for both AI and form |

### Assumptions

| Assumption | Rationale |
|------------|-----------|
| Parents complete assessment before demographics | Flow enforced by routing |
| US phone numbers only for MVP | Scope constraint, internationalization in Growth |
| Child age 10-19 is hard requirement | Per PRD target users |
| Backend validates all data server-side | Defense in depth |

### Open Questions

| Question | Owner | Status |
|----------|-------|--------|
| Should pronouns be free-text only? | Product | Resolved: enum + other option |
| Include emergency contact field? | Product | Deferred to Growth |
| How long to persist incomplete sessions? | Backend | PRD says 30 days |

## Test Strategy Summary

### Unit Tests (Vitest)

| Area | Tests |
|------|-------|
| Zod schemas | Validation rules, edge cases, error messages |
| useAutoSave | Debounce behavior, retry logic, error handling |
| useDemographics | Cache updates, mutation calls |
| Phone formatter | Input masking, E.164 conversion |

### Integration Tests

| Area | Tests |
|------|-------|
| ParentInfoForm | Full form flow, auto-save triggering, validation display |
| ChildInfoForm | Age validation, date picker interaction |
| FormAssessment | Page transitions, summary generation |

### E2E Tests (Playwright)

| Scenario | Steps |
|----------|-------|
| Happy path | Complete parent → child → clinical → verify saved |
| Form fallback | Click link → complete 3 pages → verify summary |
| Auto-save | Fill field, close tab, return, verify restored |
| Validation | Submit invalid, verify errors, fix, submit success |

### Accessibility Testing

| Test | Tool |
|------|------|
| Color contrast | axe DevTools |
| Keyboard navigation | Manual |
| Screen reader | VoiceOver, NVDA |
| Focus management | Manual |

---

*Generated by BMAD Epic Tech Context Workflow*
*Date: 2025-11-29*
*For: BMad*
