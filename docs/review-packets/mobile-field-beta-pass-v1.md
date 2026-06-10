# Mobile Field Beta Pass V1 Review Packet

Status: Implementation stream
Date: 2026-06-10
Branch: `stream/mobile-field-beta-pass-v1`
Worktree: `C:\FC-worktrees\mobile-field-beta-pass-v1`

## Purpose

Improve mobile scanability for assessment capture and field-facing contractor
surfaces before the UX Beta Readiness wave moves to remaining admin boundary
work.

This stream is presentation-only. It keeps Dashboard as the attention surface
and keeps Lead/Opportunity, Project, Job, Daily Log, Field Work, Communication,
Schedule, Financials, and Invoice work in their existing owning workspaces.

## Dependencies

- PR #21 `ux-design-system-foundation-v1`
- PR #23 `dashboard-command-center-cleanup-v1`
- PR #24 `record-workspace-rhythm-v1`
- PR #25 `financial-schedule-readiness-ux-v1`
- `docs/review-packets/ux-beta-readiness-v1.md`
- `docs/review-packets/ux-architecture-audit-v1.md`
- `docs/review-packets/financial-schedule-readiness-ux-v1.md`
- `docs/design-system-governance.md`
- `docs/graphite-copper-ui-system.md`
- `docs/ui-patterns.md`
- `docs/product-operating-model.md`
- `docs/current-state.md`
- `docs/developer-source-of-truth.md`
- `docs/target-ia.md`

## Scope Implemented

- Lead Assessment Package panel:
  - adopted shared `StatusBadge` for assessment package statuses
  - moved the package creation form before dense package history on narrow
    layouts
  - made the project assessment package link touch-friendly on mobile
- Schedule Field Handoff panel:
  - made Daily Log and source-record links touch-friendly
  - changed field handoff facts to two columns on phone widths
  - moved readiness context before packet metadata on narrow layouts
  - added safe wrapping for long job, schedule, scope, note, and owner labels
- Daily Logs manager:
  - adopted shared `StatusBadge` for daily log statuses
  - made the primary new-log action full-width on phone widths
  - increased row touch area and added safe wrapping for field narratives and
    project/job/weather labels
- Assigned Field Work page:
  - standardized mobile field action link sizing for Job, Project, Daily Log,
    quick capture, and communication handoff actions

## Non-Goals

- no full dashboard redesign
- no full workspace redesign
- no personalization engine
- no schema or data changes
- no migrations
- no Supabase changes
- no business logic changes
- no readiness calculation changes
- no new server actions
- no duplicate field queues
- no mobile-only or offline persistence
- no portal/customer copy records
- no customer self-service
- no AIA
- no AI
- no payment, signature, scheduling, portal-access, or provider behavior
  changes

## Tool Usage

- GitHub CLI: used to confirm PR #25 merge state before stream activation.
- Repo docs: used as the source of truth for scope, boundaries, and active
  stream governance.
- Notion: no new artifact created; existing UX wave/audit references remain the
  planning source.
- Figma/FigJam: no new artifact created; existing UX wave/audit references
  remain the planning source.
- Stitch: no new project created; existing UX wave/audit references remain the
  planning source.
- Linear: unavailable unless reauthenticated; repo governance fallback used.
- v0: not used; no component scaffold was needed.
- Browser/screenshot tooling: local Next dev server started on
  `http://127.0.0.1:3105`; Playwright mobile smoke used
  `playwright/.auth/local-user.json` at 390 px width for `/daily-logs`,
  `/field/work-items`, and `/schedule`. All three routes returned HTTP 200 but
  rendered the app error page with `h1` = `We could not load this page`, so the
  screenshots are not accepted as visual UI evidence. The captured error-page
  screenshots were kept outside the repo under
  `%TEMP%\floorconnector-mobile-field-beta-pass-v1`.

## Anti-Silo Check

This stream does not introduce:

- role-specific data stores
- dashboard-owned operational state
- field-local queue persistence
- mobile-only/offline persistence
- duplicate schedule, readiness, financial, field, customer, project, job,
  invoice, payment, communication, or portal records
- fake persistence
- portal-only copies

All changed actions continue to link into existing canonical workspaces or use
existing actions.

## Validation Plan

Required:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
git diff --cached --check
pnpm.cmd worktree:doctor
```

Recommended if local auth/browser tooling is available:

```powershell
pnpm.cmd --filter @floorconnector/web dev
```

Then capture mobile-width evidence for:

- `/daily-logs`
- `/field/work-items`
- `/schedule`
- one Lead/Opportunity detail route with Assessment Package context when a
  stable fixture is available

Browser smoke attempt during this stream:

- `/daily-logs`: HTTP 200, app error page rendered, no page-level horizontal
  overflow measured on the error page.
- `/field/work-items`: HTTP 200, app error page rendered, no page-level
  horizontal overflow measured on the error page.
- `/schedule`: HTTP 200, app error page rendered, no page-level horizontal
  overflow measured on the error page.

Because the real route content did not render, this does not replace reviewer
mobile QA after the app data/runtime issue is resolved.

## Review Notes

- Review should focus on mobile ordering, tap targets, wrapping, and shared
  status/readiness semantics.
- Review should not expect new field workflows, offline mode, native mobile
  behavior, or changed calculations.
