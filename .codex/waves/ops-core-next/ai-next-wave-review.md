# AI Next Wave Review

Status: Generated
Generated: 2026-06-01T22:24:20.510Z

## Proposed Wave

- Name: ops-core-continuity-v3
- Goal: Tighten operational continuity across field execution, collections follow-up, portal trust, and reporting using existing canonical records only.
- Mode: generator_command
- State: proposed

## Rationale

The current ops-core-next wave prepares field execution, collections, portal, and E2E fixture streams. This follow-on wave keeps the same production-first direction but shifts each stream toward reviewable, user-visible continuity improvements that derive from existing projects, jobs, daily logs, invoices, payments, contracts, portal grants, and reporting read models without schema, auth, payment, provider, or mutation expansion.

## Streams

- field-handoff-command-context-v1 (medium): Make field handoff context clearer by connecting scheduled jobs, assigned work, Daily Logs, and open field blockers into one read-only command view.
  - Why: Field users need to see what is ready, what is blocked, and where to act without jumping across disconnected pages or creating another field task model.
- collections-customer-project-continuity-v1 (medium): Improve AR follow-up context by showing invoice, payment, customer, project, and last activity continuity from existing financial records.
  - Why: Collections work is faster and safer when users can see why an invoice needs attention and where the related customer/project context lives without changing payment logic.
- portal-project-trust-thread-v1 (medium): Make the portal project view show a clearer customer-safe trust thread across project status, contract, invoice, shared documents, and field evidence visibility.
  - Why: Customers need a coherent view of what has happened, what is visible to them, and what requires attention while the contractor app remains the source of truth.
- reports-operations-continuity-v1 (medium): Strengthen the Reports operations view with clearer cross-record continuity for project readiness, field execution, schedule attention, AR exposure, and recent movement.
  - Why: Managers need a company-level view that routes them back to source records instead of reading reports as a separate truth layer.

## Human Review Required

This wave is not approved and was not run. Review the manifest and prompts before activation.

Next command:

```powershell
pnpm fc:wave:approve --wave ops-core-continuity-v3 --proposal
```
