# Manual Testing Guide: Intercom Availability and Request Tracking
## Story 7-3 Validation

**Test Date:** ___________________
**Tester:** ___________________
**Environment:** ___________________
**Intercom App ID:** ___________________

---

## Prerequisites

Before starting tests:

- [ ] Story 7-1 (Intercom Widget Integration) is complete
- [ ] Story 7-2 (Session Context Passing) is complete
- [ ] Intercom dashboard configurations are complete (see 7-3-intercom-configuration-guide.md)
- [ ] Valid `NEXT_PUBLIC_INTERCOM_APP_ID` configured in `.env.local`
- [ ] Application running locally or on test server
- [ ] Access to Intercom admin dashboard
- [ ] Test user account with email address

---

## Test Suite 1: Availability Indicator Display (AC #1)

### Test 1.1: Online Availability During Business Hours

**Preconditions:**
- Current time is within configured business hours (e.g., Mon-Fri 9 AM - 5 PM)
- At least one team member is "Active" in Intercom

**Steps:**
1. Navigate to onboarding page (any step)
2. Locate Intercom chat bubble in bottom-right corner
3. Click to open messenger

**Expected Results:**
- [ ] Green "Online" indicator visible
- [ ] "Typically replies in X minutes" message displays
- [ ] Team member avatars appear (if team members online)
- [ ] Messenger header shows "Chat with Daybreak Support"

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail

---

### Test 1.2: Real-Time Availability Updates

**Preconditions:**
- Messenger is open
- Team member status is "Active"

**Steps:**
1. Keep messenger open
2. Have team member change status to "Away" in Intercom dashboard
3. Wait 5-10 seconds
4. Observe messenger interface

**Expected Results:**
- [ ] Availability indicator updates from "Online" to "Away" without page refresh
- [ ] Team member avatar may disappear or show away status
- [ ] No page refresh required for update

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail

---

### Test 1.3: Expected Reply Time Calculation

**Preconditions:**
- Team has historical response data in Intercom

**Steps:**
1. Open messenger
2. Observe header message

**Expected Results:**
- [ ] Message displays expected reply time (e.g., "Typically replies in 5 minutes")
- [ ] Time is based on team's actual response patterns
- [ ] Message is visible before sending any messages

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail

---

## Test Suite 2: After-Hours Experience (AC #2)

### Test 2.1: Away Mode Activation

**Preconditions:**
- Current time is OUTSIDE configured business hours
- OR office hours set to simulate "away" mode

**Steps:**
1. Navigate to onboarding page
2. Click Intercom chat bubble
3. Observe messenger interface

**Expected Results:**
- [ ] "Away" or "Offline" indicator visible
- [ ] Away message displays (configured in Intercom dashboard)
- [ ] Message includes expected response time
- [ ] "Leave a message" prompt visible

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail

---

### Test 2.2: Email Notification Option

**Preconditions:**
- Away mode active (outside business hours)

**Steps:**
1. Open messenger in away mode
2. Look for email notification option
3. Attempt to send a message

**Expected Results:**
- [ ] Option to "Get notified by email when we reply" is visible
- [ ] Checkbox or toggle to enable email notifications
- [ ] Message can be sent even when team is away
- [ ] Confirmation message appears after sending

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail

---

## Test Suite 3: Message Status and Response Tracking (AC #3)

### Test 3.1: Sent Indicator

**Preconditions:**
- Messenger is open

**Steps:**
1. Type a test message: "Testing message status indicators"
2. Send message
3. Observe message in conversation

**Expected Results:**
- [ ] Checkmark (✓) appears next to message immediately after sending
- [ ] Message shows "Sent" status
- [ ] No error messages appear

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail

---

### Test 3.2: Typing Indicator

**Preconditions:**
- Have a team member available to respond
- Messenger is open with active conversation

**Steps:**
1. Send message to support
2. Have team member start typing response
3. Observe messenger interface while team member types

**Expected Results:**
- [ ] "{{Staff Name}} is typing..." indicator appears
- [ ] Indicator shows in real-time as staff types
- [ ] Indicator disappears when staff stops typing
- [ ] Indicator reappears if staff resumes typing

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail

---

### Test 3.3: Push Notifications (Browser)

**Preconditions:**
- Browser notifications enabled
- User has granted notification permission

**Steps:**
1. Send message to support
2. Minimize browser or switch to different tab
3. Have team member reply
4. Observe browser notifications

**Expected Results:**
- [ ] Browser notification appears when reply arrives
- [ ] Notification includes staff name
- [ ] Notification includes message preview
- [ ] Clicking notification opens Intercom messenger

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail

---

### Test 3.4: Email Notifications

**Preconditions:**
- Email notifications enabled in Intercom
- Test user has email address configured

**Steps:**
1. Send message to support
2. Have team member reply
3. Check email inbox (may take 1-2 minutes)

**Expected Results:**
- [ ] Email notification received
- [ ] Email contains reply content
- [ ] Email has Daybreak branding
- [ ] Email includes link to continue conversation

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail

---

## Test Suite 4: Crisis Support Integration (AC #4)

**⚠️ CRITICAL SAFETY FEATURE - Test Each Keyword**

### Test 4.1: Crisis Keyword Detection - "suicide"

**Steps:**
1. Open messenger
2. Send message: "I'm feeling suicidal and need help"
3. Observe response

**Expected Results:**
- [ ] Automated response appears within 5 seconds
- [ ] Response includes 988 Suicide & Crisis Lifeline
- [ ] Response includes 911 for immediate medical help
- [ ] Response includes Crisis Text Line (741741)
- [ ] Response reassures user help is coming
- [ ] Conversation tagged "🚨 Crisis" in Intercom dashboard
- [ ] Staff alert sent to Slack (verify with team)
- [ ] Email alert sent to clinical supervisor (verify with team)

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail

---

### Test 4.2: Crisis Keyword Detection - "emergency"

**Steps:**
1. Start new conversation or continue existing
2. Send message: "This is an emergency"
3. Observe response

**Expected Results:**
- [ ] Same automated crisis response appears
- [ ] All crisis resources provided
- [ ] Staff alerts triggered

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail

---

### Test 4.3: Crisis Keyword Detection - "harm"

**Steps:**
1. Send message: "I want to harm myself"
2. Observe response

**Expected Results:**
- [ ] Crisis automation triggered
- [ ] Resources provided
- [ ] Staff alerts sent

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail

---

### Test 4.4: Additional Crisis Keywords

**Test the following keywords (one per message):**

| Keyword | Triggered? | Resources Shown? | Staff Alert? |
|---------|------------|------------------|--------------|
| "crisis" | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No |
| "self-harm" | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No |
| "kill myself" | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No |
| "end my life" | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No |
| "don't want to live" | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No |

**All keywords must trigger crisis automation.**

**Status:** [ ] Pass [ ] Fail

---

### Test 4.5: Crisis Response Content Validation

**Verify the automated crisis response contains:**

- [ ] Empathetic opening ("I'm really concerned about what you're sharing")
- [ ] "Your safety is our top priority" message
- [ ] 988 Suicide & Crisis Lifeline with "24/7" note
- [ ] 911 for immediate medical help
- [ ] Crisis Text Line: HOME to 741741
- [ ] Reassurance: "A Daybreak team member has been notified"
- [ ] "You're not alone" supportive message
- [ ] All resources are prominently formatted (bullets or bold)

**Status:** [ ] Pass [ ] Fail

---

## Test Suite 5: Conversation Persistence (AC #5)

### Test 5.1: Same Browser Session Persistence

**Steps:**
1. Open messenger and send 3 messages
2. Close messenger (click X)
3. Navigate to different page in app
4. Return to original page
5. Open messenger again

**Expected Results:**
- [ ] All 3 messages still visible
- [ ] Conversation history intact
- [ ] No messages lost

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail

---

### Test 5.2: Browser Close and Reopen Persistence

**Steps:**
1. Send 5 messages in conversation
2. Note message content
3. Close browser completely (quit application)
4. Reopen browser
5. Navigate to app
6. Open Intercom messenger

**Expected Results:**
- [ ] All 5 messages still visible
- [ ] Conversation continues from where left off
- [ ] No need to start new conversation

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail

---

### Test 5.3: Cross-Browser Persistence

**Steps:**
1. Send messages in Chrome
2. Note user email address
3. Open app in Safari (or Firefox)
4. Log in with same email
5. Open Intercom messenger

**Expected Results:**
- [ ] Same conversation appears in Safari
- [ ] All messages from Chrome visible
- [ ] Can continue conversation seamlessly

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail

---

### Test 5.4: Cross-Device Persistence

**Steps:**
1. Send messages on desktop
2. Open app on mobile device (or vice versa)
3. Use same user email
4. Open Intercom messenger

**Expected Results:**
- [ ] Conversation synced across devices
- [ ] All messages visible on both devices
- [ ] Can send message from mobile, see on desktop

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail

---

### Test 5.5: Long-Term Persistence

**Steps:**
1. Send messages
2. Wait 24-48 hours
3. Return to app
4. Open messenger

**Expected Results:**
- [ ] Conversation from 24-48 hours ago still accessible
- [ ] All message history preserved
- [ ] No data loss over time

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail (Note: May require 24-48 hour delay to test)

---

## Test Suite 6: Frontend Integration Validation (AC #6)

**Note:** Backend webhook implementation is separate. This tests frontend integration only.

### Test 6.1: No Console Errors

**Steps:**
1. Open browser DevTools (F12)
2. Navigate to Console tab
3. Navigate through onboarding flow
4. Open messenger
5. Send messages
6. Monitor console for errors

**Expected Results:**
- [ ] No Intercom-related errors in console
- [ ] No failed network requests to Intercom
- [ ] No JavaScript exceptions

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail

---

### Test 6.2: Intercom Script Loading

**Steps:**
1. Open browser DevTools (F12)
2. Navigate to Network tab
3. Filter by "intercom"
4. Load app page
5. Observe network requests

**Expected Results:**
- [ ] Intercom widget script loads asynchronously
- [ ] Script loads from widget.intercom.io
- [ ] Script loads successfully (status 200)
- [ ] Page render not blocked by script loading

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail

---

### Test 6.3: User Context Passed (from Story 7-2)

**Steps:**
1. Open DevTools → Network tab
2. Filter by "intercom"
3. Navigate through onboarding flow
4. Open messenger
5. Inspect Intercom API calls
6. Look for user attributes in request payload

**Expected Results:**
- [ ] User attributes passed to Intercom (from Story 7-2)
- [ ] Attributes include: session_id, onboarding_step
- [ ] Parent name and email included (if collected)
- [ ] NO PHI in attributes (no assessment details, diagnoses, etc.)

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail

---

## Test Suite 7: PHI Protection Validation

**Critical: Ensure no Protected Health Information is transmitted**

### Test 7.1: Intercom User Attributes Review

**Steps:**
1. Open DevTools → Network tab
2. Open messenger
3. Find Intercom API requests
4. Review request payloads
5. Check user attributes sent

**Verify ALLOWED data:**
- [ ] Session ID (non-sensitive)
- [ ] Onboarding step name (e.g., "assessment")
- [ ] Parent name and email
- [ ] Boolean flags (assessment_complete, insurance_submitted)

**Verify PROHIBITED data is NOT sent:**
- [ ] Assessment responses or content
- [ ] Child's specific concerns or symptoms
- [ ] Clinical notes or diagnoses
- [ ] Insurance details (beyond boolean flag)
- [ ] Payment information
- [ ] Medical history

**Status:** [ ] Pass [ ] Fail

---

### Test 7.2: Conversation Content PHI Check

**Steps:**
1. Review messages sent in conversation
2. Verify only parent-initiated content is in Intercom
3. Confirm no auto-populated PHI in messages

**Expected Results:**
- [ ] Only messages user manually types appear in conversation
- [ ] No auto-populated assessment data
- [ ] No pre-filled sensitive information
- [ ] User controls what information they share

**Status:** [ ] Pass [ ] Fail

---

## Test Suite 8: Accessibility Testing

### Test 8.1: Keyboard Navigation

**Steps:**
1. Navigate to app page
2. Press Tab key repeatedly
3. Focus should reach Intercom chat bubble
4. Press Enter when focused on bubble

**Expected Results:**
- [ ] Chat bubble is focusable via Tab key
- [ ] Visible focus indicator appears on bubble
- [ ] Enter key opens messenger
- [ ] Escape key closes messenger
- [ ] All messenger UI is keyboard accessible

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail

---

### Test 8.2: Screen Reader Compatibility (Optional)

**Requires:** Screen reader software (VoiceOver, NVDA, JAWS)

**Steps:**
1. Enable screen reader
2. Navigate to Intercom chat bubble
3. Listen to announcement

**Expected Results:**
- [ ] Screen reader announces "Chat" or "Support" button
- [ ] ARIA labels present
- [ ] Messenger state changes announced

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail [ ] Not Tested

---

## Test Suite 9: Mobile Responsiveness

### Test 9.1: Mobile Widget Positioning

**Steps:**
1. Open app on mobile device (or use DevTools mobile emulation)
2. Set viewport to 375px width (iPhone)
3. Locate Intercom chat bubble

**Expected Results:**
- [ ] Chat bubble visible on mobile
- [ ] Positioned in bottom-right with proper padding
- [ ] Touch target is minimum 44x44px
- [ ] Doesn't overlap critical UI elements

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail

---

### Test 9.2: Mobile Messenger Experience

**Steps:**
1. On mobile viewport, click chat bubble
2. Send test message
3. Observe messenger interface

**Expected Results:**
- [ ] Messenger opens in mobile-optimized view
- [ ] Message input is accessible
- [ ] Keyboard doesn't obscure input field
- [ ] All features work on mobile (typing indicator, notifications, etc.)

**Actual Results:**
___________________________________________________________________________________

**Status:** [ ] Pass [ ] Fail

---

## Overall Test Results Summary

**Total Tests:** 30+
**Passed:** _______
**Failed:** _______
**Not Tested:** _______

### Critical Issues Found:

1. ___________________________________________________________________________________
2. ___________________________________________________________________________________
3. ___________________________________________________________________________________

### Non-Critical Issues Found:

1. ___________________________________________________________________________________
2. ___________________________________________________________________________________

### Acceptance Criteria Status:

- [ ] AC #1: Availability Indicator Display - PASS
- [ ] AC #2: After-Hours Experience - PASS
- [ ] AC #3: Message Status and Response Tracking - PASS
- [ ] AC #4: Crisis Support Integration - PASS
- [ ] AC #5: Conversation Persistence - PASS
- [ ] AC #6: Backend Analytics Tracking - PASS (Frontend verification only)

### PHI Protection Verified:
- [ ] No PHI transmitted to Intercom
- [ ] Only approved non-sensitive data in user attributes
- [ ] PHI filter utility from Story 7-2 working correctly

---

## Sign-off

**Tester Signature:** ___________________
**Date:** ___________________

**Product Manager Review:** ___________________
**Date:** ___________________

**Clinical Supervisor Review (Crisis Response):** ___________________
**Date:** ___________________

---

## Notes and Observations

___________________________________________________________________________________
___________________________________________________________________________________
___________________________________________________________________________________
___________________________________________________________________________________
___________________________________________________________________________________
