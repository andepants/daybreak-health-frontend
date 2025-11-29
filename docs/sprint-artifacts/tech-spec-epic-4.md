# Epic Technical Specification: Insurance Submission

Date: 2025-11-29
Author: BMad
Epic ID: 4
Status: Draft

---

## Overview

Epic 4 delivers the insurance submission functionality for the Parent Onboarding AI, enabling parents to provide their insurance information as part of the onboarding flow. This epic implements FR-008 (manual insurance entry) and session persistence (FR-007) for the insurance step.

The insurance submission experience is designed to be friction-reduced, featuring a warm and supportive tone that acknowledges parents are dealing with a stressful situation. Manual entry is the primary reliable path for MVP, with OCR-based card scanning deferred to the Growth phase (FR-009).

**Key Goals:**
- Enable parents to manually enter insurance information (carrier, member ID, group number)
- Provide clear confirmation and verification UI
- Offer a self-pay option for parents without insurance or with rejected coverage
- Maintain session persistence with auto-save on every field interaction

---

## Objectives and Scope

### In Scope (MVP)

- **Story 4.1: Manual Insurance Entry Form**
  - Searchable insurance carrier dropdown with common carriers
  - Form fields: carrier, member ID, group number, subscriber name, relationship to subscriber
  - Real-time validation on blur
  - Auto-save on field blur
  - "I don't have insurance" link to self-pay flow

- **Story 4.2: Insurance Verification and Confirmation**
  - Processing state with loading animation
  - Confirmation display with masked member ID
  - Edit capability for corrections
  - Error handling with retry option

- **Story 4.3: Self-Pay Option Flow**
  - Modal with self-pay pricing information
  - Supportive, non-judgmental messaging
  - Option to proceed with self-pay or add insurance later
  - Session flag for self-pay selection

### Out of Scope

- FR-009: Insurance card OCR/photo capture (Growth phase)
- FR-010: Real-time cost estimates (Growth phase)
- Insurance eligibility verification with payer systems
- Payment processing or billing

---

## System Architecture Alignment

### Components Referenced

| Architecture Component | Epic 4 Implementation |
|------------------------|----------------------|
| `/onboarding/[sessionId]/insurance/page.tsx` | Route for insurance step |
| `features/insurance/InsuranceForm.tsx` | Manual entry form component |
| `features/insurance/useInsurance.ts` | Insurance state + mutations hook |
| `features/insurance/insurance.graphql` | GraphQL operations |
| `lib/validations/insurance.ts` | Zod validation schemas |
| `hooks/useAutoSave.ts` | Auto-save on field blur |
| `components/ui/dialog.tsx` | Self-pay modal |

### Constraints (from Architecture)

- **PHI Protection**: No insurance data in console.log, URLs, or browser history
- **Mobile-First**: All components designed mobile-native first
- **Session Persistence**: Auto-save on every interaction (FR-007)
- **Error Handling**: Inline errors below fields, retry options for network failures
- **Accessibility**: WCAG 2.1 AA compliance, touch targets minimum 44x44px

---

## Detailed Design

### Services and Modules

| Module | Responsibility | Inputs | Outputs |
|--------|---------------|--------|---------|
| `InsuranceForm` | Render manual entry form with validation | Session ID, initial data | Validated insurance data |
| `InsuranceConfirmation` | Display saved insurance with edit option | Insurance info | Edit action, continue action |
| `SelfPayModal` | Display self-pay options | Open state | Self-pay selection |
| `useInsurance` | Manage insurance state, mutations, caching | Session ID | Insurance data, mutation functions, loading states |
| `insuranceSchema` | Zod validation for insurance fields | Form data | Validation result |

### Data Models and Contracts

**InsuranceInformation (from GraphQL Schema)**

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

**SubmitInsuranceInfoInput**

```typescript
type SubmitInsuranceInfoInput = {
  onboardingSessionId: string;
  provider: string;       // Required - insurance carrier
  planName?: string;      // Optional
  memberId: string;       // Required - member ID
  groupId?: string;       // Optional - group number
};
```

**Insurance Form State (Frontend)**

```typescript
interface InsuranceFormState {
  carrier: string;             // Selected carrier from dropdown
  memberId: string;            // Member ID
  groupNumber: string;         // Group number (optional)
  subscriberName: string;      // Name on insurance card
  relationshipToSubscriber: 'Self' | 'Spouse' | 'Child' | 'Other';
  isSelfPay: boolean;          // True if self-pay selected
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

### APIs and Interfaces

**GraphQL Operations**

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

### Workflows and Sequencing

**Manual Insurance Entry Flow**

```
1. User navigates to /onboarding/[sessionId]/insurance
2. Page checks for existing insurance info in cache
3. If exists → Show confirmation view with edit option
4. If not exists → Show insurance form
5. User selects carrier from searchable dropdown
6. Form shows example format for member ID based on carrier
7. User enters member ID, group number (optional), subscriber name
8. Validation runs on blur for each field
9. Auto-save triggers on blur (debounced 500ms)
10. User clicks "Continue"
11. submitInsuranceInfo mutation called
12. On success → Show confirmation, enable navigation to matching
13. On error → Show inline error, enable retry
```

**Self-Pay Flow**

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

---

## Non-Functional Requirements

### Performance

| Metric | Target | Source |
|--------|--------|--------|
| Form render (LCP) | < 1.5s | Architecture NFR |
| Mutation response | < 500ms | PRD NFR |
| Auto-save debounce | 500ms | Architecture pattern |
| Carrier search | < 100ms | UX responsiveness |

### Security

- **PHI Protection**: Insurance data (member ID, group number) is PHI
  - Never log PHI to console
  - Never include PHI in URLs or query parameters
  - Use `phiGuard` utility for any debugging
  - Mask member ID in confirmation display (show last 4 only)
- **Form Security**: `autoComplete="off"` on member ID field
- **Data Encryption**: All data transmitted over TLS 1.2+ to backend
- **Session Validation**: Verify session ownership before accepting insurance data

### Reliability/Availability

- **Auto-save**: Every field blur triggers save to prevent data loss
- **Offline Handling**: Show "Saving..." indicator with retry on network failure
- **Graceful Degradation**: If backend unavailable, queue submission for retry
- **Error Recovery**: Inline errors with specific messages and retry actions

### Observability

| Signal | Type | Purpose |
|--------|------|---------|
| `insurance.form.started` | Event | Track insurance step entry |
| `insurance.form.submitted` | Event | Track form submission |
| `insurance.selfpay.selected` | Event | Track self-pay selection |
| `insurance.error` | Error | Track submission failures |
| `insurance.mutation.duration` | Metric | Monitor API latency |

---

## Dependencies and Integrations

### Package Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react-hook-form` | ^7.67.0 | Form state management |
| `@hookform/resolvers` | ^5.2.2 | Zod integration |
| `zod` | ^3.25.76 | Schema validation |
| `@apollo/client` | 4.1.0 | GraphQL mutations/cache |
| `@radix-ui/react-dialog` | ^1.1.15 | Self-pay modal |
| `@radix-ui/react-select` | ^2.2.6 | Carrier dropdown |

### Integration Points

| Integration | Type | Notes |
|-------------|------|-------|
| `submitInsuranceInfo` mutation | GraphQL | Primary data submission |
| `useAutoSave` hook | Internal | Session persistence |
| `useOnboardingSession` hook | Internal | Session state access |
| Apollo Cache | Internal | Insurance data caching |
| Progress component | Internal | Update step indicator |

### External Data

**Insurance Carriers List**

A static JSON list of top 20 insurance carriers with:
- Carrier name
- Logo URL (optional)
- Member ID format hint

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
  // ... more carriers
  { id: 'other', name: 'Other', idFormat: 'Check your insurance card' },
];
```

---

## Acceptance Criteria (Authoritative)

### Story 4.1: Manual Insurance Entry Form

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

### Story 4.2: Insurance Verification and Confirmation

| # | Criterion | Testable Assertion |
|---|-----------|-------------------|
| AC-4.2.1 | Processing state shows during mutation | Loading indicator visible while `isSaving` is true |
| AC-4.2.2 | Confirmation shows carrier and masked member ID | Member ID shows `****XXXX` format (last 4 visible) |
| AC-4.2.3 | Edit link returns to form with data preserved | Clicking edit shows form with previously entered values |
| AC-4.2.4 | Error state shows specific message and retry | Error displayed with "Try again" action |
| AC-4.2.5 | Success confirmation completes in < 2s | Mutation + UI update within 2000ms |
| AC-4.2.6 | Insurance data persists in session | Refresh page shows confirmation view |

### Story 4.3: Self-Pay Option Flow

| # | Criterion | Testable Assertion |
|---|-----------|-------------------|
| AC-4.3.1 | Modal displays clear pricing information | Price per session visible in modal |
| AC-4.3.2 | Supportive, non-judgmental messaging present | Copy includes empathy language |
| AC-4.3.3 | "Proceed with self-pay" marks session as self-pay | Session `isSelfPay` flag set to true |
| AC-4.3.4 | "I'll add insurance later" closes modal | Modal dismisses, form remains |
| AC-4.3.5 | Self-pay selection navigates to matching | User proceeds to therapist matching |
| AC-4.3.6 | Self-pay can be changed before first appointment | Flag is updatable in session |

---

## Traceability Mapping

| AC | Spec Section | Component(s) | Test Approach |
|----|--------------|--------------|---------------|
| AC-4.1.1 | Services > InsuranceForm | `InsuranceForm.tsx`, `CarrierSelect` | Unit: render carriers, Integration: search filter |
| AC-4.1.2 | Data Models > insuranceSchema | `lib/validations/insurance.ts` | Unit: Zod schema validation |
| AC-4.1.3 | Data Models > insuranceSchema | `insuranceSchema.groupNumber` | Unit: optional field validation |
| AC-4.1.4 | Workflows > Manual Entry | `InsuranceForm.tsx` | Integration: relationship change populates name |
| AC-4.1.5 | APIs > useInsurance | `InsuranceForm.tsx` + React Hook Form | Integration: blur triggers validation |
| AC-4.1.6 | Services > SelfPayModal | `SelfPayModal.tsx` | Unit: modal opens on click |
| AC-4.1.7 | Services > InsuranceForm | `InsuranceForm.tsx` | Integration: button disabled state |
| AC-4.1.8 | Dependencies > useAutoSave | `useAutoSave.ts` | Unit: debounced save call |
| AC-4.2.1 | APIs > useInsurance | `InsuranceConfirmation.tsx` | Integration: loading state display |
| AC-4.2.2 | Data Models > PHI Protection | `InsuranceConfirmation.tsx` | Unit: member ID masking |
| AC-4.2.3 | Workflows > Manual Entry | `InsurancePage` state | Integration: edit flow preserves data |
| AC-4.2.4 | NFR > Reliability | Error handling in `useInsurance` | Integration: error display and retry |
| AC-4.2.5 | NFR > Performance | Full flow timing | E2E: measure submit to confirm time |
| AC-4.2.6 | Dependencies > Apollo Cache | Cache persistence | Integration: refresh retains data |
| AC-4.3.1 | Services > SelfPayModal | `SelfPayModal.tsx` | Unit: pricing content rendered |
| AC-4.3.2 | Services > SelfPayModal | `SelfPayModal.tsx` | Unit: empathy copy present |
| AC-4.3.3 | Workflows > Self-Pay | `useInsurance.setSelfPay` | Integration: session update |
| AC-4.3.4 | Services > SelfPayModal | Dialog close handler | Unit: modal dismiss |
| AC-4.3.5 | Workflows > Self-Pay | Navigation after setSelfPay | Integration: routing test |
| AC-4.3.6 | Data Models > Session | Session mutation | Integration: flag update |

---

## Risks, Assumptions, Open Questions

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Member ID format varies by carrier | High | Medium | Show format hints per carrier, accept flexible formats |
| Parents enter incorrect insurance info | Medium | High | Verification step in 4.2, edit capability |
| Self-pay pricing not available from backend | Medium | Medium | Use environment config as fallback |

### Assumptions

| Assumption | Rationale | Validation |
|------------|-----------|------------|
| Insurance carriers list is static for MVP | Dynamic list requires backend endpoint | Confirm with backend team |
| Self-pay pricing is single static value | Per Architecture - Growth has dynamic pricing | Confirm pricing source |
| No real-time insurance verification | FR-010 is Growth scope | PRD confirms |

### Open Questions

| Question | Owner | Due | Resolution |
|----------|-------|-----|------------|
| What is the self-pay price per session? | Product | Before Story 4.3 | Need from business |
| Should we validate member ID format per carrier? | Tech | Story 4.1 | Basic validation sufficient for MVP |
| How to handle insurance edit after submission? | Product | Story 4.2 | Edit returns to form, overwrites previous |

---

## Test Strategy Summary

### Test Levels

| Level | Framework | Coverage Focus |
|-------|-----------|----------------|
| Unit | Vitest + RTL | Zod schemas, form components, masking utility |
| Integration | Vitest + RTL | Form submission flow, auto-save, error handling |
| E2E | Playwright | Full insurance step completion, self-pay flow |

### Critical Test Scenarios

1. **Happy Path**: Complete insurance form → Submit → Confirmation → Continue
2. **Validation**: All field validation errors trigger and clear correctly
3. **Self-Pay**: Click "I don't have insurance" → Select self-pay → Continue
4. **Edit Flow**: Submit → Edit → Resubmit with changes
5. **Error Recovery**: Network failure → Error displayed → Retry succeeds
6. **Session Persistence**: Fill form → Refresh → Data preserved
7. **PHI Protection**: Verify no PHI in console logs during form interactions

### Edge Cases

- Carrier not in list → Select "Other" → Manual carrier name entry
- Very long member ID → Validation prevents > 30 chars
- Network timeout during auto-save → Retry with backoff
- Session expired during form → Graceful error with restart option
