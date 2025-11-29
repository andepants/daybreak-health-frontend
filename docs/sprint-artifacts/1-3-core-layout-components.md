# Story 1.3: Core Layout Components

Status: drafted

## Story

As a **developer**,
I want **reusable layout components (Header, Footer, Progress Stepper, Error Boundary, and Onboarding Layout) with Daybreak branding and responsive design**,
so that **I can build consistent, accessible user interfaces across all onboarding routes**.

## Acceptance Criteria

1. **AC-1.3.1:** Header component with Daybreak logo - Logo renders at 56px height on mobile
2. **AC-1.3.2:** Header has "Save & Exit" ghost button - Button visible and clickable
3. **AC-1.3.3:** OnboardingProgress shows 5 steps - All steps render with labels on desktop
4. **AC-1.3.4:** OnboardingProgress highlights current step - Active step has teal styling
5. **AC-1.3.5:** Footer with Privacy and Terms links - Links render and are accessible
6. **AC-1.3.6:** Onboarding layout wraps routes - Layout renders at `/onboarding/[sessionId]`
7. **AC-1.3.7:** ErrorBoundary catches errors gracefully - Error fallback UI displays on error
8. **AC-1.3.8:** Layout responsive (max-width 640px for content) - Content centered on desktop

## Tasks / Subtasks

- [ ] Task 1: Create Header component with logo and Save & Exit button (AC: 1, 2)
  - [ ] 1.1 Create `components/layout/Header.tsx` with HeaderProps interface
  - [ ] 1.2 Add Daybreak logo placeholder at 56px height (responsive sizing)
  - [ ] 1.3 Implement "Save & Exit" ghost button using shadcn/ui Button component
  - [ ] 1.4 Add optional `onSaveExit` callback prop
  - [ ] 1.5 Style header with Daybreak teal accent and proper spacing
  - [ ] 1.6 Write unit test to verify logo renders at correct height
  - [ ] 1.7 Write unit test to verify Save & Exit button callback fires

- [ ] Task 2: Create OnboardingProgress stepper component (AC: 3, 4)
  - [ ] 2.1 Create `components/layout/OnboardingProgress.tsx` with OnboardingProgressProps interface
  - [ ] 2.2 Define 5 step labels: Assessment, Info, Insurance, Match, Book
  - [ ] 2.3 Implement step rendering with responsive design (labels on desktop, icons on mobile)
  - [ ] 2.4 Apply teal styling (`--daybreak-teal`) to active step
  - [ ] 2.5 Apply completion styling to completed steps
  - [ ] 2.6 Ensure progress bar is accessible (ARIA labels for step status)
  - [ ] 2.7 Write unit test to verify all 5 steps render
  - [ ] 2.8 Write unit test to verify active step receives teal styling

- [ ] Task 3: Create Footer component with Privacy and Terms links (AC: 5)
  - [ ] 3.1 Create `components/layout/Footer.tsx` with FooterProps interface
  - [ ] 3.2 Add Privacy Policy link (href to be defined, placeholder for now)
  - [ ] 3.3 Add Terms of Service link (href to be defined, placeholder for now)
  - [ ] 3.4 Support `variant` prop for 'default' and 'minimal' styles
  - [ ] 3.5 Style footer with Daybreak design tokens
  - [ ] 3.6 Ensure links are keyboard accessible (proper focus states)
  - [ ] 3.7 Write unit test to verify both links render
  - [ ] 3.8 Write unit test to verify links are accessible (ARIA roles)

- [ ] Task 4: Create ErrorBoundary wrapper component (AC: 7)
  - [ ] 4.1 Create `components/shared/ErrorBoundary.tsx` as React Error Boundary
  - [ ] 4.2 Implement fallback UI with friendly error message
  - [ ] 4.3 Add "Try Again" button to reset error boundary
  - [ ] 4.4 Log errors to console in development (stub for future error tracking)
  - [ ] 4.5 Style error UI with Daybreak error color (`--error`)
  - [ ] 4.6 Write unit test to verify error boundary catches errors
  - [ ] 4.7 Write unit test to verify fallback UI displays on error

- [ ] Task 5: Create Onboarding layout at app/onboarding/[sessionId]/layout.tsx (AC: 6, 8)
  - [ ] 5.1 Create `app/onboarding/[sessionId]/layout.tsx` as Next.js layout
  - [ ] 5.2 Compose layout with Header, OnboardingProgress, Footer components
  - [ ] 5.3 Wrap children with ErrorBoundary
  - [ ] 5.4 Apply max-width constraint (640px) to content area
  - [ ] 5.5 Center content on desktop viewports (>= 768px)
  - [ ] 5.6 Ensure layout renders at correct route path
  - [ ] 5.7 Write E2E test to verify layout renders at `/onboarding/[sessionId]`
  - [ ] 5.8 Write E2E test to verify content is centered on desktop

- [ ] Task 6: Set up root layout with providers (AC: 6)
  - [ ] 6.1 Update `app/layout.tsx` to include ThemeProvider (if needed)
  - [ ] 6.2 Ensure Fraunces and Inter fonts are loaded via next/font (from Story 1.2)
  - [ ] 6.3 Apply font classes to html/body elements
  - [ ] 6.4 Set up metadata (title, description) for SEO
  - [ ] 6.5 Verify root layout does not interfere with onboarding layout

- [ ] Task 7: Responsive testing and accessibility validation (AC: 8)
  - [ ] 7.1 Test Header component on mobile (375px) and desktop (1280px)
  - [ ] 7.2 Test OnboardingProgress stepper on mobile (icons only) and desktop (labels visible)
  - [ ] 7.3 Test Footer component on mobile and desktop
  - [ ] 7.4 Verify content max-width (640px) enforced on all screen sizes
  - [ ] 7.5 Run Lighthouse accessibility audit on layout components
  - [ ] 7.6 Ensure all interactive elements have proper focus states
  - [ ] 7.7 Verify color contrast meets WCAG AA standards

- [ ] Task 8: Create visual snapshot tests with Playwright (Optional)
  - [ ] 8.1 Create Playwright test for Header component rendering
  - [ ] 8.2 Create Playwright test for OnboardingProgress component rendering
  - [ ] 8.3 Create Playwright test for Footer component rendering
  - [ ] 8.4 Take screenshots for visual regression baseline

## Dev Notes

### Architecture Alignment

This story implements the "Layout Components" section from the Architecture document and Epic 1 Tech Spec:

**Component Structure:**
- Header: Fixed top bar with branding and exit action
- OnboardingProgress: 5-step stepper (Assessment → Info → Insurance → Match → Book)
- Footer: Minimal footer with legal links
- ErrorBoundary: React error boundary for graceful error handling
- Onboarding Layout: Composition of above components at `/onboarding/[sessionId]`

**Responsive Design:**
- Mobile-first approach (min-width: 375px)
- Content max-width: 640px (centered on desktop)
- OnboardingProgress: Icons on mobile, labels + icons on desktop (>= 768px)
- Header logo: 56px height on mobile, scales proportionally on larger screens

**Accessibility:**
- WCAG AA color contrast (per Story 1.2)
- Keyboard navigation for all interactive elements
- ARIA labels for progress steps
- Focus states using Daybreak teal (`--daybreak-teal`)

**Referenced Architecture Sections:**
- Project Structure → Layout Components (components/layout/*)
- Implementation Patterns → Component Composition
- Design System → Daybreak Branding (colors, typography, spacing)

### Component Interfaces

```typescript
// components/layout/Header.tsx
/**
 * Header component for onboarding flow
 * Displays Daybreak logo and optional Save & Exit action
 */
interface HeaderProps {
  /** Whether to show the Save & Exit button (default: true) */
  showSaveExit?: boolean;
  /** Callback fired when Save & Exit button is clicked */
  onSaveExit?: () => void;
}

// components/layout/OnboardingProgress.tsx
/**
 * Progress stepper component for onboarding flow
 * Shows 5 steps: Assessment → Info → Insurance → Match → Book
 */
interface OnboardingProgressProps {
  /** Current active step in the onboarding flow */
  currentStep: 'assessment' | 'info' | 'insurance' | 'match' | 'book';
  /** Array of completed step identifiers */
  completedSteps: string[];
}

// components/layout/Footer.tsx
/**
 * Footer component with legal links
 * Supports minimal and default variants
 */
interface FooterProps {
  /** Visual variant (default: 'default') */
  variant?: 'default' | 'minimal';
}

// components/shared/ErrorBoundary.tsx
/**
 * React Error Boundary for graceful error handling
 * Displays fallback UI when child components throw errors
 */
interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: React.ReactNode;
  /** Optional custom fallback component */
  fallback?: React.ReactNode;
}
```

### File Structure

```
components/
├── layout/
│   ├── Header.tsx              # Header with logo and Save & Exit
│   ├── OnboardingProgress.tsx  # 5-step progress stepper
│   └── Footer.tsx              # Footer with Privacy/Terms links
└── shared/
    └── ErrorBoundary.tsx       # Error boundary wrapper

app/
├── layout.tsx                  # Root layout with fonts and providers
└── onboarding/
    └── [sessionId]/
        └── layout.tsx          # Onboarding layout composition
```

### Design Tokens Used

From Story 1.2 (Design System):

```css
/* Colors */
--daybreak-teal: #2A9D8F;      /* Active step, focus states */
--teal-light: #3DBCB0;         /* Hover states */
--warm-orange: #E9A23B;        /* Accent (if needed) */
--cream: #FEF7ED;              /* Background */
--deep-text: #1A3C34;          /* Primary text */
--error: #E85D5D;              /* Error boundary UI */

/* Typography */
--font-fraunces: 'Fraunces', serif;  /* Headings */
--font-inter: 'Inter', sans-serif;   /* Body text */

/* Spacing (4px base) */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
```

### Dependencies

**Prerequisite Stories:**
- Story 1.2: Daybreak Design System (needs design tokens and fonts)

**Consumed from Story 1.2:**
- Tailwind config with Daybreak color tokens
- CSS custom properties in `globals.css`
- Fraunces and Inter fonts loaded via `next/font`
- shadcn/ui Button component

**Used By Future Stories:**
- Story 2.1: Onboarding Entry (uses Header, Footer, ErrorBoundary)
- Story 3.x: Assessment Flow (uses OnboardingProgress)
- Story 4.x: Form pages (uses layout composition pattern)

### Testing Strategy

**Unit Tests (Vitest + React Testing Library):**
- Header: Logo renders, Save & Exit callback fires
- OnboardingProgress: All 5 steps render, active step styled correctly
- Footer: Links render, accessibility attributes present
- ErrorBoundary: Catches errors, displays fallback UI

**E2E Tests (Playwright):**
- Layout renders at `/onboarding/[sessionId]` route
- Content max-width enforced (640px)
- Responsive behavior (mobile vs desktop)
- Keyboard navigation works

**Accessibility Tests:**
- Lighthouse audit (WCAG AA compliance)
- Color contrast validation
- ARIA labels for progress steps
- Focus states on interactive elements

### References

- [Source: docs/architecture.md#Layout-Components]
- [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Story-1.3]
- [Source: docs/epics.md#Story-1.3]
- [Source: docs/ux-design-specification.md#Onboarding-Layout]
- [Source: docs/prd.md#User-Interface-Requirements]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-11-29 | Story drafted from tech spec and epics | SM Agent (Bob) |
