/**
 * Apollo Client Exports
 *
 * Central export point for Apollo client configuration and utilities.
 */

// Client factory
export { makeClient } from "./client";

// Provider component
export { ApolloWrapper } from "./provider";

// Auth token management
export { setAuthToken, getAuthToken } from "./client";

// WebSocket connection management
export {
  onConnectionStateChange,
  getConnectionState,
  reconnectWebSocket,
} from "./client";

// Types
export type { ConnectionState, ConnectionStateCallback } from "./client";
