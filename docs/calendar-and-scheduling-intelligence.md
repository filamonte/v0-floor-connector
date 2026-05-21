# Calendar And Scheduling Intelligence

Status: target direction and planning guardrail only.

This document describes future FloorConnector calendar, scheduling, resource, external calendar integration, and AI scheduling direction. It does not describe implemented product behavior unless [docs/current-state.md](C:/FloorConnector/docs/current-state.md) says that behavior exists.

Use this with:

- [docs/ai-assisted-operating-system.md](C:/FloorConnector/docs/ai-assisted-operating-system.md)
- [docs/ai-contractor-workflows.md](C:/FloorConnector/docs/ai-contractor-workflows.md)
- [docs/communications-and-ai-intake.md](C:/FloorConnector/docs/communications-and-ai-intake.md)

## Principle

FloorConnector owns the canonical schedule.

Google Calendar, Outlook/Microsoft 365, email calendar invites, and other external calendars are integrations or sync surfaces. They can mirror FloorConnector events, import busy blocks, and deliver invites, but they should not replace FloorConnector's canonical schedule or create a second dispatch model.

Scheduling must stay connected to the canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Existing Scheduling Relationship

Current implementation already has first-pass scheduling on canonical jobs and appointments. Future calendar work must build on that foundation.

Important boundary:

- jobs remain the canonical production execution records
- appointments remain canonical visits, meetings, and planning blocks tied to opportunity/customer/project context
- appointments now have explicit customer-visible storage fields: `customer_visible`, `customer_notes`, and `internal_notes`
- contractor appointment create/edit surfaces expose those customer-visible controls and keep internal appointment notes separate from customer-visible appointment notes
- customer-visible appointment storage and first portal display are implemented for project-linked appointments where `customer_visible = true`
- portal appointment views use customer-safe fields only: title/type, date/time, status, location, and `customer_notes`
- portal appointment loaders must not expose legacy `notes`, `internal_notes`, internal communication, assignment internals, or contractor-only scheduling comments
- customer self-scheduling, rescheduling, reminder scheduling/delivery, SMS confirmation delivery, portal confirmation actions, and customer-facing external calendar invites are not implemented; contractor-side manual email confirmation send UI is implemented on appointment workspaces
- scheduling fields on jobs are the starting point for production schedule state
- `/schedule` is the contractor scheduling surface and now shows canonical appointments, including opportunity-linked appointments, alongside scheduled jobs through an internal read model with all/jobs/appointments filtering
- dashboard appointment visibility now shows assigned upcoming appointments when the current user can be safely mapped to an active `people` row, and otherwise falls back to company upcoming appointments with assignee context
- the internal dashboard can label today/tomorrow appointments and include recent canceled/no-show appointment records as contractor follow-up cues; this is visibility only, not reminder delivery or customer-facing confirmation
- appointment workspaces can now explicitly create, list, complete, and dismiss internal `work_items` linked to canonical appointments for contractor-owned prep or follow-up, but no appointment work items are auto-created and no customer reminders are sent
- dashboard appointment cues can now open prefilled appointment-linked work-item creation for manual confirmation, using appointment prep or follow-up defaults; this bridge does not auto-create work items, mutate appointment status, send reminders, or expose anything to the portal
- appointment workspaces can now preview editable customer-safe confirmation copy, manually log customer-visible appointment confirmation messages linked to appointments using `delivery_status = logged`, and manually send email confirmations through the existing notification email path after explicit contractor confirmation
- provider-backed email attempts are linked to canonical communication messages; successful sends mark the message `sent`, while failed attempts remain delivery audit records and do not mutate appointment status, notes, reminders, portal confirmation actions, or external calendar sync
- appointment reminder utilities now support manual email reminder sending: they use customer-safe appointment fields, filter eligible email recipients through contractor-admin managed customer/customer-contact communication preferences, suppress hidden, canceled, no-show, completed, missing-context, missing-time, no-recipient, opted-out/suppressed-recipient, and duplicate-success cases, and record provider attempts through the existing notification delivery audit path
- appointment workspaces now include a contractor-only Customer Reminder panel for explicit one-off email reminder sends, preference-management cueing when filtering leaves no eligible recipient, and recent reminder delivery history
- reminder schedule rows, automated reminder jobs, SMS reminders, and portal reminder actions are not implemented
- do not create disconnected dispatch-only records or AI-only calendar records

## Target Calendar Scope

Future FloorConnector calendar should cover:

- company calendar
- user calendars
- crew calendars
- resource calendars
- sales appointments
- site assessments
- jobs and production schedule
- PTO and vacations
- holidays
- equipment reservations
- vehicle or trailer reservations where needed later
- external busy-block imports
- capacity and availability
- conflict detection
- AI scheduling suggestions

Calendar views may be global, project-scoped, job-scoped, crew-scoped, or user-scoped, but they should read from the same canonical schedule and appointment/job records.

## Company Calendar

Target direction:

- shows organization-wide appointments, jobs, production work, PTO/holidays, and blocked time
- supports role-aware visibility
- gives operations a central view of commitments and capacity

The company calendar should not own separate event truth when the event belongs to a job, appointment, PTO request, holiday, or resource reservation.

## User, Crew, And Resource Calendars

Target direction:

- users can see assigned appointments, jobs, tasks, and availability
- crews can show production capacity and assigned work
- resources can represent equipment, vehicles, trailers, or specialized tools when needed

Resource planning should attach to canonical jobs/appointments and future approved resource records. It should not become a detached scheduling app.

## Sales Appointments And Site Assessments

Target direction:

- lead/opportunity intake can propose or create sales appointments and site assessments
- appointments should preserve `opportunity_id`, `customer_id`, and `project_id` where known
- AI can suggest appointment windows from availability and location context

Appointment scheduling is a supporting workflow stage before or around the canonical project workflow. It does not replace opportunities or jobs.

## Jobs And Production Scheduling

Target direction:

- production scheduling remains job-centered
- crew assignments and schedule windows extend canonical jobs and `job_assignments`
- readiness blockers must be respected before scheduling or execution
- drag-and-drop, capacity planning, route optimization, and dispatch automation are later layers on the same job chain

AI may suggest production schedule changes, but approved server-side scheduling workflows and readiness gates remain authoritative.

## PTO, Holidays, And Availability

Target direction:

- PTO and vacations reduce user or crew availability
- holidays block or warn across company planning
- unavailable windows should influence conflict detection and suggested times

PTO, holidays, and availability should be canonical FloorConnector planning inputs, even when external calendars mirror or expose them.

## Equipment Reservations

Target direction:

- equipment reservations can block capacity for a job or appointment
- future equipment conflicts should be visible before confirming schedule changes
- equipment availability can be included in AI suggestions

Equipment reservations should attach to canonical jobs or appointments where operationally relevant.

## Conflict Detection And Capacity

Target direction:

- detect overlapping jobs, appointments, crew assignments, PTO, holidays, resource reservations, and external busy blocks
- show soft warnings where a conflict is informational and hard blockers where policy or readiness requires it
- explain the evidence behind each conflict

Conflict detection should read canonical schedule data and external busy telemetry. It should not rely on a separate calendar source of truth.

## External Calendar Integration Sequence

Recommended integration sequence:

1. One-way FloorConnector -> external calendar.
   - Publish FloorConnector appointments and job schedule commitments to Google Calendar or Outlook/Microsoft 365.
   - Store provider identifiers only as integration metadata.

2. External busy-block import.
   - Import free/busy blocks from connected Google/Outlook calendars.
   - Use busy blocks for availability suggestions and conflict warnings.
   - Do not treat external event details as canonical FloorConnector schedule truth.

3. Optional two-way sync later.
   - Allow external updates only after conflict rules, ownership rules, permissions, audit behavior, and reconciliation are designed.
   - Imported changes should map back to existing canonical appointments/jobs or land in a review queue.

Google and Outlook should remain adapters. FloorConnector schedule records remain the business source of truth.

## AI Scheduling Suggestions

Target direction:

- suggest sales appointment windows
- suggest crew/job windows based on readiness, capacity, location, crew skills, PTO, holidays, equipment, and external busy blocks
- explain why a time is recommended or blocked
- prepare customer-facing confirmation copy
- prepare internal schedule-change notes

AI must not:

- bypass project readiness gates
- schedule jobs before contract/deposit/financing readiness where required
- commit customer-facing dates without approval
- ignore permissions or tenant isolation
- mutate schedule state outside approved server-side actions

## What Is Not Implemented

Unless [docs/current-state.md](C:/FloorConnector/docs/current-state.md) says otherwise, the following remain target direction:

- full company/user/crew/resource calendars
- Google Calendar sync
- Outlook/Microsoft 365 sync
- external busy-block import
- two-way external calendar sync
- AI scheduling assistant
- dispatch optimization
- equipment reservation scheduling
- PTO-aware capacity planning
- automated appointment reminder work-item creation or customer-facing reminder delivery
- automated appointment reminder schedules
- SMS appointment reminders

The existing `/schedule`, jobs, appointments, and job assignment foundations are the base to extend.
