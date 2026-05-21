# GateKeeper Create Opportunity Execution Implementation Plan

Status: Planning
Doc Type: Architecture

## Purpose

This document refreshes the implementation plan for the first real GateKeeper controlled execution candidate: `create_opportunity`.

It reflects the actual safety runway now in place:

- GateKeeper can capture memory and action suggestions.
- Contractors can review suggestions.
- `create_opportunity` suggestions have a future-action preview and a specialized opportunity draft preview.
- The suggestion drawer can open an editable confirmation draft.
- Duplicate detection preview runs read-only against existing tenant records.
- A confirmation draft can be saved to `gatekeeper_execution_attempts`.
- Saved drafts can be reloaded into a non-executing preflight.
- A saved draft can be marked `execution_requested` in the GateKeeper execution ledger.
- The first real `create_opportunity` execution path exists and writes the ledger result link after creating the opportunity through the Opportunities-owned boundary.
- Executed/failed ledger results are visible in the GateKeeper queue, suggestion drawer, and subject memory panels.

This plan now records the implemented first execution path and its post-execution result surfacing. It does not add new execution types, schema, providers, AI, workers, routes, or downstream canonical mutations.

The repeatable Phase 1 QA/demo path now lives in [docs/gatekeeper-phase-1-demo-script.md](C:/FloorConnector/docs/gatekeeper-phase-1-demo-script.md).

## Current State Now

GateKeeper is no longer only a review queue. It now has one deliberately narrow controlled execution path for `create_opportunity`.

Implemented GateKeeper state:

- `gatekeeper_artifacts` stores tenant-scoped reviewable memory.
- `gatekeeper_action_suggestions` stores review-state suggestions only.
- `/gatekeeper` surfaces memory, suggestions, previews, detail drawer, review controls, confirmation drafts, duplicate warnings, saved-draft preflight, and request-state controls.
- `gatekeeper_execution_attempts` stores future execution attempt state separately from suggestion review state.
- `create_opportunity` confirmation drafts are saved with status `confirmation_started`.
- Saved drafts can transition to `execution_requested` when the suggestion is approved, required draft fields are present, and no high-confidence duplicate warning is active.
- `execution_requested` `create_opportunity` rows can create exactly one canonical opportunity through the Opportunities-owned helper, then update the ledger to `executed` with `result_subject_type = 'opportunity'` and the created opportunity id.
- Executed and failed ledger attempts surface in `/gatekeeper` suggestion cards, the suggestion drawer/preflight panel, and GateKeeper subject memory panels.

Still not implemented:

- no GateKeeper execution engine beyond the single explicit `create_opportunity` path
- no second controlled action type
- no direct GateKeeper insert into Opportunities tables
- no customer/project/estimate/schedule/job/invoice/contract/payment/message creation from GateKeeper execution
- no provider, AI, webhook, worker, email, SMS, telephony, transcription, recording, or calendar behavior

Review approval remains review-only. `execution_requested` means a human has explicitly requested execution in the ledger; the separate final execution action is what can create the opportunity.

## Exact First Execution Candidate

`create_opportunity` remains the recommended first real controlled action.

Why it remains the best first candidate:

- It starts the canonical commercial chain instead of mutating downstream project, scheduling, billing, signature, legal, or payment state.
- The Opportunities module already owns creation, validation, tenant scoping, primary contact creation, opportunity insertion, and structured intake persistence.
- The current opportunity creation path creates a primary contact and opportunity, not customer/project/estimate/job/invoice/contract/payment records.
- No customer-facing communication is sent.
- No appointment or schedule state is created.

Why other candidates remain later:

- `schedule_site_assessment` can create appointment/scheduling state and may synchronize opportunity assessment status, so it needs scheduling-specific date/time, assignment, conflict, visibility, and readiness rules.
- `send_followup_later` is customer-facing and requires recipient, consent, template/body, provider readiness, delivery audit, and explicit send confirmation.
- `create_task_later` should wait until the canonical work-item/task owner boundary is deliberately selected for GateKeeper-generated work.
- `update_project_notes` mutates a project workspace record and needs append/revision semantics before GateKeeper can safely write.
- Estimate, invoice, and contract review flags affect commercial, financial, or legal workflows and should wait for module-owned flag semantics and stricter confirmation.

## Required Preconditions For Execution

Future `create_opportunity` execution may run only when all of these are true:

- The user is authenticated in the contractor app.
- The user is an active member of the tenant that owns the ledger row.
- The user has the same effective permission required for manual opportunity creation.
- A `gatekeeper_execution_attempts` row exists for the current company.
- `gatekeeper_execution_attempts.action_type = 'create_opportunity'`.
- `gatekeeper_execution_attempts.execution_owner = 'opportunities'`.
- `gatekeeper_execution_attempts.risk_tier = 'medium_internal'`.
- `gatekeeper_execution_attempts.status = 'execution_requested'`.
- `gatekeeper_execution_attempts.result_subject_type` and `result_subject_id` are null.
- The linked `gatekeeper_action_suggestions` row belongs to the same company.
- The linked suggestion has `suggestion_type = 'create_opportunity'`.
- The linked suggestion is still approved for review and is not rejected, dismissed, superseded, or deleted.
- The saved `validated_payload` is a GateKeeper confirmation-draft payload with `draftValidationScope = 'gatekeeper_ledger_only'`.
- The draft contains the required future opportunity fields: contact name, requested service/job type, site/location text, and at least one useful contact method when final policy requires it.
- Server-side duplicate/preflight checks have been rerun from the saved draft.
- High-confidence duplicate warnings are absent or, in a later policy, explicitly overridden with a recorded reason. The first execution slice should block rather than override.
- The idempotency key has not already produced an executed result.
- No existing executed ledger row for the same suggestion/action already links to an opportunity.
- The old `execution_not_implemented` blocker is removed from the `create_opportunity` execution path only in the actual execution implementation slice; other action types remain blocked until explicitly implemented.

## Payload Finalization

GateKeeper's saved `validated_payload` is validated only for ledger draft storage. It is not canonical Opportunities input.

Allowed draft fields from the current confirmation path:

| GateKeeper saved draft field | Future canonical use                                                                           | Rule                                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `contactName`                | `contactName` / primary contact display name                                                   | Required. Do not infer first/last names unless the future UI collects them explicitly.                    |
| `phone`                      | `contactPhone`                                                                                 | Optional unless final policy requires a contact method. Normalize only through the Opportunities owner.   |
| `email`                      | `email`                                                                                        | Optional unless final policy requires a contact method. Must pass canonical email validation if present.  |
| `requestedService`           | `jobType`, and possibly `serviceType` when it matches known service options                    | Required as service/job context. Do not force unknown free text into a controlled option silently.        |
| `locationText`               | `siteName`; possibly `addressLine1` only when explicitly captured as an address in a future UI | Required as site/location context. Do not parse ambiguous address text into structured city/state/ZIP.    |
| `notes`                      | `notes` or `requirementsSummary`                                                               | Optional contractor context. Keep bounded and safe.                                                       |
| `requestedAppointmentText`   | `notes` or `requirementsSummary` only                                                          | Display/intake context only. Do not schedule or set `siteAssessmentScheduledOn/Time` from ambiguous text. |
| `sourceLabel`                | `source` / `sourceDetail` when it fits canonical limits                                        | Optional source context. Keep provider-neutral.                                                           |

Initial canonical opportunity input recommendation:

- `status`: `new` or another conservative Opportunities-owned default; do not set `site_assessment_scheduled` from GateKeeper's free text.
- `title`: null, letting the Opportunities owner derive the title.
- `jobType`: draft `requestedService`.
- `siteName`: draft `locationText`.
- `contactName`: draft `contactName`.
- `contactCompanyName`: null unless the future confirmation UI adds a trusted editable company field.
- `email`: draft `email` or null.
- `contactPhone`: draft `phone` or null.
- `serviceType`: draft `requestedService` only if it safely maps to the existing service options or remains accepted as free text by the current schema.
- `source`: a bounded GateKeeper source label, such as `GateKeeper`.
- `sourceDetail`: source label, artifact/thread/message reference summary, or manual intake label within existing max length.
- `requirementsSummary`: service/location/requested appointment/source summary when useful.
- `notes`: contractor notes plus clear "GateKeeper source context" label when included.
- `measurements`, `observations`, `attachments`: empty arrays for the first execution slice unless a later explicit mapper owns structured intake fields.

Fields that must not pass through:

- unknown proposed payload keys
- provider metadata
- raw transcripts or long source text
- unsafe HTML
- requested appointment text as a scheduled date/time
- customer/project/estimate/job/invoice/contract/payment/portal identifiers unless a later canonical owner explicitly validates them

Unknown fields may remain in `proposed_payload_snapshot` for audit only. They must not become canonical opportunity fields.

## Canonical Owner Call Path

The canonical owner is the Leads/Opportunities module.

Current relevant code:

- `apps/web/lib/opportunities/actions.ts`
  - `createOpportunityAction` parses full lead form data with `opportunityInputSchema`.
  - `quickCreateOpportunityAction` parses quick-create form data with `opportunityQuickCreateInputSchema`.
  - Both paths call `createOpportunity`.
- `apps/web/lib/opportunities/data.ts`
  - `createOpportunity` requires active opportunity scope, creates a primary contact, inserts the tenant-scoped opportunity, persists structured intake, rolls back the opportunity if structured intake persistence fails, and returns the created opportunity.
  - `ensureOpportunityEstimateFlow` is the downstream conversion path and must not be used for first GateKeeper execution.
- `apps/web/lib/opportunities/schemas.ts`
  - `opportunityInputSchema` is the canonical full create/update schema.
  - `opportunityQuickCreateInputSchema` is stricter and UI-intake specific.

Recommended future boundary:

- Do not have GateKeeper import or submit to `createOpportunityAction`, because it is a UI `FormData` server action with redirect behavior.
- Prefer extracting or adding an Opportunities-owned typed helper, for example `createOpportunityFromControlledDraft` or `createOpportunityFromGateKeeperExecution`, under `apps/web/lib/opportunities/`.
- That helper should accept a typed, already-mapped canonical Opportunities input plus GateKeeper source/audit context.
- The helper should validate with Opportunities-owned schemas and call the existing `createOpportunity` behavior or a shared internal creation function.
- GateKeeper's future execution service may call only this Opportunities-owned helper after verifying ledger/request/idempotency/preflight state.

Non-negotiable boundary:

- GateKeeper must not directly insert into `opportunities`.
- GateKeeper must not directly insert into `contacts`.
- GateKeeper must not call `ensureOpportunityEstimateFlow`.
- GateKeeper must not create customers, projects, estimates, appointments, jobs, schedules, invoices, contracts, payments, messages, or portal records as part of the first execution.

## Execution Transaction And Ordering

The future execution service should use a deliberately narrow order:

1. Receive an explicit user action for a specific `gatekeeper_execution_attempts.id`.
2. Require authenticated active tenant context.
3. Re-read the ledger row by `company_id` and id.
4. Require `action_type = 'create_opportunity'` and `status = 'execution_requested'`.
5. Re-read the linked suggestion by same `company_id`.
6. Require suggestion type and review status are still valid.
7. Reject if `result_subject_type` or `result_subject_id` already exists.
8. Re-parse the saved draft payload.
9. Rerun required-field and duplicate checks from the saved draft.
10. Build canonical Opportunities input from allowed fields only.
11. Validate canonical input through the Opportunities-owned schema/helper.
12. Call the Opportunities-owned create helper.
13. Update the ledger row to `executed` with:
    - `executed_by`
    - `executed_at`
    - `result_subject_type = 'opportunity'`
    - `result_subject_id = created opportunity id`
    - safe final payload/audit metadata if appropriate
14. Revalidate `/gatekeeper`, `/leads`, and `/leads/:id`.
15. Return or redirect to the created Lead/Opportunity Workspace.

Failure handling:

- If validation fails before canonical creation, set status `validation_failed` with safe `validation_errors`; do not create anything.
- If the Opportunities helper throws before creation, set status `failed` and store a safe error string.
- If opportunity creation succeeds but the ledger update fails, do not retry by creating another opportunity. The recovery path must search by idempotency/source context and repair or supersede ledger linkage manually or through a dedicated admin-safe repair path.

The current ledger status set has no `executing` or `in_progress` state. The first execution slice can use conditional updates and idempotency checks, but a future `execution_started` status may be worth adding if real concurrency needs appear.

## Idempotency And Retry

Current draft/request idempotency uses a deterministic key:

`gatekeeper_execution:create_opportunity:<suggestionId>:create_opportunity_confirmation_draft:v1`

Future execution should either reuse that ledger row as the single execution record or add an execution-purpose key that still ties to the same suggestion. The key requirement is one executed opportunity per reviewed suggestion/request unless a later explicit supersede-and-retry policy creates a new attempt.

Retry rules:

- If the ledger row is already `executed`, show the linked opportunity and do not create another one.
- If the ledger row is `execution_requested` and no result is linked, execution can run once through the future explicit action.
- If canonical validation fails, status should become `validation_failed`; the user may edit and save a new draft/request later.
- If execution fails before any canonical record is created, status should become `failed`; retry requires an explicit user action and should preserve the prior failure.
- If a high-confidence duplicate appears during retry, block execution until a user updates the draft or future override policy exists.
- If a user double-clicks the execution button, conditional ledger checks must let only one request proceed to creation.

## Audit And Linkage

The execution ledger is the primary audit/linkage record.

On success, set:

- `status = 'executed'`
- `executed_by = current user`
- `executed_at = now()`
- `result_subject_type = 'opportunity'`
- `result_subject_id = created opportunity id`
- safe final validated payload snapshot where useful
- duplicate/preflight summary in safe metadata if retained

Preserve existing source refs already stored on the ledger row:

- `suggestion_id`
- `source_artifact_id`
- `source_thread_id`
- `source_message_id`
- `requested_by`
- `requested_at`
- `proposed_payload_snapshot`
- `idempotency_key`

Opportunity-side source metadata:

- If the existing Opportunities schema has a safe field, store concise source context in `source`, `sourceDetail`, `requirementsSummary`, or `notes`.
- Do not add broad opportunity metadata or schema in the execution slice unless separately approved.
- Do not store raw transcripts, unsafe provider payloads, secrets, or long unbounded text in the opportunity.

Future timeline behavior:

- The GateKeeper subject timeline should later show that a suggestion execution created an opportunity by reading the ledger result link.
- Timeline display is a later read-model/UI slice; it is not required for the first execution service.

## UX For Actual Execution

The actual execution UI should remain separate from review approval and request-state controls.

Recommended label:

- `Create opportunity through Leads`
- or `Create opportunity from request`

Avoid:

- `Run`
- `Auto-create`
- `AI create`
- `Approve and create`

The confirmation surface must show:

- the saved draft fields
- duplicate warning state
- required validation state
- the owning workflow: Leads/Opportunities
- exactly what will happen:
  - one opportunity will be created
  - one primary contact may be created through the Opportunities-owned path
  - GateKeeper execution ledger will link to the created opportunity
- exactly what will not happen:
  - no customer will be created
  - no project will be created
  - no estimate will be created
  - no appointment will be scheduled
  - no job, invoice, contract, payment, message, task, schedule, or portal record will be created
  - no provider, AI, webhook, worker, or outbound send will run

Success state:

- show the created opportunity title/id
- link to `/leads/:id`
- show that the ledger recorded the execution result

Error state:

- show safe error copy
- keep source suggestion and saved draft visible
- explain whether the user should update the draft, resolve duplicates, or retry later

## Testing Plan For Actual Execution Slice

The first execution implementation must include focused tests for:

- happy path creates exactly one opportunity through the Opportunities-owned helper
- the ledger row transitions from `execution_requested` to `executed`
- `executed_by`, `executed_at`, `result_subject_type`, and `result_subject_id` are set
- missing required draft fields block execution before canonical mutation
- high-confidence duplicate warnings block execution before canonical mutation
- wrong tenant cannot read or execute the ledger row
- non-`create_opportunity` attempts are denied
- non-`execution_requested` statuses are denied
- rejected, dismissed, proposed, or superseded suggestions are denied
- already executed attempts are idempotent and do not create duplicates
- Opportunities schema validation errors set `validation_failed` or a safe failure state
- Opportunities helper failure sets `failed` without creating downstream records
- no customer, project, estimate, appointment, job, schedule, invoice, contract, payment, message, task, or portal record is created
- no provider SDK, AI, email, SMS, webhook, worker, transcription, recording, or calendar path is imported or called
- review approval remains separate from request and execution
- `ensureOpportunityEstimateFlow` is not imported or called

## Implementation Sequence

Recommended next slices:

1. **Opportunities-Owned Controlled Create Helper**
   - Extract or add a typed helper under the Opportunities module.
   - Keep validation and creation ownership in Opportunities.
   - Implemented as `apps/web/lib/opportunities/create-opportunity-service.ts`.

2. **GateKeeper Create Opportunity Execution Service**
   - Add a narrow server action/service that accepts an execution attempt id.
   - Re-read and validate ledger, suggestion, draft, duplicate/preflight, idempotency, and permissions.
   - Call only the Opportunities-owned helper.
   - Update only the ledger around the canonical result.
   - Implemented in `apps/web/lib/gatekeeper/create-opportunity-execution.ts` plus `executeCreateOpportunityFromGateKeeperAction`.

3. **Final Execution UI**
   - Add the explicit final execution button/copy for eligible `execution_requested` rows.
   - Keep review approval, save draft, request execution, and execute as distinct user actions.
   - Implemented in the existing GateKeeper create-opportunity confirmation/preflight panel.

4. **Post-Execution Result Display**
   - Show the created opportunity link in the GateKeeper drawer and preflight panel.
   - Disable further draft/request controls for executed rows.
   - Implemented in `/gatekeeper` suggestion cards and the saved-draft preflight panel through `executed` / `failed` ledger-row loading and result/error display.

5. **Subject Timeline Result Display**
   - Surface created-opportunity results in GateKeeper subject memory panels as read-only context.
   - Implemented in the GateKeeper subject memory panel as compact read-only execution-result rows from `gatekeeper_execution_attempts`.

6. **Docs And Test Hardening**
   - Update current-state only after real execution exists.
   - Expand mutation-boundary tests around no downstream side effects and no provider behavior.

## Implementation Result

The first real controlled GateKeeper execution is now implemented for `create_opportunity`.

The implemented execution:

- start from `gatekeeper_execution_attempts.status = 'execution_requested'`
- validate the linked approved `create_opportunity` suggestion
- parse only the saved ledger draft fields
- rerun duplicate and preflight checks server-side
- build canonical Opportunities input conservatively
- call an Opportunities-owned creation boundary
- update the ledger to `executed` with `result_subject_type = 'opportunity'`
- stop there
- show executed/failed ledger results in the GateKeeper queue, drawer, and subject memory panel
- block repeat execution when the attempt is already executed, failed, or has a result subject link

It still must not create or update customers, projects, estimates, appointments, jobs, schedules, invoices, contracts, payments, messages, tasks, portal records, providers, or AI workflows.

Known limitation: the current Supabase client path does not wrap opportunity creation and ledger result update in one database transaction. The service rechecks status/result before creation, conditionally updates the ledger after success, and reports a no-retry partial-linkage warning if opportunity creation succeeds but ledger linkage fails. A later hardening slice should add a transactional RPC or explicit execution-start state if concurrency pressure appears.

The Phase 1 demo script documents how to manually prove the implemented flow, expected ledger statuses, negative QA cases, and safety checks before adding additional execution types.

The Phase 1 polish/freeze pass clarified review/request/execution copy, aligned state labels around the implemented ladder, and kept the demo script pointed at the frozen proof path without adding schema, providers, AI, portal behavior, or new execution types.

Next recommended slice: **`schedule_site_assessment` controlled execution planning**, still non-executing first. Duplicate override policy remains a useful follow-up, but scheduling should get the same plan/preview/request discipline before any mutation.
