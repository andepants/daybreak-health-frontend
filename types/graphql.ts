import { gql } from '@apollo/client';
import * as ApolloReactCommon from '@apollo/client';
import * as Apollo from '@apollo/client';
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
  isFitForDaybreak: Maybe<Scalars['Boolean']['output']>;
  suggestedNextSteps: Maybe<Scalars['String']['output']>;
  summary: Maybe<Scalars['String']['output']>;
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

export type CostEstimate = {
  __typename?: 'CostEstimate';
  copayPerSession: Maybe<Scalars['Float']['output']>;
  deductibleRemaining: Maybe<Scalars['Float']['output']>;
  notes: Maybe<Scalars['String']['output']>;
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
  scheduleAppointment: Maybe<Appointment>;
  sendSupportChatMessage: Maybe<ChatMessage>;
  startOnboarding: Maybe<OnboardingSession>;
  submitAssessmentMessage: Maybe<Assessment>;
  submitInsuranceImage: Maybe<InsuranceInformation>;
  submitInsuranceInfo: Maybe<OnboardingSession>;
  updateDemographics: Maybe<OnboardingSession>;
};


export type MutationScheduleAppointmentArgs = {
  input: ScheduleAppointmentInput;
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

export type ScheduleAppointmentInput = {
  onboardingSessionId: Scalars['ID']['input'];
  therapistId: Scalars['ID']['input'];
  timeSlotId: Scalars['ID']['input'];
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

export type StartOnboardingMutationVariables = Exact<{
  input: StartOnboardingInput;
}>;


export type StartOnboardingMutation = { __typename?: 'Mutation', startOnboarding: { __typename?: 'OnboardingSession', id: string, status: OnboardingStatus, createdAt: string, parent: { __typename?: 'User', id: string, email: string }, child: { __typename?: 'Child', id: string, firstName: string, dateOfBirth: string } } | null };

export type SubmitAssessmentMessageMutationVariables = Exact<{
  input: SubmitAssessmentMessageInput;
}>;


export type SubmitAssessmentMessageMutation = { __typename?: 'Mutation', submitAssessmentMessage: { __typename?: 'Assessment', id: string, summary: string | null, isFitForDaybreak: boolean | null, suggestedNextSteps: string | null, conversationHistory: Array<{ __typename?: 'ChatMessage', id: string, sender: MessageSender, content: string, timestamp: string }> } | null };

export type GetCurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurrentUserQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, email: string, firstName: string | null, lastName: string | null, role: UserRole, createdAt: string, children: Array<{ __typename?: 'Child', id: string, firstName: string, dateOfBirth: string }> | null } | null };

export type GetOnboardingSessionQueryVariables = Exact<{
  sessionId: Scalars['ID']['input'];
}>;


export type GetOnboardingSessionQuery = { __typename?: 'Query', getOnboardingSession: { __typename?: 'OnboardingSession', id: string, status: OnboardingStatus, createdAt: string, updatedAt: string, parent: { __typename?: 'User', id: string, email: string, firstName: string | null, lastName: string | null }, child: { __typename?: 'Child', id: string, firstName: string, dateOfBirth: string, pronouns: string | null, concerns: Array<string> | null }, assessment: { __typename?: 'Assessment', id: string, summary: string | null, isFitForDaybreak: boolean | null, suggestedNextSteps: string | null, conversationHistory: Array<{ __typename?: 'ChatMessage', id: string, sender: MessageSender, content: string, timestamp: string }> } | null, insuranceInfo: { __typename?: 'InsuranceInformation', id: string, provider: string, planName: string | null, memberId: string, groupId: string | null } | null, appointment: { __typename?: 'Appointment', id: string, therapistName: string, startTime: string, endTime: string, confirmationId: string } | null } | null };

export type SupportChatMessagesSubscriptionVariables = Exact<{
  onboardingSessionId: Scalars['ID']['input'];
}>;


export type SupportChatMessagesSubscription = { __typename?: 'Subscription', supportChatMessages: { __typename?: 'ChatMessage', id: string, sender: MessageSender, content: string, timestamp: string } | null };


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
export type StartOnboardingMutationFn = ApolloReactCommon.MutationFunction<StartOnboardingMutation, StartOnboardingMutationVariables>;

/**
 * __useStartOnboardingMutation__
 *
 * To run a mutation, you first call `useStartOnboardingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStartOnboardingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [startOnboardingMutation, { data, loading, error }] = useStartOnboardingMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useStartOnboardingMutation(baseOptions?: Apollo.MutationHookOptions<StartOnboardingMutation, StartOnboardingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<StartOnboardingMutation, StartOnboardingMutationVariables>(StartOnboardingDocument, options);
      }
export type StartOnboardingMutationHookResult = ReturnType<typeof useStartOnboardingMutation>;
export type StartOnboardingMutationResult = ApolloReactCommon.MutationResult<StartOnboardingMutation>;
export type StartOnboardingMutationOptions = ApolloReactCommon.BaseMutationOptions<StartOnboardingMutation, StartOnboardingMutationVariables>;
export const SubmitAssessmentMessageDocument = gql`
    mutation SubmitAssessmentMessage($input: SubmitAssessmentMessageInput!) {
  submitAssessmentMessage(input: $input) {
    id
    summary
    isFitForDaybreak
    suggestedNextSteps
    conversationHistory {
      id
      sender
      content
      timestamp
    }
  }
}
    `;
export type SubmitAssessmentMessageMutationFn = ApolloReactCommon.MutationFunction<SubmitAssessmentMessageMutation, SubmitAssessmentMessageMutationVariables>;

/**
 * __useSubmitAssessmentMessageMutation__
 *
 * To run a mutation, you first call `useSubmitAssessmentMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitAssessmentMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitAssessmentMessageMutation, { data, loading, error }] = useSubmitAssessmentMessageMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSubmitAssessmentMessageMutation(baseOptions?: Apollo.MutationHookOptions<SubmitAssessmentMessageMutation, SubmitAssessmentMessageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitAssessmentMessageMutation, SubmitAssessmentMessageMutationVariables>(SubmitAssessmentMessageDocument, options);
      }
export type SubmitAssessmentMessageMutationHookResult = ReturnType<typeof useSubmitAssessmentMessageMutation>;
export type SubmitAssessmentMessageMutationResult = ApolloReactCommon.MutationResult<SubmitAssessmentMessageMutation>;
export type SubmitAssessmentMessageMutationOptions = ApolloReactCommon.BaseMutationOptions<SubmitAssessmentMessageMutation, SubmitAssessmentMessageMutationVariables>;
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

/**
 * __useGetCurrentUserQuery__
 *
 * To run a query within a React component, call `useGetCurrentUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCurrentUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCurrentUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCurrentUserQuery(baseOptions?: Apollo.QueryHookOptions<GetCurrentUserQuery, GetCurrentUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCurrentUserQuery, GetCurrentUserQueryVariables>(GetCurrentUserDocument, options);
      }
export function useGetCurrentUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCurrentUserQuery, GetCurrentUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCurrentUserQuery, GetCurrentUserQueryVariables>(GetCurrentUserDocument, options);
        }
export function useGetCurrentUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCurrentUserQuery, GetCurrentUserQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCurrentUserQuery, GetCurrentUserQueryVariables>(GetCurrentUserDocument, options);
        }
export type GetCurrentUserQueryHookResult = ReturnType<typeof useGetCurrentUserQuery>;
export type GetCurrentUserLazyQueryHookResult = ReturnType<typeof useGetCurrentUserLazyQuery>;
export type GetCurrentUserSuspenseQueryHookResult = ReturnType<typeof useGetCurrentUserSuspenseQuery>;
export type GetCurrentUserQueryResult = ApolloReactCommon.QueryResult<GetCurrentUserQuery, GetCurrentUserQueryVariables>;
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
      summary
      isFitForDaybreak
      suggestedNextSteps
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

/**
 * __useGetOnboardingSessionQuery__
 *
 * To run a query within a React component, call `useGetOnboardingSessionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOnboardingSessionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOnboardingSessionQuery({
 *   variables: {
 *      sessionId: // value for 'sessionId'
 *   },
 * });
 */
export function useGetOnboardingSessionQuery(baseOptions: Apollo.QueryHookOptions<GetOnboardingSessionQuery, GetOnboardingSessionQueryVariables> & ({ variables: GetOnboardingSessionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOnboardingSessionQuery, GetOnboardingSessionQueryVariables>(GetOnboardingSessionDocument, options);
      }
export function useGetOnboardingSessionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOnboardingSessionQuery, GetOnboardingSessionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOnboardingSessionQuery, GetOnboardingSessionQueryVariables>(GetOnboardingSessionDocument, options);
        }
export function useGetOnboardingSessionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOnboardingSessionQuery, GetOnboardingSessionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOnboardingSessionQuery, GetOnboardingSessionQueryVariables>(GetOnboardingSessionDocument, options);
        }
export type GetOnboardingSessionQueryHookResult = ReturnType<typeof useGetOnboardingSessionQuery>;
export type GetOnboardingSessionLazyQueryHookResult = ReturnType<typeof useGetOnboardingSessionLazyQuery>;
export type GetOnboardingSessionSuspenseQueryHookResult = ReturnType<typeof useGetOnboardingSessionSuspenseQuery>;
export type GetOnboardingSessionQueryResult = ApolloReactCommon.QueryResult<GetOnboardingSessionQuery, GetOnboardingSessionQueryVariables>;
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

/**
 * __useSupportChatMessagesSubscription__
 *
 * To run a query within a React component, call `useSupportChatMessagesSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSupportChatMessagesSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSupportChatMessagesSubscription({
 *   variables: {
 *      onboardingSessionId: // value for 'onboardingSessionId'
 *   },
 * });
 */
export function useSupportChatMessagesSubscription(baseOptions: Apollo.SubscriptionHookOptions<SupportChatMessagesSubscription, SupportChatMessagesSubscriptionVariables> & ({ variables: SupportChatMessagesSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SupportChatMessagesSubscription, SupportChatMessagesSubscriptionVariables>(SupportChatMessagesDocument, options);
      }
export type SupportChatMessagesSubscriptionHookResult = ReturnType<typeof useSupportChatMessagesSubscription>;
export type SupportChatMessagesSubscriptionResult = ApolloReactCommon.SubscriptionResult<SupportChatMessagesSubscription>;