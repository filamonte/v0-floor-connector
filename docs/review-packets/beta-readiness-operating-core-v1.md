# Beta Readiness Operating Core V1

Status: Proposed / Architecture Review
Doc Type: Wave Plan / Review Packet

Wave id: `beta-readiness-operating-core-v1`

Date: 2026-06-09

## Purpose

Move FloorConnector from aligned product architecture toward a usable,
marketable beta platform by planning the highest-leverage operating-core gaps
as coordinated streams before any implementation begins.

This packet is planning and governance setup only. It does not create branches,
create worktrees, implement app features, change schema, change runtime
behavior, open PRs, or approve a merge.

## Capability And Program Mapping

This wave crosses several registered and emerging capability areas:

- Assessment Intelligence: Opportunity-owned Assessment Package and estimator
  handoff.
- Operational Work Management: Project handoff, readiness ownership, and
  operational accountability.
- Financial Readiness: payment-schedule based commercial readiness over the
  canonical financial chain.
- UX Governance: beta-blocking consistency cleanup under the merged design
  system governance.

Because Financial Readiness is not yet a registered standalone capability, this
wave must be reviewed by Architecture Coordination before stream activation.
Capability-registry maturity must not change from this planning packet alone.

## Source Docs Read

- `AGENTS.md`
- `docs/agent-governance.md`
- `docs/agent-startup-checklist.md`
- `docs/autonomous-run-governance.md`
- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `.codex/worktree-rules.md`
- `.codex/active-stream-plan.md`
- `docs/product-operating-model.md`
- `docs/design-system-governance.md`
- `docs/sales-to-production.md`
- `docs/system-overview.md`
- `docs/Roadmap.md`
- `docs/target-ia.md`
- `docs/capability-map.md`
- `docs/capability-registry.md`
- `docs/program-architecture.md`
- `docs/aia-progress-billing-plan.md`
- `docs/graphite-copper-ui-system.md`
- `docs/ui-patterns.md`
- `active-worktrees.md`
- `active-waves.md`
- `docs/parallel-development-governance.md`
- `docs/operational-architecture-v1.md`

## Proposed Streams

| Stream                              | Owner area                                                                     | Proposed status | Parallel posture                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------ | --------------- | ------------------------------------------------------------------------------- |
| `payment-schedule-readiness-v1`     | Contract payment schedule and Financial Readiness foundation                   | Proposed        | Should start first or in parallel with narrow assessment planning               |
| `opportunity-assessment-package-v1` | Opportunity-owned pre-estimate Assessment Package planning and transition path | Proposed        | Can run in parallel only if it avoids current Program A implementation hotspots |
| `project-handoff-alignment-v1`      | Project creation timing and sales-to-operations continuity                     | Proposed        | Should wait for payment readiness and assessment ownership clarity              |
| `ux-governance-beta-cleanup-v1`     | Beta-blocking UX consistency cleanup under design governance                   | Proposed        | Can run in parallel if it stays presentation-only and avoids business logic     |

## Proposed Dependency Order

1. `payment-schedule-readiness-v1` starts first because Financial Readiness
   affects Project creation, scheduling, and production readiness.
2. `opportunity-assessment-package-v1` may run in parallel only after conflict
   review against `assessment-package-depth-v1` and `area-space-model-v1`.
3. `project-handoff-alignment-v1` waits for clear payment schedule and
   Assessment Package ownership decisions.
4. `ux-governance-beta-cleanup-v1` can run in parallel as a UI/read-model-only
   cleanup stream if it does not change canonical workflow behavior.

Verification lands after implementation streams if a later approved wave adds a
dedicated verification stream or assigns verification to Architecture
Coordination.

## Non-Goals

- no scheduling board implementation
- no full AIA implementation
- no AI automation
- no customer self-service implementation
- no marketplace or ecosystem work
- no major redesign outside governance cleanup
- no provider/customer-facing sends
- no detached payment, signature, checkout, billing, or AIA models
- no portal-owned operational copies
- no role-specific data models

## Shared Canonical Guardrails

- No data silos.
- One canonical shared data model.
- Records flow forward and are not recreated downstream.
- Contractor app and Portal are surfaces over shared canonical records.
- Opportunity/Assessment owns target pre-sale work before Project exists.
- Project remains the operational root after sale.
- Financial Readiness is payment-schedule based, not hardcoded to deposit paid.
- Production Readiness includes scope, required payment terms where applicable,
  materials, labor, tooling/equipment, schedule readiness, and site blockers.
- Role-aware dashboards are presentation and personalization only.
- Current implemented truth remains separate from target direction.

## Cross-Stream Hotspots

- Contract payment terms, invoices, payments, Payment Trail, SOV/progress
  billing, and readiness helpers are financial hotspots.
- Assessment Package ownership overlaps active Program A assessment streams and
  must be coordinated before any branch/worktree activation.
- Project creation and handoff logic sits between opportunity, estimate,
  contract, project, job, invoice, and schedule readiness.
- Dashboard, Financials, Manager Pages, Project Workspace, and record
  workspaces are UX hotspots where cleanup must avoid business-logic changes.

## Acceptance Criteria

- Wave and stream review packets exist.
- Active registries record the wave as proposed planning, not implementation
  approval.
- Stream dependencies and parallel eligibility are explicit.
- Anti-silo checks are recorded for each stream.
- Current-state implemented truth is not changed.
- No app, schema, migration, provider, runtime config, or environment variable
  files are changed.

## Validation Plan

For this planning task:

```powershell
pnpm.cmd exec prettier --write <changed markdown files>
git diff --check
git diff --cached --check
pnpm.cmd worktree:doctor
```

Future implementation validation must add targeted tests, typecheck, lint,
`pnpm.cmd fc:preflight:fast`, and route smoke where the approved stream touches
helpers, actions, read models, financial state, portal surfaces, or protected
workflows.

## Merge And Readiness Gates

- This packet may be committed as docs/governance planning.
- Stream/worktree creation remains blocked until Architecture Coordination and
  Jeff approve the stream set or a narrowed first stream.
- Implementation remains blocked until a later explicit start prompt names the
  stream and worktree.
- `project-handoff-alignment-v1` must not start until the payment and
  assessment ownership decisions are reviewed.
- `opportunity-assessment-package-v1` must not override or duplicate active
  Program A assessment streams.

## Recommended First Stream

Start `payment-schedule-readiness-v1` first after review. It is the clearest
operating-core dependency for Financial Readiness, Project creation timing,
production readiness, scheduling handoff, and future AIA posture.
