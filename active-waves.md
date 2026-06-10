# Active Waves

Status: Planning-only
Doc Type: Coordination Index

This file is a compact pointer to the current operational capability-wave
planning set. It does not authorize implementation and does not make any planned
wave implemented truth.

For implemented status, use
[docs/current-state.md](C:/FloorConnector/docs/current-state.md).
For documentation authority, use
[docs/document-map.md](C:/FloorConnector/docs/document-map.md). For capability
maturity and Capability -> Program -> Wave -> Stream mapping, use
[docs/capability-registry.md](C:/FloorConnector/docs/capability-registry.md).
For strategic capability navigation, use
[docs/capability-map.md](C:/FloorConnector/docs/capability-map.md).

For active stream status, use
[active-worktrees.md](C:/FloorConnector/active-worktrees.md) and
[.codex/active-stream-plan.md](C:/FloorConnector/.codex/active-stream-plan.md).
The first production-acceleration stream set has merged to `main`; the remaining
active cleanup stream is `architecture-coordination`. Field/Mobile and Portal
remain planning/downstream wave docs until the active registry says otherwise.

Permanent stream governance is defined in
[docs/parallel-development-governance.md](C:/FloorConnector/docs/parallel-development-governance.md).
Future waves may not create new streams until Ownership Area, Dependency
Analysis, Ownership Conflict Check, UX / IA Review, Canonical Model Review,
Verification Strategy, and Architecture Coordination Approval are complete.
Future waves also require documented merge order, active registry update, and a
recorded Jeff approval gate before stream creation or activation.
Before starting stream work, future wave prompts must require
`pnpm.cmd worktree:doctor` and should reference
[docs/automation-tooling-baseline.md](C:/FloorConnector/docs/automation-tooling-baseline.md)
for local dependency, Playwright, optional CLI, and validation-command guidance.

Capability maturity is the preferred progress metric; Program, Wave, Stream,
PR, and commit counts are activity measures only.

Program-level planning is defined in
[docs/program-architecture.md](C:/FloorConnector/docs/program-architecture.md).
The permanent governed execution chain is:

```text
Capability -> Program -> Wave -> Stream -> PR -> Verification -> Merge
```

Programs group multi-wave strategic initiatives. They do not authorize
implementation, branches, worktrees, PRs, verification bypass, or merges.

The governing product architecture principle is defined in
[docs/operational-architecture-v1.md](C:/FloorConnector/docs/operational-architecture-v1.md):
future waves must make FloorConnector feel more like one operational command
center and less like disconnected modules.

## Program Portfolio

| Program | Name                        | Health  | Current wave posture                                                                                                                     |
| ------- | --------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| A       | Assessment Intelligence     | Active  | `assessment-foundation-a1` Batch 1 is approved for stream/worktree creation only; implementation still requires a separate start prompt. |
| B       | Operational Work Management | Planned | Future waves may cover workforce, labor visibility, work ownership, and accountability depth.                                            |
| C       | Communications OS           | Planned | Future waves may cover unified communication, record-linked follow-up, provider delivery, and memory.                                    |
| D       | Field OS                    | Planned | Future waves may cover mobile execution, closeout proof, field packets, inspections, and field depth.                                    |

Program health statuses are `Planned`, `Active`, `Blocked`, `Verification`,
and `Complete`. Program status does not replace wave status or stream status.
No next wave is approved by listing a Program here.

## UX Beta Readiness V1

Proposal date: 2026-06-10.

Wave name: `ux-beta-readiness-v1`.

Review packet:
[docs/review-packets/ux-beta-readiness-v1.md](C:/FloorConnector/docs/review-packets/ux-beta-readiness-v1.md).

Status: Active for mobile field beta polish after financial, schedule, and
production readiness UX merged. The prompt explicitly approved the wave after
PR #19 and PR #20 were confirmed merged.
`ux-architecture-audit-v1` completed the docs/report-only audit and approved
`ux-design-system-foundation-v1` as the first UI-touching stream. PR #21 merged
`ux-design-system-foundation-v1` to `main`; PR #22 merged
`mcp-tool-readiness-v1` to `main`; PR #23 merged
`dashboard-command-center-cleanup-v1` to `main`; PR #24 merged
`record-workspace-rhythm-v1` to `main`; PR #25 merged
`financial-schedule-readiness-ux-v1` to `main`. The current active stream is
`mobile-field-beta-pass-v1`.

Purpose: make the contractor app cohesive, trustworthy, role-aware-ready, and
usable for real beta testing while preserving the canonical operating model.

Approved first stream:

| Stream                     | Review packet                                                               | Ownership area                                                                                                                                                                                    | Dependency posture                                                                             |
| -------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `ux-architecture-audit-v1` | [packet](C:/FloorConnector/docs/review-packets/ux-architecture-audit-v1.md) | Docs-only UX architecture audit across Dashboard, Manager Pages, Record Workspaces, command centers, status/color semantics, action hierarchy, duplication, mobile assessment, and field surfaces | Starts after PR #19 payment schedule readiness and PR #20 opportunity assessment package merge |

Approved implementation stream:

| Stream                           | Review packet                                                                     | Ownership area                                                                                                   | Dependency posture                               |
| -------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `ux-design-system-foundation-v1` | [packet](C:/FloorConnector/docs/review-packets/ux-design-system-foundation-v1.md) | Shared status/readiness badge semantics, action hierarchy, empty-state variants, and reusable UX primitives only | Merged via PR #21; upstream for later UX cleanup |

Approved tooling readiness stream:

| Stream                  | Review packet                                                            | Ownership area                                                                                                                                                                                                             | Dependency posture                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `mcp-tool-readiness-v1` | [packet](C:/FloorConnector/docs/review-packets/mcp-tool-readiness-v1.md) | MCP/tool readiness and usage rules for the UX Beta Readiness wave, including GitHub, Notion, Linear, Figma/FigJam, Stitch, v0, Supabase, Stripe, OpenAI Platform, B12, Assessment Generator, Mem, and Vercel check posture | Starts after PR #21 merge; must be reviewed or explicitly accepted before `dashboard-command-center-cleanup-v1` starts |

Approved dashboard cleanup stream:

| Stream                                | Review packet                                                                          | Ownership area                                                           | Dependency posture                                      |
| ------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------- |
| `dashboard-command-center-cleanup-v1` | [packet](C:/FloorConnector/docs/review-packets/dashboard-command-center-cleanup-v1.md) | Dashboard attention hierarchy, shared badge/action usage, and scan order | Merged via PR #23; upstream for record workspace rhythm |

Approved record workspace rhythm stream:

| Stream                       | Review packet                                                                 | Ownership area                                                                   | Dependency posture                                              |
| ---------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `record-workspace-rhythm-v1` | [packet](C:/FloorConnector/docs/review-packets/record-workspace-rhythm-v1.md) | Lead/Opportunity, Project, Estimate, Contract, Invoice, and Job workspace rhythm | Merged via PR #24; upstream for financial/schedule readiness UX |

Approved financial/schedule readiness UX stream:

| Stream                               | Review packet                                                                         | Ownership area                                                                                         | Dependency posture                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `financial-schedule-readiness-ux-v1` | [packet](C:/FloorConnector/docs/review-packets/financial-schedule-readiness-ux-v1.md) | Financial Readiness, Schedule Readiness, Production Readiness, Financials, Payments, and Field clarity | Merged via PR #25; upstream for mobile field beta polish |

Approved mobile field beta pass stream:

| Stream                      | Review packet                                                                | Ownership area                                    | Dependency posture                                                    |
| --------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------- |
| `mobile-field-beta-pass-v1` | [packet](C:/FloorConnector/docs/review-packets/mobile-field-beta-pass-v1.md) | Mobile assessment capture and field-facing polish | Active after PR #25 financial/schedule/production readiness UX merged |

Proposed later streams:

| Stream                                | Ownership area                                                                 | Gate before activation         |
| ------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------ |
| `settings-super-admin-boundary-ux-v1` | Settings tenant configuration and Super Admin platform-policy boundary clarity | Wait for admin-boundary review |

Required tool posture:

- repo docs remain source of truth
- Notion, Linear, Stitch, Figma, v0, GitHub, and Browser/screenshot tools may
  support planning and exploration only
- all tool usage must be logged in the wave or stream packet
- generated UI must not be applied directly without adapting to FloorConnector
  design-system governance

Shared non-goals:

- no schema or migration work
- no provider/customer-facing sends
- no payment, signature, scheduling, portal access, or financial-state mutation
- no duplicate dashboards, queues, role-specific data models, portal copies, or
  detached financial/signature/payment systems
- no app UI changes in the first audit stream
- no PRs, merges, cleanup, or next-wave continuation without explicit approval

## Beta Readiness Operating Core V1

Proposal date: 2026-06-09.

Wave name: `beta-readiness-operating-core-v1`.

Review packet:
[docs/review-packets/beta-readiness-operating-core-v1.md](C:/FloorConnector/docs/review-packets/beta-readiness-operating-core-v1.md).

Status: Active for first stream only. Jeff authorized
`payment-schedule-readiness-v1` implementation on 2026-06-09 after review.
The remaining proposed streams stay gated. This does not authorize full AIA,
Project creation alignment, scheduling board work, provider behavior, customer
self-service, AI automation, PRs, merges, or cleanup.

Purpose: move FloorConnector from aligned product architecture toward a usable,
marketable beta platform by planning the highest-leverage operating-core gaps
in coordinated streams.

Proposed stream set:

| Stream                              | Review packet                                                                        | Ownership area                                                    | Proposed dependency posture                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `payment-schedule-readiness-v1`     | [packet](C:/FloorConnector/docs/review-packets/payment-schedule-readiness-v1.md)     | Contract payment schedules and Financial Readiness rules          | Merged to `main` as `9b26f481`; upstream for Project handoff and scheduling readiness     |
| `opportunity-assessment-package-v1` | [packet](C:/FloorConnector/docs/review-packets/opportunity-assessment-package-v1.md) | Opportunity-owned Assessment Package planning and transition path | Active after conflict review; Program A assessment patches are contained in `origin/main` |
| `project-handoff-alignment-v1`      | [packet](C:/FloorConnector/docs/review-packets/project-handoff-alignment-v1.md)      | Project creation timing and sales-to-operations handoff           | Waits on payment readiness and assessment ownership clarity                               |
| `ux-governance-beta-cleanup-v1`     | [packet](C:/FloorConnector/docs/review-packets/ux-governance-beta-cleanup-v1.md)     | Beta-blocking UX consistency under design governance              | Can run in parallel if presentation-only and existing-data-only                           |

Shared non-goals:

- no scheduling board implementation
- no full AIA implementation
- no AI automation
- no customer self-service implementation
- no marketplace or ecosystem work
- no major redesign outside governance cleanup
- no duplicate financial, project, assessment, portal, AI, signature, checkout,
  or AIA source of truth

Current active stream: implement `opportunity-assessment-package-v1` from
`stream/opportunity-assessment-package-v1` in
`C:\FC-worktrees\opportunity-assessment-package-v1`. The slice must stay
limited to Opportunity-owned Assessment Package ownership, Lead Workspace
pre-estimate visibility, current Project continuity compatibility, and tests.

## Product UX Governance Alignment V1

Gate date: 2026-06-09.

Wave name: `product-ux-governance-alignment-v1`.

Capability: Product / UX Governance.

Program: Governance-only; this stream prepares documentation and operating
model alignment before larger capability waves.

Architecture Coordination approval: Approved by the explicit docs-only
alignment prompt and current stream creation rule.

Jeff approval gate: Satisfied for this docs-only alignment pass by the
explicit request to run it as the first alignment pass.

Review packet:

- [docs/review-packets/product-ux-governance-alignment-v1.md](C:/FloorConnector/docs/review-packets/product-ux-governance-alignment-v1.md)

Wave status: Active docs-only alignment. This does not authorize app code,
schema, migrations, Supabase work, provider work, UI component changes, tests,
runtime config, PRs, external tool/resource creation, implementation waves, or
merge/cleanup beyond the requested docs-only stream.

Approved stream:

- `stream/product-ux-governance-alignment-v1`

Approved worktree:

- `C:\FC-worktrees\product-ux-governance-alignment-v1`

Ownership:

- target product operating model
- design-system and UX governance
- documentation drift review around Assessment Package, Project creation timing,
  payment schedules, Financial Readiness, Production Readiness, and AIA /
  progress billing posture

Validation expectation:

```powershell
pnpm.cmd exec prettier --write <changed markdown files>
git diff --check
git diff --cached --check
pnpm.cmd worktree:doctor
```

## Program A Execution Preparation

Program A: Assessment Intelligence is the recommended next execution focus
after this final documentation architecture pass. Current maturity is
Foundation, 5 / 100 in
[docs/capability-registry.md](C:/FloorConnector/docs/capability-registry.md).
Use [docs/capability-map.md](C:/FloorConnector/docs/capability-map.md) for the
capability navigation and linked dependencies.

Recommended next implementation areas:

- Assessment Packages
- Guided Project Capture
- Area / Space Modeling
- Photo Capture
- Site Conditions
- Risk Detection
- Estimate Handoff

Approved Wave A1 execution preparation:

- Wave id: `assessment-foundation-a1`
- Program: Program A: Assessment Intelligence
- Capability: Assessment Intelligence
- Current capability maturity: 5 / 100
- Target capability maturity after verified Wave A1 delivery: 20 / 100
- Business outcome: structured site assessments and complete project context
  flow into estimating without losing or recreating work.
- Planning packet:
  [docs/review-packets/program-a-assessment-foundation-a1-plan.md](C:/FloorConnector/docs/review-packets/program-a-assessment-foundation-a1-plan.md)
- Status: Batch 1 Approved / Not Started. `assessment-package-depth-v1` and
  `area-space-model-v1` are approved for branch/worktree creation only. No
  implementation, schema changes, migrations, PRs, provider behavior,
  autonomous AI, portal-owned state, or merges are approved.

Wave A1 stream plan:

| Stream                                  | Status                 | Role                                      | Merge priority |
| --------------------------------------- | ---------------------- | ----------------------------------------- | -------------- |
| `assessment-package-depth-v1`           | Approved / Not Started | Assessment Package depth and continuity   | 1              |
| `area-space-model-v1`                   | Approved / Not Started | Area, room, space, and measurement depth  | 2              |
| `guided-project-capture-workflow-v1`    | Proposed               | Contractor capture workflow depth         | 3              |
| `estimate-handoff-v1`                   | Proposed               | Assessment-to-estimate continuity         | 4              |
| `verification-assessment-foundation-v1` | Proposed               | Wave A1 verification after implementation | 5              |

Earlier requested labels `assessment-package-model-v1` and
`guided-project-capture-v1` are not reused because they already identify a
merged Program A stream and merged Program A wave. The Wave A1 plan preserves
their objectives under conflict-safe successor names.

Other candidate future wave or stream names may include:

- `assessment-package-depth-v1`
- `area-space-model-v1`
- `photo-capture-foundation-v1`
- `site-conditions-risk-detection-v1`
- `estimate-handoff-depth-v1`

The Batch 1 approval is limited to stream readiness and branch/worktree
creation. The next Codex prompt must start implementation in
`C:\FC-worktrees\assessment-package-depth-v1` before any app code, schema,
migration, UI, server utility, or test implementation begins.

## Operational Capability Waves v1

Use
[docs/design/operational-capability-waves-v1-coordination.md](C:/FloorConnector/docs/design/operational-capability-waves-v1-coordination.md)
as the coordination source for the four operational waves:

1. [Project Workspace Capability Wave v1](C:/FloorConnector/docs/design/project-workspace-capability-wave-v1.md)
2. [Scheduling Capability Wave v1](C:/FloorConnector/docs/design/scheduling-capability-wave-v1.md)
3. [Field/Mobile Capability Wave v1](C:/FloorConnector/docs/design/field-mobile-capability-wave-v1.md)
4. [Portal Capability Wave v1](C:/FloorConnector/docs/design/portal-capability-wave-v1.md)

Project Workspace and Scheduling have merged to `main` for the first stream set.
The remaining wave references are planning context and should not be read as
permission to implement all four waves at the same time.

## Parallel Planning Streams

Communications is also tracked as a planned parallel stream:

- [Communications Capability Wave v1](C:/FloorConnector/docs/design/communications-capability-wave-v1.md)

This does not change the four-wave operational sequence above. Communications
planning should stay record-linked and provider-dark until a separately
approved implementation slice is selected.

## Parallel Financials Planning Stream

Use
[docs/design/financials-capability-wave-v1.md](C:/FloorConnector/docs/design/financials-capability-wave-v1.md)
as the planning-only source for the Financials stream. Financials is a planned
parallel market-readiness stream over canonical invoices, payments, payment
events, project financial readiness, and customer-safe portal payment
continuity. It does not change the operational wave order above and does not
authorize payment provider changes, webhooks, accounting integrations, schema,
or duplicate financial models.

Local stream note: the stale `stream/financials` branch/worktree has been
retired as superseded by `stream/financials-reporting`. Financials planning
references remain product-area planning context only; they do not reactivate the
stale local branch, authorize a PR from it, or make it a source for
cherry-picks.

Shared guardrails:

- preserve the canonical lifecycle:
  `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`
- do not create duplicate business models
- keep Project Workspace as the readiness and continuity hub
- keep Scheduling on canonical `jobs` and `job_assignments`
- keep Field/Mobile on canonical execution records
- keep Portal as a scoped customer read/action surface over canonical records
- keep Communications on canonical `communication_threads`,
  `communication_messages`, notifications, and source-record context without
  duplicate message models or provider-send expansion
- keep Financials on canonical invoices, payments, payment events, and
  source-record financial readiness without duplicate ledgers or portal-owned
  billing state

## Automation Readiness

Status: Ready With Human Review Gate.

Agents may draft wave proposals, stream briefs, validation plans, and review
packets from this registry. Agents may not begin a new wave, create active
streams, continue to the next wave, or merge without Architecture Coordination
approval and Jeff review.

## Guided Project Capture V1 Approval Gate

Gate date: 2026-06-08.

Wave name: `guided-project-capture-v1`.

Review packets:

- [docs/review-packets/next-portfolio-recommendation-v5.md](C:/FloorConnector/docs/review-packets/next-portfolio-recommendation-v5.md)
- [docs/review-packets/guided-project-capture-v1-plan.md](C:/FloorConnector/docs/review-packets/guided-project-capture-v1-plan.md)

Wave goal: add a project-owned guided assessment layer that helps internal
users, customers, and estimators gather and review site/context information
before estimate work, while preserving Project as the source of assessment
context and Estimate as the consumer of approved context.

Gate status:

| Gate item                              | Status      | Evidence / note                                                                                                 |
| -------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------- |
| Architecture Coordination approval     | Approved    | Stream ownership, dependencies, non-goals, validation, verification, and merge order are recorded.              |
| Jeff approval gate                     | Satisfied   | Jeff explicitly approved controlled merge of `guided-project-capture-v1`.                                       |
| Stream creation                        | Complete    | Five branches and worktrees were created from the verified current `main` approval baseline.                    |
| Implementation start                   | Completed   | The approved implementation and verification slices landed on `main`.                                           |
| Human review gate                      | Satisfied   | Jeff approved the controlled merge prompt; no PRs were opened.                                                  |
| Autonomous merge / indefinite continue | Not allowed | No PRs, schemas, migrations, provider work, next-wave continuation, or autonomous approval behavior is allowed. |
| Verification                           | Completed   | Verification landed last after implementation stream commits existed.                                           |

Approved stream set:

| Stream                                   | Ownership area                      | Mission                                                                                | Status |
| ---------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------- | ------ |
| `assessment-package-model-v1`            | Project-owned assessment context    | Define and surface Assessment Package context using existing canonical records.        | Merged |
| `guided-capture-workspace-v1`            | Internal guided capture workspace   | Help internal users collect and review project assessment context before estimating.   | Merged |
| `customer-assessment-capture-v1`         | Customer-safe assessment input      | Let customers clarify requested information without making Portal the source of truth. | Merged |
| `assessment-to-estimate-handoff-v1`      | Estimator assessment handoff        | Make approved assessment context usable for estimate creation and review.              | Merged |
| `verification-guided-project-capture-v1` | Guided Project Capture verification | Protect Project ownership, Estimate consumption, Portal safety, AI review-only limits. | Merged |

Approved stream branches:

- `stream/assessment-package-model-v1`
- `stream/guided-capture-workspace-v1`
- `stream/customer-assessment-capture-v1`
- `stream/assessment-to-estimate-handoff-v1`
- `stream/verification-guided-project-capture-v1`

Approved worktrees:

- `C:\FC-worktrees\assessment-package-model-v1`
- `C:\FC-worktrees\guided-capture-workspace-v1`
- `C:\FC-worktrees\customer-assessment-capture-v1`
- `C:\FC-worktrees\assessment-to-estimate-handoff-v1`
- `C:\FC-worktrees\verification-guided-project-capture-v1`

Dependency and merge order:

1. `assessment-package-model-v1`
2. `guided-capture-workspace-v1`
3. `customer-assessment-capture-v1`
4. `assessment-to-estimate-handoff-v1`
5. `verification-guided-project-capture-v1`

Verification must run last after implementation stream commits exist.

Merge result:

- Assessment Package Model V1 merged to `main` as `7ca9d14a`.
- Guided Capture Workspace V1 merged to `main` as `ab7acd0b`.
- Customer Assessment Capture V1 merged to `main` as `d14c1854`.
- Assessment To Estimate Handoff V1 merged to `main` as `73dfc3f2`.
- Verification Guided Project Capture V1 merged to `main` as `6cba7bda`.

Post-merge validation passed: focused assessment package, guided capture
workspace, customer assessment capture, assessment-to-estimate handoff, guided
project capture verification, operational ownership, and golden workflow tests;
typecheck; lint; `pnpm.cmd fc:preflight:fast`; `git diff --check`; and
`git diff --cached --check`.

Wave status: Merged to `main`; completed wave worktrees and branches are
retained pending explicit retirement approval. No next wave is approved by this
merge.

Shared guardrails:

- Assessment Package context belongs to Projects, not Estimates.
- Estimate consumes approved assessment context; it must not fork the assessment
  or pricing model.
- Portal remains a customer-safe input/review surface and must not own
  operational state.
- AI may assist review only; it may not autonomously approve, price, or mutate
  workflow state.
- Do not create schemas, migrations, duplicate project models, duplicate task
  models, duplicate estimate models, or provider behavior in this wave unless a
  later explicit approval changes scope.

## Project Next Actions Retirement

Retirement date: 2026-06-07.

Jeff explicitly approved archiving the stale dirty worktree
`C:\FC-worktrees\project-next-actions`. The branch head was contained in
`origin/main`, no unique commits would be lost, the dirty staged index was
archived outside the canonical repo at
`C:\FC-worktrees\_archive\project-next-actions-2026-06-07.patch`, and no dirty
work was merged. Useful communication-continuity behavior already exists on
`main`; the stale `docs/current-state.md` state was not applied.

This cleanup clears automation risk before the next financial wave. It does not
approve a new wave, create streams, create worktrees, modify schemas or
migrations, or authorize financial feature implementation.

## Owner Operations Reporting V1 Approval Gate

Gate date: 2026-06-07.

Wave name: `owner-operations-reporting-v1`.

Review packets:

- [docs/review-packets/next-portfolio-recommendation-v3.md](C:/FloorConnector/docs/review-packets/next-portfolio-recommendation-v3.md)
- [docs/review-packets/next-portfolio-recommendation-v4.md](C:/FloorConnector/docs/review-packets/next-portfolio-recommendation-v4.md)
- [docs/review-packets/owner-operations-reporting-v1-plan.md](C:/FloorConnector/docs/review-packets/owner-operations-reporting-v1-plan.md)
- [docs/review-packets/owner-operations-reporting-v1.md](C:/FloorConnector/docs/review-packets/owner-operations-reporting-v1.md)

Wave goal: give contractor owners and managers an owner-level operating review
layer that summarizes business movement, execution-to-cash continuity, field
and labor attention, and cross-portfolio exceptions while routing action back
to the owning workspaces.

Gate status:

| Gate item                              | Status      | Evidence / note                                                                                        |
| -------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| Architecture Coordination approval     | Approved    | Stream ownership, dependencies, non-goals, validation, verification, and merge order are recorded.     |
| Jeff approval gate                     | Approved    | Jeff explicitly approved stream/worktree creation for `owner-operations-reporting-v1`.                 |
| Stream creation                        | Complete    | Five branches and worktrees were created from the verified current `main` baseline.                    |
| Implementation start                   | Completed   | The approved implementation and verification slices landed on `main`.                                  |
| Human review gate                      | Satisfied   | Jeff approved the controlled merge prompt; no PRs were opened.                                         |
| Cleanup                                | Completed   | Jeff explicitly approved cleanup; completed worktrees and eligible local branches were retired.        |
| Autonomous merge / indefinite continue | Not allowed | No next wave, PR, schema/migration work, provider work, cleanup, or autonomous action work is allowed. |

Approved stream set:

| Stream                                       | Ownership area                    | Mission                                                                  | Status  |
| -------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------ | ------- |
| `owner-operations-summary-v1`                | Reports / owner operating review  | Summarize owner-level operating health and route action to owning areas. | Retired |
| `execution-to-cash-reporting-v1`             | Reports with Field and Financials | Show continuity from completed work through invoice, payment, and cash.  | Retired |
| `labor-field-management-snapshot-v1`         | Reports with Field / People       | Summarize crew, active work, blocked execution, and field evidence.      | Retired |
| `portfolio-risk-exceptions-v1`               | Reports / owner exception review  | Surface cross-portfolio risks and exceptions without owning action.      | Retired |
| `verification-owner-operations-reporting-v1` | Verification                      | Protect canonical records, ownership boundaries, and no schema drift.    | Retired |

Approved stream branches:

- `stream/owner-operations-summary-v1`
- `stream/execution-to-cash-reporting-v1`
- `stream/labor-field-management-snapshot-v1`
- `stream/portfolio-risk-exceptions-v1`
- `stream/verification-owner-operations-reporting-v1`

Approved worktrees:

- `C:\FC-worktrees\owner-operations-summary-v1`
- `C:\FC-worktrees\execution-to-cash-reporting-v1`
- `C:\FC-worktrees\labor-field-management-snapshot-v1`
- `C:\FC-worktrees\portfolio-risk-exceptions-v1`
- `C:\FC-worktrees\verification-owner-operations-reporting-v1`

Dependency and merge order:

1. `owner-operations-summary-v1`
2. `execution-to-cash-reporting-v1`
3. `labor-field-management-snapshot-v1`
4. `portfolio-risk-exceptions-v1`
5. `verification-owner-operations-reporting-v1`

Verification must run last after implementation stream commits exist.

Merge result:

- Owner Operations Summary V1 merged to `main` as `1181cdf5`.
- Execution-to-Cash Reporting V1 merged to `main` as `f4c3b5cc`.
- Labor Field Management Snapshot V1 merged to `main` as `f4b16512`.
- Portfolio Risk Exceptions V1 merged to `main` as `791156ee`.
- Verification Owner Operations Reporting V1 merged to `main` as `e0c3119d`.

Post-merge validation passed: targeted owner operations summary,
execution-to-cash reporting, labor field management snapshot, portfolio risk
exceptions, owner operations verification, golden workflow, and operational
ownership tests; typecheck; lint; `pnpm.cmd fc:preflight:fast`; and
`git diff --check`.

Wave status: Merged to `main`; completed wave worktrees and eligible local
branches were retired after explicit cleanup approval. No next wave is approved
by this cleanup.

Cleanup plan:
[docs/review-packets/owner-operations-reporting-v1-cleanup-plan.md](C:/FloorConnector/docs/review-packets/owner-operations-reporting-v1-cleanup-plan.md).
Cleanup completed for the five approved owner operations reporting worktrees
and eligible local branches. No matching remote branches existed.

Shared guardrails:

- Reports summarizes, explains, and routes; it does not own operating action.
- Dashboard remains prioritization only.
- Project remains diagnostic.
- Field remains execution owner.
- Financials remains billing, collections, and payment action owner.
- Communications remains communication action owner.
- Settings remains configuration owner.
- Portal remains customer-safe.
- Do not create duplicate reporting, financial, field, labor, workflow, risk,
  or exception models.
- Do not modify schemas or migrations.

## Visual UX Review Contractor Usability V1 Approval Gate

Gate date: 2026-06-07.

Wave name: `visual-ux-review-contractor-usability-v1`.

Review packets:

- [docs/review-packets/next-portfolio-recommendation-v4.md](C:/FloorConnector/docs/review-packets/next-portfolio-recommendation-v4.md)
- [docs/review-packets/visual-ux-review-contractor-usability-v1-plan.md](C:/FloorConnector/docs/review-packets/visual-ux-review-contractor-usability-v1-plan.md)

Wave goal: review and polish contractor-facing UX and information architecture
after the completed capability waves so FloorConnector feels clearer, less
duplicative, and more like one operational command center without changing the
canonical business model.

Gate status:

| Gate item                              | Status      | Evidence / note                                                                                   |
| -------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| Architecture Coordination approval     | Approved    | Stream ownership, dependencies, non-goals, validation, verification, and merge order recorded.    |
| Jeff approval gate                     | Approved    | Jeff explicitly approved stream/worktree creation for `visual-ux-review-contractor-usability-v1`. |
| Stream creation                        | Complete    | Five branches and worktrees were created from the verified current `main` baseline.               |
| Implementation start                   | Completed   | The approved implementation and verification slices landed on `main`.                             |
| Human review gate                      | Satisfied   | Jeff approved the controlled final-refresh-and-merge prompt; no PRs were opened.                  |
| Autonomous merge / indefinite continue | Not allowed | No next wave, schema/migration work, provider work, cleanup, or autonomous action work allowed.   |

Approved stream set:

| Stream                                | Ownership area                          | Mission                                                                 | Status |
| ------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------- | ------ |
| `golden-workflow-usability-review-v1` | End-to-end contractor journey review    | Clarify the Lead-to-Reports golden workflow for contractor users.       | Merged |
| `workspace-density-polish-v1`         | Major workspace density and readability | Reduce clutter and improve hierarchy on high-traffic workspaces.        | Merged |
| `manager-page-ownership-polish-v1`    | Manager page ownership boundaries       | Clarify what manager pages own and where users should act.              | Merged |
| `portal-customer-clarity-polish-v1`   | Customer-facing portal clarity          | Simplify customer-safe portal language and section hierarchy.           | Merged |
| `verification-ux-ia-ownership-v1`     | Verification                            | Protect UX/IA ownership boundaries, duplicate-model risk, and no drift. | Merged |

Approved stream branches:

- `stream/golden-workflow-usability-review-v1`
- `stream/workspace-density-polish-v1`
- `stream/manager-page-ownership-polish-v1`
- `stream/portal-customer-clarity-polish-v1`
- `stream/verification-ux-ia-ownership-v1`

Approved worktrees:

- `C:\FC-worktrees\golden-workflow-usability-review-v1`
- `C:\FC-worktrees\workspace-density-polish-v1`
- `C:\FC-worktrees\manager-page-ownership-polish-v1`
- `C:\FC-worktrees\portal-customer-clarity-polish-v1`
- `C:\FC-worktrees\verification-ux-ia-ownership-v1`

Dependency and merge order:

1. `golden-workflow-usability-review-v1`
2. `workspace-density-polish-v1`
3. `manager-page-ownership-polish-v1`
4. `portal-customer-clarity-polish-v1`
5. `verification-ux-ia-ownership-v1`

Verification must run last after implementation stream commits exist.

Merge result:

- Golden Workflow Usability Review V1 merged to `main` as `32f2151d`.
- Workspace Density Polish V1 merged to `main` as `a726a18c`.
- Manager Page Ownership Polish V1 merged to `main` as `f0a03562`.
- Portal Customer Clarity Polish V1 merged to `main` as `0cc57cd1`.
- Verification UX IA Ownership V1 merged to `main` as `c4017a28`.

Post-merge validation passed: targeted golden workflow usability, portal
clarity, UX/IA ownership verification, operational ownership, and golden
workflow checks; changed portal Playwright specs; typecheck; lint;
`pnpm.cmd fc:preflight:fast`; and `git diff --check`.

Wave status: Merged to `main`; completed wave worktrees and branches are
retained pending explicit retirement approval. No next wave is approved by this
merge.

Shared guardrails:

- Dashboard prioritizes.
- Project diagnoses.
- Field executes.
- Financials owns billing and collection action.
- Communications owns conversation action.
- Portal remains customer-safe.
- Reports summarize and route, not act.
- Settings owns configuration.
- Do not create duplicate ownership, workflow, or business models.
- Do not modify schemas or migrations.

## Financial Closeout Collections V1 Approval Gate

Gate date: 2026-06-07.

Wave name: `financial-closeout-collections-v1`.

Review packet:
[docs/review-packets/financial-closeout-collections-v1-plan.md](C:/FloorConnector/docs/review-packets/financial-closeout-collections-v1-plan.md).

Portfolio recommendation:
[docs/review-packets/next-portfolio-recommendation-v2.md](C:/FloorConnector/docs/review-packets/next-portfolio-recommendation-v2.md).

Wave goal: improve the contractor cash-flow path from field completion through
billing readiness, invoice/payment continuity, collections priority, and cash
visibility without adding accounting replacement behavior or duplicate
financial models.

Gate status:

| Gate item                              | Status      | Evidence / note                                                                                  |
| -------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| Architecture Coordination approval     | Approved    | Stream ownership, dependency map, non-goals, validation, verification, and merge order recorded. |
| Jeff approval gate                     | Approved    | Jeff explicitly approved `financial-closeout-collections-v1` for stream/worktree creation.       |
| Stream creation                        | Complete    | Four branches and worktrees were created from the verified current `main` baseline.              |
| Implementation start                   | Completed   | The approved implementation and verification slices landed on `main`.                            |
| Human review gate                      | Satisfied   | Jeff approved the controlled merge prompt; no PRs were opened.                                   |
| Cleanup                                | Completed   | Jeff explicitly approved cleanup; completed worktrees and eligible local branches were retired.  |
| Autonomous merge / indefinite continue | Not allowed | No PR, next wave, schema/migration work, provider changes, or additional cleanup is approved.    |

Approved stream set:

| Stream                               | Ownership area                    | Mission                                                                | Status  |
| ------------------------------------ | --------------------------------- | ---------------------------------------------------------------------- | ------- |
| `billing-readiness-command-v1`       | Billing readiness                 | Make it clearer when work is ready to invoice.                         | Retired |
| `collections-priority-v1`            | Collections action prioritization | Help contractors understand where collection effort should be focused. | Retired |
| `payment-continuity-v1`              | Payment continuity                | Improve visibility from invoice through payment events and outcomes.   | Retired |
| `verification-financial-closeout-v1` | Financial verification            | Protect canonical financial boundaries and no schema/migration drift.  | Retired |

Approved stream branches:

- `stream/billing-readiness-command-v1`
- `stream/collections-priority-v1`
- `stream/payment-continuity-v1`
- `stream/verification-financial-closeout-v1`

Approved worktrees:

- `C:\FC-worktrees\billing-readiness-command-v1`
- `C:\FC-worktrees\collections-priority-v1`
- `C:\FC-worktrees\payment-continuity-v1`
- `C:\FC-worktrees\verification-financial-closeout-v1`

Dependency and merge order:

1. `billing-readiness-command-v1`
2. `collections-priority-v1`
3. `payment-continuity-v1`
4. `verification-financial-closeout-v1`

Verification must run last after implementation stream commits exist.

Merge result:

- Billing Readiness Command V1 merged to `main` as `5ae3c0c2`.
- Collections Priority V1 merged to `main` as `3e888512`.
- Payment Continuity V1 merged to `main` as `ae05bb26`.
- Verification Financial Closeout V1 merged to `main` as `be83f4ca`.

Post-merge validation passed: targeted billing readiness, collections priority,
payment continuity, financial closeout verification, golden workflow, and
operational ownership tests; typecheck; lint; `pnpm.cmd fc:preflight:fast`;
and `git diff --check`.

Wave status: Merged to `main`; completed wave worktrees and eligible local
branches were retired after explicit cleanup approval. No next wave is approved
by this cleanup.

Cleanup plan:
[docs/review-packets/financial-closeout-collections-v1-cleanup-plan.md](C:/FloorConnector/docs/review-packets/financial-closeout-collections-v1-cleanup-plan.md).
Cleanup completed for the four approved financial closeout collections
worktrees and eligible local branches. No matching remote branches existed.

Shared non-goals:

- no implementation from this approval task;
- no schema or migration work unless a later prompt explicitly approves it;
- no duplicate invoice, payment, ledger, collection-task, or AR model;
- no accounting replacement, provider changes, payment retry/refund/dispute
  automation, customer-facing sends, PR, merge, next wave, or autonomous
  continuation;
- no work outside the four approved worktrees.

Required future stream startup checks:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd tooling:baseline -CommandsOnly
```

Required implementation validation unless a later prompt narrows scope:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
git diff --cached --check
```

## Customer Portal Trust V1 Approval Gate

Gate date: 2026-06-07.

Wave name: `customer-portal-trust-v1`.

Review packet:
[docs/review-packets/customer-portal-trust-v1-plan.md](C:/FloorConnector/docs/review-packets/customer-portal-trust-v1-plan.md).

Portfolio recommendation:
[docs/review-packets/next-portfolio-recommendation.md](C:/FloorConnector/docs/review-packets/next-portfolio-recommendation.md).

Wave goal: strengthen customer understanding, trust, and self-service through
customer-safe portal visibility over existing canonical project, financial, and
communication records.

Gate status:

| Gate item                              | Status      | Evidence / note                                                                                  |
| -------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| Architecture Coordination approval     | Approved    | Stream ownership, dependency map, non-goals, validation, verification, and merge order recorded. |
| Jeff approval gate                     | Approved    | Jeff explicitly approved `customer-portal-trust-v1` for stream/worktree creation.                |
| Stream creation                        | Complete    | Four branches and worktrees were created from the verified current `main` baseline.              |
| Implementation start                   | Completed   | The approved implementation and verification slices landed on `main`.                            |
| Human review gate                      | Satisfied   | Jeff approved the controlled merge prompt; no PRs were opened.                                   |
| Cleanup                                | Completed   | Jeff explicitly approved cleanup; completed worktrees and eligible local branches were retired.  |
| Autonomous merge / indefinite continue | Not allowed | No PR, next wave, schema/migration work, or additional destructive cleanup is approved.          |

Approved stream set:

| Stream                            | Ownership area                     | Mission                                                                                                       | Status  |
| --------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------- |
| `portal-project-clarity-v1`       | Customer project understanding     | Make project status, next steps, waiting states, and completed work easier for customers to understand.       | Retired |
| `portal-financial-visibility-v1`  | Customer financial understanding   | Make invoices, payments, balances, and billing status easier for customers to understand.                     | Retired |
| `portal-communication-trust-v1`   | Customer communication confidence  | Help customers understand communication history and action requirements without exposing internal operations. | Retired |
| `verification-customer-portal-v1` | Customer portal trust verification | Protect customer-safe boundaries, canonical records, ownership boundaries, and no schema/migration drift.     | Retired |

Approved stream branches:

- `stream/portal-project-clarity-v1`
- `stream/portal-financial-visibility-v1`
- `stream/portal-communication-trust-v1`
- `stream/verification-customer-portal-v1`

Approved worktrees:

- `C:\FC-worktrees\portal-project-clarity-v1`
- `C:\FC-worktrees\portal-financial-visibility-v1`
- `C:\FC-worktrees\portal-communication-trust-v1`
- `C:\FC-worktrees\verification-customer-portal-v1`

Dependency and merge order:

1. `portal-project-clarity-v1`
2. `portal-financial-visibility-v1`
3. `portal-communication-trust-v1`
4. `verification-customer-portal-v1`

Verification must run last after implementation stream commits exist.

Merge result:

- Portal Project Clarity V1 merged to `main` as `f0d8c81c`.
- Portal Financial Visibility V1 merged to `main` as `2fa1c633`.
- Portal Communication Trust V1 merged to `main` as `7b63ceef`.
- Verification Customer Portal V1 merged to `main` as `bb2db7dd`.

Post-merge validation passed: targeted customer portal trust, operational
ownership, golden workflow, project status window, financial visibility, and
portal communication summary tests; typecheck; lint;
`pnpm.cmd fc:preflight:fast`; and `git diff --check`.

Wave status: Merged to `main`; completed wave worktrees and eligible local
branches were retired after explicit cleanup approval. No next wave is approved
by this cleanup.

Shared non-goals:

- no implementation from this approval task;
- no schema or migration work unless a later prompt explicitly approves it;
- no duplicate project, invoice, payment, communication, customer, portal,
  dashboard, or workflow model;
- no contractor-only operational state exposed to customers;
- no autonomous messaging, provider/customer-facing sends, AI customer
  communications, financial mutation, payment mutation, PR, merge, next wave,
  or destructive cleanup;
- no work in dirty/out-of-scope worktrees, including
  `C:\FC-worktrees\project-next-actions`.

Required future stream startup checks:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd tooling:baseline -CommandsOnly
```

Required implementation validation unless a later prompt narrows scope:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
git diff --cached --check
```

## Mobile Field Capture Closeout V1 Approval Gate

Gate date: 2026-06-07.

Wave name: `mobile-field-capture-closeout-v1`.

Review packet:
[docs/review-packets/mobile-field-capture-closeout-v1-plan.md](C:/FloorConnector/docs/review-packets/mobile-field-capture-closeout-v1-plan.md).

Portfolio recommendation:
[docs/review-packets/next-portfolio-recommendation.md](C:/FloorConnector/docs/review-packets/next-portfolio-recommendation.md).

Wave goal: make field capture and closeout easier without creating duplicate
field systems, duplicate issue models, duplicate punch-list models, duplicate
closeout models, or dashboard sprawl.

Gate status:

| Gate item                              | Status      | Evidence / note                                                                                  |
| -------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| Architecture Coordination approval     | Approved    | Stream ownership, dependency map, non-goals, validation, verification, and merge order recorded. |
| Jeff approval gate                     | Approved    | Jeff explicitly approved `mobile-field-capture-closeout-v1` for stream/worktree creation.        |
| Stream creation                        | Complete    | Four branches and worktrees were created from the verified current `main` baseline.              |
| Implementation start                   | Completed   | The approved implementation and verification slices landed on `main`.                            |
| Human review gate                      | Satisfied   | Jeff approved the controlled merge prompt; no PRs were opened.                                   |
| Cleanup                                | Completed   | Jeff explicitly approved cleanup; completed worktrees and eligible local branches were retired.  |
| Autonomous merge / indefinite continue | Not allowed | No PR, next wave, schema/migration work, or additional destructive cleanup is approved.          |

Approved stream set:

| Stream                                  | Ownership area                                | Mission                                                                                                | Status |
| --------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------ |
| `field-quick-capture-v1`                | Fast field capture                            | Make it faster for crews or supervisors to record useful field evidence and work status.               | Merged |
| `closeout-readiness-command-v1`         | Closeout readiness and billing handoff        | Make it clear when field work is complete enough to move toward closeout and billing readiness.        | Merged |
| `field-communications-handoff-v1`       | Field-to-office communication handoff         | Make field observations, blockers, and closeout signals easier for the office to understand and route. | Merged |
| `verification-mobile-field-closeout-v1` | Verification for mobile field/closeout bounds | Protect canonical daily logs, field notes, execution attachments, jobs/schedule, and ownership rules.  | Merged |

Merge result:

- Field Quick Capture V1 merged to `main` as `d2e9e727`.
- Closeout Readiness Command V1 merged to `main` as `cea565d7`.
- Field Communications Handoff V1 merged to `main` as `c18a8708`.
- Verification Mobile Field Closeout V1 merged to `main` as `916eb8be`.

Post-merge validation passed: targeted mobile field closeout, field handoff,
assigned work, dispatch board, daily-log, field-note, field execution,
operational ownership, and golden workflow tests; typecheck; lint;
`pnpm.cmd fc:preflight:fast`; and `git diff --check`.

Wave status: Merged to `main`; completed wave worktrees and eligible local
branches were retired after explicit cleanup approval. No next wave is approved
by this cleanup.

Approved stream branches:

- `stream/field-quick-capture-v1`
- `stream/closeout-readiness-command-v1`
- `stream/field-communications-handoff-v1`
- `stream/verification-mobile-field-closeout-v1`

Approved worktrees:

- `C:\FC-worktrees\field-quick-capture-v1`
- `C:\FC-worktrees\closeout-readiness-command-v1`
- `C:\FC-worktrees\field-communications-handoff-v1`
- `C:\FC-worktrees\verification-mobile-field-closeout-v1`

Dependency and merge order:

1. `field-quick-capture-v1`
2. `closeout-readiness-command-v1`
3. `field-communications-handoff-v1`
4. `verification-mobile-field-closeout-v1`

Verification must run last after implementation stream commits exist.

Shared non-goals:

- no implementation from this approval task;
- no schema or migration work unless a later prompt explicitly approves it;
- no duplicate Daily Log, field note, attachment, closeout, issue, punch-list,
  invoice, communication, or dashboard model;
- no offline sync, native mobile app, autonomous billing, autonomous sends,
  provider/customer-facing action, portal behavior change, PR, merge, or next
  wave;
- no work in dirty/out-of-scope worktrees, including
  `C:\FC-worktrees\project-next-actions`.

Required future stream startup checks:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd tooling:baseline -CommandsOnly
```

Required implementation validation unless a later prompt narrows scope:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
git diff --cached --check
```

## Field Execution Depth V1 Approval Gate

Gate date: 2026-06-06.

Wave name: `field-execution-depth-v1`.

Review packet:
[docs/review-packets/field-execution-depth-v1-plan.md](C:/FloorConnector/docs/review-packets/field-execution-depth-v1-plan.md).

Wave goal: deepen the canonical field execution path from Schedule to Crew,
Daily Execution, Blockers, Photos, Notes, and Closeout without creating
duplicate jobs, schedules, field reports, issue trackers, punch-list systems, or
dashboard sprawl.

Gate status:

| Gate item                              | Status      | Evidence / note                                                                                  |
| -------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| Architecture Coordination approval     | Approved    | Stream ownership, dependency map, non-goals, validation, verification, and merge order recorded. |
| Jeff approval gate                     | Approved    | Jeff explicitly approved `field-execution-depth-v1` for stream/worktree creation.                |
| Stream creation                        | Complete    | Four branches and worktrees were created from current `main` at `9bad7a65`.                      |
| Implementation start                   | Completed   | The approved implementation and verification slices landed on `main`.                            |
| Human review gate                      | Satisfied   | Jeff approved the controlled merge prompt; no PRs were opened.                                   |
| Cleanup                                | Completed   | Jeff explicitly approved cleanup; completed worktrees and eligible local branches were retired.  |
| Autonomous merge / indefinite continue | Not allowed | Next-wave continuation and any future destructive cleanup still require explicit approval.       |

Approved stream set:

| Stream                            | Ownership area                 | Mission                                                                                                      | Status |
| --------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------ |
| `field-handoff-packet-v1`         | Field handoff context          | Ensure every scheduled job arrives with complete execution context from canonical project, job, and records. | Merged |
| `daily-execution-command-v1`      | Daily execution workflow       | Strengthen daily logs, field notes, blockers, execution observations, photo visibility, and next actions.    | Merged |
| `crew-execution-visibility-v1`    | Cross-project field visibility | Improve visibility into active, blocked, incomplete, office-attention, and execution-warning work.           | Merged |
| `verification-field-execution-v1` | Field execution verification   | Protect canonical project chain, jobs, schedule, daily logs, field notes, and ownership boundaries.          | Merged |

Merge result:

- Field Handoff Packet V1 merged to `main` as `715af07d`.
- Daily Execution Command V1 merged to `main` as `627358c4`.
- Crew Execution Visibility V1 merged to `main` as `980cfe5b`.
- Verification Field Execution V1 merged to `main` as `36e80505`.

Post-merge validation passed: targeted field execution tests, typecheck, lint,
`pnpm.cmd fc:preflight:fast`, and `git diff --check`.

Wave status: Merged to `main`; completed wave worktrees and eligible local
branches were retired after explicit cleanup approval. No next wave is approved
by this cleanup.

Approved stream branches:

- `stream/field-handoff-packet-v1`
- `stream/daily-execution-command-v1`
- `stream/crew-execution-visibility-v1`
- `stream/verification-field-execution-v1`

Approved worktrees:

- `C:\FC-worktrees\field-handoff-packet-v1`
- `C:\FC-worktrees\daily-execution-command-v1`
- `C:\FC-worktrees\crew-execution-visibility-v1`
- `C:\FC-worktrees\verification-field-execution-v1`

Dependency and merge order:

1. `field-handoff-packet-v1` establishes scheduled-job execution context.
2. `daily-execution-command-v1` builds on handoff context for day-of-work
   execution review.
3. `crew-execution-visibility-v1` rolls canonical handoff and execution state
   into cross-project field visibility.
4. `verification-field-execution-v1` lands last after the implementation
   streams are complete and validated.

Shared non-goals:

- no implementation from this approval task;
- no schema or migration work unless a later prompt explicitly approves it;
- no duplicate schedule, job, field report, issue tracker, punch-list, photo,
  note, closeout, or dashboard model;
- no portal work, dispatch automation, route optimization, customer-facing
  provider action, autonomous AI, or financial/signature mutation;
- no work in dirty/out-of-scope worktrees, including
  `C:\FC-worktrees\project-next-actions`.

Required future stream startup checks:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd tooling:baseline -CommandsOnly
```

Required implementation validation unless a later prompt narrows scope:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
```

## Proposed Governance Infrastructure Stream

Proposal date: 2026-06-06.

Proposed stream: `agent-verification-v1`.

Review packet:
[docs/review-packets/agent-verification-v1.md](C:/FloorConnector/docs/review-packets/agent-verification-v1.md).

Status: Proposed.

Rationale: FloorConnector now has mature AI governance documentation:
`AGENTS.md`, `docs/agent-governance.md`,
`docs/agent-startup-checklist.md`,
`docs/autonomous-run-governance.md`, and `docs/ai-diagnostics.md`. The next
governance maturity step is executable verification tooling so agents can
verify startup, stream alignment, and completion state instead of relying only
on written instructions.

Proposed branch:

- `stream/agent-verification-v1`

Proposed worktree:

- `C:\FC-worktrees\agent-verification-v1`

Proposed scope:

- `pnpm fc:startup-check`
- `pnpm fc:stream-check`
- `pnpm fc:completion-check`
- review existing `pnpm worktree:doctor` overlap and integration opportunities
- update `AGENTS.md` and autonomous-run guidance after the tooling exists

This proposal does not authorize implementation, branch creation, worktree
creation, package script changes, PR creation, merge, application-code changes,
schema changes, UI changes, Supabase changes, business workflow changes,
canonical-record changes, or financial logic changes.

## Next Recommended Wave

Recommendation date: 2026-06-05.

Recommended wave: `sales-to-production-readiness-v1`.

Review packet:
[docs/review-packets/next-wave-recommendation.md](C:/FloorConnector/docs/review-packets/next-wave-recommendation.md).

Status: Merged to `main`.

Rationale: after `operational-command-center-v1`, the highest-leverage next
step is tightening the opportunity-to-estimate-to-contract-to-schedule handoff
so downstream Project Workspace, Schedule, Field, Financials, Portal, Reporting,
and future automation surfaces consume clearer readiness truth.

Proposed streams:

- `sales-readiness-command-v1`
- `estimate-contract-readiness-v1`
- `schedule-readiness-handoff-v1`
- `verification-sales-to-production-v1`

This wave has merged to `main` under Jeff's controlled merge approval. It did
not authorize schema/migrations, provider actions, customer-facing sends,
autonomous AI behavior, destructive cleanup, next-wave continuation, or work in
dirty/out-of-scope worktrees.

## Sales To Production Readiness V1 Approval Gate

Gate date: 2026-06-05.

Wave name: `sales-to-production-readiness-v1`.

Wave goal: tighten the contractor sales-to-production handoff from
opportunity/site assessment through estimate, contract, deposit/readiness, and
schedule handoff.

Gate status:

| Gate item                              | Status      | Evidence / note                                                                      |
| -------------------------------------- | ----------- | ------------------------------------------------------------------------------------ |
| Architecture Coordination approval     | Approved    | Approved from the next-wave recommendation and recorded in active governance docs.   |
| Jeff approval gate                     | Satisfied   | Jeff explicitly approved controlled merge of the reviewed ready stream set.          |
| Stream creation                        | Approved    | The approved stream set may be created from current `main`.                          |
| Implementation start                   | Completed   | The approved implementation and verification slices landed on `main`.                |
| Human review gate                      | Satisfied   | Jeff approved the controlled merge prompt; no PRs were opened.                       |
| Autonomous merge / indefinite continue | Not allowed | Next-wave continuation and destructive cleanup still require explicit Jeff approval. |

Approved stream set:

| Stream                                | Ownership area                                                                                                         | Mission                                                                        | Status |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------ |
| `sales-readiness-command-v1`          | Opportunity, lead, site assessment, requirements capture, and upstream estimating readiness.                           | Make sales readiness clearer before estimate work begins.                      | Merged |
| `estimate-contract-readiness-v1`      | Estimate approval, contract generation, contract send/signature readiness, and blockers between estimate and contract. | Make estimate-to-contract progression clearer and reduce handoff confusion.    | Merged |
| `schedule-readiness-handoff-v1`       | Commercial/financial readiness handoff into scheduling and Field.                                                      | Make ready-to-schedule truthful, visible, and connected into Field.            | Merged |
| `verification-sales-to-production-v1` | Verification for the sales-to-production handoff.                                                                      | Protect the opportunity -> estimate -> contract -> readiness -> schedule flow. | Merged |

Merge result:

- Sales Readiness Command V1 merged to `main` as `89275554`.
- Estimate Contract Readiness V1 merged to `main` as `b28fb457`.
- Schedule Readiness Handoff V1 merged to `main` as `09942b0b`.
- Verification Sales To Production V1 merged to `main` as `f4e31baf`.

Post-merge validation passed: targeted readiness tests, typecheck, lint,
`pnpm.cmd fc:preflight:fast`, and `git diff --check`.

Wave status: Merged to `main`; completed wave worktrees are retained pending
explicit retirement approval. No next wave is approved by this merge.

Approved stream branches:

- `stream/sales-readiness-command-v1`
- `stream/estimate-contract-readiness-v1`
- `stream/schedule-readiness-handoff-v1`
- `stream/verification-sales-to-production-v1`

Approved worktrees:

- `C:\FC-worktrees\sales-readiness-command-v1`
- `C:\FC-worktrees\estimate-contract-readiness-v1`
- `C:\FC-worktrees\schedule-readiness-handoff-v1`
- `C:\FC-worktrees\verification-sales-to-production-v1`

Required future stream startup checks:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd tooling:baseline -CommandsOnly
```

Required implementation validation unless a later prompt narrows scope:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
```

Shared non-goals:

- no implementation from this approval task;
- no schema or migration work unless a later prompt explicitly approves it;
- no production code changes except explicitly scoped future implementation;
- no provider/customer-facing sends;
- no autonomous AI, scheduling, dispatching, signature, or financial actions;
- no work in dirty/out-of-scope worktrees, including
  `C:\FC-worktrees\project-next-actions`.

## Next Generation Wave Candidates

Audit date: 2026-06-04.

These names are current review candidates, not active wave authorization:

| Candidate stream               | Proposed wave role                                               | Required gate before work begins                                                          |
| ------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `ux-architecture`              | Architecture and IA governance for the next stream generation    | Decide whether it replaces or absorbs `architecture-coordination` in the active registry. |
| `project-workspace-v2`         | Project-centered continuity and next-action depth                | Approve ownership against Field, Communications, Financials, and Portal.                  |
| `field-command-center-v1`      | Field command-center continuity over canonical execution records | Confirm job, daily-log, execution evidence, and portal-safe proof boundaries.             |
| `communications-continuity-v2` | Record-linked communication follow-up continuity                 | Confirm provider-dark behavior and source-record handoff ownership.                       |
| `financial-command-center-v1`  | Financial command center and collections continuity              | Confirm financial math/payment-state test strategy and no detached billing truth.         |
| `verification-v2`              | Review packet and merge-gate verification framework              | Confirm evidence requirements for every approved stream.                                  |

## Operational Command Center V1 Gate

Wave name: `operational-command-center-v1`.

Wave goal: Strengthen FloorConnector's operational command center model by
making Project Workspace diagnose operational state, Field own execution action,
Communications own conversation action, Financials own AR/payment action, and
Verification protect the ownership model.

Governance rule:

- Dashboard prioritizes.
- Project Workspace diagnoses.
- Owning workspace acts.
- Settings owns tenant configuration.
- Super Admin owns platform policy.
- Portal remains customer-safe review/action only.

Gate status as of 2026-06-05:

| Gate item                              | Status      | Evidence / note                                                             |
| -------------------------------------- | ----------- | --------------------------------------------------------------------------- |
| Architecture Coordination approval     | Approved    | Ownership boundaries and stream set are recorded in this registry and plan. |
| Jeff approval gate                     | Approved    | Jeff explicitly approved starting `operational-command-center-v1`.          |
| Human review gate rules                | Satisfied   | Jeff approved the controlled final rebase-and-merge prompt.                 |
| Autonomous merge / indefinite continue | Not allowed | Next-wave continuation and destructive cleanup still require Jeff approval. |

Architecture-approved implementation stream set:

- `stream/project-workspace-v2`
- `stream/field-command-center-v1`
- `stream/communications-continuity-v2`
- `stream/financial-command-center-v1`
- `stream/verification-v2`

Governance referee:

- UX Architecture / Architecture Coordination remains the governance referee for
  ownership, dependency, UX / IA, canonical model, verification, and merge-order
  decisions.

Merge result:

- Project Workspace V2 merged to `main` as `c809186c`.
- Field Command Center V1 was already on `main` as `6df16ed1`.
- Communications Continuity V2 merged to `main` as `890bfbad`.
- Financial Command Center V1 merged to `main` as `5844f52e`.
- Verification V2 merged to `main` as `f7caf1db`.

Remaining gates:

- No start or merge gate remains for the approved stream set.
- Next-wave continuation, provider/customer-facing risky actions, destructive
  cleanup, and any scope outside the approved stream briefs still require human
  review and approval.

Wave status: Merged to `main`; completed wave worktrees and eligible branches
were retired after explicit cleanup approval. No next wave is approved by this
cleanup.
