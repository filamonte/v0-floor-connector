# Portal Maturity Phase 4 QA - Customer Window

Status: Active
Doc Type: Design QA Checkpoint

## Purpose

This checkpoint reviews the customer portal after Portal Maturity Phases 2-4:
Customer Next Step, Project Status Window, Project Timeline, and Shared
Documents. The goal is to keep the portal Project Workspace reading as one
coherent Customer Project Window over already shared canonical records, not as a
stack of disconnected widgets.

This pass is intentionally small. It confirms the customer-safe visibility
boundary, makes light portal-home copy alignment, and records follow-up work that
would require broader loader or browser-investigation scope.

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
- `docs/design/portal-maturity-phase-4-shared-documents.md`
- `docs/local-auth-qa-recovery.md`
- `docs/operating-core-validation-checklist.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`

## Files Inspected

- `apps/web/app/(portal)/portal/page.tsx`
- `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
- `apps/web/app/(portal)/portal/estimates/[estimateId]/page.tsx`
- `apps/web/app/(portal)/portal/contracts/[contractId]/page.tsx`
- `apps/web/app/(portal)/portal/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(portal)/portal/change-orders/[changeOrderId]/page.tsx`
- `apps/web/lib/portal/next-step.ts`
- `apps/web/lib/portal/project-status-window.ts`
- `apps/web/lib/portal/project-timeline.ts`
- `apps/web/lib/portal/shared-documents.ts`
- `apps/web/components/portal-review-ui.tsx`
- `apps/web/lib/portal/*test.ts`

## Tests Run

Validation for this checkpoint covered the focused portal helper and visibility
tests:

- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/portal/next-step.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/portal/project-status-window.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/portal/project-timeline.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/portal/shared-documents.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/portal/appointment-visibility.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/portal/warranty-documents.test.ts`

Static validation:

- focused Prettier write/check on touched files
- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- `git diff --check`

## Browser Routes Checked Or Skipped

Saved portal auth was used from `playwright/.auth/portal-user.json`. Browser QA
should not be treated as a substitute for the focused helper tests because local
auth and seeded fixture state can drift.

Checked routes:

- `/portal` returned 200 and showed the portal home with `Your next step`
  language.
- `/portal/projects/db77b765-4d6e-47d4-8c38-e91c041868f1` returned 200 and
  showed the Customer Next Step, Project Status, Project Timeline, and Shared
  Documents surfaces with no forbidden contractor-only terms detected.
- The same project route at a 390px-wide viewport returned 200 with no
  horizontal overflow detected.
- `/portal/estimates/d5e2428a-b597-4408-a77c-352e205cf8d8` returned 200.
- `/portal/change-orders/b3a0f84f-0091-4f1f-86ca-a022cf67cc7b` returned 200.
- Visible portal print/PDF routes for estimates, contracts, and invoices
  returned 200, including:
  `/portal/estimates/d5e2428a-b597-4408-a77c-352e205cf8d8/pdf`,
  `/portal/contracts/045c379c-132b-4a96-a8f0-8ed9a0d33a6c/pdf`, and
  `/portal/invoices/12be9e05-2171-428e-a280-8fe6aeb9e035/pdf`.

Known local QA limitation:

- `/portal/contracts/045c379c-132b-4a96-a8f0-8ed9a0d33a6c` returned 500 in the
  local browser run.
- `/portal/invoices/12be9e05-2171-428e-a280-8fe6aeb9e035` returned 500 in the
  local browser run.
- Their project links and existing print routes remained discoverable and the
  print/PDF routes returned 200. Treat the review-route 500s as a follow-up
  investigation with current server logs and fixture state before calling them a
  product regression.

## Customer Window Findings

- Customer Next Step remains the top customer action signal.
- Project Status Window summarizes current shared-record state from existing
  portal project estimates, contracts, invoices, and change orders.
- Project Timeline gives customer-safe history/current milestones from already
  loaded portal-safe project data.
- Shared Documents gives one place to open shared estimates, contracts,
  invoices, and change orders, with print/save links only where existing portal
  print routes already exist.
- Portal copy avoids contractor-side product names and uses plain customer
  labels such as `Your next step`, `Project status`, `Project timeline`, and
  `Shared documents`.
- Portal home data is not sufficient for a full shared-document count without
  widening the home loader. That improvement remains deferred.

## Cleanup Changes Made

- Renamed the portal home summary label from `What to do next` to `Your next
step`.
- Renamed the per-project portal home attention label from `What matters now` to
  `Your next step`.
- Renamed the primary portal home inset from `Project needing attention` to
  `Project to review`.

These are customer-facing copy alignment changes only. No helper behavior,
loader fields, routes, actions, permissions, or data models changed.

## Customer-Safe Visibility Rules Confirmed

- Shared document links point to existing portal review routes.
- Print/save links are only generated for existing portal estimate, contract,
  and invoice print/PDF routes.
- Change orders remain open/review links only; no new print route was added.
- No internal FieldTrail, Job Notes, Proof Center evidence, internal blockers,
  ProjectPulse, Ready Check, GateKeeper, CloseoutTrail, contractor-only Next
  Moves, or internal Send Trail provider details are exposed by the portal
  helpers or project page.
- No fake records, fake statuses, AI summaries, notifications, provider sends,
  stored PDFs, storage buckets, service-request submission, schema changes, or
  portal-only records were added.

## Remaining Follow-Up Candidates

- Add a tiny portal-home shared-document count only after the home loader is
  explicitly allowed to expose safe per-project counts for all shared record
  types.
- Investigate any local contract/invoice review route 500s with server logs and
  current fixture state before treating them as product regressions.
- Consider a later visual-density pass for the Project Workspace if the status,
  timeline, and document sections begin to feel too repetitive after more
  records are shared.
- Add durable browser coverage only after the portal fixture and auth state are
  stable enough to avoid brittle screenshot tests.
