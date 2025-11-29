/**
 * Apollo Provider Component
 *
 * Wraps the application with ApolloProvider for GraphQL access.
 * Uses standard Apollo Client setup for Next.js App Router.
 */
"use client";

import { ApolloClient, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { useMemo } from "react";
import {
  createHttpLink,
  createAuthLink,
  createWsLink,
  createSplitLink,
} from "./links";

/**
 * Props for the ApolloWrapper component
 */
interface ApolloWrapperProps {
  children: React.ReactNode;
}

/**
 * Cache type policies for normalized data management.
 */
const typePolicies = {
  OnboardingSession: {
    keyFields: ["id"],
    fields: {
      assessment: {
        merge: true,
      },
    },
  },
  Message: {
    keyFields: ["id"],
  },
  TherapistMatch: {
    keyFields: ["therapistId"],
  },
};

/**
 * Creates a configured Apollo Client instance for Next.js App Router.
 */
function makeClient() {
  const httpLink = createAuthLink().concat(createHttpLink());
  const isBrowser = typeof window !== "undefined";

  let link = httpLink;

  if (isBrowser) {
    const wsLink = createWsLink();
    link = createSplitLink(httpLink, wsLink);
  }

  const cache = new InMemoryCache({
    typePolicies,
  });

  return new ApolloClient({
    link,
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
      },
      query: {
        fetchPolicy: "cache-first",
        errorPolicy: "all",
      },
      mutate: {
        errorPolicy: "all",
      },
    },
  });
}

/**
 * Apollo Provider wrapper for Next.js App Router.
 *
 * Client is created once and memoized for the component lifetime.
 *
 * @param children - React children to wrap with Apollo context
 */
export function ApolloWrapper({ children }: ApolloWrapperProps) {
  const client = useMemo(() => makeClient(), []);

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}
