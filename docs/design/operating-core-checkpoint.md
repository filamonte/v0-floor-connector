# Operating Core Checkpoint

Status: Active
Doc Type: Checkpoint

## Purpose

This checkpoint recalibrates FloorConnector documentation and build direction
after the recent operating-core expansion:

- CrewBoard Phase 1 and Phase 2
- FieldTrail Phase 1
- MessageCenter Phase 1
- ProjectPulse Phase 1
- Project Workspace OS consolidation
- CloseoutTrail Phase 1
- Proof Center Phase 1
- Reporting Phase 1
- Send Trail Phase 1
- Product language system
- Graphite/Copper visual adoption and chrome collapse
- Local auth QA recovery

This pass is documentation and audit only. It does not implement new app
features.

## Docs Read

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)
- [docs/vision.md](C:/FloorConnector/docs/vision.md)
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/README.md](C:/FloorConnector/docs/README.md)
- [docs/product-language.md](C:/FloorConnector/docs/product-language.md)
- [docs/product-language-audit.md](C:/FloorConnector/docs/product-language-audit.md)
- [docs/reporting-and-metrics.md](C:/FloorConnector/docs/reporting-and-metrics.md)
- [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)
- [docs/graphite-copper-ui-system.md](C:/FloorConnector/docs/graphite-copper-ui-system.md)
- [docs/design/floorconnector-visual-system-evolution.md](C:/FloorConnector/docs/design/floorconnector-visual-system-evolution.md)
- [docs/design/crewboard-phase-1.md](C:/FloorConnector/docs/design/crewboard-phase-1.md)
- [docs/design/crewboard-phase-2-dispatch-usability.md](C:/FloorConnector/docs/design/crewboard-phase-2-dispatch-usability.md)
- [docs/design/fieldtrail-phase-1-project-execution-timeline.md](C:/FloorConnector/docs/design/fieldtrail-phase-1-project-execution-timeline.md)
- [docs/design/messagecenter-phase-1-project-communication-timeline.md](C:/FloorConnector/docs/design/messagecenter-phase-1-project-communication-timeline.md)
- [docs/design/projectpulse-phase-1-project-health-summary.md](C:/FloorConnector/docs/design/projectpulse-phase-1-project-health-summary.md)
- [docs/design/project-workspace-os-consolidation-qa.md](C:/FloorConnector/docs/design/project-workspace-os-consolidation-qa.md)
- [docs/design/closeouttrail-phase-1-project-closeout-workspace.md](C:/FloorConnector/docs/design/closeouttrail-phase-1-project-closeout-workspace.md)
- [docs/design/proof-center-phase-1-project-document-evidence-index.md](C:/FloorConnector/docs/design/proof-center-phase-1-project-document-evidence-index.md)
- [docs/design/reporting-phase-1-operations-collections-visibility.md](C:/FloorConnector/docs/design/reporting-phase-1-operations-collections-visibility.md)
- [docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md](C:/FloorConnector/docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md)

## Implementation Areas Inspected

- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `apps/web/app/(app)/schedule/page.tsx`
- `apps/web/app/(app)/reports/page.tsx`
- `apps/web/app/(app)/estimates/[estimateId]/page.tsx`
- `apps/web/app/(app)/contracts/[contractId]/page.tsx`
- `apps/web/app/(app)/invoices/[invoiceId]/page.tsx`
- `apps/web/lib/projectpulse/*`
- `apps/web/lib/fieldtrail/*`
- `apps/web/lib/messagecenter/*`
- `apps/web/lib/closeouttrail/*`
- `apps/web/lib/proofcenter/*`
- `apps/web/lib/sendtrail/*`
- `apps/web/lib/reports/*`
- `apps/web/lib/schedule/warnings.ts`
- focused summary/read-model tests listed in
  [docs/operating-core-validation-checklist.md](C:/FloorConnector/docs/operating-core-validation-checklist.md)

## What Is Implemented Now

- CrewBoard on `/schedule` for scheduling visibility, date/layout context,
  job/project handoffs, selected-job schedule/crew actions, and advisory
  schedule warnings.
- ProjectPulse on Project Workspace for deterministic project health and Next
  Move summary.
- FieldTrail on Project Workspace and Job Workspace for field execution history.
- MessageCenter on Project Workspace for project communication, Send Trail,
  Signature Trail, Payment Trail, and Customer Access context.
- CloseoutTrail on Project Workspace for closeout readiness and proof summary.
- Proof Center on Project Workspace for source-record document/evidence/proof
  indexing.
- Reports on `/reports` for company-level read-only operations and collections
  visibility.
- Send Trail on estimate, contract, and invoice source workspaces for existing
  document delivery proof visibility.
- Product language now names these layers without renaming routes, schema,
  server actions, or internal models.

## What Is Not Implemented Yet

- drag/drop scheduling
- automated dispatch
- route optimization
- external calendar sync
- AI summaries, recommendations, or autonomous actions
- full document management
- stored document/version lifecycle
- generated closeout package creation
- provider retry lifecycle
- automated reminders
- standalone Proof Center route
- customer-facing field sharing
- full analytics/report builder
- live SaaS billing launch, Stripe Customer Portal, or entitlement enforcement

## Architecture Guardrails Confirmed

- The recent layers preserve the canonical lifecycle:
  `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`.
- Project Workspace remains the main readiness and continuity hub.
- CrewBoard uses existing jobs, appointments, job assignments, people, vendors,
  projects, and customers.
- Reports derives visibility from source records instead of creating a reporting
  warehouse or fake metric layer.
- Send Trail, MessageCenter, Proof Center, Signature Trail, and Payment Trail
  are evidence/visibility layers over existing records.
- No checkpoint doc change authorizes schema, migrations, routes, server
  actions, provider integrations, AI, automation, notifications, payment,
  signature, estimate math, invoice math, auth/RLS, tenant logic, portal grants,
  settings, or platform-admin behavior.

## Product-Language State

The current approved named layers are useful, but should be used with restraint:

- Use CrewBoard when talking about the `/schedule` scheduling workspace.
- Use ProjectPulse, FieldTrail, MessageCenter, CloseoutTrail, and Proof Center
  where the Project Workspace sections need names.
- Use Send Trail where source documents expose delivery proof.
- Use Reports for the `/reports` source-record visibility workspace.
- Use plain copy elsewhere when a named layer would feel forced.

## Known QA Caveats

Browser QA was not required for this docs-only checkpoint. Protected-route QA
can be blocked by local Supabase Auth rate limits, stale Playwright storage
state, base-URL mismatch, or stale fixed fixture IDs. Use
[docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)
before treating those failures as product regressions.

## Suggested Next Build Options

- Document generation / PDF / export depth.
- Mobile field execution depth.
- CrewBoard Phase 3 drag/drop design spec only.
- Warranty/service depth.
- Reporting Phase 2.
- Customer portal maturity.
- Billing/subscriptions setup.
- Accounting/reconciliation adapter planning.

## Recommended Next Build

Recommended next build: document generation / PDF / export depth.

Reason: the recent operating-core layers created better visibility into proof,
delivery, closeout, commercial documents, and customer review. The next durable
step is to make the documents themselves more dependable: generated outputs,
PDF/export controls, stored/retrievable versions where appropriate, and
source-record-safe retrieval. That strengthens Proof Center, Send Trail,
CloseoutTrail, estimates, contracts, invoices, warranty documents, and portal
review without creating another disconnected module.

Mobile field execution is the next strongest candidate, but document generation
has broader leverage across the freshly connected proof, delivery, closeout, and
commercial surfaces.
