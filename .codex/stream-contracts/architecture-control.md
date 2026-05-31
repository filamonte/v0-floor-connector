# Architecture Control Stream Contract

## Owns

- Stream governance, registry truth, merge order, prompt templates, control
  tower docs, worktree scripts, package scripts for developer automation, and
  GitHub process templates.

## May Touch With Caution

- `active-worktrees.md`, `active-waves.md`, `.codex/**`, `.agent/**`,
  `.github/**`, `scripts/**`, `package.json`, and developer-operation docs.

## May Not Touch Without Control Approval

- Product runtime behavior, schema, migrations, auth/RLS, payment/signature
  behavior, portal access, provider integrations, and feature pages.

## Validation Expectations

- `pnpm fc:status`
- `pnpm fc:preflight:fast`
- `git diff --check`
- Focused script smoke tests for new developer helpers.

## Docs Expectations

- Keep governance docs factual.
- Do not turn planning docs into implemented status.
- Update the stream board when operating state changes.

## Example Safe Slice

Add a read-only stream status script and document when to use it.

## Example Unsafe Slice

Modify `/schedule` behavior while updating stream governance.
