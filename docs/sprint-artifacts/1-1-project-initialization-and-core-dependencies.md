# Story 1.1: Project Initialization and Core Dependencies

Status: ready-for-dev

## Story

As a **developer**,
I want **a properly configured Next.js 15 project with all core dependencies installed**,
so that **I can begin building features with the correct tooling and type safety**.

## Acceptance Criteria

1. **AC-1.1.1:** Project created with Next.js 15, TypeScript, Tailwind CSS 4, ESLint - `pnpm dev` starts without errors
2. **AC-1.1.2:** shadcn/ui initialized with New York style - `components.json` exists with correct configuration
3. **AC-1.1.3:** Apollo Client 4 with nextjs integration installed - Import `@apollo/client-integration-nextjs` succeeds
4. **AC-1.1.4:** React Hook Form 7 with Zod 3 resolver installed - Import from packages succeeds
5. **AC-1.1.5:** GraphQL Code Generator installed - `pnpm codegen` command exists
6. **AC-1.1.6:** Vitest and Playwright configured - `pnpm test` and `pnpm test:e2e` run
7. **AC-1.1.7:** Project runs on localhost:3000 - Dev server accessible
8. **AC-1.1.8:** Static export configured - `next.config.ts` has `output: 'export'`
9. **AC-1.1.9:** Environment template created - `.env.example` exists with required variables

## Tasks / Subtasks

- [ ] Task 1: Create Next.js 15 project with create-next-app (AC: 1)
  - [ ] 1.1 Run `npx create-next-app@latest daybreak-health-frontend --typescript --tailwind --eslint --app --use-pnpm`
  - [ ] 1.2 Verify project structure created correctly
  - [ ] 1.3 Run `pnpm dev` and confirm localhost:3000 serves

- [ ] Task 2: Initialize shadcn/ui component library (AC: 2)
  - [ ] 2.1 Run `pnpm dlx shadcn@latest init`
  - [ ] 2.2 Select New York style during initialization
  - [ ] 2.3 Verify `components.json` created with correct config
  - [ ] 2.4 Verify `components/ui/` directory structure

- [ ] Task 3: Install Apollo Client and GraphQL dependencies (AC: 3, 5)
  - [ ] 3.1 Run `pnpm add @apollo/client @apollo/client-integration-nextjs graphql graphql-ws`
  - [ ] 3.2 Verify imports work in a test file
  - [ ] 3.3 Install GraphQL Codegen: `pnpm add -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-react-apollo`

- [ ] Task 4: Install form handling dependencies (AC: 4)
  - [ ] 4.1 Run `pnpm add react-hook-form @hookform/resolvers zod`
  - [ ] 4.2 Verify Zod version is 3.x (not 4.x per ADR-004)
  - [ ] 4.3 Verify imports work correctly

- [ ] Task 5: Configure testing framework (AC: 6)
  - [ ] 5.1 Install Vitest: `pnpm add -D vitest @testing-library/react @testing-library/dom jsdom @vitejs/plugin-react`
  - [ ] 5.2 Create `vitest.config.ts` with React plugin and jsdom environment
  - [ ] 5.3 Install Playwright: `pnpm add -D @playwright/test`
  - [ ] 5.4 Create `playwright.config.ts` with basic configuration
  - [ ] 5.5 Add test scripts to package.json

- [ ] Task 6: Configure static export and environment (AC: 7, 8, 9)
  - [ ] 6.1 Update `next.config.ts` with `output: 'export'`
  - [ ] 6.2 Create `.env.example` with NEXT_PUBLIC_GRAPHQL_ENDPOINT and NEXT_PUBLIC_WS_ENDPOINT
  - [ ] 6.3 Create `.env.local` from template (gitignored)
  - [ ] 6.4 Verify `pnpm build` creates `out/` directory

- [ ] Task 7: Create codegen configuration (AC: 5)
  - [ ] 7.1 Create `codegen.ts` with typescript-react-apollo plugin configuration
  - [ ] 7.2 Configure documents glob: `features/**/*.graphql`, `graphql/**/*.graphql`
  - [ ] 7.3 Point schema to `docs/sprint-artifacts/api_schema.graphql`
  - [ ] 7.4 Add `codegen` and `codegen:watch` scripts to package.json
  - [ ] 7.5 Verify `pnpm codegen` runs (may produce warnings without .graphql files yet)

- [ ] Task 8: Verify all scripts work correctly (AC: all)
  - [ ] 8.1 `pnpm dev` starts Turbopack dev server
  - [ ] 8.2 `pnpm build` creates static export
  - [ ] 8.3 `pnpm codegen` runs GraphQL type generation
  - [ ] 8.4 `pnpm test` runs Vitest
  - [ ] 8.5 `pnpm lint` runs ESLint without errors

## Dev Notes

### Architecture Alignment

This story implements the "Project Initialization" section from the Architecture document:

**Required Commands (from Architecture):**
```bash
# Create Next.js 15 project with recommended defaults
npx create-next-app@latest daybreak-health-frontend --typescript --tailwind --eslint --app --use-pnpm

# Initialize shadcn/ui (Tailwind v4 compatible)
pnpm dlx shadcn@latest init

# Install core dependencies
pnpm add @apollo/client @apollo/client-integration-nextjs graphql graphql-ws
pnpm add react-hook-form @hookform/resolvers zod
pnpm add -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-react-apollo
```

**Package Versions (from Architecture Decision Summary):**
| Package | Version | Notes |
|---------|---------|-------|
| Next.js | 15.x | App Router, RSC, Turbopack |
| React | 19.x | Latest features |
| TypeScript | 5.x | End-to-end type safety |
| Apollo Client | 4.x | With nextjs integration |
| Zod | 3.x | v3 for stability (ADR-004) |
| Tailwind CSS | 4.0 | CSS-first config |
| Vitest | 3.x | ESM-native testing |
| Playwright | 1.x | E2E testing |

**Important:** Per ADR-004, use Zod 3.x (not 4.x) due to known issues with React Hook Form integration.

### Project Structure Notes

After initialization, verify these directories/files exist:
- `app/` - Next.js App Router pages
- `components/ui/` - shadcn/ui components
- `public/` - Static assets
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind configuration
- `components.json` - shadcn/ui configuration
- `tsconfig.json` - TypeScript configuration

### Testing Standards

From Architecture:
- Unit tests: Vitest + React Testing Library
- E2E tests: Playwright
- Type checking: GraphQL Codegen validates operations

### References

- [Source: docs/architecture.md#Project-Initialization]
- [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Story-1.1]
- [Source: docs/epics.md#Story-1.1]
- [Source: docs/prd.md#Technology-Stack]

## Dev Agent Record

### Context Reference

- [Story Context XML](./1-1-project-initialization-and-core-dependencies.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-11-29 | Story drafted from tech spec and epics | SM Agent (Bob) |
