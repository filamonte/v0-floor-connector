# Developer Source Of Truth

Status: Stable
Doc Type: Governance

## PURPOSE

This file is the primary entry point for all development.

You must:

- Read this file first
- Follow all rules strictly
- Do not rely on prior chat context

---

## CORE RULES (NON-NEGOTIABLE)

- Do NOT break schema, workflows, calculations, or financial logic
- Project is the core operational object
- No duplicate records across core entities
- Canonical lifecycle must remain intact

Opportunity -> Customer -> Project -> Estimate -> Contract -> Change Order -> Job -> Invoice -> Payment

Lead and intake language may appear in older or broader planning docs, but implementation work should treat `opportunity` as the canonical pre-customer commercial record unless a task explicitly scopes otherwise.

---

## Financial Guardrails

- Invoices require valid billing triggers.
- Invoices must be tied to real scope; no freeform or disconnected billing.
- Approved scope is not automatically billable.
- Invoices are money owed; payments are money collected.
- Change orders extend the same financial chain.

---

## CONTEXT-AWARE CREATION (REQUIRED)

- Project context → auto-linked
- Customer context → must attach/select project
- Global context → must select customer + project

Applies to:

- estimates
- jobs
- invoices
- contracts

---

## NAMING CONVENTIONS (REQUIRED)

Use consistent page terminology across the system:

- `/<resource>` routes = `<Resource> Manager Page`
- Record detail pages = `<Resource> Workspace`
- Focused editing surfaces = `<Resource> Editor`
- Top-level create flows = `<Resource> Quick-Create`
- Nested create flows = `Inline <Resource> Quick-Create`

Do not introduce alternate naming such as:

- page
- screen
- edit page
- form

Consistency here is required for:

- developer communication
- Codex prompts
- documentation alignment

---

## SYSTEM MAP

Core:

- docs/developer-source-of-truth.md
- docs/current-state.md
- docs/platform-maturity.md
- docs/module-status.md
- docs/known-gaps.md
- docs/workflows.md
- docs/Roadmap.md
- docs/architecture-principles.md
- docs/canonical-lifecycle.md
- docs/adr/README.md

UI:

- docs/ui-system.md
- docs/floorconnector-ui-build-rules.md
- docs/v0-ui-cleanup-brief-header-project-estimate.md

Execution:

- docs/chat-handoff.md
- docs/ai/README.md
- docs/documentation-standards.md

---

## HOW TO WORK

1. Read this file
2. Read current-state.md + workflows.md
3. Follow rules strictly
4. Ask if anything is unclear

---

## ACTIVE DIRECTION

- Improve UI clarity (no system logic changes)
- Treat Estimates as the contractor app's UI/workflow reference pattern for proposal-first record workspaces
- Treat Guided/Flexible/Manual workflow guidance as configurable presentation, not a data-model or enforcement escape hatch
- Treat the Golden Workflow Demo Path as the repeatable QA spine through the existing canonical chain, not as permission for demo-only records or disconnected shortcuts
- Treat [docs/enterprise-ux-consolidation.md](C:/FloorConnector/docs/enterprise-ux-consolidation.md) as the ownership and density guide for customer/contact/access/review surfaces: People owns access management through a filtered access console with one selected management panel, Customer owns account summary, Project owns operational state, Estimate/Contract/Invoice own their immediate business review, Portal stays customer-safe, and record right rails must stay supportive instead of becoming a second full page
- Treat portal/customer Golden Workflow QA as a real-auth, real-grant smoke path. Portal checks must use a valid portal customer session backed by canonical `portal_access_grants` and `portal_project_access`; `/login`, accidental 404s, access-denied pages, or missing fixtures are not successful portal QA unless intentionally asserted as the expected unauthorized result
- Treat customer portal access as contact-centered for new contractor-created invites: the customer account is the business relationship, the customer contact is the person, Supabase Auth proves identity, `portal_access_grants` authorize access, and `portal_project_access` scopes visible projects. Project visibility is explicit per customer contact; do not silently grant every contact the primary contact's projects. Null-contact grants are legacy compatibility only.
- Treat lead/customer intake as the source of the primary customer contact: when a flow captures the first customer person with a customer, project, or opportunity, it should create or link the canonical `contacts` and `customer_contacts` rows and mark that relationship primary where existing schema supports it. Do not treat `customers.email` or `customers.phone` as a replacement person model; those account fields remain compatibility and commercial fallback fields.
- Treat portal invite email as delivery only: app-managed invite tokens remain the portal acceptance path, Supabase Auth remains the identity layer, and branded provider email is sent or resent only when configuration and activation guard allow it. Missing/locked provider email must show truthful no-send status plus copy-link fallback.
- Treat portal account onboarding as Supabase-authenticated and customer-owned: invite links should guide the invited contact to signup, sign-in, or password reset with a safe return path, and contractors must not set permanent customer portal passwords. The implemented temporary credential support is a server-side, owner/admin-only fallback that creates or updates a real Supabase Auth user, shows the generated temporary password once, stores only audit/status fields, and forces the portal customer through `/update-password` before continuing.
- Do not let portal-only customer auth returns bootstrap contractor tenant ownership. Contractor app users use the company setup/bootstrap path; portal customers use Supabase Auth plus explicit `portal_access_grants` and `portal_project_access`.
- Use `pnpm e2e:portal-fixture` to validate the stable portal customer fixture. Write mode requires `FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE=1` plus `-- --write` and may only create canonical dev/test fixture records; it must not create portal-only records, print secrets, fake signature/payment success, or bypass portal access grants
- Use [docs/paid-early-access-plan.md](C:/FloorConnector/docs/paid-early-access-plan.md) before paid early-access work. The Phase 2.1 operating layer surfaces founder tenant setup/activation state and platform-admin-entered billing evidence in `/super-admin/early-access`; Phase 2.2 adds a test-mode-only FloorConnector SaaS subscription Checkout Session bridge from `/setup/billing`; Phase 2.3 adds a signed SaaS-only Stripe webhook reconciliation route for `billing_domain=floorconnector_saas` events; Phase 2.4 adds durable platform Billing Operations at `/super-admin/billing` for SaaS configuration health, Checkout readiness, webhook health, subscription references, manual evidence, and activation separation; Phase 2.5 adds non-secret `platform_billing_settings` and a platform-admin-only, test-mode-only Stripe Product/recurring Price create-or-discover action. Early access should remain a temporary commercial/readiness phase rather than the long-term billing IA. Use [docs/stripe-saas-billing-runbook.md](C:/FloorConnector/docs/stripe-saas-billing-runbook.md) for test-mode Product/Price setup, webhook endpoint setup, and replay. Live subscription launch, automatic activation, entitlement enforcement, and Stripe Customer Portal still require dedicated approved implementation slices.
- Keep AI-assistance preferences separate from workflow guidance; AI must not own source of truth or take autonomous customer-facing, financial, legal, scheduling, permission, or signature actions
- Enforce context-aware creation
- Strengthen project-centered operational continuity

---

## FUTURE PUBLIC ACQUISITION / AI / COMMUNICATIONS / SCHEDULING GUARDRAILS

Future public acquisition, contractor websites, marketing attribution, AI, communications, intake, calendar, scheduling, voice, and onboarding work must preserve these rules:

- Contractor websites, tenant-owned domains, landing pages, SEO/service/location pages, public forms, campaign attribution, reviews, galleries, portals, communications, and operational workflows must reinforce the same canonical workflow graph.
- Target public acquisition continuity is `public acquisition -> opportunity -> customer -> project -> estimate -> contract -> payment -> scheduling -> execution -> follow-up`.
- Do not create duplicate marketing/contact databases, website-only lead stores, portal-only customer copies, disconnected website systems, or separate AI knowledge silos.
- AI is an operating layer, not a parallel system.
- AI actions must route through canonical server-side workflows, validated inputs, tenant isolation, permissions, and readiness gates.
- Do not create duplicate AI-specific business models such as AI-only leads, customers, estimates, projects, calendars, communication logs, invoices, or payments.
- Communications attach to canonical records such as opportunity, customer, project, estimate, contract, change order, job, invoice, and payment where appropriate.
- FloorConnector owns the canonical schedule; external calendars may mirror, sync, import busy blocks, or deliver invites.
- External providers such as Google Calendar, Outlook/Microsoft 365, email/SMS providers, web chat, and AI voice are adapters/integrations, not business sources of truth.
- Human confirmation is required for risky actions unless a later explicitly approved workflow configures low-risk automation.

Planning docs:

- [docs/ai-assisted-operating-system.md](C:/FloorConnector/docs/ai-assisted-operating-system.md)
- [docs/ai-contractor-workflows.md](C:/FloorConnector/docs/ai-contractor-workflows.md)
- [docs/communications-and-ai-intake.md](C:/FloorConnector/docs/communications-and-ai-intake.md)
- [docs/calendar-and-scheduling-intelligence.md](C:/FloorConnector/docs/calendar-and-scheduling-intelligence.md)
- [docs/ai-marketing-and-onboarding.md](C:/FloorConnector/docs/ai-marketing-and-onboarding.md)

These are target direction only unless [docs/current-state.md](C:/FloorConnector/docs/current-state.md) says a capability is implemented.

---

## ↓ EXISTING SYSTEM DETAILS BELOW (DO NOT IGNORE)

Legacy note: this file remains the primary implementation guardrail document.

Use this file as the primary developer entry point and short guardrail summary for FloorConnector. It does not replace the deeper docs. It exists to reduce prompt drift and keep implementation work aligned with the current branch reality.

Use these docs together:

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md): primary development entry point and guardrails
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): implemented truth
- [docs/product-brain.md](C:/FloorConnector/docs/product-brain.md): high-signal product memory and anti-drift rules
- [docs/decisions.md](C:/FloorConnector/docs/decisions.md): compact log of branch-level product and architecture decisions
- [docs/build-sequence.md](C:/FloorConnector/docs/build-sequence.md): practical build-order guidance
- [docs/codex-workflow.md](C:/FloorConnector/docs/codex-workflow.md): reusable planning-first Codex operating mode
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): target platform architecture
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): platform maturity roadmap
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md): target sales and commercial workflow
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md): target contractor app information architecture
- [docs/site-visit-scope-intake-plan.md](C:/FloorConnector/docs/site-visit-scope-intake-plan.md): Scope Intake planning guardrails between site visit and estimate planning
- [docs/estimate-builder-build-plan.md](C:/FloorConnector/docs/estimate-builder-build-plan.md): long-term Estimate Builder blueprint
- [docs/estimate-builder-v1-scope.md](C:/FloorConnector/docs/estimate-builder-v1-scope.md): current Estimate Builder execution scope
- [docs/estimate-builder-system-generation-spec.md](C:/FloorConnector/docs/estimate-builder-system-generation-spec.md): future system-generation planning detail
- [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md): canonical UI standardization and interaction guardrails
- [docs/ui-data-model-alignment-backlog.md](C:/FloorConnector/docs/ui-data-model-alignment-backlog.md): planning backlog for UI, directory/contact, tax, Estimate Editor, project-address, and workflow-guidance alignment
- [docs/golden-workflow-demo-path.md](C:/FloorConnector/docs/golden-workflow-demo-path.md): Phase 1 demo/QA spine for the existing canonical sales-to-production path
- [docs/enterprise-ux-consolidation.md](C:/FloorConnector/docs/enterprise-ux-consolidation.md): customer/contact/access/review ownership and progressive-disclosure cleanup map
- [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md): doc maintenance and archival rules

## What Is Implemented Now

The current branch already includes a real multi-tenant contractor app with:

- Supabase-backed auth and organization bootstrap
- organization and membership model
- opportunities / leads
- customers
- projects
- estimates and line items
- approved estimate snapshot and customer approval flow
- change orders
- contracts
- contract-signature foundation, customer-facing portal signing, and contractor-side onsite signing on the canonical contract record
- jobs
- appointments linked to the same lead/customer/project chain
- invoices and payments
- snapshot-based invoice lineage across estimate, SOV, change-order, and invoice-only sources
- contractor-side progress billing / schedule-of-values workflow on the canonical estimate and invoice chain
- notifications, notification deliveries, and communication thread/message foundations
- customer-facing payment foundation on the canonical invoice/payment chain
- dedicated contractor-side payments manager surface on the shared Manager Page system
- dedicated contractor-side schedule manager surface on the shared Manager Page system
  - review-first summary, Scheduling command center, Ready work queue, Scheduled timeline, selected job action panel, crew-state continuity, week/day planner views, and a retained date-grouped board all stay on the same canonical job chain
- shared contractor-side global search at the shell level
  - searches canonical tenant-scoped records including appointments, routes back into real workspaces, and is rendered in the shared shell footer rather than the top header
- first real contractor-side notifications in the shared shell and dashboard
  - derive high-signal attention from canonical jobs, invoices, contracts, appointments, punchlists, progress-billing state, estimate customer activity, and communication activity
  - are backed by stored canonical notification records and delivery tracking
- people, vendors, and compliance foundations
- time tracking foundations
- daily logs, field notes, and execution attachments
- punchlist items on the shared project/job execution chain
- customer portal access, review, and contract-signature workflows
- shared templates
- reusable catalog / cost item database foundations on canonical `catalog_items`, including estimate-side active catalog item insertion through server-owned line-item snapshots
- shared commercial numbering through the existing workflow settings model
- Quick-Create -> canonical record -> `<Resource> Workspace` pattern across core contractor Manager Pages
- first shared universal-create launcher in the contractor shell and dashboard
- denser contractor dashboard command-center surface:
  - compact operational metrics
  - modular commercial, operations, and finance queue widgets
  - dashboard-local Quick-Create studio using canonical short-form create flows
- first-pass job scheduling and crew assignment foundation
- early module-dashboard pattern on top of the shared Manager Page system
- contractor settings / admin
- super-admin configuration foundations

Treat [docs/current-state.md](C:/FloorConnector/docs/current-state.md) as the source of truth for implemented status.

Estimate Builder implementation should follow [docs/estimate-builder-v1-scope.md](C:/FloorConnector/docs/estimate-builder-v1-scope.md) for current build scope. [docs/estimate-builder-build-plan.md](C:/FloorConnector/docs/estimate-builder-build-plan.md) is the long-term blueprint. Do not implement future Estimate Builder phases unless explicitly requested.

## What Is Target Architecture Only

These docs describe target direction, not current implementation truth:

- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md)
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md)
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)

Do not describe target-only capabilities as already implemented unless [docs/current-state.md](C:/FloorConnector/docs/current-state.md) says they exist on the current branch.

## Current Preferred Business Workflow

The current canonical lifecycle is:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Important workflow rules:

- projects should become the operational hub over time
- the current contractor app may still use parallel top-level routes during that transition
- contracts, invoices, and estimates must stay connected through the shared canonical model
- canonical `customers` remain the commercial and financial customer/account record even if a broader contractor `Directory` view is introduced later
- estimate send, invoice recipient, contract customer context, payment customer context, and project ownership must continue to read from canonical customer/account fields unless a later approved customer-contact permission model explicitly changes a specific flow
- People is the contractor-side management home for identity/contact/workforce/relationship administration, including related customer contacts, portal invite status, contact-permission readiness, and per-contact project visibility
- estimate, contract, and invoice workflows may trigger or verify portal access when sending, signing, reviewing, or paying, but they must not become separate portal identity or permissions management surfaces
- portal access remains canonical through `portal_access_grants` and `portal_project_access`; do not introduce portal-only contacts, duplicate customer models, or module-specific invite/access tables
- additional customer contacts remain related contacts beneath a canonical customer account; they do not replace the account record
- all downstream financial systems must use immutable approved snapshots as their billing source of truth
- do not use live `estimate_line_items` as a billing source
- change orders must extend the same shared project, contract, and invoice chain rather than introducing a separate scope-change model
- change orders are append-only commercial scope changes; they do not mutate prior approved snapshot lineage
- customer estimate approval is canonical portal behavior; the contractor Estimate Review page may also record an explicit manual/offline estimate decision from draft or sent estimates through the shared status-transition action when scoped by the existing tenant and workflow guards, for cases such as paper signature, verbal approval, fake email during testing, non-portal customers, or workflow testing before send-mail and portal delivery are complete
- customer-facing portal signature actions and contractor-side onsite signature actions now attach to the same canonical contract record used in the contractor app
- onsite contract signing is a contractor-app interaction surface on the canonical contract signature system, not a separate workflow or model; it must reuse `contracts`, `contract_signers`, and `contract_signature_events`
- do not introduce alternate onsite contract records, signed-document records, deposit records, payment records, or portal-only signature copies for onsite signing
- customer-facing payment workflow foundations now attach to the same canonical invoice/payment chain used in the contractor app
- templates are shared infrastructure across estimates, contracts, and invoices
- future Templates & Systems administration should centralize document templates, System Templates, add-ons/options, and sharing/review settings instead of scattering those controls across estimate, invoice, contract, and catalog surfaces
- document template defaults should be copied into contractor-owned templates; platform defaults must not silently mutate contractor local copies
- customer-facing estimate, contract, and invoice print/save PDF views must remain renderings of canonical records; do not turn them into duplicate estimate, contract, invoice, signature, payment, or portal-only document records
- records should flow forward instead of being recreated downstream
- future Takeoff & Scope Intelligence must be project-scoped and feed the canonical estimate workflow; it must not become a separate estimating silo
- Scope Intake is the lead/site-visit support stage for measurements, conditions, observations, photos/files, logistics, and notes; it must feed reviewed estimate planning rather than creating direct intake-to-invoice behavior
- Measurements are manual inputs such as length x width, direct square footage, direct linear footage, and counts; Takeoff means plan, PDF, or drawing-based measurement; AI Capture is a future photo, app, or AI-derived measurement input method
- takeoff and measurements produce quantities; catalog/cost items define reusable cost, pricing, production, markup, and tax behavior; System Templates map quantities to grouped estimate content; estimates define customer-facing pricing and commercial scope
- Measurements, Takeoff, and AI Capture must feed the same estimate generation engine and must not create separate estimating models
- takeoff or measurement quantities must generate estimate line items through System Templates and catalog/cost item mapping, not bypass catalog logic or write directly to invoices
- generated estimate line items should retain source linkage back to approved takeoff scope items, takeoff measurements, and source documents or photos when that future layer exists
- if takeoff changes after estimate generation, the future takeoff-estimate link or estimate should be flagged out of sync until a user reviews it
- AI-assisted takeoff, measurement, area, system, scope, cost-item mapping, and estimate-draft suggestions must remain reviewable and user-approved before becoming customer-facing estimate content
- takeoff quantities may inform material requirements, labor estimation, production readiness, and job planning only through the canonical estimate-to-job workflow, not through direct billing shortcuts
- future contractor network collaboration must extend canonical projects, jobs, vendors, people, invoices, and payments rather than creating a separate social, marketplace, or partner-work data silo
- contractor network communication should be record-based over free-floating chat, with messages tied to projects, jobs, change orders, invoices, daily logs, field notes, or other canonical workflow records
- project detail is the primary workflow/readiness hub for the connected contractor flow
- project detail should lead with a command-center summary and connected-record lanes that summarize existing canonical records and route editing to the appropriate estimate, contract, change-order, invoice, job/schedule, daily-log, or People workspace
- Estimate Workspace, Contract Workspace, Invoice Workspace, and Job Workspace surfaces should use one shared Record Workspace pattern and point back to the project hub when broader workflow state matters
- invoice detail should be treated as review-first in layout direction, even when edit controls remain available
- the first major contractor workspace UI normalization pass is complete enough to stop; remaining issues should be treated as normal iterative polish rather than structural layout-system repair
- the contractor shell now uses top-level navigation as the primary app navigation, with a wider workspace, integrated breadcrumb/page-context header row, and command-bar-driven Manager Pages
- dashboard, projects, leads, invoices, contracts, customers, estimates, daily logs, time, people, vendors, and jobs now follow that newer Manager Page surface direction; avoid reintroducing a full-time left sidebar as the primary navigation model
- the protected contractor app now shares the accepted Graphite & Copper visual foundation across the shell, Manager Pages, Quick-Create surfaces, and common cards; do not reintroduce blue-heavy overview chrome on new or updated contractor pages
- dashboards are entry surfaces into the same lifecycle, not separate product worlds
- Quick-Create must create canonical records first and then route into the relevant `<Resource> Workspace`
- creation must remain context-aware: project-launched creation auto-links the project, customer-launched creation requires project selection or creation, and global creation requires explicit customer and project selection
- global search should stay shell-level, tenant-safe, and canonical-record-based; do not invent search-only records, search-only summaries, or disconnected module search systems
- scheduling depth should stay on the canonical job model; add planner, command-center, action-panel, or calendar UI on `/schedule`, but do not invent schedule-only records or a disconnected dispatch subsystem
- appointments should stay as canonical visit and meeting records linked to the same opportunity/customer/project chain; do not turn them into duplicate jobs or a second dispatch model
- punchlists should stay on the canonical project/job execution chain; do not overload daily-log narrative records with durable closeout work, and do not invent a separate field-quality subsystem
- progress billing should stay on the canonical approved-estimate -> schedule-of-values -> invoice chain; do not invent a detached pay-app subsystem, spreadsheet shadow model, or invoice-replacement billing record
- estimate line items are the only authoritative estimate item-row source; do not write new behavior against `estimates.content.itemRows`
- every `invoice_line_items` row must use one `lineage_type`
- every `schedule_of_value_items` row must use one `lineage_type`
- estimate authoring is inventory-first; do not reintroduce user-facing manual estimate rows or manual save-back-to-catalog flows
- estimate defaults should hydrate only when estimate content is initially empty, resolving platform defaults before contractor overrides and never silently reapplying after user edits
- estimate explicit save submission should validate before persist and use conflict protection against stale overwrites
- estimate tax must stay derived from organization defaults, customer exemption state, and item-level taxable flags; do not add manual estimate tax overrides
- `catalog_items` is the only canonical cost item model and the one shared item master across material, labor, service, equipment, subcontractor, other, and system records
- do not create duplicate cost item tables such as `contractor_cost_items`, module-specific catalog tables, or separate estimate/invoice/materials item masters
- estimate line items can snapshot selected active non-system catalog item data through the canonical estimate insertion path; do not bypass snapshot lineage or mutate historical records when catalog items change
- invoice catalog insertion is not general-purpose: invoices must continue to use approved estimate snapshot, SOV, approved change-order snapshot, or invoice-only lineage rather than live catalog rows
- limited catalog-backed invoice usage exists only for explicit invoice-only adjustments / manual catalog-backed rows, where `catalog_items` provide starting snapshot values without becoming approved-scope invoice billing
- future catalog/cost item markup should be treated as internal cost/profitability behavior: defaults can come from the item database, estimate-level overrides can be intentional, and customer-facing estimate output should not expose markup controls
- future catalog/cost item defaults for cost, markup, price, labor, production, and tax behavior are internal; customer-facing estimate output should show customer-facing description, quantity, unit price, and total only
- one-off estimate-line price overrides should not mutate catalog defaults, catalog updates should affect future estimates only, imported estimate lines should preserve snapshot price/markup/override behavior, and past estimates should not mutate when catalog defaults change
- systems remain canonical reusable assemblies on top of `catalog_items`, with component rows designed to scale by sqft into estimate line items; future System Templates should extend that direction with formulas, grouping rules, optional components, and required inputs
- add-ons/options should be catalog-backed optional scope modifiers, not separate mini-workflows; cove base is a hybrid catalog item plus optional system/add-on component, not a standalone floor system
- future labor modeling should live as internal catalog/cost item behavior with production assumptions and multipliers hidden from customer-facing output unless intentionally surfaced as scope language
- estimate attachments should stay on the shared `documents` bucket using organization-first storage paths
- general print/save PDF routes currently render canonical estimate, contract, and invoice data on demand. Portal print routes may show safe contractor organization branding only after portal record access is scoped. Stored document/version management, provider delivery, and a full document manager remain future work unless explicitly scoped.
- future UI/data-model alignment work should follow [docs/ui-data-model-alignment-backlog.md](C:/FloorConnector/docs/ui-data-model-alignment-backlog.md): standardize module-page defaults before customizable views, avoid duplicate contact models, keep project/service address distinct from customer billing/contact address, manage tax rates from settings/super admin rather than project detail, and keep customer-facing estimate output free of internal cost, markup, margin, and profitability controls

## Current Contractor UI Guardrails

Treat the current contractor UI direction as implementation guardrail, not loose preference.

Use [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md) as the canonical UI standardization document before changing contractor app pages.

Do:

- keep top-level navigation as the primary contractor app navigation
- keep the contractor shell flat and unified: top navigation with integrated breadcrumb/page context, thin command/search strip, then workspace
- treat the dashboard as the visual reference for contractor Manager Page surfaces
- use the current contractor theme direction consistently:
  - Graphite for primary chrome, headers, and strong navigation
  - Copper for primary actions, save actions, and intentional action emphasis
  - white or warm light-neutral surfaces for working areas
  - tighter, practical typography and spacing over roomy marketing-style composition
- treat the dashboard as an operational command center, not as a light stats page and not as a separate module world
- build Manager Pages around page identity, command bar, and overview/list workspace
- use shared composer-sheet or modal patterns for create flows on Manager Pages
- prefer Quick-Create overlays that capture only minimum required fields, create the canonical record, and then route into the relevant `<Resource> Workspace`
- use the Estimate Workspace as the tuning fork for shared Record Workspace rhythm: header band, truthful next action, workflow summary, customer/project context, connected record rail, and internal follow-through below the primary record work
- treat module dashboards as operational entry surfaces with summary, queues, create entry, and continuity links back to shared records
- keep change orders canonical and workflow-linked: contractor authoring, portal approval, and downstream invoice impact must stay on the same shared record chain
- reserve left-side rails for contextual deeper-screen navigation only when they materially help

Do not:

- do not return to a full-time left sidebar as the primary contractor navigation
- do not reintroduce blue page bands, blue-heavy command bars, or blue-accented Manager Page chrome on contractor surfaces
- do not reintroduce dense stacked-panel dashboards as the main contractor dashboard pattern
- do not leave permanently open Quick-Create surfaces on contractor Manager Pages
- do not let Manager Pages drift back into mixed old/new command-bar or chrome patterns
- do not treat dashboard and Manager Pages as separate visual systems
- do not try to complete full record authoring inside a Manager Page Quick-Create overlay
- do not implement change orders as report-only artifacts, detached approvals, or portal-only records
- do not build direct takeoff-to-invoice behavior or customer-facing AI takeoff output that bypasses human-reviewed estimate line items
- do not let module dashboards become separate module apps with their own private worldview
- do not build module-local queues or summaries that hide the shared project and record chain
- do not let universal create become a siloed draft system or tool menu disconnected from canonical records
- do not build an open contractor social feed, broad contractor-to-contractor chat, or open marketplace behavior as part of communications or portal work

The contractor UI baseline is now established enough that future contractor-page work should start from this system by default rather than reopening normalization decisions page by page.
The normalization phase is complete enough to stop; further contractor-page work should be treated as baseline-preserving feature work or targeted polish unless a real system-level mismatch appears.

## Current Preferred Implementation Style

- use canonical shared data only
- do not create module-specific data silos
- do not create a standalone takeoff/estimating app disconnected from projects, catalog/cost items, and canonical estimates
- do not create duplicate project, estimate, catalog, cost item, invoice, template, or takeoff-specific commercial models for future takeoff or estimate-generation behavior
- do not create module-specific catalog or cost item silos; extend canonical `catalog_items` and snapshot from it where downstream workflows need immutable commercial history
- do not create module-specific template or add-on silos for estimates, invoices, contracts, proposals/SOW, work orders, or System Templates
- do not create marketplace models, contractor-network models, or partner-work models until scoped collaboration, permissions, tenant isolation, and canonical ownership are designed
- treat `Directory` as a unified view over canonical records, not as a new merged record model
- keep workforce `people`, customer accounts, vendors, leads, and super-admin identities separate at the data-model level even if future contractor UI groups them more closely
- keep business logic in shared packages or server-side utilities where practical
- preserve tenant isolation everywhere
- preserve tenant isolation and canonical workflow continuity for future takeoff records, documents, measurements, scope items, and estimate links
- preserve source traceability from generated estimate lines back to System Template, measurement/takeoff input, and source file/photo where applicable; if inputs change after generation, future behavior should flag generated estimate content as out of sync or needing review
- preserve explicit permissioning for future contractor network features: no contractor can browse another contractor's customers, projects, pricing, pipeline, files, or payment history
- hide customer contact data and pricing by default for external collaborators unless the contractor organization explicitly grants visibility for that project, job, or record
- share files intentionally, scope project/job access explicitly, and keep admin controls around inviting external collaborators
- use real Supabase-backed persistence for canonical workflows
- preserve snapshot lineage in financial flows; do not bypass approved estimate snapshots, SOV lineage, or approved change-order snapshots when adding downstream billing behavior
- all execution workflows MUST pass `assertProjectReadinessGate`
- do not bypass project readiness with module-specific logic
- all future execution-related features must enforce the same centralized readiness gate
- keep current route architecture unless the task explicitly calls for route changes
- prefer small, reviewable changes over broad rewrites
- when refining contractor UI, prefer the shared workspace pattern over one-off page layouts
- for contractor Manager Pages, prefer the newer top-nav manager pattern: clear page identity, command bar, wide workspace, overview/list-first composition, and contextual secondary navigation only when it truly helps
- preserve the shared lifecycle language: continuity over silos, project/record chain over module isolation, and Quick-Create over local-only scaffolding
- use the UI/data-model alignment backlog as planning context for demo-polish tasks, especially Estimate Editor navigation/review actions, project service-address display, line taxable-toggle planning, module-page consistency, directory/contact unification, tax settings/rates direction, and workflow guidance

## Documentation Update Rules

When implementation changes, update docs in the same task when relevant:

- [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for implemented capabilities
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md) for phase sequencing changes
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md) for architecture-boundary changes
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md) for target commercial workflow changes
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md) for target contractor app structure changes
- [README.md](C:/FloorConnector/README.md) for setup or high-level capability changes

## Docs To Treat Carefully

Do not casually edit these as if they were status notes:

- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md)
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md)
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)
- [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md)

These define target direction or documentation policy and should only change when that direction or policy actually changes.

## Archival Rule

Old docs should be archived, not left in active docs where they can silently compete with current guidance.

Follow [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md):

- keep active docs current
- archive superseded or historical docs under `docs/archive/`
- prefer archiving over deletion when older context may still be useful
