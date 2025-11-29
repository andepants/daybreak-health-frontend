/**
 * WebSocket Reconnection Hook
 *
 * Provides WebSocket connection status and manual reconnection capability.
 * Integrates with Apollo Client's graphql-ws connection management.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  type ConnectionState,
  onConnectionStateChange,
  getConnectionState,
  reconnectWebSocket,
} from "@/lib/apollo";

/**
 * Return type for the useWebSocketReconnect hook
 */
interface UseWebSocketReconnectReturn {
  /** Current connection state */
  connectionState: ConnectionState;
  /** Whether the WebSocket is currently connected */
  isConnected: boolean;
  /** Whether the WebSocket is currently connecting */
  isConnecting: boolean;
  /** Whether the WebSocket is disconnected */
  isDisconnected: boolean;
  /** Whether there was a connection error */
  hasError: boolean;
  /** Manually trigger reconnection */
  reconnect: () => void;
}

/**
 * Hook to monitor and control WebSocket connection status.
 *
 * Provides:
 * - Real-time connection state (connecting, connected, disconnected, error)
 * - Boolean helpers for common state checks
 * - Manual reconnection function
 *
 * @returns Connection state and control functions
 *
 * @example
 * ```tsx
 * function ChatComponent() {
 *   const { isConnected, isConnecting, reconnect } = useWebSocketReconnect();
 *
 *   if (isConnecting) return <p>Connecting...</p>;
 *   if (!isConnected) {
 *     return (
 *       <div>
 *         <p>Disconnected</p>
 *         <button onClick={reconnect}>Reconnect</button>
 *       </div>
 *     );
 *   }
 *
 *   return <Chat />;
 * }
 * ```
 */
export function useWebSocketReconnect(): UseWebSocketReconnectReturn {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    () => getConnectionState()
  );

  useEffect(() => {
    // Subscribe to connection state changes
    const unsubscribe = onConnectionStateChange((state) => {
      setConnectionState(state);
    });

    return unsubscribe;
  }, []);

  const reconnect = useCallback(() => {
    reconnectWebSocket();
  }, []);

  return {
    connectionState,
    isConnected: connectionState === "connected",
    isConnecting: connectionState === "connecting",
    isDisconnected: connectionState === "disconnected",
    hasError: connectionState === "error",
    reconnect,
  };
}
