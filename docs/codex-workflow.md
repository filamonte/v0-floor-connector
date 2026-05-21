# Codex Workflow

Status: reusable operating mode for future Codex work in this repo.

Use this workflow to reduce prompt drift and out-of-order implementation.

## Standard Flow

### 1. Read Source Of Truth First

Start with:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- plus any task-specific docs the user names

If current-state and a target/planning doc differ, trust current-state for implemented truth.

### 2. Inspect The Relevant Code First

Before proposing changes:
- inspect the current route, component, data utility, or migration files
- verify whether a placeholder is still a placeholder
- check for recent implemented work on the same workflow

### 3. Plan Before Building

For non-trivial work, produce an implementation plan before editing files.

A good plan includes:
- files likely to change
- data/model impact
- UI/workspace impact
- continuity impact on the canonical chain
- migration needs, if any
- validation steps
- documentation impact

### 4. Call Out Risks And Continuity Concerns

Identify up front:
- duplicate-model risk
- tenant-isolation risk
- workflow continuity risk
- UI baseline drift risk
- target-vs-implemented confusion

### 5. Approval Checkpoint

For meaningful product changes, pause after the plan and let the user confirm direction before building.

Approval is especially important when:
- there are multiple reasonable implementation paths
- a change could broaden scope
- the task may affect the canonical workflow chain
- a UI change could alter the established contractor baseline

### 6. Then Implement

During implementation:
- make the smallest clean change that satisfies the request
- preserve shared models and shared wrappers
- avoid one-off hacks when a shared pattern exists
- do not invent fake persistence or fake workflows

### 7. Validate

Run:
- `pnpm typecheck`
- `pnpm lint`

If validation cannot run, say exactly why.

### 8. Update Docs When Truth Changes

If implementation truth materially changed:
- update [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- update [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md) or [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md) when fast guidance changed
- update [README.md](C:/FloorConnector/README.md) if the documentation map changed

## Build Checklist

Before finishing a task, verify:
- no duplicate business entities were introduced
- canonical continuity still holds
- tenant isolation was preserved
- the contractor UI still fits the shared shell/theme direction
- docs and implementation language still agree

## Anti-Drift Rules

Do not:
- implement target-only ideas as present reality
- create disconnected modules or side systems
- broaden a small task into roadmap work
- skip the code inspection step
- skip the planning step on meaningful tasks

When in doubt:
- tighten the current system before extending it
- favor continuity over module completeness
- keep project as the operational root
