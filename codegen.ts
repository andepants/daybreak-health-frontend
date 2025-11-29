/**
 * GraphQL Code Generator Configuration
 *
 * Generates TypeScript types and React Apollo hooks from GraphQL schema and operations.
 *
 * Usage:
 *   pnpm codegen       - Run code generation once
 *   pnpm codegen:watch - Run in watch mode during development
 */
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./docs/sprint-artifacts/api_schema.graphql",
  documents: [
    "graphql/**/*.graphql",
    "features/**/*.graphql",
    "app/**/*.graphql",
  ],
  generates: {
    "./types/graphql.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        withHooks: true,
        withHOC: false,
        withComponent: false,
        // Disable type aliases not exported in Apollo Client 4.x
        withMutationFn: false,
        withResultType: false,
        withMutationOptionsType: false,
        addDocBlocks: false,
        skipTypename: false,
        enumsAsTypes: true,
        // Apollo Client 4.x ESM compatibility with Next.js 16:
        // Import hooks from @apollo/client/react subpath (not main entry)
        apolloReactHooksImportFrom: "@apollo/client/react",
        apolloReactCommonImportFrom: "@apollo/client",
        avoidOptionals: {
          field: true,
          inputValue: false,
          object: false,
        },
        scalars: {
          DateTime: "string",
          JSON: "Record<string, unknown>",
        },
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
