# Graphite / Copper UI System

Status: Active
Doc Type: UI / Implementation

This document is the implementation reference for the current FloorConnector enterprise UI language. It records the Graphite / Copper system established across the protected contractor app, customer portal, super-admin, and settings surfaces.

Use it with:

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/enterprise-ui-system-audit.md](C:/FloorConnector/docs/enterprise-ui-system-audit.md)
- [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md)
- [docs/design/floorconnector-visual-system-evolution.md](C:/FloorConnector/docs/design/floorconnector-visual-system-evolution.md)

If product capability status matters, trust [docs/current-state.md](C:/FloorConnector/docs/current-state.md). This document governs presentation patterns, not implementation truth.

## Purpose

The Graphite / Copper UI system exists to make FloorConnector feel like one mature contractor operating system instead of a set of unrelated module screens.

It prevents:

- route-local visual systems
- blue-heavy or generic SaaS chrome
- oversized rounded cards on dense work surfaces
- scattered action hierarchy
- dead-end empty states
- fake future capability presentation
- settings, portal, contractor, and super-admin boundaries blurring together

This is a presentation system only. It does not authorize schema changes, RLS changes, auth changes, server-action changes, form-payload changes, financial logic changes, payment/signature/readiness changes, scheduling behavior changes, or new workflows.

The Google Stitch Industrial Contrast adoption docs extend this visual reference as design inspiration only. Stitch artifacts may inform hierarchy, contrast, dashboard composition, and mobile review patterns, but they do not replace FloorConnector's implemented truth, top-nav-first shell, canonical lifecycle, or data-backed route behavior. See [docs/design/stitch/README.md](C:/FloorConnector/docs/design/stitch/README.md) and [docs/design/floorconnector-visual-system-evolution.md](C:/FloorConnector/docs/design/floorconnector-visual-system-evolution.md).

## Product Posture

FloorConnector should read as a premium enterprise operating system for specialty surface contractors:

- calm
- structured
- operational
- high-trust
- readable
- contractor-specific
- workflow-aware
- premium but not flashy
- continuity-first rather than module-siloed

The UI should reinforce the canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Project continuity, workflow state, readiness, and next action should be easier to find than decorative content.

## App-Area Distinctions

### Contractor App

The contractor app is the operational command center. It uses the top-nav-first protected shell, compact page identity, Manager Page rhythm, Quick-Create handoff, and Record Workspace language.

Do:

- keep top navigation as primary navigation
- use dashboard and manager-page density as the baseline
- route Quick-Create into canonical full workspaces
- surface project/workflow continuity on detail pages

Do not:

- reintroduce a full-time left sidebar as the primary shell
- make module pages feel like separate apps
- use blue-heavy page bands, filters, or command chrome

### Portal

The portal is a customer-safe project window over the same canonical records. It should be calmer and simpler than the contractor app.

Do:

- use customer-safe copy
- show review/sign/pay actions clearly
- keep shared-record continuity visible without internal-only language

Do not:

- expose internal operational language unless already intentionally surfaced
- make portal records look like portal-only copies
- imply payment, signature, or review behavior that is not implemented

### Super-Admin

Super-admin is a platform-control console, not a contractor work page.

Do:

- keep platform defaults, tenant oversight, starter records, package controls, and module governance visually distinct
- use dense, scannable operator panels
- frame dangerous or platform-level actions carefully

Do not:

- make super-admin pages look like ordinary contractor settings
- soften platform warnings or activation boundaries

### Settings

Settings is the tenant admin console.

Do:

- use compact section headers
- use predictable admin cards, form panels, tables, and save zones
- preserve contractor settings versus super-admin boundaries
- keep unavailable or future behavior honest

Do not:

- turn settings into operational workflow pages
- add settings for behavior that is not already supported
- hide warnings, disabled states, or blocked states for cleanliness

## Shared Primitives

Use shared primitives before creating route-local layout.

### `AppEmptyState`

File: [apps/web/components/app-empty-state.tsx](C:/FloorConnector/apps/web/components/app-empty-state.tsx)

Use for empty manager/list/module states, unavailable-module states, and honest no-data panels. It should include plain-language context and one clear next action when an action exists.

Do not use it to present target-only capability as live.

### `AppModulePlaceholder`

File: [apps/web/components/app-module-placeholder.tsx](C:/FloorConnector/apps/web/components/app-module-placeholder.tsx)

Use for disabled, unavailable, or future module surfaces. It should stay calm, compact, and explicit about availability.

Do not use large decorative shells or imply unavailable modules are functional.

### `DetailPanel`

File: [apps/web/components/detail-panel.tsx](C:/FloorConnector/apps/web/components/detail-panel.tsx)

Use for Record Workspace sections, settings sections, detail-side panels, and readable grouped content.

Do not nest cards inside cards. Put repeated records in repeated cards only when each item is truly a separate record or form panel.

### `ManagerDashboardCard`

File: [apps/web/components/manager-dashboard-card.tsx](C:/FloorConnector/apps/web/components/manager-dashboard-card.tsx)

Use for compact operational metrics and queue summaries on Manager Pages and dashboards.

Do not use it as decorative filler or for marketing-style value props.

### `ProtectedSurfaceHeader`

File: [apps/web/components/protected-surface-header.tsx](C:/FloorConnector/apps/web/components/protected-surface-header.tsx)

Use for protected surface identity: title, operational description, primary action, secondary actions, and contextual metadata.

Headers should wrap safely with long customer, project, organization, or user text.

Use the page-level `h1` for the actual route/workspace title. When `ProtectedSurfaceHeader` is acting as shared shell chrome above a customer-facing page that already renders its own route title, render the shell title as a lower heading level so assistive technology reaches the record or review title first.

### `WorkspaceCommandBar`

File: [apps/web/components/workspace-command-bar.tsx](C:/FloorConnector/apps/web/components/workspace-command-bar.tsx)

Use for search, filters, view controls, and command strips on Manager Pages and operational workspaces.

Do not make command bars louder than the page's primary action.

### `WorkspaceSummaryBand`

File: [apps/web/components/workspace-summary-band.tsx](C:/FloorConnector/apps/web/components/workspace-summary-band.tsx)

Use for compact summaries, status counts, and operational context. It should support scanning and wrapping, not become a second dashboard.

### `FloorConnectorIcon`

File: [apps/web/components/fc-icons.tsx](C:/FloorConnector/apps/web/components/fc-icons.tsx)

Use the shared Lucide-only icon vocabulary for module and workflow symbols. Icons should reinforce canonical areas consistently: dashboard, opportunities, customers, projects, estimates, contracts, change orders, jobs, schedule, invoices, payments, people, vendors, daily logs, time, materials, settings, notifications, global search, progress billing, equipment, service/warranty, bid/RFP, documents/submittals, weather, and inspections.

Rules:

- use Lucide icons only
- keep icon sizing consistent with surrounding text and controls
- mark decorative icons `aria-hidden`
- do not use emoji, hard-hat/toolbox decoration, or random route-local icon choices
- future-module icons may be exported for planning consistency but must not make inactive routes look implemented

### Portal Review Primitives

File: [apps/web/components/portal-review-ui.tsx](C:/FloorConnector/apps/web/components/portal-review-ui.tsx)

Use `portalHeroPanelClassName`, `portalReviewCardClassName`, `portalStatePanelClassName`, `portalInsetPanelClassName`, and `portalMetricPanelClassName` for portal home, project, and review cards.

Do not replace them with route-local consumer-card treatments unless the portal pattern itself changes.

## Layout Patterns

### Manager Page

Use for `/projects`, `/estimates`, `/contracts`, `/invoices`, `/payments`, `/jobs`, `/schedule`, and similar list/queue surfaces.

Shape:

- page identity/header
- command/search/filter strip
- summary cards or summary band
- primary list/table/queue workspace
- clear Quick-Create or primary action
- compact empty state

Manager Pages are entry surfaces into the shared lifecycle, not module-local worlds.

### Detail Workspace

Use for project, estimate, contract, invoice, job, customer, and other record workspaces.

Shape:

- compact header band
- semantic status
- workflow/readiness/next-action context
- primary record surface
- context rail or context cards where useful
- connected-record links
- lower-priority history, metadata, edit, and internal follow-through below

Project Workspace is the continuity hub. Estimate, contract, invoice, and job workspaces support that hub.

### Settings / Admin Page

Use for tenant-owned configuration.

Shape:

- compact settings section card
- clear description
- form panel or table/list
- warnings and blocked states in visible panels
- save/action area near the controls it affects

Settings copy should explain configuration impact without becoming a product tour.

### Portal Review Page

Use for customer-facing project, estimate, contract, invoice, and change-order review.

Shape:

- customer-safe project or record identity
- review state
- one clear primary review/sign/pay action when available
- supporting record facts
- print/save or secondary actions below the main action

Portal pages should feel trustworthy and calm, not internal.

### Super-Admin Overview / Config Page

Use for platform defaults, starter content, tenant oversight, package controls, billing operations, and module governance.

Shape:

- platform-level identity
- operator summary cards
- compact governance panels
- explicit warning/danger framing for platform actions
- tenant-level data visually separated from platform policy

### Unavailable Module / Placeholder Page

Use `AppModulePlaceholder` or `AppEmptyState`.

Shape:

- honest current state
- brief explanation
- one safe action or no action
- no fake records, metrics, controls, or enabled-looking workflows

## Action Hierarchy

### Primary Action

Use for the one action the surface most wants the user to take. Graphite or Copper treatment is acceptable depending on context:

- Copper: action emphasis, create/save/continue, portal primary calls
- Graphite: strong admin/operational commit, settings save, conservative system actions

Only one primary action should dominate an area.

### Secondary Action

Use a white background, warm border, graphite/warm text, and copper hover where appropriate.

Secondary actions support the workflow but should not compete with the primary action.

Shared action classes live in [apps/web/components/action-hierarchy.tsx](C:/FloorConnector/apps/web/components/action-hierarchy.tsx). Prefer them for route-local link/button cleanup when they fit the existing control shape without changing form payloads, links, or submit behavior.

Manager and schedule filter chips should stay compact and stable: use `h-8`, `rounded-[4px]`, warm borders, token text, and graphite selected states where possible. Keep `rounded-full` for badges, counts, and status pills rather than ordinary action buttons.

### Tertiary / Link Action

Use text links or compact link buttons for navigation, continuity, print/save, and lower-priority drill-in.

### Destructive Action

Use cautious red/rose semantics only for destructive, void, revoke, reject, decline, error, blocked, or irreversible actions.

Do not hide destructive actions, but do not make them the visual center unless the whole page is a confirmation surface.

### Disabled / Unavailable Action

Disabled or unavailable actions must explain the blocker when useful. Do not style unavailable future capability as if it can be used.

## Card And Panel Hierarchy

### Summary Metric

Compact, scannable, minimal copy. Use for counts, totals, queue sizes, and operational facts.

### Workflow / Readiness

Use warning or blocker treatment when action is needed. Use neutral treatment for guidance or already-assigned state.

### Form Panel

Compact border, white surface, clear labels, consistent focus treatment, and action zone close to the inputs.

### Warning / Error

Amber for warning, prerequisite, pending, or needs-attention. Red/rose for destructive, error, blocked, rejected, declined, missing-required-action, or void.

Do not make warnings visually equal to passive metadata.

### Metadata / Context

Neutral highlight panels with warm borders. Metadata should support decision-making, not crowd primary workflow actions.

### Empty State

Plain English, one clear next action if available, no dead blank panels, no future-feature pretending.

## Status And Badge Hierarchy

Use shared status helpers where available.

Color rules:

- Green / emerald: accepted, approved, complete, paid, signed, success
- Red / rose: destructive, error, blocked, rejected, declined, void
- Amber: warning, waiting, prerequisite, attention, needs review
- Neutral graphite / warm gray: draft, metadata, in-progress utility, current, assigned, advisory, read-only, preview-only
- Copper: action emphasis, not passive status

Do not use blue, indigo, cyan, purple, or teal as generic information accents in contractor workspaces.

## Table And List Density

Tables and lists should be dense enough for business users but not cramped.

Rules:

- keep row hierarchy clear
- use warm borders and quiet headers
- avoid noisy columns where a link or secondary detail is enough
- preserve important warnings and blockers
- make row actions clear but not louder than record identity
- support horizontal overflow only where a true data table needs it

## Responsive Wrapping

Every protected surface should survive long names, emails, project titles, customer names, and action labels.

Rules:

- headers and action groups must wrap
- buttons should not overflow their containers
- card grids should collapse predictably
- command bars should stack without hiding filters
- portal review pages must remain readable at mobile width
- setup/auth-adjacent pages should avoid negative-margin full-bleed wrappers that widen the viewport; use padded, overflow-contained bands instead

Do not use viewport-scaled typography. Keep stable dimensions for boards, toolbars, tiles, and repeated controls where layout shift would be distracting.

## Accessibility And Focus

Preserve semantic structure first.

Rules:

- route/workspace titles should be the page-level `h1`; repeated section or panel labels should use real heading elements when they introduce meaningful content regions
- keep labels on inputs
- keep form names, hidden inputs, test IDs, action payloads, and routes intact during UI refactors
- use visible focus states on interactive controls
- keep contrast strong on text, warnings, and actions
- do not remove warnings or blocker text to simplify the surface

## Copy Rules

Product naming and terminology are governed by
[docs/product-language.md](C:/FloorConnector/docs/product-language.md). Use
that document for approved names such as GateKeeper, Next Move, Command Center,
Ready Check, Cost Library, Payment Trail, Signature Trail, Customer Access,
Company Controls, and Platform Control Room. These are user-facing labels only;
they do not rename routes, schema, server actions, or internal domain models.

### Operational Language

Use concrete contractor workflow language. The page should answer what this surface is for and what the user should do next.

### Portal Language

Use customer-safe language. Avoid exposing internal-only workflow, pricing, readiness, or operational terms unless already intentionally shown.

### Honest Future Language

Use `planned`, `future`, `unavailable`, `manual only`, `preview only`, or similar direct terms when behavior is not implemented.

Do not describe target-only capabilities as live.

### No UI Self-Narration

Do not use visible in-app text to describe visual styling, layout, keyboard shortcuts, or the existence of the design system. Improve the interface instead.

## Implementation Rules

- Use shared primitives first.
- Use local class constants only when the pattern is truly local or extracting it would create more churn than clarity.
- Avoid route-local class piles.
- Avoid one-off card shapes, large radius drift, blue accents, and decorative shells.
- Preserve behavior, routes, test IDs, forms, hidden inputs, server actions, and payload contracts.
- Keep business logic out of UI refactors.
- Do not change schema, migrations, RLS, auth, tenant boundaries, validation, entitlements, financial calculations, payment/signature/readiness/scheduling behavior, portal access, or lifecycle behavior for polish.
- Do not introduce external UI libraries or CSS-in-JS for visual polish.

## Centralization Guidance

Repeated class patterns that are safe candidates for future consolidation:

- admin field class
- admin panel class
- admin inset/notice class
- primary admin action class
- secondary admin action class
- portal metric/review panel classes
- schedule panel/action classes

Centralize only when a helper reduces real duplication without forcing broad route churn. Documentation is preferred over fragile sweeping refactors.

## Public / Auth Edge Guidance

The public homepage and auth/setup-adjacent surfaces should share the Graphite / Copper identity without pretending to be contractor workspaces.

Rules:

- lead public messaging with FloorConnector as one connected operating system for specialty flooring contractors
- avoid unsupported numeric claims, fake proof, or "free trial" wording that outruns the current early-access activation model
- label roadmap and package depth as planned, future, or operator-reviewed when implementation is not current truth
- use the existing icon library for repeated marketing and auth iconography
- preserve public intake, auth redirects, setup/billing guardrails, and activation boundaries during visual polish

## Future PR Review Checklist

Use this checklist for Codex prompts and PR reviews:

- Does the route use the correct app-area posture: contractor command center, portal customer window, super-admin platform console, or tenant settings console?
- Does the page preserve top-nav-first contractor shell behavior?
- Does the page start with clear identity, purpose, and action hierarchy?
- Is there one obvious primary action where possible?
- Are secondary/destructive/unavailable actions visually distinct and honest?
- Does the page use shared primitives before local layout?
- Are cards compact, warm-bordered, and purposeful?
- Are statuses using semantic color rules?
- Are empty states plain-English and action-oriented?
- Are warnings, blockers, disabled states, and future/unavailable states still visible?
- Do tables/lists scan cleanly and wrap safely?
- Does mobile avoid overlapping, clipped, or overflowing text?
- Are portal words customer-safe?
- Are super-admin controls visually separate from contractor settings?
- Were form names, hidden inputs, server actions, routes, test IDs, and payloads preserved?
- Were schema, RLS, auth, tenant, financial, payment, signature, readiness, scheduling, portal-access, and lifecycle behavior left untouched?
- Does the change avoid fake implementation of unavailable capability?
