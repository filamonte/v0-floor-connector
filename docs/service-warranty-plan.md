# Service + Warranty Architecture Plan

Status: Planning
Doc Type: Architecture / Product Plan

This plan defines FloorConnector's service and warranty architecture. It is planning only and does not authorize application code, schema, migrations, tests, portal requests, billing changes, warranty PDFs, signatures, or financial mutations.

Implemented truth remains in [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

Canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Executive Summary

Service and warranty should become post-installation lifecycle continuity, not a detached helpdesk. A warranty issue should remain tied to the original customer, project, job, installed system/material context, field evidence, documents/photos, time, equipment, materials, and billing decision.

The future service/warranty ticket is a post-closeout operational record that explains what happened after installation and how the contractor responded. It should reuse the same clocking, equipment, document, project, customer, portal, and billing foundations rather than create separate support, time, asset, or customer systems.

## Why Service/Warranty Matters For Specialty Flooring

Flooring warranty work depends on context:

- what system was sold and installed
- what substrate/prep conditions were documented
- what materials/products were used
- what workmanship warranty applies
- what manufacturer warranty may apply
- what photos, notes, and closeout evidence exist
- whether the issue is warranty, billable service, goodwill, or a manufacturer claim

Without this context, warranty becomes guesswork. FloorConnector should make warranty a continuation of the project memory.

## Current Implemented Foundations It Should Connect To

Service/warranty should connect to:

- customers and customer contacts
- projects as operational hubs
- estimates, contracts, change orders, invoices, and payments
- jobs and schedule
- time punch events and time cards
- daily logs, field notes, execution attachments, and punchlists
- equipment registry and assignment/readiness foundations
- catalog/cost item and material foundations
- document templates, print/save infrastructure, and shared storage foundations
- portal access and project-scoped customer review
- communications/notifications foundations
- deterministic operational cues and Project Workspace guidance

## Product Goals

- Track warranty coverage and service requests against original work.
- Keep service/warranty tickets tied to canonical project/job/install context.
- Support warranty/no-charge, billable service, goodwill/no-charge, and future manufacturer claim categorization.
- Reuse clocking for warranty/service labor.
- Capture materials, equipment, documents, photos, field notes, customer communication, and delivery proof.
- Preserve original invoice/payment state unless a human creates a valid new invoice or credit workflow in a future approved slice.
- Support future portal visibility and customer request intake without portal-only records.

## Warranty Coverage Model

Warranty coverage should be able to describe several layers.

### Project Warranty

Project-level warranty covers the overall completed project and closeout commitment. It may define start date, end date, general warranty terms, exclusions, and warranty document linkage.

### Job Warranty

Job-level warranty supports multi-phase or multi-area projects where different jobs have different completion dates, crews, scopes, or warranty windows.

### Installed System/Material Warranty

Installed system/material warranty should attach to the actual system/spec/product context, such as epoxy flake, urethane cement, polish system, moisture mitigation, topcoat, aggregate, or manufacturer product. This is future depth until installed-system records are implemented.

### Workmanship Warranty

Workmanship warranty covers contractor labor and installation quality. It should be separated from product/manufacturer warranty so reporting can identify internal workmanship issues versus product/material claims.

### Manufacturer Warranty

Manufacturer warranty should connect to vendor/manufacturer/product/spec-sheet context later. It should support future claim workflow without making the manufacturer system FloorConnector's source of truth.

## Service/Warranty Ticket Model

A future ticket should include:

- company/tenant scope
- customer
- original project
- original job where known
- source type
- warranty category
- billability classification
- status lifecycle
- issue summary and description
- priority/severity
- requested/observed dates
- service visit/job relationship
- linked documents/photos/field notes
- linked time, equipment, and materials
- communication/delivery proof context
- resolution summary

The ticket should be a canonical post-installation operational record, not a generic task or helpdesk item.

## Ticket Source

### Internal

Internal tickets can come from a project manager, field lead, owner, or office user after a customer call, inspection, punchlist follow-up, or known closeout issue.

### Future Portal Request

Portal requests should create or propose a service/warranty ticket on the shared project chain. The portal should not create a portal-only support record.

### Closeout Follow-Up

Closeout follow-up can create warranty reminders, inspection visits, or service review items after project completion.

### Punch/Service Conversion

Punchlist or field-note issues can convert into service/warranty context after closeout when the issue is no longer ordinary project punch work.

## Relationship To Original Records

### Customer

The customer remains the account/relationship record. Service/warranty should not create a separate support customer.

### Project

The original project is the primary continuity hub. It should show warranty status, active service tickets, related documents, and service visit history.

### Job

The original job explains what was installed and when. Service visits may create new service jobs or attach visits to a warranty ticket while preserving the original job relationship.

### Estimate/Contract

Estimate and contract records define sold scope, terms, exclusions, and any warranty language. Warranty should reference them, not duplicate them.

### Invoice/Payment

Invoice/payment records explain original billing and any later billable service. Warranty work should not mutate original invoice/payment state automatically.

### Installed Systems/Materials

Installed systems and materials should become a future coverage anchor. Until that exists, warranty should reference estimate/contract/job/material context conservatively.

### Field Notes/Photos

Field evidence should support diagnosis, resolution, delivery proof, and recurring issue analysis.

## Warranty Status Lifecycle

Recommended lifecycle:

1. Reported
2. Triage
3. Scheduled
4. In service
5. Waiting on customer/vendor/materials
6. Resolved
7. Denied/not covered
8. Closed

Statuses should be operational and human-controlled. AI may draft summaries later, but not decide coverage automatically.

## Service Visit/Job Relationship

Service visits should reuse job/schedule foundations where practical. A warranty ticket may have one or more service visits. If a full service job is needed, it should remain tied to the original project and ticket.

Do not create a disconnected service calendar.

## Warranty Time Clocking

Warranty/service labor should reuse the canonical clocking system:

- punch events remain audit truth
- time cards remain reviewed summaries
- service/warranty context separates post-installation labor from original production labor
- labor can feed future warranty cost reporting

No separate service timesheet system should exist.

## Service Labor Vs Original Production Labor

Service labor should be distinct for reporting but connected for history. Reports should be able to answer:

- how much service/warranty labor followed this project
- whether labor was billable, warranty, or goodwill
- which crew/person handled it
- whether repeated issues exist by system/material/job type

This distinction must not break the canonical project/job/person/time foundation.

## Materials/Equipment Used On Warranty Work

Warranty/service tickets should capture:

- materials used
- replacement products
- equipment used
- rental equipment if any
- vendor/manufacturer context if relevant

This should feed future costing and issue analysis, not automatic billing.

## Customer Communication/Delivery Proof

Customer communication should attach to the ticket and original project. Useful events include:

- request received
- appointment scheduled
- warranty terms sent
- service completed
- warranty denied explanation sent
- customer acknowledgement or signature later

Provider telemetry is evidence, not business truth.
The shared outbound document delivery and delivery-proof direction is now
captured in
[docs/document-delivery-proof-architecture.md](C:/FloorConnector/docs/document-delivery-proof-architecture.md).
Service/warranty now consumes that shared layer for internal warranty-document
delivery evidence through `document_delivery_events`; the same evidence-only
foundation also covers estimates, invoices, and manual contract evidence.
Provider-backed outbound document send architecture now lives in
[docs/provider-document-send-architecture.md](C:/FloorConnector/docs/provider-document-send-architecture.md).
Warranty document provider-backed email send is now implemented for requested
customer signers through the shared notification/delivery and
`document_delivery_events` path. Service-completion notices, denial/resolution
messages, provider callbacks, resend/retry orchestration, portal-visible proof,
and service-ticket-owned outbound sends remain future work and should reuse the
shared delivery/notification path rather than creating a service-ticket-specific
send log.

## Portal Visibility Future

Portal customers should eventually see customer-safe service/warranty status for projects they can access. Portal visibility should be scoped through existing portal grants/project access and should never create portal-only warranty records.

Portal request intake should require careful permissions, spam/abuse controls, and contractor review before operational commitment.

Warranty document portal review/signing is planned separately in [docs/portal-warranty-review-sign-plan.md](C:/FloorConnector/docs/portal-warranty-review-sign-plan.md). The recommended first slice exposes issued warranty documents through project-scoped portal access without exposing the internal service-ticket queue, labor/time evidence, billing classification, or contractor-only resolution notes.

## Billing Rules

### Warranty/No-Charge

Covered warranty work may be no-charge but should still capture labor, materials, equipment, and evidence for internal reporting.

### Billable Service

Billable service should create a valid downstream invoice only through a future approved billing workflow. It should not mutate original invoices or payments.

### Goodwill/No-Charge

Goodwill work should be classified separately from covered warranty so reporting does not hide recurring cost.

### Manufacturer Claim Future

Manufacturer claims should connect to vendor/product/document context later. They should not become a separate financial truth.

## Dashboard/Project/Customer Guidance

Dashboard should surface:

- open service/warranty tickets needing triage
- scheduled service visits
- waiting customer/vendor/material states
- warranty documents pending send/signature

Project Workspace now shows compact read-only active and historical service/warranty continuity. Customer Workspace now shows account-level service/warranty history without replacing Project as the operational context. Job Workspace now shows tickets and warranty documents tied to the original job. These panels are visibility only; editing, status actions, and document/signature management stay on the owning service ticket and warranty document workspaces.

## Document/Photo/Evidence Handling

Service/warranty should use the shared evidence direction:

- issue photos
- field notes
- closeout photos
- warranty PDFs
- signed warranty documents
- product/spec sheets
- manufacturer correspondence
- service completion proof

Avoid module-local file islands.

## Reporting/Recurring Issue Insights

Future reports should answer:

- warranty rate by system/material/job type
- service labor by crew/project/customer
- repeated issue categories
- equipment or material patterns
- billable vs no-charge service
- manufacturer claim candidates

Reports should derive from canonical records and not own truth.

## AI/Guided Opportunities

AI can later:

- summarize original project context for triage
- draft customer response
- suggest likely coverage category for human review
- identify recurring issue patterns
- draft warranty/service resolution notes

AI must not approve/deny warranty, schedule visits, send customer commitments, mutate billing, or change project status without human confirmation.

## Anti-Silo Guardrails

- No detached helpdesk/support silo.
- No portal-only warranty records.
- No duplicate customers, projects, jobs, people, vendors, materials, equipment, or time systems.
- Warranty remains attached to original project/job/install context.
- Warranty time reuses canonical clocking.
- Warranty equipment/materials reuse canonical foundations.
- Warranty work does not mutate original invoices/payments automatically.
- AI is assistance, not source of truth.

## MVP Implementation Slice

Implementation checkpoint:

- The first MVP slice now exists as `service_tickets` with tenant scope,
  customer linkage, optional project linkage, optional original job linkage,
  source/type/status/priority classification, warranty dates, warranty basis,
  description, resolution summary, and resolved/closed timestamps.
- `/service-tickets` is the internal manager surface for search, filters,
  status/type/priority counts, bounded ticket review, and ticket creation.
- `/service-tickets/:id` is the internal detail workspace for status changes,
  editable ticket basics, linked canonical record cards, and planned-later
  placeholders.
- Service Ticket detail now includes a Warranty Documents section that can
  create warranty document drafts from the ticket context and list linked
  warranty documents.
- Generic document signature groundwork now exists through `document_signers`
  and immutable `document_signature_events`, but it is constrained to
  `warranty_document` subjects and has no customer-facing send/sign workflow.
- Warranty Document detail now has internal signer management and
  request-signature audit events for warranty documents.
- Project, Customer, and Job Workspaces now include compact read-only Service &
  Warranty continuity panels. They show bounded linked service tickets, warranty
  documents, warranty date ranges, signer/request/signed counts, latest
  signature event summary, and links to the canonical service ticket, warranty
  document, and print/save surfaces.
- Service/warranty time attribution now uses the canonical clocking system:
  punch events can optionally carry `service_ticket_id`, derived time cards keep
  that context for review, `/time` can preselect a service/warranty ticket, and
  Service Ticket detail shows linked punch/time-card evidence.
- Service visit scheduling now starts from canonical jobs instead of a
  service-only calendar. A service ticket with project context can create one or
  more unscheduled linked service jobs through `jobs.service_ticket_id`; the
  existing Schedule, Job Workspace, crew assignment, equipment readiness, daily
  log, and time clocking paths then carry the visit forward.
- Dashboard Operational Cockpit now surfaces bounded read-only service/warranty
  attention signals: high-priority open tickets, stale open tickets, tickets
  missing linked service jobs, unscheduled/upcoming/in-progress service jobs,
  and warranty documents needing internal signer/request attention. These are
  route links into owning workspaces, not dashboard-owned workflow state.
- Database validation and server validation both preserve same-company
  customer/project/job relationships. RLS allows active company members to read
  and owner/admin/manager users to create or update.
- This is intentionally internal post-installation lifecycle continuity, not a
  detached helpdesk and not a portal request system.
- Portal warranty document review/signing now exists as a project-scoped
  customer-facing document workflow over canonical warranty documents and
  generic document signer/events. It is not a service-ticket portal request
  workflow and does not expose internal ticket notes, labor, billing, or crew
  context.
- Outbound sends, portal-visible delivery proof, warranty labor reporting/costing,
  dispatch-grade service visit workflow, portal service-ticket requests,
  billing, manufacturer claims, materials, equipment usage, and AI automation
  remain separate future slices.

Outbound send/delivery proof planning now lives in
[docs/document-delivery-proof-architecture.md](C:/FloorConnector/docs/document-delivery-proof-architecture.md).
The first implementations are evidence-only for warranty documents, estimates,
invoices, and manual contract evidence and do not add portal service-ticket
requests, email delivery, billing automation, manufacturer claims,
service-ticket status mutation, provider callbacks, or provider-owned truth.
Provider-backed warranty document email send now follows
[docs/provider-document-send-architecture.md](C:/FloorConnector/docs/provider-document-send-architecture.md)
and remains document-scoped rather than service-ticket-owned.

Original recommended MVP:

- service/warranty ticket planning against customer + project + optional original job
- simple status lifecycle and billability classification
- internal ticket creation from Project/Job/Customer context
- service visit/schedule handoff to canonical jobs or schedule context:
  implemented through optional service-job linkage on `jobs`
- warranty/service time attribution hook for clocking: implemented through
  canonical punch events and derived time cards
- document/photo/evidence attachment plan
- project and dashboard guidance

MVP exclusions:

- portal request intake
- warranty send/signature workflow, which is planned separately
- automatic billing
- manufacturer claim workflow
- installed-system deep model if not implemented
- AI automation
- invoice/payment/job-costing mutation
- equipment/material usage automation

## Phase 2/3 Expansion

Phase 2:

- portal customer request/review
- service visit jobs
- deeper service dispatch workflow over linked service jobs
- warranty time-card reporting
- materials/equipment usage
- warranty document send/sign handoff

Phase 3:

- manufacturer claims
- recurring issue analytics
- job-costing/reporting integration
- AI summaries/drafts
- richer portal service history

## Testing/QA Strategy

Future implementation should include:

- tenant isolation and same-company relationship validation
- status lifecycle tests
- service/warranty ticket creation from project/job/customer contexts
- warranty time attribution tests when clocking supports it
- Playwright smoke for Project/Job/Dashboard service/warranty guidance
- portal access tests before any portal request or visibility feature
- regression checks proving invoices, payments, contracts, signatures, readiness gates, and portal access are unchanged

## Open Questions

- Should the first ticket anchor require a project, or allow customer-only triage before project selection?
- When does service work become a new canonical job versus a visit under the ticket?
- What coverage categories are needed for flooring MVP?
- How should installed system/material context be represented before a full installed-system model exists?
- Which warranty states should be visible to customers?
- What is the first billable service workflow that does not weaken invoice lineage?
