# Developer Source Of Truth

Status: implementation guardrail document.

Use this file as the short developer-facing summary of what to trust when building in FloorConnector. It does not replace the deeper docs. It exists to reduce prompt drift and keep implementation work aligned with the current branch reality.

Use these docs together:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): implemented truth
- [docs/product-brain.md](C:/FloorConnector/docs/product-brain.md): high-signal product memory and anti-drift rules
- [docs/decisions.md](C:/FloorConnector/docs/decisions.md): compact log of branch-level product and architecture decisions
- [docs/build-sequence.md](C:/FloorConnector/docs/build-sequence.md): practical build-order guidance
- [docs/codex-workflow.md](C:/FloorConnector/docs/codex-workflow.md): reusable planning-first Codex operating mode
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): target platform architecture
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): phased implementation plan
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md): target sales and commercial workflow
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md): target contractor app information architecture
- [docs/estimate-builder-build-plan.md](C:/FloorConnector/docs/estimate-builder-build-plan.md): long-term Estimate Builder blueprint
- [docs/estimate-builder-v1-scope.md](C:/FloorConnector/docs/estimate-builder-v1-scope.md): current Estimate Builder execution scope
- [docs/estimate-builder-system-generation-spec.md](C:/FloorConnector/docs/estimate-builder-system-generation-spec.md): future system-generation planning detail
- [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md): canonical UI standardization and interaction guardrails
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
- contract-signature foundation and customer-facing contract signing on the canonical contract record
- jobs
- appointments linked to the same lead/customer/project chain
- invoices and payments
- snapshot-based invoice lineage across estimate, SOV, change-order, and invoice-only sources
- contractor-side progress billing / schedule-of-values workflow on the canonical estimate and invoice chain
- notifications, notification deliveries, and communication thread/message foundations
- customer-facing payment foundation on the canonical invoice/payment chain
- dedicated contractor-side payments manager surface on the shared manager-page system
- dedicated contractor-side schedule manager surface on the shared manager-page system
  - review-first summary, next actions, crew-state continuity, week/day planner views, and a retained date-grouped board all stay on the same canonical job chain
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
- reusable catalog foundations
- shared commercial numbering through the existing workflow settings model
- quick-create -> canonical record -> full workspace pattern across core contractor manager pages
- first shared universal-create launcher in the contractor shell and dashboard
- denser contractor dashboard command-center surface:
  - compact operational metrics
  - modular commercial, operations, and finance queue widgets
  - dashboard-local quick-create studio using canonical short-form create flows
- first-pass job scheduling and crew assignment foundation
- early module-dashboard pattern on top of the shared manager-page system
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

The preferred connected business path is:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Important workflow rules:
- projects should become the operational hub over time
- the current contractor app may still use parallel top-level routes during that transition
- contracts, invoices, and estimates must stay connected through the shared canonical model
- canonical `customers` remain the commercial and financial customer/account record even if a broader contractor `Directory` view is introduced later
- estimate send, invoice recipient, contract customer context, payment customer context, and project ownership must continue to read from canonical customer/account fields unless a later approved customer-contact permission model explicitly changes a specific flow
- additional customer contacts remain related contacts beneath a canonical customer account; they do not replace the account record
- all downstream financial systems must use immutable approved snapshots as their billing source of truth
- do not use live `estimate_line_items` as a billing source
- change orders must extend the same shared project, contract, and invoice chain rather than introducing a separate scope-change model
- change orders are append-only commercial scope changes; they do not mutate prior approved snapshot lineage
- customer estimate approval is canonical portal behavior, not a contractor-side override shortcut
- customer-facing signature actions now attach to the same canonical contract record used in the contractor app
- customer-facing payment workflow foundations now attach to the same canonical invoice/payment chain used in the contractor app
- templates are shared infrastructure across estimates, contracts, and invoices
- records should flow forward instead of being recreated downstream
- future Takeoff & Scope Intelligence must be project-scoped and feed the canonical estimate workflow; it must not become a separate estimating silo
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
- estimate, contract, invoice, and job pages should use one shared record-workspace pattern and point back to the project hub when broader workflow state matters
- invoice detail should be treated as review-first in layout direction, even when edit controls remain available
- the first major contractor workspace UI normalization pass is complete enough to stop; remaining issues should be treated as normal iterative polish rather than structural layout-system repair
- the contractor shell now uses top-level navigation as the primary app navigation, with a wider workspace, integrated breadcrumb/page-context header row, and command-bar-driven manager pages
- dashboard, projects, leads, invoices, contracts, customers, estimates, daily logs, time, people, vendors, and jobs now follow that newer manager-surface direction; avoid reintroducing a full-time left sidebar as the primary navigation model
- the protected contractor app now shares one warmer charcoal/orange/light-neutral UI direction across the shell, manager pages, quick-create surfaces, and common cards; do not reintroduce blue-heavy overview chrome on new or updated contractor pages
- dashboards are entry surfaces into the same lifecycle, not separate product worlds
- quick create must create canonical records first and then route into the full workspace
- global search should stay shell-level, tenant-safe, and canonical-record-based; do not invent search-only records, search-only summaries, or disconnected module search systems
- scheduling depth should stay on the canonical job model; add planner or calendar UI on `/schedule`, but do not invent schedule-only records or a disconnected dispatch subsystem
- appointments should stay as canonical visit and meeting records linked to the same opportunity/customer/project chain; do not turn them into duplicate jobs or a second dispatch model
- punchlists should stay on the canonical project/job execution chain; do not overload daily-log narrative records with durable closeout work, and do not invent a separate field-quality subsystem
- progress billing should stay on the canonical approved-estimate -> schedule-of-values -> invoice chain; do not invent a detached pay-app subsystem, spreadsheet shadow model, or invoice-replacement billing record
- estimate line items are the only authoritative estimate item-row source; do not write new behavior against `estimates.content.itemRows`
- every `invoice_line_items` row must use one `lineage_type`
- every `schedule_of_value_items` row must use one `lineage_type`
- estimate authoring is inventory-first; do not reintroduce user-facing manual estimate rows or manual save-back-to-catalog flows
- estimate defaults should hydrate only when estimate content is initially empty, resolving platform defaults before contractor overrides and never silently reapplying after user edits
- estimate autosave should validate before persist and use conflict protection against stale overwrites
- estimate tax must stay derived from organization defaults, customer exemption state, and item-level taxable flags; do not add manual estimate tax overrides
- `catalog_items` remains the one shared item master across material, labor, service, equipment, and system records; do not introduce a second inventory or labor model
- future catalog/cost item markup should be treated as internal cost/profitability behavior: defaults can come from the item database, estimate-level overrides can be intentional, and customer-facing estimate output should not expose markup controls
- future catalog/cost item defaults for cost, markup, price, labor, production, and tax behavior are internal; customer-facing estimate output should show customer-facing description, quantity, unit price, and total only
- one-off estimate-line price overrides should not mutate catalog defaults, catalog updates should affect future estimates only, imported estimate lines should preserve snapshot price/markup/override behavior, and past estimates should not mutate when catalog defaults change
- systems remain canonical reusable assemblies on top of `catalog_items`, with component rows designed to scale by sqft into estimate line items; future System Templates should extend that direction with formulas, grouping rules, optional components, and required inputs
- estimate attachments should stay on the shared `documents` bucket using organization-first storage paths

## Current Contractor UI Guardrails

Treat the current contractor UI direction as implementation guardrail, not loose preference.

Use [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md) as the canonical UI standardization document before changing contractor app pages.

Do:
- keep top-level navigation as the primary contractor app navigation
- keep the contractor shell flat and unified: top navigation with integrated breadcrumb/page context, thin command/search strip, then workspace
- treat the dashboard as the visual reference for contractor manager surfaces
- use the current contractor theme direction consistently:
  - charcoal or dark-neutral framing
  - orange for actions, emphasis, and identity
  - white or warm light-neutral surfaces for working areas
  - tighter, practical typography and spacing over roomy marketing-style composition
- treat the dashboard as an operational command center, not as a light stats page and not as a separate module world
- build manager pages around page identity, command bar, and overview/list workspace
- use shared composer-sheet or modal patterns for create flows on manager pages
- prefer quick-create overlays that capture only minimum required fields, create the canonical record, and then route into the full record workspace
- treat module dashboards as operational entry surfaces with summary, queues, create entry, and continuity links back to shared records
- keep change orders canonical and workflow-linked: contractor authoring, portal approval, and downstream invoice impact must stay on the same shared record chain
- reserve left-side rails for contextual deeper-screen navigation only when they materially help

Do not:
- do not return to a full-time left sidebar as the primary contractor navigation
- do not reintroduce blue page bands, blue-heavy command bars, or blue-accented manager-page chrome on contractor surfaces
- do not reintroduce dense stacked-panel dashboards as the main contractor dashboard pattern
- do not leave permanently open create forms on contractor manager pages
- do not let manager pages drift back into mixed old/new command-bar or chrome patterns
- do not treat dashboard and manager pages as separate visual systems
- do not try to complete full record authoring inside a manager-page quick-create overlay
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
- do not create duplicate project, estimate, catalog, invoice, template, or takeoff-specific commercial models for future takeoff or estimate-generation behavior
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
- keep current route architecture unless the task explicitly calls for route changes
- prefer small, reviewable changes over broad rewrites
- when refining contractor UI, prefer the shared workspace pattern over one-off page layouts
- for contractor overview/list pages, prefer the newer top-nav manager pattern: clear page identity, command bar, wide workspace, overview/list-first composition, and contextual secondary navigation only when it truly helps
- preserve the shared lifecycle language: continuity over silos, project/record chain over module isolation, and quick create over local-only scaffolding

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
