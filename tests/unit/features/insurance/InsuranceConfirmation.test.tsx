/**
 * Unit tests for InsuranceConfirmation component
 *
 * Tests loading states, confirmation display, edit functionality,
 * error handling with retry, and PHI protection per AC-4.2.1 through AC-4.2.6.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InsuranceConfirmation } from "@/features/insurance/InsuranceConfirmation";
import type { InsuranceInformation } from "@/features/insurance/useInsurance";

// Mock insurance-carriers module
vi.mock("@/lib/data/insurance-carriers", () => ({
  getCarrierById: vi.fn((id: string) => {
    const carriers: Record<string, { id: string; name: string; idFormat: string }> = {
      bcbs: { id: "bcbs", name: "Blue Cross Blue Shield", idFormat: "3 letters + 9-12 digits" },
      aetna: { id: "aetna", name: "Aetna", idFormat: "W followed by 9 digits" },
    };
    return carriers[id] || null;
  }),
}));

describe("InsuranceConfirmation", () => {
  const mockInsuranceInfo: InsuranceInformation = {
    id: "ins_123",
    payerName: "bcbs",
    subscriberName: "Jane Doe",
    memberId: "ABC123456789",
    groupNumber: "GRP-001",
    verificationStatus: "pending",
  };

  const defaultProps = {
    insuranceInfo: mockInsuranceInfo,
    onEdit: vi.fn(),
    onRetry: vi.fn(),
    onContinue: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading State (AC-4.2.1)", () => {
    it("should show loading state during initial load", () => {
      render(
        <InsuranceConfirmation
          {...defaultProps}
          insuranceInfo={null}
          isLoading={true}
        />
      );

      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText(/loading insurance information/i)).toBeInTheDocument();
    });

    it("should show saving state during submission", () => {
      render(
        <InsuranceConfirmation
          {...defaultProps}
          isSaving={true}
        />
      );

      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText(/saving your insurance information/i)).toBeInTheDocument();
    });

    it("should display spinner animation during loading", () => {
      render(
        <InsuranceConfirmation
          {...defaultProps}
          insuranceInfo={null}
          isLoading={true}
        />
      );

      // Check for animate-spin class on the loader icon
      const loader = document.querySelector(".animate-spin");
      expect(loader).toBeInTheDocument();
    });
  });

  describe("Confirmation Display (AC-4.2.2)", () => {
    it("should display carrier name", () => {
      render(<InsuranceConfirmation {...defaultProps} />);

      expect(screen.getByText("Blue Cross Blue Shield")).toBeInTheDocument();
    });

    it("should display masked member ID (****XXXX format)", () => {
      render(<InsuranceConfirmation {...defaultProps} />);

      // Should show masked version, not the full ID
      expect(screen.getByText("****6789")).toBeInTheDocument();
      expect(screen.queryByText("ABC123456789")).not.toBeInTheDocument();
    });

    it("should display group number when provided", () => {
      render(<InsuranceConfirmation {...defaultProps} />);

      expect(screen.getByText("GRP-001")).toBeInTheDocument();
    });

    it("should display subscriber name when provided", () => {
      render(<InsuranceConfirmation {...defaultProps} />);

      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    });

    it("should display verification status badge", () => {
      render(<InsuranceConfirmation {...defaultProps} />);

      expect(screen.getByText("Verification Pending")).toBeInTheDocument();
    });

    it("should display verified status correctly", () => {
      render(
        <InsuranceConfirmation
          {...defaultProps}
          insuranceInfo={{
            ...mockInsuranceInfo,
            verificationStatus: "verified",
          }}
        />
      );

      expect(screen.getByText("Verified")).toBeInTheDocument();
    });

    it("should not display group number when not provided", () => {
      render(
        <InsuranceConfirmation
          {...defaultProps}
          insuranceInfo={{
            ...mockInsuranceInfo,
            groupNumber: null,
          }}
        />
      );

      expect(screen.queryByText("Group Number")).not.toBeInTheDocument();
    });

    it("should use carrier name from ID lookup", () => {
      render(
        <InsuranceConfirmation
          {...defaultProps}
          insuranceInfo={{
            ...mockInsuranceInfo,
            payerName: "aetna",
          }}
        />
      );

      expect(screen.getByText("Aetna")).toBeInTheDocument();
    });

    it("should fall back to payerName if carrier not found", () => {
      render(
        <InsuranceConfirmation
          {...defaultProps}
          insuranceInfo={{
            ...mockInsuranceInfo,
            payerName: "unknown-carrier",
          }}
        />
      );

      expect(screen.getByText("unknown-carrier")).toBeInTheDocument();
    });
  });

  describe("Edit Functionality (AC-4.2.3)", () => {
    it("should display Edit button", () => {
      render(<InsuranceConfirmation {...defaultProps} />);

      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    });

    it("should call onEdit when Edit button is clicked", async () => {
      const onEdit = vi.fn();
      const user = userEvent.setup();

      render(<InsuranceConfirmation {...defaultProps} onEdit={onEdit} />);

      await user.click(screen.getByRole("button", { name: /edit/i }));

      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it("should not show Edit button when onEdit is not provided", () => {
      render(
        <InsuranceConfirmation
          {...defaultProps}
          onEdit={undefined}
        />
      );

      expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
    });
  });

  describe("Error State with Retry (AC-4.2.4)", () => {
    it("should display error state when error is provided", () => {
      render(
        <InsuranceConfirmation
          {...defaultProps}
          error={new Error("Network connection failed")}
        />
      );

      expect(screen.getByText("Submission Failed")).toBeInTheDocument();
      expect(screen.getByText("Network connection failed")).toBeInTheDocument();
    });

    it("should display default error message when error has no message", () => {
      render(
        <InsuranceConfirmation
          {...defaultProps}
          error={new Error("")}
        />
      );

      expect(screen.getByText(/couldn't save your insurance information/i)).toBeInTheDocument();
    });

    it("should display Try again button in error state", () => {
      render(
        <InsuranceConfirmation
          {...defaultProps}
          error={new Error("Failed")}
        />
      );

      expect(screen.getByRole("button", { name: /try submitting again/i })).toBeInTheDocument();
    });

    it("should call onRetry when Try again is clicked", async () => {
      const onRetry = vi.fn();
      const user = userEvent.setup();

      render(
        <InsuranceConfirmation
          {...defaultProps}
          error={new Error("Failed")}
          onRetry={onRetry}
        />
      );

      await user.click(screen.getByRole("button", { name: /try submitting again/i }));

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("should not display retry button if onRetry is not provided", () => {
      render(
        <InsuranceConfirmation
          {...defaultProps}
          error={new Error("Failed")}
          onRetry={undefined}
        />
      );

      expect(screen.queryByRole("button", { name: /try again/i })).not.toBeInTheDocument();
    });

    it("should have role=alert for error message", () => {
      render(
        <InsuranceConfirmation
          {...defaultProps}
          error={new Error("Test error")}
        />
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("Continue Button", () => {
    it("should display Continue button", () => {
      render(<InsuranceConfirmation {...defaultProps} />);

      expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
    });

    it("should call onContinue when Continue is clicked", async () => {
      const onContinue = vi.fn();
      const user = userEvent.setup();

      render(<InsuranceConfirmation {...defaultProps} onContinue={onContinue} />);

      await user.click(screen.getByRole("button", { name: /continue/i }));

      expect(onContinue).toHaveBeenCalledTimes(1);
    });

    it("should not render Continue button when onContinue is not provided", () => {
      render(
        <InsuranceConfirmation
          {...defaultProps}
          onContinue={undefined}
        />
      );

      expect(screen.queryByRole("button", { name: /continue/i })).not.toBeInTheDocument();
    });
  });

  describe("Self-Pay Display", () => {
    const selfPayInfo: InsuranceInformation = {
      id: "ins_456",
      payerName: "Self-Pay",
      subscriberName: "",
      memberId: "",
      groupNumber: null,
      verificationStatus: "self_pay",
    };

    it("should display self-pay title", () => {
      render(
        <InsuranceConfirmation
          {...defaultProps}
          insuranceInfo={selfPayInfo}
        />
      );

      expect(screen.getByText("Self-Pay Selected")).toBeInTheDocument();
    });

    it("should display self-pay description", () => {
      render(
        <InsuranceConfirmation
          {...defaultProps}
          insuranceInfo={selfPayInfo}
        />
      );

      expect(screen.getByText(/chosen to pay out of pocket/i)).toBeInTheDocument();
    });

    it("should display informational message about cost", () => {
      render(
        <InsuranceConfirmation
          {...defaultProps}
          insuranceInfo={selfPayInfo}
        />
      );

      expect(screen.getByText(/receive cost information/i)).toBeInTheDocument();
    });

    it("should display Add Insurance Instead button for self-pay", () => {
      render(
        <InsuranceConfirmation
          {...defaultProps}
          insuranceInfo={selfPayInfo}
        />
      );

      expect(screen.getByRole("button", { name: /add insurance instead/i })).toBeInTheDocument();
    });

    it("should not display Edit button for self-pay", () => {
      render(
        <InsuranceConfirmation
          {...defaultProps}
          insuranceInfo={selfPayInfo}
        />
      );

      // Should not have the standard "Edit" button
      expect(screen.queryByRole("button", { name: /^edit$/i })).not.toBeInTheDocument();
    });

    it("should not display insurance details for self-pay", () => {
      render(
        <InsuranceConfirmation
          {...defaultProps}
          insuranceInfo={selfPayInfo}
        />
      );

      expect(screen.queryByText("Insurance Carrier")).not.toBeInTheDocument();
      expect(screen.queryByText("Member ID")).not.toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should display empty state when no insurance info", () => {
      render(
        <InsuranceConfirmation
          {...defaultProps}
          insuranceInfo={null}
        />
      );

      expect(screen.getByText(/no insurance information found/i)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible loading state", () => {
      render(
        <InsuranceConfirmation
          {...defaultProps}
          insuranceInfo={null}
          isLoading={true}
        />
      );

      const status = screen.getByRole("status");
      expect(status).toHaveAttribute("aria-live", "polite");
    });

    it("should have aria-label on edit button", () => {
      render(<InsuranceConfirmation {...defaultProps} />);

      expect(screen.getByRole("button", { name: /edit insurance information/i })).toBeInTheDocument();
    });

    it("should have aria-label on retry button", () => {
      render(
        <InsuranceConfirmation
          {...defaultProps}
          error={new Error("Failed")}
        />
      );

      expect(screen.getByRole("button", { name: /try submitting again/i })).toBeInTheDocument();
    });
  });

  describe("PHI Protection", () => {
    it("should never display full member ID", () => {
      const { container } = render(<InsuranceConfirmation {...defaultProps} />);

      // Search entire rendered output for full member ID
      expect(container.textContent).not.toContain("ABC123456789");
    });

    it("should always mask member ID regardless of length", () => {
      const shortIdInfo: InsuranceInformation = {
        ...mockInsuranceInfo,
        memberId: "ABC12",
      };

      render(
        <InsuranceConfirmation
          {...defaultProps}
          insuranceInfo={shortIdInfo}
        />
      );

      // Short IDs (5 chars) should still be masked showing last 4
      expect(screen.getByText("****BC12")).toBeInTheDocument();
    });
  });
});
