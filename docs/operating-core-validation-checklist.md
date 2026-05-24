# Operating Core Validation Checklist

Status: Active
Doc Type: QA

## Purpose

This checklist inventories the focused validation surfaces for the recent
operating-core visibility layers. It is not a release gate by itself.

## Focused Tests

Run focused tests when touching the matching helper or route:

- Schedule warnings:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/schedule/warnings.test.ts`
- Schedule move helpers:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/schedule/move.test.ts`
- Daily Log links:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/daily-logs/links.test.ts`
- FieldTrail summary:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/fieldtrail/summary.test.ts`
- Job Note labels:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/field-notes/labels.test.ts`
- MessageCenter summary:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/messagecenter/summary.test.ts`
- ProjectPulse summary:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/projectpulse/summary.test.ts`
- CloseoutTrail summary:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/closeouttrail/summary.test.ts`
- Proof Center summary:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/proofcenter/summary.test.ts`
- Send Trail summary:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/sendtrail/summary.test.ts`
- Service Center summary:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/servicecenter/summary.test.ts`
- Portal Customer Next Step:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/portal/next-step.test.ts`
- Portal Project Status Window:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/portal/project-status-window.test.ts`
- Portal Project Timeline:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/portal/project-timeline.test.ts`
- Portal Shared Documents:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/portal/shared-documents.test.ts`
- Reports operations summary:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/reports/operations-summary.test.ts`
- Financial Control collections summary:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/financials/collections-summary.test.ts`
- Accounting Readiness:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/financials/accounting-readiness.test.ts`
- Accounting Export:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/financials/accounting-export.test.ts`
- Document Engine print helpers:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/document-engine/print.test.ts`
- Company Documents validation/types:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/company-documents/types.test.ts`
- Company Documents Starter Documents:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/company-documents/starter-documents.test.ts`
- Company Documents migration/RLS shape:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/company-documents/company-documents-migration.test.ts`
- Schedule read model:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/schedule/read-model.test.ts`
- Global Search helpers:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/global-search/search-helpers.test.ts`

## Manual Route Checks

When browser QA is available, manually check:

- `/projects/[projectId]` for ProjectPulse, FieldTrail, MessageCenter,
  CloseoutTrail, Proof Center, and source-record handoffs.
- `/schedule` for CrewBoard list, planner/date context, selected-job panel, and
  advisory schedule warnings.
- `/reports` for operations snapshot, attention lists, source-record links, and
  existing sales tax / pipeline / payment summaries.
- `/financials`, `/financials/accounts-receivable`, and
  `/financials/accounting-readiness` for Financial Control, collections
  attention, Accounting Readiness, and CSV export-prep copy/download affordances.
- `/service-tickets` for Service Center summary and warranty/service continuity.
- `/portal` and `/portal/projects/[projectId]` with portal auth for the
  Customer Window: next step, Project Status, Project Timeline, Shared
  Documents, and existing portal print/save links where visible.
- `/estimates/[estimateId]`, `/contracts/[contractId]`, and
  `/invoices/[invoiceId]` for Send Trail summary and delivery evidence.
- `/projects/[projectId]/closeout-package/pdf` for the contractor-side
  closeout package print/save route.
- `/settings/company-documents`, `/settings/company-documents/[documentId]`,
  and `/settings/company-documents/[documentId]/pdf` for Company Documents
  library, detail, and contractor-only browser print/save behavior when a safe
  local/dev company document exists.

Use [docs/demo/operating-core-demo-path.md](C:/FloorConnector/docs/demo/operating-core-demo-path.md)
as the current route-by-route demo and readiness walkthrough.

## Browser QA Caveats

Browser QA is not required for docs-only checkpoint work. When protected-route
browser QA is requested, first consult
[docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md).
Local Supabase Auth rate limits, stale Playwright storage state, base-URL
mismatch, or stale fixed fixture IDs can make protected-route QA fail before the
app route is actually broken.

## Guardrails

The operating-core validation helpers should remain deterministic and
source-record backed. Do not use this checklist to justify:

- schema or migration changes
- fake records or mock business flows in protected app routes
- duplicate project, job, document, message, delivery, or reporting models
- AI-generated summaries or autonomous next actions
- provider retry, reminder, or external calendar behavior
- payment, signature, estimate math, invoice math, portal access, auth/RLS, or
  tenant-boundary changes
