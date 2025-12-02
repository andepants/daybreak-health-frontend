/**
 * DevToolbar - Development-only toolbar for testing
 *
 * Provides quick actions for development testing:
 * - Fill Demo Data: Populates all forms with valid test data (localStorage only)
 * - Autofill & Submit: Fills data AND triggers GraphQL mutations (required for matching)
 * - Clear Data: Removes session data from localStorage
 *
 * Only renders in development mode (NODE_ENV === "development")
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wrench, Check, X, ChevronDown, ChevronUp, Trash2, Zap, Loader2, AlertTriangle } from "lucide-react";
import { useDevAutofill } from "@/hooks/useDevAutofill";
import { getAuthToken } from "@/lib/apollo/client";
import { DevTestCardButton } from "@/features/insurance/DevTestCardButton";

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
  // Top-level names for easy access (used by insurance subscriber auto-fill)
  firstName: "Margaret",
  lastName: "Johnson",
  parent: {
    firstName: "Margaret",
    lastName: "Johnson",
    email: "margaret.johnson@example.com",
    phone: "5551234567",
    relationshipToChild: "parent",
  },
  child: {
    firstName: "Jordan",
    lastName: "Johnson", // Use parent's lastName for child (required for GraphQL)
    dateOfBirth: "2011-03-22", // 13 years old (ISO string for JSON)
    pronouns: "he-him",
    gender: "he-him", // Same as pronouns for GraphQL compatibility
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
  // Assessment data with correct field names matching form validation schema
  assessment: {
    keyConcerns: [
      "Anxiety at school and social settings",
      "Difficulty concentrating",
      "Declining grades",
    ],
    primaryConcerns: "Anxiety at school and social settings",
    concernDuration: "6-plus-months",
    concernSeverity: 4,
    sleepPatterns: "no-change", // Fixed: was sleepPattern
    appetiteChanges: "no-change", // Fixed: was appetiteChange
    schoolPerformance: "declining",
    socialRelationships: "withdrawing",
    recentEvents: "",
    therapyGoals: "Help Jordan manage his anxiety and improve his confidence in social situations.",
  },
  // Duplicate assessment data as formAssessment for form-based assessment sync
  formAssessment: {
    primaryConcerns: "Anxiety at school and social settings",
    concernDuration: "6-plus-months",
    concernSeverity: 4,
    sleepPatterns: "no-change",
    appetiteChanges: "no-change",
    schoolPerformance: "declining",
    socialRelationships: "withdrawing",
    recentEvents: "",
    therapyGoals: "Help Jordan manage his anxiety and improve his confidence in social situations.",
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
  const [hasAuthToken, setHasAuthToken] = useState(false);

  // Check if auth token is available (needed for assessment mutations)
  useEffect(() => {
    const token = getAuthToken();
    setHasAuthToken(!!token);
  }, []);

  // Dev autofill hook - triggers actual GraphQL mutations
  const {
    autofill,
    isAutofilling,
    progress,
    currentStep,
    errors: autofillErrors,
    isComplete: autofillComplete,
  } = useDevAutofill(sessionId, {
    useSelfPay: false, // Use insurance instead - simpler auth
    onComplete: (success) => {
      if (success) {
        // Navigate to matching page after successful autofill
        setTimeout(() => {
          router.push(`/onboarding/${sessionId}/matching`);
        }, 500);
      }
    },
  });

  // Only render in development mode
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  /**
   * Fills all forms with demo data by saving to localStorage
   */
  function handleFillDemoData(): void {
    try {
      const storageKey = `onboarding_session_${sessionId}`;
      const dataToSave = {
        data: DEMO_DATA,
        savedAt: new Date().toISOString(),
      };

      const jsonData = JSON.stringify(dataToSave);
      localStorage.setItem(storageKey, jsonData);

      // Dispatch storage event for same-tab detection
      // (native storage events only fire for cross-tab changes)
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: storageKey,
          newValue: jsonData,
          storageArea: localStorage,
        })
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
    <div className="fixed bottom-4 right-20 z-50 flex flex-col items-end gap-2">
      {/* Expanded toolbar actions */}
      {isExpanded && (
        <div className="bg-zinc-900 text-white rounded-lg shadow-xl p-3 space-y-2 min-w-[180px]">
          <p className="text-xs text-zinc-400 font-medium mb-2">Dev Actions</p>

          {/* Warning if no auth token */}
          {!hasAuthToken && (
            <div className="text-xs text-amber-400 px-2 py-1 bg-amber-900/30 rounded flex items-start gap-1.5 mb-2">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>No auth token. Start from home page to create a session first.</span>
            </div>
          )}

          {/* Primary action: Autofill with GraphQL mutations */}
          <Button
            onClick={autofill}
            disabled={isAutofilling || !hasAuthToken}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white hover:bg-zinc-800 bg-emerald-900/50 hover:bg-emerald-800/50 disabled:opacity-50"
          >
            {isAutofilling ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : autofillComplete ? (
              <Check className="h-4 w-4 mr-2 text-green-400" />
            ) : autofillErrors.length > 0 ? (
              <X className="h-4 w-4 mr-2 text-red-400" />
            ) : (
              <Zap className="h-4 w-4 mr-2 text-yellow-400" />
            )}
            {isAutofilling
              ? `${progress}% - ${currentStep}`
              : autofillComplete
                ? "Done! Going to Match..."
                : "Autofill & Submit"}
          </Button>

          {autofillErrors.length > 0 && (
            <div className="text-xs text-red-400 px-2 py-1 bg-red-900/30 rounded max-w-[250px]">
              <div className="font-medium mb-1">Failed ({autofillErrors.length}):</div>
              <div className="text-[10px] leading-tight break-words overflow-hidden max-h-[60px] overflow-y-auto">
                {autofillErrors.map((err, i) => (
                  <div key={i} className="truncate" title={err}>• {err}</div>
                ))}
              </div>
            </div>
          )}

          <hr className="border-zinc-700" />

          <p className="text-xs text-zinc-500 font-medium">Insurance Testing</p>

          <DevTestCardButton
            sessionId={sessionId}
            variant="toolbar"
            onComplete={(data) => {
              console.log("Test card loaded:", data.payerName);
            }}
          />

          <hr className="border-zinc-700" />

          <p className="text-xs text-zinc-500 font-medium">Local Storage Only</p>

          <Button
            onClick={handleFillDemoData}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white hover:bg-zinc-800 text-xs"
          >
            {status === "success" ? (
              <Check className="h-4 w-4 mr-2 text-green-400" />
            ) : status === "error" ? (
              <X className="h-4 w-4 mr-2 text-red-400" />
            ) : (
              <Wrench className="h-4 w-4 mr-2" />
            )}
            Fill Forms Only
          </Button>

          <Button
            onClick={handleClearData}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white hover:bg-zinc-800 text-xs"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Data
          </Button>

          <hr className="border-zinc-700" />

          <p className="text-xs text-zinc-400 font-medium">Quick Nav (UI Only)</p>
          <p className="text-[10px] text-zinc-500 leading-tight">
            These skip backend - use Autofill & Submit for real data
          </p>

          <Button
            onClick={handleGoToMatching}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white hover:bg-zinc-800 text-xs opacity-60"
          >
            Go to Matching
          </Button>

          <Button
            onClick={handleGoToSchedule}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white hover:bg-zinc-800 text-xs opacity-60"
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
