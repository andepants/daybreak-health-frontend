# Story 5.3: Appointment Calendar and Time Selection

Status: ready-for-dev

## Story

As a parent,
I want to see available appointment times and select one,
so that I can book when it works for our family's schedule.

## Acceptance Criteria

| # | Criterion | Testable Assertion |
|---|-----------|-------------------|
| AC-5.3.1 | Calendar displays month view with available dates | Month calendar renders with highlighted available dates |
| AC-5.3.2 | Selected date is visually highlighted in teal | Date selection applies teal highlight styling |
| AC-5.3.3 | Time slots appear after date selection | Selecting date triggers time slot display |
| AC-5.3.4 | Time slots show in user's local timezone | Displayed times match browser timezone |
| AC-5.3.5 | Available times are selectable, unavailable are disabled | Available slots are clickable, unavailable are grayed out |
| AC-5.3.6 | Selected time slot shows checkmark and teal fill | Selected slot has visual confirmation |
| AC-5.3.7 | Session details show therapist name and duration | "First session with [therapist]" and "50 minutes" displayed |
| AC-5.3.8 | Timezone is displayed and editable | Timezone selector present and functional |
| AC-5.3.9 | "Confirm Booking" button enabled after time selection | Button state changes from disabled to enabled |
| AC-5.3.10 | User can navigate back to change therapist | Back navigation maintains previous selections |
| AC-5.3.11 | Slots update in real-time if booked by another user | Real-time slot availability via subscription (optional for MVP) |

## Tasks / Subtasks

- [ ] Task 1: Create Calendar component (AC: 5.3.1, 5.3.2)
  - [ ] Create features/scheduling/Calendar.tsx
  - [ ] Implement month view with date navigation
  - [ ] Highlight available dates (different style from unavailable)
  - [ ] Apply teal highlight to selected date
  - [ ] Mark today's date distinctly
  - [ ] Add prev/next month navigation arrows
  - [ ] Write unit tests for calendar rendering

- [ ] Task 2: Implement TimeSlotPicker component (AC: 5.3.3, 5.3.5, 5.3.6)
  - [ ] Create features/scheduling/TimeSlotPicker.tsx
  - [ ] Display time slots after date selection
  - [ ] Render available slots as clickable buttons
  - [ ] Gray out unavailable slots with strikethrough
  - [ ] Apply teal fill and checkmark to selected slot
  - [ ] Write unit tests for time slot interactions

- [ ] Task 3: Implement timezone handling (AC: 5.3.4, 5.3.8)
  - [ ] Detect user's browser timezone (Intl.DateTimeFormat)
  - [ ] Format all displayed times in selected timezone
  - [ ] Create timezone selector component
  - [ ] Allow user to change timezone
  - [ ] Update all times when timezone changes
  - [ ] Write unit tests for timezone conversion

- [ ] Task 4: Display session details (AC: 5.3.7)
  - [ ] Show "First session with [therapist name]"
  - [ ] Display "50 minutes" duration
  - [ ] Add "Video call" badge
  - [ ] Display selected timezone
  - [ ] Write unit tests for session details rendering

- [ ] Task 5: Create useScheduling hook (AC: 5.3.1, 5.3.3)
  - [ ] Create features/scheduling/useScheduling.ts
  - [ ] Implement getTherapistAvailability query hook
  - [ ] Manage selected date state
  - [ ] Manage selected time slot state
  - [ ] Compute available/unavailable dates from API
  - [ ] Write unit tests for scheduling hook

- [ ] Task 6: Implement "Confirm Booking" button state (AC: 5.3.9)
  - [ ] Create button in disabled state by default
  - [ ] Enable button when time slot is selected
  - [ ] Add visual feedback for enabled/disabled states
  - [ ] Write unit tests for button state logic

- [ ] Task 7: Create scheduling page (AC: all)
  - [ ] Create app/onboarding/[sessionId]/schedule/page.tsx
  - [ ] Integrate Calendar component
  - [ ] Integrate TimeSlotPicker component
  - [ ] Integrate session details display
  - [ ] Add "Confirm Booking" button
  - [ ] Add back navigation to therapist selection
  - [ ] Wire up component interactions
  - [ ] Write integration tests for complete flow

- [ ] Task 8: Create GraphQL operations
  - [ ] Create graphql/queries/GetTherapistAvailability.graphql
  - [ ] Define query for fetching available slots
  - [ ] Include therapist ID, date range parameters
  - [ ] Run codegen to generate types and hooks
  - [ ] Write tests for query execution

- [ ] Task 9: Implement real-time slot updates (AC: 5.3.11) - Optional for MVP
  - [ ] Create graphql/subscriptions/AvailabilityUpdated.graphql
  - [ ] Subscribe to slot availability changes
  - [ ] Update calendar when slots are booked
  - [ ] Handle subscription reconnection
  - [ ] Write integration tests for real-time updates

- [ ] Task 10: Add loading and error states
  - [ ] Show skeleton calendar while loading availability
  - [ ] Handle API errors gracefully with retry
  - [ ] Display error message if availability fetch fails
  - [ ] Write tests for loading and error states

- [ ] Task 11: Accessibility improvements
  - [ ] Add ARIA labels to calendar dates
  - [ ] Add keyboard navigation (arrow keys for calendar)
  - [ ] Add focus indicators for time slots
  - [ ] Ensure minimum 44x44px touch targets
  - [ ] Test with screen reader

## Dev Notes

### Dependencies
- Calendar component from shadcn/ui or custom implementation
- Selected therapist from previous page (matching/profile)
- GraphQL query for therapist availability
- Session ID from URL params

### Architecture Patterns
- Use React Hook Form for any form elements (timezone selector)
- Store selected date/time in local state until confirmation
- Follow mobile-first design principles (single column layout)
- Use Tailwind CSS classes for styling with Daybreak theme
[Source: docs/architecture.md#Project-Structure]

### Component Structure
```
features/scheduling/
├── Calendar.tsx          # Month view calendar
├── TimeSlotPicker.tsx    # Time slot selection
├── SessionDetails.tsx    # Therapist info and session details (optional extraction)
├── useScheduling.ts      # Scheduling state and queries
└── scheduling.graphql    # GraphQL operations
```

### GraphQL Schema Reference
From `docs/sprint-artifacts/api_schema.graphql`:
- Query: `getTherapistAvailability(therapistId: ID!, startDate: Date!, endDate: Date!): [AvailableSlot]`
- Type: `AvailableSlot { date: Date!, startTime: Time!, endTime: Time!, available: Boolean! }`

### Calendar Implementation Options
1. **shadcn/ui Calendar**: Pre-built, accessible, customizable
2. **Custom Calendar**: Full control, implement from scratch with date-fns
3. **react-day-picker**: Popular library, good accessibility

**Recommendation**: Start with shadcn/ui Calendar, extend as needed
[Source: docs/architecture.md#Decision-Summary]

### Timezone Handling
- Use `Intl.DateTimeFormat().resolvedOptions().timeZone` to detect user timezone
- Use `date-fns-tz` for timezone conversions
- Display timezone abbreviation (PST, EST, etc.) next to times
- Allow manual timezone selection via dropdown
[Source: docs/epics.md#Story-5.3]

### Time Slot Data Structure
```typescript
interface TimeSlot {
  id: string;
  startTime: string;      // ISO 8601 format
  endTime: string;        // ISO 8601 format
  available: boolean;
  therapistId: string;
}

interface SchedulingState {
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  timezone: string;
  availableSlots: TimeSlot[];
}
```

### Session Details Display
From Epic 5 Story 5.3 AC:
- "First session with [therapist name]"
- "50 minutes"
- "Video call" badge
- Timezone displayed and editable

### Visual Design Specifications
From UX Design Specification:
- Teal highlight color: #2A9D8F (daybreak-teal)
- Selected state: solid teal fill with white checkmark
- Unavailable dates: grayed out (opacity 0.5)
- Today marker: subtle border or badge
- Touch targets: minimum 44x44px
[Source: docs/architecture.md#UX-Design-Specification]

### Real-Time Updates (Optional for MVP)
- Subscription to availability changes
- Update UI when another user books a slot
- Show "Just booked" notification briefly
- Fallback to polling if WebSocket unavailable
[Source: docs/architecture.md#Real-time]

### Navigation Flow
```
Previous: /onboarding/[sessionId]/matching (therapist selection)
Current:  /onboarding/[sessionId]/schedule
Next:     /onboarding/[sessionId]/confirmation (Story 5.4)
```

### Testing Standards
- **Unit Tests**: Calendar rendering, date selection, time slot selection, timezone conversion
- **Integration Tests**: Full scheduling flow (select date → select time → enable button)
- **E2E Tests**: Complete user journey from therapist selection to booking confirmation
- **Accessibility Tests**: Keyboard navigation, screen reader compatibility
[Source: docs/architecture.md#Testing]

### Error Handling
- No availability found: "No appointments available in the next 30 days. Contact support."
- Network error: Show retry button with error message
- Invalid date selection: Prevent selection of past dates
- Slot unavailable on confirmation: Alert user and refresh availability

### Performance Considerations
- Load next 30 days of availability initially
- Lazy load additional months on navigation
- Debounce timezone changes
- Optimize calendar re-renders (React.memo for date cells)

### Mobile-First Considerations
- Calendar should be scrollable on small screens
- Time slots in vertical list (not grid) on mobile
- Month navigation easily tappable
- Timezone selector accessible but not intrusive
[Source: docs/architecture.md#Fundamental-Truths]

### Project Structure Notes
- Place components in `features/scheduling/` per architecture
- Use `app/onboarding/[sessionId]/schedule/page.tsx` for route
- Follow existing patterns from demographics and insurance pages
- Reuse layout components (Header, OnboardingProgress, Footer)

### Learnings from Previous Stories
This is Story 5.3, following stories 5.1 and 5.2 which should handle therapist matching and profile display.

**Expected inputs from previous stories:**
- Selected therapist ID from Story 5.1/5.2
- Therapist name and photo from matching results
- Session context (assessment data, demographics)

**Key patterns to follow:**
- Auto-save pattern from Epic 2 and 3 stories
- Error boundary wrapping from layout
- Optimistic UI updates from previous mutation patterns
- Mobile-first responsive design from all previous stories

### References
- [Source: docs/epics.md#Story-5.3]
- [Source: docs/architecture.md#Project-Structure]
- [Source: docs/architecture.md#Decision-Summary]
- [Source: docs/architecture.md#Fundamental-Truths]
- [Source: docs/sprint-artifacts/api_schema.graphql]

## Dev Agent Record

### Context Reference

**Story Context XML:** `docs/sprint-artifacts/5-3-appointment-calendar-and-time-selection.context.xml`

Created: 2025-11-29
Status: Complete

### Agent Model Used
<!-- Will be filled by dev agent -->

### Debug Log References

### Completion Notes List

### File List

## Change Log
- 2025-11-29: Story drafted from epics.md Epic 5 Story 5.3
