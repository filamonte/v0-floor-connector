# Communications Stream Contract

## Owns

- `/communications`, canonical communication threads/messages, record-linked
  message visibility, delivery proof visibility, and reply triage.

## May Touch With Caution

- Communication read models, communication UI, portal-safe reply surfaces,
  internal/customer-visible message tests, and communication docs.

## May Not Touch Without Control Approval

- Provider sends, autonomous customer replies, disconnected inboxes, AI-only
  memory, portal leakage, notification/event expansion, schema/migrations, or
  duplicate message stores.

## Validation Expectations

- Focused communication helper tests.
- Typecheck and lint for runtime changes.
- Portal/contractor smoke only when auth/env is ready.
- `git diff --check`.

## Docs Expectations

- Distinguish internal notes, customer-visible portal history, and provider send
  behavior honestly.

## Example Safe Slice

Improve a read-only conversation summary over existing threads and messages.

## Example Unsafe Slice

Send customer SMS automatically from a Copilot draft.
