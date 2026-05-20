# Known Gaps

Status: Active
Doc Type: Current Truth

This document lists important depth gaps without implying the operating core is nonexistent. Use [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for exact implementation status.

## Important Gaps

- Full scheduling calendar/board depth beyond the current `/schedule` foundation.
- Dispatch automation, route optimization, and deeper crew/resource coordination.
- Broader reporting, analytics, and report-builder depth beyond current `/reports` foundations.
- Import/export depth beyond the current `/settings/export` foundation, including actual customer/contact write execution, editable duplicate-resolution UX, rollback/undo execution, write completion audit trail, attachments/files, communication exports, portal-access metadata exports, contract/change-order export policy, provider-specific accounting exports, and richer export management beyond the current metadata-only history.
- Communications and notification depth, including provider-backed customer messaging, delivery proof, and broader source coverage.
- External e-sign provider integration on top of canonical contracts.
- External tax and accounting integrations.
- Deeper payment reconciliation, refunds, disputes, subscriptions, retry, and provider-sync workflows.
- Broader module-dashboard coverage and module-specific operational depth.
- Richer document/template editing and document output control.
- Full AIA/progress billing UX, export forms, and draw-management depth.
- Full materials execution workflows, including reservation, issue, return, purchasing, and job material planning.
- Shared file/evidence layer with multi-record links.
- AI/intelligence layer beyond deterministic cues and planning docs.

## Feature Coverage Gaps

The owner feature-coverage decisions are tracked in [docs/contractor-foreman-gap-decision-list.md](C:/FloorConnector/docs/contractor-foreman-gap-decision-list.md) and [docs/future-feature-coverage-map.md](C:/FloorConnector/docs/future-feature-coverage-map.md). Important current gaps or foundation-only areas include:

- Equipment management beyond the registry plus first job assignment/readiness foundation: maintenance, utilization, job costing, procurement/AP, portal visibility, warranty/service behavior, AI guidance, autonomous rescheduling, dashboard-owned equipment cue state, and hard equipment readiness blocks remain gaps. The tenant-scoped `equipment_assets` registry, `/equipment`, `/equipment/:id`, job equipment requirements, equipment-to-job assignments, advisory Job/Schedule/Project/Dashboard warnings, warning-derivation tests, and migration scope/RLS assertions are implemented; broader architecture is documented in [docs/equipment-management-plan.md](C:/FloorConnector/docs/equipment-management-plan.md), assignment/readiness status is in [docs/equipment-assignment-readiness-plan.md](C:/FloorConnector/docs/equipment-assignment-readiness-plan.md), and the next maintenance/utilization/costing path is in [docs/equipment-maintenance-utilization-plan.md](C:/FloorConnector/docs/equipment-maintenance-utilization-plan.md).
- Clocking/time-card depth beyond the current review-hardened foundation: admin correction events/UI, crew break/clock-out bulk actions, overtime/pay-period policy, GPS verification, payroll/export, and job-costing feeds remain gaps. The implemented foundation keeps punch events as audit truth, provides state-aware clock-in/start-break/end-break/clock-out on `/time`, supports crew clock-in, surfaces derived review exceptions, lets managers approve/reject derived time cards without mutating financials, and now supports optional service/warranty ticket attribution on punch events and derived time cards. The planning architecture is in [docs/clocking-system-plan.md](C:/FloorConnector/docs/clocking-system-plan.md).
- Bid/RFP management for bid packages, invitations, responses, scopes, subcontractors, documents, communications, and estimate handoff.
- Deeper subcontractor management over canonical people, vendors, compliance, jobs, projects, contracts, change orders, invoices, and documents.
- Service/warranty depth beyond the first internal ticket and warranty document foundations: portal requests, outbound sends, portal signatures, delivery proof, service visit scheduling, installed system/product coverage, field evidence attachments, materials/equipment usage, billing/manufacturer claims, service labor reporting/job costing, and recurring issue reporting remain gaps. The implemented foundation is tenant-scoped `service_tickets` with `/service-tickets` and `/service-tickets/:id` manager/detail workflows tied to canonical customers, optional projects, and optional original jobs, plus warranty `document_templates`, tenant-owned warranty template editing, canonical `warranty_documents`, `/warranty-documents/:id/print` browser print/save rendering, and generic `document_signers` / `document_signature_events` constrained to `warranty_document` subjects only. Warranty Document detail now supports internal signer management and request-signature audit events, while Project, Customer, and Job Workspaces show read-only linked service/warranty visibility summaries. Service/warranty time now uses optional `service_ticket_id` attribution on canonical punch events and derived time cards, with Service Ticket detail showing linked time and routing to the shared `/time` composer. Signature request events do not send email or expose portal signing. The planning architecture is in [docs/service-warranty-plan.md](C:/FloorConnector/docs/service-warranty-plan.md), with warranty document/signature planning in [docs/warranty-document-system-plan.md](C:/FloorConnector/docs/warranty-document-system-plan.md) and generalized send/signature architecture in [docs/document-send-signature-architecture.md](C:/FloorConnector/docs/document-send-signature-architecture.md).
- Weather-aware dashboard and scheduling guidance beyond current weather snapshot foundations.
- Central record-linked document management for submittals, spec sheets, warranties, compliance, project docs, and multi-record file/evidence workflows.
- Purchase orders, procurement, bills/expenses/AP, job costing, budget vs actual, and earned value depth.
- Takeoff/plans/blueprints and AI-assisted quantity generation with contractor review before estimate insertion.
- Mobile/offline field UX beyond responsive web foundations.

## Interpretation

These gaps are depth and maturity gaps around an implemented operational core. Future work should deepen the same canonical record chain rather than create disconnected replacement systems.
