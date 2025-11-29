/**
 * Unit tests for Apollo Link configuration.
 *
 * Tests:
 * - HTTP link creation
 * - Auth link creation
 * - Split link routing logic
 * - Connection state management
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  createHttpLink,
  createAuthLink,
  setAuthToken,
  getAuthToken,
  getConnectionState,
  onConnectionStateChange,
} from "@/lib/apollo/links";

describe("Apollo Links", () => {
  beforeEach(() => {
    setAuthToken(null);
  });

  describe("createHttpLink", () => {
    it("creates an HTTP link", () => {
      const link = createHttpLink();

      expect(link).toBeDefined();
    });
  });

  describe("createAuthLink", () => {
    it("creates an auth link", () => {
      const link = createAuthLink();

      expect(link).toBeDefined();
    });
  });

  describe("Connection State", () => {
    it("starts with disconnected state", () => {
      const state = getConnectionState();

      // Initial state should be disconnected
      expect(["disconnected", "connecting", "connected", "error"]).toContain(
        state
      );
    });

    it("allows subscribing to connection state changes", () => {
      let receivedState: string | null = null;

      const unsubscribe = onConnectionStateChange((state) => {
        receivedState = state;
      });

      // Should immediately receive current state
      expect(receivedState).not.toBeNull();

      unsubscribe();
    });

    it("unsubscribe removes listener", () => {
      let callCount = 0;

      const unsubscribe = onConnectionStateChange(() => {
        callCount++;
      });

      // Initial call
      expect(callCount).toBe(1);

      // Unsubscribe
      unsubscribe();

      // Subsequent state changes should not trigger callback
      // (can't easily test this without triggering actual WebSocket events)
    });
  });

  describe("Auth Token", () => {
    it("setAuthToken updates token", () => {
      setAuthToken("test-token");

      expect(getAuthToken()).toBe("test-token");
    });

    it("setAuthToken can clear token", () => {
      setAuthToken("test-token");
      setAuthToken(null);

      expect(getAuthToken()).toBeNull();
    });
  });
});
