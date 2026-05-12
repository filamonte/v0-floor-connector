# Chat Handoff

Status: Active
Doc Type: Operational

This is a compact operational handoff for the current branch. It is not a competing source of truth.

## Required First Read

Before doing implementation or documentation work, read [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md).

Then use:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for implemented truth
- [docs/platform-maturity.md](C:/FloorConnector/docs/platform-maturity.md) for maturity framing
- [docs/module-status.md](C:/FloorConnector/docs/module-status.md) for concise module status
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md) for workflow rules
- [docs/documentation-standards.md](C:/FloorConnector/docs/documentation-standards.md) for doc maintenance rules
- [docs/adr/README.md](C:/FloorConnector/docs/adr/README.md) for settled architecture decisions
- [docs/ai/README.md](C:/FloorConnector/docs/ai/README.md) for AI-readable boundaries

## What FloorConnector Is

FloorConnector is a production-first SaaS operating system for specialty flooring contractors. It is built around one connected contractor workflow, not disconnected modules:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Current Branch Reality

The current branch has a real operational foundation: auth, tenancy, opportunities/leads, customers, projects, estimates, contracts, change orders, jobs, invoices, payments, portal foundations, workforce/time/field foundations, settings, super admin, and normalized contractor UI patterns.

It is best understood as a platform operating-system foundation with evolving UX depth, reporting depth, automation depth, integration depth, and AI depth. It is not an early prototype.

## Current Active Focus

Current work should generally preserve the implemented operational core while tightening:
- project-centered continuity
- workflow/readiness guidance
- scheduling and dispatch depth
- materials/catalog/document depth
- financial/reporting/integration depth
- communications, automation, and AI assistance as layers on canonical records

## Latest UI Checkpoint

- The v0 / Graphite & Copper validation sequence is closed. Graphite & Copper is the accepted contractor-app visual-token foundation, and Estimates served as the first reference surface for the pass.
- Final validation covered token cleanup, authenticated desktop QA, mobile/tablet QA, E2E auth selector cleanup, regression validation, forensic scope audit, and closeout cleanup. `pnpm typecheck`, `pnpm lint`, `git diff --check`, `pnpm e2e:auth`, `pnpm exec playwright test e2e/detail-workspace-ui.spec.js --project=chromium-protected`, and `pnpm exec playwright test e2e/dashboard-ui.spec.js --project=chromium-protected` passed during closeout.
- The accepted work preserved the top-nav-first contractor shell, Manager Page rhythm, and shared Record Workspace language. It did not change schema, RLS, auth behavior, middleware, server actions, data loading, route protection, business logic, financial calculations, workflow transitions, or app navigation.
- The stale protected Playwright project-workflow assertion was updated to the current `Project workflow` accessible region name. The malformed invoice route from the prompt is not present in repo files; if the prior invoice fixture is needed again, use `a6c30047-5307-43d7-8b7a-aeb1c4d14604`.
- Do not reopen broad visual-system validation unless a specific regression appears. Next product work should start from the current Graphite & Copper baseline, follow [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md), and focus on targeted product depth such as project-centered continuity, workflow/readiness guidance, scheduling/dispatch depth, materials/catalog/document depth, financial/reporting/integration depth, and communications/AI layers on canonical records.

## Latest AI / Follow-Up Planning Checkpoint

- Operational Intelligence / Intelligent Follow-Up foundation is closed as a deterministic, evidence-backed workflow guidance layer over canonical records. It includes query-time operational cues, Dashboard My Work display modes, record-level Needs Attention panels, Project Workspace suggested actions, cue-to-work-item prefill for approved human-confirmed contexts, user-scoped dismiss/snooze through `workflow_cue_states`, and admin-facing rule guidance at `/settings/operational-intelligence`.
- Project Workspace workflow guidance has been tightened without new workflow behavior: the workflow overview names the linked record or workspace driving the next step, and Suggested project actions now separate canonical workflow actions from human follow-up actions.
- Project Workspace linked-record continuity now includes a compact recency breadcrumb summary from existing estimates, contracts, jobs, invoices, change orders, daily logs, and field-note context. It highlights the driving linked record when it matches the next-step driver, but it is not a new activity feed, event model, automation layer, or query-time cue mechanic.
- Project Workspace guidance/recency is closed as a presentation-only project-continuity slice. It preserved standalone module routes, canonical workflow routing, readiness gates, cue behavior, and global queue surfaces.
- Current cue coverage and guidance remain bounded to supported estimate, contract, invoice, job, and project contexts. Cue actions route to existing canonical workflows where possible; work-item creation remains user-confirmed; dashboard cue mutation controls are not implemented.
- Current settings support only existing deterministic rule fields and responsibility defaults: enabled state, threshold days, urgency, and People-first starter role defaults. The rule cards explain trigger, impact, surface, safe next action, and visibility behavior; they are not an automation builder.
- Validation across the foundation has passed in focused unit tests, `pnpm typecheck`, `pnpm lint`, `git diff --check`, protected browser smoke for project guidance/recency, protected browser smoke for record cue-state controls, dashboard awareness-only checks, and `/settings/operational-intelligence` smoke.
- Deferred: company-scoped resolve/mark-handled, dashboard dismiss/snooze controls, broader cue-to-work-item bridging, AI summaries/drafts, controlled automation, cue event trails, and any customer-visible/provider-backed AI action.
- Recommended next product slice: scheduling/dispatch UI layer on the existing canonical job, appointment, job-assignment, and `/schedule` foundations. Defer a true project activity/event timeline until there is an explicit schema/event-model planning pass. If cue mechanics resume first, start with company-scoped handling planning/tests rather than dashboard controls.
- The working tree is intentionally dirty from the active revision, cue-state, and operational-intelligence slices; do not treat unrelated modified files as part of a future docs-only closeout unless the task explicitly scopes them.

## Latest Revision / Perspective Checkpoint

- First-pass canonical revision infrastructure is implemented through `record_revisions` for estimates, invoices, contracts, and change orders.
- Revision snapshots attach to the active canonical record; no cloned estimates, invoices, contracts, or change orders were introduced.
- Supported record workspaces lazily create an initial snapshot for existing records and show a secondary revision timeline. Compare, restore, branching, merging, rollback, and advanced diffing remain intentionally deferred.
- Contractor-side create/edit/send/status/payment-sensitive hooks create revision snapshots where safe authenticated mutation points exist. Portal/customer events still rely on existing signature, payment, notification, and specialized commercial snapshot evidence unless a future pass explicitly extends generic revisions there.
- Revision creation is now hardened through an authenticated `SECURITY INVOKER` database RPC that keeps RLS active, validates membership and subject ownership, locks the tenant-scoped subject, and atomically demotes the previous current revision before inserting the next current revision.
- Estimates, invoices, and leads now support first-pass `My Work` / `Company` perspectives through `?view=my` and `?view=company`.
- `My Work` uses only existing safe cues: estimate/invoice creator, updater, sender where available, and lead appointment assignment through linked people membership. It does not add permissions, saved views, AI prioritization, or team routing.

## Non-Negotiable Guardrails

- `docs/current-state.md` owns implemented truth.
- Preserve the canonical lifecycle exactly.
- Do not create duplicate business models.
- Do not create portal-only copies of canonical records.
- Do not create module-local silos.
- Contractor app and portal act on the same canonical records.
- Quick create must create canonical records first and route into full workspaces.
- Financial, payment, and signature events extend canonical records and preserve history.
- Top-nav-first contractor shell remains the current UI baseline.
- Roadmap, vision, and target IA docs are future direction unless current-state says otherwise.

## Immediate Documentation / AI Warnings

- Do not read roadmap phases as date-based timelines or week-count build plans.
- Treat `Foundation` as "canonical structure exists, deeper workflow depth remains future."
- Treat target IA routes as target direction, not current route reality.
- Do not use historical handoff entries as current implementation truth.
- If docs conflict, update the non-current-state doc or add a caveat.

## Where To Read Next

- Governance: [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md), [docs/documentation-standards.md](C:/FloorConnector/docs/documentation-standards.md)
- Architecture principles: [docs/architecture-principles.md](C:/FloorConnector/docs/architecture-principles.md), [docs/canonical-lifecycle.md](C:/FloorConnector/docs/canonical-lifecycle.md), [docs/platform-philosophy.md](C:/FloorConnector/docs/platform-philosophy.md)
- Current truth: [docs/current-state.md](C:/FloorConnector/docs/current-state.md), [docs/platform-maturity.md](C:/FloorConnector/docs/platform-maturity.md), [docs/module-status.md](C:/FloorConnector/docs/module-status.md), [docs/known-gaps.md](C:/FloorConnector/docs/known-gaps.md)
- Operational architecture: [docs/workflows.md](C:/FloorConnector/docs/workflows.md), [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md), [docs/ui-system.md](C:/FloorConnector/docs/ui-system.md), [docs/financial-architecture.md](C:/FloorConnector/docs/financial-architecture.md), [docs/portal-architecture.md](C:/FloorConnector/docs/portal-architecture.md)
- Future direction: [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md), [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md), [docs/future-platform-expansion.md](C:/FloorConnector/docs/future-platform-expansion.md)
- ADRs: [docs/adr/README.md](C:/FloorConnector/docs/adr/README.md)
- Diagrams: [docs/diagrams/README.md](C:/FloorConnector/docs/diagrams/README.md)
- AI guidance: [docs/ai/README.md](C:/FloorConnector/docs/ai/README.md)
