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
        enumsAsTypes: true,
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
