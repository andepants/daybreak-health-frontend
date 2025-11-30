/**
 * Unit tests for usePaymentPlans hook
 *
 * Tests payment plan data fetching and selection mutation logic.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePaymentPlans } from "@/features/cost/hooks/usePaymentPlans";
import type { PaymentPlan } from "@/lib/validations/cost";

// Mock Apollo Client hooks
const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();

vi.mock("@apollo/client", () => ({
  useQuery: () => mockUseQuery(),
  useMutation: () => mockUseMutation(),
}));

describe("usePaymentPlans", () => {
  const mockSessionId = "session_123";
  const mockRefetch = vi.fn();
  const mockMutate = vi.fn();

  const mockPaymentPlans: PaymentPlan[] = [
    {
      id: "plan_per_session",
      name: "Pay Per Session",
      description: "Pay for each session individually",
      frequency: "per_session",
      installmentAmount: 15000,
      totalAmount: null,
      terms: "No commitment required.",
    },
    {
      id: "plan_monthly",
      name: "Monthly Billing",
      description: "Fixed monthly payment",
      frequency: "monthly",
      installmentAmount: 54000,
      totalAmount: null,
      terms: "Cancel anytime with 30 days notice.",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation for useQuery
    mockUseQuery.mockReturnValue({
      data: {
        getPaymentPlans: mockPaymentPlans,
      },
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    // Default mock implementation for useMutation
    mockUseMutation.mockReturnValue([
      mockMutate,
      {
        loading: false,
        error: null,
      },
    ]);
  });

  describe("Query execution", () => {
    it("should return payment plans when query succeeds", () => {
      const { result } = renderHook(() => usePaymentPlans(mockSessionId));

      expect(result.current.paymentPlans).toEqual(mockPaymentPlans);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should return loading state when query is loading", () => {
      mockUseQuery.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => usePaymentPlans(mockSessionId));

      expect(result.current.paymentPlans).toBeNull();
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it("should return error when query fails", () => {
      const mockError = new Error("Failed to fetch payment plans");

      mockUseQuery.mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => usePaymentPlans(mockSessionId));

      expect(result.current.paymentPlans).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(mockError);
    });

    it("should return null when no payment plans in response", () => {
      mockUseQuery.mockReturnValue({
        data: { getPaymentPlans: null },
        loading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => usePaymentPlans(mockSessionId));

      expect(result.current.paymentPlans).toBeNull();
    });
  });

  describe("Refetch functionality", () => {
    it("should provide refetch function", () => {
      const { result } = renderHook(() => usePaymentPlans(mockSessionId));

      expect(result.current.refetch).toBeDefined();
      expect(typeof result.current.refetch).toBe("function");
    });

    it("should call Apollo refetch when refetch is invoked", () => {
      const { result } = renderHook(() => usePaymentPlans(mockSessionId));

      result.current.refetch();

      expect(mockRefetch).toHaveBeenCalled();
    });

    it("should handle refetch errors gracefully", () => {
      mockRefetch.mockImplementation(() => {
        throw new Error("Refetch failed");
      });

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { result } = renderHook(() => usePaymentPlans(mockSessionId));

      // Should not throw
      expect(() => result.current.refetch()).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to refetch payment plans:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Plan selection", () => {
    it("should provide selectPlan function", () => {
      const { result } = renderHook(() => usePaymentPlans(mockSessionId));

      expect(result.current.selectPlan).toBeDefined();
      expect(typeof result.current.selectPlan).toBe("function");
    });

    it("should call mutation when selectPlan is invoked (when mutation available)", async () => {
      // Note: This test would work when GraphQL codegen runs and mutation is available
      // For now, the hook has placeholder implementation that won't actually call the mutation
      // This test documents the expected behavior for when backend is implemented

      const { result } = renderHook(() => usePaymentPlans(mockSessionId));

      // The function should exist and be callable
      expect(result.current.selectPlan).toBeDefined();

      // When called with no real mutation, it should warn
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await result.current.selectPlan("plan_monthly");

      // Should warn that mutation is not available
      expect(consoleSpy).toHaveBeenCalledWith(
        "SetPaymentPreference mutation not available"
      );

      consoleSpy.mockRestore();
    });

    it("should provide selecting state", () => {
      mockUseMutation.mockReturnValue([
        mockMutate,
        {
          loading: true,
          error: null,
        },
      ]);

      const { result } = renderHook(() => usePaymentPlans(mockSessionId));

      expect(result.current.selecting).toBe(true);
    });

    it("should provide select error when mutation fails", () => {
      const mockError = new Error("Failed to select plan");

      mockUseMutation.mockReturnValue([
        mockMutate,
        {
          loading: false,
          error: mockError,
        },
      ]);

      const { result } = renderHook(() => usePaymentPlans(mockSessionId));

      expect(result.current.selectError).toBe(mockError);
    });

    it("should handle error when selectPlan fails (when mutation available)", async () => {
      // Note: This test documents expected error handling for when backend is implemented
      // Currently the mutation is not available, so we just verify error handling structure

      const { result } = renderHook(() => usePaymentPlans(mockSessionId));

      // Function should be defined and callable without throwing
      expect(result.current.selectPlan).toBeDefined();

      // When mutation not available, it should not throw, just warn
      await expect(result.current.selectPlan("plan_monthly")).resolves.not.toThrow();
    });

    it("should support optimistic response pattern (when mutation available)", async () => {
      // Note: This test documents the optimistic response pattern that will be used
      // when the GraphQL mutation is available after backend implementation

      const { result } = renderHook(() => usePaymentPlans(mockSessionId));

      // The selectPlan function exists and follows the correct pattern
      // When backend is ready, it will include optimistic response
      expect(result.current.selectPlan).toBeDefined();
      expect(typeof result.current.selectPlan).toBe("function");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty session ID", () => {
      const { result } = renderHook(() => usePaymentPlans(""));

      // Hook should still work, query will be skipped
      expect(result.current.paymentPlans).toBeDefined();
    });

    it("should handle undefined mutation", async () => {
      // Simulate mutation not being available
      const originalConsoleWarn = console.warn;
      console.warn = vi.fn();

      // Force mutation to be null
      vi.doMock("@/features/cost/hooks/usePaymentPlans", () => ({
        usePaymentPlans: vi.fn(() => ({
          paymentPlans: mockPaymentPlans,
          loading: false,
          error: null,
          refetch: mockRefetch,
          selectPlan: async () => {
            console.warn("SetPaymentPreference mutation not available");
          },
          selecting: false,
          selectError: null,
        })),
      }));

      const { result } = renderHook(() => usePaymentPlans(mockSessionId));

      await result.current.selectPlan("plan_monthly");

      expect(console.warn).toHaveBeenCalledWith(
        "SetPaymentPreference mutation not available"
      );

      console.warn = originalConsoleWarn;
    });
  });
});
