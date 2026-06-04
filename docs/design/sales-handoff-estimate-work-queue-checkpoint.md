# Sales Handoff Estimate Work Queue Checkpoint

Status: Checkpoint
Doc Type: QA / Planning

## Purpose

This checkpoint closes the Sales Handoff / Estimate Work Queue mini-wave before
additional product behavior is added. The implemented chain keeps sales handoff
work on canonical internal `work_items` connected to the existing
opportunity/project/estimate records.

## Implemented

- Lead Detail can prefill an internal estimate handoff Work Item from real
  opportunity/site-assessment context and now points users back to an existing
  open handoff instead of preloading a duplicate handoff draft.
- Dashboard / My Work shows estimate handoff lenses for assigned estimate work,
  waiting on me, ready for review, blocked estimate work, and customer follow-up
  work due, with compact internal due-state nudges.
- Estimate Workspace has a compact Estimate Work panel for connected open
  estimate-production Work Items, including in-progress, blocker, complete,
  reassign, ready-for-review, next-action editing, and due-date set/clear
  controls on existing Work Items.
- Estimate Workspace can prefill request-missing-info and request-review Work
  Items from the current estimate context. The user still submits the existing
  Work Item form.
- Estimate Workspace shows a read-only handoff packet from linked opportunity
  context: site assessment, requirements, notes, measurement groups,
  observations, attachments, customer/project/estimate links, and source owner
  when the opportunity creator maps to an existing Person.
- Project Workspace shows read-only estimate handoff continuity for connected
  open estimate-production Work Items, including open, blocked,
  ready-for-review, follow-up-due, next-most-urgent work, assigned owner, and
  requester context.
- Work Item read models, actions, schemas, and prefills now carry the internal
  estimate-work metadata used by those surfaces without adding another task or
  estimate-production persistence model.
- Work Item due-date nudges classify existing `work_items.due_at` values as
  `Overdue`, `Due today`, `Due soon`, `Later`, or `No due date` for internal
  visibility only.
- Estimate Workspace due-date editing updates only the existing
  `work_items.due_at` field for eligible open estimate handoff Work Items.

## Surfaces

- Lead Detail:
  - creates only a prefilled Work Item draft until the contractor submits it
  - includes opportunity/site-assessment packet context in instructions and
    metadata
  - uses duplicate-aware open-handoff detection over existing Work Items
  - uses tenant-scoped active assignable People for assignment options
- Dashboard / My Work:
  - derives widgets from the shared estimate Work Item queue selectors
  - shows owner, requester, due state, blocker, next action, and source links
    from existing Work Item context
- Estimate Workspace:
  - is the main mutation surface for estimate-production Work Item follow-through
  - updates Work Item metadata/assignee/status/due-date fields only
  - keeps customer-facing estimate lifecycle state separate
- Project Workspace:
  - summarizes estimate handoff continuity read-only
  - links back to canonical Work Items, estimates, and source records
  - does not add project-local task actions in this mini-wave
- Work Item helpers:
  - `prefill.ts` builds source-locked Work Item drafts
  - `read-model.ts` selects connected Lead/Dashboard/Estimate/Project handoff
    work from canonical metadata
  - `actions.ts` mutates existing `work_items` only
  - tests cover prefill, selector, owner, assignment, ready-review, next-action,
    due-date editing payloads, and connected-chain behavior

## Out Of Scope

- no schema, enum, RLS, or migration changes
- no notifications, reminders, provider sends, or customer-visible messages
- no portal/customer exposure for internal Work Items
- no customer-facing `estimates.status` mutation from internal handoff work
- no send-as workflow
- no commission, sales-credit, payroll, payable, or ledger behavior
- no fake owners or inferred legal/commercial ownership
- no autonomous AI behavior or AI-owned workflow state
- no new task, handoff-packet, source snapshot, project task board, or estimate
  production table

## Validation Summary

The mini-wave was closed with a pure regression net rather than new protected
browser coverage:

- focused Work Item and source-assessment tests cover prefill context,
  duplicate-aware handoff selection, real-owner fallback, assignment candidate
  filtering, ready-for-review metadata, next-action metadata cleanup, dashboard
  and project selectors, due-date nudge classification, and unrelated-task
  exclusion
- `pnpm.cmd --filter @floorconnector/web typecheck` passed
- `pnpm.cmd --filter @floorconnector/web lint` passed
- `git diff --check` passed, with only Windows CRLF warnings where noted
- `pnpm.cmd fc:preflight:fast` passed
- protected Playwright dashboard/detail e2e was deferred during the final QA
  consolidation because recent protected-route checks were susceptible to
  Supabase Auth rate limiting; future browser validation should use the
  existing protected auth fixture and stop on `over_request_rate_limit`

## Recommended Next Options

1. Role-slot policy depth:
   Role Slots Foundation V1 is implemented as nullable canonical ownership
   metadata for Onsite Rep, Relationship Owner, Follow-Up Owner, Sales Credit
   Owner, and Estimate Writer. Future work can add organization policy,
   reporting filters, or setup guidance without treating Work Item assignment
   as business ownership.
2. Sales credit owner planning beyond metadata:
   Keep commission, payroll, payout, wage, ledger, and financial reporting
   behavior deferred until commercial boundaries are approved.
3. Project Workspace mutation controls:
   Add only if managers need project-context handoff action controls; preserve
   the same assignee-or-manager Work Item policy.
4. Dashboard mutation controls:
   Consider compact action controls after the Estimate Workspace behavior stays
   stable; avoid turning Dashboard into a full task manager.
5. Notifications later:
   Use the existing notification foundation only after internal reminder/send
   policy is defined.
6. Commission preview later:
   Derive from canonical lifecycle state and approved commercial owner fields,
   not from Work Item assignment.

## Risks And Cleanup

- The connected surfaces now depend on consistent metadata keys
  (`estimateWork`, `estimateWorkType`, `estimateWorkStatus`, `opportunityId`,
  `projectId`, `estimateId`, and `nextAction`). Future changes should update
  the pure regression tests before changing those keys.
- Lead duplicate detection is a read-model guard, not a database uniqueness
  guarantee. Server-side idempotency can be revisited if duplicate handoffs
  become operationally common.
- Assignment is internal Work Item ownership only. It must not be interpreted
  as onsite role, sales credit, commission owner, payroll owner, or send-as
  identity. Role slots are explicit canonical metadata and Sales Credit Owner
  remains metadata only.
- Project Workspace remains read-only for this chain. That is intentional until
  project-context mutation controls are deliberately scoped.
- Protected e2e should be refreshed when Supabase Auth is not rate-limited to
  verify the Lead/Dashboard/Estimate/Project visual chain with the existing
  authenticated fixture.
