# Story 5.1: Therapist Matching Results Display

Status: ready-for-dev

## Story

As a **parent**,
I want **to see therapists matched for my child with clear explanations**,
So that **I understand why they're recommended and can choose confidently**.

## Acceptance Criteria

1. **Loading State**
   - GIVEN I complete insurance submission
   - WHEN navigating to `/onboarding/[sessionId]/matching`
   - THEN I see "Finding the best matches for [child name]..." with animated progress indicator
   - AND loading state typically takes 1-3 seconds

2. **Results Display**
   - GIVEN matching is complete
   - WHEN results are displayed
   - THEN I see 2-3 matched therapists shown as cards
   - AND cards are ordered by match quality (best first)
   - AND "Best Match" badge appears on top recommendation

3. **Therapist Card Component**
   - GIVEN each therapist card (`features/matching/TherapistCard.tsx`)
   - WHEN viewing the card
   - THEN it displays:
     - Professional photo (80x80, rounded)
     - Name and credentials (e.g., "Dr. Sarah Chen, LMFT")
     - Specialty tags (e.g., "Anxiety", "Teen Issues")
     - Match reasons (e.g., "Specializes in concerns like yours")
     - Availability preview ("Available this week")
     - "Book Now" button (primary)
     - "View Profile" link (secondary)

4. **Match Transparency**
   - GIVEN each card
   - WHEN reviewing match information
   - THEN I see 2-3 specific match reasons explaining why this therapist was selected
   - AND "Why these therapists?" expandable section explains matching criteria
   - AND transparency meets pre-mortem requirement for showing reasoning

5. **Alternative Options**
   - GIVEN I am viewing matched therapists
   - WHEN none feel right
   - THEN I see "None of these feel right?" link
   - AND clicking offers to see more therapists or contact support

6. **Responsive Design**
   - GIVEN any device size
   - WHEN viewing the matching results page
   - THEN therapist cards display optimally:
     - Mobile: stacked single column, full width
     - Desktop: centered, max-width 640px
   - AND all touch targets are minimum 44x44px (WCAG)

7. **Performance**
   - GIVEN therapist photos are displayed
   - WHEN page loads
   - THEN images are optimized via `next/image`
   - AND page meets performance budget (<1.5s LCP)

## Tasks / Subtasks

- [ ] **Task 1: Create matching page route** (AC: 1, 2)
  - [ ] Subtask 1.1: Create `app/onboarding/[sessionId]/matching/page.tsx` route file
  - [ ] Subtask 1.2: Implement loading skeleton state matching therapist card layout
  - [ ] Subtask 1.3: Add animated progress indicator with child name interpolation
  - [ ] Subtask 1.4: Implement error boundary for matching failures

- [ ] **Task 2: Implement TherapistCard component** (AC: 3, 6, 7)
  - [ ] Subtask 2.1: Create `features/matching/TherapistCard.tsx` component
  - [ ] Subtask 2.2: Add professional photo with `next/image` (80x80, rounded)
  - [ ] Subtask 2.3: Display name, credentials with proper typography (Inter, deep-text color)
  - [ ] Subtask 2.4: Implement specialty tags as shadcn/ui Badge components
  - [ ] Subtask 2.5: Add availability preview section
  - [ ] Subtask 2.6: Style "Book Now" button (primary teal, pill shape)
  - [ ] Subtask 2.7: Style "View Profile" link (tertiary, outline teal)
  - [ ] Subtask 2.8: Ensure responsive layout (mobile: stacked, desktop: centered)
  - [ ] Subtask 2.9: Verify all touch targets meet 44x44px minimum

- [ ] **Task 3: Implement MatchRationale component** (AC: 4)
  - [ ] Subtask 3.1: Create `features/matching/MatchRationale.tsx` component
  - [ ] Subtask 3.2: Display 2-3 specific match reasons with icons
  - [ ] Subtask 3.3: Create "Why these therapists?" expandable section (shadcn/ui Accordion)
  - [ ] Subtask 3.4: Populate match reasoning from backend response
  - [ ] Subtask 3.5: Ensure warm, supportive tone in copy

- [ ] **Task 4: Implement "Best Match" badge** (AC: 2)
  - [ ] Subtask 4.1: Create conditional badge component for top match
  - [ ] Subtask 4.2: Style badge with teal background and proper positioning
  - [ ] Subtask 4.3: Ensure badge is visible but not intrusive

- [ ] **Task 5: Create GraphQL query for therapist matching** (AC: 2, 3, 4)
  - [ ] Subtask 5.1: Create `features/matching/matching.graphql` file
  - [ ] Subtask 5.2: Define `MatchTherapists` query operation
  - [ ] Subtask 5.3: Request fields: id, name, credentials, photo, specialties, matchReasons, availability
  - [ ] Subtask 5.4: Run `pnpm codegen` to generate TypeScript hooks
  - [ ] Subtask 5.5: Implement `useMatchTherapistsQuery` in page component

- [ ] **Task 6: Implement alternative options link** (AC: 5)
  - [ ] Subtask 6.1: Add "None of these feel right?" link at bottom of results
  - [ ] Subtask 6.2: Create handler to show more therapists or open support chat
  - [ ] Subtask 6.3: Style as ghost button for subtle appearance

- [ ] **Task 7: Implement results ordering logic** (AC: 2)
  - [ ] Subtask 7.1: Ensure cards render in match quality order from backend
  - [ ] Subtask 7.2: Add key prop for proper React list rendering
  - [ ] Subtask 7.3: Implement smooth fade-in animation for card appearance

- [ ] **Task 8: Add navigation handlers** (AC: 3)
  - [ ] Subtask 8.1: Implement "Book Now" button navigation to `/onboarding/[sessionId]/schedule`
  - [ ] Subtask 8.2: Pass therapist ID via URL params or state
  - [ ] Subtask 8.3: Implement "View Profile" handler (prepare for Story 5.2)

- [ ] **Task 9: Testing** (All AC)
  - [ ] Subtask 9.1: Write Vitest unit tests for TherapistCard component
  - [ ] Subtask 9.2: Write Vitest unit tests for MatchRationale component
  - [ ] Subtask 9.3: Test responsive behavior at mobile (320px) and desktop (1024px) breakpoints
  - [ ] Subtask 9.4: Test loading state → results transition
  - [ ] Subtask 9.5: Test error state when matching fails
  - [ ] Subtask 9.6: Verify WCAG AA color contrast for all text
  - [ ] Subtask 9.7: Test keyboard navigation through cards and buttons

## Dev Notes

### Functional Requirements Coverage
This story implements **FR-011**: "The system shall suggest therapists based on assessment results, child's needs, and availability."

### Architecture Alignment

**Route Location:**
- `app/onboarding/[sessionId]/matching/page.tsx` per Architecture project structure

**Components:**
- `features/matching/TherapistCard.tsx` - Matched therapist display
- `features/matching/MatchRationale.tsx` - "Matched because..." display
- `features/matching/useMatching.ts` - Matching query hook
- GraphQL: `features/matching/matching.graphql`

**Design System:**
- Colors: Daybreak Teal (#2A9D8F) for primary actions, Warm Orange (#E9A23B) for accents
- Typography: Fraunces for headings, Inter for body (per UX Spec Section 3.2)
- Spacing: Follow 4px base unit system (md: 16px padding, lg: 24px section spacing)
- Border Radius: lg (16px) for cards per UX Spec Section 3.4
- Buttons: Primary (solid teal, pill shape), Tertiary (outline teal) per UX Spec Section 7.1

**GraphQL Integration:**
- Use Apollo Client with `useMatchTherapistsQuery` hook (generated by codegen)
- Cache matched therapists in Apollo cache with `TherapistMatch` type policy
- Loading state managed by Apollo's `loading` property
- Error handling per Architecture error patterns (show toast with retry)

**Image Optimization:**
- Use `next/image` for therapist photos with width={80} height={80}
- Implement proper `alt` text for accessibility
- Consider blur placeholder for better UX

### UX Design Patterns

**Card Layout (UX Spec Section 6.2):**
- Generous spacing within cards (padding: lg/24px)
- Subtle shadow for elevation
- Hover state: slight scale (1.02) and enhanced shadow
- Cards should be tappable/clickable for full profile (Story 5.2)

**Loading States (Architecture Section "Lifecycle Patterns"):**
- Skeleton component matching card shape
- 3 skeleton cards to match expected result count
- Smooth transition from skeleton to actual content

**Empty State:**
- If no therapists matched: Helpful message + contact support CTA
- "We're having trouble finding matches. Our team can help." tone

**Match Transparency (Pre-mortem Requirement):**
- Critical per Architecture Section "Pre-mortem Risk Mitigations"
- Must show "matched because..." with 3 reasons
- Prevents "black box matching" concern
- Example reasons:
  - "Specializes in teen anxiety"
  - "Available within 3 days"
  - "Experience with similar concerns"

### Testing Standards

**Unit Tests (Vitest + React Testing Library):**
- Test TherapistCard renders all required elements
- Test "Best Match" badge appears only on first card
- Test "Book Now" navigation
- Mock GraphQL response with MSW

**Accessibility Tests:**
- Verify `aria-label` on interactive elements
- Test keyboard navigation (Tab through cards, Enter to select)
- Test screen reader announcements (card count, match reasons)
- Verify color contrast meets WCAG AA (4.5:1)

**Visual Regression (optional):**
- Snapshot tests for card layout at mobile and desktop widths

### Performance Considerations

**Performance Budget:**
- Target LCP < 1.5s (Architecture requirement)
- Lazy load images below fold
- Prefetch schedule route on "Book Now" hover

**Optimization:**
- Use `next/image` with proper sizing
- Consider placeholder blur for photos
- Minimize rerenders with React.memo on TherapistCard if needed

### Security & Privacy

**PHI Protection:**
- No child name or assessment details in console logs
- Use `phiGuard` utility if logging for debugging
- Therapist data is not PHI, safe to log IDs for debugging

### References

- [Source: docs/prd.md#FR-011] - Therapist suggestion requirement
- [Source: docs/epics.md#Story 5.1] - Story acceptance criteria
- [Source: docs/architecture.md#FR Category Mapping] - Component locations
- [Source: docs/ux-design-specification.md#6.2 Custom Components] - Therapist Card design
- [Source: docs/architecture.md#Pre-mortem Risk Mitigations] - Match transparency requirement

### First Story Note

This is the first story being created for this project. No previous story context is available to learn from. This story establishes patterns for:
- GraphQL query integration
- Feature component structure
- Matching result display patterns
- Card-based UI components

Future stories should follow the patterns established here for consistency.

## Dev Agent Record

### Context Reference

- [Story Context XML](../5-1-therapist-matching-results-display.context.xml) - Generated 2025-11-29

### Agent Model Used

<!-- Will be populated by dev agent -->

### Debug Log References

<!-- Will be populated during development -->

### Completion Notes List

<!-- Will be populated during development -->

### File List

<!-- Will be populated during development -->
