# Phase B Progress Checkpoint

Status: Phase B internal-beta progress checkpoint after onboarding readiness polish, reporting basics, Sales Tax Summary, and the first manual notification-only automation runner.

This document does not authorize new app code, schema changes, cron/background execution, provider integrations, tax filing, or feature expansion by itself. It records what is now complete enough to validate and what must happen before contractor beta.

Primary references:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/full-build-and-launch-plan.md](C:/FloorConnector/docs/full-build-and-launch-plan.md)
- [docs/phase-a-completion-and-phase-b-readiness.md](C:/FloorConnector/docs/phase-a-completion-and-phase-b-readiness.md)
- [docs/phase-b-internal-validation-runbook.md](C:/FloorConnector/docs/phase-b-internal-validation-runbook.md)
- [docs/reporting-basics-plan.md](C:/FloorConnector/docs/reporting-basics-plan.md)
- [docs/tax-reporting-foundation-plan.md](C:/FloorConnector/docs/tax-reporting-foundation-plan.md)
- [docs/automation-execution-v1-plan.md](C:/FloorConnector/docs/automation-execution-v1-plan.md)

Canonical lifecycle remains:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## 1. Phase B Completed So Far

Phase B has moved from planning into first-pass internal-beta foundations. These are intentionally narrow, production-first surfaces over canonical records.

### Onboarding Readiness Polish

Complete:
- Dashboard now shows a lightweight `Start here` setup guide for first-login readiness.
- Setup guidance checks for organization settings, first customer, first project, and first estimate.
- Leads, customers, projects, and estimates have clearer first-record empty states and direct quick-create actions.
- Quick-create remains the existing canonical-record-first flow and hands off into full record workspaces.

What this means:
- A fresh contractor organization has a clearer path into real setup without seed/demo data.
- No schema, duplicate onboarding model, fake persistence, or lifecycle shortcut was introduced.

### Reporting Basics

Complete:
- `/reports` exists as the first read-only internal-beta reporting surface.
- Reports read tenant-scoped canonical records only.
- Current summaries include:
  - lead pipeline by opportunity status
  - estimate summary by draft/sent/approved/rejected style status groups
  - invoice summary and aging
  - recent payment activity
  - project readiness blockers
- Drilldown rows link back to canonical record pages.
- No reporting tables, snapshot tables, BI layer, exports, charts, or workflow mutations were introduced.

What this means:
- Internal testers can review basic operational state without treating the dashboard as the reporting system.
- Report numbers still need validation against the manager pages and a seed-free workflow path.

### Sales Tax Summary

Complete:
- `/reports` includes the first read-only `Sales Tax Summary`.
- It reads canonical invoice tax snapshot/reporting data through `invoice_tax_reporting_entries`.
- It uses invoice issue-date filtering.
- It shows taxable sales, exempt sales, tax collected, invoice count, invoice/payment status context, and customer exemption snapshot visibility.
- Drilldown rows link to canonical invoices.
- No invoice mutation, historical tax recalculation, tax filing, tax return workflow, provider integration, jurisdictional engine, or reporting shadow table was introduced.

What this means:
- Internal testers can validate filing-preparation totals from invoice snapshots.
- FloorConnector still helps contractors collect and report; it does not file or remit sales/use tax in V1.

### Manual Notification-Only Automation Runner

Complete:
- `/settings/automation` now includes a manual, tenant-scoped notification runner.
- The runner supports only:
  - customer message received
  - estimate awaiting approval
  - contract awaiting signature
  - invoice overdue
- The runner reads organization automation preferences and active tenant memberships.
- Eligible runs create canonical `notification_events` and per-user in-app `notifications`.
- `automation_runs` stores the audit/idempotency ledger.
- Duplicate guards run before notification creation.
- No cron/background execution, email/SMS/provider sending, customer-facing messages, payment retries, or workflow mutations were introduced.

What this means:
- The first automation execution layer is now testable by an admin from settings.
- The next automation step is validation, not background scheduling.

## 2. Still Needs Internal Validation

The current Phase B foundations should be validated before building more feature surface.

### Validation UI Blocker Fixed

Internal UI testing found CF-parity blockers on the contractor dashboard, estimates landing page, and Add Estimate flow. The first fix pass is complete:
- dashboard density now surfaces canonical open estimates, unpaid invoices, upcoming appointments, leads, projects, and today/live jobs higher in the working board
- `/estimates` now includes module-landing cards for recent client responses, sent estimates pending approval, status breakdown, draft build work, approved handoff, revision work, and a denser canonical estimate register
- Add Estimate now starts from customer/account and project context, with optional linked opportunity treated as upstream continuity rather than the primary starting point
- create-estimate validation errors now stay inside the Add Estimate sheet, so the background estimates page no longer receives modal-specific error feedback

This was a validation-blocking UX fix, not a new workflow model.

### Seed-Free QA

Run the ordered Phase B validation passes in [docs/phase-b-internal-validation-runbook.md](C:/FloorConnector/docs/phase-b-internal-validation-runbook.md), using the seed-free QA path from [docs/internal-qa-workflow-checklist.md](C:/FloorConnector/docs/internal-qa-workflow-checklist.md) as the core workflow script.

### 2026-04-28 Portal Approval Validation Blocker

Phase B validation created a fresh real UI chain through lead, customer, project, draft estimate, and estimate item entry:
- lead/opportunity created from `/leads`
- canonical customer and project created through the lead-to-estimate handoff
- draft estimate `3354` created from that chain
- catalog item added with estimate totals showing subtotal `$258.00`, tax `$0.00`, and total `$258.00`
- dedicated additional customer contact `test-customer@floorconnector.local` added under the canonical customer record

The send -> portal approval -> approved snapshot -> contract generation slice was blocked because contractor-side portal grants required the portal email to already belong to an authenticated FloorConnector user. That guardrail is now addressed by a minimal contractor-initiated invite flow:
- customer detail creates a pending, project-scoped portal invite on canonical `portal_access_grants`
- the raw invite token is shown only after creation while the database stores the token hash
- `/portal/invite?token=...` shows customer-safe context and uses the existing login/signup flow
- acceptance activates the grant only when the authenticated user email matches the invited email

Do not bypass this by using the contractor identity as the portal user, manually inserting auth or portal rows, directly mutating estimate status, or creating fake approved snapshots. The next validation step is to run the invite acceptance in a clean customer session, then continue estimate send, portal approval, approved snapshot verification, and contract generation.

2026-04-28 follow-up QA:
- Confirmed `jfilamonte@gmail.com` is the contractor owner/admin identity and should not be used as the customer portal user.
- Confirmed `filamontej@gmail.com` was not already an app user and had no existing portal grants before the clean customer QA path.
- Added `filamontej@gmail.com` as a related contact on the existing Phase B customer through the customer UI.
- Fixed the contractor customer-page blocker where the page fell back to client rendering because stored contact-permission loading embedded an ambiguous `customer_contacts` relationship. The loader now uses explicit tenant-scoped related-contact IDs before loading `customer_contact_portal_permissions`, which preserves the canonical model and restores the server-action invite path.
- Verified through the contractor UI that `filamontej@gmail.com` now creates a pending linked-contact portal grant on the existing Phase B customer, creates active project access for the Phase B project, and displays the one-time local invite URL after creation. Do not store the raw invite token in docs.
- Next validation step: open the displayed invite URL in a clean customer session, sign up or log in as `filamontej@gmail.com`, verify invite acceptance/project isolation, then continue estimate send, portal approval, approved snapshot verification, and contract generation.

Validate:
- fresh organization setup without demo data
- lead/opportunity through payment path
- portal decision actions and linked-contact permission behavior
- project next-action guidance
- communications and notification triage
- reporting and automation behavior after real workflow records exist

### Reporting Accuracy

Validate `/reports` against source pages:
- lead counts against `/leads`
- estimate counts against `/estimates`
- invoice totals and aging against `/invoices` and `/financials`
- payment activity against `/payments`
- project blockers against project detail readiness guidance

Watch for:
- status grouping drift
- date-range confusion
- empty-state clarity
- totals that imply financial truth outside canonical invoices/payments

### Tax Summary Accuracy

Validate Sales Tax Summary against canonical invoices:
- taxable sales amount
- exempt sales amount
- tax collected amount
- draft and void treatment
- customer exemption snapshot visibility
- invoice issue-date filtering
- invoice/payment status context

Watch for:
- accidental reliance on current org/customer/catalog settings instead of invoice snapshots
- cash-basis versus issue-date confusion
- exempt invoices with incomplete exemption metadata
- taxable sales with zero tax collected

### Automation Duplicate Guards

Validate manual runner idempotency:
- run the same eligible trigger twice and confirm the second run skips instead of creating duplicate notifications
- change recipient roles where appropriate and confirm idempotency behavior remains explainable
- confirm blocked runs do not permanently prevent later eligible runs after preference fixes
- confirm failed runs are visible in run history

Watch for:
- duplicate notification noise
- idempotency keys that are too broad or too narrow
- run summaries that hide why no notification was created

### Notification Recipient Correctness

Validate recipients:
- selected roles resolve only active members in the same organization
- disabled categories do not notify
- no active recipient produces a blocked run, not a zero-recipient notification
- created notifications appear only for intended tenant users
- notification links point to the canonical record or communication thread

Watch for:
- owner/admin/manager/member role mismatch
- inactive members receiving notifications
- cross-tenant leakage
- notification rows without a clear canonical subject

## 3. Remaining Phase B Gaps

The product is not contractor-beta ready until these operational gaps are documented and validated.

### Support / Release Checklist

Still needed:
- release checklist for internal beta changes
- issue intake process
- bug severity definitions
- rollback/escalation expectations
- known limitations review before every beta invite
- data correction policy and approval path

### Onboarding Runbook

Still needed:
- contractor setup runbook for a fresh organization
- required org profile/settings review
- template and catalog setup guidance
- financial/tax/workflow settings checklist
- portal access setup guidance
- payment settings and test-mode expectations
- first workflow script for the onboarding call

### Beta Candidate Criteria

Still needed:
- internal beta candidate checklist
- external contractor beta candidate checklist
- criteria for contractor size, workflow simplicity, feedback willingness, and tolerance for known gaps
- explicit exclusions for contractors who require website generator, mobile app, visualizer, deep tax filing, accounting sync, or dispatch optimization on day one

### Bug Triage Process

Still needed:
- triage board/process definition
- severity levels for security, tenant isolation, portal, payment, workflow, reporting, tax, automation, and UI defects
- daily/weekly review cadence during beta
- owner assignment rules
- retest/signoff expectations
- policy for stopping feature work when P0/P1 issues are open

## 4. Recommendation

Recommendation: pause feature expansion and run internal validation.

FloorConnector now has enough Phase B surface to test the internal-beta premise:
- a fresh contractor can get started
- core reports can be reviewed
- tax reporting can be checked from invoice snapshots
- manual notification-only automation can execute without mutating workflow state

Continuing to build new features now would increase the number of surfaces that might be wrong before the existing Phase B foundations are proven. The next useful work is validation and beta operations documentation, not more product breadth.

Build only bug fixes and documentation that unblock validation until:
- the Phase B validation runbook has been executed and recorded
- the seed-free QA path has been run
- reporting and tax totals have been reconciled
- automation duplicate and recipient behavior has been tested
- support/release/onboarding process exists
- beta candidate criteria are documented

## 5. Next 5 Recommended Codex Prompts

Use these in order.

### Prompt 1: Internal Validation Runbook

Status: complete. The runbook now lives at [docs/phase-b-internal-validation-runbook.md](C:/FloorConnector/docs/phase-b-internal-validation-runbook.md). Preserve the original prompt below for provenance.

```text
You are continuing FloorConnector after creating docs/phase-b-progress-checkpoint.md.

Do not add product features.

Task:
Create an internal validation runbook for Phase B.

Read first:
- docs/phase-b-progress-checkpoint.md
- docs/internal-qa-workflow-checklist.md
- docs/current-state.md
- docs/chat-handoff.md

Create:
- docs/phase-b-internal-validation-runbook.md

Include:
- seed-free setup steps
- opportunity-to-payment validation path
- reporting validation checks
- Sales Tax Summary validation checks
- manual automation duplicate/recipient checks
- pass/fail recording format
- stop-the-line criteria

Validation:
- Docs-only pass, no pnpm typecheck/lint unless code is edited.
```

### Prompt 2: Support And Release Checklist

```text
You are continuing FloorConnector after creating the Phase B progress checkpoint.

Do not add app code.

Task:
Create the internal beta support and release checklist.

Read first:
- docs/phase-b-progress-checkpoint.md
- docs/full-build-and-launch-plan.md
- docs/chat-handoff.md

Create:
- docs/internal-beta-support-release-checklist.md

Include:
- release checklist
- issue capture process
- bug severity definitions
- data correction policy
- known limitations review
- rollback/escalation guidance
- beta signoff checklist

Validation:
- Docs-only pass, no pnpm typecheck/lint unless code is edited.
```

### Prompt 3: Contractor Onboarding Runbook

```text
You are continuing FloorConnector after the Phase B progress checkpoint.

Do not add app code.

Task:
Create a contractor onboarding runbook for internal beta.

Read first:
- docs/phase-b-progress-checkpoint.md
- docs/current-state.md
- docs/full-build-and-launch-plan.md
- docs/chat-handoff.md

Create:
- docs/internal-beta-contractor-onboarding-runbook.md

Include:
- fresh organization setup
- org profile and members
- financial/tax/workflow settings
- templates and catalogs
- portal setup expectations
- first customer/project/estimate path
- payment/test-mode notes
- onboarding call checklist

Validation:
- Docs-only pass, no pnpm typecheck/lint unless code is edited.
```

### Prompt 4: Beta Candidate Criteria

```text
You are continuing FloorConnector after the Phase B progress checkpoint.

Do not add app code.

Task:
Create beta candidate criteria for internal and external contractor beta.

Read first:
- docs/phase-b-progress-checkpoint.md
- docs/phase-a-completion-and-phase-b-readiness.md
- docs/full-build-and-launch-plan.md
- docs/chat-handoff.md

Create:
- docs/beta-candidate-criteria.md

Include:
- internal beta readiness criteria
- external contractor beta suitability
- contractor disqualifiers for current scope
- required expectations before onboarding
- support commitment and feedback cadence

Validation:
- Docs-only pass, no pnpm typecheck/lint unless code is edited.
```

### Prompt 5: Run And Record Phase B Validation

```text
You are continuing FloorConnector after creating the Phase B validation docs.

Do not build new features unless validation finds a blocking defect.

Task:
Run the Phase B validation checklist as far as the local environment allows and record results.

Read first:
- docs/phase-b-progress-checkpoint.md
- docs/phase-b-internal-validation-runbook.md
- docs/internal-qa-workflow-checklist.md
- docs/current-state.md
- docs/chat-handoff.md

Create or update:
- docs/phase-b-validation-results.md

Include:
- environment used
- steps completed
- skipped steps and why
- defects found
- reporting/tax/automation validation notes
- recommended fixes before contractor beta

Validation:
- Run app validation commands only if code is edited or if the runbook requires them.
```

## 6. Contractor Beta Entry Recommendation

Do not invite contractor beta users yet.

Contractor beta should wait until:
- Phase B validation has a recorded pass
- no P0/P1 tenant, portal, payment, reporting, tax, or automation defect is open
- support/release checklist exists
- onboarding runbook exists
- beta candidate criteria exist
- known limitations are written in user-facing language

The next milestone is not more breadth. It is proving the current foundation with real internal use.
