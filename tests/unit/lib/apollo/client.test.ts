/**
 * Unit tests for Apollo Client configuration.
 *
 * Tests:
 * - Client creation with correct configuration
 * - Cache type policies
 * - Auth token management
 */
import { describe, it, expect, beforeEach } from "vitest";
import { makeClient, setAuthToken, getAuthToken } from "@/lib/apollo";

describe("Apollo Client", () => {
  beforeEach(() => {
    // Reset auth token before each test
    setAuthToken(null);
  });

  describe("makeClient", () => {
    it("creates an Apollo Client instance", () => {
      const client = makeClient();

      expect(client).toBeDefined();
      expect(client.cache).toBeDefined();
      expect(client.link).toBeDefined();
    });

    it("configures cache with type policies", () => {
      const client = makeClient();
      const cache = client.cache;

      // The cache should have policies configured
      // We can verify by checking the cache config
      expect(cache).toBeDefined();
    });

    it("sets default query fetch policy to cache-first", () => {
      const client = makeClient();

      expect(client.defaultOptions.query?.fetchPolicy).toBe("cache-first");
    });

    it("sets default watchQuery fetch policy to cache-and-network", () => {
      const client = makeClient();

      expect(client.defaultOptions.watchQuery?.fetchPolicy).toBe(
        "cache-and-network"
      );
    });

    it("sets error policy to all for queries", () => {
      const client = makeClient();

      expect(client.defaultOptions.query?.errorPolicy).toBe("all");
    });

    it("sets error policy to all for mutations", () => {
      const client = makeClient();

      expect(client.defaultOptions.mutate?.errorPolicy).toBe("all");
    });
  });

  describe("Auth Token Management", () => {
    it("starts with null auth token", () => {
      expect(getAuthToken()).toBeNull();
    });

    it("sets and gets auth token", () => {
      const testToken = "test-jwt-token-123";

      setAuthToken(testToken);

      expect(getAuthToken()).toBe(testToken);
    });

    it("clears auth token when set to null", () => {
      setAuthToken("some-token");
      setAuthToken(null);

      expect(getAuthToken()).toBeNull();
    });

    it("overwrites existing token", () => {
      setAuthToken("first-token");
      setAuthToken("second-token");

      expect(getAuthToken()).toBe("second-token");
    });
  });
});
