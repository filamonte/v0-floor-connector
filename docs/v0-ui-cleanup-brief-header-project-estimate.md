# v0 UI Cleanup Brief: Header, Project, and Estimate Workflows

Status:
- design brief for a future UI cleanup pass
- documentation/design only
- no code, schema, estimate calculation, invoice behavior, catalog insertion behavior, or workflow changes

Related docs:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/estimate-editor-group-first-refactor-plan.md](C:/FloorConnector/docs/estimate-editor-group-first-refactor-plan.md)
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)
- [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md)

## Purpose

This brief defines the next v0/design cleanup pass for the contractor app shell, project creation/detail surfaces, and estimate creation/editor surfaces. It should guide design exploration before implementation.

The pass is about clarity, layout, and interaction patterns only. It must not change FloorConnector's canonical data model or commercial workflows.

## Design Goals

- Preserve the top-nav-first contractor shell while making it work with more modules.
- Keep the dashboard/header visual direction: black or near-black framing, orange action emphasis, white/warm-neutral work surfaces, compact operational density.
- Improve project-centered continuity without turning Project into a separate app shell.
- Make project quick create and estimate quick create scale past small test data.
- Make project detail easier to scan by introducing contextual workspace navigation inside the project page.
- Keep estimate creation context-aware: project-launched estimates should not ask users to reselect the same project/customer.
- Move the long-term estimate editor toward group-first item authoring without touching current insertion behavior.
- Improve input formatting expectations for country, phone, ZIP/postal code, and validation recovery.
- Keep all cleanup compatible with the existing shared manager-page and record-workspace patterns.

## Screens Affected

Primary affected surfaces:
- shared contractor app header / top navigation
- mobile app navigation
- `/projects`
- project quick-create sheet/form
- `/projects/[projectId]`
- project edit/detail sections
- `/estimates`
- estimate quick-create sheet/form
- `/estimates/[estimateId]/edit`

Secondary surfaces to keep consistent:
- global search and universal create in the shell
- customer picker fields
- shared composer sheets
- shared record workspace layout
- future module-home and workspace-sidebar patterns

## 1. Header / Navigation Cleanup

Current concern:
- the expanded header cannot show all current and future module items cleanly.
- top navigation needs overflow handling as the number of modules grows.

Design requirements:
- preserve top-nav-first contractor shell.
- do not return to a full-time left sidebar as primary app navigation.
- do not create per-module shells.
- do not hide global search, notifications, universal create, organization identity, or account actions.

Recommended responsive behavior:
- Desktop wide:
  - show primary module tabs inline.
  - keep the most important routes visible: Dashboard, Customers, Projects, Estimates or Financials depending on current IA decision, Field/Schedule, Communications, Settings.
  - move lower-frequency or overflow modules into a `More` menu.
- Desktop medium:
  - show fewer inline tabs and promote `More`.
  - retain active-section visibility even when the current item lives inside `More`.
- Tablet:
  - use a compact horizontal nav strip with overflow menu.
  - avoid two-line nav rows that push workspace content down.
- Mobile:
  - use the existing mobile nav pattern.
  - group links by domain rather than dumping one long flat list.

Recommended IA grouping for overflow:
- Core: Dashboard, Customers, Projects
- Commercial: Estimates, Contracts, Change Orders
- Financials: Financials, Invoices, Payments, Progress Billing, Reports
- Field: Schedule, Jobs, Punchlists, Daily Logs, Time, Materials
- Directory: Directory, People, Vendors
- Admin: Settings

v0 should design:
- a responsive top-nav overflow pattern.
- a `More` menu with grouped module links.
- active-state handling for overflow routes.
- mobile grouped navigation that matches the same structure.

v0 should not design:
- a permanent app-wide left sidebar.
- a new shell.
- a different dashboard shell.
- marketing-style hero navigation.

## 2. Project Quick Create

Current concern:
- project quick create uses a customer select that will become unwieldy as customer count grows.

Design requirements:
- preserve quick-create -> canonical project -> full project workspace.
- collect minimum required project data only.
- avoid giant dropdowns.
- preserve data when validation fails.

Recommended pattern:
- replace large customer dropdowns with a searchable customer picker/combobox.
- show customer name, company name, email, and city/state when available.
- support keyboard search and clear selected state.
- when launched from a customer, lock/preselect that customer and show it as context rather than making users reselect it.
- allow `Create new customer` inline only if the existing canonical customer-create action path can be reused safely in implementation.
- inline create-new-customer should capture minimum safe fields only:
  - customer/account name
  - optional company name
  - email
  - phone
  - billing/contact location basics if already supported by the existing customer flow
- after inline customer creation, select that new customer in the project form and keep the user in the project create flow.

v0 should design:
- searchable customer picker inside the project quick-create sheet.
- empty search state with `Create new customer`.
- selected customer summary row.
- validation errors that keep all entered project and customer data visible.

v0 should not design:
- a local-only unsaved customer draft model.
- a project create form that writes duplicate customer records.
- a giant native select with hundreds of options.

## 3. Project Edit / Detail Page

Current concern:
- the project detail page is too long.
- edit controls are not always clear.
- project detail should remain the operational hub but needs better internal navigation.

Design requirements:
- keep top nav as primary app navigation.
- use contextual left navigation only inside the project workspace.
- do not create a new project app shell.
- preserve the shared record-workspace pattern.
- keep project as the readiness and continuity hub.

Recommended project workspace structure:
- left contextual nav inside project detail:
  - Overview
  - Details
  - Readiness
  - Estimates
  - Contracts
  - Change Orders
  - Jobs / Schedule
  - Invoices / Payments
  - Files
  - Communications
  - Activity / Notes
- mobile/tablet behavior:
  - collapse contextual nav into a section switcher or horizontal segmented rail.
  - keep current section title visible.

Recommended edit pattern:
- separate read-only summary/review cards from edit controls.
- use explicit `Edit details` actions per section instead of leaving all fields visually equal.
- use side sheet or inline section edit mode for bounded edits.
- keep save/cancel/error state local to the edited section when possible.

Financing status placement:
- financing status should not live in the main basic edit form.
- place financing status in a readiness/financial section near:
  - contract signature readiness
  - deposit/payment readiness
  - financing approval readiness
  - ready-to-schedule blockers
- copy should make it clear financing status affects readiness, not basic project identity.

v0 should design:
- a project detail workspace with contextual left navigation.
- a compact project header with status, customer, address, next best action.
- a readiness/financial section with financing status displayed as operational readiness context.
- edit affordances that make it clear what is editable now.

v0 should not design:
- a separate project app with its own primary navigation.
- financing fields in the basic project identity form.
- detached duplicate financial-readiness records.
- broad workflow changes to readiness logic.

## 4. Estimate Creation Flow

Current concern:
- estimate creation should respect launch context and avoid duplicate search/list UI.

Design requirements:
- when launched from a project, project and customer must remain locked/preselected.
- when launched globally from `/estimates`, customer and project are required.
- do not ask users to search the same project/customer twice.
- keep optional opportunity context as upstream continuity, not the main required object.

Recommended global estimate create flow:
- Step 1: select or search customer.
- Step 2: select existing project for that customer or create a new project if safe.
- Step 3: estimate basics: title, date, optional opportunity context.
- Primary CTA creates canonical draft estimate and routes to editor/workspace.

Recommended project-launched flow:
- show locked customer and project context at top.
- hide or disable customer/project selection fields.
- ask only for estimate basics.
- preserve linked opportunity when the project already has one.

Recommended customer-launched flow:
- lock/preselect customer.
- require project selection or create project within the flow.
- avoid showing a full unrelated project list.

v0 should design:
- one shared estimate quick-create sheet that adapts to launch context.
- searchable customer/project selectors where global selection is required.
- locked context pills/cards when customer/project are known.
- validation errors that keep selected customer/project and typed estimate details intact.

v0 should not design:
- duplicate customer search modal plus customer dropdown in the same flow.
- estimate drafts disconnected from customer/project.
- project/customer reselection when launched from project context.
- changes to estimate numbering, status, or creation rules.

## 5. Estimate Editor Long-Term Layout

Current concern:
- the estimate editor is too long.
- the permanent Catalog Items panel is not the right final UI.

Design requirements:
- follow [docs/estimate-editor-group-first-refactor-plan.md](C:/FloorConnector/docs/estimate-editor-group-first-refactor-plan.md).
- keep existing estimate line items as editable snapshots.
- keep catalog items maintained in Cost Items Database.
- do not change catalog insertion behavior in the v0 design brief.
- do not change calculations, invoices, SOV, approved snapshots, or tax behavior.

Recommended editor direction:
- group-first item authoring.
- groups are estimate sections.
- each group has:
  - name
  - item count
  - subtotal
  - primary add action
  - overflow menu
- group-level actions:
  - Add item from cost item database
  - Add custom item
  - Add from template/system
  - Import from previous estimate
  - Rename group
  - Duplicate group
  - Delete group
- Add Item drawer sources:
  - Cost Item Database
  - Template/System
  - Previous Estimate
  - Custom Item
- permanent Catalog Items panel should be removed later or de-emphasized into the drawer's Cost Item Database source.

Recommended editor chrome:
- compact sticky financial summary.
- contextual workspace navigation for Items, Details, Scope/SOW, Terms, Files, Review.
- group cards or dense grouped rows as the primary item area.
- line snapshot editing remains available inside each group.

v0 should design:
- group-first estimate Items workspace.
- Add Item drawer with source tabs.
- a compact group row/card pattern.
- de-emphasized or removed permanent Catalog Items side/full-width panel.

v0 should not design:
- new pricing formulas.
- live-bound catalog line items.
- direct invoice catalog insertion.
- schema-backed durable group tables.
- takeoff/AI generation.

## 6. Input Formatting Guidance

Current concern:
- address/contact inputs need clearer formatting and validation behavior.

Recommended patterns:
- Country:
  - use a searchable dropdown or select.
  - pin United States and Canada at the top.
  - include full country names plus codes where useful.
  - default to United States only when existing behavior or organization settings support it.
- Phone:
  - allow common typed formats.
  - show helper examples such as `(555) 555-5555`.
  - normalize only when safe; do not erase user input on failed validation.
- ZIP/postal:
  - label as `ZIP / postal code` where country may vary.
  - allow US ZIP, ZIP+4, and Canadian postal patterns where applicable.
  - do not hard-fail international formats unless the business rule truly requires it.
- Validation:
  - preserve entered data after validation errors.
  - show errors near the field.
  - keep selected customer/project context visible.
  - make required fields obvious before submit.

v0 should design:
- reusable address/contact field grouping.
- country select with pinned US/Canada.
- validation state examples.
- preserved entered-data examples after failed submit.

v0 should not design:
- external address validation integrations.
- automatic geocoding.
- country-specific schema changes.
- destructive form resets on error.

## Recommended Component Patterns

Use or adapt existing FloorConnector patterns:
- shared contractor top nav with responsive overflow
- shared mobile nav
- `StandardWorkspaceLayout` for data-heavy module workspaces where applicable
- record-workspace detail pattern for project and estimate detail
- contextual left workspace navigation inside project detail and future estimate editor
- composer sheet / side sheet for quick-create and bounded editing
- searchable combobox/picker for customer and project selection
- grouped overflow menu for secondary actions
- compact status/readiness bands
- sticky summary strip for estimate totals
- inline section edit mode for project details where a full side sheet would be too heavy

Visual guidance:
- compact operational density.
- 8px or smaller card radius unless existing component requires otherwise.
- lucide icons for actions.
- no nested cards inside cards.
- no marketing hero layouts.
- no blue-heavy manager chrome.
- preserve FloorConnector black/gray/orange/white direction.
- reserve green/emerald for semantic status only, not primary chrome.

## What Should Be Included In A v0 Prompt

Use this as the core v0 prompt:

```text
Design a production SaaS contractor app UI cleanup for FloorConnector, a multi-tenant epoxy flooring and concrete polishing contractor platform. This is design only. Do not change data models, workflows, pricing, invoices, catalog insertion, or estimate calculations.

Keep the existing top-nav-first contractor shell. Do not introduce a permanent app-wide left sidebar. Create responsive overflow handling for many modules: inline primary nav on wide desktop, grouped More menu for overflow, grouped mobile navigation, and clear active state for routes inside overflow. Preserve global search, notifications, universal create, organization identity, and account actions.

Use the existing FloorConnector visual direction: compact operational SaaS, black/near-black framing, gray secondary chrome, orange action accents, white or warm light-neutral work surfaces, practical typography, dense but readable layouts. Avoid marketing hero sections, decorative gradients, blue-heavy chrome, green primary chrome, and fake data-heavy dashboards.

Design these screens:
1. Contractor header/top navigation with responsive overflow and grouped More menu.
2. Project quick-create sheet with searchable customer picker, selected customer summary, optional safe inline create-new-customer state, validation errors that preserve entered data, and no giant customer dropdown.
3. Project detail workspace with compact header, next-best-action/readiness summary, contextual left navigation inside the project workspace, clearer edit controls, and financing status placed in a readiness/financial section rather than the basic details form.
4. Estimate quick-create sheet that adapts to launch context: project-launched locks/preselects project and customer; global launch requires searchable customer and project selection; customer-launched locks customer and requires project selection or safe project create. Avoid duplicate customer/project search UI.
5. Long-term estimate editor Items workspace with group-first item authoring. Each group has name, item count, subtotal, add action, and overflow menu. Add Item drawer has sources: Cost Item Database, Template/System, Previous Estimate, Custom Item. De-emphasize the permanent Catalog Items panel into the drawer.
6. Reusable address/contact input states with country dropdown, US and Canada pinned at top, phone and ZIP/postal formatting guidance, and validation states that preserve user input.

Use realistic labels only. Do not invent fake workflows. Do not show internal cost/markup to customers. Keep all records tied to canonical customers, projects, estimates, catalog items, and line-item snapshots.
```

Optional v0 prompt additions:
- include desktop, tablet, and mobile states.
- include empty, loading, validation-error, and overflow states.
- use shadcn-style components and lucide icons if generating React/Tailwind mockups.
- create design components in a way that can later map back to existing FloorConnector shared components.

## What v0 Must Not Change

v0 output must not change:
- database schema or migrations
- auth, organization, membership, or tenant boundaries
- estimate calculations
- invoice behavior
- catalog insertion behavior
- approved estimate snapshots
- schedule of values
- change order behavior
- contract behavior
- customer portal behavior
- notification or communication workflows
- project readiness logic
- estimate creation rules or numbering
- cost item database maintenance rules
- route architecture beyond design suggestions

v0 output must not introduce:
- fake dashboards
- mock business flows
- duplicate customer/project/estimate/catalog models
- local-only persistence
- a separate project app shell
- a full-time app-wide left sidebar
- a direct takeoff-to-invoice flow
- customer-facing internal cost, markup, margin, or hidden markup

## Follow-Up Codex Implementation Phases After Design Approval

### Phase 1: Header Overflow Cleanup

Scope:
- responsive top-nav overflow only.
- preserve existing shell components and navigation config.
- no route changes.

Validation:
- desktop wide, desktop medium, tablet, and mobile navigation screenshots.
- active route visible when inside overflow.
- global search, notifications, universal create, organization identity, and account actions still work.
- `pnpm typecheck`
- `pnpm lint`

### Phase 2: Project Quick Create Picker

Scope:
- replace customer select with searchable picker.
- add inline create-new-customer only if it reuses safe canonical customer creation.
- preserve validation state.

Validation:
- create project from global `/projects`.
- create project from customer context.
- validation failure preserves customer/project inputs.
- large customer lists remain searchable.

### Phase 3: Project Detail Sectioning

Scope:
- introduce contextual project workspace navigation.
- move financing status presentation to readiness/financial section.
- clarify edit controls.
- preserve current project data and actions.

Validation:
- navigate project sections on desktop and mobile.
- update basic project details.
- verify readiness/financial copy remains display/UX only unless an existing action already supports it.

### Phase 4: Estimate Quick Create Context Cleanup

Scope:
- unify customer/project selection patterns.
- lock project/customer when launched from project.
- require customer/project when launched globally.
- remove duplicate search/list UI from the flow.

Validation:
- create estimate from project.
- create estimate from customer.
- create estimate globally.
- validation errors preserve selected context.

### Phase 5: Estimate Editor Group-First UI Preparation

Scope:
- UI-only regrouping/layout cleanup from the group-first refactor plan.
- do not alter catalog insertion, system insertion, import behavior, schema, or calculations.

Validation:
- group create/rename/delete persists.
- existing catalog/system/import flows still work.
- inserted estimate lines remain editable snapshots.
- portal and estimate detail grouped output remain intact.

## Files Likely To Change Later

Likely implementation files after design approval:
- `apps/web/components/protected-app-top-nav.tsx`
- `apps/web/components/app-shell-mobile-nav.tsx`
- `apps/web/components/protected-app-nav.tsx`
- `apps/web/lib/navigation/navigation-config.ts`
- `apps/web/components/project-quick-create-form.tsx`
- `apps/web/components/customer-picker-field.tsx`
- `apps/web/components/project-form.tsx`
- `apps/web/app/(app)/projects/page.tsx`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `apps/web/components/estimate-quick-create-form.tsx`
- `apps/web/app/(app)/estimates/page.tsx`
- `apps/web/components/estimate-form.tsx`
- `apps/web/components/estimates/items-section.tsx`
- `apps/web/components/estimates/estimate-workspace-shell.tsx`

This list is planning-only and should be narrowed before implementation.
