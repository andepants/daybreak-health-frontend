# Story 7.3: Support Availability and Request Tracking

Status: drafted

## Story

As a **parent reaching out for help**,
I want **to know when I'll get a response and track my request**,
So that **I don't feel ignored or abandoned**.

## Acceptance Criteria

1. **Availability Indicator Display**
   - When Intercom messenger loads, the interface displays:
     - Real-time availability indicator from Intercom
     - "Typically replies in X minutes" message (Intercom native feature)
     - Team member photos/avatars showing who's available

2. **After-Hours Experience**
   - Intercom's built-in away mode activates when support is offline
   - "Leave a message" prompt with expected response time
   - Email notification option for replies is available

3. **Message Status and Response Tracking**
   - After sending a message:
     - Message shows "Sent" indicator
     - Typing indicator appears when staff responds
     - Push/email notification when reply arrives

4. **Crisis Support Integration**
   - Crisis keywords (e.g., "suicide", "emergency") trigger immediate resources
   - Crisis response automation configured in Intercom dashboard

5. **Conversation Persistence**
   - Conversation history persists across browser sessions
   - User can access previous conversations on return

6. **Backend Analytics Tracking**
   - Support requests are tracked in backend via Intercom webhooks
   - Analytics capture response times, resolution rates, and conversation topics

## Tasks / Subtasks

- [ ] Configure Intercom Office Hours Feature (AC: #2)
  - [ ] Set business hours in Intercom dashboard
  - [ ] Configure away mode messages and expected response times
  - [ ] Test after-hours experience displays correctly

- [ ] Set Up Crisis Response Automation (AC: #4)
  - [ ] Configure keyword triggers in Intercom for crisis terms ("suicide", "emergency", "crisis", "harm")
  - [ ] Create automated response with immediate resources (crisis hotline numbers, 988)
  - [ ] Set up alerts to staff when crisis keywords detected
  - [ ] Test automation triggers correctly

- [ ] Verify Native Availability Features (AC: #1)
  - [ ] Confirm availability indicator displays correctly
  - [ ] Verify team member avatars appear when online
  - [ ] Test "Typically replies in X minutes" calculation
  - [ ] Validate real-time updates when staff status changes

- [ ] Configure Email Notifications (AC: #2, #3)
  - [ ] Enable email notification option in Intercom messenger
  - [ ] Configure notification templates for after-hours replies
  - [ ] Test email delivery when staff responds
  - [ ] Verify push notification settings work correctly

- [ ] Implement Backend Webhook Integration (AC: #6)
  - [ ] Set up Intercom webhook endpoint in backend
  - [ ] Configure webhooks for conversation events (created, replied, closed)
  - [ ] Implement webhook handler to store support request metadata
  - [ ] Add analytics tracking for response times and topics
  - [ ] Test webhook delivery and data storage

- [ ] Test Message Status Indicators (AC: #3)
  - [ ] Verify "Sent" indicator appears after message submission
  - [ ] Confirm typing indicator displays when staff types
  - [ ] Test notification delivery (push and email)
  - [ ] Validate message status updates in real-time

- [ ] Test Conversation Persistence (AC: #5)
  - [ ] Send messages and close browser
  - [ ] Reopen and verify conversation history loads
  - [ ] Test across different devices with same user
  - [ ] Verify conversation context persists after days

## Dev Notes

### Intercom Configuration Requirements

This story is primarily **configuration-focused** rather than code-heavy. Most functionality is provided natively by Intercom with proper dashboard configuration.

**Intercom Features Used:**
- **Office Hours**: Built-in feature for availability scheduling
- **Availability Indicator**: Native real-time status display
- **Expected Reply Time**: Automated based on team response patterns
- **Away Mode**: Automatic "Leave a message" state
- **Crisis Keywords**: Automation rules for keyword detection
- **Webhooks**: Event streaming for backend analytics

### Frontend Implementation

**Minimal Code Changes:**
Since Story 7.1 (Intercom Widget Integration) handles the core widget implementation, this story focuses on:
1. Verifying native features are enabled
2. Configuring Intercom dashboard settings
3. Testing user experience flows

**No New Components Required:**
All UI elements (availability indicator, typing indicator, message status) are provided by Intercom's native messenger interface.

### Backend Implementation

**Webhook Integration:**
- Backend must implement webhook endpoint to receive Intercom events
- Events to track:
  - `conversation.created`: New support request initiated
  - `conversation.user.replied`: Parent sent message
  - `conversation.admin.replied`: Staff responded
  - `conversation.closed`: Conversation resolved
- Store metadata for analytics:
  - Response time (time between user message and staff reply)
  - Conversation topic/tags
  - Resolution status
  - Crisis keyword flags

**Reference:** Backend story 7-3 (Support Request Tracking) implements the webhook handler.

### Crisis Response Automation

**Critical Safety Feature:**
Crisis keyword detection must be configured with highest priority in Intercom:

**Keywords to Monitor:**
- suicide, suicidal
- emergency
- crisis
- harm, self-harm
- kill myself
- end my life
- don't want to live

**Automated Response Template:**
```
I'm really concerned about what you're sharing. Your safety is our top priority.

If this is an emergency, please:
• Call 988 (Suicide & Crisis Lifeline) - available 24/7
• Call 911 for immediate medical help
• Text HOME to 741741 (Crisis Text Line)

A Daybreak team member has been notified and will reach out shortly. You're not alone.
```

**Staff Alert:**
When crisis keywords detected:
- Immediate Slack notification to on-call staff
- Email alert to clinical supervisor
- Conversation flagged in Intercom dashboard

### Testing Strategy

**Office Hours Testing:**
1. Set test business hours (e.g., 9 AM - 5 PM)
2. Access messenger during hours → verify availability indicator
3. Access messenger after hours → verify away mode and expected response time
4. Confirm email notification option appears in after-hours mode

**Crisis Keyword Testing:**
1. Send test messages with each crisis keyword
2. Verify automated response appears immediately
3. Confirm staff alert notifications sent
4. Check conversation flagged in Intercom dashboard

**Webhook Testing:**
1. Trigger conversation events (create, reply, close)
2. Verify webhook POST received by backend
3. Confirm data stored in analytics database
4. Validate response time calculations

### Architecture Alignment

**From Architecture Document:**
- Intercom handles availability display natively (no custom implementation)
- Crisis response configured via Intercom automation rules
- Backend tracks requests via webhooks (ADR-005: Human Support in MVP)
- No PHI passed to Intercom - only session ID and step context (Story 7.2)

**Performance Considerations:**
- Intercom SDK loads asynchronously (doesn't block page render)
- Webhook processing happens async in background jobs
- No impact on onboarding flow performance

### Privacy & Security

**PHI Protection:**
- Conversation content stays in Intercom (BAA in place)
- Backend analytics only store non-PHI metadata:
  - Session ID (non-sensitive identifier)
  - Onboarding step (e.g., "assessment", "insurance")
  - Response time metrics
  - Topic tags (generic categories)
- No assessment details, child names, or medical info passed to backend analytics

**HIPAA Compliance:**
- Intercom has signed BAA with Daybreak Health
- Webhook data transmission over HTTPS only
- Backend webhook endpoint requires authentication token

### References

- [Source: docs/epics.md#Story-7.3]
- [Source: docs/architecture.md#ADR-005-Human-Support-in-MVP]
- [Intercom Office Hours Documentation](https://www.intercom.com/help/en/articles/3500-set-your-teams-office-hours)
- [Intercom Automation Rules](https://www.intercom.com/help/en/articles/3679-how-to-create-and-edit-custom-bot-workflows)
- [Intercom Webhooks API](https://developers.intercom.com/docs/build-an-integration/webhooks/)
- Backend Story 7-3: Support Request Tracking (webhook implementation)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
