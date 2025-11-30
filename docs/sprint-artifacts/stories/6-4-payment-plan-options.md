# Story 6.4: Payment Plan Options

Status: ready-for-dev

## Story

As a **parent concerned about affordability**,
I want **to see available payment plan options**,
so that **I can spread costs over time if needed**.

## Acceptance Criteria

### Given I am viewing cost information
**When** I click "Payment options" or costs exceed a threshold
**Then** I see:

#### 1. Payment Plans Modal Display
- Modal titled "Flexible Payment Options"
- Available plans listed (e.g., "Pay per session", "Monthly billing", "Package prepay")
- Each plan displays:
  - Payment frequency
  - Amount per payment
  - Any savings/discounts
  - Terms and conditions link

#### 2. Plan Selection Actions
- "Select this plan" button for each option
- "Pay as you go" default option clearly indicated
- "Talk to us about financial assistance" link available

#### 3. Functional Requirements
- Selecting a plan updates session with payment preference
- Modal is accessible (keyboard navigation, screen reader compatible)
- "Continue to booking" proceeds with selected plan

## Tasks / Subtasks

### Task 1: Create Payment Plan Modal Component (AC: #1, #2)
- [ ] Create `features/cost/PaymentPlanModal.tsx` using shadcn/ui Dialog
  - [ ] Implement modal structure with header "Flexible Payment Options"
  - [ ] Add close button with proper ARIA labels
  - [ ] Ensure modal traps focus for accessibility
- [ ] Create payment plan card layout component
  - [ ] Display payment frequency (per session, monthly, package)
  - [ ] Show amount per payment with clear formatting
  - [ ] Render savings/discounts badges
  - [ ] Include terms and conditions link
- [ ] Implement plan selection state management
  - [ ] Track selected plan in local state
  - [ ] Highlight selected plan visually
  - [ ] Enable/disable "Continue to booking" based on selection

### Task 2: GraphQL Integration for Payment Plans (AC: #1, #3)
- [ ] Create GraphQL query for payment plan options
  - [ ] Define query in `features/cost/graphql/GetPaymentPlans.graphql`
  - [ ] Generate TypeScript types via codegen
  - [ ] Handle loading and error states
- [ ] Create mutation to save payment plan preference
  - [ ] Define mutation in `features/cost/graphql/SavePaymentPlan.graphql`
  - [ ] Implement optimistic update in Apollo cache
  - [ ] Update session with selected payment preference

### Task 3: Accessibility and UX Polish (AC: #2, #3)
- [ ] Implement keyboard navigation
  - [ ] Tab through plans and action buttons
  - [ ] Enter/Space to select plan
  - [ ] Escape to close modal
- [ ] Add screen reader support
  - [ ] ARIA labels for all interactive elements
  - [ ] Announce plan selection changes
  - [ ] Proper heading hierarchy
- [ ] Implement responsive design
  - [ ] Mobile: Full-screen modal with bottom sheet pattern
  - [ ] Desktop: Centered dialog with max-width
  - [ ] Touch targets minimum 44x44px

### Task 4: Financial Assistance Link Integration (AC: #2)
- [ ] Add "Talk to us about financial assistance" link
  - [ ] Opens Intercom support chat (if available)
  - [ ] Or links to support contact form
  - [ ] Includes contextual message about financial assistance

### Task 5: Testing (All ACs)
- [ ] Unit tests for PaymentPlanModal component
  - [ ] Test plan selection state changes
  - [ ] Test modal open/close behavior
  - [ ] Test accessibility features
- [ ] Integration tests for GraphQL operations
  - [ ] Test payment plan query loading
  - [ ] Test payment plan mutation saves correctly
  - [ ] Test error handling
- [ ] E2E test for complete user flow
  - [ ] Open modal from cost estimation page
  - [ ] Select a payment plan
  - [ ] Verify selection persists
  - [ ] Continue to booking with selected plan

## Dev Notes

### Architecture Patterns and Constraints

**Component Structure:**
- Use shadcn/ui `Dialog` component as modal foundation [Source: docs/architecture.md#Component-Library]
- Follow feature-based folder structure: `features/cost/` [Source: docs/architecture.md#Project-Structure]
- Co-locate GraphQL operations with component [Source: docs/architecture.md#GraphQL-Organization]

**State Management:**
- Local modal state with React useState for UI interactions
- Apollo Client cache for payment plan data and session updates [Source: docs/architecture.md#Apollo-Client]
- Optimistic updates for improved UX on plan selection

**Accessibility:**
- WCAG AA compliance required for all interactive elements [Source: docs/architecture.md#Accessibility]
- Keyboard navigation must work without mouse
- Screen reader support with proper ARIA attributes

### Source Tree Components to Touch

**New Files:**
- `features/cost/PaymentPlanModal.tsx` - Main modal component
- `features/cost/PaymentPlanCard.tsx` - Individual plan card component (optional, can be inline)
- `features/cost/graphql/GetPaymentPlans.graphql` - Query for payment plans
- `features/cost/graphql/SavePaymentPlan.graphql` - Mutation to save selection
- `features/cost/hooks/usePaymentPlans.ts` - Custom hook for payment plan logic
- `features/cost/PaymentPlanModal.test.tsx` - Unit tests

**Modified Files:**
- `features/cost/CostEstimationCard.tsx` - Add button to trigger modal
- `app/onboarding/[sessionId]/cost/page.tsx` - Integrate modal into cost page
- `types/graphql.ts` - Auto-generated types from codegen

### Testing Standards Summary

**Unit Tests (Vitest):**
- Test component rendering with different plan configurations
- Test user interactions (select plan, close modal)
- Test accessibility features (keyboard navigation, ARIA)
- Mock GraphQL queries and mutations

**Integration Tests:**
- Test GraphQL query returns expected payment plan structure
- Test mutation updates Apollo cache correctly
- Test error handling for failed queries/mutations

**E2E Tests (Playwright):**
- Navigate to cost estimation page
- Open payment plan modal
- Select a plan and verify UI updates
- Confirm selection persists in session
- Continue to booking flow

### Project Structure Notes

**Alignment with Unified Project Structure:**
- `features/cost/` directory follows feature-based organization
- GraphQL operations in `features/cost/graphql/` subdirectory
- Custom hooks in `features/cost/hooks/` for reusable logic
- Tests co-located with components per convention

**Naming Conventions:**
- Component files use PascalCase: `PaymentPlanModal.tsx`
- GraphQL files use PascalCase: `GetPaymentPlans.graphql`
- Hook files use camelCase with 'use' prefix: `usePaymentPlans.ts`

### References

- **Backend Integration:** Consumes payment plan options from backend Epic 6 Story 6-5 (Payment Plan Options) [Source: docs/epics.md#Epic-6-Story-6.5]
- **Design System:** Uses Daybreak theme colors and typography [Source: docs/architecture.md#Design-System]
- **Cost Estimation Context:** Builds on Story 6.1 (Cost Estimation Display) and 6.2 (Self-Pay Rate Display) [Source: docs/epics.md#Epic-6]
- **Accessibility Standards:** WCAG AA compliance required [Source: docs/architecture.md#Accessibility-Requirements]

### Backend Dependencies

**Required Backend APIs (from Epic 6 Story 6-5):**
- `getPaymentPlans(sessionId: ID!): [PaymentPlan]` - Returns available payment plan options
- `savePaymentPlan(sessionId: ID!, planId: ID!): OnboardingSession` - Saves selected payment plan preference

**Expected PaymentPlan Type:**
```graphql
type PaymentPlan {
  id: ID!
  name: String!
  description: String
  frequency: PaymentFrequency!
  amountPerPayment: Float!
  discount: Float
  termsUrl: String
}

enum PaymentFrequency {
  PER_SESSION
  MONTHLY
  PACKAGE
}
```

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/stories/6-4-payment-plan-options.context.xml

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

### Completion Notes List

### File List
