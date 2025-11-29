# Frontend Technical Specification: Parent Onboarding AI

**Version:** 1.1
**Date:** November 28, 2025
**Last Updated:** November 28, 2025 (Tech stack audit & real-time architecture update)
**Corresponding Backend Spec:** `backend_spec.md`
**Backend Integration Guide:** `backend-graphql-subscriptions-guide.md`

---

## 1. Introduction

This document provides a detailed technical specification for the frontend of the Daybreak Health Parent Onboarding AI platform. The frontend is a Next.js application responsible for rendering the user interface, managing client-side state, and communicating with the backend via a GraphQL API. Its primary goal is to provide a seamless, intuitive, and supportive experience for parents.

This specification is the source of truth for the frontend development team and is designed to be used in conjunction with the `api_schema.graphql` file, which defines the definitive contract with the backend.

## 2. Core Technologies

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Next.js** | 15.x | App Router with React Server Components, Turbopack for development, static export for deployment. |
| **React** | 19.x | Latest features: `use` hook, Actions, `useActionState`, ref as prop, Suspense improvements. |
| **TypeScript** | 5.x | End-to-end type safety from GraphQL schema to components. |
| **Apollo Client** | 4.x | With `@apollo/client-integration-nextjs` for App Router. Unified API for queries, mutations, and subscriptions. |
| **Tailwind CSS** | 4.x | CSS-first configuration, form state variants. Requires modern browsers (Chrome 111+, Safari 16.4+, Firefox 128+). |
| **GraphQL Code Generator** | Latest | Generates TypeScript types and React hooks from `api_schema.graphql`. Uses `typescript-react-apollo` plugin. |
| **React Hook Form** | 7.x | Performant, uncontrolled form handling with minimal re-renders. |
| **Zod** | 4.x | TypeScript-first schema validation. Integrates via `@hookform/resolvers/zod`. |
| **graphql-ws** | Latest | WebSocket client for GraphQL subscriptions over Action Cable transport. |

## 3. Project Structure (Next.js App Router)

The frontend repository will follow the Next.js 15 App Router structure with feature-based organization.

```
daybreak-health-frontend/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout with providers
│   ├── page.tsx              # Landing/entry page
│   ├── globals.css           # Global styles (Tailwind imports)
│   └── onboarding/
│       └── [sessionId]/
│           ├── layout.tsx    # Onboarding layout with progress
│           ├── assessment/
│           │   └── page.tsx
│           ├── demographics/
│           │   └── page.tsx
│           ├── insurance/
│           │   └── page.tsx
│           └── schedule/
│               └── page.tsx
├── components/               # Reusable UI components
│   ├── ui/                   # Generic components (Button, Input, Modal)
│   └── layout/               # Layout components (Header, Footer, Progress)
├── features/                 # Feature-specific components and hooks
│   ├── assessment/           # AI Chatbot interface, message bubbles
│   ├── insurance/            # Insurance form, file uploader
│   ├── scheduling/           # Calendar view, time slot selector
│   └── support-chat/         # Real-time support chat (P1)
├── graphql/                  # GraphQL operations
│   ├── queries/              # .graphql query files
│   ├── mutations/            # .graphql mutation files
│   └── subscriptions/        # .graphql subscription files
├── hooks/                    # Custom React hooks
├── lib/                      # Library configurations
│   ├── apollo/               # Apollo Client setup
│   │   ├── client.ts         # Client configuration
│   │   ├── provider.tsx      # ApolloProvider wrapper
│   │   └── links.ts          # HTTP + WebSocket link setup
│   └── validations/          # Zod schemas
├── public/                   # Static assets
├── types/                    # Generated types (graphql-codegen output)
├── codegen.ts                # GraphQL Code Generator config
├── tailwind.config.ts        # Tailwind CSS configuration
└── next.config.ts            # Next.js configuration
```

## 4. State Management

A hybrid approach will be used to manage state effectively:

-   **Server State:** **Apollo Client** will be the single source of truth for all data fetched from the backend. Its in-memory cache will handle caching, normalization, and optimistic updates, reducing the need for redundant API calls.
-   **Local UI State:** Standard React hooks (`useState`, `useReducer`) will be used for managing component-level state, such as form inputs, modal visibility, and other temporary UI states.
-   **Global UI State:** For global state that needs to be shared across the application (e.g., the authenticated user object, onboarding status), React Context API will be used to create an `AuthContext` and an `OnboardingContext`.

## 5. Routing & Page Flow

Routing will be handled by Next.js's file-based router. The primary flow will be dynamic, based on the `onboardingSessionId`.

1.  **`/` (Home Page):** A simple page with a form to collect parent email and child's name/DOB. On submission, it calls the `startOnboarding` mutation.
    -   On success, it receives the `onboardingSessionId` and the JWT.
    -   It stores the JWT securely and redirects the user to `/onboarding/[sessionId]/assessment`.

2.  **`/onboarding/[sessionId]/assessment`:**
    -   Displays the AI chatbot interface.
    -   Fetches the initial assessment state using the `getOnboardingSession` query.
    -   Handles user messages via the `submitAssessmentMessage` mutation.

3.  **`/onboarding/[sessionId]/demographics`:**
    -   A form for the parent to enter their name and child's pronouns/concerns.
    -   Populates with existing data from `getOnboardingSession`.
    -   Submits data using the `updateDemographics` mutation.

4.  **`/onboarding/[sessionId]/insurance`:**
    -   **P0:** A form for manual entry of insurance details (`submitInsuranceInfo` mutation).
    -   **P1:** Includes a file upload component (`<InsuranceUploader />`) that handles the `submitInsuranceImage` mutation. This component will show a loading state and then poll or subscribe for the OCR results.

5.  **`/onboarding/[sessionId]/schedule`:**
    -   Displays available therapists and time slots fetched via `getAvailableSlots`.
    -   On selection, calls the `scheduleAppointment` mutation.

## 6. GraphQL & API Communication

-   **Apollo Client Setup:** The client will be configured in `lib/apollo.ts` to connect to the backend's GraphQL endpoint. An Apollo Link will be used to automatically attach the JWT `Authorization` header to every request.
-   **Typed Operations:** `graphql-codegen` will be configured to watch the `graphql/**/*.graphql` files and the backend schema. It will generate TypeScript types and custom hooks (e.g., `useGetOnboardingSessionQuery`, `useStartOnboardingMutation`) for all defined operations, providing end-to-end type safety.

**Example Query (`getOnboardingSession.graphql`):**
```graphql
query GetOnboardingSession($id: ID!) {
  getOnboardingSession(id: $id) {
    id
    status
    child {
      firstName
    }
    assessment {
      conversationHistory {
        sender
        content
        timestamp
      }
    }
  }
}
```

## 7. Real-time Chat Integration (P1)

The support chat uses **GraphQL Subscriptions** (Apollo Client) with **Action Cable** as the WebSocket transport on the backend. This provides a unified, type-safe API while leveraging Rails' native WebSocket infrastructure.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Apollo Client)                                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ useSubscription(SUPPORT_CHAT_MESSAGES, { variables })   ││
│  │ useMutation(SEND_SUPPORT_CHAT_MESSAGE)                  ││
│  └─────────────────────────────────────────────────────────┘│
└──────────────────────────┬──────────────────────────────────┘
                           │ GraphQL over WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend (Rails + graphql-ruby)                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ GraphQL::Subscriptions::ActionCableSubscriptions        ││
│  │ GraphqlChannel < ApplicationCable::Channel              ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Implementation

-   **Apollo Link Setup:** Configure `GraphQLWsLink` from `graphql-ws` to connect to the backend's Action Cable endpoint (`/cable`). Use `split` to route subscriptions through WebSocket and queries/mutations through HTTP.

```typescript
// lib/apollo/links.ts
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { split, HttpLink } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.NEXT_PUBLIC_WS_ENDPOINT!, // ws://localhost:3001/cable
    connectionParams: () => ({
      token: getAuthToken(), // JWT for authentication
    }),
  })
);

export const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);
```

-   **Subscription Hook:** Use Apollo's `useSubscription` hook with generated types for type-safe real-time updates.

```typescript
// features/support-chat/useSupportChat.ts
import { useSubscription, useMutation } from "@apollo/client";
import {
  SupportChatMessagesDocument,
  SendSupportChatMessageDocument,
} from "@/types/graphql";

export function useSupportChat(onboardingSessionId: string) {
  const { data, loading } = useSubscription(SupportChatMessagesDocument, {
    variables: { onboardingSessionId },
  });

  const [sendMessage] = useMutation(SendSupportChatMessageDocument);

  return {
    latestMessage: data?.supportChatMessages,
    loading,
    sendMessage: (content: string) =>
      sendMessage({ variables: { onboardingSessionId, content } }),
  };
}
```

-   **Cache Integration:** Use `subscribeToMore` for automatic cache updates when integrating with existing queries.

## 8. Component Breakdown

-   **`features/assessment/ChatWindow.tsx`**: The main component for the AI assessment. It will manage the conversation history state and use the `submitAssessmentMessage` mutation.
-   **`features/insurance/InsuranceUploader.tsx` (P1)**: A component that handles file selection and upload. It will use a direct-to-S3 upload mechanism for security and performance. It will show progress and the final extracted data.
-   **`features/scheduling/Calendar.tsx`**: A component to display available appointment slots. It will fetch data using the `getAvailableSlots` query and handle user selection.
-   **`components/layout/OnboardingProgress.tsx`**: A persistent sidebar or header component that shows the user's current step in the onboarding flow, based on the `status` field from the `OnboardingSession` object.

## 9. Error Handling

A robust error handling strategy will be implemented to ensure a smooth user experience even when things go wrong.

-   **Global Error Boundary:** A React Error Boundary component will wrap the main application to catch unhandled runtime errors and display a friendly "Something went wrong" fallback UI instead of crashing the white screen.
-   **API Errors:**
    -   **Network Errors:** Display a toast notification (e.g., using `react-hot-toast`) informing the user of connectivity issues.
    -   **GraphQL Errors:** Handle `graphQLErrors` from Apollo Client. Display specific error messages returned by the backend (e.g., "Invalid session") in alerts or toasts.
-   **Form Validation:**
    -   Use client-side validation (e.g., `react-hook-form` with `zod` schema validation) to provide immediate feedback.
    -   Display inline error messages below invalid fields (e.g., "Email is required").

## 10. Accessibility & UI/UX Standards

The application must be accessible to all users, adhering to **WCAG 2.1 AA** standards.

-   **Semantic HTML:** Use proper HTML5 tags (`<main>`, `<nav>`, `<article>`, `<button>`) to ensure screen readers can navigate the page structure.
-   **Keyboard Navigation:** Ensure all interactive elements (buttons, links, form inputs) are focusable and navigable via keyboard (Tab/Shift+Tab).
-   **ARIA Attributes:** Use `aria-label`, `aria-expanded`, and `aria-live` where necessary to provide context to assistive technologies, especially for dynamic content like the AI chat.
-   **Color Contrast:** Ensure text and interactive elements meet the minimum contrast ratio of 4.5:1.
-   **Mobile-First:** Design and implement for mobile devices first, ensuring touch targets are large enough (min 44x44px) and layouts adapt gracefully to larger screens.

## 11. Performance Optimization

-   **Code Splitting:** Leverage Next.js automatic code splitting. Use `React.lazy` and `Suspense` for heavy components that are not critical for the initial render.
-   **Image Optimization:** Use the `next/image` component to automatically resize, optimize, and serve images in modern formats (WebP/AVIF) based on the user's device.
-   **Bundle Analysis:** Regularly check bundle sizes using `@next/bundle-analyzer` to prevent bloat.
-   **Optimistic UI:** Implement optimistic updates for mutations (e.g., sending a chat message) to make the app feel instant.

## 12. Security Best Practices

-   **Authentication:**
    -   Store the JWT securely. While `HttpOnly` cookies are preferred, if the backend is on a different domain and cannot set cookies, store the token in memory and use a silent refresh mechanism if possible. If `localStorage` must be used, ensure strict XSS prevention.
-   **XSS Prevention:** Rely on React's automatic escaping of content. Avoid using `dangerouslySetInnerHTML` unless absolutely necessary and the content is sanitized (e.g., using `dompurify`).
-   **Input Sanitization:** Sanitize all user inputs on the client side before sending to the backend, although the primary defense is on the backend.
-   **Dependencies:** Regularly audit dependencies (`npm audit`) to identify and fix vulnerabilities.

## 13. Testing Strategy

-   **Unit Testing:**
    -   **Tools:** Vitest + React Testing Library (faster than Jest with native ESM support).
    -   **Coverage:** Target >80% coverage for shared components (`components/`) and utility functions (`lib/`, `hooks/`).
    -   **Focus:** Test component rendering, user interactions (clicks, typing), and state updates.
-   **Integration Testing:**
    -   Test the integration between parent components and their children.
    -   Use MSW (Mock Service Worker) for API mocking with Apollo Client.
-   **End-to-End (E2E) Testing:**
    -   **Tool:** Playwright (preferred for TypeScript support and parallel execution).
    -   **Scope:** Cover critical user flows:
        1.  Landing page -> Start Onboarding.
        2.  Chatbot assessment flow.
        3.  Demographics form submission.
        4.  Insurance manual entry.
        5.  Scheduling an appointment.
-   **Type Safety Testing:**
    -   GraphQL Code Generator ensures compile-time validation of all GraphQL operations.
    -   Zod schemas provide runtime validation with TypeScript inference.

## 14. Deployment

-   **Build:** The application will be built as a static export using `next build && next export` (or `output: 'export'` in `next.config.js`).
-   **Infrastructure:**
    -   **AWS S3:** Hosts the static assets (HTML, CSS, JS, Images).
    -   **AWS CloudFront:** CDN for global content delivery, caching, and SSL termination.
-   **CI/CD:** GitHub Actions will trigger the build and deploy process on push to the `main` branch.

## 15. Getting Started (Local Setup)

### Prerequisites

- **Node.js 20+** (required for React Hook Form 7.x and modern tooling)
- **pnpm 9+** (recommended package manager)

### Setup Steps

1.  Clone the `daybreak-health-frontend` repository.
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Create a `.env.local` file:
    ```bash
    NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:3001/graphql
    NEXT_PUBLIC_WS_ENDPOINT=ws://localhost:3001/cable
    ```
4.  Generate GraphQL types:
    ```bash
    pnpm codegen
    ```
5.  Start the development server:
    ```bash
    pnpm dev
    ```
6.  Ensure the backend server is also running on `localhost:3001`.

### Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm codegen` | Generate GraphQL types |
| `pnpm codegen:watch` | Watch mode for GraphQL codegen |
| `pnpm test` | Run Vitest unit tests |
| `pnpm test:e2e` | Run Playwright E2E tests |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript compiler check |
