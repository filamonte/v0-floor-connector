# Warranty Service Phase 1 - Workspace Depth

## Purpose

Warranty Service Phase 1 improves warranty/service continuity across existing
FloorConnector records. The slice adds a shared Service Center summary and Next
Move layer over current service tickets, warranty documents, service jobs,
Proof Center context, and CloseoutTrail handoff state.

This is not a new service business system. It keeps warranty/service attached
to the existing customer, project, job, field, proof, closeout, warranty
document, and Customer Access chain.

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
- `docs/design/closeouttrail-phase-1-project-closeout-workspace.md`
- `docs/design/proof-center-phase-1-project-document-evidence-index.md`
- `docs/design/document-engine-phase-1-pdf-export-foundations.md`
- `docs/design/document-engine-phase-2-plan.md`
- `docs/design/document-engine-phase-2a-closeout-package-print-route.md`
- `docs/design/fieldtrail-phase-1-project-execution-timeline.md`
- `docs/design/messagecenter-phase-1-project-communication-timeline.md`
- `docs/local-auth-qa-recovery.md`
- `docs/operating-core-validation-checklist.md`
- `docs/service-warranty-plan.md`
- `docs/warranty-document-system-plan.md`
- `docs/portal-warranty-review-sign-plan.md`

## Existing Data Used

- existing `service_tickets` read models
- existing warranty document continuity data
- existing service-job links on canonical jobs
- existing Project Workspace Proof Center and CloseoutTrail summary output
- existing project/customer/job relationships
- existing service ticket and warranty document routes

No schema, migration, storage bucket, provider, portal grant, auth/RLS, payment,
signature, estimate, invoice, or settings changes were required.

## Project And Service Surfaces Changed

- Project Workspace service/warranty continuity now shows a Service Next Move
  derived from linked tickets, warranty documents, service jobs, proof context,
  and closeout handoff.
- `/service-tickets` now includes a compact Service Center Next Move using the
  currently loaded ticket queue.
- `/service-tickets/:id` now includes a Service Next Move panel that ties the
  ticket back to project/job/proof/warranty context.
- Service-ticket copy was tightened where it still implied warranty send/sign
  work was entirely future-only.

## Warranty/Service Summary Implemented

The new summary helper lives at:

- `apps/web/lib/servicecenter/summary.ts`

It derives:

- open and closed ticket counts
- warranty document count
- service job count
- unscheduled service job count
- requested and signed warranty signer counts
- coverage/handoff label
- evidence/proof context label
- deterministic Service Next Move
- highlights and warnings

The Next Move priority is deterministic:

1. high-priority open ticket
2. latest open ticket
3. unscheduled linked service job
4. requested warranty signature follow-up
5. closeout proof review
6. Service Center fallback

## Service Ticket Continuity Implemented

Service ticket detail keeps the same mutation model and now clarifies the next
service action without changing status behavior. It can point to the existing
ticket, schedule, warranty document, closeout package, or Service Center route,
depending on the current record context.

The page still uses the existing service ticket status actions, edit form,
service job creation action, shared time composer link, and warranty document
creation action.

## Portal/Customer Visibility Decision

No portal service-ticket visibility or customer-facing service request flow was
added. Portal warranty document review/print/sign remains on the existing
project-scoped warranty document routes. Internal service-ticket context remains
contractor-only.

## Browser QA

Focused protected Playwright smoke used a temporary, uncommitted spec.

- `/service-tickets`: passed and confirmed Service Center guidance rendered.
- `/service-tickets/:id`: skipped because protected detail discovery hit local
  Supabase Auth rate limits while resolving detail links.
- `/projects` and `/projects/:id`: skipped after the same local auth rate-limit
  condition appeared. No project-detail pass result was invented.

The auth caveat matches the existing guidance in
`docs/local-auth-qa-recovery.md`.

## Behavior Preserved

This phase did not change:

- schema or migrations
- route structure
- server actions
- service ticket status transitions
- service job creation behavior
- warranty document generation, delivery, signature, or portal behavior
- auth/RLS or tenant logic
- portal grants
- payments, signatures, estimate math, or invoice math
- provider sending
- settings or platform-admin behavior

## What Is Intentionally Not Implemented Yet

- customer-facing warranty claim submission
- customer-facing service request/status portal flow
- warranty PDF packet generation or stored packet versioning
- automatic claim approval or denial
- SLA timers or escalations
- service scheduling automation
- AI triage
- external warranty providers
- full service business module
- recurring maintenance contracts
- manufacturer claim workflows

## Follow-Up Candidates

- Add a durable portal service-status plan before exposing service tickets to
  customers.
- Add stable protected browser fixtures for service ticket detail and project
  service/warranty panels.
- Extend Service Center summary to customer and job workspaces if the current
  shared panel needs more per-surface copy.
- Plan warranty/service exports only after closeout package and document
  versioning policy are explicit.
