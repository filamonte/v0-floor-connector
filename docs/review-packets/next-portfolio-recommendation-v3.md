# Next Portfolio Recommendation V3

Status: Recommendation only
Doc Type: Review Packet
Review date: 2026-06-07

This packet recommends the next highest-leverage development portfolio after
`financial-closeout-collections-v1` merged, validated, pushed, and completed
cleanup.

This packet does not approve a wave, create streams, create worktrees, modify
schemas or migrations, merge anything, or start implementation.

## Executive Recommendation

Recommended wave: `owner-operations-reporting-v1`.

FloorConnector has materially strengthened the contractor workflow from sales
readiness through field execution, mobile closeout, customer portal trust, and
financial closeout. The next highest-leverage move is to turn that connected
workflow into an owner-grade operating review: a read-only management cockpit
that shows what is selling, ready, executing, billable, collectible, blocked,
and at risk across the business.

This should build on existing canonical records and the current `/reports`
surface. It should not become a BI warehouse, duplicate dashboard, accounting
replacement, workflow engine, or owner-owned source of truth.

## Startup And Tooling Readiness

Main checkout:

- Working directory: `C:\FloorConnector`
- Branch: `main`
- Main status after fetch: clean and even with `origin/main`
- Ahead / behind: `0 / 0`

Required tooling checks:

- `pnpm.cmd worktree:doctor`: passed
- `pnpm.cmd tooling:baseline -CommandsOnly`: passed

Baseline commands reported:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd devtools:link
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
```

## Current Maturity Assessment

### Strongest Areas

- Canonical lifecycle continuity is now strong from `opportunity` through
  `payment`, with project, field, portal, and financial surfaces reading from
  shared source records.
- Project Workspace is the strongest diagnostic hub. It has operational
  intelligence, readiness, field, financial, communication, portal, timeline,
  and closeout context without owning duplicate workflow truth.
- Sales-to-production readiness is clearer. Estimators, project managers, and
  schedulers have better visibility into missing inputs, estimate-to-contract
  readiness, deposit/readiness blockers, and schedule handoff context.
- Field execution and mobile closeout are stronger. Field teams can see job
  handoff context, daily execution guidance, quick capture, blocker signals,
  and closeout readiness over canonical jobs, Daily Logs, field notes, and
  evidence.
- Customer portal trust is materially better. Customers can understand project,
  financial, and communication status through customer-safe projections of
  canonical records.
- Financial closeout and collections are now credible control surfaces over
  billing readiness, invoice/payment continuity, payment events, aging,
  collections priority, and AR action visibility.
- Governance and validation are strong enough to support another governed
  parallel wave with human review gates.

### Weakest Areas

- Owner and management reporting remains broad but shallow compared with the
  depth now available in source workflows.
- Workforce and labor visibility is not yet management-grade for labor
  planning, crew capacity, utilization, production assumptions, payroll
  handoff, or future job-cost context.
- Document and proof packaging is still not a full contractor/customer closeout
  package workflow. Existing closeout package output is useful, but documents
  are not yet a broad record-linked document center.
- Communications is record-linked and provider-dark, but automation readiness,
  delivery proof depth, provider sends, and customer-facing communication
  workflows remain future work.
- Guided Project Capture remains future direction, leaving pre-estimate
  measurements, site conditions, product preferences, photos, confidence, and
  Assessment Packages as a large upstream gap.
- AI remains deterministic and review-first. There is no broad AI assistant
  operating layer, autonomous action, or live AI provider behavior.

### Biggest Remaining Operational Gaps

- Owners still lack one daily operating review that answers what needs
  attention across sales, production, field, labor, billing, collections, and
  customer trust.
- Managers still need clearer cross-project exception queues for stuck
  handoffs, missing prerequisites, field/office blockers, overdue invoices, and
  jobs drifting from expected movement.
- Labor and crew visibility is not yet connected enough to support management
  planning and future job-costing decisions.
- Reports do not yet consolidate the value of the recent command-center waves
  into a single owner-friendly operating cadence.

### Biggest Customer-Facing Gaps

- Customers do not yet receive a richer closeout package experience that
  combines approved proof, documents, project status, payment context, and
  customer-safe communications.
- Customer-facing communication automation remains intentionally unimplemented.
- Guided customer/site capture before estimating remains future direction.
- Service, warranty, and post-closeout customer workflows remain shallow.

### Biggest Owner / Manager Visibility Gaps

- No consolidated owner view for pipeline health, production readiness,
  in-flight execution, closeout readiness, billing readiness, AR, cash pressure,
  and customer blockers.
- No management-grade labor/crew utilization review.
- No weekly operating report or exception rollup that ties the full
  `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`
  chain together.
- No trusted summary layer that helps owners compare what is ready, blocked,
  slipping, collectible, or waiting on customer action.

## Candidate Waves

| Candidate wave                          | Tier   | Value summary                                                                                                                    | Primary risk                                                                                            |
| --------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `owner-operations-reporting-v1`         | Tier 1 | Gives owners and managers a daily/weekly command view over pipeline, readiness, execution, closeout, billing, collections, risk. | Could become a duplicate BI/reporting truth if not strictly source-record-derived.                      |
| `workforce-and-labor-visibility-v1`     | Tier 1 | Improves crew/labor awareness for field supervisors, operations managers, and future job-cost readiness.                         | Could drift into payroll, wage costing, GPS, or new labor models before ownership is ready.             |
| `document-proof-closeout-package-v1`    | Tier 2 | Deepens closeout proof and customer handoff after field/mobile/portal waves.                                                     | Could duplicate document/file truth or expose contractor-only evidence to the portal.                   |
| `communication-automation-readiness-v1` | Tier 2 | Prepares record-linked communications for safer provider-backed action and follow-up.                                            | Could create autonomous sends, provider truth, or disconnected inbox behavior if scoped too broadly.    |
| `guided-project-capture-v1`             | Tier 2 | Reduces estimator friction by structuring pre-estimate assessment inputs for reusable downstream context.                        | Could duplicate opportunity/project/estimate truth or become too large without schema planning.         |
| `ai-assistant-review-layer-v1`          | Tier 3 | Starts the review-first AI operating layer over canonical records.                                                               | Too early for broad AI if owner reporting, labor visibility, and communication readiness are not tight. |
| `accounting-integration-readiness-v1`   | Tier 3 | Prepares future accounting handoff without replacing accounting systems.                                                         | High financial/provider risk and lower immediate adoption than owner reporting.                         |
| `service-warranty-continuity-v1`        | Tier 3 | Extends post-closeout customer and project continuity.                                                                           | Valuable, but depends on proof/package and customer communication depth.                                |

## Ranking

### Tier 1: Must-Build Next

1. `owner-operations-reporting-v1`
2. `workforce-and-labor-visibility-v1`

### Tier 2: Should-Build Soon

1. `document-proof-closeout-package-v1`
2. `communication-automation-readiness-v1`
3. `guided-project-capture-v1`

### Tier 3: Strategic But Later

1. `ai-assistant-review-layer-v1`
2. `accounting-integration-readiness-v1`
3. `service-warranty-continuity-v1`

## Recommended Wave

### `owner-operations-reporting-v1`

#### Why Now

The last six waves improved the underlying operating chain. Owners now need the
business-level lens that converts those improvements into daily decisions. This
wave should consolidate existing source-record signals instead of adding another
module.

#### Why Before The Others

- Before `workforce-and-labor-visibility-v1`: owner reporting can expose the
  highest-value labor questions first, then labor depth can answer them with
  better boundaries.
- Before `document-proof-closeout-package-v1`: reporting can show where
  closeout/package gaps are creating billing, portal, or customer friction.
- Before `communication-automation-readiness-v1`: reporting can identify which
  communication gaps are operationally expensive before provider behavior is
  expanded.
- Before `guided-project-capture-v1`: reporting gives owners current operating
  control while guided capture remains a larger upstream product expansion.
- Before `ai-assistant-review-layer-v1`: AI should explain and prepare work
  over trusted reporting and canonical signals, not compensate for missing
  management visibility.

#### Contractor Pain Solved

Contractor owners and operations managers need to know:

- Which jobs are ready, blocked, active, complete, billable, or slipping?
- Which invoices need attention and which payments/events explain current cash
  pressure?
- Which projects are waiting on customers, field evidence, office action, or
  financial follow-up?
- Which handoffs are slowing the path from sold work to completed work to cash?
- Where should management spend the next hour?

#### Expected ROI

High. This wave should reduce management time spent hunting through pages,
increase billing and collection discipline, surface handoff bottlenecks, and
make weekly owner review more reliable without requiring new schema or provider
behavior.

#### Expected Adoption Impact

High. Owners, operations managers, office managers, estimators, project
managers, field supervisors, and finance users all benefit from a shared
management view. The surface should become a daily or weekly operating habit.

## Stream Plan

Preferred architecture: four implementation streams and one verification
stream.

| Stream                                       | Ownership area                          | Mission                                                                                                                                        | Dependencies                                                                                                                                                            | Validation scope                                                                                                  | Forbidden areas                                                                                                                                                |
| -------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `owner-operations-summary-v1`                | Reports / Dashboard prioritization      | Create the owner operating summary over pipeline, production readiness, active execution, closeout, billing, collections, and customer risk.   | Existing `/reports`, Dashboard attention groups, project readiness, sales readiness, field/mobile closeout, portal trust, financial closeout.                           | Read-model tests where helpers change; reports route smoke if UI changes; typecheck, lint, preflight, diff check. | No duplicate dashboard model, persisted KPI table, workflow mutation, automation, schema changes, or owner-owned business truth.                               |
| `execution-to-cash-reporting-v1`             | Reports / Financial and production flow | Show the path from scheduled/executed/completed work through billing readiness, invoice state, payment events, collections priority, and cash. | Canonical jobs, Daily Logs, closeout readiness, invoices, payments, payment events, retainage/progress billing context, financial closeout helpers.                     | Financial lineage tests, payment-state/readiness tests, typecheck, lint, preflight, diff check.                   | No accounting replacement, invoice/payment math changes, duplicate AR model, provider changes, retry/refund/dispute automation, schema changes, or migrations. |
| `labor-field-management-snapshot-v1`         | People / Field / Reports visibility     | Provide read-only management visibility into crew coverage, active labor, time-card signals, incomplete field work, and labor attention.       | Existing workforce/time foundations, jobs, job assignments, Daily Logs, field notes, field execution visibility.                                                        | Labor snapshot helper tests; operational ownership tests; typecheck, lint, preflight, diff check.                 | No payroll, wage calculations, job costing, GPS, labor schema, crew scheduling replacement, or time mutation.                                                  |
| `portfolio-risk-exceptions-v1`               | Reports / Manager exception queues      | Create cross-project exception queues for stuck handoffs, missing prerequisites, field/office blockers, overdue financial items, portal risk.  | Project Workspace operational intelligence, sales-to-production readiness, field/mobile closeout signals, portal trust signals, financial closeout/collections signals. | Exception derivation tests; golden workflow/ownership checks; typecheck, lint, preflight, diff check.             | No duplicate task/cue/work-item model, autonomous assignment, customer sends, provider actions, schema changes, or dashboard sprawl.                           |
| `verification-owner-operations-reporting-v1` | Verification / Governance               | Protect canonical ownership, read-only reporting boundaries, financial math, labor boundaries, no duplicate reporting models, no schema drift. | All implementation streams complete and committed first.                                                                                                                | Focused verification tests, operational ownership, golden workflow, typecheck, lint, preflight, diff check.       | No feature work, UI redesign, schema changes, migrations, loosening checks, or running before implementation commits exist.                                    |

## Dependency Map

```text
owner-operations-summary-v1
  -> shared report composition and owner summary shell

execution-to-cash-reporting-v1
  -> depends on financial closeout helpers and owner summary placement

labor-field-management-snapshot-v1
  -> depends on existing People/Field/time records and report placement

portfolio-risk-exceptions-v1
  -> depends on all prior signal groups to avoid duplicate exception logic

verification-owner-operations-reporting-v1
  -> runs last after implementation stream commits exist
```

## File Overlap Analysis

### Likely Hotspots

- `apps/web/app/(app)/reports/page.tsx`
- `apps/web/lib/reports/**`
- `apps/web/lib/dashboard/**`
- `apps/web/lib/projects/**`
- `apps/web/lib/financials/**`
- `apps/web/lib/payments/**`
- `apps/web/lib/field/**`
- `apps/web/lib/schedule/**`
- `apps/web/lib/people/**`
- `apps/web/lib/verification/**`
- `docs/golden-workflow-verification-matrix.md`
- `docs/review-packets/**`

### Safe Parallel Streams

- `execution-to-cash-reporting-v1` can work in financial/reporting helpers if
  the owner summary stream owns final report page composition.
- `labor-field-management-snapshot-v1` can work in labor/field read models if
  it avoids shared report layout until merge.
- `portfolio-risk-exceptions-v1` should wait for enough signal shapes from the
  summary and financial/labor streams, but can draft independent exception
  derivation tests.

### Coordination Points

- One stream should own final `/reports` page layout composition to avoid
  parallel UI conflicts.
- Metric labels must stay conservative and explain source records. Avoid
  profitability, margin, payroll, or job-cost language unless current records
  support it.
- Financial and payment summaries must reuse canonical invoice/payment/payment
  event interpretation from the financial closeout wave.
- Labor summaries must be explicitly read-only and avoid payroll or wage-cost
  claims.
- Exception queues must route users back to owning workspaces instead of
  creating a separate work queue.

### Recommended Merge Order

1. `owner-operations-summary-v1`
2. `execution-to-cash-reporting-v1`
3. `labor-field-management-snapshot-v1`
4. `portfolio-risk-exceptions-v1`
5. `verification-owner-operations-reporting-v1`

## Tooling Readiness

Tooling is ready for this planning recommendation and likely ready for a future
approved wave:

- `pnpm.cmd worktree:doctor` passed on `main`.
- `pnpm.cmd tooling:baseline -CommandsOnly` passed.
- Existing validation commands cover typecheck, lint, fast preflight, and diff
  hygiene.
- Future implementation should add focused tests for any new reporting,
  financial continuity, labor snapshot, exception queue, or verification helper.
- No new tooling, provider, schema, migration, or external CLI dependency is
  required for the recommended wave.

## Product Tests

| Test                   | Result for `owner-operations-reporting-v1`                                                                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contractor Value Test  | Pass. Owners and managers get a direct operating review over the business.                                                                                                  |
| Daily Usage Test       | Pass. The view should become a daily or weekly management surface.                                                                                                          |
| Workflow Friction Test | Pass. It reduces page-hunting across sales, production, field, billing, collections, and portal risk.                                                                       |
| Command Center Test    | Pass. It deepens FloorConnector as one operational command center if it routes back to owning records.                                                                      |
| Canonical Model Test   | Pass if all metrics are derived from existing records and no reporting truth is persisted as a competing model.                                                             |
| Verification Test      | Pass. Read models, financial continuity, labor snapshots, exception queues, and ownership boundaries can all be protected with focused tests.                               |
| Revenue Test           | Pass. Better visibility should improve invoice readiness, collection discipline, handoff speed, and owner focus.                                                            |
| Adoption Test          | Pass. Owners, office managers, PMs, estimators, finance users, and field supervisors all benefit from a single management review, even if each uses different detail views. |

## Risks

- Reporting can become a second source of truth if it persists metrics or
  creates report-owned status.
- Financial summaries can create math or payment-state drift if they reinterpret
  invoices, payments, or payment events instead of reusing canonical helpers.
- Labor visibility can overclaim payroll, utilization, wage cost, or job-cost
  meaning before the underlying models support those claims.
- A dense owner report can become noisy if every signal is treated as equal.
  The wave should prioritize exceptions, readiness, and cash-impacting items.
- Cross-project exception queues can duplicate Work Items or cues if not kept
  as derived routing guidance.

## Expected Contractor Value

This wave should make FloorConnector feel more like a real contractor operating
system because it gives leadership a reliable operating review over the same
records the team already uses. It strengthens the owner and manager workflow
without bypassing Project, Field, Financials, Communications, Portal, or
Settings ownership.

Expected value:

- faster owner awareness of operational bottlenecks
- better weekly management cadence
- better cash pressure visibility
- better handoff accountability
- reduced time spent searching across workspaces
- clearer follow-up priorities for office and finance users
- stronger adoption by owners who need business-wide control, not only
  workflow-specific pages

## Jeff Decision Options

Jeff may choose one of:

1. Approve `owner-operations-reporting-v1` for Architecture Coordination wave
   planning.
2. Modify the recommendation, stream structure, or merge order.
3. Defer this wave and keep the portfolio in planning.
4. Choose a different wave from the candidate set.

No approval is granted by this packet.
