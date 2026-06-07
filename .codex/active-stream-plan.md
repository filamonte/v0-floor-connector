# Active Stream Plan

Status: Active
Doc Type: Codex Operations

This plan records the first production-acceleration stream set for
FloorConnector. It is coordination guidance only. It does not implement product
features and does not replace `docs/current-state.md` as implemented truth.

This file and `active-worktrees.md` are the canonical active-stream registry for
the current production-acceleration cycle. PRs #9, #10, and #12 are now merged
to `main`; `architecture-coordination` is the remaining active cleanup stream.
Broader stream inventories in planning docs are reference topology only when
they conflict with this registry.

Permanent governance now lives in
[docs/parallel-development-governance.md](C:/FloorConnector/docs/parallel-development-governance.md)
and
[docs/operational-architecture-v1.md](C:/FloorConnector/docs/operational-architecture-v1.md).
New streams must follow the lifecycle Proposed -> Architecture Review ->
Approved -> Active -> Verification -> Merged -> Retired, and Architecture
Coordination must approve stream creation before any new worktree is created.
The wave proposal gate also requires dependency documentation, ownership
conflict review, UX / IA impact review, verification scope, proposed merge
order, active registry update, and recorded Jeff approval before a wave begins.
Wave-launch prompts must also require `pnpm.cmd worktree:doctor` and use
[docs/automation-tooling-baseline.md](C:/FloorConnector/docs/automation-tooling-baseline.md)
for local tooling, Playwright, optional CLI, worktree-link, and validation
guidance.

## Next Wave Recommendation

Recommendation date: 2026-06-05.

`docs/review-packets/next-wave-recommendation.md` recommends
`sales-to-production-readiness-v1` as the next highest-leverage operational
wave. The proposed streams are:

- `stream/sales-readiness-command-v1`
- `stream/estimate-contract-readiness-v1`
- `stream/schedule-readiness-handoff-v1`
- `stream/verification-sales-to-production-v1`

Status: Merged to `main`. Jeff approved controlled merge of the reviewed ready
stream set. This does not approve schema/migrations, provider/customer-facing
actions, PRs, next-wave continuation, destructive cleanup, or work in
dirty/out-of-scope worktrees.

## Proposed Governance Infrastructure Stream

Proposal date: 2026-06-06.

Proposed stream: `agent-verification-v1`.

- Proposed branch: `stream/agent-verification-v1`
- Proposed worktree: `C:\FC-worktrees\agent-verification-v1`
- Type: Governance Infrastructure Stream
- Priority: High
- Review packet:
  [docs/review-packets/agent-verification-v1.md](C:/FloorConnector/docs/review-packets/agent-verification-v1.md)
- Goal: convert AI governance from documentation-only guidance into executable
  verification tooling for Desktop Codex, Phone Codex, autonomous Codex runs,
  future AI agents, and future Claude/Cursor-compatible workflows without
  changing application behavior.

Proposed executable checks:

- `pnpm fc:startup-check`
- `pnpm fc:stream-check`
- `pnpm fc:completion-check`

Status: Proposed. Do not create the branch, create the worktree, add package
scripts, implement scripts, open a PR, or begin runtime/tooling changes until
Architecture Coordination and Jeff approve stream creation and implementation
start.

## Customer Portal Trust V1 Gate

Gate date: 2026-06-07.

Wave name: `customer-portal-trust-v1`.

Architecture Coordination approval: Approved.

Jeff approval gate: Approved. Jeff explicitly approved stream/worktree creation
for `customer-portal-trust-v1`.

Review packet:
[docs/review-packets/customer-portal-trust-v1-plan.md](C:/FloorConnector/docs/review-packets/customer-portal-trust-v1-plan.md).

Portfolio recommendation:
[docs/review-packets/next-portfolio-recommendation.md](C:/FloorConnector/docs/review-packets/next-portfolio-recommendation.md).

Wave status: Merged to `main`; completed worktrees and branches are retained
pending explicit retirement approval. This merge does not approve
schema/migrations, provider/customer-facing actions, autonomous messaging,
financial mutation, PRs, next-wave continuation, destructive cleanup, or work
in dirty/out-of-scope worktrees.

Approved stream set:

- `stream/portal-project-clarity-v1`
- `stream/portal-financial-visibility-v1`
- `stream/portal-communication-trust-v1`
- `stream/verification-customer-portal-v1`

Required future startup checks:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd tooling:baseline -CommandsOnly
```

Implementation streams should also run focused tests for changed helpers,
read-models, actions, or routes, then:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
git diff --cached --check
```

Human review gate was satisfied for the approved controlled merge only. Agents
may not continue into new feature work, perform schema/migration work, open PRs,
delete branches or worktrees, or use dirty/out-of-scope worktrees from this
approval. Agents must not touch `C:\FC-worktrees\project-next-actions` unless
Jeff explicitly scopes it.

### portal-project-clarity-v1

- Branch: `stream/portal-project-clarity-v1`
- Worktree: `C:\FC-worktrees\portal-project-clarity-v1`
- Owns: customer project understanding.
- Mission: make project status easier for customers to understand.
- Future allowed work, not now: customer-safe project progress, next-step
  visibility, waiting/completed state, readiness explanations, timeline
  clarity, and project stage understanding over canonical project records.
- Must avoid: duplicate project models, contractor-only operational state,
  portal workflow engines, schema changes, migrations, and feature work before
  a later start command.
- Status: Merged to `main` as `f0d8c81c`.

### portal-financial-visibility-v1

- Branch: `stream/portal-financial-visibility-v1`
- Worktree: `C:\FC-worktrees\portal-financial-visibility-v1`
- Owns: customer financial understanding.
- Mission: make invoices, payments, balances, and billing status easier for
  customers to understand.
- Future allowed work, not now: invoice clarity, payment clarity, outstanding
  balance visibility, payment history visibility, and billing readiness
  explanations over canonical invoices, payments, and payment events.
- Must avoid: accounting replacement, duplicate invoice models, duplicate
  payment models, financial math changes, payment mutation, schema changes,
  migrations, and feature work before a later start command.
- Status: Merged to `main` as `2fa1c633`.

### portal-communication-trust-v1

- Branch: `stream/portal-communication-trust-v1`
- Worktree: `C:\FC-worktrees\portal-communication-trust-v1`
- Owns: customer communication confidence.
- Mission: help customers understand communication history and action
  requirements.
- Future allowed work, not now: communication continuity visibility, customer
  action awareness, portal-safe conversation context, and communication trust
  indicators over canonical communication records.
- Must avoid: duplicate communication models, autonomous messaging, AI customer
  communications, provider/customer-facing sends, schema changes, migrations,
  and feature work before a later start command.
- Status: Merged to `main` as `7b63ceef`.

### verification-customer-portal-v1

- Branch: `stream/verification-customer-portal-v1`
- Worktree: `C:\FC-worktrees\verification-customer-portal-v1`
- Owns: verification for customer portal trust boundaries.
- Mission: protect customer-safe boundaries, canonical records, project
  ownership, financial ownership, communications ownership, portal visibility
  rules, no duplicate models, and no schema/migration drift.
- Future allowed work, not now: add focused verification helpers/tests/docs
  after implementation streams complete.
- Must avoid: feature work, UI redesign, schema changes, migrations, loosening
  existing tests, and verification implementation before feature-stream
  evidence exists.
- Status: Merged to `main` as `bb2db7dd`.

Merge result:

- Portal Project Clarity V1 merged to `main` as `f0d8c81c`.
- Portal Financial Visibility V1 merged to `main` as `2fa1c633`.
- Portal Communication Trust V1 merged to `main` as `7b63ceef`.
- Verification Customer Portal V1 merged to `main` as `bb2db7dd`.

Post-merge validation passed: targeted customer portal trust, operational
ownership, golden workflow, project status window, financial visibility, and
portal communication summary tests; typecheck; lint;
`pnpm.cmd fc:preflight:fast`; and `git diff --check`.

## Mobile Field Capture Closeout V1 Gate

Gate date: 2026-06-07.

Wave name: `mobile-field-capture-closeout-v1`.

Architecture Coordination approval: Approved.

Jeff approval gate: Approved. Jeff explicitly approved stream/worktree creation
for `mobile-field-capture-closeout-v1`.

Review packet:
[docs/review-packets/mobile-field-capture-closeout-v1-plan.md](C:/FloorConnector/docs/review-packets/mobile-field-capture-closeout-v1-plan.md).

Portfolio recommendation:
[docs/review-packets/next-portfolio-recommendation.md](C:/FloorConnector/docs/review-packets/next-portfolio-recommendation.md).

Wave status: Merged to `main`; completed worktrees and local branches were
retired after explicit cleanup approval. This cleanup does not approve
schema/migrations, provider/customer-facing actions, portal behavior changes,
PRs, next-wave continuation, or work in dirty/out-of-scope worktrees.

Approved stream set:

- `stream/field-quick-capture-v1`
- `stream/closeout-readiness-command-v1`
- `stream/field-communications-handoff-v1`
- `stream/verification-mobile-field-closeout-v1`

Required future startup checks:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd tooling:baseline -CommandsOnly
```

Implementation streams should also run focused tests for changed helpers,
read-models, actions, or routes, then:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
git diff --cached --check
```

Human review gate is satisfied for the approved merge and cleanup set only.
Agents may not continue to another wave, perform schema/migration work, open
PRs, delete additional branches or worktrees, or use dirty/out-of-scope
worktrees from this approval. Agents must not touch
`C:\FC-worktrees\project-next-actions` unless Jeff explicitly scopes it.

### field-quick-capture-v1

- Branch: `stream/field-quick-capture-v1`
- Worktree: `C:\FC-worktrees\field-quick-capture-v1`
- Owns: fast field capture inside existing field execution workflows.
- Mission: make it faster for crews or supervisors to record useful field
  evidence and work status.
- Future allowed work, not now: improve quick Daily Log visibility, quick
  field-note capture, blocker/issue capture using existing field notes,
  photo/file evidence visibility using existing execution attachments,
  mobile-friendly layout improvements where safe, and "what happened today?"
  capture flow.
- Must avoid: new Daily Log model, new field-note model, new attachment model,
  offline sync, native mobile app, schema changes, migrations, portal behavior
  changes, and feature work before a later start command.
- Status: Merged to `main` as `d2e9e727`; worktree removed and local branch
  deleted after explicit cleanup approval.

### closeout-readiness-command-v1

- Branch: `stream/closeout-readiness-command-v1`
- Worktree: `C:\FC-worktrees\closeout-readiness-command-v1`
- Owns: closeout readiness and billing handoff signals.
- Mission: make it clear when field work is complete enough to move toward
  closeout and billing readiness.
- Future allowed work, not now: improve closeout readiness visibility, missing
  Daily Log / field-note / photo evidence signals, incomplete or unresolved
  blocker signals, project/job completion handoff clarity, links from
  Field/Project into invoice/billing readiness where appropriate, and office
  "ready to bill?" awareness without duplicating Financials.
- Must avoid: duplicate invoice model, duplicate closeout model, new checklist
  schema, accounting replacement, dashboard sprawl, schema changes, migrations,
  autonomous billing, and feature work before a later start command.
- Status: Merged to `main` as `cea565d7`; worktree removed and local branch
  deleted after explicit cleanup approval.

### field-communications-handoff-v1

- Branch: `stream/field-communications-handoff-v1`
- Worktree: `C:\FC-worktrees\field-communications-handoff-v1`
- Owns: field-to-office communication handoff.
- Mission: make field observations, blockers, and closeout signals easier for
  the office to understand and route without turning Field into
  Communications.
- Future allowed work, not now: improve links from field notes/blockers to
  Communications context, office attention signals from field execution,
  compact handoff evidence on field/project surfaces, communication-safe
  escalation paths, and clearer boundaries between Field evidence and
  Communications action.
- Must avoid: duplicate communications model, autonomous sends, AI-generated
  customer sends, portal-only communication copies, schema changes, migrations,
  dashboard sprawl, and feature work before a later start command.
- Status: Merged to `main` as `c18a8708`; worktree removed and local branch
  deleted after explicit cleanup approval.

### verification-mobile-field-closeout-v1

- Branch: `stream/verification-mobile-field-closeout-v1`
- Worktree: `C:\FC-worktrees\verification-mobile-field-closeout-v1`
- Owns: verification for mobile field capture and closeout boundaries.
- Mission: protect mobile field capture and closeout boundaries.
- Future allowed work, not now: add focused verification helpers/tests/docs
  after implementation streams complete.
- Must protect: canonical Daily Logs, canonical field notes, canonical
  execution attachments, canonical jobs/schedule, no duplicate closeout model,
  no duplicate issue or punch-list model, no dashboard sprawl, Field owns
  execution capture, Project diagnoses, Communications owns conversation
  action, Financials owns billing/collection action, Portal remains
  customer-safe, and no schema/migration drift.
- Must avoid: feature work, UI redesign, schema changes, migrations, loosening
  existing tests, and verification implementation before feature-stream
  evidence exists.
- Status: Merged to `main` as `916eb8be`; worktree removed and local branch
  deleted after explicit cleanup approval.

## Field Execution Depth V1 Gate

Gate date: 2026-06-06.

Wave name: `field-execution-depth-v1`.

Architecture Coordination approval: Approved.

Jeff approval gate: Approved. Jeff explicitly approved stream/worktree creation
for `field-execution-depth-v1`.

Review packet:
[docs/review-packets/field-execution-depth-v1-plan.md](C:/FloorConnector/docs/review-packets/field-execution-depth-v1-plan.md).

Wave status: Merged to `main`; completed worktrees and eligible local branches
were retired after explicit cleanup approval. This does not approve
schema/migrations, provider/customer-facing actions, PRs, next-wave
continuation, future destructive cleanup, or work in dirty/out-of-scope
worktrees.

Approved stream set:

- `stream/field-handoff-packet-v1`
- `stream/daily-execution-command-v1`
- `stream/crew-execution-visibility-v1`
- `stream/verification-field-execution-v1`

Required future startup checks:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd tooling:baseline -CommandsOnly
```

Implementation streams should also run focused tests for changed helpers,
read-models, actions, or routes, then:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
git diff --cached --check
```

Human review gate is satisfied for the approved merge and cleanup set only.
Agents may not continue to another wave, perform schema/migration work, delete
additional branches or worktrees, or use dirty/out-of-scope worktrees from this
approval. Agents must not touch `C:\FC-worktrees\project-next-actions` unless
Jeff explicitly scopes it.

### field-handoff-packet-v1

- Branch: `stream/field-handoff-packet-v1`
- Worktree: `C:\FC-worktrees\field-handoff-packet-v1`
- Owns: field handoff context for scheduled jobs.
- Mission: ensure every scheduled job arrives with complete execution context,
  including scope summary, estimate context, contract context, readiness
  context, customer notes, project notes, execution notes, and field handoff
  visibility where supported by canonical records.
- Future allowed work, not now: improve scheduled-job handoff clarity over
  existing job, project, estimate, contract, readiness, customer, note, Daily
  Log, and field-note context.
- Must avoid: new schedule model, new job model, portal work, dispatch
  automation, route optimization, schema changes, migrations, and feature work
  before a later start command.
- Status: Merged to `main` as `715af07d`.

### daily-execution-command-v1

- Branch: `stream/daily-execution-command-v1`
- Worktree: `C:\FC-worktrees\daily-execution-command-v1`
- Owns: daily execution workflow.
- Mission: strengthen daily logs, field notes, blockers, execution
  observations, photo visibility, and execution next actions.
- Future allowed work, not now: deepen existing Daily Log, field-note,
  blocker, observation, execution attachment, and source-record handoff
  workflows without creating a separate field subsystem.
- Must avoid: separate field reporting system, duplicate issue tracker,
  duplicate punch-list model, schema changes, migrations, portal behavior, and
  feature work before a later start command.
- Status: Merged to `main` as `627358c4`.

### crew-execution-visibility-v1

- Branch: `stream/crew-execution-visibility-v1`
- Worktree: `C:\FC-worktrees\crew-execution-visibility-v1`
- Owns: cross-project field visibility.
- Mission: improve visibility into active work, blocked work, incomplete work,
  office attention required, and execution warnings.
- Future allowed work, not now: derive cross-project field visibility from
  canonical jobs, schedule, assignments, Daily Logs, field notes, blockers,
  evidence, and source-record handoff context.
- Must avoid: route optimization, dispatch replacement, crew scheduling
  replacement, dashboard sprawl, duplicate schedule/job/field models, schema
  changes, migrations, and feature work before a later start command.
- Status: Merged to `main` as `980cfe5b`.

### verification-field-execution-v1

- Branch: `stream/verification-field-execution-v1`
- Worktree: `C:\FC-worktrees\verification-field-execution-v1`
- Owns: verification for field execution depth.
- Mission: protect the canonical project chain, canonical jobs, canonical
  schedule, canonical Daily Logs, canonical field notes, and the operational
  ownership model.
- Future allowed work, not now: add focused verification helpers/tests/docs
  after the implementation streams complete.
- Must avoid: feature work, schema changes, UI redesign, loosening checks,
  runtime behavior, and implementation before feature-stream evidence exists.
- Status: Merged to `main` as `36e80505`.

## Sales To Production Readiness V1 Gate

Gate date: 2026-06-05.

Wave name: `sales-to-production-readiness-v1`.

Architecture Coordination approval: Approved.

Jeff approval gate: Approved. Jeff explicitly approved stream/worktree creation
for `sales-to-production-readiness-v1`.

Wave status: Merged to `main`; worktrees retained pending explicit retirement
approval.

Approved stream set:

- `stream/sales-readiness-command-v1`
- `stream/estimate-contract-readiness-v1`
- `stream/schedule-readiness-handoff-v1`
- `stream/verification-sales-to-production-v1`

Required future startup checks:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd tooling:baseline -CommandsOnly
```

Implementation streams should also run:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
```

Human review gate satisfied for the approved merge set only. Agents may not
continue to another wave, perform schema/migration work, delete branches or
worktrees, or use dirty/out-of-scope worktrees from this approval.

### sales-readiness-command-v1

- Branch: `stream/sales-readiness-command-v1`
- Worktree: `C:\FC-worktrees\sales-readiness-command-v1`
- Owns: opportunity, lead, site assessment, requirements capture, and upstream
  estimating readiness.
- Mission: make sales readiness clearer before estimate work begins.
- Future allowed work, not now: clarify opportunity/site assessment state,
  improve requirements capture visibility, show what is missing before estimate
  creation, link to Project diagnosis where needed, and avoid duplicate
  customer/project records.
- Must avoid: dashboard sprawl, new opportunity/customer/project schema,
  duplicate intake models, AI autonomous scheduling, and portal behavior
  changes.
- Status: Merged to `main` as `89275554`.

### estimate-contract-readiness-v1

- Branch: `stream/estimate-contract-readiness-v1`
- Worktree: `C:\FC-worktrees\estimate-contract-readiness-v1`
- Owns: estimate approval, contract generation, contract send/signature
  readiness, and readiness blockers between estimate and contract.
- Mission: make estimate-to-contract progression clearer and reduce handoff
  confusion.
- Future allowed work, not now: clarify approved estimate next steps, contract
  readiness, missing blockers before signature/send, Settings links for
  workflow defaults, and canonical estimate/contract/project readiness.
- Must avoid: duplicate contract/signature models, schema changes, settings
  mutation leakage on operational pages, and portal behavior changes unless
  later explicitly approved.
- Status: Merged to `main` as `b28fb457`.

### schedule-readiness-handoff-v1

- Branch: `stream/schedule-readiness-handoff-v1`
- Worktree: `C:\FC-worktrees\schedule-readiness-handoff-v1`
- Owns: commercial/financial readiness handoff into scheduling and Field.
- Mission: make ready-to-schedule truthful, visible, and connected from
  project/contract/deposit state into Field.
- Future allowed work, not now: clarify deposit/readiness blockers, link
  schedule action to Field ownership, make handoff context visible, and preserve
  Project as diagnosis and Field as action.
- Must avoid: duplicate schedule/dispatch models, new job schema, autonomous
  dispatching, route optimization, and dashboard work.
- Status: Merged to `main` as `09942b0b`.

### verification-sales-to-production-v1

- Branch: `stream/verification-sales-to-production-v1`
- Worktree: `C:\FC-worktrees\verification-sales-to-production-v1`
- Owns: verification for the sales-to-production handoff.
- Mission: protect the opportunity -> estimate -> contract -> readiness ->
  schedule workflow.
- Future allowed work, not now: add focused tests, update verification
  matrices, protect the canonical lifecycle, and verify ownership boundaries.
- Must avoid: feature work, schema changes, UI redesign, and loosening existing
  checks.
- Status: Merged to `main` as `f4e31baf`.

## Active Streams

### architecture-coordination

- Branch: `stream/architecture-coordination`
- Worktree: `C:\FC-worktrees\architecture-coordination`
- Owns: permanent stream ownership governance, dependency mapping, duplicate
  capability/workflow/data-model detection, navigation drift detection, UX
  consistency review, documentation synchronization, merge sequencing, release
  coordination, AI prompt governance, and next-wave prompt generation.
- Must avoid: feature implementation, schema, routes, server actions, UI
  behavior, runtime changes, broad source-of-truth rewrites.
- Current wave: permanent governance layer, stream lifecycle, registry truth,
  and next-wave prompt discipline.

## Architecture Review Queue

Audit date: 2026-06-04.

The local worktrees below exist and were clean at audit time, but current
`main` does not yet register them as Active. They are next-generation review
candidates only until Architecture Coordination and Jeff approve the wave gate.

| Stream                         | Branch                                | Worktree                                       | Proposed ownership area                                        | Lifecycle status    |
| ------------------------------ | ------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------- | ------------------- |
| `ux-architecture`              | `stream/ux-architecture`              | `C:\FC-worktrees\ux-architecture`              | Product architecture, UX / IA ownership, governance references | Architecture Review |
| `project-workspace-v2`         | `stream/project-workspace-v2`         | `C:\FC-worktrees\project-workspace-v2`         | Project Workspace continuity and next-action depth             | Merged              |
| `field-command-center-v1`      | `stream/field-command-center-v1`      | `C:\FC-worktrees\field-command-center-v1`      | Field execution command layer over canonical execution records | Merged              |
| `communications-continuity-v2` | `stream/communications-continuity-v2` | `C:\FC-worktrees\communications-continuity-v2` | Record-linked communication continuity and follow-up review    | Merged              |
| `financial-command-center-v1`  | `stream/financial-command-center-v1`  | `C:\FC-worktrees\financial-command-center-v1`  | AR, collections, billing command-center continuity             | Merged              |
| `verification-v2`              | `stream/verification-v2`              | `C:\FC-worktrees\verification-v2`              | Verification framework, review packets, merge-gate evidence    | Merged              |

The detailed audit for ownership, dependencies, UX / IA impact, canonical model
risk, overlap/conflict, verification expectations, and merge readiness lives in
[docs/parallel-development-governance.md](C:/FloorConnector/docs/parallel-development-governance.md).

## Operational Command Center V1 Gate

Gate date: 2026-06-04.

Wave name: `operational-command-center-v1`.

Wave goal: Strengthen FloorConnector's operational command center model by
making Project Workspace diagnose operational state, Field own execution action,
Communications own conversation action, Financials own AR/payment action, and
Verification protect the ownership model.

Architecture Coordination approval: Approved.

Jeff approval gate: Approved. Jeff explicitly approved starting
`operational-command-center-v1`.

Approved stream set merged to `main` under Jeff's controlled merge approval:

- `stream/project-workspace-v2`
- `stream/field-command-center-v1`
- `stream/communications-continuity-v2`
- `stream/financial-command-center-v1`
- `stream/verification-v2`

Governance rule:

- Dashboard prioritizes.
- Project Workspace diagnoses.
- Owning workspace acts.
- Settings owns tenant configuration.
- Super Admin owns platform policy.
- Portal remains customer-safe review/action only.

UX Architecture / Architecture Coordination remains the governance referee.
Agents may not auto-continue to the next wave or perform destructive cleanup
without Jeff approval.

Remaining gates:

- No start or merge gate remains for the approved stream set.
- Next-wave continuation, provider/customer-facing risky actions, destructive
  cleanup, and any scope outside the approved stream briefs still require human
  review and approval.

## Merged Streams

These streams have merged to `main`. Completed `field-execution-depth-v1` and
`mobile-field-capture-closeout-v1` worktrees and eligible local branches were
retired after explicit cleanup approval. Completed
`sales-to-production-readiness-v1` worktrees are retained pending explicit
retirement approval. Completed
`operational-command-center-v1` worktrees and eligible branches were retired
after explicit cleanup approval:

### field-quick-capture-v1

- Branch: `stream/field-quick-capture-v1`
- Worktree: `C:\FC-worktrees\field-quick-capture-v1`
- Owns: fast field capture inside existing field execution workflows.
- Must avoid: new Daily Log model, new field-note model, new attachment model,
  offline sync, native mobile app, schema changes, migrations, and portal
  behavior changes.
- Merged: `d2e9e727 feat: merge field quick capture v1`.
- Cleanup: worktree removed from Git worktree registry and local branch deleted
  after explicit approval.

### closeout-readiness-command-v1

- Branch: `stream/closeout-readiness-command-v1`
- Worktree: `C:\FC-worktrees\closeout-readiness-command-v1`
- Owns: closeout readiness and billing handoff signals.
- Must avoid: duplicate invoice model, duplicate closeout model, new checklist
  schema, accounting replacement, dashboard sprawl, schema changes, migrations,
  and autonomous billing.
- Merged: `cea565d7 feat: merge closeout readiness command v1`.
- Cleanup: worktree removed from Git worktree registry and local branch deleted
  after explicit approval.

### field-communications-handoff-v1

- Branch: `stream/field-communications-handoff-v1`
- Worktree: `C:\FC-worktrees\field-communications-handoff-v1`
- Owns: field-to-office communication handoff.
- Must avoid: duplicate communications model, autonomous sends, AI-generated
  customer sends, portal-only communication copies, schema changes, migrations,
  and dashboard sprawl.
- Merged: `c18a8708 feat: merge field communications handoff v1`.
- Cleanup: worktree removed from Git worktree registry and local branch deleted
  after explicit approval.

### verification-mobile-field-closeout-v1

- Branch: `stream/verification-mobile-field-closeout-v1`
- Worktree: `C:\FC-worktrees\verification-mobile-field-closeout-v1`
- Owns: verification for mobile field capture and closeout boundaries.
- Must avoid: feature work, UI redesign, schema changes, migrations, loosening
  existing tests, and runtime behavior changes outside verification.
- Merged: `916eb8be test: merge verification mobile field closeout v1`.
- Cleanup: worktree removed from Git worktree registry and local branch deleted
  after explicit approval.

### field-handoff-packet-v1

- Branch: `stream/field-handoff-packet-v1`
- Worktree: `C:\FC-worktrees\field-handoff-packet-v1`
- Owns: field handoff context for scheduled jobs.
- Must avoid: duplicate schedule/job models, portal work, dispatch automation,
  schema changes, migrations, and provider/customer-facing behavior.
- Merged: `715af07d feat: deepen field handoff packet`.
- Cleanup: worktree removed from Git worktree registry and local branch deleted
  after explicit approval.

### daily-execution-command-v1

- Branch: `stream/daily-execution-command-v1`
- Worktree: `C:\FC-worktrees\daily-execution-command-v1`
- Owns: daily execution workflow over canonical jobs, Daily Logs, field notes,
  blockers, observations, photos, and execution next actions.
- Must avoid: separate field reporting system, duplicate issue tracker,
  duplicate punch-list model, schema changes, migrations, and portal behavior.
- Merged: `627358c4 feat: strengthen daily execution workflow`.
- Cleanup: worktree removed from Git worktree registry and local branch deleted
  after explicit approval.

### crew-execution-visibility-v1

- Branch: `stream/crew-execution-visibility-v1`
- Worktree: `C:\FC-worktrees\crew-execution-visibility-v1`
- Owns: cross-project field visibility over active, blocked, incomplete,
  office-attention, and execution-warning work.
- Must avoid: route optimization, dispatch replacement, crew scheduling
  replacement, dashboard sprawl, schema changes, and migrations.
- Merged: `980cfe5b feat: improve crew execution visibility`.
- Cleanup: worktree removed from Git worktree registry and local branch deleted
  after explicit approval.

### verification-field-execution-v1

- Branch: `stream/verification-field-execution-v1`
- Worktree: `C:\FC-worktrees\verification-field-execution-v1`
- Owns: verification for field execution depth.
- Must avoid: feature work, schema changes, UI redesign, runtime behavior, and
  loosening checks.
- Merged: `36e80505 test: protect field execution workflow`.
- Cleanup: worktree removed from Git worktree registry and local branch deleted
  after explicit approval.

### sales-readiness-command-v1

- Branch: `stream/sales-readiness-command-v1`
- Worktree: `C:\FC-worktrees\sales-readiness-command-v1`
- Owns: opportunity, lead, site assessment, requirements capture, and upstream
  estimating readiness.
- Must avoid: dashboard sprawl, duplicate opportunity/customer/project schema,
  duplicate intake models, autonomous scheduling, and portal behavior changes.
- Merged: `89275554 feat: clarify sales readiness command`.
- Cleanup: worktree and branch retained pending explicit retirement approval.

### estimate-contract-readiness-v1

- Branch: `stream/estimate-contract-readiness-v1`
- Worktree: `C:\FC-worktrees\estimate-contract-readiness-v1`
- Owns: estimate approval, contract generation, contract send/signature
  readiness, and readiness blockers between estimate and contract.
- Must avoid: duplicate contract/signature models, schema changes, settings
  mutation leakage on operational pages, and unapproved portal behavior changes.
- Merged: `b28fb457 feat: clarify estimate contract readiness`.
- Cleanup: worktree and branch retained pending explicit retirement approval.

### schedule-readiness-handoff-v1

- Branch: `stream/schedule-readiness-handoff-v1`
- Worktree: `C:\FC-worktrees\schedule-readiness-handoff-v1`
- Owns: commercial/financial readiness handoff into scheduling and Field.
- Must avoid: duplicate schedule/dispatch models, new job schema, autonomous
  dispatching, route optimization, and dashboard work.
- Merged: `09942b0b feat: clarify schedule readiness handoff`.
- Cleanup: worktree and branch retained pending explicit retirement approval.

### verification-sales-to-production-v1

- Branch: `stream/verification-sales-to-production-v1`
- Worktree: `C:\FC-worktrees\verification-sales-to-production-v1`
- Owns: verification for the sales-to-production handoff.
- Must avoid: feature work, schema changes, UI redesign, and loosening existing
  checks.
- Merged: `f4e31baf test: protect sales to production readiness`.
- Cleanup: worktree and branch retained pending explicit retirement approval.

### verification

- Branch: `stream/verification`
- Worktree: `C:\FC-worktrees\verification`
- Owns: golden workflow QA, route smoke tests, auth/fixture stabilization,
  merge-gate validation, verification docs.
- Must avoid: product feature work, schema, routes, business logic, fake QA data,
  local-only persistence, bypassing auth/RLS.
- Merged: PR #10.

### project-workspace

- Branch: `stream/project-workspace`
- Worktree: `C:\FC-worktrees\project-workspace`
- Owns: Project Workspace Production Hub waves, readiness ownership, continuity
  and handoff clarity.
- Must avoid: duplicate project/activity/task models, scheduling ownership,
  portal-owned state, financial math changes, autonomous AI actions.
- Merged: Project Workspace Production Hub Wave V1.

### scheduling

- Branch: `stream/scheduling`
- Worktree: `C:\FC-worktrees\scheduling`
- Owns: dispatch board stabilization, CrewBoard, conflict/capacity warnings,
  schedule handoff UX.
- Must avoid: duplicate dispatch tables, readiness bypasses, autonomous
  rescheduling, mobile-only schedule state, portal-owned schedule state.
- Merged: PR #12.

### communications

- Branch: `stream/communications`
- Worktree: `C:\FC-worktrees\communications`
- Owns: delivery proof, project message memory, customer follow-up memory, later
  provider-backed delivery status.
- Must avoid: disconnected inboxes, provider-owned business truth, customer sends
  without confirmation, AI-only communication memory, portal leakage.
- Merged: PR #9.

### financials-reporting

- Branch: `stream/financials-reporting`
- Worktree: `C:\FC-worktrees\financials-reporting`
- Owns: AR Control Room, collections visibility, payment evidence,
  production/collections reporting.
- Must avoid: duplicate ledgers, accounting-provider truth, invoice/payment math
  changes unless explicitly scoped, job-costing mutation before inputs mature.
- Merged: Financials AR / Reporting Control Room V1.

### project-workspace-v2

- Branch: `stream/project-workspace-v2`
- Worktree: `C:\FC-worktrees\project-workspace-v2`
- Owns: Project Workspace continuity and next-action ownership clarity.
- Must avoid: duplicate project/action models, scheduling ownership, financial
  action ownership, communication ownership, portal-owned operational state.
- Merged: `c809186c feat: clarify project operational command center`.
- Cleanup: worktree and local branch removed after explicit approval.

### field-command-center-v1

- Branch: `stream/field-command-center-v1`
- Worktree: `C:\FC-worktrees\field-command-center-v1`
- Owns: field execution command layer over canonical execution records.
- Must avoid: duplicate dispatch models, readiness bypasses, mobile-only
  schedule state, portal-owned execution truth.
- Merged: `6df16ed1 feat: shape field command center (#15)`.
- Cleanup: worktree, local branch, and remote branch removed after explicit
  approval.

### communications-continuity-v2

- Branch: `stream/communications-continuity-v2`
- Worktree: `C:\FC-worktrees\communications-continuity-v2`
- Owns: record-linked communication continuity and follow-up review.
- Must avoid: detached inbox truth, provider-owned business truth, hidden sends,
  portal leakage, duplicate message models.
- Merged: `890bfbad feat: strengthen communications continuity workspace`.
- Cleanup: worktree and local branch removed after explicit approval.

### financial-command-center-v1

- Branch: `stream/financial-command-center-v1`
- Worktree: `C:\FC-worktrees\financial-command-center-v1`
- Owns: AR, collections, billing command-center continuity.
- Must avoid: duplicate ledgers, detached invoice/payment truth, unscoped
  financial math changes, provider mutation, schema changes.
- Merged: `5844f52e feat: shape financial command center`.
- Cleanup: worktree and local branch removed after explicit approval.

### verification-v2

- Branch: `stream/verification-v2`
- Worktree: `C:\FC-worktrees\verification-v2`
- Owns: operational ownership verification framework and review-packet
  evidence.
- Must avoid: feature implementation, schema, routes, runtime behavior, hidden
  local-only workflow state.
- Merged: `f7caf1db test: protect operational ownership model`.
- Cleanup: worktree and local branch removed after explicit approval.

## Completed Merge Order

1. `verification`
2. `project-workspace`
3. `scheduling`
4. `communications`
5. `financials-reporting`
6. `architecture-coordination`

Architecture coordination docs merge last unless the docs are needed to unblock
or govern an implementation slice. This cleanup stream is now the last stream in
the first set.

## Paused Streams

- `portal`: paused until Project Workspace and Communications waves clarify
  customer-safe status and message boundaries.
- `field-mobile`: paused until Project Workspace and Scheduling waves clarify
  execution handoff and crew context.
- `financials`: legacy/superseded by `financials-reporting`; preserve useful
  work only through explicit reconciliation.
- `qa-verification`: legacy/superseded by `verification`; preserve useful work
  only through explicit reconciliation.
- `project-readiness-panel`: legacy/review-needed; reconcile into
  `project-workspace` or retire deliberately.
- workflow automation: paused beyond deterministic/read-only cue reliability.
- universal capture: paused beyond context hardening.
- AI/provider automation: paused until communications, scheduling, financials,
  and approval queues are production-grade.

## Governance File Ownership

Architecture Coordination owns changes to the active stream registry,
coordination prompt templates, worktree scripts, and related package scripts.
Feature streams should not modify or delete these files as incidental branch
drift:

- `active-worktrees.md`
- `active-waves.md`
- `.codex/active-stream-plan.md`
- `.codex/prompt-templates/**`
- `scripts/codex-streams.ps1`
- `scripts/codex-next.ps1`
- worktree platform scripts
- package scripts for `codex:*`, `worktree:*`, and shared devtools

If a feature stream needs one of these changes, it should call that out as an
Architecture Coordination dependency before editing.

## Daily Cadence

Morning:

```powershell
pnpm worktree:reconcile
pnpm worktree:audit
```

Before every Codex task:

```powershell
pnpm worktree:doctor
```

After every completed slice:

- run targeted validation
- inspect `git status`
- stage only intended files
- commit the completed slice
- run `pnpm wave:review`
- run `pnpm wave:pr` when a draft PR should be opened
- report changed files, validation, final status, and commit hash

Every 48 hours:

- reconcile active streams with `main`
- review hotspot overlap before merging
- retire or pause streams that no longer create parallel value

## Human-Reviewed PR Conveyor Belt

The standard stream flow is:

1. ChatGPT writes or updates `.codex/waves/<wave>.md`.
2. Codex runs that wave in the correct stream worktree.
3. Codex commits the completed slice.
4. Run `pnpm wave:review`.
5. Run `pnpm wave:pr`.
6. The PR opens as draft by default.
7. Request `@codex` review using `.codex/pr-review-instructions.md`.
8. The verification stream performs merge-readiness review.
9. Human reviewer checks the PR.
10. Human marks the PR ready only after validation is complete.
11. Human merges.
12. Run `pnpm worktree:finish <name>` when the stream is complete.

This is human-approved automation, not autonomous merging. The conveyor belt has
no automatic merge, no automatic ready-for-review transition, no automatic
branch deletion, no automatic worktree deletion, and no automatic destructive
cleanup.

## Quality Bar

- No duplicate business models.
- No schema unless explicitly scoped.
- No portal copies or portal-owned operational state.
- No financial math changes unless explicitly scoped.
- No autonomous AI actions or hidden provider mutation.
- No hidden local-only workflow state.
- Docs update when implemented truth changes.
- `docs/current-state.md` remains implemented truth.

## Recommended Next Prompt Order

1. Merge or retire `stream/architecture-coordination` after review.
2. Decide whether `ux-architecture` replaces or absorbs the remaining
   Architecture Coordination governance function for the next generation.
3. Run `pnpm worktree:finish <name>` only for streams the owner explicitly
   approves retiring.
4. Start the next feature stream from current `main` and update this registry
   before opening parallel work.
