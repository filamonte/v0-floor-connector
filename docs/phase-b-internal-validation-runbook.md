# Phase B Internal Validation Runbook

Status: practical validation runbook for proving Phase B foundations before inviting contractor beta users.

This document does not authorize new feature work. During validation, build only bug fixes, documentation updates, or small safety corrections required to complete the checks below.

Primary references:
- [docs/phase-b-progress-checkpoint.md](C:/FloorConnector/docs/phase-b-progress-checkpoint.md)
- [docs/internal-qa-workflow-checklist.md](C:/FloorConnector/docs/internal-qa-workflow-checklist.md)
- [docs/full-build-and-launch-plan.md](C:/FloorConnector/docs/full-build-and-launch-plan.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)

Canonical lifecycle under validation:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## 1. Who Should Run Validation

Validation should be run by at least two people when possible:

- Product/operator tester: runs the workflow as a contractor owner or admin and records business-facing confusion.
- Technical reviewer: watches for tenant-scope, canonical-record, server-action, reporting, tax, notification, and automation defects.

Minimum acceptable runner:
- one internal tester with contractor-admin access who can also sign in as a portal user.

Recommended follow-up:
- rerun blocker/high fixes with the same tester who found the defect.
- have a second internal tester repeat the core workflow after the first clean pass.

## 2. Test Environment Assumptions

Use a normal app environment that is as close to contractor beta as practical.

Assumptions:
- The organization is created through normal auth/bootstrap, not manual database insertion.
- The tester uses the real contractor UI and portal UI.
- No seed/demo records are required.
- Existing records may be present, but the validation pass should create a new uniquely named workflow chain.
- Local environment source of truth remains `C:\FloorConnector\.env.local`.
- External email/SMS delivery, background automation, external tax filing, accounting sync, website intake, visualizer, mobile app, and e-sign provider integrations are out of scope.

Record:
- date and time
- environment URL
- branch/commit if known
- contractor organization
- contractor user
- portal user
- whether payment/provider flows were test-mode, mocked by supported UI, or skipped

## 3. Required Setup

Before running ordered passes, prepare the following.

### Contractor Organization

Steps:
1. Sign in as a contractor owner or admin.
2. Use a normal contractor organization created by the app.
3. Confirm dashboard, settings, customers, projects, estimates, invoices, reports, communications, and automation settings load.

Expected result:
- The organization loads without seeded data.
- Protected routes are scoped to the current organization.
- The dashboard gives a sensible starting point if records are empty.

Failure notes to record:
- route that failed
- error message or screenshot reference
- whether failure appears auth-related, tenant-scope-related, or empty-state-related

### Portal User And Customer Contacts

Steps:
1. Create or identify one portal-capable user with an email address.
2. Create one canonical customer with a populated `customers.email`.
3. Add at least one related customer contact from customer detail.
4. Give the related contact a usable email.

Expected result:
- The canonical customer/account remains the main commercial record.
- The related contact is visible beneath the customer and in `/directory` as a read-only contact entry.

Failure notes to record:
- whether the customer, contact, or directory row is missing
- whether the UI implies contacts replace the canonical customer
- whether email guidance is unclear

### Portal Grants

Steps:
1. Create at least one linked-contact portal grant attached to the related customer contact.
2. Grant project visibility when the test project exists.
3. Configure linked-contact permissions for estimate approval, change-order approval, and contract signing.
4. Create at least one customer-level legacy grant with `customer_contact_id = null`.

Expected result:
- Linked-contact and customer-level grants are visually distinguishable.
- Linked-contact permissions can be edited.
- Customer-level legacy grants remain valid compatibility behavior.

Failure notes to record:
- grant type that failed
- whether permissions were missing or not saved
- whether customer-level grant behavior became blocked unexpectedly

## 4. Ordered Validation Passes

Run these passes in order. Later passes rely on records created in earlier passes.

### Pass 1: Core Lead To Payment Workflow

Steps:
1. Create a new opportunity from Leads Manager Page (`/leads`) with a unique validation name.
2. Start an estimate from the opportunity path.
3. Create or link one canonical customer and one canonical project.
4. Add estimate line items from catalog-backed or supported manual item flows.
5. Send the estimate or move it through the supported sent-state path.
6. Approve the estimate through the portal path where possible, or record the supported fallback.
7. Generate a contract from the approved estimate.
8. Send/sign the contract through the current portal signer path.
9. Create a job from the approved/signed project context.
10. Schedule the job and assign crew where supported.
11. Complete the job if the current UI exposes completion.
12. Create an invoice from project/job context.
13. Record or initiate payment through the supported payment path.
14. Reopen project detail after each major stage and record the next action shown.

Expected result:
- One canonical lifecycle chain is created.
- No duplicate customer, project, estimate, contract, job, invoice, payment, portal, or schedule model appears.
- Estimate approval creates approved commercial snapshot lineage.
- Invoice lines use approved snapshot, SOV, approved change-order, or invoice-only lineage.
- Payment updates canonical invoice/payment state.
- Project detail answers "what do I do next?" throughout the chain.

Failure notes to record:
- exact step number
- record IDs or reference numbers
- duplicate records created, if any
- missing handoff context
- broken lineage or incorrect totals
- action label/copy that confused the tester

### Pass 2: Portal Permissions

Steps:
1. Use the linked-contact grant with permissions enabled to approve/reject a sent estimate.
2. Turn `canApproveEstimates` off and confirm approval/rejection is blocked.
3. Use the linked-contact grant with `canApproveChangeOrders` enabled to approve/reject a sent change order.
4. Turn `canApproveChangeOrders` off and confirm approval/rejection is blocked.
5. Use the linked-contact grant with `canSignContracts` enabled to sign/decline a contract when selected as signer.
6. Turn `canSignContracts` off and confirm the contact cannot be selected as signer or is blocked from sign/decline.
7. Use the customer-level legacy grant and confirm compatibility behavior still works where current portal actions support it.

Expected result:
- Linked-contact decision permissions are enforced for estimate, change-order, and contract decision actions.
- Contract signer routing still respects `contract_signers`.
- Customer-level legacy grants preserve current compatibility behavior.
- View/payment permissions that are not yet enforced do not pretend to be complete.

Failure notes to record:
- contact/grant type
- permission flag state
- action attempted
- expected allow/block result
- actual result
- any unclear blocked-state copy

### Pass 3: Reports

Steps:
1. Open `/reports`.
2. Set a date range that includes the validation records.
3. Compare lead pipeline counts against Leads Manager Page (`/leads`).
4. Compare estimate status counts against Estimates Manager Page (`/estimates`).
5. Compare invoice summary and aging against Invoices Manager Page (`/invoices`) and Financials Home (`/financials`).
6. Compare recent payment activity against Payments Manager Page (`/payments`).
7. Compare project readiness blockers against project detail.
8. Click drilldown rows and confirm they link to canonical record pages.

Expected result:
- Reports are read-only.
- Counts and totals are explainable from canonical records.
- Date filtering is understandable.
- Drilldowns route back to existing workspaces.
- No reporting table, export-only truth, or workflow mutation is implied.

Failure notes to record:
- report section
- expected count/amount
- displayed count/amount
- source page used for comparison
- date range used
- whether the issue appears status grouping, date filtering, tenant scoping, or calculation logic

### Pass 4: Sales Tax Summary

Steps:
1. Open `/reports` and locate `Sales Tax Summary`.
2. Use a date range that includes taxable and, if possible, exempt invoice scenarios.
3. Confirm taxable sales, exempt sales, tax collected, and invoice count.
4. Confirm draft and void invoice treatment is explicit.
5. Confirm customer exemption snapshot visibility.
6. Confirm invoice/payment status context appears in rows.
7. Open each tax drilldown row and confirm it links to the canonical invoice.
8. Change current customer exemption or organization tax settings only if safe in the test org, then confirm historical invoice report values do not recalculate from current settings.

Expected result:
- Sales Tax Summary reads canonical invoice tax snapshots, preferably `invoice_tax_reporting_entries`.
- Totals use invoice issue-date filtering.
- Historical invoice tax values remain stable after settings changes.
- The page does not claim to file, remit, or determine jurisdictional tax.

Failure notes to record:
- invoice reference number
- expected snapshot values
- displayed values
- date range
- whether draft/void/exempt behavior was unclear
- any sign that current settings changed historical reporting

### Pass 5: Automation Runner

Steps:
1. Open `/settings/automation` as a contractor owner/admin.
2. Configure notification preferences and recipient roles for:
   - customer message received
   - estimate awaiting approval
   - contract awaiting signature
   - invoice overdue
3. Ensure at least one active user exists in the selected role.
4. Create or identify eligible canonical records for each trigger.
5. Run the manual notification checks.
6. Confirm run summary counts for executed, blocked, skipped, and failed outcomes.
7. Confirm created notifications are in-app only and link to canonical records or threads.
8. Run the same check again and confirm duplicate guards prevent duplicate notifications.
9. Disable a preference or remove recipients and confirm blocked behavior is recorded.
10. Re-enable/fix preferences and confirm a later eligible run is not permanently blocked by prior blocked runs.

Expected result:
- Runner evaluates only the current organization.
- Executed runs create `notification_events` and per-user `notifications`.
- `automation_runs` records audit/idempotency context.
- Duplicate runs skip instead of creating notification noise.
- No cron/background execution, email/SMS/provider sending, customer-facing message, payment retry, or workflow mutation occurs.

Failure notes to record:
- category
- source record
- preference state
- recipient roles
- expected result
- actual run status
- duplicate behavior
- notification recipient mismatch

### Pass 6: Communications

Steps:
1. Open `/communications`.
2. Confirm the page works with no visible thread and with existing threads.
3. Use supported source filters for customer, project, estimate, contract, invoice, change order, and payment where data exists.
4. Open `/communications?source=job` and confirm unsupported-source guidance appears.
5. Open a thread from a related conversation card on a canonical detail page.
6. Send a contractor reply on an existing thread.
7. Mark the selected thread read.
8. Mark all communication notifications read.

Expected result:
- Communications use canonical `communication_threads` and `communication_messages`.
- Replies append to existing canonical threads.
- Notification triage updates per-user notification read state.
- Unsupported sources do not imply unsupported queues.
- No email/SMS/provider send or automation execution is triggered by replies.

Failure notes to record:
- route/filter used
- selected thread
- reply result
- notification/read-state result
- any unsupported source that appeared as supported
- any copy implying provider send or automation execution

### Pass 7: Onboarding And Empty States

Steps:
1. Use a fresh or near-empty contractor organization where practical.
2. Open `/dashboard`.
3. Review the `Start here` guidance.
4. Open Leads Manager Page (`/leads`), Customers Manager Page (`/customers`), Projects Manager Page (`/projects`), and Estimates Manager Page (`/estimates`) before records exist.
5. Use direct Quick-Create actions from empty states.
6. Confirm each Quick-Create creates a canonical record and hands off to the full workspace.
7. Confirm settings links guide the user toward organization, financial, tax, workflow, template, and catalog setup where applicable.

Expected result:
- Empty states are production-safe and do not depend on seeded demo records.
- Quick-Create remains canonical-record-first.
- The user can understand where to start.
- No fake local persistence, sample business flows, or placeholder records appear in protected routes.

Failure notes to record:
- route
- confusing empty-state copy
- missing create action
- Quick-Create failure
- any seeded/demo assumption
- any action that creates a duplicate model or dead-end record

## 5. Bug Triage Severity

Use these severities while recording validation issues.

### Blocker

Definition:
- prevents completion of the core lead-to-payment path, exposes cross-tenant data, breaks auth/portal access, corrupts financial/tax records, creates duplicate canonical truth, or sends customer/provider communication unexpectedly.

Examples:
- user sees another organization's records
- portal user can perform a denied decision action
- invoice/payment totals corrupt after payment
- automation mutates workflow state or sends email/SMS
- report/tax loader reads cross-tenant data

Action:
- stop feature work.
- fix before inviting any contractor tester.
- retest the exact failing path.

### High

Definition:
- materially blocks internal validation or would confuse a beta contractor on a core workflow, but does not expose data or corrupt canonical records.

Examples:
- project next action routes to the wrong workspace
- reports show materially wrong counts for common statuses
- tax summary excludes normal non-void invoices unexpectedly
- notification recipients are wrong within the same tenant
- portal blocked-state copy is misleading for a supported action

Action:
- fix before contractor beta.
- retest affected pass.

### Medium

Definition:
- causes friction or incorrect secondary behavior but has a clear workaround and does not threaten canonical data, security, or financial truth.

Examples:
- empty state lacks helpful copy
- drilldown link requires one extra click
- report grouping label is unclear but totals are correct
- optional workflow step must be skipped with an acceptable reason

Action:
- log and prioritize after blockers/high issues.
- may be accepted for internal beta with known limitation notes.

### Polish

Definition:
- visual, wording, spacing, or convenience issue that does not affect workflow completion or trust.

Examples:
- awkward label
- inconsistent spacing
- non-critical empty-state tone
- low-risk UI density issue

Action:
- log for later cleanup.
- do not delay validation unless it compounds a higher-severity issue.

## 6. Exit Criteria For Internal Validation

Internal validation can be considered passed when:
- one complete lead-to-payment workflow has been run without manual database edits.
- portal linked-contact and customer-level legacy grant behavior has been tested and recorded.
- `/reports` has been compared against source manager pages for validation records.
- Sales Tax Summary has been compared against invoice tax snapshots.
- the manual automation runner has been tested for eligible, blocked, and duplicate cases.
- communications reply and notification triage have been tested.
- onboarding/empty states have been tested in a seed-free or near-empty organization.
- all blocker issues are fixed and retested.
- all high issues are fixed or explicitly accepted as non-beta-blocking by the product owner.
- medium/polish issues are logged with owner and follow-up priority.
- known limitations are documented in plain language.

## 7. Criteria To Invite 2-3 Trusted Contractor Testers

Invite 2-3 trusted contractor testers only after internal validation exits cleanly.

Required:
- no open blocker issues.
- no open high issues in tenant isolation, portal decision actions, invoice/payment state, reporting totals, Sales Tax Summary, or automation recipients.
- onboarding runbook exists.
- support/release checklist exists.
- beta candidate criteria exists.
- known limitations are written and ready to share.
- the test contractor can operate without website generator, mobile app, visualizer, external accounting sync, tax filing, external e-sign provider, or dispatch optimization.
- support owner and feedback cadence are assigned.

Ideal tester profile:
- small team
- straightforward sales-to-payment workflow
- willing to use browser-based contractor and portal workflows
- willing to report issues weekly
- comfortable with internal-beta limitations

## 8. What Not To Build During Validation

Do not build:
- cron/background automation execution
- customer-facing automation messages
- email/SMS/provider sending
- external tax filing, remittance, provider integration, or jurisdiction engine
- reporting tables, BI layer, custom dashboard builder, or exports unless validation proves a concrete need
- website generator, SEO pages, custom DNS, public intake, mobile app, visualizer, or e-notary
- accounting sync, SaaS billing, marketplace, or subscription management
- full dispatch optimization
- duplicate CRM, portal-only customer/project, billing-copy, schedule-copy, or reporting-shadow models

Allowed during validation:
- bug fixes that unblock the runbook
- documentation updates
- copy clarifications
- small safety fixes that preserve canonical records and tenant scope

## 9. Validation Notes Template

Use this template for each run:

```text
Date:
Tester:
Technical reviewer:
Environment:
Branch/commit:
Contractor organization:
Contractor user:
Portal user:

Opportunity:
Customer:
Related contact:
Linked-contact grant:
Customer-level legacy grant:
Project:
Estimate:
Contract:
Change order:
Job:
Invoice:
Payment:

Pass 1 Core workflow:
Pass 2 Portal permissions:
Pass 3 Reports:
Pass 4 Sales Tax Summary:
Pass 5 Automation runner:
Pass 6 Communications:
Pass 7 Onboarding/empty states:

Skipped steps and why:
Blocker issues:
High issues:
Medium issues:
Polish issues:
Known limitations to document:
Retest required:
Internal validation result:
```
