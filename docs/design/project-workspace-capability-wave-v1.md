# Project Workspace Capability Wave v1

Status: Planning-only
Doc Type: Design / Project Workspace Planning

## 1. Status and intent

This document is a planning doc only. It defines the next implementation-safe maturity slice for the contractor Project Workspace before deeper scheduling, field/mobile, and portal expansion work begins.

This is not an implementation claim. It is a scoped plan for what the next safe project workspace wave should cover, where it should stay deliberately limited, and how it should coordinate with neighboring streams.

Project Workspace maturity should come before deeper scheduling, field/mobile, and portal expansion because:

- Project Workspace is the canonical operational hub for readiness, continuity, and handoff in the current architecture.
- Stronger project-readiness and next-action surfaces reduce the risk of scheduling and field/mobile work building on incomplete or siloed project context.
- Deeper portal expansion must remain a customer-facing surface on the same canonical records, not a separate state model.
- A safer early slice is to harden the project hub and project-to-schedule/job handoff before broadening the downstream module expansion.

## 2. Source docs read

Read:

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `docs/system-overview.md`
- `docs/Roadmap.md`
- `docs/target-ia.md`
- `docs/sales-to-production.md`

Also considered for context:

- `docs/adr/0002-project-as-operational-hub.md`
- `docs/adr/0006-universal-create-pattern.md`
- `docs/ai-operational-copilot-foundation.md`
- `docs/ai/intelligent-follow-up-engine.md`
- `docs/ai-guided-system-plan.md`

Missing / not present in this stream workspace during the original planning pass:

- `docs/design/scheduling-capability-wave-v1.md`

Reconciled-docs note: `docs/design/scheduling-capability-wave-v1.md` is now
present in the main docs set alongside this plan. The note above is preserved
as historical stream-planning context, not current missing-doc status.

## 3. Current implemented baseline

Based on current branch source docs and inspected code, the contractor Project Workspace already includes:

- A real project detail route at `apps/web/app/(app)/projects/[projectId]/page.tsx`.
- A project-focused hub that derives readiness, blockers, connected records, and operational summary from canonical project-linked data.
- Existing Project Workspace maturity layers such as ProjectPulse, FieldTrail, MessageCenter, CloseoutTrail, Proof Center, and Project Command Timeline.
- Project operational summaries derived from `apps/web/lib/projects/operational-workspace.ts` and linked evidence continuity from `apps/web/lib/projects/evidence-continuity.ts`.
- Readiness signals and financial-readiness snapshots from `apps/web/lib/projects/readiness.ts`.
- Project command/timeline continuity in `apps/web/lib/projects/timeline.ts`.
- Project cue and next-action signaling in `apps/web/lib/projects/cues.ts`.
- Planned universal create / quick-create alignment in the shell through `apps/web/components/app-shell-mobile-nav.tsx` and `apps/web/components/universal-create-menu.tsx`, consistent with the canonical quick-create-first pattern.
- Project-level schedule handoff links in code such as `apps/web/lib/schedule/links.ts` and readiness-aware CrewBoard integration in the current schedule stream.

Current baseline is read-only and connective. It is not a claim that the project workspace already delivers complete scheduling, field/mobile, or portal workflows.

## 4. Product goal

Make Project the operational hub for readiness, continuity, and next actions.

- Keep project detail as the primary workspace for project-level work delivery.
- Preserve global module routes as queues and operational entry surfaces, not separate mental models.
- Ensure downstream linked records remain connected to project context rather than competing with it.
- Keep the canonical lifecycle intact: `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`.

## 5. Wave v1 scope

Wave v1 should cover the following project workspace maturity elements:

- Project overview/readiness refinement
  - Improve project summary clarity, current stage, blocker state, and next-action framing.
  - Keep readiness signals grounded in existing canonical records and not introduce a new workflow engine.

- Linked estimates/contracts/jobs/invoices/change orders continuity
  - Surface continuity panels for the most relevant linked records.
  - Make it easy to understand how approvals, signed contracts, unscheduled jobs, invoices, and change orders relate to the project.

- Current blocker/next-action hierarchy
  - Clarify what is blocking the project and what the next canonical action should be.
  - Keep blocker explanations tied to source records, not to a new project-only state table.

- Readiness handoff into `/jobs` and `/schedule`
  - Harden canonical project-to-job/schedule continuity with explicit handoff links.
  - Avoid adding separate dispatch tables or schedule-specific project state.
  - Preserve the existing CrewBoard and canonical jobs/job assignments foundation as the handoff target.

- Universal create/context handoff from project
  - Ensure any project-originated quick-create or universal-create path creates canonical records first, then routes into the full workspace.
  - Maintain project context across the create flow without introducing a separate quick-create draft system.

- Activity/timeline review if existing data supports it
  - Surface existing project timeline continuity from current code, but do not invent a new activity/transaction table.
  - Use the existing `apps/web/lib/projects/timeline.ts` derived read model rather than a new log store.

- Field execution preview from daily logs, field notes, time, and attachments where already canonical
  - Surface existing field execution signals and previews on the project page.
  - Do not create a separate field execution subsystem or a portal-owned field state.

- Financial readiness visibility from invoices/payments without changing financial mutation rules
  - Show current invoice and payment readiness context for the project.
  - Keep all invoice/payment mutation behavior unchanged and canonical.

## 6. Out of scope

Wave v1 explicitly excludes:

- New duplicate project summary tables or alternate project master state.
- New workflow engine or project-only state machine.
- New scheduling/dispatch tables separate from canonical `jobs` and `job_assignments`.
- Portal-owned project state or portal-first project workflow models.
- Autonomous AI actions or autonomous workflow execution.
- Financial mutation changes, new invoicing/payment behavior, or new ledger models.
- Schema changes unless a later implementation slice proves they are necessary.
- Broad redesign unrelated to project workspace maturity.

## 7. Proposed decomposition

Safe implementation slices for the next wave:

1. Project read-model cleanup
   - Audit and simplify the project detail loader and derived project summary inputs.
   - Keep the page reliant on canonical project, estimate, contract, job, invoice, payment, and field-linked read models.

2. Readiness/next-action component extraction
   - Extract a reusable project readiness/next-action panel.
   - Surface blockers, current stage, and canonical next steps in one place.

3. Linked-record continuity panels
   - Implement or refine connected estimate/contract/job/invoice/change-order lanes.
   - Keep each lane as a linked read-only summary rather than a separate project workflow.

4. Project-to-schedule/job handoff hardening
   - Harden the schedule handoff links and messaging from project to `/schedule` and job detail.
   - Ensure _ready_ project jobs are routed through canonical jobs and CrewBoard rather than a separate schedule queue.

5. Project field-execution preview
   - Surface existing field execution context from daily logs, field notes, time, and attachments where those records are canonical.
   - Keep the preview read-only and project-scoped.

6. Project financial readiness panel
   - Add a project financial-readiness summary without changing invoice/payment logic.
   - Surface unpaid deposit, outstanding balance, and approved invoice continuity.

7. E2E/QA hardening
   - Add or extend targeted project-detail and schedule-ready-handoff specs.
   - Validate the project workspace does not create new workflow silos.

## 8. Hotspot map

Likely project workspace risk areas and code owners:

- `apps/web/app/(app)/projects/[projectId]/page.tsx` — primary project detail route and data composition.
- `apps/web/lib/projects/operational-workspace.ts` — derived project operational workspace summary.
- `apps/web/lib/projects/timeline.ts` — existing project command/timeline read model.
- `apps/web/lib/projects/readiness.ts` — project financial and scheduling readiness snapshots.
- `apps/web/lib/projects/cues.ts` — project cue and next-action signal derivation.
- `apps/web/lib/projects/evidence-continuity.ts` — project evidence continuity read model.
- `apps/web/lib/ai-operational-copilot/summary.ts` — project operational summary and readiness narrative.
- `apps/web/components/schedule-context-card.tsx` / `apps/web/lib/schedule/links.ts` — project-to-schedule handoff path.
- `apps/web/components/app-shell-mobile-nav.tsx` and `apps/web/components/universal-create-menu.tsx` — universal quick-create entry points and context handoff.
- `apps/web/lib/jobs/data.ts` and `apps/web/lib/work-items/prefill.ts` — project job creation and work-item handoff from project context.
- `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx` — portal project workspace continuity.
- `e2e/project-detail-ui.spec.js` — project detail UI smoke coverage.
- `e2e/schedule-ready-handoff.spec.js` — schedule-ready handoff coverage.

## 9. Cross-stream coordination

Project workspace Wave v1 must coordinate with:

- `stream/scheduling`
  - Confirm the project handoff path stays on canonical jobs and CrewBoard.
  - Keep scheduling work from assuming a separate project schedule state.
  - Align on route/query expectations for `schedule` handoff links.

- `stream/portal`
  - Keep portal expansion focused on customer-safe visibility of the same canonical project records.
  - Avoid portal-only project state or separate readiness signals.
  - Ensure portal project summary and status remain a derived customer surface rather than a parallel project model.

- `stream/field-mobile`
  - Keep field execution preview based on existing canonical daily logs, field notes, time records, and attachments.
  - Avoid introducing a field-specific project state model in the project workspace.
  - Coordinate on field execution preview messaging and blocker semantics.

- Universal create / dashboard work
  - Keep universal create as canonical record creation first, then workspace routing.
  - Ensure dashboard and queue work remains global entry points, not alternative project workflows.
  - Align with the project-centered IA in `docs/target-ia.md` and the operational-hub guidance in `docs/adr/0002-project-as-operational-hub.md`.

## 10. Acceptance criteria for implementation readiness

Wave v1 is ready to implement when:

- Project detail reads a cleaned canonical project read model and does not rely on ad hoc project state tables.
- The project workspace has a cohesive readiness/next-action panel grounded in source records.
- Connected estimate/contract/job/invoice/change-order lanes are present and clearly linked back to project context.
- Project-to-schedule/job handoff is explicit, canonical, and does not introduce new dispatch tables.
- Universal-create/project quick-create flows remain canonical-first and preserve project context into the workspace.
- Field execution preview is scoped to canonical daily logs, field notes, time, and attachments already linked to the project.
- Financial readiness visibility is present without any invoice/payment mutation rule changes.
- The implementation plan avoids out-of-scope items listed above.
- Cross-stream coordination agreements are documented for scheduling, portal, and field/mobile teams.

## 11. Validation plan

Likely validation checks for this planning slice:

- Typecheck across affected frontend files.
- Lint the modified doc if docs linting is present.
- Targeted tests: extend or review `apps/web/lib/projects/*` tests plus `e2e/project-detail-ui.spec.js` and `e2e/schedule-ready-handoff.spec.js` if available.
- Git diff review for unintended unrelated changes.
- Prettier check on this document if the workspace has Prettier configured.
- `git diff --check` to catch whitespace or merge conflict markers.

## 12. Recommended first implementation slice

The first code slice should be small, reviewable, and minimize conflicts with scheduling:

- Extract and stabilize a dedicated Project Readiness + Next Action panel from `apps/web/app/(app)/projects/[projectId]/page.tsx` and the existing project readiness helpers.
- Keep the panel read-only and built over `apps/web/lib/projects/readiness.ts`, `apps/web/lib/projects/cues.ts`, and `apps/web/lib/projects/operational-workspace.ts`.
- Validate the new panel with a focused UI render test and a project detail smoke spec.
- This slice leaves the current schedule and portal handoff behavior unchanged while strengthening the project hub.

That slice is the safest first step because it hardens project workspace maturity without requiring schedule stream changes, field/mobile data-model changes, portal expansion, or schema work.
