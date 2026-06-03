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
  review, blocked estimate work, and customer follow-ups due. Rows now clarify
  assigned owner, requester when the creating user maps to an existing Person,
  waiting/blocked/review state, due state, blocker reason, and next action from
  existing Work Item context only.
- Estimate Workspace now shows a compact Estimate Work panel for open
  estimate handoff Work Items connected by estimate, project, or linked
  opportunity context. The panel can use the existing assignee-or-manager Work
  Item actions to mark work in progress, save a blocker reason, or complete the
  Work Item. It also exposes a compact Reassign control for open rows that
  updates only the existing `work_items.assigned_person_id` field after
  validating the selected active assignable Person in the current organization.
  Rows separate assigned owner, requester, and current waiting/blocked/review
  state without adding role persistence.
- Estimate Workspace now also has compact Request Missing Info and Request
  Review shortcuts. These shortcuts prefill the existing internal Work Item
  creation form with `kind = estimate_follow_up`, source-locked estimate
  context, estimate/project/opportunity metadata where available, and
  `estimateWorkType = request_missing_info` or `review_estimate`. The Work Item
  is created only after a contractor submits the existing form.
- Estimate Workspace now shows a read-only Estimate Handoff Packet beside the
  Estimate Work controls. The packet is derived from the linked opportunity's
  site-assessment state, requirements, notes, reviewed measurement groups,
  observations, attachments, customer/project context, and current estimate
  link. It flags missing source context for estimate production without writing
  new state, and shows source owner only when the linked opportunity creator
  maps to an existing Person.
- Project Workspace now shows read-only estimate handoff continuity for open
  estimate-production Work Items connected to the project, its estimates, or
  linked opportunity. The project panel summarizes open, blocked,
  ready-for-review, follow-up-due, next-most-urgent work, assigned owner, and
  requester context and links back to the canonical Work Item, estimate, or
  source record.
- Work Items remain internal-only and must be submitted by a contractor.

## Boundaries

- No schema or enum migration is added in this slice.
- No estimate is created by the Work Item itself.
- No estimate is sent, approved, reviewed, or customer-exposed by the Work Item.
- No calendar appointment is created by the Work Item.
- No commission, payroll, or legal wage behavior is implemented.
- No portal/customer surface reads these internal Work Items.
- No separate handoff-packet persistence, source snapshot, project-owned task
  board, or estimate-generation state is added.
- Reassignment does not create notification events, portal visibility,
  commission ownership, payroll ownership, send-as behavior, or a separate task
  assignment model.
- No onsite rep, relationship owner, sales credit owner, commission owner,
  payroll owner, or send-as user is inferred from task assignment or requester
  display.
- Dedicated missing-info and review-request creation shortcuts are implemented
  as Work Item form prefills only. Ready-for-review estimate status transitions,
  next-action editing on existing Work Items, send-as workflow, and commission
  ownership remain planned follow-up behavior unless a later slice adds safe
  canonical mutations for them.
- Project Workspace estimate handoff continuity remains read-only; it does not
  add project-local Work Item actions or a project-owned task board.

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
