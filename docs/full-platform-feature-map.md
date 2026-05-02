# Full Platform Feature Map

Status: canonical feature and service map for the current FloorConnector branch.

This document maps the full FloorConnector platform across implemented, partially implemented, and not-started capabilities. It is a synthesis of current implementation truth, active planning docs, and prior product direction.

Primary sources:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/vision.md](C:/FloorConnector/docs/vision.md)
- [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)
- [docs/directory-contact-model-plan.md](C:/FloorConnector/docs/directory-contact-model-plan.md)
- [docs/customer-contact-permissions-schema-plan.md](C:/FloorConnector/docs/customer-contact-permissions-schema-plan.md)
- [docs/customer-contact-permission-enforcement-plan.md](C:/FloorConnector/docs/customer-contact-permission-enforcement-plan.md)

If this document conflicts with [docs/current-state.md](C:/FloorConnector/docs/current-state.md), trust `current-state.md` for implemented status.

## Canonical Platform Rule

FloorConnector is one connected contractor operating system, not a collection of separate module apps.

The canonical lifecycle chain is:

`auth -> organization -> opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Supporting systems must attach to that chain instead of creating parallel records:
- Directory is a view and management layer over canonical records, not a merged contact/customer/person table.
- Portal is a customer-facing surface on canonical customer, project, estimate, contract, change-order, invoice, and payment records.
- Communications, notifications, automation, documents, integrations, tax, reporting, and future marketplace behavior must extend the same record chain.
- Provider integrations must attach metadata, events, and adapter behavior to canonical records instead of becoming source-of-truth systems.

## Status Definitions

- `Implemented`: real schema, data access, UI, and workflow behavior exist on the current branch.
- `Partially implemented`: foundations, placeholders, settings, or first-pass workflows exist, but the system is not production-complete for the full product expectation.
- `Not started`: no meaningful canonical workflow exists yet beyond target docs, placeholder routes, or reserved package/app structure.

## 1. Core Business System

### Implemented

- Supabase-backed authentication with Google OAuth, email/password, password reset, callback handling, sign out, and protected route enforcement.
- First-user bootstrap into profile, organization/company, and owner membership.
- Organization-aware protected contractor app shell.
- Tenant-scoped canonical records for:
  - opportunities/leads
  - customers
  - projects
  - estimates
  - estimate line items
  - approved estimate snapshots
  - change orders
  - approved change-order snapshots
  - schedule of values and schedule-of-value items
  - contracts
  - contract signers
  - contract signature events
  - jobs
  - invoices
  - invoice line items
  - payments
  - payment events
- Connected lifecycle from opportunity through payment recording.
- Lead-to-estimate conversion that creates or links canonical customer and project records.
- Project detail as the current readiness and workflow hub.
- Estimate authoring on canonical line items with autosave, validation, catalog sourcing, reusable systems, import from prior estimates, customer send, portal review, approval/rejection, and approved snapshot creation.
- Contract generation from approved estimate/project context using shared templates, draft editing, internal approval readiness, signer routing, portal signature/decline, optional countersign, signature events, and signature-state continuity.
- Change-order authoring, portal review, approval/rejection, approved snapshot creation, and downstream SOV or invoice integration.
- Jobs with first-pass execution states, schedule fields, and crew assignment foundation.
- Invoice creation from canonical project, approved estimate snapshot, SOV, approved change-order snapshot, job context, or invoice-only adjustment lineage.
- Payments recorded against canonical invoices, invoice balance recalculation, paid/partially-paid status updates, payment events, and portal payment initiation/completion foundation.
- Progress billing / SOV workflow on the approved-estimate-to-invoice chain.
- Workforce and field-execution foundations:
  - people
  - vendors
  - compliance records
  - time punch events
  - time cards
  - daily logs
  - field notes
  - execution attachments
  - punchlist items
  - appointments
- Shared contractor global search across canonical tenant records.
- Shared contractor notifications backed by stored notification records.
- Universal create launcher that routes into canonical Quick-Create flows.
- Contractor settings for organization, templates, catalogs, financial defaults, workflow defaults, automation visibility, admin, and module controls.

### Partially Implemented

- Scheduling and dispatch are first-pass only: schedule manager, week/day/board views, crew-state continuity, and crew assignment exist, but dispatch-grade optimization and deeper planner workflows are not complete.
- Project-centered workspace direction is real but still needs deeper consolidation across all downstream work, files, activity, materials, and closeout.
- Jobs/work orders have foundation workflows but not full production execution depth.
- AR/AP exist as financial structure/spec routes; AR has summary-level financial visibility through invoices/payments, while AP has no payable ledger.
- Retainage and AIA/progress billing have real foundations, but richer pay-application workflows, forms, exports, and reports are not complete.
- Financing readiness fields and workflow settings exist, but financing is not a full workflow system.

### Not Started

- Full dispatch optimization, route optimization, capacity planning, and automated schedule recommendations.
- Complete closeout package workflow.
- Payroll, job costing accounting sync, and full payable-side vendor bill workflow.
- Full task management system beyond notifications, next actions, punchlists, and placeholders.

## 2. Directory / Contact System

### Implemented

- Canonical contact-like models remain distinct:
  - users/profiles for authenticated identity
  - platform roles for super-admin authority
  - company memberships for contractor tenant access
  - people for workforce participants
  - vendors for external companies
  - customers for canonical customer/account records
  - opportunities for leads
  - contacts for reusable contact identity
  - customer_contacts for customer-account contact relationships
  - portal_access_grants for customer-scoped portal access
  - portal_project_access for project-scoped portal visibility
- `/directory` exists as a read-only unified contractor-facing view over canonical customers, related customer contacts, people, vendors, and opportunities.
- Directory rows route back to existing canonical detail workspaces rather than becoming a new write system.
- Customer detail includes related customer contact management over `contacts` and `customer_contacts`.
- Contractor admins can add/edit related customer contacts and designate one main contact from customer detail.
- Customer, person, vendor, and lead detail pages include Directory-context handoff cards.
- Customer detail surfaces portal access state and linked-contact permission state.

### Partially Implemented

- Directory is currently read-only as a unified index; canonical editing still lives in each record workspace.
- Related customer contacts exist, but not every customer-facing workflow has contact-specific behavior.
- Contact-linked portal grants and stored customer-contact permissions exist, but enforcement is still partial.
- Workforce `people`, contractor members, customers, vendors, leads, and contacts are not yet fully unified into a richer management workspace with tabs, labels, roles, and cross-entity history.
- Vendor contact modeling is still thin; vendors primarily carry company and primary contact fields.

### Not Started

- `vendor_contacts` relationship model.
- Miscellaneous contact management.
- Customer-contact project roles beyond portal project visibility.
- Customer-facing main-contact self-service management for other contacts.
- Full `/people` to `/directory` route migration with `/people` as a legacy redirect.
- Directory-level tagging, labels, deduplication, and lifecycle promotion workflows.

## 3. Portal + Permissions

### Implemented

- Customer portal shell and portal home.
- Portal project workspace on canonical customer/project access.
- Canonical portal access grants anchored to customers.
- Project-scoped portal visibility through `portal_project_access`.
- Optional `portal_access_grants.customer_contact_id` for linked-contact portal users.
- Tenant-safe portal loaders for canonical projects, estimates, contracts, change orders, and invoices.
- Portal record view audit foundation.
- Portal estimate review, view tracking, approval, and rejection on canonical estimates.
- Portal contract review, signer visibility, sign/decline, and signature-state updates on canonical contracts.
- Portal change-order review, approval, and rejection on canonical change orders.
- Portal invoice review and payment initiation on canonical invoices/payments.
- Stored `customer_contact_portal_permissions` keyed to canonical `customer_contacts`.
- Contractor-admin UI for editing linked-contact portal permission flags.
- Linked-contact permission enforcement for:
  - estimate approve/reject through `can_approve_estimates`
  - change-order approve/reject through `can_approve_change_orders`
  - contract sign/decline through `can_sign_contracts`
  - contractor-side signer option filtering by `can_sign_contracts`
- Null-contact customer-level grants preserve legacy behavior.

### Partially Implemented

- Permission enforcement is not universal across all portal actions.
- Estimate, contract, invoice, payment, and project visibility still rely primarily on portal grant and project scope; linked-contact view permissions are not fully enforced everywhere.
- Invoice/payment permissions are stored but not fully enforced for billing visibility and checkout start.
- `can_request_quotes` is stored but has no complete quote-request workflow to gate.
- Main-contact governance permissions are stored but not active as customer self-service behavior.
- Portal access cleanup for legacy null-contact grants is not complete.

### Not Started

- Customer self-service management of contact permissions and portal access.
- Universal enforcement for null-contact grants after a migration/cleanup period.
- Broader portal configuration defaults controlled by super admin.
- Richer portal workflows for files, status updates, quote requests, selections, approvals beyond current commercial documents, and closeout.

## 4. Communication System

### Implemented

- Canonical notification events.
- Per-user notifications.
- Notification deliveries with channel-aware status fields.
- Canonical communication threads.
- Canonical immutable communication messages.
- Contractor-side notifications in shell and dashboard, derived from jobs, invoices, contracts, appointments, punchlists, progress billing, estimate customer activity, and communication activity.
- `/communications` contractor surface that reads canonical threads/messages and unread communication notifications.
- Safe reply composer on canonical threads.
- Communication read triage for canonical per-user communication notifications.
- URL-driven status/source filters and text search on loaded communication threads.
- Thread history with actor labels, timestamps, source context, and empty states.
- Communication context cards on project, customer, estimate, contract, change-order, and invoice detail pages.

### Partially Implemented

- Communication UI is first-pass and review-oriented.
- Contractor-side send/reply depth is limited.
- Customer-facing portal messaging is not broadly implemented.
- Notification delivery tracking exists, but full external send/delivery/open/click workflows are not complete across channels.
- Communications are attached to canonical record context, but richer templates, routing, assignment, and inbox workflows remain future work.

### Not Started

- Full two-way contractor/customer messaging experience in portal.
- Email/SMS provider-backed conversation sync.
- Team inbox assignment, SLA, escalation, and internal notes workflow.
- Broader communication automation execution.
- Communication preferences and opt-in/opt-out management beyond current foundations.

## 5. Automation System

### Implemented

- `/settings/automation` contractor-side visibility and readiness surface.
- Automation readiness dashboard over canonical workflow, notification, communication, payments, contracts, change orders, projects, and scheduling foundations.
- Organization-scoped future notification-only automation preferences stored on `organization_workflow_settings`.
- Read-only eligibility preview/debug view against sample canonical event or record context.
- Static preview-only notification-copy template definitions for supported automation categories.
- Compact read-only automation build plan per category combining saved preferences, eligibility sample, and template preview.

### Partially Implemented

- Automation settings store future intent, categories, and intended contractor-role recipients.
- Automation concepts are mapped against canonical dependencies, but execution is intentionally off.
- Eligibility previews do not create queues, jobs, notification events, messages, or workflow mutations.
- No background automation engine is active.
- `apps/worker` exists as a reserved background/integration app, but it is not the current automation runtime.

### Not Started

- Executable automation rules engine.
- Background jobs/queues for workflow automation.
- Automation execution logs and retry behavior.
- Automated estimate follow-up, contract generation, deposit reminders, payment reminders, dispatch actions, or customer messages.
- Super-admin governed automation defaults beyond current platform workflow defaults and backlog direction.

## 6. Marketing / Website / SEO System

### Implemented

- Marketing route group exists in the Next.js app.
- Root marketing/investor-facing page components exist.
- Authentication stays centralized across marketing, contractor app, portal, and super admin surfaces.

### Partially Implemented

- Marketing surface exists as a lightweight public/front-door foundation, not a full growth system.
- There is no completed contractor website builder, SEO management module, campaign attribution system, or connected marketing funnel.
- Lead/opportunity intake can support downstream marketing attribution later, but the marketing system itself is not built.

### Not Started

- Contractor public website builder.
- SEO page management, metadata/content publishing workflows, and local SEO tools.
- Landing pages, forms, campaign tracking, UTM attribution, call tracking, and source attribution tied into opportunities.
- Review/reputation management.
- Marketing analytics and conversion reporting.
- Contractor-managed content/CMS workflow.

## 7. Customer App + Remote Intake System

### Implemented

- Customer portal foundation exists as the current customer-facing app surface.
- Customer-facing access is tied to canonical customer/project scope.
- Customers can review estimates, contracts, change orders, invoices, and payment state where shared.
- Lead/opportunity records support site assessment dates and requirements summary.
- Opportunity-to-estimate handoff can seed project estimating context.
- Contacts and customer contacts provide a foundation for future customer-app identity and intake continuity.

### Partially Implemented

- Remote intake exists only indirectly through opportunities, requirements summary, customer portal access, and portal commercial review workflows.
- Customer-provided measurements, photos, structured project details, and quote-request flows are not a complete product yet.
- Intake attachments have storage foundations through shared document/execution attachment patterns, but no complete customer remote-intake workflow.
- Portal is project-centered after access is granted; it is not yet a public/customer self-service intake app.

### Not Started

- Customer app for new quote requests before contractor-created access.
- Structured remote measurement intake.
- Customer photo/video upload workflow for pre-sale inspection.
- Intake questionnaires, surface-condition forms, room/area capture, and material preference flows.
- Customer scheduling request flow.
- Customer-visible intake-to-estimate progression before a canonical project is shared.

## 8. Visualizer Integration

### Implemented

- None. No dedicated visualizer workflow is implemented.

### Partially Implemented

- Canonical project, customer, estimate, document, and attachment foundations could support a future visualizer integration.
- Catalog items, systems, and estimate context could provide product/material metadata later.

### Not Started

- In-app floor coating visualizer.
- Customer-facing visualizer inside portal/customer app.
- Upload-photo-to-visualize workflow.
- Product/color/system selection tied to catalog items.
- Visualizer output attachment to opportunity, project, estimate, or customer records.
- External visualizer provider adapter.
- Visualizer-to-estimate line-item handoff.

## 9. Materials / Inventory System

### Implemented

- `catalog_items` is the canonical reusable cost item, sellable item master, and estimating source of truth.
- `catalog_system_components` supports reusable systems/packages and sqft scaling into estimate line items.
- `inventory_items` is an optional stock-tracking extension attached to catalog items.
- `inventory_transactions` is the auditable stock movement foundation.
- Platform and organization feature policy key `inventory_enabled` controls inventory UI behavior.
- Cost Items Database routes exist for items, systems, inventory, and settings.
- Contractor settings catalog page reuses the cost item settings component.
- Platform starter catalog seeds and organization adoption foundation exist.
- Estimate authoring sources from active catalog items and reusable systems.
- Item-level taxable behavior exists as a simple taxable flag.
- Inventory manual adjustment foundation exists through linked inventory rows and transactions.

### Partially Implemented

- `/materials` exists but is not a complete operational materials module.
- Inventory is optional and foundation-first; current contractor UI uses a default location while schema allows additional locations later.
- Inventory quantity is operational context only and does not drive pricing.
- No automatic inventory reservation or consumption occurs from estimate approval, job start, job completion, or invoicing.
- Vendor continuity, purchasing, reorder workflows, and stock planning are not complete.
- Starter catalog/inventory seeds are present but not broad enough for full go-live across epoxy, polishing, labor, equipment, and reusable assemblies.

### Not Started

- Purchase orders and receiving workflow.
- Multi-location inventory transfer workflow.
- Job material reservation and consumption.
- Waste/return workflows tied to jobs.
- Reorder recommendations and purchasing approvals.
- Vendor item catalogs and supplier price updates.
- Materials marketplace or supplier ordering.
- Inventory valuation/accounting integration.

## 10. Sales & Use Tax System

### Implemented

- Platform financial defaults.
- Organization financial settings.
- Customer tax exemption status and metadata.
- Optional `tax_codes` foundation.
- Item-level taxable flag on catalog items.
- Estimate and invoice tax calculations based on customer exemption, item taxability, and organization/platform financial defaults.
- Estimate and invoice line snapshots carry tax-related fields.
- Invoice tax, exemption, and retainage values are snapshotted for reporting history.
- Reporting-ready taxable/exempt/tax-collected foundations exist in invoice data.

### Partially Implemented

- Tax is real but intentionally simple.
- Organization/platform tax rates and item taxable flags exist, but jurisdiction/location-aware rules are not complete.
- Customer exemption handling exists, but richer exemption certificate/document workflows are not complete.
- Tax codes are advanced infrastructure, not a fully governed contractor tax-rule engine.
- No external tax provider integration is active.

### Not Started

- Jurisdiction/location-based sales and use tax rules.
- Project-location tax override logic.
- Nexus, district, local, and material/labor taxable treatment rule engine.
- Exemption certificate document lifecycle.
- Tax reporting module.
- External tax provider adapter and reconciliation.
- Super-admin starter tax rule seeding beyond current defaults.

## 11. Reporting & Analytics

### Implemented

- Dashboard command-center surface with operational metrics and queues.
- Financials Home summarizing live canonical invoices and payments.
- Module overview pages expose operational queues and summaries in several areas.
- Notifications and global search provide actionable operational visibility.
- Stored canonical records have reporting-ready lineage:
  - approved estimate snapshots
  - change-order snapshots
  - SOV lineage
  - invoice line lineage
  - payment events
  - tax snapshots
  - notification events
  - portal views
  - communication messages
  - time cards
  - daily logs

### Partially Implemented

- `/reports` route exists, but no complete reports module is implemented.
- Existing dashboards are operational entry surfaces, not a full analytics/reporting system.
- AR/AP reporting is not complete; AR has summary visibility, AP is placeholder-level.
- No report builder, saved reports, scheduled reports, or export/report catalog exists.
- Cross-module analytics are possible from canonical data but not productized.

### Not Started

- Reports manager.
- Report catalog and report definitions.
- Saved filters, saved views, exports, scheduled reports, and report delivery.
- Executive analytics, project profitability, salesperson performance, crew productivity, conversion funnel, tax reports, and inventory reports.
- Super-admin platform reporting on tenant usage, module adoption, and defaults adoption.

## 12. Documents / Legal / E-Sign / E-Notary

### Implemented

- Shared document template foundation for estimates, invoices, and contracts.
- Platform starter template seeds and contractor organization template management.
- Contract rendering from shared templates and canonical merge data.
- Draft contract editing, revision snapshot foundation, and signature-started lock behavior.
- Contract signature-state fields on canonical contracts.
- `contract_signers` for signer routing.
- Immutable `contract_signature_events`.
- Portal contract review, sign, decline, and optional contractor countersign on the same canonical contract record.
- Estimate attachments use shared `documents` bucket with organization-first paths.
- Shared document storage bucket and storage policies exist.
- Contract sent PDF snapshot fields exist as foundation.
- Compliance records and daily execution attachments include future document hooks or lightweight attachment references.

### Partially Implemented

- Document templates are real, but rich template editing and layout design are not complete.
- PDF generation and document delivery are not complete.
- E-sign workflow is implemented internally on canonical contracts, but no external e-sign provider is integrated.
- Legal document lifecycle is limited to contract templates and contract signature workflow.
- Shared files/documents routes exist as placeholders/foundations, not a full document management system.
- Forms/checklists and report output are not complete.

### Not Started

- External e-sign provider integration.
- E-notary workflow.
- Legal document library beyond current templates.
- Rich document editor/layout designer.
- PDF generation pipeline for estimates, contracts, invoices, change orders, and reports.
- Document versioning, approval routing, delivery logs, and file retention policies.
- Customer-facing document center beyond current portal review pages.

## 13. Integrations Layer

### Implemented

- `packages/integrations` exists as the shared integration boundary.
- Payment integration foundation exists through Stripe webhook route and canonical payment/payment-event handling.
- Gateway-backed payment completion, idempotency, pending payment state, and webhook handling are attached to canonical invoices/payments.
- Communication and payment integration package folders exist.
- `apps/worker` exists as a reserved background/integration app.
- Health endpoints exist for auth and Supabase.
- Centralized config/env package exists.

### Partially Implemented

- Stripe/payment gateway integration is the only meaningful live provider integration foundation.
- E-sign, tax, accounting, email/SMS, CompanyCam, QuickBooks, SignWell, Postmark, n8n, and other named integrations are not implemented as complete adapters.
- Worker app is reserved but not a fully active integration runtime.
- Integration code boundaries exist, but provider surface area remains narrow.

### Not Started

- External e-sign adapter.
- External tax provider adapter.
- Accounting sync adapter.
- Email/SMS provider adapter for production communication workflows.
- File/photo provider integrations.
- CRM/import integrations.
- Webhook management UI, provider credential management, sync logs, retries, reconciliation, and failure triage.
- Marketplace integration install/uninstall lifecycle.

## 14. SaaS Super-Admin System

### Implemented

- `/super-admin` modular configuration foundation.
- Platform admin authorization through platform role assignments separate from tenant memberships.
- Super-admin overview.
- Platform defaults.
- Platform-level financial defaults.
- Platform-level workflow defaults.
- Starter template management.
- Starter catalog seed management.
- Module controls and platform feature policy management.
- Platform admin and tenant oversight foundation.
- Tenant lifecycle/status administration foundation.
- Inventory default policy is included in platform module controls.
- Contractor organizations can adopt platform-owned starter templates/catalogs into tenant-owned copies or settings.

### Partially Implemented

- Super-admin is a real configuration foundation, not a full SaaS operations console.
- Entitlements, billing/subscriptions, usage limits, tenant health, audit, rollout governance, seed versioning, and module adoption reporting are not complete.
- Platform tax administration, automation defaults, document/layout defaults, forms/checklists seeds, reports strategy, and portal defaults are backlog items.
- Module controls exist, but core-vs-optional feature policy needs stronger product enforcement.

### Not Started

- SaaS subscription billing and plan management.
- Tenant usage metering and limits.
- Tenant support/impersonation workflow.
- Platform audit logs and admin action review.
- Platform analytics for module adoption and tenant health.
- Seed version rollout and tenant upgrade workflows.
- Full entitlement enforcement across modules.

## 15. Platform / Marketplace Layer

### Implemented

- Modular monolith architecture with shared packages for config, types, domain logic, database access, UI, and integrations.
- Feature policy foundation at platform and organization levels.
- Platform starter templates and catalog seeds.
- Contractor module controls and super-admin module controls.
- Canonical data model and lifecycle guardrails that future marketplace behavior must extend.

### Partially Implemented

- Platform extensibility exists as settings, module policy, shared packages, and starter seeds.
- Inventory feature policy is a concrete example of platform-governed module enablement.
- No full app marketplace, integration marketplace, supplier marketplace, or materials marketplace exists.
- Marketplace direction is vision/backlog only and must remain attached to the canonical customer/project/estimate/job/invoice chain.

### Not Started

- Public marketplace for suppliers, materials, financing, subcontractors, or integrations.
- Third-party app/plugin installation.
- Revenue share, marketplace billing, or listing management.
- Supplier catalog ingestion and procurement ordering.
- Contractor-facing marketplace discovery.
- Platform ecosystem governance beyond current feature policy and seed foundations.

## Cross-Layer Gap Summary

The largest current gaps are:
- Scheduling depth: current schedule foundation is real, but dispatch-grade scheduling, optimization, and automation are not complete.
- Communications depth: canonical threads/messages exist, but broader contractor/customer messaging workflows and provider-backed delivery are still early.
- Automation execution: readiness, settings, and previews exist, but no automation engine executes workflow actions.
- Directory maturity: unified Directory read model exists, but write management, vendor contacts, misc contacts, and customer self-service permissions are still future work.
- Portal permissions: linked-contact permissions are stored and partially enforced, but invoice/payment/view/quote-request and main-contact self-service behavior remain incomplete.
- Materials and inventory: cost item and inventory foundations are real, but purchasing, consumption, reservations, vendor item depth, and materials planning are not complete.
- Tax: simple tax calculation and snapshots exist, but real jurisdictional tax governance and provider integration are not started.
- Reporting: operational summaries exist, but a reports module and analytics layer are not built.
- Documents: templates and internal contract signature workflow exist, but PDF generation, rich layout, external e-sign, and e-notary are not built.
- Integrations: payment gateway foundation exists, but most external provider adapters and sync tooling are not built.
- Super-admin/SaaS: configuration foundations exist, but billing, entitlements, tenant operations, platform audit, and usage analytics are not complete.
- Marketing/customer acquisition: public marketing foundation exists, but SEO, website builder, attribution, and remote intake funnels are not built.
- Marketplace: feature policy and seeds create a platform foundation, but marketplace behavior is not started.

## Canonical Build Guidance

Future work should extend the implemented lifecycle in this order of safety:

1. Strengthen the canonical project-centered chain already in production.
2. Deepen scheduling, communications, automation, materials, tax, reporting, and documents as extensions of canonical records.
3. Add provider integrations through adapters that attach provider state and events to canonical records.
4. Expand portal/customer app behavior through scoped access to shared records, never portal copies.
5. Expand platform/marketplace behavior only when it reinforces the same lifecycle instead of creating a detached product.

Do not create:
- duplicate customer/contact models
- portal-only project, contract, invoice, payment, or change-order records
- signed-document systems detached from canonical contracts
- checkout/payment systems detached from canonical invoices/payments
- schedule-only work records detached from jobs/projects
- reporting shadow tables that become business truth
- marketplace order or materials flows detached from projects, jobs, invoices, and catalog items
