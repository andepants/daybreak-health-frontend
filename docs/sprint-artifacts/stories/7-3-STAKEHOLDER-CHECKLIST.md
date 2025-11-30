# Story 7-3: Stakeholder Action Checklist
## Support Availability and Request Tracking

**Status:** ✅ Frontend Complete | ⚙️ Configuration Required
**Date:** 2025-11-30
**Story:** Epic 7, Story 7-3

---

## 📋 Quick Reference

This checklist identifies **who needs to do what** to complete Story 7-3.

**Key Point:** Frontend code is complete. This story requires **configuration and testing**, not development.

---

## 👥 Action Items by Role

### 🎨 Product Manager

**Estimated Time:** 30 minutes (review only)

- [ ] Review implementation summary: `docs/sprint-artifacts/stories/7-3-IMPLEMENTATION-SUMMARY.md`
- [ ] Verify acceptance criteria alignment
- [ ] Review crisis response automation plan (critical safety feature)
- [ ] Coordinate with Operations team for Intercom configuration
- [ ] Coordinate with Backend PM for webhook implementation timing
- [ ] Sign off on story completion after all configurations tested

**Sign-off Date:** ________________

---

### ⚙️ Operations/Support Team Lead

**Estimated Time:** 2-3 hours

**Required:** Intercom Admin Access

**Tasks:**

1. **Read Configuration Guide** (15 minutes)
   - [ ] Open: `docs/sprint-artifacts/stories/7-3-intercom-configuration-guide.md`
   - [ ] Understand all configuration requirements

2. **Configure Office Hours** (20 minutes)
   - [ ] Set business hours in Intercom dashboard
   - [ ] Configure away mode messages
   - [ ] Set expected response times
   - [ ] Enable email notification option
   - [ ] Test during and after hours

3. **⚠️ CRITICAL: Configure Crisis Response Automation** (45 minutes)
   - [ ] Set up keyword triggers for all crisis terms:
     - suicide, suicidal
     - emergency
     - crisis
     - harm, self-harm
     - kill myself, end my life
     - don't want to live, want to die
     - hurt myself
   - [ ] Create automated response with crisis resources (988, 911, Crisis Text Line)
   - [ ] Set up Slack alerts to #support-urgent
   - [ ] Set up email alerts to clinical supervisor
   - [ ] Test EVERY keyword
   - [ ] Get clinical supervisor sign-off

4. **Configure Email Notifications** (20 minutes)
   - [ ] Enable customer email notifications
   - [ ] Customize email templates with Daybreak branding
   - [ ] Test email delivery

5. **Set Up Team Members** (15 minutes)
   - [ ] Ensure all support staff have Intercom accounts
   - [ ] Upload team member profile photos
   - [ ] Configure team availability settings

6. **Configure Webhooks** (30 minutes) - *Coordinate with Backend Team*
   - [ ] Add webhook URL in Intercom dashboard
   - [ ] Select events: conversation.created, user.replied, admin.replied, closed
   - [ ] Copy webhook secret
   - [ ] Provide webhook secret to backend team
   - [ ] Test webhook delivery (after backend endpoint ready)

**Configuration Complete Date:** ________________
**Signed:** ________________

---

### 🧪 QA Team

**Estimated Time:** 3-4 hours

**Prerequisites:**
- Intercom dashboard configured by Operations team
- Valid `NEXT_PUBLIC_INTERCOM_APP_ID` in environment

**Tasks:**

1. **Run Automated Tests** (15 minutes)
   ```bash
   npx playwright test tests/e2e/intercom-availability.spec.ts
   ```
   - [ ] All tests passing
   - [ ] No console errors
   - [ ] Widget loads correctly

2. **Execute Manual Test Suite** (3-4 hours)
   - [ ] Open: `tests/manual/intercom-availability-testing.md`
   - [ ] Test Suite 1: Availability Indicator Display
   - [ ] Test Suite 2: After-Hours Experience
   - [ ] Test Suite 3: Message Status Indicators
   - [ ] **Test Suite 4: Crisis Support Integration (CRITICAL)**
     - [ ] Test ALL crisis keywords
     - [ ] Verify automated response appears < 5 seconds
     - [ ] Verify staff alerts sent
   - [ ] Test Suite 5: Conversation Persistence
   - [ ] Test Suite 6: Frontend Integration Validation
   - [ ] Test Suite 7: PHI Protection Validation
   - [ ] Test Suite 8: Accessibility Testing
   - [ ] Test Suite 9: Mobile Responsiveness

3. **Document Results**
   - [ ] Fill out test results in manual testing guide
   - [ ] Note any issues or bugs
   - [ ] Create bug tickets if needed

4. **Sign Off**
   - [ ] All tests passed
   - [ ] No critical issues
   - [ ] PHI protection verified
   - [ ] Ready for production

**Testing Complete Date:** ________________
**QA Sign-off:** ________________

---

### 🏥 Clinical Supervisor

**Estimated Time:** 30 minutes

**Focus:** Crisis Response Validation

**Tasks:**

1. **Review Crisis Response Configuration** (10 minutes)
   - [ ] Read crisis response section in configuration guide
   - [ ] Review automated response message content
   - [ ] Verify crisis resources are correct:
     - [ ] 988 Suicide & Crisis Lifeline
     - [ ] 911 for emergencies
     - [ ] Crisis Text Line (HOME to 741741)
   - [ ] Verify empathetic, supportive language

2. **Review Crisis Alert Process** (10 minutes)
   - [ ] Verify Slack alerts to #support-urgent
   - [ ] Verify email alerts to clinical supervisor
   - [ ] Confirm on-call coverage process
   - [ ] Review escalation protocol

3. **Approve Crisis Testing Results** (10 minutes)
   - [ ] Review QA Test Suite 4 results
   - [ ] Verify all crisis keywords tested
   - [ ] Verify response time < 5 seconds
   - [ ] Verify staff alerts working

4. **Sign Off**
   - [ ] Crisis response automation is safe and appropriate
   - [ ] Staff alert process is adequate
   - [ ] Resources provided are current and correct
   - [ ] Approve for production use

**Clinical Approval Date:** ________________
**Clinical Supervisor Sign-off:** ________________

---

### 💻 Backend Team

**Estimated Time:** 3-5 hours (separate backend story)

**Backend Story:** Epic 7, Story 7-3 (Backend Implementation)

**Tasks:**

1. **Implement Webhook Endpoint**
   - [ ] Create endpoint: `POST /api/webhooks/intercom`
   - [ ] Implement webhook secret validation
   - [ ] Handle events:
     - [ ] conversation.created
     - [ ] conversation.user.replied
     - [ ] conversation.admin.replied
     - [ ] conversation.closed

2. **Store Analytics Metadata**
   - [ ] Store response times
   - [ ] Store conversation topics/tags
   - [ ] Store crisis keyword flags
   - [ ] Store resolution status
   - [ ] **ENSURE: No PHI stored** (only session ID, step names, boolean flags)

3. **Configure Webhook in Intercom** - *Coordinate with Ops Team*
   - [ ] Provide webhook URL to Ops team
   - [ ] Provide webhook secret to Ops team
   - [ ] Verify webhook events received

4. **Test Integration**
   - [ ] Test conversation.created event
   - [ ] Test conversation.user.replied event
   - [ ] Test conversation.admin.replied event
   - [ ] Test conversation.closed event
   - [ ] Verify data stored correctly
   - [ ] Verify analytics calculations

**Backend Implementation Date:** ________________
**Backend Sign-off:** ________________

---

### 🎨 Frontend Team

**Status:** ✅ COMPLETE

**Completed:**
- [x] Documentation created (configuration guide, testing procedures)
- [x] Automated E2E tests created
- [x] Manual testing procedures documented
- [x] PHI protection validation procedures documented
- [x] Story marked as done
- [x] Sprint status updated

**No further frontend work required.**

---

## 🚨 Critical Path

**These items MUST be completed before production deployment:**

1. **⚠️ Crisis Response Automation** (Ops Team + Clinical Supervisor)
   - Configure keyword triggers
   - Create automated response
   - Set up staff alerts
   - Test all keywords
   - Get clinical supervisor approval

2. **PHI Protection Validation** (QA Team)
   - Execute Test Suite 7 in manual testing guide
   - Verify no PHI in Intercom payloads
   - Verify no PHI in backend analytics

3. **End-to-End Testing** (QA Team)
   - Execute all manual test suites
   - All tests must pass
   - Sign off on acceptance criteria

4. **Backend Webhook Integration** (Backend Team)
   - Implement webhook endpoint
   - Test event delivery
   - Verify data storage (no PHI)

---

## 📊 Story Completion Criteria

Story 7-3 is considered **DONE** when:

- [x] Frontend implementation complete (documentation, tests)
- [ ] Intercom dashboard configured (Ops team)
- [ ] Crisis response automation configured and tested
- [ ] Manual test suite executed and passed (QA team)
- [ ] Automated E2E tests passing
- [ ] PHI protection validated (QA team)
- [ ] Clinical supervisor sign-off (crisis response)
- [ ] Backend webhook endpoint implemented (Backend team)
- [ ] Webhook integration tested
- [ ] Product Manager sign-off

**Current Status:** Frontend Complete, Configuration Required

---

## 📅 Timeline Estimate

| Role | Task | Estimated Time |
|------|------|----------------|
| Product Manager | Review and coordination | 30 minutes |
| Operations Team | Intercom configuration | 2-3 hours |
| QA Team | Testing (automated + manual) | 3-4 hours |
| Clinical Supervisor | Crisis response approval | 30 minutes |
| Backend Team | Webhook implementation | 3-5 hours |
| **Total** | **End-to-end completion** | **~1-2 days** |

---

## 📞 Questions?

### Operations Team Configuration Questions:
- **Reference:** `docs/sprint-artifacts/stories/7-3-intercom-configuration-guide.md`
- **Section:** Step-by-step instructions for each configuration task

### QA Testing Questions:
- **Reference:** `tests/manual/intercom-availability-testing.md`
- **Section:** Detailed test procedures for all 30+ test cases

### Backend Integration Questions:
- **Reference:** Backend Epic 7, Story 7-3
- **Contact:** Backend team lead

### Clinical/Safety Questions:
- **Reference:** Crisis Response section in configuration guide
- **Contact:** Clinical supervisor

### General Story Questions:
- **Reference:** `docs/sprint-artifacts/stories/7-3-IMPLEMENTATION-SUMMARY.md`
- **Full Story:** `docs/sprint-artifacts/stories/7-3-support-availability-request-tracking.md`

---

## ✅ Final Sign-off

**Story 7-3: Support Availability and Request Tracking**

- [ ] All tasks completed
- [ ] All tests passed
- [ ] All stakeholder approvals received
- [ ] Ready for production deployment

**Product Manager Final Approval:**
- Name: ________________
- Date: ________________
- Signature: ________________

**Clinical Supervisor Final Approval (Crisis Response):**
- Name: ________________
- Date: ________________
- Signature: ________________

**QA Lead Final Approval:**
- Name: ________________
- Date: ________________
- Signature: ________________

**Backend Lead Confirmation (Webhook Integration):**
- Name: ________________
- Date: ________________
- Signature: ________________

---

**Document Created:** 2025-11-30
**Frontend Status:** ✅ Complete
**Configuration Status:** ⚙️ Required
**Backend Status:** 🔧 Separate Story
