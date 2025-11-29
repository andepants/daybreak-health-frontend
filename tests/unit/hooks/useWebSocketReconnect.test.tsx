/**
 * Unit tests for useWebSocketReconnect hook.
 *
 * Tests:
 * - Connection state tracking
 * - Boolean state helpers
 * - Reconnect function
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Track mock state
let mockConnectionState: "connecting" | "connected" | "disconnected" | "error" =
  "disconnected";
const mockListeners = new Set<(state: string) => void>();
const mockReconnect = vi.fn();

// Mock the apollo module
vi.mock("@/lib/apollo", () => ({
  getConnectionState: () => mockConnectionState,
  onConnectionStateChange: (callback: (state: string) => void) => {
    mockListeners.add(callback);
    callback(mockConnectionState);
    return () => {
      mockListeners.delete(callback);
    };
  },
  reconnectWebSocket: () => {
    mockReconnect();
    mockConnectionState = "connecting";
    mockListeners.forEach((cb) => cb(mockConnectionState));
  },
}));

// Import after mock is set up
import { useWebSocketReconnect } from "@/hooks/useWebSocketReconnect";

describe("useWebSocketReconnect", () => {
  beforeEach(() => {
    mockConnectionState = "disconnected";
    mockListeners.clear();
    mockReconnect.mockClear();
  });

  it("returns initial connection state", () => {
    const { result } = renderHook(() => useWebSocketReconnect());

    expect(result.current.connectionState).toBe("disconnected");
  });

  it("provides isConnected boolean", () => {
    const { result } = renderHook(() => useWebSocketReconnect());

    expect(typeof result.current.isConnected).toBe("boolean");
    expect(result.current.isConnected).toBe(false);
  });

  it("provides isConnecting boolean", () => {
    mockConnectionState = "connecting";
    const { result } = renderHook(() => useWebSocketReconnect());

    expect(typeof result.current.isConnecting).toBe("boolean");
    expect(result.current.isConnecting).toBe(true);
  });

  it("provides isDisconnected boolean", () => {
    const { result } = renderHook(() => useWebSocketReconnect());

    expect(typeof result.current.isDisconnected).toBe("boolean");
    expect(result.current.isDisconnected).toBe(true);
  });

  it("provides hasError boolean", () => {
    mockConnectionState = "error";
    const { result } = renderHook(() => useWebSocketReconnect());

    expect(typeof result.current.hasError).toBe("boolean");
    expect(result.current.hasError).toBe(true);
  });

  it("provides reconnect function", () => {
    const { result } = renderHook(() => useWebSocketReconnect());

    expect(typeof result.current.reconnect).toBe("function");
  });

  it("reconnect function triggers reconnection", () => {
    const { result } = renderHook(() => useWebSocketReconnect());

    act(() => {
      result.current.reconnect();
    });

    expect(mockReconnect).toHaveBeenCalled();
  });

  it("isConnected is true when connected", () => {
    mockConnectionState = "connected";
    const { result } = renderHook(() => useWebSocketReconnect());

    expect(result.current.isConnected).toBe(true);
    expect(result.current.isDisconnected).toBe(false);
  });
});
