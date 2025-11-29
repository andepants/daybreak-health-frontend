# Story 1.4: Apollo Client Configuration with WebSocket Support

Status: drafted

## Story

As a **developer**,
I want **Apollo Client configured for both HTTP queries/mutations and WebSocket subscriptions**,
so that **I can communicate with the Rails GraphQL API and receive real-time updates**.

## Acceptance Criteria

1. **AC-1.4.1:** HTTP link configured with endpoint - Link uses `NEXT_PUBLIC_GRAPHQL_ENDPOINT`
2. **AC-1.4.2:** Auth header included in requests - Bearer token sent when available
3. **AC-1.4.3:** WebSocket link configured with graphql-ws - Link uses `NEXT_PUBLIC_WS_ENDPOINT`
4. **AC-1.4.4:** Split link routes subscriptions to WS - Subscriptions use WebSocket, queries use HTTP
5. **AC-1.4.5:** InMemoryCache with type policies - OnboardingSession, Message policies configured
6. **AC-1.4.6:** ApolloProvider wraps app - Provider available in component tree
7. **AC-1.4.7:** Reconnection with exponential backoff - WebSocket reconnects after disconnect
8. **AC-1.4.8:** useWebSocketReconnect hook created - Hook exposes connection status

## Tasks / Subtasks

- [ ] Task 1: Create HTTP link with authorization header (AC: 1, 2)
  - [ ] 1.1 Create `lib/apollo/links.ts` file with proper module documentation
  - [ ] 1.2 Implement `createHttpLink()` function that reads `NEXT_PUBLIC_GRAPHQL_ENDPOINT`
  - [ ] 1.3 Add `setContext` middleware to attach Bearer token from memory/context
  - [ ] 1.4 Add error handling for network failures
  - [ ] 1.5 Write unit tests for HTTP link creation

- [ ] Task 2: Create WebSocket link with graphql-ws (AC: 3, 7)
  - [ ] 2.1 Implement `createWsLink()` function using `graphql-ws` client
  - [ ] 2.2 Configure WebSocket endpoint from `NEXT_PUBLIC_WS_ENDPOINT`
  - [ ] 2.3 Add `connectionParams` callback to include auth token
  - [ ] 2.4 Configure exponential backoff reconnection (1s, 2s, 4s, max 30s)
  - [ ] 2.5 Add connection lifecycle event handlers (opened, closed, error)
  - [ ] 2.6 Write unit tests for WebSocket link creation

- [ ] Task 3: Configure split link for routing (AC: 4)
  - [ ] 3.1 Implement `createSplitLink()` function
  - [ ] 3.2 Use `getMainDefinition` to detect subscription operations
  - [ ] 3.3 Route subscriptions to WebSocket link, queries/mutations to HTTP link
  - [ ] 3.4 Write unit tests for split link logic

- [ ] Task 4: Configure InMemoryCache with type policies (AC: 5)
  - [ ] 4.1 Create `lib/apollo/client.ts` file
  - [ ] 4.2 Implement `makeClient()` function
  - [ ] 4.3 Configure `InMemoryCache` with OnboardingSession policy (keyFields: ['id'], fields.assessment: merge)
  - [ ] 4.4 Configure Message cache policy (keyFields: ['id'])
  - [ ] 4.5 Configure TherapistMatch cache policy (keyFields: ['therapistId'])
  - [ ] 4.6 Write unit tests for cache policy configuration

- [ ] Task 5: Create ApolloProvider wrapper component (AC: 6)
  - [ ] 5.1 Create `lib/apollo/provider.tsx` file
  - [ ] 5.2 Implement `ApolloWrapper` component using `@apollo/client-integration-nextjs`
  - [ ] 5.3 Use `ApolloNextAppProvider` for App Router compatibility
  - [ ] 5.4 Export client factory function for SSR/CSR
  - [ ] 5.5 Write render test for provider component

- [ ] Task 6: Create useWebSocketReconnect hook (AC: 8)
  - [ ] 6.1 Create `hooks/useWebSocketReconnect.ts` file
  - [ ] 6.2 Implement hook to expose WebSocket connection status
  - [ ] 6.3 Return connection state (connecting, connected, disconnected, error)
  - [ ] 6.4 Provide manual reconnect function
  - [ ] 6.5 Add TypeScript interface for return type
  - [ ] 6.6 Write unit tests with mock WebSocket client

- [ ] Task 7: Integrate ApolloProvider in root layout (AC: 6)
  - [ ] 7.1 Update `app/layout.tsx` to wrap children with `ApolloWrapper`
  - [ ] 7.2 Verify provider is available in component tree
  - [ ] 7.3 Test with simple query component (or mock)

- [ ] Task 8: Verify Apollo Client setup (AC: all)
  - [ ] 8.1 Test HTTP link makes requests to correct endpoint
  - [ ] 8.2 Test auth header included when token available
  - [ ] 8.3 Test WebSocket connects to correct endpoint
  - [ ] 8.4 Test split link routes operations correctly
  - [ ] 8.5 Test cache policies merge/normalize data correctly
  - [ ] 8.6 Test WebSocket reconnects after simulated disconnect
  - [ ] 8.7 Run `pnpm typecheck` and `pnpm lint` without errors

## Dev Notes

### Architecture Alignment

This story implements the "Apollo Client Configuration" section from the Architecture document and Tech Spec Epic 1.

**Referenced Architecture Sections:**
- Real-time Chat Integration (Section 7)
- State Management (Section 4)
- GraphQL & API Communication (Section 6)

**Key Architecture Decisions:**
- Apollo Client 4 with `@apollo/client-integration-nextjs` for App Router compatibility
- Split link architecture: HTTP for queries/mutations, WebSocket for subscriptions
- `graphql-ws` client for GraphQL subscriptions over Action Cable transport
- InMemoryCache with custom type policies for normalized caching
- JWT stored in memory (not localStorage) for security

### Apollo Client Interfaces

```typescript
// lib/apollo/client.ts - Public Interface
/**
 * Creates and configures an Apollo Client instance with HTTP and WebSocket links.
 * Includes InMemoryCache with type policies for OnboardingSession, Message, and TherapistMatch.
 *
 * @returns Configured ApolloClient instance
 */
export function makeClient(): ApolloClient<NormalizedCacheObject>;

// lib/apollo/provider.tsx - Provider Component
/**
 * Apollo Provider wrapper component for Next.js App Router.
 * Uses ApolloNextAppProvider for SSR/CSR compatibility.
 *
 * @param children - React children to wrap with Apollo context
 */
export function ApolloWrapper({ children }: { children: React.ReactNode }): JSX.Element;

// lib/apollo/links.ts - Link Factory
/**
 * Creates an HTTP link for GraphQL queries and mutations.
 * Includes authorization header middleware.
 *
 * @param uri - GraphQL endpoint URL
 * @returns Configured HttpLink instance
 */
export function createHttpLink(uri: string): HttpLink;

/**
 * Creates a WebSocket link for GraphQL subscriptions.
 * Configured with exponential backoff reconnection logic.
 *
 * @param uri - WebSocket endpoint URL
 * @returns Configured GraphQLWsLink instance
 */
export function createWsLink(uri: string): GraphQLWsLink;

/**
 * Creates a split link that routes operations based on type.
 * Subscriptions -> WebSocket, Queries/Mutations -> HTTP.
 *
 * @param httpLink - HTTP link instance
 * @param wsLink - WebSocket link instance
 * @returns Configured split ApolloLink
 */
export function createSplitLink(httpLink: HttpLink, wsLink: GraphQLWsLink): ApolloLink;
```

### Type Policies

From Architecture and Tech Spec:

```typescript
// lib/apollo/client.ts
const typePolicies = {
  OnboardingSession: {
    keyFields: ['id'],
    fields: {
      assessment: {
        merge: true,  // Merge assessment updates instead of replacing
      },
    },
  },
  Message: {
    keyFields: ['id'],  // Normalize messages by ID
  },
  TherapistMatch: {
    keyFields: ['therapistId'],  // Normalize therapist matches by therapistId
  },
};
```

**Type Policy Rationale:**
- **OnboardingSession:** Sessions are uniquely identified by `id`. Assessment data merges on updates to preserve conversation history.
- **Message:** Chat messages are uniquely identified by `id` for efficient cache updates during subscriptions.
- **TherapistMatch:** Therapist matches are uniquely identified by `therapistId` to prevent duplicate entries in match lists.

### WebSocket Reconnection Strategy

Per Architecture Pre-mortem (R-002: Network instability):

```typescript
// graphql-ws client configuration
const wsClient = createClient({
  url: process.env.NEXT_PUBLIC_WS_ENDPOINT!,
  connectionParams: () => ({
    token: getAuthToken(),
  }),
  retryAttempts: Infinity,
  shouldRetry: () => true,
  retryWait: async (retries) => {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
    const delay = Math.min(1000 * Math.pow(2, retries), 30000);
    await new Promise(resolve => setTimeout(resolve, delay));
  },
});
```

### Security Notes

- JWT token stored in memory (via React Context) to prevent XSS attacks
- No tokens in localStorage or sessionStorage
- Authorization header only included when token is available
- WebSocket connection params include token for authenticated subscriptions

### References

- [Source: docs/architecture.md#Real-time-Chat-Integration]
- [Source: docs/frontend-technical-spec.md#Real-time-Chat-Integration]
- [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Story-1.4]
- [Source: docs/epics.md#Story-1.4]
- [Apollo Client Next.js Integration Docs](https://www.apollographql.com/docs/react/integrations/nextjs)
- [graphql-ws Documentation](https://github.com/enisdenjo/graphql-ws)
- [Action Cable GraphQL Guide](docs/backend-graphql-subscriptions-guide.md)

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
