# System Completion Audit

## Purpose
This document is the current system-convergence source of truth for FloorConnector.

It records:
- what is already strong
- what is partial or structurally wrong
- what blocks investor-demo readiness
- what blocks day-to-day contractor usability
- the correct build order to complete the operating system without breaking canonical continuity

This is an audit and execution-planning document only. It does not authorize data-flow changes by itself.

## Executive Summary
FloorConnector already has a strong canonical foundation:
- one shared multi-tenant data model
- real auth and organization context
- real workflow entities across the core commercial and operational chain
- shared manager-page shell and quick-create system
- real contractor-facing dashboard, schedule, invoices, contracts, jobs, time, appointments, punchlists, and progress-billing foundations
- shared template seeds, shared catalog seeds, platform defaults, and module-policy foundations

The system is no longer a prototype. The biggest remaining work is not "make it look like software." The biggest remaining work is converging the product into the actual contractor operating model required for go-live.

The largest convergence gaps are:
1. Intake identity modeling is still customer-first, not contact-first.
2. Opportunity is real, but it is not yet the full pre-sale operating container the business model needs.
3. Project creation timing is still too early in the current flow.
4. Inventory / items / systems / reusable assemblies are not go-live complete.
5. Tax administration is not go-live complete.
6. Template/default coverage is too narrow for customer-facing document control and reusable business content.
7. Financing exists as readiness state, but not yet as a practical contractor workflow.
8. Reports and forms/checklists are not yet real system modules.
9. Some manager pages are strong, but system completion across all major modules is still uneven.

## Current Strengths

### 1. Canonical architecture is real
The strongest part of the product is the shared architecture.

Evidence:
- `packages/types/src/index.ts`
- `packages/domain/src/index.ts`
- `supabase/migrations/20260409233000_platform_core_foundation.sql`
- `supabase/migrations/20260410000500_platform_core_rls.sql`
- `supabase/migrations/20260413011000_auth_identity_membership_foundation.sql`

What is already true:
- the product is multi-tenant by design
- auth, org context, RLS, and shared entity boundaries are already foundational
- key records already exist as real canonical entities instead of fake module-local state
- workflow helpers such as commercial readiness and invoice payment gating already live in shared domain code

This is the main reason FloorConnector must intentionally differ from Contractor Foreman. CF can be copied as display/flow reference, but not as data architecture.

### 2. Core lifecycle coverage is broad
The app already has real foundations for:
- opportunities / leads
- customers
- projects
- estimates
- contracts
- change orders
- jobs
- invoices
- payments and payment events
- progress billing / SOV
- appointments
- punchlists
- people / vendors / compliance
- time tracking and daily logs
- portal access

Evidence:
- migration coverage from `20260414133000_customers_foundation.sql` through `20260421011500_appointments_foundation.sql`
- route coverage under `apps/web/app/(app)`
- route coverage under `apps/web/app/(portal)`

### 3. Manager-page and quick-create foundations are strong
The app already has a real contractor operating shell and a shared create pattern.

Evidence:
- `apps/web/components/contractor-workspace-page.tsx`
- `apps/web/components/manager-dashboard-card.tsx`
- `apps/web/components/workspace-composer-sheet.tsx`
- `apps/web/components/universal-create-menu.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`

What is already working:
- manager pages are summary-and-routing surfaces rather than mini workflow engines
- quick-create is already moving toward one shared system
- the dashboard already acts like a real contractor command surface

### 4. Commercial and execution detail surfaces are materially real
The estimate, invoice, project, contract, schedule, time, punchlist, appointment, and progress-billing surfaces are not placeholders anymore.

Strong examples:
- `apps/web/app/(app)/estimates/page.tsx`
- `apps/web/app/(app)/estimates/[estimateId]/page.tsx`
- `apps/web/app/(app)/contracts/page.tsx`
- `apps/web/app/(app)/invoices/page.tsx`
- `apps/web/app/(app)/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(app)/schedule/page.tsx`
- `apps/web/app/(app)/time/page.tsx`
- `apps/web/app/(app)/progress-billing/page.tsx`

This is enough to support a serious investor story, but not yet enough for a complete contractor OS story.

### 5. Modular settings and super-admin foundations already exist
The settings model is already directionally correct.

Evidence:
- `apps/web/app/(app)/settings/page.tsx`
- `apps/web/app/(app)/settings/modules/page.tsx`
- `apps/web/app/(app)/settings/templates/page.tsx`
- `apps/web/app/(app)/settings/catalogs/page.tsx`
- `apps/web/app/(app)/settings/financial/page.tsx`
- `apps/web/app/(app)/settings/workflows/page.tsx`
- `apps/web/app/(super-admin)/super-admin/page.tsx`
- `apps/web/app/(super-admin)/super-admin/modules/page.tsx`
- `apps/web/app/(super-admin)/super-admin/templates/page.tsx`
- `apps/web/app/(super-admin)/super-admin/catalogs/page.tsx`

What is already true:
- non-core capabilities are intended to be modular
- platform policy and org overrides already exist
- super-admin can seed templates and catalogs

This matches the intended product direction: core system continuity with optional/non-core modules that can be turned on or off.

## Recommended Lifecycle Model
The recommended operating model should be adopted as the target product truth:

`Opportunity -> Customer -> Project -> Estimate -> Contract -> Change Order -> Job -> Invoice -> Payment`

Important clarification:
- jobs may be created after project/commercial readiness is satisfied, not simply as the next sequential commercial record after invoice
- scheduling remains downstream of readiness and job creation
- progress billing remains `estimate -> SOV -> invoice`

### Why this model is correct

#### Contact first
Inbound identity should not create full customers or full projects immediately.

Why:
- many leads never become real work
- one person may later become a customer, billing contact, portal contact, or other role
- portal continuity and customer continuity need reusable identity, not throwaway pre-sale records

#### Opportunity as pre-sale container
Opportunities should hold pre-sale commercial and field-prep work.

Why:
- avoids bloating the system with dead projects
- still gives estimating, site visit, photos, notes, measurements, and follow-up somewhere real to live

#### Estimate as commercial source of truth
Estimate content should drive downstream commercial documents.

Why:
- estimate scope, systems, line items, exclusions, and terms are the real commercial proposal
- contract generation should inherit from accepted commercial truth, not from re-keyed side forms

#### Project after acceptance
Project should become operationally real after the work is actually accepted.

Why:
- accepted work is when the record needs to anchor contracts, scheduling, jobs, invoices, punchlists, daily logs, and progress billing
- raw leads and speculative proposals should not create noise in the operational project layer

#### Contracts remain central
Contracts are not just files.

Why:
- contract signature, financing state, deposit terms, and internal approval all affect downstream readiness
- invoice automation and job readiness should remain connected to contract state

### Where financing, tax, templates, and automation fit

Financing:
- after estimate acceptance
- before or during contract send/sign flow
- affects readiness and invoice/deposit options

Tax:
- defaults from platform and contractor settings
- applied during estimate/invoice/document flows
- must be overridable by customer exemption, item behavior, and job location/project context

Templates/defaults:
- seeded by super-admin
- adopted/overridden by contractor
- used by estimate, contract, invoice, and other customer-facing surfaces

Automation:
- seeded by platform defaults
- configurable at contractor level
- should drive optional auto-generation and auto-send behavior only when required data exists

## Where The Current System Matches The Model

### Matching areas
- opportunity exists as a real canonical entity
- estimate exists as a real canonical commercial entity
- project is already the operational root for downstream modules
- contracts already affect readiness state
- payments already stay tied to invoices
- progress billing already stays on the estimate-to-invoice chain
- modular settings and platform defaults already exist

### Mismatched or incomplete areas
- there is no separate contact-first directory model today
- opportunities still auto-seed customer and project creation too early in the estimate flow
- customer is currently doing double duty as both early intake identity and true customer account
- financing is present as state/readiness but not as a practical workflow module
- tax and items are too shallow to support the full operating model

## Current Structural Gaps By Audit Area

### A. Directory / Contact / Customer Model
Status: structurally incomplete

Current reality:
- there is a `customers` model
- there is no separate canonical contact-first directory entity in the current shared types/domain exports
- opportunities currently store prospect fields directly:
  - `prospectName`
  - `prospectCompanyName`
  - `email`
  - `phone`
  - address fields

Evidence:
- `packages/types/src/index.ts`
- `apps/web/lib/opportunities/data.ts`
- `apps/web/lib/customers/data.ts`

Problem:
- the system cannot yet cleanly treat inbound identities as reusable contacts before customer promotion/classification
- portal continuity, billing contact continuity, and future directory behavior are under-modeled

Recommendation:
- move toward a contact-first directory model as a major canonical convergence step
- do not treat every inbound lead as a customer
- do not lose the current customer model; reshape it around shared identity rather than replace it blindly

Severity:
- high structural issue
- not a small UI polish problem

### B. Opportunity / Pre-Sale Container
Status: real foundation, not complete enough

Current reality:
- opportunities are real and have a useful commercial status chain
- opportunities already support:
  - source
  - qualification states
  - site-assessment state
  - notes
  - requirements summary
  - optional customer/project linkage

Evidence:
- `packages/types/src/index.ts`
- `apps/web/lib/opportunities/data.ts`
- `apps/web/app/(app)/leads/page.tsx`

What is still missing or weak:
- richer pre-sale field context
- pre-sale photos and measurement capture
- stronger appointment/site-visit continuity as part of the opportunity workspace
- opportunity-specific estimating intake depth

Most important structural issue:
- `ensureOpportunityEstimateFlow(...)` currently auto-creates customer and project before estimate flow continues

Evidence:
- `apps/web/lib/opportunities/data.ts`

Why this is wrong for the target model:
- project creation is happening too early
- the code currently pushes pre-sale work into project creation before estimate acceptance

This is one of the most important convergence issues in the whole system.

### C. Estimate System
Status: one of the strongest current areas, but still incomplete for go-live

Current strengths:
- strong manager page
- strong review/detail workspace
- estimate status progression exists
- strong continuity into contract/project readiness
- estimate is already treated as a commercial source of truth more than most modules

Evidence:
- `apps/web/app/(app)/estimates/page.tsx`
- `apps/web/app/(app)/estimates/[estimateId]/page.tsx`
- `packages/types/src/index.ts`

Remaining gaps:
- workspace/editor still does not fully match CF’s sectioned estimate-authoring behavior
- no complete left-nav-driven estimate editor system across all sections
- template/default integration is too limited
- items database integration is incomplete
- send/accept/protection behavior is still lighter than needed for go-live commercial rigor

Investor-demo status:
- good

Contractor go-live status:
- not complete enough yet

### D. Contract System
Status: strong canonical role, still missing practical completion

Current strengths:
- contracts are real canonical records
- signature state exists
- signature readiness exists
- internal approval exists
- financing status exists and already influences commercial readiness
- contract manager page is real

Evidence:
- `packages/types/src/index.ts`
- `packages/domain/src/index.ts`
- `apps/web/app/(app)/contracts/page.tsx`
- `supabase/migrations/20260414233000_contracts_foundation.sql`
- `supabase/migrations/20260418130000_contract_signature_foundation.sql`

Remaining gaps:
- contract generation from accepted estimate(s) is still narrower than the target model
- multiple accepted estimates into one contract is not yet clearly supported as an operating flow
- financing/pre-qual is not yet a lived contractor workflow
- automation/default behavior around signature completion and downstream invoice readiness is not yet fully operational

### E. Invoice System
Status: strong and credible, but not complete enough for full contractor operations

Current strengths:
- invoice manager is strong
- invoice workspace/detail page is strong
- payment continuity is real
- deposit/progress invoice roles are real
- progress billing continuity exists
- payment workflow gating exists in shared domain logic

Evidence:
- `apps/web/app/(app)/invoices/page.tsx`
- `apps/web/app/(app)/invoices/[invoiceId]/page.tsx`
- `packages/domain/src/index.ts`
- `apps/web/lib/payments/data.ts`

Remaining gaps:
- invoice editor behavior still needs fuller CF-style sectioned authoring
- item sourcing and item reuse are not complete enough
- automation around contract-signature-triggered invoice creation is not yet fully productized
- receipt/auto-send/default behavior is not fully complete
- tax behavior is too shallow for real-world invoicing

### F. Items / Inventory / Systems Database
Status: major go-live blocker

Current reality:
- shared catalog foundation exists
- platform seeds exist
- org adoption exists
- contractor-facing materials module does not exist yet
- current supported item types are only:
  - material
  - service
  - system

Evidence:
- `apps/web/lib/catalogs/data.ts`
- `apps/web/app/(app)/settings/catalogs/page.tsx`
- `apps/web/app/(app)/materials/page.tsx`
- `apps/web/app/(app)/materials/page.tsx` is still a placeholder

Why this is a major blocker:
- reusable materials and systems are required for go-live
- labor, assemblies, vendor continuity, stock direction, taxable behavior, and cross-record reuse are not complete
- estimates and invoices cannot reach full contractor usability without this layer

What must exist for go-live:
- one shared items/materials/systems database
- billable materials
- labor items
- reusable systems and assemblies
- vendor continuity
- taxable / non-taxable item behavior
- contractor-owned items
- super-admin seeded starter items
- downstream reuse across estimates, invoices, and change orders
- forward-compatible inventory/stock direction

### G. Template / Default / Form / Layout System
Status: foundational, not complete enough

Current reality:
- templates exist only for:
  - estimate
  - invoice
  - contract
- shared platform seeds and contractor adoption exist
- current implementation is largely body-template based

Evidence:
- `packages/types/src/index.ts`
- `apps/web/lib/templates/data.ts`
- `apps/web/app/(app)/settings/templates/page.tsx`
- `apps/web/app/(super-admin)/super-admin/templates/page.tsx`

What is missing:
- broader reusable business content system
- scope of work defaults
- terms defaults
- cover sheet defaults
- reusable sections
- file/attachment defaults
- richer document layout/display control
- save-as-template from more real editing surfaces

Forms and reports:
- there is no real forms/checklists module in the current app routes
- there is no real reports module in the current app routes

This matters because CF uses forms, checklists, and report builders as real operating surfaces. FloorConnector does not need to clone all of CF, but it does need a converged answer for reusable forms/layout/report output.

### H. Tax Administration
Status: major go-live blocker

Current reality:
- org financial settings currently include:
  - `defaultTaxRate`
  - `defaultTaxBehavior`
  - `defaultRetainagePercentage`
  - optional external tax provider pointer
- customers support tax exemption and exemption reference fields

Evidence:
- `apps/web/lib/organizations/financial-settings.ts`
- `apps/web/lib/customers/data.ts`
- `apps/web/app/(app)/settings/financial/page.tsx`

What is missing:
- jurisdiction/location-aware tax rules
- project/location overrides
- item-level taxable behavior in a real shared item model
- customer exemption rules that materially affect downstream estimate/invoice behavior
- super-admin starter rule system
- contractor override governance

Conclusion:
- current tax support is useful foundation
- current tax support is not enough for real-world contractor billing

### I. Time / Time Clocking
Status: real and promising, but still operationally light

Current strengths:
- canonical punch events exist
- derived time cards exist
- project and job attribution are explicit
- time home is now materially useful

Evidence:
- `supabase/migrations/20260417180000_time_tracking_foundation.sql`
- `apps/web/app/(app)/time/page.tsx`

Remaining gaps:
- time manager does not yet feel as complete as the CF-style time card system
- team review and weekly/crew-sheet workflows are not fully mature
- deeper managerial time controls and payroll-facing review are still light
- stronger links into job costing and broader financial controls are still ahead

### J. Page / Manager Completion
Status: improving, but incomplete

Strong manager pages:
- dashboard
- leads
- customers
- projects
- estimates
- contracts
- invoices
- payments
- jobs
- schedule
- time
- appointments
- punchlists
- progress billing
- daily logs

Structurally missing or incomplete:
- materials / inventory manager is missing
- forms & checklists manager is missing
- reports manager is missing
- people and vendors still need confirmation against the same final-quality manager standard
- change orders still need full completion against the same convergence bar

### K. Super Admin Needs
Status: foundational, incomplete

Current strengths:
- platform seeds for templates and catalogs
- module policy controls
- platform default surfaces exist

Current gaps:
- tax governance
- automation defaults
- richer catalog seeding
- reusable content/layout seeding
- inventory starter systems
- broader module-governance surfaces
- tenant operations depth

See `docs/super-admin-backlog.md`.

### L. Visual / UX Consistency
Status: much better than before, but still not fully converged

Where FloorConnector is already aligned well:
- shell direction
- top-nav contractor shell
- summary-and-routing manager pages
- quick-create direction
- invoice/estimate/project/dashboard tone

Where it should copy CF more closely:
- dense manager-page composition on every major module
- richer left-side section navigation on full workspaces where appropriate
- estimate/invoice editor composition
- reusable inventory/item entry behavior
- forms/checklists/report operating surfaces
- module settings and defaults ergonomics

Where it must intentionally differ:
- no siloed modules
- no module-owned duplicate records
- no detached payment creation
- no CF-style data sprawl

## Biggest Investor-Demo Blockers
1. The intake and lifecycle story is not yet fully locked to the intended operating model.
2. Contact-first directory continuity is missing.
3. Project timing is still too early because estimate flow currently creates projects before acceptance.
4. Inventory/items/systems are not ready enough for a believable contractor OS story.
5. Tax administration is too shallow for a realistic full-business demo.
6. Forms/checklists and reports are absent as system modules.
7. Financing exists conceptually but not as a real contractor workflow.

## Biggest Contractor-Usage Blockers
1. Shared items/inventory/systems database is not operationally complete.
2. Tax administration is not operationally complete.
3. Contact/directory identity model is not correct yet.
4. Opportunity is not yet rich enough as the real pre-sale work container.
5. Template/default/layout system is too narrow.
6. Financing/pre-qual workflow is not truly usable yet.
7. Some module surfaces still exist in foundation form rather than complete contractor-usage form.

## Contractor Foreman Alignment Summary

### Where FloorConnector should copy CF more closely
- manager page density
- top summary / middle queues / bottom recent table as a universal module pattern
- full estimate/invoice editor composition
- item-add flows and item-source ergonomics
- forms/checklists operating surfaces
- report-builder and report-dashboard direction
- settings ergonomics for defaults, financial, and feature toggles

### Where FloorConnector must intentionally differ
- one shared canonical data model
- project continuity
- no duplicate module-owned records
- no detached billing or detached payment subsystem
- no detached customer-portal data model
- no separate item system for each module
- no module-specific template silos

## Ordered Convergence Plan

### Phase 1: Lock the lifecycle and canonical operating model
Why first:
- the system cannot safely converge without deciding the real business truth

Includes:
- contact-first directory model decision and plan
- opportunity responsibilities and scope
- accepted-estimate trigger for project creation
- contract-central downstream readiness truth
- financing and automation placement in the lifecycle

This is the highest-priority convergence phase.

### Phase 2: Complete system-critical go-live foundations
Why second:
- these are the biggest contractor-usage blockers

Includes:
- shared items / inventory / systems database
- tax administration
- broader templates/defaults/content system
- contractor + super-admin control surfaces for those systems

### Phase 3: Complete the customer-facing document chain
Why third:
- estimates, contracts, and invoices are already strong enough to improve next

Includes:
- fuller estimate editor/workspace
- fuller invoice editor/workspace
- contract generation and contract downstream behavior completion
- save-as-template/default and document layout behavior

### Phase 4: Complete missing modules and high-value supporting systems
Includes:
- forms & checklists
- reports
- stronger time manager
- stronger people/vendors/change-order manager completion
- broader automation controls

### Phase 5: Refine platform modularity and expansion controls
Includes:
- non-core module toggles
- entitlement boundaries
- admin governance for optional features
- rollout discipline for feature-on/feature-off states

## Explicit Recommendation: What To Build First Next
Build the canonical lifecycle convergence slice first.

Specifically:
1. finalize the intended lifecycle truth in docs and planning:
   - contact-first
   - opportunity as pre-sale container
   - project after accepted estimate
   - contracts central to readiness
2. audit and plan the exact canonical data-model changes required to support that convergence safely
3. only after that, build the shared items / inventory / tax / template completion work

If one concrete implementation slice must be chosen immediately after this audit, the best next build is:

`Contact / Opportunity / Estimate / Project convergence`

because it affects:
- intake truth
- project timing
- portal continuity
- customer continuity
- contract readiness
- the entire rest of the operating chain

## What This Audit Is Explicitly Not Doing Yet
- not implementing any new features
- not changing backend logic
- not changing data flow
- not introducing schema changes
- not building inventory yet
- not restructuring editors yet
- not expanding templates yet
- not building reports/forms yet

Those belong to approved implementation phases after lifecycle truth is locked.
