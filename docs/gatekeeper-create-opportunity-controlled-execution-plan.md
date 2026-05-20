# GateKeeper Create Opportunity Controlled Execution Plan

Status: Planning
Doc Type: Architecture

## Purpose

This plan defines how a reviewed GateKeeper `create_opportunity` suggestion may later become the first real controlled GateKeeper action.

It is a planning document only. It does not add execution, schema, routes, server actions, UI, providers, AI, workers, or canonical record mutation.

`create_opportunity` is the recommended first execution candidate because it starts the canonical commercial chain and is lower risk than scheduling, outbound messaging, invoice/contract mutation, or downstream project/estimate creation. The existing Opportunities module already owns opportunity creation, validation, tenant scoping, contact creation, and structured intake.

Even so, GateKeeper must not create opportunities directly. GateKeeper may prepare reviewed context and an editable draft, but the Opportunities workflow must validate and perform the final mutation through its own server boundary.

## Current State

Current GateKeeper capabilities:

- source adapters can create reviewable suggestions
- `/gatekeeper` can review `create_opportunity` suggestions
- the suggestion detail drawer can preview an opportunity draft
- the preview stays display-only and returns `canCreateNow: false`
- `proposed_payload` remains untrusted
- approval remains review-only
- no execution bridge exists

Current Opportunities capabilities:

- `createOpportunityAction` parses form data through `opportunityInputSchema`
- `quickCreateOpportunityAction` parses form data through `opportunityQuickCreateInputSchema`
- both creation paths use the canonical `createOpportunity` data utility
- `createOpportunity` requires authenticated active organization scope
- `createOpportunity` creates a primary contact and inserts a tenant-scoped opportunity
- `createOpportunity` persists structured intake for measurements, attachments, and observations

Important boundary:

- `createOpportunity` creates an opportunity and primary contact.
- `ensureOpportunityEstimateFlow` can create or link downstream customer/project/estimate context.
- GateKeeper first execution must not call `ensureOpportunityEstimateFlow`.

## End-To-End Future Flow

The intended future flow is:

1. A GateKeeper source creates a `create_opportunity` suggestion.
2. A contractor reviews the suggestion in `/gatekeeper`.
3. Review approval records human review only.
4. The contractor opens a separate execution confirmation flow.
5. The system builds an editable opportunity draft from `proposed_payload` and source context.
6. The system runs non-mutating duplicate/contact checks.
7. The user edits the draft until required canonical fields are present.
8. The user explicitly confirms execution.
9. The Opportunities-owned action validates the final payload with canonical schemas.
10. The Opportunities workflow creates the contact/opportunity through the canonical creation path.
11. GateKeeper stores execution linkage back to the source suggestion and created opportunity.
12. An audit event records source, reviewer, executor, final validated payload snapshot, result, and errors if any.
13. The user lands on or receives a link to the created Lead/Opportunity Workspace.

Review and execution remain separate stages. The review queue answers, "Is this suggestion useful?" The execution confirmation answers, "Should FloorConnector create this opportunity now?"

## Payload Mapping

GateKeeper draft mapping must be deterministic and conservative.

| GateKeeper preview field         | Future opportunity draft field                             | Required for execution                                                           | Notes                                                                                                                           |
| -------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| contact/customer name            | `contactName`                                              | Required                                                                         | If a single full name is available, keep it as display/contact name. Do not invent first/last names unless the user edits them. |
| phone                            | `contactPhone` and/or quick-create phone fields            | At least one contact method recommended; final policy may require phone or email | Normalize only enough for display until canonical validation.                                                                   |
| email                            | `email`                                                    | At least one contact method recommended; final policy may require phone or email | Canonical opportunity schema validates email format.                                                                            |
| service/requested work           | `serviceType`, possibly `jobType` or `requirementsSummary` | Required as job type or service context                                          | If the value is free text, keep it editable rather than forcing it into a controlled service value.                             |
| location/address text            | `siteName`, maybe `addressLine1` if explicitly entered     | Required                                                                         | Do not parse ambiguous free-text addresses into structured address fields automatically.                                        |
| notes                            | `notes` or `requirementsSummary`                           | Optional                                                                         | Preserve as contractor-review context.                                                                                          |
| requested appointment text       | display-only note, not scheduling fields                   | Optional/display-only                                                            | Do not turn this into scheduled date/time until scheduling workflow validates it.                                               |
| source/source label              | `source` / `sourceDetail`                                  | Optional                                                                         | Source should describe origin, such as GateKeeper manual intake or phone call, without provider lock-in.                        |
| original summary/source artifact | audit/linkage metadata, maybe `notes` summary              | Display-only/audit                                                               | Preserve source traceability without making summary text canonical truth.                                                       |

Unknown payload fields:

- are not trusted as canonical fields
- may be shown in a collapsed "additional untrusted data" section
- must not be silently mapped into opportunity fields
- must not bypass canonical validation

The future mapper should produce a draft, not canonical input. The final user-edited draft must still pass Opportunities-owned validation.

## Required, Optional, And Display-Only Fields

Minimum future execution draft requirements should likely include:

- contact name
- site/location name or address text
- job type or requested work/service
- at least one contact method, preferably phone or email

Optional fields:

- company name
- structured address parts
- source/source detail
- service type
- requirements summary
- notes

Display-only until later workflows validate them:

- requested appointment/date text
- raw transcript or summary
- source artifact content
- provider metadata
- unknown payload fields

## Duplicate Detection Plan

Duplicate detection should run before execution and should not create records.

Current implemented preview:

- `/gatekeeper` now loads a bounded tenant-scoped duplicate preview for `create_opportunity` suggestions shown in the local-only confirmation panel.
- The preview checks existing opportunities, customers, contacts, and prior GateKeeper execution-attempt ledger rows where available.
- Exact email and normalized phone matches are high-confidence warnings.
- Name-only matches are low-confidence warnings.
- Service/location overlap is supporting context only.
- The preview does not merge, link, block, save, write ledger rows, call Opportunities actions, or create canonical records.

Recommended checks:

- exact email match against tenant contacts and customer-contact links
- exact or normalized phone match against tenant contacts, customers, and opportunities where supported
- customer/contact name plus phone or email match
- open opportunity with matching contact method, service/requested work, or location
- existing opportunity linked to the same GateKeeper source suggestion
- recent `create_opportunity` suggestion already executed from the same source thread/message/artifact
- idempotency key match for an execution request

Suggested duplicate outcomes:

- **Blocking**: same suggestion already executed, same idempotency key already completed, or stale/superseded suggestion.
- **Requires confirmation**: matching open opportunity or existing customer/contact likely represents the same inquiry.
- **Informational**: similar name or incomplete contact match without enough confidence.

Duplicate detection must warn before creation. It should not automatically merge, update, or link records in the first execution slice.

## Required Schema And State Gaps

Existing `gatekeeper_action_suggestions` is not enough for execution.

It currently stores review state:

- `proposed`
- `approved`
- `rejected`
- `dismissed`
- `superseded`

Those values should not be overloaded as execution state.

Recommended future additions, preferably through a separate execution ledger/event table:

- source suggestion id
- execution status
- execution requested by/at
- execution validated by/at
- executed by/at
- execution result subject type/id
- canonical owner/action invoked
- final validated payload snapshot
- execution error or cancellation reason
- idempotency key
- attempt number
- duplicate-check summary
- created opportunity id

Preferred shape:

- keep `gatekeeper_action_suggestions` as review-state truth
- add an append-only or effectively immutable `gatekeeper_execution_events` / `gatekeeper_controlled_action_executions` table later
- link each execution attempt to the suggestion and resulting canonical record

This task does not add schema.

## Confirmation UX Requirements

Future UI should be a separate confirmation flow, not a review button.

Acceptable labels:

- `Prepare opportunity`
- `Review opportunity draft`
- `Create opportunity from suggestion`

Avoid labels until execution exists:

- `Run`
- `Auto-create`
- `Execute now`
- `AI create`

The future confirmation UI should show:

- clear statement that review approval is already separate
- editable draft fields
- source artifact/thread/message context
- proposed contact and contact methods
- service/requested work
- site/location fields
- source/source detail
- raw requested appointment text as display-only
- duplicate warnings and blockers
- validation blockers
- exact list of what will happen
- exact list of what will not happen
- final explicit confirmation

What will happen:

- a canonical opportunity will be created
- a primary contact will be created or linked according to the future canonical policy
- GateKeeper execution linkage/audit will be recorded

What will not happen:

- no customer will be created
- no project will be created
- no estimate will be created
- no appointment will be scheduled
- no job, invoice, contract, payment, portal record, task, or outbound message will be created
- no provider or AI call will run

Success state:

- show created opportunity title/id
- link to `/leads/:id`
- show source suggestion linkage

Failure state:

- show safe error text
- keep draft editable
- allow cancel or retry after corrections
- record failed execution attempt if the execution ledger exists

## Canonical Owner Boundary

GateKeeper owns:

- source context
- memory artifacts
- action suggestions
- review state
- draft preparation
- execution preview
- execution request context

Opportunities owns:

- final opportunity input validation
- tenant-scoped opportunity creation
- primary contact creation/linking policy
- structured intake persistence
- route revalidation and created-opportunity navigation

GateKeeper must never:

- insert into `opportunities`
- insert into `contacts` as part of execution
- call opportunity mutation actions from source adapters
- execute directly from provider webhooks
- call `ensureOpportunityEstimateFlow` for first execution
- create customers/projects/estimates downstream
- treat `proposed_payload` as validated canonical input

## Audit And Linkage Requirements

Future execution audit should preserve:

- source suggestion id
- source artifact id when present
- source communication thread id when present
- source communication message id when present
- review status, reviewer id, and reviewed timestamp
- execution requester id and timestamp
- executor id and timestamp when different
- canonical owner/action invoked
- final validated payload snapshot
- duplicate-check result summary
- created opportunity id
- failure/cancel reason
- idempotency key

The audit trail should prove:

- where the suggestion came from
- who reviewed it
- who explicitly requested execution
- which canonical workflow performed the mutation
- which canonical record was created
- whether execution failed, canceled, or was superseded

## Security And Permission Rules

Future execution must require:

- authenticated contractor app user
- active tenant membership
- same company/organization as the suggestion
- same permission level required for manual opportunity creation
- source suggestion is not rejected, dismissed, superseded, or already executed
- source suggestion is `create_opportunity`
- linked subject, if present, belongs to the same tenant
- duplicate/idempotency check passes or is explicitly confirmed
- no portal user execution
- no provider webhook execution
- no AI/provider direct execution

Eligibility policy should be conservative:

- `approved` suggestions are safest for execution eligibility
- `proposed` suggestions may be eligible only if the confirmation flow includes an explicit "review and execute" policy later
- `rejected`, `dismissed`, and `superseded` suggestions must be blocked

## Testing Requirements For Future Implementation

Future implementation should include tests for:

- deterministic payload-to-draft mapping
- unknown payload fields remain untrusted
- missing required fields block execution
- invalid email/date/status validation failure
- duplicate warnings and duplicate blocking
- double-submit/idempotency behavior
- tenant membership denial
- portal user denial
- stale/superseded suggestion denial
- rejected/dismissed suggestion denial
- successful canonical Opportunities-owned create path
- GateKeeper execution audit/linkage update after success
- failed execution audit/linkage after validation error
- no customer/project/estimate creation
- no appointment/schedule/job creation
- no outbound communication
- no provider or AI calls
- review approval remains separate from execution

## Recommended Implementation Slices

1. Execution ledger migration planning: choose event/table shape, execution status vocabulary, output linkage, idempotency key, and RLS.
2. Execution ledger migration implementation: add tenant-scoped, audited execution attempt records without enabling mutation.
3. Non-mutating confirmation UI: show editable opportunity draft, source context, duplicate placeholder, and validation blockers without calling `createOpportunity`. Implemented as a local-only confirmation preview in the suggestion detail drawer.
4. Duplicate detection helper: implemented as tenant-scoped read-only checks for opportunities, customers, contacts, and prior GateKeeper execution attempts.
5. Ledger-backed confirmation draft: explicitly save only draft/confirmation metadata to `gatekeeper_execution_attempts`, still without calling Opportunities.
6. Saved-draft execution preflight: implemented as reload of the latest ledger draft/request/result, duplicate warning rerun, missing-field summary, owner validation summary, and controlled-execution eligibility display.
7. Execution request status transition only: implemented as a ledger-only `execution_requested` transition with `requested_by` / `requested_at` audit fields. It requires an approved suggestion, requestable saved draft status, required fields, and no high-confidence duplicate warning. It does not call Opportunities or create canonical records.
8. Execution implementation plan refresh: reconcile the real saved-draft, duplicate, preflight, and request-state path before mutation.
9. Opportunities-owned execution action design: define final action boundary and payload shape without importing it into GateKeeper adapters.
10. Controlled execution implementation: implemented for `create_opportunity`; explicit human confirmation calls the Opportunities-owned typed helper, not source adapters or review approval.
11. Post-execution audit/linking: ledger success now records created opportunity id, executor, and timestamp; richer subject timeline display remains next.
12. Hardening tests and docs: prove no downstream customer/project/estimate/scheduling/message/provider behavior is introduced.

## Final Recommendation

The execution ledger foundation now exists as `gatekeeper_execution_attempts` plus pure draft/idempotency helpers in `apps/web/lib/gatekeeper/execution-ledger.ts`.

The `create_opportunity` confirmation UI now exists inside the GateKeeper suggestion detail drawer. It lets a contractor edit draft fields and inspect duplicate warnings, missing recommended fields, validation requirements, and safe ledger/request/execution copy.

The read-only duplicate detection preview now exists in the confirmation panel. It surfaces likely tenant-scoped matches as warnings only and does not mutate canonical records.

The ledger-backed confirmation draft now exists. A contractor can explicitly save the edited draft to `gatekeeper_execution_attempts` with status `confirmation_started`. That action stores only ledger/audit data: source suggestion references, original proposed payload snapshot, a ledger-only draft payload, preflight warnings, and confirmation-draft idempotency metadata. It does not call the Opportunities mutation path and does not create contacts, opportunities, customers, projects, estimates, appointments, tasks, messages, invoices, contracts, payments, or portal records.

The saved-draft execution preflight now exists. `/gatekeeper` reloads the latest saved `draft` / `confirmation_started` / `execution_requested` / `executed` / `failed` ledger attempt for a visible `create_opportunity` suggestion, evaluates the saved draft for missing fields, reruns duplicate warnings from the saved draft, and reports request/execution/result readiness.

The execution-request status transition now exists. From the saved preflight panel, an approved `create_opportunity` suggestion can mark the saved ledger row `execution_requested` only when required draft fields are present and no high-confidence duplicate warning is active. The action updates only `gatekeeper_execution_attempts.status`, `requested_by`, `requested_at`, and updater metadata. It does not call the canonical Opportunities mutation path and does not create contacts, opportunities, customers, projects, estimates, appointments, tasks, messages, invoices, contracts, payments, or portal records.

The implementation-plan refresh now lives in [docs/gatekeeper-create-opportunity-execution-implementation-plan.md](C:/FloorConnector/docs/gatekeeper-create-opportunity-execution-implementation-plan.md). It confirms `create_opportunity` remains the first recommended real controlled action, defines the exact `execution_requested` preconditions, maps the saved GateKeeper draft into conservative Opportunities-owned input, and recommends a typed Opportunities-owned creation helper or service boundary before GateKeeper calls any real mutation path.

The first controlled execution service now exists for `create_opportunity`. It starts only from an approved suggestion with an `execution_requested` ledger row, reruns saved-draft preflight and duplicate checks server-side, maps allowed draft fields only, calls the Opportunities-owned typed creation helper, creates exactly one canonical opportunity through the existing opportunity workflow, and records the result on `gatekeeper_execution_attempts`. It does not call `ensureOpportunityEstimateFlow` or create customers, projects, estimates, appointments, tasks, jobs, schedules, invoices, contracts, payments, messages, portal records, providers, or AI workflows.

Reason: the ledger gives the flow a durable place to store execution attempts, idempotency, created record linkage, failures, and audit evidence without overloading `gatekeeper_action_suggestions.status`. The next implementation slice should be GateKeeper execution result timeline and post-execution hardening.
