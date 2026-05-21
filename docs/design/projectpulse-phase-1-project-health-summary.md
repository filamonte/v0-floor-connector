# ProjectPulse Phase 1 - Project Health Summary

## Purpose

ProjectPulse Phase 1 adds a read-only project health and Next Move summary to
Project Workspace. It gives contractors one practical view of whether a project
is clear, blocked, or needs attention by combining existing project readiness,
commercial, CrewBoard, FieldTrail, MessageCenter, invoice, payment, and
signature signals.

This is deterministic display logic only. It does not create a project health
table, duplicate status model, automation layer, or AI recommendation system.

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/target-ia.md`
- `docs/vision.md`
- `docs/Roadmap.md`
- `docs/chat-handoff.md`
- `docs/product-language.md`
- `docs/product-language-audit.md`
- `docs/design/crewboard-phase-1.md`
- `docs/design/crewboard-phase-2-dispatch-usability.md`
- `docs/design/fieldtrail-phase-1-project-execution-timeline.md`
- `docs/design/messagecenter-phase-1-project-communication-timeline.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`

## Existing Data Used

ProjectPulse reads existing project workspace context only:

- projects and customers
- estimates and approved estimate state
- contracts and signature readiness context
- jobs and scheduling state
- invoices and open balance state
- existing Ready Check / GateKeeper readiness snapshot
- FieldTrail summary from daily logs, field notes, execution attachments, time
  cards, and jobs
- MessageCenter summary from communication messages, Send Trail, Signature
  Trail, and Payment Trail records

No schema, migrations, write helpers, server actions, or new data tables were
added.

## Project Workspace Changes

Project Workspace now includes a ProjectPulse panel near the top of the page
after the existing project command summary. The panel is a section, not another
page header, and keeps the existing Graphite/Copper workspace rhythm.

## ProjectPulse Signals Implemented

ProjectPulse shows:

- project stage label
- health tone: good, attention, blocked, or neutral
- primary health message
- deterministic Next Move link
- blocker, warning, or highlight summary
- compact signal cards for Commercial, Schedule / CrewBoard, FieldTrail,
  MessageCenter, and Billing / Payment Trail
- linked counts for jobs, open blockers, Daily Job Logs, communication items,
  unpaid invoices, and signature/payment attention

## Next Move Rules Implemented

The first matching deterministic rule wins:

- Ready Check / GateKeeper blockers point to resolving the Ready Check.
- Approved estimate without a contract points to contract preparation.
- Contract still waiting on signature points to the Signature Trail contract
  workspace.
- Ready unscheduled jobs point to CrewBoard.
- Active execution without a current Daily Job Log points to FieldTrail / Daily
  Job Log review.
- Open FieldTrail blockers point to FieldTrail.
- Open invoice balances or Payment Trail attention point to invoice/payment
  review.
- MessageCenter attention points to MessageCenter.
- Clear state falls back to continuing project review.

ProjectPulse does not mutate records, create tasks, send communications, or
execute actions.

## Behavior Preserved

Existing behavior remains owned by the existing workspaces and server actions:

- Ready Check / GateKeeper enforcement
- schedule and crew assignment behavior
- FieldTrail daily-log, field-note, attachment, and time-card behavior
- MessageCenter communication, Send Trail, Signature Trail, and Payment Trail
  behavior
- estimate, contract, invoice, payment, and signature math/state
- auth, tenant boundaries, RLS, portal grants, settings, and platform-admin
  behavior

## Not Implemented Yet

- health score math
- AI-generated project summaries
- automated task creation
- notification automation
- customer-facing ProjectPulse
- advanced profitability scoring
- predictive schedule risk
- external calendar or accounting sync
- standalone analytics dashboards

## Follow-Up Candidates

- Extract the ProjectPulse panel into a reusable component if project workspace
  complexity keeps growing.
- Add more precise schedule and crew coverage signals once CrewBoard has deeper
  capacity planning.
- Expand billing detail only after progress billing and payment trails have a
  broader shared summary model.
- Add browser-level regression coverage only after the panel stabilizes.
