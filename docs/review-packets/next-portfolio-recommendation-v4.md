# Next Portfolio Recommendation V4

Status: Recommendation only
Doc Type: Review Packet
Review date: 2026-06-07

This packet recommends the next highest-leverage move after
`financial-closeout-collections-v1` merged, validated, pushed, and completed
cleanup.

This packet explicitly evaluates whether FloorConnector should open another
feature wave immediately or pause for a visual/user-facing review and UX cleanup
checkpoint first.

This packet does not approve a wave, create streams, create worktrees, modify
schemas or migrations, merge anything, or start implementation.

## Executive Recommendation

Recommended next move:
`visual-ux-review-contractor-usability-v1`.

Decision: pause before another feature wave and run a visual/user-facing review
and contractor usability pass first.

The prior recommendation, `owner-operations-reporting-v1`, remains the highest
feature-wave candidate. However, after six rapid capability waves, FloorConnector
now has many command panels, summaries, readiness sections, action lanes,
customer-safe explanations, and cross-workspace handoffs. The product risk is no
longer lack of capability alone. The next risk is whether a contractor can
understand the workflow without training and whether the pages still feel like
one command center rather than dense collections of panels.

The next move should therefore be a review/polish wave, not a new product
feature wave.

## Startup And Tooling Readiness

Main checkout:

- Working directory: `C:\FloorConnector`
- Branch: `main`
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

## Current Maturity Assessment

### Strongest Areas

- Canonical lifecycle continuity is now strong from `opportunity` through
  `payment`.
- Project Workspace is a serious operational hub, with ProjectPulse, readiness,
  timeline, Copilot, evidence, field, communications, closeout, financial, and
  service/warranty continuity.
- Sales-to-production readiness is clearer across opportunity, estimate,
  contract, deposit/readiness, schedule handoff, and project blocker routing.
- Field execution is stronger through scheduled-job handoff, daily execution
  command, assigned work visibility, quick capture, closeout readiness, and
  communication handoff.
- Customer portal trust is materially better across project status, financial
  visibility, shared documents, communication context, and customer-safe next
  steps.
- Financial closeout and collections now expose billing readiness, AR priority,
  payment event continuity, partial payment visibility, and cash-oriented
  follow-up signals.
- Governance and validation discipline are strong enough to support another
  governed wave with human review gates.

### Weakest Areas

- Visual and interaction consistency has not had a dedicated pass after the
  recent feature waves.
- Owner and manager reporting is still not deep enough, but adding it now risks
  increasing density before the existing surfaces are reviewed.
- Workforce and labor visibility is still foundation-level for management
  planning and future job-cost readiness.
- Guided Project Capture remains a major upstream gap before estimating.
- Document proof and closeout packaging are useful but not yet a full document
  or customer handoff workflow.
- Communications remains provider-dark and review-first; automation readiness
  and provider-backed actions remain future.

### Biggest Remaining Operational Gaps

- Owners still lack one daily business review across pipeline, production,
  field, billing, collections, and customer blockers.
- Managers still need a clearer cross-workflow sense of which page owns each
  action when many surfaces show related summaries.
- Labor visibility is not yet management-grade for crew capacity, utilization,
  payroll handoff, or job-cost context.
- Document/proof packaging is not yet a complete closeout handoff workflow.
- Pre-estimate capture is not yet structured into a reusable project-owned
  Assessment Package.

### Biggest Customer-Facing Gaps

- Portal clarity has improved, but customer-facing route hierarchy should be
  reviewed after the new project, financial, communication, timeline, document,
  and action-hub sections.
- Customers still do not have a richer closeout package experience combining
  approved proof, documents, project status, payment context, and safe
  communication context.
- Customer-facing communication automation remains intentionally unimplemented.
- Guided customer/site capture before estimating remains future direction.

### Biggest Owner / Manager Visibility Gaps

- No consolidated owner review for pipeline health, production readiness,
  execution risk, closeout readiness, billing readiness, AR, cash pressure, and
  customer blockers.
- No management-grade labor/crew utilization view.
- No weekly operating report that connects the full canonical lifecycle into
  one owner-ready cadence.
- No explicit visual proof that new summary layers remain understandable across
  desktop and mobile.

### Biggest UX / IA Risks After Recent Waves

- Dashboard, Project, Reports, Financials, Field, Communications, and Portal now
  all contain command-style summaries. Without a review pass, these may start to
  feel redundant.
- Project Workspace may become too dense even while it remains the correct
  operational root.
- Manager Pages may drift from queue/action surfaces into parallel dashboards.
- Settings links and workflow-default explanations may appear in too many
  operational places if not reviewed for clarity.
- Users may need training to understand the difference between diagnostic
  summaries, action surfaces, customer-safe explanations, and owning workspaces.
- Mobile field and portal surfaces may have text density or action hierarchy
  issues after multiple additions.

## Candidate Next Moves

| Candidate next move                        | Tier   | Value summary                                                                                                                  | Primary risk                                                                                         |
| ------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `visual-ux-review-contractor-usability-v1` | Tier 1 | Reviews visual hierarchy, workflow readability, page density, dashboard sprawl, route ownership, and contractor comprehension. | Could become subjective unless tied to route walkthroughs, screenshots, ownership checks, and fixes. |
| `owner-operations-reporting-v1`            | Tier 1 | Gives owners and managers a daily/weekly operating review over pipeline, readiness, execution, billing, collections, and risk. | Could add another dense command surface before existing pages are visually reconciled.               |
| `workforce-and-labor-visibility-v1`        | Tier 2 | Improves crew/labor awareness for supervisors, operations managers, and future job-cost readiness.                             | Could drift into payroll, wage costing, GPS, or new labor models before ownership is ready.          |
| `document-proof-closeout-package-v1`       | Tier 2 | Deepens proof, documents, closeout packaging, and customer handoff after field/mobile/portal/financial waves.                  | Could duplicate document/file truth or expose contractor-only field proof.                           |
| `guided-project-capture-v1`                | Tier 2 | Reduces estimator friction through structured pre-estimate site/capture inputs and reusable Assessment Package context.        | Larger product expansion; could duplicate opportunity/project/estimate truth without careful design. |
| `communication-automation-readiness-v1`    | Tier 2 | Prepares record-linked communications for safer provider-backed action and follow-up.                                          | Could create autonomous sends, provider truth, or disconnected inbox behavior if scoped too broadly. |
| `ai-assistant-review-layer-v1`             | Tier 3 | Starts a broader review-first AI operating layer over canonical records.                                                       | Too early if UX clarity and reporting ownership are not stable.                                      |
| `accounting-integration-readiness-v1`      | Tier 3 | Prepares future accounting handoff without replacing accounting systems.                                                       | High financial/provider risk and lower immediate adoption than usability and owner visibility.       |
| `service-warranty-continuity-v1`           | Tier 3 | Extends post-closeout customer and project continuity.                                                                         | Valuable, but depends on proof/package and customer communication depth.                             |

## Ranking

### Tier 1: Must-Build Or Must-Check Next

1. `visual-ux-review-contractor-usability-v1`
2. `owner-operations-reporting-v1`

### Tier 2: Should-Build Soon

1. `workforce-and-labor-visibility-v1`
2. `document-proof-closeout-package-v1`
3. `guided-project-capture-v1`
4. `communication-automation-readiness-v1`

### Tier 3: Strategic Later

1. `ai-assistant-review-layer-v1`
2. `accounting-integration-readiness-v1`
3. `service-warranty-continuity-v1`

## Feature-Vs-Review Decision

FloorConnector should run a visual/user-facing review pass first.

This is not a retreat from feature momentum. It is a product-quality checkpoint
after a large capability run. The recent waves improved the workflow, but they
also increased page density and introduced many overlapping command-center
signals. Before adding Owner Operations Reporting, Workforce/Labor Visibility,
or Guided Project Capture, the product should verify that a contractor can still
follow the end-to-end workflow:

```text
Opportunity
-> Customer
-> Project
-> Estimate
-> Contract
-> Schedule / Field
-> Closeout
-> Invoice
-> Payment
-> Collection / Cash
```

The review should answer:

- Does Dashboard still prioritize rather than own action?
- Does Project still diagnose rather than become a mega-dashboard?
- Do Field, Financials, Communications, and Portal still have distinct jobs?
- Are readiness panels, summaries, and command lanes duplicative?
- Are settings links helpful, or do they feel like configuration leakage?
- Can a contractor understand what to do next without training?
- Do desktop and mobile layouts preserve hierarchy and action clarity?

## Recommended Next Move

### `visual-ux-review-contractor-usability-v1`

#### Why Now

Six capability waves have landed in a short sequence. The app now has enough
workflow depth that the highest risk is contractor comprehension, not simply
missing feature count. A review pass now will make the next feature wave more
valuable because it will know where owner reporting, labor visibility, document
packages, or guided capture should fit.

#### Why Before The Others

- Before `owner-operations-reporting-v1`: owner reporting should not pile
  another command surface on top of unresolved dashboard/report/project density.
- Before `workforce-and-labor-visibility-v1`: labor views should inherit a
  clear Field/People/Reports ownership pattern.
- Before `guided-project-capture-v1`: guided capture is a major UX flow and
  should start from a clean information architecture baseline.
- Before `document-proof-closeout-package-v1`: closeout package work depends on
  proof/document/portal hierarchy that should be reviewed first.
- Before `communication-automation-readiness-v1`: automation readiness should
  not proceed until human-facing communication hierarchy is clear.

#### Contractor Pain Solved

Contractors do not only need more features. They need to know:

- where to start the day;
- which page owns the next action;
- what is blocked versus ready;
- what is internal versus customer-facing;
- what is financial action versus project diagnosis;
- which summaries matter and which are supporting context.

This wave reduces cognitive load and protects adoption after the capability
run.

#### Expected ROI

Medium-high and defensive. It may not add a new revenue workflow by itself, but
it protects the ROI of the last six waves by making them easier to understand,
demo, sell, train, and use.

#### Expected User Adoption Impact

High. Cleaner page hierarchy and ownership clarity should improve adoption for
owners, estimators, PMs, office managers, field supervisors, finance users, and
portal users.

#### Feature Or Review / Polish Wave

This should be a review/polish wave. It may include bounded UI cleanup, copy
tightening, hierarchy reduction, route-level screenshots, and ownership
documentation. It must not add new business capability, schema, provider
behavior, automation, financial behavior, or new models.

## Stream Plan

Preferred architecture: four review/polish streams and one verification stream.

| Stream                                | Ownership area                                            | Mission                                                                                                                                   | Dependencies                                                                                                                | Validation scope                                                                                                       | Forbidden areas                                                                                                                                             |
| ------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `golden-workflow-usability-review-v1` | UX Architecture / contractor workflow                     | Walk the golden contractor path from opportunity through cash and identify confusing page hierarchy, missing next-step clarity, and gaps. | Current-state, workflows, golden workflow docs, completed wave packets, implemented routes.                                 | Route walkthrough notes, screenshots where practical, docs packet, typecheck/lint only if code changes, diff checks.   | No feature work, schema, migrations, new routes, fake data, provider behavior, financial mutation, or workflow-state changes.                               |
| `workspace-density-polish-v1`         | Project / record workspace hierarchy                      | Review and optionally tighten Project, Estimate, Contract, Invoice, Job, and Customer workspace density, duplicate summaries, and order.  | Project Workspace additions, sales-to-production readiness, field/mobile closeout, financial closeout, portal-safe context. | Browser smoke/screenshot comparison where practical, focused component checks if changed, typecheck, lint, preflight.  | No new panels for new capability, no duplicate activity model, no source-record mutation, no schema, no migrations, no financial/signature/payment changes. |
| `manager-page-ownership-polish-v1`    | Dashboard / Reports / Field / Financials / Communications | Confirm manager pages stay as prioritization or action queues and do not duplicate each other's command-center purpose.                   | Dashboard digest, `/reports`, CrewBoard, Financials Home, AR, Payments Manager, Communications workspace.                   | Ownership checklist, route screenshots, focused read-model tests only if helpers change, typecheck, lint, preflight.   | No owner reporting feature build, no new KPI persistence, no automation, no collection/payment changes, no provider changes, no dashboard-owned state.      |
| `portal-customer-clarity-polish-v1`   | Customer Portal UX / customer-safe IA                     | Review customer-facing project, financial, document, timeline, and communication clarity for action hierarchy and safe wording.           | Customer Portal Trust V1, portal project/invoice routes, customer-safe communication summaries, portal document visibility. | Portal route smoke or `pnpm.cmd e2e:portal` if changed, screenshot review, customer-safe boundary checklist.           | No portal grants/auth changes, no portal-owned records, no field-proof exposure, no server-action expansion, no payment/signature math changes.             |
| `verification-ux-ia-ownership-v1`     | Verification / UX governance                              | Protect ownership boundaries, dashboard sprawl, page ownership drift, source-record routing, no schema drift, and no feature creep.       | All review/polish streams complete and committed first.                                                                     | Operational ownership tests, golden workflow checks, route-smoke evidence where available, typecheck, lint, preflight. | No feature work, UI redesign beyond verification evidence, schema changes, migrations, loosening tests, or running before review/polish evidence exists.    |

## Dependency Map

```text
golden-workflow-usability-review-v1
  -> establishes end-to-end contractor usability findings

workspace-density-polish-v1
  -> reviews Project and record workspace density using golden workflow findings

manager-page-ownership-polish-v1
  -> reviews Dashboard, Reports, Field, Financials, and Communications ownership

portal-customer-clarity-polish-v1
  -> reviews customer-facing clarity and portal-safe action hierarchy

verification-ux-ia-ownership-v1
  -> runs last after review/polish streams produce evidence
```

## File Overlap Analysis

### Likely Hotspots

- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/app/(app)/reports/page.tsx`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `apps/web/app/(app)/leads/[leadId]/page.tsx`
- `apps/web/app/(app)/estimates/[estimateId]/page.tsx`
- `apps/web/app/(app)/contracts/[contractId]/page.tsx`
- `apps/web/app/(app)/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(app)/jobs/[jobId]/page.tsx`
- `apps/web/app/(app)/schedule/page.tsx`
- `apps/web/app/(app)/field/work-items/page.tsx`
- `apps/web/app/(app)/financials/page.tsx`
- `apps/web/app/(app)/financials/accounts-receivable/page.tsx`
- `apps/web/app/(app)/payments/page.tsx`
- `apps/web/app/(app)/communications/page.tsx`
- `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
- `apps/web/app/(portal)/portal/invoices/[invoiceId]/page.tsx`
- `apps/web/components/**`
- `apps/web/lib/verification/**`
- `docs/golden-workflow-verification-matrix.md`
- `docs/review-packets/**`

### Safe Parallel Streams

- Golden workflow review can run as evidence-first planning and screenshots
  before any UI edits.
- Workspace density polish can focus on record workspaces while manager-page
  ownership polish focuses on global queue/report/action pages.
- Portal clarity polish can run separately if it avoids shared contractor app
  components until coordination.
- Verification should wait until the review/polish evidence and any bounded UI
  edits are complete.

### Coordination Points

- One stream should own any shared layout/component edits to avoid cross-stream
  churn.
- Any Project Workspace ordering change must coordinate with manager-page
  ownership so Project remains diagnostic.
- Any Dashboard or Reports adjustment must avoid pre-building Owner Operations
  Reporting V1.
- Any portal copy/layout adjustment must preserve customer-safe visibility and
  avoid contractor-only readiness language.
- Any code changes should be small, visual/hierarchy-focused, and supported by
  screenshots or focused smoke evidence.

### Recommended Merge Order

1. `golden-workflow-usability-review-v1`
2. `workspace-density-polish-v1`
3. `manager-page-ownership-polish-v1`
4. `portal-customer-clarity-polish-v1`
5. `verification-ux-ia-ownership-v1`

## Tooling Readiness

Tooling is ready for this recommendation and for a future approved review/polish
wave:

- `pnpm.cmd worktree:doctor` passed.
- `pnpm.cmd tooling:baseline -CommandsOnly` passed.
- Existing validation commands cover typecheck, lint, fast preflight, and diff
  hygiene.
- The Browser/Playwright route-smoke path is appropriate for a future UX pass
  because visual hierarchy and route clarity are part of the acceptance
  evidence.
- No schema, migration, provider, payment, signature, or accounting tooling is
  required.

## Product Tests

| Test                       | Result for `visual-ux-review-contractor-usability-v1`                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Contractor Value Test      | Pass. Contractors benefit when the workflow is understandable without training.                                                          |
| Daily Usage Test           | Pass. Daily users need clearer hierarchy before more panels are added.                                                                   |
| Workflow Friction Test     | Pass. The wave targets page-hunting, duplicate summaries, and unclear next-action ownership.                                             |
| Command Center Test        | Pass. It protects the command-center model by checking whether surfaces still work as one system.                                        |
| Canonical Model Test       | Pass. The recommended move should not introduce models; it should verify source-record routing and ownership.                            |
| Verification Test          | Pass. Route walkthroughs, screenshots, ownership checks, golden workflow checks, and operational ownership tests provide a clear path.   |
| Revenue Test               | Medium-high. It protects selling, training, demo, and adoption value rather than adding a new revenue workflow.                          |
| Adoption Test              | Pass. Better visual hierarchy should increase adoption across owner, office, field, finance, and portal users.                           |
| UX Clarity Test            | Strong pass. This is the primary purpose of the wave.                                                                                    |
| Dashboard Sprawl Risk Test | Strong pass if the wave explicitly verifies Dashboard, Reports, Financials, Field, Communications, and Project do not duplicate purpose. |
| Page Ownership Drift Test  | Strong pass if verification maps each action surface back to its owning workspace.                                                       |

## Risks

- A UX review wave can become subjective if it does not produce route-specific
  findings, screenshots, ownership decisions, and validation evidence.
- A polish wave can accidentally become feature work. The stream briefs must
  forbid new capabilities, schema, migrations, provider behavior, and workflow
  mutation.
- Over-polishing too early can slow momentum. Keep the wave bounded to the
  highest-traffic contractor and portal paths.
- Shared component edits can create broad regression risk. Assign shared layout
  ownership clearly and keep visual changes small.
- Browser/screenshot validation may require saved auth or route-smoke setup; any
  blocked route checks should be reported honestly.

## Expected Contractor Value

This wave should make the last six waves easier to use. It should help a
contractor understand where to start, what matters now, which page owns the next
action, which information is internal versus customer-facing, and how work moves
from sale to field to invoice to payment.

Expected value:

- clearer demos and onboarding;
- lower training burden;
- less page-hunting;
- fewer duplicate summaries;
- cleaner page hierarchy on dense routes;
- safer next feature placement;
- better adoption across office, field, owner, finance, and customer users.

## Next Feature After This Checkpoint

If Jeff approves and completes `visual-ux-review-contractor-usability-v1`, the
recommended next feature wave remains `owner-operations-reporting-v1`, unless
the review evidence finds a more urgent blocker.

## Jeff Decision Options

Jeff may choose one of:

1. Approve `visual-ux-review-contractor-usability-v1` for Architecture
   Coordination wave planning.
2. Modify the recommendation, stream structure, or merge order.
3. Defer this checkpoint and proceed with a feature wave later.
4. Choose a different next move from the candidate set.

No approval is granted by this packet.
