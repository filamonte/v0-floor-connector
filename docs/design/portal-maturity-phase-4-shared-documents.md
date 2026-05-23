# Portal Maturity Phase 4 - Shared Documents

Status: Implemented
Doc Type: Implementation Note

## Purpose

Portal Maturity Phase 4 adds a customer-safe Shared Documents section to the
existing portal Project Workspace. It gives customers one compact place to open
the estimate, contract, invoice, and change-order records already shared with
them, plus Print / Save PDF links for the portal print routes that already
exist.

This is a read-only project-window improvement over existing portal loaders and
canonical records. It does not create portal-only copies, stored PDFs, storage,
delivery events, or a new document-management system.

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
- `docs/design/portal-maturity-phase-2-project-status-window.md`
- `docs/design/portal-maturity-phase-3-project-timeline.md`
- `docs/design/document-engine-phase-1-pdf-export-foundations.md`
- `docs/design/document-engine-phase-2a-closeout-package-print-route.md`
- `docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md`
- `docs/design/proof-center-phase-1-project-document-evidence-index.md`
- `docs/local-auth-qa-recovery.md`
- `docs/operating-core-validation-checklist.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`

## Existing Data Used

The new helper derives from data already loaded by the portal project route:

- shared estimates
- shared contracts
- shared invoices and latest customer-safe payment-event summaries
- shared change orders

No additional portal permissions, grants, project access behavior, auth logic,
RLS policy, tenant logic, server action, schema, migration, payment behavior,
signature behavior, estimate math, invoice math, storage, or sending behavior
changed.

## Portal Project UI Changes

The portal Project Workspace now includes a `Shared documents` section below
the Project Timeline and before the appointment/commercial-record detail
sections.

The section shows compact document rows with:

- document type
- customer-facing reference or title
- status label
- helper text
- attention/completed/shared state
- an `Open`, `Review estimate`, `Review contract`, `Review change order`, or
  `Review or pay invoice` link
- a `Print / Save PDF` link only when an existing portal print route exists

The section supports the existing Customer Next Step, Project Status Window, and
Project Timeline. It does not replace those surfaces and does not add a second
page header.

## Customer-Safe Visibility Rules

Allowed in this phase:

- estimates already exposed by the portal project loader
- contracts already exposed by the portal project loader
- invoices already exposed by the portal project loader
- change orders already exposed by the portal project loader
- portal-safe print/save PDF links already available for estimates, contracts,
  and invoices
- status and customer-action labels derived from existing portal-safe data

Still intentionally not exposed:

- internal Send Trail provider or delivery details
- internal Proof Center evidence
- FieldTrail evidence or Job Notes
- contractor-only document history
- closeout package downloads
- service/warranty request submission
- records not already shared through existing portal project access logic
- AI summaries, automation, reminders, or notification preferences
- stored document libraries or external storage changes

## Helper And Test Behavior

Added `apps/web/lib/portal/shared-documents.ts`.

The helper returns:

- `documents`
- `emptyStateMessage`

Each document includes:

- stable `key`
- `id`
- `type`
- `label`
- `reference`
- `statusLabel`
- `tone`
- `primaryHref`
- optional `printHref`
- `actionLabel`
- `helperText`
- optional `customerActionRequired`
- optional `completed`

Focused tests live in `apps/web/lib/portal/shared-documents.test.ts` and cover
pending estimate review, active contract review, unpaid invoice review/payment,
paid invoice completion, pending change-order review, empty state, and print
link availability only for existing portal print routes.

## Print / Save PDF Boundaries

The helper uses existing Document Engine print hrefs for:

- `/portal/estimates/:id/pdf`
- `/portal/contracts/:id/pdf`
- `/portal/invoices/:id/pdf`

It does not create a print route for change orders. It does not generate or
store PDFs, create document records, create Send Trail events, send provider
messages, change delivery proof, or mutate signature/payment/approval status.

## What Is Intentionally Not Implemented Yet

- portal home document counts
- portal closeout package download
- customer-facing Proof Center
- customer-facing FieldTrail
- customer-facing service request submission
- customer messaging/chat
- automated reminders
- AI summaries
- portal document package generation
- notification preferences
- provider delivery timeline details
- stored document library
- external file storage changes

## Follow-Up Candidates

- Add a small document count on portal home only if the home loader is
  deliberately expanded with safe per-record counts.
- Consider a future portal document package only after versioning, visibility,
  storage, and delivery-proof policy are documented.
- Add screenshot regression coverage once saved portal auth is stable enough for
  repeatable browser checks.

## Browser QA Limitations

Browser QA depends on saved local portal auth. If saved portal auth redirects to
login or Supabase Auth is rate limited, follow `docs/local-auth-qa-recovery.md`
and record the blockage honestly rather than claiming route verification.

Static validation and focused helper tests are sufficient to commit this
read-only, customer-safe visibility slice when browser auth is blocked.
