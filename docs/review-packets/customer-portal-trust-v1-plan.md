# Customer Portal Trust V1 Plan

Status: Jeff approved; stream/worktree creation only.

Date: 2026-06-07
Base branch reviewed: `main`
Reviewed against: `origin/main`

## Rationale

`customer-portal-trust-v1` is approved because the contractor-facing chain from
Sales through Production, Field Execution, and Closeout is stronger than the
customer-facing understanding layer. The portal should reduce calls, emails,
confusion, delayed approvals, delayed payments, and trust gaps by helping
customers understand where their project stands, what is next, what is waiting,
what is complete, what needs customer action, and what payments are
outstanding.

This is not approval to build a customer dashboard. The portal remains a
customer-safe visibility and action surface over shared canonical records.

## Stream Descriptions

### `portal-project-clarity-v1`

- Ownership: customer project understanding.
- Mission: make project status easier for customers to understand.
- Potential future implementation: customer-safe project progress,
  customer-safe next-step visibility, waiting/completed state, readiness
  explanations, project timeline clarity, and project stage understanding.
- Non-goals: no duplicate project model, contractor-only operational state,
  portal workflow engine, schema changes, or migrations.

### `portal-financial-visibility-v1`

- Ownership: customer financial understanding.
- Mission: make invoices, payments, balances, and billing status easier for
  customers to understand.
- Potential future implementation: invoice clarity, payment clarity,
  outstanding balance visibility, payment history visibility, and billing
  readiness explanations.
- Non-goals: no accounting replacement, duplicate invoice model, duplicate
  payment model, financial math changes, payment mutation, schema changes, or
  migrations.

### `portal-communication-trust-v1`

- Ownership: customer communication confidence.
- Mission: help customers understand communication history and action
  requirements.
- Potential future implementation: communication continuity visibility,
  customer action awareness, portal-safe conversation context, and
  communication trust indicators.
- Non-goals: no duplicate communication model, autonomous messaging, AI
  customer communications, provider/customer-facing sends, schema changes, or
  migrations.

### `verification-customer-portal-v1`

- Ownership: verification.
- Mission: protect customer-safe boundaries, canonical records, project
  ownership, financial ownership, communications ownership, portal visibility
  rules, no duplicate models, and no schema/migration drift.
- Non-goals: no feature work, UI redesign, schema changes, or migrations.

## Ownership Map

| Surface        | Owner role in this wave                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard      | Prioritizes contractor work; this wave does not move customer trust ownership into Dashboard.                                         |
| Project        | Diagnoses operational state; portal may present customer-safe project understanding only.                                             |
| Field          | Executes field work; internal field proof, blockers, and job notes stay contractor-owned unless separately approved for safe sharing. |
| Financials     | Owns billing and collections action over canonical invoices/payments; portal may present customer-safe billing understanding only.    |
| Communications | Owns communication action and canonical communication records; portal may present customer-safe communication context only.           |
| Settings       | Owns tenant configuration; portal streams must not create operational configuration shortcuts.                                        |
| Portal         | Presents customer-safe visibility and explicit customer actions over shared canonical records.                                        |
| Verification   | Protects source-record continuity, portal access boundaries, and duplicate-model prevention.                                          |

## Dependency Map

```text
portal-project-clarity-v1
  -> portal-financial-visibility-v1
  -> portal-communication-trust-v1
  -> verification-customer-portal-v1
```

Project clarity should land first because it establishes the customer-safe
status language and project visibility boundary. Financial visibility should
build on the same project/customer access context. Communication trust should
consume the clarified project/financial customer context without owning those
records. Verification lands last after implementation evidence exists.

## Non-Goals

- no feature implementation from this approval task
- no schema or migration work
- no duplicate project, customer, invoice, payment, communication, portal, or
  workflow models
- no portal-owned business truth
- no contractor-only readiness, field, provider, or internal blocker leakage
- no autonomous messaging, AI customer communication, provider send, payment
  mutation, financial mutation, signature mutation, scheduling mutation, PR,
  merge, next wave, or destructive cleanup
- no work in `C:\FC-worktrees\project-next-actions`

## Validation Plan

This approval task uses docs/governance validation only:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd tooling:baseline -CommandsOnly
pnpm.cmd exec prettier --check active-waves.md active-worktrees.md .codex/active-stream-plan.md docs/chat-handoff.md docs/review-packets/customer-portal-trust-v1-plan.md
git diff --check
git diff --cached --check
```

Future implementation streams should run focused helper/read-model/action tests
for changed surfaces, then:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
git diff --cached --check
```

Portal route smoke or E2E checks should run when implementation touches
customer-visible routes, access behavior, or review/action flows.

## Verification Plan

`verification-customer-portal-v1` must verify:

- portal views use existing portal grants and project access boundaries
- customer-safe project visibility does not expose contractor-only operational
  state
- financial visibility uses canonical invoices, payments, and payment events
  without changing math or state
- communication trust uses canonical communication records without creating
  portal-only message truth
- no duplicate models or schema/migration drift
- implemented docs claims match current branch reality

## Tooling Requirements

Startup and readiness checks:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd tooling:baseline
pnpm.cmd tooling:baseline -CommandsOnly
```

Worktree shared tooling should be repaired with `pnpm.cmd devtools:link` if a
future stream worktree reports missing local links.

## Merge Order

1. `portal-project-clarity-v1`
2. `portal-financial-visibility-v1`
3. `portal-communication-trust-v1`
4. `verification-customer-portal-v1`

Verification must land last after the implementation streams are complete and
validated.

## Jeff Approval Gate

Jeff explicitly approves `customer-portal-trust-v1` for stream and worktree
creation.

Approved branches:

- `stream/portal-project-clarity-v1`
- `stream/portal-financial-visibility-v1`
- `stream/portal-communication-trust-v1`
- `stream/verification-customer-portal-v1`

Approved worktrees:

- `C:\FC-worktrees\portal-project-clarity-v1`
- `C:\FC-worktrees\portal-financial-visibility-v1`
- `C:\FC-worktrees\portal-communication-trust-v1`
- `C:\FC-worktrees\verification-customer-portal-v1`

This gate does not approve implementation start, PR creation, merge,
schema/migration work, provider/customer-facing actions, financial mutation,
autonomous messaging, next-wave continuation, or destructive cleanup.
