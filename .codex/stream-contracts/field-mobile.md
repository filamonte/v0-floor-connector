# Field / Mobile Stream Contract

## Owns

- Field execution UX, mobile Daily Log and Job Note workflows, Work Item field
  views, execution attachment visibility, and field handoffs from jobs/schedule.

## May Touch With Caution

- `/field/**`, Daily Log field surfaces, Job Workspace field panels, Work Item
  field views, execution attachment helpers, and field/mobile docs.

## May Not Touch Without Control Approval

- Portal field exposure, customer-visible internal notes, hard-delete storage
  cleanup, duplicate field/task models, schema/migrations, schedule write paths,
  or provider notifications.

## Validation Expectations

- Focused field/work-item helper tests.
- Typecheck and lint for runtime changes.
- Mobile-width smoke when UI changes materially.
- `git diff --check`.

## Docs Expectations

- Keep field evidence and work items internal unless explicit portal-safe
  sharing is approved.

## Example Safe Slice

Improve assigned Work Item mobile readability over existing records.

## Example Unsafe Slice

Expose internal field blocker notes directly in the customer portal.
