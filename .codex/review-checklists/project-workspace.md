# Project Workspace Review Checklist

## Owned Files / Modules

- `apps/web/app/(app)/projects/[projectId]`
- `apps/web/lib/projects`
- Project Workspace planning docs under `docs/design`

## Common Risks

- Duplicate project, activity, task, financial, field, or portal models.
- Project Workspace becoming a second owner of schedule, invoice, payment, or
  portal truth.
- Autonomous AI actions or provider sends.

## Required Validations

- Prettier on changed files.
- Targeted tests for changed project helpers or read models.
- Protected Project Workspace route smoke when UI behavior changes.

## Out Of Scope

- Schema changes unless explicitly scoped.
- Payment, signature, scheduling, or readiness mutation outside existing
  server-owned workflows.

## Merge Readiness Notes

- Links must route back to canonical source records.
- Summary/read-model changes must not mutate business state.
- Keep PR as draft until validation and human review are complete.

## Human Review Expectations

- Confirm no duplicate models.
- Confirm docs changed only when implemented behavior changed.
- Confirm validation evidence is specific to the changed surface.
