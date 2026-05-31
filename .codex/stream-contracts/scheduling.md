# Scheduling Stream Contract

## Owns

- CrewBoard, `/schedule`, schedule read models, canonical job schedule
  visibility, job assignment visibility, dispatch review, and schedule E2E.

## May Touch With Caution

- `apps/web/app/(app)/schedule/**`, schedule helpers/tests, job assignment
  presentation, and scheduling docs.

## May Not Touch Without Control Approval

- Duplicate dispatch tables, autonomous rescheduling, readiness bypasses,
  portal-owned schedule state, mobile-only schedule truth, provider calendar
  sync, or schema/migrations.

## Validation Expectations

- Scheduling helper tests.
- Typecheck and lint for runtime changes.
- Focused Scheduling browser smoke when route behavior changes.
- `git diff --check`.

## Docs Expectations

- Keep Scheduling on canonical `jobs`, `job_assignments`, appointments, people,
  vendors, projects, and customers.

## Example Safe Slice

Add an advisory resource-load summary derived from existing assignments.

## Example Unsafe Slice

Create a standalone dispatch record model to track board state.
