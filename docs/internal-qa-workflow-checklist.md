# Internal QA Workflow Checklist

Status: Phase A seed-free manual QA script for internal testing.

This checklist validates the core FloorConnector contractor workflow without relying on demo seed data. It should be run against a normal contractor organization using the real UI and the canonical record chain:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Test Setup Assumptions

- Start from a normal contractor organization created through the real authentication and organization bootstrap flow.
- Use real UI flows only. Do not insert rows manually and do not rely on seeded demo records.
- Use a fresh customer, project, estimate, contract, job, invoice, and payment chain for each full QA pass when practical.
- Use at least one authenticated contractor admin/owner account.
- For portal tests, use at least one authenticated customer/portal user account with an email address that can be granted portal access.
- For linked-contact permission tests, create or use real related customer contacts from the customer detail page. Do not create contacts automatically through portal-grant cleanup.
- Local environment source of truth is `C:\FloorConnector\.env.local`.
- Required local auth env assumptions are documented in [docs/auth-setup.md](C:/FloorConnector/docs/auth-setup.md):
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- If running locally, make sure `NEXT_PUBLIC_APP_URL` matches the app port and Supabase auth callback configuration.
- Email/SMS/provider delivery, communication automation, mobile app intake, visualizer, e-notary, public website lead capture, and external accounting sync are outside this QA script.

## End-To-End Workflow Script

### 1. Create Opportunity

1. Sign in as a contractor admin or owner.
2. Open `/leads`.
3. Create a new opportunity through the real lead/opportunity UI.
4. Capture a unique test name, such as `QA Phase A - <date/time>`.
5. Add enough customer/contact context to continue the workflow.

Expected:
- One canonical opportunity is created.
- The opportunity appears in `/leads`.
- No customer or project duplicates are created unless the workflow explicitly creates/links them later.

### 2. Add Customer And Contact Email Correctly

1. From the opportunity flow, start the estimate path or create/link the downstream customer and project when prompted.
2. Verify the customer record exists in `/customers`.
3. Confirm the canonical customer/account email is populated. This remains the estimate, contract, invoice, and payment continuity source for this phase.
4. On customer detail, add at least one related customer contact with a real email.
5. Confirm `/directory` shows the related contact as a read-only `Customer Contact` row that links back to the Customer Workspace.

Expected:
- One canonical customer exists.
- Related contacts sit beneath the customer through `contacts` and `customer_contacts`.
- Directory remains a view over canonical records, not a replacement model.

### 3. Start Estimate From Lead

1. Return to the opportunity detail page.
2. Use the existing `Start estimate` path.
3. Confirm the workflow creates or links the canonical customer and project.
4. Open the Estimate Workspace.

Expected:
- The estimate belongs to the same customer/project chain.
- The project detail page reflects estimate-related next-action guidance.
- No separate lead-only estimate or duplicate project is created.

### 4. Add Estimate Items

1. In Estimate Editor, add at least one catalog-backed estimate item.
2. If no suitable catalog item exists, use the sanctioned manual/one-off flow that creates a minimal catalog item first, then adds it to the estimate.
3. Confirm estimate line items and totals update.
4. Confirm tax behavior follows current customer exemption, item taxable, and organization settings behavior.

Expected:
- `estimate_line_items` are the authoritative estimate item rows.
- No downstream billing record is created from live estimate rows at this stage.
- Catalog or one-off item creation stays tenant-owned and reusable where the existing UI supports it.

### 5. Optional Estimate Import

1. If a prior real same-organization estimate exists, use the estimate import chooser to import line items.
2. If reusable content exists, import Scope / SOW, Terms, Inclusions, or Exclusions from another estimate where supported.
3. If no real source estimate exists, skip this step and record `Skipped: no same-organization source estimate`.

Expected:
- Import is append-only into a draft destination estimate.
- Imported rows become new destination estimate line items.
- Import does not create invoice rows, SOV rows, contracts, payments, or shadow lineage.

### 6. Send Or Move Estimate Through Sent State

1. Attempt to send the estimate for customer review.
2. If the UI blocks because customer email is missing, update the canonical customer email and retry.
3. Confirm estimate status becomes `sent` or follows the currently supported sent-state path.
4. Check project detail next-action guidance.

Expected:
- Estimate send uses the canonical customer/account email in this phase.
- A sent estimate remains on the same project/customer chain.
- Notification and communication foundations may create related activity, but no duplicate estimate is created.

### 7. Approve Estimate

Preferred path:
1. Sign in as the customer/portal user.
2. Open the customer portal estimate review path.
3. Approve the sent estimate.

Fallback path if supported in the current UI:
1. Use the contractor-side/manual approval path only if the app currently exposes one.
2. Record which path was used.

Expected:
- The estimate becomes `approved`.
- An immutable approved commercial snapshot is created.
- Project next-action guidance moves toward contract generation.
- Approval does not automatically create a contract, invoice, job, or payment.

### 8. Generate Contract

1. From approved estimate next steps or `/contracts?estimateId=<estimateId>`, generate the contract.
2. Confirm the contract is tied to the approved estimate snapshot.
3. Review contract detail.

Expected:
- One canonical contract is created.
- Contract content comes from approved estimate snapshot data and templates.
- The contract remains attached to the same customer/project/estimate chain.

### 9. Send And Sign Contract Through Portal Path

1. On customer detail, grant portal access to the customer portal user.
2. Add project visibility for the QA project.
3. If testing linked-contact permissions, attach the grant to the related customer contact.
4. Ensure the linked contact has `canSignContracts` enabled for the positive path.
5. Send the contract for signature using existing contractor-side controls.
6. Sign in as the portal user and sign the contract.
7. If contractor countersign is configured/required, complete it through the existing contractor-side contract action.

Expected:
- Contract sign/decline acts on the same canonical contract.
- `contract_signers` remains the final signer-routing authority.
- Linked-contact grants require `canSignContracts` for sign/decline.
- Contract viewing is not blocked by `canSignContracts` in this phase.
- Null-contact customer-level grants preserve legacy behavior.

### 10. Verify Contact-Level Permission Behavior

Run these checks on the same customer/project where possible:

1. Linked contact with `canApproveEstimates = true` can approve/reject a sent estimate assigned through the portal access path.
2. Linked contact with `canApproveEstimates = false` is blocked from estimate approval/rejection.
3. Linked contact with `canApproveChangeOrders = true` can approve/reject a sent change order.
4. Linked contact with `canApproveChangeOrders = false` is blocked from change-order approval/rejection.
5. Linked contact with `canSignContracts = true` can sign/decline when selected as a signer.
6. Linked contact with `canSignContracts = false` cannot be selected as a customer signer and is blocked from sign/decline if attempted.
7. A null-contact customer-level grant continues to use legacy behavior.

Expected:
- Permissions block only linked-contact grants where expected.
- Customer-level/null-contact grants continue to work during the compatibility window.
- Estimate send lookup is unchanged.
- Invoice/payment permissions are not enforced yet.

### 11. Check SOV / Progress Billing Readiness

1. After estimate approval, open `/progress-billing`.
2. Confirm an approved-estimate/SOV workflow is available where applicable.
3. If current billable progress can be entered through the UI, create a small progress state.
4. Do not treat SOV rows as invoices until the supported invoice action is used.

Expected:
- Progress billing stays on the canonical approved-estimate -> SOV -> invoice chain.
- SOV/invoice lineage stays canonical.
- No detached pay-app, spreadsheet shadow model, or invoice replacement record appears.

### 12. Create Job

1. From approved estimate/project next actions, create a job.
2. Confirm the job is linked to the same project and customer.
3. Open project detail and verify next-action guidance updates.

Expected:
- One canonical job exists.
- No separate scheduling-only record is created.
- The project hub reflects operational readiness or the next scheduling blocker.

### 13. Schedule Job

1. Open `/schedule`.
2. Use the project filter or project handoff link.
3. Schedule the job using existing job scheduling controls.
4. Clear the project filter and confirm the full schedule queue returns.

Expected:
- `/schedule?projectId=<projectId>` filters the canonical job list.
- Clearing the project filter preserves the rest of supported query context where applicable.
- Scheduling updates the canonical job, not a separate dispatch model.

### 14. Assign Crew

1. In `/schedule` or job detail, assign a crew/person/vendor using supported controls.
2. Confirm the job assignment is visible on job/project/schedule context.

Expected:
- Crew assignment uses canonical `job_assignments`.
- Crew attachment is blocked until the job has a real schedule commitment where the UI enforces that rule.

### 15. Complete Job If Supported

1. Move the job through supported states toward `completed`.
2. If completion is not available from the current UI path, record `Skipped: job completion not exposed in this test path`.
3. Reopen project detail.

Expected:
- Job state remains canonical.
- Project next-action guidance moves toward invoicing when completed work lacks an invoice.

### 16. Create Invoice

1. Create an invoice from the project/job context or the supported invoice manager route.
2. Prefer completed job context when available.
3. If testing deposit readiness, create a deposit invoice from the supported deposit workflow before scheduling where required.
4. Confirm invoice line lineage.

Expected:
- Invoice belongs to the same customer/project chain.
- Invoice lines use one explicit lineage path:
  - approved estimate snapshot item
  - selected SOV item
  - approved change-order snapshot item
  - invoice-only adjustment
- Live `estimate_line_items` do not become downstream billing truth.

### 17. Request Or Record Payment

1. Send/request payment from the invoice or portal payment path where supported.
2. Record a payment through the contractor-side payment path if the provider-backed portal path is not part of this local run.
3. Confirm invoice status and balance update.
4. Confirm payment events remain immutable.

Expected:
- Payment attaches to the canonical invoice/payment chain.
- Payment activity does not create a detached checkout or portal-payment model.
- Project and invoice detail show payment continuity.

### 18. Verify Project Next-Action Guidance

At each major stage, reopen project detail and record the primary next action:

- no estimate yet -> `Start estimate`
- draft estimate -> finish/send estimate guidance
- sent estimate -> await/review approval guidance
- approved estimate with no contract -> `Generate contract`
- draft contract -> prepare/send/signature readiness guidance
- signed contract with deposit needed -> create/review deposit invoice guidance
- ready to schedule with no job -> create job/open schedule guidance
- unscheduled job -> open schedule guidance
- completed job with no invoice -> create invoice guidance
- open invoice -> invoice/payment follow-up guidance

Expected:
- Project detail answers "What do I do next?"
- Actions route to existing pages/actions only.
- No unsupported downstream action is invented.

### 19. Verify Communications And Notifications

1. Open `/communications`.
2. Confirm communication threads, unread notifications, and source filters render without errors.
3. Open a related conversation card from project/customer/estimate/contract/invoice/change-order detail where a thread exists.
4. Send a contractor reply on an existing canonical thread.
5. Mark the selected thread read.
6. Mark all communication notifications read.
7. Visit `/communications?source=job` to verify unsupported-source guidance.

Expected:
- Communications use only `communication_threads` and `communication_messages`.
- Replies append to the selected canonical thread.
- Triage updates per-user notification read state only.
- No email/SMS/provider send or automation execution occurs.
- Unsupported source filters do not imply job communications support.

## Negative Test Cases

### Estimate Send Missing Customer Email

Steps:
1. Create or open a customer/project chain where the canonical customer email is blank.
2. Create a draft estimate.
3. Attempt to send the estimate.

Expected:
- Send is blocked or clearly fails with missing-recipient guidance.
- Updating the canonical customer email resolves the blocker.
- No duplicate customer or portal recipient model is created.

### Linked Contact Without Estimate Approval Permission

Steps:
1. Link a portal grant to a related customer contact.
2. Set `canApproveEstimates = false`.
3. Send an estimate and attempt portal approval/rejection as that contact.

Expected:
- Approval/rejection is blocked for the linked-contact grant.
- Estimate viewing behavior remains as currently implemented.
- Null-contact grants are not affected.

### Linked Contact Without Change-Order Permission

Steps:
1. Link a portal grant to a related customer contact.
2. Set `canApproveChangeOrders = false`.
3. Send a change order and attempt portal approval/rejection as that contact.

Expected:
- Approval/rejection is blocked for the linked-contact grant.
- Change order remains canonical and contractor-side workflow is unchanged.

### Linked Contact Without Contract Sign Permission

Steps:
1. Link a portal grant to a related customer contact.
2. Set `canSignContracts = false`.
3. Attempt contractor-side signer selection and portal sign/decline.

Expected:
- The linked contact cannot be selected as a signer.
- If sign/decline is attempted, the action is blocked with:
  `This contact does not currently have permission to sign or decline this contract.`
- Contract viewing is not blocked.
- Contractor countersign is unchanged.

### Customer-Level Grant Legacy Behavior

Steps:
1. Create or use a portal access grant with `customer_contact_id = null`.
2. Grant project visibility.
3. Run estimate approval, change-order approval, or contract sign/decline where otherwise supported.

Expected:
- Legacy customer-level behavior is preserved.
- No stored customer-contact permission row is required.
- Admin cleanup guidance labels the grant as customer-level and explains the optional attach-to-contact path.

### Unsupported Communications Source Query

Steps:
1. Open `/communications?source=job`.

Expected:
- The page shows unsupported-source guidance.
- No fake job communication queue appears.
- Existing supported filters/search behavior is preserved.

### Schedule Project Filter Clearing

Steps:
1. Open `/schedule?projectId=<qa-project-id>`.
2. Confirm only the project job set is shown.
3. Clear the project filter from the active-filter banner.

Expected:
- The schedule returns to the broader canonical jobs queue.
- Other supported query context remains intact where applicable.
- No schedule-only record or dispatch-copy model is created.

## Expected Outcomes

- Canonical records are created once across the workflow.
- No duplicate customer, project, estimate, contract, job, invoice, payment, portal, communication, or schedule models appear.
- Contractor app and portal operate on the same canonical records.
- Portal actions do not create portal-only copies.
- Linked-contact permissions block only linked-contact grants where expected.
- Null-contact customer-level grants preserve legacy behavior.
- Estimate send lookup remains on canonical customer/account fields in this phase.
- Financial lineage stays intact from approved estimate snapshot and approved change-order snapshot through SOV, invoice, and payment.
- Project detail remains the operating hub and reflects the next supported action as the workflow progresses.
- Communications remain on canonical `communication_threads` and `communication_messages`.

## Regression Watchlist

- `estimate_line_items` must not become downstream billing truth.
- Approved estimate snapshots must remain the commercial baseline for contract, SOV, and invoice lineage.
- SOV, invoice, and payment lineage must remain canonical and append-only.
- Change orders must extend the project/contract/invoice chain and must not mutate prior approved snapshots.
- Portal actions must not create portal-only copies of estimates, contracts, change orders, invoices, payments, messages, customers, or projects.
- Directory must stay a view over canonical customers, related customer contacts, people, vendors, and leads.
- Additional customer contacts must not replace canonical customer/account records.
- Communications must use `communication_threads` and `communication_messages` only.
- Notification triage must update per-user notification read state only.
- Scheduling must stay on canonical jobs and `job_assignments`.
- Payment request/checkout/recording must stay on canonical invoice and payment records.
- Automation must remain off in Phase A unless a later task explicitly implements notification-only automation execution.

## QA Run Notes Template

Use this template for each internal QA run:

```text
Date:
Tester:
Environment:
Contractor organization:
Contractor user:
Portal user:

Opportunity:
Customer:
Related contact:
Project:
Estimate:
Contract:
Change order:
Job:
Invoice:
Payment:

Skipped optional steps:
Unexpected behavior:
Regression watchlist findings:
Pass/fail:
Follow-up issues:
```
