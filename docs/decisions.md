# FloorConnector Decisions

Status: Active
Doc Type: Operational

Use this file to reduce repeat debates and prompt drift.
If a decision here conflicts with [docs/current-state.md](C:/FloorConnector/docs/current-state.md), update this file to match current-state.

## Current Decisions

### D-001 Project Is The Operational Root

Project is the main contractor workspace for connected delivery work.
Global routes still exist, but they are cross-project queues and Manager Page surfaces, not replacement workflow homes.

### D-002 Contractor App And Portal Share Canonical Records

The contractor app and portal operate on the same contracts, invoices, payments, and related project continuity.
Do not create portal-only copies of shared business records.

### D-003 Dashboard Is An Entry Surface, Not A Separate Product World

Dashboard should summarize, prioritize, and route into shared records.
It must not become a disconnected module hub with private workflow logic.

### D-004 Global Search Is Shell-Level And Canonical

Global search now lives in the shared contractor header.
It must stay tenant-safe and route into real canonical records instead of search-only summaries or fake result objects.

### D-005 Scheduling Depth Stays On Canonical Jobs

The real scheduling/calendar layer belongs to `/schedule` and stays on the canonical job model.
Do not create dispatch-only records or a second scheduling system detached from jobs.

### D-006 Appointments Are Not Jobs

Appointments are canonical visits, meetings, and planning blocks tied to the same opportunity/customer/project chain.
They must not replace jobs or become a second dispatch model.

### D-007 Punchlists Are Durable Execution And Closeout Records

Punchlists are real canonical execution records tied to project and optional job context.
They are not daily log narrative and should not become a separate field-quality subsystem.

### D-008 Progress Billing / SOV Must Stay On The Canonical Invoice Chain

Progress billing works from approved estimate -> schedule of values -> invoice.
Do not introduce detached pay-app records, spreadsheet shadow models, or invoice replacement workflows.

### D-009 Quick-Create Must Create Canonical Records First

Quick create exists to start real records quickly, then hand off into the full workspace.
It must not become a draft silo or alternate authoring system.

### D-010 Project Detail Is The Readiness And Continuity Hub

Project detail is the main place to understand blockers, connected records, and next actions across the workflow.
Downstream pages should support that hub, not compete with it.

### D-011 Shared Contractor UI Baseline Is Locked Enough To Build On

The contractor shell now follows the newer top-nav-first, black/gray/orange/white direction with shared manager wrappers and command bars.
Future work should preserve this baseline instead of reopening shell-level styling decisions.

### D-012 Do Not Reintroduce Module Silos Or Duplicate Entities

Do not create separate customer, project, invoice, job, payment, appointment, or search models inside modules.
Extend the shared chain instead.
