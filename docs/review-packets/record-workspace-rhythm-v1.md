# Record Workspace Rhythm V1

Status: Implementation complete, waiting review
Date: 2026-06-10
Branch: `stream/record-workspace-rhythm-v1`
Worktree: `C:\FC-worktrees\record-workspace-rhythm-v1`
Wave: `ux-beta-readiness-v1`

## Purpose

Normalize the first real record-workspace rhythm after dashboard cleanup:
identity, state and next action, primary work, linked canonical context, and
secondary details/history.

This stream is presentation-only. It does not change business logic, readiness
calculations, workflow state, schema, data models, migrations, Supabase data,
provider behavior, portal access, payment behavior, signature behavior,
scheduling behavior, or customer-facing sends.

## Dependencies Reviewed

- PR #18 product/UX governance alignment: merged.
- PR #19 payment schedule readiness foundation: merged.
- PR #20 opportunity assessment package foundation: merged.
- PR #21 UX design system foundation: merged.
- PR #22 MCP/tool readiness: merged.
- PR #23 dashboard command-center cleanup: merged.
- UX Beta Readiness wave packet.
- UX Architecture Audit packet.
- UX Design System Foundation packet.
- Dashboard Command Center Cleanup packet.
- MCP/tool readiness packet.
- `docs/design-system-governance.md`
- `docs/graphite-copper-ui-system.md`
- `docs/ui-patterns.md`
- `docs/product-operating-model.md`
- `docs/current-state.md`
- `docs/developer-source-of-truth.md`
- `docs/target-ia.md`
- `docs/review-packets/product-ux-governance-alignment-v1.md`
- `active-waves.md`
- `active-worktrees.md`
- `.codex/active-stream-plan.md`

## Implementation Decisions

- Added a shared `RecordWorkspaceSection` primitive in `@floorconnector/ui`
  for record-workspace section headers, actions, metadata, and contained
  content.
- Added a pure `recordWorkspaceRhythmSteps` contract that records the shared
  reading order: record identity, state and next action, primary work, linked
  context, and details/history.
- Kept `ActionBar`, `WorkflowBar`, and `ProjectStateSummary` as the preferred
  top-stack primitives instead of replacing them.
- Standardized the Estimate, Contract, Invoice, and Job command-band status
  display on shared `StatusBadge`.
- Standardized representative Project linked-context panels on
  `RecordWorkspaceSection`.
- Left all page read models, calculations, actions, forms, and route behavior
  unchanged.

## Representative Surfaces Updated

- Estimate Workspace command band.
- Contract Workspace command band.
- Invoice Workspace command band.
- Job Workspace command band.
- Project Workspace connected record lanes.
- Project Workspace financial continuity overview.
- Project Workspace production continuity overview.

Lead/Opportunity Assessment Package rhythm was inspected and left unchanged in
this slice because it already uses `StandardWorkspaceLayout`,
`WorkspaceSummaryBand`, and existing opportunity-owned Assessment Package
actions. Later workspace cleanup can apply broader surface changes after review.

## Tool Usage

Existing wave/tool references were reused from the UX Beta Readiness, UX
Architecture Audit, UX Design System Foundation, MCP readiness, and Dashboard
Command Center Cleanup packets.

- GitHub: used through local `git`/`gh` checks to confirm PR #18 through PR
  #23 dependency state before launch.
- Notion: existing UX wave/audit reference only; no new artifact created.
- Figma/FigJam: existing UX wave/audit reference only; no new artifact created.
- Stitch: existing project reference only; no new artifact created.
- Linear: not used for ticket creation; repo governance used.
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

Completed validation:

```powershell
pnpm.cmd exec tsx packages/ui/src/record-workspace-rhythm.test.ts
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
git diff --cached --check
pnpm.cmd worktree:doctor
```

Results will be recorded before commit.

Results:

- Rhythm helper tests: passed, 3 tests.
- `@floorconnector/web` typecheck: passed.
- `@floorconnector/web` lint: passed.
- `fc:preflight:fast`: passed.
- `git diff --check`: passed.
- `git diff --cached --check`: passed before staging.
- `worktree:doctor`: passed with the expected new-branch warning that no
  upstream is configured yet.

## Explicit Non-Goals

- full dashboard redesign
- full workspace redesign
- personalization engine
- schema/data changes
- business logic changes
- Supabase changes
- migrations
- duplicate queues
- dashboard-owned or workspace-owned workflow state
- financial, schedule, or readiness truth changes
- provider/customer-facing behavior
- AIA
- customer self-service
- AI
- portal access changes
- payment/signature/scheduling mutation
