# Next Wave Recommendation

Status: Proposed / Jeff Review Required
Doc Type: Review Packet
Review date: 2026-06-05

This packet recommends the next highest-leverage operational wave after
`operational-command-center-v1` and the automation tooling baseline. It does
not approve implementation, create worktrees, authorize schema changes, or
start a wave.

## Recommended Wave

Wave name: `sales-to-production-readiness-v1`.

Wave goal: make the handoff from opportunity through estimate, contract,
deposit/readiness, and job scheduling feel like one operational command center
workflow instead of separate sales, contract, finance, and schedule surfaces.

This wave should preserve the canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

The wave should not add duplicate opportunity, customer, project, estimate,
contract, job, invoice, payment, message, schedule, or portal models. It should
derive readiness and handoff state from existing canonical records and shared
read models.

## Why This Is Highest Leverage

`operational-command-center-v1` clarified ownership after work is already in
motion: Project Workspace diagnoses, Field acts on execution, Communications
acts on record-linked conversations, Financials acts on AR/payment pressure,
and Verification protects those ownership rules.

The next operational gap is earlier in the lifecycle. If the sales-to-production
handoff is vague, later command-center surfaces inherit confusion: schedule
readiness is unclear, contract/deposit gates are hard to trust, project next
actions become noisy, and field/portal/reporting work can only polish symptoms.

This wave is higher leverage than deeper Field/Mobile, Portal, Reporting, or AI
automation right now because it strengthens the source-record gates that all of
those later surfaces depend on.

## Candidate Waves Considered

| Candidate wave                         | Decision              | Reason                                                                                                                           |
| -------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `sales-to-production-readiness-v1`     | Recommended           | Tightens the highest-friction cross-surface handoff and reinforces the canonical lifecycle before downstream expansion.          |
| `field-execution-depth-v1`             | Defer                 | Valuable, but richer field/mobile flows should consume clearer ready-to-schedule and job-readiness signals first.                |
| `customer-portal-trust-v1`             | Defer                 | Customer-safe portal clarity matters, but portal status should reflect trusted internal readiness before new portal depth.       |
| `reporting-and-intelligence-v1`        | Defer                 | Reporting should summarize better workflow truth after sales-to-production gates are tightened.                                  |
| `automation-assistant-action-layer-v1` | Planning only / defer | Automation should remain deterministic and human-reviewed until readiness, ownership, and approval gates are stronger.           |
| `integration-provider-readiness-v1`    | Defer                 | Provider work adds risk and should wait until internal handoff truth, callbacks, and approval boundaries are clearer in-product. |

## Proposed Stream Set

### sales-readiness-command-v1

- Proposed branch: `stream/sales-readiness-command-v1`
- Proposed worktree: `C:\FC-worktrees\sales-readiness-command-v1`
- Owns: opportunity, customer, project-intake, and estimate-prep readiness cues.
- Should produce: an operational view or read-model refinement that shows what
  is needed to move an opportunity/customer/project into a clean estimate path.
- Must avoid: duplicate CRM/customer/project truth, fake lead persistence,
  local-only queues, or autonomous customer outreach.
- Likely files: opportunity/customer/project read models, project next-action
  helpers, protected app surfaces that already show intake or project context.

### estimate-contract-readiness-v1

- Proposed branch: `stream/estimate-contract-readiness-v1`
- Proposed worktree: `C:\FC-worktrees\estimate-contract-readiness-v1`
- Owns: estimate approval, contract readiness, signature/deposit gate clarity,
  and handoff labels into Project Workspace and Financials.
- Should produce: clearer deterministic readiness states for estimate-approved,
  contract-needed, signature-needed, deposit-needed, and ready-for-job setup.
- Must avoid: detached contract/signature models, provider sends, payment-state
  mutation, financial math changes, or bypassing contract/deposit gates.
- Likely files: estimate/contract/project read models, Project Workspace
  readiness panels, invoice/financial handoff labels when they already exist.

### schedule-readiness-handoff-v1

- Proposed branch: `stream/schedule-readiness-handoff-v1`
- Proposed worktree: `C:\FC-worktrees\schedule-readiness-handoff-v1`
- Owns: signed/deposit-ready/project-ready handoff into jobs, schedule, and
  crew planning surfaces.
- Should produce: clearer ready-to-schedule and blocked-from-scheduling signals
  derived from canonical estimates, contracts, invoices, jobs, and assignments.
- Must avoid: duplicate dispatch tables, schedule mutation outside existing
  boundaries, mobile-only schedule state, or portal-owned operational state.
- Likely files: schedule dispatch read models, Project Workspace handoff
  summaries, route-level presentation over existing jobs and assignments.

### verification-sales-to-production-v1

- Proposed branch: `stream/verification-sales-to-production-v1`
- Proposed worktree: `C:\FC-worktrees\verification-sales-to-production-v1`
- Owns: review-packet evidence, focused tests, golden workflow matrix updates,
  and ownership-drift checks for the wave.
- Should produce: tests and documentation proving no duplicate models, no
  portal-owned state, no financial math drift, no readiness bypass, and no
  provider/customer-facing mutation.
- Must avoid: feature implementation, runtime behavior, schema, routes, or
  fixture shortcuts presented as production behavior.
- Likely files: verification helpers/tests and review-packet docs.

## Dependency And Merge Order

Recommended order:

1. `sales-readiness-command-v1`
2. `estimate-contract-readiness-v1`
3. `schedule-readiness-handoff-v1`
4. `verification-sales-to-production-v1`

Rationale:

- Intake and estimate-prep context should land before contract/deposit gate
  labels depend on it.
- Contract/deposit readiness should land before schedule handoff treats a
  project as ready.
- Schedule handoff should land before final verification locks the cross-surface
  ownership model.
- Verification should merge last so it can validate the final combined behavior
  and update golden workflow evidence against the reconciled state.

## Ownership Boundaries

- Dashboard prioritizes the work; it should not become the source of action
  truth.
- Project Workspace diagnoses readiness, blockers, and next owner.
- Opportunities, estimates, contracts, invoices, jobs, and payments remain the
  canonical source records for their own lifecycle gates.
- Schedule and Field act only after readiness is derived from canonical
  upstream records.
- Financials owns invoice/payment follow-through, not sales qualification.
- Communications may show record-linked follow-up context, but it must not own
  sales readiness or send provider-backed messages without explicit scope.
- Portal remains customer-safe review/action only and must not expose internal
  readiness or create portal-owned state.

## UX / IA Direction

The wave should make the product feel more like a single command center by
showing:

- what is blocking the next lifecycle step;
- which source record owns the block;
- which workspace should act next;
- which downstream surfaces are waiting on that action.

It should avoid a new disconnected Sales module unless the existing IA already
supports it cleanly. Prefer strengthening established project, estimate,
contract, invoice, and schedule surfaces with consistent readiness language and
source-record links.

## Canonical Model And Schema Review

Initial recommendation: no schema or migrations.

If a stream discovers that persistence is required, it must stop and return to
Architecture Coordination for a migration/RLS review before implementation.
Tenant-owned records must remain organization-scoped, RLS-protected, indexed on
common query paths, and represented in shared generated types where applicable.

## Verification Strategy

Minimum wave validation:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd devtools:link
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
```

Focused validation should be added per stream:

- read-model/helper tests for any readiness or next-action logic;
- route smoke for protected project, estimate, contract, schedule, invoice, and
  financial surfaces touched by implementation;
- review packet evidence proving no duplicate models, no portal-owned state, no
  financial math drift, no readiness bypass, and no provider/customer mutation.

Docs-only proposal updates can use the narrower validation path in
`docs/automation-tooling-baseline.md`.

## Tooling Readiness

Current tooling status is ready with human review gate:

- `pnpm.cmd worktree:doctor` passed on `main`.
- `pnpm.cmd tooling:baseline` passed required repo-local checks.
- `pnpm.cmd tooling:baseline -CommandsOnly` produced the standard validation
  command list.
- GitHub CLI and Supabase CLI are available locally.
- Vercel CLI is optional and missing on PATH; this does not block a local
  product wave unless Vercel deployment or diagnostics are explicitly scoped.

No tooling gap blocks this recommended wave. Optional improvement: add a wave
proposal template that prompts for sales-to-production gate ownership,
canonical-source evidence, route smoke targets, and provider/customer-action
exclusions.

## Dirty Or Out-Of-Scope Worktrees

Do not touch `C:\FC-worktrees\project-next-actions` as part of this
recommendation or future wave setup unless Jeff explicitly scopes that
worktree.

Current observed dirty files in that out-of-scope worktree:

- `apps/web/app/(app)/contracts/[contractId]/page.tsx`
- `apps/web/app/(app)/customers/[customerId]/page.tsx`
- `apps/web/app/(app)/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `apps/web/components/related-conversations-card.tsx`
- `apps/web/lib/communications/record-continuity.test.ts`
- `apps/web/lib/communications/record-continuity.ts`
- `docs/current-state.md`

## Required Jeff Decision

Jeff can approve the recommendation as the next wave to plan, but that approval
should still be recorded separately before stream creation or implementation.

Decision options:

- Approve `sales-to-production-readiness-v1` for Architecture Coordination to
  write detailed stream prompts.
- Request a different candidate wave.
- Ask for a narrower one-stream pilot before the full wave.
- Hold all new wave work and keep only governance/docs cleanup active.

Until Jeff approves, this packet is recommendation-only.
