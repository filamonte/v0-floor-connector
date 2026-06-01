# AI Next Wave Review

Status: Generated
Generated: 2026-06-01T22:12:04.976Z

## Proposed Wave

- Name: ops-core-continuity-v2
- Goal: Deepen field execution, collections follow-up, portal trust, and operational visibility with reviewable read-only product slices over existing canonical records.
- Mode: generator_command
- State: proposed

## Rationale

The current operating core already has Project Workspace, CrewBoard, Accounts Receivable, portal status, communications, and reporting foundations. The next wave should turn those foundations into clearer daily operating context without introducing duplicate records, schema changes, provider actions, or financial/auth behavior changes.

## Streams

- field-daily-execution-handoff (medium): Make the Field and Project execution surfaces show a clearer daily handoff from scheduled jobs to Daily Logs, field notes, blockers, time activity, and source Project Workspace links.
  - Why: Field teams and office coordinators need to know what is happening today, what is missing, and where to resolve it without treating field notes, Daily Logs, and jobs as separate systems.
- collections-conversation-context (medium): Connect Accounts Receivable follow-up rows to existing communication context, invoice/customer/project continuity, and payment-event evidence so collections review has the next human follow-up context in one place.
  - Why: Collectors need to understand whether an invoice needs outreach, internal review, or patience because a payment is already in progress, without inventing reminders or changing payment state.
- portal-project-trust-window (medium): Improve the portal Project Workspace trust window so customers see clearer customer-safe continuity across project status, estimates, contracts, invoices, payments, shared documents, and next customer actions.
  - Why: Customers should understand where their project stands and what they can safely do next without seeing contractor-only operations, internal blockers, field notes, or provider diagnostics.
- reports-operational-visibility (low): Make Reports a stronger read-only operating snapshot by tying field execution, schedule readiness, collections exposure, communication follow-up, and project continuity back to canonical source workspaces.
  - Why: A contractor owner needs a company-level view that explains where operations and collections need attention while keeping reports as a lens over source records, not a new analytics warehouse.

## Human Review Required

This wave is not approved and was not run. Review the manifest and prompts before activation.

Next command:

```powershell
pnpm fc:wave:approve --wave ops-core-continuity-v2 --proposal
```
