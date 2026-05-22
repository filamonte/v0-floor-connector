# Warranty Service Phase 1 QA Checkpoint

Status: Active
Doc Type: QA

## Purpose

This checkpoint verifies the Warranty Service Phase 1 work after the local
commit `e07bcb3a feat: improve warranty and service workspace` was pushed to
`origin/main`.

The checkpoint is scoped to Service Center stability and canonical continuity.
It does not authorize new warranty/service schema, customer service requests,
portal service-ticket visibility, provider sends, automation, billing changes,
or duplicate service records.

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

- `apps/web/lib/servicecenter/summary.ts`
- `apps/web/lib/servicecenter/summary.test.ts`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `apps/web/app/(app)/service-tickets/page.tsx`
- `apps/web/app/(app)/service-tickets/[ticketId]/page.tsx`
- `apps/web/lib/service-tickets/data.ts`
- `apps/web/lib/service-tickets/actions.ts`
- `apps/web/lib/service-tickets/schemas.ts`
- `apps/web/lib/warranty-documents/data.ts`
- `apps/web/lib/warranty-documents/actions.ts`
- `apps/web/lib/portal/data.ts`
- `apps/web/app/(portal)/portal/page.tsx`
- `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
- `apps/web/components/portal-review-ui.tsx`

## Service Center Surfaces Reviewed

- Project Workspace service/warranty section
- `/service-tickets` Service Center queue
- `/service-tickets/[ticketId]` Service Ticket Workspace
- shared Service Center summary helper and focused tests
- warranty document continuity hooks used by service/warranty panels

## Tests Run

Run in this checkpoint:

```powershell
node_modules\.bin\tsx.CMD --test apps/web/lib/servicecenter/summary.test.ts
node_modules\.bin\tsx.CMD --test apps/web/lib/closeouttrail/summary.test.ts
node_modules\.bin\tsx.CMD --test apps/web/lib/proofcenter/summary.test.ts
node_modules\.bin\tsx.CMD --test apps/web/lib/fieldtrail/summary.test.ts
node_modules\.bin\tsx.CMD --test apps/web/lib/portal/next-step.test.ts
```

Results:

- Service Center summary: 4 passing tests
- CloseoutTrail summary: 6 passing tests
- Proof Center summary: 7 passing tests
- FieldTrail summary: 3 passing tests
- Portal Customer Next Step: 6 passing tests

Full static validation for the pass:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
git diff --check
```

Results:

- typecheck passed
- lint passed
- `git diff --check` passed

## Browser Routes Checked Or Skipped

Browser QA should follow `docs/local-auth-qa-recovery.md`.

Routes checked in this pass with existing saved local auth state:

- `/service-tickets`
- `/projects`
- `/projects/fe0ba4e8-97c2-4765-9259-c6de6344d82c`

Skipped or blocked:

- `/service-tickets/[ticketId]`: skipped because no detail link was
  discoverable from the current service queue.
- `/portal`: blocked because saved portal storage state redirected to
  `/login?next=%2Fportal`.
- `/portal/projects/db77b765-4d6e-47d4-8c38-e91c041868f1`: blocked because
  saved portal storage state redirected to login.
- linked portal contract, invoice, and change-order routes: skipped because the
  portal project route did not load under the saved portal auth state.

If Supabase Auth returns rate limits or saved auth state redirects protected
routes to login, stop retrying auth setup and record the route as blocked
rather than passed.

## Findings

- The Service Center summary helper derives from existing tickets, warranty
  documents, service jobs, Proof Center context, and CloseoutTrail handoff
  state.
- Service Next Move is deterministic and does not replace ProjectPulse,
  CloseoutTrail, Proof Center, or existing service-ticket status behavior.
- `/service-tickets` still reads as an internal service queue over canonical
  service tickets.
- `/service-tickets/[ticketId]` preserves customer, project, original job,
  warranty document, service job, time, proof, and schedule context where
  available.
- Project Workspace service/warranty visibility remains compact and supporting;
  it does not become a second command center.
- No portal service-request behavior was introduced.
- No fake service or warranty data was found in the inspected service surfaces.
- User-facing copy uses Service Center and Warranty Handoff language without
  exposing internal RLS, tenant, cue-state, or read-model terminology.

## Behavior Preserved

This checkpoint preserved:

- schema and migrations
- route structure
- server actions
- service ticket status transitions
- warranty document generation, signature, delivery, and print behavior
- portal grants and project-scope enforcement
- auth/RLS and tenant logic
- payment/signature/estimate/invoice math
- provider sending, webhooks, automation, AI, notifications, settings, and
  platform-admin behavior

## Follow-Up Candidates

- Add stable protected browser fixtures for Service Ticket Workspace and Project
  Workspace service/warranty panels.
- Plan customer-safe portal service status before exposing service tickets or
  service request submission.
- Plan portal closeout package visibility only after source-record visibility
  and versioning policy are explicit.
- Consider a future shared customer-safe service/warranty summary only if the
  portal loaders already expose the needed records safely.
