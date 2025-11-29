# Epic Technical Specification: Foundation & Project Setup

Date: 2025-11-28
Author: BMad
Epic ID: 1
Status: Ready for Implementation

---

## Overview

Epic 1 establishes the technical foundation for the Daybreak Health Parent Onboarding AI frontend application. This epic focuses on project initialization, design system configuration, core layout components, and API integration infrastructure. Per the PRD, the system is a HIPAA-compliant, mobile-first web application that guides parents through mental health intake for their children using AI-assisted conversational assessment.

This foundation epic is prerequisite to all feature development (Epics 2-6). It delivers no direct user-facing functionality but provides the architectural scaffolding, theming, and API connectivity required for the 15 MVP functional requirements defined in the PRD.

## Objectives and Scope

**In Scope:**
- Next.js 15 project initialization with App Router, TypeScript, and Tailwind CSS 4
- shadcn/ui component library integration with Daybreak brand customization
- Apollo Client 4 configuration with HTTP and WebSocket links for GraphQL
- GraphQL Code Generator setup for type-safe hooks generation
- Daybreak design system implementation (colors, typography, spacing)
- Core layout components (Header, Footer, Progress Stepper, Error Boundary)
- Development tooling (Vitest, Playwright, ESLint, Prettier)
- Environment configuration and static export setup for S3/CloudFront deployment

**Out of Scope:**
- Feature implementation (deferred to Epics 2-6)
- Backend API development (separate repository)
- CI/CD pipeline configuration (deployment story)
- Production infrastructure provisioning

## System Architecture Alignment

This epic implements the "Project Initialization" section from the Architecture document, establishing:

**Framework Decisions:**
- Next.js 15 with App Router and React Server Components
- React 19 with latest features (`use` hook, Actions, ref as prop)
- TypeScript 5.x for end-to-end type safety
- Tailwind CSS 4.0 with CSS-first configuration

**Component Architecture:**
- shadcn/ui as base component library (accessible, customizable)
- Project structure per Architecture Section "Project Structure"
- Naming conventions per Architecture Section "Naming Patterns"

**API Infrastructure:**
- Apollo Client 4 with `@apollo/client-integration-nextjs`
- Split link architecture: HTTP for queries/mutations, WebSocket for subscriptions
- `graphql-ws` client for GraphQL subscriptions over Action Cable
- InMemoryCache with custom type policies for session management

**Referenced Architecture Sections:**
- Project Initialization (commands, starter decisions)
- Decision Summary (technology choices)
- Project Structure (directory layout)
- Implementation Patterns (naming, code organization)

## Detailed Design

### Services and Modules

| Module | Responsibility | Key Files | Owner |
|--------|---------------|-----------|-------|
| **Project Core** | Next.js configuration, static export, environment variables | `next.config.ts`, `.env.example`, `package.json` | Story 1.1 |
| **Design System** | Daybreak brand tokens, Tailwind configuration, CSS variables | `tailwind.config.ts`, `app/globals.css`, `components.json` | Story 1.2 |
| **UI Components** | shadcn/ui base components styled to Daybreak theme | `components/ui/*` | Story 1.2 |
| **Layout Components** | Header, Footer, Progress Stepper, Error Boundary | `components/layout/*` | Story 1.3 |
| **Apollo Client** | GraphQL client configuration, cache policies, link setup | `lib/apollo/client.ts`, `lib/apollo/provider.tsx`, `lib/apollo/links.ts` | Story 1.4 |
| **WebSocket** | GraphQL subscription transport, reconnection logic | `lib/apollo/links.ts`, `hooks/useWebSocketReconnect.ts` | Story 1.4 |
| **Code Generation** | TypeScript types and React hooks from GraphQL schema | `codegen.ts`, `types/graphql.ts` | Story 1.5 |
| **Providers** | Context providers wrapping the application | `providers/ThemeProvider.tsx`, root `layout.tsx` | Story 1.3 |

### Data Models and Contracts

**No persistent data models in Epic 1.** This epic establishes infrastructure only.

**Configuration Contracts:**

```typescript
// Environment Variables Contract
interface EnvironmentConfig {
  NEXT_PUBLIC_GRAPHQL_ENDPOINT: string;  // e.g., "http://localhost:3001/graphql"
  NEXT_PUBLIC_WS_ENDPOINT: string;       // e.g., "ws://localhost:3001/cable"
}

// Apollo Cache Type Policies (from Architecture)
const typePolicies = {
  OnboardingSession: {
    keyFields: ['id'],
    fields: {
      assessment: { merge: true },
    },
  },
  Message: { keyFields: ['id'] },
  TherapistMatch: { keyFields: ['therapistId'] },
};
```

**Design Token Contract (CSS Variables):**

```css
/* Daybreak Color Tokens */
--daybreak-teal: #2A9D8F;
--teal-light: #3DBCB0;
--warm-orange: #E9A23B;
--cream: #FEF7ED;
--deep-text: #1A3C34;

/* Semantic Colors */
--success: #10B981;
--warning: #F59E0B;
--error: #E85D5D;
--info: #3B82F6;

/* Typography */
--font-fraunces: 'Fraunces', serif;
--font-inter: 'Inter', sans-serif;

/* Spacing (4px base) */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
```

### APIs and Interfaces

**No API implementations in Epic 1.** This epic configures the API client infrastructure.

**Apollo Client Interface:**

```typescript
// lib/apollo/client.ts - Public Interface
export function makeClient(): ApolloClient<NormalizedCacheObject>;

// lib/apollo/provider.tsx - Provider Component
export function ApolloWrapper({ children }: { children: React.ReactNode }): JSX.Element;

// lib/apollo/links.ts - Link Factory
export function createHttpLink(uri: string): HttpLink;
export function createWsLink(uri: string): GraphQLWsLink;
export function createSplitLink(httpLink: HttpLink, wsLink: GraphQLWsLink): ApolloLink;
```

**Layout Component Interfaces:**

```typescript
// components/layout/Header.tsx
interface HeaderProps {
  showSaveExit?: boolean;
  onSaveExit?: () => void;
}

// components/layout/OnboardingProgress.tsx
interface OnboardingProgressProps {
  currentStep: 'assessment' | 'info' | 'insurance' | 'match' | 'book';
  completedSteps: string[];
}

// components/layout/Footer.tsx
interface FooterProps {
  variant?: 'default' | 'minimal';
}
```

### Workflows and Sequencing

**Story Execution Sequence:**

```
Story 1.1: Project Initialization
    ↓
    ├── create-next-app with TypeScript, Tailwind, ESLint
    ├── shadcn/ui init
    ├── Install core dependencies (Apollo, RHF, Zod, graphql-ws)
    ├── Install dev dependencies (codegen, vitest, playwright)
    ├── Configure next.config.ts for static export
    └── Create .env.example

Story 1.2: Design System (depends on 1.1)
    ↓
    ├── Configure next/font for Fraunces and Inter
    ├── Extend tailwind.config.ts with Daybreak tokens
    ├── Create CSS variables in globals.css
    ├── Configure shadcn/ui components.json
    └── Install base shadcn/ui components (Button, Input, Card, etc.)

Story 1.3: Layout Components (depends on 1.2)
    ↓
    ├── Create Header component with logo and Save & Exit
    ├── Create OnboardingProgress stepper
    ├── Create Footer with privacy/terms links
    ├── Create ErrorBoundary wrapper
    ├── Create onboarding layout at app/onboarding/[sessionId]/layout.tsx
    └── Set up root layout with providers

Story 1.4: Apollo Client (depends on 1.1)
    ↓
    ├── Create HTTP link with auth header
    ├── Create WebSocket link with graphql-ws
    ├── Configure split link for subscriptions
    ├── Set up InMemoryCache with type policies
    ├── Create ApolloProvider wrapper
    └── Create useWebSocketReconnect hook

Story 1.5: GraphQL Codegen (depends on 1.4)
    ↓
    ├── Create codegen.ts configuration
    ├── Create sample .graphql files
    ├── Generate types/graphql.ts
    ├── Verify hooks generation works
    └── Add codegen scripts to package.json
```

**Parallel Execution Opportunities:**
- Stories 1.2 and 1.4 can run in parallel after 1.1 completes
- Story 1.3 depends on 1.2 (needs design tokens)
- Story 1.5 depends on 1.4 (needs Apollo client)

## Non-Functional Requirements

### Performance

| Metric | Target | Source | Epic 1 Implementation |
|--------|--------|--------|----------------------|
| LCP (Largest Contentful Paint) | < 1.5s | Architecture Performance Budgets | Configure Turbopack, optimize font loading with `next/font` |
| FID (First Input Delay) | < 100ms | Architecture Performance Budgets | Minimal JS bundle, code splitting configured |
| CLS (Cumulative Layout Shift) | < 0.1 | Architecture Performance Budgets | Reserve space for layout components, font display swap |
| TTI (Time to Interactive) | < 3s | Architecture Performance Budgets | Static export, minimal hydration |
| Initial Bundle Size | < 150KB gzipped | Architecture Performance Budgets | Tree shaking, selective shadcn/ui imports |

**Epic 1 Specific:**
- Configure `next.config.ts` with `output: 'export'` for static generation
- Use `next/font` with `display: 'swap'` to prevent layout shift
- Enable Turbopack for fast development builds
- Configure bundle analyzer for size monitoring

### Security

| Requirement | Source | Epic 1 Implementation |
|-------------|--------|----------------------|
| No PHI in frontend logs | Architecture PHI Protection | Create `lib/utils/phi-guard.ts` utility stub |
| No PHI in URL parameters | Architecture PHI Protection | Route structure uses session IDs only |
| JWT in memory (not localStorage) | Architecture Authentication | Apollo auth link reads from memory/context |
| HTTPS only | PRD Security Requirements | Environment variables for API endpoints |
| Modern browsers only | PRD Browser Compatibility | Tailwind v4 requires Chrome 111+, Safari 16.4+, Firefox 128+ |

**Epic 1 Specific:**
- Create `.env.example` with secure defaults
- Configure Apollo auth link to read JWT from memory (not localStorage)
- No sensitive data in client-side logs
- Session ID pattern in routes (no PHI in URLs)

### Reliability/Availability

| Requirement | Source | Epic 1 Implementation |
|-------------|--------|----------------------|
| WebSocket reconnection | Architecture Pre-mortem | Exponential backoff in `graphql-ws` configuration |
| Graceful degradation | Architecture Pre-mortem | Error boundaries at route level |
| Offline handling | Architecture Pre-mortem | Apollo cache persists during network issues |

**Epic 1 Specific:**
- Configure WebSocket reconnection with exponential backoff (1s, 2s, 4s, max 30s)
- Create `ErrorBoundary` component for graceful error handling
- Apollo Client configured with optimistic caching

### Observability

| Requirement | Source | Epic 1 Implementation |
|-------------|--------|----------------------|
| Connection status | Architecture WebSocket | `useWebSocketReconnect` hook exposes connection state |
| Build metrics | Development | Bundle analyzer integration |
| Type safety | Architecture Code Gen | GraphQL Codegen validates operations at build time |

**Epic 1 Specific:**
- WebSocket connection status hook for debugging
- Bundle analyzer configured for production builds
- TypeScript strict mode enabled
- ESLint configured with recommended rules

## Dependencies and Integrations

### Production Dependencies

| Package | Version | Purpose | Source |
|---------|---------|---------|--------|
| `next` | ^15.x | App Router, RSC, static export | Architecture Decision |
| `react` | ^19.x | UI library | Architecture Decision |
| `react-dom` | ^19.x | React DOM bindings | Architecture Decision |
| `@apollo/client` | ^4.x | GraphQL client, caching | Architecture Decision |
| `@apollo/client-integration-nextjs` | latest | App Router integration | Architecture Decision |
| `graphql` | ^16.x | GraphQL runtime | Apollo dependency |
| `graphql-ws` | ^6.x | WebSocket subscriptions | Architecture Decision |
| `react-hook-form` | ^7.x | Form state management | Architecture Decision |
| `@hookform/resolvers` | ^3.x | Zod integration | Architecture Decision |
| `zod` | ^3.23 | Schema validation | Architecture ADR-004 (v3 for stability) |
| `class-variance-authority` | latest | Component variants | shadcn/ui dependency |
| `clsx` | latest | Classname utility | shadcn/ui dependency |
| `tailwind-merge` | latest | Tailwind class merging | shadcn/ui dependency |
| `lucide-react` | latest | Icon library | shadcn/ui dependency |

### Development Dependencies

| Package | Version | Purpose | Source |
|---------|---------|---------|--------|
| `typescript` | ^5.x | Type safety | Architecture Decision |
| `@types/react` | ^19.x | React types | TypeScript support |
| `@types/node` | ^20.x | Node types | TypeScript support |
| `tailwindcss` | ^4.x | Utility CSS | Architecture Decision |
| `@graphql-codegen/cli` | ^5.x | Codegen CLI | Architecture Decision |
| `@graphql-codegen/typescript` | latest | TS type generation | Architecture Decision |
| `@graphql-codegen/typescript-operations` | latest | Operation types | Architecture Decision |
| `@graphql-codegen/typescript-react-apollo` | latest | React hooks | Architecture Decision |
| `vitest` | ^3.x | Unit testing | Architecture Decision |
| `@testing-library/react` | ^16.x | Component testing | Architecture Decision |
| `playwright` | ^1.x | E2E testing | Architecture Decision |
| `eslint` | ^9.x | Linting | Architecture Decision |
| `prettier` | ^3.x | Formatting | Architecture Decision |
| `@next/bundle-analyzer` | latest | Bundle analysis | Performance monitoring |

### Integration Points

| Integration | Protocol | Endpoint Variable | Status |
|-------------|----------|-------------------|--------|
| Backend GraphQL API | HTTPS | `NEXT_PUBLIC_GRAPHQL_ENDPOINT` | Configuration only (no backend calls in Epic 1) |
| Backend WebSocket | WSS | `NEXT_PUBLIC_WS_ENDPOINT` | Configuration only (no subscriptions in Epic 1) |
| Google Fonts (Fraunces, Inter) | HTTPS | N/A | Loaded via `next/font` |

### External Services (Configured, Not Called)

| Service | Purpose | Epic 1 Scope |
|---------|---------|--------------|
| Ruby on Rails Backend | GraphQL API server | Apollo client configured to connect |
| Action Cable | WebSocket transport | graphql-ws configured to connect |

**Note:** Epic 1 establishes integration infrastructure but does not make actual API calls. Backend connectivity will be verified in Epic 2.

## Acceptance Criteria (Authoritative)

### Story 1.1: Project Initialization and Core Dependencies

| AC# | Acceptance Criteria | Testable Statement |
|-----|--------------------|--------------------|
| AC-1.1.1 | Project created with Next.js 15, TypeScript, Tailwind CSS 4, ESLint | `pnpm dev` starts without errors |
| AC-1.1.2 | shadcn/ui initialized with New York style | `components.json` exists with correct configuration |
| AC-1.1.3 | Apollo Client 4 with nextjs integration installed | Import `@apollo/client-integration-nextjs` succeeds |
| AC-1.1.4 | React Hook Form 7 with Zod 3 resolver installed | Import from packages succeeds |
| AC-1.1.5 | GraphQL Code Generator installed | `pnpm codegen` command exists |
| AC-1.1.6 | Vitest and Playwright configured | `pnpm test` and `pnpm test:e2e` run |
| AC-1.1.7 | Project runs on localhost:3000 | Dev server accessible |
| AC-1.1.8 | Static export configured | `next.config.ts` has `output: 'export'` |
| AC-1.1.9 | Environment template created | `.env.example` exists with required variables |

### Story 1.2: Daybreak Design System and Theme Configuration

| AC# | Acceptance Criteria | Testable Statement |
|-----|--------------------|--------------------|
| AC-1.2.1 | Fraunces font loaded via next/font | Font renders on page load |
| AC-1.2.2 | Inter font loaded via next/font | Font renders on page load |
| AC-1.2.3 | Daybreak color tokens in Tailwind config | `bg-daybreak-teal` class works |
| AC-1.2.4 | CSS custom properties in globals.css | `var(--daybreak-teal)` resolves |
| AC-1.2.5 | Spacing scale implemented (xs through 3xl) | Spacing classes apply correctly |
| AC-1.2.6 | Border radius tokens configured | `rounded-sm` through `rounded-full` work |
| AC-1.2.7 | Color contrast meets WCAG AA | Automated contrast check passes |

### Story 1.3: Core Layout Components

| AC# | Acceptance Criteria | Testable Statement |
|-----|--------------------|--------------------|
| AC-1.3.1 | Header component with Daybreak logo | Logo renders at 56px height on mobile |
| AC-1.3.2 | Header has "Save & Exit" ghost button | Button visible and clickable |
| AC-1.3.3 | OnboardingProgress shows 5 steps | All steps render with labels on desktop |
| AC-1.3.4 | OnboardingProgress highlights current step | Active step has teal styling |
| AC-1.3.5 | Footer with Privacy and Terms links | Links render and are accessible |
| AC-1.3.6 | Onboarding layout wraps routes | Layout renders at `/onboarding/[sessionId]` |
| AC-1.3.7 | ErrorBoundary catches errors gracefully | Error fallback UI displays on error |
| AC-1.3.8 | Layout responsive (max-width 640px for content) | Content centered on desktop |

### Story 1.4: Apollo Client Configuration with WebSocket Support

| AC# | Acceptance Criteria | Testable Statement |
|-----|--------------------|--------------------|
| AC-1.4.1 | HTTP link configured with endpoint | Link uses `NEXT_PUBLIC_GRAPHQL_ENDPOINT` |
| AC-1.4.2 | Auth header included in requests | Bearer token sent when available |
| AC-1.4.3 | WebSocket link configured with graphql-ws | Link uses `NEXT_PUBLIC_WS_ENDPOINT` |
| AC-1.4.4 | Split link routes subscriptions to WS | Subscriptions use WebSocket, queries use HTTP |
| AC-1.4.5 | InMemoryCache with type policies | OnboardingSession, Message policies configured |
| AC-1.4.6 | ApolloProvider wraps app | Provider available in component tree |
| AC-1.4.7 | Reconnection with exponential backoff | WebSocket reconnects after disconnect |
| AC-1.4.8 | useWebSocketReconnect hook created | Hook exposes connection status |

### Story 1.5: GraphQL Code Generation Setup

| AC# | Acceptance Criteria | Testable Statement |
|-----|--------------------|--------------------|
| AC-1.5.1 | codegen.ts configuration created | File exists with correct plugins |
| AC-1.5.2 | TypeScript types generated | `types/graphql.ts` created |
| AC-1.5.3 | React hooks generated for queries | `useGetOnboardingSessionQuery` available |
| AC-1.5.4 | React hooks generated for mutations | Mutation hooks available |
| AC-1.5.5 | React hooks generated for subscriptions | Subscription hooks available |
| AC-1.5.6 | `pnpm codegen` script works | Runs without errors |
| AC-1.5.7 | `pnpm codegen:watch` script works | Watch mode starts |
| AC-1.5.8 | Sample operations validate setup | Sample query generates correct types |

## Traceability Mapping

| AC | Spec Section | Component/File | Test Approach |
|----|--------------|----------------|---------------|
| AC-1.1.1 | Project Core | `package.json`, `next.config.ts` | Run `pnpm dev`, verify no errors |
| AC-1.1.2 | UI Components | `components.json` | Verify file contents |
| AC-1.1.3 | Apollo Client | `package.json` | Import test |
| AC-1.1.4 | Forms | `package.json` | Import test |
| AC-1.1.5 | Code Generation | `package.json`, `codegen.ts` | Run script |
| AC-1.1.6 | Testing | `vitest.config.ts`, `playwright.config.ts` | Run test commands |
| AC-1.1.7 | Project Core | Dev server | Manual verification |
| AC-1.1.8 | Project Core | `next.config.ts` | Config inspection |
| AC-1.1.9 | Project Core | `.env.example` | File exists |
| AC-1.2.1-2 | Design System | `app/layout.tsx` | Visual inspection |
| AC-1.2.3-6 | Design System | `tailwind.config.ts`, `globals.css` | Apply classes, verify styles |
| AC-1.2.7 | Design System | All color combinations | Lighthouse audit |
| AC-1.3.1-2 | Layout | `components/layout/Header.tsx` | Render test |
| AC-1.3.3-4 | Layout | `components/layout/OnboardingProgress.tsx` | Render test with props |
| AC-1.3.5 | Layout | `components/layout/Footer.tsx` | Render test |
| AC-1.3.6 | Layout | `app/onboarding/[sessionId]/layout.tsx` | Route test |
| AC-1.3.7 | Layout | `components/shared/ErrorBoundary.tsx` | Error throw test |
| AC-1.3.8 | Layout | All layout components | Responsive viewport test |
| AC-1.4.1-4 | Apollo Client | `lib/apollo/links.ts` | Unit test link creation |
| AC-1.4.5 | Apollo Client | `lib/apollo/client.ts` | Cache policy test |
| AC-1.4.6 | Apollo Client | `lib/apollo/provider.tsx` | Provider render test |
| AC-1.4.7-8 | Apollo Client | `hooks/useWebSocketReconnect.ts` | Hook test with mock WS |
| AC-1.5.1-7 | Code Generation | `codegen.ts`, `types/graphql.ts` | Run codegen, verify output |
| AC-1.5.8 | Code Generation | Sample `.graphql` files | Type inference test |

## Risks, Assumptions, Open Questions

### Risks

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R1 | **Tailwind CSS v4 browser compatibility** - Requires modern browsers (Chrome 111+, Safari 16.4+, Firefox 128+) | Low | High | Document browser requirements in README; configure polyfills if needed for edge cases |
| R2 | **React 19 stability** - Newest React version may have undiscovered issues | Medium | Medium | Pin exact version; have fallback to React 18 if critical issues arise |
| R3 | **shadcn/ui + Tailwind v4 integration** - CSS-first config is new paradigm | Low | Medium | Follow official shadcn/ui docs; test component rendering thoroughly |
| R4 | **Apollo Client Next.js App Router** - Integration package is relatively new | Low | Medium | Use official `@apollo/client-integration-nextjs`; test SSR/CSR boundaries |
| R5 | **GraphQL Codegen version compatibility** - Must work with Apollo Client 4 | Low | Low | Use documented plugin versions; verify hooks match Apollo 4 API |

### Assumptions

| ID | Assumption | Validation |
|----|------------|------------|
| A1 | Backend GraphQL schema will be available for codegen (or placeholder schema exists) | Confirm schema file location with backend team |
| A2 | Node.js 20+ is available in development environments | Document in README prerequisites |
| A3 | pnpm 9+ is the standard package manager for the project | Confirmed in Architecture document |
| A4 | Developers have access to Google Fonts (Fraunces, Inter) | Use `next/font` to self-host fonts |
| A5 | Static export is sufficient (no server-side rendering needed) | Confirmed in Architecture for S3/CloudFront deployment |

### Open Questions

| ID | Question | Owner | Status |
|----|----------|-------|--------|
| Q1 | Should we include a placeholder GraphQL schema in the repo for Epic 1 codegen? | Architect | **Decision needed** |
| Q2 | What is the exact Daybreak logo asset (SVG preferred)? | Design | **Asset needed** |
| Q3 | Should bundle analyzer be in devDependencies or configured for CI only? | DevOps | **Decision needed** |
| Q4 | Do we need to support IE11 or legacy Edge? | Product | **Resolved: No (per PRD)** |

## Test Strategy Summary

### Test Levels

| Level | Tool | Scope | Coverage Target |
|-------|------|-------|-----------------|
| **Unit Tests** | Vitest + React Testing Library | Components, hooks, utilities | 80% of new code |
| **Integration Tests** | Vitest | Apollo client setup, provider composition | Key integration points |
| **E2E Tests** | Playwright | Critical user flows | Smoke tests for layout |
| **Visual Regression** | Playwright screenshots | Design system compliance | Key components |
| **Accessibility** | axe-core, Lighthouse | WCAG AA compliance | All components |

### Epic 1 Test Coverage

| Story | Unit Tests | Integration Tests | E2E Tests |
|-------|------------|-------------------|-----------|
| 1.1 Project Init | N/A (config) | Verify scripts run | Dev server starts |
| 1.2 Design System | Token utility tests | Theme provider test | Visual snapshot |
| 1.3 Layout Components | Component render tests | Layout composition | Progress navigation |
| 1.4 Apollo Client | Link creation tests | Provider + cache test | N/A (no API calls) |
| 1.5 GraphQL Codegen | N/A (generated) | Type import test | N/A |

### Test Execution

```bash
# Unit tests
pnpm test                    # Run all unit tests
pnpm test:watch             # Watch mode
pnpm test:coverage          # Coverage report

# E2E tests
pnpm test:e2e               # Run Playwright tests
pnpm test:e2e --ui          # Interactive mode

# Type checking
pnpm typecheck              # TypeScript compiler check

# Linting
pnpm lint                   # ESLint
pnpm lint:fix               # Auto-fix issues
```

### Definition of Done for Epic 1

- [ ] All 5 stories completed with passing tests
- [ ] `pnpm dev` starts without errors
- [ ] `pnpm build` creates static export successfully
- [ ] `pnpm lint` passes with no errors
- [ ] `pnpm typecheck` passes with no errors
- [ ] `pnpm test` passes all unit tests
- [ ] Layout components render correctly on mobile (375px) and desktop (1280px)
- [ ] Design tokens match UX specification
- [ ] Apollo Client configured with documented type policies
- [ ] GraphQL Codegen generates types from schema
- [ ] README updated with setup instructions
