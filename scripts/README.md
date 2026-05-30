# Scripts

Repository automation and maintenance scripts will live here.

## Worktree Developer Platform

- `link-worktree-dev-tools.ps1`: links shared local tool state from
  `C:\FloorConnector` into active worktrees under `C:\FC-worktrees`.
- `worktree-doctor.ps1`: verifies Node, pnpm, Corepack, shared tool links,
  developer tools, git branch state, and origin configuration.
- `worktree-status.ps1`: fetches origin and summarizes branch, ahead/behind,
  clean/dirty, and detached-head status across worktrees.
- `worktree-reconcile.ps1`: morning health check for upstream state, dirty
  worktrees, missing upstreams, behind-main drift, and recommended actions.
- `create-worktree.ps1`: creates `stream/<name>` in `C:\FC-worktrees\<name>`,
  links shared dev tools, and runs the doctor.
- `finish-worktree.ps1`: interactive retire flow for clean completed
  worktrees, with optional local branch deletion and registry update.
- `worktree-audit.ps1`: platform audit for registry accuracy, required files,
  upstreams, doctor checks, and shared build-output mistakes.
- `refresh-playwright-auth.ps1`: reruns shared Playwright auth setup from the
  canonical repo and relinks auth state into worktrees.
- `setup-github-cli.ps1`: detects GitHub CLI, prints version/auth status, and
  prints install/auth guidance. It does not install automatically unless run
  with the explicit `-InstallWithWinget` switch.
- `codex-streams.ps1`: prints the active six-stream operating model, paused or
  legacy streams, and the recommended next prompt order.
- `codex-next.ps1`: prints the recommended next implementation prompt order
  from `.codex/active-stream-plan.md`.
- `wave-review.ps1`: runs local worktree review checks, changed-file Prettier,
  and merge-readiness reminders without marking PRs ready, merging, or deleting
  branches/worktrees.
- `wave-pr.ps1`: opens a standard GitHub draft PR against `main` when `gh` is
  available and authenticated, or prints exact manual draft-PR steps when it is
  not. It never merges, enables auto-merge, marks a draft ready, or deletes
  branches/worktrees. If an open PR already exists for the branch and local
  commits are not included in the PR head, it refuses to push by default so the
  draft PR is not widened accidentally. Use
  `pnpm wave:pr -- -AllowUpdateExistingPr` only when intentionally updating that
  PR. Label application is best-effort; missing GitHub labels are warnings only
  and can be skipped with `pnpm wave:pr -- -SkipLabels`.
- `wave-status.ps1`: shows active wave files, stream branch status, unpushed
  commit status, PR draft/ready metadata when `gh` can read it, and PR drift
  warnings when local stream commits are not included in an open PR head.

Package scripts:

```powershell
pnpm devtools:link
pnpm devtools:link:fix
pnpm setup:gh
pnpm worktree:doctor
pnpm worktree:status
pnpm worktree:reconcile
pnpm worktree:audit
pnpm wave:review
pnpm wave:pr
pnpm wave:status
pnpm worktree:create <name>
pnpm worktree:finish <name>
pnpm auth:refresh
pnpm codex:streams
pnpm codex:next
```

## Wave And Draft PR Conveyor Belt

GitHub CLI is optional but recommended. The conveyor-belt scripts use it for
live PR metadata, PR drift checks, draft PR creation, and draft/ready status.
When GitHub CLI is unavailable or unauthenticated, scripts fall back to local
git refs where possible and print manual PR guidance.

Use:

```powershell
pnpm setup:gh
```

Manual install/auth commands:

```powershell
winget install --id GitHub.cli
gh auth login
gh auth status
```

If GitHub CLI is installed outside PATH, set:

```powershell
$env:FLOORCONNECTOR_GH_PATH = "C:\Program Files\GitHub CLI\gh.exe"
```

The human-reviewed conveyor belt is:

1. ChatGPT writes or updates `.codex/waves/<wave>.md`.
2. Codex runs that wave in the correct stream worktree.
3. Codex commits the completed slice.
4. Run `pnpm wave:review`.
5. Run `pnpm wave:pr`.
6. The PR opens as draft by default.
7. Request `@codex` review using `.codex/pr-review-instructions.md`.
8. The verification stream performs merge-readiness review.
9. A human reviews.
10. A human marks the PR ready only after validation is complete.
11. A human merges.
12. Run `pnpm worktree:finish <name>` when the stream is complete.

This is human-approved automation, not autonomous merging. The wave scripts do
not automatically merge, mark ready for review, delete branches, delete
worktrees, enable auto-merge, or perform destructive cleanup.

### PR Drift Guard

`wave:status`, `wave:review`, and `wave:pr` include a PR drift guard. The guard
compares the local stream branch HEAD with the open PR head SHA. When local HEAD
contains commits that are not included in the open draft PR, the scripts warn:

```text
Local branch has commits not included in open PR #<number>. Pushing now may widen the PR.
```

The warning includes the PR number, PR URL, local HEAD SHA, PR head SHA, and the
local-only commit count when Git can compute it. This exists to prevent a common
stream workflow mistake: a draft PR is opened for one wave, then the same local
stream branch continues accumulating later commits before the PR is merged.
Pushing that branch would silently expand the already-open PR.

Interpret the statuses this way:

- `OK`: local HEAD matches the open PR head.
- `local-ahead-of-pr`: local commits are not in the PR head; pushing would
  update and widen the PR.
- `no-open-pr`: no open PR was found for the branch.
- `unknown-gh-unavailable`: GitHub CLI is unavailable or cannot confirm open PR
  state. The guard may still use local `origin/pr/*` refs when they exist, but
  that fallback cannot prove draft/ready state.

Safe options when drift is reported:

- Leave the draft PR untouched when the extra local commits are unrelated.
- Intentionally update the existing PR with
  `pnpm wave:pr -- -AllowUpdateExistingPr` only after confirming the extra
  commits belong in that PR.
- Split unrelated local commits into a new branch and PR.
- Reconcile or reset carefully only after the current PR is merged and the
  intended branch state is clear.

## Read-Only Reports

- `catalog-items-duplicate-normalized-name-report.sql`: reports duplicate `catalog_items.normalized_name` rows by organization. It is read-only and does not delete, archive, or merge records.

## Platform Admin Bootstrap

- `platform-admin.mjs`: explicitly grants, revokes, or reports platform-admin access for an existing canonical user by email.

Examples:

```bash
pnpm platform-admin grant platform@floorconnector.com
pnpm platform-admin revoke jfilamonte@gmail.com
pnpm platform-admin status jfilamonte@gmail.com
```

The script reads `C:\FloorConnector\.env.local`, requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, and uses only the separate `platform_user_roles` assignment layer. It does not create users, contractor organizations, or tenant memberships.

The target platform account must sign in once through the normal auth flow before `grant` can resolve it in `public.users`. For local super-admin regression QA, use `platform@floorconnector.com` as `FLOORCONNECTOR_PLATFORM_E2E_EMAIL` after granting it.
