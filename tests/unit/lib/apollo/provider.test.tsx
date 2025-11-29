/**
 * Unit tests for Apollo Provider component.
 *
 * Tests:
 * - Provider renders children
 * - makeClient function works
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { makeClient } from "@/lib/apollo";

// Mock the Next.js Apollo integration
vi.mock("@apollo/client-integration-nextjs", () => ({
  ApolloNextAppProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="apollo-provider">{children}</div>
  ),
}));

// Import after mock
import { ApolloWrapper } from "@/lib/apollo";

describe("ApolloWrapper", () => {
  it("renders children", () => {
    render(
      <ApolloWrapper>
        <div data-testid="child">Hello</div>
      </ApolloWrapper>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("wraps children in provider", () => {
    render(
      <ApolloWrapper>
        <div data-testid="child">Content</div>
      </ApolloWrapper>
    );

    expect(screen.getByTestId("apollo-provider")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    render(
      <ApolloWrapper>
        <div data-testid="child-1">First</div>
        <div data-testid="child-2">Second</div>
      </ApolloWrapper>
    );

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
  });
});

describe("makeClient", () => {
  it("creates an Apollo Client instance", () => {
    const client = makeClient();

    expect(client).toBeDefined();
    expect(client.cache).toBeDefined();
  });
});
