# Phase A Completion And Phase B Readiness

Status: Phase A completion report and Phase B readiness checklist.

This document records the current Phase A outcome after the internal QA integrity fix pass. It does not authorize new app code, schema changes, or feature expansion by itself.

Primary references:
- [docs/full-build-and-launch-plan.md](C:/FloorConnector/docs/full-build-and-launch-plan.md)
- [docs/internal-qa-workflow-checklist.md](C:/FloorConnector/docs/internal-qa-workflow-checklist.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)

Canonical workflow remains:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Phase A Completion Status

Phase A is functionally complete enough to enter internal validation, but not complete enough to invite outside contractor beta users yet.

The branch now has the core contractor OS, customer portal, contact-linked portal permissions, project-centered next-action guidance, communications baseline, and internal QA script needed to run a seed-free manual workflow test. The next milestone is not feature expansion. It is proving the current system through manual internal use and recording any defects found during the full lead-to-payment pass.

## 1. Phase A Completed Capabilities

### Core Workflow Continuity

- Canonical lead/opportunity, customer, project, estimate, contract, change-order, job, invoice, and payment records are implemented.
- Opportunity-to-estimate handoff creates or links canonical customer/project records instead of creating a duplicate lead-only workflow.
- Estimate authoring uses canonical estimate line items, catalog-backed items, reusable content helpers, import helpers, explicit shared save-state behavior, customer send, portal review, and approved commercial snapshots.
- Contract generation uses approved estimate context and keeps signer routing on canonical contracts and `contract_signers`.
- Change orders extend the same project/contract/invoice chain and can produce approved snapshots for SOV or invoice integration.
- Invoices and payments stay on canonical billing/payment records with explicit invoice-line lineage.
- Schedule, jobs, daily logs, punchlists, appointments, time, and production context remain tied to the same project/job chain.

### Directory And Contact System

- `/directory` is now a read-only view over canonical customers, related customer contacts, workforce people, vendors, and leads.
- Customer detail manages related contacts through canonical `contacts` and `customer_contacts`.
- Related customer contacts do not replace canonical `customers`.
- Canonical `customers.email` still drives estimate send and downstream commercial recipient continuity in this phase.
- Directory customer-contact rows now point admins back to customer detail for linked portal grants and contact-level permissions.

### Portal And Permissions

- Customer portal access remains anchored to canonical `portal_access_grants` and `portal_project_access`.
- `portal_access_grants.customer_contact_id` is optional.
- Null-contact grants preserve legacy customer-level behavior.
- Linked-contact grants store permissions in `customer_contact_portal_permissions`.
- Linked-contact grants enforce:
  - estimate approve/reject via `canApproveEstimates`
  - change-order approve/reject via `canApproveChangeOrders`
  - contract sign/decline via `canSignContracts`
- Contractor-side customer signer selection excludes linked-contact portal users who lack `canSignContracts`.
- Contract viewing, contractor countersign, estimate send lookup, invoice/payment behavior, and broader portal view behavior remain unchanged.

### Project-Centered Workflow Guidance

- Project detail now acts as the main readiness and next-action hub.
- Project next-action guidance distinguishes no estimate, draft/sent/rejected/approved estimate states, contract generation/signature readiness, deposit readiness, pending change orders, job scheduling, completed-work invoicing, and open invoice/payment follow-up.
- Project handoffs preserve canonical context into `/jobs`, `/schedule`, and `/invoices`.
- `/jobs?projectId=...` now filters canonical jobs by project and preserves the project handoff across search, status filters, and Quick-Create.
- `/invoices` now preserves project, estimate, job, and deposit workflow query context across filters/search so invoice creation stays tied to the source chain.

### Communications Baseline

- `/communications` reads canonical `communication_threads`, `communication_messages`, and stored unread notifications.
- Contractor replies write to existing canonical threads/messages.
- Notification triage updates per-user communication notifications without creating message-local read state.
- Supported source filters are explicit.
- Unsupported sources such as `source=job` show clear help text instead of implying unsupported coverage.
- Related conversation cards appear on key canonical record pages.
- Provider email/SMS sends and automation execution remain intentionally off.

### Internal QA Foundation

- The seed-free QA script now exists at [docs/internal-qa-workflow-checklist.md](C:/FloorConnector/docs/internal-qa-workflow-checklist.md).
- The script covers lead creation, customer/contact setup, estimate authoring, portal approval, contract signature, linked-contact permission checks, SOV/progress billing readiness, job/schedule/crew flow, invoice creation, payment, next-action guidance, communications, and regression watchlist.

## 2. Integrity Issues Found And Fixed

The Phase A internal QA integrity fix pass found and fixed these concrete issues:

- `/jobs?projectId=...` accepted a project handoff but did not actually filter the jobs list.
- Project completed-job invoice actions did not always preserve the completed job into invoice Quick-Create.
- `/invoices` could drop project, estimate, job, or deposit workflow context while filtering or searching.
- Directory customer-contact copy still implied linked portal permissions were future-only.
- Estimate send missing-email copy did not clearly name canonical `customer.email`.

Fixes made:

- `/jobs` now applies canonical `jobs.project_id` filtering when `projectId` is present.
- Project completed-job invoice actions now carry `jobId` into `/invoices`.
- `/invoices` now preserves project, estimate, job, and deposit context through manager interactions.
- Directory copy now describes linked portal grant and permission management as implemented on customer detail.
- Estimate send errors now direct admins to update canonical `customer.email`.

## 3. Remaining Known Gaps

These are intentionally not Phase A blockers unless manual QA proves they prevent the core lead-to-payment test path:

- Invoice/payment permissions are not yet enforced for linked-contact grants.
- Estimate view, contract view, invoice view, quote request, and customer-contact self-service permissions are not fully enforced.
- Customer-level/null-contact portal grants still remain active as legacy compatibility behavior.
- Portal invite flow still assumes the portal user already exists; this pass does not send invitation emails automatically.
- Communication automation and provider email/SMS sending are not active.
- Automation settings and previews remain planning/readiness only.
- Reporting is not yet a full reports module.
- Tax reporting foundation is not yet a complete reporting workflow.
- Scheduling is useful but not dispatch-grade.
- Materials/inventory is not yet purchasing, consumption, reservation, or operational planning.
- Public website, SEO, custom domains, mobile app, visualizer integration, e-notary, external e-sign, accounting sync, and SaaS billing are not started or not launch-ready.

## 4. Manual QA Checklist Still To Run

Before Phase B implementation begins, run the full script in [docs/internal-qa-workflow-checklist.md](C:/FloorConnector/docs/internal-qa-workflow-checklist.md) against a normal contractor organization with no seeded demo records.

Minimum manual pass:

1. Create a new lead/opportunity.
2. Create or link one canonical customer and one canonical project.
3. Confirm canonical `customers.email` is populated before estimate send.
4. Add a related customer contact with email.
5. Confirm `/directory` shows the related contact as read-only and routes back to customer detail.
6. Start an estimate from the lead/project path.
7. Add catalog-backed/manual estimate items and confirm totals.
8. Optionally import line items or reusable content from a prior real estimate.
9. Send estimate and approve through portal or the currently supported fallback path.
10. Generate contract from approved estimate.
11. Send/sign/decline contract through portal path where supported.
12. Verify linked-contact permission allow/deny cases for estimates, change orders, and contracts.
13. Verify null-contact customer-level grant legacy behavior.
14. Check SOV/progress billing readiness after estimate approval.
15. Create job from project/approved context.
16. Schedule job, assign crew, and clear schedule filters.
17. Complete job where supported.
18. Create invoice from project/job context and confirm lineage.
19. Request or record payment and confirm invoice balance/status.
20. Verify project next-action guidance updates at each major state.
21. Verify `/communications` supported/unsupported source behavior and reply/triage feedback.

Record all skipped steps explicitly. A skipped step is acceptable only when the current UI does not expose that action or the test environment lacks an external provider dependency.

## 5. Phase B Readiness Gates

Phase B should start only after the internal QA pass proves the following gates.

### Gate 1: Contractor Can Complete Lead To Payment Flow

Required:
- One contractor admin can create a fresh opportunity and move it through customer, project, estimate, contract, job, invoice, and payment using real UI flows.
- Any skipped provider-backed steps have a documented contractor-side fallback.
- No manual database row creation is needed.

### Gate 2: Portal Permissions Behave Correctly

Required:
- Linked contacts with permission can perform supported decision actions.
- Linked contacts without permission are blocked for estimate approve/reject, change-order approve/reject, and contract sign/decline.
- The blocked contract message remains clear: "This contact does not currently have permission to sign or decline this contract."
- Null-contact customer-level grants preserve legacy behavior.
- `contract_signers` remains the final contract signer-routing authority.

### Gate 3: Project Next Actions Are Clear

Required:
- Project detail answers "What do I do next?" for the major states in the QA checklist.
- Handoff links preserve project/job/estimate/invoice context.
- Blocker copy explains why an action is unavailable without inventing unsupported shortcuts.

### Gate 4: Communications Baseline Is Stable

Required:
- `/communications` loads without a seeded thread.
- Empty states and unsupported source states are understandable.
- Replies write to canonical `communication_messages`.
- Notification triage updates canonical per-user notification read state.
- UI does not imply provider send, SMS, or automation execution.

### Gate 5: No Duplicate Record Creation

Required:
- Lead-to-estimate creates or links one canonical customer/project chain.
- Portal actions mutate the same canonical records.
- Directory remains a read-only view over canonical records.
- Invoice lines use approved snapshot/SOV/change-order/invoice-only lineage, not live estimate rows.
- No portal-only copies, schedule-only records, billing-copy records, or duplicate CRM records are created during QA.

## 6. First Internal Beta Candidate Criteria

An internal beta candidate is acceptable when:

- The full QA script has been run once by a contractor-admin user and once with at least one portal user.
- All Phase B readiness gates pass or have documented non-blocking exceptions.
- Any critical bugs found during QA have been fixed and revalidated.
- Known limitations are documented for internal testers.
- A fresh organization can be configured without seed data.
- The tester can understand where to start, what to do next, and where portal/customer work happens.
- No security or tenant-isolation concern is open.
- No workflow path requires direct database edits.

Internal beta can tolerate rough edges in reporting, automation, scheduling depth, and non-core modules if the canonical lead-to-payment chain is intact.

## 7. First Contractor Beta Candidate Criteria

An external contractor beta candidate is acceptable only after internal beta stabilizes.

Criteria:

- Contractor has a simple workflow, small team, and willingness to provide weekly feedback.
- Contractor can operate with the current portal limitations and understands linked-contact permission behavior.
- Contractor does not require public website generation, custom domains, mobile app intake, visualizer automation, e-notary, or external accounting sync for the beta.
- Contractor can start with manual setup of org profile, settings, templates, catalogs, portal access, and payment settings.
- Contractor is comfortable using supported browser-based contractor and portal workflows.
- Contractor agrees that provider-backed or automation gaps are known limitations, not hidden launch blockers.
- Support owner, escalation path, and data correction/offboarding plan are defined before onboarding.

## 8. What Not To Build Before Phase B Validation Is Complete

Do not build:

- Public website generator, SEO/location pages, or custom DNS automation.
- Customer mobile app or remote intake product.
- Visualizer-to-estimate automation.
- Full automation execution engine.
- Full reports builder beyond Phase B reporting basics.
- External e-sign, e-notary, accounting sync, or tax-provider integration.
- Paid SaaS billing and marketplace systems.
- Full dispatch optimization.
- Automatic migration, revocation, or cleanup of legacy null-contact portal grants.
- Any duplicate CRM, portal-only customer/project, billing-copy, schedule-copy, or reporting-shadow model.

Phase B validation should prove the current foundation before the product expands into growth, automation, mobile, website, or marketplace layers.

## 9. Recommended First 5 Phase B Implementation Prompts

1. Create the contractor onboarding checklist and setup-readiness page for internal beta tenants.
2. Build reporting basics over canonical data: opportunities, estimate pipeline, contracts, invoices, payments, schedule readiness, and job status.
3. Build tax reporting foundation from invoice snapshots: taxable sales, exempt sales, tax collected, and item taxable/non-taxable summaries.
4. Implement first notification-only automation execution with explicit logs and no workflow mutation.
5. Create the internal support and release checklist: issue capture, bug severity, data correction policy, known limitations, and beta readiness signoff.

## Phase B Start Recommendation

Start Phase B only after one complete seed-free manual QA pass has been run and defects are triaged.

Recommended immediate next action:
- Run [docs/internal-qa-workflow-checklist.md](C:/FloorConnector/docs/internal-qa-workflow-checklist.md) end to end.
- Record skipped steps and blockers.
- Fix only defects that prevent the readiness gates above.
- Then begin Phase B with onboarding and reporting basics before automation execution.
