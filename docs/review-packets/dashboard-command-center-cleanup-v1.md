# Dashboard Command Center Cleanup V1

Status: Implementation complete, waiting review
Doc Type: Review Packet

## Scope

Stream: `dashboard-command-center-cleanup-v1`

Branch: `stream/dashboard-command-center-cleanup-v1`

Worktree: `C:\FC-worktrees\dashboard-command-center-cleanup-v1`

Purpose: clean up the contractor dashboard command-center hierarchy after the
UX design-system foundation and MCP/tool readiness stream merged.

This stream is presentation-only. It keeps the dashboard as the surface that
answers "what needs attention?" and keeps actual follow-through in owning
workspaces.

## Dependencies Reviewed

- PR #19: payment schedule readiness foundation, merged.
- PR #20: opportunity assessment package foundation, merged.
- PR #21: UX design system foundation, merged.
- PR #22: MCP/tool readiness review, merged.
- UX Beta Readiness wave packet.
- UX Architecture Audit packet.
- UX Design System Foundation packet.
- MCP/tool readiness packet.
- Design-system governance, Graphite/Copper UI system, UI patterns, product
  operating model, current-state truth, developer source of truth, and target
  IA.

## Implementation Decisions

- The existing dashboard action queues are now the primary attention layer when
  present.
- The older priority strip remains available only as fallback when action queues
  are absent, avoiding two competing top-level attention systems.
- The operating summary's open-blockers link now routes to whichever attention
  surface is active.
- Dashboard queue badges now use the shared `StatusBadge` primitive.
- Dashboard queue empty states now use the shared empty-state copy helper
  through a local dashboard wrapper.
- Primary and secondary queue actions now use the shared action hierarchy class
  names.
- AI digest priority badges and empty states also consume shared primitives
  where low-risk.
- No dashboard read model, queue derivation, action handler, or route behavior
  changed.

## Representative Surfaces Updated

- Contractor dashboard surface:
  `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- Dashboard priority strip:
  `apps/web/components/dashboard/priority-strip.tsx`

## Tool Usage

Existing wave/tool references were reused from the UX Beta Readiness, UX
Architecture Audit, UX Design System Foundation, and MCP readiness packets.

- GitHub: PR #22 was pushed, reviewed, and merged before this stream started.
- Notion: existing UX wave/audit references only; no new artifact created.
- Figma/FigJam: existing UX wave/audit references only; no new artifact
  created.
- Stitch: existing project reference only; no new artifact created.
- Linear: treated as unavailable unless reauthenticated; repo governance used.
- v0: not used.
- Supabase: not used.
- Browser screenshots: not captured yet for this stream.

Repo documentation remains the source of truth when external tool output
conflicts with design-system governance.

## Anti-Silo / Canonical Truth Check

This stream does not introduce:

- role-specific data stores
- duplicate dashboard queue models
- dashboard-owned operational state
- module-local ownership
- duplicate financial truth
- duplicate schedule truth
- duplicate readiness truth
- fake persistence
- portal-only copies
- AIA-only billing islands
- detached checkout/payment models
- detached signed-contract systems

All dashboard items still derive from existing canonical records and existing
dashboard read models.

## Validation

Completed validation:

```powershell
pnpm.cmd exec prettier --write apps/web/components/dashboard/contractor-dashboard-surface.tsx apps/web/components/dashboard/priority-strip.tsx docs/review-packets/dashboard-command-center-cleanup-v1.md active-waves.md active-worktrees.md .codex/active-stream-plan.md docs/current-state.md docs/ui-patterns.md
pnpm.cmd exec tsx apps/web/lib/dashboard/action-queues.test.ts
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
git diff --cached --check
pnpm.cmd worktree:doctor
```

Results:

- Prettier: passed.
- Dashboard action queue tests: passed, 4 tests.
- `@floorconnector/web` typecheck: passed.
- `@floorconnector/web` lint: passed.
- `fc:preflight:fast`: passed.
- `git diff --check`: passed.
- `git diff --cached --check`: passed.
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
- dashboard-owned workflow state
- financial, schedule, or readiness truth changes
- provider/customer-facing behavior
- AIA
- customer self-service
- AI
- portal access changes
- payment/signature/scheduling mutation
