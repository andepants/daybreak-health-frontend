/**
 * Apollo Link Configuration
 *
 * Creates and configures Apollo links for HTTP queries/mutations and
 * WebSocket subscriptions. Includes authorization header middleware
 * and exponential backoff reconnection for WebSocket connections.
 */
import { HttpLink, ApolloLink, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient, type Client } from "graphql-ws";

/**
 * In-memory token storage for secure JWT handling.
 * Tokens should NOT be stored in localStorage/sessionStorage.
 */
let authToken: string | null = null;

/**
 * Sets the authentication token for API requests
 * @param token - JWT token or null to clear
 */
export function setAuthToken(token: string | null): void {
  authToken = token;
}

/**
 * Gets the current authentication token
 * @returns Current JWT token or null
 */
export function getAuthToken(): string | null {
  return authToken;
}

/**
 * Creates an HTTP link for GraphQL queries and mutations.
 * Reads endpoint from NEXT_PUBLIC_GRAPHQL_ENDPOINT environment variable.
 *
 * @returns Configured HttpLink instance
 */
export function createHttpLink(): HttpLink {
  const uri = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "/graphql";

  return new HttpLink({
    uri,
    credentials: "include",
  });
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
 * Configured with exponential backoff reconnection (1s, 2s, 4s, max 30s).
 *
 * @returns Configured GraphQLWsLink instance
 */
export function createWsLink(): GraphQLWsLink {
  const wsEndpoint =
    process.env.NEXT_PUBLIC_WS_ENDPOINT || "ws://localhost:3000/cable";

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
