# Epic Technical Specification: Cost Estimation Tool

Date: 2025-11-30
Author: BMad
Epic ID: 6
Status: Draft

---

## Overview

Epic 6 delivers transparent cost information to parents based on their insurance coverage or self-pay preference. This capability addresses a critical pain point identified in the PRD: parents need to understand their financial responsibility before committing to therapy services. The Cost Estimation Tool builds confidence by showing upfront pricing, deductible tracking, and flexible payment options—eliminating financial surprises that could derail the onboarding journey.

This epic consumes backend APIs from backend stories 6-1 through 6-5 (Cost Calculation Engine, Insurance Cost Estimation, Self-Pay Rates & Comparison, Deductible & Out-of-Pocket Tracking, Payment Plan Options) and integrates seamlessly after the insurance submission flow (Epic 4).

## Objectives and Scope

**In Scope:**
- Display insurance-based cost estimates per session
- Show self-pay rates with package discounts
- Provide side-by-side insurance vs. self-pay comparison
- Track deductible progress and out-of-pocket maximum (when data available)
- Present payment plan options with terms
- Support graceful degradation when cost data is unavailable

**Out of Scope:**
- Actual payment processing or checkout
- Real-time insurance eligibility verification API calls (Growth feature)
- Superbill generation or claims submission
- Historical cost tracking or billing history

## System Architecture Alignment

**Components Referenced:**
- `features/cost/` - New feature directory for cost estimation components
- `app/onboarding/[sessionId]/cost/page.tsx` - New route for cost display
- Apollo Client cache for cost estimate storage
- Backend GraphQL queries: `getCostEstimate`, `getSelfPayRates`, `getPaymentPlans`

**Architecture Constraints:**
- No PHI in cost-related logging (member ID masked)
- Cost calculations performed server-side (backend responsibility)
- Frontend displays only; no financial calculations client-side
- Graceful fallback when insurance verification data unavailable

**Integration Points:**
- Receives insurance data from Epic 4 (stored in session)
- Provides cost context to Epic 5 (scheduling flow)
- Session state managed via `useOnboardingSession` hook

---

## Detailed Design

### Services and Modules

| Module | Responsibility | Inputs | Outputs |
|--------|---------------|--------|---------|
| `features/cost/CostEstimationCard.tsx` | Display insurance-based cost estimate | Session ID, Insurance data | Rendered cost card with breakdown |
| `features/cost/SelfPayRateCard.tsx` | Display self-pay pricing and packages | Session ID | Self-pay options with discounts |
| `features/cost/CostComparisonView.tsx` | Side-by-side insurance vs self-pay | Both estimates | Comparison UI with recommendation |
| `features/cost/DeductibleTracker.tsx` | Progress bar for deductible/OOP max | Insurance verification data | Visual progress indicator |
| `features/cost/PaymentPlanModal.tsx` | Modal showing payment plan options | Available plans | Selection interface |
| `hooks/useCostEstimate.ts` | Apollo query hook for cost data | Session ID | Cost estimate state and loading |
| `lib/validations/cost.ts` | Zod schemas for cost data | API response | Validated cost types |

### Data Models and Contracts

```typescript
// types/graphql.ts (generated from backend schema)

interface CostEstimate {
  sessionId: string;
  estimatedCostPerSession: number; // In cents
  insuranceCoverage: {
    carrier: string;
    planType: string;
    coveragePercentage: number;
    estimatedCopay: number; // In cents
    estimatedCoinsurance: number; // In cents
  } | null;
  deductibleInfo: {
    annualDeductible: number;
    deductibleMet: number;
    deductibleRemaining: number;
    outOfPocketMax: number;
    outOfPocketMet: number;
  } | null;
  disclaimer: string;
  calculatedAt: string; // ISO 8601
}

interface SelfPayRate {
  perSessionRate: number; // In cents
  packages: SelfPayPackage[];
  financialAssistanceAvailable: boolean;
}

interface SelfPayPackage {
  id: string;
  name: string;
  sessionCount: number;
  totalPrice: number; // In cents
  pricePerSession: number; // In cents
  savingsPercentage: number;
}

interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  frequency: 'per_session' | 'monthly' | 'prepaid';
  installmentAmount: number | null; // In cents
  totalAmount: number | null; // In cents
  terms: string;
}
```

### APIs and Interfaces

**Query: GetCostEstimate**
```graphql
query GetCostEstimate($sessionId: ID!) {
  getCostEstimate(sessionId: $sessionId) {
    sessionId
    estimatedCostPerSession
    insuranceCoverage {
      carrier
      planType
      coveragePercentage
      estimatedCopay
      estimatedCoinsurance
    }
    deductibleInfo {
      annualDeductible
      deductibleMet
      deductibleRemaining
      outOfPocketMax
      outOfPocketMet
    }
    disclaimer
    calculatedAt
  }
}
```

**Query: GetSelfPayRates**
```graphql
query GetSelfPayRates {
  getSelfPayRates {
    perSessionRate
    packages {
      id
      name
      sessionCount
      totalPrice
      pricePerSession
      savingsPercentage
    }
    financialAssistanceAvailable
  }
}
```

**Query: GetPaymentPlans**
```graphql
query GetPaymentPlans($sessionId: ID!) {
  getPaymentPlans(sessionId: $sessionId) {
    id
    name
    description
    frequency
    installmentAmount
    totalAmount
    terms
  }
}
```

**Mutation: SetPaymentPreference**
```graphql
mutation SetPaymentPreference($sessionId: ID!, $input: PaymentPreferenceInput!) {
  setPaymentPreference(sessionId: $sessionId, input: $input) {
    success
    session {
      id
      paymentPreference
    }
  }
}
```

**Error Codes:**
- `COST_ESTIMATE_UNAVAILABLE`: Insurance data insufficient for estimate
- `INSURANCE_NOT_VERIFIED`: Insurance submission not yet complete
- `SESSION_NOT_FOUND`: Invalid session ID
- `INTERNAL_ERROR`: Backend calculation failure

### Workflows and Sequencing

```
User completes insurance submission (Epic 4)
    │
    ▼
Navigate to /onboarding/[sessionId]/cost
    │
    ▼
┌───────────────────────────────────────┐
│  useCostEstimate hook fires           │
│  - getCostEstimate query              │
│  - getSelfPayRates query (parallel)   │
└───────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────┐
│  Display Loading State                       │
│  - Skeleton cards                           │
│  - "Calculating your costs..." message      │
└─────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────┐
│  Render Cost Estimation Page                 │
│  - CostEstimationCard (if insurance)        │
│  - SelfPayRateCard                          │
│  - CostComparisonView (if both available)   │
│  - DeductibleTracker (if data available)    │
└─────────────────────────────────────────────┘
    │
    ▼
User clicks "Payment Options"
    │
    ▼
┌─────────────────────────────────────────────┐
│  PaymentPlanModal opens                      │
│  - getPaymentPlans query                    │
│  - User selects plan                        │
│  - setPaymentPreference mutation            │
└─────────────────────────────────────────────┘
    │
    ▼
Continue to therapist matching (Epic 5)
```

---

## Non-Functional Requirements

### Performance

| Metric | Target | Source |
|--------|--------|--------|
| Cost estimate load time | <2 seconds | PRD: API response <500ms |
| Page LCP | <1.5 seconds | Architecture performance budget |
| Query parallelization | Cost + SelfPay queries fire simultaneously | Architecture patterns |

**Implementation:**
- Use Apollo's `useQuery` with `fetchPolicy: 'cache-first'` for repeat views
- Skeleton loading states matching content shape
- Prefetch cost data during insurance submission success

### Security

| Requirement | Implementation | Source |
|-------------|----------------|--------|
| No PHI in logs | Mask member ID (show last 4 digits only) | Architecture PHI checklist |
| No PHI in URLs | Use session ID only, not insurance details | Architecture Section: Security |
| Secure data display | Mask sensitive fields in confirmation | PRD: HIPAA compliance |

**Implementation:**
- Use `phiGuard` utility for any cost-related logging
- Member ID displayed as `****1234` format
- No insurance details in browser console or error messages

### Reliability/Availability

| Scenario | Behavior |
|----------|----------|
| Cost estimate API fails | Show "Unable to calculate estimate" with support contact |
| Deductible data unavailable | Hide DeductibleTracker, show "Contact your insurance for details" |
| Self-pay rates API fails | Display cached default rates with "Rates as of [date]" |
| Network error | Show retry button with toast notification |

### Observability

| Signal | Type | Purpose |
|--------|------|---------|
| `cost_estimate_loaded` | Event | Track successful cost displays |
| `cost_estimate_error` | Event | Track failures with error code |
| `payment_plan_selected` | Event | Track plan selection (plan ID only) |
| `cost_page_time_spent` | Metric | User engagement with cost info |

---

## Dependencies and Integrations

### NPM Dependencies (existing)
- `@apollo/client@4.x` - GraphQL queries for cost data
- `zod@3.x` - Runtime validation of cost responses
- `react-hook-form@7.x` - Payment plan selection form

### Internal Dependencies
- `hooks/useOnboardingSession.ts` - Session context for cost display
- `lib/utils/formatters.ts` - Currency formatting (cents to dollars)
- `components/ui/progress.tsx` - shadcn Progress for deductible tracker
- `components/ui/dialog.tsx` - shadcn Dialog for payment plan modal
- `components/ui/skeleton.tsx` - Loading states
- `components/ui/card.tsx` - Cost card containers

### Backend Dependencies
- Backend Story 6-1: Cost Calculation Engine
- Backend Story 6-2: Insurance Cost Estimation
- Backend Story 6-3: Self-Pay Rates & Comparison
- Backend Story 6-4: Deductible & Out-of-Pocket Tracking
- Backend Story 6-5: Payment Plan Options

### Integration Points
- **Epic 4 (Insurance)**: Provides insurance data stored in session
- **Epic 5 (Scheduling)**: Receives payment preference for booking
- **Epic 7 (Support)**: "Financial assistance" link opens Intercom

---

## Acceptance Criteria (Authoritative)

### Story 6.1: Cost Estimation Display
1. **AC-6.1.1**: Given insurance data exists, when cost page loads, then display per-session estimate within 2 seconds
2. **AC-6.1.2**: Given insurance data exists, then show carrier name and coverage breakdown
3. **AC-6.1.3**: Given cost estimate unavailable, then show "Unable to estimate" with support contact
4. **AC-6.1.4**: Display disclaimer text from API response
5. **AC-6.1.5**: Mask member ID showing only last 4 digits

### Story 6.2: Self-Pay Rate Display
1. **AC-6.2.1**: Always display self-pay per-session rate
2. **AC-6.2.2**: Show package discounts with savings percentage
3. **AC-6.2.3**: Given insurance estimate available, show side-by-side comparison
4. **AC-6.2.4**: Highlight more affordable option visually
5. **AC-6.2.5**: "Choose self-pay" button updates session preference

### Story 6.3: Deductible and Out-of-Pocket Tracking
1. **AC-6.3.1**: Given deductible data available, display progress bar visualization
2. **AC-6.3.2**: Show remaining deductible amount in currency format
3. **AC-6.3.3**: Display out-of-pocket maximum progress if available
4. **AC-6.3.4**: Given deductible data unavailable, hide tracker with explanation link
5. **AC-6.3.5**: Show "You've reached your max" indicator when applicable

### Story 6.4: Payment Plan Options
1. **AC-6.4.1**: "Payment options" click opens accessible modal
2. **AC-6.4.2**: Display all available payment plans with frequency and amounts
3. **AC-6.4.3**: Show terms link for each plan
4. **AC-6.4.4**: "Select this plan" triggers setPaymentPreference mutation
5. **AC-6.4.5**: "Financial assistance" link opens support chat (Intercom)
6. **AC-6.4.6**: Modal keyboard navigable and screen reader accessible

---

## Traceability Mapping

| AC | Spec Section | Component | Test Idea |
|----|--------------|-----------|-----------|
| AC-6.1.1 | APIs/GetCostEstimate | CostEstimationCard | Verify query fires on mount, check loading time |
| AC-6.1.2 | Data Models/CostEstimate | CostEstimationCard | Render with mock data, verify coverage display |
| AC-6.1.3 | Workflows/Error Handling | CostEstimationCard | Mock API error, verify fallback UI |
| AC-6.1.4 | Data Models/disclaimer | CostEstimationCard | Verify disclaimer renders from API |
| AC-6.1.5 | Security/PHI | CostEstimationCard | Check member ID masking in UI |
| AC-6.2.1 | APIs/GetSelfPayRates | SelfPayRateCard | Verify always displays |
| AC-6.2.2 | Data Models/SelfPayPackage | SelfPayRateCard | Render packages, verify savings calc |
| AC-6.2.3 | Components/CostComparisonView | CostComparisonView | Conditional render test |
| AC-6.2.4 | Components/CostComparisonView | CostComparisonView | Visual diff test with Playwright |
| AC-6.2.5 | APIs/SetPaymentPreference | SelfPayRateCard | Mock mutation, verify call |
| AC-6.3.1 | Data Models/deductibleInfo | DeductibleTracker | Progress bar render test |
| AC-6.3.2 | Data Models/deductibleRemaining | DeductibleTracker | Currency formatting test |
| AC-6.3.3 | Data Models/outOfPocketMet | DeductibleTracker | OOP progress render test |
| AC-6.3.4 | Workflows/Graceful Degradation | DeductibleTracker | Null data handling test |
| AC-6.3.5 | Data Models/outOfPocketMax | DeductibleTracker | Max reached indicator test |
| AC-6.4.1 | Components/PaymentPlanModal | PaymentPlanModal | Dialog open/close test |
| AC-6.4.2 | APIs/GetPaymentPlans | PaymentPlanModal | Plan list render test |
| AC-6.4.3 | Data Models/PaymentPlan.terms | PaymentPlanModal | Terms link render test |
| AC-6.4.4 | APIs/SetPaymentPreference | PaymentPlanModal | Selection mutation test |
| AC-6.4.5 | Integration/Intercom | PaymentPlanModal | Intercom trigger test |
| AC-6.4.6 | Accessibility | PaymentPlanModal | a11y audit with axe |

---

## Risks, Assumptions, Open Questions

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Backend cost APIs not ready | Medium | High | Use mock data layer, coordinate with backend team |
| Insurance verification delays cost accuracy | Medium | Medium | Show disclaimer, allow proceed without estimate |
| Users confused by estimate vs actual cost | High | Medium | Clear disclaimer language, support link |

### Assumptions

- **A1**: Backend provides all cost calculation logic; frontend only displays
- **A2**: Self-pay rates are static and cacheable (not per-user calculated)
- **A3**: Deductible data requires insurance API integration (may be unavailable MVP)
- **A4**: Payment plan selection is stored but not enforced until checkout (out of scope)

### Open Questions

- **Q1**: Should cost estimation be a blocker for proceeding to scheduling, or optional?
  - **Recommendation**: Optional with prominent display
- **Q2**: How long should cost estimates be cached before refresh?
  - **Recommendation**: Cache for session duration, refresh on insurance edit
- **Q3**: What fallback rates should display if backend unavailable?
  - **Recommendation**: Static "typical range" with disclaimer

---

## Test Strategy Summary

### Test Levels

| Level | Framework | Coverage |
|-------|-----------|----------|
| Unit | Vitest + React Testing Library | Component render, hooks, formatters |
| Integration | Vitest + MSW | Apollo queries, mutations, error handling |
| E2E | Playwright | Full cost flow, accessibility |
| Visual | Playwright screenshots | Comparison view, progress bars |

### Key Test Scenarios

1. **Happy Path**: Insurance estimate displays correctly with all data
2. **Self-Pay Only**: User without insurance sees self-pay options
3. **Comparison View**: Both options display with recommendation highlight
4. **Degraded State**: Missing deductible data shows graceful fallback
5. **Error State**: API failure shows support contact
6. **Payment Selection**: Plan selection persists to session
7. **Accessibility**: Modal keyboard navigation, screen reader labels

### Test Data

- Mock `CostEstimate` with various insurance scenarios
- Mock `SelfPayRate` with package options
- Mock `PaymentPlan` array with different frequencies
- Error responses for failure path testing

