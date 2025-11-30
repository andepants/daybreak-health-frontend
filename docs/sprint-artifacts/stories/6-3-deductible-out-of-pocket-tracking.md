# Story 6.3: Deductible and Out-of-Pocket Tracking

Status: ready-for-dev

## Story

As a **parent using insurance**,
I want **to understand my deductible status and out-of-pocket maximum**,
So that **I know how costs might change over time**.

## Acceptance Criteria

1. **Deductible Progress Display**
   - Given I have insurance with deductible information
   - When viewing cost details
   - Then I see:
     - Current deductible amount met (if known)
     - Remaining deductible (e.g., "$500 remaining of $1,500")
     - Progress bar visualization
     - Note: "Costs may decrease after deductible is met"

2. **Out-of-Pocket Maximum Display**
   - Given I have insurance with out-of-pocket maximum information
   - When viewing cost details
   - Then I see:
     - Annual out-of-pocket maximum (if available)
     - Amount applied toward maximum
     - "You've reached your max" indicator if applicable
     - Progress bar visualization matching deductible style

3. **Unavailable Data Handling**
   - Given the backend cannot determine deductible/OOP information
   - When viewing cost details
   - Then I see:
     - "Unable to determine" message with clear explanation
     - Link to "Contact your insurance for details"
     - No broken UI or empty states
     - Graceful degradation with helpful messaging

4. **Visual Consistency**
   - Given I view deductible and OOP progress indicators
   - When comparing visual elements
   - Then:
     - Progress bars use consistent Daybreak theme colors
     - Teal for progress, cream/gray for remaining
     - Clear labels and amounts visible
     - Mobile-responsive layout (stacked on mobile, side-by-side on desktop)

5. **Data Source Integration**
   - Given the backend provides insurance verification data
   - When the component loads
   - Then:
     - Data comes from `getCostEstimate` query or similar endpoint
     - Loading state shows skeleton UI while fetching
     - Error state displays with retry option
     - Cached data persists in Apollo cache for session

## Tasks / Subtasks

- [ ] Task 1: Create DeductibleTracker component (AC: #1, #4)
  - [ ] Create `features/cost/DeductibleTracker.tsx` component
  - [ ] Accept props: deductibleMet, deductibleTotal, isLoading, isAvailable
  - [ ] Implement progress bar using shadcn/ui Progress component
  - [ ] Add Daybreak theme colors (teal for progress, gray for remaining)
  - [ ] Display "remaining" and "total" amounts with proper formatting
  - [ ] Add "Costs may decrease after deductible is met" note
  - [ ] Handle unavailable state with helpful message
  - [ ] Ensure responsive layout (full width on mobile)
  - [ ] Add proper TypeScript types for all props

- [ ] Task 2: Create OutOfPocketTracker component (AC: #2, #4)
  - [ ] Create `features/cost/OutOfPocketTracker.tsx` component
  - [ ] Accept props: oopMet, oopMax, isLoading, isAvailable
  - [ ] Implement progress bar matching DeductibleTracker style
  - [ ] Display current amount toward max and annual max
  - [ ] Add "You've reached your max" indicator when oopMet >= oopMax
  - [ ] Handle unavailable state with clear messaging
  - [ ] Ensure consistent styling with DeductibleTracker
  - [ ] Add proper TypeScript types for all props

- [ ] Task 3: Integrate with cost estimation screen (AC: #5)
  - [ ] Update `features/cost/CostEstimationCard.tsx` to include trackers
  - [ ] Add DeductibleTracker and OutOfPocketTracker components
  - [ ] Pass data from getCostEstimate query response
  - [ ] Handle loading states with skeleton UI
  - [ ] Implement error handling with retry mechanism
  - [ ] Ensure proper data flow from GraphQL to components

- [ ] Task 4: Add GraphQL query integration (AC: #5)
  - [ ] Review/update `features/cost/cost.graphql` query
  - [ ] Ensure query includes deductible and OOP fields:
    - deductibleMet, deductibleTotal, deductibleAvailable
    - outOfPocketMet, outOfPocketMax, oopAvailable
  - [ ] Run `pnpm codegen` to generate TypeScript types
  - [ ] Update `types/graphql.ts` imports in components
  - [ ] Add proper error handling for query failures

- [ ] Task 5: Implement unavailable data states (AC: #3)
  - [ ] Add unavailable state UI to both tracker components
  - [ ] Display "Unable to determine" message with icon
  - [ ] Add "Contact your insurance for details" link
  - [ ] Link opens support chat or provides phone number
  - [ ] Test with mocked unavailable data scenarios
  - [ ] Ensure accessible fallback messaging

- [ ] Task 6: Styling and responsive design (AC: #4)
  - [ ] Apply Daybreak theme colors from tailwind.config
  - [ ] Progress bars: bg-daybreak-teal for filled, bg-gray-200 for empty
  - [ ] Use Inter font for amounts, proper sizing (16px body)
  - [ ] Implement responsive grid: stacked on mobile, 2-column on desktop
  - [ ] Test on mobile viewports (320px to 640px)
  - [ ] Test on desktop viewports (1024px+)
  - [ ] Ensure touch targets are 44x44px minimum

- [ ] Task 7: Accessibility and UX polish (AC: #1, #2, #4)
  - [ ] Add ARIA labels to progress bars: "Deductible progress", "Out-of-pocket progress"
  - [ ] Ensure progress percentage is announced to screen readers
  - [ ] Add tooltips/help icons explaining deductible vs OOP
  - [ ] Test with VoiceOver/screen readers
  - [ ] Add smooth animations for progress bar fills
  - [ ] Implement loading skeletons for async data

- [ ] Task 8: Testing (All ACs)
  - [ ] Write unit tests for DeductibleTracker component
    - Test with available data (partial progress)
    - Test with completed deductible (100%)
    - Test with unavailable data
  - [ ] Write unit tests for OutOfPocketTracker component
    - Test with available data (partial progress)
    - Test with max reached (100%)
    - Test with unavailable data
  - [ ] Test GraphQL query integration with mocked responses
  - [ ] Add E2E test for cost estimation screen with trackers
  - [ ] Verify responsive behavior at various breakpoints
  - [ ] Test accessibility with automated tools (axe, Lighthouse)

## Dev Notes

### Architecture Patterns and Constraints

**Component Responsibility:**
- `DeductibleTracker.tsx` - Self-contained display component for deductible progress
- `OutOfPocketTracker.tsx` - Self-contained display component for OOP progress
- `CostEstimationCard.tsx` - Container component that fetches data and orchestrates trackers

**Data Flow:**
- Backend provides deductible/OOP data via GraphQL query (likely part of `getCostEstimate`)
- Frontend consumes data, handles loading/error states
- Apollo Client caches data for session
- Components gracefully handle missing/unavailable data

**Styling Requirements:**
- Use Daybreak theme colors: `daybreak-teal` (#2A9D8F) for progress
- Progress bars should use shadcn/ui `Progress` component as base
- Match existing cost estimation card styling
- Maintain 4px spacing unit (Tailwind spacing: sm, md, lg)

**Graceful Degradation:**
- Per Architecture: "Graceful degradation when AI or real-time features encounter issues"
- Not all insurance plans provide deductible/OOP data via API
- Component must handle unavailable data as first-class scenario, not error
- Provide clear path to manual verification (contact insurance)

**PHI Protection:**
- Deductible and OOP amounts are not considered PHI
- However, insurance plan details should not be logged
- Use `phi-guard.ts` if logging any insurance-related operations
- No sensitive insurance data in URLs or frontend logs

### Project Structure Notes

**Files to Create:**
- `/features/cost/DeductibleTracker.tsx` - Deductible progress component
- `/features/cost/OutOfPocketTracker.tsx` - OOP progress component

**Files to Modify:**
- `/features/cost/CostEstimationCard.tsx` - Add tracker components
- `/features/cost/cost.graphql` - Ensure query includes deductible/OOP fields
- `/features/cost/useCostEstimation.ts` - Handle tracker data (if hook exists)
- `/types/graphql.ts` - Auto-generated after schema update

**Alignment with Project Structure:**
- Follows `features/` organization per Architecture
- Cost-related components grouped under `features/cost/`
- GraphQL operations co-located with components
- Consistent naming convention: PascalCase for components

**Potential Conflicts:**
- Story 6.1 (Cost Estimation Display) should have created base `CostEstimationCard.tsx`
- Story 6.2 (Self-Pay Rate Display) may have modified the same component
- Ensure integration doesn't break existing cost display functionality
- Test combined view with insurance estimate + self-pay + trackers

### References

**From Epics.md:**
- [Source: docs/epics.md#Story-6.3-Deductible-and-Out-of-Pocket-Tracking]
- Epic 6: Cost Estimation Tool
- Covers FR-010: Cost estimation based on insurance
- Technical Notes: "Consumes backend story 6-4 (Deductible & Out-of-Pocket Tracking)"
- Note: "May require insurance API integration (Growth feature)"
- Graceful degradation: "Shows 'Unable to determine' with explanation if data unavailable"

**From Architecture.md:**
- [Source: docs/architecture.md#Pre-mortem-Risk-Mitigations]
- PHI protection requirements
- Graceful degradation principles
- [Source: docs/architecture.md#Project-Structure]
- Component organization in `features/cost/`
- [Source: docs/architecture.md#Fundamental-Truths]
- "Insurance is a friction point" - must handle missing data gracefully

**Backend Integration:**
- Backend story 6-4 provides deductible & out-of-pocket tracking API
- Data likely embedded in `getCostEstimate` query response
- May require insurance eligibility verification API (e.g., Change Healthcare, Availity)
- Not all plans provide real-time deductible data - graceful degradation required

**Design System:**
- Daybreak theme colors: teal (#2A9D8F), cream (#FEF7ED)
- Typography: Inter font for body text
- Spacing: 4px base unit (xs:4, sm:8, md:16, lg:24)
- Border radius: sm:8px, md:12px, lg:16px
- Progress bars should match Daybreak visual language

### Testing Standards Summary

**Unit Tests (Vitest):**
- Test DeductibleTracker renders with various data states
- Test OutOfPocketTracker renders with various data states
- Test progress calculation logic (e.g., 500/1500 = 33%)
- Test unavailable state messaging
- Mock GraphQL query responses
- Test responsive layout breakpoints

**E2E Tests (Playwright):**
- Navigate to cost estimation screen
- Verify deductible tracker displays with mocked insurance data
- Verify OOP tracker displays
- Test unavailable state displays correctly
- Test progress bars render at correct percentages
- Verify "Contact insurance" link works

**Accessibility:**
- ARIA labels for progress bars
- Proper heading hierarchy
- Keyboard navigation for "Contact insurance" link
- Screen reader announces progress percentages
- Color contrast meets WCAG AA (4.5:1 for text)
- Touch targets minimum 44x44px

**Visual Regression:**
- Snapshot tests for tracker components
- Compare rendered output at various progress percentages
- Test mobile and desktop layouts

### Learnings from Previous Story

No previous Epic 6 stories completed yet - this is the first implementation in the Cost Estimation Tool epic.

**Expected Context from Epic 6:**
- Story 6.1 should have created `CostEstimationCard.tsx` base component
- Story 6.2 should have added self-pay comparison UI
- This story adds deductible/OOP trackers to existing cost display
- Ensure new components integrate seamlessly with existing cost UI

## Dev Agent Record

### Context Reference

- [Story Context XML](../context/6-3-deductible-out-of-pocket-tracking.context.xml)

### Agent Model Used

<!-- Will be filled during implementation -->

### Debug Log References

<!-- Will be filled during implementation -->

### Completion Notes List

<!-- Will be filled during implementation -->

### File List

<!-- Will be filled during implementation -->

## Change Log

- 2025-11-30: Story created by SM agent via create-story workflow
- 2025-11-30: Story context generated by story-context workflow
