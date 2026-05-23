# Portal Customer Next Step QA Checkpoint

Status: Active
Doc Type: QA Checkpoint

## Purpose

This checkpoint verifies the Portal Customer Next Step work added in
`5f793fa0 feat: add portal customer next step` and confirms that the related
Service Center QA and portal maturity docs still preserve the intended
customer-safe boundary.

This was a QA and documentation pass only. It did not add portal features,
loaders, grants, routes, schema, server actions, payment behavior, signature
behavior, or service request submission.

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/chat-handoff.md`
- `docs/product-language.md`
- `docs/design/portal-maturity-phase-1-customer-project-window.md`
- `docs/design/warranty-service-phase-1-qa-checkpoint.md`
- `docs/local-auth-qa-recovery.md`
- `docs/operating-core-validation-checklist.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`

## Files Inspected

- `apps/web/lib/portal/next-step.ts`
- `apps/web/lib/portal/next-step.test.ts`
- `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
- `apps/web/app/(portal)/portal/page.tsx`
- `apps/web/app/(portal)/portal/estimates/[estimateId]/page.tsx`
- `apps/web/app/(portal)/portal/contracts/[contractId]/page.tsx`
- `apps/web/app/(portal)/portal/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(portal)/portal/change-orders/[changeOrderId]/page.tsx`
- `apps/web/lib/portal/data.ts`
- `apps/web/lib/portal/appointment-visibility.ts`
- `apps/web/lib/portal/appointment-visibility.test.ts`
- `apps/web/lib/portal/warranty-documents.ts`
- `apps/web/lib/portal/warranty-documents.test.ts`
- `apps/web/components/portal-review-ui.tsx`

## Tests Run

- `node_modules\.bin\tsx.CMD --test apps/web/lib/portal/next-step.test.ts`
  - Passed: 6 tests.
- `node_modules\.bin\tsx.CMD --test apps/web/lib/portal/appointment-visibility.test.ts`
  - Passed: 3 tests.
- `node_modules\.bin\tsx.CMD --test apps/web/lib/portal/warranty-documents.test.ts`
  - Passed: 3 tests.

Service Center, CloseoutTrail, Proof Center, and FieldTrail tests were not
rerun in this checkpoint because no Service Center, closeout, proof, field, or
application code was changed.

## Browser Routes Checked And Skipped

Saved portal auth was available at `playwright/.auth/portal-user.json`, so this
checkpoint used the existing local session and did not run auth recovery or
hammer Supabase Auth.

Checked successfully on `localhost:3000`:

- `/portal`
  - Result: 200.
- `/portal/projects/db77b765-4d6e-47d4-8c38-e91c041868f1`
  - Result: 200.
  - A linked contract, invoice, and change order were discoverable from the
    page.
- `/portal/contracts/045c379c-132b-4a96-a8f0-8ed9a0d33a6c`
  - Result: 200.
  - Customer guidance was present.
  - No `FieldTrail`, `Job Notes`, `Proof Center`, `internal blocker`, or
    `ProjectPulse` copy was detected in body text.
- `/portal/invoices/12be9e05-2171-428e-a280-8fe6aeb9e035`
  - Result: 200.
  - Customer guidance was present.
  - No `FieldTrail`, `Job Notes`, `Proof Center`, `internal blocker`, or
    `ProjectPulse` copy was detected in body text.
- `/portal/change-orders/b3a0f84f-0091-4f1f-86ca-a022cf67cc7b`
  - Result: 200.
  - Customer guidance was present.
  - No `FieldTrail`, `Job Notes`, `Proof Center`, `internal blocker`, or
    `ProjectPulse` copy was detected in body text.
- Mobile-ish portal project viewport at 390px wide
  - Result: page remained at the portal project URL with body width equal to
    viewport width.

No requested browser route was skipped in this checkpoint.

## Customer Next Step Priority Verified

The helper priority is deterministic and covered by focused tests:

1. Sent estimate -> `Review estimate`
2. Contract sign/review -> `Sign contract` when signer-specific input says the
   current user can sign; otherwise `Review contract` for active contract
   states.
3. Sent change order -> `Review change order`
4. Open invoice or payment activity -> `Review/pay invoice`
5. No customer action -> `No action needed`

The project workspace intentionally uses existing portal project list records.
Those records do not include signer-specific `currentUserCanSign`, so the
project-level card can conservatively say `Review contract` even though the
contract detail page can show the exact signer action after loading signer
routing. This preserves the current portal loader boundary and avoids broadening
portal data access for the QA pass.

## Customer-Safe Visibility Findings

- The Customer Next Step helper is pure and only receives existing portal
  estimate, contract, invoice, change-order, and project identifiers/statuses.
- The portal project workspace derives the next step from existing
  project-scoped portal loaders.
- The portal data layer continues to build project visibility from active
  portal access grants and `portal_project_access` rows through
  `accessibleProjectIds`.
- The project workspace and linked review routes do not import ProjectPulse,
  FieldTrail, internal Job Notes helpers, or Proof Center internals.
- Portal appointment visibility continues to filter for `customer_visible` and
  maps only customer-safe fields.
- Portal warranty document visibility remains limited to customer-visible
  statuses and signer email matches.
- No customer-facing service request submission behavior was introduced.
- No fake portal data was introduced.

## Behavior Preserved

- Portal access remains project-scoped through existing portal grants.
- Portal home, project workspace, estimate review, contract review/sign/decline,
  invoice review/payment handoff, and change-order review continue to use the
  established portal route structure.
- Payment and signature actions remain on their existing detail routes and
  existing server actions.
- The Customer Next Step card is read-only guidance and does not mutate records.
- Printing/saving remains a browser/document route affordance and is not
  delivery proof, sending, signing, paying, or stored artifact creation.
- Warranty/service remains visible only where existing portal warranty document
  loaders already expose safe data; this checkpoint did not add portal service
  request behavior.

## Follow-Up Candidates

- Portal Maturity Phase 2 can plan customer-facing project status and closeout
  package/download visibility, but should first define access, versioning, and
  delivery-proof boundaries.
- If customer signer-specific next steps are desired on the project workspace,
  design that as a deliberate portal loader enhancement with access review
  rather than a QA cleanup.
- Add screenshot-based portal regression coverage once portal auth state is
  stable enough for repeatable CI/browser runs.
