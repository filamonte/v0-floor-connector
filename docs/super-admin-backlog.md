# Super Admin Backlog

## Purpose
This document is the persistent super-admin and platform backlog discovered during the system-convergence audit.

It records the platform-side requirements needed to support:
- contractor defaults
- modular feature enablement
- shared templates/defaults
- tax administration
- automation controls
- catalog/inventory seeds
- other cross-tenant platform governance needs

This is not an implementation plan by itself. It is the durable backlog of platform responsibilities that must exist for the contractor app to become a real operating system.

## Guiding Rules
- platform defaults must seed, not override, contractor-owned truth by accident
- non-core features must remain modular and enable/disable capable
- super-admin should govern seeds, defaults, and policies, not create parallel tenant-owned data models
- contractor settings must be able to override platform defaults where product rules allow

## Priority Levels
- `P0`: required for go-live credibility or safe multi-tenant platform behavior
- `P1`: high-value platform completion work needed soon after P0
- `P2`: useful follow-up platform governance or enablement work

## P0 Backlog

### 1. Contact-first identity and directory platform support
Why:
- the target operating model depends on shared identity before customer promotion
- portal continuity and contact reuse need platform-safe identity foundations

Platform needs:
- canonical contact/directory governance model
- rules for promotion/classification into customer/billing/portal/vendor-related roles
- platform guidance for access and identity seeding without duplicating tenant records
- contact-to-customer relationship rules so customer remains an account and contact remains identity
- support for one customer having many contacts without creating duplicate people
- future customer-app intake and portal activation must resolve into the same canonical contact model

### 2. Structured intake governance for opportunities
Why:
- intake is now a Phase 1 system concern, not a future app concern
- customer-app intake, contractor-entered intake, and future automation all need the same queryable structure

Platform needs:
- governance for canonical structured intake fields and child records
- policy for contact linkage on opportunities
- policy for intake attachment metadata and object-storage usage
- policy for structured measurements and observation categories
- safe defaults for which intake dimensions are core versus optional
- shared merge-field/read-model guidance so intake can feed estimates, contracts, and future automations

### 3. Platform tax administration defaults
Why:
- current org financial settings are too shallow
- contractors need real tax rule defaults and override support

Platform needs:
- default tax rule seeding
- jurisdiction/location-based starter logic direction
- override model for contractor-specific tax handling
- support for item taxability and customer exemption interplay
- policy for external tax provider support
- contractor-level defaults by state/jurisdiction and project location
- clear precedence rules:
  - platform defaults
  - contractor defaults
  - project/location overrides
  - customer exemption
  - item-level taxable behavior

### 4. Shared inventory/catalog seed system expansion
Why:
- current catalog seeds are too narrow for go-live

Platform needs:
- starter materials
- starter labor items
- starter epoxy systems
- starter polishing systems
- reusable assemblies/system bundles where supported cleanly
- category/metadata guidance
- vendor continuity starter structure
- taxable/non-taxable seed behavior
- stock/on-hand direction and future inventory accounting boundaries
- seed strategy for epoxy systems, polishing systems, and reusable assemblies
- category policy for what is core inventory versus optional advanced inventory
- contractor-adoptable defaults without forcing platform-owned item truth into tenant-owned pricing

### 5. Shared customer-facing document default system expansion
Why:
- current templates only cover estimate/invoice/contract body templates

Platform needs:
- default scope-of-work content
- default terms content
- default cover-sheet content
- default reusable text sections
- default file/attachment bundles where appropriate
- seed governance for customer-facing content
- shared layout/display defaults for customer-facing documents where the architecture supports that cleanly
- save-as-template governance from contractor-customized records
- no per-module template silos for estimate/invoice/contract/customer-facing content

### 6. Platform automation defaults
Why:
- invoice and downstream automation are part of the target operating model

Platform needs:
- default automation policy for:
  - estimate acceptance follow-through
  - financing/pre-qual workflow entry
  - contract generation readiness
  - contract-signature invoice generation behavior
  - contract-signature project operational activation behavior
  - downstream job eligibility signaling
  - receipt/payment notification defaults
- contractor-level override rules
- guardrails when required data is missing

### 7. Modular feature governance
Why:
- settings are supposed to be modular
- non-core features must be turn-on/turn-off capable

Platform needs:
- feature policy clarity by module
- explicit core-vs-optional policy map
- core vs optional module policy catalog
- safe disabled-state UX expectations
- policy for surfaces like:
  - reports
  - forms & checklists
  - advanced inventory
  - financing
  - advanced tax
  - future integrations
- policy that core lifecycle continuity cannot be disabled:
  - contacts
  - opportunities
  - estimates
  - contracts
  - invoices
  - jobs
  - payments

## P1 Backlog

### 8. Template/layout designer roadmap
Why:
- customer-facing documents need richer control than plain template bodies

Platform needs:
- direction for layout/display defaults on:
  - estimates
  - invoices
  - contracts
- reports
- seedable starter layouts
- save-as-template governance

### 9. Forms & checklists platform seeds
Why:
- the module is not yet present, but CF shows it as a practical operating surface

Platform needs:
- starter form/checklist templates
- module enablement rules
- project/job/customer/lead linkage rules
- shared template governance

### 10. Reports platform strategy
Why:
- reports are missing as a module, but contractors expect them

Platform needs:
- report catalog strategy
- starter report definitions
- project/commercial/financial/report families
- module gating rules

### 11. Financing / pre-qual platform defaults
Why:
- financing is already in readiness logic, but not yet a real workflow system

Platform needs:
- workflow default rules
- contractor opt-in / opt-out controls
- template/default messaging hooks
- portal/customer-entry flow governance
- legal/commercial gating rules tying financing state to contract, deposit, invoice, and job readiness

### 12. Portal configuration defaults
Why:
- portal continuity depends on clear platform defaults and guardrails

Platform needs:
- what customer records can be shared by default
- what document states are portal-visible
- payment visibility defaults
- signature visibility defaults
- contractor override model
- contact-first portal activation guidance so portal access aligns to shared identity and customer account continuity

## P2 Backlog

### 13. Super-admin tenant operations depth
Possible future needs:
- tenant health summaries
- default-adoption tracking
- module-adoption tracking
- platform seed rollout visibility

### 14. Platform reporting on modular usage
Possible future needs:
- which modules are enabled per tenant
- which defaults have been adopted or overridden
- which template/catalog seeds are actively used

### 15. Global content governance
Possible future needs:
- versioning rules for shared seeds
- migration strategy when platform seeds evolve
- contractor notification/upgrade workflow

## Current Platform Strengths Already In Place
- platform template seeds
- platform catalog seeds
- module policy surface
- platform financial/workflow default foundations
- contractor adoption pattern for seeds

Evidence:
- `apps/web/app/(super-admin)/super-admin/page.tsx`
- `apps/web/app/(super-admin)/super-admin/templates/page.tsx`
- `apps/web/app/(super-admin)/super-admin/catalogs/page.tsx`
- `apps/web/app/(super-admin)/super-admin/modules/page.tsx`

## Platform Gaps To Keep In Mind
- current super-admin does not yet govern tax deeply enough
- current super-admin does not yet govern automation deeply enough
- current platform seeds are too narrow for full contractor go-live
- current module controls exist, but product-level core-vs-optional boundaries need stronger definition

## Recommended Super-Admin Build Order
1. tax defaults and governance
2. inventory/catalog seed expansion
3. shared document/template/default expansion
4. automation defaults and contractor overrides
5. forms/checklists and report seeding strategy
6. broader tenant operations visibility
