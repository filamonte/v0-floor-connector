# Intelligent Follow-Up Engine Plan

Status: Implemented Foundation
Doc Type: AI Guidance

This is a planning and implementation-boundary document for FloorConnector's AI / Intelligent Follow-Up Engine. The current branch implements a deterministic computed-cue, user-confirmed cue-action, and user-scoped cue-state foundation. It does not implement persisted cue instances as business records, broad resolve workflows, AI provider calls, automation, autonomous actions, or customer-visible AI actions.

For implemented truth, use [docs/current-state.md](C:/FloorConnector/docs/current-state.md). For the current workflow model, use [docs/workflows.md](C:/FloorConnector/docs/workflows.md).

Ownership note: this document owns deterministic follow-up intelligence,
computed cues, cue state, and cue-to-work-item boundaries. For the umbrella
long-term agentic AI strategy, see
[docs/agentic-operations-layer.md](C:/FloorConnector/docs/agentic-operations-layer.md).

## Purpose

The Intelligent Follow-Up Engine is a workflow intelligence layer. It watches canonical FloorConnector records, detects follow-up needs, explains the evidence, and routes users into safe next actions.

It is not a chatbot-first feature, not a second task system, and not a parallel AI memory system. The first versions should stay deterministic, auditable, tenant-scoped, and human-confirmed.

The canonical lifecycle remains:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Existing-System Inventory

| Primitive                                                         | Current role                                                                                                                                                                                                                                     | Recommendation                                                                                                                             |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `organization_operational_cue_rules`                              | Tenant-owned configuration for built-in cue rules. Current rules cover sent estimates, sent/viewed unsigned contracts, overdue invoices, unpaid deposits, ready unscheduled jobs, and scheduled jobs missing crew.                               | Reuse as the current rule-configuration foundation. Extend only with explicit migrations later.                                            |
| `organization_responsibility_role_defaults`                       | Maps starter responsibility strategies to active assignable `people` records for display/resolution metadata.                                                                                                                                    | Reuse for cue responsibility display. Do not treat as assignment state.                                                                    |
| Derived Operational Intelligence cues                             | `apps/web/lib/operational-cues/*` derives query-time cues from canonical estimates, contracts, invoices, jobs, projects, and job assignments. Cue rows include evidence, threshold, explanation, urgency, responsible lane, and canonical route. | Reuse as the current deterministic cue engine. Add new cue keys here before any AI suggestions.                                            |
| `workflow_cue_states`                                             | Canonical tenant-scoped response layer for deterministic cue identities. V1 stores user-scoped dismissed or snoozed states by cue family, key, version, subject, and fingerprint. Absence of a row means the cue remains active/visible.         | Reuse only for cue visibility handling. It is not a task model, cue-instance truth, workflow status, or canonical-record completion state. |
| `NeedsAttentionPanel`                                             | Record-level cue display on project, estimate, contract, invoice, and job workspaces.                                                                                                                                                            | Reuse for contextual record-level cue placement.                                                                                           |
| Dashboard `My Work`                                               | Company/Mine/Unresolved display modes over derived cues. No persisted cue instances, no task creation, no notification delivery, and no AI.                                                                                                      | Reuse as the first organization-wide cue surface.                                                                                          |
| Project `Suggested project actions`                               | Deterministic project guidance from existing project context, with workflow links and optional work-item prefill.                                                                                                                                | Reuse for project hub follow-through. Keep it human-confirmed.                                                                             |
| `work_items`                                                      | Internal contractor work/action items with owner, due date, status, source link, safe metadata, and completion/dismissal.                                                                                                                        | Reuse as the work execution object when a user explicitly converts a cue to work. Do not create a duplicate task model.                    |
| Work-item prefill helpers                                         | `apps/web/lib/work-items/prefill.ts` can prefill internal work items from lead, appointment, supported record-level operational cues, and approved project guidance cues.                                                                        | Reuse for user-confirmed prefill only. Do not auto-create work items or broaden cue support without approval.                              |
| `notification_events`, `notifications`, `notification_deliveries` | Canonical notification event and per-user notification foundations, with delivery tracking for supported sends.                                                                                                                                  | Reuse for future internal alerts. Avoid customer-facing AI sends unless a later approved workflow adds review and consent gates.           |
| `communication_threads`, `communication_messages`                 | Canonical communication thread/message foundation tied to records such as opportunities, appointments, customers, projects, estimates, contracts, invoices, change orders, and payments.                                                         | Reuse as communication evidence and future drafting context. Do not create AI-only communication logs.                                     |
| `workflow_error_events`                                           | Tenant/platform operational issue and feedback log, including early-access feedback and platform operations visibility.                                                                                                                          | Reuse for system/support evidence. Avoid using it as a user task or cue lifecycle table.                                                   |
| `automation_runs`                                                 | Tenant-scoped audit and idempotency ledger for manual internal notification-only automation execution.                                                                                                                                           | Keep separate from cue lifecycle. Reuse only if a later automation phase explicitly executes internal notifications.                       |
| Project readiness utilities                                       | `getProjectFinancialReadinessSnapshot`, `computeCommercialReadiness`, and readiness gate utilities drive contract/deposit/scheduling safety.                                                                                                     | Reuse as evidence. Never bypass or reinterpret readiness independently.                                                                    |
| `/settings/operational-intelligence`                              | Admin route to tune built-in cue rules and responsibility defaults. The current UI explains each rule's trigger, impact, surface, safe next action, and user-scoped visibility behavior.                                                         | Reuse for deterministic rule settings.                                                                                                     |
| `/settings/automation`                                            | Manual, notification-only automation readiness/execution surface.                                                                                                                                                                                | Avoid for cue display. It can become a later controlled automation bridge only after cue state and review are proven.                      |
| Existing AI docs                                                  | `docs/ai-assisted-operating-system.md`, `docs/ai-contractor-workflows.md`, `docs/ai/implementation-boundaries.md`, and `docs/ai/ai-documentation-rules.md` define AI as an operating layer over canonical records.                               | Reuse as guardrails. This doc narrows that direction to follow-up intelligence.                                                            |

## Product Model

A cue is a derived, explainable signal that a canonical record likely needs human attention. It is not a durable business record, not a task, not an assignment, and not a workflow status.

A cue should include:

- `cue_key`: the deterministic rule that produced it.
- `subject_type` and `subject_id`: the canonical record it points to.
- `project_id` and customer context when available.
- evidence labels and values, such as sent date, due date, balance, readiness state, or schedule date.
- threshold or rule configuration used.
- severity or urgency.
- suggested action label and destination route.
- responsibility lane or resolved responsible person for display only.

A task or work item is different. A work item is an explicit internal action record that can be owned, due, completed, or dismissed. A cue can prefill a work item, but the user must submit it. Completing or dismissing a work item must not silently mutate the cue source record or canonical workflow status.

Cue to work-item flow:

1. Derive cue from canonical records and enabled tenant rule settings.
2. Show evidence and suggested action in a dashboard or record workspace.
3. User either opens the canonical workflow route or chooses to create an internal work item.
4. Work-item form is prefilled with source type, source id, link path, title, reason, and safe metadata.
5. User confirms owner, due date, priority, and description before insert.
6. Work item lifecycle is independent from the source record lifecycle.

Current bridge implementation:

- Estimate Workspace record-level `estimate_sent_followup` cues can open the existing work-item form with estimate source lock, `Follow up on sent estimate` title, human-readable cue evidence, normal priority, and safe operational-cue metadata.
- Invoice Workspace record-level `invoice_overdue` cues can open the existing work-item form with invoice source lock, `Follow up on past-due invoice` title, due-date/open-balance evidence, high priority, and safe operational-cue metadata.
- Project Workspace deterministic project cue actions route canonical next steps first: approved estimates open contract generation, unpaid deposit invoices open the invoice, signed ready projects open job Quick-Create, and ready unscheduled jobs open the schedule handoff. The project guidance UI groups these canonical workflow actions separately from human follow-up actions. Project cue work-item prefill is limited to human coordination cues such as open blocker field-note follow-up, with project source lock and user-confirmed submission.
- Dashboard `My Work` cues remain awareness/workflow-link only in this pass and do not expose work-item creation.
- Unsupported operational cue types do not produce cue-to-work-item prefill actions until separately approved.
- Record and Project Workspace cue surfaces can now suppress supported cues with user-scoped dismiss or snooze state. Dismiss hides only cues that match the same deterministic fingerprint; snooze hides only until the selected time expires. Dashboard previews respect suppression but do not expose mutation controls.
- Cue-state writes do not resolve canonical business records, create work items, send notifications, or change readiness/workflow status. Broad resolve remains deferred.

AI fits later as drafting and explanation support. Deterministic cues decide whether attention is needed. LLM assistance can later summarize evidence, draft a follow-up message, or prepare an action proposal, but it should not be the first detector for V1 follow-up needs.

## Guardrails

- No AI-created canonical records without user confirmation.
- No AI-sent customer messages without review, consent/eligibility checks, and approved send workflow.
- No AI financial changes, invoice status changes, payment requests, refunds, voids, tax changes, or reconciliation changes.
- No readiness bypass. Readiness evidence must come from existing readiness utilities and server gates.
- No workflow status transitions by AI unless a later approved workflow explicitly adds that action path.
- No duplicate lead, customer, project, estimate, contract, job, invoice, payment, communication, calendar, task, or cue business models.
- Every cue must show evidence.
- Every cue must be tenant-scoped.
- Every cue action must route into existing canonical Manager Pages, Record Workspaces, or approved server-side workflows.
- Portal/customer-visible AI actions are out of scope for the first follow-up engine phases.
- AI outputs are drafts, summaries, explanations, or proposals until approved by a human.

## First Deterministic Cue Candidates

| Cue                                                | Subject             | Trigger logic                                                                                                                                  | Evidence                                                                                                        | Severity         | Suggested action                                                                  | Destination                                                                              | Prefill existing form                                            | V1 safety                                                                                                                               |
| -------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Sent estimate needs follow-up                      | Estimate            | Estimate is `sent` and no customer decision exists after the configured threshold.                                                             | Estimate status, sent date or conservative fallback updated date, threshold.                                    | High             | Open estimate / create follow-up work item.                                       | `/estimates/[estimateId]`                                                                | Yes, internal work item.                                         | Already implemented as `estimate_sent_followup`; deterministic and internal.                                                            |
| Signed contract needs deposit or scheduling action | Contract or Project | Contract is signed and readiness indicates deposit is required but unsatisfied, or no deposit is required and scheduling/job handoff is ready. | Contract signed state, readiness snapshot, deposit requirement, deposit invoice state, ready-to-schedule state. | Critical or high | Open project readiness hub, review deposit invoice, create job, or open schedule. | `/projects/[projectId]`, `/invoices/[invoiceId]`, `/jobs?projectId=...`, `/schedule?...` | No by default when a canonical next action exists.               | Uses existing readiness logic and canonical workflow routes before work-item prefill.                                                   |
| Deposit invoice unpaid                             | Invoice             | Invoice has `workflow_role = deposit`, open balance, and remains unpaid after threshold.                                                       | Invoice role, status, issue date or updated date, balance due, threshold.                                       | Critical         | Open deposit invoice.                                                             | `/invoices/[invoiceId]`                                                                  | No by default from Project Workspace; open the invoice workflow. | Already implemented as `deposit_invoice_unpaid`; no payment mutation.                                                                   |
| Ready project not scheduled                        | Job or Project      | Project is ready to schedule and one or more canonical jobs remain unscheduled after threshold.                                                | Project readiness status/timestamp, job dispatch status, job id count.                                          | High             | Open schedule action for unscheduled job/project.                                 | `/schedule?projectId=...&view=unscheduled&action=schedule`                               | No by default; open schedule handoff.                            | Already implemented for jobs as `job_ready_unscheduled`; project guidance also covers ready unscheduled jobs.                           |
| Past-due invoice                                   | Invoice             | Invoice has an open balance after due date plus threshold.                                                                                     | Due date, balance due, status, threshold.                                                                       | High or critical | Open invoice / create invoice follow-up work item.                                | `/invoices/[invoiceId]`                                                                  | Yes, internal work item.                                         | Already implemented as `invoice_overdue`; no collections send or balance change.                                                        |
| Qualified lead with no estimate                    | Opportunity         | Opportunity is qualified or advanced enough for estimating, but no linked estimate exists after a configured threshold.                        | Opportunity status, next follow-up, linked customer/project state, missing estimate.                            | Normal or high   | Open lead or create estimate from existing context.                               | `/leads/[leadId]` or existing estimate quick-create route when context is safe           | Yes, internal work item first.                                   | Safe if it stays opportunity-derived and does not auto-create estimates. Requires confirming current opportunity statuses before build. |
| Contract viewed but unsigned                       | Contract            | Contract has customer view activity and remains unsigned after threshold.                                                                      | Contract status, viewed timestamp, threshold, signer state where available.                                     | High             | Open contract / create signature follow-up work item.                             | `/contracts/[contractId]`                                                                | Yes, internal work item.                                         | Already implemented as `contract_viewed_unsigned`; no send or signature mutation.                                                       |
| Job scheduled without crew assignment              | Job                 | Job is scheduled within configured look-ahead window and has no crew/vendor assignment or job assignment rows.                                 | Scheduled date, dispatch status, crew/vendor field, assignment count, threshold.                                | High             | Open job or crew assignment surface.                                              | `/jobs/[jobId]`                                                                          | Yes, internal work item later.                                   | Already implemented as `job_scheduled_missing_crew`; no assignment mutation.                                                            |

## Data Model Direction

Recommended direction: combine computed cues with persisted dismiss/snooze state as a thin response layer.

The current implementation uses computed/query-only cues as the cue source of truth. It also uses persisted rule settings, responsibility defaults, and `workflow_cue_states` for user response state. Cue derivation remains pure and deterministic; persisted state is applied after derivation to control visibility.

The persisted cue-state layer does not store active rows. Absence of a row means active/visible. Rows store only dismissed, snoozed, or schema-supported resolved state around a deterministic cue identity and fingerprint. V1 exposes user-scoped dismiss and snooze only; broad resolve is not exposed.

Implemented table shape:

```text
workflow_cue_states
- id uuid primary key
- company_id uuid not null references companies(id)
- cue_family text not null
- cue_key text not null
- cue_version integer not null
- cue_fingerprint text not null
- subject_type canonical_record_subject_type not null
- subject_id uuid not null
- project_id uuid null
- scope text not null check in ('user', 'company')
- user_id uuid null references users(id)
- state text not null check in ('dismissed', 'snoozed', 'resolved')
- snoozed_until timestamptz null
- dismissed_at timestamptz null
- resolved_at timestamptz null
- last_seen_at timestamptz null
- reason text null
- metadata jsonb not null default '{}'
- created_by uuid null references users(id)
- updated_by uuid null references users(id)
- created_at timestamptz not null
- updated_at timestamptz not null
```

Rules:

- It stores cue lifecycle preference, not a second task.
- `cue_fingerprint` lets changed source evidence resurface a previously dismissed or snoozed cue.
- User-scoped rows require `user_id`; company-scoped rows are schema-supported but not exposed by V1 actions.
- RLS must be tenant-scoped.
- It must not create or update canonical records.
- Work items remain the internal action record when a person wants ownership, due date, completion, or dismissal.

### Cue State Expansion Planning

The next cue-state work should extend this response layer only after the safety model is explicit. The system should keep these concepts separate:

- computed cue: derived at query time from canonical records, rules, readiness, and responsibility metadata.
- cue identity / dedupe key: deterministic cue family, key, version, subject, and fingerprint used to match a response row to one material cue state.
- cue state: response/visibility handling around a cue identity, not copied cue content and not workflow truth.
- cue event: a possible later audit trail of cue-state changes; not needed for V1 dismiss/snooze behavior.
- work item: the existing internal action record for owner, due date, status, and follow-through after user confirmation.
- notification: delivery or in-app alert evidence, not cue lifecycle truth.
- automation event: idempotency and audit evidence for approved automation runs, not cue state.

Recommended scope split:

- User-scoped state remains the default for snooze, dismiss, hide, and read-style visibility. Example: an estimator snoozes a sent-estimate follow-up until tomorrow without hiding it from another teammate's company queue.
- Company-scoped state should be reserved for explicit owner/admin-style handling such as future mark handled or resolve. Example: an overdue-invoice cue is company-resolved only after the organization agrees the follow-up is handled.
- Work-item-linked state should reference the existing `work_items` record when a cue has been converted to human-owned follow-through. Example: a blocker cue can link to an existing project work item without letting the cue state become a second task system.

Future schema options:

| Option                                                                 | Fit                           | Pros                                                                                                                                            | Cons / Risks                                                                                               |
| ---------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Single `workflow_cue_states` table with `scope` and nullable `user_id` | Recommended current direction | Reuses the implemented table, keeps cue identity rules in one place, supports user and company response state without a second lifecycle table. | Company-scoped controls need careful role gates so important work is not hidden too broadly.               |
| Separate organization and user cue-state tables                        | Not recommended yet           | Clear physical separation between personal visibility and company handling.                                                                     | More joins, duplicated uniqueness/fingerprint rules, and higher drift risk across cue families.            |
| Event-only cue state model                                             | Later audit option            | Strong history for who dismissed, snoozed, resolved, or reopened a cue.                                                                         | Too heavy for current needs unless paired with a projected current-state table; easy to overbuild.         |
| Reuse only `work_items`                                                | Avoid                         | No new cue-state table.                                                                                                                         | Cannot model snooze/dismiss/read visibility without turning work items into a hidden cue lifecycle system. |

If company-scoped handling is approved later, prefer extending the current table over creating a new cue-instance model. Candidate fields should be additive and narrow, such as `linked_work_item_id`, `handled_at`, `handled_by`, `handled_reason`, or `last_seen_at`, with same-company validation for any linked work item. Do not store active cue copies, raw provider payloads, AI-only summaries, or duplicated canonical record state.

RLS and safety principles for that later pass:

- all cue state remains tenant-scoped through active company membership.
- user-scoped rows are mutable only by that user; owner/admin read visibility can be considered separately if there is a concrete support workflow.
- company-scoped resolve or handled state requires an explicit authorized membership rule, not generic member writes.
- linked work items must belong to the same company and point to a compatible source record when a source link exists.
- dashboards may respect suppression, but dashboard mutation controls should wait until contextual record/project controls are proven.

## UX Placement Recommendation

Dashboard should remain the first organization-wide surface because users need a cross-record queue before drilling into records. `My Work` is already the right starting surface for company, mine, and unresolved views.

Project Workspace should remain the primary follow-through hub because project readiness and downstream handoffs often need estimate, contract, invoice, job, and schedule context together.

Estimate Workspace should show estimate-specific follow-up cues such as sent estimate needs follow-up. It should route to the existing estimate workflow and optionally prefill an internal work item.

Invoice Workspace should show invoice and deposit cues because billing follow-up needs balance, due date, payment, and customer context. It must not send collections messages automatically.

Schedule and Job Workspaces should show scheduling and crew readiness cues. They should route into existing job/schedule actions and keep readiness gates authoritative.

Customer Workspace should eventually summarize account-level follow-up, but it should aggregate canonical project/estimate/invoice/communication context rather than create customer-only cue state.

Future Communications Center should eventually show cues tied to stale replies, unanswered customer questions, delivery failure, or manual follow-up, using `communication_threads`, `communication_messages`, and notification/delivery evidence.

## Implementation Phases

### Phase 0: Docs And Inventory

- Keep this plan as the follow-up engine product model.
- Confirm current docs do not claim target AI automation is implemented.
- Keep `docs/current-state.md` unchanged unless implementation changes.

### Phase 1: Deterministic Computed Cues

- Current V1 behavior derives evidence-backed cues at query time from canonical records and tenant-owned `organization_operational_cue_rules`.
- The first safe V1 cue slice includes stale sent estimate follow-up, ready project/job scheduling follow-through, past-due invoice follow-up, and scheduled jobs missing crew.
- Dashboard `My Work` surfaces estimate, invoice, and job operational cues through existing My Work widgets.
- Project Workspace `Suggested project actions` surfaces ready-project scheduling follow-through when readiness is clear and canonical jobs remain unscheduled, and routes project cues with canonical next steps into existing contract, invoice, job, and schedule workflows.
- Record-level `Needs Attention` panels continue to surface derived cues on project, estimate, contract, invoice, and job workspaces.
- V1 cues route to existing canonical record workspaces or schedule actions. Record-level estimate and invoice contexts can also prefill the existing work-item creation form for user-confirmed submission. Project Workspace cue-to-work-item prefill is limited to human coordination cues without a safer direct workflow action, currently open blocker field-note follow-up. Cues do not create records, mutate workflow state, send notifications, auto-create work items, or call AI providers. User-scoped dismiss/snooze controls only affect cue visibility for supported cue identities.
- Continue deriving cues from canonical records plus `organization_operational_cue_rules`.
- Add any new deterministic cue keys only after confirming canonical source fields and safe destination routes.
- Keep every cue evidence-backed and tenant-scoped.
- Keep AI provider calls out.

### Phase 2: Persisted Cue State

- Implemented V1 adds `workflow_cue_states` with RLS, tenant indexes, deterministic cue identity, and fingerprint-based suppression.
- Record and Project Workspace surfaces expose user-scoped dismiss/snooze only for approved cue types.
- Dashboard preview respects suppression but remains awareness-only with no mutation controls.
- Persist state around cue identity and fingerprint, not copied canonical data.
- Broad resolve remains deferred; cue state must not mark canonical business records complete.
- Next expansion should add only one safety slice at a time: first company-scoped handling rules and tests if needed, then contextual UI, then dashboard controls after the record/project workflow is proven.

### Phase 3: Cue-To-Work-Item Bridge

- First V1 bridge slice is implemented for record workspace contexts only: `estimate_sent_followup` and `invoice_overdue` can prefill existing source-locked internal work-item forms on Estimate and Invoice Workspaces.
- Project Workspace cue actions now prefer canonical workflow routing. Approved-estimate, deposit-invoice, signed-contract/no-job, and ready-unscheduled-job cues do not produce work-item prefill by default; only open blocker field-note coordination can prefill a project source-locked work item.
- Require user confirmation before inserting `work_items`.
- Preserve source links, dedupe keys, and safe metadata.
- Do not auto-create work items from cue derivation.
- Keep dashboard cues awareness-only unless a later approved slice explicitly adds dashboard bridge behavior.

### Phase 4: Organization Follow-Up Rules And Settings

- `/settings/operational-intelligence` now stays limited to built-in deterministic rules, thresholds, urgency, responsibility defaults, and explanatory guardrails.
- Rule cards explain trigger, why the cue matters, where it appears, safe next action, and whether visibility handling is user-scoped.
- Avoid a generic expression builder until the built-in cue set is proven.
- Keep settings owner/admin controlled.

### Phase 5: AI Summaries And Draft Assistance

- Add LLM help only after deterministic cues and evidence are stable.
- AI may summarize why a cue matters, draft internal notes, or draft customer follow-up copy.
- Drafts must be review-only and route through existing communication/send workflows.
- Do not use AI summaries as the source of truth.

### Phase 6: Controlled Automation

- Consider internal notification-only automation first, using existing `automation_runs`, `notification_events`, and `notifications`.
- Require idempotency, eligibility checks, audit history, tenant scope, and human-readable reasons.
- Customer-facing sends, workflow mutations, scheduling changes, financial actions, and permission changes remain out of scope until separately approved.

## Open Decisions

- Whether any future cue should expose company-scoped resolve, and which owner/admin controls would be required.
- Whether company-scoped handling should use the existing `scope = 'company'` shape or wait for a dedicated event trail before exposing resolve in the UI.
- Whether cue-linked work-item status should only annotate the cue or also suppress repeated prompting while the linked item remains open.
- Whether later cue fingerprints need per-cue material-state refinements beyond the current deterministic identity helpers.
- Whether lead/opportunity follow-up should join the `organization_operational_cue_rules` family or remain a separate opportunity follow-up read model for now.
- Whether cue-to-work-item conversion should be available from dashboard `My Work`, record-level panels, or only record workspaces at first.
- How AI draft review should integrate with communication consent, portal permissions, and activation guard checks before any provider-backed send.

## Planning Boundary

This document is a boundary and implementation checkpoint around the deterministic cue foundation, user-confirmed cue-to-work-item prefill bridge, and user-scoped persisted cue-state response layer. It does not create `workflow_cues`, persisted cue instances as business truth, AI calls, provider integrations, autonomous actions, auto-created work items, dashboard mutation controls, broad resolve workflows, or customer-visible automation.
