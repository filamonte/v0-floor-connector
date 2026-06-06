# Chat Handoff

Status: Active
Doc Type: Operational

This is a compact handoff for future Codex sessions. It is not a competing
source of truth. Use it to orient quickly, then verify implementation truth in
`docs/current-state.md`.

Use [docs/feature-build-status.md](C:/FloorConnector/docs/feature-build-status.md)
as an important planning reference when a task needs investor/demo/dev-friendly
feature inventory, status categories, or built-versus-planned boundaries.

Use [docs/floorconnector-build-list-and-completion-timeline.md](C:/FloorConnector/docs/floorconnector-build-list-and-completion-timeline.md)
when a task needs the founder/product-owner build list, realistic completion
horizons, next build order, or Core Complete definition. It is planning
guidance over current truth, not a replacement for `docs/current-state.md`.

Use [docs/ai-native-development-architecture.md](C:/FloorConnector/docs/ai-native-development-architecture.md)
when a task involves parallel agents, worktrees, stream ownership, capability
waves, hotspot governance, merge sequencing, or QA/verification coordination.

Use [docs/guided-project-capture-vision.md](C:/FloorConnector/docs/guided-project-capture-vision.md)
when a task mentions Guided Project Capture, Assessment Packages, project area
capture, customer self-service estimate inputs, capture confidence, or future
AI-assisted estimating inputs. It is target direction only.

Use [docs/parallel-development-governance.md](C:/FloorConnector/docs/parallel-development-governance.md)
when a task proposes, approves, activates, verifies, merges, or retires a
stream. It defines the permanent stream lifecycle, stream creation rule,
Architecture Coordination responsibilities, Product Director function,
Verification responsibilities, and AI-native operating loop.

Use [docs/operational-architecture-v1.md](C:/FloorConnector/docs/operational-architecture-v1.md)
when a task needs the permanent Operational Command Center principle, product
operating layers, planning functions, and source-record continuity rules that
future waves must preserve.

Use [docs/automation-tooling-baseline.md](C:/FloorConnector/docs/automation-tooling-baseline.md)
before launching or validating governed waves. Start with
`pnpm.cmd worktree:doctor`, repair shared worktree tool links with
`pnpm.cmd devtools:link` when needed, and prefer repo-local validation commands
over global PATH tools.

Use [docs/agent-startup-checklist.md](C:/FloorConnector/docs/agent-startup-checklist.md)
before any agent changes files. Use
[docs/autonomous-run-governance.md](C:/FloorConnector/docs/autonomous-run-governance.md)
for safe autonomous work versus human-approval boundaries. Use
[docs/ai-diagnostics.md](C:/FloorConnector/docs/ai-diagnostics.md) when an
agent appears to be in the wrong repository, branch, worktree, stale origin, or
blocked validation state.

Current automation readiness is Ready With Human Review Gate. Future waves must
follow the loop Jeff Review -> Product Director Recommendation -> Architecture
Coordination Approval -> Wave Proposal -> Stream Creation -> Parallel Feature
Work -> Verification -> Integration Review Packet -> Jeff Approval -> Continue.
Agents may prepare scoped work and review packets, but may not auto-merge,
auto-continue, or bypass Jeff approval.

Current wave gate note: `operational-command-center-v1` has merged to `main`
under Jeff's controlled merge approval. Project Workspace V2 merged as
`c809186c`, Field Command Center V1 was already on `main` as `6df16ed1`,
Communications Continuity V2 merged as `890bfbad`, Financial Command Center V1
merged as `5844f52e`, and Verification V2 merged as `f7caf1db`. After explicit
cleanup approval, the five completed wave worktrees and local branches were
retired; the remote `stream/field-command-center-v1` branch was also deleted.
The dirty out-of-scope `C:\FC-worktrees\project-next-actions` worktree was
preserved untouched. The next wave is not approved from this handoff; agents may
not auto-continue without Jeff approval.

Next-wave planning note: as of 2026-06-05,
[docs/review-packets/next-wave-recommendation.md](C:/FloorConnector/docs/review-packets/next-wave-recommendation.md)
recommends `sales-to-production-readiness-v1` as the next highest-leverage
operational wave. It is recommendation-only and still requires Jeff approval
before stream creation, worktree creation, implementation, schema/migration
work, provider/customer-facing actions, or continuation.

Approval update: Jeff has approved `sales-to-production-readiness-v1` for
stream/worktree creation only. The approved streams are
`sales-readiness-command-v1`, `estimate-contract-readiness-v1`,
`schedule-readiness-handoff-v1`, and
`verification-sales-to-production-v1`. Wave status is Approved / Not Started:
agents may not begin implementation, edit schema/migrations, open PRs, merge,
or continue to another wave until a later explicit start command and human
review gate.

## Required First Reads

Read these before implementation or documentation work:

- [AGENTS.md](C:/FloorConnector/AGENTS.md)
- [docs/agent-governance.md](C:/FloorConnector/docs/agent-governance.md)
- [docs/agent-startup-checklist.md](C:/FloorConnector/docs/agent-startup-checklist.md)
- [docs/autonomous-run-governance.md](C:/FloorConnector/docs/autonomous-run-governance.md)
- [docs/ai-diagnostics.md](C:/FloorConnector/docs/ai-diagnostics.md)
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/parallel-development-governance.md](C:/FloorConnector/docs/parallel-development-governance.md)
- [docs/operational-architecture-v1.md](C:/FloorConnector/docs/operational-architecture-v1.md)
- [docs/automation-tooling-baseline.md](C:/FloorConnector/docs/automation-tooling-baseline.md)
- [docs/ai-native-development-architecture.md](C:/FloorConnector/docs/ai-native-development-architecture.md)
- [docs/feature-build-status.md](C:/FloorConnector/docs/feature-build-status.md)
- [docs/floorconnector-build-list-and-completion-timeline.md](C:/FloorConnector/docs/floorconnector-build-list-and-completion-timeline.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
- [docs/product-language.md](C:/FloorConnector/docs/product-language.md)
- [docs/README.md](C:/FloorConnector/docs/README.md)
- [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)

## Current Operating Core Snapshot

FloorConnector is a production-first SaaS operating system for specialty
flooring contractors. The canonical lifecycle remains:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

The current branch has real Supabase-backed auth, tenancy, opportunities,
customers, projects, estimates, contracts, change orders, jobs, invoices,
payments, portal access, workforce/time/field foundations, settings,
super-admin foundations, and normalized contractor UI patterns.

Current operating-core surfaces include:

- Command Center dashboard with source-record attention groups and deterministic
  next moves.
- Project Workspace as the main continuity hub with ProjectPulse, FieldTrail,
  MessageCenter, CloseoutTrail, Proof Center, Project Command Timeline, Send
  Trail context, service/warranty continuity, customer access, and closeout
  package handoff.
- Project Command Timeline derives a compact needs-attention / ready-to-move /
  recent-movement rail from existing canonical project, opportunity, estimate,
  contract/signature, invoice/payment, job/schedule, Daily Log, field blocker,
  proof readiness, MessageCenter, and portal visibility signals. It is
  read-only presentation, not an activity source of truth or action executor.
- Project Workspace command-center polish adds a compact status/timeline/
  Copilot/action-lane map near the top and places Project Command Timeline
  before Copilot so the page reads as current status, what happened, what it
  means, and where to act. This is UI hierarchy over existing read models only.
- Project Workspace Maturity v1 further tightens `/projects/[projectId]` as the
  operational hub: the command summary names the current lifecycle position, a
  Readiness + Blockers panel links blockers back to canonical source records,
  and connected lanes split invoices, payments, field/Daily Logs, and
  time/labor while staying read-only over existing project, readiness, payment,
  job, Daily Log, field-note, and time-card records.
- Project Workspace Maturity v2 adds a shared
  `apps/web/lib/projects/operational-workspace.ts` read model and a project
  Operational Intelligence section. It derives one attention/continuity view
  over canonical readiness, invoices/payments, retainage, progress billing,
  CrewBoard jobs/assignments, Daily Logs, field blockers, change orders, and
  Project Command Timeline signals. It adds no schema, migrations, duplicate
  project-financial model, duplicate schedule model, field subsystem, portal
  copy, fake records, provider calls, autonomous actions, or source-record
  mutation.
- Project Evidence / Documents / Closeout Continuity v1 adds
  `apps/web/lib/projects/evidence-continuity.ts` and a Project Evidence section
  in `/projects/[projectId]`. It derives active evidence, archived evidence
  metadata, Daily Logs, Job Notes, customer-safe commercial documents,
  internal-only field proof, warranty/service handoff, office-review items, and
  a lightweight proof trail from existing records only. Field evidence remains
  contractor-only; portal/customer visibility remains limited to existing
  customer-safe records with explicit project access. It adds no schema,
  migrations, duplicate document/file/attachment model, storage policy change,
  destructive storage delete, portal-only copy, fake file, provider call, or
  source-record mutation.
- AI Operational Copilot Foundation in Project Workspace, deriving review-first
  project intelligence, recommended next actions, draft-assistance text, and
  field summaries from ProjectPulse, Ready Check, FieldTrail, MessageCenter,
  and CloseoutTrail. The Copilot Action Composer now adds structured
  review-first operational draft actions for customer follow-up, signature,
  payment, scheduling, field progress, PM summary, stalled-workflow, and blocker
  escalation contexts; drafts are deterministic, manual-use only, and never
  sent or persisted as AI truth. See
  [docs/ai-operational-copilot-foundation.md](C:/FloorConnector/docs/ai-operational-copilot-foundation.md).
- Dashboard AI Operational Digest now rolls existing dashboard/project signals
  into compact company-level attention, ready-to-move, financial, field, and
  suggested-draft sections. It links back to canonical workspaces and does not
  create tasks, send messages, persist AI output, call provider AI, or mutate
  source records.
- AI provider abstraction and organization controls are in place. Workflow
  settings can suppress Copilot summaries, draft actions, dashboard digest
  visibility, and future provider-backed enhancement; the current provider
  facade has no live model integration and falls back to deterministic
  canonical-context output.
- Copilot draft actions now have a review-first `/communications` handoff.
  Project Workspace "Use draft" links preserve the draft action metadata,
  project/customer context, reason, and source signals. Existing canonical
  communication threads can be prefilled for explicit internal-message save;
  missing threads remain copy/review only. No customer email/SMS, provider call,
  notification creation, thread auto-create, AI-only communication record, or
  autonomous workflow is introduced.
- Customer Communication Send Readiness now appears on Copilot handoffs inside
  `/communications`. It derives intended audience, related canonical record,
  readiness status, missing requirements, safe subject/framing suggestions, and
  document-readiness blockers when supplied. It is review/preparation copy only:
  no provider send, notification, thread creation, delivery event, portal-only
  message, or autonomous action is introduced.
- Communications v1 now makes `/communications` a record-linked communication
  workspace rather than only a thread queue. The shared
  `apps/web/lib/communications/workspace-summary.ts` read model derives
  customer, project, commercial, finance, closeout/evidence, and internal
  lanes from canonical threads plus existing document-delivery and portal
  evidence proof events. The workspace shows follow-up signals, customer-visible
  versus internal counts, delivery/evidence context, and source-record handoffs
  without schema changes, provider sends, portal chat expansion, automation,
  fake messages, or message copies. Communications v1 write path now lets
  contractor users deliberately save internal notes or customer-visible
  portal-history messages from `/communications`, Project MessageCenter, and
  Customer Workspace. These writes create or reuse canonical
  `communication_threads` and append immutable `communication_messages`; they do
  not email, text, create delivery proof, create provider attempts, or expose
  internal notes to the portal. Portal-Safe Replies v1 now adds a bounded portal
  Project Workspace reply path for existing customer-visible project threads:
  portal customers can post customer-visible inbound replies when active portal
  grant and project visibility checks pass, and those replies appear through
  the same canonical contractor communications and Project MessageCenter read
  models. It still does not add a generic portal inbox, provider sends,
  notification/delivery events, automation, or internal-note exposure. Related
  conversation cards and Project MessageCenter now surface clearer
  internal/customer-visible counts while deeper review still stays inside
  `/communications`. Communication Reply Triage v1 now derives contractor-side
  needs-response state for portal customer replies from canonical
  `communication_messages` and `communication_threads`: a customer-visible
  inbound portal reply after the latest contractor customer-visible response is
  shown in `/communications` and Project MessageCenter as waiting for
  contractor follow-up. Internal notes do not clear this derived state, and
  existing per-user notification read-state remains separate. No schema,
  notification events, provider sends, reminders, automation, portal triage
  exposure, or message-history mutation were added.
- Collections Follow-Up Intelligence now deepens `/financials/accounts-receivable`
  with deterministic categories over canonical invoices, payments, and Payment
  Trail events: overdue invoices, unpaid deposits, sent-unpaid balances,
  partially paid balances, payment-in-progress states, failed/voided attempts,
  and internal-review cases. The AR workspace shows source-record reasons,
  payment state, amount due, canonical links, and review-first Copilot draft
  handoffs when AI drafting controls allow them. It does not send reminders,
  create threads, create notification events, call providers, or mutate invoice
  or payment state.
- Accounts Receivable now adds a read-only Collections Command Center layer on
  top of the same canonical records. `/financials/accounts-receivable` shows
  command-center cards, a scored "needs attention first" queue, customer
  exposure rollups, stale pending-payment attention, recent recorded-payment
  continuity, and deeper Payment Trail continuity while still avoiding ledgers,
  customer-financial models, collection-task tables, retries, provider sync,
  reminders, accounting workflows, and financial mutation.
- Product Stack Audit after the AI, scheduling, communications, and collections
  slices is documented in
  [docs/operational-intelligence-stack-audit.md](C:/FloorConnector/docs/operational-intelligence-stack-audit.md).
  The audit found no P0 defects or duplicate intelligence/scheduling/
  communications/AR models. It records P1 demo-readiness polish around
  intentional AI control setup, AR mobile containment, Copilot draft visibility,
  and communications handoff affordance clarity.
- Demo readiness controls are intentionally set for the contractor E2E owner
  organization (`jfilamonte`, active): workflow mode is Guided,
  deterministic AI suggestions, summaries, drafting, and dashboard digest are
  enabled, and provider-backed AI, form prefill, and work-item recommendation
  controls remain disabled. The local smoke confirmed dashboard digest,
  Project Workspace Copilot draft actions, AR draft actions, and workflow
  settings visibility without provider calls or autonomous actions.
- Operational intelligence demo readiness is documented in
  [docs/operational-intelligence-demo-readiness.md](C:/FloorConnector/docs/operational-intelligence-demo-readiness.md).
  Use it as the concise route-by-route checklist for showing Dashboard
  Operational Digest, Project Workspace Copilot, CrewBoard, Accounts Receivable
  collections intelligence, Communications handoff, Daily Log continuity,
  portal-safe status explanations, and workflow/AI controls without claiming
  autonomous AI, provider-backed AI, automatic sends, automatic scheduling,
  automatic collections, or customer-facing internal operations language.
- CrewBoard on `/schedule` over canonical jobs, appointments, job assignments,
  people, vendors, projects, and customers, with daily/weekly operating lanes,
  readiness-aware ready-vs-blocked unscheduled queues, blocked/overdue
  scheduling metrics, commercial-readiness blocker links back to canonical
  estimate/contract/deposit/opportunity/project records, clearer crew/readiness
  badges, Daily Job Log continuity, and canonical project/job handoffs.
- Context-rich Work Item assignment planning is documented in
  [docs/design/context-rich-work-items-and-assignments.md](C:/FloorConnector/docs/design/context-rich-work-items-and-assignments.md).
  The canonical concept is Work Items, extending the existing internal
  `work_items` foundation rather than creating a disconnected task module.
  Context-Rich Work Items v1 now reuses existing fields with no migration:
  `description` carries instructions/job notes, `metadata.measurementNotes`
  carries measurement context, shared work-item lists show that context with
  due/overdue, priority, assignee, linked project/customer labels, and real
  evidence counts, and Job Workspace can create/list `source_type = job` work
  items. Work Item Photo / Evidence Attachment Support now extends
  `execution_attachments.subject_type` with `work_item`, validates same-company
  project/job ownership, stores files in the private `documents` bucket under
  project work-item evidence paths, and shows contractor-only signed previews
  plus upload controls in Project and Job work-item panels. Work Item evidence
  remains internal-only and is explicitly not eligible for current portal
  evidence grants. Mobile Assignee Work Item View v1 now adds
  `/field/work-items` and `/field/work-items/[workItemId]`: the list uses the
  current user's linked active assignable `people.membership_user_id` record,
  groups assigned Work Items by blocked, overdue, today, upcoming, and recently
  completed, and the detail shows instructions, measurement notes, source
  context, due/priority/status, and internal evidence previews through the
  existing signed URL path. Field actions are schema-free in V1:
  `metadata.fieldState` tracks in progress/blocked while open, completion uses
  the existing completed status/timestamps and optional
  `metadata.completionNote`, and server validation limits mutation to the
  linked assignee or owner/admin/manager. The field view does not upload
  evidence, create comments, send notifications, expose portal data, or mutate
  jobs/Daily Logs/Job Notes/source records. Structured measurement tables,
  comments, richer field statuses, vendor/team assignment, assignee-side
  uploads, reminders, and portal-safe sharing remain future-only.
- Lead Workspace estimating handoff now has a direct "Assign Estimate Writer"
  path. It creates the existing opportunity-linked estimate Work Item with an
  assignee/due/note or reassigns the existing open handoff Work Item; it does
  not add an opportunity estimate-writer column, create an estimate, mutate
  estimate status, create notifications, or change commission/payroll behavior.
- Future Universal Capture + Assistant Action Layer planning is now locked into
  the roadmap/workflow docs as planned capability only. The idea is to capture
  callbacks, reminders, follow-ups, site-visit intent, estimate scheduling
  needs, and route/geographic grouping intent from anywhere, then resolve that
  intent into canonical customers, opportunities, projects, jobs, Work Items,
  communications, appointments, or schedule handoffs where possible. It is not
  implemented and must not become a disconnected task app, duplicate CRM/project
  model, AI-only scheduler, or autonomous customer-facing booking/sending layer.
  Manual V1 model design is documented in
  [docs/design/universal-capture-model-design.md](C:/FloorConnector/docs/design/universal-capture-model-design.md):
  Universal Capture is the entry/resolution pattern above canonical records,
  Work Items are one possible destination, and a narrow `capture_items` table
  should only be added later if unresolved or route-grouping intent cannot be
  handled cleanly by existing records. The planned UX behavior is documented in
  [docs/design/universal-capture-ui-blueprint.md](C:/FloorConnector/docs/design/universal-capture-ui-blueprint.md):
  a compact context-aware capture sheet from shell/dashboard/record workspaces,
  optional route/geographic intent, dashboard queue visibility, Work Item
  resolution rules, mobile quick-capture direction, and assistant-prepared
  actions that remain contractor-reviewed before any external send, booking, or
  workflow mutation.
  Implementation readiness is documented in
  [docs/design/universal-capture-implementation-readiness.md](C:/FloorConnector/docs/design/universal-capture-implementation-readiness.md):
  the first safe manual slice should use Work Items for clear internal actions
  and existing Quick-Create/workspace handoffs for canonical destinations.
  Defer a `capture_items` table, route/geographic grouping persistence,
  assistant action staging, notifications, mobile capture, and portal-safe
  sharing until real usage proves those needs.
- Portal Customer Window with deterministic portal-safe customer status
  explanations, Customer Next Step, Project Status Window, Project Timeline,
  Shared Documents, and existing portal review/print routes. The explanation
  layer uses canonical project, commercial, payment, and scoped schedule state
  only; it does not expose contractor Copilot, AR, blockers, field notes,
  readiness internals, or portal-only workflow copies.
- Portal Customer Hub Polish v2 adds clearer customer-facing project cards on
  `/portal`, a Customer Action Hub on the portal Project Workspace, calmer
  estimate/contract/invoice action cues, safer payment-activity wording, and
  mobile wrapping polish. The May 25, 2026 smoke loaded `/portal`, a portal
  project, portal estimate, portal contract, portal invoice, and 390px
  home/project views with saved portal auth and no page errors or horizontal
  overflow; local Next dev navigation still logged route-chunk 404/abort noise
  during transitions while the pages rendered successfully.
- Customer-Safe Closeout Package + Portal Handoff v1 adds
  apps/web/lib/portal/closeout-handoff.ts and a Closeout Handoff section to
  the portal Project Workspace. It derives customer-safe closeout status, next
  customer action, document package rows, contract/change-order/payment/warranty
  progress, payment status, warranty handoff status, and internal-evidence
  boundary copy from existing portal-scoped canonical records. It does not
  expose contractor-only field evidence, FieldTrail, Proof Center, Daily Job
  Log details, Job Notes, execution attachments, provider diagnostics, service
  ticket internals, stored PDFs, portal-only records, schema, provider calls,
  payment/signature mutation, automation, or AI behavior.
- Explicit Shared File Visibility + Portal Evidence Grants v1 adds
  `portal_evidence_grants` plus
  `apps/web/lib/portal-evidence-grants/*` as the first explicit sharing policy
  layer for selected project evidence. The supported subject type is
  `execution_attachment`; evidence remains internal by default, archived
  evidence cannot be newly shared, owner/admin/manager users can share or revoke
  eligible active evidence from Project Workspace, and Portal Project Workspace
  shows only active explicitly shared evidence for projects already visible via
  `portal_project_access`. Portal file access uses server-resolved short-lived
  signed URLs without raw storage paths and does not expose FieldTrail, Proof
  Center, Daily Log/Job Note internals, unshared evidence counts/details,
  portal-only file copies, provider behavior, AI, or automation.
- Shared Evidence Delivery Proof + Customer Acknowledgement v1 adds
  `portal_evidence_delivery_events` as an append-only evidence-grant proof
  table. It is scoped to explicit `execution_attachment` portal evidence grants
  and records shared, viewed, downloaded, acknowledged, and revoked proof events
  without mutating source attachments or creating portal file copies. The server
  utilities now record shared/revoked events from contractor share/revoke
  actions, record a one-time portal viewed event when active shared evidence is
  loaded for a scoped portal project, record downloaded events only when the
  safe signed URL route successfully issues a short-lived URL, and record
  idempotent portal customer acknowledgement events. Contractor Project
  Workspace summarizes proof counts/timestamps; portal shared evidence shows
  status and an acknowledgement action with non-signature/non-scope-changing
  copy. The migration has been applied and verified against the intended
  Supabase project.
- Shared Evidence Receipt Rollups + Customer Record Export v1 adds
  `apps/web/lib/portal-evidence-grants/receipt-rollup.ts` as a no-schema
  read-model over explicit evidence grants and append-only delivery events. It
  derives project-level receipt status, active shared evidence count,
  viewed/downloaded/acknowledged/revoked counts, outstanding acknowledgement
  count, last customer interaction, contractor proof rows, and customer-safe
  rows. Contractor Project Workspace now shows a customer receipt history
  summary and links to `/projects/:id/evidence/receipt`; the portal Project
  Workspace and Closeout Handoff show customer-safe receipt status and link to
  `/portal/projects/:id/evidence/receipt`. The routes are browser print/save
  renderings only: no stored PDFs, file copies, portal-only records, schema,
  provider calls, legal certification, or source attachment mutation.
- Full Operating Loop Demo Smoke on May 25, 2026 passed on a fresh local Next
  dev server with saved contractor and portal auth. The route loop loaded
  `/dashboard`, `/projects`, a Project Workspace with command/timeline signals,
  `/schedule`, `/financials/accounts-receivable`, a Copilot/collections
  handoff into `/communications`, `/daily-logs`, one Daily Log detail, one
  invoice document review path, `/settings/workflows`, `/portal`, one portal
  project, portal estimate/contract/invoice review routes, and 390px portal
  home/project views. No app code changed. No page errors, bad responses, or
  horizontal overflow were observed on the fresh-server pass. A stale preexisting
  dev server on port 3000 had shown missing Next route chunks for
  `/settings/workflows`; restarting on port 3002 cleared that artifact.
- Docs cleanup on May 25, 2026 named the required active docs set in
  [docs/README.md](C:/FloorConnector/docs/README.md), kept current truth anchored
  to [docs/current-state.md](C:/FloorConnector/docs/current-state.md), removed
  redundant archive pointer files, and deleted one closed local agent scratch
  plan that was not product, architecture, QA, setup, governance, or
  repo-operation guidance.
- Reports, Financial Control, Accounting Readiness, and Accounting Export Prep
  as read-only review/export-prep surfaces over source financial and
  operational records.
- Financials Home now reads more like a contractor finance command center
  without adding finance state. The shared Financial Control read model powers
  command signals for overdue AR, unpaid deposits, Payment Trail attention,
  retained amounts, and open SOV/progress-billing balances, with links back to
  canonical Invoice, Payments, Progress Billing, AR, and Accounting Readiness
  workspaces. It derives only from canonical invoices, payments, and immutable
  payment events; it does not create ledgers, collection tasks, payment retries,
  provider sync, retainage-release workflows, pay applications, or duplicate
  finance records.
- Document Engine print/save routes for source-record exports, including the
  contractor-side project closeout package route.
- Estimate, Contract, and Invoice Workspaces now show a contractor-side
  Document Readiness summary before send/delivery review. It is deterministic
  and source-record-derived, covering preview/readiness labels, template or
  rendering availability, customer/project context, signature/payment state
  where relevant, missing fields, and the safe next action. It does not add
  stored PDFs, document records, portal-only copies, provider calls, autonomous
  sends, payment/signature mutations, schema, migrations, or customer-facing
  internal readiness language.
- Post-commit Document Readiness smoke after `3b0a1541` passed focused
  readiness and print-engine tests, web typecheck/lint, targeted Prettier,
  whitespace checks, invoice contractor print/PDF smoke, and portal estimate,
  contract, invoice review/print/mobile smoke. The active contractor fixture
  did not expose estimate or contract detail links, so those contractor-side
  detail/PDF paths remain sample-data gaps rather than verified failures.
- Service Center and warranty document foundations tied to customer, project,
  job, proof, and warranty context.
- Company Documents Phase 1C-A under `/settings/company-documents`, backed by the
  tenant-owned `company_documents` table, with contractor-side read and
  browser print/save routes for company administration documents. A small
  code-defined Starter Documents catalog now lets owner/admin/manager users
  preview and adopt starter examples into editable draft Company Documents;
  view-only members can preview only. Adoption creates a new draft copy from
  server-owned starter content and does not add schema, platform-admin starter
  management, live coupling, distribution, AI, legal advice, e-sign, storage,
  provider sending, public links, or delivery proof.
- Company Documents Starter Adoption QA is documented in
  [docs/design/company-documents-starter-adoption-qa-checkpoint.md](C:/FloorConnector/docs/design/company-documents-starter-adoption-qa-checkpoint.md).
  The checkpoint confirmed code-defined starter safety, server-owned adoption
  data, existing owner/admin/manager manage scope, visible disclaimer copy, and
  protected-route browser visibility with saved local contractor auth. Adoption
  submit was intentionally not exercised to avoid creating a real draft row in
  the configured development data source.
- Company Documents Phase 1 QA checkpoint is documented in
  [docs/design/company-documents-phase-1-qa-checkpoint.md](C:/FloorConnector/docs/design/company-documents-phase-1-qa-checkpoint.md).
  Static QA confirmed the Phase 1A/1B schema, RLS, scoped helpers, routes, and
  Document Engine print boundary; authenticated browser QA still needs a
  known-good local contractor session.
- Company Documents Phase 1C Starter Documents planning is documented in
  [docs/design/company-documents-phase-1c-starter-documents-plan.md](C:/FloorConnector/docs/design/company-documents-phase-1c-starter-documents-plan.md).
  The implemented Phase 1C-A starter adoption checkpoint is documented in
  [docs/design/company-documents-phase-1c-a-starter-adoption.md](C:/FloorConnector/docs/design/company-documents-phase-1c-a-starter-adoption.md).
  Later persisted platform starter management should wait until
  provenance/version governance is approved.
- Next-build priority checkpoint is documented in
  [docs/design/next-build-priority-checkpoint.md](C:/FloorConnector/docs/design/next-build-priority-checkpoint.md).
  Recommended order is Company Documents Phase 1C-A Starter Document Adoption,
  Staging Demo Seed Phase 2 owner-approved write-mode design, then Mobile Field
  Phase 2 quick Job Notes/evidence capture. If an external demo is the immediate
  goal, swap the first two.
- Mobile Field Phase 2 is implemented in
  [docs/design/mobile-field-phase-2-quick-job-notes-evidence.md](C:/FloorConnector/docs/design/mobile-field-phase-2-quick-job-notes-evidence.md).
  It adds Job Workspace quick actions for Job Notes, blockers, Daily Job Log
  open/start, and field evidence; Daily Job Log section anchors for Job Notes
  and Field Evidence; and FieldTrail Next Move routing to those anchors. It
  reuses Daily Job Logs, Job Notes, execution attachments, jobs, projects, and
  time context only.
- Mobile Field Phase 2 QA is documented in
  [docs/design/mobile-field-phase-2-qa-checkpoint.md](C:/FloorConnector/docs/design/mobile-field-phase-2-qa-checkpoint.md).
  Static QA confirmed no new field subsystem, duplicate note model, schema,
  upload/storage behavior, portal exposure, or automation. Mobile browser smoke
  loaded `/daily-logs`, `/jobs`, and `/schedule` with saved contractor auth;
  Daily Log and Job detail checks were blocked by Supabase Auth
  `over_request_rate_limit` and should be retried only after auth cooldown.
- Mobile Field Phase 3 evidence upload planning is documented in
  [docs/design/mobile-field-phase-3-evidence-upload-proof-flow.md](C:/FloorConnector/docs/design/mobile-field-phase-3-evidence-upload-proof-flow.md).
  The plan confirms current `execution_attachments` are Daily Log / Job Note
  metadata references, not uploads, and recommends Phase 3A storage readiness
  before adding field evidence file upload, previews, signed URLs, or customer
  sharing.
- Mobile Field Phase 3A storage readiness is documented in
  [docs/design/mobile-field-phase-3a-evidence-storage-readiness.md](C:/FloorConnector/docs/design/mobile-field-phase-3a-evidence-storage-readiness.md).
  The audit recommends reusing the private `documents` bucket with a dedicated
  project/Daily Log field-evidence prefix, server-generated paths, server-side
  upload first, contractor-only signed URL resolution, and no portal/customer
  field evidence exposure.
- Mobile Field Phase 3C evidence upload foundation is documented in
  [docs/design/mobile-field-phase-3c-evidence-upload-foundation.md](C:/FloorConnector/docs/design/mobile-field-phase-3c-evidence-upload-foundation.md).
  Daily Log detail now uploads JPG, PNG, WebP, or PDF field evidence to the
  private `documents` bucket through server-generated organization/project/Daily
  Log paths, then creates the existing `execution_attachments` metadata row.
  This is contractor-only and intentionally does not add previews, signed URL
  downloads, delete/archive, portal/customer exposure, schema, migrations,
  public URLs, AI, notifications, automation, or provider behavior.
- Mobile Field Phase 3C QA is documented in
  [docs/design/mobile-field-phase-3c-qa-checkpoint.md](C:/FloorConnector/docs/design/mobile-field-phase-3c-qa-checkpoint.md).
  The checkpoint confirmed private `documents` bucket upload boundaries,
  server-generated paths, upload-before-metadata sequencing, file validation,
  Daily Log / Job Note parent validation, existing FieldTrail / Proof Center /
  CloseoutTrail metadata integration, and portal exclusion. It also replaced raw
  private storage path display on Daily Log detail with contractor-facing stored
  evidence status text. No real upload was submitted in browser QA.
- Mobile Field Phase 3D preview planning is documented in
  [docs/design/mobile-field-phase-3d-evidence-preview-signed-url-plan.md](C:/FloorConnector/docs/design/mobile-field-phase-3d-evidence-preview-signed-url-plan.md).
  The plan recommends contractor-only signed URL resolution by execution
  attachment id, server-side parent access validation for Daily Log / Job Note
  evidence, one-hour private `documents` bucket URLs matching existing repo
  patterns, read-only image/PDF preview rows on Daily Log detail first, and no
  portal/customer exposure, thumbnails, delete/archive, storage policy changes,
  schema, migrations, or closeout package file embedding.
- Mobile Field Phase 3D-A evidence preview rows are documented in
  [docs/design/mobile-field-phase-3d-a-evidence-preview-rows.md](C:/FloorConnector/docs/design/mobile-field-phase-3d-a-evidence-preview-rows.md).
  Daily Log detail now resolves one-hour signed URLs from the private
  `documents` bucket by execution attachment id after contractor-side Daily Log
  / Job Note parent validation, then shows `Open image`, `Open PDF`, or `Open
file` actions without exposing raw storage paths. This remains contractor-only
  and does not add thumbnails, delete/archive, portal/customer exposure, schema,
  migrations, public URLs, storage policy changes, or closeout package file
  embedding.
- Mobile Field Phase 3D-A QA is documented in
  [docs/design/mobile-field-phase-3d-a-qa-checkpoint.md](C:/FloorConnector/docs/design/mobile-field-phase-3d-a-qa-checkpoint.md).
  Static QA confirmed the server-side one-hour signed URL boundary, attachment
  id based resolution, Daily Log / Job Note parent validation, no raw storage
  path rendering, portal exclusion, and FieldTrail / Proof Center /
  CloseoutTrail metadata-only behavior. Browser QA loaded `/daily-logs` and one
  discovered Daily Log detail with saved contractor auth, but the checked remote
  data had
  no uploaded evidence row to click; repeated direct checks then hit local
  Supabase Auth `over_request_rate_limit`, so real-object preview link QA
  remains a follow-up after auth cooldown.
- Supabase field evidence storage readiness is documented in
  [docs/design/supabase-field-evidence-storage-verification.md](C:/FloorConnector/docs/design/supabase-field-evidence-storage-verification.md).
  The May 24, 2026 connector rerun pushed `d91b4827`, found
  `FloorConnectorPro`, and identified one unambiguous project candidate:
  `FloorConnector` (`jcnoraopbwdhshcmplgb`, `ACTIVE_HEALTHY`). Read-only
  connector metadata confirmed the remote migration list includes
  `execution_attachments_foundation` and
  `documents_bucket_and_storage_policies`, `public.execution_attachments`
  exists with RLS enabled, and the `storage` schema exposes `storage.objects`,
  `storage.buckets`, and `storage.migrations`. No SQL, bucket rows, object
  rows, signed URLs, app behavior, auth/RLS, storage policies, migrations, or
  data were changed. Live bucket privacy/policy SQL would still require a
  separately approved read-only SQL inspection if the owner wants stronger
  proof before archive/delete implementation.
- Mobile Field Phase 3E archive/delete policy is documented in
  [docs/design/mobile-field-phase-3e-evidence-archive-delete-policy.md](C:/FloorConnector/docs/design/mobile-field-phase-3e-evidence-archive-delete-policy.md).
  Phase 3E-A is now implemented as metadata archive/restore only: the
  `execution_attachments` table records archive/restore timestamps, actors, and
  optional reasons; default attachment list helpers are active-only; Daily Log
  detail exposes owner/admin/manager archive/restore controls; archived evidence
  is hidden from active Daily Log rows and active FieldTrail / Proof Center /
  CloseoutTrail counts; private `documents` bucket objects are kept.
  The policy doc was reconciled after implementation so its schema and next
  prompt sections no longer describe Phase 3E-A as future-only.
  Hard-delete, storage cleanup jobs, storage policy changes, portal/customer
  exposure, thumbnails, AI summaries, notifications, and automation remain
  deferred.
- Field Execution Mobile Polish is now implemented on the existing Daily Log
  and Job Workspace chain. Daily Log detail has a compact mobile-first snapshot
  for open blockers, open issues, unresolved Job Notes, and field evidence; Add
  blocker now preselects the existing blocker Job Note type; Job Workspace uses
  the same blocker handoff when today's Daily Job Log exists; and Job Note cards
  expose type/status more clearly. This stays on canonical `daily_logs`,
  `field_notes`, `execution_attachments`, jobs, projects, and time cards only,
  with no schema, migrations, duplicate issue/blocker/punch-list subsystem,
  attachment model, AI, provider call, notification send, portal/customer field
  visibility, or payroll/time model change.
- CrewBoard Phase 3 drag/drop dispatch planning is documented in
  [docs/design/crewboard-phase-3-drag-drop-dispatch-spec.md](C:/FloorConnector/docs/design/crewboard-phase-3-drag-drop-dispatch-spec.md).
  The recommended path is confirmation-first: add pure move helpers and
  keyboard/manual scheduling around the existing selected-job action panel
  before any pointer drag/drop package. Drag/drop should create a proposed move
  only, then save through existing schedule actions after confirmation.
- CrewBoard Phase 3A is documented in
  [docs/design/crewboard-phase-3a-confirmed-schedule-move.md](C:/FloorConnector/docs/design/crewboard-phase-3a-confirmed-schedule-move.md).
  `/schedule` now has a selected-job `Move schedule` review flow backed by pure
  move helpers and the existing schedule action. Pointer drag/drop, new
  schedule records, packages, routes, and schema changes remain intentionally
  out of scope.
- CrewBoard Phase 3A QA is documented in
  [docs/design/crewboard-phase-3a-qa-checkpoint.md](C:/FloorConnector/docs/design/crewboard-phase-3a-qa-checkpoint.md).
  Static QA confirmed the move helper coverage, existing schedule action path,
  Ready Check / GateKeeper preservation, advisory warning preservation, and no
  schema/package/route/server-action expansion. Browser QA loaded `/schedule`
  at mobile width with saved contractor auth and no horizontal overflow; deeper
  selected-job action checks were blocked by Supabase Auth
  `over_request_rate_limit`.
- CrewBoard Phase 3B pointer drag/drop planning is documented in
  [docs/design/crewboard-phase-3b-drag-drop-technical-spike.md](C:/FloorConnector/docs/design/crewboard-phase-3b-drag-drop-technical-spike.md).
  Recommendation: start 3B-A with no package by proving proposed-move state and
  drop-target abstractions, then install `@dnd-kit/core` only if approved for
  actual pointer drag/drop. Drag/drop must prepare the existing Move schedule
  confirmation flow and never mutate on drop.
- CrewBoard Phase 3B-A is implemented and documented in
  [docs/design/crewboard-phase-3b-a-proposed-move-abstractions.md](C:/FloorConnector/docs/design/crewboard-phase-3b-a-proposed-move-abstractions.md).
  `/schedule` now has pure proposed-move helpers, URL-backed prepared move
  state, inert CrewBoard target metadata, and a compact `Prepare move` preview
  that fills the existing `Move schedule` confirmation form. Pointer drag/drop,
  packages, schema, routes, server actions, and automatic mutation remain out of
  scope.
- CrewBoard Phase 3B-A QA is documented in
  [docs/design/crewboard-phase-3b-a-qa-checkpoint.md](C:/FloorConnector/docs/design/crewboard-phase-3b-a-qa-checkpoint.md).
  Static QA confirmed no pointer handlers, no drag/drop package, no new
  schedule write path, URL state guarded by selected-job presence, inert target
  metadata, and manual `Move schedule` preservation. Protected browser QA
  remains blocked until Supabase Auth cooldown clears.
- CrewBoard Phase 3B-B pre-implementation readiness is documented in
  [docs/design/crewboard-phase-3b-b-pointer-drag-drop-checklist.md](C:/FloorConnector/docs/design/crewboard-phase-3b-b-pointer-drag-drop-checklist.md).
  Recommendation: install `@dnd-kit/core` only when actual pointer drag/drop is
  approved, then use it only to prepare the existing `Move schedule`
  confirmation flow from a drop. Do not mutate on drop, add schedule records,
  add server actions, or make drag/drop required on mobile.
- CrewBoard Phase 3B-B pointer drag/drop preview is implemented and documented
  in
  [docs/design/crewboard-phase-3b-b-pointer-drag-drop-preview.md](C:/FloorConnector/docs/design/crewboard-phase-3b-b-pointer-drag-drop-preview.md).
  `/schedule` now uses a small `@dnd-kit/core` client boundary to let job cards
  prepare existing Move schedule URL state when dropped on date or time-bucket
  targets. Drop does not save; the existing Move schedule confirmation and
  server-side Ready Check / GateKeeper path remain authoritative.
- CrewBoard Phase 3B-B QA is documented in
  [docs/design/crewboard-phase-3b-b-qa-checkpoint.md](C:/FloorConnector/docs/design/crewboard-phase-3b-b-qa-checkpoint.md).
  Static QA confirmed no drag/drop server action calls, no schedule mutation on
  drop, no package sprawl beyond `@dnd-kit/core`, and preserved manual Move
  schedule fallback. Browser smoke loaded `/schedule` on desktop and mobile with
  saved contractor auth and no horizontal overflow, but did not claim full drag
  execution because the loaded data/layout lacked both a visible draggable card
  and visible drop target pair.
- CrewBoard schedule board depth now has a reusable canonical-job read model in
  `apps/web/lib/schedule/read-model.ts` for Ready to schedule, Today, Tomorrow,
  This week, Later scheduled, In progress, Missing Crew, recently completed,
  grouped timing lanes, and schedule readiness review. `/schedule` consumes that
  read model for its command cards while preserving existing job schedule
  fields, `job_assignments`, advisory warnings, and confirmation-first schedule
  actions.
- Scheduling Board v1 maturity extends that read model with blocked
  unscheduled and overdue-scheduling queues driven by existing project
  commercial-readiness snapshots. `/schedule` now shows blocked/not-ready jobs
  instead of hiding them, links the first blocker to the canonical source record
  where possible, and keeps date/crew changes on the existing schedule and
  assignment action paths.
- Scheduling + Dispatch v1 extends the same read model and `/schedule` UI with
  an ordered dispatch Attention Desk for readiness-blocked jobs, past scheduled
  incomplete jobs, missing crew, crew overlap or same-day capacity warnings,
  aging ready-to-schedule jobs, and in-progress jobs. Same-day capacity warnings
  come from existing job assignment people/vendors and remain advisory only.
  CrewBoard now also derives Triage, Plan, and Dispatch operating-mode summaries
  from the same canonical job queues for blocker review, upcoming planning, and
  same-day execution visibility.
  The slice adds no dispatch model, schema, route optimization, map integration,
  notification automation, portal sharing, or new schedule write path.
- Schedule Dispatch Board V1 adds
  `apps/web/lib/schedule/dispatch-board.ts` as the pure section helper for the
  four daily operations lanes: Today, Upcoming, Unscheduled / Needs Dispatch,
  and In Progress. `/schedule` uses those sections for the dispatch cards while
  preserving existing CrewBoard read models, warnings, job/project handoffs, and
  schedule/crew actions. It adds no schema, dispatch table, automation, AI, or
  route-optimization behavior.
- Scheduling / Field handoff visibility now adds a read-only Field handoff
  layer to `/schedule`. It derives scheduled-day Daily Log presence, open
  blocker/issue counts, field-note totals, same-day and open time-card counts,
  latest field activity, crew presence, and Job / Project / Daily Log / Field
  queue links from existing canonical records. It does not create dispatch
  state, field tasks, issue tables, mobile-only records, server actions, schema,
  notifications, portal exposure, or schedule/field mutations.
- Scheduling Capability Wave v1 planning is documented in
  [docs/design/scheduling-capability-wave-v1.md](C:/FloorConnector/docs/design/scheduling-capability-wave-v1.md).
  It recommends CrewBoard maturity work over the existing canonical
  `jobs`/`job_assignments` foundation: read-model decomposition,
  resource-load/conflict depth, CrewBoard UI componentization, queue/action
  panel polish, equipment readiness integration, and E2E fixture hardening. It
  is planning-only and does not authorize new scheduling tables, dispatch
  tables, detached appointment/job models, or feature implementation by itself.
- Scheduling Board Depth v2 post-commit smoke on May 25, 2026 loaded
  `/schedule` on desktop and 390px mobile with saved contractor auth, opened a
  canonical Job Workspace, opened the linked Project Workspace, and opened the
  selected schedule action panel with no page errors or horizontal overflow.
  Local Next dev navigation still logged 404/aborted requests for route chunk
  files during transitions, but the protected pages rendered successfully.
- Operational Capability Waves v1 planning is now reconciled in
  [docs/design/operational-capability-waves-v1-coordination.md](C:/FloorConnector/docs/design/operational-capability-waves-v1-coordination.md)
  with sibling planning docs for
  [Project Workspace](C:/FloorConnector/docs/design/project-workspace-capability-wave-v1.md),
  [Scheduling](C:/FloorConnector/docs/design/scheduling-capability-wave-v1.md),
  [Field/Mobile](C:/FloorConnector/docs/design/field-mobile-capability-wave-v1.md),
  and
  [Portal](C:/FloorConnector/docs/design/portal-capability-wave-v1.md). These
  are planning-only coordination docs, not implemented-status updates. The
  sequence is Project Workspace first, then Scheduling, then Field/Mobile, then
  Portal, so downstream surfaces do not create duplicate project, schedule,
  field, portal, or business-state models.
- Global search hardening for tenant-scoped canonical records.

These layers are summaries, source-record handoffs, copy/hierarchy
improvements, or existing-action presentation around canonical records. They do
not create duplicate models or change core workflow behavior.

## Staging And Demo Status

Recent staging/demo work is remote-Supabase-first and no-write by default:

- [docs/demo/operating-core-demo-path.md](C:/FloorConnector/docs/demo/operating-core-demo-path.md)
  is the current route-based demo path over real database-backed records.
- [docs/staging-deployment-readiness-audit.md](C:/FloorConnector/docs/staging-deployment-readiness-audit.md)
  inventories staging build commands, env names, Supabase/auth/provider risks,
  operating-core demo checks, and owner actions.
- [docs/staging-owner-runbook.md](C:/FloorConnector/docs/staging-owner-runbook.md)
  is the owner-controlled staging setup checklist.
- `pnpm staging:preflight` is local-only and checks repo structure, scripts,
  key docs/files, Node/pnpm, and `.env.example` variable names. It does not read
  `.env.local`, deploy, call providers, call Supabase, or mutate remote state.
- [docs/demo/staging-demo-data-plan.md](C:/FloorConnector/docs/demo/staging-demo-data-plan.md)
  defines the ideal canonical live workflow coverage for demos and QA. It now
  treats golden-path readiness as real remote records created through the app:
  Dashboard Operational Digest, Project Command Timeline, Copilot draft
  actions, CrewBoard, AR collections, document readiness, communications
  send-readiness, Daily Logs/field blockers, and portal review surfaces.
- `pnpm demo:data:inventory` is a no-write readiness checklist. It does not read
  `.env.local`, connect to Supabase, write data, call providers, or recommend
  seeding fake/demo records.
- The misaligned local golden path write seeder was removed. FloorConnector has
  no local database workflow; demos and QA should use real remote Supabase
  records created through the app. Missing golden-path coverage should be
  logged as real workflow/data setup, not solved with synthetic inserts.
- [docs/demo/staging-demo-seed-script-spec.md](C:/FloorConnector/docs/demo/staging-demo-seed-script-spec.md)
  specifies the seed script safety boundary.
- `pnpm demo:data:seed:dry-run -- --organization-id <uuid> --owner-user-id
<uuid> --owner-email <owner@example.test> --portal-customer-email
<customer@example.test> --environment staging` is retained only as a no-write
  legacy planner/guardrail check. It must not be interpreted as permission to
  seed demo data.
- [docs/demo/staging-demo-seed-write-mode-design.md](C:/FloorConnector/docs/demo/staging-demo-seed-write-mode-design.md)
  remains historical/future planning only. Any remote write-capable data setup
  would require separate owner approval, target validation, tenant allowlist,
  idempotency, cleanup policy, and no provider sends.
- `pnpm demo:data:seed:validate-target -- --supabase-url <staging-supabase-url>
--service-role-key-env SUPABASE_SERVICE_ROLE_KEY --organization-id <uuid>
--owner-user-id <uuid> --owner-email <owner@example.test>
--portal-customer-email <customer@example.test> --environment staging` runs the
  Phase 2A read-only target validation. It uses explicit target inputs, hides
  service-role values, runs select-only checks, and prints passed/warned/failed
  readiness. It does not write data, seed records, apply migrations, create
  auth users, create portal invites, create payment/signature/email events, or
  call providers.
- [docs/design/staging-demo-seed-phase-2a-qa-checkpoint.md](C:/FloorConnector/docs/design/staging-demo-seed-phase-2a-qa-checkpoint.md)
  records the Phase 2A QA checkpoint: dry-run remains no-connection/no-write,
  validate-target remains explicit/read-only, script safety checks found no
  write verbs or provider/auth-admin paths in the staging seed script, and
  write mode remains outside current policy.
- [docs/design/supabase-staging-target-discovery.md](C:/FloorConnector/docs/design/supabase-staging-target-discovery.md)
  records the May 24, 2026 read-only Supabase connector discovery. The
  connector could see one organization, `FloorConnectoor`
  (`cvkfudwshnfsftnnwrro`, free plan), but returned zero visible projects. No
  staging project candidate was identified, and no project details, migrations,
  tables, SQL, auth settings, RLS, data, providers, or app behavior were
  touched. A later remote-only CLI check confirmed Supabase CLI authentication
  and visibility for `FloorConnector`
  (`jcnoraopbwdhshcmplgb`) under `FloorConnectorPro`; the later connector
  rerun also sees that same project under `FloorConnectorPro`.

## Guardrails

- All AI agents must read [AGENTS.md](C:/FloorConnector/AGENTS.md) before
  beginning work.
- `docs/current-state.md` owns implemented truth.
- `docs/Roadmap.md`, `docs/vision.md`, `docs/target-ia.md`, and feature plans
  are direction unless current-state and code confirm implementation.
- Do not add fake dashboards, demo-only protected data, local-only persistence,
  portal-only copies, duplicate jobs/projects, or module-local record models.
- Do not describe Guided Project Capture, Assessment Packages, Area / Space
  Modeling, capture confidence scoring, or AI-assisted capture as implemented
  unless `docs/current-state.md` explicitly records an implemented slice.
- Guided Project Capture is future pre-estimate project capture, not an
  estimating feature. Assessment Packages belong to Projects, not Estimates.
  The strategy is to collect information once and reuse it through estimating,
  change orders, scheduling, production planning, field handoff, job execution,
  invoicing, and customer communication.
- Do not add local database seed workflows. FloorConnector demos and QA use real
  remote Supabase-backed canonical records; missing coverage should be created
  through app workflows or treated as a blocker.
- Do not weaken auth, RLS, tenant checks, portal grants, payment/signature
  state, estimate math, invoice math, readiness gates, settings, or
  platform-admin boundaries for QA or demo convenience.
- Company Documents is a settings library with contractor-side read,
  browser print/save, and code-defined Starter Documents adoption only; do not
  add AI drafting, legal advice, e-sign,
  portal/employee distribution, public links, provider sends,
  file upload/storage, persisted platform starter management, generated files,
  or delivery proof without a separate approved slice.
- Staging/demo data work must stay owner-approved, tenant-scoped, dry-run-first,
  provider-dark, and invite-token safe.
- Mobile field work must keep Job Notes and field evidence under Daily Job Logs
  until a separate shared evidence/storage plan is approved.
- CrewBoard drag/drop work must stay on canonical jobs and job assignments,
  preserve existing schedule actions, and keep GateKeeper / Ready Check server
  enforcement authoritative.
- Long-term direction now includes the Agentic Operations Layer documented in
  [docs/agentic-operations-layer.md](C:/FloorConnector/docs/agentic-operations-layer.md).
  AI must stay canonical-record-first, permissioned, auditable, and governed by
  human approval for risky actions. It must not become a parallel CRM,
  scheduler, inbox, payment system, workflow engine, or assistant memory source
  of truth. Current priority remains operational core maturity before
  autonomous AI.
- Customer portal copy should be simpler and customer-safe; do not expose
  contractor-only FieldTrail, Proof Center, internal blockers, provider
  details, or internal Job Notes as portal capability.

## QA Caveats

Protected-route browser QA can be blocked by Supabase Auth rate limits,
stale Playwright storage state, base-URL mismatch, or stale fixed fixture IDs.
Use [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)
before treating a protected-route redirect or fixture miss as product failure.

For current operating-core focused tests and route checks, use
[docs/operating-core-validation-checklist.md](C:/FloorConnector/docs/operating-core-validation-checklist.md).

## Recommended Next Build Options

Good next moves:

- If staging/demo is next, use the connector-visible remote project ref
  `jcnoraopbwdhshcmplgb` for `FloorConnector` under `FloorConnectorPro` as the
  currently confirmed target for read-only checks. Demo readiness should be
  improved by creating real records through app workflows. Keep any direct
  remote data mutation outside current policy unless the owner separately
  approves target validation, tenant allowlist, idempotency, and cleanup.
- If continuing Mobile Field, checkpoint Phase 3D-A browser behavior with real
  uploaded field evidence when saved contractor auth and remote data are
  available, then checkpoint Phase 3E-A archive/restore with real uploaded
  evidence using the policy in
  [docs/design/mobile-field-phase-3e-evidence-archive-delete-policy.md](C:/FloorConnector/docs/design/mobile-field-phase-3e-evidence-archive-delete-policy.md).
  Keep hard-delete, storage cleanup jobs, thumbnails, portal/customer sharing,
  and closeout package file embedding as separate approved slices. If the owner
  wants stronger storage proof before any delete work, run a separately approved
  read-only bucket/policy SQL inspection.
- If continuing Company Documents, use the Phase 1C-A Starter Document Adoption
  prompt from
  [docs/design/company-documents-phase-1c-starter-documents-plan.md](C:/FloorConnector/docs/design/company-documents-phase-1c-starter-documents-plan.md).
  Keep adoption contractor-owned and separate from AI drafting, legal advice,
  e-sign, acknowledgements, portal sharing, storage, delivery proof, and
  platform-admin management.
- If choosing the next pillar, use
  [docs/design/next-build-priority-checkpoint.md](C:/FloorConnector/docs/design/next-build-priority-checkpoint.md)
  to decide between product momentum, demo/staging credibility, and mobile field
  stickiness.
- If choosing among the capability-wave streams, use
  [docs/design/operational-capability-waves-v1-coordination.md](C:/FloorConnector/docs/design/operational-capability-waves-v1-coordination.md)
  and start with the Project Workspace readiness/next-action slice before
  Scheduling, Field/Mobile, or Portal expansion.
- If continuing CrewBoard, checkpoint Phase 3B-B with browser QA when protected
  auth is healthy, then decide whether to add stable Playwright drag/drop
  coverage, refine a drag handle, or keep drag-to-unscheduled manual-only.
- For the broader drag/drop plan, use
  [docs/design/crewboard-phase-3-drag-drop-dispatch-spec.md](C:/FloorConnector/docs/design/crewboard-phase-3-drag-drop-dispatch-spec.md)
  as the scope boundary.
- Run a real-record operating-core demo rehearsal using
  [docs/demo/operating-core-demo-path.md](C:/FloorConnector/docs/demo/operating-core-demo-path.md)
  and record blockers honestly.
- Pick one guarded non-finance product polish item found during the demo
  walkthrough.

Avoid broad accounting sync, provider posting, AI automation, reminders, stored
billing packets, customer billing-center settings, or live staging/provider
actions until the relevant approval and boundary docs are explicit.
