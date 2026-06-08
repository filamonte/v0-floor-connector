# Visual UX Review Contractor Usability V1 Plan

Status: Approved / Not Started
Doc Type: Review Packet

## Rationale

FloorConnector has completed several high-output capability waves across the
operational command center, sales-to-production readiness, field execution,
mobile closeout, customer portal trust, financial closeout and collections, and
owner operations reporting.

The next highest-leverage checkpoint is a contractor-facing UX and information
architecture review before adding more feature depth. The wave should reduce
confusion, page density, duplicated summaries, unclear ownership, and
dashboard/page sprawl without changing canonical records, schemas, migrations,
provider behavior, or workflow ownership.

This is an approved wave structure and stream/worktree creation packet. It does
not start implementation.

## Approval Gate

| Gate item                          | Status      | Evidence / note                                                                  |
| ---------------------------------- | ----------- | -------------------------------------------------------------------------------- |
| Architecture Coordination approval | Approved    | Ownership, dependencies, non-goals, verification scope, and merge order defined. |
| Jeff approval gate                 | Approved    | Jeff explicitly approved this wave and stream/worktree creation.                 |
| Stream creation                    | Complete    | Five branches and worktrees were created from current `main`.                    |
| Implementation start               | Not started | A later explicit Start command is required.                                      |
| Schema / migration work            | Not allowed | No schema or migration work is approved.                                         |
| Merge / PR work                    | Not allowed | No merge, PR, or next wave work is approved by this packet.                      |

## Guiding Principles

- Dashboard prioritizes.
- Project diagnoses.
- Field executes.
- Financials owns billing and collection action.
- Communications owns conversation action.
- Portal remains customer-safe.
- Reports summarize and route, not act.
- Settings owns configuration.
- No duplicate ownership.
- No schema or migration work.

## Stream Descriptions

### `golden-workflow-usability-review-v1`

- Branch: `stream/golden-workflow-usability-review-v1`
- Worktree: `C:\FC-worktrees\golden-workflow-usability-review-v1`
- Ownership area: end-to-end contractor journey review.
- Mission: review the full contractor path for understandability from Lead to
  Reports.
- Future allowed work: identify confusing transitions, clarify next-step
  language, improve cross-linking between owning workspaces, and reduce user
  decision fog.
- Forbidden: schema changes, new feature models, dashboard rebuild, broad visual
  redesign, migrations, provider behavior, and duplicate workflow state.
- Suggested commit: `feat: clarify golden workflow usability`

### `workspace-density-polish-v1`

- Branch: `stream/workspace-density-polish-v1`
- Worktree: `C:\FC-worktrees\workspace-density-polish-v1`
- Ownership area: density and readability on major contractor workspaces.
- Mission: reduce page clutter and improve hierarchy on high-traffic contractor
  workspaces.
- Likely surfaces: Project Workspace, Field / Schedule, Financials, and Reports.
- Future allowed work: clarify section hierarchy, reduce duplicated summaries,
  improve empty states, and improve card/action grouping.
- Forbidden: ownership changes, new workflow models, schema changes, migrations,
  major redesign, provider behavior, and source-record mutation.
- Suggested commit: `feat: polish workspace density`

### `manager-page-ownership-polish-v1`

- Branch: `stream/manager-page-ownership-polish-v1`
- Worktree: `C:\FC-worktrees\manager-page-ownership-polish-v1`
- Ownership area: manager page clarity and ownership boundaries.
- Mission: make manager pages clearly answer what they own and where users
  should act.
- Likely surfaces: Dashboard, Projects, Field / Schedule, Financials,
  Communications, and Reports.
- Future allowed work: remove or relabel duplicated ownership language, make
  action ownership clearer, keep Dashboard as prioritization only, and ensure
  Settings links remain configuration-only.
- Forbidden: new manager pages unless already routed, schema changes,
  migrations, dashboard sprawl, duplicate action ownership, and new persistence.
- Suggested commit: `feat: polish manager page ownership`

### `portal-customer-clarity-polish-v1`

- Branch: `stream/portal-customer-clarity-polish-v1`
- Worktree: `C:\FC-worktrees\portal-customer-clarity-polish-v1`
- Ownership area: customer-facing clarity.
- Mission: improve customer-safe portal clarity after the customer portal trust
  wave.
- Future allowed work: simplify customer-safe language, clarify customer next
  actions, improve portal section hierarchy, and reduce internal operational
  terminology.
- Forbidden: portal-owned state, autonomous customer actions, schema changes,
  migrations, payment/provider changes, field-proof exposure, and internal-only
  terminology leakage.
- Suggested commit: `feat: polish portal customer clarity`

### `verification-ux-ia-ownership-v1`

- Branch: `stream/verification-ux-ia-ownership-v1`
- Worktree: `C:\FC-worktrees\verification-ux-ia-ownership-v1`
- Ownership area: verification.
- Mission: protect UX and IA ownership boundaries after implementation streams
  complete.
- Verification must protect: Dashboard prioritization, Project diagnosis, Field
  execution ownership, Financials billing/collections action ownership,
  Communications conversation action ownership, customer-safe Portal behavior,
  Reports summarize-and-route behavior, Settings configuration ownership, no
  duplicate models, and no schema/migration drift.
- Forbidden: feature work, UI redesign, schema changes, migrations, loosening
  checks, and running before implementation stream commits exist.
- Suggested commit: `test: protect ux ia ownership`

## Ownership Map

| Area           | Ownership rule for this wave                                      |
| -------------- | ----------------------------------------------------------------- |
| Dashboard      | Prioritizes work and attention only.                              |
| Project        | Diagnoses project state and connected source-record continuity.   |
| Field          | Owns execution action through jobs, schedule, logs, and evidence. |
| Financials     | Owns billing, collection, payment, and invoice action.            |
| Communications | Owns conversation review and communication action.                |
| Portal         | Stays customer-safe and scoped to canonical records.              |
| Reports        | Summarizes and routes; it does not own operating action.          |
| Settings       | Owns tenant configuration and operational preferences.            |
| Verification   | Protects boundaries, duplicate-model risk, and schema drift.      |

## Dependency Map

| Stream                                | Upstream dependencies                                                                  | Downstream dependencies                           |
| ------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `golden-workflow-usability-review-v1` | Current-state truth, workflows, operational architecture, completed wave packets.      | Informs workspace and manager ownership polish.   |
| `workspace-density-polish-v1`         | Golden workflow review, completed Project / Field / Financials / Reports waves.        | Informs verification and manager page review.     |
| `manager-page-ownership-polish-v1`    | Operational ownership model, Dashboard, Reports, Field, Financials, Communications.    | Informs verification ownership checks.            |
| `portal-customer-clarity-polish-v1`   | Customer Portal Trust V1, portal-safe project/financial/communication boundaries.      | Informs verification customer-safe checks.        |
| `verification-ux-ia-ownership-v1`     | All four implementation streams must have committed completed slices before it starts. | Final merge-readiness and ownership drift review. |

## Non-Goals

- No schemas or migrations.
- No new canonical records, feature models, workflow models, or persistence.
- No dashboard rebuild or dashboard-owned action state.
- No broad redesign.
- No provider, payment gateway, signature, financial math, or payment-state
  behavior changes.
- No autonomous AI actions, customer-facing sends, or portal-owned state.
- No merges, PRs, or cleanup work in this approval task.

## Validation Plan

Each implementation stream should run:

```powershell
git fetch origin
pnpm.cmd tooling:baseline -CommandsOnly
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
```

Focused tests, route smoke, screenshots, or browser checks should run when a
stream changes route behavior, helpers, read models, component hierarchy, portal
copy, or ownership labels.

## Verification Plan

Verification runs last after the four implementation streams have committed.
It should confirm:

- Dashboard remains prioritization only.
- Project remains diagnostic.
- Field remains execution owner.
- Financials remains billing, collection, invoice, and payment action owner.
- Communications remains conversation action owner.
- Portal remains customer-safe.
- Reports summarize and route without owning action.
- Settings owns configuration.
- No duplicate invoice, payment, project, job, field, portal, reporting,
  communication, dashboard, or UX ownership models were introduced.
- No schema or migration drift occurred.

## Tooling Requirements

Startup and launch checks:

```powershell
git status
git fetch origin
pnpm.cmd worktree:doctor
pnpm.cmd tooling:baseline
pnpm.cmd tooling:baseline -CommandsOnly
```

Docs-only governance validation:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd tooling:baseline -CommandsOnly
pnpm.cmd exec prettier --check active-waves.md active-worktrees.md .codex/active-stream-plan.md docs/chat-handoff.md docs/review-packets/visual-ux-review-contractor-usability-v1-plan.md
git diff --check
git diff --cached --check
```

## Merge Order

1. `golden-workflow-usability-review-v1`
2. `workspace-density-polish-v1`
3. `manager-page-ownership-polish-v1`
4. `portal-customer-clarity-polish-v1`
5. `verification-ux-ia-ownership-v1`

Verification must merge last after implementation evidence exists.

## Jeff Decision State

Jeff has approved wave and stream/worktree creation for
`visual-ux-review-contractor-usability-v1`.

Jeff has not approved implementation start, merges, PRs, schema/migration work,
provider behavior changes, cleanup, or the next wave from this packet.
