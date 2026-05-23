# Portal Maturity Phase 2 - Project Status Window

Status: Implemented
Doc Type: Implementation Note

## Purpose

Portal Maturity Phase 2 adds a customer-safe Project Status Window to the
existing portal Project Workspace. The portal now shows the customer's next
step, high-level project status, shared estimate/contract/invoice/change-order
records, and whether anything needs review, signature, approval, or payment.

This is a read-only project-window improvement over existing portal loaders and
canonical records. It does not create portal-only copies.

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/target-ia.md`
- `docs/vision.md`
- `docs/Roadmap.md`
- `docs/chat-handoff.md`
- `docs/product-language.md`
- `docs/product-language-audit.md`
- `docs/design/portal-maturity-phase-1-customer-project-window.md`
- `docs/design/portal-customer-next-step-qa-checkpoint.md`
- `docs/design/warranty-service-phase-1-qa-checkpoint.md`
- `docs/design/proof-center-phase-1-project-document-evidence-index.md`
- `docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md`
- `docs/design/document-engine-phase-1-pdf-export-foundations.md`
- `docs/design/document-engine-phase-2a-closeout-package-print-route.md`
- `docs/local-auth-qa-recovery.md`
- `docs/operating-core-validation-checklist.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`

## Existing Data Used

The new helper derives from data already loaded by the portal project route:

- portal project summary
- shared estimates
- shared contracts
- shared invoices and latest payment-event summaries already exposed there
- shared change orders
- existing Customer Next Step helper output

No additional portal permissions, grants, project access behavior, auth logic,
RLS policy, tenant logic, server action, schema, migration, payment behavior,
signature behavior, estimate math, or invoice math changed.

## Portal Project UI Changes

The portal Project Workspace now includes:

- a top project status label such as `Needs your attention`, project status, or
  `Shared records are current`
- a customer next-step card using the existing Customer Next Step helper
- a compact shared-record count and attention/completed count
- a `Project Status` section listing shared estimates, contracts, change orders,
  and invoices with customer-safe helper copy and links to the existing portal
  review pages
- empty-state copy explaining when no estimate, contract, invoice, or change
  order has been shared yet

The portal home now shows a simple `What matters now` line per project from
existing home list fields only. It links customers into the project workspace
instead of linking to guessed record detail routes.

## Customer-Safe Visibility Rules

Allowed in this phase:

- project name, location, and status already exposed by the portal project
  loader
- shared estimate status and review links
- shared contract status and review/sign links
- shared invoice status, payment summary, and review/payment links
- shared change-order status and review links
- Customer Next Step
- no-action-needed and not-shared-yet states

Still intentionally not exposed:

- internal Job Notes
- FieldTrail details
- internal Proof Center evidence
- contractor-only blockers or ProjectPulse names
- readiness/GateKeeper internals
- internal Send Trail provider details
- service request submission
- portal closeout package download
- customer messaging/chat
- AI summaries, automation, or reminders

## Helper And Test Behavior

Added `apps/web/lib/portal/project-status-window.ts`.

The helper returns:

- `statusLabel`
- `statusTone`
- `primaryMessage`
- `customerNextStep`
- `sharedRecords`
- `attentionItems`
- `completedItems`
- `emptyStateMessage`

Shared record ordering is deterministic:

1. Estimate
2. Contract
3. Change order
4. Invoice

Attention states use customer-safe labels:

- `Review estimate`
- `Review contract`
- `Review change order`
- `Review or pay invoice`
- `No action needed right now`

Focused tests live in
`apps/web/lib/portal/project-status-window.test.ts` and cover empty state,
estimate, contract, invoice, change order, and mixed-record priority/order.

## What Is Intentionally Not Implemented Yet

- signer-specific contract action on the project route beyond the existing
  conservative Customer Next Step behavior
- new portal loader fields for latest estimate, contract, or change-order IDs
  on the portal home
- customer-facing FieldTrail
- internal proof evidence sharing
- portal closeout package download
- service/warranty customer request submission
- customer messaging/chat
- automated reminders
- AI summaries
- portal document package generation
- portal notification preferences

## Follow-Up Candidates

- Design a deliberate portal loader enhancement if signer-specific contract
  next steps should appear directly on the project workspace.
- Add a portal-safe closeout package plan only after customer visibility,
  versioning, and delivery-proof boundaries are explicit.
- Add screenshot regression coverage once portal auth state is stable enough for
  repeatable browser checks.

## Browser QA Limitations

Browser QA depends on saved local portal auth. If saved portal auth redirects to
login or Supabase Auth is rate limited, follow `docs/local-auth-qa-recovery.md`
and record the blockage honestly rather than claiming route verification.

Static validation and focused helper tests are sufficient to commit this
read-only, customer-safe visibility slice when browser auth is blocked.
