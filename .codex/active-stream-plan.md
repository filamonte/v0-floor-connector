# Active Stream Plan

Status: Active
Doc Type: Codex Operations

This plan defines the current six-stream production-acceleration model for
FloorConnector. It is coordination guidance only. It does not implement product
features and does not replace `docs/current-state.md` as implemented truth.

This file and `active-worktrees.md` are the canonical active-stream registry for
the current production-acceleration cycle. Broader stream inventories in
planning docs are reference topology only when they conflict with this six-stream
model.

## Active Streams

### architecture-coordination

- Branch: `stream/architecture-coordination`
- Worktree: `C:\FC-worktrees\architecture-coordination`
- Owns: sequencing, hotspot ownership, next-wave prompt generation, merge
  review, coordination docs.
- Must avoid: feature implementation, schema, routes, server actions, UI
  behavior, runtime changes, broad source-of-truth rewrites.
- Current wave: Six-stream operating model and next-wave prompt discipline.

### verification

- Branch: `stream/verification`
- Worktree: `C:\FC-worktrees\verification`
- Owns: golden workflow QA, route smoke tests, auth/fixture stabilization,
  merge-gate validation, verification docs.
- Must avoid: product feature work, schema, routes, business logic, fake QA data,
  local-only persistence, bypassing auth/RLS.
- Current wave: Golden Workflow QA Wave V1.

### project-workspace

- Branch: `stream/project-workspace`
- Worktree: `C:\FC-worktrees\project-workspace`
- Owns: Project Workspace Production Hub waves, readiness ownership, continuity
  and handoff clarity.
- Must avoid: duplicate project/activity/task models, scheduling ownership,
  portal-owned state, financial math changes, autonomous AI actions.
- Current wave: Project Workspace Production Hub Wave V1.

### scheduling

- Branch: `stream/scheduling`
- Worktree: `C:\FC-worktrees\scheduling`
- Owns: dispatch board stabilization, CrewBoard, conflict/capacity warnings,
  schedule handoff UX.
- Must avoid: duplicate dispatch tables, readiness bypasses, autonomous
  rescheduling, mobile-only schedule state, portal-owned schedule state.
- Current wave: Scheduling Dispatch Board Stabilization V1.

### communications

- Branch: `stream/communications`
- Worktree: `C:\FC-worktrees\communications`
- Owns: delivery proof, project message memory, customer follow-up memory, later
  provider-backed delivery status.
- Must avoid: disconnected inboxes, provider-owned business truth, customer sends
  without confirmation, AI-only communication memory, portal leakage.
- Current wave: Communications Delivery Proof Review V1.

### financials-reporting

- Branch: `stream/financials-reporting`
- Worktree: `C:\FC-worktrees\financials-reporting`
- Owns: AR Control Room, collections visibility, payment evidence,
  production/collections reporting.
- Must avoid: duplicate ledgers, accounting-provider truth, invoice/payment math
  changes unless explicitly scoped, job-costing mutation before inputs mature.
- Current wave: Financials AR / Reporting Control Room V1.

## Merge Order

1. `verification`
2. `project-workspace`
3. `scheduling`
4. `communications`
5. `financials-reporting`
6. `architecture-coordination`

Architecture coordination docs merge last unless the docs are needed to unblock
or govern an implementation slice. Project Workspace must lead Scheduling when
readiness or handoff ownership is involved. Scheduling must lead Field/Mobile.
Communications must lead customer-facing portal message exposure. Financials
must lead portal invoice/payment UX.

## Paused Streams

- `portal`: paused until Project Workspace and Communications waves clarify
  customer-safe status and message boundaries.
- `field-mobile`: paused until Project Workspace and Scheduling waves clarify
  execution handoff and crew context.
- `financials`: legacy/superseded by `financials-reporting`; preserve useful
  work only through explicit reconciliation.
- `qa-verification`: legacy/superseded by `verification`; preserve useful work
  only through explicit reconciliation.
- `project-readiness-panel`: legacy/review-needed; reconcile into
  `project-workspace` or retire deliberately.
- workflow automation: paused beyond deterministic/read-only cue reliability.
- universal capture: paused beyond context hardening.
- AI/provider automation: paused until communications, scheduling, financials,
  and approval queues are production-grade.

## Governance File Ownership

Architecture Coordination owns changes to the active stream registry,
coordination prompt templates, worktree scripts, and related package scripts.
Feature streams should not modify or delete these files as incidental branch
drift:

- `active-worktrees.md`
- `active-waves.md`
- `.codex/active-stream-plan.md`
- `.codex/prompt-templates/**`
- `scripts/codex-streams.ps1`
- `scripts/codex-next.ps1`
- worktree platform scripts
- package scripts for `codex:*`, `worktree:*`, and shared devtools

If a feature stream needs one of these changes, it should call that out as an
Architecture Coordination dependency before editing.

## Daily Cadence

Morning:

```powershell
pnpm worktree:reconcile
pnpm worktree:audit
```

Before every Codex task:

```powershell
pnpm worktree:doctor
```

After every completed slice:

- run targeted validation
- inspect `git status`
- stage only intended files
- commit the completed slice
- report changed files, validation, final status, and commit hash

Every 48 hours:

- reconcile active streams with `main`
- review hotspot overlap before merging
- retire or pause streams that no longer create parallel value

## Quality Bar

- No duplicate business models.
- No schema unless explicitly scoped.
- No portal copies or portal-owned operational state.
- No financial math changes unless explicitly scoped.
- No autonomous AI actions or hidden provider mutation.
- No hidden local-only workflow state.
- Docs update when implemented truth changes.
- `docs/current-state.md` remains implemented truth.

## Recommended Next Prompt Order

1. Project Workspace Production Hub Wave V1.
2. Golden Workflow QA Wave V1.
3. Scheduling Dispatch Board Stabilization V1.
4. Communications Delivery Proof Review V1.
5. Financials AR / Reporting Control Room V1.
6. Merge Readiness Review for the first production wave set.
