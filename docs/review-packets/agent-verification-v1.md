# Agent Verification V1 Proposal

Status: Proposed
Doc Type: Review Packet

## Summary

`agent-verification-v1` is a proposed Governance Infrastructure Stream that
would convert FloorConnector's AI governance from documentation-only guidance
into executable verification tooling.

The stream should create machine-verifiable startup, stream-alignment, and
completion checks without changing application behavior.

## Proposed Identity

- Name: `agent-verification-v1`
- State: Proposed
- Type: Governance Infrastructure Stream
- Priority: High
- Proposed branch: `stream/agent-verification-v1`
- Proposed worktree: `C:\FC-worktrees\agent-verification-v1`

## Goal

Create executable AI-governance verification tooling that can be used by:

- Desktop Codex
- Phone Codex
- autonomous Codex runs
- future AI agents
- future Claude/Cursor-compatible workflows

The stream should help agents verify governance instead of only reading
governance.

## Rationale

FloorConnector now has mature AI governance documentation:

- [AGENTS.md](C:/FloorConnector/AGENTS.md)
- [docs/agent-governance.md](C:/FloorConnector/docs/agent-governance.md)
- [docs/agent-startup-checklist.md](C:/FloorConnector/docs/agent-startup-checklist.md)
- [docs/autonomous-run-governance.md](C:/FloorConnector/docs/autonomous-run-governance.md)
- [docs/ai-diagnostics.md](C:/FloorConnector/docs/ai-diagnostics.md)

The next maturity step is executable validation. Written governance should be
backed by commands that can fail fast when an agent is in the wrong repository,
wrong branch, wrong worktree, stale upstream state, or incomplete completion
state.

## Success Criteria

- Machine-verifiable startup and completion checks exist.
- Tooling produces clear `PASS` or `FAIL with reason` output.
- Tooling reuses existing worktree infrastructure where practical.
- No application code changes.
- No schema changes.
- No business logic changes.
- No UI changes.
- No Supabase changes.

## Phase 1: Startup Check

Create:

```powershell
pnpm fc:startup-check
```

Verify:

- inside FloorConnector repo
- valid git repository
- `AGENTS.md` exists
- required governance docs exist
- branch detected
- upstream detected
- active worktree detected
- origin reachable

Output:

- `PASS`
- or `FAIL` with reason

## Phase 2: Stream Check

Create:

```powershell
pnpm fc:stream-check
```

Verify:

- stream registered
- worktree registered
- branch/worktree alignment
- no duplicate stream ownership
- governance docs available

Output:

- `PASS`
- or `FAIL` with reason

## Phase 3: Completion Check

Create:

```powershell
pnpm fc:completion-check
```

Verify:

- clean git status
- validations passed or explicitly recorded
- branch reported
- ahead/behind reported
- required completion metadata present

Output:

- completion report

## Phase 4: Doctor Integration Review

Review existing:

```powershell
pnpm worktree:doctor
```

Determine:

- overlap with proposed checks
- missing checks
- opportunities for integration

Prefer reuse over duplication. The new checks should not fork existing worktree
health logic when `worktree:doctor` already provides the same signal.

## Phase 5: AGENTS.md Integration

After tooling exists, update [AGENTS.md](C:/FloorConnector/AGENTS.md) to require:

Before work:

```powershell
pnpm fc:startup-check
```

Before completion:

```powershell
pnpm fc:completion-check
```

If either fails:

```text
STOP.
```

## Phase 6: Autonomous-Run Support

Document how autonomous agents should use:

- startup-check
- stream-check
- completion-check

before making modifications.

## Validation Plan

Run, unless later scoped more narrowly:

```powershell
pnpm lint
pnpm typecheck
pnpm worktree:doctor
git diff --check
git diff --cached --check
```

The implementation stream should also provide example output for:

- `pnpm fc:startup-check`
- `pnpm fc:completion-check`

## Approval Boundary

This stream may create tooling, scripts, docs, and `package.json` entries.

This stream may not:

- modify business workflows
- modify UI
- modify schema
- modify canonical records
- modify application behavior
- modify Supabase
- modify financial logic
- open a PR without explicit approval
- merge or auto-continue to another wave

## Current Gate Status

| Gate item                          | Status   | Evidence / note                                                                                    |
| ---------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| Proposal recorded                  | Complete | This review packet records the proposed stream.                                                    |
| Ownership area defined             | Proposed | Governance verification tooling over AI startup, stream, and completion checks.                    |
| Dependency analysis                | Pending  | Must inspect existing `worktree:doctor`, `fc:status`, wave runner, and package script conventions. |
| Ownership conflict check           | Pending  | Must confirm no active stream owns executable AI governance checks.                                |
| UX / IA impact review              | Pending  | Expected none; must confirm no UI/application changes.                                             |
| Canonical model review             | Pending  | Expected none; must confirm no schema, Supabase, or canonical-record changes.                      |
| Verification strategy              | Proposed | See validation plan above.                                                                         |
| Architecture Coordination approval | Pending  | Required before stream creation.                                                                   |
| Jeff approval gate                 | Pending  | Required before branch/worktree creation or implementation.                                        |

## Proposed Return Fields For Implementation Stream

When implemented, return:

- files changed
- validation performed
- startup-check example output
- completion-check example output
- final git status
- commit hash
- ahead/behind count
