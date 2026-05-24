# Supabase Staging Target Discovery

Status: Active
Doc Type: Read-Only Discovery

## 1. Purpose

This document records the May 24, 2026 read-only Supabase connector discovery
for FloorConnector staging target selection.

This pass did not apply migrations, execute SQL, create projects, create
branches, change auth settings, change RLS, create or modify data, fetch or
print secrets, call providers, or change app behavior.

## 2. Repo Status

Commands run before discovery:

```text
git status --short --branch
git log --oneline -10
```

Result:

- branch: `main`
- tracking: `origin/main`
- ahead/behind marker: none shown
- latest commit at start: `126fdd99 docs: finalize docs index and handoff cleanup`

No push was needed because the branch was not ahead of `origin/main`.

## 3. Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/chat-handoff.md`
- `docs/staging-owner-runbook.md`
- `docs/staging-deployment-readiness-audit.md`
- `docs/demo/staging-demo-data-plan.md`
- `docs/demo/staging-demo-seed-script-spec.md`
- `docs/demo/staging-demo-seed-write-mode-design.md`
- `docs/design/staging-demo-seed-phase-2a-validate-target-read-only.md`
- `docs/local-auth-qa-recovery.md`

## 4. Supabase Organizations Discovered

The Supabase connector returned one visible organization:

| Organization name | Organization id        | Slug                   | Plan   |
| ----------------- | ---------------------- | ---------------------- | ------ |
| `FloorConnectoor` | `cvkfudwshnfsftnnwrro` | `cvkfudwshnfsftnnwrro` | `free` |

The organization name is recorded exactly as returned by the connector.

## 5. Supabase Projects Discovered

The Supabase connector returned no visible projects:

```text
projects: []
```

Because no project was visible, this pass did not identify a staging project
ref, did not fetch project details, did not list migrations, and did not list
tables.

## 6. Candidate Staging Targets

No candidate staging target was identified from the connector account.

Current options:

| Option                                                 | Status                      | Owner decision needed                                                                          |
| ------------------------------------------------------ | --------------------------- | ---------------------------------------------------------------------------------------------- |
| Existing Supabase project under another account/team   | Possible                    | Confirm the owner account/team that can see the intended FloorConnector project.               |
| Existing project not visible to this connector session | Possible                    | Grant or switch connector access so the intended project appears in read-only project listing. |
| New staging project                                    | Not authorized by this pass | Decide only in a later explicit owner-approved setup task.                                     |

Do not guess a staging target from local environment variables, local project
history, or app config. The selected project must be visible through approved
owner access before Phase 2A target validation is run.

## 7. Project Details Checked

No project details were checked because there were no visible Supabase projects.

The only detail call was the read-only organization detail check for
`cvkfudwshnfsftnnwrro`, which confirmed the organization name, plan, and release
channels.

## 8. Owner Decision Needed

Before running:

```bash
pnpm demo:data:seed:validate-target -- --supabase-url <staging-supabase-url> --service-role-key-env SUPABASE_SERVICE_ROLE_KEY --organization-id <uuid> --owner-user-id <uuid> --owner-email <owner@example.test> --portal-customer-email <customer@example.test> --environment staging
```

the owner must identify the intended staging Supabase project and make it
available through approved credentials or connector access.

Required owner answer:

- Is `FloorConnectoor` the intended Supabase organization for FloorConnector
  staging?
- If yes, why are no projects visible to the connector?
- If no, which Supabase organization/account owns the intended staging project?
- What is the non-secret staging project name/ref or project URL to validate?

## 9. What Was Intentionally Not Changed

- no Supabase writes
- no migrations
- no SQL execution
- no project creation
- no branch creation
- no auth settings changes
- no RLS changes
- no data creation or modification
- no provider calls
- no secrets fetched or printed
- no app behavior changes
- no schema, script, route, server action, tenant, payment, signature, portal,
  settings, or platform-admin changes

## 10. Recommended Next Command Or Owner Action

Recommended owner action:

1. Confirm the correct Supabase account/team for FloorConnector staging.
2. Make the intended staging project visible to the approved connector session
   or provide the non-secret project URL/ref for the owner-run validation path.
3. Only after the target is confirmed, run Phase 2A read-only target validation
   with explicit staging identifiers.

Do not proceed to write-mode seed planning until read-only target validation is
clean and the owner explicitly approves a separate write-capable phase.
