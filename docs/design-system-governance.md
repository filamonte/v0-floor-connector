# Design System Governance

Status: Active
Doc Type: UX Governance

This document defines FloorConnector design and UX governance. It consolidates
rules that were previously spread across UI, workflow, and visual-audit docs.
It governs future design decisions; it does not claim product capability status.
Use [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for
implemented truth.

Related docs:

- [docs/graphite-copper-ui-system.md](C:/FloorConnector/docs/graphite-copper-ui-system.md)
- [docs/ui-patterns.md](C:/FloorConnector/docs/ui-patterns.md)
- [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md)
- [docs/product-operating-model.md](C:/FloorConnector/docs/product-operating-model.md)

## Purpose

UX consistency is a core product requirement before beta. It is not cosmetic
polish. FloorConnector should feel like one operational command center for
specialty contractors, not a set of unrelated module screens.

## Design Principles

- Start from the user's next operational decision.
- Preserve source-record continuity.
- Keep dashboards focused on prioritization.
- Route real work to the owning workspace.
- Use consistent status colors by meaning.
- Keep contractor Settings separate from Super Admin platform policy.
- Keep Portal customer-safe, simpler, and scoped to shared records.
- Treat target-only behavior honestly as planned, future, unavailable, or
  blocked.

## Graphite / Copper Governance

The current visual system is Graphite / Copper plus warm neutrals.

Use Graphite for:

- shell structure
- command surfaces
- headers and strong navigation
- high-trust operational framing

Use Copper for:

- primary create/save/continue actions
- intentional action emphasis
- selected focus where the next action matters

Do not use Copper for passive status, repeated decorative borders, or random
metadata accents.

Do not reintroduce blue-heavy contractor page chrome, page-specific color
systems, or unrelated visual languages unless a documented product area
requires a distinct audience treatment.

## Status Color Semantics

Status colors must mean the same thing across screens:

| Color family                   | Meaning                                                                             |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| Green / emerald                | Approved, accepted, signed, paid, complete, success.                                |
| Red / rose                     | Error, blocked, failed, rejected, declined, void, destructive.                      |
| Amber / yellow                 | Waiting, prerequisite, needs attention, warning, needs review.                      |
| Neutral / graphite / warm gray | Draft, current, in progress, assigned, metadata, advisory, read-only, preview-only. |
| Copper                         | Action emphasis, not passive status.                                                |

Avoid blue, cyan, teal, indigo, purple, lime, or pink as default contractor-app
status or identity colors. If a future area needs a new semantic color, record
the meaning before it spreads.

## Page Type Responsibilities

### Dashboard

Dashboard answers: what needs attention?

It should show the highest-signal priorities, queues, blockers, and routing
links. It should not become the workspace that resolves every issue.

### Command Center

Command Centers coordinate action for a domain over canonical records. They
summarize, prioritize, and route. They should not own duplicate records or
private workflow truth.

### Manager Page

Manager Pages are global lists and queues. They support scan, filter, create,
and open-record workflows. Quick-Create creates canonical records and routes
into full workspaces.

### Record Workspace

Record Workspaces own record-specific decision making and follow-through.
Project Workspace diagnoses operational state after sale. Estimate, Contract,
Invoice, Job, and other record workspaces own their immediate business action.

### Detail Page

Detail Pages show a focused record view. They should follow the shared record
workspace grammar when the record participates in the contractor workflow.

### Settings

Settings owns tenant configuration, defaults, templates, guidance controls,
integrations, and organization administration. It should not become an
operational command center.

### Super Admin

Super Admin owns platform policy, starter content, tenant oversight, package
governance, and platform controls. It must remain visually and operationally
distinct from contractor Settings.

### Portal

Portal is a customer-safe review and action surface over shared records. It is
not a customer-owned operational workspace and must not expose contractor-only
language, internal blockers, provider metadata, or portal-only record copies.

## Dashboard Philosophy

Dashboard prioritizes. Owning workspaces act.

Rules:

- Dashboard answers "what needs attention?"
- The owning workspace answers "what do I do about it?"
- Avoid duplicated metrics and repeated data blocks.
- Avoid contractor dashboard, invoice dashboard, and module dashboards
  repeating the same information without a distinct reason.
- Dashboard rows should link to the canonical source record or owning
  workspace.
- Dashboard must not create a private task, metric, AI, financial, or workflow
  truth layer.

## Role-Aware Dashboards And Workspace Personalization

As FloorConnector grows, dashboard layouts and workspace defaults should become
role-aware while preserving one shared canonical workflow and data model.

The preferred personalization model is:

```text
Platform Defaults -> Organization Presets -> User Personalization
```

Role-aware layouts are presentation only. They may reorder, prioritize, filter,
or emphasize cards, queues, actions, and summaries based on a user's
responsibilities, but they must not change canonical ownership, storage,
permissions, or workflow state.

Examples:

- Owners may prioritize financial performance, pipeline visibility, scheduling
  pressure, and company-wide health.
- Sales personnel may prioritize leads, appointments, follow-ups, and estimate
  progression.
- Estimators may prioritize assigned estimates, scope capture, measurements,
  and review queues.
- Office administrators may prioritize contracts, invoices, payments, customer
  communications, and document workflows.
- Operations and field personnel may prioritize schedules, handoff packets, job
  execution, daily logs, and blockers.

Rules:

- Dashboard still answers "what needs attention?"
- The owning workspace still answers "what do I do about it?"
- All role-aware views must operate on the same underlying project, estimate,
  contract, job, invoice, payment, communication, and operational records.
- Do not create role-specific data silos, duplicate queues, alternate workflow
  state, or separate module worlds.
- Role-aware dashboards may improve entry experience and adoption, but the
  source of truth remains the shared canonical record chain.

## Action Hierarchy

- Prefer one primary next action where possible.
- Group secondary actions.
- Move low-frequency actions into overflow, lower-priority sections, or
  progressive disclosure.
- Make blocked or unavailable actions honest about the blocker.
- Keep destructive actions visible but visually cautious.
- Do not make every link look like a primary action.

## Cards, Tables, Badges, And Queues

Cards:

- Use cards for repeated items, detail panels, and genuinely framed tools.
- Do not nest cards inside cards.
- Keep cards compact, warm-bordered, and purposeful.

Tables:

- Use tables for dense comparisons and lists.
- Keep columns meaningful.
- Preserve horizontal scroll only when the data shape requires it.

Badges:

- Use semantic status color rules.
- Do not use badges as decorative labels.
- Keep metadata neutral unless it is a true status.

Queues:

- Queues should be ordered by operational urgency or clear filters.
- Queue items should show source record, blocker/reason, and destination.
- Queues should not become disconnected task systems.

## Mobile-First Assessment Capture

Assessment capture must work on mobile because real site data is collected in
the field, by customers, and during inspections.

Rules:

- Capture only the information needed for the current step.
- Support photos, measurements, areas, site conditions, access notes, customer
  goals, and blockers as first-class capture context when implemented.
- Preserve offline/native-mobile aspirations as future direction until scoped.
- Route customer self-service input into the same Assessment Package chain.
- Do not create portal-only, AI-only, room-only, or field-only copies of the
  same assessment truth.
- Use short forms, stable controls, clear save states, and mobile-safe wrapping.

## UX Governance Checklist

Before approving or reviewing a UX change, ask:

- Does this strengthen one operational command center?
- Does it preserve the canonical record chain?
- Does the page type have the right responsibility?
- Is there one clear primary next action?
- Are dashboard and workspace responsibilities separated?
- Are colors semantic and consistent?
- Are target-only capabilities labeled as future or unavailable?
- Does mobile avoid overlapping or clipped text?
- Does Portal stay customer-safe?
- Are Settings and Super Admin boundaries preserved?

## Do Not Rules

- No dense stacked-panel dashboards as the default pattern.
- No duplicated summary cards across unrelated pages.
- No random color semantics.
- No colors that mean different things on different screens.
- No page-specific visual language unless justified.
- No module dashboards that become separate product worlds.
- No broad redesigns that change behavior while claiming to be visual cleanup.
- No fake metrics, fake records, fake AI, or fake future capability controls.
- No portal-only copies or customer-facing internal workflow leakage.
