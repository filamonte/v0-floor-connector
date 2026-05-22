# Chat Handoff

Status: Active
Doc Type: Operational

This is a compact handoff for future Codex sessions. It is not a competing
source of truth.

## Required First Reads

Read these before implementation or documentation work:

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
- [docs/product-language.md](C:/FloorConnector/docs/product-language.md)
- [docs/graphite-copper-ui-system.md](C:/FloorConnector/docs/graphite-copper-ui-system.md)
- [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)

## Current Branch Reality

FloorConnector is a production-first SaaS operating system for specialty
flooring contractors. It is built around one connected workflow:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

The current branch has a real operating foundation: auth, tenancy,
opportunities/leads, customers, projects, estimates, contracts, change orders,
jobs, invoices, payments, portal foundations, workforce/time/field foundations,
settings, super admin, and normalized contractor UI patterns.

Latest remote-verified implementation commit:

`09c6fbc2 feat: add Document Engine export foundations`

`git push origin main` returned `Everything up-to-date` before the Document
Engine Phase 2 planning pass.

## Latest Operating Core

Recent completed layers:

- CrewBoard Phase 1/2 on `/schedule` for job-centered scheduling visibility,
  date/layout context, selected-job handoff, and advisory schedule warnings.
- FieldTrail Phase 1 on Project Workspace and Job Workspace for execution
  history over Daily Job Logs, Job Notes, execution attachments, time cards,
  and jobs.
- MessageCenter Phase 1 on Project Workspace for project communication,
  Send Trail, Signature Trail, Payment Trail, and Customer Access context.
- ProjectPulse Phase 1 on Project Workspace for deterministic project health
  and Next Move summary.
- CloseoutTrail Phase 1 on Project Workspace for closeout readiness and proof
  summary.
- Proof Center Phase 1 on Project Workspace for project document/evidence/proof
  indexing.
- Reports Phase 1 on `/reports` for read-only operations and collections
  visibility.
- Send Trail Phase 1 on estimate, contract, and invoice source workspaces for
  existing document delivery proof visibility.
- Document Engine Phase 1 centralizes existing estimate, contract, and invoice
  print/save PDF route helpers and clarifies that browser print/save exports are
  generated artifacts, not delivery proof or a separate document source.
- Document Engine Phase 2 planning recommends a contractor-side Project
  Closeout Package HTML/print route first, with portal downloads, stored
  artifacts, and server-generated PDFs deferred until visibility and versioning
  policy are explicit.
- Document Engine Phase 2A implements the contractor-only Project Closeout
  Package print/save route at `/projects/:id/closeout-package/pdf`, generated
  from current project source records and summary helpers.

These layers are read-only summaries, source-record handoffs, copy/hierarchy
improvements, or existing-action presentation around canonical records. They did
not add schema, migrations, routes, data models, provider integrations, AI,
automation, notifications, payment/signature behavior, estimate math, invoice
math, job readiness gates, portal grants, auth/RLS, tenant logic, settings, or
platform-admin behavior.

## What Is Not Built

Do not describe these as implemented unless `docs/current-state.md` changes:

- drag/drop scheduling or automated dispatch
- external calendar sync or route optimization
- AI summaries, AI recommendations, or autonomous actions
- full document management, stored document/version lifecycle, stored generated
  closeout packages, or portal closeout downloads
- provider retry lifecycle or automated reminders
- standalone Proof Center route
- customer-facing field sharing
- full analytics/report builder
- live SaaS billing launch or entitlement enforcement

## QA Caveat

Protected-route browser QA can be blocked by local Supabase Auth rate limits,
stale Playwright storage state, base-URL mismatch, or stale fixed fixture IDs.
Use [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)
before assuming a protected-route browser failure is product behavior.

## Next Recommended Direction

Use [docs/design/document-engine-phase-2-plan.md](C:/FloorConnector/docs/design/document-engine-phase-2-plan.md)
as the current Document Engine sequencing artifact.

Recommended next build: either Phase 2B portal-safe closeout package planning
or a small print QA/polish pass after authenticated project detail QA is stable.
Do not add stored PDFs, storage, provider send, or portal download behavior until
the visibility/versioning policy is explicit.
