/**
 * Apollo Provider Component
 *
 * Wraps the application with ApolloProvider for GraphQL access.
 * Uses @apollo/client-integration-nextjs for Next.js App Router compatibility.
 */
"use client";

import { ApolloNextAppProvider } from "@apollo/client-integration-nextjs";
import { makeClient } from "./client";

/**
 * Props for the ApolloWrapper component
 */
interface ApolloWrapperProps {
  children: React.ReactNode;
}

/**
 * Apollo Provider wrapper for Next.js App Router.
 *
 * Uses ApolloNextAppProvider for SSR/CSR compatibility.
 * Client is created lazily on first render.
 *
 * @param children - React children to wrap with Apollo context
 */
export function ApolloWrapper({ children }: ApolloWrapperProps) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
