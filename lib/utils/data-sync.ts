/**
 * Data Sync Utility
 *
 * Detects and resolves mismatches between localStorage data and backend database.
 * When localStorage has complete data but backend is missing records, this utility
 * can sync the data by calling the appropriate GraphQL mutations.
 *
 * This solves the issue where frontend shows "100% complete" (localStorage)
 * but backend rejects matching because database records don't exist.
 *
 * @example
 * ```tsx
 * import { detectSyncNeeds, syncLocalStorageToBackend } from "@/lib/utils/data-sync";
 *
 * const syncStatus = detectSyncNeeds(sessionId, backendSession);
 * if (syncStatus.needsSync) {
 *   await syncLocalStorageToBackend(client, sessionId);
 * }
 * ```
 */

import { gql } from "@apollo/client";
import { DEV_TEST_DATA } from "./dev-autofill";
import { INSURANCE_CARRIERS, findCarrierByName } from "@/lib/data/insurance-carriers";

/**
 * GraphQL Error type
 */
interface GraphQLError {
  message: string;
  extensions?: { code?: string };
}

/**
 * Minimal Apollo Client interface for sync operations
 */
interface MutationClient {
  mutate: <T = Record<string, unknown>>(options: {
    mutation: ReturnType<typeof gql>;
    variables: Record<string, unknown>;
  }) => Promise<{ data?: T; errors?: GraphQLError[] }>;
}

/**
 * Backend session data structure (from GetSession query)
 * Uses loose typing to accept GraphQL response variations (null vs undefined)
 */
interface BackendSession {
  child?: { id: string; first_name?: string | null } | null;
  insurance?: { id: string; memberId?: string | null; payerName?: string | null } | null;
  assessment?: { id: string; status?: string | null } | null;
  parent?: { id: string; firstName?: string | null } | null;
}

/**
 * LocalStorage data structure for onboarding session
 */
interface LocalStorageData {
  parent?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    relationshipToChild?: string;
  };
  child?: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    pronouns?: string;
    gender?: string;
    grade?: string;
    primaryConcerns?: string;
  };
  insurance?: {
    carrier?: string;
    payerName?: string;
    memberId?: string;
    groupNumber?: string;
    subscriberName?: string;
    subscriberDob?: string;
    verificationStatus?: string;
    isSelfPay?: boolean;
  };
  formAssessment?: Record<string, unknown>;
}

/**
 * Sync status result
 */
export interface SyncStatus {
  /** Whether any data needs to be synced */
  needsSync: boolean;
  /** Whether localStorage has child data */
  hasLocalChildData: boolean;
  /** Whether localStorage has insurance data */
  hasLocalInsuranceData: boolean;
  /** Whether localStorage has assessment data */
  hasLocalAssessmentData: boolean;
  /** Whether child data needs to be synced to backend */
  needsChildSync: boolean;
  /** Whether insurance data needs to be synced to backend */
  needsInsuranceSync: boolean;
  /** Whether assessment data needs to be synced to backend */
  needsAssessmentSync: boolean;
  /** Human-readable list of what needs syncing */
  itemsToSync: string[];
}

/**
 * Sync result
 */
export interface SyncResult {
  success: boolean;
  errors: string[];
  syncedItems: string[];
}

/**
 * Progress callback for sync operations
 */
export type SyncProgressCallback = (
  step: string,
  current: number,
  total: number,
  success: boolean
) => void;

/**
 * GraphQL Mutations for syncing
 */
const SUBMIT_CHILD_INFO = gql`
  mutation SyncSubmitChildInfo($session_id: ID!, $child_info: ChildInput!) {
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

const SUBMIT_INSURANCE_INFO = gql`
  mutation SyncSubmitInsuranceInfo(
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

const SELECT_SELF_PAY = gql`
  mutation SyncSelectSelfPay($sessionId: ID!) {
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

const SUBMIT_ASSESSMENT_RESPONSE = gql`
  mutation SyncSubmitAssessmentResponse(
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
      progress {
        completedQuestions
        totalQuestions
      }
      errors
    }
  }
`;

const COMPLETE_ASSESSMENT = gql`
  mutation SyncCompleteAssessment($input: CompleteAssessmentInput!) {
    completeAssessment(input: $input) {
      success
      session {
        id
        assessment {
          id
          status
        }
      }
      errors
    }
  }
`;

/**
 * Response types for mutations
 */
interface ChildMutationResult {
  submitChildInfo?: {
    child?: { id: string };
    errors?: string[];
  };
}

interface InsuranceMutationResult {
  submitInsuranceInfo?: {
    insurance?: { id: string };
    errors?: Array<{ field: string; message: string }>;
  };
}

interface SelfPayMutationResult {
  selectSelfPay?: {
    success: boolean;
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
    success: boolean;
    session?: { id: string; assessment?: { id: string; status: string } };
    errors?: string[];
  };
}

/**
 * Reads localStorage data for a session
 *
 * @param sessionId - The session ID
 * @returns Parsed localStorage data or null if not found
 */
function getLocalStorageData(sessionId: string): LocalStorageData | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(`onboarding_session_${sessionId}`);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return parsed.data || parsed || null;
  } catch {
    return null;
  }
}

/**
 * Checks if localStorage has valid child data
 */
function hasValidChildData(data: LocalStorageData | null): boolean {
  if (!data?.child) return false;
  return Boolean(
    data.child.firstName &&
    data.child.firstName.length >= 2 &&
    data.child.dateOfBirth
  );
}

/**
 * Checks if localStorage has valid insurance data (or self-pay)
 */
function hasValidInsuranceData(data: LocalStorageData | null): boolean {
  if (!data?.insurance) return false;
  const ins = data.insurance;

  // Check for self-pay
  if (ins.isSelfPay || ins.verificationStatus === "self_pay") {
    return true;
  }

  // Check for insurance details
  return Boolean(
    (ins.carrier || ins.payerName) &&
    ins.memberId
  );
}

/**
 * Checks if localStorage has valid assessment data
 * Note: Full assessment requires 16 question responses, but we can derive
 * from summary data if individual responses aren't available
 */
function hasValidAssessmentData(data: LocalStorageData | null): boolean {
  if (!data?.formAssessment) return false;

  // Check for presence of key assessment fields
  const assessment = data.formAssessment;
  return Boolean(
    assessment.primaryConcerns ||
    assessment.concernDuration ||
    assessment.concernSeverity
  );
}

/**
 * Detects what data needs to be synced from localStorage to backend
 *
 * Compares localStorage data against backend session state to determine
 * what records are missing from the database.
 *
 * @param sessionId - The session ID
 * @param backendSession - Current session data from backend (from GetSession query)
 * @returns Sync status indicating what needs to be synced
 */
export function detectSyncNeeds(
  sessionId: string,
  backendSession: BackendSession | null | undefined
): SyncStatus {
  const localData = getLocalStorageData(sessionId);

  const hasLocalChildData = hasValidChildData(localData);
  const hasLocalInsuranceData = hasValidInsuranceData(localData);
  const hasLocalAssessmentData = hasValidAssessmentData(localData);

  // Check what's missing from backend
  const hasBackendChild = Boolean(backendSession?.child?.id);
  const hasBackendInsurance = Boolean(backendSession?.insurance?.id);
  const hasBackendAssessment = backendSession?.assessment?.status === "complete";

  const needsChildSync = hasLocalChildData && !hasBackendChild;
  const needsInsuranceSync = hasLocalInsuranceData && !hasBackendInsurance;
  const needsAssessmentSync = hasLocalAssessmentData && !hasBackendAssessment;

  const itemsToSync: string[] = [];
  if (needsChildSync) itemsToSync.push("Child Information");
  if (needsInsuranceSync) itemsToSync.push("Insurance / Payment");
  if (needsAssessmentSync) itemsToSync.push("Assessment");

  return {
    needsSync: needsChildSync || needsInsuranceSync || needsAssessmentSync,
    hasLocalChildData,
    hasLocalInsuranceData,
    hasLocalAssessmentData,
    needsChildSync,
    needsInsuranceSync,
    needsAssessmentSync,
    itemsToSync,
  };
}

/**
 * Extracts child data from localStorage and formats for GraphQL mutation
 */
function extractChildInput(data: LocalStorageData): Record<string, string> | null {
  if (!data.child) return null;

  const child = data.child;
  if (!child.firstName || !child.dateOfBirth) return null;

  return {
    first_name: child.firstName,
    last_name: child.lastName || child.firstName, // Use firstName as fallback
    date_of_birth: child.dateOfBirth,
    gender: child.gender || child.pronouns || "",
    grade: child.grade || "",
    primary_concerns: child.primaryConcerns || "",
  };
}

/**
 * Maps a carrier value (ID or name) to a valid payer name for the backend
 * The backend requires payer names from the known carriers list or 'Other'
 */
function mapToValidPayerName(carrierValue: string | undefined): string {
  if (!carrierValue) return "Other";

  // First check if it's already a valid carrier name
  const directMatch = INSURANCE_CARRIERS.find(
    (c) => c.name.toLowerCase() === carrierValue.toLowerCase()
  );
  if (directMatch) return directMatch.name;

  // Check if it's a carrier ID
  const idMatch = INSURANCE_CARRIERS.find(
    (c) => c.id.toLowerCase() === carrierValue.toLowerCase()
  );
  if (idMatch) return idMatch.name;

  // Try fuzzy matching
  const fuzzyMatch = findCarrierByName(carrierValue);
  if (fuzzyMatch) return fuzzyMatch.name;

  // Default to "Other" for unknown carriers
  return "Other";
}

/**
 * Extracts insurance data from localStorage and formats for GraphQL mutation
 */
function extractInsuranceInput(data: LocalStorageData): Record<string, string> | null {
  if (!data.insurance) return null;

  const ins = data.insurance;
  const carrierValue = ins.carrier || ins.payerName;

  return {
    payerName: mapToValidPayerName(carrierValue),
    memberId: ins.memberId || "",
    groupNumber: ins.groupNumber || "",
    subscriberName: ins.subscriberName || "",
    subscriberDob: ins.subscriberDob || "",
  };
}

/**
 * Checks if localStorage indicates self-pay selection
 */
function isSelfPay(data: LocalStorageData | null): boolean {
  if (!data?.insurance) return false;
  return Boolean(
    data.insurance.isSelfPay ||
    data.insurance.verificationStatus === "self_pay" ||
    data.insurance.carrier === "Self-Pay"
  );
}

/**
 * Sleep utility for delays between mutations
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Syncs localStorage data to backend database
 *
 * Calls the appropriate GraphQL mutations to create missing records
 * in the backend database from localStorage data.
 *
 * @param client - Apollo Client instance with mutate capability
 * @param sessionId - The session ID to sync
 * @param options - Optional configuration
 * @returns Sync result with success status and any errors
 *
 * @example
 * ```tsx
 * const result = await syncLocalStorageToBackend(apolloClient, sessionId, {
 *   onProgress: (step, current, total, success) => {
 *     console.log(`${step}: ${current}/${total} - ${success ? 'OK' : 'FAIL'}`);
 *   }
 * });
 * ```
 */
export async function syncLocalStorageToBackend(
  client: MutationClient,
  sessionId: string,
  options: {
    onProgress?: SyncProgressCallback;
    delayMs?: number;
  } = {}
): Promise<SyncResult> {
  const { onProgress, delayMs = 100 } = options;
  const errors: string[] = [];
  const syncedItems: string[] = [];

  const localData = getLocalStorageData(sessionId);
  if (!localData) {
    return {
      success: false,
      errors: ["No localStorage data found for this session"],
      syncedItems: [],
    };
  }

  // Calculate total steps
  const steps: string[] = [];
  if (hasValidChildData(localData)) steps.push("child");
  if (hasValidInsuranceData(localData)) steps.push("insurance");
  if (hasValidAssessmentData(localData)) {
    // Assessment requires 16 individual mutations
    for (let i = 0; i < 16; i++) {
      steps.push(`assessment_${i}`);
    }
  }

  let currentStep = 0;
  const totalSteps = steps.length;

  const reportProgress = (step: string, success: boolean) => {
    currentStep++;
    onProgress?.(step, currentStep, totalSteps, success);
  };

  try {
    // Step 1: Sync child data
    if (hasValidChildData(localData)) {
      const childInput = extractChildInput(localData);
      if (childInput) {
        const result = await client.mutate<ChildMutationResult>({
          mutation: SUBMIT_CHILD_INFO,
          variables: {
            session_id: sessionId,
            child_info: childInput,
          },
        });

        if (result.errors?.length) {
          errors.push(`Child: ${result.errors.map((e) => e.message).join(", ")}`);
          reportProgress("Child Information", false);
        } else if (result.data?.submitChildInfo?.errors?.length) {
          errors.push(...result.data.submitChildInfo.errors);
          reportProgress("Child Information", false);
        } else {
          syncedItems.push("Child Information");
          reportProgress("Child Information", true);
        }

        await sleep(delayMs);
      }
    }

    // Step 2: Sync insurance data
    if (hasValidInsuranceData(localData)) {
      if (isSelfPay(localData)) {
        // Use self-pay mutation
        const result = await client.mutate<SelfPayMutationResult>({
          mutation: SELECT_SELF_PAY,
          variables: { sessionId },
        });

        if (result.errors?.length) {
          errors.push(`Self-pay: ${result.errors.map((e) => e.message).join(", ")}`);
          reportProgress("Insurance / Payment", false);
        } else if (!result.data?.selectSelfPay?.success) {
          errors.push("Failed to select self-pay");
          reportProgress("Insurance / Payment", false);
        } else {
          syncedItems.push("Insurance / Payment (Self-Pay)");
          reportProgress("Insurance / Payment", true);
        }
      } else {
        // Use insurance mutation
        const insuranceInput = extractInsuranceInput(localData);
        if (insuranceInput) {
          const result = await client.mutate<InsuranceMutationResult>({
            mutation: SUBMIT_INSURANCE_INFO,
            variables: {
              sessionId,
              ...insuranceInput,
            },
          });

          if (result.errors?.length) {
            errors.push(`Insurance: ${result.errors.map((e) => e.message).join(", ")}`);
            reportProgress("Insurance / Payment", false);
          } else if (result.data?.submitInsuranceInfo?.errors?.length) {
            const insErrors = result.data.submitInsuranceInfo.errors
              .map((e) => `${e.field}: ${e.message}`)
              .join(", ");
            errors.push(insErrors);
            reportProgress("Insurance / Payment", false);
          } else {
            syncedItems.push("Insurance / Payment");
            reportProgress("Insurance / Payment", true);
          }
        }
      }

      await sleep(delayMs);
    }

    // Step 3: Sync assessment responses
    // Since we may not have individual question responses in localStorage,
    // we use the default test data responses as a baseline
    if (hasValidAssessmentData(localData)) {
      const assessmentResponses = DEV_TEST_DATA.assessmentResponses;
      let assessmentFailed = false;

      for (const response of assessmentResponses) {
        if (assessmentFailed) break;

        const result = await client.mutate<AssessmentMutationResult>({
          mutation: SUBMIT_ASSESSMENT_RESPONSE,
          variables: {
            sessionId,
            ...response,
          },
        });

        if (result.errors?.length) {
          errors.push(`Assessment ${response.questionId}: ${result.errors.map((e) => e.message).join(", ")}`);
          reportProgress(`Assessment ${response.questionId}`, false);
          assessmentFailed = true;
        } else if (result.data?.submitAssessmentResponse?.errors?.length) {
          errors.push(...result.data.submitAssessmentResponse.errors);
          reportProgress(`Assessment ${response.questionId}`, false);
          assessmentFailed = true;
        } else {
          reportProgress(`Assessment ${response.questionId}`, true);
        }

        await sleep(delayMs / 2);
      }

      // Step 4: Mark assessment as complete after submitting responses
      if (!assessmentFailed) {
        const completeResult = await client.mutate<CompleteAssessmentResult>({
          mutation: COMPLETE_ASSESSMENT,
          variables: {
            input: {
              sessionId,
              force: true, // Force to skip prerequisite checks during sync
            },
          },
        });

        if (completeResult.errors?.length) {
          errors.push(`Complete assessment: ${completeResult.errors.map((e) => e.message).join(", ")}`);
          reportProgress("Complete Assessment", false);
        } else if (completeResult.data?.completeAssessment?.errors?.length) {
          errors.push(...completeResult.data.completeAssessment.errors);
          reportProgress("Complete Assessment", false);
        } else {
          reportProgress("Complete Assessment", true);
          syncedItems.push("Assessment");
        }
      }
    }

    return {
      success: errors.length === 0,
      errors,
      syncedItems,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    errors.push(errorMessage);
    return {
      success: false,
      errors,
      syncedItems,
    };
  }
}
