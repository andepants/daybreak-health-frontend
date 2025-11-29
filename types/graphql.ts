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
};

export type Appointment = {
  __typename?: 'Appointment';
  confirmationId: Scalars['String']['output'];
  endTime: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  startTime: Scalars['String']['output'];
  therapistName: Scalars['String']['output'];
};

export type Assessment = {
  __typename?: 'Assessment';
  conversationHistory: Array<ChatMessage>;
  id: Scalars['ID']['output'];
  isComplete: Maybe<Scalars['Boolean']['output']>;
  isFitForDaybreak: Maybe<Scalars['Boolean']['output']>;
  suggestedNextSteps: Maybe<Scalars['String']['output']>;
  summary: Maybe<AssessmentSummary>;
};

export type AssessmentSummary = {
  __typename?: 'AssessmentSummary';
  childName: Scalars['String']['output'];
  generatedAt: Scalars['String']['output'];
  keyConcerns: Array<Scalars['String']['output']>;
  recommendedFocus: Maybe<Array<Scalars['String']['output']>>;
};

export type AssessmentSummaryPayload = {
  __typename?: 'AssessmentSummaryPayload';
  summary: AssessmentSummary;
};

export type ChatMessage = {
  __typename?: 'ChatMessage';
  content: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  sender: MessageSender;
  timestamp: Scalars['String']['output'];
};

export type Child = {
  __typename?: 'Child';
  concerns: Maybe<Array<Scalars['String']['output']>>;
  createdAt: Scalars['String']['output'];
  dateOfBirth: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  pronouns: Maybe<Scalars['String']['output']>;
};

export type ChildInfo = {
  __typename?: 'ChildInfo';
  concerns: Maybe<Array<Scalars['String']['output']>>;
  dateOfBirth: Maybe<Scalars['String']['output']>;
  firstName: Maybe<Scalars['String']['output']>;
  lastName: Maybe<Scalars['String']['output']>;
  pronouns: Maybe<Scalars['String']['output']>;
};

export type ConfirmSummaryPayload = {
  __typename?: 'ConfirmSummaryPayload';
  session: OnboardingSession;
};

export type CostEstimate = {
  __typename?: 'CostEstimate';
  copayPerSession: Maybe<Scalars['Float']['output']>;
  deductibleRemaining: Maybe<Scalars['Float']['output']>;
  notes: Maybe<Scalars['String']['output']>;
};

export type Demographics = {
  __typename?: 'Demographics';
  child: Maybe<ChildInfo>;
  isComplete: Scalars['Boolean']['output'];
  parent: Maybe<ParentInfo>;
};

export type InsuranceInformation = {
  __typename?: 'InsuranceInformation';
  groupId: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageFileUrl: Maybe<Scalars['String']['output']>;
  memberId: Scalars['String']['output'];
  planName: Maybe<Scalars['String']['output']>;
  provider: Scalars['String']['output'];
};

export type MessageSender =
  | 'AI'
  | 'SUPPORT'
  | 'USER';

export type Mutation = {
  __typename?: 'Mutation';
  completeAssessment: Maybe<AssessmentSummaryPayload>;
  confirmAssessmentSummary: Maybe<ConfirmSummaryPayload>;
  resetAssessment: Maybe<ResetAssessmentPayload>;
  scheduleAppointment: Maybe<Appointment>;
  sendSessionReminder: Maybe<SendSessionReminderPayload>;
  sendSupportChatMessage: Maybe<ChatMessage>;
  startOnboarding: Maybe<OnboardingSession>;
  submitAssessmentMessage: Maybe<Assessment>;
  submitInsuranceImage: Maybe<InsuranceInformation>;
  submitInsuranceInfo: Maybe<OnboardingSession>;
  updateDemographics: Maybe<OnboardingSession>;
  updateParentInfo: Maybe<UpdateParentInfoPayload>;
};


export type MutationCompleteAssessmentArgs = {
  sessionId: Scalars['ID']['input'];
};


export type MutationConfirmAssessmentSummaryArgs = {
  confirmed: Scalars['Boolean']['input'];
  sessionId: Scalars['ID']['input'];
};


export type MutationResetAssessmentArgs = {
  sessionId: Scalars['ID']['input'];
};


export type MutationScheduleAppointmentArgs = {
  input: ScheduleAppointmentInput;
};


export type MutationSendSessionReminderArgs = {
  input: SendSessionReminderInput;
};


export type MutationSendSupportChatMessageArgs = {
  content: Scalars['String']['input'];
  onboardingSessionId: Scalars['ID']['input'];
};


export type MutationStartOnboardingArgs = {
  input: StartOnboardingInput;
};


export type MutationSubmitAssessmentMessageArgs = {
  input: SubmitAssessmentMessageInput;
};


export type MutationSubmitInsuranceImageArgs = {
  onboardingSessionId: Scalars['ID']['input'];
};


export type MutationSubmitInsuranceInfoArgs = {
  input: SubmitInsuranceInfoInput;
};


export type MutationUpdateDemographicsArgs = {
  input: UpdateDemographicsInput;
};


export type MutationUpdateParentInfoArgs = {
  input: ParentInfoInput;
  sessionId: Scalars['ID']['input'];
};

export type OnboardingSession = {
  __typename?: 'OnboardingSession';
  appointment: Maybe<Appointment>;
  assessment: Maybe<Assessment>;
  child: Child;
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  insuranceInfo: Maybe<InsuranceInformation>;
  parent: User;
  status: OnboardingStatus;
  updatedAt: Scalars['String']['output'];
};

/**
 * # GraphQL API Schema: Parent Onboarding AI
 * # Version: 1.0
 * # This schema defines the contract between the Next.js frontend and the Ruby on Rails backend.
 */
export type OnboardingStatus =
  | 'ASSESSMENT_COMPLETED'
  | 'ASSESSMENT_STARTED'
  | 'DEMOGRAPHICS_COMPLETED'
  | 'INSURANCE_COMPLETED'
  | 'INSURANCE_PENDING'
  | 'ONBOARDING_COMPLETE'
  | 'SCHEDULING_COMPLETED'
  | 'SCHEDULING_PENDING';

export type ParentInfo = {
  __typename?: 'ParentInfo';
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  relationshipToChild: RelationshipType;
};

export type ParentInfoInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  relationshipToChild: RelationshipType;
};

export type Query = {
  __typename?: 'Query';
  getAvailableSlots: Maybe<Array<Appointment>>;
  getCostEstimate: Maybe<CostEstimate>;
  getOnboardingSession: Maybe<OnboardingSession>;
  me: Maybe<User>;
};


export type QueryGetAvailableSlotsArgs = {
  endDate?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  therapistId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryGetCostEstimateArgs = {
  onboardingSessionId: Scalars['ID']['input'];
};


export type QueryGetOnboardingSessionArgs = {
  id: Scalars['ID']['input'];
};

export type RelationshipType =
  | 'GRANDPARENT'
  | 'GUARDIAN'
  | 'OTHER'
  | 'PARENT';

export type ResetAssessmentPayload = {
  __typename?: 'ResetAssessmentPayload';
  session: OnboardingSession;
};

export type ScheduleAppointmentInput = {
  onboardingSessionId: Scalars['ID']['input'];
  therapistId: Scalars['ID']['input'];
  timeSlotId: Scalars['ID']['input'];
};

export type SendSessionReminderInput = {
  email: Scalars['String']['input'];
  sessionId: Scalars['ID']['input'];
};

export type SendSessionReminderPayload = {
  __typename?: 'SendSessionReminderPayload';
  message: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type StartOnboardingInput = {
  childDateOfBirth: Scalars['String']['input'];
  childFirstName: Scalars['String']['input'];
  parentEmail: Scalars['String']['input'];
};

export type SubmitAssessmentMessageInput = {
  messageContent: Scalars['String']['input'];
  onboardingSessionId: Scalars['ID']['input'];
};

export type SubmitInsuranceImageInput = {
  onboardingSessionId: Scalars['ID']['input'];
};

export type SubmitInsuranceInfoInput = {
  groupId?: InputMaybe<Scalars['String']['input']>;
  memberId: Scalars['String']['input'];
  onboardingSessionId: Scalars['ID']['input'];
  planName?: InputMaybe<Scalars['String']['input']>;
  provider: Scalars['String']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  supportChatMessages: Maybe<ChatMessage>;
};


export type SubscriptionSupportChatMessagesArgs = {
  onboardingSessionId: Scalars['ID']['input'];
};

export type UpdateDemographicsInput = {
  childConcerns?: InputMaybe<Array<Scalars['String']['input']>>;
  childPronouns?: InputMaybe<Scalars['String']['input']>;
  onboardingSessionId: Scalars['ID']['input'];
  parentFirstName?: InputMaybe<Scalars['String']['input']>;
  parentLastName?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateParentInfoPayload = {
  __typename?: 'UpdateParentInfoPayload';
  demographics: Maybe<Demographics>;
  id: Scalars['ID']['output'];
  status: OnboardingStatus;
  updatedAt: Scalars['String']['output'];
};

export type User = {
  __typename?: 'User';
  children: Maybe<Array<Child>>;
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  firstName: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastName: Maybe<Scalars['String']['output']>;
  role: UserRole;
};

export type UserRole =
  | 'ADMIN'
  | 'PARENT'
  | 'SUPPORT_STAFF';

export type UpdateParentInfoMutationVariables = Exact<{
  sessionId: Scalars['ID']['input'];
  input: ParentInfoInput;
}>;


export type UpdateParentInfoMutation = { __typename?: 'Mutation', updateParentInfo: { __typename?: 'UpdateParentInfoPayload', id: string, status: OnboardingStatus, updatedAt: string, demographics: { __typename?: 'Demographics', isComplete: boolean, parent: { __typename?: 'ParentInfo', firstName: string, lastName: string, email: string, phone: string, relationshipToChild: RelationshipType } | null } | null } | null };

export type CompleteAssessmentMutationVariables = Exact<{
  sessionId: Scalars['ID']['input'];
}>;


export type CompleteAssessmentMutation = { __typename?: 'Mutation', completeAssessment: { __typename?: 'AssessmentSummaryPayload', summary: { __typename?: 'AssessmentSummary', keyConcerns: Array<string>, childName: string, recommendedFocus: Array<string> | null, generatedAt: string } } | null };

export type ConfirmAssessmentSummaryMutationVariables = Exact<{
  sessionId: Scalars['ID']['input'];
  confirmed: Scalars['Boolean']['input'];
}>;


export type ConfirmAssessmentSummaryMutation = { __typename?: 'Mutation', confirmAssessmentSummary: { __typename?: 'ConfirmSummaryPayload', session: { __typename?: 'OnboardingSession', id: string, status: OnboardingStatus, assessment: { __typename?: 'Assessment', isComplete: boolean | null, summary: { __typename?: 'AssessmentSummary', keyConcerns: Array<string>, childName: string, recommendedFocus: Array<string> | null, generatedAt: string } | null } | null } } | null };

export type ResetAssessmentMutationVariables = Exact<{
  sessionId: Scalars['ID']['input'];
}>;


export type ResetAssessmentMutation = { __typename?: 'Mutation', resetAssessment: { __typename?: 'ResetAssessmentPayload', session: { __typename?: 'OnboardingSession', id: string, status: OnboardingStatus, assessment: { __typename?: 'Assessment', isComplete: boolean | null, conversationHistory: Array<{ __typename?: 'ChatMessage', id: string, sender: MessageSender, content: string, timestamp: string }> } | null } } | null };

export type SendSessionReminderMutationVariables = Exact<{
  input: SendSessionReminderInput;
}>;


export type SendSessionReminderMutation = { __typename?: 'Mutation', sendSessionReminder: { __typename?: 'SendSessionReminderPayload', success: boolean, message: string | null } | null };

export type StartOnboardingMutationVariables = Exact<{
  input: StartOnboardingInput;
}>;


export type StartOnboardingMutation = { __typename?: 'Mutation', startOnboarding: { __typename?: 'OnboardingSession', id: string, status: OnboardingStatus, createdAt: string, parent: { __typename?: 'User', id: string, email: string }, child: { __typename?: 'Child', id: string, firstName: string, dateOfBirth: string } } | null };

export type SubmitAssessmentMessageMutationVariables = Exact<{
  input: SubmitAssessmentMessageInput;
}>;


export type SubmitAssessmentMessageMutation = { __typename?: 'Mutation', submitAssessmentMessage: { __typename?: 'Assessment', id: string, isFitForDaybreak: boolean | null, suggestedNextSteps: string | null, isComplete: boolean | null, summary: { __typename?: 'AssessmentSummary', keyConcerns: Array<string>, childName: string, recommendedFocus: Array<string> | null, generatedAt: string } | null, conversationHistory: Array<{ __typename?: 'ChatMessage', id: string, sender: MessageSender, content: string, timestamp: string }> } | null };

export type GetCurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurrentUserQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, email: string, firstName: string | null, lastName: string | null, role: UserRole, createdAt: string, children: Array<{ __typename?: 'Child', id: string, firstName: string, dateOfBirth: string }> | null } | null };

export type GetOnboardingSessionQueryVariables = Exact<{
  sessionId: Scalars['ID']['input'];
}>;


export type GetOnboardingSessionQuery = { __typename?: 'Query', getOnboardingSession: { __typename?: 'OnboardingSession', id: string, status: OnboardingStatus, createdAt: string, updatedAt: string, parent: { __typename?: 'User', id: string, email: string, firstName: string | null, lastName: string | null }, child: { __typename?: 'Child', id: string, firstName: string, dateOfBirth: string, pronouns: string | null, concerns: Array<string> | null }, assessment: { __typename?: 'Assessment', id: string, isFitForDaybreak: boolean | null, suggestedNextSteps: string | null, isComplete: boolean | null, summary: { __typename?: 'AssessmentSummary', keyConcerns: Array<string>, childName: string, recommendedFocus: Array<string> | null, generatedAt: string } | null, conversationHistory: Array<{ __typename?: 'ChatMessage', id: string, sender: MessageSender, content: string, timestamp: string }> } | null, insuranceInfo: { __typename?: 'InsuranceInformation', id: string, provider: string, planName: string | null, memberId: string, groupId: string | null } | null, appointment: { __typename?: 'Appointment', id: string, therapistName: string, startTime: string, endTime: string, confirmationId: string } | null } | null };

export type SupportChatMessagesSubscriptionVariables = Exact<{
  onboardingSessionId: Scalars['ID']['input'];
}>;


export type SupportChatMessagesSubscription = { __typename?: 'Subscription', supportChatMessages: { __typename?: 'ChatMessage', id: string, sender: MessageSender, content: string, timestamp: string } | null };


export const UpdateParentInfoDocument = gql`
    """
UpdateParentInfo Mutation
Updates parent/guardian contact information for an onboarding session.
Called by useAutoSave hook on blur and on form submission.
"""
mutation UpdateParentInfo($sessionId: ID!, $input: ParentInfoInput!) {
  updateParentInfo(sessionId: $sessionId, input: $input) {
    id
    status
    demographics {
      parent {
        firstName
        lastName
        email
        phone
        relationshipToChild
      }
      isComplete
    }
    updatedAt
  }
}
    `;
export function useUpdateParentInfoMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateParentInfoMutation, UpdateParentInfoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateParentInfoMutation, UpdateParentInfoMutationVariables>(UpdateParentInfoDocument, options);
      }
export type UpdateParentInfoMutationHookResult = ReturnType<typeof useUpdateParentInfoMutation>;
export const CompleteAssessmentDocument = gql`
    mutation CompleteAssessment($sessionId: ID!) {
  completeAssessment(sessionId: $sessionId) {
    summary {
      keyConcerns
      childName
      recommendedFocus
      generatedAt
    }
  }
}
    `;
export function useCompleteAssessmentMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CompleteAssessmentMutation, CompleteAssessmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CompleteAssessmentMutation, CompleteAssessmentMutationVariables>(CompleteAssessmentDocument, options);
      }
export type CompleteAssessmentMutationHookResult = ReturnType<typeof useCompleteAssessmentMutation>;
export const ConfirmAssessmentSummaryDocument = gql`
    mutation ConfirmAssessmentSummary($sessionId: ID!, $confirmed: Boolean!) {
  confirmAssessmentSummary(sessionId: $sessionId, confirmed: $confirmed) {
    session {
      id
      status
      assessment {
        isComplete
        summary {
          keyConcerns
          childName
          recommendedFocus
          generatedAt
        }
      }
    }
  }
}
    `;
export function useConfirmAssessmentSummaryMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ConfirmAssessmentSummaryMutation, ConfirmAssessmentSummaryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ConfirmAssessmentSummaryMutation, ConfirmAssessmentSummaryMutationVariables>(ConfirmAssessmentSummaryDocument, options);
      }
export type ConfirmAssessmentSummaryMutationHookResult = ReturnType<typeof useConfirmAssessmentSummaryMutation>;
export const ResetAssessmentDocument = gql`
    mutation ResetAssessment($sessionId: ID!) {
  resetAssessment(sessionId: $sessionId) {
    session {
      id
      status
      assessment {
        conversationHistory {
          id
          sender
          content
          timestamp
        }
        isComplete
      }
    }
  }
}
    `;
export function useResetAssessmentMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ResetAssessmentMutation, ResetAssessmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ResetAssessmentMutation, ResetAssessmentMutationVariables>(ResetAssessmentDocument, options);
      }
export type ResetAssessmentMutationHookResult = ReturnType<typeof useResetAssessmentMutation>;
export const SendSessionReminderDocument = gql`
    mutation SendSessionReminder($input: SendSessionReminderInput!) {
  sendSessionReminder(input: $input) {
    success
    message
  }
}
    `;
export function useSendSessionReminderMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SendSessionReminderMutation, SendSessionReminderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SendSessionReminderMutation, SendSessionReminderMutationVariables>(SendSessionReminderDocument, options);
      }
export type SendSessionReminderMutationHookResult = ReturnType<typeof useSendSessionReminderMutation>;
export const StartOnboardingDocument = gql`
    mutation StartOnboarding($input: StartOnboardingInput!) {
  startOnboarding(input: $input) {
    id
    status
    createdAt
    parent {
      id
      email
    }
    child {
      id
      firstName
      dateOfBirth
    }
  }
}
    `;
export function useStartOnboardingMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<StartOnboardingMutation, StartOnboardingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<StartOnboardingMutation, StartOnboardingMutationVariables>(StartOnboardingDocument, options);
      }
export type StartOnboardingMutationHookResult = ReturnType<typeof useStartOnboardingMutation>;
export const SubmitAssessmentMessageDocument = gql`
    mutation SubmitAssessmentMessage($input: SubmitAssessmentMessageInput!) {
  submitAssessmentMessage(input: $input) {
    id
    summary {
      keyConcerns
      childName
      recommendedFocus
      generatedAt
    }
    isFitForDaybreak
    suggestedNextSteps
    isComplete
    conversationHistory {
      id
      sender
      content
      timestamp
    }
  }
}
    `;
export function useSubmitAssessmentMessageMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SubmitAssessmentMessageMutation, SubmitAssessmentMessageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SubmitAssessmentMessageMutation, SubmitAssessmentMessageMutationVariables>(SubmitAssessmentMessageDocument, options);
      }
export type SubmitAssessmentMessageMutationHookResult = ReturnType<typeof useSubmitAssessmentMessageMutation>;
export const GetCurrentUserDocument = gql`
    query GetCurrentUser {
  me {
    id
    email
    firstName
    lastName
    role
    createdAt
    children {
      id
      firstName
      dateOfBirth
    }
  }
}
    `;
export function useGetCurrentUserQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetCurrentUserQuery, GetCurrentUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetCurrentUserQuery, GetCurrentUserQueryVariables>(GetCurrentUserDocument, options);
      }
export function useGetCurrentUserLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetCurrentUserQuery, GetCurrentUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetCurrentUserQuery, GetCurrentUserQueryVariables>(GetCurrentUserDocument, options);
        }
export type GetCurrentUserQueryHookResult = ReturnType<typeof useGetCurrentUserQuery>;
export type GetCurrentUserLazyQueryHookResult = ReturnType<typeof useGetCurrentUserLazyQuery>;
export const GetOnboardingSessionDocument = gql`
    query GetOnboardingSession($sessionId: ID!) {
  getOnboardingSession(id: $sessionId) {
    id
    status
    createdAt
    updatedAt
    parent {
      id
      email
      firstName
      lastName
    }
    child {
      id
      firstName
      dateOfBirth
      pronouns
      concerns
    }
    assessment {
      id
      summary {
        keyConcerns
        childName
        recommendedFocus
        generatedAt
      }
      isFitForDaybreak
      suggestedNextSteps
      isComplete
      conversationHistory {
        id
        sender
        content
        timestamp
      }
    }
    insuranceInfo {
      id
      provider
      planName
      memberId
      groupId
    }
    appointment {
      id
      therapistName
      startTime
      endTime
      confirmationId
    }
  }
}
    `;
export function useGetOnboardingSessionQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetOnboardingSessionQuery, GetOnboardingSessionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetOnboardingSessionQuery, GetOnboardingSessionQueryVariables>(GetOnboardingSessionDocument, options);
      }
export function useGetOnboardingSessionLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetOnboardingSessionQuery, GetOnboardingSessionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetOnboardingSessionQuery, GetOnboardingSessionQueryVariables>(GetOnboardingSessionDocument, options);
        }
export type GetOnboardingSessionQueryHookResult = ReturnType<typeof useGetOnboardingSessionQuery>;
export type GetOnboardingSessionLazyQueryHookResult = ReturnType<typeof useGetOnboardingSessionLazyQuery>;
export const SupportChatMessagesDocument = gql`
    subscription SupportChatMessages($onboardingSessionId: ID!) {
  supportChatMessages(onboardingSessionId: $onboardingSessionId) {
    id
    sender
    content
    timestamp
  }
}
    `;
export function useSupportChatMessagesSubscription(baseOptions: ApolloReactHooks.SubscriptionHookOptions<SupportChatMessagesSubscription, SupportChatMessagesSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useSubscription<SupportChatMessagesSubscription, SupportChatMessagesSubscriptionVariables>(SupportChatMessagesDocument, options);
      }
export type SupportChatMessagesSubscriptionHookResult = ReturnType<typeof useSupportChatMessagesSubscription>;