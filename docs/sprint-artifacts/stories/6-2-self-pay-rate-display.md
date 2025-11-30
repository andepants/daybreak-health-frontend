# Story 6.2: Self-Pay Rate Display

Status: ready-for-dev

## Story

As a **parent without insurance or preferring self-pay**,
I want **to see clear self-pay pricing**,
So that **I understand my options and can compare costs**.

## Acceptance Criteria

**Given** I selected self-pay or want to compare options
**When** viewing the cost estimation screen
**Then** I see:

### Self-Pay Section
1. "Self-Pay Rate" heading displayed prominently
2. Per-session price clearly shown (e.g., "$150 per session")
3. Package discounts if available (e.g., "Buy 4 sessions, save 10%")
4. Comparison with insurance estimate (if insurance information was provided)

### Comparison View (if insurance provided)
5. Side-by-side display: Insurance estimate vs Self-pay rate
6. Highlight which option is more affordable
7. Note any trade-offs (e.g., "Insurance requires using in-network therapists")

### Functional Requirements
8. Self-pay rates come from backend configuration
9. "Choose self-pay" button updates session preference
10. All pricing information is displayed in a clear, accessible format with proper WCAG compliance

## Tasks / Subtasks

- [ ] Task 1: Create Self-Pay Rate Display Component (AC: #1, #2, #3)
  - [ ] Create `features/cost/SelfPayRateCard.tsx` component
  - [ ] Display per-session self-pay rate with clear heading
  - [ ] Show package discount options if available from backend
  - [ ] Style using Daybreak design tokens (teal, cream, typography)
  - [ ] Ensure mobile-responsive layout (single column)

- [ ] Task 2: Implement Insurance vs Self-Pay Comparison View (AC: #4, #5, #6, #7)
  - [ ] Create `features/cost/CostComparisonView.tsx` component
  - [ ] Implement side-by-side comparison layout (responsive)
  - [ ] Add visual highlighting for more affordable option
  - [ ] Display trade-offs and considerations for each option
  - [ ] Conditional rendering based on insurance data availability

- [ ] Task 3: Integrate Backend Self-Pay Configuration (AC: #8)
  - [ ] Create or update GraphQL query to fetch self-pay rates
  - [ ] Handle package pricing structure from backend
  - [ ] Implement Apollo Client caching for self-pay rates
  - [ ] Add error handling for missing self-pay configuration

- [ ] Task 4: Add Self-Pay Selection Functionality (AC: #9)
  - [ ] Create "Choose self-pay" button/action
  - [ ] Implement mutation to update session payment preference
  - [ ] Update local Apollo cache on selection
  - [ ] Add confirmation or feedback on selection

- [ ] Task 5: Accessibility and Testing (AC: #10)
  - [ ] Ensure WCAG AA compliance for all text and interactive elements
  - [ ] Add proper ARIA labels for screen readers
  - [ ] Test keyboard navigation for comparison view
  - [ ] Write unit tests for cost comparison logic
  - [ ] Write integration tests for self-pay selection flow

## Dev Notes

### Architecture Patterns and Constraints

**Component Architecture:**
- Follow established feature-based structure: `features/cost/`
- Use shadcn/ui components for cards and buttons
- Implement responsive design with Tailwind CSS breakpoints
- Follow composition pattern from existing cost estimation components (Story 6.1)

**State Management:**
- Use Apollo Client for self-pay rate queries and caching
- Implement optimistic UI updates for payment preference selection
- Follow existing session state management patterns from `useOnboardingSession` hook

**Backend Integration:**
- Consumes backend Story 6-3 (Self-Pay Rates & Comparison) API
- GraphQL query: `getSelfPayRates` or similar
- Mutation: `updatePaymentPreference` or `chooseSelfPay`
- Expected response structure should include:
  - `baseRate`: number
  - `packageOptions`: array of discount structures
  - `comparisonData`: insurance vs self-pay comparison

**Styling Guidelines:**
- Use Daybreak color palette: teal (#2A9D8F), cream (#FEF7ED), deep-text (#1A3C34)
- Typography: Inter for body text, Fraunces for headings
- Spacing: Follow 4px base unit system
- Border radius: md (12px) for cards
- Touch targets: minimum 44x44px for WCAG compliance

**Testing Standards:**
- Unit tests: Component rendering, price formatting, conditional logic
- Integration tests: GraphQL queries, mutation handling, cache updates
- Accessibility tests: Keyboard navigation, screen reader compatibility
- Visual regression: Cost comparison layout on mobile and desktop

### Project Structure Notes

**Expected File Locations:**
```
features/cost/
├── SelfPayRateCard.tsx       [NEW] - Self-pay pricing display
├── CostComparisonView.tsx    [NEW] - Insurance vs self-pay comparison
├── CostEstimationCard.tsx    [EXISTING from 6.1] - Insurance cost display
├── DeductibleTracker.tsx     [FUTURE 6.3] - Deductible tracking
└── PaymentPlanModal.tsx      [FUTURE 6.4] - Payment plans

graphql/cost/
├── getSelfPayRates.graphql   [NEW] - Query for self-pay rates
└── updatePaymentPreference.graphql [NEW] - Mutation for preference

lib/utils/
└── formatCurrency.ts         [NEW or REUSE] - Currency formatting utility
```

**Alignment with Unified Project Structure:**
- Components follow feature-based organization per Architecture
- GraphQL operations co-located with feature in `graphql/` directory
- Utilities in `lib/utils/` for reusable formatting logic
- Tests co-located with components: `SelfPayRateCard.test.tsx`

**Potential Conflicts:**
- None detected - this is a new feature component
- Should integrate smoothly with existing cost estimation flow from Story 6.1

### References

- [Source: docs/epics.md#Epic-6-Cost-Estimation-Tool]
- [Source: docs/epics.md#Story-6.2-Self-Pay-Rate-Display]
- [Backend dependency: Epic 6, Story 6-3 - Self-Pay Rates & Comparison API]
- [Design system: docs/ux-design.md#Section-3.1-Colors]
- [Design system: docs/ux-design.md#Section-3.2-Typography]
- [Architecture: docs/architecture.md#Component-Structure]
- [Architecture: docs/architecture.md#Apollo-Client-Configuration]
- [Testing: docs/architecture.md#Testing-Strategy]

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/stories/6-2-self-pay-rate-display.context.xml

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

### Completion Notes List

### File List
