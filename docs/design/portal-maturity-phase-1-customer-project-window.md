# Portal Maturity Phase 1 - Customer Project Window

Status: Active
Doc Type: Audit / Implementation Note

## Purpose

This pass audits the customer portal as a live project window over existing
FloorConnector records and implements one safe read-only improvement: a shared
portal Customer Next Step helper on the portal Project Workspace.

The portal remains a customer-safe view and action layer over canonical project,
estimate, contract, change-order, invoice, warranty, appointment, and payment
records. It does not create portal-only copies.

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
- `docs/design/warranty-service-phase-1-workspace-depth.md`
- `docs/design/closeouttrail-phase-1-project-closeout-workspace.md`
- `docs/design/proof-center-phase-1-project-document-evidence-index.md`
- `docs/design/document-engine-phase-2a-closeout-package-print-route.md`
- `docs/design/fieldtrail-phase-1-project-execution-timeline.md`
- `docs/design/messagecenter-phase-1-project-communication-timeline.md`
- `docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md`
- `docs/local-auth-qa-recovery.md`
- `docs/operating-core-validation-checklist.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`
- `docs/service-warranty-plan.md`
- `docs/warranty-document-system-plan.md`
- `docs/portal-warranty-review-sign-plan.md`
- `docs/portal-architecture.md`
- `docs/customer-contacts-portal-permissions-plan.md`
- `docs/customer-contact-portal-access-implementation-plan.md`
- `docs/adr/0003-shared-portal-records.md`

## Files Inspected

- `apps/web/app/(portal)/portal/layout.tsx`
- `apps/web/app/(portal)/portal/page.tsx`
- `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
- `apps/web/app/(portal)/portal/estimates/[estimateId]/page.tsx`
- `apps/web/app/(portal)/portal/contracts/[contractId]/page.tsx`
- `apps/web/app/(portal)/portal/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(portal)/portal/change-orders/[changeOrderId]/page.tsx`
- `apps/web/app/(portal)/portal/invite/page.tsx`
- `apps/web/app/(portal)/portal/warranty-documents/[warrantyDocumentId]/page.tsx`
- `apps/web/app/(portal)/portal/estimates/[estimateId]/pdf/page.tsx`
- `apps/web/app/(portal)/portal/contracts/[contractId]/pdf/page.tsx`
- `apps/web/app/(portal)/portal/invoices/[invoiceId]/pdf/page.tsx`
- `apps/web/app/(portal)/portal/warranty-documents/[warrantyDocumentId]/print/page.tsx`
- `apps/web/lib/portal/data.ts`
- `apps/web/lib/portal/warranty-documents.ts`
- `apps/web/components/portal-review-ui.tsx`

## Implemented Now

Portal home:

- lists projects available through current portal access and explicit project
  access
- shows customer-visible appointments
- summarizes latest estimate, contract, invoice, and payment state by project
- routes customers into the shared Project Workspace instead of separate
  portal-only records

Portal Project Workspace:

- shows project identity, status, location/customer context, shared commercial
  records, customer-visible appointments, and shared warranty documents
- links to shared estimate, contract, invoice, change-order, and warranty
  review routes
- uses existing portal loaders and project-scoped access checks

Estimate review:

- shows estimate content, line items, attachments, status, customer viewed
  state, and approve/reject actions when status supports customer decision

Contract review/sign/decline:

- shows contract content and signer state
- allows portal signing/decline only for assigned customer signers under the
  existing contract signer and portal access model

Invoice review/payment handoff:

- shows invoice totals, balance, line items, payment events, and payment action
  readiness using the existing invoice payment workflow

Change order review:

- shows shared scope/pricing changes and approve/reject actions for sent change
  orders

Warranty document review:

- shows project-scoped warranty documents already exposed by portal loaders and
  signer assignment
- supports portal warranty signing/decline where current access and signer rules
  allow it

Print/save routes:

- portal estimate, contract, invoice, and warranty print/save routes exist
- print/save remains a browser export and does not send, sign, pay, create
  delivery proof, or store generated artifacts

## Safe Phase 1 Improvements Made

Implemented:

- Added `apps/web/lib/portal/next-step.ts`, a pure customer-safe helper that
  derives one portal Customer Next Step from already-loaded project detail
  records.
- Added focused tests in `apps/web/lib/portal/next-step.test.ts`.
- Updated `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx` to use
  the helper for the Project Workspace guidance panel.
- Tightened the Project Workspace trust copy so customers see that shared
  records update the contractor's project record.

The helper returns:

- `label`
- `description`
- `href`
- `tone`
- `reason`
- `source`

Priority is deterministic and customer-safe:

1. sent estimate -> Review estimate
2. signable or in-motion contract -> Sign contract or Review contract
3. sent change order -> Review change order
4. open invoice or active payment request -> Review/pay invoice
5. no open action -> No action needed

## Future Work Not Implemented

Service/warranty:

- Customer-facing service request submission was not added.
- Portal service-ticket status was not added.
- Service tickets remain contractor-only unless a future visibility and
  redaction plan explicitly exposes customer-safe service status.

Closeout package:

- Portal closeout package download/viewing was not added.
- The implemented closeout package remains contractor-side only.
- Portal closeout package work should wait for explicit customer visibility,
  versioning, export, and delivery-proof policy.

Proof Center:

- Internal Proof Center and FieldTrail details were not exposed to customers.
- Customer-safe proof summaries need a separate redaction and visibility design.

MessageCenter:

- Customer chat or customer-facing communication history was not added.
- Provider sending, notifications, reminders, and read receipts were not added.

FieldTrail:

- Internal Daily Job Logs, Job Notes, blockers, and field execution details were
  not exposed to portal customers.
- Any future customer-safe field visibility must define redaction rules first.

Permissions:

- Portal access grants, project-scope enforcement, contact permissions, auth,
  RLS, and tenant logic were not changed.

Payments/signatures:

- Payment, checkout, invoice math, estimate math, contract signing, warranty
  signing, and change-order decision behavior were not changed.

## Validation

Run for this pass:

```powershell
node_modules\.bin\tsx.CMD --test apps/web/lib/portal/next-step.test.ts
node_modules\.bin\tsx.CMD --test apps/web/lib/servicecenter/summary.test.ts
node_modules\.bin\tsx.CMD --test apps/web/lib/closeouttrail/summary.test.ts
node_modules\.bin\tsx.CMD --test apps/web/lib/proofcenter/summary.test.ts
node_modules\.bin\tsx.CMD --test apps/web/lib/fieldtrail/summary.test.ts
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
git diff --check
```

Results:

- Portal Customer Next Step: 6 passing tests
- Service Center summary: 4 passing tests
- CloseoutTrail summary: 6 passing tests
- Proof Center summary: 7 passing tests
- FieldTrail summary: 3 passing tests
- typecheck passed
- lint passed
- `git diff --check` passed

Browser QA remains conditional on valid local auth state. If Supabase Auth 429
or stale storage state blocks portal routes, use
`docs/local-auth-qa-recovery.md` and record the blockage honestly.

Browser QA result in this pass:

- `/portal`: blocked by saved portal storage state redirecting to login.
- `/portal/projects/db77b765-4d6e-47d4-8c38-e91c041868f1`: blocked by the same
  portal login redirect.
- linked portal contract, invoice, and change-order checks were skipped because
  the portal project route did not load under saved portal auth.
