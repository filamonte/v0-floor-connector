# Next Portfolio Recommendation V2

Status: Recommendation only
Doc Type: Review Packet
Review date: 2026-06-07

This packet answers whether `C:\FC-worktrees\project-next-actions` is technical
debt that should be resolved before opening another wave.

It does not approve a wave, create streams, create worktrees, modify production
code, modify schema, merge anything, or touch the dirty
`project-next-actions` worktree.

## Executive Recommendation

Recommended decision: **archive `project-next-actions` after a final
no-unique-work confirmation, then approve the next product wave from current
`main`**.

`project-next-actions` is not a product feature debt blocker. The branch head
is already contained in `origin/main`, and the valuable staged communication
continuity code is already present on current `main` through later
communications work. The remaining dirty staged state is governance debt: it is
an old index on a branch 141 commits behind `origin/main`, and its staged
`docs/current-state.md` blob is stale enough that applying it directly would
roll back current implemented-truth wording.

Portfolio implication: **do not merge or continue from
`project-next-actions`**. Treat it as a stale preserved worktree that needs a
small cleanup decision, not as a stream that must be recovered before product
momentum continues.

## Startup And Tooling Readiness

Main checkout:

- Working directory: `C:\FloorConnector`
- Branch: `main`
- Repo root: `C:/FloorConnector`
- Remote: `https://github.com/filamonte/v0-floor-connector.git`
- Main status after fetch: clean and even with `origin/main`
- Ahead / behind: `0 / 0`

Required tooling checks:

- `pnpm.cmd worktree:doctor`: passed, `PASS: 20`
- `pnpm.cmd tooling:baseline -CommandsOnly`: passed

Baseline commands reported:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd devtools:link
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
```

## Project Next Actions Assessment

Worktree audited:

`C:\FC-worktrees\project-next-actions`

Live state:

| Field                        | Result                                                   |
| ---------------------------- | -------------------------------------------------------- |
| Branch                       | `stream/project-next-actions`                            |
| Upstream                     | `origin/stream/project-next-actions`                     |
| Last commit                  | `c53b7d25 feat: add project next actions panel`          |
| Last commit date             | 2026-05-31 23:47:53 -0400                                |
| Age                          | About 7 days old as of 2026-06-07                        |
| Ahead / behind `origin/main` | `0 / 141`                                                |
| Branch head relation         | `c53b7d25` is an ancestor of `origin/main`               |
| Clean / dirty                | Dirty index; staged changes only, no unstaged file edits |
| Diff check on staged changes | `git diff --cached --check` passed                       |

Staged files in the dirty worktree:

- `apps/web/app/(app)/contracts/[contractId]/page.tsx`
- `apps/web/app/(app)/customers/[customerId]/page.tsx`
- `apps/web/app/(app)/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `apps/web/components/related-conversations-card.tsx`
- `apps/web/lib/communications/record-continuity.test.ts`
- `apps/web/lib/communications/record-continuity.ts`
- `docs/current-state.md`

Staged diff size against the old branch head:

- 299 insertions
- 13 deletions
- 8 files

### Strategic Value

The original idea was valuable: record-scoped communication continuity panels
for Project, Customer, Contract, and Invoice Workspaces, filtered by tenant and
source record, with recent thread snippets and handoffs back to
`/communications`.

That value is still strategically aligned with FloorConnector's command-center
model because it reinforces record-linked communication instead of a detached
inbox.

### Recovery Finding

The useful staged code is already recovered on current `main`.

Evidence from current `main`:

- `apps/web/lib/communications/record-continuity.ts` already contains
  `filterRecordCommunicationContinuityThreads`, recent item derivation,
  tenant/source filtering, and status/boundary labels.
- `apps/web/components/related-conversations-card.tsx` already consumes scoped
  threads and renders recent items.
- `docs/current-state.md` already records Communications Record Continuity v1.
- Current `main` has communication-continuity commits including
  `6de1f484 feat: add record communication continuity panels`.

### Overlap Risk

Overlap risk is **high** if the worktree is merged or used as a recovery base.

Reasons:

- The branch is 141 commits behind `origin/main`.
- The staged docs blob is stale relative to current `docs/current-state.md`.
- Directly applying the staged index against current `origin/main` would
  attempt to delete or downgrade many later documentation and product-truth
  updates.
- The work overlaps with completed waves:
  - `operational-command-center-v1`
  - `sales-to-production-readiness-v1`
  - `field-execution-depth-v1`
  - `mobile-field-capture-closeout-v1`
  - `customer-portal-trust-v1`

### Abandonment Finding

This worktree should be treated as **functionally abandoned but already
salvaged**.

It is not abandoned because the product idea was bad. It is abandoned because
the branch head has already landed on `main`, later streams superseded its
context, and the remaining dirty state is not a clean source of truth.

### Disposition Recommendation

Recommended disposition:

1. Do not merge `stream/project-next-actions`.
2. Do not cherry-pick from the dirty staged index.
3. Record that the useful communication-continuity behavior is already on
   `main`.
4. After explicit Jeff cleanup approval, archive or retire the worktree and
   branch through the governed cleanup path.
5. If Jeff wants extra caution, run a small cleanup/remediation task that
   verifies there is no `git diff --cached` content in the worktree that is
   missing from `origin/main`, then retire it.

Decision label: **archive, not recover**.

## Product Maturity Assessment

### Strongest Areas

- Canonical operating core: opportunity, customer, project, estimate, contract,
  change order, job, invoice, and payment are connected enough to support real
  operating workflows.
- Project Workspace: strongest diagnostic hub, with command-center summaries,
  ProjectPulse, timeline, evidence/closeout continuity, communications context,
  operational intelligence, and next-action ownership.
- Field execution: Daily Logs, Job Notes, field evidence, closeout readiness,
  and Field Work Items now feel materially connected to schedule and project
  context.
- Customer portal trust: customer-safe project, billing, and communication
  clarity is now stronger without creating portal-owned records.
- Financial visibility: AR, payments, payment events, collections follow-up,
  and Financials Home are credible read-only control surfaces over canonical
  financial records.
- Governance/tooling: worktree rules, wave packets, review gates, and
  `worktree:doctor` are strong enough to support governed parallel work with a
  human review gate.

### Weakest Areas

- Reporting remains broad but shallow. `/reports` is useful, but owner-level
  operating reports and decision-ready management views are not yet deep.
- Financial closeout and collections still lack deeper action workflows such as
  retry/refund/dispute depth, accounting handoff, job-cost context, and
  closeout-to-invoice follow-through.
- Guided Project Capture is still future direction, leaving pre-estimate
  measurement, site condition, product preference, confidence, and assessment
  packaging as a major gap.
- Workforce and labor visibility is present but not yet management-grade for
  labor planning, production assumptions, utilization, payroll handoff, or job
  costing.
- Dirty historical worktrees still create operational noise and can confuse
  future parallel-wave launch decisions.

### Remaining Contractor Pain Points

- Owners need a clear "what is happening in the business?" view, not just
  operational page-by-page awareness.
- Billing teams need tighter closeout-to-collections flow after field work
  completes.
- Estimators still need better structured capture before pricing begins.
- Field leaders need clearer labor and crew visibility across projects, not
  only job-by-job execution context.
- Contractors need stronger proof, document, and closeout packaging before
  customer handoff and billing confidence feel complete.

### Current Architectural Risks

- Stale worktrees can be mistaken for active product debt unless they are
  explicitly archived.
- Reporting and intelligence work could become a separate BI truth if it does
  not stay source-record-derived.
- Financial depth can create ledger/payment-state risk if it moves beyond
  read-only visibility without targeted tests.
- Guided capture could duplicate opportunity, project, estimate, task, or AI
  truth if scoped incorrectly.
- Workforce/labor depth could drift into payroll, crew, vendor, or job-costing
  behavior before ownership and financial boundaries are clear.

### Current Workflow Gaps

- Owner operations reporting is not yet a daily management cockpit.
- Closeout-to-billing-to-collections still needs clearer end-to-end operating
  pressure.
- Pre-estimate capture is not yet a structured reusable Assessment Package.
- Labor visibility is not yet connected enough to production, schedule, field,
  and future job-costing decisions.
- Historical stream cleanup is still a governance gap.

## Candidate Waves

### `owner-operations-reporting-v1`

Purpose: turn `/reports` and dashboard-adjacent reporting into an owner-grade
operating review over canonical sales, production, field, and collections
signals.

Contractor value: high. Helps owners understand what is stuck, collectible,
ready, delayed, and slipping.

Technical risk: medium. Must stay read-only and source-record-derived.

### `financial-closeout-collections-v1`

Purpose: tighten closeout-to-invoice-to-collections continuity across Field,
Project, Invoice, Payments, and AR without adding a detached ledger or
collection-task model.

Contractor value: very high. Directly targets cash collection and billing
confidence.

Technical risk: high. Financial math, payment state, and invoice lineage need
focused tests.

### `guided-project-capture-v1`

Purpose: create the first bounded pre-estimate capture layer for site
conditions, measurements, photos, requirements, product preferences, and
estimate-readiness handoff.

Contractor value: very high. Reduces estimate rework and preserves context
before pricing.

Technical risk: high. It must not duplicate projects, estimates, tasks,
takeoff, AI memory, or portal/customer state.

### `workforce-and-labor-visibility-v1`

Purpose: deepen cross-project labor, crew, time-card, and field workforce
visibility using existing people, job assignments, time cards, jobs, and Daily
Logs.

Contractor value: high. Helps owners and field managers see labor pressure,
crew gaps, and production follow-through.

Technical risk: medium/high. Must avoid payroll, commission, job-costing, and
crew-schedule mutation unless explicitly scoped.

### `project-next-actions-cleanup-v1`

Purpose: governance cleanup only. Confirm no unique staged value remains in
`project-next-actions`, then archive/retire the stale worktree and branch after
approval.

Contractor value: indirect but real. Reduces AI development operations risk and
prevents stale branch confusion.

Technical risk: low if cleanup-only and no production code is changed.

### `document-proof-closeout-package-v1`

Purpose: deepen customer-safe closeout package, document proof, warranty/service
handoff, and internal evidence readiness over existing canonical records.

Contractor value: high. Helps contractors prove completion and reduce customer
confusion before final billing.

Technical risk: medium/high. Must avoid stored PDF/document-source-of-truth,
portal evidence leakage, provider sends, and duplicate file models.

### `communications-provider-readiness-v1`

Purpose: prepare provider-backed communication depth through adapter boundaries,
delivery readiness, retry policy, and human-confirmed send gates without live
provider sends.

Contractor value: medium/high. Good prerequisite for real outbound workflows.

Technical risk: high. Provider telemetry must not become business truth.

## Candidate Ranking

### Tier 1: Build Next

1. `financial-closeout-collections-v1`
2. `owner-operations-reporting-v1`
3. `project-next-actions-cleanup-v1`

Rationale: cash and owner visibility are the strongest next product levers
after the completed Field, Portal, Sales-to-Production, and Command Center
waves. Cleanup should happen as a small governance action before or alongside
wave launch, not as a full product wave.

### Tier 2: Build Soon

1. `guided-project-capture-v1`
2. `workforce-and-labor-visibility-v1`
3. `document-proof-closeout-package-v1`

Rationale: these are high-value contractor workflows, but each benefits from
the cash/owner visibility layer and needs careful ownership design.

### Tier 3: Strategic Later

1. `communications-provider-readiness-v1`
2. broader accounting integration
3. broader AI/provider-backed action layers
4. public acquisition / Growth surfaces
5. contractor network / marketplace collaboration

Rationale: these are strategically important but should wait until internal
source-record continuity, reporting, financial controls, and approval boundaries
are deeper.

## Recommended Next Portfolio

Recommended portfolio structure:

1. **Cleanup gate**: retire/archive `project-next-actions` after a final
   no-unique-work confirmation.
2. **Primary next wave**: `financial-closeout-collections-v1`.
3. **Verification stream**: financial workflow verification over invoice,
   payment, closeout, AR, and ownership boundaries.
4. **Follow-up planning**: `owner-operations-reporting-v1` as the next
   reporting/owner cockpit wave after financial closeout pressure is clearer.

Recommended wave: **`financial-closeout-collections-v1`**.

Reason: this is the most contractor-material next capability. Recent waves made
Project, Field, Portal, Communications, and Sales-to-Production clearer. The
highest-value next step is converting completed work and receivables into
cash-control clarity without changing financial truth.

## Recommended Stream Structure

Do not create these streams from this packet. If Jeff approves the wave later,
recommended stream candidates are:

| Stream                                           | Ownership                                                                        |
| ------------------------------------------------ | -------------------------------------------------------------------------------- |
| `closeout-to-invoice-readiness-v1`               | Field/Project closeout readiness handoff into billing review                     |
| `collections-priority-command-v1`                | AR prioritization and customer/project exposure over canonical invoices/payments |
| `payment-exception-review-v1`                    | Payment event exception visibility and owner review without provider mutation    |
| `verification-financial-closeout-collections-v1` | Financial, ownership, duplicate-model, and workflow-boundary verification        |

## Ownership Map

| Surface           | Ownership                                                        |
| ----------------- | ---------------------------------------------------------------- |
| Dashboard         | Prioritizes urgent owner attention only                          |
| Project Workspace | Diagnoses project closeout, readiness, and source-record context |
| Field             | Owns execution capture and closeout evidence                     |
| Financials / AR   | Owns billing, collections, and payment exception action          |
| Communications    | Owns customer follow-up review and message context               |
| Portal            | Customer-safe review/action only                                 |
| Settings          | Tenant configuration                                             |
| Super Admin       | Platform policy                                                  |
| Verification      | Evidence, tests, and no-duplicate-model checks                   |

## Dependency Map

Upstream dependencies:

- Field execution closeout and evidence signals from completed field waves
- Project Workspace operational intelligence and evidence continuity
- AR and Collections Follow-Up Intelligence
- Portal financial visibility and customer-safe communication context
- Existing invoice/payment/payment-event canonical chain

Downstream dependencies:

- Owner operations reporting
- Accounting readiness
- Job costing and budget-vs-actual planning
- Provider-backed communications and payment retry/reconciliation planning
- Customer closeout proof and warranty/service handoff depth

## Overlap Analysis

`project-next-actions` overlap:

- Not a blocker if archived.
- Dangerous if merged or cherry-picked directly.
- Its useful code is already on `main`.

Next-wave overlap:

- Financial closeout/collections will touch high-risk areas:
  `apps/web/app/(app)/financials/**`, `apps/web/app/(app)/invoices/**`,
  `apps/web/lib/financials/**`, possibly Project/Field read models, and
  verification helpers.
- Keep stream ownership narrow and merge verification last.
- Avoid touching portal financial behavior unless a customer-safe read-only
  slice is explicitly scoped.

## Contractor Value Assessment

The next wave should improve cash confidence:

- What field work is complete enough to bill?
- Which invoices need attention first?
- Which payment events are failed, stale, pending, or settled?
- Which customer/project balances are most important today?
- What should an owner or billing manager do next?

This is more valuable than another general polish wave because it connects
operations to collections, where contractor pain is immediate and measurable.

## Technical Risk Assessment

Financial closeout/collections risk is high but manageable if the wave stays
read-only or review-first.

Hard boundaries:

- no invoice math changes without targeted tests
- no payment-state mutation unless explicitly approved
- no duplicate ledger, collection task, payment retry, or accounting model
- no provider calls
- no autonomous reminders
- no portal-owned billing state
- no schema/migration work unless separately approved

## Tooling Readiness

Tooling is ready for another governed wave after cleanup approval:

- `main` is clean and even with `origin/main`.
- Worktree doctor passed.
- Baseline command list is available.
- Review-packet and registry governance are mature.

Tooling caveat:

- `project-next-actions` should not remain an ambiguous dirty worktree through
  another large parallel wave. It does not block product strategy, but it should
  be archived before new stream creation to reduce operational ambiguity.

## Jeff Decision Options

### Approve

Approve cleanup of `project-next-actions` as stale/already-recovered, then
approve a separate wave proposal for `financial-closeout-collections-v1`.

### Modify

Keep the cleanup recommendation but choose `owner-operations-reporting-v1` as
the next product wave if owner visibility is more important than cash-control
depth right now.

### Defer

Do not open another wave. Instead, run a governance cleanup pass across stale
worktrees and registries first.

### Recover Project Next Actions First

Not recommended. Only choose this if Jeff wants a formal no-unique-work audit
packet before archiving. Recovery should not mean merging the branch; it should
mean proving current `main` already contains the useful behavior.

## Explicit Answer

FloorConnector should **not continue directly into another wave while
`project-next-actions` remains ambiguous**, but it also should **not treat
`project-next-actions` as product technical debt that must be implemented or
merged first**.

Best answer: **partially recover by confirmation, then archive**.

Practical sequence:

1. Confirm the dirty worktree has no unique staged value missing from
   `origin/main`.
2. Archive/retire `project-next-actions` with explicit Jeff approval.
3. Open the next wave from clean current `main`.
4. Recommended next wave: `financial-closeout-collections-v1`.

Should Jeff approve another wave immediately?

**Not in the same action.** Jeff can approve the next wave direction now, but
stream creation should wait until the `project-next-actions` cleanup decision is
recorded. The cleanup is small governance debt, not a reason to stop product
momentum.
