/**
 * Unit tests for useCostEstimate hook
 *
 * Tests GraphQL query execution, data transformation, error handling,
 * and cache integration for cost estimation hook.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useQuery } from "@apollo/client/react";
import { useCostEstimate } from "@/features/cost/useCostEstimate";
import type { CostEstimate } from "@/lib/validations/cost";

// Mock Apollo Client
vi.mock("@apollo/client/react", () => ({
  useQuery: vi.fn(),
}));

describe("useCostEstimate", () => {
  const mockCostEstimate: CostEstimate = {
    sessionId: "session_123",
    perSessionCost: 2500,
    insuranceCoverage: {
      percentage: 80,
      amount: null,
      description: "PPO coverage",
    },
    copay: 2500,
    coinsurance: 20,
    deductible: {
      total: 150000,
      met: 50000,
      remaining: 100000,
    },
    insuranceCarrier: "Blue Cross Blue Shield",
    disclaimer: "Final cost may vary",
    calculatedAt: "2025-11-30T12:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Query Execution", () => {
    it("should execute query with sessionId variable", () => {
      const mockRefetch = vi.fn();
      vi.mocked(useQuery).mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      renderHook(() => useCostEstimate("session_123"));

      expect(useQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          variables: { sessionId: "session_123" },
        })
      );
    });

    it("should skip query when sessionId is empty", () => {
      const mockRefetch = vi.fn();
      vi.mocked(useQuery).mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      renderHook(() => useCostEstimate(""));

      expect(useQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          skip: true,
        })
      );
    });

    it("should use cache-first fetch policy", () => {
      const mockRefetch = vi.fn();
      vi.mocked(useQuery).mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      renderHook(() => useCostEstimate("session_123"));

      expect(useQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          fetchPolicy: "cache-first",
        })
      );
    });
  });

  describe("Loading State", () => {
    it("should return loading true when query is loading", () => {
      const mockRefetch = vi.fn();
      vi.mocked(useQuery).mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: mockRefetch,
      } as any);

      const { result } = renderHook(() => useCostEstimate("session_123"));

      expect(result.current.loading).toBe(true);
      expect(result.current.costEstimate).toBeNull();
    });
  });

  describe("Success State", () => {
    it("should return cost estimate when query succeeds", () => {
      const mockRefetch = vi.fn();
      vi.mocked(useQuery).mockReturnValue({
        data: {
          getCostEstimate: mockCostEstimate,
        },
        loading: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      const { result } = renderHook(() => useCostEstimate("session_123"));

      expect(result.current.loading).toBe(false);
      expect(result.current.costEstimate).toEqual(mockCostEstimate);
      expect(result.current.error).toBeNull();
    });

    it("should return null when no data in response", () => {
      const mockRefetch = vi.fn();
      vi.mocked(useQuery).mockReturnValue({
        data: {
          getCostEstimate: null,
        },
        loading: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      const { result } = renderHook(() => useCostEstimate("session_123"));

      expect(result.current.costEstimate).toBeNull();
    });
  });

  describe("Error State", () => {
    it("should return error when query fails", () => {
      const mockError = new Error("Network error");
      const mockRefetch = vi.fn();
      vi.mocked(useQuery).mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
        refetch: mockRefetch,
      } as any);

      const { result } = renderHook(() => useCostEstimate("session_123"));

      expect(result.current.error).toEqual(mockError);
      expect(result.current.costEstimate).toBeNull();
    });

    it("should return null error when no error", () => {
      const mockRefetch = vi.fn();
      vi.mocked(useQuery).mockReturnValue({
        data: {
          getCostEstimate: mockCostEstimate,
        },
        loading: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      const { result } = renderHook(() => useCostEstimate("session_123"));

      expect(result.current.error).toBeNull();
    });
  });

  describe("Refetch Functionality", () => {
    it("should provide refetch function", () => {
      const mockRefetch = vi.fn();
      vi.mocked(useQuery).mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      const { result } = renderHook(() => useCostEstimate("session_123"));

      expect(result.current.refetch).toBeDefined();
      expect(typeof result.current.refetch).toBe("function");
    });

    it("should call Apollo refetch when refetch is called", () => {
      const mockRefetch = vi.fn();
      vi.mocked(useQuery).mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      const { result } = renderHook(() => useCostEstimate("session_123"));

      result.current.refetch();

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it("should handle refetch errors gracefully", () => {
      const mockRefetch = vi.fn(() => {
        throw new Error("Refetch failed");
      });
      vi.mocked(useQuery).mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      // Mock console.error to prevent test output noise
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { result } = renderHook(() => useCostEstimate("session_123"));

      // Should not throw
      expect(() => result.current.refetch()).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Data Transformation", () => {
    it("should properly transform API response to CostEstimate type", () => {
      const mockRefetch = vi.fn();
      vi.mocked(useQuery).mockReturnValue({
        data: {
          getCostEstimate: mockCostEstimate,
        },
        loading: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      const { result } = renderHook(() => useCostEstimate("session_123"));

      expect(result.current.costEstimate).toMatchObject({
        sessionId: "session_123",
        perSessionCost: 2500,
        insuranceCarrier: "Blue Cross Blue Shield",
      });
    });

    it("should handle partial cost estimate data", () => {
      const partialEstimate = {
        sessionId: "session_123",
        perSessionCost: 2500,
        insuranceCoverage: null,
        copay: null,
        coinsurance: null,
        deductible: null,
        insuranceCarrier: "Blue Cross Blue Shield",
        disclaimer: null,
        calculatedAt: "2025-11-30T12:00:00Z",
      };

      const mockRefetch = vi.fn();
      vi.mocked(useQuery).mockReturnValue({
        data: {
          getCostEstimate: partialEstimate,
        },
        loading: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      const { result } = renderHook(() => useCostEstimate("session_123"));

      expect(result.current.costEstimate).toEqual(partialEstimate);
    });
  });

  describe("Hook Return Interface", () => {
    it("should return all required properties", () => {
      const mockRefetch = vi.fn();
      vi.mocked(useQuery).mockReturnValue({
        data: {
          getCostEstimate: mockCostEstimate,
        },
        loading: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      const { result } = renderHook(() => useCostEstimate("session_123"));

      expect(result.current).toHaveProperty("costEstimate");
      expect(result.current).toHaveProperty("loading");
      expect(result.current).toHaveProperty("error");
      expect(result.current).toHaveProperty("refetch");
    });
  });
});
