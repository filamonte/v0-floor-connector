# Schedule CrewBoard Industrial OS V1

Status: Active
Date: 2026-06-14
Branch: `stream/schedule-crewboard-industrial-os-v1`
Worktree: `C:\FC-worktrees\schedule-crewboard-industrial-os-v1`
Base: `origin/main` at setup

## Purpose

Refactor Schedule / CrewBoard toward Field Command / CrewBoard Industrial OS.

## Scope

- `/schedule`
- CrewBoard components used by `/schedule`
- schedule cards, lanes, warnings, and empty states
- this review packet

## Product Intent

Schedule/CrewBoard should answer:

- What is happening today?
- What is ready to schedule?
- What needs crew, time, or context?
- What is in progress?
- What has execution warnings?
- What needs handoff before field work?

## Forbidden Scope

No schema, migrations, route renames, duplicate schedule/dispatch/job model,
fake records, fake statuses, fake KPIs, fake queues/counts, local-only
persistence, auth/tenant/portal/admin guard changes, scheduling business logic
changes, readiness gate changes, crew assignment behavior changes, or removal
of real actions unless access remains obvious.

## Figma References

Use `https://www.figma.com/design/N0tVE3uKWpHZc4dlF6ytgn` through Figma MCP
where relevant. Record exact frames inspected during implementation.

## Data Sources

Existing CrewBoard and schedule read models, canonical jobs, appointments,
assignments, people, vendors, projects, customers, readiness warnings, and
existing schedule actions only.

## Validation Plan

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd --filter @floorconnector/ui test
pnpm.cmd fc:preflight:fast
pnpm.cmd e2e:smoke:auth
git diff --check
git diff --cached --check
pnpm.cmd worktree:doctor
pnpm.cmd wave:status
```

Browser checks at `1366px` and `390px`: `/schedule`, `/daily-logs` if
relevant, `/dashboard`, `/projects`, one Project Workspace, `/leads`, one
Opportunity Workspace, `/settings`, `/portal`, and
`/dashboard?capture=1#universal-capture`.

## Completion Notes

### Figma Frames Inspected

Pending.

### Target Pages

Pending.

### Files Changed

Pending.

### Data Sources Used

Pending.

### Visual Improvements

Pending.

### Mobile Behavior

Pending.

### Deviations From Figma

Pending.

### No-Data-Silo Confirmation

Pending.

### Production Safety Confirmation

Pending.

### Remaining Visual Debt

Pending.

### Browser Checks

Pending.

### Validation Results

Pending.
