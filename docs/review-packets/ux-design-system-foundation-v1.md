# UX Design System Foundation V1

Status: Active implementation stream
Date: 2026-06-10
Branch: `stream/ux-design-system-foundation-v1`
Worktree: `C:\FC-worktrees\ux-design-system-foundation-v1`
Wave: `ux-beta-readiness-v1`

## Purpose

Create the shared design-system foundation needed before dashboard and
workspace cleanup. This stream standardizes reusable UI semantics and primitives
so later UX streams can improve hierarchy and scanability without inventing
route-local systems.

This is a UI implementation stream, but it is intentionally narrow. It does not
redesign full pages, change business logic, change data models, create schema
changes, create migrations, touch Supabase, or introduce new operational state.

## Ownership Area

Owned by this stream:

- shared status badge semantics
- shared readiness badge semantics
- compact readiness summary primitive
- shared action hierarchy class names
- shared empty-state copy variants
- representative adoption in existing shared dashboard/project/schedule
  components
- documentation of implemented reusable patterns only

Not owned by this stream:

- full Dashboard redesign
- full Record Workspace redesign
- role personalization engine
- readiness calculation changes
- dashboard-owned queues or operational state
- financial/schedule/production source-of-truth changes
- schema, migrations, Supabase, provider behavior, portal access, AIA, customer
  self-service, or AI

## Dependencies

- PR #19 payment schedule readiness merged to `main`
- PR #20 opportunity assessment package merged to `main`
- UX Beta Readiness wave packet:
  `docs/review-packets/ux-beta-readiness-v1.md`
- UX Architecture Audit packet:
  `C:\FC-worktrees\ux-architecture-audit-v1\docs\review-packets\ux-architecture-audit-v1.md`
- Design-system governance:
  `docs/design-system-governance.md`
- Graphite/Copper UI system:
  `docs/graphite-copper-ui-system.md`
- UI pattern guide:
  `docs/ui-patterns.md`
- Product operating model, current-state truth, developer source of truth, and
  target IA docs

## Files Read

- `AGENTS.md`
- `docs/agent-governance.md`
- `docs/agent-startup-checklist.md`
- `docs/autonomous-run-governance.md`
- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `.codex/worktree-rules.md`
- `.codex/active-stream-plan.md`
- `docs/review-packets/ux-beta-readiness-v1.md`
- `C:\FC-worktrees\ux-architecture-audit-v1\docs\review-packets\ux-architecture-audit-v1.md`
- `docs/design-system-governance.md`
- `docs/graphite-copper-ui-system.md`
- `docs/ui-patterns.md`
- `docs/product-operating-model.md`
- `docs/target-ia.md`
- `docs/review-packets/product-ux-governance-alignment-v1.md`
- `active-waves.md`
- `active-worktrees.md`
- `packages/ui/src/status.ts`
- `packages/ui/src/components/action-bar.tsx`
- `packages/ui/src/components/project-state-summary.tsx`
- `packages/ui/src/index.ts`
- `apps/web/components/action-hierarchy.tsx`
- `apps/web/components/app-empty-state.tsx`
- `apps/web/components/manager-dashboard-card.tsx`
- `apps/web/components/project-connected-record-lanes.tsx`
- `apps/web/components/project-financial-continuity-section.tsx`
- `apps/web/components/project-production-hub-section.tsx`
- `apps/web/components/schedule-context-card.tsx`
- representative dashboard, Lead/Opportunity, Project, Estimate, Contract,
  Invoice, Job, Schedule, Payments, and Financials route/component snippets for
  usage inspection only

## Tool References

Inherited from the UX Beta Readiness wave and UX Architecture Audit packets:

- Notion: UX Beta Readiness planning entry recorded in the wave/audit packets.
- Figma/FigJam: UX Beta Readiness audit map/reference recorded in the
  wave/audit packets.
- Stitch: UX Beta Readiness project reference recorded in the wave/audit
  packets.
- Linear: unavailable due to reauthentication; repo governance fallback used.
- v0: unavailable/no callable tool; repo component governance used.
- Screenshots: no browser screenshots were captured in the first audit. This
  stream used code/docs inspection and focused tests instead of visual redesign
  screenshots.

No new Notion, Figma/FigJam, Stitch, Linear, or v0 artifacts were created by
this stream.

## Implementation Decisions

- `@floorconnector/ui` now owns shared `StatusBadge` and `ReadinessBadge`
  components over the existing status tone helpers.
- `status.ts` now includes readiness-specific tone mapping for ready,
  attention, blocked, neutral, informational, financial, and production states.
- Common statuses such as draft, sent, viewed, approved, rejected, signed, void,
  paid, partially paid, overdue, ready, blocked, scheduled, in progress,
  completed, and needs attention resolve through shared helpers instead of
  page-local color decisions.
- `ReadinessSummary` provides a compact presentational primitive for Financial
  Readiness, Schedule Readiness, Production Readiness, and general readiness
  summaries. It does not calculate readiness.
- Action hierarchy class names are exported from `@floorconnector/ui` and
  consumed by the web app wrapper to keep primary, secondary, and overflow
  actions visually consistent.
- Empty-state copy variants are exported from `@floorconnector/ui` for no
  records yet, missing upstream step, waiting on customer, waiting on payment,
  waiting on signature, and ready but not scheduled states.
- Existing shared dashboard/project/schedule components were updated to consume
  `StatusBadge` where the change was low-risk.

## Representative Surfaces Updated

- Dashboard manager card status badges
- Project connected-record lane status badges
- Project financial continuity status badges
- Project production hub status badges
- Schedule context focus-card status badge
- App empty state wrapper now accepts shared empty-state variants
- Web action hierarchy wrapper now reuses shared action hierarchy class names

These are representative foundation updates only. Later streams still own full
Dashboard, Record Workspace, Financial/Schedule Readiness, mobile/field, and
Settings/Super Admin cleanup.

## Anti-Silo Check

This stream adds no data stores, no queues, no role-specific records, no
dashboard-owned operational state, no portal/customer copies, no financial or
schedule truth, no readiness truth, and no fake persistence. Components consume
plain labels, statuses, tones, and links supplied by existing app code.

Dashboard remains a prioritization surface. Owning workspaces remain the place
where users act on canonical records.

## Validation Plan

- focused unit tests for status tone mapping, readiness tone mapping, badge
  class helpers, empty-state copy, and status label normalization
- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- `pnpm.cmd fc:preflight:fast`
- `git diff --check`
- `git diff --cached --check`
- `pnpm.cmd worktree:doctor`

## Validation Results

- `pnpm.cmd exec tsx packages/ui/src/status.test.ts`: passed, 5 tests.
- `pnpm.cmd --filter @floorconnector/web typecheck`: passed.
- `pnpm.cmd --filter @floorconnector/web lint`: passed.
- `pnpm.cmd fc:preflight:fast`: passed.
- `git diff --check`: passed.
- `pnpm.cmd worktree:doctor`: passed with 19 checks and 1 expected warning for
  no upstream configured on the new stream branch.
- `git diff --cached --check`: passed.

## Explicit Non-Goals

- full dashboard redesign
- full workspace redesign
- personalization engine
- schema/data changes
- business logic changes
- Supabase changes
- migrations
- AIA
- customer self-service
- AI
- provider/customer-facing sends
- portal access changes
- payment/signature/scheduling mutation
