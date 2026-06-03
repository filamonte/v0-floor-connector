# Sales Handoff Estimate Work Queue V1

Status: Active
Doc Type: Design

## Purpose

Sales handoff work must stay visible without creating a second CRM, task system,
calendar system, estimate model, or commission ledger.

The implemented V1 foundation reuses internal `work_items` and source-locks
estimate handoff work to the canonical opportunity or estimate record. Calendar
appointments can show when a site visit happens, but Work Items carry the
internal work: owner, source record, due state, next action, blocker state, and
completion.

## Implemented V1

- Lead Workspace Estimate Plan can prefill an internal estimate handoff Work
  Item from the current opportunity.
- The prefill copies real site-assessment status, requirements, notes,
  measurement summaries, observation summaries, and attachment counts into the
  internal instructions and safe metadata.
- Estimate handoff uses existing `kind = estimate_follow_up` and metadata
  `estimateWorkType` values:
  - `generate_estimate`
  - `review_estimate`
  - `request_missing_info`
  - `approve_send`
  - `follow_up_customer`
- Pure read-model selectors group estimate work into assigned, waiting-on-me,
  ready-for-review, blocked, and follow-ups-due queues.
- Dashboard `My Work` now consumes those same selectors and shows explicit
  estimate handoff lenses for assigned estimate work, waiting on me, ready for
  review, blocked estimate work, and customer follow-ups due.
- Work Items remain internal-only and must be submitted by a contractor.

## Boundaries

- No schema or enum migration is added in this slice.
- No estimate is created by the Work Item itself.
- No estimate is sent, approved, reviewed, or customer-exposed by the Work Item.
- No calendar appointment is created by the Work Item.
- No commission, payroll, or legal wage behavior is implemented.
- No portal/customer surface reads these internal Work Items.

## Role Model Direction

Future work should distinguish:

- onsite rep / site assessor
- relationship owner
- estimate writer
- sales credit owner / commission owner
- follow-up owner
- send-as user
- actual sender / audit user

The V1 metadata includes planned role slots only. Dedicated owner fields should
be added later only through an approved canonical commercial/financial slice
with audit rules, tenant-safe migrations, and clear downstream calculation
policy.

## Commission Direction

Commission ownership should stay attached to canonical commercial records such
as opportunity, project, estimate, contract, invoice, and payment context. It
must not become a detached payroll subsystem or a task-owned truth source.

Future commission preview should derive from canonical lifecycle state and
configurable triggers such as estimate approved, contract signed, deposit
received, invoice paid, project completed, or gross-profit closeout. Legal,
payroll, payable-state, and ledger behavior require separate approval.
