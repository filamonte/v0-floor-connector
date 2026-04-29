# Automation Execution V1 Plan

Status: first implementation pass complete for the manual notification-only automation runner. This document remains the guardrail for avoiding scheduler, provider, customer-facing send, or workflow mutation work until explicitly scoped.

Cross-reference:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/full-build-and-launch-plan.md](C:/FloorConnector/docs/full-build-and-launch-plan.md)
- [docs/full-platform-feature-map.md](C:/FloorConnector/docs/full-platform-feature-map.md)
- [docs/customer-contact-permission-enforcement-plan.md](C:/FloorConnector/docs/customer-contact-permission-enforcement-plan.md)

## Goal

Define the smallest safe automation execution layer for internal beta:

- notification-only
- tenant-scoped
- server-side only
- auditable and idempotent
- built on canonical records and existing notification foundations
- no workflow state changes
- no external provider sending in the first pass

The purpose is to help contractor teams see important follow-up work sooner without letting automation alter estimates, contracts, invoices, payments, projects, schedules, or communications.

Implementation complete:
- Added tenant-owned `automation_runs` audit/idempotency storage with RLS and duplicate guards.
- Added a server-only manual runner under `apps/web/lib/automation/execution.ts`.
- `/settings/automation` can manually run notification checks for the current organization and show recent run outcomes.
- The first executable triggers are `customer_message_received`, `estimate_awaiting_approval`, `contract_awaiting_signature`, and `invoice_overdue`.
- Executed runs create canonical `notification_events` and per-user in-app `notifications` only.
- There is still no cron, background worker, email/SMS/provider sending, customer-facing automated message, or workflow state mutation.

## 1. Current Automation Foundation

### Preferences

Implemented today:
- `/settings/automation` stores organization-scoped future notification preferences on `organization_workflow_settings.automation_notification_preferences`.
- Supported preference categories currently are:
  - `customer_message_received`
  - `estimate_awaiting_approval`
  - `contract_awaiting_signature`
  - `contract_signed`
  - `deposit_paid_ready_to_schedule`
  - `payment_failed`
  - `invoice_overdue`
  - `change_order_approved`
  - `schedule_reminder`
  - `crew_assignment_reminder`
- Preferences store:
  - category
  - manual execution intent
  - contractor membership roles to notify: `owner`, `admin`, `manager`, `member`
- Preferences are normalized and validated through:
  - `apps/web/lib/automation/preferences.ts`
  - `apps/web/lib/settings/schemas.ts`
  - `apps/web/lib/organizations/workflow-settings.ts`
  - `apps/web/lib/settings/actions.ts`

Current behavior:
- the manual notification-only runner reads these preferences for the four first executable triggers.
- non-executable categories remain preparation/planning only.

### Eligibility

Implemented today:
- `apps/web/lib/automation/eligibility.ts` evaluates whether a category would be eligible against a sample canonical context.
- The result is read-only and marks `executionAvailable` true only for the four manual-runner categories.
- Eligibility checks already encode basic canonical blockers, such as:
  - communication thread and last message presence
  - signed contract presence
  - ready-to-schedule project presence
  - failed payment event presence
  - overdue invoice with open balance
  - approved change order presence
  - scheduled job presence
  - missing crew assignment presence

Current behavior:
- eligibility preview/debug remains read-only.
- the manual runner calls the same helper before reserving `automation_runs` rows and creating notifications.

### Templates

Implemented today:
- `apps/web/lib/automation/templates.ts` contains static preview-only notification copy definitions.
- Each definition includes:
  - category
  - display name
  - intended recipients
  - trigger source
  - sample subject/body
  - required canonical context fields
  - `executionAvailable: false`

Current limitation:
- these are not editable stored templates.
- they are not currently persisted as tenant-owned template records.
- they should be treated as versioned application defaults until a later template-management pass is explicitly scoped.

### Readiness Plan

Implemented today:
- `apps/web/lib/automation/readiness-plan.ts` combines preferences, eligibility preview, and static template definitions into a planning summary.
- `apps/web/lib/automation/planning.ts` loads tenant-scoped canonical counts and recent samples from:
  - `communication_threads`
  - `communication_messages`
  - `notification_events`
  - `contracts`
  - `estimates`
  - `projects`
  - `payment_events`
  - `jobs`
  - `invoices`
  - `change_orders`
- `/settings/automation` renders readiness, current foundations, safe next steps, templates, preferences, and eligibility previews.

Current behavior:
- the readiness plan itself does not create rows or mutate workflow records.
- manual execution is a separate server action that creates run rows and in-app notifications only when explicitly launched.

### Notification Events

Implemented today:
- canonical notification tables exist:
  - `notification_events`
  - `notifications`
  - `notification_deliveries`
- `createNotificationEvent(...)` inserts one canonical notification event and fans out per-user in-app `notifications`.
- Existing helper functions record workflow events for:
  - estimates
  - contracts
  - invoices
  - change orders
  - communication messages
- Notification events are tenant-scoped by `company_id`.
- Per-user notification rows support in-app unread/read state.
- `notification_deliveries` already has channel-aware delivery infrastructure, but the first automation execution pass should not use provider sending.

Current behavior:
- notification events remain canonical activity records.
- `automation_runs` is the automation-specific run ledger, idempotency key store, attempt record, and execution audit trail.

## 2. First Automation Scope

V1 should be notification-only and internal-facing.

Allowed:
- read canonical records and existing canonical event streams
- read organization workflow settings and automation notification preferences
- resolve active organization members by selected roles
- create one automation run/audit record per attempted trigger
- create canonical `notification_events` and per-user in-app `notifications` for eligible runs
- link each automation run to the notification event it created
- show or later expose run history for internal beta debugging

Not allowed:
- no workflow mutation
- no estimate, contract, invoice, payment, project, job, schedule, change-order, customer, or communication state changes
- no automatic customer email
- no SMS
- no external provider sending
- no customer-facing messages
- no payment retry
- no collections action
- no contract send/sign/void action
- no project readiness changes
- no job creation, crew assignment, or rescheduling

Delivery in V1 should mean in-app contractor notifications only. If `notification_deliveries` is touched at all, it should only be for an internal `in_app` ledger row and only if the implementation explicitly needs that for audit consistency. The safer first pass can rely on `notification_events` plus per-user `notifications`, with automation run rows as the audit source.

## 3. Recommended First Triggers

Build only four triggers in the first execution pass.

### Customer Message Received

Canonical source:
- `communication_messages`
- `communication_threads`
- existing `communication.message_posted` notification events

Trigger rule:
- execute only when the latest canonical message was sent by `portal_user`.
- notify configured internal contractor roles that customer follow-up is needed.

Notification target:
- link to `/communications?threadId=<threadId>` if supported by the current communication surface.
- otherwise link to the canonical subject route already used by the thread.

Contact permissions:
- do not send to the customer.
- do not create a customer-facing message.
- use existing portal/project scope only as context; this V1 trigger is internal visibility.

Duplicate guard:
- one notification per organization, thread, source message, category, and template version.

### Estimate Awaiting Approval

Canonical source:
- `estimates`

Trigger rule:
- estimate status is `sent`.
- estimate is not approved or rejected.
- optional V1 threshold: sent at least 1 day ago, if `sent_at` is present.
- no reminder should be created for `draft`, `approved`, or `rejected`.

Notification target:
- link to `/estimates/<estimateId>`.

Important naming note:
- this is not one of the existing saved preference category names. For V1, either:
  - map this trigger under an existing/general category only after adding an explicit preference category, or
  - add a new `estimate_awaiting_approval` preference category in the implementation pass.
- Recommended implementation choice: add the explicit category so preferences, audit keys, templates, and UI labels remain honest.

Duplicate guard:
- one notification per organization, estimate, current `sent_at`, category, and threshold window.

### Contract Awaiting Signature

Canonical source:
- `contracts`
- optionally `contract_signers` for signer context

Trigger rule:
- contract status is `sent` or `viewed`.
- signature is not completed, declined, or voided.
- optional V1 threshold: signature started/sent at least 1 day ago, if timestamp fields are present.

Notification target:
- link to `/contracts/<contractId>`.

Important naming note:
- this is distinct from the existing `contract_signed` preference category.
- Recommended implementation choice: add a new `contract_awaiting_signature` preference category in the implementation pass rather than reusing `contract_signed`.

Duplicate guard:
- one notification per organization, contract, signature-start/sent timestamp, category, and threshold window.

### Invoice Payment Overdue

Canonical source:
- `invoices`

Trigger rule:
- invoice has a due date before today.
- invoice status is not `paid` or `void`.
- invoice balance due is greater than zero.

Notification target:
- link to `/invoices/<invoiceId>`.

Preference category:
- use existing `invoice_overdue`.

Duplicate guard:
- one notification per organization, invoice, due date, open balance state, category, and aging bucket or daily window.

## 4. Required Run Log / Audit Approach

V1 should add an explicit automation execution ledger before enabling execution.

Recommended new canonical table:
- `automation_runs`

Recommended fields:
- `id`
- `company_id`
- `category`
- `trigger_type`
- `source_table`
- `source_record_id`
- `source_event_id`
- `subject_type`
- `subject_id`
- `customer_id`
- `project_id`
- `idempotency_key`
- `status`
- `reason`
- `blockers`
- `recipient_user_ids`
- `notification_event_id`
- `template_version`
- `payload`
- `executed_at`
- `created_at`
- `updated_at`

Recommended statuses:
- `skipped`
- `executed`
- `blocked`
- `failed`

Required database behavior:
- tenant-owned by `company_id`
- RLS enabled and forced
- active organization members can select rows for their tenant
- server-side execution can insert/update rows
- unique index on `(company_id, idempotency_key)`
- indexes for:
  - `(company_id, created_at desc)`
  - `(company_id, category, created_at desc)`
  - `(company_id, subject_type, subject_id, created_at desc)`
  - `(company_id, notification_event_id)`

Why a separate run log is required:
- `notification_events` says that a notification happened.
- `automation_runs` explains why automation did or did not act, which preferences/templates/context were used, and how duplicates were prevented.
- skipped and blocked evaluations matter during internal beta because they explain why a configured automation did not produce a notification.

V1 should not create a broad workflow engine table set. One run table is enough.

## 5. Duplicate Prevention

Duplicate prevention should happen before creating a notification event.

Recommended idempotency key format:

```text
automation:v1:<category>:<organizationId>:<sourceType>:<sourceId>:<stateMarker>:<templateVersion>:<recipientHash>
```

Recommended state markers:
- customer message received: `message:<communicationMessageId>`
- estimate awaiting approval: `sent:<estimateId>:<sentAt>:<thresholdDate>`
- contract awaiting signature: `signature:<contractId>:<signatureStartedAtOrSentAt>:<thresholdDate>`
- invoice overdue: `due:<invoiceId>:<dueDate>:<agingBucketOrRunDate>`

Execution flow:
1. build the deterministic idempotency key
2. try to reserve/create an `automation_runs` row with that key
3. if a completed or in-progress row already exists, skip notification creation
4. after notification creation, store `notification_event_id` on the run row
5. if notification creation fails, mark the run `failed` with the error message

Additional safeguards:
- do not derive duplicate checks from notification title or message copy
- do not rely only on `notification_events.group_key`; group keys are useful for UI grouping but not enough for execution idempotency
- include template version in the key so future copy or routing changes can intentionally create a new notification where appropriate
- include recipient hash if the exact recipient set matters for re-notifying after preference changes

## 6. Respecting Preferences, Templates, Permissions, And Tenant Scope

### Organization Preferences

Execution must:
- load `organization_workflow_settings` for the same `company_id`
- use normalized `automationNotificationPreferences`
- require `enabledForFutureExecution = true`
- require at least one selected role
- resolve active `company_memberships` matching selected roles
- only create notifications for active organization users in the same tenant

If no recipients resolve:
- create a blocked/skipped run log.
- do not create a notification event with zero recipients unless the implementation explicitly chooses to keep a system-level event for audit.

### Stored Templates

Current template definitions are static application definitions, not tenant-edited templates.

V1 should:
- use static template definitions as versioned defaults
- store `template_version` and copy metadata in the run payload
- avoid adding editable automation templates unless explicitly scoped later

If the implementation introduces new trigger categories for estimate awaiting approval and contract awaiting signature, it must add matching static template definitions first.

### Contact Permissions

V1 is internal-only, so contact permissions mostly constrain what not to do:
- do not send customer emails or SMS
- do not post customer-facing communication messages
- do not send portal messages
- do not use customer-contact permissions as a substitute for customer consent or communication preferences

Where relevant:
- customer-message triggers should respect that the source message already came from an existing portal-scoped canonical communication thread.
- future customer-facing automation must check linked-contact permissions and communication consent before sending anything.
- linked-contact permissions currently enforce estimate decisions, change-order decisions, and contract sign/decline for portal actions only; they do not authorize automation sending.

### Tenant Scoping

Execution must:
- always start from a known `organizationId`
- query every canonical source table by `company_id`
- write `automation_runs.company_id`
- write `notification_events.company_id`
- fan out only to members of that same organization
- never execute across all tenants from a request-scoped contractor page

If a later scheduler runs across tenants, it must process tenants one at a time and keep each query/write scoped to one organization.

## 7. What Not To Build Yet

Do not build in the first execution pass:
- external email provider sending
- SMS
- customer-facing automated messages
- provider webhooks for automation execution
- recurring scheduler complexity
- queue infrastructure
- CRM drip campaigns
- marketing campaigns
- payment retry workflows
- invoice/payment state changes
- estimate status changes
- contract generation, send, sign, void, or countersign automation
- project readiness mutation
- job creation
- crew assignment
- dispatch or rescheduling automation
- editable automation template builder
- super-admin automation defaults
- analytics around automation effectiveness

## 8. Recommended First Implementation Pass

The safest first implementation pass should be:

1. Add a small `automation_runs` migration with RLS, indexes, and a unique idempotency key.
2. Add shared types for automation run status/category if needed.
3. Add server-only automation execution helpers under `apps/web/lib/automation/`.
4. Add explicit static template definitions for:
   - `estimate_awaiting_approval`
   - `contract_awaiting_signature`
   - `invoice_overdue`
   - optionally reuse the existing customer-message copy if the trigger is backed by portal-user communication messages
5. Add or adjust preference categories so the four first triggers are represented honestly in settings.
6. Implement a manual internal-beta execution entry point from `/settings/automation`, such as `Run notification checks now`.
7. The manual run should evaluate only the current organization.
8. The manual run should produce run log rows for executed, skipped, blocked, and failed outcomes.
9. Executed outcomes should create canonical `notification_events` and per-user `notifications` only.
10. Update `/settings/automation` to show recent run logs and keep all copy explicit that execution is notification-only.

Why manual first:
- it avoids scheduler complexity.
- it gives internal beta testers a controllable way to validate categories, preferences, recipients, and duplicate guards.
- it proves the run ledger before background execution exists.

Recommended later pass:
- add a narrow server-side scheduled runner only after manual execution and idempotency have been validated.

## 9. Risks And Controls

### Risk: Duplicate Notification Noise

Control:
- require the `automation_runs` idempotency key before notification creation.
- keep category-specific state markers tight.

### Risk: Automation Mutates Workflow State

Control:
- keep the execution helper limited to notification creation.
- do not import estimate, contract, invoice, payment, project, or job mutation helpers.

### Risk: Customer-Facing Send Is Implied

Control:
- all UI copy should say internal in-app notifications only.
- do not call email/SMS helpers.
- do not write `communication_messages` for automation in V1.

### Risk: Preferences Are Misread As Consent

Control:
- organization notification preferences only control internal contractor recipients.
- they are not customer communication consent.
- customer-contact permissions are not a send authorization system.

### Risk: Tenant Leakage

Control:
- organization ID is required in every execution function.
- every source query and insert uses `company_id`.
- recipient resolution uses active memberships from the same organization only.

### Risk: Time-Based Triggers Become A Scheduler Too Early

Control:
- run invoice overdue, estimate awaiting approval, and contract awaiting signature from the manual organization-scoped runner first.
- later scheduler can call the same tenant-scoped execution function.

## 10. First Implementation Prompt

Use this prompt for the next implementation pass:

```text
You are continuing FloorConnector after creating docs/automation-execution-v1-plan.md.

Do not build external provider sending, customer-facing automation messages, workflow mutations, or scheduler complexity.

Read first:
- docs/current-state.md
- docs/chat-handoff.md
- docs/full-build-and-launch-plan.md
- docs/full-platform-feature-map.md
- docs/customer-contact-permission-enforcement-plan.md
- docs/automation-execution-v1-plan.md
- apps/web/lib/automation/preferences.ts
- apps/web/lib/automation/eligibility.ts
- apps/web/lib/automation/templates.ts
- apps/web/lib/automation/planning.ts
- apps/web/app/(app)/settings/automation/page.tsx
- apps/web/lib/notifications/system.ts
- apps/web/lib/communications/data.ts

Goal:
Implement the first manual, notification-only automation execution pass for internal beta.

Scope:
- tenant-scoped server-side execution only
- manual organization-scoped run from /settings/automation
- in-app notifications only
- explicit run log/audit table
- duplicate prevention before creating notifications

Requirements:
1. Add an `automation_runs` migration with RLS, tenant scoping, statuses, payload, notification_event_id, and a unique `(company_id, idempotency_key)` guard.
2. Add server-only automation execution helpers under `apps/web/lib/automation/`.
3. Resolve organization preferences from `organization_workflow_settings.automation_notification_preferences`.
4. Resolve recipients from active `company_memberships` matching configured roles.
5. Implement these triggers only:
   - customer message received, from portal-user canonical communication messages
   - estimate awaiting approval, from sent canonical estimates
   - contract awaiting signature, from sent/viewed canonical contracts
   - invoice payment overdue, from open canonical invoices past due
6. Create canonical `notification_events` and per-user `notifications` only when eligible.
7. Write `automation_runs` rows for executed, blocked, and failed outcomes, while duplicate conflicts surface as skipped results without creating another row.
8. Link executed runs to the created notification event.
9. Prevent duplicates using deterministic idempotency keys.
10. Do not mutate estimates, contracts, invoices, payments, projects, jobs, communication threads, or communication messages.
11. Do not call email/SMS/provider sending helpers.
12. Keep /settings/automation copy clear that this is internal in-app notification execution only.

Validation:
- Run pnpm typecheck.
- Run pnpm lint.

Final response:
- list files changed
- explain the manual notification-only automation behavior
- confirm no workflow mutation and no provider sending
- include validation results
```

## Recommendation Summary

The safest first automation execution layer is a manual, tenant-scoped, in-app notification runner from `/settings/automation` backed by an `automation_runs` audit/idempotency table. It should create canonical notification events only after preferences, canonical trigger context, recipients, and duplicate guards pass, and it should not touch workflow state or external delivery providers.

Implementation status:
- Complete for the first manual internal-beta pass.
- Next automation work should validate beta behavior, then consider a narrow scheduler only after manual execution, idempotency, preferences, and notification fan-out have been proven.
