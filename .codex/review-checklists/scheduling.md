# Scheduling Review Checklist

## Owned Files / Modules

- `/schedule`
- `apps/web/lib/schedule`
- Canonical `jobs` and `job_assignments` scheduling paths.

## Common Risks

- Bypassing project readiness.
- Creating a separate dispatch table or schedule source of truth.
- Mutating schedule state from drag/drop or preview actions without
  confirmation.
- Portal-owned schedule state.

## Required Validations

- Prettier on changed files.
- Targeted schedule helper/read-model tests.
- Validate schedule warnings if touched.
- Protected `/schedule` smoke or E2E when behavior changes.

## Out Of Scope

- New dispatch tables unless explicitly scoped.
- Autonomous rescheduling.
- External calendar/provider ownership of FloorConnector schedule truth.

## Merge Readiness Notes

- Keep scheduling on canonical `jobs` and `job_assignments`.
- Keep PR as draft until targeted schedule validation is reported.

## Human Review Expectations

- Confirm readiness gates are preserved.
- Confirm schedule changes remain confirmation-first where mutation is involved.
