# Story 5.2: Therapist Profile Detail View

Status: ready-for-dev

## Story

As a **parent**,
I want **to learn more about a therapist before booking**,
So that **I feel confident they're the right fit for my child**.

## Acceptance Criteria

**Given** I click "View Profile" on a therapist card
**When** the profile sheet opens
**Then** I see:

**Profile Sheet (shadcn/ui `Sheet`, slides from right on desktop, bottom on mobile):**
- Larger photo (120x120)
- Full name and all credentials
- Bio/personal statement (2-3 paragraphs)
- Specialties with descriptions
- Approach to therapy (e.g., "CBT-focused, warm and collaborative")
- Languages spoken
- Education and certifications

**Match Section:**
- "Why [therapist] for [child name]"
- 3 specific match reasons with icons
- Connection to assessment responses

**Availability Section:**
- Next 3 available slots shown
- "View full calendar" button

**Actions:**
- "Book with [therapist]" button (full width at bottom)
- Close button (X in corner)

**And** sheet can be dismissed by swipe down on mobile
**And** booking button is sticky at bottom

## Tasks / Subtasks

- [ ] Task 1: Create Profile Sheet Component (AC: Profile Sheet, Actions)
  - [ ] Subtask 1.1: Set up shadcn/ui Sheet component with responsive side positioning (right on desktop, bottom on mobile)
  - [ ] Subtask 1.2: Implement therapist photo display (120x120, rounded)
  - [ ] Subtask 1.3: Implement name, credentials, and bio display sections
  - [ ] Subtask 1.4: Add specialties display with descriptions
  - [ ] Subtask 1.5: Add approach to therapy section
  - [ ] Subtask 1.6: Add languages spoken display
  - [ ] Subtask 1.7: Add education and certifications section
  - [ ] Subtask 1.8: Add close button (X in corner) with proper z-index
  - [ ] Subtask 1.9: Make sheet full-screen on mobile breakpoint

- [ ] Task 2: Implement Match Reasoning Section (AC: Match Section)
  - [ ] Subtask 2.1: Create match rationale display with personalized heading using child name
  - [ ] Subtask 2.2: Display 3 specific match reasons with icons
  - [ ] Subtask 2.3: Connect match reasons to assessment data from session
  - [ ] Subtask 2.4: Style match section to stand out visually (e.g., light teal background)

- [ ] Task 3: Implement Availability Preview (AC: Availability Section)
  - [ ] Subtask 3.1: Fetch and display next 3 available appointment slots
  - [ ] Subtask 3.2: Format slots with date/time in user's timezone
  - [ ] Subtask 3.3: Add "View full calendar" button that navigates to scheduling page

- [ ] Task 4: Implement Booking CTA and Mobile Interactions (AC: Actions, Mobile UX)
  - [ ] Subtask 4.1: Add "Book with [therapist]" button (full width, sticky at bottom)
  - [ ] Subtask 4.2: Implement swipe-down to dismiss on mobile
  - [ ] Subtask 4.3: Wire booking button to navigate to scheduling page with therapist pre-selected
  - [ ] Subtask 4.4: Ensure proper touch targets (44x44px minimum)

- [ ] Task 5: GraphQL Integration (AC: Profile Data)
  - [ ] Subtask 5.1: Create or extend getTherapist query for full profile data
  - [ ] Subtask 5.2: Implement useQuery hook to fetch therapist profile
  - [ ] Subtask 5.3: Add loading skeleton state for profile sheet
  - [ ] Subtask 5.4: Handle error states gracefully with retry option
  - [ ] Subtask 5.5: Run GraphQL codegen to generate TypeScript types

- [ ] Task 6: Accessibility and Testing (AC: All)
  - [ ] Subtask 6.1: Add proper ARIA labels and roles to sheet components
  - [ ] Subtask 6.2: Test keyboard navigation (Tab, Escape to close)
  - [ ] Subtask 6.3: Test screen reader announcements with VoiceOver
  - [ ] Subtask 6.4: Test responsive behavior on mobile, tablet, and desktop
  - [ ] Subtask 6.5: Write unit tests for TherapistProfileSheet component
  - [ ] Subtask 6.6: Test swipe gestures on mobile devices

## Dev Notes

### Architecture Patterns and Constraints

**Component Location:**
- Create `features/matching/TherapistProfileSheet.tsx` per Architecture project structure
- This is a feature-specific component, not shared UI

**Styling Requirements (from UX Design Specification):**
- Background: Cream (#FEF7ED) for sheet background
- Primary color: Daybreak Teal (#2A9D8F) for booking button
- Text: Deep Text (#1A3C34) for main content
- Use Fraunces font for therapist name (headline)
- Use Inter font for body text (16px)
- Border radius: xl (24px) for photo, md (12px) for buttons
- Spacing: Follow 8px grid system (lg=24px, xl=32px)

**shadcn/ui Sheet Configuration:**
- Install Sheet component: `pnpm dlx shadcn@latest add sheet`
- Use `side="right"` for desktop, `side="bottom"` for mobile
- Implement responsive switch using Tailwind breakpoints
- Example: `<Sheet><SheetContent side="right" className="sm:max-w-md">`

**GraphQL Query Pattern:**
```graphql
query GetTherapist($id: ID!) {
  getTherapist(id: $id) {
    id
    firstName
    lastName
    credentials
    photo
    bio
    specialties {
      name
      description
    }
    approach
    languages
    education {
      degree
      institution
      year
    }
    certifications
    matchReasons(sessionId: $sessionId) {
      reason
      icon
      assessmentConnection
    }
    availableSlots(limit: 3) {
      dateTime
      timezone
    }
  }
}
```

**State Management:**
- Sheet open/close state managed by parent TherapistCard component
- Pass therapist ID as prop, fetch full profile on open
- Consider lazy loading profile data (fetch on sheet open, not on card render)

**Mobile Interactions:**
- Use Sheet's built-in swipe-to-dismiss for mobile
- Ensure touch targets meet WCAG 2.1 AA (minimum 44x44px)
- Test gesture conflicts with scroll

**Performance Considerations:**
- Optimize therapist photo with next/image
- Lazy load sheet content (dynamic import) if bundle size grows
- Cache therapist profiles in Apollo Client cache

### Project Structure Notes

**File Structure:**
```
features/matching/
├── TherapistCard.tsx (existing, Story 5.1)
├── TherapistProfileSheet.tsx (NEW - this story)
├── MatchRationale.tsx (component for match reasons display)
├── useMatching.ts (existing hook, may need extension)
└── matching.graphql (add getTherapist query)
```

**Alignment with Architecture:**
- Follows "features/[feature]/" pattern for co-located components
- GraphQL operations co-located with feature consumers
- Custom hooks for data fetching logic

### Testing Standards Summary

**Unit Tests (Vitest + React Testing Library):**
- Test sheet opens/closes correctly
- Test responsive side switching (right vs bottom)
- Test booking button click handler
- Test data display with mocked GraphQL response
- Test loading and error states

**E2E Tests (Playwright - if time permits):**
- Navigate from therapist card → profile sheet → booking
- Test swipe gesture on mobile viewport
- Test keyboard navigation and Escape key to close

**Accessibility Tests:**
- Verify ARIA labels with axe-core
- Test focus trap within sheet
- Verify screen reader can navigate all sections

### References

- [Source: docs/epics.md#Story-5.2-Therapist-Profile-Detail-View]
- [Source: docs/architecture.md#Project-Structure]
- [Source: docs/architecture.md#Implementation-Patterns]
- [Source: docs/ux-design-specification.md#Section-3-Design-Tokens]
- [Source: docs/prd.md#6.4-Scheduling (FR-011, FR-012)]

### Prerequisites

- Story 5.1 (Therapist Matching Results Display) must be complete to provide the context (therapist cards with "View Profile" links)
- Epic 1 (Foundation) complete for shadcn/ui setup
- Apollo Client configured (Story 1.4) for GraphQL queries

### Learnings from Previous Story

No previous story in Epic 5 has been completed yet. This is one of the first stories in the Therapist Matching & Booking epic.

**Note:** Story 5.1 (Therapist Matching Results Display) should ideally be completed first, as it provides the TherapistCard component that triggers this profile sheet. However, both can be developed in parallel if needed, with a shared interface contract for the therapist data structure.

## Dev Agent Record

### Context Reference

- [Story Context XML](../5-2-therapist-profile-detail-view.context.xml)

### Agent Model Used

<!-- Model name and version will be filled in during development -->

### Debug Log References

<!-- Will be populated during development -->

### Completion Notes List

<!-- Will be populated during development -->

### File List

<!-- Will be populated during development -->
