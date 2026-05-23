# Marketing Demo Refresh Phase 1

Status: Active
Doc Type: Design / Marketing

## Purpose

This pass refreshes the public FloorConnector homepage so it reflects the
current operating core without overstating target-only product depth. The goal
is to explain FloorConnector as connected operating software for specialty
surface contractors, not as a generic CRM, isolated portal, or disconnected
contractor app.

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/system-overview.md`
- `docs/workflows.md`
- `docs/vision.md`
- `docs/Roadmap.md`
- `docs/target-ia.md`
- `docs/chat-handoff.md`
- `docs/product-language.md`
- `docs/demo/operating-core-demo-path.md`
- `docs/design/operating-core-checkpoint.md`
- `docs/design/operating-core-demo-smoke-checkpoint.md`
- `docs/operating-core-validation-checklist.md`
- `docs/design/floorconnector-visual-system-evolution.md`
- `docs/graphite-copper-ui-system.md`

## Marketing Surfaces Inspected

- `apps/web/app/page.tsx`
- `apps/web/components/marketing-investor-page.tsx`
- `apps/web/components/auth-login-page.tsx`
- `apps/web/components/auth-signup-page.tsx`
- `apps/web/app/(marketing)/layout.tsx`
- `apps/web/app/(app)/dashboard/page.tsx`
- root `README.md` marketing and product references

No `/demo` marketing route exists in the current app.

## Pages And Components Changed

- `apps/web/components/marketing-investor-page.tsx`

Supporting docs updated:

- `docs/current-state.md`
- `docs/chat-handoff.md`
- `docs/README.md`
- `docs/design/marketing-demo-refresh-phase-1.md`

## Implemented Claims Added

The public homepage now describes these current, demo-ready operating-core
claims:

- FloorConnector is connected operating software for epoxy flooring, concrete
  polishing, resinous flooring, and specialty surface contractors.
- The workflow connects lead/opportunity, customer, project, estimate,
  contract, change order, job, invoice, payment, and closeout.
- Project Workspace is the operating hub for project health, Next Move,
  commercial records, scheduling, field history, proof, closeout, and customer
  access context.
- CrewBoard, FieldTrail, MessageCenter, Proof Center, Customer Portal,
  Financial Control, and Document Engine are presented as current operating
  core surfaces.
- Portal customers see Customer Next Step, Project Status, Project Timeline,
  Shared Documents, and safe review actions through shared project workflow.
- Reports, Financial Control, Accounting Readiness, CSV export prep, mobile
  Daily Job Log capture, and global search are part of the current demo story.

## Claims Intentionally Avoided

The public homepage does not claim:

- drag/drop scheduling
- automated dispatch
- route optimization
- external calendar sync
- accounting sync or ledger posting
- full document management
- stored generated PDFs
- portal closeout downloads
- customer-facing FieldTrail
- customer-submitted service requests
- AI summaries, AI recommendations, or autonomous actions
- external provider integrations as live capability
- fake screenshots, customer logos, or performance metrics

## Behavior Preserved

This pass changed public marketing copy and layout only. It did not change
schema, migrations, routes, server actions, auth/RLS, tenant logic, payments,
signatures, estimate math, invoice math, portal grants, settings logic,
platform-admin logic, provider behavior, AI, automation, notifications, or
production data.

## Follow-Up Candidates

- Capture fresh public screenshots only after the public homepage is validated
  in the target deployment environment.
- Add a dedicated demo route only if a future task explicitly scopes it and
  defines whether it is public, authenticated, or sales-assisted.
- Refresh public auth-page side copy to match the operating-core story if the
  login/signup shell is next in scope.
- Revisit package positioning after Company Documents or another major
  approved product depth slice lands.
