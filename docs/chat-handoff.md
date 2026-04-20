# This file is the first document to read when starting a new chat or session. - Also known as chat hand off

Status: persistent future-chat reference for the current working branch.

This file is the compact operational handoff for new chats. It is not a replacement for [docs/current-state.md](C:/FloorConnector/docs/current-state.md); when exact implementation detail matters, defer to that file.

## Project Snapshot

FloorConnector is a production-first operating system for specialty contractors. It connects commercial workflow, contracts, billing, payments, workforce/time, and field execution into one shared system instead of splitting the same job across disconnected tools.

Current stage:
- implemented foundation is real across the core contractor workflow
- contractor app and portal both exist on top of shared canonical records
- the product is in system-tightening, UI refinement, and test-readiness mode rather than blank-slate feature foundation work

## Implemented Core System

Implemented and live on the current branch:
- auth, organization bootstrap, and multi-tenant access control
- commercial workflow:
  - opportunities / leads
  - customers
  - projects
  - estimates
- contract workflow:
  - canonical contracts
  - signer routing
  - immutable signature events
  - customer-facing portal sign / decline actions
  - optional contractor countersign
- change-order workflow:
  - canonical change orders
  - contractor draft / send flow
  - customer-facing portal approve / reject flow
  - linked project / contract / invoice continuity
  - first-version approved positive invoice impact through canonical invoice line items
- invoice and payment workflow:
  - canonical invoices and payments
  - immutable payment events
  - customer-facing payment initiation
  - gateway-backed checkout/session creation
  - verified webhook completion on the same canonical payment chain
- contractor app foundations:
  - detail workspaces for project, contract, invoice, and related records
  - contractor settings and super-admin foundations
- customer portal foundations:
  - scoped project access
  - portal home and project surfaces
  - portal contract and invoice review/action flows
- workforce/time:
  - people
  - vendors
  - compliance records
  - punch events
  - derived time cards
- field execution:
  - daily logs
  - field notes
  - lightweight execution attachments

## Current UX / Product Direction

Current shell and workspace direction:
- contractor app now uses top-level navigation as the primary navigation
- the main workspace is wider and more dashboard-first
- the shell/header chrome is now flattened and unified rather than split across competing nav/header layers
- a shared thin workspace band sits beneath the top nav for page context and breadcrumbs
- overview/manager pages should use a shared thin command-bar pattern
- left-side rails should be contextual only, not the default app navigation

Current contractor page direction:
- dashboard is now a card-grid manager surface and the visual reference for the contractor app
- project detail is the main readiness and workflow hub
- estimate, contract, invoice, and job pages should feel like connected record workspaces
- contractor manager pages now follow:
  - page identity
  - command bar
  - overview/list workspace
- pages should read in this order:
  - where am I
  - what matters now
  - what do I do next
  - supporting detail

Current implemented shell direction:
- dashboard, projects, invoices, leads, and contracts already use the newer manager-page pattern
- customers, estimates, daily logs, time, people, vendors, and jobs now also follow that same contractor manager-page system
- contractor project, invoice, and contract detail have already had meaningful hierarchy/clarity passes
- portal home, portal project, portal contract, and portal invoice have also had calmer workflow/hierarchy passes

Important UI decisions already made:
- do not reintroduce a full-time left sidebar as the primary contractor navigation
- do not reintroduce duplicate shell header layers; one shared contractor header/band system is now locked in
- do not use dense stacked-panel dashboards as the contractor dashboard pattern
- do not use permanently open create forms on contractor manager pages
- create flows on contractor manager pages should use the shared composer-sheet pattern
- manager-page create should prefer quick-create overlays that make the canonical record first and then hand off to the full record workspace for full editing
- estimates, invoices, projects, customers, leads, contracts, and daily logs now all use that quick-create-to-workspace pattern
- change orders now use the same quick-create-to-workspace pattern on the contractor side
- do not treat portal as a visually separate product with separate record logic
- prefer command bars, clearer create entry, and calmer manager surfaces over crowded page-top controls
- keep record detail review-first and workflow-oriented rather than provider-dashboard oriented

## Architecture Guardrails

Non-negotiable rules:
- one canonical shared data model
- no module-specific business-record silos
- no portal-specific duplicate customer, contract, invoice, or payment records
- contractor app and portal are two surfaces on the same system
- signatures extend canonical contracts; they do not create a second signed-contract model
- payments extend canonical invoices and payments; they do not create a separate checkout-payment model
- future provider integrations must attach to canonical records and immutable events, not become new source-of-truth models
- change orders must remain canonical shared records tied to the same project, contract, and invoice chain
- preserve tenant isolation and organization-aware access at every layer

## Current Testing / Product Priorities

What is being tested now:
- end-to-end coherence of the connected contractor and portal workflow
- UI clarity and usability across the stabilized contractor shell, dashboard, and contractor manager surfaces
- readiness for broader product testing without broad redesign

Current active concerns:
- the contractor-facing app is now coherent enough for broader testing
- the first minimal but real canonical change-order workflow is now implemented across contractor and portal surfaces
- remaining contractor UI issues are polish and density work, not structural mismatch or shell drift
- the contractor UI normalization phase is complete enough to stop, so future contractor-page work should build on the established baseline rather than reopen the normalization campaign
- deeper reconciliation, retries, richer communications, scheduling, broader reporting, and richer change-order accounting treatment are intentionally deferred

## Near-Term Next Steps

Immediate next work, in order:
1. use the now-stable contractor UI baseline for broader product testing
2. run the broader commercial-to-execution validation path now that change orders are on the canonical workflow chain
3. treat any remaining contractor-page issues as targeted polish, not as another normalization campaign
4. continue the next product slice without reopening the contractor shell and manager-page foundation unless a real usability issue appears
5. keep portal and cross-surface continuity aligned with the same calmer product direction

Intentionally deferred for now:
- deeper payment features such as refunds, disputes, subscriptions, and broader reconciliation tooling
- deeper external e-sign provider work
- richer negative-adjustment, credit, and accounting treatment for change orders
- scheduling/dispatch depth
- communications/messaging
- broader analytics/reporting
- broad app-wide redesign or design-system rewrite

## Notes For Future Chats

How to use this file:
- use this as the first compact orientation point for new chats
- use [docs/current-state.md](C:/FloorConnector/docs/current-state.md) when exact implementation truth is needed
- use [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md) for broader product narrative and investor-friendly framing

Maintenance rule:
- future meaningful implementation work should update this file when it changes:
  - implemented scope
  - product direction
  - architecture guardrails
  - active priorities
  - major UI/navigation direction

If this file and `docs/current-state.md` ever diverge on implementation status, trust `docs/current-state.md` and then bring this file back into alignment.
