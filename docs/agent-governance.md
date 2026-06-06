# Agent Governance

Status: Active
Doc Type: Developer Operations

This document explains how AI agents should start, verify, and complete work in
FloorConnector. It complements the root [AGENTS.md](C:/FloorConnector/AGENTS.md)
rulebook and does not replace [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
as implemented truth.

## Purpose

`AGENTS.md` is the repository-level operating guide for Codex and future
AI-assisted development tools. It keeps repo identity, startup checks,
worktree boundaries, canonical-domain rules, tenant-safety rules, and completion
expectations in a file that agent tools can discover before task-specific chat
context.

Agents must read `AGENTS.md` before implementation, review, documentation, or
coordination work.

## Agent Instruction Hierarchy

Recommended hierarchy:

1. Personal/global agent guidance, such as `~/.codex/AGENTS.md`, for stable
   user-wide defaults that apply before an agent enters any repository.
2. Repository guidance at [AGENTS.md](C:/FloorConnector/AGENTS.md), which is
   authoritative for all FloorConnector work.
3. Subdirectory or stream-level `AGENTS.md` files only when a future area needs
   durable, local rules that cannot be expressed clearly in the root rulebook.

Do not create user-specific personal/global files from a repository task.
Personal/global guidance should stay generic and should point agents into the
repository checklist rather than duplicating FloorConnector-specific truth.

Repository guidance wins for FloorConnector-specific rules. Stream-level or
subdirectory guidance may narrow behavior for a local area, but it must not
weaken canonical lifecycle, tenant isolation, auth/RLS, financial, signature,
portal, provider, or human-review requirements from the root rulebook.

Current recommendation: keep only the root `AGENTS.md` plus the governance docs
in this repository. Add stream-level `AGENTS.md` files only after a repeated
stream-specific failure proves that local guidance is needed.

## Supported AI Tools

The governance model is intended for:

- Codex Desktop
- Codex Cloud
- Codex CLI
- ChatGPT mobile or browser sessions that can access the repository
- future Claude, Cursor, VS Code AI, or other agent-assisted development tools

Each tool may have different filesystem access, approval prompts, sandbox
behavior, network access, and visibility into local worktrees. Those runtime
differences are expected. The repository rules still apply.

## Startup Sequence

Before work begins, agents must verify the live checkout instead of assuming
chat context is current:

```powershell
Get-Location
git status --short --branch
git branch --show-current
git remote -v
git fetch origin
git rev-list --left-right --count HEAD...origin/main
git rev-parse --show-toplevel
```

Then confirm the intended stream/worktree from
[active-worktrees.md](C:/FloorConnector/active-worktrees.md) and
[.codex/active-stream-plan.md](C:/FloorConnector/.codex/active-stream-plan.md).
If the branch, stream, worktree, or repo root does not match the task, stop
before editing.

Use [docs/agent-startup-checklist.md](C:/FloorConnector/docs/agent-startup-checklist.md)
as the complete pre-change checklist.

## Worktree Safety

FloorConnector uses one stream, one branch, and one worktree.

Canonical locations:

- main checkout: `C:\FloorConnector`
- stream worktrees: `C:\FC-worktrees\<stream>`
- collaboration branch: `main`
- stream branches: `stream/<name>`

Agents must not perform development work from Desktop, Downloads, temp folders,
shadow repositories, copied repos, or duplicate project folders. Dirty files in
any checkout are user-owned unless the current task explicitly scopes them in.

New streams require ownership review, dependency review, architecture approval,
active-stream conflict checks, and recorded human approval before worktree
creation or activation.

## Autonomous Run Requirements

Autonomous or multi-agent runs must stay within the approved stream and human
review gate:

- no auto-merge
- no auto-continue to the next wave
- no schema, migration, provider, customer-facing, signature, scheduling,
  payment, or financial-state work unless explicitly scoped
- no work in dirty or out-of-scope worktrees
- no provider/customer-facing sends or autonomous AI actions without a later
  approved implementation slice and human review

Agents may plan, implement scoped approved slices, validate, prepare review
packets, and recommend next steps. They may not bypass Jeff approval or the
Architecture Coordination gate.

Use [docs/autonomous-run-governance.md](C:/FloorConnector/docs/autonomous-run-governance.md)
for safe autonomous work, human-approval boundaries, prohibited actions, merge
requirements, validation, reporting, and rollback expectations.

## Mobile Usage Expectations

Phone and desktop sessions may not have identical access to local files,
approval prompts, terminals, worktrees, or long-running processes. Mobile-driven
work should still require the same startup verification and should report when a
runtime cannot inspect or mutate the expected checkout.

If a phone session cannot verify the repo root, branch, status, and active
stream, it should avoid implementation and instead prepare a bounded prompt or
handoff for a verified local run.

Approval prompts are expected on phone and cloud sessions. Filesystem visibility
and sandbox behavior may differ from desktop. The agent must still verify the
repo root, branch, upstream state, and intended stream before changing files.
If verification cannot be completed, the phone session should stay in planning
or handoff mode.

`AGENTS.md` remains the source of truth for FloorConnector even when the runtime
started from outside the repository.

## Approval Expectations

Approval prompts and sandbox behavior are runtime controls, not product
approval. Passing a runtime approval prompt does not authorize a new stream,
schema change, provider call, customer-facing send, merge, destructive cleanup,
or next wave.

Product approval must be recorded in the active governance docs when it changes:

- [active-waves.md](C:/FloorConnector/active-waves.md)
- [active-worktrees.md](C:/FloorConnector/active-worktrees.md)
- [.codex/active-stream-plan.md](C:/FloorConnector/.codex/active-stream-plan.md)

## Repository Boundaries

All FloorConnector work must preserve:

- the canonical lifecycle:
  `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`
- one shared canonical data model
- tenant isolation in every layer
- real Supabase-backed persistence for canonical workflows
- production-first auth and role-aware authorization
- contractor app, portal, marketing site, and super-admin as surfaces over a
  shared foundation

Do not create duplicate customer, project, estimate, contract, job, invoice,
payment, communication, scheduling, field, portal, or AI business records.

## Completion Reporting

Before completion, agents should report:

- branch
- worktree
- commit hash, when committed
- final git status
- ahead/behind count relative to `origin/main`
- files changed
- validation commands and results
- environment variable changes, if any
- follow-up dependencies or blockers

For docs-only governance work, validation should at minimum confirm that the
intended docs exist, links/references resolve, no application code changed, no
schema/migration files changed, Prettier ran on changed supported files, and
`git diff --check` passes.

For common startup, worktree, branch, origin, validation, and merge-conflict
failures, use [docs/ai-diagnostics.md](C:/FloorConnector/docs/ai-diagnostics.md).
