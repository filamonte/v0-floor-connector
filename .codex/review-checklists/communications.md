# Communications Review Checklist

## Owned Files / Modules

- `/communications`
- `apps/web/lib/communications`
- Canonical communication threads, messages, notifications, and delivery
  evidence.

## Common Risks

- Disconnected inbox or provider-owned message truth.
- Customer email/SMS sends without explicit human confirmation.
- AI-only communication memory.
- Portal leakage of contractor-only notes, blockers, provider diagnostics, or
  internal field context.

## Required Validations

- Prettier on changed files.
- Targeted communication helper/action tests.
- Protected contractor and portal route smoke when visibility changes.

## Out Of Scope

- Autonomous sends.
- Provider callbacks or delivery mutation unless explicitly scoped.
- Portal-only message records.

## Merge Readiness Notes

- Communication history must attach to canonical records.
- Keep PR as draft until communication visibility and send boundaries are
  reviewed.

## Human Review Expectations

- Confirm customer-visible boundaries.
- Confirm no provider action is hidden behind review copy.
