/**
 * Apollo Client Configuration
 *
 * Creates and configures Apollo Client with HTTP and WebSocket links.
 * Includes InMemoryCache with type policies for OnboardingSession,
 * Message, and TherapistMatch types.
 */
import { ApolloClient, InMemoryCache, type NormalizedCacheObject } from "@apollo/client";
import {
  createHttpLink,
  createAuthLink,
  createWsLink,
  createSplitLink,
} from "./links";

/**
 * Cache type policies for normalized data management.
 *
 * - OnboardingSession: Keyed by id, assessment fields merge on update
 * - Message: Keyed by id for efficient cache updates during subscriptions
 * - TherapistMatch: Keyed by therapistId to prevent duplicate entries
 */
const typePolicies = {
  OnboardingSession: {
    keyFields: ["id"],
    fields: {
      assessment: {
        merge: true, // Merge assessment updates instead of replacing
      },
    },
  },
  Message: {
    keyFields: ["id"], // Normalize messages by ID
  },
  TherapistMatch: {
    keyFields: ["therapistId"], // Normalize therapist matches by therapistId
  },
};

/**
 * Creates a configured Apollo Client instance.
 *
 * Features:
 * - HTTP link for queries and mutations
 * - WebSocket link for subscriptions (graphql-ws)
 * - Split link to route operations appropriately
 * - Authorization header middleware
 * - InMemoryCache with custom type policies
 *
 * @returns Configured ApolloClient instance
 */
export function makeClient() {
  // Create HTTP link with auth middleware
  const httpLink = createAuthLink().concat(createHttpLink());

  // Create WebSocket link for subscriptions
  // Only create in browser environment
  const isBrowser = typeof window !== "undefined";

  // Build final link
  let link = httpLink;

  if (isBrowser) {
    const wsLink = createWsLink();
    link = createSplitLink(httpLink, wsLink);
  }

  // Create cache with type policies
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

// Re-export link utilities for external use
export {
  setAuthToken,
  getAuthToken,
  onConnectionStateChange,
  getConnectionState,
  reconnectWebSocket,
  getGraphQLEndpoint,
  getWebSocketEndpoint,
  getApiInfo,
} from "./links";
export type { ConnectionState, ConnectionStateCallback, ApiTarget, ApiInfo } from "./links";
