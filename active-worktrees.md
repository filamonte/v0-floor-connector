# Active Worktrees

Status: Active
Doc Type: Developer Operations

This registry tracks the local FloorConnector worktrees used for parallel
development. It is an operational coordination aid, not product truth.

Canonical repo: `C:\FloorConnector`
Worktree root: `C:\FC-worktrees`

## Lifecycle

Statuses:

- `Active`: open production-acceleration stream receiving implementation,
  verification, or coordination work.
- `Integration`: canonical integration branch, not a production-acceleration
  stream.
- `Waiting Review`: work is complete locally and waiting for review.
- `Ready Merge`: reviewed and ready to merge in the agreed order.
- `Paused / Downstream`: intentionally not part of the current six-stream
  operating model, but likely needed after upstream waves land.
- `Legacy / Superseded`: preserved local stream that has been replaced by a
  clearer active stream name.
- `Legacy / Review Needed`: preserved local stream that should be reviewed or
  merged before retirement.
- `Merged`: merged to `main`, but worktree still exists temporarily.
- `Archived`: worktree retired or removed.

Expectations:

- Create streams with `pnpm worktree:create <name>`.
- Run `pnpm worktree:reconcile` and `pnpm worktree:audit` at the start of the
  day.
- Run `pnpm worktree:doctor` before every Codex task.
- Keep stream branches small enough to review and merge.
- Update this registry when a worktree is created, repurposed, merged, paused,
  or archived.
- Retire completed local worktrees with `pnpm worktree:finish <name>`.
- The current production-acceleration model has exactly six active streams:
  `architecture-coordination`, `verification`, `project-workspace`,
  `scheduling`, `communications`, and `financials-reporting`.
- Treat this registry and `.codex/active-stream-plan.md` as the canonical
  active-stream truth. Older capability-wave inventories are reference topology
  only when they name paused or legacy streams.
- Architecture Coordination owns registry/tooling changes. Feature streams
  should not modify or delete active-stream registry files, prompt templates,
  worktree scripts, or package scripts unless that governance work is
  explicitly assigned.

| Worktree                    | Branch                             | Purpose                                       | Owner       | Status                 | Created    | Last Updated | Notes                                                     | Current Wave                               | Merge Priority |
| --------------------------- | ---------------------------------- | --------------------------------------------- | ----------- | ---------------------- | ---------- | ------------ | --------------------------------------------------------- | ------------------------------------------ | -------------- |
| `main`                      | `main`                             | Canonical integration branch                  | Core        | Integration            | Unknown    | 2026-05-28   | Platform source of truth                                  | Integration                                | n/a            |
| `architecture-coordination` | `stream/architecture-coordination` | Sequencing, hotspot ownership, wave prompts   | Codex/local | Active                 | 2026-05-28 | 2026-05-28   | Docs-only coordination unless explicitly scoped otherwise | Six-stream operating model                 | 6              |
| `verification`              | `stream/verification`              | Golden workflow QA and merge-gate validation  | Codex/local | Active                 | 2026-05-28 | 2026-05-28   | Supersedes `qa-verification` for active QA work           | Golden Workflow QA Wave V1                 | 1              |
| `project-workspace`         | `stream/project-workspace`         | Project Workspace capability stream workspace | Codex/local | Active                 | Unknown    | 2026-05-28   | Platform main merged locally                              | Project Workspace Production Hub Wave V1   | 2              |
| `scheduling`                | `stream/scheduling`                | Scheduling/CrewBoard stream workspace         | Codex/local | Active                 | Unknown    | 2026-05-28   | Platform main merged locally                              | Scheduling Dispatch Board Stabilization V1 | 3              |
| `communications`            | `stream/communications`            | Communications stream workspace               | Codex/local | Active                 | Unknown    | 2026-05-28   | Local-only upstream state currently configured            | Communications Delivery Proof Review V1    | 4              |
| `financials-reporting`      | `stream/financials-reporting`      | Financials and reporting stream workspace     | Codex/local | Active                 | 2026-05-28 | 2026-05-28   | Supersedes broad `financials` for active production work  | Financials AR / Reporting Control Room V1  | 5              |
| `field-mobile`              | `stream/field-mobile`              | Field/mobile stream workspace                 | Codex/local | Paused / Downstream    | Unknown    | 2026-05-28   | Resume after Project Workspace and Scheduling waves       | Field/Mobile Daily Field Speed V1          | paused         |
| `portal`                    | `stream/portal`                    | Customer portal stream workspace              | Codex/local | Paused / Downstream    | Unknown    | 2026-05-28   | Resume after Project Workspace and Communications waves   | Portal Customer-Safe Project Status V1     | paused         |
| `financials`                | `stream/financials`                | Legacy financials stream workspace            | Codex/local | Legacy / Superseded    | Unknown    | 2026-05-28   | Preserved; active work moves to `financials-reporting`    | Legacy financials continuity review        | legacy         |
| `qa-verification`           | `stream/qa-verification`           | Legacy QA and verification stream workspace   | Codex/local | Legacy / Superseded    | Unknown    | 2026-05-28   | Preserved; active work moves to `verification`            | Legacy QA continuity review                | legacy         |
| `project-readiness-panel`   | `stream/project-readiness-panel`   | Project Workspace readiness slice workspace   | Codex/local | Legacy / Review Needed | Unknown    | 2026-05-28   | Review before retirement or merge into project-workspace  | Readiness panel continuity review          | legacy         |

Use `pnpm worktree:status` for compact live branch health,
`pnpm worktree:reconcile` for the morning reconciliation view, and
`pnpm codex:streams` for the active six-stream operating summary.
