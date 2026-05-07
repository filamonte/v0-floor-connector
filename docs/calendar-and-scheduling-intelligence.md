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
- customer-visible appointment storage is implemented for future portal display, but portal appointment UI/RLS is not implemented yet
- future customer-facing appointment views must use `customer_notes` only when `customer_visible` is true and must not expose legacy/internal appointment notes
- scheduling fields on jobs are the starting point for production schedule state
- `/schedule` is the contractor scheduling surface
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

The existing `/schedule`, jobs, appointments, and job assignment foundations are the base to extend.
