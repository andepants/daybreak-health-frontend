/**
 * DevTestCardButton component for testing insurance card upload flow
 *
 * Provides a development-only button that simulates uploading a test
 * insurance card, bypassing the camera capture flow. Available in
 * both the DevToolbar (icon variant) and on the insurance upload page
 * (inline variant).
 *
 * Features:
 * - Simulates camera capture with brief visual feedback
 * - Loads test card data (image URLs and OCR data)
 * - Updates localStorage with extracted insurance info
 * - Triggers same flow as actual card capture
 * - Only visible in development mode
 *
 * Test Card Data:
 * - Uses fake insurance card images from public assets
 * - Pre-configured OCR data for testing
 * - Multiple test scenarios (BCBS, Aetna, etc.)
 */
"use client";

import * as React from "react";
import { useState } from "react";
import { CreditCard, Loader2, Check, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Test card configuration type
 */
interface TestCard {
  id: string;
  payerName: string;
  memberId: string;
  groupNumber: string;
  /** Path to test card image (relative to public folder) */
  frontImagePath: string;
  backImagePath: string;
}

/**
 * Test cards configuration
 * Using fake/placeholder images that would be placed in public/test-assets/
 */
const TEST_CARDS: TestCard[] = [
  {
    id: "bcbs-test",
    payerName: "Blue Cross Blue Shield",
    memberId: "TEST123456789",
    groupNumber: "GRP-TEST-001",
    frontImagePath: "/test-assets/fake-insurance-front.png",
    backImagePath: "/test-assets/fake-insurance-back.png",
  },
  {
    id: "aetna-test",
    payerName: "Aetna",
    memberId: "W987654321",
    groupNumber: "AETNA-GRP-002",
    frontImagePath: "/test-assets/fake-insurance-front.png",
    backImagePath: "/test-assets/fake-insurance-back.png",
  },
  {
    id: "anthem-test",
    payerName: "Anthem Blue Cross",
    memberId: "MCA84103067D",
    groupNumber: "W3001103",
    frontImagePath: "/test-assets/fake-insurance-front.png",
    backImagePath: "/test-assets/fake-insurance-back.png",
  },
];

/**
 * Props for DevTestCardButton component
 */
export interface DevTestCardButtonProps {
  /** Current session ID for localStorage updates */
  sessionId: string;
  /** Callback when test card is loaded */
  onComplete?: (data: {
    payerName: string;
    memberId: string;
    groupNumber: string;
    frontImageUrl: string;
    backImageUrl: string;
  }) => void;
  /** Button variant: toolbar (icon only) or inline (full button) */
  variant?: "toolbar" | "inline";
  /** Optional CSS classes */
  className?: string;
}

/**
 * Development-only button for testing insurance card upload
 *
 * Simulates the camera capture flow by loading pre-configured test
 * card data. Used for testing the insurance verification and cost
 * estimation flow without requiring actual card images.
 *
 * @example
 * // In DevToolbar (icon variant)
 * <DevTestCardButton
 *   sessionId={sessionId}
 *   variant="toolbar"
 *   onComplete={(data) => toast.success(`Loaded: ${data.payerName}`)}
 * />
 *
 * @example
 * // In InsuranceCardUpload (inline variant)
 * <DevTestCardButton
 *   sessionId={sessionId}
 *   variant="inline"
 *   onComplete={handleTestCardLoaded}
 * />
 */
export function DevTestCardButton({
  sessionId,
  onComplete,
  variant = "inline",
  className,
}: DevTestCardButtonProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Only render in development mode
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  /**
   * Simulates test card capture and populates localStorage
   */
  async function handleTestCapture() {
    setIsSimulating(true);
    setIsComplete(false);

    try {
      // Select a random test card
      const testCard = TEST_CARDS[Math.floor(Math.random() * TEST_CARDS.length)];

      // Simulate capture delay for realistic UX (1 second)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get base URL for images
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

      // Prepare card data
      const cardData = {
        payerName: testCard.payerName,
        memberId: testCard.memberId,
        groupNumber: testCard.groupNumber,
        frontImageUrl: `${baseUrl}${testCard.frontImagePath}`,
        backImageUrl: `${baseUrl}${testCard.backImagePath}`,
      };

      // Update localStorage with test insurance data
      try {
        const storageKey = `onboarding_session_${sessionId}`;
        const stored = localStorage.getItem(storageKey);
        const sessionData = stored ? JSON.parse(stored) : { data: {} };

        // Update insurance data
        sessionData.data = sessionData.data || {};
        sessionData.data.insurance = {
          ...sessionData.data.insurance,
          carrier: testCard.id.split("-")[0], // e.g., "bcbs" from "bcbs-test"
          payerName: testCard.payerName,
          memberId: testCard.memberId,
          groupNumber: testCard.groupNumber,
          cardImageFrontUrl: cardData.frontImageUrl,
          cardImageBackUrl: cardData.backImageUrl,
          // Simulate OCR completion
          ocrProcessed: true,
          ocrConfidence: {
            payer_name: 95,
            member_id: 88,
            group_number: 92,
          },
        };
        sessionData.savedAt = new Date().toISOString();

        localStorage.setItem(storageKey, JSON.stringify(sessionData));

        // Dispatch storage event for same-tab detection
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: storageKey,
            newValue: JSON.stringify(sessionData),
            storageArea: localStorage,
          })
        );
      } catch (err) {
        console.error("Failed to update localStorage:", err);
      }

      // Mark as complete
      setIsComplete(true);

      // Call completion callback
      onComplete?.(cardData);

      // Reset after delay
      setTimeout(() => {
        setIsComplete(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to simulate test card:", err);
    } finally {
      setIsSimulating(false);
    }
  }

  // Toolbar variant - icon only
  if (variant === "toolbar") {
    return (
      <Button
        onClick={handleTestCapture}
        disabled={isSimulating}
        variant="ghost"
        size="sm"
        className={cn(
          "text-white hover:bg-zinc-800",
          isComplete && "text-green-400",
          className
        )}
        title="Use Test Insurance Card"
      >
        {isSimulating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isComplete ? (
          <Check className="h-4 w-4" />
        ) : (
          <CreditCard className="h-4 w-4" />
        )}
        <span className="ml-2 text-xs">Test Card</span>
      </Button>
    );
  }

  // Inline variant - full button
  return (
    <Button
      onClick={handleTestCapture}
      disabled={isSimulating}
      variant="outline"
      className={cn(
        "w-full border-dashed border-2",
        isComplete && "border-green-500 bg-green-50",
        className
      )}
    >
      {isSimulating ? (
        <>
          <Camera className="h-4 w-4 mr-2 animate-pulse" />
          Simulating capture...
        </>
      ) : isComplete ? (
        <>
          <Check className="h-4 w-4 mr-2 text-green-600" />
          Test card loaded!
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          Use Test Insurance Card
        </>
      )}
    </Button>
  );
}

DevTestCardButton.displayName = "DevTestCardButton";
