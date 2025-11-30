/**
 * DevToolbar - Development-only toolbar for testing
 *
 * Provides quick actions for development testing:
 * - Fill Demo Data: Populates all forms with valid test data
 * - Clear Data: Removes session data from localStorage
 *
 * Only renders in development mode (NODE_ENV === "development")
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wrench, Check, X, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

/**
 * Props for the DevToolbar component
 * @param sessionId - Current session ID for localStorage key
 */
interface DevToolbarProps {
  sessionId: string;
}

/**
 * Demo data that passes all validation schemas
 * Based on validation rules in lib/validations/
 */
const DEMO_DATA = {
  parent: {
    firstName: "Margaret",
    lastName: "Johnson",
    email: "margaret.johnson@example.com",
    phone: "5551234567",
    relationshipToChild: "parent",
  },
  child: {
    firstName: "Jordan",
    dateOfBirth: "2011-03-22", // 13 years old (ISO string for JSON)
    pronouns: "he-him",
    grade: "8th",
    primaryConcerns:
      "Jordan has been experiencing increased anxiety at school over the past 6 months. He worries about social interactions and has difficulty concentrating in class. This has begun affecting his grades and overall confidence.",
  },
  clinical: {
    currentMedications: "",
    previousTherapy: "previously",
    diagnoses: ["anxiety"],
    schoolAccommodations: "504-plan",
    additionalInfo:
      "Prefers email communication. Best reached in the evenings after school.",
  },
  insurance: {
    carrier: "bcbs",
    memberId: "JDN123456789",
    groupNumber: "EMP-GRP-001",
    subscriberName: "Margaret Johnson",
    relationshipToSubscriber: "Self",
  },
  assessment: {
    keyConcerns: [
      "Anxiety at school and social settings",
      "Difficulty concentrating",
      "Declining grades",
    ],
    primaryConcerns: "Anxiety at school and social settings",
    concernDuration: "6-plus-months",
    concernSeverity: 4,
    sleepPattern: "no-change",
    appetiteChange: "no-change",
    schoolPerformance: "declining",
    socialRelationships: "withdrawing",
  },
  assessmentSummary:
    "Jordan has been experiencing increased anxiety at school over the past 6 months. He worries about social interactions and has difficulty concentrating in class.",
};

/**
 * DevToolbar component
 *
 * Floating toolbar in bottom-right corner (development only)
 * Provides quick actions for testing the onboarding flow
 */
export function DevToolbar({ sessionId }: DevToolbarProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  // Only render in development mode
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  /**
   * Fills all forms with demo data by saving to localStorage
   */
  function handleFillDemoData(): void {
    try {
      const dataToSave = {
        data: DEMO_DATA,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        `onboarding_session_${sessionId}`,
        JSON.stringify(dataToSave)
      );

      setStatus("success");

      // Refresh the page to load the new data
      router.refresh();

      // Reset status after delay
      setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to fill demo data:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }

  /**
   * Clears all session data from localStorage
   */
  function handleClearData(): void {
    try {
      localStorage.removeItem(`onboarding_session_${sessionId}`);
      setStatus("success");
      router.refresh();
      setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to clear data:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }

  /**
   * Navigate directly to matching page (skip forms)
   */
  function handleGoToMatching(): void {
    // Ensure data is saved first
    handleFillDemoData();
    setTimeout(() => {
      router.push(`/onboarding/${sessionId}/matching`);
    }, 100);
  }

  /**
   * Navigate directly to schedule page
   */
  function handleGoToSchedule(): void {
    handleFillDemoData();
    setTimeout(() => {
      router.push(`/onboarding/${sessionId}/schedule`);
    }, 100);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Expanded toolbar actions */}
      {isExpanded && (
        <div className="bg-zinc-900 text-white rounded-lg shadow-xl p-3 space-y-2 min-w-[180px]">
          <p className="text-xs text-zinc-400 font-medium mb-2">Dev Actions</p>

          <Button
            onClick={handleFillDemoData}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white hover:bg-zinc-800"
          >
            {status === "success" ? (
              <Check className="h-4 w-4 mr-2 text-green-400" />
            ) : status === "error" ? (
              <X className="h-4 w-4 mr-2 text-red-400" />
            ) : (
              <Wrench className="h-4 w-4 mr-2" />
            )}
            Fill Demo Data
          </Button>

          <Button
            onClick={handleClearData}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white hover:bg-zinc-800"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Data
          </Button>

          <hr className="border-zinc-700" />

          <p className="text-xs text-zinc-400 font-medium">Quick Nav</p>

          <Button
            onClick={handleGoToMatching}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white hover:bg-zinc-800 text-xs"
          >
            Go to Matching
          </Button>

          <Button
            onClick={handleGoToSchedule}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white hover:bg-zinc-800 text-xs"
          >
            Go to Schedule
          </Button>
        </div>
      )}

      {/* Toggle button */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full h-10 w-10 p-0 shadow-xl"
        title="Dev Tools"
      >
        {isExpanded ? (
          <ChevronDown className="h-5 w-5" />
        ) : (
          <ChevronUp className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}

export default DevToolbar;
