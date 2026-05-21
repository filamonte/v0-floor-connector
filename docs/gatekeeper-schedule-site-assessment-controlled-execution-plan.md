# GateKeeper Schedule Site Assessment Controlled Execution Plan

Status: planning only

This document defines the future controlled execution path for GateKeeper `schedule_site_assessment` suggestions. It does not implement execution, add schema, create appointments, create jobs, update opportunities, send confirmations, call providers, or change review approval behavior.

## 1. Purpose

`schedule_site_assessment` is the next logical GateKeeper action after `create_opportunity` because it moves the same customer intake story forward: a customer and contractor have enough context to agree that an onsite inspection should happen.

It is higher-risk than `create_opportunity` because scheduling can affect calendar commitments, crew expectations, customer visibility, travel planning, and downstream readiness. A scheduling suggestion may also be ambiguous: "next Tuesday afternoon" is not the same as a validated appointment with timezone, assignee, duration, location, conflict checks, and confirmation policy.

The goal for the first future slice is to preserve the same controlled-execution discipline established by `create_opportunity`: GateKeeper may propose, preview, confirm, request, and audit, but the canonical owner must execute the actual workflow mutation.

## 2. Current State

GateKeeper can propose `schedule_site_assessment` suggestions from manual/demo intake and internal-note flows. Those suggestions are reviewable in `/gatekeeper`, and review approval remains separate from execution.

`apps/web/lib/gatekeeper/site-assessment-preview.ts` already builds a specialized non-mutating preview. It safely extracts known display fields from untrusted proposed payloads, reports missing recommended scheduling fields, shows linked subject context, names future owner context, and keeps scheduling blocked with `execution_not_implemented`.

`apps/web/lib/gatekeeper/action-bridge.ts` classifies `schedule_site_assessment` as `high_schedule` risk with current execution disabled.

`gatekeeper_execution_attempts` can represent `schedule_site_assessment` ledger rows because the existing action/status checks already include that action type and the same draft/request/result/failure states used by Phase 1.

Opportunities currently support site assessment state:

- `opportunityInputSchema` includes `site_assessment_scheduled` and `site_assessment_complete` statuses.
- Opportunity input supports `siteAssessmentScheduledOn`, `siteAssessmentScheduledTime`, and `siteAssessmentCompletedOn`.
- `site_assessment_scheduled` requires both scheduled date and scheduled time.
- Opportunity read utilities derive `siteAssessmentStatus` and `siteAssessmentScheduledAt`.
- `/schedule` can display opportunity-level scheduled assessments as schedule items without requiring a separate appointment record.

Appointments also support site visits:

- Appointment type includes `site_visit`.
- Appointment creation validates linked opportunity/customer/project/person context.
- A non-canceled `site_visit` appointment linked to an opportunity can synchronize opportunity site-assessment status.
- Completed site visit appointments can mark an opportunity assessment complete.

Jobs and schedule surfaces have their own canonical model. A site assessment may happen before a project/job exists, so job creation is not a safe first GateKeeper scheduling mutation.

Create-opportunity controlled execution is implemented and result-linked, but it is unrelated to schedule execution. It should not be broadened by this plan.

## 3. Candidate Execution Models

### Option A: Opportunity Assessment Field Update Only

Canonical owner: Opportunities.

Behavior: update the linked opportunity's site assessment scheduled state only. A future Opportunities-owned helper would validate the opportunity belongs to the tenant, validate date/time, reject completed/conflicting assessment state, set the scheduled assessment fields, and return the opportunity id as the execution result.

Required fields:

- linked opportunity id or safe opportunity subject context
- explicit scheduled date
- explicit scheduled time
- scheduling notes or source context when available
- user/tenant permission equal to manual opportunity update permissions

Risks:

- timezone interpretation must be explicit enough to avoid silent wrong-time updates
- the update may be visible in schedule/readiness views, so it is a real operational commitment
- unclear appointment duration, assignee, and customer confirmation must not be implied

Readiness dependencies:

- Opportunities-owned typed helper for site assessment scheduling
- date/time normalization and validation preview
- server-side revalidation from the saved GateKeeper draft
- clear UI copy that this does not create an appointment, job, crew assignment, customer message, or schedule confirmation

Audit/linkage requirements:

- ledger result should use `result_subject_type = 'opportunity'`
- result id should be the updated opportunity id
- ledger metadata should preserve source suggestion/artifact/thread/message references
- before/after field snapshot would be useful if the helper can safely provide it later

Reuse:

- Existing opportunity validation and update behavior confirms the canonical fields exist.
- Existing update actions are form/page-shaped, so the future implementation should prefer an Opportunities-owned typed helper rather than importing a UI server action into GateKeeper.

Recommendation: first, if implemented through an Opportunities-owned typed helper.

### Option B: Project/Schedule Handoff Only

Canonical owner: Opportunities or Schedule, depending on the destination.

Behavior: create no schedule, appointment, job, or opportunity field mutation. GateKeeper would prepare a saved confirmation draft and possibly a result-like handoff state telling the user what context is ready for manual scheduling.

Required fields:

- linked opportunity/project context
- requested appointment text or normalized candidate date/time
- clear destination route or workspace context

Risks:

- it may feel like execution without moving canonical state
- if overused, it can become a second planning queue instead of a real workflow bridge

Readiness dependencies:

- clear UI distinction between "prepared for scheduling" and "scheduled"
- no false success state

Audit/linkage requirements:

- ledger status could stay draft/requested or use a future handoff-specific status only with a migration
- no canonical result subject unless a real record is created or updated

Reuse:

- Existing `/schedule` and lead/opportunity routes can be linked without mutation.

Recommendation: useful fallback if Opportunity scheduling helper work is not ready, but less valuable than Option A because it does not complete the contractor's scheduling intent.

### Option C: Appointment Or Job/Schedule Creation

Canonical owner: Schedule/Appointments for appointments, Jobs/Schedule for jobs.

Behavior: create an appointment, schedule entry, or job/schedule record from the GateKeeper request. If a site-visit appointment is linked to an opportunity, existing appointment behavior can update opportunity assessment state.

Required fields:

- explicit start date/time
- timezone
- duration or end time policy
- assignee/person or team policy
- linked opportunity/customer/project context
- address/location
- customer visibility setting
- reminder/confirmation policy
- conflict checks

Risks:

- higher chance of duplicate or conflicting appointments
- may imply customer confirmation or crew assignment
- appointment creation has side effects on opportunity assessment state
- job creation is likely wrong before a project/job exists
- schedule conflict and customer visibility rules need stronger UX and policy

Readiness dependencies:

- appointment conflict preview
- assignee/team availability rules
- customer-visible versus internal-only distinction
- retry/idempotency around appointment creation and opportunity sync
- explicit no-message/no-confirmation policy for the first slice, unless a later communication plan permits it

Audit/linkage requirements:

- appointment execution should likely use `result_subject_type = 'appointment'`
- job execution, if ever appropriate, should use `result_subject_type = 'job'`
- linked opportunity should still show source context

Reuse:

- Existing appointment creation can validate linked subjects and synchronize opportunity site assessment state, but it is too broad for the first controlled scheduling execution.

Recommendation: later. Real appointment creation may become the second scheduling execution model after Option A is proven. Job/schedule creation should remain blocked until job lifecycle requirements are explicit.

## 4. Recommendation

The first `schedule_site_assessment` controlled execution should be Option A: update opportunity site-assessment scheduled state only, through an Opportunities-owned typed helper.

This is the safest first mutation because the Opportunity model already owns site-assessment scheduled/completed fields, and the schedule read model already surfaces opportunity-level scheduled assessments as schedule items. It moves canonical workflow state forward without creating appointments, jobs, schedule records, tasks, messages, projects, estimates, invoices, contracts, payments, or portal records.

The first execution should not create a job. A site assessment often happens before project/job creation, and job scheduling belongs to later production scheduling readiness.

The first execution should not create an appointment unless a later slice adds explicit date/timezone/duration/assignee/customer-visibility/conflict controls. Existing appointment creation is canonical and useful, but it has broader side effects and operational semantics than the first GateKeeper scheduling bridge should carry.

## 5. Payload Mapping

Future GateKeeper draft payloads should map only known, allowed fields into the confirmation model:

- linked subject: opportunity id when the suggestion is tied to a lead/opportunity
- customer/contact display: name, phone, email for review context only
- service: requested flooring/surface service
- location/address text
- requested appointment text from source communication
- normalized scheduled date, when user-confirmed
- normalized scheduled time, when user-confirmed
- timezone display value, when available
- scheduling notes
- source artifact/thread/message references

The canonical Opportunities helper should receive only the fields it owns:

- opportunity id
- scheduled date
- scheduled time
- scheduling notes or source note text, if the Opportunity model supports storing it safely

Fields that should remain notes/intake context only:

- raw customer wording
- broad requested windows such as "next week"
- preferred contact method
- service description details not needed for assessment scheduling
- duplicate source labels or adapter metadata

Fields that must not pass through:

- unknown proposed payload keys
- provider metadata
- raw transcripts beyond safe source note excerpts
- customer-visible confirmation text
- assignee or crew assignment unless the first helper explicitly supports it
- job, project, estimate, invoice, contract, payment, or message instructions

GateKeeper `proposed_payload` and saved drafts remain untrusted until mapped, edited, and validated by the owning Opportunities boundary.

## 6. Required Preconditions

Future execution must require:

- `gatekeeper_execution_attempts` row exists
- `action_type = 'schedule_site_assessment'`
- `status = 'execution_requested'`
- tenant/company scope matches the current authenticated user
- linked suggestion belongs to the same tenant
- linked suggestion type is `schedule_site_assessment`
- linked suggestion has been reviewed/approved according to the same review policy used for controlled execution
- linked opportunity exists and belongs to the tenant
- current user has permission equal to manual opportunity scheduling/update permission
- saved draft contains explicit date and time
- timezone/display ambiguity is resolved enough for the chosen helper
- opportunity assessment is not already completed
- the opportunity is not already scheduled in a way that would conflict with the request, unless a future override policy exists
- idempotency/result subject has not already executed
- no existing `result_subject_type` / `result_subject_id` is present on the ledger row

If any precondition fails, the ledger row should remain unchanged or move to a safe validation-failed state only if that behavior is explicitly designed.

## 7. Confirmation UI Requirements

The future confirmation UI should be separate from review approval and should make the action concrete:

- editable scheduled date
- editable scheduled time
- timezone display or selector
- source requested-time text for comparison
- linked opportunity/customer context
- address/location display
- scheduling notes
- missing field and ambiguity warnings
- clear statement of what will happen
- clear statement of what will not happen
- ledger-only save draft button
- request future execution button
- final controlled execution button only after `execution_requested`

For Option A, the copy should say:

- "This updates the opportunity site-assessment scheduled state."
- "It does not create an appointment, job, crew assignment, customer message, or schedule confirmation."
- "A future scheduling slice may create appointments after conflict, assignee, and customer-visibility controls exist."

Success should link back to the opportunity. Failure should show safe error copy and should not automatically retry.

## 8. Canonical Owner Boundary

Opportunities owns opportunity site-assessment field updates.

Schedule/Appointments owns real appointment creation.

Jobs/Schedule owns job scheduling.

GateKeeper owns only:

- source context
- proposed suggestion
- preview
- editable confirmation draft
- duplicate/conflict/readiness warnings
- execution request ledger state
- result/failure audit linkage

GateKeeper must not directly update opportunities, appointments, jobs, or schedule records. It should call a typed owning-module helper only after the request is explicit, preconditions pass, and the helper validates canonical input.

## 9. Audit And Linkage

For the recommended first execution, ledger success should record:

- `status = 'executed'`
- `result_subject_type = 'opportunity'`
- `result_subject_id = <updated opportunity id>`
- `executed_by`
- `executed_at`
- source suggestion/artifact/thread/message references
- safe metadata describing the controlled action model

Failure should record:

- `status = 'failed'`
- safe `execution_error`
- updater metadata
- no canonical result subject unless the owning helper definitively completed

If practical, future implementation should store a bounded before/after snapshot of the specific opportunity assessment fields in ledger metadata. That snapshot should not become a full opportunity copy.

GateKeeper subject memory should eventually show a compact execution result line on the opportunity, pointing back to the source suggestion and ledger result.

## 10. Open Gaps

- The existing opportunity update path is page/form-oriented; a typed Opportunities-owned helper should be extracted before GateKeeper calls it.
- Date/time handling currently derives timestamps from date/time strings, but the future UI needs explicit timezone clarity.
- It is not yet decided whether "already scheduled" should block, warn, or allow explicit replacement.
- Conflict detection for real appointments is not part of Option A.
- Appointment duration and assignment policy are not part of Option A.
- Customer-visible confirmation and reminders are not part of Option A.
- A true appointment model exists, but using it first would require more scheduling-specific controls.
- Job creation remains inappropriate for the first scheduling execution.
- No duplicate/conflict override policy exists yet.
- The current ledger statuses are probably sufficient for the first scheduling path; no schema extension is identified for this planning slice.

## 11. Testing Requirements For Future Implementation

Future implementation should cover:

- missing date blocks confirmation/request/execution
- missing time blocks confirmation/request/execution
- ambiguous requested date text remains non-executable until edited
- invalid linked subject is denied
- wrong tenant is denied
- non-approved suggestion is denied
- non-`execution_requested` ledger status is denied
- already completed assessment is denied
- already executed ledger row is denied or idempotently returns the existing result
- existing result subject blocks repeat execution
- high-risk scheduling conflict blocks if conflict detection is implemented
- Opportunities-owned helper is called exactly once on success
- GateKeeper never directly updates opportunity rows
- no appointment/job/schedule/task/customer/project/estimate/invoice/contract/payment/message/portal record is created by Option A
- no provider, AI, SMS, email, telephony, webhook, worker, or calendar behavior is introduced
- ledger success records opportunity result linkage
- ledger failure records safe error text
- subject memory can surface the result without creating timeline records

## 12. Recommended Implementation Slices

1. `schedule_site_assessment` confirmation UI, non-mutating.
2. Date/time normalization and validation preview.
3. Schedule/readiness/conflict preview for opportunity assessment state.
4. Ledger-backed confirmation draft for `schedule_site_assessment`.
5. Execution request status transition for `schedule_site_assessment`.
6. Opportunities-owned typed helper extraction for scheduling opportunity site assessment.
7. Controlled execution implementation using Option A.
8. Result timeline hardening and opportunity backlink.
9. Appointment-based scheduling planning after Option A proves safe.

The next implementation slice should be the non-mutating confirmation UI plus date/time validation preview. It should follow the create-opportunity runway and still stop before any canonical update.
