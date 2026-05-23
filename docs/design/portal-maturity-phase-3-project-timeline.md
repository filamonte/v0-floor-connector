# Portal Maturity Phase 3 - Project Timeline

Status: Implemented
Doc Type: Implementation Note

## Purpose

Portal Maturity Phase 3 adds a customer-safe Project Timeline to the existing
portal Project Workspace. The timeline gives customers a plain-language view of
what has happened, what is waiting on them, and which shared record to open
next.

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
- `docs/design/portal-maturity-phase-2-project-status-window.md`
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
- shared invoices and latest payment-event summaries
- shared change orders
- customer-visible appointments
- portal-visible warranty documents

No additional portal permissions, grants, project access behavior, auth logic,
RLS policy, tenant logic, server action, schema, migration, payment behavior,
signature behavior, estimate math, or invoice math changed.

## Portal Project UI Changes

The portal Project Workspace now includes a `Project Timeline` section below
the Project Status Window and before the appointment/commercial-record detail
sections.

The section shows compact timeline rows for shared project moments such as:

- estimate ready for review, approved, rejected, or shared
- contract ready for review, signed, declined, or shared
- change order ready for review, approved, rejected, or shared
- invoice ready for payment, payment in progress, payment needs review, paid,
  or shared
- customer-visible appointment shared
- warranty document ready for review, signed, or shared
- project shared

Rows use existing portal review links where a source record route is already
safe. Items requiring customer attention are marked `Waiting on you`.

## Customer-Safe Visibility Rules

Allowed in this phase:

- shared estimate, contract, invoice, and change-order status already visible
  through portal project data
- latest customer-safe invoice payment event state already shown on portal
  invoice/project surfaces
- customer-visible appointment rows already filtered by the portal appointment
  loader
- portal-visible warranty document rows already filtered by the portal warranty
  loader
- project name/status and shared project availability

Still intentionally not exposed:

- internal Job Notes
- FieldTrail details
- internal Proof Center evidence
- contractor-only blockers, GateKeeper, Ready Check, or ProjectPulse details
- internal Send Trail provider failure details
- internal MessageCenter communication details
- service request submission
- portal closeout package download
- customer messaging/chat
- AI summaries, automation, reminders, or notification preferences
- provider delivery timeline details
- internal contractor audit timeline

## Helper And Test Behavior

Added `apps/web/lib/portal/project-timeline.ts`.

The helper returns:

- `timelineItems`
- `emptyStateMessage`

Each timeline item includes:

- stable `key`
- `label`
- `description`
- optional `occurredAt`
- `tone`
- optional `href`
- `source`
- optional `customerActionRequired`

Focused tests live in
`apps/web/lib/portal/project-timeline.test.ts` and cover contract, invoice,
change-order, estimate, mixed ordering, empty state, and protection against
unexpected internal-only fields.

## What Is Intentionally Not Implemented Yet

- portal home timeline cues beyond the existing Phase 2 `What matters now`
  summary
- signer-specific contract action on the project route
- customer-facing FieldTrail
- internal proof evidence sharing
- portal closeout package download
- service/warranty customer request submission
- customer messaging/chat
- automated reminders
- AI summaries
- portal document package generation
- notification preferences
- provider delivery timeline details
- internal contractor audit timeline

## Follow-Up Candidates

- Consider a tiny latest-timeline cue on portal home only if the home loader is
  deliberately expanded with customer-safe record identifiers and timestamps.
- Add screenshot regression coverage once portal auth state is stable enough for
  repeatable browser checks.
- Design signer-specific project-level contract actions only as a deliberate
  portal loader enhancement with access review.

## Browser QA Limitations

Browser QA depends on saved local portal auth. If saved portal auth redirects to
login or Supabase Auth is rate limited, follow `docs/local-auth-qa-recovery.md`
and record the blockage honestly rather than claiming route verification.

Static validation and focused helper tests are sufficient to commit this
read-only, customer-safe visibility slice when browser auth is blocked.
