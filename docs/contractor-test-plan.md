# Contractor Test / Demo Readiness Plan

Status: Active
Doc Type: QA / Planning
Date: 2026-05-17

## Purpose

This plan turns the existing golden workflow and founder-demo guidance into a contractor-owner walkthrough. It is a manual QA and demo-readiness plan over current canonical records, not a seeded demo environment or permission to create fake data.

Canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Contractor-Owner Walkthrough

1. Start at `/dashboard`.
   - Confirm operational queues link into real Manager Pages and Workspaces.
   - Confirm lifecycle guidance does not imply dashboard-owned workflow state.

2. Open `/leads` and one Lead/Opportunity Workspace.
   - Confirm source, contact, site assessment, and estimate handoff are understandable.
   - Expected outcome: opportunity can move toward customer/project/estimate context without duplicate records.

3. Open `/customers` and one Customer Workspace.
   - Confirm account summary, related projects, contacts, and portal access ownership are clear.
   - Expected outcome: customer is relationship/account context, not the execution hub.

4. Open `/projects` and one Project Workspace.
   - Confirm current state, readiness, next action, connected record lanes, access, field, billing, and schedule context are visible.
   - Expected outcome: Project Workspace feels like the continuity hub.

5. Open `/estimates`, one Estimate Workspace, and the Estimate Editor.
   - Confirm catalog-first authoring, approval state, contract/SOV/job/invoice handoffs, and customer-facing scope are understandable.
   - Expected outcome: estimate remains proposal-first and downstream lineage is clear.

6. Open `/contracts` and one Contract Workspace.
   - Confirm signature state, portal/onsite signing context, approval/send readiness, and project return path.
   - Expected outcome: signature acts on canonical contracts only.

7. Open `/invoices`, one Invoice Workspace, `/payments`, and `/progress-billing` where data exists.
   - Confirm invoice balance, payment state, retainage/progress-billing context, and collection next steps are clear.
   - Expected outcome: invoices remain money owed and payments remain money collected.

8. Open `/jobs`, one Job Workspace, `/schedule`, and `/daily-logs`.
   - Confirm job/schedule state, crew guidance, field evidence, and closeout continuity.
   - Expected outcome: execution stays on canonical jobs, job assignments, daily logs, field notes, and project readiness gates.

9. Open `/portal` with a valid portal customer fixture when available.
   - Confirm portal project, estimate, contract, invoice, payment-action, and print/save views use customer-safe language.
   - Expected outcome: portal is a customer window over shared records, not a duplicate system.

## Expected Outcomes

- The user can explain where the project stands without visiting every module.
- Each workspace has one obvious primary action or a clear blocker.
- Empty states explain what upstream canonical record or readiness state is missing.
- Financial, signature, payment, access, and readiness facts stay visible in Guided, Flexible, and Manual modes.
- Demo records are real canonical records or explicitly skipped prerequisites.

## Bugs / Watch Areas

- Protected QA accidentally stopping at `/login`.
- Portal QA without valid customer auth or project grants.
- Progress billing copy implying full AIA export exists.
- Dashboard actions competing equally instead of prioritizing next action.
- Schedule missing distinction between no job exists and unscheduled job exists.
- Invoice copy implying approved scope is automatically billable.
- Any page suggesting AI or automation can act autonomously.

## Demo Polish Notes

- Lead with the project continuity story.
- Reopen Project Workspace between major phases to show the operating hub.
- Use Estimate Workspace as the proposal-first visual reference.
- Keep Portal language customer-safe and action-oriented.
- Treat setup, billing activation, and super-admin early-access controls as platform operations, not contractor-customer workflow.

## Operational Readiness Gaps

- Dispatch-grade scheduling remains future depth.
- Mature AIA/pay-application UX and exports remain future depth.
- Communications/delivery proof remains partial.
- Materials/inventory depth remains foundation-level.
- AI remains planning/deterministic guidance, not provider-backed action.
- Mobile/offline field execution depth remains future work.

## Recommended Manual QA Path

Run:

```powershell
pnpm.cmd e2e:auth
pnpm.cmd exec playwright test e2e/dashboard-ui.spec.js --project=chromium-protected
pnpm.cmd exec playwright test e2e/detail-workspace-ui.spec.js --project=chromium-protected
pnpm.cmd e2e:portal-fixture
pnpm.cmd e2e:portal-auth
pnpm.cmd e2e:portal
```

If portal credentials or fixture grants are missing, mark portal checks as blocked with the missing prerequisite. Do not treat login, access denied, or missing shared records as successful portal QA unless the expected outcome is denial.
