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

9. Open `/equipment` and one Equipment Detail route.
   - Confirm the registry shows asset identity, ownership/rental status, operational status, vendor context, and recent assignments where data exists.
   - Confirm Job, Schedule, Project, and Dashboard surfaces show advisory equipment requirements/assignment/readiness warnings where fixture data exists.
   - Expected outcome: equipment is operating context tied to jobs/projects, not a disconnected asset silo or hard schedule blocker.

10. Open `/time` and one Time Card Workspace.
    - Confirm clock-in requires project/job context, optional service/warranty ticket attribution is clear, current session state is understandable, and recent punch events are visible as audit truth.
    - Confirm manager review/approve/reject state is shown on derived time cards without replacing punch events.
    - Expected outcome: clocking and review reuse the canonical punch-event spine instead of a detached timesheet system.

11. Open `/service-tickets` and one Service Ticket detail.
    - Confirm customer/project/original-job context, ticket type/status/priority, warranty dates, linked service jobs, linked time, and linked warranty documents are understandable.
    - Create or inspect a linked service job when the fixture supports it, then confirm it routes into Job Workspace and Schedule rather than a service-only calendar.
    - Expected outcome: service/warranty work continues from the original customer/project/job chain.

12. Open one Warranty Document Workspace and its print route.
    - Confirm warranty document content, template lineage, issue/void state, signer management, internal signature-request audit events, delivery history, provider-backed review/sign email, and print/save are understandable.
    - Confirm provider-send results are honest: sent when accepted, failed/no-send when configuration or activation blocks sending.
    - Expected outcome: warranty documents are canonical records with delivery/signature evidence, not loose PDFs.

13. Open Estimate, Contract, Invoice, and Warranty Document delivery panels.
    - Confirm manual/internal/print delivery proof can be recorded where appropriate.
    - Confirm provider-backed send exists for warranty, estimate, invoice, and contract while payment, approval, and signature truth stay in their owning systems.
    - Expected outcome: delivery proof is evidence over canonical documents, not workflow truth.

14. Open `/portal` with a valid portal customer fixture when available.
    - Confirm portal project, estimate, contract, invoice, payment-action, warranty document review/sign, and print/save views use customer-safe language.
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
- Portal warranty review/sign QA without a project-linked issued warranty document and signer email that matches the authenticated portal user.
- Progress billing copy implying full AIA export exists.
- Dashboard actions competing equally instead of prioritizing next action.
- Schedule missing distinction between no job exists and unscheduled job exists.
- Invoice copy implying approved scope is automatically billable.
- Provider-backed document send implying email was sent when provider configuration or activation blocked the send.
- Invoice send implying checkout or payment has started.
- Contract delivery evidence implying signature state changed.
- Warranty delivery evidence implying signer state changed.
- Equipment readiness warnings looking like hard blocks before that policy exists.
- Clocking review implying time cards replace punch-event audit truth.
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
- Communications/delivery proof now covers manual delivery evidence for warranty documents, estimates, invoices, and contracts, plus guarded provider-backed email sends for all four document subjects. Provider callbacks, resend/retry orchestration, portal-visible delivery proof, stored PDFs, and broader messaging depth remain future.
- Materials/inventory depth remains foundation-level.
- Portal service-ticket requests/status, warranty countersign, provider e-sign, service billing/manufacturer claims, job-costing feeds, and service materials/equipment usage automation remain future.
- Equipment maintenance, utilization, costing, procurement/AP linkage, and hard readiness gates remain future.
- Clocking admin correction events, payroll export, GPS verification, overtime/pay-period rules, and offline mode remain future.
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

For the deeper founder-contractor pilot rehearsal, also run focused Node tests
where practical:

```powershell
pnpm.cmd exec tsx --test apps/web/lib/warranty-documents/email.test.ts apps/web/lib/estimates/email.test.ts apps/web/lib/invoices/email.test.ts apps/web/lib/contracts/email.test.ts apps/web/lib/contracts/provider-send.test.ts apps/web/lib/document-delivery/provider-send-regression.test.ts
pnpm.cmd exec tsx --test apps/web/lib/warranty-documents/warranty-documents-migration.test.ts apps/web/lib/warranty-documents/schemas.test.ts apps/web/lib/warranty-documents/render.test.ts apps/web/lib/warranty-documents/document-signature-foundation-migration.test.ts apps/web/lib/portal/warranty-documents.test.ts
pnpm.cmd exec tsx --test apps/web/lib/service-tickets/service-tickets-migration.test.ts apps/web/lib/service-tickets/service-ticket-service-jobs-migration.test.ts
pnpm.cmd exec tsx --test apps/web/lib/equipment/readiness.test.ts apps/web/lib/equipment/assignment-readiness-migration.test.ts apps/web/lib/dashboard/equipment-readiness-preview.test.ts
pnpm.cmd exec tsx --test apps/web/lib/time/transitions.test.ts apps/web/lib/time/exceptions.test.ts apps/web/lib/time/time-card-review-state-migration.test.ts apps/web/lib/time/service-warranty-time-clock-migration.test.ts
```

Before inviting a contractor, confirm the production build is green:

```powershell
pnpm.cmd --filter @floorconnector/web build
```
