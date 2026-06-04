# Active Waves

Status: Planning-only
Doc Type: Coordination Index

This file is a compact pointer to the current operational capability-wave
planning set. It does not authorize implementation and does not make any planned
wave implemented truth.

For implemented status, use
[docs/current-state.md](C:/FloorConnector/docs/current-state.md).

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

The governing product architecture principle is defined in
[docs/operational-architecture-v1.md](C:/FloorConnector/docs/operational-architecture-v1.md):
future waves must make FloorConnector feel more like one operational command
center and less like disconnected modules.

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
