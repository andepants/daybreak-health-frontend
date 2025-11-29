# Frontend Technical Specification: Parent Onboarding AI

**Version:** 1.0
**Date:** November 28, 2025
**Corresponding Backend Spec:** `backend_spec.md`

---

## 1. Introduction

This document provides a detailed technical specification for the frontend of the Daybreak Health Parent Onboarding AI platform. The frontend is a Next.js application responsible for rendering the user interface, managing client-side state, and communicating with the backend via a GraphQL API. Its primary goal is to provide a seamless, intuitive, and supportive experience for parents.

This specification is the source of truth for the frontend development team and is designed to be used in conjunction with the `api_schema.graphql` file, which defines the definitive contract with the backend.

## 2. Core Technologies

| Technology | Purpose |
| :--- | :--- |
| **Next.js** | The core React framework for building the application, providing server-side rendering, static site generation, and file-based routing. |
| **React 18** | The UI library for building components. |
| **TypeScript** | For static typing, ensuring code quality and maintainability. |
| **Apollo Client** | The state management library for fetching, caching, and managing server state from the GraphQL API. |
| **Tailwind CSS** | A utility-first CSS framework for rapidly building custom user interfaces. |
| **GraphQL Code Generator** | To automatically generate TypeScript types from the `api_schema.graphql` file, ensuring type safety between the frontend and backend. |
| **Action Cable JS Client** | To connect to the backend's Action Cable server for real-time chat functionality. |

## 3. Project Structure (Next.js)

The frontend repository will follow a standard Next.js structure with a focus on feature-based organization.

```
parent-onboarding-frontend/
├── components/         # Reusable UI components (Button, Input, Modal, etc.)
│   └── ui/             # Generic, unstyled components
│   └── layout/         # Page layout components (Header, Footer, etc.)
├── features/           # Components and hooks specific to a feature
│   ├── assessment/     # AI Chatbot interface, message bubbles, etc.
│   ├── insurance/      # Insurance form, file uploader
│   └── scheduling/     # Calendar view, time slot selector
├── graphql/            # .graphql files for queries, mutations, subscriptions
│   ├── queries/
│   └── mutations/
├── hooks/              # Custom React hooks (e.g., useAuth, useSupportChat)
├── lib/                # Library initializations (Apollo Client, Action Cable)
├── pages/              # Next.js routes
│   ├── index.tsx       # Landing/entry page
│   └── onboarding/
│       └── [sessionId]/
│           ├── assessment.tsx
│           ├── demographics.tsx
│           ├── insurance.tsx
│           └── schedule.tsx
├── public/             # Static assets (images, fonts)
├── styles/             # Global styles and Tailwind CSS configuration
└── types/              # Generated GraphQL types (graphql-codegen)
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

-   **Connection:** A custom hook, `useSupportChat(onboardingSessionId)`, will be created to manage the Action Cable WebSocket connection.
-   **Subscription:** Inside the hook, the client will subscribe to the `SupportChatChannel` for the specific `onboardingSessionId`.
-   **State Updates:** When a new message is received from the `supportChatMessages` subscription, the hook will update the local chat history state. This will cause the chat UI to re-render with the new message.
-   **Sending Messages:** The UI will call the `sendSupportChatMessage` mutation to send a message. The backend will then broadcast this message to all subscribers, including the sender's client, ensuring a consistent message flow.

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
    -   **Tools:** Jest and React Testing Library.
    -   **Coverage:** Target >80% coverage for shared components (`components/`) and utility functions (`lib/`, `hooks/`).
    -   **Focus:** Test component rendering, user interactions (clicks, typing), and state updates.
-   **Integration Testing:**
    -   Test the integration between parent components and their children, and the Apollo Client mocks.
-   **End-to-End (E2E) Testing:**
    -   **Tool:** Cypress or Playwright.
    -   **Scope:** Cover critical user flows:
        1.  Landing page -> Start Onboarding.
        2.  Chatbot assessment flow.
        3.  Demographics form submission.
        4.  Insurance manual entry.
        5.  Scheduling an appointment.

## 14. Deployment

-   **Build:** The application will be built as a static export using `next build && next export` (or `output: 'export'` in `next.config.js`).
-   **Infrastructure:**
    -   **AWS S3:** Hosts the static assets (HTML, CSS, JS, Images).
    -   **AWS CloudFront:** CDN for global content delivery, caching, and SSL termination.
-   **CI/CD:** GitHub Actions will trigger the build and deploy process on push to the `main` branch.

## 15. Getting Started (Local Setup)

1.  Clone the `parent-onboarding-frontend` repository.
2.  Install Node.js and `pnpm` (or `npm`/`yarn`).
3.  Run `pnpm install`.
4.  Create a `.env.local` file and add the backend API URL: `NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:3001/graphql`.
5.  Run `pnpm dev` to start the development server on `localhost:3000`.
6.  Ensure the backend server is also running on `localhost:3001`.
