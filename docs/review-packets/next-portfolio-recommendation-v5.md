# Next Portfolio Recommendation V5

Status: Recommendation only
Doc Type: Review Packet
Review date: 2026-06-08

This packet recommends the next highest-leverage development portfolio after
`visual-ux-review-contractor-usability-v1` merged, validated, pushed, and moved
into cleanup/retirement flow.

This packet does not approve a wave, create streams, create worktrees, modify
schemas or migrations, merge anything, or start implementation.

## Executive Recommendation

Recommended next move: `guided-project-capture-v1`.

Product Director should choose Guided Project Capture before Workforce & Labor
Visibility and Document Proof Closeout Package.

Reason: the last waves strengthened the operating command center from active
project execution through closeout, billing, collections, owner reporting, UX
ownership, and portal trust. The largest remaining contractor-value gap is now
upstream: structured pre-estimate project capture that collects scope,
conditions, measurements, photos, customer goals, product preferences, and
assessment confidence once, then reuses that context through estimating,
scheduling, production planning, field handoff, closeout, invoicing, and
customer communication.

Guided Project Capture should remain a project-owned Assessment Package layer,
not an estimate, portal-only intake copy, AI-only record, or detached CRM.

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

No schema, migration, provider, payment, signature, accounting, Supabase
remote, or browser tooling is required for this recommendation packet.

## Current Maturity Assessment

### Strongest Areas

- Canonical lifecycle continuity is strong from `opportunity` through
  `payment`.
- Project Workspace is the clearest operational hub, with readiness, next
  actions, timeline, Copilot, field, communications, evidence, closeout,
  service/warranty, and financial continuity.
- Sales-to-production readiness is much clearer across opportunity, estimate,
  contract, deposit/readiness, schedule handoff, and project blocker routing.
- Field execution and mobile capture now have stronger daily execution, field
  handoff, assigned work, quick capture, closeout readiness, and office
  communication handoff.
- Customer portal trust is materially stronger across project status, shared
  documents, financial visibility, communication context, closeout handoff, and
  customer-safe next steps.
- Financial closeout and owner reporting now expose billing readiness,
  collections priority, payment continuity, execution-to-cash visibility,
  labor/field snapshots, and cross-portfolio exceptions.
- UX/IA ownership is now protected by clearer route ownership, dashboard
  prioritization, Reports summarize-and-route behavior, and portal-safe copy.

### Weakest Areas

- Pre-estimate capture remains unimplemented even though it is a major
  upstream source of estimating quality, production clarity, and customer
  confidence.
- Workforce and labor visibility is still management-summary depth, not full
  capacity, utilization, payroll handoff, job-cost, or crew planning depth.
- Document/proof closeout is strong as evidence visibility and browser-print
  output, but not yet a complete durable closeout package workflow.
- Communications are record-linked and review-first, but provider-backed
  customer messaging, automation, reply workflows, and broader send/reply
  lifecycle remain future.
- AI assistance is deterministic and review-first; broad assistant review
  queues, provider-backed AI, and governed action approval are not ready to be
  the next broad wave.
- Contractor Success Platform foundations remain strategic direction, not
  near-term product capability.

### Biggest Remaining Operational Gaps

- Estimators still lack a structured, reusable Assessment Package before they
  start pricing.
- Site photos, measurements, customer requirements, surface conditions, product
  preferences, risk observations, financing interest, and confidence signals do
  not yet form one project-owned pre-estimate package.
- PMs and field supervisors still cannot rely on upstream captured assessment
  context as a production handoff source.
- Labor visibility needs deeper capacity and utilization eventually, but the
  existing owner reporting wave already added an initial labor/field management
  snapshot.
- Closeout/package work needs deeper document workflow, but the portal and
  evidence/receipt waves already improved customer trust downstream.

### Biggest Customer-Facing Gaps

- Customers cannot yet contribute structured pre-estimate project/site context
  in a guided mobile web capture flow.
- Customers cannot yet see that their photos, rooms/areas, needs, finish
  preferences, and constraints have been reviewed into a contractor-owned
  assessment before pricing.
- Customer-facing communication automation remains intentionally unimplemented.
- Document proof closeout can be made richer later, but the upstream customer
  capture gap affects every future estimate and handoff.

### Biggest Owner / Manager Visibility Gaps

- Owners can now see more operating risk, field/labor snapshots, and
  execution-to-cash context, but they still cannot measure the quality of
  project intake before estimating begins.
- Managers lack a standard assessment-readiness view showing which projects
  have enough site/scope context to estimate confidently.
- Workforce capacity still needs deeper treatment, but that visibility is more
  valuable after the system understands what kind of work is entering the
  pipeline.
- Closeout status is increasingly visible; pre-estimate assessment quality is
  the less mature side of the lifecycle.

## Candidate Waves

| Candidate                                    | Tier   | Value summary                                                                                                                        | Primary risk                                                                                                |
| -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `guided-project-capture-v1`                  | Tier 1 | Creates project-owned Assessment Packages before estimating so scope, conditions, photos, areas, goals, and confidence flow forward. | Could duplicate opportunity/project/estimate truth if scoped as a new CRM, estimate, or portal-only intake. |
| `workforce-and-labor-visibility-v1`          | Tier 1 | Deepens crew, labor, active work, capacity, utilization, time, and field-supervisor visibility.                                      | Could drift into payroll, wage costing, GPS, duplicate schedule/crew models, or premature job costing.      |
| `document-proof-closeout-package-v1`         | Tier 1 | Turns proof, shared documents, receipts, closeout readiness, warranty, and portal handoff into a clearer closeout package.           | Could duplicate file/document truth, expose contractor-only field proof, or imply stored PDFs too early.    |
| `communication-automation-readiness-v1`      | Tier 2 | Prepares record-linked communication send/reply readiness and provider-safe follow-up without autonomous sends.                      | Could introduce provider truth, detached inbox behavior, or customer-facing automation too early.           |
| `ai-assistant-review-layer-v1`               | Tier 2 | Builds a broader human-review queue for AI-prepared summaries, drafts, and suggested actions over canonical records.                 | Too early if capture, communication, schedule, and reporting telemetry are not mature enough.               |
| `contractor-success-platform-foundations-v1` | Tier 3 | Begins contractor maturity/service foundations for onboarding, training, technology services, and success-platform posture.          | Could become disconnected MSP/service scope instead of product workflow depth.                              |
| `equipment-maintenance-utilization-v1`       | Tier 3 | Extends equipment beyond registry/assignment into maintenance, utilization, rental return, and job-readiness depth.                  | Valuable but less urgent than intake quality, labor visibility, or closeout package maturity.               |
| `accounting-integration-readiness-v1`        | Tier 3 | Prepares accounting export/sync boundaries over canonical invoices, payments, tax, and payment events.                               | High financial/provider risk and lower immediate contractor adoption than the top three options.            |

## Ranking

### Tier 1: Must-Build Next

1. `guided-project-capture-v1`
2. `workforce-and-labor-visibility-v1`
3. `document-proof-closeout-package-v1`

### Tier 2: Should-Build Soon

1. `communication-automation-readiness-v1`
2. `ai-assistant-review-layer-v1`

### Tier 3: Strategic Later

1. `contractor-success-platform-foundations-v1`
2. `equipment-maintenance-utilization-v1`
3. `accounting-integration-readiness-v1`

## Recommended Wave

### `guided-project-capture-v1`

#### Why Now

The platform has strong downstream continuity. It can guide a project through
estimate, contract, schedule, field, closeout, invoice, payment, collections,
owner reporting, and portal trust. The weaker side is the front of the project:
the information that makes an estimate accurate and makes production less
surprising.

Guided Project Capture now has enough downstream consumers to be high ROI:
Estimate Builder, Project Workspace, CrewBoard field handoff, Daily Logs,
CloseoutTrail, Proof Center, portal status, communications, owner reporting,
and future AI can all reuse the same assessment context.

#### Why Before Workforce & Labor Visibility

Workforce visibility is important, but recent work already added crew/field
signals and owner-level labor-field snapshots. The bigger leverage is knowing
what work is entering the pipeline before labor planning begins. Better capture
improves estimating quality, schedule readiness, field handoff, and labor
planning inputs.

#### Why Before Document Proof Closeout Package

Closeout packaging is valuable, but downstream proof is only as strong as the
scope and conditions captured upstream. Guided Project Capture improves the
source context that later becomes scope, production assumptions, customer
expectations, field handoff, change-order evidence, and closeout explanation.

#### Contractor Pain Solved

Contractors lose time and margin when estimates start from scattered photos,
texts, incomplete measurements, hallway conversations, unstructured site notes,
and customer assumptions that never reach production. Guided Project Capture
solves the "what do we actually know before pricing?" problem.

It helps:

- contractors collect information once instead of reasking later;
- estimators see whether the project is estimate-ready;
- PMs and field supervisors inherit real site context;
- office managers reduce back-and-forth before proposals;
- customers feel heard before receiving a price;
- owners see assessment quality before pipeline work becomes production risk.

#### Expected ROI

High. Better pre-estimate capture should reduce estimator rework, missed scope,
change-order friction, field surprises, customer confusion, and preventable
margin leakage. It also creates a premium vertical workflow that generic
contractor tools rarely model well.

#### Adoption Impact

High. It gives owners, estimators, PMs, sales reps, field supervisors, and
customers a concrete new workflow with visible daily value. It also makes future
AI assistance more credible because AI can reason over structured assessment
context instead of loose notes.

## Stream Plan

Preferred architecture: four implementation streams and one verification stream.

| Stream                                   | Ownership                                   | Mission                                                                                                                                                 | Dependencies                                                                                                    | Validation scope                                                                                                      | Forbidden areas                                                                                                                                       |
| ---------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assessment-package-model-v1`            | Project-owned capture data foundation       | Define the smallest project-owned Assessment Package model and server/read boundaries for pre-estimate capture context.                                 | Current project/opportunity/customer model, tenant membership, storage/evidence boundaries, readiness doctrine. | Migration assertion tests if schema is approved, RLS/tenant tests, server validation tests, typecheck, lint.          | No estimate pricing, no duplicate project/opportunity/customer model, no AI-only records, no portal-owned package, no autonomous actions.             |
| `guided-capture-workspace-v1`            | Contractor Project Workspace / estimator UX | Add contractor-side assessment package workspace for areas, measurements, site conditions, photos/evidence links, and review state.                     | Assessment package foundation; Project Workspace ownership; existing execution attachment/document rules.       | Focused helper/action tests, protected route smoke, typecheck, lint, fast preflight.                                  | No Estimate Builder rewrite, no pricing generation, no takeoff engine, no field subsystem, no provider AI, no schema beyond approved package scope.   |
| `customer-assessment-capture-v1`         | Customer-safe portal/mobile web capture     | Add customer-safe guided capture entry for photos, needs, area basics, constraints, and preferences under existing portal access.                       | Portal project access/grants, customer-safe copy, approved assessment package model.                            | Portal access/denial tests, customer-safe boundary tests, portal route smoke where auth/data allows.                  | No public unauthenticated intake, no portal-only records, no contractor-only proof exposure, no payment/signature changes, no AI customer estimate.   |
| `assessment-to-estimate-handoff-v1`      | Estimator handoff / sales-to-production     | Surface assessment readiness, confidence, missing context, and estimate-start handoff without generating customer-facing pricing.                       | Contractor assessment workspace, estimate creation/readiness patterns, sales-to-production readiness work.      | Handoff helper tests, estimate/project route smoke, workflow ownership checks, typecheck, lint, fast preflight.       | No auto-generated estimate lines, no autonomous AI pricing, no financial math, no contract/invoice mutation, no bypass of estimator review.           |
| `verification-guided-project-capture-v1` | Verification                                | Protect canonical ownership, tenant isolation, portal safety, estimate boundaries, no duplicate models, and no schema drift beyond approved migrations. | All implementation streams complete and committed first.                                                        | Targeted model/RLS/assertion tests, portal boundary tests, operational ownership/golden workflow checks, diff checks. | No feature work, no UI redesign, no loosening tests, no verification before implementation commits exist, no approval of future AI/autonomy behavior. |

## Dependency Map

```text
assessment-package-model-v1
  -> creates the approved project-owned capture foundation

guided-capture-workspace-v1
  -> lets contractor users review and complete assessment context

customer-assessment-capture-v1
  -> lets portal users contribute customer-safe assessment inputs

assessment-to-estimate-handoff-v1
  -> turns reviewed assessment context into estimator readiness and handoff

verification-guided-project-capture-v1
  -> runs last after all implementation streams have real commits
```

## File Overlap Analysis

### Safe Parallel Streams

- `assessment-package-model-v1` can begin first and should own any migrations,
  types, server actions, and shared read/write helpers.
- `guided-capture-workspace-v1` can run in parallel with portal capture only
  after the data contract is stable.
- `customer-assessment-capture-v1` can stay mostly isolated in portal routes and
  customer-safe helper copy if it consumes the shared package helpers.
- `assessment-to-estimate-handoff-v1` should wait until both contractor and
  customer capture shape are clear enough to avoid rework.
- Verification must run last.

### Likely Overlap

- Project detail/workspace route and Project Workspace components.
- Portal project workspace route and portal project helper copy.
- Project, opportunity, customer, estimate, and evidence read helpers.
- Supabase migrations and generated/shared database types if schema is
  approved.
- `docs/current-state.md`, `docs/workflows.md`, and related planning docs after
  implementation lands.
- Verification helpers for operational ownership, portal safety, golden
  workflow, and no duplicate models.

### Recommended Merge Order

1. `assessment-package-model-v1`
2. `guided-capture-workspace-v1`
3. `customer-assessment-capture-v1`
4. `assessment-to-estimate-handoff-v1`
5. `verification-guided-project-capture-v1`

## Risks

- Schema risk: this wave likely needs a new canonical assessment package
  foundation. It must be tenant-scoped, project-owned, RLS-protected, and
  migration-backed.
- Model drift risk: Assessment Package must not become a duplicate project,
  opportunity, estimate, field report, portal intake copy, or AI memory store.
- Scope risk: the first wave should not attempt full takeoff, System Template
  generation, estimate pricing, AI measurement, or native mobile/offline.
- Portal risk: customer capture must only use scoped portal access and must not
  expose contractor-only FieldTrail, Proof Center, internal blockers, raw
  storage paths, or internal Job Notes.
- Estimating risk: assessment context can prepare handoff and readiness; it
  must not auto-generate customer-facing estimates without human review.
- Merge risk: schema/types and Project Workspace route edits are likely shared
  hotspots; sequence them tightly.

## Expected Contractor Value

Guided Project Capture should become the pre-estimate operating layer that
specialty surface contractors feel immediately:

- fewer missing measurements and photos;
- less estimator rework;
- clearer customer requirements before pricing;
- better visibility into site conditions and prep risk;
- stronger PM and field handoff;
- better evidence for change-order conversations;
- more useful portal/customer collaboration before proposal;
- future AI-ready structured context without AI owning truth.

This is the best next Wave #8 candidate because it adds new product leverage at
the weakest remaining point in the canonical lifecycle while reusing the
command-center, portal, field, financial, and UX ownership discipline already
established.

## Jeff Decision Options

Jeff may choose one of:

1. Approve `guided-project-capture-v1` for Architecture Coordination wave
   planning.
2. Modify the recommendation, stream structure, merge order, or initial scope.
3. Defer this wave and choose `workforce-and-labor-visibility-v1`.
4. Choose `document-proof-closeout-package-v1`.
5. Choose a different wave from the candidate set.

No approval is granted by this packet.
