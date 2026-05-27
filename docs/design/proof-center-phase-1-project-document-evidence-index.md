# Proof Center Phase 1 - Project Document And Evidence Index

Status: Implemented

Proof Center Phase 1 adds a read-only project document and evidence index to
Project Workspace. It helps contractors find the proof connected to a project
without creating a full document-management system or a duplicate file model.

## Purpose

Proof Center answers:

- what official records exist for this project?
- what was sent?
- what was signed?
- what was paid?
- what field proof exists?
- what customer-facing records are available?
- what proof is missing before closeout review?
- where should the contractor open the source record?

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
- `docs/design/fieldtrail-phase-1-project-execution-timeline.md`
- `docs/design/messagecenter-phase-1-project-communication-timeline.md`
- `docs/design/projectpulse-phase-1-project-health-summary.md`
- `docs/design/closeouttrail-phase-1-project-closeout-workspace.md`
- `docs/design/project-workspace-lifecycle-qa.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`

## Existing Data Used

Proof Center reads existing Project Workspace context:

- estimates
- contracts and Signature Trail context
- invoices and Payment Trail context
- change orders
- MessageCenter Send Trail counts
- Customer Access counts
- Daily Job Logs
- Job Notes
- FieldTrail evidence and execution attachments
- warranty documents linked to the project
- service tickets linked to the project

No new proof, document, upload, file, route, schema, provider, webhook, payment,
signature, field, portal, warranty, or service model was added.

## Project Workspace Changes

Project Workspace now includes Proof Center below CloseoutTrail and before the
Financial Hub. ProjectPulse remains the top-level project health and Next Move
summary. CloseoutTrail remains the closeout readiness panel. Proof Center is a
supporting source-record index for proof and evidence, not a second command
center.

Project Evidence / Documents / Closeout Continuity v1 now adds a companion
Project Evidence section driven by
`apps/web/lib/projects/evidence-continuity.ts`. It sits with the existing
CloseoutTrail and Proof Center stack and answers the higher-level proof-locker
questions: which active evidence exists, which evidence is archived and hidden
from active proof counts, which commercial documents are customer-safe, which
field proof is internal-only, what needs office review, and what recent proof
movement happened. This section is a read-model layer over existing records; it
does not replace Proof Center, FieldTrail, CloseoutTrail, Daily Logs, Job Notes,
or document print/save routes.

## Proof Categories Implemented

Proof Center groups real records into:

- Commercial records: estimate, contract, change orders
- Customer actions: Signature Trail, Send Trail, Customer Access
- Billing proof: invoice, Payment Trail
- Field proof: Daily Job Logs, Job Notes, evidence / attachments
- Closeout / support: warranty documents, service tickets

Each item shows count/status, short helper copy, and a link to the source record
or source section.

## Missing Proof / Next Move Rules Implemented

The Proof Next Move is deterministic:

- contract exists but no signed contract -> Review Signature Trail
- invoices exist but no paid invoice or Payment Trail proof -> Review Payment Trail
- jobs exist but no Daily Job Logs -> Review Daily Job Logs
- field history exists but no evidence attachments -> Review FieldTrail
- customer-facing records exist but no Customer Access -> Review Customer Access
- closeout is ready and warranty/service proof exists -> Review closeout proof
- otherwise -> Review project proof

No documents are generated, proof is not marked complete, and no records are
mutated.

## Behavior Preserved

This slice preserves:

- schema and migrations
- route paths
- upload behavior
- document send behavior
- contract and signature behavior
- payment, checkout, invoice, and payment-event behavior
- estimate and invoice math
- Daily Job Log behavior
- field note validation
- execution attachment behavior
- warranty document behavior
- service ticket behavior
- Customer Access / portal access behavior
- auth, tenant boundaries, RLS, settings, and platform-admin logic

The continuity pass also preserves the field-evidence archive boundary:
Project Detail may load archived `execution_attachments` metadata for internal
continuity, but FieldTrail, Proof Center, and CloseoutTrail continue to receive
active-only evidence counts. Archived field evidence remains hidden from active
proof, receives no new storage behavior here, and stays contractor-only.

## Intentionally Not Implemented

- full document management
- new upload manager
- shared file/evidence table
- standalone Proof Center route
- portal/customer field evidence exposure
- destructive storage delete or storage policy changes
- customer-facing field-evidence sharing
- warranty PDF generation
- AI proof summaries
- automated reminders
- provider send/retry flows
- external file storage changes
- portal-only proof copies

## Follow-Up Candidates

- Add a dedicated documents/files area only after the shared file/evidence model
  is approved.
- Deepen the customer-facing closeout package only after versioning, explicit
  shared-file visibility, stored package policy, and delivery-proof policy are
  approved. The current portal Closeout Handoff is read-only and customer-safe;
  it does not expose field evidence or generate a stored package.
- Add richer warranty and service proof indexing after warranty/service portal
  depth is implemented.
- Consider extracting Project Workspace summary panels if the route continues to
  grow.

## Browser QA Limitations

Recent protected-detail browser QA was blocked by Supabase Auth rate limiting
and stale fixture access. This slice was designed for static validation and
focused pure summary tests. Browser checks should be run when authenticated
local access is available; blocked auth should be documented honestly rather
than treated as a Proof Center implementation failure.
