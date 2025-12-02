/**
 * Development Autofill Utility
 *
 * Automatically fills out the entire onboarding flow by triggering
 * the actual GraphQL mutations. This is useful for testing the
 * matching flow without manually filling every field.
 *
 * IMPORTANT: This should only be used in development environments.
 *
 * Usage:
 *   import { devAutofillSession } from '@/lib/utils/dev-autofill';
 *   await devAutofillSession(apolloClient, sessionId);
 */

import { gql } from "@apollo/client";

/**
 * GraphQL Error type
 */
interface GraphQLError {
  message: string;
  extensions?: { code?: string };
}

/**
 * Minimal Apollo Client interface for autofill
 * Only includes the mutate method we need
 */
interface MutationClient {
  mutate: <T = Record<string, unknown>>(options: {
    mutation: ReturnType<typeof gql>;
    variables: Record<string, unknown>;
  }) => Promise<{ data?: T; errors?: GraphQLError[] }>;
}

/**
 * Response types for mutations
 */
interface ParentMutationResult {
  submitParentInfo?: {
    parent?: { id: string };
    errors?: string[];
  };
}

interface ChildMutationResult {
  submitChildInfo?: {
    child?: { id: string };
    errors?: string[];
  };
}

interface SelfPayMutationResult {
  selectSelfPay?: {
    success: boolean;
  };
}

interface InsuranceMutationResult {
  submitInsuranceInfo?: {
    insurance?: { id: string };
    errors?: Array<{ field: string; message: string }>;
  };
}

interface AssessmentMutationResult {
  submitAssessmentResponse?: {
    assessment?: { id: string; status: string };
    errors?: string[];
  };
}

interface CompleteAssessmentResult {
  completeAssessment?: {
    session?: { id: string; status: string };
    success: boolean;
    errors?: string[];
  };
}

/**
 * Test data for autofill
 * Uses realistic but fake data for development testing
 */
export const DEV_TEST_DATA = {
  parent: {
    firstName: "Andrew",
    lastName: "Sheim",
    email: "andrewsheim@gmail.com",
    phone: "8054347223",
    relationship: "parent",
    isGuardian: true,
  },
  child: {
    firstName: "Alex",
    lastName: "Sheim",
    // 14-year-old for teen assessment questions
    dateOfBirth: new Date(
      Date.now() - 14 * 365.25 * 24 * 60 * 60 * 1000
    ).toISOString().split("T")[0],
    gender: "they-them", // Maps to pronouns for GraphQL
    pronouns: "they-them", // For form pre-population (matches validation schema)
    grade: "9th",
    primaryConcerns: "Anxiety and occasional low mood, difficulty with school focus",
  },
  insurance: {
    payerName: "Blue Cross Blue Shield",
    memberId: "XYZ123456789",
    groupNumber: "GRPDEV12345678",
    subscriberName: "Andrew Sheim",
    subscriberDob: "1985-06-15",
  },
  // Assessment responses (0-3 Likert scale)
  // Using moderate responses for realistic test data
  assessmentResponses: [
    // PHQ-A (9 questions) - depression screening
    { questionId: "phq_a_1", responseText: "several days", responseValue: 1 },
    { questionId: "phq_a_2", responseText: "more than half the days", responseValue: 2 },
    { questionId: "phq_a_3", responseText: "several days", responseValue: 1 },
    { questionId: "phq_a_4", responseText: "not at all", responseValue: 0 },
    { questionId: "phq_a_5", responseText: "several days", responseValue: 1 },
    { questionId: "phq_a_6", responseText: "not at all", responseValue: 0 },
    { questionId: "phq_a_7", responseText: "several days", responseValue: 1 },
    { questionId: "phq_a_8", responseText: "not at all", responseValue: 0 },
    { questionId: "phq_a_9", responseText: "not at all", responseValue: 0 },
    // GAD-7 (7 questions) - anxiety screening
    { questionId: "gad_7_1", responseText: "several days", responseValue: 1 },
    { questionId: "gad_7_2", responseText: "more than half the days", responseValue: 2 },
    { questionId: "gad_7_3", responseText: "several days", responseValue: 1 },
    { questionId: "gad_7_4", responseText: "several days", responseValue: 1 },
    { questionId: "gad_7_5", responseText: "not at all", responseValue: 0 },
    { questionId: "gad_7_6", responseText: "several days", responseValue: 1 },
    { questionId: "gad_7_7", responseText: "not at all", responseValue: 0 },
  ],
};

/**
 * GraphQL Mutations for autofill
 */
const SUBMIT_PARENT_INFO = gql`
  mutation DevSubmitParentInfo($sessionId: ID!, $parentInfo: ParentInput!) {
    submitParentInfo(sessionId: $sessionId, parentInfo: $parentInfo) {
      parent {
        id
        firstName
        lastName
      }
      errors
    }
  }
`;

const SUBMIT_CHILD_INFO = gql`
  mutation DevSubmitChildInfo($session_id: ID!, $child_info: ChildInput!) {
    submitChildInfo(session_id: $session_id, child_info: $child_info) {
      child {
        id
        first_name
        last_name
      }
      errors
    }
  }
`;

const SELECT_SELF_PAY = gql`
  mutation DevSelectSelfPay($sessionId: ID!) {
    selectSelfPay(sessionId: $sessionId) {
      success
      session {
        id
        insurance {
          id
          verificationStatus
        }
      }
    }
  }
`;

const SUBMIT_INSURANCE_INFO = gql`
  mutation DevSubmitInsuranceInfo(
    $sessionId: ID!
    $payerName: String
    $memberId: String
    $groupNumber: String
    $subscriberName: String
    $subscriberDob: String
  ) {
    submitInsuranceInfo(
      sessionId: $sessionId
      payerName: $payerName
      memberId: $memberId
      groupNumber: $groupNumber
      subscriberName: $subscriberName
      subscriberDob: $subscriberDob
    ) {
      insurance {
        id
        verificationStatus
      }
      errors {
        field
        message
      }
    }
  }
`;

const SUBMIT_ASSESSMENT_RESPONSE = gql`
  mutation DevSubmitAssessmentResponse(
    $sessionId: ID!
    $questionId: String!
    $responseText: String!
    $responseValue: Int
  ) {
    submitAssessmentResponse(
      sessionId: $sessionId
      questionId: $questionId
      responseText: $responseText
      responseValue: $responseValue
    ) {
      assessment {
        id
        status
      }
      nextQuestion {
        id
      }
      progress {
        completedQuestions
        totalQuestions
        percentage
      }
      errors
    }
  }
`;

/**
 * CompleteAssessment mutation
 * Transitions session to assessment_complete status so booking can proceed
 */
const COMPLETE_ASSESSMENT = gql`
  mutation DevCompleteAssessment($input: CompleteAssessmentInput!) {
    completeAssessment(input: $input) {
      session {
        id
        status
      }
      success
      errors
    }
  }
`;

/**
 * Autofill progress callback type
 */
export type AutofillProgressCallback = (
  step: string,
  current: number,
  total: number,
  success: boolean
) => void;

/**
 * Autofill options
 */
export interface AutofillOptions {
  /** Use self-pay instead of insurance (faster) */
  useSelfPay?: boolean;
  /** Progress callback for UI updates */
  onProgress?: AutofillProgressCallback;
  /** Delay between mutations in ms (default: 100) */
  delayMs?: number;
  /** Custom test data overrides */
  testData?: Partial<typeof DEV_TEST_DATA>;
}

/**
 * Sleep utility for adding delays between mutations
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * LocalStorage data structure for onboarding session
 * Matches the format used by manual form filling
 */
interface OnboardingStorageData {
  data: Record<string, Record<string, unknown>>;
  savedAt: string;
}

/**
 * Saves onboarding data to localStorage
 * Mimics the behavior of manual form filling for consistent state
 *
 * @param sessionId - The session ID to use as storage key
 * @param section - The section of data being saved (parent, child, insurance, etc.)
 * @param sectionData - The data to save for this section
 */
function saveToLocalStorage(
  sessionId: string,
  section: string,
  sectionData: Record<string, unknown>
): void {
  try {
    const storageKey = `onboarding_session_${sessionId}`;
    const existing = localStorage.getItem(storageKey);
    const parsed: OnboardingStorageData = existing
      ? JSON.parse(existing)
      : { data: {}, savedAt: "" };

    parsed.data[section] = sectionData;
    parsed.savedAt = new Date().toISOString();

    localStorage.setItem(storageKey, JSON.stringify(parsed));
  } catch {
    // Silently fail - localStorage may not be available in some environments
    console.warn(`[dev-autofill] Failed to save ${section} to localStorage`);
  }
}

/**
 * Saves assessment summary to localStorage
 * Uses a separate key for assessment summary (matches manual form behavior)
 *
 * @param sessionId - The session ID
 * @param responses - The assessment responses that were submitted
 */
function saveAssessmentSummary(
  sessionId: string,
  responses: typeof DEV_TEST_DATA.assessmentResponses
): void {
  try {
    const summaryKey = `assessment_summary_${sessionId}`;
    const summary = {
      summary: "Development autofill assessment - PHQ-A and GAD-7 screening completed with moderate scores",
      formData: {
        phqaScore: responses.slice(0, 9).reduce((sum, r) => sum + r.responseValue, 0),
        gad7Score: responses.slice(9).reduce((sum, r) => sum + r.responseValue, 0),
        responses: responses.reduce((acc, r) => ({
          ...acc,
          [r.questionId]: { text: r.responseText, value: r.responseValue }
        }), {})
      },
      generatedAt: new Date().toISOString()
    };

    localStorage.setItem(summaryKey, JSON.stringify(summary));
  } catch {
    console.warn("[dev-autofill] Failed to save assessment summary to localStorage");
  }
}

/**
 * Autofill an entire onboarding session with test data
 *
 * This function triggers all the GraphQL mutations needed to complete
 * the onboarding flow, making the session ready for therapist matching.
 *
 * @param client - Apollo Client instance
 * @param sessionId - Session ID (with or without sess_ prefix)
 * @param options - Autofill options
 * @returns Promise resolving to success status and any errors
 *
 * @example
 * ```tsx
 * const { success, errors } = await devAutofillSession(
 *   apolloClient,
 *   "sess_abc123",
 *   {
 *     useSelfPay: true,
 *     onProgress: (step, current, total) => {
 *       console.log(`${step}: ${current}/${total}`);
 *     }
 *   }
 * );
 * ```
 */
export async function devAutofillSession(
  client: MutationClient,
  sessionId: string,
  options: AutofillOptions = {}
): Promise<{ success: boolean; errors: string[] }> {
  const {
    useSelfPay = false, // Default to insurance - simpler auth requirements
    onProgress,
    delayMs = 100,
    testData = {},
  } = options;

  const data = {
    ...DEV_TEST_DATA,
    ...testData,
    parent: { ...DEV_TEST_DATA.parent, ...testData.parent },
    child: { ...DEV_TEST_DATA.child, ...testData.child },
    insurance: { ...DEV_TEST_DATA.insurance, ...testData.insurance },
  };

  const errors: string[] = [];
  const totalSteps = useSelfPay ? 20 : 20; // parent + child + insurance + 16 assessment + complete
  let currentStep = 0;

  const reportProgress = (step: string, success: boolean) => {
    currentStep++;
    onProgress?.(step, currentStep, totalSteps, success);
  };

  try {
    // Step 1: Submit parent info
    const parentResult = await client.mutate<ParentMutationResult>({
      mutation: SUBMIT_PARENT_INFO,
      variables: {
        sessionId,
        parentInfo: data.parent,
      },
    });

    // Check for GraphQL errors first
    if (parentResult.errors?.length) {
      const errorMsgs = parentResult.errors.map((e) => e.message).join(", ");
      errors.push(`Parent error: ${errorMsgs}`);
      reportProgress("Parent info", false);
    } else if ((parentResult.data?.submitParentInfo?.errors?.length ?? 0) > 0) {
      errors.push(...(parentResult.data?.submitParentInfo?.errors ?? []));
      reportProgress("Parent info", false);
    } else {
      // Save parent data to localStorage (mimics manual form filling)
      saveToLocalStorage(sessionId, "parent", {
        firstName: data.parent.firstName,
        lastName: data.parent.lastName,
        email: data.parent.email,
        phone: data.parent.phone,
        relationshipToChild: data.parent.relationship,
      });
      reportProgress("Parent info", true);
    }

    await sleep(delayMs);

    // Step 2: Submit child info
    // Note: This mutation uses snake_case variable names (session_id, child_info)
    const childResult = await client.mutate<ChildMutationResult>({
      mutation: SUBMIT_CHILD_INFO,
      variables: {
        session_id: sessionId,
        child_info: {
          first_name: data.child.firstName,
          last_name: data.child.lastName,
          date_of_birth: data.child.dateOfBirth,
          gender: data.child.gender,
          grade: data.child.grade,
          primary_concerns: data.child.primaryConcerns,
        },
      },
    });

    // Check for GraphQL errors first
    if (childResult.errors?.length) {
      const errorMsgs = childResult.errors.map((e) => e.message).join(", ");
      errors.push(`Child error: ${errorMsgs}`);
      reportProgress("Child info", false);
    } else if ((childResult.data?.submitChildInfo?.errors?.length ?? 0) > 0) {
      errors.push(...(childResult.data?.submitChildInfo?.errors ?? []));
      reportProgress("Child info", false);
    } else {
      // Save child data to localStorage (mimics manual form filling)
      // Use field names that match form validation schema (ChildInfoInput)
      saveToLocalStorage(sessionId, "child", {
        firstName: data.child.firstName,
        lastName: data.child.lastName,
        dateOfBirth: data.child.dateOfBirth,
        pronouns: data.child.pronouns || data.child.gender, // Form uses pronouns
        gender: data.child.gender, // Keep gender for GraphQL compatibility
        grade: data.child.grade,
        primaryConcerns: data.child.primaryConcerns,
      });
      reportProgress("Child info", true);
    }

    await sleep(delayMs);

    // Step 3: Submit insurance or self-pay
    if (useSelfPay) {
      const selfPayResult = await client.mutate<SelfPayMutationResult>({
        mutation: SELECT_SELF_PAY,
        variables: { sessionId },
      });

      // Check for GraphQL errors
      if (selfPayResult.errors?.length) {
        const errorMsgs = selfPayResult.errors.map((e) => e.message).join(", ");
        errors.push(`Self-pay error: ${errorMsgs}`);
        reportProgress("Self-pay", false);
      } else if (!selfPayResult.data?.selectSelfPay?.success) {
        errors.push("Failed to select self-pay (no success)");
        reportProgress("Self-pay", false);
      } else {
        // Save self-pay selection to localStorage
        saveToLocalStorage(sessionId, "insurance", {
          carrier: "Self-Pay",
          memberId: "",
          groupNumber: "",
          subscriberName: data.parent.firstName + " " + data.parent.lastName,
          relationshipToSubscriber: "self",
        });
        reportProgress("Self-pay", true);
      }
    } else {
      const insuranceResult = await client.mutate<InsuranceMutationResult>({
        mutation: SUBMIT_INSURANCE_INFO,
        variables: {
          sessionId,
          ...data.insurance,
        },
      });

      // Check for GraphQL errors first
      if (insuranceResult.errors?.length) {
        const errorMsgs = insuranceResult.errors.map((e) => e.message).join(", ");
        errors.push(`Insurance GraphQL error: ${errorMsgs}`);
        reportProgress("Insurance", false);
      } else if ((insuranceResult.data?.submitInsuranceInfo?.errors?.length ?? 0) > 0) {
        const insuranceErrors = (insuranceResult.data?.submitInsuranceInfo?.errors ?? [])
          .map((e) => `${e.field}: ${e.message}`)
          .join(", ");
        errors.push(insuranceErrors);
        reportProgress("Insurance", false);
      } else {
        // Save insurance data to localStorage (mimics manual form filling)
        saveToLocalStorage(sessionId, "insurance", {
          carrier: data.insurance.payerName,
          memberId: data.insurance.memberId,
          groupNumber: data.insurance.groupNumber,
          subscriberName: data.insurance.subscriberName,
          relationshipToSubscriber: "self",
        });
        reportProgress("Insurance", true);
      }
    }

    await sleep(delayMs);

    // Check if we should continue - insurance must succeed for assessment
    const hasInsuranceError = errors.some(
      (e) => e.includes("Insurance") || e.includes("Self-pay")
    );
    if (hasInsuranceError) {
      // Skip assessment - it will fail without insurance
      errors.push("Skipping assessment - insurance/self-pay must succeed first");
      return {
        success: false,
        errors,
      };
    }

    // Step 4: Submit all 16 assessment responses
    for (const response of data.assessmentResponses) {
      const assessmentResult = await client.mutate<AssessmentMutationResult>({
        mutation: SUBMIT_ASSESSMENT_RESPONSE,
        variables: {
          sessionId,
          ...response,
        },
      });

      // Check for GraphQL errors first
      if (assessmentResult.errors?.length) {
        const errorMsgs = assessmentResult.errors.map((e) => e.message).join(", ");
        errors.push(`Assessment ${response.questionId}: ${errorMsgs}`);
        reportProgress(`Assessment ${response.questionId}`, false);
        // Stop on first assessment error to avoid spam
        break;
      } else if ((assessmentResult.data?.submitAssessmentResponse?.errors?.length ?? 0) > 0) {
        errors.push(...(assessmentResult.data?.submitAssessmentResponse?.errors ?? []));
        reportProgress(`Assessment ${response.questionId}`, false);
        // Stop on first assessment error
        break;
      } else {
        reportProgress(`Assessment ${response.questionId}`, true);
      }

      // Small delay between assessment questions
      await sleep(delayMs / 2);
    }

    // Save assessment summary to localStorage if all assessments succeeded
    if (!errors.some((e) => e.includes("Assessment"))) {
      saveAssessmentSummary(sessionId, data.assessmentResponses);
    }

    await sleep(delayMs);

    // Step 5: Complete assessment - transition session to assessment_complete status
    // This is required before booking an appointment
    const completeResult = await client.mutate<CompleteAssessmentResult>({
      mutation: COMPLETE_ASSESSMENT,
      variables: {
        input: {
          sessionId,
          force: true, // Force to skip prerequisite checks in dev
        },
      },
    });

    // Check for GraphQL errors first
    if (completeResult.errors?.length) {
      const errorMsgs = completeResult.errors.map((e) => e.message).join(", ");
      errors.push(`Complete assessment error: ${errorMsgs}`);
      reportProgress("Complete assessment", false);
    } else if (!completeResult.data?.completeAssessment?.success) {
      const completeErrors = completeResult.data?.completeAssessment?.errors ?? ["Unknown error"];
      errors.push(...completeErrors.map((e) => `Complete assessment: ${e}`));
      reportProgress("Complete assessment", false);
    } else {
      reportProgress("Complete assessment", true);
    }

    return {
      success: errors.length === 0,
      errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    errors.push(errorMessage);
    return {
      success: false,
      errors,
    };
  }
}

/**
 * Check if we're in a development environment
 * Autofill should only be available in development
 */
export function isDevEnvironment(): boolean {
  return process.env.NODE_ENV === "development";
}
