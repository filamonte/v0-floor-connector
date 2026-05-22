# Document Engine QA Checkpoint

Status: Active
Doc Type: QA

## Purpose

This checkpoint verifies the Document Engine print/export foundation after
Phase 1, Phase 2A, and the Project Workspace browser QA maintenance pass.

It is a QA/documentation checkpoint only. It does not add app behavior, schema,
storage, stored PDFs, generated artifact records, delivery events, provider
sends, portal downloads, or document-management features.

## Docs Read

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/design/document-engine-phase-1-pdf-export-foundations.md](C:/FloorConnector/docs/design/document-engine-phase-1-pdf-export-foundations.md)
- [docs/design/document-engine-phase-2-plan.md](C:/FloorConnector/docs/design/document-engine-phase-2-plan.md)
- [docs/design/document-engine-phase-2a-closeout-package-print-route.md](C:/FloorConnector/docs/design/document-engine-phase-2a-closeout-package-print-route.md)
- [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)
- [docs/operating-core-validation-checklist.md](C:/FloorConnector/docs/operating-core-validation-checklist.md)

## Files Inspected

- [apps/web/lib/document-engine/print.ts](C:/FloorConnector/apps/web/lib/document-engine/print.ts)
- [apps/web/components/customer-document-print-view.tsx](C:/FloorConnector/apps/web/components/customer-document-print-view.tsx)
- [apps/web/components/document-print-button.tsx](C:/FloorConnector/apps/web/components/document-print-button.tsx)
- [apps/web/app/(app)/estimates/[estimateId]/pdf/page.tsx](<C:/FloorConnector/apps/web/app/(app)/estimates/[estimateId]/pdf/page.tsx>)
- [apps/web/app/(app)/contracts/[contractId]/pdf/page.tsx](<C:/FloorConnector/apps/web/app/(app)/contracts/[contractId]/pdf/page.tsx>)
- [apps/web/app/(app)/invoices/[invoiceId]/pdf/page.tsx](<C:/FloorConnector/apps/web/app/(app)/invoices/[invoiceId]/pdf/page.tsx>)
- [apps/web/app/(portal)/portal/estimates/[estimateId]/pdf/page.tsx](<C:/FloorConnector/apps/web/app/(portal)/portal/estimates/[estimateId]/pdf/page.tsx>)
- [apps/web/app/(portal)/portal/contracts/[contractId]/pdf/page.tsx](<C:/FloorConnector/apps/web/app/(portal)/portal/contracts/[contractId]/pdf/page.tsx>)
- [apps/web/app/(portal)/portal/invoices/[invoiceId]/pdf/page.tsx](<C:/FloorConnector/apps/web/app/(portal)/portal/invoices/[invoiceId]/pdf/page.tsx>)
- [apps/web/app/(app)/projects/[projectId]/closeout-package/pdf/page.tsx](<C:/FloorConnector/apps/web/app/(app)/projects/[projectId]/closeout-package/pdf/page.tsx>)
- [e2e/project-detail-ui.spec.js](C:/FloorConnector/e2e/project-detail-ui.spec.js)
- [e2e/estimate-document-pdf-delivery.spec.js](C:/FloorConnector/e2e/estimate-document-pdf-delivery.spec.js)

## Routes Checked

Automated protected browser QA covered:

- `/estimates/:id/pdf`
- `/contracts/:id/pdf`
- `/invoices/:id/pdf`
- `/projects/:id/closeout-package/pdf`

The estimate/contract/invoice print route smoke used the existing protected
document fixture paths in
[e2e/estimate-document-pdf-delivery.spec.js](C:/FloorConnector/e2e/estimate-document-pdf-delivery.spec.js).
The project closeout package print route was reached from a valid project
detail link discovered from `/projects` in
[e2e/project-detail-ui.spec.js](C:/FloorConnector/e2e/project-detail-ui.spec.js).

Portal estimate/contract/invoice print routes were inspected in source. They
reuse portal loaders and Customer Access scoped data paths, but this checkpoint
did not run a portal Playwright lane.

## Behavior Boundaries Confirmed

- Print routes render from current source records.
- Contractor estimate/contract/invoice print routes require authenticated
  contractor access.
- Portal estimate/contract/invoice print routes use existing portal review
  loaders rather than broad public file URLs.
- The Project Closeout Package route is contractor-only under
  `/projects/:id/closeout-package/pdf`.
- Export notices make clear that browser print/save does not send a document,
  create delivery proof, or change approval, signature, payment, delivery,
  project, or closeout state.
- Shared print helpers build links, branding, export notices, and closeout
  package hrefs without creating a document-management subsystem.
- The shared print view provides the print/save button and hides print-only
  chrome through print classes.
- Project Workspace browser QA now asserts the current product-language
  landmarks: ProjectPulse, Next Move, Ready Check, FieldTrail, MessageCenter,
  CloseoutTrail, Proof Center, and Print Closeout Package.

## Tests Run

Passed:

- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/document-engine/print.test.ts`
- `node node_modules/@playwright/test/cli.js test e2e/project-detail-ui.spec.js --project=chromium-protected --no-deps`
- `node node_modules/@playwright/test/cli.js test e2e/estimate-document-pdf-delivery.spec.js --project=chromium-protected --no-deps`

Notes:

- The first attempted helper test command used the repo-root path through a
  filtered package command and failed with `Could not find
'apps/web/lib/document-engine/print.test.ts'`. The corrected package-relative
  command passed.
- The earlier QA maintenance commit was already aligned with `origin/main`;
  `git push origin main` returned `Everything up-to-date`.

## Skipped Or Limited Checks

- No portal Playwright route was run in this checkpoint. Portal print route
  access was source-inspected only.
- No browser print dialog automation was attempted. The checks verify printable
  route rendering, print button presence, and export-boundary copy.
- No PDF binary comparison, screenshot, or stored artifact test was added.

## Follow-Up Issues

- Add portal-safe closeout package planning before any customer-facing closeout
  package route.
- Keep persisted generated artifacts, private storage, signed URLs, server-side
  PDF generation, and version/supersession policy deferred until the Document
  Engine Phase 2C boundary is explicitly approved.
- If portal Document Engine QA becomes a release gate, add fixture-safe portal
  print route checks that avoid stale fixed IDs and respect Customer Access.

## Guardrails Preserved

This checkpoint did not change:

- app behavior
- schema or migrations
- routes
- server actions
- auth, RLS, tenant logic, or portal grants
- payments, signatures, estimate math, or invoice math
- settings or platform-admin behavior
- provider sending, Send Trail event creation, or delivery proof semantics
