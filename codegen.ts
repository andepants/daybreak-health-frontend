/**
 * GraphQL Code Generator configuration.
 * Generates TypeScript types and React Apollo hooks from GraphQL schema and operations.
 */
import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: './docs/sprint-artifacts/api_schema.graphql',
  documents: ['features/**/*.graphql', 'graphql/**/*.graphql'],
  generates: {
    './types/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        withHooks: true,
        withHOC: false,
        withComponent: false,
        skipTypename: false,
        dedupeFragments: true,
      },
    },
  },
  ignoreNoDocuments: true,
}

export default config
