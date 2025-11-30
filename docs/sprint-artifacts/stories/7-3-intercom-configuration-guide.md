# Intercom Configuration Guide for Story 7-3
## Support Availability and Request Tracking

**Status:** Configuration Required
**Last Updated:** 2025-11-30
**Prerequisites:** Story 7-1 (Widget Integration) and Story 7-2 (Context Passing) must be complete

---

## Overview

This document provides step-by-step instructions for configuring Intercom dashboard features required by Story 7-3. Unlike Stories 7-1 and 7-2 which required frontend code, Story 7-3 is entirely configuration-based using Intercom's native features.

**No Frontend Code Changes Required** - All features are Intercom-native and configured via admin dashboard.

---

## Configuration Checklist

### ✅ Task 1: Configure Office Hours (AC #2)

**Purpose:** Enable automatic away mode when support is offline, showing expected response times.

**Steps:**

1. Log into Intercom admin dashboard
2. Navigate to **Settings** → **Workspace** → **Office hours**
3. Configure business hours:
   ```
   Monday - Friday: 9:00 AM - 5:00 PM (PT)
   Saturday - Sunday: Closed
   ```
4. Enable **Away mode outside office hours**
5. Configure away message template:
   ```
   Thanks for reaching out to Daybreak Health support!

   Our team is currently offline. We typically respond within 1 hour during business hours (Mon-Fri 9 AM - 5 PM PT).

   Leave us a message and we'll get back to you as soon as we're online.

   Would you like to receive an email when we reply?
   ```
6. Set expected response time: **1 hour** (during business hours)
7. Enable **Email notification option** for after-hours messages
8. Save configuration

**Verification:**
- Access application during business hours → verify "Online" indicator
- Access application after hours → verify away mode message appears
- Confirm email notification option is available in away mode

---

### ✅ Task 2: Set Up Crisis Response Automation (AC #4)

**Purpose:** Automatically detect crisis keywords and provide immediate safety resources.

**⚠️ CRITICAL SAFETY FEATURE - HIGHEST PRIORITY**

**Steps:**

1. Navigate to **Automation** → **Custom bots**
2. Create new automation: **"Crisis Response Bot"**
3. Set trigger: **Message contains keywords**
4. Configure keyword list (case-insensitive):
   ```
   suicide
   suicidal
   emergency
   crisis
   harm
   self-harm
   self harm
   kill myself
   end my life
   don't want to live
   want to die
   hurt myself
   ```
5. Set priority: **Highest** (runs before all other automations)
6. Configure automated response:

   ```markdown
   I'm really concerned about what you're sharing. Your safety is our top priority.

   If this is an emergency, please:
   • Call **988** (Suicide & Crisis Lifeline) - available 24/7
   • Call **911** for immediate medical help
   • Text **HOME** to **741741** (Crisis Text Line)

   A Daybreak team member has been notified and will reach out shortly. You're not alone.
   ```

7. Configure staff alerts:
   - **Slack notification**: Post to `#support-urgent` channel
   - **Email alert**: Send to clinical supervisor (clinicalsupervisor@daybreakhealth.com)
   - **Conversation tag**: Add "🚨 Crisis" tag
   - **Assignment**: Auto-assign to on-call clinician

8. Set conversation priority: **Urgent**
9. Save and activate automation

**Testing:**
- Send test messages with each keyword
- Verify automated response appears immediately
- Confirm Slack notification sent
- Confirm email alert sent
- Check conversation tagged "🚨 Crisis" in dashboard

**Safety Validation:**
- Response time must be < 5 seconds
- Resources (988, 911, Crisis Text Line) must be prominently displayed
- Staff alerts must trigger every time (no rate limiting)

---

### ✅ Task 3: Configure Email Notifications (AC #2, #3)

**Purpose:** Allow parents to receive email notifications when staff responds.

**Steps:**

1. Navigate to **Settings** → **Messenger** → **Email notifications**
2. Enable **Email notifications for customers**
3. Configure notification preferences:
   - ✅ Send email when staff replies
   - ✅ Send email when conversation is resolved
   - ✅ Include conversation history in email
4. Customize email template with Daybreak branding:
   - From name: "Daybreak Support"
   - From email: support@daybreakhealth.com
   - Subject line: "{{teammate_name}} replied to your message"
   - Logo: Upload Daybreak logo
5. Configure notification frequency:
   - Immediately (no batching)
6. Save configuration

**Verification:**
- Send test message as parent
- Have staff member reply
- Verify email received with reply content
- Check email formatting and branding

---

### ✅ Task 4: Verify Native Availability Features (AC #1)

**Purpose:** Ensure Intercom's built-in availability features are enabled and displaying correctly.

**Features to Verify:**

1. **Real-time availability indicator:**
   - Green dot when team members online
   - "Typically replies in X minutes" calculation
   - Automatic updates when staff status changes

2. **Team member avatars:**
   - Photos appear when staff is online
   - Multiple avatars shown if multiple team members available
   - Avatars update in real-time

3. **Expected reply time:**
   - Based on historical response patterns
   - Updates as team performance changes
   - Displays in messenger header

**Configuration Check:**

1. Navigate to **Settings** → **Messenger** → **Messenger settings**
2. Verify enabled:
   - ✅ Show teammate profiles
   - ✅ Show expected response time
   - ✅ Show availability indicator
3. Ensure team members have:
   - Profile photos uploaded
   - Status set to "Active" during business hours
   - Proper role assignments

**Testing:**
- Open messenger during business hours
- Verify availability indicator shows "Online"
- Verify team member avatars appear
- Verify "Typically replies in X minutes" displays
- Change staff status to "Away" → verify real-time update

---

### ✅ Task 5: Implement Backend Webhook Integration (AC #6)

**Purpose:** Track support requests and analytics in backend database.

**⚠️ BACKEND TEAM RESPONSIBILITY - Not Frontend Scope**

**Frontend Verification Only:**

This task is implemented by the backend team. Frontend's role is to verify:

1. Intercom widget successfully triggers conversation events
2. No errors in browser console related to Intercom
3. Conversations persist correctly across sessions

**Backend Requirements (for reference):**

The backend team must implement:

- **Webhook endpoint:** `POST /api/webhooks/intercom`
- **Authentication:** Intercom webhook secret validation
- **Events to handle:**
  - `conversation.created` - New support request
  - `conversation.user.replied` - Parent sent message
  - `conversation.admin.replied` - Staff responded
  - `conversation.closed` - Conversation resolved

**Frontend Testing:**

1. Create new conversation in Intercom
2. Send messages back and forth
3. Close conversation
4. Verify no JavaScript errors in console
5. Verify conversation history persists on page refresh

**Webhook Configuration (Backend Team):**

1. In Intercom dashboard: **Settings** → **Developers** → **Webhooks**
2. Add webhook URL: `https://api.daybreakhealth.com/webhooks/intercom`
3. Select events:
   - ✅ conversation.created
   - ✅ conversation.user.replied
   - ✅ conversation.admin.replied
   - ✅ conversation.closed
4. Copy webhook secret and provide to backend team
5. Test webhook delivery using Intercom's test tool

---

### ✅ Task 6: Test Message Status Indicators (AC #3)

**Purpose:** Verify Intercom's native message status and typing indicators work correctly.

**Native Features to Test:**

1. **"Sent" indicator:**
   - ✓ checkmark appears after message sends
   - Shows message delivery status
   - Updates when staff reads message

2. **Typing indicator:**
   - "{{staff_name}} is typing..." appears when staff types
   - Shows in real-time
   - Disappears when staff stops typing

3. **Push notifications:**
   - Browser notification when reply arrives
   - Requires user to grant notification permission
   - Includes message preview

4. **Read receipts:**
   - Shows when staff has read message
   - Displays timestamp

**Testing Procedure:**

1. **Sent Indicator Test:**
   - Send message from parent account
   - Verify ✓ appears next to message
   - Wait for staff to open → verify ✓✓ (read receipt)

2. **Typing Indicator Test:**
   - Have staff member start typing
   - Verify "is typing..." appears in messenger
   - Verify indicator disappears when typing stops

3. **Push Notification Test:**
   - Grant browser notification permission
   - Send message and wait for reply
   - Verify browser notification appears
   - Verify notification contains reply preview
   - Click notification → verify opens messenger

4. **Email Notification Test:**
   - Configure email notifications
   - Send message and wait for reply
   - Verify email notification received
   - Click email link → verify opens conversation

**All features above are Intercom-native - no custom implementation required.**

---

### ✅ Task 7: Test Conversation Persistence (AC #5)

**Purpose:** Verify conversation history persists across browser sessions and devices.

**Test Scenarios:**

**Test 1: Same Browser, Close and Reopen**
1. Send 3-5 messages in conversation
2. Close browser completely
3. Reopen browser and navigate to app
4. Open Intercom messenger
5. ✅ Verify all messages still visible
6. ✅ Verify conversation context preserved

**Test 2: Different Browser, Same User**
1. Send messages in Chrome
2. Copy user email
3. Open Safari (or Firefox)
4. Log in with same email
5. Open Intercom messenger
6. ✅ Verify same conversation history appears
7. Send message from Safari
8. ✅ Verify appears in Chrome conversation

**Test 3: Different Device, Same User**
1. Send messages on desktop
2. Open app on mobile device with same account
3. Open Intercom messenger
4. ✅ Verify conversation history synced
5. Send message from mobile
6. ✅ Verify appears on desktop

**Test 4: Long-term Persistence**
1. Send messages
2. Wait 24-48 hours
3. Return to app
4. Open Intercom messenger
5. ✅ Verify conversation still accessible
6. ✅ Verify messages from days ago visible

**Expected Behavior:**
- Conversations persist indefinitely
- History syncs across all devices/browsers
- User identity tied to email address
- No data loss on browser cache clear

**Intercom Handles Persistence Automatically:**
- Server-side conversation storage
- User identification via email
- Cross-device synchronization
- No frontend implementation needed

---

## Testing Validation Checklist

Use this checklist to verify all acceptance criteria are met:

### AC #1: Availability Indicator Display
- [ ] Availability indicator shows "Online" during business hours
- [ ] "Typically replies in X minutes" message displays
- [ ] Team member avatars appear when online
- [ ] Real-time updates when staff status changes

### AC #2: After-Hours Experience
- [ ] Away mode activates outside business hours
- [ ] "Leave a message" prompt with expected response time
- [ ] Email notification option available

### AC #3: Message Status and Response Tracking
- [ ] "Sent" indicator (✓) appears after message sent
- [ ] Typing indicator shows when staff types
- [ ] Push notification delivered when reply arrives
- [ ] Email notification option works

### AC #4: Crisis Support Integration
- [ ] Crisis keywords trigger automated response
- [ ] Response includes 988, 911, Crisis Text Line
- [ ] Staff alerts sent to Slack and email
- [ ] Conversation tagged "🚨 Crisis"
- [ ] All keywords tested: suicide, emergency, crisis, harm, self-harm, kill myself, end my life, don't want to live

### AC #5: Conversation Persistence
- [ ] Conversation history persists after browser close
- [ ] History accessible from different browsers (same user)
- [ ] History syncs across devices
- [ ] Conversations persist after days

### AC #6: Backend Analytics Tracking
- [ ] Backend webhook receives conversation.created events
- [ ] Backend stores response time metrics
- [ ] Backend stores conversation topics/tags
- [ ] Backend tracks crisis keyword flags
- [ ] No PHI passed to backend analytics

---

## PHI Protection Validation

**Critical:** Verify no Protected Health Information (PHI) is transmitted to Intercom or backend analytics.

### Allowed Data (Non-PHI):
✅ Session ID (non-sensitive identifier)
✅ Onboarding step (e.g., "assessment", "insurance")
✅ Parent name and email (already consented)
✅ Child first name only (if collected)
✅ Boolean flags (assessment_complete, insurance_submitted)

### Prohibited Data (PHI):
❌ Assessment content/responses
❌ Child's specific concerns or symptoms
❌ Clinical notes or diagnoses
❌ Insurance details (except boolean "submitted" flag)
❌ Payment information
❌ Full child name with last name
❌ Medical history details

### Verification Steps:
1. Review Intercom conversation payload in browser Network tab
2. Check User Attributes passed to Intercom (from Story 7-2)
3. Review backend webhook payloads
4. Confirm PHI filter utility is applied (from Story 7-2: `lib/utils/phi-filter.ts`)
5. Verify only session ID and step context passed to backend analytics

**PHI Protection is enforced by Story 7-2's implementation** - no additional code needed for Story 7-3.

---

## Configuration Sign-off

Once all configurations are complete and tested, document completion:

**Configured By:** ___________________
**Date:** ___________________
**Environment:** [ ] Development [ ] Staging [ ] Production

**Configuration Verification:**
- [ ] Office Hours configured and tested
- [ ] Crisis Response Automation active and tested
- [ ] Email Notifications enabled and tested
- [ ] Availability Features verified
- [ ] Backend Webhooks configured (Backend Team)
- [ ] Message Status Indicators tested
- [ ] Conversation Persistence tested
- [ ] PHI Protection validated

**Approval:**
- [ ] Product Manager Review
- [ ] Clinical Supervisor Review (for Crisis Response)
- [ ] Backend Team Confirmation (for webhooks)

---

## Troubleshooting

### Issue: Availability indicator not showing

**Solution:**
1. Check team members have "Active" status in Intercom
2. Verify "Show availability indicator" enabled in Messenger settings
3. Ensure at least one team member is online

### Issue: Crisis automation not triggering

**Solution:**
1. Verify automation priority is set to "Highest"
2. Check keywords match exactly (case-insensitive)
3. Ensure automation is "Active" (not paused)
4. Test with exact keyword strings from configuration

### Issue: Email notifications not received

**Solution:**
1. Check spam/junk folder
2. Verify email address in Intercom user profile
3. Confirm "Email notifications" enabled in settings
4. Test with different email provider (Gmail, Outlook, etc.)

### Issue: Conversation not persisting

**Solution:**
1. Verify user is identified (email passed in Story 7-2 context)
2. Check browser not in incognito mode
3. Ensure Intercom cookies not blocked
4. Verify same email used across devices

### Issue: Webhook not receiving events

**Backend Team Issue:**
1. Verify webhook URL is accessible from Intercom servers
2. Check webhook secret validation
3. Review Intercom webhook delivery logs
4. Ensure HTTPS endpoint (HTTP not supported)

---

## References

- **Intercom Office Hours Documentation:** https://www.intercom.com/help/en/articles/3500-set-your-teams-office-hours
- **Intercom Automation Rules:** https://www.intercom.com/help/en/articles/3679-how-to-create-and-edit-custom-bot-workflows
- **Intercom Webhooks API:** https://developers.intercom.com/docs/build-an-integration/webhooks/
- **Story 7-1:** Intercom Widget Integration (prerequisite)
- **Story 7-2:** Session Context Passing (prerequisite)
- **Backend Story 7-3:** Support Request Tracking (webhook implementation)

---

## Notes

- This story requires **zero frontend code changes**
- All functionality is Intercom-native
- Configuration must be done in Intercom admin dashboard
- Backend webhook implementation is separate (Backend Epic 7)
- Testing is primarily manual verification
- PHI protection already enforced by Story 7-2
