import { gql } from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
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
  isFitForDaybreak?: Maybe<Scalars['Boolean']['output']>;
  suggestedNextSteps?: Maybe<Scalars['String']['output']>;
  summary?: Maybe<Scalars['String']['output']>;
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
  concerns?: Maybe<Array<Scalars['String']['output']>>;
  createdAt: Scalars['String']['output'];
  dateOfBirth: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  pronouns?: Maybe<Scalars['String']['output']>;
};

export type CostEstimate = {
  __typename?: 'CostEstimate';
  copayPerSession?: Maybe<Scalars['Float']['output']>;
  deductibleRemaining?: Maybe<Scalars['Float']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
};

export type InsuranceInformation = {
  __typename?: 'InsuranceInformation';
  groupId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageFileUrl?: Maybe<Scalars['String']['output']>;
  memberId: Scalars['String']['output'];
  planName?: Maybe<Scalars['String']['output']>;
  provider: Scalars['String']['output'];
};

export enum MessageSender {
  Ai = 'AI',
  Support = 'SUPPORT',
  User = 'USER'
}

export type Mutation = {
  __typename?: 'Mutation';
  scheduleAppointment?: Maybe<Appointment>;
  sendSupportChatMessage?: Maybe<ChatMessage>;
  startOnboarding?: Maybe<OnboardingSession>;
  submitAssessmentMessage?: Maybe<Assessment>;
  submitInsuranceImage?: Maybe<InsuranceInformation>;
  submitInsuranceInfo?: Maybe<OnboardingSession>;
  updateDemographics?: Maybe<OnboardingSession>;
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
  appointment?: Maybe<Appointment>;
  assessment?: Maybe<Assessment>;
  child: Child;
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  insuranceInfo?: Maybe<InsuranceInformation>;
  parent: User;
  status: OnboardingStatus;
  updatedAt: Scalars['String']['output'];
};

/**
 * # GraphQL API Schema: Parent Onboarding AI
 * # Version: 1.0
 * # This schema defines the contract between the Next.js frontend and the Ruby on Rails backend.
 */
export enum OnboardingStatus {
  AssessmentCompleted = 'ASSESSMENT_COMPLETED',
  AssessmentStarted = 'ASSESSMENT_STARTED',
  DemographicsCompleted = 'DEMOGRAPHICS_COMPLETED',
  InsuranceCompleted = 'INSURANCE_COMPLETED',
  InsurancePending = 'INSURANCE_PENDING',
  OnboardingComplete = 'ONBOARDING_COMPLETE',
  SchedulingCompleted = 'SCHEDULING_COMPLETED',
  SchedulingPending = 'SCHEDULING_PENDING'
}

export type Query = {
  __typename?: 'Query';
  getAvailableSlots?: Maybe<Array<Appointment>>;
  getCostEstimate?: Maybe<CostEstimate>;
  getOnboardingSession?: Maybe<OnboardingSession>;
  me?: Maybe<User>;
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
  supportChatMessages?: Maybe<ChatMessage>;
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
  children?: Maybe<Array<Child>>;
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  role: UserRole;
};

export enum UserRole {
  Admin = 'ADMIN',
  Parent = 'PARENT',
  SupportStaff = 'SUPPORT_STAFF'
}
