# Role Slots Foundation V1

Status: Implemented
Doc Type: Design Checkpoint

## Implemented

Role Slots Foundation V1 adds internal ownership metadata on canonical records so business responsibility can be named without overloading Work Item assignment.

Implemented role slots:

- `opportunities.onsite_rep_person_id`
- `opportunities.relationship_owner_person_id`
- `projects.onsite_rep_person_id`
- `projects.relationship_owner_person_id`
- `projects.follow_up_owner_person_id`
- `projects.sales_credit_owner_person_id`
- `estimates.estimate_writer_person_id`

All role slots are nullable same-organization references to existing active assignable `people` records. Lead-to-project estimate handoff copies explicit lead Onsite Rep and Relationship Owner values into a newly created project, and can fill an already-linked project only when the corresponding project role slot is still empty.

## Surfaces

- Lead Detail shows editable Onsite Rep and Relationship Owner role slots.
- Project Workspace shows editable Onsite Rep, Relationship Owner, Follow-Up Owner, and Sales Credit Owner role slots.
- Estimate Workspace shows editable Estimate Writer plus read-only Relationship Owner and Sales Credit Owner context from the linked project.

Truthful empty states such as `Not assigned` and `Not captured yet` are used when no valid person is set. The UI does not create fake owners.

## Boundaries

Role slots are business ownership metadata only. They are distinct from:

- `work_items.assigned_person_id`
- customer-facing `estimates.status`
- commission calculation
- payroll or payout handling
- ledger behavior
- notifications
- portal/customer behavior
- AI ownership inference or automation

Sales Credit Owner is attribution metadata only in this slice. It does not calculate commission, produce payroll obligations, create payout records, or drive financial reporting.

## Validation Notes

This slice adds focused pure tests for role-slot display, missing-owner fallback, unknown-person fallback, active/assignable candidate filtering, project inheritance, estimate role context, and cleared-selection schema normalization.

Broader validation should include:

- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/role-slots/role-slots.test.ts`
- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- `git diff --check`
- `pnpm.cmd fc:preflight:fast`

## Deferred

- configurable role-slot policies per organization
- dedicated sales credit planning beyond metadata
- commission preview or calculation
- payroll, payout, wage, or ledger behavior
- notifications or reminder delivery
- dashboard mutation controls
- portal/customer visibility
- send-as workflow
- AI ownership inference
