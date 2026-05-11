# UI And Data Model Alignment Backlog

Status: planning backlog for system-level alignment.

This document captures product-review follow-up work needed before broader demo/investor polish and before deeper feature expansion. It is documentation only. It does not authorize code, migrations, routes, UI, tests, seed data, or schema changes by itself.

Use this backlog with:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): implemented truth
- [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md): canonical UI rules
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md): implementation guardrails
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): sequencing guidance

Source context checked for this backlog:
- implemented-state and source-of-truth docs
- workflow, workflow-spec, and workflow-state-machine docs
- roadmap, system inventory, target IA, and vision docs
- Estimate Builder master and V1 scope docs
- active UI/design guidance, especially `floorconnector-ui-build-rules.md` and `figma-redesign-brief.md`
- optional `site-visit-scope-intake-plan.md` and `ui-rules.md` were not present when this backlog was created

## 1. Contractor UI / Color System

FloorConnector needs stronger module-page readability and clearer differentiation between work areas while staying inside the established contractor-app direction.

Target direction:
- move closer to a Contractor Foreman-style practical work surface: legible, operational, dense where useful, and clearly action-oriented
- improve contrast across section surfaces, headers, table rows, cards, and status areas
- make section headers easier to scan on long module and detail pages
- use status colors consistently for complete, current, blocked, warning, and future states
- clarify action hierarchy so primary, secondary, destructive, workflow-next, and navigation actions are visually distinct
- strengthen table and card readability without drifting into one-off styling
- make workflow guidance visible enough to orient users without turning every page into onboarding copy

Guardrails:
- preserve FloorConnector top-nav-first contractor shell rules
- preserve detail-workspace and contextual-side-nav rules where deeper pages benefit from them
- use shared UI primitives and module patterns rather than page-local visual systems
- avoid one-off page styling, isolated color palettes, or per-module chrome that makes modules feel like separate apps

## 2. Uniform Module Page Pattern

Module pages should converge on a consistent default layout before deeper dashboard configurability is added.

Default module-page structure:
- header/title band with clear module identity and current context
- primary actions for the main create, review, or workflow operation
- workflow or next-action guidance where the module has a real lifecycle
- filters and search for list-heavy views
- data table, cards, or queue widgets using shared layout language
- contextual side or left navigation where useful on detail pages, not as the primary overview navigation

Alignment needs:
- bring inconsistent existing pages into the shared module-page pattern
- keep overview pages top-nav-first and list/queue oriented
- keep detail pages anchored to the record workspace and project/customer workflow chain where relevant
- prevent module dashboards from becoming separate module apps with private navigation, private summaries, or duplicate record concepts

Longer-term direction:
- data views should eventually be customizable per module or dashboard
- standardize strong defaults first, then introduce configurable views only after the default language is stable

## 3. Directory / Contact Model Direction

Long-term direction: every person, company, and contact-like record should be managed through a shared directory/contact foundation without duplicating business entities.

Contact type, role, relationship, and access should determine behavior, including:
- lead contact
- customer contact
- portal user
- sales rep
- employee
- vendor or subcontractor contact
- project contact

Management direction:
- security, portal access, permissions, and contact relationships should be managed from directory, person, customer, or related workspaces where appropriate
- customer account records remain the canonical commercial and financial customer source unless an approved future model changes that explicitly
- people, vendors, customers, leads, project contacts, and portal users should connect through shared identity/contact relationships rather than becoming isolated duplicates
- the Directory surface can unify views and navigation before it becomes the editing home for every contact type

Guardrail:
- avoid duplicate contact models and module-specific person/customer/vendor/project-contact records that cannot reconcile back to the shared foundation

## 4. Estimate Editor Improvements

The Estimate Editor needs clearer commercial editing controls and workflow navigation.

Editor direction:
- support internal markup adjustment per estimate line where allowed
- support a taxable checkbox or toggle per estimate line
- preserve catalog/default behavior while allowing intentional estimate-line overrides
- customer-facing estimate output must hide internal cost, markup, margin, hidden markup, labor assumptions, and other profitability controls

Workflow actions should be clear:
- Review
- Submit or Send where appropriate
- Back to Review
- Continue next workflow step

Navigation guardrails:
- the editor should not trap users inside authoring mode
- users must have clear navigation back to estimate review/detail
- workflow-next actions should be distinguishable from save/edit/navigation actions
- estimate review should remain the place where customer-facing output and readiness are checked before sending or advancing

## 5. Tax Model Direction

Tax should be managed as a shared financial setting and line-level calculation concern, not as loose project-page data.

Target direction:
- tax rates should be managed in contractor settings and seeded from super admin
- contractors should be able to define custom tax rates
- items and catalog entries should have default taxable behavior
- estimate and invoice line items should allow taxable override
- project and customer records should carry tax applicability context, such as taxable, exempt, or exemption-related status
- project pages may show tax applicability, but tax rates should not be loosely managed from project detail
- preserve tax snapshots on estimates and invoices where snapshot behavior is already required

Guardrails:
- do not add manual estimate-wide tax overrides that bypass organization defaults, customer exemption context, and item or line taxable behavior
- do not scatter tax-rate creation into unrelated module detail pages
- keep future external tax-provider support behind adapters and shared financial logic

## 6. Project Address

Project detail should clearly show a structured project or service address.

Target structured fields:
- address line 1
- address line 2
- city
- state
- postal code
- country if needed

Address model direction:
- project/service address should be distinct from customer billing address and customer contact address
- customer records may still carry billing/contact address context
- project address should represent where work happens, where visits occur, and what downstream job, schedule, document, and field workflows should reference

Future direction:
- address autocomplete or verification can use USPS or another provider later
- do not implement address autocomplete or verification until a provider boundary and validation workflow are intentionally designed

## 7. Workflow Guidance

Every major record workspace should show the current step and next best action when the record participates in the operational lifecycle.

Guidance should be context-aware for:
- lead
- site visit
- scope intake
- estimate
- contract
- job
- invoice/payment

Visual-state direction:
- complete
- current
- blocked
- future

Guidance rules:
- connect guidance to canonical record state and readiness fields
- explain blockers with the minimum useful detail
- route users to the next meaningful workspace or action
- avoid fake progress indicators that are not backed by real state
- keep workflow guidance consistent across project, estimate, contract, job, invoice, payment, and portal-adjacent workspaces

## 8. Implementation Priority

### Now / Demo Polish

- Estimate Editor navigation and review actions
- project service address display
- line taxable toggle planning
- UI consistency audit across module pages, detail pages, tables, cards, action hierarchy, and workflow guidance

### Next / System Alignment

- directory/contact unification plan
- tax settings and rates model
- uniform module page polish
- shared visual-state rules for complete, current, blocked, warning, and future workflow states

### Later / Configurable Platform Depth

- customizable dashboard and module views
- USPS or other address verification provider integration
- advanced permissions and portal directory management
- deeper directory-driven role/access management across customer, project, workforce, vendor, subcontractor, and portal relationships
