# Financial Audit: Invoice Readiness

Status: audit plus implementation follow-up for invoice creation entry points and readiness alignment.

This audit follows:
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)

Canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Original audit note: no app code, schema, route, workflow, calculation, financial logic, script, or env-var change was made by the audit document.

Implementation follow-up:
- The high-risk freeform invoice findings are now enforced in the app: Invoice Quick-Create requires project context plus a billing source of completed job, approved estimate scope, approved change order, or explicit deposit role.
- The shared `createInvoice` path rejects project-only standard invoices without a real billing source.
- Approved change-order Quick-Create routes through the existing approved change-order invoice path instead of creating disconnected invoice headers.
- Progress billing now uses the same invoice commercial readiness guard as `createInvoice`.
- Estimate approval next steps no longer present full estimate-based invoice creation as the primary action; they route users back to contract or project readiness.
- No schema, calculation, payment-system, script, or env-var changes were introduced for this enforcement pass.

## Financial Rules Checked

The audit checks each path against:
- Billing Trigger Rule: invoice creation needs a valid trigger such as signed contract/deposit, completed or billable work, or approved change-order billable scope.
- Scope Vs Billing Rule: approved scope is not automatically billable scope.
- Invoice Source Rule: invoices require a project and at least one real source: job, estimate items, change order, or deposit requirement.
- Readiness Vs Billing Rule: readiness can allow or block work, but billing still needs a valid trigger.

## Shared Creation Mechanics

Most UI entry points route into `/invoices` and submit `quickCreateInvoiceAction`, which calls `createInvoice`.

Relevant implementation points:
- [apps/web/app/(app)/invoices/page.tsx](C:/FloorConnector/apps/web/app/(app)/invoices/page.tsx): reads `projectId`, `estimateId`, `jobId`, and `workflowRole` from the query string and opens the Invoice Quick-Create composer.
- [apps/web/components/invoice-quick-create-form.tsx](C:/FloorConnector/apps/web/components/invoice-quick-create-form.tsx): requires a project and workflow role; carries hidden `estimateId` and non-deposit `jobId` when provided.
- [apps/web/lib/invoices/actions.ts](C:/FloorConnector/apps/web/lib/invoices/actions.ts): `quickCreateInvoiceAction` creates a draft invoice, derives discount from the estimate when provided, and redirects to the Invoice Editoror Workspace.
- [apps/web/lib/invoices/data.ts](C:/FloorConnector/apps/web/lib/invoices/data.ts): `createInvoice` resolves project, approved estimate, optional job, validates connected records, and calls `assertInvoiceCommercialReadiness`.
- [apps/web/lib/projects/readiness.ts](C:/FloorConnector/apps/web/lib/projects/readiness.ts): `assertInvoiceCommercialReadiness` requires a signed contract for all invoice creation and additionally requires ready-to-schedule state for standard invoices without a job.

## Entry Points

### 1. Invoice Manager Quick-Create

Where it exists:
- `/invoices` page, `New invoice` button and composer.
- [apps/web/app/(app)/invoices/page.tsx](C:/FloorConnector/apps/web/app/(app)/invoices/page.tsx)
- [apps/web/components/invoice-quick-create-form.tsx](C:/FloorConnector/apps/web/components/invoice-quick-create-form.tsx)

Starting context:
- Global invoice manager.
- Optional query context may prefill `projectId`, `estimateId`, `jobId`, or `workflowRole`.

Records linked:
- Always requires project.
- May link approved estimate if query supplies `estimateId`.
- May link job if query supplies `jobId` and role is not `deposit`.
- Customer is derived from project.

Required conditions:
- Server requires signed contract for the project.
- Standard invoice without a job requires project financial readiness / ready-to-schedule.
- Deposit invoice cannot include a job.

Rule alignment:
- Billing Trigger Rule: partially aligned. Server requires signed contract; standard no-job invoices require readiness. The composer itself does not require the user to identify the actual billing trigger.
- Scope Vs Billing Rule: partially aligned. The draft can be created before line-item source selection.
- Invoice Source Rule: weak when only project + role are selected. The invoice can start project-only without job, estimate items, change order, or explicit deposit requirement.
- Readiness Vs Billing Rule: mostly aligned server-side for standard no-job invoices; weaker for deposit role because deposit requirement is not required by the form.

Issues:
- HIGH: project-only standard draft invoice can be created after readiness without selecting job, estimate items, change order, or deposit requirement. This risks freeform billing.
- MEDIUM: project-only deposit invoice can be created from the manager if the contract is signed, even when the UI has not established an explicit deposit requirement.

Recommended fixes:
- Require a source type at Quick-Create for global invoice creation: completed/billable job, approved estimate snapshot/SOV, approved change order, or deposit requirement.
- If `workflowRole=deposit`, require the selected project to have a deposit-readiness requirement or show a clear override/reason before creation.

### 2. Global Universal Create

Where it exists:
- Shared universal create menu links to `/invoices?compose=1#invoice-create`.
- [apps/web/components/universal-create-menu.tsx](C:/FloorConnector/apps/web/components/universal-create-menu.tsx)
- Used from the contractor shell and dashboard surfaces.

Starting context:
- Global action with no project, estimate, job, or workflow role preselected.

Records linked:
- User must select a project in the Invoice Quick-Create form.
- No source record is selected by default.

Required conditions:
- Same server-side requirements as invoice manager Quick-Create.

Rule alignment:
- Billing Trigger Rule: partially aligned through server signed-contract/readiness checks, but the global entry does not ask for the billing trigger.
- Scope Vs Billing Rule: weak because it starts as project + role only.
- Invoice Source Rule: weak for project-only drafts.
- Readiness Vs Billing Rule: server catches standard no-job readiness, but the user experience does not explain the readiness source.

Issues:
- HIGH: same project-only freeform risk as invoice manager Quick-Create, amplified because this is a broad global entry point.

Recommended fixes:
- Treat global invoice creation as a routing chooser rather than immediate invoice creation: pick project, then require billing source/trigger before submitting.

### 3. Project Detail Deposit Invoice

Where it exists:
- Project readiness guidance and project action area.
- [apps/web/app/(app)/projects/[projectId]/page.tsx](C:/FloorConnector/apps/web/app/(app)/projects/[projectId]/page.tsx)

Starting context:
- Project detail page when readiness indicates deposit is required and not satisfied.

Records linked:
- Project.
- Approved estimate when available through `estimateId`.
- Workflow role `deposit`.
- Customer derived from project.

Required conditions:
- UI shows this path when `readinessSnapshot.depositRequired && !readinessSnapshot.depositSatisfied`.
- Server still requires signed contract before invoice creation.

Rule alignment:
- Billing Trigger Rule: aligned when contract is signed and deposit is required.
- Scope Vs Billing Rule: aligned for deposit readiness, not execution billing.
- Invoice Source Rule: aligned when deposit requirement exists; estimate context may be present.
- Readiness Vs Billing Rule: aligned. Deposit readiness is the visible blocker and invoice creation is the billing action.

Issues:
- LOW: the link may include an empty `estimateId` if no approved estimate is available, though the server still derives project and checks contract signature.

Recommended fixes:
- Keep this path but make the deposit requirement visible in the Invoice Quick-Create composer when opened from project context.

### 4. Contract Detail Deposit Invoice

Where it exists:
- Contract detail next action for signed contracts with unsatisfied deposit requirement.
- [apps/web/app/(app)/contracts/[contractId]/page.tsx](C:/FloorConnector/apps/web/app/(app)/contracts/[contractId]/page.tsx)

Starting context:
- Signed contract.
- Deposit required and not satisfied.

Records linked:
- Project from contract.
- Estimate from contract when present.
- Workflow role `deposit`.
- Customer derived from project.

Required conditions:
- UI path appears only when contract status is `signed` and deposit is required but unsatisfied.
- Server also requires signed contract.

Rule alignment:
- Billing Trigger Rule: aligned.
- Scope Vs Billing Rule: aligned for deposit/pre-execution billing.
- Invoice Source Rule: aligned through project + deposit requirement + contract/estimate context.
- Readiness Vs Billing Rule: aligned.

Issues:
- No material issue found.

Recommended fixes:
- Preserve this path as the clearest deposit-specific invoice entry.

### 5. Project Detail Completed-Job Invoice

Where it exists:
- Project next-action guidance and action buttons when a completed job has no linked invoice.
- [apps/web/app/(app)/projects/[projectId]/page.tsx](C:/FloorConnector/apps/web/app/(app)/projects/[projectId]/page.tsx)

Starting context:
- Project with a completed job and no invoice linked to that job.

Records linked:
- Project.
- Job.
- Estimate may be derived from the job.
- Customer derived from project.
- Workflow role defaults to `standard`.

Required conditions:
- UI checks for completed job and no linked invoice.
- Server requires signed contract.
- Job context bypasses the extra standard no-job ready-to-schedule gate.

Rule alignment:
- Billing Trigger Rule: aligned. Completed job is a valid trigger.
- Scope Vs Billing Rule: aligned. Work completion drives billing.
- Invoice Source Rule: aligned through project + job.
- Readiness Vs Billing Rule: aligned. Execution completion is the trigger.

Issues:
- No material issue found.

Recommended fixes:
- Keep this path as the model for standard work-completion billing.

### 6. Job Detail Completed-Job Invoice

Where it exists:
- Job detail next action and linked invoice panel.
- [apps/web/app/(app)/jobs/[jobId]/page.tsx](C:/FloorConnector/apps/web/app/(app)/jobs/[jobId]/page.tsx)

Starting context:
- Job detail page.
- Link appears when job status is `completed` and no linked invoice exists.

Records linked:
- Job.
- Project.
- Estimate may be derived from the job.
- Customer derived from project.
- Workflow role defaults to `standard`.

Required conditions:
- UI requires completed job and no linked invoice.
- Server requires signed contract.

Rule alignment:
- Billing Trigger Rule: aligned.
- Scope Vs Billing Rule: aligned.
- Invoice Source Rule: aligned through project + job.
- Readiness Vs Billing Rule: aligned.

Issues:
- No material issue found.

Recommended fixes:
- Keep this path as a supported job-to-invoice entry.

### 7. Estimate Approval Next-Steps Invoice

Where it exists:
- Estimate detail and Estimate Editor approval next-steps panel.
- [apps/web/app/(app)/estimates/[estimateId]/page.tsx](C:/FloorConnector/apps/web/app/(app)/estimates/[estimateId]/page.tsx)
- [apps/web/app/(app)/estimates/[estimateId]/edit/page.tsx](C:/FloorConnector/apps/web/app/(app)/estimates/[estimateId]/edit/page.tsx)
- [apps/web/components/estimates/approval-next-steps-panel.tsx](C:/FloorConnector/apps/web/components/estimates/approval-next-steps-panel.tsx)

Starting context:
- Approved estimate.
- Panel offers `Generate Estimate-Based Invoice (Full Amount)`.

Records linked:
- Project.
- Approved estimate.
- Workflow role `standard`.
- Customer derived from project.

Required conditions:
- UI enables the action when estimate status is approved.
- Server still requires signed contract and standard no-job commercial readiness before creation.

Rule alignment:
- Billing Trigger Rule: weak in the UI, stronger on the server. Approved estimate alone is not a valid billing trigger under the new rules.
- Scope Vs Billing Rule: inconsistent. The label implies full approved scope can become an invoice directly.
- Invoice Source Rule: aligned on source because estimate is present.
- Readiness Vs Billing Rule: partially aligned only because server blocks early creation.

Issues:
- HIGH: UI presents estimate approval as enough to generate a full standard invoice, even though approved scope is not automatically billable and contract/readiness may still be incomplete.
- MEDIUM: server-side blocking prevents early invoice creation, but the user-facing affordance can still create confusing errors and reinforce the wrong mental model.

Recommended fixes:
- Rename or move this action behind project/contract readiness, or convert it into a link to the project readiness hub.
- If retained, label it as a later billing preparation action that requires signed contract and billing readiness.

### 8. Change Order Approval Direct Invoice

Where it exists:
- Approved change-order next-steps panel.
- [apps/web/app/(app)/change-orders/[changeOrderId]/page.tsx](C:/FloorConnector/apps/web/app/(app)/change-orders/[changeOrderId]/page.tsx)
- [apps/web/components/change-orders/approval-next-steps-panel.tsx](C:/FloorConnector/apps/web/components/change-orders/approval-next-steps-panel.tsx)
- [apps/web/lib/change-orders/actions.ts](C:/FloorConnector/apps/web/lib/change-orders/actions.ts)
- [apps/web/lib/change-orders/data.ts](C:/FloorConnector/apps/web/lib/change-orders/data.ts)

Starting context:
- Approved change order with immutable commercial snapshot items.

Records linked:
- Change order.
- Project.
- Existing linked draft standard invoice if present, or a newly created draft standard invoice.
- Invoice line items from approved change-order snapshot items.

Required conditions:
- Change order must be approved.
- Snapshot data must exist.
- Existing target invoice must be draft and not progress-billed.
- If no invoice exists, `invoiceApprovedChangeOrderDirectly` creates a standard draft invoice via `createInvoice`.

Rule alignment:
- Billing Trigger Rule: aligned in concept because approved change order introduces billable scope.
- Scope Vs Billing Rule: aligned because approved change-order snapshot items become explicit billable rows.
- Invoice Source Rule: aligned once line items are appended from change-order snapshot items.
- Readiness Vs Billing Rule: potentially over-gated because new invoice creation goes through standard no-job readiness.

Issues:
- MEDIUM: approved change-order direct billing may be blocked by the generic standard no-job readiness gate even when the approved change order itself is the valid billing trigger.

Recommended fixes:
- Add a documented change-order billing trigger path in the invoice creation guard so approved change-order direct billing does not depend on unrelated no-job readiness.

### 9. Progress Billing / Schedule Of Values Invoice

Where it exists:
- Progress billing workspace.
- [apps/web/app/(app)/progress-billing/[scheduleOfValuesId]/page.tsx](C:/FloorConnector/apps/web/app/(app)/progress-billing/[scheduleOfValuesId]/page.tsx)
- [apps/web/components/progress-billing-form.tsx](C:/FloorConnector/apps/web/components/progress-billing-form.tsx)
- [apps/web/lib/progress-billing/actions.ts](C:/FloorConnector/apps/web/lib/progress-billing/actions.ts)
- [apps/web/lib/progress-billing/data.ts](C:/FloorConnector/apps/web/lib/progress-billing/data.ts)

Starting context:
- Schedule of values for an approved estimate.
- User enters or updates percent-complete values.

Records linked:
- Project.
- Estimate.
- Schedule of values.
- Schedule of value items.
- Invoice with billing model `aia_progress`.
- Invoice line items derived from SOV items that have current billable amounts.

Required conditions:
- Billable items must have `currentToBillAmount > 0`.
- Existing draft progress invoice is updated instead of duplicated.
- Creation inserts directly into `invoices` rather than calling shared `createInvoice`.

Rule alignment:
- Billing Trigger Rule: partially aligned. SOV current-to-bill amount is a valid progress-billing trigger when the underlying contract/readiness is valid.
- Scope Vs Billing Rule: aligned. Only current billable percentages become invoice rows.
- Invoice Source Rule: aligned through project + SOV/estimate snapshot/change-order snapshot lineage.
- Readiness Vs Billing Rule: unclear because this path does not visibly call the shared invoice commercial-readiness guard.

Issues:
- HIGH: progress-billing invoice creation bypasses `createInvoice` / `assertInvoiceCommercialReadiness`, so contract signature and readiness assumptions are not enforced in the same place as other invoice creation paths.

Recommended fixes:
- Route progress-billing invoice creation through a shared readiness guard or add an equivalent explicit progress-billing guard that verifies contract signature and billing eligibility before invoice insertion.

## Non-Creation Links Reviewed

These routes link to invoice lists or existing invoices but do not create invoices directly:
- Financials Home links to `/invoices` and `/payments`.
- Payments page links to open invoices.
- Reports page links to invoice records.
- Portal invoice and portal project pages expose invoice review/payment actions, not contractor invoice creation.

## Issues Summary

High-risk issues:
1. Project-only standard Invoice Quick-Create can produce draft invoices without job, estimate items, change order, or deposit requirement as the selected source.
2. Global universal invoice creation exposes the same project-only freeform risk from a broad entry point.
3. Estimate approval next-steps presents full estimate-based invoice creation as if approved scope is enough, even though billing requires signed contract/readiness or billable work.
4. Progress-billing invoice creation bypasses the shared invoice readiness guard.

Low/medium-risk issues:
1. Project-only deposit invoice creation can be started from the invoice manager without proving a deposit requirement in the UI.
2. Project deposit links can carry an empty estimate id when no approved estimate is available, though server checks still protect the project and contract chain.
3. Approved change-order direct billing may be over-blocked by the generic standard no-job readiness gate.

## Recommended Fix Backlog

Do not implement these in this audit. Recommended follow-up work:
1. Add an invoice-source chooser before Quick-Create submit for global and invoice-manager invoice creation.
2. Require one of job, approved estimate/SOV source, approved change order, or deposit requirement before draft invoice creation.
3. Update estimate approval next-step copy/actions so approved estimate alone does not imply billable scope.
4. Add a shared readiness guard or equivalent guard for progress-billing invoice creation.
5. Add a change-order-specific invoice creation/readiness path so approved change orders are treated as their own valid billing trigger.
6. Make deposit requirement context visible in Invoice Quick-Create when `workflowRole=deposit`.

## Audit Totals

Entry points found: 9

Issues identified: 7

High-risk issues: 4

Low/medium-risk issues: 3
