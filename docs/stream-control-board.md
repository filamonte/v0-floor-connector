# Stream Control Board

Status: Active
Doc Type: Developer Operations

This board should reflect reality, not aspirations. Update it when branch,
worktree, PR, validation, blocker, or next-slice state changes. Use
`pnpm fc:status`, `pnpm wave:status`, and GitHub PR state as evidence.

## Control Tower / Architecture

| Field                     | Value                                                                          |
| ------------------------- | ------------------------------------------------------------------------------ |
| Purpose                   | Stream governance, registry truth, prompt contracts, merge order, and tooling  |
| Local worktree path       | `C:\FC-worktrees\architecture-coordination`                                    |
| Branch                    | `stream/architecture-coordination`                                             |
| Current PR                | none recorded                                                                  |
| Status                    | Active cleanup stream                                                          |
| Blocked by                | Human merge/retirement decisions as needed                                     |
| Shared-risk files touched | `active-worktrees.md`, `.codex/**`, scripts, package scripts, GitHub templates |
| Last main sync            | 2026-06-01 local branch reset to `origin/main` at `bcac52a5`                   |
| Last validation           | `pnpm fc:status`; main `pnpm fc:preflight:fast`                                |
| Next intended slice       | Start future coordination work from refreshed local branch                     |

## Verification

| Field                     | Value                                                                       |
| ------------------------- | --------------------------------------------------------------------------- |
| Purpose                   | Golden workflow QA, merge-gate validation, route smoke, auth/fixture health |
| Local worktree path       | `C:\FC-worktrees\verification`                                              |
| Branch                    | `stream/verification`                                                       |
| Current PR                | PR #10 merged                                                               |
| Status                    | Merged, retained temporarily                                                |
| Blocked by                | Explicit worktree retirement decision                                       |
| Shared-risk files touched | E2E specs, Playwright config, validation docs                               |
| Last main sync            | Merged to `main`                                                            |
| Last validation           | See PR #10 evidence and current live status commands                        |
| Next intended slice       | Retire or reuse only after owner approval                                   |

## Project Workspace

| Field                     | Value                                                           |
| ------------------------- | --------------------------------------------------------------- |
| Purpose                   | Project Workspace continuity, readiness, source-record handoffs |
| Local worktree path       | `C:\FC-worktrees\project-workspace`                             |
| Branch                    | `stream/project-workspace`                                      |
| Current PR                | merged                                                          |
| Status                    | Merged, retained temporarily                                    |
| Blocked by                | Explicit worktree retirement decision                           |
| Shared-risk files touched | Project Workspace page, project read models, current-state docs |
| Last main sync            | Merged to `main`                                                |
| Last validation           | See merged PR evidence and current live status commands         |
| Next intended slice       | Retire or start a new branch from current `main`                |

## Scheduling

| Field                     | Value                                                                     |
| ------------------------- | ------------------------------------------------------------------------- |
| Purpose                   | CrewBoard, scheduling visibility, dispatch review, canonical job handoffs |
| Local worktree path       | `C:\FC-worktrees\scheduling`                                              |
| Branch                    | `stream/scheduling`                                                       |
| Current PR                | PR #12 merged                                                             |
| Status                    | Merged, refreshed to current `origin/main`, retained temporarily          |
| Blocked by                | Explicit worktree retirement decision                                     |
| Shared-risk files touched | `/schedule`, schedule helpers/tests, Scheduling E2E                       |
| Last main sync            | 2026-06-01 local branch reset to `origin/main` at `bcac52a5`              |
| Last validation           | `pnpm fc:preflight:fast` and schedule helper tests passed                 |
| Next intended slice       | Retire or start next Scheduling slice from current `main`                 |

## Communications

| Field                     | Value                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------- |
| Purpose                   | Communications workspace, delivery proof, reply continuity, record-linked messages |
| Local worktree path       | `C:\FC-worktrees\communications`                                                   |
| Branch                    | `stream/communications`                                                            |
| Current PR                | PR #9 merged                                                                       |
| Status                    | Merged, retained temporarily                                                       |
| Blocked by                | Explicit worktree retirement decision                                              |
| Shared-risk files touched | `/communications`, communication helpers/tests, current-state docs                 |
| Last main sync            | Merged to `main`                                                                   |
| Last validation           | See PR #9 evidence and current live status commands                                |
| Next intended slice       | Retire or start provider-dark follow-up from current `main`                        |

## Financials Reporting

| Field                     | Value                                                                           |
| ------------------------- | ------------------------------------------------------------------------------- |
| Purpose                   | AR Control Room, collections visibility, payment evidence, reporting continuity |
| Local worktree path       | `C:\FC-worktrees\financials-reporting`                                          |
| Branch                    | `stream/financials-reporting`                                                   |
| Current PR                | merged                                                                          |
| Status                    | Merged, retained temporarily                                                    |
| Blocked by                | Explicit worktree retirement decision                                           |
| Shared-risk files touched | AR/reporting pages, invoice/payment read models, financial docs                 |
| Last main sync            | Merged to `main`                                                                |
| Last validation           | Check live status and merged PR evidence                                        |
| Next intended slice       | Retire or start next financials slice from current `main`                       |

## Field / Mobile

| Field                     | Value                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------- |
| Purpose                   | Field execution and mobile workflows over Daily Logs, Job Notes, Work Items, evidence |
| Local worktree path       | `C:\FC-worktrees\field-mobile`                                                        |
| Branch                    | `stream/field-mobile`                                                                 |
| Current PR                | none recorded                                                                         |
| Status                    | Paused / downstream                                                                   |
| Blocked by                | Upstream Project Workspace and Scheduling clarity                                     |
| Shared-risk files touched | Field routes, Daily Log, Job Note, execution attachment helpers                       |
| Last main sync            | Check before resuming                                                                 |
| Last validation           | Not current; run fresh before work                                                    |
| Next intended slice       | Resume only with a fresh prompt and current `main` sync                               |

## Optional / Paused Streams

| Stream                  | Local worktree path                       | Branch                           | Status                                                | Next action                                                                           |
| ----------------------- | ----------------------------------------- | -------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Portal                  | `C:\FC-worktrees\portal`                  | `stream/portal`                  | Paused / downstream                                   | Resume after customer-safe project and communications boundaries are selected         |
| Financials legacy       | `C:\FC-worktrees\financials`              | `stream/financials`              | Retired / superseded by `stream/financials-reporting` | Do not push, PR, merge, or cherry-pick; remove local worktree only after owner review |
| QA verification legacy  | `C:\FC-worktrees\qa-verification`         | `stream/qa-verification`         | Legacy / superseded                                   | Preserve only through explicit reconciliation                                         |
| Project readiness panel | `C:\FC-worktrees\project-readiness-panel` | `stream/project-readiness-panel` | Legacy / review needed                                | Review or retire deliberately                                                         |
