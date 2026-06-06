# Agent Startup Checklist

Status: Active
Doc Type: Developer Operations

This checklist is the required pre-change routine for AI-assisted work in
FloorConnector. It complements [AGENTS.md](C:/FloorConnector/AGENTS.md) and
[docs/agent-governance.md](C:/FloorConnector/docs/agent-governance.md).

Use it before implementation, review, documentation, coordination, stream
launch, or autonomous-run work.

## Stop Conditions

Stop before editing if any of these are unclear:

- the current directory is not `C:\FloorConnector` or an approved
  `C:\FC-worktrees\<stream>` checkout
- the branch does not match the requested task
- the upstream state cannot be verified
- the active stream/worktree cannot be matched to the active registry
- the worktree is dirty with unrelated changes
- the task scope would touch app code, schema, business logic, provider calls,
  customer-facing sends, financial state, signature state, scheduling state, or
  tenant/auth behavior without explicit approval

## Checklist

1. Verify repository location.

   Expected commands:

   ```powershell
   Get-Location
   git rev-parse --show-toplevel
   ```

   Expected result: repo root is `C:\FloorConnector` for canonical `main` work
   or the approved `C:\FC-worktrees\<stream>` path for stream work.

2. Verify branch.

   Expected commands:

   ```powershell
   git status --short --branch
   git branch --show-current
   ```

   Expected result: branch matches the task. `main` is used only for canonical
   integration or explicitly scoped main-checkout governance/docs work.

3. Verify worktree.

   Expected commands:

   ```powershell
   git worktree list
   pnpm.cmd worktree:doctor
   ```

   Expected result: the current checkout is listed, branch state is healthy, and
   local shared tooling links are valid.

4. Verify upstream.

   Expected commands:

   ```powershell
   git remote -v
   git fetch origin
   git rev-list --left-right --count HEAD...origin/main
   ```

   Expected result: remote is
   `https://github.com/filamonte/v0-floor-connector.git`; ahead/behind state is
   known and reported.

5. Verify active stream ownership.

   Read:
   - [active-worktrees.md](C:/FloorConnector/active-worktrees.md)
   - [.codex/active-stream-plan.md](C:/FloorConnector/.codex/active-stream-plan.md)
   - [active-waves.md](C:/FloorConnector/active-waves.md)

   Expected result: the intended branch/worktree/status is registered, or the
   task is explicitly main-checkout governance/docs work.

6. Verify required docs read.

   Read at minimum:
   - [AGENTS.md](C:/FloorConnector/AGENTS.md)
   - [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
   - [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
   - [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
   - [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
   - [.codex/worktree-rules.md](C:/FloorConnector/.codex/worktree-rules.md)
   - [.codex/active-stream-plan.md](C:/FloorConnector/.codex/active-stream-plan.md)

   For AI/governance work, also read:
   - [docs/agent-governance.md](C:/FloorConnector/docs/agent-governance.md)
   - [docs/autonomous-run-governance.md](C:/FloorConnector/docs/autonomous-run-governance.md)
   - [docs/ai-diagnostics.md](C:/FloorConnector/docs/ai-diagnostics.md)

7. Verify no conflicting stream exists.

   Expected checks:

   ```powershell
   pnpm.cmd worktree:status
   pnpm.cmd worktree:reconcile
   ```

   If those are too broad for the current task, inspect the active registry and
   report that live reconciliation was skipped.

8. Verify intended scope.

   Confirm whether the task is:
   - docs/governance only
   - implementation
   - verification only
   - stream launch/coordination
   - cleanup/retirement

   For docs/governance-only tasks, do not touch `apps/`, `packages/`,
   `supabase/`, migrations, route files, server actions, business helpers, or
   generated types.

## Completion Fields

Every completed stream or governance report must include:

- branch
- worktree
- upstream status and ahead/behind count
- files changed
- validation executed
- final git status
- commit hash when committed
- environment variable changes, if any
- blockers or follow-up dependencies
