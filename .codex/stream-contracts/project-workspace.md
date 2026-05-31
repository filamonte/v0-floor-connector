# Project Workspace Stream Contract

## Owns

- Project Workspace continuity, readiness visibility, source-record handoffs,
  project-level read models, and project-centered operational summaries.

## May Touch With Caution

- Project detail presentation, project read models, project tests, ProjectPulse,
  FieldTrail, MessageCenter, CloseoutTrail, Proof Center, and related docs.

## May Not Touch Without Control Approval

- Duplicate project/activity/task models, scheduling write paths, portal-owned
  state, invoice/payment math, signature state, schema/migrations, or
  autonomous AI actions.

## Validation Expectations

- Targeted project helper tests.
- Web typecheck and lint for runtime changes.
- Focused browser smoke when protected UI changes materially.
- `git diff --check`.

## Docs Expectations

- Update current-state only when implemented behavior changes.
- Keep Project Workspace described as a continuity hub over canonical records.

## Example Safe Slice

Extract a Project Workspace presentational section without changing data writes.

## Example Unsafe Slice

Add a project-local activity table that competes with source records.
