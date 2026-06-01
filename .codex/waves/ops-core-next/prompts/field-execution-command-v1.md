# Chat: Field Execution Command V1

Branch: `stream/field-execution-command-v1`
Worktree: `C:\FC-worktrees\field-execution-command`

## Goal

Make daily logs, open field notes, blockers, and today's job execution easier
to act on from existing project/job/daily-log context.

## Required Docs

Read these before implementation:

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `docs/system-overview.md`
- `.codex/worktree-rules.md`
- `.codex/active-stream-plan.md`

## Boundaries

- Do not change schema, migrations, Supabase policies, RLS, auth, env vars,
  payment math, route protection, provider behavior, or business logic outside
  this field-execution slice.
- Do not create a field-only task, issue, schedule, job, project, attachment,
  or customer model.
- Keep field evidence contractor-only unless existing portal evidence-grant
  logic explicitly allows customer-safe sharing.
- Keep Daily Logs, Job Notes, field notes, execution attachments, jobs,
  projects, people, vendors, and time records as the canonical sources.

## Implementation Requirements

- Start with `git status --short --branch`, current branch confirmation, and
  `git fetch origin`.
- Use existing field/daily-log/project/job read models and routes where
  possible.
- Add only read-model or UI continuity that helps the contractor decide what
  field work needs action today.
- Link back to canonical Daily Log, Job, Project, and Field surfaces instead of
  creating new workflow state.
- Update `docs/current-state.md` only if implemented behavior changes.

## Validation

Run:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
```

Run focused route smoke only if the changed surface needs browser proof and
saved auth is healthy. Report auth/rate-limit blockers exactly.

## Git Completion Requirements

- Stage only intended files.
- Commit the completed slice.
- Do not push unless asked.

## Final Response Requirements

Report branch, starting status, final status, commit hash/message, files
changed, validation results, skipped checks, assumptions, and follow-up
dependencies.
