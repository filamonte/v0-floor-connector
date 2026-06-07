# Owner Operations Reporting V1 Plan

Status: Approved for stream/worktree creation only.

Wave: `owner-operations-reporting-v1`

Gate date: 2026-06-07

Jeff approval: Recorded for stream/worktree creation.

Architecture Coordination approval: Recorded for stream/worktree creation.

Implementation status: Not started.

This plan records the approved owner-operations reporting wave after review of
the completed operational command center, sales-to-production, field execution,
mobile closeout, customer portal trust, and financial closeout collections
waves. It does not authorize feature implementation until a later explicit start
command.

## Rationale

The completed waves now strengthen the operating chain from lead and readiness
through field execution, closeout, customer trust, invoice continuity,
collections priority, and payment visibility. The next highest leverage feature
wave is an owner-grade reporting layer that helps contractor owners and managers
understand how the business is moving without turning Reports into a separate
business system.

The recommended operating principle is summarize, explain, and route:

- summarize operating health across canonical records
- explain where work, cash, labor, and exceptions need attention
- route users into the owning workspace for action

The wave must keep Dashboard as prioritization, Project as diagnosis, Field as
execution, Financials as billing/collections action, Communications as
communication action, Settings as configuration, and Reports as owner-level
review.

## Approved Streams

| Stream                                       | Branch                                              | Worktree                                                     | Status                 |
| -------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------ | ---------------------- |
| `owner-operations-summary-v1`                | `stream/owner-operations-summary-v1`                | `C:\FC-worktrees\owner-operations-summary-v1`                | Approved / Not Started |
| `execution-to-cash-reporting-v1`             | `stream/execution-to-cash-reporting-v1`             | `C:\FC-worktrees\execution-to-cash-reporting-v1`             | Approved / Not Started |
| `labor-field-management-snapshot-v1`         | `stream/labor-field-management-snapshot-v1`         | `C:\FC-worktrees\labor-field-management-snapshot-v1`         | Approved / Not Started |
| `portfolio-risk-exceptions-v1`               | `stream/portfolio-risk-exceptions-v1`               | `C:\FC-worktrees\portfolio-risk-exceptions-v1`               | Approved / Not Started |
| `verification-owner-operations-reporting-v1` | `stream/verification-owner-operations-reporting-v1` | `C:\FC-worktrees\verification-owner-operations-reporting-v1` | Approved / Not Started |

## Stream Descriptions

### owner-operations-summary-v1

Ownership area: Reports / owner operating review.

Mission: create a compact owner operations summary that helps owners understand
business movement, stalled work, and cross-workspace priorities from canonical
records.

Expected future scope:

- owner-level operating snapshot
- ready, blocked, slipping, and attention summaries
- links into owning workspaces for action
- clear separation from Dashboard action queues

Forbidden areas:

- no dashboard replacement
- no new reporting persistence model
- no action ownership migration into Reports
- no schema changes or migrations

### execution-to-cash-reporting-v1

Ownership area: Reports with Field and Financials continuity.

Mission: show owner-level continuity from completed work through billing,
invoice, collection priority, payment events, and cash visibility.

Expected future scope:

- completed-not-billed visibility
- billable, invoiced, collectible, and paid summaries
- cash pressure and overdue awareness
- links to Field, Project, and Financials owning surfaces

Forbidden areas:

- no accounting replacement
- no invoice or payment mutation
- no duplicate AR model
- no provider or gateway behavior changes
- no schema changes or migrations

### labor-field-management-snapshot-v1

Ownership area: Reports with Field / People visibility.

Mission: give owners and managers a read-only labor and field management
snapshot that explains active work, crew load, blocked execution, and incomplete
field evidence.

Expected future scope:

- active crew and active job snapshot
- blocked or incomplete field-work visibility
- labor attention summary over existing field and workforce records
- links back to Field and People for action

Forbidden areas:

- no payroll system
- no route optimization
- no duplicate crew, time-card, schedule, or field execution models
- no schema changes or migrations

### portfolio-risk-exceptions-v1

Ownership area: Reports / owner exception review.

Mission: surface cross-portfolio exceptions that require owner or manager
attention while preserving the owning workspace for action.

Expected future scope:

- overdue, missing, stalled, blocked, and customer/office attention exceptions
- risk grouping across sales, projects, field, communications, and financials
- routing links into the canonical owning workspace
- explicit empty states when no exception exists

Forbidden areas:

- no autonomous decisions
- no AI action layer
- no duplicate task, workflow, risk, or exception persistence model
- no schema changes or migrations

### verification-owner-operations-reporting-v1

Ownership area: Verification.

Mission: protect that Reports summarizes and routes over canonical records
without becoming a duplicate operating system.

Expected future scope:

- protect summarize-not-act ownership
- protect canonical project, job, invoice, payment, field, and communication
  source-record usage
- protect no duplicate reporting, financial, field, AR, crew, workflow, or
  exception models
- protect no schema or migration drift
- verify owner reports link to owning workspaces for action

Forbidden areas:

- no feature implementation
- no UI redesign
- no schema changes or migrations
- no loosening existing checks

## Ownership Map

| Area           | Owner in this wave                       | Boundary                                                                                 |
| -------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| Dashboard      | Prioritization only                      | Reports may summarize operating health but must not replace action queues.               |
| Reports        | Owner-level review                       | Reports summarizes, explains, and routes; it does not own operational action.            |
| Project        | Diagnostic continuity                    | Project remains the source of project-level diagnosis and next-step context.             |
| Field          | Execution ownership                      | Field owns Daily Logs, field notes, blockers, attachments, and work execution.           |
| Financials     | Billing, collections, and payment action | Financials owns invoice readiness, AR action, collections, and payment continuity.       |
| Communications | Communication action                     | Communications owns message follow-up and communication continuity.                      |
| Settings       | Configuration                            | Settings owns reporting, billing, tenant, and operating configuration.                   |
| Portal         | Customer-safe review/action              | Portal remains scoped to customer-safe project, financial, and communication visibility. |

## Dependency Map

| Dependency                       | Reused by wave                                                   | Constraint                                                         |
| -------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| Canonical project lifecycle      | owner summary, risk exceptions, execution-to-cash reporting      | no detached project, job, invoice, payment, or communication truth |
| Operational command center model | all streams                                                      | Reports summarizes while owning workspaces act                     |
| Field execution depth            | labor / field snapshot, execution-to-cash continuity, exceptions | no duplicate field issue, Daily Log, or closeout model             |
| Financial closeout collections   | execution-to-cash reporting, risk exceptions, verification       | no financial math mutation, no provider change, no AR duplicate    |
| Customer portal trust            | customer-safe exception context through source records           | no portal-owned reporting truth                                    |
| Verification framework           | verification-owner-operations-reporting-v1                       | verification runs last after implementation commits exist          |

## Non-Goals

- Do not build a BI warehouse.
- Do not build an accounting system.
- Do not replace Dashboard, Project, Field, Financials, Communications,
  Settings, or Portal ownership.
- Do not create a duplicate reporting persistence model.
- Do not create duplicate invoice, payment, payment-event, AR, labor, crew,
  time-card, project, job, task, workflow, risk, or exception models.
- Do not modify schemas or migrations.
- Do not introduce provider, payment gateway, payroll, or accounting behavior.
- Do not create autonomous AI actions or customer-facing sends.

## Validation Plan

Each implementation stream must run:

```powershell
git fetch origin
pnpm.cmd tooling:baseline -CommandsOnly
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
```

Focused tests should be added or run for changed helpers, owner reporting
summaries, route surfaces, field/financial read models, and ownership-link
behavior.

## Verification Plan

Verification runs last and must wait until implementation stream commits exist.

Verification should protect:

- Reports summarizes and routes; owning workspaces act.
- Dashboard remains prioritization only.
- Project remains diagnostic.
- Field remains execution owner.
- Financials remains billing, collections, and payment action owner.
- Communications remains communication action owner.
- Portal remains customer-safe.
- Settings remains configuration owner.
- No duplicate reporting, financial, field, labor, crew, workflow, risk, or
  exception model exists.
- No schema or migration drift exists.

## Tooling Requirements

Future start and verification prompts must run:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd tooling:baseline -CommandsOnly
```

Use the validation command set from
[docs/automation-tooling-baseline.md](C:/FloorConnector/docs/automation-tooling-baseline.md).

## Merge Order

Recommended merge order:

1. `owner-operations-summary-v1`
2. `execution-to-cash-reporting-v1`
3. `labor-field-management-snapshot-v1`
4. `portfolio-risk-exceptions-v1`
5. `verification-owner-operations-reporting-v1`

Verification must merge last after the implementation streams are reviewed and
validated.

## Jeff Approval Gate

Jeff approval is recorded for stream/worktree creation of
`owner-operations-reporting-v1`.

Jeff has not yet approved implementation start, merge, PR creation, cleanup, or
the next wave. A later explicit start command is required before any feature
work begins.
