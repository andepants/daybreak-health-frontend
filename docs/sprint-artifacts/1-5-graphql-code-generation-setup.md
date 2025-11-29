# Story 1.5: GraphQL Code Generation Setup

Status: review

## Story

As a **developer**,
I want **GraphQL Code Generator configured to auto-generate TypeScript types and React hooks from GraphQL operations**,
so that **I have type-safe, auto-generated Apollo hooks for all queries, mutations, and subscriptions**.

## Acceptance Criteria

1. **AC-1.5.1:** codegen.ts configuration created - File exists with correct plugins
2. **AC-1.5.2:** TypeScript types generated - `types/graphql.ts` created
3. **AC-1.5.3:** React hooks generated for queries - `useGetOnboardingSessionQuery` available
4. **AC-1.5.4:** React hooks generated for mutations - Mutation hooks available
5. **AC-1.5.5:** React hooks generated for subscriptions - Subscription hooks available
6. **AC-1.5.6:** `pnpm codegen` script works - Runs without errors
7. **AC-1.5.7:** `pnpm codegen:watch` script works - Watch mode starts
8. **AC-1.5.8:** Sample operations validate setup - Sample query generates correct types

## Tasks / Subtasks

- [x] Task 1: Create codegen.ts configuration file (AC: 1, 2)
  - [x] 1.1 Create `codegen.ts` in project root
  - [x] 1.2 Import `CodegenConfig` type from `@graphql-codegen/cli`
  - [x] 1.3 Configure schema path to point to `docs/sprint-artifacts/api_schema.graphql`
  - [x] 1.4 Set generates output path to `types/graphql.ts`
  - [x] 1.5 Verify file structure matches architecture standards

- [x] Task 2: Configure TypeScript base type generation (AC: 2)
  - [x] 2.1 Add `typescript` plugin to generates config
  - [x] 2.2 Add `typescript-operations` plugin for operation types
  - [x] 2.3 Configure plugin options (avoidOptionals, scalars mapping)
  - [x] 2.4 Set enumsAsTypes to true for better TypeScript integration

- [x] Task 3: Configure React Apollo hooks generation (AC: 3, 4, 5)
  - [x] 3.1 Add `typescript-react-apollo` plugin to config
  - [x] 3.2 Configure withHooks: true
  - [x] 3.3 Configure withComponent: false (hooks only, no HOCs)
  - [x] 3.4 Configure withHOC: false
  - [x] 3.5 Set apolloReactCommonImportFrom to '@apollo/client'

- [x] Task 4: Set up documents glob patterns (AC: 8)
  - [x] 4.1 Configure documents glob: `graphql/**/*.graphql`
  - [x] 4.2 Add additional pattern: `features/**/*.graphql`
  - [x] 4.3 Add pattern: `app/**/*.graphql`
  - [x] 4.4 Verify glob patterns will capture all operation files

- [x] Task 5: Create sample GraphQL operations for testing (AC: 8)
  - [x] 5.1 Create `graphql/` directory in project root
  - [x] 5.2 Create `graphql/queries/GetOnboardingSession.graphql`
  - [x] 5.3 Write sample query with sessionId variable
  - [x] 5.4 Create `graphql/mutations/StartOnboarding.graphql` and `SubmitAssessmentMessage.graphql`
  - [x] 5.5 Create `graphql/subscriptions/SupportChatMessages.graphql`

- [x] Task 6: Add codegen npm scripts (AC: 6, 7)
  - [x] 6.1 Add `"codegen": "graphql-codegen --config codegen.ts"` to package.json scripts
  - [x] 6.2 Add `"codegen:watch": "graphql-codegen --config codegen.ts --watch"` to package.json
  - [x] 6.3 Verify scripts are callable via pnpm

- [x] Task 7: Run initial code generation (AC: 2, 3, 4, 5, 8)
  - [x] 7.1 Run `pnpm codegen` for first time
  - [x] 7.2 Verify `types/graphql.ts` is created
  - [x] 7.3 Verify file contains TypeScript interfaces for schema types
  - [x] 7.4 Verify file contains generated React hooks (useGetOnboardingSessionQuery)
  - [x] 7.5 Check for any codegen warnings or errors

- [x] Task 8: Verify generated types integrate with Apollo Client (AC: 3, 4, 5)
  - [x] 8.1 Import `useGetOnboardingSessionQuery` in a test file
  - [x] 8.2 Verify TypeScript recognizes the hook signature
  - [x] 8.3 Verify hook returns properly typed data, loading, error
  - [x] 8.4 Check that variables are properly typed
  - [x] 8.5 Verify hook integrates with Apollo Client configuration from Story 1.4

- [x] Task 9: Document codegen workflow (AC: all)
  - [x] 9.1 Add comments to codegen.ts explaining configuration
  - [x] 9.2 Document where to place new .graphql files
  - [x] 9.3 Note that codegen must run after schema changes
  - [x] 9.4 Document watch mode for development

## Dev Notes

### Architecture Alignment

This story implements the "GraphQL Code Generation" section from the Architecture document and completes the API integration infrastructure started in Story 1.4.

**Key Architecture References:**
- Code generation ensures end-to-end type safety from GraphQL schema to React components
- Generated hooks integrate seamlessly with Apollo Client configured in Story 1.4
- Type policies from Apollo cache configuration work with generated types
- Supports queries (HTTP), mutations (HTTP), and subscriptions (WebSocket)

**From Tech Spec:**
- Depends on Story 1.4 (Apollo Client must be configured first)
- Generates types for all GraphQL operations used in the application
- Automatically creates React hooks that wrap Apollo's `useQuery`, `useMutation`, `useSubscription`

### Codegen Configuration

**Sample codegen.ts structure:**

```typescript
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'docs/sprint-artifacts/api_schema.graphql',
  documents: [
    'graphql/**/*.graphql',
    'features/**/*.graphql',
    'app/**/*.graphql',
  ],
  generates: {
    'types/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        withHooks: true,
        withComponent: false,
        withHOC: false,
        apolloReactCommonImportFrom: '@apollo/client',
        enumsAsTypes: true,
        avoidOptionals: {
          field: true,
          inputValue: false,
          object: false,
        },
        scalars: {
          DateTime: 'string',
          JSON: 'Record<string, any>',
        },
      },
    },
  },
};

export default config;
```

**Plugin Purposes:**
- `typescript`: Generates TypeScript types for GraphQL schema types
- `typescript-operations`: Generates types for GraphQL operations (queries, mutations, subscriptions)
- `typescript-react-apollo`: Generates React hooks that use Apollo Client

**Key Configuration Options:**
- `withHooks: true` - Generate React hooks (useQuery, useMutation, useSubscription wrappers)
- `withComponent: false` - Don't generate component HOCs (modern hooks approach)
- `enumsAsTypes: true` - Generate TypeScript union types instead of enums
- `avoidOptionals.field: true` - Make response fields non-optional for better type safety
- `scalars` - Map GraphQL custom scalars to TypeScript types

### Sample GraphQL Operations

**GetOnboardingSession Query:**

```graphql
# graphql/queries/GetOnboardingSession.graphql
query GetOnboardingSession($sessionId: ID!) {
  onboardingSession(id: $sessionId) {
    id
    status
    currentStep
    assessment {
      responses
      completedAt
    }
  }
}
```

This generates:
- `GetOnboardingSessionQuery` - TypeScript type for response
- `GetOnboardingSessionQueryVariables` - TypeScript type for variables
- `useGetOnboardingSessionQuery` - React hook

**Usage Example:**

```typescript
import { useGetOnboardingSessionQuery } from '@/types/graphql';

function OnboardingPage({ sessionId }: { sessionId: string }) {
  const { data, loading, error } = useGetOnboardingSessionQuery({
    variables: { sessionId },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return <div>{data?.onboardingSession?.status}</div>;
}
```

### Development Workflow

1. **Add new GraphQL operation:** Create `.graphql` file in `graphql/queries/`, `graphql/mutations/`, or `graphql/subscriptions/`
2. **Run codegen:** `pnpm codegen` or use watch mode `pnpm codegen:watch`
3. **Import generated hook:** Use the auto-generated hook in your component
4. **TypeScript validation:** TypeScript will validate operation variables and response types

**Watch Mode Best Practice:**
- Run `pnpm codegen:watch` in a separate terminal during development
- Types regenerate automatically when .graphql files change
- No need to manually run codegen after each operation change

### References

- [GraphQL Code Generator Documentation](https://the-guild.dev/graphql/codegen)
- [typescript-react-apollo Plugin](https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-react-apollo)
- [Source: docs/architecture.md#GraphQL-Code-Generation]
- [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Story-1.5]
- [Apollo Client Integration (Story 1.4)](./1-4-apollo-client-configuration.md)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude claude-opus-4-5-20251101

### Debug Log References

### Completion Notes List

- Updated codegen.ts with proper configuration and documentation
- Created 5 sample GraphQL operations (2 queries, 2 mutations, 1 subscription)
- Successfully ran pnpm codegen - all hooks generated
- Generated hooks: 9 total (3 query variants x 2 + 2 mutations + 1 subscription)
- All 79 tests pass including 16 new codegen verification tests
- Lint passes with no errors

### File List

- codegen.ts (modified - added documentation and improved config)
- graphql/queries/GetOnboardingSession.graphql (new)
- graphql/queries/GetCurrentUser.graphql (new)
- graphql/mutations/StartOnboarding.graphql (new)
- graphql/mutations/SubmitAssessmentMessage.graphql (new)
- graphql/subscriptions/SupportChatMessages.graphql (new)
- types/graphql.ts (regenerated - now includes operation types and hooks)
- tests/unit/lib/graphql/codegen.test.ts (new)
- docs/sprint-artifacts/sprint-status.yaml (modified)

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-11-29 | Story drafted from tech spec and epics | SM Agent (Bob) |
| 2025-11-29 | Story implementation complete - codegen configured, 79 tests passing | Dev Agent (Amelia) |
