# daybreak-health-frontend - Epic Breakdown

**Author:** BMad
**Date:** 2025-11-28
**Project Level:** MVP-focused with Growth considerations
**Target Scale:** 1,000+ concurrent users

---

## Overview

This document provides the complete epic and story breakdown for daybreak-health-frontend, decomposing the requirements from the [PRD](./prd.md) into implementable stories.

**Living Document Notice:** This is the initial version incorporating PRD, UX Design, and Architecture context.

### Epic Overview

| # | Epic | Stories | User Value |
|:--|:-----|:--------|:-----------|
| 1 | Foundation & Project Setup | 5 | Technical foundation for all features |
| 2 | AI-Guided Assessment Experience | 6 | Parents describe child's needs via supportive AI |
| 3 | Parent & Child Information Collection | 4 | Family info with validation and auto-save |
| 4 | Insurance Submission | 3 | Friction-reduced insurance entry |
| 5 | Therapist Matching & Booking | 5 | End-to-end scheduling with confirmation |
| 6 | Human Support Integration | 3 | Real-time staff escalation |

**Total:** 6 Epics, 26 Stories covering 15 MVP functional requirements

---

## Functional Requirements Inventory

### Assessment & Screening
| ID | Requirement | Priority |
|:---|:------------|:---------|
| FR-001 | The system shall provide a conversational AI interface that guides parents through a mental health screening questionnaire for their child. | [MVP] |
| FR-002 | The assessment shall adapt questions based on previous responses to gather relevant clinical information. | [MVP] |
| FR-003 | The system shall generate a summary of assessment findings to inform therapist matching. | [MVP] |

### Onboarding & Data Collection
| ID | Requirement | Priority |
|:---|:------------|:---------|
| FR-004 | The system shall collect parent demographic information (name, contact, relationship to child). | [MVP] |
| FR-005 | The system shall collect child demographic information (name, date of birth, pronouns). | [MVP] |
| FR-006 | The system shall collect clinical intake information (primary concerns, relevant history). | [MVP] |
| FR-007 | The system shall persist onboarding progress, allowing parents to resume an incomplete session. | [MVP] |

### Insurance Management
| ID | Requirement | Priority |
|:---|:------------|:---------|
| FR-008 | The system shall allow parents to manually enter insurance information (carrier, member ID, group number). | [MVP] |
| FR-009 | The system shall allow parents to upload an image of their insurance card for automated data extraction. | [Growth] |
| FR-010 | The system shall provide an upfront cost estimate based on submitted insurance information. | [Growth] |

### Scheduling
| ID | Requirement | Priority |
|:---|:------------|:---------|
| FR-011 | The system shall suggest therapists based on assessment results, child's needs, and availability. | [MVP] |
| FR-012 | The system shall display available appointment slots for selected therapists. | [MVP] |
| FR-013 | The system shall allow parents to book an appointment and receive confirmation. | [MVP] |

### Support & Communication
| ID | Requirement | Priority |
|:---|:------------|:---------|
| FR-014 | The system shall provide real-time chat support connecting parents with Daybreak staff during onboarding. | [MVP]* |
| FR-015 | The system shall deliver confirmation and reminder notifications via email. | [MVP] |

*Note: Per Architecture ADR-005, FR-014 moved to MVP for emotional safety ("parents feel trapped" pre-mortem risk)

### Educational Resources (Vision - Deferred)
| ID | Requirement | Priority |
|:---|:------------|:---------|
| FR-016 | The system shall provide a library of educational content about child mental health. | [Vision] |
| FR-017 | The system shall provide a searchable knowledge base for common questions and symptoms. | [Vision] |

**Summary:** 15 MVP FRs, 2 Growth FRs (FR-009, FR-010), 2 Vision FRs (FR-016, FR-017 - deferred)

---

## FR Coverage Map

| Epic | FRs Covered | User Value Delivered |
|:-----|:------------|:---------------------|
| Epic 1: Foundation | Infrastructure for all FRs | Project ready for feature development |
| Epic 2: AI Assessment | FR-001, FR-002, FR-003, FR-007 | Parents can describe child's needs via supportive AI chat |
| Epic 3: Information Collection | FR-004, FR-005, FR-006, FR-007 | Parents can provide family information with auto-save |
| Epic 4: Insurance Submission | FR-008, FR-007 | Parents can submit insurance and continue onboarding |
| Epic 5: Therapist Matching & Booking | FR-011, FR-012, FR-013, FR-015 | Parents can find a matched therapist and book appointment |
| Epic 6: Human Support | FR-014 | Parents can escalate to human support at any time |

**Coverage Validation:** All 15 MVP FRs are mapped. FR-009, FR-010 (Growth) and FR-016, FR-017 (Vision) are deferred.

---

## Epics Summary

| # | Epic | Stories | Primary Value |
|:--|:-----|:--------|:--------------|
| 1 | Foundation & Project Setup | 5 | Technical foundation enabling all features |
| 2 | AI-Guided Assessment Experience | 6 | Core value prop - conversational screening |
| 3 | Parent & Child Information Collection | 4 | Demographics with validation and auto-save |
| 4 | Insurance Submission | 3 | Friction-reduced insurance entry |
| 5 | Therapist Matching & Booking | 5 | End-to-end booking with confirmation |
| 6 | Human Support Integration | 3 | Real-time staff escalation for emotional safety |

**Total: 6 Epics, 26 Stories**

---

## Epic 1: Foundation & Project Setup

**Goal:** Establish the technical foundation for the Parent Onboarding AI frontend, including project initialization, design system, Apollo Client configuration, and core layout components.

**User Value:** Development team can build features on a consistent, well-configured codebase with proper tooling, theming, and API integration ready.

**FRs Covered:** Infrastructure for all FRs

---

### Story 1.1: Project Initialization and Core Dependencies

As a **developer**,
I want **a properly configured Next.js 15 project with all core dependencies installed**,
So that **I can begin building features with the correct tooling and type safety**.

**Acceptance Criteria:**

**Given** a fresh development environment with Node.js 20+ and pnpm 9+
**When** running the project setup commands from Architecture docs
**Then** the following are configured:
- Next.js 15 with App Router, TypeScript, Tailwind CSS 4, ESLint
- shadcn/ui initialized with New York style
- Apollo Client 4 with `@apollo/client-integration-nextjs`
- React Hook Form 7 with Zod 3 resolver
- GraphQL Code Generator configured for typescript-react-apollo
- Vitest and Playwright configured for testing
- Project runs on `localhost:3000` without errors

**And** the following scripts work correctly:
- `pnpm dev` starts Turbopack dev server
- `pnpm build` creates static export
- `pnpm codegen` generates GraphQL types
- `pnpm test` runs Vitest
- `pnpm lint` runs ESLint without errors

**Prerequisites:** None (first story)

**Technical Notes:**
- Follow exact commands from Architecture Section "Project Initialization"
- Use pnpm as package manager per Architecture decision
- Create `.env.example` with `NEXT_PUBLIC_GRAPHQL_ENDPOINT` and `NEXT_PUBLIC_WS_ENDPOINT`
- Configure `next.config.ts` for static export (`output: 'export'`)
- Set up import alias `@/*` for clean imports

---

### Story 1.2: Daybreak Design System and Theme Configuration

As a **developer**,
I want **the Daybreak brand colors, typography, and spacing configured in Tailwind**,
So that **all components automatically use consistent brand styling**.

**Acceptance Criteria:**

**Given** the initialized project from Story 1.1
**When** configuring the Tailwind theme
**Then** the following design tokens are available:

**Colors (from UX Spec Section 3.1):**
- Primary: `daybreak-teal` (#2A9D8F), `teal-light` (#3DBCB0)
- Secondary: `warm-orange` (#E9A23B)
- Background: `cream` (#FEF7ED)
- Text: `deep-text` (#1A3C34)
- Semantic: success (#10B981), warning (#F59E0B), error (#E85D5D), info (#3B82F6)
- Chat: AI bubble (#F0FDFA), User bubble (#2A9D8F)

**Typography (from UX Spec Section 3.2):**
- Headline font: Fraunces (variable serif) via `next/font`
- Body font: Inter (sans-serif) via `next/font`
- Font scale: 12px to 40px as specified

**Spacing:** 4px base unit with xs(4), sm(8), md(16), lg(24), xl(32), 2xl(48), 3xl(64)

**Border Radius:** sm(8px), md(12px), lg(16px), xl(24px), full(9999px)

**And** `globals.css` includes CSS custom properties for all tokens
**And** components can use classes like `bg-daybreak-teal`, `text-deep-text`, `font-fraunces`

**Prerequisites:** Story 1.1

**Technical Notes:**
- Use `next/font/google` with `display: 'swap'` for Fraunces and Inter
- Configure CSS variables in `globals.css` for shadcn/ui compatibility
- Extend Tailwind config with Daybreak color palette
- Test color contrast meets WCAG AA (4.5:1 for body text)

---

### Story 1.3: Core Layout Components

As a **parent user**,
I want **consistent page layout with header, progress indicator, and footer**,
So that **I always know where I am in the onboarding process and can access help**.

**Acceptance Criteria:**

**Given** any onboarding page
**When** the page renders
**Then** the following layout components are present:

**Header (`components/layout/Header.tsx`):**
- Daybreak logo (left-aligned)
- Minimal height on mobile (56px)
- Cream background with subtle shadow
- "Save & Exit" link visible (ghost button style)

**OnboardingProgress (`components/layout/OnboardingProgress.tsx`):**
- Step indicators showing: Assessment → Info → Insurance → Match → Book
- Current step highlighted in teal
- Completed steps show checkmark
- Mobile: dots only; Desktop: dots + labels
- Smooth transitions between steps

**Footer (`components/layout/Footer.tsx`):**
- Privacy Policy and Terms of Service links
- Muted text color (#6B7280)
- Sticky to bottom on short pages

**And** the onboarding layout (`app/onboarding/[sessionId]/layout.tsx`) wraps all onboarding routes
**And** layout is responsive: single column, centered content (max-width 640px for chat)

**Prerequisites:** Story 1.2

**Technical Notes:**
- Use shadcn/ui `Progress` component as base for step indicator
- Header uses `sticky top-0 z-50` for scroll behavior
- Progress component receives `currentStep` prop from route
- Add `ErrorBoundary` wrapper in onboarding layout
- Implement per Architecture project structure

---

### Story 1.4: Apollo Client Configuration with WebSocket Support

As a **developer**,
I want **Apollo Client configured for both HTTP queries/mutations and WebSocket subscriptions**,
So that **I can communicate with the Rails GraphQL API and receive real-time updates**.

**Acceptance Criteria:**

**Given** environment variables for API endpoints
**When** Apollo Client initializes
**Then** the following are configured:

**HTTP Link:**
- Endpoint: `NEXT_PUBLIC_GRAPHQL_ENDPOINT`
- Authorization header with Bearer token (from memory/context)
- Error handling for network failures

**WebSocket Link (`graphql-ws`):**
- Endpoint: `NEXT_PUBLIC_WS_ENDPOINT`
- Connection params include auth token
- Reconnection with exponential backoff (1s, 2s, 4s, max 30s)
- Split link: subscriptions via WS, queries/mutations via HTTP

**Cache Configuration:**
- `InMemoryCache` with type policies per Architecture
- `OnboardingSession` merges assessment updates
- `Message` and `TherapistMatch` have proper key fields

**Provider Setup:**
- `ApolloProvider` wraps app in root layout
- Uses `@apollo/client-integration-nextjs` for App Router

**And** a test query to the backend succeeds (or gracefully fails if backend not running)
**And** WebSocket reconnects automatically after disconnect

**Prerequisites:** Story 1.1

**Technical Notes:**
- Create `lib/apollo/client.ts`, `lib/apollo/provider.tsx`, `lib/apollo/links.ts`
- Use `split` from `@apollo/client` to route subscriptions to WS
- Implement `useWebSocketReconnect` hook for monitoring connection status
- Store JWT in memory (not localStorage) per security requirements
- Add connection status indicator for debugging

---

### Story 1.5: GraphQL Code Generation Setup

As a **developer**,
I want **TypeScript types and React hooks auto-generated from GraphQL operations**,
So that **I have type-safe API calls without manual type definitions**.

**Acceptance Criteria:**

**Given** `.graphql` files in the `features/` or `graphql/` directories
**When** running `pnpm codegen`
**Then** the following are generated in `types/graphql.ts`:
- TypeScript types for all GraphQL types
- Typed React hooks for queries (`useGetSessionQuery`)
- Typed React hooks for mutations (`useSubmitMessageMutation`)
- Typed React hooks for subscriptions (`useSupportChatSubscription`)

**Given** a sample `GetOnboardingSession.graphql` query file
**When** code generation runs
**Then** I can use `useGetOnboardingSessionQuery({ variables: { id } })` with full type inference

**And** `codegen.ts` configuration follows Architecture specification
**And** `pnpm codegen:watch` works for development
**And** generated types are gitignored but required for build

**Prerequisites:** Story 1.4

**Technical Notes:**
- Create `codegen.ts` with `typescript`, `typescript-operations`, `typescript-react-apollo` plugins
- Point schema to backend URL or local `api_schema.graphql` file
- Configure documents glob: `features/**/*.graphql`, `graphql/**/*.graphql`
- Add `near-operation-file-preset` for co-located types (optional)
- Create sample operations for Session, Message types to validate setup

---

## Epic 2: AI-Guided Assessment Experience

**Goal:** Deliver the core value proposition - a conversational AI interface that guides parents through a supportive mental health screening for their child.

**User Value:** Parents can describe their child's struggles in their own words through a warm, adaptive conversation that feels like texting a supportive friend.

**FRs Covered:** FR-001, FR-002, FR-003, FR-007 (session persistence)

---

### Story 2.1: Chat Window and Message Display

As a **parent**,
I want **to see my conversation with the AI in a familiar chat interface**,
So that **the experience feels natural and supportive, not like filling out forms**.

**Acceptance Criteria:**

**Given** I navigate to `/onboarding/[sessionId]/assessment`
**When** the chat window loads
**Then** I see:

**Chat Container (`features/assessment/ChatWindow.tsx`):**
- Full viewport height minus header (mobile)
- Centered max-width 640px (desktop)
- Cream background (#FEF7ED)
- Messages scroll from bottom up (newest visible)
- Auto-scroll to newest message on update

**AI Messages (`features/assessment/ChatBubble.tsx` variant="ai"):**
- Light teal background (#F0FDFA)
- Left-aligned with 75% max-width
- Daybreak mountain icon avatar (40x40px)
- Rounded corners (xl: 24px)
- Body text in Inter 16px, deep text color

**User Messages (variant="user"):**
- Teal background (#2A9D8F) with white text
- Right-aligned with 75% max-width
- No avatar (user initials optional)
- Same rounded corners

**And** timestamps show relative time ("Just now", "2 min ago")
**And** messages have smooth fade-in animation on appear
**And** scrolling is smooth with momentum on mobile

**Prerequisites:** Epic 1 complete

**Technical Notes:**
- Use `useRef` for scroll container, scroll on message array change
- Messages from Apollo cache subscription or query
- Implement virtualization if conversation exceeds 50 messages (react-window)
- Add `role="log"` and `aria-live="polite"` for screen readers
- Test with VoiceOver - each message should announce

---

### Story 2.2: Message Input and Quick Reply Chips

As a **parent**,
I want **to respond to the AI via text input or quick reply buttons**,
So that **I can share as much or as little as I want with minimal effort**.

**Acceptance Criteria:**

**Given** the AI has sent a message
**When** I look at the bottom of the chat
**Then** I see:

**Quick Reply Chips (`features/assessment/QuickReplyChips.tsx`):**
- Horizontal scrollable row of 2-4 options
- Pill-shaped buttons with teal outline
- On tap: fill with teal, send immediately
- Examples: "Yes", "No", "Tell me more", "I'm not sure"
- Chips appear based on AI response context

**Text Input Area:**
- Floating input bar (fixed to bottom on mobile)
- Textarea that expands to 3 lines max
- Send button (teal, enabled when text present)
- 2000 character limit with counter at 1800+
- Placeholder: "Type your message..."

**And** pressing Enter sends (Shift+Enter for newline)
**And** input is disabled while AI is responding (with visual indicator)
**And** quick replies disappear after selection or typing starts
**And** touch targets are minimum 44x44px (WCAG)

**Prerequisites:** Story 2.1

**Technical Notes:**
- Quick replies come from API response `suggestedReplies` field
- Use `useMutation` with optimistic UI for send
- Debounce typing indicator updates (500ms)
- Store draft message in session storage for persistence
- Focus trap within chat for keyboard navigation

---

### Story 2.3: AI Typing Indicator

As a **parent**,
I want **to see when the AI is "thinking" about my response**,
So that **I know help is coming and the system hasn't frozen**.

**Acceptance Criteria:**

**Given** I have sent a message
**When** waiting for AI response (1-3 seconds typically)
**Then** I see a typing indicator:

**Typing Indicator (`features/assessment/TypingIndicator.tsx`):**
- Appears as AI chat bubble in message flow
- Three animated dots bouncing sequentially
- Light teal background matching AI bubbles
- Avatar present (Daybreak icon)
- Smooth fade-in on appear

**And** the indicator appears within 200ms of sending my message
**And** the indicator is replaced by actual AI response when ready
**And** if response takes >5 seconds, show "Still thinking..." text
**And** if response takes >15 seconds, show "Taking longer than usual..." with retry option

**Prerequisites:** Story 2.1

**Technical Notes:**
- Use CSS keyframe animation for dot bounce
- Manage typing state via local state, set true on mutation call, false on response
- Add timeout handling for slow responses
- Consider skeleton state vs animated dots (test both)
- Ensure indicator has `aria-label="AI is typing"`

---

### Story 2.4: Assessment Flow with Adaptive Questions

As a **parent**,
I want **the AI to ask follow-up questions based on my answers**,
So that **it truly understands my child's situation instead of following a rigid script**.

**Acceptance Criteria:**

**Given** I start a new assessment session
**When** the AI greets me
**Then** it asks an open-ended question like "Tell me what's been going on with [child name if known]"

**Given** I describe symptoms (e.g., "won't get out of bed")
**When** the AI responds
**Then** it asks relevant follow-ups about:
- Duration ("How long has this been happening?")
- Severity ("Is this every day or some days?")
- Impact ("How is this affecting school/friends?")

**Given** the AI needs structured information (sleep, appetite, mood)
**When** presenting these questions
**Then** single-card format appears (Typeform style):
- One question per screen
- Quick reply options + "Other" text option
- Progress within this section shown
- Back button to revise previous answer

**And** the AI validates completeness before generating summary
**And** assessment adapts based on urgency signals (crisis keywords trigger different path)
**And** total assessment takes ~5 minutes for typical case

**Prerequisites:** Stories 2.1, 2.2, 2.3

**Technical Notes:**
- Backend AI (GPT-4) handles adaptation logic
- Frontend sends messages, receives `nextQuestion` and `suggestedReplies`
- Structured questions use different UI component (`AssessmentCard`)
- Implement keyword detection for crisis mode (backend responsibility, frontend shows support option)
- Track assessment progress in session state

---

### Story 2.5: Assessment Summary Generation

As a **parent**,
I want **to see a summary of what the AI understood about my child**,
So that **I can confirm it's accurate before moving forward**.

**Acceptance Criteria:**

**Given** the assessment conversation is complete
**When** the AI generates a summary
**Then** I see:

**Summary Card:**
- Heading: "Here's what I'm hearing..."
- Bullet points of key concerns identified
- Child's name used naturally
- Warm, empathetic tone (not clinical)
- "Does this sound right?" confirmation prompt

**Actions:**
- "Yes, continue" button (primary teal)
- "I'd like to add something" button (secondary outline)
- "Start over" link (ghost, with confirmation)

**And** confirming summary saves to session and transitions to demographics
**And** "add something" returns to chat with "What else would you like to share?"
**And** summary is stored for therapist matching (FR-003)

**Prerequisites:** Story 2.4

**Technical Notes:**
- Summary comes from `submitAssessmentComplete` mutation response
- Display in card format, not chat bubble
- Store summary in `assessment.summary` field in cache
- Transition to `/onboarding/[sessionId]/demographics` on confirm
- Consider animation/celebration moment for completing assessment

---

### Story 2.6: Session Persistence and Resume

As a **parent**,
I want **my progress saved automatically so I can leave and return later**,
So that **I don't lose everything if I get interrupted or need a break**.

**Acceptance Criteria:**

**Given** I am in the middle of the assessment
**When** I close the browser or navigate away
**Then** my conversation is saved to the backend

**Given** I return to the same session URL later
**When** the page loads
**Then**:
- All previous messages are restored
- I see where I left off
- The AI acknowledges my return ("Welcome back! Let's continue...")
- I can resume seamlessly

**Given** I click "Save & Exit" in the header
**When** I confirm
**Then**:
- Current state is saved
- I see confirmation with session link
- Option to receive email reminder

**And** auto-save triggers on every message send (not batched)
**And** offline/network failure shows "Saving..." indicator with retry
**And** session is recoverable for 30 days

**Prerequisites:** Story 2.4, Story 1.4 (Apollo)

**Technical Notes:**
- Use `useAutoSave` hook per Architecture
- Optimistic save on every mutation
- Session ID in URL is the recovery mechanism
- Store session ID in localStorage as backup
- Implement `useOnboardingSession` hook for session state management
- Handle merge conflicts if same session opened in multiple tabs

---

## Epic 3: Parent & Child Information Collection

**Goal:** Collect parent and child demographic information with excellent form UX, validation, and auto-save.

**User Value:** Parents can provide necessary information quickly with helpful validation, knowing their progress is always saved.

**FRs Covered:** FR-004, FR-005, FR-006, FR-007

---

### Story 3.1: Parent Information Form

As a **parent**,
I want **to enter my contact information with helpful validation**,
So that **Daybreak can reach me and I feel confident the information is correct**.

**Acceptance Criteria:**

**Given** I navigate to `/onboarding/[sessionId]/demographics`
**When** the parent info form loads
**Then** I see a clean, single-column form with:

**Form Fields (`features/demographics/ParentInfoForm.tsx`):**
- First Name (required, 2-50 chars)
- Last Name (required, 2-50 chars)
- Email (required, RFC 5322 validation)
- Phone (required, formatted as (XXX) XXX-XXXX, stored as E.164)
- Relationship to Child (required, select: Parent, Guardian, Grandparent, Other)

**Validation Behavior:**
- Real-time validation on blur (not on every keystroke)
- Error messages appear below field in red (#E85D5D)
- Error messages are specific ("Please enter a valid email address")
- Valid fields show subtle green checkmark
- Submit button disabled until form is valid

**And** form uses React Hook Form with Zod schema
**And** phone input auto-formats as user types
**And** email field has `autoComplete="email"` for browser autofill
**And** "Continue" button leads to child info form
**And** back button returns to assessment summary

**Prerequisites:** Epic 1 complete, Epic 2 complete

**Technical Notes:**
- Create `lib/validations/demographics.ts` with Zod schemas
- Use shadcn/ui `Input`, `Select` components styled to Daybreak theme
- Phone formatting via controlled input or mask library
- Form state managed by React Hook Form
- Auto-save on blur via `useAutoSave` hook
- Store in Apollo cache and sync to backend

---

### Story 3.2: Child Information Form

As a **parent**,
I want **to provide my child's information with appropriate options**,
So that **Daybreak understands who they'll be helping**.

**Acceptance Criteria:**

**Given** I have completed the parent info form
**When** the child info form loads
**Then** I see:

**Form Fields (`features/demographics/ChildInfoForm.tsx`):**
- First Name (required, 2-50 chars)
- Date of Birth (required, date picker, validates age 10-19)
- Preferred Pronouns (optional, select: She/Her, He/Him, They/Them, Other + custom text)
- Grade (optional, select: 5th through 12th + "Not in school")
- Primary Concerns (pre-filled from assessment summary, editable)

**Date of Birth Picker:**
- Calendar component with month/year dropdown
- Quick navigation for birth years (default to ~13 years ago)
- Validates child is 10-19 years old
- Clear error if outside range

**Pronouns Field:**
- Respectful, optional field
- "Prefer not to say" option
- Custom text input if "Other" selected

**And** primary concerns show what AI captured (editable textarea)
**And** "Continue" button leads to insurance step
**And** progress bar updates to show step 3 of 5

**Prerequisites:** Story 3.1

**Technical Notes:**
- Date picker from shadcn/ui `Calendar` + `Popover`
- Age validation: child must be between 10-19 at time of entry
- Pre-populate primary concerns from `assessment.summary` in cache
- Pronouns stored as string, flexible for any value
- Implement via `ChildInfoSchema` Zod schema

---

### Story 3.3: Clinical Intake Information

As a **parent**,
I want **to provide relevant medical history for my child**,
So that **the therapist has important context for treatment**.

**Acceptance Criteria:**

**Given** I have completed child info form
**When** the clinical intake section loads
**Then** I see:

**Form Fields (within `ChildInfoForm.tsx` or separate component):**
- Current medications (optional, textarea)
- Previous therapy experience (optional, select: Never, Currently in therapy, Previously in therapy)
- Other mental health diagnoses (optional, multi-select checkboxes: Anxiety, Depression, ADHD, Autism, Other)
- School accommodations (optional, select: None, IEP, 504 Plan, Other)
- Anything else we should know (optional, textarea, 500 char limit)

**And** all fields are optional (can skip)
**And** clear messaging: "This information helps us match with the right therapist"
**And** privacy notice: "Your information is protected by HIPAA"
**And** form saves on blur for each field
**And** "Continue" button proceeds to insurance

**Prerequisites:** Story 3.2

**Technical Notes:**
- These fields map to FR-006 clinical intake
- Multi-select uses shadcn/ui `Checkbox` group
- Textareas have character counter approaching limit
- Consider splitting into separate page if form feels too long
- All fields save immediately via auto-save

---

### Story 3.4: Form-Based Assessment Fallback

As a **parent who prefers traditional forms**,
I want **the option to complete assessment via forms instead of AI chat**,
So that **I can proceed even if the chat experience doesn't work for me**.

**Acceptance Criteria:**

**Given** I am on the assessment chat screen
**When** I look for alternatives
**Then** I see a subtle link: "Prefer a traditional form? Click here"

**Given** I click the fallback link
**When** the form-based assessment loads at `/onboarding/[sessionId]/form/assessment`
**Then** I see structured form pages with:

**Page 1: About Your Child**
- What concerns bring you here today? (textarea)
- How long have you noticed these concerns? (select: Less than 1 month, 1-3 months, 3-6 months, 6+ months)
- How severe would you rate the concerns? (1-5 scale)

**Page 2: Daily Life Impact**
- Sleep patterns (select options)
- Appetite changes (select options)
- School performance (select options)
- Social relationships (select options)

**Page 3: Additional Context**
- Has anything significant happened recently? (textarea)
- What are you hoping to get from therapy? (textarea)

**And** form progress saves automatically
**And** completing form generates same summary as AI chat
**And** user can switch back to chat at any time

**Prerequisites:** Stories 2.1-2.5, Story 3.1 patterns

**Technical Notes:**
- Per Architecture ADR-003: Form fallback is parallel flow
- Routes under `/onboarding/[sessionId]/form/*`
- Uses same Zod schemas and auto-save patterns
- Summary generation via same backend endpoint
- Switch between modes persists collected data

---

## Epic 4: Insurance Submission

**Goal:** Enable parents to submit insurance information with minimal friction, using manual entry as the primary reliable path.

**User Value:** Parents can quickly provide insurance details without getting stuck, with clear feedback on what's needed.

**FRs Covered:** FR-008, FR-007 (persistence)

---

### Story 4.1: Manual Insurance Entry Form

As a **parent**,
I want **to enter my insurance information manually**,
So that **I can proceed with onboarding without depending on photo capture**.

**Acceptance Criteria:**

**Given** I navigate to `/onboarding/[sessionId]/insurance`
**When** the insurance form loads
**Then** I see:

**Form Header:**
- "Let's handle insurance - this is the quick part!"
- Reassuring tone, not bureaucratic

**Form Fields (`features/insurance/InsuranceForm.tsx`):**
- Insurance Carrier (required, searchable dropdown with common carriers + "Other")
- Member ID (required, alphanumeric, 5-30 chars)
- Group Number (optional, alphanumeric)
- Subscriber Name (required, defaults to parent name if "Self")
- Relationship to Subscriber (required, select: Self, Spouse, Child, Other)

**And** carrier dropdown shows logos for major carriers
**And** member ID field shows example format based on carrier
**And** form validates on blur with helpful error messages
**And** "I don't have insurance" link offers self-pay information
**And** "Continue" button is enabled when required fields are valid

**Prerequisites:** Epic 3 complete

**Technical Notes:**
- Carrier list from backend or static JSON (top 20 carriers)
- Member ID validation varies by carrier (implement basic length check)
- Self-pay modal shows pricing information (from backend)
- Store in `insurance` field of session
- No PHI in console logs (use phi-guard utility)

---

### Story 4.2: Insurance Verification and Confirmation

As a **parent**,
I want **confirmation that my insurance was received**,
So that **I can move forward with confidence**.

**Acceptance Criteria:**

**Given** I have submitted insurance information
**When** the system processes it
**Then** I see:

**Processing State:**
- "Saving your insurance information..."
- Subtle loading animation (not blocking)
- Completes quickly (< 2 seconds)

**Confirmation State:**
- Green checkmark icon
- "Insurance information saved!"
- Summary of what was captured (carrier, member ID - partially masked)
- "Edit" link if correction needed
- "Continue to find your therapist" button (primary)

**Error State (if backend rejects):**
- Specific error message ("We couldn't verify this member ID")
- Inline edit capability
- "Try again" button
- "Skip for now" option with warning

**And** confirmation shows without full page reload
**And** insurance data persists correctly in session

**Prerequisites:** Story 4.1

**Technical Notes:**
- Use Apollo mutation with optimistic response
- Mask member ID in confirmation (show last 4 digits)
- Backend verification is async (MVP may just save, Growth adds verification)
- Error handling per Architecture patterns
- Proceed even if verification pending (flag in session)

---

### Story 4.3: Self-Pay Option Flow

As a **parent without insurance or with rejected coverage**,
I want **clear information about self-pay options**,
So that **I can still access care for my child**.

**Acceptance Criteria:**

**Given** I click "I don't have insurance" or insurance is rejected
**When** the self-pay modal appears
**Then** I see:

**Self-Pay Information:**
- Clear pricing per session
- Payment plans available (if applicable)
- "We believe every family deserves access to care" messaging
- No judgment, supportive tone

**Actions:**
- "Proceed with self-pay" button
- "I'll add insurance later" option
- "Contact us for questions" link

**Given** I choose self-pay
**When** I proceed
**Then** the session is marked as self-pay and continues to matching

**And** self-pay can be changed later (before first appointment)
**And** session persists self-pay choice

**Prerequisites:** Story 4.1

**Technical Notes:**
- Modal uses shadcn/ui `Dialog` component
- Pricing comes from backend or environment config
- Self-pay flag stored in session
- FR-010 (cost estimates) is Growth scope - MVP shows static pricing

---

## Epic 5: Therapist Matching & Booking

**Goal:** Show matched therapists with transparent reasoning and enable appointment booking with confirmation.

**User Value:** Parents can understand why therapists were matched, choose with confidence, and book immediately with clear next steps.

**FRs Covered:** FR-011, FR-012, FR-013, FR-015

---

### Story 5.1: Therapist Matching Results Display

As a **parent**,
I want **to see therapists matched for my child with clear explanations**,
So that **I understand why they're recommended and can choose confidently**.

**Acceptance Criteria:**

**Given** I complete insurance submission
**When** navigating to `/onboarding/[sessionId]/matching`
**Then** I see:

**Loading State:**
- "Finding the best matches for [child name]..."
- Animated illustration or progress indicator
- Takes 1-3 seconds typically

**Results Display:**
- 2-3 matched therapists shown as cards
- Cards ordered by match quality (best first)
- "Best Match" badge on top recommendation

**Therapist Card (`features/matching/TherapistCard.tsx`):**
- Professional photo (80x80, rounded)
- Name and credentials (e.g., "Dr. Sarah Chen, LMFT")
- Specialty tags (e.g., "Anxiety", "Teen Issues")
- Match reasons (e.g., "Specializes in concerns like yours")
- Availability preview ("Available this week")
- "Book Now" button (primary)
- "View Profile" link (secondary)

**And** each card shows 2-3 specific match reasons
**And** "Why these therapists?" expandable section explains matching criteria
**And** "None of these feel right?" link offers to see more or contact support

**Prerequisites:** Epic 4 complete

**Technical Notes:**
- Therapists from `matchTherapists` query
- Match rationale comes from backend (FR-011)
- Photos should be optimized via `next/image`
- Pre-mortem: Show transparent reasoning per Architecture requirement
- Cards should be tappable/clickable for full profile

---

### Story 5.2: Therapist Profile Detail View

As a **parent**,
I want **to learn more about a therapist before booking**,
So that **I feel confident they're the right fit for my child**.

**Acceptance Criteria:**

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

**Prerequisites:** Story 5.1

**Technical Notes:**
- Profile data from same query or separate `getTherapist` query
- Use shadcn/ui `Sheet` with `side="right"` on desktop, `side="bottom"` on mobile
- Responsive: Sheet becomes full-screen on mobile
- Match reasons personalized based on assessment data

---

### Story 5.3: Appointment Calendar and Time Selection

As a **parent**,
I want **to see available appointment times and select one**,
So that **I can book when it works for our family's schedule**.

**Acceptance Criteria:**

**Given** I click "Book Now" on a therapist
**When** the scheduling view loads at `/onboarding/[sessionId]/schedule`
**Then** I see:

**Calendar Component (`features/scheduling/Calendar.tsx`):**
- Month view with available dates highlighted
- Today's date marked
- Navigate between months (arrows)
- Unavailable dates grayed out
- Selected date highlighted in teal

**Time Slots (`features/scheduling/TimeSlotPicker.tsx`):**
- After selecting date, time slots appear
- Slots shown in user's local timezone
- Available: solid buttons with time (9:00 AM, 10:00 AM, etc.)
- Unavailable: grayed out with strikethrough
- Selected: teal fill with checkmark

**Session Details:**
- "First session with [therapist name]"
- "50 minutes"
- "Video call" badge
- Timezone displayed and editable

**And** selecting a time enables "Confirm Booking" button
**And** user can go back to change therapist
**And** slots update in real-time if another user books

**Prerequisites:** Stories 5.1, 5.2

**Technical Notes:**
- Calendar from shadcn/ui or custom component
- Availability from `getTherapistAvailability` query
- Times displayed in detected timezone with selector
- Consider subscription for real-time slot updates
- Store selected slot in local state until confirmed

---

### Story 5.4: Booking Confirmation and Success

As a **parent**,
I want **confirmation that my appointment is booked**,
So that **I know help is on the way for my child**.

**Acceptance Criteria:**

**Given** I click "Confirm Booking"
**When** the booking is processed
**Then** I see:

**Processing State:**
- "Booking your appointment..."
- Brief loading indicator

**Success State (`features/scheduling/Confirmation.tsx`):**
- Celebration moment (confetti animation, warm illustration)
- "You're all set!" heading
- Appointment details card:
  - Therapist name and photo
  - Date and time
  - "Video call" format
  - "Add to calendar" buttons (Google, Apple, Outlook)
- What's next section:
  - "Check your email for confirmation"
  - "Join link will be sent before appointment"
  - "You can reschedule or cancel anytime"

**And** "Done" button returns to landing page or dashboard
**And** confirmation email is triggered (FR-015)
**And** appointment shows in any existing Daybreak dashboard

**Prerequisites:** Story 5.3

**Technical Notes:**
- Booking via `bookAppointment` mutation
- Use `useMutation` with optimistic response
- Confetti animation via lightweight library (canvas-confetti)
- Calendar links generated client-side (ICS format)
- Email triggered by backend mutation side effect

---

### Story 5.5: Email Confirmation and Reminders

As a **parent**,
I want **to receive email confirmation of my appointment**,
So that **I have a record and won't forget**.

**Acceptance Criteria:**

**Given** I have successfully booked an appointment
**When** the booking is confirmed
**Then** within 1 minute I receive an email with:

**Confirmation Email:**
- Subject: "Your appointment with [Therapist] is confirmed!"
- Daybreak branding and warm tone
- Appointment details (date, time, therapist)
- Add to calendar attachment (.ics file)
- Join link for video call
- Reschedule/cancel links
- Support contact information

**And** the email is mobile-friendly (responsive)
**And** the email does not contain excessive PHI

**Note:** Email sending is a backend responsibility. This story covers the trigger from frontend and displaying "Email sent" confirmation.

**Prerequisites:** Story 5.4

**Technical Notes:**
- Backend handles email delivery (FR-015)
- Frontend shows "Confirmation email sent to [email]" message
- If email fails, show "Email pending" with support contact
- Email template defined in backend, not frontend scope

---

## Epic 6: Human Support Integration

**Goal:** Provide real-time human support escalation throughout the onboarding flow, ensuring parents never feel trapped.

**User Value:** Parents can get human help at any moment if the AI experience isn't working for them, providing emotional safety.

**FRs Covered:** FR-014

---

### Story 6.1: Floating Support Button

As a **parent**,
I want **to always see an option to get human help**,
So that **I know I'm not alone if I get stuck or need reassurance**.

**Acceptance Criteria:**

**Given** I am anywhere in the onboarding flow
**When** I look at the screen
**Then** I see a floating support button:

**Support Button (`components/layout/SupportButton.tsx`):**
- Position: fixed bottom-right (16px margin)
- Warm orange background (#E9A23B)
- Chat bubble icon + "Help" text
- Subtle shadow for elevation
- 56px height (accessible touch target)
- Doesn't overlap with input areas

**On Hover/Tap:**
- Tooltip: "Chat with our team"
- Gentle pulse animation

**And** button is present on all onboarding pages
**And** button does not appear on landing page (only during onboarding)
**And** button position adjusts for mobile keyboard

**Prerequisites:** Epic 1 (layout components)

**Technical Notes:**
- Component added to onboarding layout
- Use `fixed bottom-4 right-4` positioning
- Z-index above content but below modals
- Detect keyboard open on mobile to adjust position
- Track clicks for analytics

---

### Story 6.2: Support Chat Widget

As a **parent**,
I want **to chat with a real person in real-time**,
So that **I can get immediate help with questions or concerns**.

**Acceptance Criteria:**

**Given** I click the support button
**When** the chat widget opens
**Then** I see:

**Chat Widget (`features/support-chat/SupportChatWidget.tsx`):**
- Slides up from button position
- Similar to AI chat UI (consistent experience)
- "Chat with Daybreak Support" header
- Message input at bottom
- Previous messages if returning to chat

**Initial Message:**
- Automated: "Hi! How can I help you today?"
- Shows "Typically replies in < 2 minutes" or real wait time

**Real-Time Behavior:**
- Messages appear instantly via GraphQL subscription
- Staff responses show staff name and avatar
- Typing indicator when staff is responding
- "Seen" indicator when staff has read message

**And** widget can be minimized back to button (with unread badge)
**And** conversation persists across page navigation
**And** if staff is offline, show "Leave a message" with email followup

**Prerequisites:** Story 6.1, Story 1.4 (WebSocket)

**Technical Notes:**
- Uses `SupportChatMessagesSubscription` for real-time
- Messages via `sendSupportMessage` mutation
- Subscription reconnects automatically on disconnect
- Widget state managed in context (open/minimized/closed)
- Store conversation ID in session for continuity

---

### Story 6.3: Support Availability and Fallback

As a **parent reaching out after hours**,
I want **clear expectations about when I'll get a response**,
So that **I don't feel ignored or abandoned**.

**Acceptance Criteria:**

**Given** I open support chat outside business hours
**When** the widget loads
**Then** I see:

**After-Hours State:**
- "Our team is away right now"
- Business hours displayed (e.g., "Mon-Fri 9am-6pm ET")
- "Leave a message and we'll respond first thing"
- Email input for follow-up (pre-filled if known)
- "Send" button for offline message

**Given** I send an offline message
**When** I return during business hours
**Then** I see:
- Previous message I sent
- Any staff responses
- Real-time connection reestablished

**And** critical keywords (crisis, emergency) show immediate hotline resources
**And** offline messages are queued and delivered when staff available

**Prerequisites:** Story 6.2

**Technical Notes:**
- Business hours from backend config or environment
- Offline messages via regular mutation (not subscription)
- Crisis detection via keyword list (backend logic)
- Show crisis hotlines (988, Crisis Text Line) for flagged content
- Queue mechanism is backend responsibility

---

## FR Coverage Matrix

| FR | Description | Epic | Story |
|:---|:------------|:-----|:------|
| FR-001 | Conversational AI interface for screening | Epic 2 | 2.1, 2.2, 2.4 |
| FR-002 | Adaptive questions based on responses | Epic 2 | 2.4 |
| FR-003 | Assessment summary for therapist matching | Epic 2 | 2.5 |
| FR-004 | Parent demographic collection | Epic 3 | 3.1 |
| FR-005 | Child demographic collection | Epic 3 | 3.2 |
| FR-006 | Clinical intake information | Epic 3 | 3.3 |
| FR-007 | Session persistence/resume | Epic 2 | 2.6 | Also: 3.1, 3.2, 3.3, 4.1 (auto-save in all) |
| FR-008 | Manual insurance entry | Epic 4 | 4.1 |
| FR-009 | Insurance card OCR | [Growth] | Deferred |
| FR-010 | Cost estimation | [Growth] | Deferred |
| FR-011 | Therapist matching/suggestions | Epic 5 | 5.1, 5.2 |
| FR-012 | Available appointment slots | Epic 5 | 5.3 |
| FR-013 | Appointment booking + confirmation | Epic 5 | 5.4 |
| FR-014 | Real-time staff support chat | Epic 6 | 6.1, 6.2, 6.3 |
| FR-015 | Email notifications | Epic 5 | 5.5 |
| FR-016 | Educational content library | [Vision] | Deferred |
| FR-017 | Searchable knowledge base | [Vision] | Deferred |

**Coverage Status:** ✅ All 15 MVP FRs covered by stories

---

## Summary

This epic breakdown transforms the Parent Onboarding AI PRD into 6 epics and 26 stories, each designed to be:

- **Bite-sized:** Completable by a single developer in one focused session
- **Vertically sliced:** Each story delivers complete functionality
- **Sequentially ordered:** No forward dependencies
- **Detail-rich:** Includes UX patterns, Architecture decisions, and acceptance criteria

**Epic Sequence:**
1. **Foundation** (5 stories) - Technical setup enabling all features
2. **AI Assessment** (6 stories) - Core value prop: conversational screening
3. **Information Collection** (4 stories) - Demographics with validation
4. **Insurance** (3 stories) - Friction-reduced insurance entry
5. **Matching & Booking** (5 stories) - End-to-end scheduling
6. **Human Support** (3 stories) - Real-time staff escalation

**Context Incorporated:**
- ✅ PRD functional requirements (all 15 MVP FRs mapped)
- ✅ UX Design patterns (colors, typography, component specs)
- ✅ Architecture decisions (tech stack, project structure, patterns)

---

_For implementation: Use the `create-story` workflow to generate individual story implementation plans from this epic breakdown._

_This document will be enhanced as implementation reveals additional details or requirements._

