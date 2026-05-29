# Architecture Coordination Drift Cleanup

Status: Active
Doc Type: Repository Hygiene Checkpoint
Date: 2026-05-29

## Scope

This checkpoint resolves the coordination registry drift identified in
[docs/architecture-coordination-health-report.md](C:/FloorConnector/docs/architecture-coordination-health-report.md).
It is docs/governance cleanup only. It does not change feature implementation,
schema, app routes, UI, runtime behavior, package dependencies, environment
variables, auth, RLS, payments, signatures, portal access, or provider behavior.

## Active Coordination Docs Reviewed

- [active-worktrees.md](C:/FloorConnector/active-worktrees.md)
- [active-waves.md](C:/FloorConnector/active-waves.md)
- [.codex/active-stream-plan.md](C:/FloorConnector/.codex/active-stream-plan.md)
- [.codex/parallel-development.md](C:/FloorConnector/.codex/parallel-development.md)
- [.codex/worktree-rules.md](C:/FloorConnector/.codex/worktree-rules.md)
- [.codex/prompt-templates/architecture-wave-planning.md](C:/FloorConnector/.codex/prompt-templates/architecture-wave-planning.md)
- [.codex/prompt-templates/implementation-wave.md](C:/FloorConnector/.codex/prompt-templates/implementation-wave.md)
- [.codex/prompt-templates/merge-readiness-review.md](C:/FloorConnector/.codex/prompt-templates/merge-readiness-review.md)
- [.codex/prompt-templates/reconciliation-review.md](C:/FloorConnector/.codex/prompt-templates/reconciliation-review.md)
- [.codex/prompt-templates/verification-wave.md](C:/FloorConnector/.codex/prompt-templates/verification-wave.md)
- [docs/ai-native-development-architecture.md](C:/FloorConnector/docs/ai-native-development-architecture.md)
- [docs/design/operational-capability-waves-v1-coordination.md](C:/FloorConnector/docs/design/operational-capability-waves-v1-coordination.md)
- [docs/design/project-workspace-capability-wave-v1.md](C:/FloorConnector/docs/design/project-workspace-capability-wave-v1.md)
- [docs/design/scheduling-capability-wave-v1.md](C:/FloorConnector/docs/design/scheduling-capability-wave-v1.md)
- [docs/design/field-mobile-capability-wave-v1.md](C:/FloorConnector/docs/design/field-mobile-capability-wave-v1.md)
- [docs/design/portal-capability-wave-v1.md](C:/FloorConnector/docs/design/portal-capability-wave-v1.md)
- [docs/design/worktree-docs-drift-checkpoint.md](C:/FloorConnector/docs/design/worktree-docs-drift-checkpoint.md)
- [scripts/README.md](C:/FloorConnector/scripts/README.md)

## Canonical Active Model

The current production-acceleration model has exactly six active streams:

| Stream                      | Status | Branch                             | Notes                                                    |
| --------------------------- | ------ | ---------------------------------- | -------------------------------------------------------- |
| `architecture-coordination` | Active | `stream/architecture-coordination` | Owns governance, sequencing, merge risk, and tooling     |
| `verification`              | Active | `stream/verification`              | Supersedes `qa-verification` for active QA work          |
| `project-workspace`         | Active | `stream/project-workspace`         | Project hub, readiness, and continuity work              |
| `scheduling`                | Active | `stream/scheduling`                | CrewBoard and job-based scheduling work                  |
| `communications`            | Active | `stream/communications`            | Shared record-linked communications work                 |
| `financials-reporting`      | Active | `stream/financials-reporting`      | Supersedes broad `financials` for AR/reporting work      |
| `portal`                    | Paused | `stream/portal`                    | Downstream after Project Workspace and Communications    |
| `field-mobile`              | Paused | `stream/field-mobile`              | Downstream after Project Workspace and Scheduling        |
| `financials`                | Legacy | `stream/financials`                | Reconcile useful work into `financials-reporting`        |
| `qa-verification`           | Legacy | `stream/qa-verification`           | Reconcile useful work into `verification`                |
| `project-readiness-panel`   | Legacy | `stream/project-readiness-panel`   | Review before retirement or project-workspace absorption |

## Drift Resolved

- `active-worktrees.md` now explicitly names itself and
  `.codex/active-stream-plan.md` as the canonical active-stream truth.
- `.codex/active-stream-plan.md` now records paused and legacy stream handling,
  plus Architecture Coordination ownership for registry, prompt-template,
  worktree-script, and related package-script changes.
- `active-waves.md` now points readers back to the active registry before
  treating Field/Mobile or Portal capability-wave docs as active work.
- `docs/ai-native-development-architecture.md` now has a current active-stream
  override and describes the broader stream inventory as reference topology,
  not current active-stream authorization.

## Remaining Merge Risk

Feature branches that still carry stale worktree registry/tooling deletions
should remove those hunks before merge. In particular, merge reviewers should
reject incidental changes to:

- `active-worktrees.md`
- `active-waves.md`
- `.codex/active-stream-plan.md`
- `.codex/prompt-templates/**`
- `scripts/codex-streams.ps1`
- `scripts/codex-next.ps1`
- worktree platform scripts
- package scripts for `codex:*`, `worktree:*`, and shared devtools

The one unresolved product-ownership decision remains Financials stream
reconciliation: useful work on legacy `stream/financials` should be explicitly
cherry-picked, moved, or reclassified before merging into the active
production-acceleration sequence.
