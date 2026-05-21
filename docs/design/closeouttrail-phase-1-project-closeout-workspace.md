# CloseoutTrail Phase 1 - Project Closeout Workspace

Status: Implemented

CloseoutTrail Phase 1 adds a read-only project closeout readiness section to
Project Workspace. It helps contractors see whether the project has enough
proof to review closeout without creating a separate closeout subsystem.

## Purpose

CloseoutTrail answers:

- are contracts signed?
- are jobs complete?
- are Daily Job Logs and field evidence captured?
- are open Job Notes or blockers still unresolved?
- are change orders resolved?
- are invoices paid or still open?
- is Customer Access or warranty/service handoff already connected?
- what is the closeout Next Move?

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
- `docs/design/projectpulse-phase-1-project-health-summary.md`
- `docs/design/project-workspace-os-consolidation-qa.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`

## Existing Data Used

CloseoutTrail reads existing project workspace context:

- projects
- jobs
- contracts and Signature Trail context
- invoices and Payment Trail context
- change orders
- FieldTrail summary from Daily Job Logs, Job Notes, field evidence, and labor
- MessageCenter summary from connected communication and Customer Access context
- warranty documents and service tickets when already linked to the project

No new closeout, warranty, document, payment, field, route, action, or schema
model was added.

## Project Workspace Changes

Project Workspace now includes a CloseoutTrail section after FieldTrail and
MessageCenter and before the Financial Hub. ProjectPulse remains the top-level
project health summary. CloseoutTrail is a supporting closeout-readiness panel,
not a second project health system.

## CloseoutTrail Checklist Implemented

The checklist shows:

- Contract signed
- Jobs completed
- Daily Job Logs captured
- Job Notes resolved
- Field evidence attached
- Change orders resolved
- Invoices paid or open
- Customer Access visible
- Warranty/service handoff

Each item uses complete, attention, blocked, not applicable, or unknown state
from existing records only.

## Next Move Rules Implemented

The closeout Next Move is deterministic:

- unsigned contract points to the contract and Signature Trail
- open jobs point to the job or CrewBoard
- open Job Notes point to FieldTrail
- completed jobs without Daily Job Logs point to Daily Job Logs
- open invoice balances point to invoice / Payment Trail
- unresolved change orders point to the change order
- existing warranty/service handoff points to warranty or service continuity
- otherwise the project is ready for closeout review

No automation, auto-close behavior, or AI recommendation was added.

## Behavior Preserved

This slice preserves:

- contract and signature behavior
- invoice, payment, and payment-event behavior
- estimate and invoice math
- job readiness and GateKeeper / Ready Check enforcement
- Daily Job Log behavior and uniqueness
- field note validation and execution attachment behavior
- service ticket and warranty document behavior
- auth, tenant boundaries, RLS, portal grants, settings, and platform admin logic

## Intentionally Not Implemented

- auto-close project
- customer-facing closeout package generation
- warranty PDF generation
- full document management
- AI-generated closeout summary
- customer satisfaction workflow
- automated reminders
- accounting closeout/reconciliation
- punchlist subsystem expansion
- standalone closeout route

## Follow-Up Candidates

- Add closeout context to Job Workspace once project-level behavior settles.
- Add customer-facing closeout package generation only after portal visibility
  rules and document ownership are explicitly designed.
- Connect warranty/service handoff details more deeply if the service and
  warranty workspaces gain closeout-specific status fields.
