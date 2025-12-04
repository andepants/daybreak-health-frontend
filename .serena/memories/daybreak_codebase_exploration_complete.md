# Daybreak Health Codebase - Comprehensive Architecture Analysis

## PROJECT OVERVIEW

**Daybreak Health** is an AI-first mental health intake platform for stressed parents seeking therapy for their children (ages 10-19). It provides an automated onboarding flow with therapist matching and appointment scheduling.

**Tech Stack:**
- Frontend: Next.js 15 (App Router), React 19, TypeScript, Apollo Client, GraphQL Codegen
- Backend: Rails 7.2, PostgreSQL, GraphQL
- Deployment: Docker/Aptible PaaS, S3 + CloudFront CDN
- Forms: React Hook Form + Zod validation
- UI: Tailwind CSS v4, shadcn/ui, Lucide icons

---

## 1. CURRENT ONBOARDING FLOW & UX

### Flow Sequence (Linear)
```
/onboarding/[sessionId]/

1. assessment (or form/assessment as fallback)
   ├─ AI chat-based assessment OR
   └─ Form-based assessment (3 pages)

2. demographics
   ├─ Parent info (name, email, phone, relationship)
   └─ Child info (name, DOB, gender, school, grade, concerns, medical history)

3. insurance
   └─ Payer name, policy number, member ID, group number, DOB subscriber

4. matching
   └─ Display 2-3 matched therapists with scores and reasoning
   └─ Parent selects one therapist

5. schedule
   ├─ Calendar view (next 14 days)
   ├─ Time slot picker
   ├─ Timezone selector (auto-detected)
   └─ Confirm booking button

6. confirmation
   └─ Booking success, appointment details, next steps
```

### Key Pages
- **Assessment:** `/app/onboarding/[sessionId]/assessment/page.tsx` - AI chat flow
- **Form Fallback:** `/app/onboarding/[sessionId]/form/assessment/page.tsx`
- **Demographics:** `/app/onboarding/[sessionId]/demographics/page.tsx`
- **Insurance:** `/app/onboarding/[sessionId]/insurance/page.tsx`
- **Matching:** `/app/onboarding/[sessionId]/matching/page.tsx` - Displays TherapistMatchResults
- **Schedule:** `/app/onboarding/[sessionId]/schedule/page.tsx` - Appointment booking
- **Confirmation:** `/app/onboarding/[sessionId]/confirmation/page.tsx`

---

## 2. DATABASE SCHEMA & DATA MODELS

### Core Patient/Session Tables

**onboarding_sessions** (UUID PK)
- status (enum: started, in_progress, insurance_pending, assessment_complete, submitted, abandoned, expired, appointment_booked)
- progress (JSONB)
- expires_at (datetime)
- role (enum: anonymous, parent, coordinator, admin, system)
- needs_human_contact, escalation_requested_at, escalation_reason
- cost_estimate (JSONB - stores calculation breakdown)
- created_at, updated_at

**parents** (UUID PK, FK: onboarding_session_id)
- email, phone, first_name, last_name
- relationship (enum, default: 4)
- is_guardian (boolean)

**children** (UUID PK, FK: onboarding_session_id)
- first_name, last_name, date_of_birth
- gender, school_name, grade
- primary_concerns (text), medical_history (text)

**assessments** (UUID PK, FK: onboarding_session_id)
- responses (JSONB)
- risk_flags (array)
- summary (text)
- consent_given (boolean)
- score (integer)
- status (enum: 0=pending, 1=complete)
- assessment_mode (default: "conversational")

**insurances** (UUID PK, FK: onboarding_session_id)
- payer_name, subscriber_name, policy_number, group_number, member_id, subscriber_dob
- verification_status (enum: 0=unverified, 1=verified, etc.)
- verification_result (JSONB)
- retry_attempts, for_billing

**messages** (UUID PK, FK: onboarding_session_id)
- role (enum: user, assistant, support)
- content (text)
- metadata (JSONB)
- created_at (indexed for ordering)

---

### Therapist & Matching Tables

**therapists** (UUID PK)
- first_name, last_name, email, phone
- license_type, license_number, license_state, license_expiration
- npi_number
- bio, photo_url
- active (boolean)
- languages (array: ISO 639-1 codes)
- age_ranges (array: e.g., ["5-12", "13-17"])
- treatment_modalities (array: "CBT", "DBT", "EMDR", etc.)
- appointment_duration_minutes (default: 50)
- buffer_time_minutes (default: 10)
- external_id (reference to Healthie or other system)

**therapist_specializations** (UUID PK)
- therapist_id (FK), specialization (string)
- Examples: "anxiety", "depression", "ADHD", "trauma", "behavioral issues"
- Unique index on (therapist_id, specialization)

**therapist_availabilities** (UUID PK)
- therapist_id (FK)
- day_of_week (0-6: Sunday-Saturday)
- start_time, end_time (TIME type)
- timezone (IANA: "America/Los_Angeles")
- is_repeating (boolean: true = weekly recurring)
- Validation: no overlapping slots, start < end

**therapist_insurance_panels** (UUID PK)
- therapist_id (FK)
- insurance_name (from credentialed_insurances list)
- insurance_state, line_of_business
- network_status (enum: 0=in_network, 1=out_of_network)
- external_insurance_id
- Unique index on (therapist_id, insurance_name, insurance_state)

**therapist_time_offs** (UUID PK)
- therapist_id (FK)
- start_date, end_date
- reason (optional)

**therapist_matches** (UUID PK)
- onboarding_session_id (FK)
- matched_therapists (JSONB array of match results)
- criteria_used (JSONB: extraction from session)
- processing_time_ms (integer)
- selected_therapist_id (FK: therapist_id, set when parent selects)

**appointments** (UUID PK)
- therapist_id (FK), onboarding_session_id (FK)
- scheduled_at (datetime)
- duration_minutes (default: 50)
- status (enum: 0=scheduled, 1=confirmed, 2=cancelled, 3=completed, 4=no_show)
- confirmed_at, cancelled_at, cancellation_reason
- location_type (virtual or in_person)
- virtual_link (video call URL)
- notes (internal)
- Unique index on (therapist_id, scheduled_at)

---

## 3. THERAPIST MATCHING LOGIC

### Matching Service Architecture
**File:** `app/services/scheduling/matching_service.rb`

**Scoring Weights:**
- Specialization match: 40% (primary weight)
- Age range fit: 30%
- Availability: 20%
- Treatment modality: 10%

**Algorithm Flow:**
1. **Extract Matching Criteria** (AC1)
   - Child age, primary concerns, medical history
   - Insurance payer name
   - Assessment scores (PHQ-A, GAD-7)
   - Preferred language, state

2. **Hard Filters** (AC2) - MANDATORY
   - Insurance acceptance (joins therapist_insurance_panels on payer_name)
   - State license match (filters by license_state)
   - Age range (filters therapists where child age ∈ [min, max])

3. **Scoring Components** (AC3)
   - **Specialization**: AI semantic matching (with keyword fallback)
     - Uses Claude AI with 2-second timeout
     - Fallback: keyword mapping (depression→["depression","sad"], etc.)
   - **Age Range**: Position in range, higher score if child in middle 50%
   - **Availability**: Days until first available slot
     - 1.0 = ≤7 days
     - 0.5-0.99 = 8-14 days
     - 0.0-0.49 = 15-30 days
     - 0.0 = >30 days
   - **Treatment Modality**: Currently returns 0.5 (placeholder)

4. **Final Score Calculation**
   - Weighted sum of components
   - Range: 0-100
   - Sorted descending

5. **Results Storage**
   - Min 3 recommendations returned
   - Stored in therapist_matches table for analytics
   - 10-minute cache per session

6. **Match Reasoning** (AC4)
   - Generates parent-friendly explanations
   - Examples: "Specializes in anxiety and depression"
   - Includes insurance and availability info

**Performance Targets:**
- Max 3 seconds total processing time (AC6)
- Caching for repeated requests
- Eager loading of associations to avoid N+1 queries

---

## 4. PATIENT PROFILE & DATA STORAGE

### Data Structure
Data is stored across multiple tables, all linked to `onboarding_sessions`:

```
OnboardingSession
├── Parent (1:1) - personal contact info
├── Child (1:1) - demographic and medical info
├── Assessment (1:1) - assessment responses, score, summary
├── Insurance (1:1) - insurance verification details
├── TherapistMatch (1:1) - matching results with scores
├── Appointment (1:many) - booked appointments
├── Messages (1:many) - conversation history
├── PaymentPlan (1:1) - cost/payment info
└── AuditLog (1:many) - compliance tracking
```

### PHI Encryption
- Escalation reason is encrypted at-rest
- Uses ActiveRecord encryptor (AC 3.5.7)
- All data retained for 90 days (data retention policy)

---

## 5. EXISTING SCHEDULING & AVAILABILITY FEATURES

### Current Implementation

**Backend (GraphQL):**
- Query: `therapistMatches(sessionId)` - returns matched therapists
- Mutation: `selectTherapist(sessionId, therapistId)` - records selection
- Query: `getTherapistAvailability(therapistId, timezone)` - returns time slots

**Frontend Components:**
- `ScheduleContainer.tsx` - Main orchestrator for scheduling flow
- `AppointmentCalendar.tsx` - Calendar view (14 days)
- `TimeSlotPicker.tsx` - Time slot selection UI
- `SessionDetails.tsx` - Sidebar showing session info
- `TimezoneSelector.tsx` - Timezone picker with auto-detection
- `Confirmation.tsx` - Booking confirmation page

**Therapist Availability Model:**
- Week-based recurring slots (`therapist_availabilities`)
- day_of_week (0-6) + start_time + end_time + timezone
- is_repeating flag (for recurring vs. one-time slots)
- Time offs tracked separately (`therapist_time_offs`)

**Appointment Model:**
- Single appointment entity
- Stores scheduled_at, duration, status, location_type
- Unique constraint on (therapist_id, scheduled_at)
- Supports virtual or in-person

---

## 6. CURRENT GAPS & WHAT NEEDS TO BE ADDED

### Patient Availability Selection (NOT YET IMPLEMENTED)
**Missing Feature:** Patient (parent/child) never indicates their own availability preferences

**Current State:**
- Flow goes directly from matching → schedule
- Therapist availability is fetched and displayed
- Parent picks from therapist's available slots
- No step where parent indicates WHEN they can meet

**Recommendation:** Add availability selection AFTER matching but BEFORE therapist-specific scheduling

---

## 7. RECOMMENDED UX FLOW FOR AVAILABILITY SELECTION

### Proposed New Flow
```
matching
  │
  ├─ Parent selects therapist
  │
  ▼
[NEW] patient-availability    ← ADD THIS STEP
  ├─ Calendar or checklist
  ├─ "When are you available to meet?"
  ├─ Day-of-week preferences (Mon-Sun)
  ├─ Time-of-day preferences (morning, afternoon, evening)
  ├─ Timezone preference
  │
  ▼
schedule (enhanced)
  ├─ Filter therapist slots by parent preferences
  ├─ Show only matching time slots
  ├─ Easier booking (fewer irrelevant options)
  │
  ▼
confirmation
```

### Benefits
1. **Better Matching**: Filter available therapists by parent's actual availability
2. **Faster Booking**: Fewer irrelevant slots to scroll through
3. **Compliance**: Document patient availability for future follow-ups
4. **Analytics**: Track availability patterns

---

## 8. KEY FILES TO MODIFY FOR AVAILABILITY FEATURE

### Backend (Rails)

1. **Database Migration**
   - Create `patient_availabilities` table:
     ```ruby
     create_table :patient_availabilities do |t|
       t.uuid :onboarding_session_id
       t.integer :day_of_week (0-6)
       t.time :start_time
       t.time :end_time
       t.string :timezone
       t.timestamps
     end
     ```

2. **Models**
   - `/app/models/patient_availability.rb` (new)
   - Update `/app/models/onboarding_session.rb` - add `has_one :patient_availability`

3. **GraphQL**
   - `/app/graphql/types/patient_availability_type.rb` (new)
   - `/app/graphql/mutations/submit_patient_availability.rb` (new)
   - Update schema.graphql

4. **Matching Service** (optional enhancement)
   - `/app/services/scheduling/matching_service.rb`
   - Add filtering by patient availability in `filter_by_availability(therapists)`

### Frontend (Next.js)

1. **New Page**
   - `/app/onboarding/[sessionId]/patient-availability/page.tsx`

2. **Features/Components**
   - `/features/patient-availability/` (new directory)
     - `PatientAvailabilityForm.tsx` - Calendar or checklist UI
     - `usePatientAvailability.ts` - Availability state management
     - `index.ts` - Exports

3. **GraphQL**
   - `/features/patient-availability/graphql/submitPatientAvailability.graphql`
   - Codegen will create hook: `useSubmitPatientAvailabilityMutation()`

4. **Update Existing Files**
   - `/app/onboarding/[sessionId]/matching/page.tsx` - Link to patient-availability on select
   - `/features/scheduling/ScheduleContainer.tsx` - Accept patient-availability for filtering
   - `/features/matching/TherapistMatchResults.tsx` - Navigate to patient-availability after select

---

## 9. ARCHITECTURE DECISION RECORDS

### Where Availability Selection Fits Best

**Option 1: Before Therapist Matching** ❌
- Problem: Don't know which therapists to match before availability
- Flow: assessment → demographics → insurance → **[patient-availability]** → matching

**Option 2: After Therapist Selection (RECOMMENDED)** ✅
- Benefit: Can filter matches by patient availability
- Flow: assessment → demographics → insurance → matching → **[patient-availability]** → schedule
- Therapist availability filtered by patient preferences
- Simpler UX (one decision at a time)

**Option 3: During Scheduling** ❌
- Problem: Too late, already filtered to one therapist
- Should be captured earlier for matching optimization

### Data Persistence Strategy
- Store in `patient_availabilities` table (not in onboarding_sessions.progress)
- Allow multiple availability windows (e.g., "Mon-Wed mornings" + "Fri evenings")
- Reusable for future appointment rescheduling
- Indexed for fast querying in matching filters

---

## 10. KEY GRAPHQL OPERATIONS

### Current (Already Implemented)
- `getMatchedTherapists(sessionId)` - Returns matched therapists
- `selectTherapist(sessionId, therapistId)` - Records selection
- `getTherapistAvailability(therapistId, timezone)` - Availability slots

### To Add
- `submitPatientAvailability(sessionId, availabilities)` - Store preferences
- `getFilteredTherapistAvailability(therapistId, patientAvailabilities)` - Filtered slots

---

## 11. COMPLETION STATUS

**✓ COMPLETE:**
- Onboarding flow pages (assessment, demographics, insurance)
- Therapist matching with AI scoring
- Appointment scheduling with calendar UI
- Patient data models and schema
- GraphQL API structure

**⚠ IN PROGRESS:**
- Epic 4: Insurance verification (completion needed)
- Epic 5: Enhanced scheduling (availability filtering pending)

**TODO:**
- Patient availability selection UI
- Database migrations for patient_availabilities
- GraphQL mutations/queries for availability
- Matching filter optimization
- Filtering logic in ScheduleContainer

---

## 12. TECHNOLOGY NOTES

### Frontend Patterns
- Uses React Hook Form + Zod for all forms
- Apollo Client with cache-and-network policy
- Auto-save to localStorage + backend
- Completion status tracking centralized
- Mobile-first responsive design

### Backend Patterns
- Rails STI for audit logging
- GraphQL resolvers follow namespaced modules
- Service classes for complex logic (MatchingService)
- Caching layer for performance optimization
- Type safety via GraphQL code generation

### Database Patterns
- UUIDs for primary keys
- JSONB for flexible metadata
- Arrays for lists (languages, specializations)
- Timezones stored as IANA strings
- Soft deletes via status enums

---

## SUMMARY

The Daybreak Health platform has a solid foundation for patient onboarding and therapist matching. The missing piece is **patient availability selection**, which should be added as a new step in the onboarding flow between therapist matching and appointment scheduling. This will enable better UX (filtering irrelevant slots) and better analytics (tracking patient availability patterns).

Implementation effort: **Medium** (1-2 days)
- New UI component (availability calendar/checklist)
- New database table + model
- New GraphQL mutation
- Updated routing
- No major architectural changes needed
