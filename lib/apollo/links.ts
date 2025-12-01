/**
 * Apollo Link Configuration
 *
 * Creates and configures Apollo links for HTTP queries/mutations and
 * WebSocket subscriptions. Includes authorization header middleware,
 * file upload support via apollo-upload-client, and exponential backoff
 * reconnection for WebSocket connections.
 *
 * Environment Configuration:
 * - NEXT_PUBLIC_API_TARGET: 'local' | 'aptible' (defaults to 'aptible' in production)
 * - Local: localhost:3000 (Rails backend)
 * - Aptible: app-98507.on-aptible.com (production backend)
 */
import { HttpLink, ApolloLink, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient, type Client } from "graphql-ws";
// apollo-upload-client v19 exports default
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";

/**
 * Determines the GraphQL HTTP endpoint based on environment configuration.
 * In production (NODE_ENV === 'production'), always uses Aptible.
 * In development, uses Next.js proxy (/api/graphql) to avoid CORS issues.
 *
 * @returns GraphQL HTTP endpoint URL
 */
export function getGraphQLEndpoint(): string {
  const isProduction = process.env.NODE_ENV === "production";

  // Production always uses Aptible directly
  if (isProduction) {
    return (
      process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT_APTIBLE ||
      "https://app-98507.on-aptible.com/graphql"
    );
  }

  // Development: use Next.js proxy to avoid CORS issues
  // The proxy is configured in next.config.ts to forward to the backend
  return "/api/graphql";
}

/**
 * Determines the WebSocket endpoint based on environment configuration.
 * In production (NODE_ENV === 'production'), always uses Aptible.
 * In development, uses NEXT_PUBLIC_API_TARGET to switch between local and Aptible.
 *
 * @returns WebSocket endpoint URL
 */
export function getWebSocketEndpoint(): string {
  const isProduction = process.env.NODE_ENV === "production";
  const apiTarget = process.env.NEXT_PUBLIC_API_TARGET || "local";

  // Production always uses Aptible
  if (isProduction) {
    return (
      process.env.NEXT_PUBLIC_WS_ENDPOINT_APTIBLE ||
      "wss://app-98507.on-aptible.com/cable"
    );
  }

  // Development: switch based on API_TARGET
  if (apiTarget === "aptible") {
    return (
      process.env.NEXT_PUBLIC_WS_ENDPOINT_APTIBLE ||
      "wss://app-98507.on-aptible.com/cable"
    );
  }

  return (
    process.env.NEXT_PUBLIC_WS_ENDPOINT_LOCAL || "ws://localhost:3000/cable"
  );
}

/**
 * In-memory token cache for fast access.
 * Token is also persisted in localStorage for recovery after page refresh.
 */
let authToken: string | null = null;

/**
 * localStorage key for persisting auth token
 */
const AUTH_TOKEN_KEY = "daybreak_auth_token";

/**
 * Sets the authentication token for API requests.
 * Stores in both memory (for fast access) and localStorage (for persistence).
 * @param token - JWT token or null to clear
 */
export function setAuthToken(token: string | null): void {
  authToken = token;

  // Persist to localStorage for recovery after page refresh
  if (typeof window !== "undefined") {
    try {
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    } catch (err) {
      console.warn("Failed to persist auth token to localStorage:", err);
    }
  }
}

/**
 * Gets the current authentication token.
 * First checks in-memory cache, then falls back to localStorage.
 * @returns Current JWT token or null
 */
export function getAuthToken(): string | null {
  // Return cached token if available
  if (authToken) {
    return authToken;
  }

  // Try to recover from localStorage
  if (typeof window !== "undefined") {
    try {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (storedToken) {
        // Cache it in memory for future calls
        authToken = storedToken;
        return storedToken;
      }
    } catch (err) {
      console.warn("Failed to retrieve auth token from localStorage:", err);
    }
  }

  return null;
}

/**
 * Creates an HTTP link for GraphQL queries and mutations.
 * Uses UploadHttpLink from apollo-upload-client to support file uploads.
 * Uses getGraphQLEndpoint() to determine the correct endpoint based on environment.
 *
 * @returns Configured upload-enabled ApolloLink instance
 */
export function createHttpLink(): ApolloLink {
  const uri = getGraphQLEndpoint();

  // Use UploadHttpLink for multipart file upload support
  // This is backwards compatible with regular HTTP requests
  return new UploadHttpLink({
    uri,
    credentials: "include",
    headers: {
      "Apollo-Require-Preflight": "true",
    },
  }) as unknown as ApolloLink;
}

/**
 * Creates authorization context middleware.
 * Attaches Bearer token to requests when available.
 *
 * @returns ApolloLink with authorization header middleware
 */
export function createAuthLink(): ApolloLink {
  return setContext((_, { headers }) => {
    const token = getAuthToken();

    return {
      headers: {
        ...headers,
        ...(token && { authorization: `Bearer ${token}` }),
      },
    };
  });
}

/**
 * WebSocket client instance for subscription management.
 * Stored at module level for connection state tracking.
 */
let wsClient: Client | null = null;

/**
 * Connection state for WebSocket monitoring
 */
export type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

/**
 * Connection state change callback type
 */
export type ConnectionStateCallback = (state: ConnectionState) => void;

/**
 * Registered connection state listeners
 */
const connectionListeners: Set<ConnectionStateCallback> = new Set();

/**
 * Current connection state
 */
let currentConnectionState: ConnectionState = "disconnected";

/**
 * Notifies all registered listeners of connection state changes
 */
function notifyConnectionChange(state: ConnectionState): void {
  currentConnectionState = state;
  connectionListeners.forEach((listener) => listener(state));
}

/**
 * Registers a callback for connection state changes
 * @param callback - Function to call on state change
 * @returns Cleanup function to unregister the callback
 */
export function onConnectionStateChange(
  callback: ConnectionStateCallback
): () => void {
  connectionListeners.add(callback);
  // Immediately notify of current state
  callback(currentConnectionState);

  return () => {
    connectionListeners.delete(callback);
  };
}

/**
 * Gets the current WebSocket connection state
 * @returns Current connection state
 */
export function getConnectionState(): ConnectionState {
  return currentConnectionState;
}

/**
 * Creates a WebSocket link for GraphQL subscriptions using graphql-ws.
 * Uses getWebSocketEndpoint() to determine the correct endpoint based on environment.
 * Configured with exponential backoff reconnection (1s, 2s, 4s, max 30s).
 *
 * @returns Configured GraphQLWsLink instance
 */
export function createWsLink(): GraphQLWsLink {
  const wsEndpoint = getWebSocketEndpoint();

  wsClient = createClient({
    url: wsEndpoint,
    connectionParams: () => {
      const token = getAuthToken();
      return token ? { token } : {};
    },
    retryAttempts: Infinity,
    shouldRetry: () => true,
    retryWait: async (retries) => {
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
      const delay = Math.min(1000 * Math.pow(2, retries), 30000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    },
    on: {
      connecting: () => {
        notifyConnectionChange("connecting");
      },
      connected: () => {
        notifyConnectionChange("connected");
      },
      closed: () => {
        notifyConnectionChange("disconnected");
      },
      error: () => {
        notifyConnectionChange("error");
      },
    },
    lazy: true,
  });

  return new GraphQLWsLink(wsClient);
}

/**
 * Manually triggers WebSocket reconnection
 * Useful for user-initiated reconnection after errors
 */
export function reconnectWebSocket(): void {
  if (wsClient) {
    // Dispose and let the lazy connection re-establish
    wsClient.dispose();
    // Reset state - next subscription will trigger reconnect
    notifyConnectionChange("connecting");
  }
}

/**
 * Creates a split link that routes operations based on type.
 * Subscriptions go to WebSocket, queries/mutations go to HTTP.
 *
 * @param httpLink - HTTP link for queries/mutations
 * @param wsLink - WebSocket link for subscriptions
 * @returns Configured split ApolloLink
 */
export function createSplitLink(
  httpLink: ApolloLink,
  wsLink: GraphQLWsLink
): ApolloLink {
  return split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    httpLink
  );
}

/**
 * API target type for environment configuration
 */
export type ApiTarget = "local" | "aptible";

/**
 * API configuration info for debugging and display
 */
export interface ApiInfo {
  target: ApiTarget;
  graphqlEndpoint: string;
  wsEndpoint: string;
  isProduction: boolean;
}

/**
 * Gets current API configuration info.
 * Useful for debugging and displaying connection status.
 *
 * @returns Current API configuration
 */
export function getApiInfo(): ApiInfo {
  const isProduction = process.env.NODE_ENV === "production";
  const target = isProduction
    ? "aptible"
    : ((process.env.NEXT_PUBLIC_API_TARGET || "local") as ApiTarget);

  return {
    target,
    graphqlEndpoint: getGraphQLEndpoint(),
    wsEndpoint: getWebSocketEndpoint(),
    isProduction,
  };
}
