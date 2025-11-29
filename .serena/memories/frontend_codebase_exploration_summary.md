# Daybreak Health Frontend Codebase Exploration Summary

Generated: 2025-11-29
Project: daybreak-health-frontend at /Users/andre/coding/daybreak/daybreak-health-frontend

---

## 1. Project Overview

The Daybreak Health Parent Onboarding AI is a Next.js 15 + Apollo Client + GraphQL frontend for a HIPAA-compliant mental health intake system. This is a mobile-first web application designed to guide stressed parents through mental health assessment and onboarding for their children (ages 10-19).

**Status:** Early stage - Epic 1 (Foundation & Project Setup) is currently ready for development

---

## 2. Technology Stack

### Core Framework & Build
- **Next.js:** v16.0.5 (App Router)
- **React:** v19.2.0
- **TypeScript:** v5.x (strict mode enabled)
- **Styling:** Tailwind CSS v4.0 with PostCSS
- **Package Manager:** pnpm v9.x

### API & Data Fetching
- **Apollo Client:** v4.0.9 with Next.js integration (`@apollo/client-integration-nextjs`)
- **GraphQL:** v16.12.0
- **GraphQL WebSocket:** v6.0.6 (for real-time subscriptions)
- **GraphQL Code Generator:** v5.x-6.x (generates TypeScript types + React hooks)

### Forms & Validation
- **React Hook Form:** v7.67.0 (uncontrolled components, minimal re-renders)
- **Zod:** v3.25.76 (TypeScript-first schema validation)
- **hookform/resolvers:** v5.2.2

### UI & Components
- **shadcn/ui:** Latest (accessible, customizable Tailwind-native components)
- **Lucide React:** v0.555.0 (icon library)
- **class-variance-authority:** v0.7.1
- **clsx:** v2.1.1 & tailwind-merge: v3.4.0

### Testing & Quality
- **Vitest:** v4.0.14 (unit testing)
- **Playwright:** v1.57.0 (E2E testing)
- **Testing Library:** @testing-library/react v16.3.0
- **ESLint:** v9.x

---

## 3. Project Structure

```
daybreak-health-frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout (basic - to be enhanced)
│   ├── page.tsx                 # Landing page (placeholder)
│   ├── globals.css              # Tailwind imports
│   └── favicon.ico
├── types/
│   └── graphql.ts               # Generated GraphQL types (manually created - no GraphQL docs yet)
├── lib/
│   └── utils.ts                 # Utility functions (cn() for class merging)
├── graphql/                     # GraphQL query/mutation documents (empty - to be created)
├── features/                    # Feature modules (empty - to be created)
├── public/                      # Static assets
├── docs/
│   ├── sprint-artifacts/        # Sprint planning & status
│   │   ├── sprint-status.yaml   # Epic and story tracking
│   │   ├── api_schema.graphql   # GraphQL schema definition
│   │   ├── tech-spec-epic-1.md  # Technical specification for Epic 1
│   │   ├── 1-1-project-initialization-and-core-dependencies.md
│   │   ├── 1-2-daybreak-design-system-and-theme-configuration.md
│   │   ├── 1-3-core-layout-components.md
│   │   ├── 1-4-apollo-client-configuration-with-websocket-support.md
│   │   ├── 1-5-graphql-code-generation-setup.md
│   │   └── [story-files].context.xml
│   ├── prd.md                   # Product Requirements Document (v1.2)
│   ├── architecture.md          # Architecture decision document (v1.0)
│   ├── test-cases/              # CSV test data for all entities
│   │   ├── clinicians_anonymized.csv
│   │   ├── patients_and_guardians_anonymized.csv
│   │   ├── referrals.csv
│   │   ├── memberships.csv
│   │   ├── insurance_coverages.csv
│   │   ├── contracts.csv
│   │   ├── orgs.csv
│   │   ├── questionnaires.csv
│   │   ├── kinships.csv
│   │   ├── clinician_availabilities.csv
│   │   ├── patient_availabilities.csv
│   │   ├── credentialed_insurances.csv
│   │   ├── clinician_credentialed_insurances.csv
│   │   ├── org_contracts.csv
│   │   ├── referral_members.csv
│   │   └── documents.csv
│   └── ux-color-themes.html     # Design system colors
├── .claude/                     # Claude IDE configuration
├── .next/, .serena/, out/       # Build artifacts
├── codegen.ts                   # GraphQL Code Generator configuration
├── tsconfig.json                # TypeScript configuration
├── next.config.ts               # Next.js config (static export for S3/CloudFront)
├── package.json                 # Dependencies
└── README.md
```

---

## 4. Current Type Coverage

### GraphQL Generated Types (types/graphql.ts)
**Status:** BASIC - Only MVP onboarding types defined, no comprehensive backend schema

#### Enums Defined:
1. **OnboardingStatus** (8 values)
   - ASSESSMENT_STARTED, ASSESSMENT_COMPLETED, DEMOGRAPHICS_COMPLETED
   - INSURANCE_PENDING, INSURANCE_COMPLETED
   - SCHEDULING_PENDING, SCHEDULING_COMPLETED, ONBOARDING_COMPLETE

2. **UserRole** (3 values)
   - PARENT, SUPPORT_STAFF, ADMIN

3. **MessageSender** (3 values)
   - USER, AI, SUPPORT

#### Core Types:
1. **User**
   - id, email, firstName?, lastName?, role, createdAt, children[]

2. **Child**
   - id, firstName, dateOfBirth, pronouns?, concerns[]?, createdAt

3. **OnboardingSession**
   - id, status, parent (User), child (Child), assessment?, insuranceInfo?, appointment?, createdAt, updatedAt

4. **Assessment**
   - id, conversationHistory (ChatMessage[]), summary?, isFitForDaybreak?, suggestedNextSteps?

5. **ChatMessage**
   - id, sender (MessageSender), content, timestamp

6. **InsuranceInformation**
   - id, provider, planName?, memberId, groupId?, imageFileUrl?

7. **Appointment**
   - id, therapistName, startTime, endTime, confirmationId

8. **CostEstimate**
   - copayPerSession?, deductibleRemaining?, notes?

#### Input Types:
1. **StartOnboardingInput** - parentEmail, childFirstName, childDateOfBirth
2. **SubmitAssessmentMessageInput** - onboardingSessionId, messageContent
3. **UpdateDemographicsInput** - onboardingSessionId, parentFirstName?, parentLastName?, childPronouns?, childConcerns[]?
4. **SubmitInsuranceInfoInput** - onboardingSessionId, provider, planName?, memberId, groupId?
5. **SubmitInsuranceImageInput** - onboardingSessionId
6. **ScheduleAppointmentInput** - onboardingSessionId, therapistId, timeSlotId

#### Query/Mutation Support:
- **Queries:** getOnboardingSession, me, getAvailableSlots, getCostEstimate
- **Mutations:** startOnboarding, submitAssessmentMessage, updateDemographics, submitInsuranceInfo, scheduleAppointment, submitInsuranceImage, sendSupportChatMessage
- **Subscriptions:** supportChatMessages

### Missing from Frontend Types:
The following entities/types exist in test data but are NOT defined in frontend types:

#### Clinician/Provider Types (from clinicians_anonymized.csv):
- Full clinician profile data structure
- profile_data (nested JSON) - contains bio, specialties, licenses, modalities, etc.
- Availability data
- Care languages, geographic states, employment type
- NPI number, health plans they accept
- Capacity tracking (filled, available)
- Supervisor relationships
- Clinical programs they offer

#### Organization Types (from orgs.csv):
- Organization record structure
- Organization configuration
- Market/region information
- Parent-child organization relationships

#### Referral/Request Types (from referrals.csv):
- Referral creation and status tracking
- Service kind enumeration (values: 1, 2, etc.)
- Concerns tracking (array)
- Contract associations
- Appointment kind enumeration
- Care provider matching/assignment
- Enrollment states

#### Insurance Coverage Types (from insurance_coverages.csv):
- Coverage record structure
- Member ID and group ID
- Front/back card images
- Plan holder information
- Insurance company name and kind
- Eligibility status
- Insurance organization mapping (openpm integration)

#### Contract Types (from contracts.csv):
- Contract terms and conditions
- Services offered enumeration
- Contract terms structure (nested JSON)
  - kind: "onsite" | "sponsored" | "support"
  - services array
  - capacity tracking (initial_cap, cap_per_patient)
  - collection rules (pre_cap/post_cap)
  - care provider requirements
  - enrollment restrictions
- effective_date, end_date
- contract_url

#### Questionnaire Types (from questionnaires.csv):
- Questionnaire response structure
- question_answers object (arbitrary key-value pairs)
- Type enumeration (values: 1, 2, 3, etc.)
- Language tracking
- Score computation

#### Kinship/Membership Types (from kinships.csv, memberships.csv):
- Kinship relationships structure
- Membership enrollment tracking
- Census person mappings

#### Other Data Structures:
- Clinician availabilities (time slots, capacity)
- Patient availabilities
- Credentialed insurances (per clinician/organization)
- Referral members/participants
- Documents and attachments

---

## 5. Existing Constants & Enumerations

### GraphQL-Defined:
- OnboardingStatus: 8 values (all flow states)
- UserRole: 3 values (role-based access)
- MessageSender: 3 values (chat participant types)

### Inferred from CSV Data (NOT YET TYPED):
1. **ServiceKind** (numeric: 1, 2, etc.)
2. **ContractTermKind** - "onsite", "sponsored", "support"
3. **QuestionnaireType** (numeric: 1, 2, 3, etc.)
4. **InsuranceCoverageKind** - "in_network", etc.
5. **SystemLabels** (array of strings like "referred", "onboarding_completed", etc.)
6. **AppointmentKind** (numeric: 1, 2, etc.)
7. **CollectionRule** - "required", "optional", etc.
8. **ClinicalRole** - "Clinician", "Supervisor", etc.
9. **EmploymentType** - "W2 Hourly", "1099 Contractor"
10. **CareLanguages** - Language arrays
11. **PreferredPronoun** - String enumerations
12. **Ethnicities** - String arrays with standard values
13. **Specialties** - Array of clinical specialties
14. **Modalities** - Therapy modalities array
15. **Religion** - String enumerations
16. **SexualOrientation** - String values
17. **Gender** - Standardized values

---

## 6. Nested JSON Structures (profile_data)

### Clinician profile_data (from CSV):
```typescript
{
  bio: string
  religion: string // semicolon-separated like "Unaffiliated;Other"
  services: string[] // empty array currently
  ethnicity: string // semicolon-separated values
  modalities: string[]
  npi_number: string
  self_gender: string
  specialties: string[]
  employment_type: string
  sexual_orientation: string
}
```

### Referral data (from CSV):
```typescript
{
  // Empty object in current test data
  // Likely future structure for form responses/assessments
}
```

### Insurance Coverage profile_data:
```typescript
{
  // Empty object in current test data
}
```

### Contract terms (from CSV):
```typescript
[
  {
    kind: "onsite" | "sponsored" | "support"
    services: string[]
    initial_cap?: number
    cap_per_patient?: number
    pre_cap_collection_rule?: string
    post_cap_collection_rule?: string
    care_provider_requirements: string[]
    post_cap_enrollment_allowed?: boolean
    pre_cap_must_indicate_coverage?: boolean
    post_cap_must_indicate_coverage?: boolean
    pre_cap_client_coverage_allowed: string[]
    post_cap_client_coverage_allowed: string[]
    pre_cap_client_coverage_enabled: boolean
    post_cap_client_coverage_enabled: boolean
    pre_cap_self_responsibility_required: boolean
    post_cap_self_responsibility_required: boolean
  }
]
```

### Questionnaire question_answers:
```typescript
{
  question_1_answer: string | number
  question_2_answer: string | number
  // ... up to question_14_answer in test data
  // Arbitrary structure - answers vary by type
}
```

---

## 7. API Schema (GraphQL)

**Location:** docs/sprint-artifacts/api_schema.graphql

The GraphQL schema defines the contract between frontend and Rails backend:

### Object Types:
- OnboardingSession (aggregate root)
- User, Child
- Assessment, ChatMessage
- InsuranceInformation, Appointment, CostEstimate

### Root Operations:
- **Query:** getOnboardingSession(id), me, getAvailableSlots, getCostEstimate
- **Mutation:** 8 operations (onboarding, demographics, insurance, scheduling, chat)
- **Subscription:** supportChatMessages

**Priority Markers:**
- P0: Core MVP features
- P1: Growth features (OCR, real-time chat)
- P2: Nice-to-have (patient retention)

---

## 8. Code Generation Setup

**Configuration File:** codegen.ts

```typescript
schema: './docs/sprint-artifacts/api_schema.graphql'
documents: ['features/**/*.graphql', 'graphql/**/*.graphql']
generates: {
  './types/graphql.ts': {
    plugins: [
      'typescript',
      'typescript-operations',
      'typescript-react-apollo'
    ]
    config: {
      withHooks: true,
      skipTypename: false
    }
  }
}
```

**Status:** Setup but not yet used - no GraphQL document files (*.graphql) in features/ or graphql/ directories

---

## 9. Current Development Status

### Epic 1: Foundation & Project Setup - CONTEXTED
- Story 1-1: "Project Initialization & Core Dependencies" - READY FOR DEV
- Story 1-2: "Design System & Theme Configuration" - DRAFTED
- Story 1-3: "Core Layout Components" - DRAFTED
- Story 1-4: "Apollo Client Configuration with WebSocket" - DRAFTED
- Story 1-5: "GraphQL Code Generation Setup" - DRAFTED

### Epics 2-6: All BACKLOG
- Epic 2: AI-Guided Assessment Experience (6 stories)
- Epic 3: Parent & Child Information Collection (4 stories)
- Epic 4: Insurance Submission (3 stories)
- Epic 5: Therapist Matching & Booking (5 stories)
- Epic 6: Human Support Integration (3 stories)

---

## 10. Key Architectural Patterns

### Mobile-First
- All components designed mobile-native first
- Static export to S3/CloudFront (not Next.js server runtime)
- Unoptimized images

### Form-Based with AI Fallback
- Primary: AI-guided conversational assessment
- Fallback: Traditional form-based assessment

### Real-Time Capabilities
- GraphQL subscriptions for support chat (WebSocket via graphql-ws)
- Optimistic UI updates
- Skeleton/loading states for AI typing indicators

### Type Safety
- End-to-end TypeScript from GraphQL schema to components
- Generated React Apollo hooks with type inference

### HIPAA Compliance
- No PHI in frontend state, logs, or URLs
- All messages persisted immediately to backend
- Human support escalation always visible

---

## 11. Missing/To-Be-Created Type Definitions

**HIGH PRIORITY** - Required for full type coverage:

1. **Clinician/TherapistProfile** - providers, credentials, availability
2. **Organization** - healthcare networks, schools, employers
3. **Referral** - service requests, status tracking
4. **InsuranceCoverage** - detailed coverage information
5. **Contract** - service agreements and terms
6. **Availability** - time slot and capacity management
7. **Questionnaire** - assessment instruments and responses
8. **Membership** - enrollment tracking
9. **Kinship** - family relationships

**Constants/Enums to Define:**
- ServiceKind, ContractTermKind, QuestionnaireType
- ClinicalRole, EmploymentType, Gender, Pronoun
- Ethnicity, Religion, SexualOrientation
- InsuranceLevel, EligibilityStatus

---

## 12. Test Data Coverage

**65 CSV test files with comprehensive entity data:**

#### Core Entities:
- clinicians_anonymized.csv (4 clinician records with full profiles)
- patients_and_guardians_anonymized.csv (4 guardian/patient records)
- referrals.csv (4 referral/service request records)
- memberships.csv (4 membership enrollment records)

#### Insurance & Coverage:
- insurance_coverages.csv (65 records total)
- credentialed_insurances.csv
- clinician_credentialed_insurances.csv

#### Organizations & Services:
- orgs.csv (school and healthcare organizations)
- contracts.csv (complex terms and service definitions)
- org_contracts.csv

#### Availability & Scheduling:
- clinician_availabilities.csv
- patient_availabilities.csv

#### Additional:
- questionnaires.csv (assessment responses)
- kinships.csv (family relationships)
- referral_members.csv (referral participants)
- documents.csv (attachments)

---

## 13. Configuration Files

### TypeScript (tsconfig.json)
- Target: ES2017
- Strict mode: enabled
- Path aliases: @/* → ./*
- JSX: react-jsx

### Next.js (next.config.ts)
- Output: 'export' (static HTML for S3)
- Trailing slashes: enabled
- Images: unoptimized (no Next.js Image Optimization)

### Package Manager
- pnpm v9.x configured

### PostCSS (postcss.config.mjs)
- Tailwind CSS v4 (CSS-first syntax)

---

## 14. Recommendations for Type Generation

To achieve comprehensive type coverage:

1. **Extend api_schema.graphql** with full backend types for:
   - Clinician profile and credentials
   - Organization and market hierarchies
   - Referral and enrollment workflows
   - Insurance and coverage details
   - Contract terms and conditions
   - Availability and scheduling
   - Questionnaires and assessment instruments
   - Kinships and family relationships

2. **Create GraphQL operations** (documents) in features/ and graphql/ directories

3. **Run codegen** to auto-generate types and React Apollo hooks

4. **Define TypeScript constants** for all enums and system labels

5. **Create type utility files** for common patterns (e.g., ProfileData types, SystemLabel unions)

---

## Summary

**Current State:** MVP-focused with basic onboarding types only. Strong architectural foundation (Next.js 15, TypeScript strict, Apollo Client with WebSocket). No provider/clinician, organization, insurance, or referral types yet.

**Scope:** Comprehensive test data exists for all major entities (clinicians, patients, organizations, contracts, insurance, referrals, questionnaires). These data structures need to be modeled as GraphQL types and generated into the frontend.

**Next Steps:** Complete the GraphQL schema definition and code generation setup to achieve full type coverage across all backend entities.
