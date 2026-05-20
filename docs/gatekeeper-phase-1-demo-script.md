# GateKeeper Phase 1 Demo Script

Status: Active
Doc Type: QA Runbook

## Purpose

This script proves the implemented GateKeeper Phase 1 loop:

`manual/demo source -> artifact/suggestion -> review -> draft -> duplicate/preflight -> request -> controlled opportunity create -> linked result`

Phase 1 proves that GateKeeper can capture provider-neutral memory, create a reviewable `create_opportunity` suggestion, require human review, save a ledger-backed confirmation draft, run duplicate/preflight checks, require an explicit execution request, create exactly one canonical opportunity through the Opportunities-owned creation boundary, and surface the ledger result link afterward.

Phase 1 intentionally does not prove voice, SMS, email, telephony, AI, transcription, recording, calendar sync, portal access, autonomous execution, scheduling execution, project creation, estimate creation, job creation, invoice creation, contract creation, payment creation, or outbound messages.

`create_opportunity` is the only controlled execution in Phase 1 because it starts the canonical commercial chain at the lowest practical mutation risk. The Opportunities module already owns validation, tenant scope, contact linkage/creation, and opportunity creation. GateKeeper still does not directly insert opportunities or contacts.

## Demo Preconditions

- Run the local contractor app.
- Sign in as an authenticated contractor user.
- Confirm the user has an active tenant/company context.
- Confirm `/gatekeeper` loads in the contractor app.
- Apply the GateKeeper migrations where needed, including `20260519170000_gatekeeper_memory_foundation.sql` and `20260520120000_gatekeeper_execution_attempts.sql`.
- Use the built-in GateKeeper demo fixture named `New flooring inquiry`, or use manual seed values that include contact name, phone or email, requested service, location/site text, and notes.
- Keep provider, AI, telephony, SMS, email, transcription, recording, webhook, worker, calendar, and portal integrations out of this demo.

If the remote database already contains a prior demo run for the same fixture/contact, the duplicate section may warn about existing records. That is expected and should be treated as a useful negative-path check unless the goal is a clean happy-path run.

## Demo Path

1. Open `/gatekeeper`.
2. In the manual/demo intake area, choose the `New flooring inquiry` demo fixture.
3. Submit the fixture.
4. Confirm a memory artifact appears in the GateKeeper queue.
5. Switch to action suggestions if needed and confirm a `create_opportunity` suggestion appears.
6. Open the suggestion detail drawer.
7. Review the future action preview.
   - Expected owner: Leads/Opportunities.
   - Expected action: `create_opportunity`.
   - Expected guardrail: review approval is separate from execution.
8. Review the opportunity draft preview.
   - Confirm contact/name, phone, email, requested service, requested appointment text, source label, and notes are visible when supplied by the fixture.
9. Approve the suggestion review.
   - Confirm the suggestion review status becomes `approved`.
   - Confirm no opportunity is created at this step.
10. Reopen the detail drawer for the approved suggestion.
11. Edit the local confirmation draft if needed.
    - Required for the happy path: contact name, requested service, and location/site text.
    - Recommended: at least one contact method, notes, and source context.
12. Review the duplicate warning section.
    - If a high-confidence duplicate is shown, stop the happy path and record this as a duplicate-blocker check.
    - If no high-confidence duplicate is shown, continue.
13. Select `Save confirmation draft`.
14. Confirm the saved draft/preflight summary appears.
    - Expected ledger status: `confirmation_started`.
    - Expected summary: missing fields, future validation requirements, duplicate state, and Leads/Opportunities owner.
15. Select `Request future execution` or `Mark execution requested`.
16. Confirm the preflight/request state updates.
    - Expected ledger status: `execution_requested`.
    - Expected behavior: this still does not create an opportunity.
17. Confirm the final controlled action becomes available only after the request state is present and preflight is eligible.
18. Select `Create opportunity`.
19. Confirm the execution succeeds.
    - Expected ledger status: `executed`.
    - Expected `result_subject_type`: `opportunity`.
    - Expected `result_subject_id`: created opportunity id.
20. Confirm `/gatekeeper` shows an executed result badge or result section for the suggestion.
21. Open the created opportunity link.
22. Confirm the created opportunity exists in the canonical Lead/Opportunity Workspace.
23. Confirm no customer, project, estimate, job, schedule, invoice, contract, payment, portal record, or outbound message was created by this GateKeeper execution.
24. Return to `/gatekeeper` and confirm the final create action is hidden or unavailable after execution.
25. If the created opportunity has GateKeeper subject memory/result context visible, confirm the read-only result line links back to the execution result.

## Expected Results

- The demo fixture creates reviewable GateKeeper artifacts/suggestions only.
- The `create_opportunity` suggestion starts as review state, not execution state.
- Approving review changes the suggestion status to `approved`.
- Approving review does not create an opportunity.
- Saving the confirmation draft writes one `gatekeeper_execution_attempts` row with status `confirmation_started`.
- Requesting future execution updates that ledger row to `execution_requested`.
- The final controlled create action appears only for an approved `create_opportunity` suggestion with an eligible `execution_requested` ledger row.
- Creating the opportunity updates the ledger row to `executed`.
- Successful execution sets `result_subject_type = 'opportunity'`.
- Successful execution sets `result_subject_id` to the created opportunity id.
- `/gatekeeper` shows an executed result badge/link.
- The suggestion drawer/preflight panel shows the executed result.
- Repeat execution is blocked after `executed` or when any result subject link exists.
- Failed attempts show safe error copy and do not expose an automatic retry action.

## Negative QA Cases

### Missing Required Fields

1. Open a `create_opportunity` confirmation draft.
2. Clear contact name, requested service, or location/site text.
3. Save the draft.
4. Confirm preflight reports missing fields.
5. Confirm execution request or execution is blocked.

### High-Confidence Duplicate

1. Use a draft email or normalized phone that matches an existing opportunity, contact, customer, or executed GateKeeper ledger result.
2. Confirm the duplicate preview shows a high-confidence warning.
3. Confirm request/execution is blocked under the current no-override policy.

### Non-Approved Suggestion

1. Keep a `create_opportunity` suggestion in `proposed` review state.
2. Save a confirmation draft if available.
3. Confirm the execution request is blocked until the suggestion is approved.

### Failed Attempt

1. Use a controlled failure path only in a safe non-production environment.
2. Confirm the ledger row becomes `failed` with safe error text.
3. Confirm no automatic retry button appears.

### Already Executed Attempt

1. Complete a happy-path execution.
2. Reopen the suggestion drawer.
3. Confirm the result link remains visible.
4. Confirm `Create opportunity` is hidden or unavailable.
5. Confirm a repeat server action attempt is refused if manually triggered.

### Unknown Suggestion Type

1. Open a non-`create_opportunity` suggestion, such as scheduling or follow-up review.
2. Confirm it can show preview/review context only.
3. Confirm it cannot use the create-opportunity confirmation, request, or execution path.

## Safety Checks

During and after the happy path, verify:

- Review approval is not execution.
- GateKeeper creates exactly one canonical opportunity only after the final controlled create action.
- GateKeeper does not create customers.
- GateKeeper does not create projects.
- GateKeeper does not create estimates.
- GateKeeper does not create jobs, schedules, appointments, invoices, contracts, payments, portal records, tasks, or outbound messages.
- GateKeeper does not call `ensureOpportunityEstimateFlow`.
- GateKeeper does not send communications.
- GateKeeper does not call provider, AI, telephony, SMS, email, transcription, recording, webhook, worker, or calendar systems.
- `proposed_payload` remains untrusted display/source context until mapped and validated by the Opportunities-owned boundary.
- The execution ledger records status, result linkage, failure text where applicable, and idempotency context.

## Troubleshooting

### Migrations Not Applied

If saving a draft or requesting execution fails because `gatekeeper_execution_attempts` is missing, apply the GateKeeper migrations and verify `supabase_migrations.schema_migrations` includes `20260520120000`.

### Missing Auth Or Tenant Membership

If `/gatekeeper` redirects or shows empty/unauthorized state, confirm the contractor user is signed in and has active company membership.

### Duplicate Fixture Already Created

If the demo fixture warns about an existing matching email, phone, opportunity, contact, customer, or ledger result, either use a unique manual seed value or treat the run as a duplicate-blocker demo.

### Supabase Local DB Unavailable

If running against local Supabase and the database is unavailable, report the demo as blocked rather than successful. A docs-only dry run is not a runtime verification.

### Stale Browser State

After save/request/execute actions, refresh `/gatekeeper` if the drawer state looks stale. The server actions revalidate `/gatekeeper`, `/leads`, and the created opportunity link, but a stale browser tab can still show old UI state.

### Dirty Working Tree

This repo often has unrelated in-progress work. Before recording demo evidence, capture the current branch and `git status --short` so QA notes are tied to the real working tree.

### CRLF Warnings

`git diff --check` may print CRLF conversion warnings on Windows. Treat those separately from whitespace errors. The demo is blocked by whitespace errors, not by normal Windows line-ending warnings alone.

## Existing Focused Test Coverage

The current focused tests cover the non-browser version of this story:

- demo/manual source helpers produce reviewable `create_opportunity` suggestions
- review approval remains separate from execution
- confirmation drafts build ledger-only attempt shapes
- request transition requires approved suggestion, requestable status, required fields, and no high-confidence duplicate warning
- execution maps only allowed draft fields into the Opportunities-owned helper
- high-confidence duplicates block execution
- successful execution updates the ledger with `executed` and result subject fields
- failed execution writes a safe failed ledger update
- executed/failed result display appears in the queue/drawer/subject-memory helper surfaces
- repeat execution is blocked by status and result-subject checks
- forbidden provider/downstream modules are not imported by the GateKeeper execution path

Prefer these focused tests for fast regression checks. Add browser E2E only after the demo fixture/auth path is stable enough to avoid brittle test setup.

## Next After Phase 1

Recommended next options:

- GateKeeper Phase 1 polish/freeze is complete; keep future changes small and tied to the documented proof path.
- `schedule_site_assessment` controlled execution planning, still non-executing first.
- Stronger transaction/idempotency hardening for the create-opportunity execution service.
- Duplicate override policy with explicit user reason and audit trail.
- Opportunity detail backlink panel from `gatekeeper_execution_attempts` if the current subject-memory display is not enough.
- Provider/telephony source adapter planning later.
- GateKeeper mobile/native strategy continuation.
