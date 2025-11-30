import { gql } from '@apollo/client';
import * as ApolloReactCommon from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client/react';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /**
   * # GraphQL API Schema: Parent Onboarding AI
   * # Version: 2.0
   * # This schema defines the contract between the Next.js frontend and the Ruby on Rails backend.
   * # Updated to match actual backend implementation.
   */
  DateTime: { input: string; output: string; }
  JSON: { input: Record<string, unknown>; output: Record<string, unknown>; }
};

/** Assessment responses and scoring */
export type Assessment = {
  __typename?: 'Assessment';
  consentGiven: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  responses: Scalars['JSON']['output'];
  riskFlags: Array<Scalars['String']['output']>;
  score: Maybe<Scalars['Int']['output']>;
  summary: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

/** Therapist availability status */
export type AvailabilityStatus =
  | 'AVAILABLE_NEXT_WEEK'
  | 'AVAILABLE_THIS_WEEK'
  | 'LIMITED_AVAILABILITY'
  | 'WAITLIST';

/** Child information */
export type Child = {
  __typename?: 'Child';
  createdAt: Scalars['DateTime']['output'];
  dateOfBirth: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  gender: Scalars['String']['output'];
  grade: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  schoolName: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

/** Response from createSession mutation */
export type CreateSessionPayload = {
  __typename?: 'CreateSessionPayload';
  refreshToken: Maybe<Scalars['String']['output']>;
  session: OnboardingSession;
  token: Scalars['String']['output'];
};

/** Insurance information */
export type Insurance = {
  __typename?: 'Insurance';
  createdAt: Scalars['DateTime']['output'];
  groupNumber: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  memberId: Scalars['String']['output'];
  payerName: Scalars['String']['output'];
  policyNumber: Maybe<Scalars['String']['output']>;
  subscriberName: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  verificationResult: Maybe<Scalars['JSON']['output']>;
  verificationStatus: VerificationStatus;
};

/** Match reason explaining why a therapist was recommended */
export type MatchReason = {
  __typename?: 'MatchReason';
  /** Optional icon identifier for UI display */
  icon: Maybe<Scalars['String']['output']>;
  /** Reason identifier (e.g., 'specialty_match', 'availability', 'experience') */
  id: Scalars['String']['output'];
  /** Human-readable reason text */
  text: Scalars['String']['output'];
};

/** Chat message in assessment conversation */
export type Message = {
  __typename?: 'Message';
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  metadata: Maybe<Scalars['JSON']['output']>;
  role: MessageRole;
};

/** Message sender role */
export type MessageRole =
  | 'ASSISTANT'
  | 'SYSTEM'
  | 'USER';

export type Mutation = {
  __typename?: 'Mutation';
  /**
   * Abandon an onboarding session explicitly.
   * Session data is retained per data retention policy.
   * Idempotent: abandoning already abandoned session succeeds.
   */
  abandonSession: Maybe<SessionAbandonmentPayload>;
  /**
   * Create a new anonymous onboarding session.
   * Returns session with JWT token and optional refresh token.
   */
  createSession: Maybe<CreateSessionPayload>;
  /**
   * Refresh access token using a valid refresh token.
   * Implements token rotation for security.
   */
  refreshToken: Maybe<RefreshTokenPayload>;
  /**
   * Request session recovery via email magic link.
   * Requires parent email to be collected first.
   */
  requestSessionRecovery: Maybe<RequestRecoveryPayload>;
  /**
   * Send a message in the AI-guided assessment chat.
   * Returns both the user message and AI assistant response.
   */
  sendMessage: Maybe<SendMessagePayload>;
  /**
   * Mark session as self-pay (no insurance).
   * Skips insurance verification step.
   */
  setSelfPay: Maybe<SetSelfPayPayload>;
  /**
   * Submit insurance information for verification.
   * Links insurance to the current onboarding session.
   */
  submitInsuranceInfo: Maybe<SubmitInsuranceInfoPayload>;
  /**
   * Update session progress with deep merge.
   * Extends session expiration by 1 hour.
   * Auto-transitions from STARTED to IN_PROGRESS on first update.
   */
  updateSessionProgress: Maybe<UpdateSessionProgressPayload>;
};


export type MutationAbandonSessionArgs = {
  sessionId: Scalars['ID']['input'];
};


export type MutationCreateSessionArgs = {
  deviceFingerprint?: InputMaybe<Scalars['String']['input']>;
  referralSource?: InputMaybe<Scalars['String']['input']>;
};


export type MutationRefreshTokenArgs = {
  deviceFingerprint?: InputMaybe<Scalars['String']['input']>;
  refreshToken: Scalars['String']['input'];
};


export type MutationRequestSessionRecoveryArgs = {
  sessionId: Scalars['ID']['input'];
};


export type MutationSendMessageArgs = {
  content: Scalars['String']['input'];
  sessionId: Scalars['ID']['input'];
};


export type MutationSetSelfPayArgs = {
  sessionId: Scalars['ID']['input'];
};


export type MutationSubmitInsuranceInfoArgs = {
  input: SubmitInsuranceInfoInput;
};


export type MutationUpdateSessionProgressArgs = {
  progress: Scalars['JSON']['input'];
  sessionId: Scalars['ID']['input'];
};

/** Relay Node interface for global object identification */
export type Node = {
  id: Scalars['ID']['output'];
};

/**
 * Onboarding session - the main entity tracking a parent's intake process.
 * ID is returned in CUID format with sess_ prefix (e.g., sess_abc123...).
 */
export type OnboardingSession = {
  __typename?: 'OnboardingSession';
  assessment: Maybe<Assessment>;
  child: Maybe<Child>;
  createdAt: Scalars['DateTime']['output'];
  expiresAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  insurance: Maybe<Insurance>;
  messages: Maybe<Array<Message>>;
  parent: Maybe<Parent>;
  /** Calculated progress indicators */
  progress: Progress;
  /** Raw session progress data */
  progressData: Scalars['JSON']['output'];
  referralSource: Maybe<Scalars['String']['output']>;
  status: SessionStatus;
  updatedAt: Scalars['DateTime']['output'];
};

/** Parent/guardian information */
export type Parent = {
  __typename?: 'Parent';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isGuardian: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  relationship: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** Progress indicators for onboarding session */
export type Progress = {
  __typename?: 'Progress';
  /** Array of completed phase names */
  completedPhases: Array<Scalars['String']['output']>;
  /** Current phase in the onboarding flow */
  currentPhase: Scalars['String']['output'];
  /** Estimated minutes to complete remaining phases (adaptive) */
  estimatedMinutesRemaining: Scalars['Int']['output'];
  /** Next phase in the sequence (null if at end) */
  nextPhase: Maybe<Scalars['String']['output']>;
  /** Progress percentage (0-100) based on completed required fields */
  percentage: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  /**
   * Get matched therapists for a session.
   * Requires valid JWT token. Returns 2-3 best-matched therapists
   * based on assessment results, child needs, and availability.
   */
  matchedTherapists: Maybe<TherapistMatchResults>;
  /** Relay-style node lookup */
  node: Maybe<Node>;
  /** Relay-style batch node lookup */
  nodes: Array<Maybe<Node>>;
  /**
   * Get session by ID.
   * Requires valid JWT token. User can only access their own session.
   */
  session: Maybe<OnboardingSession>;
  /**
   * Recover session using magic link token.
   * No authentication required (token is the credential).
   * Returns session with new JWT tokens.
   */
  sessionByRecoveryToken: Maybe<SessionRecoveryPayload>;
};


export type QueryMatchedTherapistsArgs = {
  sessionId: Scalars['ID']['input'];
};


export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryNodesArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type QuerySessionArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySessionByRecoveryTokenArgs = {
  recoveryToken: Scalars['String']['input'];
};

/** Response from refreshToken mutation */
export type RefreshTokenPayload = {
  __typename?: 'RefreshTokenPayload';
  error: Maybe<Scalars['String']['output']>;
  expiresIn: Maybe<Scalars['Int']['output']>;
  refreshToken: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  token: Maybe<Scalars['String']['output']>;
  tokenType: Maybe<Scalars['String']['output']>;
};

/** Parent/guardian relationship to child */
export type RelationshipType =
  | 'GRANDPARENT'
  | 'GUARDIAN'
  | 'OTHER'
  | 'PARENT';

/** Response from requestSessionRecovery mutation */
export type RequestRecoveryPayload = {
  __typename?: 'RequestRecoveryPayload';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

/** Response from sendMessage mutation */
export type SendMessagePayload = {
  __typename?: 'SendMessagePayload';
  assistantMessage: Message;
  errors: Maybe<Array<Scalars['String']['output']>>;
  userMessage: Message;
};

/** Response from abandonSession mutation */
export type SessionAbandonmentPayload = {
  __typename?: 'SessionAbandonmentPayload';
  session: OnboardingSession;
  success: Scalars['Boolean']['output'];
};

/** Minimal session info returned from createSession (before full onboarding data exists) */
export type SessionInfo = {
  __typename?: 'SessionInfo';
  id: Scalars['ID']['output'];
  status: Scalars['String']['output'];
};

/** Response from session recovery query */
export type SessionRecoveryPayload = {
  __typename?: 'SessionRecoveryPayload';
  refreshToken: Scalars['String']['output'];
  session: OnboardingSession;
  token: Scalars['String']['output'];
};

/** Session status enum matching backend OnboardingSession.status */
export type SessionStatus =
  | 'ABANDONED'
  | 'ASSESSMENT_COMPLETE'
  | 'EXPIRED'
  | 'INSURANCE_PENDING'
  | 'IN_PROGRESS'
  | 'STARTED'
  | 'SUBMITTED';

/** Response from setSelfPay mutation */
export type SetSelfPayPayload = {
  __typename?: 'SetSelfPayPayload';
  session: OnboardingSession;
};

/** Input for submitting insurance information */
export type SubmitInsuranceInfoInput = {
  groupNumber?: InputMaybe<Scalars['String']['input']>;
  memberId: Scalars['String']['input'];
  payerName: Scalars['String']['input'];
  relationshipToSubscriber: Scalars['String']['input'];
  sessionId: Scalars['ID']['input'];
  subscriberName: Scalars['String']['input'];
};

/** Response from submitInsuranceInfo mutation */
export type SubmitInsuranceInfoPayload = {
  __typename?: 'SubmitInsuranceInfoPayload';
  session: OnboardingSession;
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Subscribe to updates for a specific session */
  sessionUpdated: Maybe<OnboardingSession>;
};


export type SubscriptionSessionUpdatedArgs = {
  sessionId: Scalars['ID']['input'];
};

/** Therapist information for matching display */
export type Therapist = {
  __typename?: 'Therapist';
  /** Availability status */
  availabilityStatus: AvailabilityStatus;
  /** Human-readable availability text (e.g., 'Available this week') */
  availabilityText: Scalars['String']['output'];
  /** Brief bio or description */
  bio: Maybe<Scalars['String']['output']>;
  /** Professional credentials (e.g., 'LMFT', 'PhD', 'LCSW') */
  credentials: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /** Whether this is the best match (top recommendation) */
  isBestMatch: Scalars['Boolean']['output'];
  /** Reasons why this therapist was matched */
  matchReasons: Array<MatchReason>;
  /** Match quality score (0-100, higher is better) */
  matchScore: Scalars['Int']['output'];
  /** Full name of the therapist */
  name: Scalars['String']['output'];
  /** Professional photo URL */
  photoUrl: Maybe<Scalars['String']['output']>;
  /** Specialty areas (e.g., 'Anxiety', 'Teen Issues', 'ADHD') */
  specialties: Array<Scalars['String']['output']>;
  /** Years of experience */
  yearsOfExperience: Maybe<Scalars['Int']['output']>;
};

/** Therapist matching results */
export type TherapistMatchResults = {
  __typename?: 'TherapistMatchResults';
  /** General explanation of matching criteria */
  matchingCriteria: Scalars['String']['output'];
  /** List of matched therapists (2-3 typically) */
  therapists: Array<Therapist>;
  /** Total number of therapists matched */
  totalCount: Scalars['Int']['output'];
};

/** Response from updateSessionProgress mutation */
export type UpdateSessionProgressPayload = {
  __typename?: 'UpdateSessionProgressPayload';
  session: OnboardingSession;
};

/** Insurance verification status */
export type VerificationStatus =
  | 'FAILED'
  | 'IN_PROGRESS'
  | 'MANUAL_REVIEW'
  | 'PENDING'
  | 'SELF_PAY'
  | 'VERIFIED';

export type GetMatchedTherapistsQueryVariables = Exact<{
  sessionId: Scalars['ID']['input'];
}>;


export type GetMatchedTherapistsQuery = { __typename?: 'Query', matchedTherapists: { __typename?: 'TherapistMatchResults', totalCount: number, matchingCriteria: string, therapists: Array<{ __typename?: 'Therapist', id: string, name: string, credentials: string, photoUrl: string | null, specialties: Array<string>, availabilityStatus: AvailabilityStatus, availabilityText: string, yearsOfExperience: number | null, bio: string | null, matchScore: number, isBestMatch: boolean, matchReasons: Array<{ __typename?: 'MatchReason', id: string, text: string, icon: string | null }> }> } | null };

export type AbandonSessionMutationVariables = Exact<{
  sessionId: Scalars['ID']['input'];
}>;


export type AbandonSessionMutation = { __typename?: 'Mutation', abandonSession: { __typename?: 'SessionAbandonmentPayload', success: boolean, session: { __typename?: 'OnboardingSession', id: string, status: SessionStatus } } | null };

export type CreateSessionMutationVariables = Exact<{
  referralSource?: InputMaybe<Scalars['String']['input']>;
  deviceFingerprint?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateSessionMutation = { __typename?: 'Mutation', createSession: { __typename?: 'CreateSessionPayload', token: string, refreshToken: string | null, session: { __typename?: 'OnboardingSession', id: string, status: SessionStatus, expiresAt: string, createdAt: string, progress: { __typename?: 'Progress', percentage: number, currentPhase: string, completedPhases: Array<string>, nextPhase: string | null, estimatedMinutesRemaining: number } } } | null };

export type RefreshTokenMutationVariables = Exact<{
  refreshToken: Scalars['String']['input'];
  deviceFingerprint?: InputMaybe<Scalars['String']['input']>;
}>;


export type RefreshTokenMutation = { __typename?: 'Mutation', refreshToken: { __typename?: 'RefreshTokenPayload', success: boolean, error: string | null, token: string | null, refreshToken: string | null, tokenType: string | null, expiresIn: number | null } | null };

export type RequestSessionRecoveryMutationVariables = Exact<{
  sessionId: Scalars['ID']['input'];
}>;


export type RequestSessionRecoveryMutation = { __typename?: 'Mutation', requestSessionRecovery: { __typename?: 'RequestRecoveryPayload', success: boolean, message: string } | null };

export type SendMessageMutationVariables = Exact<{
  sessionId: Scalars['ID']['input'];
  content: Scalars['String']['input'];
}>;


export type SendMessageMutation = { __typename?: 'Mutation', sendMessage: { __typename?: 'SendMessagePayload', errors: Array<string> | null, userMessage: { __typename?: 'Message', id: string, role: MessageRole, content: string, createdAt: string }, assistantMessage: { __typename?: 'Message', id: string, role: MessageRole, content: string, createdAt: string } } | null };

export type SetSelfPayMutationVariables = Exact<{
  sessionId: Scalars['ID']['input'];
}>;


export type SetSelfPayMutation = { __typename?: 'Mutation', setSelfPay: { __typename?: 'SetSelfPayPayload', session: { __typename?: 'OnboardingSession', id: string, status: SessionStatus, insurance: { __typename?: 'Insurance', id: string, verificationStatus: VerificationStatus } | null } } | null };

export type SubmitInsuranceInfoMutationVariables = Exact<{
  input: SubmitInsuranceInfoInput;
}>;


export type SubmitInsuranceInfoMutation = { __typename?: 'Mutation', submitInsuranceInfo: { __typename?: 'SubmitInsuranceInfoPayload', session: { __typename?: 'OnboardingSession', id: string, status: SessionStatus, insurance: { __typename?: 'Insurance', id: string, payerName: string, subscriberName: string, memberId: string, groupNumber: string | null, verificationStatus: VerificationStatus } | null } } | null };

export type UpdateSessionProgressMutationVariables = Exact<{
  sessionId: Scalars['ID']['input'];
  progress: Scalars['JSON']['input'];
}>;


export type UpdateSessionProgressMutation = { __typename?: 'Mutation', updateSessionProgress: { __typename?: 'UpdateSessionProgressPayload', session: { __typename?: 'OnboardingSession', id: string, status: SessionStatus, expiresAt: string, updatedAt: string, progress: { __typename?: 'Progress', percentage: number, currentPhase: string, completedPhases: Array<string>, nextPhase: string | null, estimatedMinutesRemaining: number } } } | null };

export type GetSessionQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetSessionQuery = { __typename?: 'Query', session: { __typename?: 'OnboardingSession', id: string, status: SessionStatus, referralSource: string | null, expiresAt: string, createdAt: string, updatedAt: string, progress: { __typename?: 'Progress', percentage: number, currentPhase: string, completedPhases: Array<string>, nextPhase: string | null, estimatedMinutesRemaining: number }, parent: { __typename?: 'Parent', id: string, email: string, phone: string, firstName: string, lastName: string, relationship: string, isGuardian: boolean } | null, child: { __typename?: 'Child', id: string, firstName: string, lastName: string, dateOfBirth: string, gender: string, schoolName: string | null, grade: string | null } | null, assessment: { __typename?: 'Assessment', id: string, responses: Record<string, unknown>, riskFlags: Array<string>, summary: string | null, consentGiven: boolean, score: number | null } | null, insurance: { __typename?: 'Insurance', id: string, payerName: string, subscriberName: string, memberId: string, policyNumber: string | null, groupNumber: string | null, verificationStatus: VerificationStatus } | null, messages: Array<{ __typename?: 'Message', id: string, role: MessageRole, content: string, createdAt: string }> | null } | null };

export type SessionByRecoveryTokenQueryVariables = Exact<{
  recoveryToken: Scalars['String']['input'];
}>;


export type SessionByRecoveryTokenQuery = { __typename?: 'Query', sessionByRecoveryToken: { __typename?: 'SessionRecoveryPayload', token: string, refreshToken: string, session: { __typename?: 'OnboardingSession', id: string, status: SessionStatus, expiresAt: string, createdAt: string, updatedAt: string, progress: { __typename?: 'Progress', percentage: number, currentPhase: string, completedPhases: Array<string>, nextPhase: string | null, estimatedMinutesRemaining: number } } } | null };

export type SessionUpdatedSubscriptionVariables = Exact<{
  sessionId: Scalars['ID']['input'];
}>;


export type SessionUpdatedSubscription = { __typename?: 'Subscription', sessionUpdated: { __typename?: 'OnboardingSession', id: string, status: SessionStatus, expiresAt: string, updatedAt: string, progress: { __typename?: 'Progress', percentage: number, currentPhase: string, completedPhases: Array<string>, nextPhase: string | null, estimatedMinutesRemaining: number } } | null };


export const GetMatchedTherapistsDocument = gql`
    query GetMatchedTherapists($sessionId: ID!) {
  matchedTherapists(sessionId: $sessionId) {
    therapists {
      id
      name
      credentials
      photoUrl
      specialties
      availabilityStatus
      availabilityText
      yearsOfExperience
      bio
      matchScore
      isBestMatch
      matchReasons {
        id
        text
        icon
      }
    }
    totalCount
    matchingCriteria
  }
}
    `;
export function useGetMatchedTherapistsQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetMatchedTherapistsQuery, GetMatchedTherapistsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetMatchedTherapistsQuery, GetMatchedTherapistsQueryVariables>(GetMatchedTherapistsDocument, options);
      }
export function useGetMatchedTherapistsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetMatchedTherapistsQuery, GetMatchedTherapistsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetMatchedTherapistsQuery, GetMatchedTherapistsQueryVariables>(GetMatchedTherapistsDocument, options);
        }
export type GetMatchedTherapistsQueryHookResult = ReturnType<typeof useGetMatchedTherapistsQuery>;
export type GetMatchedTherapistsLazyQueryHookResult = ReturnType<typeof useGetMatchedTherapistsLazyQuery>;
export const AbandonSessionDocument = gql`
    mutation AbandonSession($sessionId: ID!) {
  abandonSession(sessionId: $sessionId) {
    session {
      id
      status
    }
    success
  }
}
    `;
export function useAbandonSessionMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<AbandonSessionMutation, AbandonSessionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<AbandonSessionMutation, AbandonSessionMutationVariables>(AbandonSessionDocument, options);
      }
export type AbandonSessionMutationHookResult = ReturnType<typeof useAbandonSessionMutation>;
export const CreateSessionDocument = gql`
    mutation CreateSession($referralSource: String, $deviceFingerprint: String) {
  createSession(
    referralSource: $referralSource
    deviceFingerprint: $deviceFingerprint
  ) {
    session {
      id
      status
      progress {
        percentage
        currentPhase
        completedPhases
        nextPhase
        estimatedMinutesRemaining
      }
      expiresAt
      createdAt
    }
    token
    refreshToken
  }
}
    `;
export function useCreateSessionMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateSessionMutation, CreateSessionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateSessionMutation, CreateSessionMutationVariables>(CreateSessionDocument, options);
      }
export type CreateSessionMutationHookResult = ReturnType<typeof useCreateSessionMutation>;
export const RefreshTokenDocument = gql`
    mutation RefreshToken($refreshToken: String!, $deviceFingerprint: String) {
  refreshToken(refreshToken: $refreshToken, deviceFingerprint: $deviceFingerprint) {
    success
    error
    token
    refreshToken
    tokenType
    expiresIn
  }
}
    `;
export function useRefreshTokenMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RefreshTokenMutation, RefreshTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<RefreshTokenMutation, RefreshTokenMutationVariables>(RefreshTokenDocument, options);
      }
export type RefreshTokenMutationHookResult = ReturnType<typeof useRefreshTokenMutation>;
export const RequestSessionRecoveryDocument = gql`
    mutation RequestSessionRecovery($sessionId: ID!) {
  requestSessionRecovery(sessionId: $sessionId) {
    success
    message
  }
}
    `;
export function useRequestSessionRecoveryMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RequestSessionRecoveryMutation, RequestSessionRecoveryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<RequestSessionRecoveryMutation, RequestSessionRecoveryMutationVariables>(RequestSessionRecoveryDocument, options);
      }
export type RequestSessionRecoveryMutationHookResult = ReturnType<typeof useRequestSessionRecoveryMutation>;
export const SendMessageDocument = gql`
    mutation SendMessage($sessionId: ID!, $content: String!) {
  sendMessage(sessionId: $sessionId, content: $content) {
    userMessage {
      id
      role
      content
      createdAt
    }
    assistantMessage {
      id
      role
      content
      createdAt
    }
    errors
  }
}
    `;
export function useSendMessageMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SendMessageMutation, SendMessageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SendMessageMutation, SendMessageMutationVariables>(SendMessageDocument, options);
      }
export type SendMessageMutationHookResult = ReturnType<typeof useSendMessageMutation>;
export const SetSelfPayDocument = gql`
    mutation SetSelfPay($sessionId: ID!) {
  setSelfPay(sessionId: $sessionId) {
    session {
      id
      status
      insurance {
        id
        verificationStatus
      }
    }
  }
}
    `;
export function useSetSelfPayMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SetSelfPayMutation, SetSelfPayMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SetSelfPayMutation, SetSelfPayMutationVariables>(SetSelfPayDocument, options);
      }
export type SetSelfPayMutationHookResult = ReturnType<typeof useSetSelfPayMutation>;
export const SubmitInsuranceInfoDocument = gql`
    mutation SubmitInsuranceInfo($input: SubmitInsuranceInfoInput!) {
  submitInsuranceInfo(input: $input) {
    session {
      id
      status
      insurance {
        id
        payerName
        subscriberName
        memberId
        groupNumber
        verificationStatus
      }
    }
  }
}
    `;
export function useSubmitInsuranceInfoMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SubmitInsuranceInfoMutation, SubmitInsuranceInfoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SubmitInsuranceInfoMutation, SubmitInsuranceInfoMutationVariables>(SubmitInsuranceInfoDocument, options);
      }
export type SubmitInsuranceInfoMutationHookResult = ReturnType<typeof useSubmitInsuranceInfoMutation>;
export const UpdateSessionProgressDocument = gql`
    mutation UpdateSessionProgress($sessionId: ID!, $progress: JSON!) {
  updateSessionProgress(sessionId: $sessionId, progress: $progress) {
    session {
      id
      status
      progress {
        percentage
        currentPhase
        completedPhases
        nextPhase
        estimatedMinutesRemaining
      }
      expiresAt
      updatedAt
    }
  }
}
    `;
export function useUpdateSessionProgressMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateSessionProgressMutation, UpdateSessionProgressMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateSessionProgressMutation, UpdateSessionProgressMutationVariables>(UpdateSessionProgressDocument, options);
      }
export type UpdateSessionProgressMutationHookResult = ReturnType<typeof useUpdateSessionProgressMutation>;
export const GetSessionDocument = gql`
    query GetSession($id: ID!) {
  session(id: $id) {
    id
    status
    progress {
      percentage
      currentPhase
      completedPhases
      nextPhase
      estimatedMinutesRemaining
    }
    referralSource
    expiresAt
    createdAt
    updatedAt
    parent {
      id
      email
      phone
      firstName
      lastName
      relationship
      isGuardian
    }
    child {
      id
      firstName
      lastName
      dateOfBirth
      gender
      schoolName
      grade
    }
    assessment {
      id
      responses
      riskFlags
      summary
      consentGiven
      score
    }
    insurance {
      id
      payerName
      subscriberName
      memberId
      policyNumber
      groupNumber
      verificationStatus
    }
    messages {
      id
      role
      content
      createdAt
    }
  }
}
    `;
export function useGetSessionQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetSessionQuery, GetSessionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetSessionQuery, GetSessionQueryVariables>(GetSessionDocument, options);
      }
export function useGetSessionLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetSessionQuery, GetSessionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetSessionQuery, GetSessionQueryVariables>(GetSessionDocument, options);
        }
export type GetSessionQueryHookResult = ReturnType<typeof useGetSessionQuery>;
export type GetSessionLazyQueryHookResult = ReturnType<typeof useGetSessionLazyQuery>;
export const SessionByRecoveryTokenDocument = gql`
    query SessionByRecoveryToken($recoveryToken: String!) {
  sessionByRecoveryToken(recoveryToken: $recoveryToken) {
    session {
      id
      status
      progress {
        percentage
        currentPhase
        completedPhases
        nextPhase
        estimatedMinutesRemaining
      }
      expiresAt
      createdAt
      updatedAt
    }
    token
    refreshToken
  }
}
    `;
export function useSessionByRecoveryTokenQuery(baseOptions: ApolloReactHooks.QueryHookOptions<SessionByRecoveryTokenQuery, SessionByRecoveryTokenQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<SessionByRecoveryTokenQuery, SessionByRecoveryTokenQueryVariables>(SessionByRecoveryTokenDocument, options);
      }
export function useSessionByRecoveryTokenLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<SessionByRecoveryTokenQuery, SessionByRecoveryTokenQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<SessionByRecoveryTokenQuery, SessionByRecoveryTokenQueryVariables>(SessionByRecoveryTokenDocument, options);
        }
export type SessionByRecoveryTokenQueryHookResult = ReturnType<typeof useSessionByRecoveryTokenQuery>;
export type SessionByRecoveryTokenLazyQueryHookResult = ReturnType<typeof useSessionByRecoveryTokenLazyQuery>;
export const SessionUpdatedDocument = gql`
    subscription SessionUpdated($sessionId: ID!) {
  sessionUpdated(sessionId: $sessionId) {
    id
    status
    progress {
      percentage
      currentPhase
      completedPhases
      nextPhase
      estimatedMinutesRemaining
    }
    expiresAt
    updatedAt
  }
}
    `;
export function useSessionUpdatedSubscription(baseOptions: ApolloReactHooks.SubscriptionHookOptions<SessionUpdatedSubscription, SessionUpdatedSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useSubscription<SessionUpdatedSubscription, SessionUpdatedSubscriptionVariables>(SessionUpdatedDocument, options);
      }
export type SessionUpdatedSubscriptionHookResult = ReturnType<typeof useSessionUpdatedSubscription>;