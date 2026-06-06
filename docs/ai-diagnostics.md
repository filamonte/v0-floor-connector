# AI Diagnostics

Status: Active
Doc Type: Developer Operations

Use this guide when an AI-assisted FloorConnector run appears to be in the
wrong repository, wrong branch, wrong worktree, stale state, or blocked
validation path. It complements [AGENTS.md](C:/FloorConnector/AGENTS.md) and
[docs/agent-startup-checklist.md](C:/FloorConnector/docs/agent-startup-checklist.md).

## Wrong Repository

Symptoms:

- `git rev-parse --show-toplevel` is not `C:/FloorConnector` or an approved
  `C:/FC-worktrees/<stream>` path
- files appear missing or duplicated
- commands run from Desktop, Downloads, temp, or another copied folder

Checks:

```powershell
Get-Location
git rev-parse --show-toplevel
git remote -v
```

Recovery:

- stop editing
- move to `C:\FloorConnector` or the approved stream worktree
- rerun the startup checklist

## Wrong Branch

Symptoms:

- `git branch --show-current` does not match the task
- active registry maps the stream to a different branch
- work appears on `main` when it belongs in `stream/<name>`, or the reverse

Checks:

```powershell
git status --short --branch
git branch --show-current
Select-String -LiteralPath active-worktrees.md -Pattern "<stream-name>"
```

Recovery:

- stop before editing further
- preserve any uncommitted changes
- classify whether the work belongs on the current branch
- ask for direction if moving work would require cherry-pick, stash, rebase, or
  branch cleanup

## Detached HEAD

Symptoms:

- `git branch --show-current` returns blank
- `git status --short --branch` reports detached state

Checks:

```powershell
git status --short --branch
git log --oneline -5
```

Recovery:

- stop implementation
- identify the intended branch from the task and registry
- do not commit until attached to the correct branch or explicitly instructed

## Wrong Worktree

Symptoms:

- branch matches a different stream
- path does not match `C:\FC-worktrees\<stream>`
- dirty files belong to a different stream's ownership area

Checks:

```powershell
git worktree list
pnpm.cmd worktree:doctor
```

Recovery:

- stop editing
- switch to the correct worktree
- leave unrelated dirty files untouched
- if valid work landed in the wrong worktree, classify and recover through a
  local backup branch or targeted cherry-pick only with explicit direction

## Missing Docs

Symptoms:

- required docs in `AGENTS.md` or the startup checklist cannot be found
- active registry references missing files

Checks:

```powershell
Test-Path -LiteralPath "AGENTS.md"
Test-Path -LiteralPath "docs\developer-source-of-truth.md"
Test-Path -LiteralPath "docs\current-state.md"
Test-Path -LiteralPath ".codex\active-stream-plan.md"
```

Recovery:

- report the missing path
- do not invent replacement rules from memory
- continue only if the missing doc is unrelated to the scoped task and the
  active docs provide enough current guidance

## Stale Origin

Symptoms:

- ahead/behind count is unknown
- recent branch state does not match remote expectations
- merge or push state looks surprising

Checks:

```powershell
git fetch origin
git rev-list --left-right --count HEAD...origin/main
git log --oneline --decorate -5
```

Recovery:

- report the current ahead/behind count
- do not rebase, reset, merge, or force-push unless explicitly requested
- for docs-only commits on `main`, being ahead of `origin/main` is expected
  until the user asks to push

## Validation Failures

Symptoms:

- Prettier, lint, typecheck, tests, worktree doctor, or diff checks fail
- command exits before meaningful output

Checks:

```powershell
git status --short --branch
git diff --check
pnpm.cmd worktree:doctor
```

Recovery:

- fix failures caused by the current task when they are in scope
- preserve unrelated failures and report them separately
- rerun the narrowest meaningful check after the fix
- if a Windows process-launch failure occurs, rerun the exact read-only command
  once before treating it as repo-state failure

## Merge Conflicts

Symptoms:

- Git reports unmerged paths
- conflict markers appear in files
- `git status` shows merge or rebase in progress

Checks:

```powershell
git status --short --branch
git diff --name-only --diff-filter=U
```

Recovery:

- stop broad edits
- identify whether the merge/rebase was explicitly requested
- resolve only files in scope and only when the requested operation is clear
- do not abort, reset, or continue a merge/rebase without clear user direction

## Conflicting Stream

Symptoms:

- two streams claim the same ownership area
- a feature stream edits active registry/tooling files incidentally
- active docs disagree about stream status

Checks:

```powershell
Select-String -LiteralPath active-worktrees.md -Pattern "<stream-or-area>"
Select-String -LiteralPath ".codex\active-stream-plan.md" -Pattern "<stream-or-area>"
Select-String -LiteralPath active-waves.md -Pattern "<stream-or-area>"
```

Recovery:

- prefer `active-worktrees.md` and `.codex/active-stream-plan.md` for active
  stream truth
- keep product implementation paused until ownership is clear
- record governance changes only when the task explicitly scopes registry/docs
  updates
