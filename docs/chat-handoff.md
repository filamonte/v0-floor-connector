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

- [docs/ai/intelligent-follow-up-engine.md](C:/FloorConnector/docs/ai/intelligent-follow-up-engine.md) now captures the planning model for the Intelligent Follow-Up Engine as a workflow intelligence layer, not a chatbot-first feature.
- The plan starts from the implemented deterministic Operational Intelligence / My Work cue foundation: query-time cues over canonical records, persisted rule settings and responsibility defaults, record-level Needs Attention panels, and no persisted cue instances.
- V1 computed-cue coverage is now explicitly regression-tested for stale sent estimates, past-due invoices requiring an open balance, scheduled jobs missing crew only when no assignment/crew exists, and ready project scheduling cues that respect existing readiness and scheduled-job state.
- The project guidance cue copy now labels ready unscheduled project work as `Ready project needs scheduling` while still routing through the existing schedule handoff.
- Closeout cleanup updated the stale project detail smoke assertion from historical `Core Workflow` wording to the current `Project workflow` accessible heading; no app/schema/business/auth behavior changed.
- Cue-to-work-item bridge V1 is implemented for record workspaces only: stale sent-estimate cues and past-due invoice cues can prefill the existing source-locked internal work-item form for user-confirmed submission. Dashboard My Work cues remain awareness/workflow-link only; no app schema, RLS, AI provider, persistent cue state, autonomous action, or auto-created work item was added.
- Project Workspace cue action V1 now routes canonical next-step cues to existing contract, invoice, job Quick-Create, and schedule workflows; only open blocker field-note coordination can prefill a project source-locked work item. Dashboard project cues remain awareness-only, and no app schema, auth, business logic, AI provider, persistent cue state, autonomous action, or auto-created record was added.
- Intelligent Follow-Up foundation closeout validation passed for focused cue unit tests, `pnpm typecheck`, `pnpm lint`, `git diff --check`, protected auth setup, project detail smoke, project cue bridge E2E, and detail workspace smoke. Browser validation used a fresh local server on port 3021 because the default 3000/3001 ports were occupied.
- Recommended next slice: persisted cue state for dismiss/snooze/resolve, with an explicit schema/RLS plan first, before any dashboard action expansion or AI draft assistance.
- Next approved implementation should preserve the sequence: optional persisted dismiss/snooze/resolve state, broader cue-to-work-item bridging only where explicitly approved, settings expansion, AI summaries/drafts, then controlled automation.
- Do not create migrations, app behavior, AI provider calls, duplicate task systems, portal/customer-visible AI actions, or target-only implementation claims from this planning checkpoint alone.

## Latest Revision / Perspective Checkpoint

- First-pass canonical revision infrastructure is implemented through `record_revisions` for estimates, invoices, contracts, and change orders.
- Revision snapshots attach to the active canonical record; no cloned estimates, invoices, contracts, or change orders were introduced.
- Supported record workspaces lazily create an initial snapshot for existing records and show a secondary revision timeline. Compare, restore, branching, merging, rollback, and advanced diffing remain intentionally deferred.
- Contractor-side create/edit/send/status/payment-sensitive hooks create revision snapshots where safe authenticated mutation points exist. Portal/customer events still rely on existing signature, payment, notification, and specialized commercial snapshot evidence unless a future pass explicitly extends generic revisions there.
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
