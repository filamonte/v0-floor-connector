# Golden Workflow Demo Path

Status: Active
Doc Type: QA / Workflow

This document defines the repeatable Phase 1 demo spine for FloorConnector. It should be read with [docs/founder-demo-readiness.md](C:/FloorConnector/docs/founder-demo-readiness.md), [docs/current-state.md](C:/FloorConnector/docs/current-state.md), [docs/workflows.md](C:/FloorConnector/docs/workflows.md), [docs/ui-patterns.md](C:/FloorConnector/docs/ui-patterns.md), and [docs/e2e-browser-qa.md](C:/FloorConnector/docs/e2e-browser-qa.md).

The goal is a polished, reliable sales-to-production walkthrough using the existing canonical chain:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

This path is a demo and QA route through real app capabilities. It does not create demo-only records, bypass readiness, loosen payment/signature rules, or introduce a parallel lifecycle.

## Purpose

Use this checklist when validating that the contractor app feels like one guided workflow rather than separate modules. Guided mode is the primary demo mode. Flexible and Manual mode checks confirm that reduced coaching does not hide non-negotiable financial, signature, payment, portal, readiness, or security facts.

For founder-customer rehearsals, use [docs/founder-demo-readiness.md](C:/FloorConnector/docs/founder-demo-readiness.md) as the operator script. It extends this route spine with setup, billing, portal print/save document, and super-admin early-access checkpoints.

## Canonical Route Sequence

0. `/setup/company`, `/setup/billing`, and `/setup/pending-activation`
   - Outcome: contractor onboarding, paid early-access setup, and activation boundaries are visible before the operating workflow starts.
   - Relationship expectation: setup and SaaS billing remain separate from contractor-customer records, invoice payments, portal payment state, and activation decisions.

1. `/dashboard`
   - Outcome: contractor starts from the operational command center and can see commercial, operations, and finance queues.
   - Relationship expectation: dashboard links into canonical records and global Manager Pages; it is not a separate workflow owner.

2. `/leads` and `/leads/[leadId]`
   - Outcome: review or create the opportunity, qualification context, customer/project handoff, site visit context, and start-estimate path.
   - Relationship expectation: lead/opportunity context should flow into customer, project, and estimate work rather than becoming a second customer-like model.

3. `/customers` and `/customers/[customerId]`
   - Outcome: confirm the canonical customer/account, related contact context, linked project history, and customer-level entry points.
   - Relationship expectation: customer remains the commercial/financial account record; project remains the execution root.

4. `/projects` and `/projects/[projectId]`
   - Outcome: project detail acts as the continuity hub with current stage, next best action, readiness state, an operational command-center summary, Project Command Timeline, connected record lanes, linked estimate/contract/invoice/job/payment context, schedule context, project-specific customer access context, and field-execution context.
   - Relationship expectation: all downstream records stay linked to this project and customer.

5. `/estimates` and `/estimates/[estimateId]`
   - Outcome: estimate detail remains proposal-first, shows customer/project context, approval/send state, contract/SOV/job/invoice handoff, revision/internal follow-through, and a path into the Estimate Editor where appropriate.
   - Relationship expectation: approved estimate snapshots feed downstream contract, SOV, job, and invoice lineage; live estimate lines do not become billing truth.

6. `/estimates/[estimateId]/edit`
   - Outcome: the Estimate Editor remains the functional authoring surface for catalog-backed line items, scope, terms, and review.
   - Relationship expectation: save behavior stays explicit and estimate line items remain canonical estimate item rows.

7. `/contracts` and `/contracts/[contractId]`
   - Outcome: contract detail shows generated-from-estimate/project context, draft/send/signature readiness, signer state, onsite/portal signature context where available, and return links to project readiness.
   - Relationship expectation: portal and contractor signing act on the same canonical contract, signer, and signature-event records.

8. `/invoices` and `/invoices/[invoiceId]`
   - Outcome: invoice detail shows project/customer/estimate/job context, billing role where available, balance/payment state, record-payment path, and continuity back to project and payments.
   - Relationship expectation: invoice rows use approved estimate snapshot, SOV, approved change-order snapshot, or explicit invoice-only lineage; payment remains tied to canonical invoice/payment records.

9. `/payments`
   - Outcome: collections work can be reviewed from a payment-focused manager while invoices remain the money-owed source and payments remain the money-collected source.
   - Relationship expectation: payment review links back to invoice/customer/project context instead of creating a detached payment workspace.

10. `/jobs` and `/jobs/[jobId]`

- Outcome: job detail shows execution state, project/customer/estimate context, schedule/crew state, daily-log and invoice follow-through, and return links to project.
- Relationship expectation: jobs represent execution on the same project chain and must respect centralized readiness gates.

11. `/schedule`

- Outcome: scheduling opens from project/job context where possible, shows the Scheduling command center, Ready work queue, Scheduled timeline, and selected job action panel, and stays tied to canonical jobs and job assignments.
- Relationship expectation: schedule filters and action panels do not create schedule-only records or duplicate jobs.

12. `/daily-logs` and `/daily-logs/[dailyLogId]`

- Outcome: field notes, project-day narrative, time/labor context, and execution attachments are easy enough to inspect for the demo path.
- Relationship expectation: daily logs and field notes stay on the project/job execution chain and do not replace punchlist, invoice, or project readiness records.

13. `/people`, `/portal`, document print/save routes, and `/super-admin/early-access`

- Outcome: the operator can show contact-centered portal access, customer-scoped portal review, branded browser print/save documents, and platform-admin early-access oversight after the core workflow is understood.
- Relationship expectation: People owns access management, portal routes stay customer-scoped, document views remain renderings of existing records, and super-admin early-access controls remain platform-only.

## Fixture And Data Assumptions

- Protected QA must use the configured Playwright contractor storage state from `.env.local` through `pnpm e2e:auth` or the `chromium-protected` setup dependency.
- Do not print credentials or commit storage-state files.
- The strongest demo uses one real project with linked estimate, contract, invoice, job, and daily-log records.
- Existing E2E overrides can point smoke tests at stable real records:
  - `FLOORCONNECTOR_E2E_PROJECT_DETAIL_PATH`
  - `FLOORCONNECTOR_E2E_ESTIMATE_DETAIL_PATH`
  - `FLOORCONNECTOR_E2E_PORTAL_PROJECT_PATH`
  - `FLOORCONNECTOR_E2E_PORTAL_ESTIMATE_PATH`
  - `FLOORCONNECTOR_E2E_PORTAL_CONTRACT_PATH`
  - `FLOORCONNECTOR_E2E_PORTAL_INVOICE_PATH`
  - schedule handoff paths documented in [docs/e2e-browser-qa.md](C:/FloorConnector/docs/e2e-browser-qa.md)
- If a detail fixture is missing, the route should be documented as skipped for that QA run instead of faking records or treating `/login` as success.

## Guidance Mode Notes

- Guided mode should show Project Workspace next-best-action and readiness guidance where implemented.
- Flexible mode may soften coaching, but critical status, payment, signature, portal-access, readiness, and security facts must remain visible in the record summaries and workspace context.
- Manual mode may reduce prompts, but it must not hide canonical record state, payment truth, signature state, readiness facts, or tenant/security warnings.
- AI assistance settings remain separate preference flags. Phase 1 does not implement autonomous AI actions.

## Portal And Customer-Facing Checkpoints

The golden path includes customer-facing checkpoints for estimate review, contract signing, invoice review, and payment where the current portal data and auth setup supports them. It also includes customer-safe print/save PDF checkpoints for shared estimate, contract, and invoice records where the fixture exposes those records. These document views must be treated as renderings of the canonical records, not separate demo documents or portal-only copies.

Portal QA must use a valid portal/customer session or valid scoped portal route. A portal login, access-denied page, missing invite, or missing project visibility is not a successful customer-facing check unless the expected result is specifically access denied.

Phase 1.1 adds an opt-in portal/customer Playwright auth and smoke path, and Phase 1.2 adds a stable local fixture setup/validation helper:

- `pnpm e2e:portal-fixture` validates whether the local portal fixture exists without mutating data.
- `FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE=1 pnpm e2e:portal-fixture -- --write` creates or repairs the dev/test-only canonical fixture when the required Supabase and E2E env vars are configured.
- `pnpm e2e:portal-auth` creates `playwright/.auth/portal-user.json` when `FLOORCONNECTOR_PORTAL_E2E_EMAIL` and `FLOORCONNECTOR_PORTAL_E2E_PASSWORD` are configured for a real customer portal user.
- `pnpm e2e:portal` runs portal smoke coverage over `/portal`, a granted portal project, and linked estimate/contract/invoice review routes where fixture data exists.
- Portal smoke discovers shared record links from the granted portal project first, then falls back to explicit route overrides when configured.
- Payment smoke stops at the invoice review/payment-action surface and does not click checkout or attempt an external charge.
- Missing portal credentials, missing canonical customer/contact state, missing active portal grants, missing project visibility, missing linked shared records, or missing storage state are skipped with explicit prerequisites rather than treated as successful QA. `pnpm e2e:portal-fixture` reports missing env var names only and never prints passwords, service-role keys, tokens, or invite secrets.

## Intentionally Excluded

- No one-off/direct invoice shortcut is implemented in Phase 1.
- No schema, RLS, payment-state, signature-state, estimate calculation, invoice calculation, or lifecycle-state behavior changes are required for this demo spine.
- No demo-only records, local-only persistence, fake auth, fake payments, fake signatures, or portal-only copies are allowed.
- No full scheduling board, communications overhaul, reporting buildout, or mobile field redesign is part of this phase.

## Repeatable QA Checklist

Use this checklist after running validation:

1. Authenticate with the configured contractor E2E storage state.
2. Open `/dashboard`, `/leads`, `/customers`, `/projects`, `/estimates`, `/contracts`, `/invoices`, `/payments`, `/jobs`, `/schedule`, and `/daily-logs`.
3. Confirm no protected route stops at `/login`.
4. Open one linked detail record for project, estimate, contract, invoice, job, and daily log where fixture data exists.
5. Confirm project detail shows current state, the `Operational command center`, `Project command timeline`, `Connected record lanes`, linked records, readiness facts, and a clear next step in Guided mode.
6. Confirm estimate detail and edit remain proposal-first and functional.
7. Confirm contract, invoice, and job detail each link back to project context.
8. Confirm `/schedule` respects project/job handoff query parameters where fixture data exists and still shows the Scheduling command center, Ready work queue, Scheduled timeline, and selected job action panel.
9. Switch workflow settings to Flexible and Manual, then confirm critical record facts remain visible on project detail.
10. Restore workflow settings to Guided after the run.
11. Open the estimate, contract, and invoice print/save routes in contractor scope where fixture data exists.
12. Run `pnpm e2e:portal-fixture` to validate portal fixture state, then `pnpm e2e:portal-auth` and `pnpm e2e:portal` when portal/customer credentials are available.
13. Open the portal estimate, contract, and invoice print/save routes where fixture data exists.
14. Open `/super-admin/early-access` with platform-admin auth only.
15. Record any missing fixture, portal auth, portal project access grant, shared portal record, platform-admin prerequisite, or protected-route blocker exactly.

## Known Follow-Ups

- Phase 1.5: design and implement a safe one-off/direct invoice shortcut only if it can preserve canonical customer/project/invoice/payment linkage.
- Scheduling refinement: improve good-enough crew assignment and calendar handoff if the golden path exposes friction.
- Portal fixture depth: keep one stable customer user with a granted project containing estimate, contract, and invoice records so `pnpm e2e:portal` can run without route overrides.
- Phase 2: continue from [docs/paid-early-access-plan.md](C:/FloorConnector/docs/paid-early-access-plan.md) before implementing live paid early-access infrastructure.
- Closeout depth: strengthen job completion, final invoice, daily-log evidence, and punchlist closeout once the demo path needs deeper field proof.
