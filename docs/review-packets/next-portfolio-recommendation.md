# Next Portfolio Recommendation

Status: Proposed / Jeff Review Required
Doc Type: Portfolio Recommendation
Review date: 2026-06-07

This packet recommends the next highest-leverage development portfolio after
the merged `operational-command-center-v1`,
`sales-to-production-readiness-v1`, and `field-execution-depth-v1` waves. It is
portfolio planning only. It does not approve a wave, create streams, create
worktrees, modify schemas, start implementation, or authorize work in any
dirty/out-of-scope worktree.

The recommended portfolio must preserve the canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Maturity Assessment

FloorConnector has moved past early feature coverage. The operating core is
real: opportunities, customers, projects, estimates, contracts, change orders,
jobs, invoices, payments, portal access, people, schedule, daily logs, field
notes, execution attachments, communications foundations, financial command
surfaces, and deterministic intelligence all exist on shared canonical records.

### Strongest Areas

- The canonical contractor chain exists and is connected from opportunity
  through payment.
- Project Workspace is now a practical diagnostic hub instead of a passive
  record page.
- CrewBoard, Field, Communications, and Financials have clearer owning-workspace
  boundaries after the recent command-center waves.
- Sales-to-production readiness now makes the upstream handoff into estimating,
  contracts, deposits, and scheduling easier to trust.
- Field execution has a stronger canonical path from schedule handoff through
  daily execution and crew visibility.
- Verification and governance are mature enough to support bounded parallel
  waves with human review.

### Weakest Areas

- Daily field capture is still not as fast or sticky as the operating model
  needs for crews, supervisors, and office staff.
- Portal trust remains foundation-level: customers can review and act on shared
  records, but broader customer-safe project confidence is still thin.
- Reporting is still foundation-level; owners need clearer weekly operating
  views over sales, production, field, collections, and bottlenecks.
- Materials, equipment, procurement, job costing, and shared evidence remain
  partial foundations around the core.
- Provider-backed communication, delivery, retry, accounting, tax, e-sign,
  payment reconciliation, refunds, and disputes remain sensitive future depth.

### Biggest Remaining Operational Gaps

- Fast capture of what happened in the field, what is blocked, what proof was
  collected, and what is ready for office follow-through.
- Customer-safe status clarity that reduces calls without leaking internal
  field, financial, provider, or readiness details.
- Owner-level reporting that explains where work is stuck and where cash is
  waiting.
- Pre-estimate project capture depth for measurements, photos, conditions, and
  estimate-ready context.
- Financial and closeout continuity from field proof into billing, collections,
  warranty, and customer communication.

## Candidate Waves

| Candidate wave                      | Business value                                                                                              | User impact                                                       | Operational impact                                                                                   | Architectural risk                                                                                                               | Implementation complexity |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `mobile-field-capture-closeout-v1`  | High: field proof, blockers, and closeout readiness reduce admin drag and accelerate billing.               | High for field supervisors, crews, PMs, and office staff.         | High: strengthens Field, Project, Communications, and Financials from one daily workflow.            | Medium if it reuses Daily Logs, field notes, work items, and execution attachments; high if it creates a second field subsystem. | Medium.                   |
| `customer-portal-trust-v1`          | High: fewer status calls, stronger customer confidence, clearer review/sign/pay behavior.                   | High for customers, PMs, office staff, and owners.                | Medium/high: projects, documents, invoices, contracts, and communications become more customer-safe. | Medium/high because portal copy, access, and internal leakage risks are serious.                                                 | Medium.                   |
| `owner-operations-reporting-v1`     | High: owners pay for visibility into sales, production, AR, field blockers, and workflow bottlenecks.       | High for owners and operations managers; medium for crews.        | High: turns command-center source signals into weekly management views.                              | Medium if read-only over canonical records; high if it creates reporting truth.                                                  | Medium.                   |
| `guided-project-capture-v1`         | High: better estimate inputs, less re-entry, higher close rate, stronger production handoff.                | High for estimators, sales reps, PMs, and customers where scoped. | High: improves the front of the lifecycle before estimate work begins.                               | High because Assessment Package, area/space capture, attachments, and future AI/takeoff boundaries need careful modeling.        | High.                     |
| `financial-closeout-collections-v1` | High: helps collect money and move completed work through invoice, payment, retainage, and closeout review. | High for office managers, owners, and PMs.                        | Medium/high: connects field completion, proof, invoices, payment events, and AR follow-up.           | High near invoice math, payment state, provider, refunds, disputes, and accounting boundaries.                                   | Medium/high.              |
| `equipment-resource-readiness-v1`   | Medium/high: reduces job-day surprises for machines, tools, and resource availability.                      | High for field supervisors and schedulers.                        | Medium/high: strengthens Field and CrewBoard readiness.                                              | Medium if advisory over existing equipment/job records; high if it creates resource calendars or hard schedule blocks too early. | Medium.                   |
| `documents-submittals-proof-v1`     | Medium/high: improves professional delivery, specs, warranties, submittals, and closeout evidence.          | Medium/high for office, PMs, and customers.                       | Medium: strengthens Project, Portal, Communications, and closeout.                                   | Medium/high around storage, versions, visibility, and provider sends.                                                            | Medium/high.              |

## Candidate Rankings

### Tier 1: Must Build Next

1. `mobile-field-capture-closeout-v1`
2. `customer-portal-trust-v1`
3. `owner-operations-reporting-v1`

### Tier 2: Should Build Soon

1. `guided-project-capture-v1`
2. `financial-closeout-collections-v1`
3. `equipment-resource-readiness-v1`

### Tier 3: Strategic But Later

1. `documents-submittals-proof-v1`
2. broader accounting/tax/e-sign/provider reconciliation
3. AI assistant action execution, public acquisition, and contractor success
   platform services

## Recommended Wave

Recommended wave: `mobile-field-capture-closeout-v1`.

Wave goal: make daily field capture fast enough that crews and supervisors use
it naturally, while turning field notes, blockers, photos/evidence, Daily Logs,
and closeout signals into office-ready follow-through for Project,
Communications, Financials, and customer-safe downstream work.

### Why Now

The last wave made field execution state clearer. The next leverage point is to
make field input easier and more valuable, because the command center is only as
useful as the source evidence crews and supervisors actually capture.

This should happen before portal trust, reporting, and financial closeout depth
because those surfaces should summarize reliable field truth rather than ask
office staff to reconstruct the day from texts, photos, and memory.

### Contractor Pain Solved

- Crews finish the day but office staff still chase photos, notes, blockers,
  quantities, and completion context.
- PMs do not know which jobs need office attention until after calls or manual
  review.
- Billing and closeout are delayed because proof and job status are not easy to
  inspect.
- Customer updates are hard to write because the source field record is too
  scattered.

### Expected ROI

- Less admin time chasing field updates.
- Faster invoice and closeout readiness after execution.
- Better project memory for warranty, service, customer questions, and dispute
  avoidance.
- Stronger proof trail for what was done, what was blocked, and what needs
  office review.

### Expected Adoption Impact

High. Field supervisors and crews touch this workflow daily or weekly. Office
staff and PMs benefit immediately because captured field truth becomes
actionable in Project, Field, Communications, and Financials instead of staying
in informal channels.

## Proposed Stream Structure

### `field-quick-capture-v1`

- Ownership area: fast field capture on existing jobs, Daily Logs, field notes,
  work items, and execution attachments.
- Mission: make adding a job note, blocker, completion observation, or evidence
  from Field/Schedule/Job context faster and clearer on mobile-responsive web.
- Dependencies: current Daily Log, field note, work item, schedule handoff, and
  execution attachment foundations.
- Validation scope: focused helper/action tests for capture context and
  mobile-safe route smoke where UI changes touch protected field routes.
- Forbidden areas: native app, offline sync, GPS, push notifications, new
  storage policy, new field-report table, customer-facing field evidence,
  schema/migrations unless separately approved.

### `closeout-readiness-command-v1`

- Ownership area: completion, blockers, proof, Daily Log, field note, and
  office-review readiness derived from existing field records.
- Mission: turn captured field activity into clear office attention,
  closeout-readiness, and billing-readiness signals without mutating financial
  state.
- Dependencies: `field-quick-capture-v1` for source signal clarity; existing
  Project Workspace and Field read models.
- Validation scope: read-model tests for ready, blocked, missing-proof,
  incomplete, and office-attention states.
- Forbidden areas: invoice creation, payment mutation, financial math,
  automatic customer sends, portal exposure, duplicate closeout task model, new
  activity/event table.

### `field-communications-handoff-v1`

- Ownership area: internal PM summaries and customer-update draft handoff from
  captured field context into existing Communications review paths.
- Mission: help office users prepare internal or customer-safe updates from
  field evidence while keeping all sends explicit, provider-dark unless already
  approved, and review-first.
- Dependencies: field capture and closeout readiness signals; existing
  communication threads/messages and Copilot draft handoff boundaries.
- Validation scope: communication/readiness helper tests and route smoke for
  touched Communications surfaces.
- Forbidden areas: customer email/SMS send, provider calls, notification
  delivery, thread auto-creation from AI, portal-only message copies, exposing
  internal field notes to portal.

### `verification-mobile-field-closeout-v1`

- Ownership area: wave verification, duplicate-model protection, portal-safety
  review, and canonical field workflow coverage.
- Mission: prove the wave stays on canonical jobs, Daily Logs, field notes,
  work items, execution attachments, communications, and project handoff
  records.
- Dependencies: all implementation streams complete and rebased.
- Validation scope: focused verification helper/tests, golden workflow matrix
  updates where needed, docs-claim review, `typecheck`, `lint`,
  `fc:preflight:fast`, and diff checks.
- Forbidden areas: feature implementation, route redesign, schema, runtime
  behavior, fixture shortcuts, loosening existing checks.

## Dependency Map

```text
field-quick-capture-v1
  -> closeout-readiness-command-v1
  -> field-communications-handoff-v1
  -> verification-mobile-field-closeout-v1
```

`field-quick-capture-v1` should land first because it sharpens source context.
`closeout-readiness-command-v1` should consume those source signals.
`field-communications-handoff-v1` should consume closeout and field summary
signals after ownership is clear. Verification should land last.

## File Overlap Analysis

Likely overlap areas:

- `apps/web/app/(app)/field/work-items/**`
- `apps/web/app/(app)/schedule/page.tsx`
- `apps/web/components/schedule-crewboard-presentational.tsx`
- `apps/web/lib/field/**`
- `apps/web/lib/schedule/**`
- `apps/web/lib/projects/**`
- `apps/web/app/(app)/communications/page.tsx`
- `apps/web/lib/communications/**`
- `docs/golden-workflow-verification-matrix.md`
- `docs/review-packets/**`

### Safe Parallel Streams

- `field-quick-capture-v1` and `field-communications-handoff-v1` can begin in
  parallel only if Communications waits to consume stable exported helper
  shapes rather than editing the same field helper files.
- `verification-mobile-field-closeout-v1` should not implement feature work and
  should wait for implementation evidence before final tests/docs.
- `closeout-readiness-command-v1` can start after a short helper contract is
  agreed, but it should avoid editing capture UI files owned by
  `field-quick-capture-v1`.

### Coordination Points

- Shared ownership of field read models must be assigned before streams start.
- Any Project Workspace closeout/readiness display should be owned by
  `closeout-readiness-command-v1`, not duplicated by capture or communications.
- Communications should own only message/draft handoff presentation and helper
  composition, not field evidence truth.
- Portal exposure must stay out of scope unless Jeff explicitly converts this
  into a portal wave.

### Recommended Merge Order

1. `field-quick-capture-v1`
2. `closeout-readiness-command-v1`
3. `field-communications-handoff-v1`
4. `verification-mobile-field-closeout-v1`

## Tooling Readiness

Main checkout preflight on `main` passed:

- `git status --short --branch`: `## main...origin/main`
- `git fetch origin`: passed
- `git rev-list --left-right --count HEAD...origin/main`: `0 0`
- `pnpm.cmd worktree:doctor`: passed, `PASS: 20`
- `pnpm.cmd tooling:baseline -CommandsOnly`: passed

The command list returned by the tooling baseline:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd devtools:link
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
```

Minimum future implementation validation:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd devtools:link
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
git diff --cached --check
```

Docs-only recommendation validation for this packet:

```powershell
pnpm.cmd exec prettier --check docs/review-packets/next-portfolio-recommendation.md
git diff --check
git diff --cached --check
```

## Risks

- Field capture could accidentally become a second field-reporting subsystem
  instead of improving existing Daily Logs, field notes, work items, and
  execution attachments.
- Closeout readiness could drift into financial mutation if it tries to create
  invoices, mark billing complete, or change payment state.
- Customer-update drafting could leak internal field language or imply
  automatic sends.
- Portal trust is tempting but should remain a separate wave after field truth
  is stronger.
- Shared files between Schedule, Field, Project, and Communications create real
  merge overlap if streams are not sequenced tightly.

## Expected Contractor Value

This portfolio passes the contractor value tests:

- Contractor Value Test: clear value in fewer calls, better field proof, faster
  closeout, and less office re-entry.
- Daily Usage Test: crews, field supervisors, PMs, and office staff can use the
  workflow daily or weekly.
- Workflow Friction Test: removes a real bottleneck between job execution,
  office review, customer updates, and billing readiness.
- Command Center Test: strengthens Field first, then Project diagnosis,
  Communications handoff, and Financials readiness without dashboard sprawl.
- Canonical Model Test: stays on existing jobs, Daily Logs, field notes, work
  items, execution attachments, communications, projects, invoices, and
  payments.
- Verification Test: helper/read-model tests, route smoke, and verification
  helpers can govern the behavior.
- Revenue Test: supports executing more work, collecting faster, avoiding
  disputes, and reducing admin labor.
- Adoption Test: field capture and closeout review are sticky because they sit
  directly in daily execution.

## Jeff Decision Options

- Approve: move `mobile-field-capture-closeout-v1` to Architecture
  Coordination for stream proposal, ownership review, dependency review, and
  approval-gate recording.
- Modify: keep the recommended theme but change stream boundaries, merge order,
  or scope.
- Defer: hold portfolio work and continue only governance, QA, or demo/staging
  readiness.
- Choose different wave: select `customer-portal-trust-v1`,
  `owner-operations-reporting-v1`, `guided-project-capture-v1`, or another
  candidate instead.

Jeff can approve this recommendation as the next wave to plan, but this packet
does not approve stream creation or implementation by itself.
