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
- `codex-streams.ps1`: prints the active six-stream operating model, paused or
  legacy streams, and the recommended next prompt order.
- `codex-next.ps1`: prints the recommended next implementation prompt order
  from `.codex/active-stream-plan.md`.

Package scripts:

```powershell
pnpm devtools:link
pnpm devtools:link:fix
pnpm worktree:doctor
pnpm worktree:status
pnpm worktree:reconcile
pnpm worktree:audit
pnpm worktree:create <name>
pnpm worktree:finish <name>
pnpm auth:refresh
pnpm codex:streams
pnpm codex:next
```

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
