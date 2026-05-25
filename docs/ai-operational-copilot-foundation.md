# AI Operational Copilot Foundation

Status: Foundation
Doc Type: Architecture

This document defines the first implemented AI Operational Copilot foundation in
FloorConnector. It is an operational intelligence layer over canonical records,
not a chatbot, autonomous workflow engine, provider integration, or separate AI
data model.

Implemented source code:

- [apps/web/lib/ai-operational-copilot/summary.ts](C:/FloorConnector/apps/web/lib/ai-operational-copilot/summary.ts):
  deterministic project summary, next-action, digest, communication-assistance,
  and field-summary derivation helpers
- [apps/web/app/(app)/projects/[projectId]/page.tsx](<C:/FloorConnector/apps/web/app/(app)/projects/[projectId]/page.tsx>):
  Project Workspace read-only AI Operational Copilot panel
- [apps/web/lib/ai-operational-copilot/dashboard-digest.ts](C:/FloorConnector/apps/web/lib/ai-operational-copilot/dashboard-digest.ts):
  deterministic dashboard/company-level Copilot digest derivation
- [apps/web/components/dashboard/contractor-dashboard-surface.tsx](C:/FloorConnector/apps/web/components/dashboard/contractor-dashboard-surface.tsx):
  dashboard AI Operational Digest panel
- [apps/web/lib/ai-operational-copilot/provider.ts](C:/FloorConnector/apps/web/lib/ai-operational-copilot/provider.ts):
  provider-ready facade with no-provider deterministic fallback
- [apps/web/lib/workflow-guidance/preferences.ts](C:/FloorConnector/apps/web/lib/workflow-guidance/preferences.ts):
  organization-level workflow and AI assistance controls
- [apps/web/lib/financials/collections-follow-up-intelligence.ts](C:/FloorConnector/apps/web/lib/financials/collections-follow-up-intelligence.ts):
  deterministic collections follow-up intelligence and review-first payment
  draft handoff helpers over canonical invoice/payment evidence

## Purpose

The foundation lets contractor admins and PMs understand project execution
health quickly:

- current project stage
- readiness state
- financial state
- scheduling state
- execution state
- blockers and missing items
- operational concerns
- recommended next actions
- draft assistance for customer and PM communication
- field summaries and risk indicators

The first implementation is deterministic, governed, and provider-ready. It
derives from existing source-record summaries and can later feed
provider-backed drafting or model summarization behind the same review-first
boundary. Organization workflow settings can reduce or disable Copilot
summaries, draft actions, dashboard digest surfaces, and future provider-backed
enhancement without breaking the underlying canonical workflow.

## Intelligence Hierarchy

The intended hierarchy is:

`canonical records -> deterministic workflow/readiness signals -> intelligence derivation layer -> Copilot summaries/recommendations -> review-first operational draft actions -> dashboard operational digest -> future provider-backed enhancement -> future orchestration/automation later`

This hierarchy keeps Copilot aligned with the broader Intelligence,
Communications, Reporting, and Automation Layer doctrine:

- canonical records remain the source of truth
- deterministic workflow and readiness signals detect state before AI
- the intelligence derivation layer explains current state from source records
- Copilot is the user-facing synthesis and action-composer layer
- draft actions are review-first and do not mutate records
- future orchestration can only sit above these layers after approval,
  governance, audit, and provider boundaries are implemented

## Governance And Provider Boundary

The Copilot foundation now has an internal provider abstraction in
`getAiProviderAvailability(...)` and `requestAiProviderEnhancement(...)`. Today
that facade has no live provider integration and always keeps deterministic
output as the production path. If an organization enables provider-backed
enhancement before an approved provider exists, the facade reports
`deterministic_fallback` and returns the canonical context summary unchanged.

Organization controls live inside the existing workflow guidance preferences
JSON, avoiding a new AI settings table or schema migration. The active controls
are:

- AI suggestions
- AI summaries
- AI drafting
- AI dashboard digest
- provider-backed AI enhancements
- AI form prefill suggestions
- AI work-item recommendations
- required confirmation before AI actions

Manual workflow mode suppresses Copilot surfaces even if AI preferences are
stored. Provider-backed output remains optional, tenant-scoped, review-first,
and unable to mutate records.

## Canonical Boundary

The Copilot must preserve the shared lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Rules:

- no duplicate business models
- no AI-only projects, customers, jobs, invoices, payments, messages, tasks, or
  memories
- no autonomous project, financial, legal, signature, payment, scheduling,
  permission, or customer-facing mutation
- no detached chatbot memory system
- no portal-specific AI copies
- no provider-owned operational truth

All output is derived, assistive, observable, dismissible by user behavior, and
review-first. It is never canonical truth by itself.

## Implemented Inputs

The first Project Workspace panel derives from existing canonical read models:

- ProjectPulse for project health, stage, signals, blockers, and next move
- Ready Check / project financial readiness for readiness and commercial gates
- FieldTrail for daily logs, field notes, attachments, time context, and field
  next move
- MessageCenter for communication, delivery, signature, and payment attention
- CloseoutTrail for closeout readiness and evidence concerns

The layer does not add schema or migrations. Tenant safety remains inherited
from the existing server-side data loaders and RLS-backed source records.

## Implemented Outputs

### AI Project Summary

`deriveAiProjectOperationalSummary(...)` returns:

- executive project summary
- readiness, financial, schedule, and execution states
- blockers
- missing items
- operational concerns
- highlights
- grounded source families
- recommended next actions
- review boundary copy

### AI Next-Best-Action Layer

The initial next-action layer is deterministic. It prioritizes:

- readiness blockers
- signature follow-through
- payment or collection review
- CrewBoard scheduling handoff
- FieldTrail blockers
- communication attention
- fallback project review

The output routes users back to canonical workspaces. It does not perform the
action.

### AI Operational Digest Foundation

`deriveAiOperationalDigest(...)` groups project summaries into:

- urgent projects
- stalled workflows
- overdue financial items
- readiness bottlenecks
- scheduling concerns
- execution gaps
- collection risks

The digest helper is ready for dashboard integration, but the first UI slice is
Project Workspace only so the operational intelligence remains anchored to the
project hub before becoming a broader dashboard surface.

`deriveAiOperationalDashboardDigest(...)` now adds the first dashboard/company
rollup. It accepts bounded dashboard Copilot signals derived from existing
project cues, Ready Check handoffs, contracts, invoices, jobs, equipment
readiness, and operational cockpit previews. It returns:

- headline summary
- attention count
- urgent items
- recommended actions
- stalled workflows
- financial follow-ups
- signature/approval follow-ups
- scheduling readiness items
- field/execution review items
- suggested draft action indicators
- source signals
- derived timestamp
- compact digest sections for the dashboard

The dashboard digest is still deterministic and read-only. It is also gated by
the organization AI dashboard digest preference. It does not create
dashboard-owned workflow records, persist AI records, send messages, create
tasks, mutate canonical records, or call a provider model.

### AI Communication Assistance Foundation

`deriveAiCommunicationAssistance(...)` creates review-first draft text for:

- follow-ups
- invoice reminders when financial state indicates payment attention
- scheduling coordination when ready work needs CrewBoard handoff
- customer status updates
- internal project summaries

Drafts are not sent automatically and are not stored as communication truth.
The implemented communications handoff can move a selected draft into the
existing contractor-side `/communications` review surface. If a canonical thread
is already selected, the thread composer is prefilled for explicit user review
and submission as an internal message. If no thread exists, the handoff remains a
copy/review surface and does not create one automatically. Future provider-backed
assistance must route through the Communications Layer and existing
notification/delivery evidence patterns.

### Collections Follow-Up Intelligence

`buildCollectionsFollowUpIntelligence(...)` adds the first AR-specific Copilot
draft source outside Project Workspace. It derives deterministic follow-up items
from existing invoices, payments, and Payment Trail events, grouping overdue
invoices, unpaid deposits, sent-unpaid balances, partially paid balances,
payment-in-progress states, failed/voided attempts, and internal-review cases.
Each item keeps invoice, project, customer, amount due, payment state, reason,
recommended next step, source signals, and optional review-first draft action
context. The Accounts Receivable UI only exposes "Use draft" when AI drafting
controls allow it, and the draft still routes through the existing
communications handoff. This does not send reminders, create communication
threads, create notification events, call providers, mutate invoice/payment
state, or add a duplicate collections model.

### Copilot Action Composer

`deriveAiCopilotDraftActions(...)` turns Copilot project intelligence into
structured review-first draft actions. The composer currently supports:

- customer follow-up drafts
- contract/signature reminder drafts
- deposit/payment reminder drafts
- payment reminder, payment failed follow-up, partial-balance follow-up, and
  internal collections review drafts from AR follow-up intelligence
- scheduling readiness coordination drafts
- field progress update drafts
- internal PM/project summary drafts
- stalled-project follow-up drafts
- blocker/escalation summary drafts

Each draft action includes:

- action type
- audience
- title and subject
- draft body
- operational reason
- source workflow signals
- priority
- review safety note

These are deterministic template-based drafts and are gated by the organization
AI drafting preference. Each visible draft has a "Use draft" handoff into
`/communications` that preserves action type, audience, subject/body,
project/customer context, operational reason, and source workflow signals. The
handoff does not send messages, create new threads, create work items, approve
contracts, collect payments, schedule jobs, change readiness, or persist AI
output. The contractor must review, edit, and submit or copy any draft manually
through the appropriate existing workflow.

### AI Field Summary Foundation

`deriveAiFieldSummary(...)` creates:

- PM-facing field summary
- customer-ready update text
- risk indicators
- next field move

It derives from Daily Logs, Field Notes, field evidence, and time context
through FieldTrail.

## UI Integration

The first Project Workspace panel appears after ProjectPulse. That placement is
intentional:

- ProjectPulse remains the compact deterministic project health lens.
- Project Command Timeline now sits beside the same Project Workspace stack as
  a deterministic lifecycle rail over canonical records and existing read
  models. It is not AI output and does not replace Copilot; it gives users a
  source-record timeline before or after they read the Copilot synthesis.
- AI Operational Copilot synthesizes ProjectPulse plus readiness, finance,
  schedule, communications, closeout, and field context.
- Copilot Action Composer shows applicable review-first draft actions inside
  the same Project Workspace panel when AI drafting is enabled.
- "Use draft" opens `/communications` with review-only draft context and
  prefilled existing-thread composer state when a canonical thread is available.
- Existing Workflow Snapshot, cue panels, work items, Ready to Schedule, and
  source-record sections remain the action surfaces.

## Future Slices

Safe next implementation slices:

1. Work-item prefill from Copilot recommended actions.
2. Deeper communications composer support once customer-facing send/reply
   behavior is explicitly scoped.
3. Field mobile summary cards for active jobs.
4. Live provider-backed summarization/drafting through the existing provider
   facade, with prompt inputs limited to tenant-scoped canonical context and no
   provider-owned source truth.

Blocked until separate approval:

- live model/provider calls
- persisted AI output records
- AI-generated outbound messages
- autonomous scheduling, payment, contract, signature, invoice, permission, or
  customer-facing actions
- predictive risk scoring
- cross-tenant benchmarking

## Verification Boundary

The first foundation is covered by focused pure tests in
[apps/web/lib/ai-operational-copilot/summary.test.ts](C:/FloorConnector/apps/web/lib/ai-operational-copilot/summary.test.ts).

No environment variables are required.
No schema changes or migrations are required.
