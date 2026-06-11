# Sales Lifecycle Naming V1

Status: Decision packet
Date: 2026-06-11
Branch: `stream/sales-lifecycle-naming-v1`
Worktree: `C:\FC-worktrees\sales-lifecycle-naming-v1`

## Purpose

Resolve the Lead vs Opportunity / Pre-Sales terminology question enough to guide
the next sales workflow improvements without renaming routes, tables, or broad
UI surfaces.

This packet is product architecture and information architecture guidance. It
does not implement schema changes, route changes, status configuration UI,
customer-facing behavior, provider behavior, or a new opportunity model.

## Current State

The canonical lifecycle is:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Current implementation facts:

- The durable pre-customer/pre-project commercial record is the canonical
  `opportunities` table.
- The current contractor manager route is `/leads`.
- The detail route is `/leads/:leadId`, but it loads the canonical opportunity
  by id.
- `/opportunities` currently re-exports the `/leads` manager page instead of
  introducing a separate opportunity surface.
- Opportunity records can link to an optional customer and optional project.
- Estimates must remain linked to a canonical opportunity after the
  estimate-opportunity correction.
- Appointments can link to an opportunity so sales visits, inspections,
  estimate meetings, callbacks, and related schedule visibility stay attached
  before downstream project execution.
- Communication threads/messages can link to the opportunity for pre-conversion
  communication.
- Work Items can link to the opportunity for internal lead follow-up and
  estimate handoff ownership.
- Assessment Packages can now be owned by an opportunity before a project
  exists, while still supporting project continuity after sale.

Current canonical opportunity statuses are:

- `new`
- `contacted`
- `qualified`
- `site_assessment_scheduled`
- `site_assessment_complete`
- `estimating`
- `proposal_sent`
- `won`
- `lost`
- `converted`

The current Lead Workspace already behaves as more than raw intake: it includes
qualification, site visit / inspection, Assessment Package, estimate plan,
Work Items, communication, and activity views. The mismatch is mostly
user-facing mental model and navigation language, not the underlying record
shape.

## User Mental Model

Contractors usually hear "lead" as the first inquiry or unqualified contact:
someone called, filled out a form, asked for pricing, or needs a first touch.
That word works for the first stage, but it becomes weak once the work has a
site visit, inspection, measurements, assessment context, owners, internal
follow-up, or estimate handoff.

"Opportunity" or "Sales Opportunity" fits the active pre-sale commercial
container:

- there may be one inbound lead but multiple possible scopes or projects
- the contractor is qualifying real work, not just storing a contact
- the record can carry site assessment, measurements, photos, notes, and
  estimate-readiness context before a project exists
- the opportunity can link forward to customer, project, estimate, and later
  operational records without re-entry

Site Visit / Inspection belongs in the sales lifecycle as an opportunity-linked
assessment step. Assessment Package belongs under the Opportunity before sale
and remains visible from Project after handoff. Estimate Handoff belongs at the
Opportunity -> Estimate boundary, with internal Work Items carrying owner,
due-date, blocker, and review state.

## Recommended Terminology

Recommended transition language:

- Top-level navigation label: `Sales` eventually, once the app has a broader
  sales domain that may include opportunities, appointments, follow-up, source
  attribution, and future sales settings.
- Current manager/list label: `Leads & Opportunities` during transition.
- Detail/workspace label: `Opportunity Workspace`.
- First-stage label: `Lead Intake`.
- Helper copy: "Use Lead Intake for the first inquiry. Use the Opportunity
  Workspace once the work is being qualified, assessed, planned, or handed to
  estimating."
- Route strategy: preserve `/leads` and `/leads/:leadId` for now.
- Schema strategy: preserve `opportunities` and do not introduce a separate
  lead table.

Why not rename everything immediately:

- `/leads` is already linked from QA, Work Items, appointment flows, route maps,
  and smoke coverage.
- The underlying model is already `opportunities`.
- A broad rename would create churn without improving workflow behavior.
- A safe transition can improve copy and navigation while preserving URLs,
  loaders, tests, RLS, and user bookmarks.

## Ownership Recommendations

Lead Intake owns:

- first inquiry source
- prospect/contact capture
- service interest
- initial notes
- first follow-up need
- whether this is worth qualifying

Sales Opportunity owns:

- qualification
- site visit / inspection state
- sales appointments and callbacks
- requirements summary
- relationship and onsite sales owner metadata
- pre-estimate measurements, observations, photos/files, and notes
- opportunity-owned Assessment Package visibility
- estimate handoff readiness
- internal follow-up Work Items tied to the pre-sale record

Assessment owns:

- structured site knowledge before estimate work
- Assessment Package and child Area / Space context
- customer goals, current conditions, risks, access, parking, site notes,
  recommended system, and estimate handoff notes
- reusable source context that can continue into Project after sale

Estimate owns:

- reviewed commercial scope and price
- estimate line items and commercial snapshots
- estimate authoring, review, approval, revision, and send state
- Estimate Writer role and estimate-specific production work once an estimate
  exists

Project owns:

- operational root after the work is real enough to operate
- readiness, production handoff, job/schedule, field, billing, closeout, portal
  access, and project-specific continuity
- linked assessment context for continuity, not as a duplicate pre-sale source
  of truth

Work Items own:

- internal accountable follow-through, due dates, blockers, assignees, and
  completion state
- estimate handoff and follow-up tasks when explicitly created
- no customer-visible state and no automatic mutation of opportunity, estimate,
  project, schedule, or communication status

## Status Recommendations

Canonical status values should remain the existing enum for now:

- `new`
- `contacted`
- `qualified`
- `site_assessment_scheduled`
- `site_assessment_complete`
- `estimating`
- `proposal_sent`
- `won`
- `lost`
- `converted`

Recommended display labels:

- `new` -> New intake
- `contacted` -> Contacted
- `qualified` -> Qualified opportunity
- `site_assessment_scheduled` -> Site visit scheduled
- `site_assessment_complete` -> Site visit complete
- `estimating` -> Estimating
- `proposal_sent` -> Proposal sent
- `won` -> Won
- `lost` -> Lost
- `converted` -> Converted

Statuses that should be easy to view/change in a later UI slice:

- lead intake state: New intake, Contacted
- qualification state: Qualified opportunity, Lost
- assessment state: Site visit scheduled, Site visit complete
- estimating state: Estimating, Proposal sent
- closeout of sales opportunity: Won, Converted

Canonical values should stay stable until a dedicated status migration is
approved. Display labels can evolve first. Contractor-configurable status names,
ordering, visibility, and required transitions belong in a later Settings /
workflow-configuration slice, not in this decision packet.

## Implementation Phases

### Phase 1: Docs and safe copy guidance only

- Create this decision packet.
- Clarify `docs/workflows.md`, `docs/sales-to-production.md`,
  `docs/target-ia.md`, and `docs/chat-handoff.md`.
- Do not touch schema, routes, loaders, server actions, or app behavior.

### Phase 2: UI label/navigation refinement

- Keep `/leads` route and route params unchanged.
- Change visible manager title toward `Leads & Opportunities`.
- Change detail header toward `Opportunity Workspace`.
- Keep helper copy explicit: first inquiry is Lead Intake; active pre-sale work
  is the Sales Opportunity.
- Update tests only where assertions depend on changed copy.

### Phase 3: Status configuration / workflow controls

- Add safe status editing and status display controls if approved.
- Keep canonical enum values stable unless a migration is explicitly scoped.
- Put future status configuration in Settings / workflow configuration, not in
  ad hoc Lead Workspace state.

### Phase 4: Data model changes only if truly needed later

- Consider a separate intake/source concept only if public acquisition,
  campaign attribution, inbound communications, or website forms need a durable
  pre-opportunity capture object.
- Do not add a duplicate Lead table for the current contractor workflow.
- Any model change would require migrations, RLS review, route/backfill
  strategy, and explicit approval.

## Decision

Use `Sales Opportunity` as the product mental model for the active pre-sale
record, keep `Lead Intake` as the first inquiry stage, preserve `/leads` routes
for now, and preserve the existing `opportunities` schema as canonical truth.

Recommended next slice:

`Lead/Opportunity status controls` should come next if the goal is workflow
operability. It should add or refine safe status visibility/change affordances
over existing opportunity statuses without configurable status persistence yet.

Alternative next slice:

`Universal Capture intent improvements` should come next if the goal is easier
front-door capture. It should prepare canonical opportunities, appointments,
Work Items, or communications without creating a duplicate inbox or lead model.

## Intentionally Unchanged

- No Supabase schema change.
- No database table rename.
- No route rename.
- No broad copy rename.
- No new Opportunity table.
- No status configuration UI.
- No Assessment, Estimate, Project, Settings, Portal, Schedule, or Invoice
  behavior changes.
- No provider, auth, RLS, tenant, payment, signature, scheduling, or portal
  access changes.
