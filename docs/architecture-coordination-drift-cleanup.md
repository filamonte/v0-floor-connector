# Architecture Coordination Drift Cleanup

Status: Active
Doc Type: Repository Hygiene Checkpoint
Date: 2026-05-29

Post-merge update: refreshed 2026-05-31 after Communications PR #9,
Verification PR #10, and Scheduling PR #12 merged to `main`.

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

The first production-acceleration stream set has merged to `main`. The current
post-merge registry keeps `architecture-coordination` as the only active cleanup
stream and retains the merged stream worktrees temporarily until explicit
retirement.

| Stream                      | Status | Branch                             | Notes                                                    |
| --------------------------- | ------ | ---------------------------------- | -------------------------------------------------------- |
| `architecture-coordination` | Active | `stream/architecture-coordination` | Final post-merge cleanup and registry truth              |
| `verification`              | Merged | `stream/verification`              | PR #10 merged; worktree retained temporarily             |
| `project-workspace`         | Merged | `stream/project-workspace`         | Project hub work merged before downstream streams        |
| `scheduling`                | Merged | `stream/scheduling`                | PR #12 merged; worktree retained temporarily             |
| `communications`            | Merged | `stream/communications`            | PR #9 merged; worktree retained temporarily              |
| `financials-reporting`      | Merged | `stream/financials-reporting`      | AR/reporting stream merged; worktree retained            |
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

Future feature branches that carry stale worktree registry/tooling deletions
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

The legacy `stream/financials` worktree still exists and should remain out of
the active registry unless the owner explicitly reopens it. Do not delete or
merge it as part of this cleanup task.
