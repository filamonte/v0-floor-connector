# GateKeeper Controlled Action Bridge

Status: Planning
Doc Type: Architecture

## Purpose

The GateKeeper controlled action bridge defines the future safety boundary between reviewable GateKeeper suggestions and real FloorConnector workflow mutations.

GateKeeper can capture context, normalize source events, create memory artifacts, and propose actions. It must not own the final mutation of opportunities, projects, schedules, jobs, invoices, contracts, communications, payments, or other canonical records.

The bridge is needed because approving a suggestion for review is not the same as executing business behavior. A contractor may agree that GateKeeper noticed something useful without agreeing that FloorConnector should create a record, send a message, change a schedule, update financial state, or alter legal/commercial records.

## Core Rule

GateKeeper suggestions are not actions. They are proposed intent until a human approves an explicit controlled action handled by the owning canonical workflow.

Current implementation supports review status, the `create_opportunity` confirmation/request path, and the first controlled `create_opportunity` execution service. That service is limited to an approved suggestion with an `execution_requested` ledger row, reruns server-side duplicate/preflight checks, calls an Opportunities-owned typed creation boundary, records the created opportunity id in the ledger, and surfaces executed/failed ledger results back into the GateKeeper queue, drawer, and subject memory panel.

## Action Lifecycle

Future controlled actions may need a lifecycle separate from the current suggestion review state:

- `proposed`: GateKeeper or an adapter proposed an action suggestion.
- `reviewed` / `accepted`: a human reviewed the suggestion as useful. This is current review behavior, not execution.
- `ready_for_execution_review`: the system has enough information to show a future execution preview.
- `execution_requested`: a human explicitly requested execution after reviewing the preview.
- `execution_validated`: the owning canonical module validated permissions, tenant ownership, stale state, and payload shape.
- `executed`: the owning canonical module completed the mutation or send.
- `failed`: validation or execution failed with an auditable reason.
- `canceled`: a user canceled the execution path.
- `superseded`: a newer suggestion or workflow state replaced the older proposed intent.

The existing `gatekeeper_action_suggestions.status` values are review-state values only: `proposed`, `approved`, `rejected`, `dismissed`, and `superseded`. They are not execution-state values.

## Execution Ownership

Future execution must be owned by the canonical module that already owns the business behavior:

- Opportunities/Leads own create/update opportunity behavior.
- Projects own project notes, scope, and project-context updates.
- Schedule/Jobs own scheduling, appointment, dispatch, and job changes.
- Invoices/Payments own billing, invoice, collection, and payment actions.
- Contracts own contract review, signature, and contract-state actions.
- Communications own outbound message composition, delivery attempts, and send audit.
- Work items own task-like internal follow-through only if the canonical work-item model supports the requested behavior.

GateKeeper may prepare a proposed payload or preview, but the owning module must validate and execute through its own server boundary.

## Suggested Action Categories

Future action suggestions should be grouped by risk:

- Low-risk internal memory updates: artifact review, labels, and internal-only memory enrichment.
- Medium-risk internal workflow preparation: internal work-item drafts, project note drafts, estimate/invoice/contract review flags, or opportunity draft preparation.
- High-risk customer-facing communication: email, SMS, portal message, voice callback, or external notification.
- High-risk schedule/job changes: site assessment scheduling, job scheduling, dispatch, crew assignment, or schedule changes.
- High-risk financial/legal/commercial changes: invoices, payments, contracts, signatures, pricing, discounts, taxes, and commercial commitments.
- Forbidden/autonomous actions: hidden sends, hidden schedule changes, hidden financial/legal actions, provider-webhook mutations, or AI-owned canonical truth.

## Permission And Approval Rules

Future controlled execution must require:

- an authenticated user
- active tenant membership for the linked organization
- role permissions matching the owning canonical action
- linked subject ownership validation inside the tenant
- explicit confirmation for customer-facing sends
- stronger confirmation for financial, legal, contract, and payment actions
- schedule readiness validation for scheduling/job actions
- provider readiness checks before provider-backed actions
- automation-mode and organization settings checks where applicable

Approval of a GateKeeper review item must not bypass the owning module permission model.

## Payload Validation

`proposed_payload` is untrusted.

Future execution must follow these rules:

- owning modules validate all inputs with their own schemas
- linked subjects must belong to the current tenant
- stale record versions or changed workflow state must block or re-preview execution where applicable
- GateKeeper payloads must not be directly written into canonical tables
- AI, provider, manual, or demo-originated suggestions must never be blindly trusted
- provider metadata and source text are context, not authority

## Audit Trail

Future controlled execution should produce an auditable chain:

- source artifact id
- source suggestion id
- reviewer id and reviewed timestamp
- execution requester id and timestamp
- executor id and timestamp when different
- owning canonical action invoked
- canonical record id created or updated
- before/after or revision linkage where applicable
- validation blockers
- failure reason
- immutable event trail where appropriate

Audit should prove both the origin of the suggestion and the human/canonical action that caused any real mutation.

## UX Requirements

Future UI must make the distinction obvious:

- approve review does not execute
- execution requires a separate explicit action
- the user sees exactly what will happen before it happens
- the user can edit proposed payload fields before execution where the owning workflow allows it
- the system shows validation blockers before execution
- success and failure states link back to the affected canonical record or review item
- risky actions use stronger confirmation language than low-risk internal preparation

Execution UI should feel like a canonical workflow handoff, not an AI shortcut.

## Anti-Drift Rules

GateKeeper must not:

- directly insert canonical records
- let provider webhooks mutate canonical business records
- treat AI output as source of truth
- send hidden external communications
- make hidden scheduling changes
- make hidden financial, payment, legal, pricing, or contract changes
- create duplicate task, CRM, schedule, communication, or provider-specific execution models
- convert review approval into execution

## Future Implementation Sequence

Recommended future slices:

1. Controlled action bridge type definitions: implemented as a non-executing interface/helper layer.
2. Non-executing execution preview builder: implemented as a read-only preview layer for current GateKeeper suggestion types.
3. Low-risk internal note/memory acceptance bridge.
4. Create-opportunity execution preview only.
5. Create-opportunity controlled execution: implemented for approved `execution_requested` ledger rows only.
6. Schedule-site-assessment preview only: implemented as a non-executing specialized preview.
7. Schedule-site-assessment controlled execution.
8. Outbound communication preview only.
9. Provider-backed execution later.

Additional action types should wait until preview, validation, ownership, permissions, audit, stale-state handling, and cancellation rules are explicit.

The controlled execution readiness audit lives in [docs/gatekeeper-controlled-execution-readiness-audit.md](C:/FloorConnector/docs/gatekeeper-controlled-execution-readiness-audit.md). It recommends `create_opportunity` as the first real controlled execution candidate only after a separate execution request, confirmation/preflight UI, duplicate detection, audit/linkage model, and canonical Opportunities-owned validation path are designed. It also confirms that `schedule_site_assessment` should remain later because appointment creation can update opportunity assessment state and needs scheduling-specific readiness controls.

The detailed first-action plan lives in [docs/gatekeeper-create-opportunity-controlled-execution-plan.md](C:/FloorConnector/docs/gatekeeper-create-opportunity-controlled-execution-plan.md). It keeps `create_opportunity` execution owned by the Opportunities workflow, treats GateKeeper as draft/context/audit source only, and recommends an execution ledger before any mutation-capable bridge is implemented.

The refreshed implementation plan lives in [docs/gatekeeper-create-opportunity-execution-implementation-plan.md](C:/FloorConnector/docs/gatekeeper-create-opportunity-execution-implementation-plan.md). It reconciles the actual saved draft, duplicate preview, preflight, and `execution_requested` ledger path before real mutation. The plan recommends that the first execution service call only an Opportunities-owned typed creation boundary, never insert opportunity/contact rows directly from GateKeeper, and never call `ensureOpportunityEstimateFlow` for the first action.

The execution ledger foundation now exists as `gatekeeper_execution_attempts` and helper tests in `apps/web/lib/gatekeeper/execution-ledger.ts`. It separates execution attempt status, idempotency, payload snapshots, validation errors, result subject linkage, and failure metadata from `gatekeeper_action_suggestions.status`.

The current preview builder lives in `apps/web/lib/gatekeeper/execution-preview.ts` and is surfaced on `/gatekeeper` action suggestion cards plus the suggestion detail drawer. It summarizes what a suggestion would prepare in a future controlled action, which canonical owner would be responsible, what validation would be required, and which proposed payload fields are available for display only. Generic previews still return `canExecuteNow: false`; `create_opportunity` now reports that execution requires an approved suggestion and `execution_requested` ledger row, while other action types remain blocked/not implemented. The preview builder itself does not call canonical mutation actions, write canonical records, send communications, call providers, run AI, or change review approval semantics.

The suggestion detail drawer remains separate from review approval. It gathers source references, rationale, preview blockers, validation requirements, untrusted payload display, review-only controls, and for `create_opportunity` only the controlled confirmation/request/execution path.

`create_opportunity` suggestions also have a specialized draft preview in `apps/web/lib/gatekeeper/opportunity-preview.ts`. That preview safely extracts known display fields from `proposed_payload`, reports missing recommended intake fields, names Leads/Opportunities as the future owning workflow, and keeps `canCreateNow: false`. Unknown payload fields remain additional untrusted data. This preview does not call opportunity actions, create leads, create customers, create projects, or validate the payload as canonical input.

The first confirmation UI for `create_opportunity` is also implemented. The suggestion detail drawer can open an editable draft preview for known intake fields and display duplicate warnings, missing recommended fields, and safety checklist. It can explicitly save a confirmation draft to `gatekeeper_execution_attempts` with status `confirmation_started`; that save is ledger-only and does not call Opportunities mutations or create any canonical record.

The `create_opportunity` confirmation panel now has a read-only duplicate detection preview. It loads bounded tenant-scoped warning matches from existing opportunities, customers, contacts, and GateKeeper execution-attempt ledger rows. Exact email and normalized phone matches are high-confidence warnings, name-only matches remain low confidence, and service/location overlap is supporting context only. It does not merge, link, call Opportunities mutations, or create any canonical record.

The `create_opportunity` confirmation panel can now show a saved-draft execution preflight. That preflight reloads the latest saved ledger draft, requested attempt, executed result, or failed attempt; reruns duplicate warnings from the saved draft; reports missing fields and Leads/Opportunities validation requirements; and identifies whether the request is eligible for the explicit controlled create action.

The first request-state transition exists for `create_opportunity`: an approved suggestion with a requestable saved draft, required fields present, and no high-confidence duplicate warning can update only the ledger row to `execution_requested` with `requested_by` and `requested_at`.

The first controlled execution service now exists for `create_opportunity`: an eligible `execution_requested` ledger row can create exactly one canonical opportunity through `apps/web/lib/opportunities/create-opportunity-service.ts`, which validates with the Opportunities schema and calls the existing Opportunities creation flow. GateKeeper maps only allowed saved-draft fields, blocks high-confidence duplicates, updates the ledger to `executed` with the opportunity id on success, and records `failed` with a safe error if canonical creation fails. It does not call `ensureOpportunityEstimateFlow`, directly insert opportunities/contacts, create customers/projects/estimates/jobs/schedules/invoices/contracts/payments/messages/portal records, call providers, run AI, or make review approval execute anything.

`schedule_site_assessment` suggestions also have a specialized scheduling preview in `apps/web/lib/gatekeeper/site-assessment-preview.ts`. That preview safely extracts known display fields from `proposed_payload`, reports missing recommended scheduling fields, names Leads/Opportunities as the default future owner and Projects/Schedule when linked to a project, and keeps `canScheduleNow: false`. Unknown payload fields remain additional untrusted data. This preview does not call scheduling, appointment, job, or opportunity actions; create appointments, jobs, schedule records, or tasks; send confirmations; update opportunity site-assessment fields; or validate the payload as canonical scheduling input.
