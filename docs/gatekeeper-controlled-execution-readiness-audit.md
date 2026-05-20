# GateKeeper Controlled Execution Readiness Audit

Status: Planning
Doc Type: Audit

## Purpose

This audit reviews whether GateKeeper is ready to move from review-only suggestions and previews toward a first controlled execution bridge.

It does not authorize execution. It documents the safety layer required before any GateKeeper suggestion can create, update, schedule, send, or mutate canonical FloorConnector records.

Core finding:

> `create_opportunity` is the best first controlled execution candidate, but execution should not be implemented until GateKeeper has a separate execution request, canonical owner handoff, duplicate check, audit trail, and post-execution linkage model.

## Current GateKeeper Execution State

GateKeeper currently has the right pre-execution ladder:

- operational memory tables for artifacts and action suggestions
- provider-neutral communication thread/message linkage
- `/gatekeeper` review queue
- human review actions for artifacts and suggestions
- manual simulation and deterministic demo fixtures
- provider-neutral source adapter contract
- manual source adapter
- internal-note adapter
- subject memory panels on Project, Customer, and Lead/Opportunity workspaces
- controlled action bridge policy helpers
- generic execution previews
- specialized `create_opportunity` and `schedule_site_assessment` preview drilldowns

Current implementation remains non-executing:

- `gatekeeper_action_suggestions.status` is review state only.
- Approving a suggestion means reviewed, not executed.
- Preview builders returned non-executable output and included `execution_not_implemented`; after the first controlled execution slice, only non-`create_opportunity` action types remain blocked this way.
- GateKeeper code does not call opportunity, appointment, schedule, job, communication, invoice, contract, or payment mutation actions for suggestion execution.
- No provider, AI, webhook, telephony, transcription, SMS, email, recording, or calendar integration is part of the execution path.

## Candidate First Controlled Actions

| Suggestion type            | Business value                                                          | Risk                                                                                                                                              | Canonical owner                                                      | Current canonical support                                                                                                                                                 | Recommendation                                                                  |
| -------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `create_opportunity`       | High. Turns reviewed intake into the first canonical commercial record. | Medium internal. Creates a lead/opportunity and contact, but does not send, schedule, bill, or create downstream project/customer records.        | Leads/Opportunities.                                                 | Existing `createOpportunity` path validates through opportunity schemas, scopes to active organization, creates contact and opportunity, and preserves structured intake. | First candidate after safety layer.                                             |
| `schedule_site_assessment` | High. Connects customer intent to onsite assessment workflow.           | High schedule. Appointment creation can update opportunity assessment state and requires timing, assignment, readiness, and visibility decisions. | Leads/Opportunities plus Appointments/Schedule depending on context. | Existing appointment creation validates tenant-linked opportunity/customer/project/people and syncs opportunity assessment state.                                         | Later. Keep preview-only until scheduling-specific execution rules exist.       |
| `create_task_later`        | Medium. Useful for follow-up discipline.                                | Medium internal. Needs a canonical task/work-item owner.                                                                                          | Future Work Items/Tasks.                                             | No canonical task/work-item model was identified as the clear owner for this suggestion.                                                                                  | Block until canonical task/work-item model exists.                              |
| `update_project_notes`     | Medium. Useful for carrying reviewed observations into project context. | Medium internal. Mutates an operational hub record and may overwrite user-authored context.                                                       | Projects.                                                            | Project data utilities exist, but this audit did not identify a dedicated GateKeeper-safe project-note append/update action.                                              | Later. Needs append-only note semantics or revision/audit handling first.       |
| `send_followup_later`      | High. Important for communication continuity.                           | High customer-facing. Any outbound send requires recipient, consent, template/body, provider readiness, and explicit confirmation.                | Communications.                                                      | Communications memory exists; outbound provider sending is intentionally not implemented.                                                                                 | Block until outbound draft, consent, and send-confirmation architecture exists. |
| `flag_estimate_review`     | Medium. Helps estimate QA.                                              | Medium to high commercial. Estimate flags can influence pricing/scope review behavior.                                                            | Estimates.                                                           | Estimate module exists and has revision infrastructure, but this audit did not identify a dedicated review-flag mutation path for GateKeeper.                             | Later. Needs estimate-owned review flag semantics.                              |
| `flag_invoice_review`      | Medium. Helps collections/billing QA.                                   | High financial. Invoice state, amounts, payment readiness, and customer communication are sensitive.                                              | Invoices/Payments.                                                   | Invoice and payment modules exist, but financial actions require stricter controls.                                                                                       | Later/high-risk.                                                                |
| `flag_contract_review`     | Medium. Helps contract completeness review.                             | High legal/commercial. Contract signature and legal state require stronger confirmation and audit.                                                | Contracts.                                                           | Contract revisions and signature events exist, but GateKeeper should not touch legal/signature state yet.                                                                 | Later/high-risk.                                                                |

## Recommendation

`create_opportunity` should be the first real controlled execution candidate after one more safety layer.

Why it is the best first candidate:

- It starts the canonical lifecycle instead of mutating a downstream operational, financial, scheduling, or legal record.
- The existing opportunity module already owns the business behavior.
- Existing opportunity creation validates input with Zod schemas.
- Existing opportunity creation scopes records to the active organization.
- The create path creates an opportunity and a primary contact, not a customer/project/estimate/job/invoice/contract.
- No customer-facing communication is sent.
- No schedule, calendar, appointment, crew assignment, payment, invoice, contract, or portal state changes occur.

Why it is not ready to execute directly from GateKeeper yet:

- GateKeeper suggestion approval is review-only and must remain that way.
- Current GateKeeper suggestion rows have no execution lifecycle or canonical output linkage.
- `proposed_payload` is untrusted and does not match the canonical opportunity input schema by itself.
- Duplicate detection is not yet defined for reviewed intake.
- There is no GateKeeper execution audit event linking the suggestion, reviewer, executor, canonical action, and created opportunity.
- There is no explicit execution confirmation UI separate from review approval.

## Required Safety Layer Before Execution

Before `create_opportunity` execution is implemented, GateKeeper needs a controlled execution safety layer with these requirements:

- explicit execution request separate from review approval
- confirmation UI that says exactly what will be created
- editable draft fields before execution
- final payload validation by the Leads/Opportunities workflow
- active tenant membership validation
- role/permission validation matching opportunity creation
- duplicate detection against existing opportunities and contacts
- linked source suggestion id and source artifact/message/thread context
- idempotency or double-submit protection
- execution status separate from review status
- audit trail for reviewer, execution requester, executed action, and created record id
- graceful failure state with retry/cancel behavior
- no hidden downstream customer/project/estimate/schedule creation

The safest next implementation should still be non-mutating: a `create_opportunity` controlled execution plan and confirmation/preflight UI that shows the final canonical draft shape without calling `createOpportunity`.

## Canonical Owner Mapping

Future controlled execution should be owned as follows:

- `create_opportunity`: Leads/Opportunities.
- `update_opportunity`: Leads/Opportunities.
- `schedule_site_assessment`: Leads/Opportunities when preparing lead assessment state; Appointments/Schedule when creating an appointment; Projects/Schedule only after project context is canonical and validated.
- `create_task_later`: future Work Items/Tasks module, if and when a canonical task model exists.
- `send_followup_later`: Communications module, with explicit human send confirmation and provider readiness.
- `update_project_notes`: Projects module, preferably append-only or revision-backed.
- `flag_estimate_review`: Estimates module.
- `flag_invoice_review`: Invoices/Payments module.
- `flag_contract_review`: Contracts module.

GateKeeper may supply source context and a reviewed draft. The owning module must validate and perform the final action through its own server boundary.

## Existing Code Findings

### Opportunity Create Path

The canonical opportunity creation path is in:

- `apps/web/lib/opportunities/actions.ts`
- `apps/web/lib/opportunities/data.ts`
- `apps/web/lib/opportunities/schemas.ts`

Findings:

- `createOpportunityAction` parses form data through `opportunityInputSchema`.
- `quickCreateOpportunityAction` parses form data through `opportunityQuickCreateInputSchema`, then maps it into the same `createOpportunity` data utility.
- `createOpportunity` calls `requireOpportunityScope`, which requires an authenticated user and active organization context.
- `createOpportunity` creates or links a primary contact through the shared contacts boundary.
- `createOpportunity` inserts an `opportunities` row with `company_id`, `created_by`, and `updated_by`.
- Structured intake rows for measurements, attachments, and observations are written through `replaceOpportunityStructuredIntake`.
- If structured intake persistence fails, the newly inserted opportunity is deleted before the error is rethrown.
- `createOpportunity` returns the canonical opportunity detail through `getOpportunityById`.

Important side-effect boundary:

- Creating an opportunity does not create a customer, project, estimate, job, invoice, contract, schedule entry, portal record, or outbound communication.
- `ensureOpportunityEstimateFlow` is the downstream conversion path that can create customer/project links and prepare estimate flow. GateKeeper must not call it as part of first execution.

### Opportunity Validation

Current opportunity validation includes:

- required job type
- required site/location
- required primary contact name
- optional email with email-format validation
- controlled opportunity status values
- site assessment date/time requirements when status is `site_assessment_scheduled`
- completion date cannot precede scheduled date
- structured measurement/observation/attachment validation

The quick-create schema is stricter for intake-like fields:

- first and last name are required
- address line 1, city, state, postal code, phone, email, and cell phone are required
- state is normalized to a two-letter code
- country defaults to `US`
- scheduled assessment requires date and time

GateKeeper should not blindly map a reviewed payload into either schema. It needs an explicit draft mapping step that shows missing fields and lets the user edit the canonical form before execution.

### Scheduling And Site Assessment Path

The scheduling path is higher risk:

- appointment creation is owned by `apps/web/lib/appointments/data.ts`
- `createAppointment` validates linked opportunity, customer, project, and assigned person against the current organization
- appointment creation inserts an appointment record
- site-visit appointments linked to an opportunity can update opportunity site-assessment status and scheduled/completed timestamps

That makes `schedule_site_assessment` a later controlled execution candidate. It needs scheduling readiness, assignment, date/time, customer visibility, opportunity state, and duplicate appointment checks before execution.

### Audit And History Patterns

Existing platform patterns include:

- `created_by` and `updated_by` fields on canonical operational records
- specialized revision infrastructure for estimates, invoices, contracts, and change orders
- immutable event patterns for document signature events and provider webhook ledgers
- GateKeeper review fields on artifacts and suggestions

Gap:

- GateKeeper does not yet have a controlled execution audit ledger or canonical output linkage for executed suggestions.
- `gatekeeper_action_suggestions.status` is intentionally review-only and should not be overloaded as an execution lifecycle.

## Open Gaps

Execution should wait until these gaps are resolved:

- execution status model: current suggestion status is review-only
- execution audit: missing immutable or append-only event/link record for suggestion-to-action execution
- created record linkage: missing place to link suggestion id to created opportunity id
- duplicate detection: missing preflight for existing contact/opportunity matches
- idempotency: missing guard against double execution of one suggestion
- permission nuance: active membership exists, but role-specific opportunity execution permission needs confirmation
- payload mapping: `proposed_payload` needs a safe draft mapper into canonical opportunity fields
- confirmation UI: user needs a separate execution confirmation surface
- stale state: suggestion may be old, superseded, rejected, or based on a changed subject
- tests: execution must prove review approval and execution request remain separate

## Anti-Drift Rules

GateKeeper must not:

- directly insert canonical records from its own module
- bypass Leads/Opportunities validation
- call `createOpportunity` from source adapters, provider webhooks, AI output, or review approval
- call `ensureOpportunityEstimateFlow` from the first execution bridge
- create customers/projects/estimates as part of opportunity creation
- create appointment, schedule, job, or customer-facing communication side effects
- treat AI/provider/manual payloads as trusted canonical input
- convert reviewed suggestions into hidden automatic actions
- add provider-owned leads, duplicate CRM records, task silos, or schedule silos

## Recommended Next Slices

1. `create_opportunity` controlled execution plan: define draft field mapping, duplicate-detection strategy, execution ledger/linkage needs, and confirmation UX without code mutation.
2. `create_opportunity` execution confirmation UI, non-mutating: render the final editable canonical draft and preflight blockers, but do not submit to `createOpportunity`.
3. GateKeeper execution audit/linkage schema planning: decide whether to add a separate execution events table or extend suggestions with execution linkage in a later migration.
4. `create_opportunity` controlled execution adapter, disabled/non-callable: pure policy and test coverage proving only the Opportunities owner may execute.
5. `create_opportunity` controlled execution implementation: explicit human execution request only, using the canonical Opportunities server boundary.
6. Post-execution audit/linking: store source suggestion/artifact/thread/message context and created opportunity id.
7. Reassess `schedule_site_assessment` after opportunity execution proves the bridge pattern.

## Audit Conclusion

Historical audit conclusion: GateKeeper was ready for a planning pass toward `create_opportunity` execution, but not ready for execution implementation.

The next safe step is a non-mutating `create_opportunity` controlled execution plan and confirmation/preflight surface. Real mutation should wait until audit, duplicate detection, explicit execution status, and canonical output linkage are designed.

Follow-up planning now lives in [docs/gatekeeper-create-opportunity-controlled-execution-plan.md](C:/FloorConnector/docs/gatekeeper-create-opportunity-controlled-execution-plan.md). That plan defines the future draft mapping, duplicate detection, confirmation UX, execution ledger/linkage requirements, and Opportunities-owned mutation boundary for `create_opportunity`.

The execution ledger foundation now exists as `gatekeeper_execution_attempts`, and the create-opportunity confirmation panel can explicitly save a `confirmation_started` ledger draft. `/gatekeeper` can reload that saved draft into preflight, rerun readiness and duplicate warnings, and mark an approved/requestable draft `execution_requested` with `requested_by` and `requested_at` when required fields are present and no high-confidence duplicate warning is active.

That refresh now lives in [docs/gatekeeper-create-opportunity-execution-implementation-plan.md](C:/FloorConnector/docs/gatekeeper-create-opportunity-execution-implementation-plan.md). It keeps the audit recommendation intact: `create_opportunity` is still the first real candidate, but only through an explicit `execution_requested` ledger row, server-side duplicate/preflight recheck, and Opportunities-owned creation boundary. GateKeeper must still not insert opportunities or contacts directly, and first execution must not call `ensureOpportunityEstimateFlow` or create downstream customer/project/estimate/scheduling/payment/legal records.

That first controlled execution service now exists for `create_opportunity` only. It follows the audit path: approved suggestion, explicit `execution_requested` ledger row, server-side preflight and duplicate recheck, allowed-field mapping, Opportunities-owned typed creation helper, and ledger result linkage. The audit guardrails still apply to every other GateKeeper suggestion type, and review approval remains separate from execution.
