# Context-Rich Work Items And Assignments

Status: Implemented Foundation / Evidence Attachment Support / Mobile Assignee View V1 / Planned Depth
Doc Type: Design

## Product Problem

Contractor task assignment is often too thin for real field work. A specialty
surface contractor may need to send an employee or subcontractor a work item
that includes job instructions, current-condition photos, measurements,
customer/project/job context, priority, due date, owner, follow-up notes,
completion evidence, and internal discussion in one place.

FloorConnector should solve this as a connected work-item layer over canonical
records, not as a generic checklist beside the operating system.

## Contractor Foreman Gap / Opportunity

The product gap is not "tasks exist." The gap is that assignment context often
splits across task notes, project notes, photo folders, field reports, schedule
records, and message threads. That split forces office and field teams to
reconstruct what the assigned person needs to know.

FloorConnector's advantage should be a context-rich Work Item that stays
attached to the same `opportunity -> customer -> project -> estimate ->
contract -> change order -> job -> invoice -> payment` chain and can pull the
right project, job, field, evidence, and communication context forward.

## Current Foundations Discovered

Implemented today:

- `work_items` exists as the tenant-scoped internal work/action item foundation.
- Work items already store title, description, status, priority, kind, due
  date, assigned person, optional source link, optional customer/project links,
  internal visibility, safe metadata, creator/updater/completion fields, and
  timestamps.
- Current source types include opportunity, appointment, customer, project,
  estimate, contract, change order, job, invoice, payment,
  communication_thread, notification_event, and workflow_error_event.
- Dashboard, Lead Workspace, Appointment Workspace, Project Workspace, Estimate
  Workspace, and Invoice Workspace can create/list/complete/dismiss internal
  work items through existing server utilities.
- Project guidance and selected estimate/invoice operational cues can prefill
  source-locked work-item drafts, but the contractor must submit the form.
- Daily Job Logs, Job Notes, `execution_attachments`, FieldTrail, Proof Center,
  CloseoutTrail, and Project Evidence already provide project/job field
  evidence continuity.
- Field evidence upload currently attaches files/photos to Daily Job Logs or
  Job Notes through `execution_attachments` and the private `documents` bucket.
- Explicit portal evidence sharing exists for selected active
  `execution_attachment` rows through `portal_evidence_grants`, with
  contractor-only default visibility.
- Canonical `communication_threads` and `communication_messages` exist for
  record-linked internal/customer-visible communication history.
- `/schedule` / CrewBoard already uses canonical jobs, appointments,
  `job_assignments`, people, vendors, projects, and customers.

Missing or intentionally shallow today:

- Work items do not yet have a dedicated Work Items Manager Page.
- Context-Rich Work Items v1 now reuses `description` for instructions/job
  notes and `metadata.measurementNotes` for measurement context. Dedicated
  structured measurement tables are not implemented yet.
- Work items now have direct internal attachment support through
  `execution_attachments.subject_type = work_item`.
- `/field/work-items` now provides a mobile-friendly assigned Work Item queue
  for the current user's linked active assignable `people` record, and
  `/field/work-items/[workItemId]` provides field detail.
- Work items do not yet have a dedicated comment/discussion stream.
- Work items do not yet support richer lifecycle states such as blocked,
  in_progress, ready_for_review, or closed.
- Work items do not yet support team/vendor/subcontractor assignment beyond a
  single assignable person.
- Work items are internal-only and have no portal/customer exposure.

## Context-Rich Work Items V1

Implemented v1 behavior:

- No schema or migration was required.
- The canonical parent record remains `work_items`.
- Instructions/job notes are stored in the existing `description` field.
- Measurement context is stored as safe metadata at
  `metadata.measurementNotes`.
- The shared work-item read model now derives context-rich previews with
  instruction summary, measurement notes, due/overdue state, priority, status,
  assignee id, project/customer ids, source link, and attachment count only when
  real metadata is present.
- The shared work-item list displays instructions, measurement notes, due or
  overdue state, assignee, priority, linked project/customer context, status,
  and existing complete/dismiss actions.
- Project Workspace keeps work items project-scoped and now presents them as
  instruction/measurement-capable internal assignments.
- Job Workspace can create and list job-linked work items using existing
  `source_type = job`, `source_id`, `customer_id`, and `project_id` columns.

Work Item evidence behavior:

- Direct work-item uploads are implemented for project/job-linked work items.
- Work-item photos/files reuse `execution_attachments`, the private
  `documents` bucket, server-generated organization/project storage paths, and
  attachment-id signed URL previews.
- Supported uploads follow the existing field-evidence validation: JPG, PNG,
  WebP, or PDF up to 10 MB.
- Project Workspace and Job Workspace show evidence counts, internal-only
  evidence rows, contractor signed preview/open links, and upload controls.
- Work Item evidence validates same-organization project context; job-linked
  work items also validate that the job belongs to the same project.
- Work Item evidence stays internal-only. It is not automatically customer
  visible, and current `portal_evidence_grants` eligibility remains limited to
  active Daily Log / Job Note execution attachments.

Mobile assignee behavior:

- `/field/work-items` loads only Work Items assigned to the current user's
  linked active assignable people record. If no people record is linked, the
  route shows a safe setup/empty state instead of guessing an assignee.
- The mobile queue groups assigned items into blocked, overdue, today,
  upcoming, and recently completed sections and shows project/customer/source
  context, due date, priority, measurement-note presence, evidence count, and
  field state.
- `/field/work-items/[workItemId]` shows instructions, measurement notes,
  customer/project/source context, assignee, due date, priority, internal
  Work Item evidence previews, and source links where present.
- Field status is schema-free in this V1: `metadata.fieldState` records
  not-started/in-progress/blocked while the canonical `status` remains `open`;
  completion uses existing `status = completed`, `completed_at`, and
  `completed_by` fields plus optional `metadata.completionNote`.
- Field actions are allowed for the linked assignee or owner/admin/manager
  membership only. They do not mutate jobs, Daily Logs, Job Notes, invoices,
  contracts, portal grants, or source records.
- Assignee-side evidence upload is intentionally not included; upload remains
  in the contractor Project and Job work-item panels for now.

V1 non-goals:

- no duplicate task table
- no duplicate work-item attachment schema
- no structured measurement table
- no comments/discussion stream
- no vendor/team assignment
- no assignee-side evidence upload
- no notifications/reminders
- no portal exposure
- no job, Daily Log, Job Note, invoice, contract, or readiness mutation from
  work-item completion

## Canonical Model Proposal

Use **Work Items** as the durable canonical concept.

Avoid introducing a parallel `tasks` table, portal task model, checklist app, or
field-only assignment system. "Task" can remain user-facing shorthand where it
helps, but the durable product concept should be Work Item because it already
exists in code, schema, docs, and workflow guidance.

Recommended future work-item types:

- general task
- field task
- measurement request
- photo/evidence request
- punch-list item
- customer follow-up
- internal office follow-up
- material check
- scheduling follow-up
- closeout item

Near-term model direction:

- Keep `work_items` as the parent action/assignment record.
- Add richer kind/type values only when a build slice needs them.
- Extend source linking instead of copying canonical records into work items.
- Treat structured measurements and attachment/evidence links as child records
  or safe metadata only after the schema design is approved.
- Prefer references to Daily Logs, Job Notes, execution attachments, and
  communication threads over duplicating their content into work items.

## Lifecycle And Statuses

Current implemented statuses:

- open
- completed
- dismissed

Target lifecycle:

- draft, if an item is prepared by a cue, template, or future AI review flow
- open, for assigned or unassigned work not yet started
- in_progress, when a field or office user starts work
- blocked, when progress needs another record, person, customer answer, or
  material/schedule decision
- ready_for_review, when completion evidence or notes need office review
- completed, when the item is done
- dismissed or canceled, when the item is intentionally not pursued

V1 should not reopen completed/dismissed work items unless a later approved
history/audit design supports it.

## Target Behavior

A context-rich work item should support:

- title
- instructions/body
- structured measurement notes or measurement references
- linked customer/project/job
- optional linked daily log, field note, invoice, contract, change order,
  communication thread, portal evidence grant, service ticket, or other
  approved canonical source
- assignee person, and later vendor/team/subcontractor assignment
- creator
- due date
- priority
- status
- internal notes/comments
- attached photos/files
- source context
- completion notes and completion evidence
- audit timestamps and actor ids

The work item should explain what to do while source records remain the system
of truth for commercial scope, schedule state, customer commitments, field
narrative, documents, payments, and portal visibility.

## Attachment / Evidence Approach

Work-item attachments should not create a second file system.

Recommended path:

1. Reuse the private `documents` bucket and server-generated organization-first
   storage paths when direct work-item uploads are approved.
2. Extend the evidence subject model intentionally instead of forcing
   `execution_attachments` to pretend every attachment belongs to a Daily Log or
   Job Note.
3. Work Item evidence now uses this near-term path: `execution_attachments`
   supports `work_item` as an internal subject with same-company project/job
   validation, RLS inherited from the attachment table, portal-negative
   eligibility checks, and Project/Job work-item panel rollups.
4. Keep current-condition photos, measurement photos, and completion photos
   internal-only by default.
5. Use explicit future portal evidence grants or a later explicit sharing
   policy for any customer sharing; do not leak task body, internal comments,
   raw storage paths, Daily Log bodies, or Job Note internals.
6. Keep customer-safe sharing as an explicit grant/review model, not a property
   of the work item itself.

Recommended attachment roles:

- current_condition
- measurement_reference
- instruction_reference
- completion_evidence
- blocker_evidence
- closeout_reference

## Field / Mobile Workflow

A field user should be able to:

- see assigned work items from a mobile-friendly "My Work" or Field queue
- open a Work Item Workspace or compact detail panel
- read instructions and source context
- see linked project/job/customer context
- view job notes, measurement context, and attached photos/files
- jump to the linked Job Workspace, Daily Job Log, or schedule item
- add a completion note
- attach completion photos/files
- mark the work item done, blocked, or ready for review
- optionally create or link a Daily Job Log / Job Note when the assignment
  produces field narrative that should live in the field execution chain

The field workflow should treat work items as actionable instructions and
Daily Logs/Job Notes as field narrative/evidence records. A work item can point
to a field note; it should not replace the field note.

Implemented mobile field V1 covers assigned queue, detail, internal evidence
preview, in-progress/blocked metadata, and done with completion note. It does
not yet cover assignee-side upload, comments, notifications, offline mode,
ready-for-review lifecycle, or portal-safe sharing.

## Project / Job / Customer Integration

Project Workspace should surface:

- open work items
- assigned person/vendor/team
- due and overdue items
- blocked items
- work items tied to open field blockers
- completion evidence or linked field evidence
- completed work items
- related communication thread or discussion status

Job Workspace should surface:

- work items tied to the job
- schedule/crew context
- daily-log and field-note links
- field-ready instructions
- completion evidence status

Customer Workspace may summarize internal work-item counts only when useful for
contractor operations. It must not expose internal details to portal users.

## Communications Integration

Work items should connect to communication without becoming a chat silo.

Recommended behavior:

- A work item can link to an existing project/customer/source communication
  thread.
- Future comments can either be dedicated internal work-item comments or a
  constrained projection of canonical `communication_messages`; this needs a
  schema decision before implementation.
- Assignment updates should become communication context only where useful.
- Customer-facing email/SMS must remain future provider work and require human
  approval, eligibility, consent, and delivery-proof design.
- No automatic email/SMS/reminder should be sent by creating or updating a work
  item in the near-term phases.

## Scheduling / Dispatch Integration

Jobs are execution records/work orders. Work items are assignable actions,
checks, tasks, and follow-through inside or around that work.

Work items can support scheduling by:

- tying a checklist/action to a job before or after the scheduled window
- capturing schedule follow-up without mutating the job schedule
- assigning prep work before a crew arrives
- tracking material/equipment/readiness checks
- tracking blocked work back to the Project Workspace
- giving CrewBoard an internal follow-through signal without creating a
  schedule-only record

Crew assignment remains on canonical jobs and `job_assignments`. Work-item
assignment should not be used as a substitute for scheduled crew assignment.

## Portal / Customer Boundary

Work items are internal-only by default.

Portal exposure should require a future explicit share/review model:

- no work-item body leakage to portal
- no internal comments leakage to portal
- no current-condition or completion photo leakage unless explicitly granted
- customer-safe evidence sharing should use `portal_evidence_grants` or a
  future extension of that explicit policy layer
- customer-visible messages should remain in canonical communications with
  visibility controls, not in internal work-item comments

## Architecture Guardrails

- Do not create disconnected task silos.
- Do not create portal-only tasks.
- Do not duplicate jobs, field notes, daily logs, communication threads, or
  attachment models.
- Do not turn work items into a separate project model.
- Do not expose internal task notes/photos to customers by default.
- Do not create fake data or local-only persistence.
- Do not add schema/migrations without an approved implementation slice.
- Do not weaken tenant isolation, RLS, source-record validation, or server
  validation.
- Do not make work-item completion silently mutate canonical records such as
  job status, invoice status, estimate status, appointment status, or readiness
  gates.

## Phased Build Plan

### Phase 1 - Docs + Model Design

- Adopt Work Items as the canonical concept.
- Document current foundation and missing depth.
- Decide whether direct attachments should extend `execution_attachments` or
  wait for a broader shared file/evidence subject model.
- Define status/kind expansion candidates.

### Phase 2 - Canonical Work Item Foundation

- Add approved status/type fields or child tables only after schema review.
- Add same-company validation for any new source/assignment subjects.
- Preserve RLS and internal-only visibility.
- Add focused server tests for source validation, assignment validation, and
  portal-negative behavior.

### Phase 3 - Contractor Project/Job/Customer UI

- Create richer Project Workspace and Job Workspace work-item panels.
- Add filters for open, blocked, overdue, assigned, and completed work.
- Keep Customer Workspace internal-only and summary-oriented.

### Phase 4 - Assignee / Field Mobile View

- Implemented first slice: `/field/work-items` and detail pages provide a
  mobile-friendly assigned-work queue and source-record-safe field actions.
- Field users can open instructions, context, due date, priority, current
  internal evidence previews, and source links quickly.
- Completion actions are server-owned, assignee/manager validated, and
  source-record safe.
- Future depth: assignee-side upload, comments, notifications/reminders,
  offline support, ready-for-review lifecycle, and richer team/vendor
  assignment.

### Phase 5 - Attachments / Photos / Evidence Continuity

- Implemented first slice: direct internal work-item attachment support through
  `execution_attachments`, with project/job ownership validation, private
  storage, signed contractor preview links, and Project/Job work-item evidence
  panels.
- Attachment-role taxonomy remains future depth. Captions can identify
  current-condition, measurement-reference, blocker, or completion context for
  now.
- Broader FieldTrail, Proof Center, CloseoutTrail, portal, and closeout package
  rollups should only include Work Item evidence after explicit eligibility and
  customer-safe policy are approved.

### Phase 6 - Communication / Comments

- Add internal discussion/comment support.
- Link or project communication context without duplicating message truth.
- Keep provider sends and customer-visible messages out of this phase unless a
  separate communications slice approves them.

### Phase 7 - Portal-Safe Sharing

- Add explicit customer-safe review/share paths only after portal evidence
  policy is extended.
- Share selected evidence, not internal instructions/comments by default.
- Preserve grant/event audit and signed URL boundaries.

### Phase 8 - Notifications / Reminders / Automation

- Add reminder and notification behavior only after deterministic rules,
  delivery eligibility, assignment semantics, and user controls are approved.
- Keep AI and automation review-first and non-autonomous until governed action
  policies exist.

## Explicit Non-Goals

- No schema or migrations in this planning pass.
- No new task app or disconnected checklist module.
- No portal/customer task exposure.
- No automatic work-item generation.
- No automatic email/SMS/provider send.
- No AI-owned task creation.
- No direct mutation of job, invoice, estimate, contract, appointment, or
  readiness status from work-item completion.
- No duplicate attachment/file/document model.
- No fake data, seed data, or local-only persistence.
