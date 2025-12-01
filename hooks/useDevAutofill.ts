/**
 * useDevAutofill Hook
 *
 * React hook for development autofill functionality.
 * Provides a simple interface to autofill onboarding sessions
 * with test data for development and testing purposes.
 *
 * IMPORTANT: Only available in development environment.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { autofill, isAutofilling, progress, error } = useDevAutofill("sess_123");
 *
 *   return (
 *     <button onClick={autofill} disabled={isAutofilling}>
 *       {isAutofilling ? `Filling... ${progress}%` : "Dev Autofill"}
 *     </button>
 *   );
 * }
 * ```
 */
"use client";

import { useState, useCallback } from "react";
import { useApolloClient } from "@apollo/client/react";
import {
  devAutofillSession,
  isDevEnvironment,
  type AutofillOptions,
} from "@/lib/utils/dev-autofill";

/**
 * Hook return type
 */
export interface UseDevAutofillReturn {
  /** Trigger autofill - call this to start filling */
  autofill: () => Promise<void>;
  /** Whether autofill is currently in progress */
  isAutofilling: boolean;
  /** Progress percentage (0-100) */
  progress: number;
  /** Current step being executed */
  currentStep: string;
  /** Error message if autofill failed (comma-separated for display) */
  error: string | null;
  /** Array of errors for detailed display */
  errors: string[];
  /** Whether autofill completed successfully */
  isComplete: boolean;
  /** Whether autofill is available (dev environment only) */
  isAvailable: boolean;
}

/**
 * Hook options
 */
export interface UseDevAutofillOptions extends Omit<AutofillOptions, "onProgress"> {
  /** Callback when autofill completes */
  onComplete?: (success: boolean, errors: string[]) => void;
}

/**
 * Development autofill hook
 *
 * Provides state management and progress tracking for the autofill process.
 * Only functional in development environment - returns no-op in production.
 *
 * @param sessionId - The onboarding session ID to autofill
 * @param options - Configuration options
 * @returns Autofill state and trigger function
 */
export function useDevAutofill(
  sessionId: string,
  options: UseDevAutofillOptions = {}
): UseDevAutofillReturn {
  const client = useApolloClient();
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const isAvailable = isDevEnvironment();

  const autofill = useCallback(async () => {
    if (!isAvailable) {
      console.warn("Dev autofill is only available in development environment");
      return;
    }

    if (isAutofilling) {
      console.warn("Autofill already in progress");
      return;
    }

    setIsAutofilling(true);
    setProgress(0);
    setCurrentStep("Starting...");
    setError(null);
    setErrors([]);
    setIsComplete(false);

    try {
      const result = await devAutofillSession(client, sessionId, {
        ...options,
        onProgress: (step, current, total, success) => {
          const pct = Math.round((current / total) * 100);
          setProgress(pct);
          setCurrentStep(success ? step : `${step} (failed)`);
        },
      });

      if (result.success) {
        setIsComplete(true);
        setCurrentStep("Complete!");
      } else {
        setErrors(result.errors);
        setError(result.errors.join(", "));
        setCurrentStep("Failed");
      }

      options.onComplete?.(result.success, result.errors);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setErrors([errorMsg]);
      setError(errorMsg);
      setCurrentStep("Error");
      options.onComplete?.(false, [errorMsg]);
    } finally {
      setIsAutofilling(false);
    }
  }, [client, sessionId, options, isAvailable, isAutofilling]);

  return {
    autofill,
    isAutofilling,
    progress,
    currentStep,
    error,
    errors,
    isComplete,
    isAvailable,
  };
}

export default useDevAutofill;
