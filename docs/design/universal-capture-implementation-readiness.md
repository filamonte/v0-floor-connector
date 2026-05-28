# Universal Capture Implementation Readiness Audit

Status: Planned
Doc Type: Design Audit

## Scope

This audit reviews whether FloorConnector's existing Work Items, Quick-Create,
dashboard, operational cue, scheduling, and assistant foundations are ready for
a first Manual Universal Capture implementation slice.

This is not an implementation document. It does not add schema, migrations,
routes, UI, server actions, tests, or runtime behavior.

Audit disposition: the existing foundations are strong enough for a narrow
manual Phase 0 only. They are not strong enough for unresolved capture
persistence, route/geographic grouping, assistant execution, autonomous
scheduling, or customer-facing actions.

Post-audit implementation note: Manual Universal Capture Phase 0 now exists as
a shell/dashboard handoff into `/dashboard?capture=1#universal-capture`. The
dashboard composer creates an internal Work Item through the existing Work Item
server action for clear follow-up/action intent only. It does not add
`capture_items`, route/geographic metadata, assistant staging, reminders,
customer-facing sends/bookings, portal visibility, schema, migrations, or
source-record mutations.

## Sources Reviewed

Primary docs:

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md)
- [docs/vision.md](C:/FloorConnector/docs/vision.md)
- [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)
- [docs/platform-build-registry.md](C:/FloorConnector/docs/platform-build-registry.md)
- [docs/design/universal-capture-model-design.md](C:/FloorConnector/docs/design/universal-capture-model-design.md)
- [docs/design/universal-capture-ui-blueprint.md](C:/FloorConnector/docs/design/universal-capture-ui-blueprint.md)

Architecture and code areas reviewed:

- `work_items` migration, constants, schemas, data/actions, read models,
  prefills, create form, and list surfaces
- `/field/work-items` mobile assignee queue and Work Item detail behavior
- Work Item evidence attachment storage and preview references
- Universal Create menu and Quick-Create ADR/patterns
- Manager Page quick-create forms and `?compose=1#...` routing
- Dashboard work-item widgets, My Work queues, operational cockpit, and project
  cue previews
- Operational cue derivation, responsibility resolution, cue-state persistence,
  and cue-to-work-item prefill
- Schedule links, proposed move helpers, CrewBoard scheduling summaries, and
  warnings
- AI Operational Copilot summaries, deterministic draft actions,
  communications handoff, and provider-disabled review boundary
- GateKeeper confirmation/execution-request helpers that intentionally stage
  review state without creating opportunities or executing workflows

## Executive Readiness Conclusion

FloorConnector is ready for a narrow Manual Universal Capture Phase 0 if the
first slice reuses existing Work Items and Quick-Create paths instead of adding
a new persistence model.

The audit answer is "ready, with constraints." The system can safely support
manual capture that either becomes an internal Work Item or routes the user to
an existing canonical Quick-Create/workspace handoff. It should not yet store
ambiguous operational memory as a new durable object.

The strongest first slice is:

1. A lightweight capture entry/composer that writes clear internal action intent
   into `work_items`.
2. Context-aware routing into existing Quick-Create flows when the user is
   really creating an opportunity, appointment, estimate, invoice, job, or
   communication handoff.
3. Dashboard and related-record visibility through existing Work Item and
   manager-page patterns.

Do not add a `capture_items` table in the first slice. The existing Work Item
foundation is already tenant-scoped, internal-only, assignable, due/priority
aware, source-linked, metadata-capable, evidence-capable, and visible on
dashboard/project/job/source surfaces. A new table is only justified after
manual use proves that unresolved, multi-destination, or route-grouping intent
cannot be represented safely through Work Items plus existing canonical create
flows.

## Existing Foundations

| Foundation                | Current Capability                                                                                                                                                                                                                                                                                                                                                              | Readiness For Universal Capture                                                                                                                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Universal Create launcher | Global shell/mobile menu links to canonical manager pages with `?compose=1` anchors.                                                                                                                                                                                                                                                                                            | Good entry location, but currently link-based and static. It is not yet a capture sheet or context-aware destination picker.                                                                                                                          |
| Quick-Create architecture | Manager pages expose narrow create forms that create canonical records first, then route users into real workspaces.                                                                                                                                                                                                                                                            | Strong reuse point. Universal Capture should route into these flows instead of duplicating customer, opportunity, project, job, appointment, invoice, or communication creation.                                                                      |
| Work Items                | `work_items` supports title, description, open/completed/dismissed status, priority, kind, due date, assigned person, optional source record, customer/project links, link path, internal visibility, dedupe key, metadata, audit fields, RLS, dashboard/project/job/source read models, measurement notes via metadata, attachment counts, and work-item evidence attachments. | Strongest V1 destination for callbacks, reminders, follow-ups, internal tasks, field follow-up, finance follow-up, and assignment-style capture.                                                                                                      |
| Work Item field view      | `/field/work-items` shows assigned Work Items through the current user's linked people record, and detail pages expose notes, measurement context, internal evidence previews, field state metadata, and completion notes.                                                                                                                                                      | Confirms Work Items can carry real field action context after capture; it should be a destination/read surface, not the capture composer itself.                                                                                                      |
| Work Item UI              | Existing create form is source-record based and expects `sourceType`, `sourceId`, and `linkPath` props. Source-specific pages can prefill Work Items from cues.                                                                                                                                                                                                                 | Useful but not enough for global capture. Phase 0 needs a thin capture composer or adapter over existing Work Item creation rather than a new table; it should support unlinked internal Work Items only where server validation already allows them. |
| Operational cues          | Deterministic cues derive from estimates, contracts, invoices, and jobs; responsibility can resolve to users/people/roles; cue states can snooze/dismiss supported cues; cue-to-work-item prefill prepares user-confirmed Work Item creation.                                                                                                                                   | Reuse as source context and recommendation input. Do not persist captures as cue states or treat cues as business records.                                                                                                                            |
| Dashboard queues          | Dashboard already has Work Item widgets, My Work queues, operational cockpit previews, project cues, schedule pressure, appointment follow-up bridges, and canonical shortcuts.                                                                                                                                                                                                 | Ready to surface Phase 0 Work Items without a new dashboard subsystem. Unresolved capture queues are later.                                                                                                                                           |
| Manager Page system       | Manager pages are the create/review surfaces for canonical records and already carry compose/open-label behavior.                                                                                                                                                                                                                                                               | Reuse for destination routing. Universal Capture should not create a separate manager page in Phase 0.                                                                                                                                                |
| Assignment and ownership  | Work Items assign to active, assignable `people`; operational cues resolve responsibility from record/user/person/role defaults.                                                                                                                                                                                                                                                | Sufficient for assignment-style V1. Broader owner/assignee semantics can wait.                                                                                                                                                                        |
| Scheduling linkage        | Schedule links, proposed move summaries, job assignment, CrewBoard filters, and schedule warnings operate on canonical jobs/appointments.                                                                                                                                                                                                                                       | Ready for routing to schedule/appointment workflows, not ready for route grouping or schedule optimization.                                                                                                                                           |
| Assistant foundations     | Copilot is deterministic/review-first, can draft internal/customer communication handoff URLs, and explicitly does not send, save, approve, schedule, invoice, sign, or collect anything.                                                                                                                                                                                       | Compatible with future assistant-prepared actions, but lacks a durable action-staging model. Assistant execution is not ready.                                                                                                                        |

## Reuse Opportunities

Manual Universal Capture can reuse directly:

- `work_items` for internal action captures, including title, instructions,
  due date, assignee, priority, customer/project links, source links,
  measurement notes in metadata, and internal evidence attachments.
- `createWorkItem`, `workItemCreateSchema`, tenant validation, assignable-person
  validation, and internal-only visibility enforcement.
- Work Item dashboard/project/job/source read models and queue sorting.
- Mobile assignee Work Item read models for field execution after a capture is
  assigned.
- Existing Work Item evidence storage and preview behavior for later
  context-rich assignments, without putting upload inside the first capture
  sheet.
- Universal Create as the shell entry point.
- Quick-Create manager-page routes for canonical destinations.
- Cue-to-work-item prefill logic for deterministic suggestions that remain
  user-submitted.
- Communication handoff links for review-first drafts, not sends.
- Schedule link helpers for routing to schedule or appointment workflows.
- GateKeeper-style review/request patterns for future assistant-prepared
  actions that need explicit confirmation and a separate execution boundary.

Universal Capture should not duplicate:

- customers, contacts, opportunities, projects, jobs, estimates, contracts,
  invoices, payments, appointments, communication threads, Daily Logs, Field
  Notes, Work Items, workflow cue states, or schedule records
- dashboard queue systems that already render canonical work pressure
- assistant-owned action truth or provider send queues
- route optimization or map-routing infrastructure

## Gaps Before A Broader Capture Layer

The existing foundation is strong, but these gaps remain:

- Global capture UI is not implemented. The current Universal Create launcher is
  a static link menu.
- The Work Item create component is source-record oriented even though the
  schema/table can support unlinked internal Work Items.
- Universal Capture has no server-owned adapter that decides whether a captured
  intent should become a Work Item or route to an existing Quick-Create flow.
- Work Item `kind` values do not include every future capture type such as
  callback, reminder, site visit, schedule intent, route grouping, field
  follow-up, or finance follow-up.
- There is no typed route/geographic grouping metadata.
- There is no unresolved capture lifecycle distinct from Work Items.
- There is no "review by Friday if nothing is grouped nearby" reminder engine
  beyond due dates and dashboard queues.
- There is no assistant-prepared action staging table for multi-record,
  non-communication actions.
- There is no route batching, area-tag queue, map view, or estimate-route
  suggestion engine.
- There is no mobile-specific one-tap capture flow.

These are not blockers for Phase 0 if Phase 0 is limited to manual Work Item
creation and canonical route handoffs. They are blockers for a broader capture
memory layer.

## Recommended V1 Build Strategy

### Phase 0 - Reuse Work Items And Quick-Create

Build the first Manual Universal Capture slice as a thin entry and resolution
layer over existing architecture:

- Add a compact capture entry from the shell and selected record workspaces.
- Save clear internal actions directly as Work Items.
- Keep Work Items internal-only.
- Use existing `manual`, `human_handoff`, and follow-up-style Work Item kinds
  first rather than adding enum values immediately.
- Use metadata sparingly for planned-only capture classification if needed.
- Preserve the existing Work Item server validation path, including
  organization scope, assignable-person validation, internal visibility, and
  source-record validation where a source is selected.
- Route non-task destinations to existing Quick-Create flows:
  opportunity/new quote request, appointment/site visit, communication draft,
  job/schedule handoff, invoice/finance work.
- Require or infer canonical links when a destination needs them.
- Surface saved action captures through existing Work Item dashboard and
  related-record sections.

This phase should not add `capture_items`.

The Phase 0 implementation should be boring on purpose: a faster entry point
and destination router over existing records, not a new operating model.

### Phase 0.5 - Prove Or Reject Unresolved Capture

After Phase 0 is used, evaluate whether users truly need a durable unresolved
capture object for intent that is not yet a Work Item or canonical record.

Only then decide between:

- extending Work Item metadata and queue language for unresolved internal
  action intent
- adding a narrow `capture_items` table with strict internal-only visibility,
  tenant RLS, explicit resolution fields, and no duplicate CRM/project truth

### Phase 1 - Contextual Queues

Add queue visibility only after the capture destination is stable:

- My Follow-Ups
- Needs Scheduling
- Overdue Operational Follow-Ups
- Waiting On Customer
- Estimate Needs By Area if route metadata exists

Queues must remain lenses over Work Items or canonical records, not a separate
source of truth.

### Phase 2 - Geographic Grouping And Scheduling Intent

Add typed route/geographic intent only after Phase 0/0.5 clarifies the record
model:

- service area or area label
- target address snapshot or rough location text
- grouping note
- review date
- preferred time window

This phase should still avoid route optimization and autonomous scheduling.

### Phase 3 - Assistant-Prepared Operational Actions

Add assistant-prepared capture/action drafts only after manual capture is
proven:

- assistant extracts structured intent
- assistant proposes linked records, destination, due date, assignee, route
  note, and customer draft when useful
- contractor reviews and confirms
- only confirmed actions create/update records or prepare communication/schedule
  handoffs

This requires explicit approval boundaries and likely a durable staging model
for non-communication actions.

## Explicit Strategy Answers

Should V1 create Work Items directly?

Yes, for clear internal actions: callbacks, reminders, follow-ups, field checks,
finance follow-up, measurement requests, employee assignments, and human
handoffs.

Should V1 use a temporary lightweight overlay first?

Yes, as UI only. The first overlay should route to Work Items or existing
Quick-Create destinations. It should not create temporary local-only state or a
new persistence table.

Is a `capture_items` table truly needed yet?

No. It should remain deferred until unresolved or multi-destination capture is
validated by real usage and cannot be modeled cleanly through Work Items plus
canonical record creation.

What should remain docs-only until later?

Route/geographic grouping metadata, unresolved capture lifecycle,
assistant-prepared action staging, grouped estimate scheduling suggestions,
notifications/reminders, mobile voice capture, and portal-safe sharing.

What should not be built yet?

Do not build a standalone capture manager, duplicate task table, duplicate
customer/project/opportunity model, AI scheduler, route optimizer, autonomous
booking, autonomous customer messaging, capture-specific comments, capture file
upload, mobile capture app, or portal exposure.

Also do not build a generic reminder engine, recurring capture lifecycle,
customer-visible capture history, assistant-owned action queue, map grouping
workspace, or a new dashboard queue system in the first manual slice.

## Assistant Readiness

Current architecture is compatible with future review-confirm assistant actions
because:

- Copilot output is deterministic and review-first.
- Draft communication handoffs are URL/query based and parsed by the
  communications layer.
- Provider-backed AI defaults to disabled/fallback.
- Existing copy states that Copilot does not create, send, schedule, invoice,
  sign, collect, or approve anything.
- Work Items and Quick-Create paths can become confirmed destinations.
- GateKeeper-style action review already demonstrates the correct separation
  between saved draft/review/request state and actual workflow execution.

Current architecture is not ready for assistant execution because:

- there is no durable action-staging model for non-communication actions
- there is no review queue for multi-record assistant plans
- there is no route-grouping or schedule-suggestion persistence
- there is no approval/audit model for autonomous or semi-autonomous mutations
- there is no policy layer that maps assistant confidence, missing fields,
  customer visibility, schedule readiness, and provider-send eligibility into a
  single governed execution decision

## UX And System Risks

| Risk                         | Why It Matters                                                                                      | Mitigation                                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Task-app drift               | Universal Capture could become a generic to-do system disconnected from real work.                  | Use Work Items for internal actions and Quick-Create for canonical destinations. Keep queues context-linked.    |
| Silo creation                | A new capture table too early could duplicate Work Items and canonical records.                     | Defer `capture_items`; only add it for proven unresolved intent.                                                |
| Overbuilding                 | Route grouping, assistant actions, mobile, reminders, and dashboards could balloon the first slice. | Ship Phase 0 around Work Items and routing only.                                                                |
| Duplicate operational models | Capture could invent new customer/project/job/schedule meanings.                                    | Store links to canonical records and route state changes through existing workflows.                            |
| AI overreach                 | Assistant prompts could imply customer sends or bookings happen automatically.                      | Keep review-confirm boundaries and no provider sends/bookings.                                                  |
| Competing workflow systems   | Cue states, Work Items, captures, reminders, and dashboard queues could all claim ownership.        | Treat cues as derived signals, Work Items as internal action records, and canonical records as lifecycle truth. |

## Recommendation Matrix

| Phase     | Recommendation                                                   | Persistence                                                    | Build Boundary                                                                                       |
| --------- | ---------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Phase 0   | Manual capture composer over Work Items and Quick-Create routing | Existing `work_items` and canonical records                    | No schema unless a small Work Item UI/action adapter requires none; no portal or assistant execution |
| Phase 0.5 | Validate unresolved capture need                                 | None until proven; maybe `capture_items` later                 | Decision point only after usage                                                                      |
| Phase 1   | Contextual queues                                                | Existing Work Items/canonical read models first                | No standalone dashboard app                                                                          |
| Phase 2   | Route/geographic grouping and scheduling intent                  | Typed metadata or narrow capture model, depending on Phase 0.5 | No route optimization or auto-booking                                                                |
| Phase 3   | Assistant-prepared operational actions                           | Explicit action-staging/audit model if approved                | Review-confirm only; no autonomous sends/bookings                                                    |

## Smallest Safe Implementation Slice

The smallest safe first build is:

1. Add a manual capture entry that can create an internal Work Item.
2. Support title, note/instructions, capture type mapped to existing Work Item
   kind, due/review date, assignee, priority, and optional customer/project or
   source link.
3. Start from the existing shell Universal Create menu plus one or two
   high-value contexts such as Customer and Project Workspace.
4. Route "new quote", "site visit", "communication draft", and "schedule
   intent" to existing Quick-Create or workspace handoff links instead of saving
   them as fake generic tasks.
5. Show saved captures through existing Work Item dashboard/record surfaces.
6. Add tests for tenant scoping, internal-only visibility, link validation,
   unlinked Work Item creation if enabled, and no portal leakage.

The first build should produce no new canonical destination. It should improve
how users reach existing destinations.

This keeps Universal Capture useful without creating a parallel operating
system.

## Explicit Non-Goals

- No feature implementation in this audit.
- No schema or migration in this audit.
- No routes, UI components, server actions, or runtime behavior in this audit.
- No `capture_items` table in Phase 0.
- No portal/customer visibility.
- No autonomous assistant sends, bookings, scheduling, or workflow mutations.
- No duplicate task, CRM, project, job, appointment, communication, or schedule
  system.
- No route optimization.
- No fake data or local-only persistence.
