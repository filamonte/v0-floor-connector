# FloorConnector UI Build Rules

Status: mandatory implementation rules for future UI and module work.

These rules are the default for all future FloorConnector UI changes unless a task explicitly approves an exception.

## Strict UI Standardization Rules

- Do not invent new layouts.
- Do not invent new page structures.
- Do not create one-off card patterns.
- Do not create new interaction styles unless explicitly approved.
- Reuse the existing Manager Page pattern for list and queue pages.
- Reuse the existing Record Workspace pattern for detail pages.
- Reuse shared context-card patterns such as the existing production-schedule or schedule-handoff cards and `RelatedConversationsCard`.
- Use Contractor Foreman as the primary UX interaction reference for:
  - flow order
  - speed
  - button placement
  - action visibility
  - estimate-builder behavior
  - next-step handoff
- Do not copy Contractor Foreman's data model or module separation.
- FloorConnector must remain canonically better:
  - one shared lifecycle
  - no duplicate business models
  - estimate -> contract -> SOV -> invoice chain
  - snapshot-based financials
  - append-only financial mutations
  - portal and contractor use the same canonical records
- Core product direction: CF feel on a better system.
- Every workflow page should clearly answer: "What do I do next?"

## 1. No Custom Module Shells

- Do not create per-module app shells.
- Do not create nested navigation systems inside modules.
- Do not create local module chrome unless explicitly approved.
- Modules must use shared FloorConnector app shell and page patterns.
- FloorConnector may intentionally match Contractor Foreman structure and workflow behavior where modeled, but it must retain FloorConnector colors, branding, typography, naming, and product identity.
- Do not blindly copy Contractor Foreman visual branding.

## 2. Use Existing Shared Components First

- Reuse existing workspace, page, header, grid, and settings components before creating new layout primitives.
- Do not invent new layout wrappers if an existing shared component already fits.
- Prefer adapting existing shared patterns over introducing module-specific UI structure.
- Major business modules must use the shared `StandardWorkspaceLayout` when they need a persistent workspace pattern.
- Current required workspace targets include Cost Items Database, Estimates, Invoices, Projects, Change Orders, and future CRM / Leads.

## 3. Module Pages Must Follow Standard Structure

- Each major top-level module should have one canonical module home route when the section contains multiple related work surfaces.
- Work routes should stay operational and task-focused.
- Settings routes should exist only for configuration and defaults.
- Do not place settings UI inside operational pages.
- Do not turn dashboard routes into settings pages.
- Standard workspace shape is:
  - shared app header from the existing shell
  - shared workspace header
  - optional summary or status band
  - optional command or action bar
  - persistent left-side workspace nav when the module has multiple views
  - main content area

## Module Home Standard

- A Module Home is the first route inside a major section and acts as the control-panel entry point for that domain.
- A Module Home is not a second dashboard and is not a settings page.
- A Module Home should help users understand:
  - what this section owns
  - which queues need attention now
  - which downstream workspaces to open next
- A Module Home should be dense and operational:
  - compact summary metrics are allowed
  - queue sections are allowed
  - quick-link sections are allowed
  - avoid large marketing cards or decorative dashboard treatments
- A Module Home should reuse existing canonical data sources only unless a task explicitly asks for new domain logic.
- Module Home content should summarize and route into real work surfaces rather than duplicate their full manager behavior.
- Placeholder module homes are allowed when the route is being defined ahead of a full build, but they must clearly state intended purpose and must not invent fake records or fake metrics.

Current Phase 1 module-home definitions:
- `Financials Home` at `/financials` is the financial control-panel route for cross-project billing and cash visibility.
- `Accounts Receivable` at `/financials/accounts-receivable` is a spec-first placeholder for receivable follow-up, aging, and collections workflow that will continue to use canonical invoices and payments.
- `Accounts Payable` at `/financials/accounts-payable` is a spec-first placeholder for vendor obligations, bills, and outgoing payment workflow once payable-side records are introduced canonically.

## 4. Navigation Consistency

- Main contractor modules live in main application navigation.
- Settings pages live in settings navigation.
- Super admin pages live in super admin navigation.
- Do not mix these navigation layers.
- Do not make a module appear under Settings when the route is a main module route.
- Left workspace nav controls views inside the active workspace.
- Left workspace nav does not replace main app navigation.
- Left workspace nav must not become a custom module shell.
- Left workspace nav may be an icon-first rail or a fuller rail depending on module needs, but spacing, hover state, active state, and tooltips must stay consistent.

## 5. Visual Consistency

- Match existing FloorConnector and contractor-facing density.
- Contractor app uses the accepted Graphite & Copper design system (see `docs/design-system-comprehensive-prompt.md` for the visual reference):
  - **Graphite (#374151)** for primary chrome, headers, and strong navigation
  - **Graphite Dark (#1F2937)** for secondary chrome and emphasis
  - **Copper (#B45309)** for primary actions, CTAs, active action emphasis, and focus treatment
  - **Soft Cream (#FAFAF8)** for page backgrounds and work surfaces
  - **Warm Gray (#E8E6E1)** for borders, dividers, and subtle separation
  - **Soft Graphite (#F3F4F6)** for active/highlighted states and selections
- Blue must not be used as the default contractor-app accent for buttons, links, focus rings, page chrome, manager tabs, sort controls, or utility states.
- Green / emerald is reserved for semantic success, approved, paid, or completed statuses. It must not be used as primary app chrome, active navigation, generic health decoration, or default positive emphasis.
- Red / rose is reserved for destructive, error, blocked, or missing-required-action states.
- Amber is reserved for warning, pending, or prerequisite-needed states.
- Non-semantic informational panels, filters, sort controls, table states, and utility actions should use warm gray, near-black, white/off-white, and copper rather than blue, green, cyan, indigo, purple, or teal.
- Use compact headers.
- Use dense operational grids.
- Use small action buttons where appropriate.
- Prefer dropdown actions for row-level controls.
- Do not introduce hero sections unless explicitly approved.
- Do not use marketing-style cards for work modules.

## 6. Domain Boundaries

- Operational pages are for work.
- Settings pages are for defaults and configuration.
- Super admin pages are for platform defaults, seeds, and platform controls.
- Do not mix operational work, settings configuration, and super admin responsibilities on the same page.
- Module work happens in the module workspace.
- Module settings live under Settings.
- Super-admin defaults and seeds live under Super Admin.
- Taxes live in Financial Settings, not Cost Items settings.

## 7. Feature Availability

- Optional modules and features may be enabled or disabled from settings or admin controls.
- Core modules cannot be disabled.
- Cost Items Database is a core module.
- Inventory is an optional module feature.

## 8. Commercial Engine Protection

- Do not change pricing logic unless the task explicitly asks for it.
- Do not change estimate logic unless the task explicitly asks for it.
- Do not change invoice logic unless the task explicitly asks for it.
- Do not change commercial snapshots unless the task explicitly asks for it.
- Do not change schema unless the task explicitly asks for it.
- Do not change inventory logic unless the task explicitly asks for it.
- Do not change schedule-of-values or contract logic unless the task explicitly asks for it.
- UI work must not rewrite business rules.

## 9. Required Codex Plan Checks

Every Codex UI implementation plan must explicitly state:

- whether `StandardWorkspaceLayout` is used
- whether any new shell or layout wrapper was introduced
- whether existing shared components were reused
- whether settings, work, and super-admin boundaries were preserved
- whether FloorConnector colors, branding, and typography were retained
- whether pricing, estimate, invoice, and related business logic were untouched

## Workspace Sidebar Pattern (CF-style)

Some modules require a persistent left-side workspace navigation.

This is not a custom module shell.

This is a standard pattern allowed across the app.

Rules:

1. Sidebar purpose

- filter the current dataset
- switch views within the same workspace
- not navigate to completely different apps

2. Sidebar characteristics

- vertical icon list with tooltips
- fixed width
- always visible within the workspace
- does not replace main app navigation

3. Allowed usage

- Cost Items Database
- Estimates (future alignment)
- CRM / Leads (future)
- any data-heavy workspace

4. Not allowed

- no nested routing system
- no independent navigation config
- no separate app feel
- no duplication of main navigation

5. Behavior

- sidebar changes view state, not route, when practical
- lightweight route params are acceptable when state needs a URL
- the grid or primary workspace remains the main focus

6. Visual rules

- compact
- icon-first
- consistent across modules
- no large labels; use tooltips
- use the same sidebar sizing, spacing, icon sizing, hover state, and active state across modules unless a task explicitly approves an exception

7. Integration

- must live inside the standard workspace layout
- must not introduce a new module shell
- must reuse a shared layout container

## Dashboard Is a Workspace State (CF rule)

Dashboards are NOT separate page layouts.

Rules:

1. A module has ONE workspace layout

- header
- left sidebar (if applicable)
- main content area

2. Dashboard is just a STATE of that workspace:

- shows summary content instead of grid
- uses same layout structure
- sidebar remains visible

3. Do NOT:

- create separate dashboard layout
- remove sidebar on dashboard
- change container structure

4. Example:

Correct:
Sidebar + Workspace -> shows summary OR grid

Incorrect:
Dashboard page -> different layout
Items page -> different layout
