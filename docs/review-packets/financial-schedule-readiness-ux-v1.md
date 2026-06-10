# Financial Schedule Readiness UX V1

Status: Implementation complete, waiting review
Date: 2026-06-10
Branch: `stream/financial-schedule-readiness-ux-v1`
Worktree: `C:\FC-worktrees\financial-schedule-readiness-ux-v1`
Wave: `ux-beta-readiness-v1`

## Purpose

Clarify Financial Readiness, Schedule Readiness, and Production Readiness in the
existing contractor UI without changing readiness calculations, canonical
ownership, workflow state, schema, persistence, provider behavior, customer
behavior, payment behavior, signature behavior, or scheduling behavior.

Project remains the operational readiness hub after sale. Financials, Invoice
Workspace, Job Workspace, Schedule, and Field-facing surfaces remain the owning
workspaces for the actions they already own.

## Dependencies Reviewed

- PR #19 payment schedule readiness foundation: merged.
- PR #21 UX design-system foundation: merged.
- PR #22 MCP/tool readiness: merged.
- PR #23 dashboard command-center cleanup: merged.
- PR #24 record workspace rhythm: merged.
- UX Beta Readiness wave packet.
- UX Architecture Audit packet.
- UX Design System Foundation packet.
- Dashboard Command Center Cleanup packet.
- Record Workspace Rhythm packet.
- Payment Schedule Readiness packet.
- MCP/tool readiness packet.
- `docs/design-system-governance.md`
- `docs/graphite-copper-ui-system.md`
- `docs/ui-patterns.md`
- `docs/product-operating-model.md`
- `docs/current-state.md`
- `docs/developer-source-of-truth.md`
- `docs/target-ia.md`
- `active-waves.md`
- `active-worktrees.md`
- `.codex/active-stream-plan.md`

## Implementation Decisions

- Added shared `@floorconnector/ui` readiness lane copy for Financial
  Readiness, Schedule Readiness, and Production Readiness.
- Kept lane copy presentational: it names the owning surface, action surface,
  description, and boundary, but does not compute readiness or inspect data.
- Added targeted tests to lock the lane order and ownership-boundary language.
- Reused existing `ReadinessBadge`, `StatusBadge`, `ActionBar`,
  `RecordWorkspaceSection`, and action hierarchy primitives.
- Added `gap-2` to shared primary and secondary action class names so icon
  actions render consistently through the existing action hierarchy primitive.
- Updated only representative readiness surfaces; no broad page redesign was
  attempted.

## Representative Surfaces Updated

- Project Readiness + Blockers panel now shows the three readiness lanes and
  their owning-workspace boundaries before listing blockers.
- Ready to Schedule handoff now labels the existing signed -> job -> schedule
  flow as Financial, Production, and Schedule readiness using shared badges.
- Project Financial Hub overview now identifies the Financial Readiness lane.
- Project Production Hub overview now identifies the Production Readiness lane.
- Schedule Field Handoff packet now labels schedule and production readiness
  context and repeats the ownership boundary.

## Tool Usage

Existing wave/tool references were reused from the UX Beta Readiness, UX
Architecture Audit, UX Design System Foundation, MCP readiness, Dashboard
Command Center Cleanup, and Record Workspace Rhythm packets.

- GitHub: used through local `git`/`gh` checks to confirm PR #24 was already
  merged and `main` includes `5f0deb78`.
- Notion: existing UX wave/audit reference only; no new artifact created.
- Figma/FigJam: existing UX wave/audit reference only; no new artifact created.
- Stitch: existing project reference only; no new artifact created.
- Linear: unavailable unless reauthenticated; repo governance fallback used.
- v0: not used.
- Supabase: not used.
- Browser screenshots: not captured in this stream before validation.

Repo documentation remains the source of truth when external tool output
conflicts with design-system governance.

## Anti-Silo / Canonical Truth Check

This stream does not introduce:

- role-specific data stores
- duplicate queue models
- dashboard-owned or workspace-owned operational state
- module-local ownership
- duplicate financial truth
- duplicate schedule truth
- duplicate readiness truth
- fake persistence
- portal-only copies
- AIA-only billing islands
- detached checkout/payment models
- detached signed-contract systems

All updated surfaces remain presentation over existing canonical records and
existing read models.

## Validation

Planned validation:

```powershell
pnpm.cmd exec tsx packages/ui/src/readiness-lanes.test.ts
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
git diff --cached --check
pnpm.cmd worktree:doctor
```

Results:

- `pnpm.cmd exec tsx packages/ui/src/readiness-lanes.test.ts`: passed, 3
  tests.
- `pnpm.cmd --filter @floorconnector/web typecheck`: passed.
- `pnpm.cmd --filter @floorconnector/web lint`: passed.
- `pnpm.cmd fc:preflight:fast`: passed.
- `git diff --check`: passed.
- `git diff --cached --check`: passed before staging.
- `pnpm.cmd worktree:doctor`: passed with the expected new-branch warning that
  no upstream is configured yet.

## Explicit Non-Goals

- full dashboard redesign
- full workspace redesign
- personalization engine
- schema/data changes
- business logic changes
- readiness calculation changes
- Supabase changes
- migrations
- duplicate queues
- dashboard-owned or workspace-owned workflow state
- financial, schedule, or readiness truth changes
- provider/customer-facing behavior
- payment/signature/scheduling mutation
- AIA
- customer self-service
- AI
- portal access changes
