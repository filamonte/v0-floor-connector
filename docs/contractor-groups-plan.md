# Contractor Groups Plan

Status: planning and read-model guardrails for platform-owned contractor segmentation.

Contractor groups are platform-managed segmentation metadata. They help platform admins organize contractor organizations for onboarding targeting, starter-pack targeting previews, rollout cohorts, beta programs, regional/trade segmentation, future plan packaging, and future entitlement planning.

Contractor groups are not tenant membership roles, contractor-side permission groups, entitlement grants, pricing packages, module gates, starter-pack auto-provisioning triggers, or runtime workflow controls.

## Purpose

Contractor groups should answer platform-operator questions such as:

- which organizations are in this rollout cohort?
- which organizations are explicit candidates for a future starter-pack recommendation?
- which organizations are part of a beta, region, trade segment, onboarding segment, or future package-planning cohort?
- who assigned an organization to a group, when, and why?
- what downstream planning surfaces reference this group key?

They should not answer contractor-app authorization questions. Contractor organization membership roles remain the source of tenant-side access, and platform-admin authorization remains separate through platform roles.

## Current Foundation

Implemented today:

- `contractor_groups` stores platform-owned group metadata.
- `contractor_group_memberships` stores current explicit organization membership.
- `contractor_group_audit_events` stores durable platform-admin-only audit/history rows for group lifecycle and assignment events. The table is hardened with RLS/grant posture, read-only in the UI, and written by transaction-aware server-side RPC wrappers for current group management actions.
- A metadata-capable service-role-only assignment RPC/helper supports optional sanitized proposal-review audit metadata for the implemented proposal-to-manual-assignment action while preserving the existing direct manual assignment RPC behavior.
- `/super-admin/groups` lets platform admins create, edit, archive, assign, remove, filter, and inspect groups.
- `/super-admin/groups` includes read-only group observability, assignment proposals, an inferred assignment-history readiness panel, durable audit-history rows, and audit observability summaries for event counts, event type/source breakdowns, group and organization activity, metadata coverage, and missing context warnings.
- Starter-pack targeting previews can match `future_contractor_group` assignment intent only through explicit current membership.

Current limitations:

- existing membership removals that happened before audit write wiring cannot be reconstructed from current rows
- group archive status is visible from current rows, while exact archive actor/reason/event timestamp is available only for archived events written after audit wiring
- audit writes are transaction-aware for current create/update/archive/assign/remove actions, but broader operator QA is still required before groups power any enforcement or automation
- no assignment automation exists
- no entitlement, pricing, provisioning, module, permission, or runtime behavior depends on group membership

## Contractor Groups Vs Tenant Roles

Tenant roles control contractor-app access inside an organization. They are organization-scoped and currently include owner, admin, manager, and member.

Contractor groups are platform-scoped classification records. They classify organizations for operator planning only. A contractor user should not gain app access, lose app access, receive a module, receive a price/package, or receive starter-pack records because their organization is in a contractor group.

Any future use of groups for entitlements, rollouts, onboarding, or provisioning must go through a separate explicit server-side policy, preview, audit, and approval path.

## Assignment Lifecycle

Current lifecycle:

1. Group created.
2. Group metadata updated.
3. Organization manually assigned to group.
4. Organization removed from group.
5. Group marked inactive.
6. Group archived.

Future durable audit lifecycle should record:

- group creation
- metadata/status/type changes
- organization assignment
- organization removal
- assignment source changes
- group archive/inactive transitions

Removed membership history must be preserved before contractor groups power any enforcement, automation, entitlement, or provisioning recommendation queue.

## Audit Event Model

The contractor group audit table is designed to record these event types:

- `group_created`
- `group_updated`
- `group_archived`
- `group_activated`
- `group_deactivated`
- `organization_assigned`
- `organization_removed`
- `assignment_source_changed`

Each event should include:

- contractor group id when applicable
- organization id when applicable
- membership id when still available
- actor platform user id
- event timestamp
- assignment source
- reason or operator notes
- safe metadata snapshot for changed fields
- safe downstream reference context when relevant

The audit model should be append-only. Operator corrections should create new events rather than rewriting prior history.

Phase 6F added the table and read-only timeline. Phase 6G wires current group create/update/archive/assign/remove actions through server-only RPCs so the group mutation and audit event insert succeed or fail together.

## Actor Metadata

Future assignment audit events should capture:

- platform-admin actor id
- actor display/email snapshot if safe and already available server-side
- timestamp
- assignment source: manual, targeting preview, or future automation
- operator reason/notes
- changed fields for metadata updates
- previous and new status/type/source values when applicable

Current `contractor_group_memberships.assigned_by` and `created_at` can explain current assignments, but they are not enough for durable assignment history because removal deletes the row.

## Automation Safeguards

Future automatic assignment must be preview-first:

- system proposes membership changes
- operator reviews impacted organizations and reasons
- proposed assignments remain non-enforcing until explicitly applied
- applying assignments records audit events
- assignment changes do not trigger provisioning or entitlement changes by themselves

Automatic assignment must not silently:

- provision starter packs
- enable modules
- change prices/packages
- grant contractor permissions
- alter tenant defaults
- mutate templates, catalogs, estimates, invoices, contracts, jobs, tax, payroll, or financial behavior

## Assignment Proposal Read Model

Current assignment proposals are decision support only. The proposal read model compares existing contractor group definitions with currently loaded organization metadata and current explicit memberships, then explains whether a platform admin may want to review a manual assignment.

Proposal outcomes:

- `proposed`: current organization metadata appears to match a group definition and the organization is not already assigned
- `already_assigned`: current membership already exists, so no new assignment is suggested
- `not_applicable`: the group is visible but not recommended for this organization
- `unavailable`: the system does not have enough safe metadata, the group is archived, or the group type is future-only

Current matching is intentionally conservative:

- regional groups can be proposed only when organization state/region metadata exactly matches the group key or name
- trade-segment groups can be proposed only when organization primary-trade metadata exactly matches the group key or name
- onboarding and beta groups require explicit organization labels/metadata to match the group key or name before they can be proposed
- internal and custom groups are not inferred aggressively
- archived groups are not proposed for new assignment
- future-plan and future-entitlement groups are always unavailable/future-only
- existing memberships always show as already assigned

Assignment proposals remain read-model decision support until a platform admin explicitly applies one eligible row through the proposal manual-assignment action. The read model itself does not write `contractor_group_memberships`, does not write audit events, does not provision starter packs, does not enable modules, does not change pricing/packages, does not grant contractor permissions, does not mutate tenant defaults, and does not affect runtime workflows. The implemented action is a narrow server-side bridge into the existing audited manual assignment path.

The current proposal inspection UI supports read-only filtering by organization, proposal status, confidence, and group type. For a selected organization it also summarizes total proposals, proposed rows, existing assignments, unavailable rows, and the most common reasons/caveats. These filters only narrow the read model; they do not apply memberships or create audit events.

## Assignment Proposal Manual Review Readiness

Assignment proposals are suggestions until a platform admin explicitly accepts one eligible row. The implemented proposal-to-manual-assignment flow is intentionally narrow and keeps the broader proposal decision lifecycle future-only:

- `suggested`: the read model has produced a proposal from current organization metadata, group definition, and membership state
- `reviewed`: a platform admin has inspected the evidence, caveats, group status, current memberships, and audit history
- `manually assigned`: the platform admin intentionally uses the existing audited manual assignment RPC/action with explicit reason/notes
- `dismissed` / `ignored`: the platform admin decides not to assign; this is planning-only today and would require durable proposal decision history before implementation
- `future stale proposal`: the proposal must be recomputed or treated as stale when organization metadata changes, the group is archived/inactive, membership already exists, or related targeting assignment intent changes

Before any manual assignment is made from a proposal, the operator review surface should show:

- organization metadata source that produced the proposal, such as region, primary trade, or explicit organization labels
- matching contractor group key, type, status, and current availability
- proposal confidence, source, and reason text
- all caveats and blocking conditions
- current explicit memberships for the organization and target group
- durable contractor group audit history involving the group or organization
- related starter-pack assignment references that use the group key, when applicable

Implemented manual-review requirements:

- platform-admin only
- explicit reason/notes required before assignment
- exact `ASSIGN GROUP MANUALLY` confirmation required before assignment
- no bulk apply
- no auto-assign
- assignment must use the existing audited manual assignment RPC/action so membership and audit evidence are written together
- proposal review must not bypass RLS/grant posture or expose service-role credentials to the browser

Dismiss/ignore behavior is not implemented. A future dismissal flow would require durable proposal decision history so operators can see who dismissed a proposal, why, when, whether it was later re-suggested, and which metadata changed.

Future stale proposal rules should force recomputation or warning when:

- organization region, primary trade, labels, or tenant status change
- target contractor group is archived, inactive, renamed, or retyped
- an explicit membership already exists
- the referenced starter-pack assignment intent changes
- audit history shows a recent assignment/removal that may supersede the suggestion

The first proposal action is now implemented as a narrow server-side bridge into the existing audited manual assignment flow. It does not add a durable proposal decision/dismissal state machine, bulk actions, automation, entitlement behavior, starter-pack provisioning, pricing/package behavior, contractor permissions, tenant defaults, or runtime workflows. Future proposal-decision history or dismissal behavior still requires a separate design.

The current `/super-admin/groups` proposal panel includes a manual review checklist for visible proposal rows. Eligible proposed high/medium-confidence rows also expose one expandable manual assignment form that requires operator reason plus exact `ASSIGN GROUP MANUALLY` confirmation. The proposal read model still keeps `actionAvailable` false because the write path is the separate platform-admin server action, not a read-model mutation.

## Proposal-To-Manual-Assignment Implemented Behavior

The first proposal action is implemented as a human-confirmed server-side bridge into the existing audited manual assignment flow. The current action name is `applyContractorGroupProposalManualAssignmentAction(...)`.

Current action shape:

- server action: `applyContractorGroupProposalManualAssignmentAction(formData)`
- core server helper: `applyContractorGroupProposalManualAssignment(input, dependencies)`
- no client-side service-role access
- no browser-side write path
- no direct insert into `contractor_group_memberships` from UI code
- no entitlement, provisioning, pricing, permission, or runtime side effect

Required inputs:

- `organization_id`
- `contractor_group_id`
- proposal fingerprint or recomputable proposal source tuple, such as proposal source, confidence, organization metadata fields used, group key/type/status, and generated reason text
- operator reason/notes
- exact confirmation phrase `ASSIGN GROUP MANUALLY`
- current filtered UI context only for redirect/revalidation, not for authorization

Required server-side recomputation:

- reload the contractor group, organization, existing memberships, and relevant starter-pack assignment references on the server
- rebuild the assignment proposal read model server-side for the requested organization/group pair
- compare the submitted proposal fingerprint/source context to the recomputed proposal, and warn/block when it is stale
- check existing membership again immediately before writing
- check contractor group status again
- check organization tenant/status again
- confirm platform-admin actor through the same platform-role boundary used by current group management actions

Allowed proposal states:

- `proposed` with `high` confidence may be eligible for manual review when the group is active and the organization is active enough for platform segmentation
- `proposed` with `medium` confidence may be eligible only with stronger operator reason/notes and explicit caveat review
- `already_assigned` returns an idempotent no-op/readback result and does not create a duplicate membership
- `unavailable` must be blocked
- `not_applicable` must be blocked
- archived groups must be blocked for new assignment
- inactive groups must be blocked until reactivated or require a separate explicit status-management action first
- `future_entitlement` and `future_plan` groups are blocked

Audit behavior:

- the proposal action calls the existing audited manual assignment RPC/helper path, currently represented by `assignOrganizationToContractorGroupWithAuditMetadata` and `assign_contractor_group_membership_with_audit_metadata`, which preserves the same transaction-aware membership/audit boundary with proposal metadata
- the resulting audit event must be `organization_assigned`
- assignment source is `targeting_preview` so proposal-reviewed assignments are distinguishable from direct manual assignments
- operator reason/notes should be required and passed through the audited assignment path
- safe audit metadata includes proposal source, confidence, status, reason code, recomputation status, operator-reason-present flag, group key/type/status, blocked-state-checked flag, organization label, and scalar proposal fingerprint
- metadata must not include raw database errors, service-role keys, provider payloads, stack traces, or secret values

Idempotency and concurrency expectations:

- existing membership should never duplicate
- repeated review after the first successful assignment shows already-assigned/no eligible form; server-side already-assigned recomputation returns no-write/readback behavior
- the final membership check and audit write should remain inside the transaction-aware RPC path
- stale proposal detection should happen before the write, but the write path must still rely on database uniqueness/transaction guards
- errors should be safe operator messages, not raw database details

Operator UI workflow:

- show the read-only manual review checklist first
- require explicit reason/notes before submit
- require confirmation phrase
- no bulk apply
- no auto-assign
- copy must say assignment is platform segmentation only and does not trigger entitlement, starter-pack provisioning, pricing/package behavior, contractor permission changes, tenant defaults, or runtime workflow behavior

Security requirements:

- platform-admin only
- server-side only
- no client/browser service-role exposure
- use the existing platform-admin authorization boundary
- preserve current contractor group RLS/grant posture
- do not grant contractor users direct visibility or mutation access to group proposal/action internals

Implemented QA/security gates:

- unit coverage for proposal recomputation, fingerprint mismatch/stale behavior, allowed/blocked states, and idempotent already-assigned readback
- focused tests for safe metadata shaping
- live operator QA proving proposed high/medium assignment writes exactly one membership and one `organization_assigned` audit event
- live operator QA proving repeated submit does not duplicate membership or audit incorrectly
- live operator QA proving unavailable/not-applicable/archived/future-plan/future-entitlement states are blocked
- before/after count checks proving only contractor group membership/audit counts change when the action succeeds
- verification that document templates, catalog items, starter-pack provisioning runs/items, entitlements, pricing, permissions, tax, payroll, invoice, contract, and runtime workflow records do not change

### Proposal Assignment Readiness Model

Phase 6V added a pure readiness model before the proposal apply action existed. It remains a guardrail and read-model helper: it does not itself create a membership, write audit events, create a proposal decision record, or add runtime behavior. The later proposal apply action must still recompute server-side before any write.

The readiness model returns:

- whether the proposal could be eligible for manual review
- readiness status: `eligible_for_manual_review`, `already_assigned`, `blocked`, `unavailable`, or `stale_recompute_required`
- required inputs: reason/notes plus the confirmation phrase `ASSIGN GROUP MANUALLY`
- server-side recomputation requirements
- safe audit metadata preview for proposal source, confidence, caveats, group key/type/status, organization id/name, and recent audit context
- blocking and warning issues
- safe operator summary text
- `actionAvailable: false`

Current readiness rules are intentionally conservative:

- `proposed` high-confidence and medium-confidence rows may be eligible for manual review only when the group is active and current loaded context matches the proposal
- `already_assigned` returns readback/no-op guidance and must not duplicate membership
- `unavailable` and `not_applicable` rows are blocked
- low-confidence rows are blocked
- archived and inactive groups are blocked
- `future_plan` and `future_entitlement` groups are blocked
- missing organization or group context is unavailable
- mismatched loaded organization/group context returns `stale_recompute_required`
- a current membership discovered at readiness time overrides the proposal row and returns `already_assigned`
- every output keeps `actionAvailable: false`

The apply action must still recompute the proposal server-side before any write. The readiness model is a guardrail and test target, not authority to mutate membership.

## Proposal-To-Manual-Assignment Final Readiness Review

Readiness verdict: the narrow human-confirmed proposal-to-manual-assignment implementation is complete and remains intentionally limited. The current foundation is still not ready for bulk apply, auto-assignment, proposal dismissal/history, entitlements, starter-pack auto-provisioning, pricing/package behavior, contractor permission changes, or any runtime workflow effect.

Existing helpers and paths available:

- proposal read model: `buildContractorGroupAssignmentProposals`
- manual-review checklist builder: `buildContractorGroupAssignmentProposalManualReviewChecklist`
- readiness model: `buildContractorGroupProposalAssignmentReadiness`
- server recomputation readiness model: `buildContractorGroupProposalManualApplyServerReadiness`
- audited direct manual assignment action path: `assignContractorGroupMembershipAction` -> `assignOrganizationToContractorGroup` -> `assign_contractor_group_membership_with_audit`
- proposal manual assignment action path: `applyContractorGroupProposalManualAssignmentAction` -> `applyContractorGroupProposalManualAssignment` -> `assignOrganizationToContractorGroupWithAuditMetadata` -> `assign_contractor_group_membership_with_audit_metadata`
- audit observability helpers for event labels, safe metadata summaries, timelines, group summaries, and organization summaries

The implemented proposal action reuses the existing audited assignment boundary for the final membership write and `organization_assigned` audit event. It is a server-side wrapper that recomputes and validates proposal eligibility first, then calls the Phase 6Z service-role-only metadata-capable assignment RPC/helper for structured proposal-review audit evidence. Do not add separate Supabase calls around the membership RPC because that would weaken atomicity.

Implemented action input contract includes:

- `organization_id`
- `contractor_group_id`
- submitted proposal fingerprint or source tuple, including proposal id, status, confidence, source, reason code, group key/type/status, and organization id
- operator reason/notes
- confirmation phrase `ASSIGN GROUP MANUALLY`
- redirect/filter context for returning the operator to the same read-only review, never for authorization

Implemented server-side validation sequence:

1. Require platform-admin access through the same server boundary used by current group management actions.
2. Load organization, contractor group, current memberships, recent relevant audit context, and starter-pack assignment references on the server.
3. Rebuild the proposal model server-side for the requested organization/group pair.
4. Compare submitted proposal context with the recomputed row and block stale mismatches.
5. Re-run readiness rules with current organization, group, and membership context.
6. Require operator reason/notes and confirmation phrase.
7. If eligible, call the existing audited manual assignment path exactly once.
8. Revalidate `/super-admin/groups` and return a user-safe success or readback message.

Implemented audit metadata is safe, bounded, and non-secret. It includes proposal source, confidence, status, reason code, recomputation status, operator-reason-present flag, group key/type/status, blocked-state-checked flag, organization label, and a bounded scalar proposal fingerprint. It excludes raw database errors, provider payloads, stack traces, service-role credentials, private user data beyond needed actor id/label, nested unsafe blobs, arrays, and unbounded metadata dumps.

Implemented idempotency behavior:

- if membership already exists before submit, return already-assigned/readback and do not write another membership
- if membership is created by a concurrent submit, rely on the existing transaction/uniqueness guard and return already-assigned/readback after reload
- repeated submit after success must not duplicate membership
- audit evidence should reflect the actual manual assignment write; avoid adding separate proposal-accepted audit rows until durable proposal decision history exists

Implemented user-safe error handling:

- archived or inactive group: block and tell the operator to reactivate or choose an active group first
- future-plan or future-entitlement group: block because those groups are planning metadata only
- unavailable, not-applicable, or low-confidence proposal: block and explain that the first implementation only accepts high/medium confidence proposed rows
- missing organization/group context: block as unavailable and ask the operator to refresh
- changed organization metadata: block as stale recompute required when the proposal no longer matches
- recomputed proposal no longer matches submitted context: block, ask the operator to refresh, and do not write
- raw database errors must stay behind safe platform-admin messages

Explicit final design answers:

- Existing audited manual assignment RPC/action reuse: yes, for the final membership write and audit event, after server-side proposal recomputation.
- New RPC needed: not for the first narrow version unless proposal-specific audit metadata cannot be passed through the existing audited assignment path atomically.
- Confirmation phrase: yes, require `ASSIGN GROUP MANUALLY` for the first implementation.
- Reason/notes: yes, require explicit operator reason/notes.
- Low-confidence proposals: remain blocked for the first implementation.
- Unavailable/not-applicable proposals: remain blocked.
- Existing membership: return already-assigned/readback and do not duplicate membership.
- Group archived/inactive between render and submit: block after recomputation; no assignment write.
- Organization metadata changed between render and submit: recompute; block if the proposal no longer qualifies or the submitted fingerprint is stale.
- Recomputed proposal mismatch: return `stale_recompute_required`, ask the operator to refresh, and do not write.

Implemented security posture:

- platform-admin only, checked server-side
- no client/browser service-role exposure
- preserve existing contractor group RLS/grant posture
- do not grant `anon`, `authenticated`, or `public` execute access to sensitive mutation RPCs
- do not expose contractor users to proposal/action internals
- keep metadata sanitized and bounded
- keep all membership writes inside the transaction-aware audited assignment path

Implemented QA coverage:

- unit tests for server-side recomputation, stale fingerprint mismatch, and readiness status mapping
- unit tests for audit metadata shaping and secret/raw-error exclusion
- action tests or focused integration tests for already-assigned idempotency and blocked states
- live platform-admin QA for one high-confidence and one medium-confidence proposal
- repeated-submit QA proving no duplicate membership
- count checks proving only contractor group membership/audit counts change on success
- negative QA for archived, inactive, future-plan, future-entitlement, unavailable, not-applicable, and low-confidence rows
- verification that document templates, catalog items, starter-pack provisioning runs/items, entitlements, pricing, permissions, tax, payroll, invoice, contract, and runtime workflow records do not change

UI/operator copy requirements for the implemented action:

- show the manual-review checklist before any submit
- state that assignment is platform segmentation only
- state that the action writes current membership and audit evidence only
- state that no entitlement, provisioning, pricing/package, contractor permission, tenant default, or runtime behavior is triggered
- no bulk apply in the first version
- no auto-assign
- no disabled fake button or alternate write control

## Proposal-To-Manual-Assignment Implementation Checklist

Phase 6Y verified the existing audited manual assignment contract. The later proposal manual-assignment implementation reused that server-side assignment path for the final membership mutation and added a proposal-specific server action wrapper.

Audited assignment contract verified:

- `assignContractorGroupMembershipAction` requires platform-admin access through `requirePlatformAdminUser("/super-admin/groups")`.
- `contractorGroupMembershipInputSchema` validates `contractorGroupId`, `organizationId`, `assignmentSource`, and `notes`.
- `assignOrganizationToContractorGroup` uses the server-only Supabase admin client and calls `assign_contractor_group_membership_with_audit`.
- `assign_contractor_group_membership_with_audit` locks the target group, blocks archived groups, validates the organization, locks the current membership row, upserts membership, and writes the audit row in the same database transaction.
- RPC execute grants are revoked from `public`, `anon`, and `authenticated`, then granted to `service_role`.

Implemented verdict:

- The proposal action is a server-action wrapper around the existing audited assignment path for the membership write.
- The metadata-capable RPC stores proposal source, confidence, status, reason code, recomputation status, blocked-state check evidence, group key/type/status, operator-reason-present evidence, organization label, and a bounded scalar proposal fingerprint.
- The proposal action does not create a second membership-writing system and does not write proposal metadata through a separate non-transactional Supabase call around the membership RPC.

Implementation anchors:

- `apps/web/lib/platform-admin/schemas.ts`: proposal manual-assignment input schema.
- `apps/web/lib/platform-admin/actions.ts`: `applyContractorGroupProposalManualAssignmentAction`.
- `apps/web/lib/platform-admin/data.ts`: server-side readiness and metadata assignment helper calls.
- `apps/web/lib/platform-admin/contractor-group-proposal-apply-core.ts`: pure action core, stale checks, blocked-state checks, metadata shaping, and safe error behavior.
- `apps/web/lib/platform-admin/contractor-group-proposal-apply.test.ts`: focused action/security/idempotency tests.
- `apps/web/components/contractor-group-manager.tsx`: eligible-only single-row manual assignment form; no bulk action.
- `supabase/migrations/20260508041324_contractor_group_assignment_audit_metadata_rpc.sql`: metadata-capable assignment RPC.
- `supabase/migrations/20260508174905_contractor_group_assignment_proposal_fingerprint_metadata.sql`: bounded scalar proposal fingerprint metadata support.

Implemented server action shape:

- action name: `applyContractorGroupProposalManualAssignmentAction(formData)`
- core helper name: `applyContractorGroupProposalManualAssignment(input, dependencies)`
- required input fields:
  - `organizationId`
  - `contractorGroupId`
  - submitted proposal fingerprint fields
  - `operatorReason`
  - `confirmationPhrase`
  - optional redirect/filter context
- required confirmation phrase: `ASSIGN GROUP MANUALLY`
- assignment source for proposal-reviewed assignments: `targeting_preview`

Implemented input schema:

- UUID validation for organization and contractor group ids.
- non-empty reason/notes, capped to the current safe note length unless a migration changes it.
- exact confirmation phrase match.
- submitted proposal fingerprint fields for proposal id, status, confidence, source, reason code, group key/type/status, organization id, and manual-review readiness.
- redirect/filter context should be validated as UI state only and never used for authorization.

Implemented server-side recomputation sequence:

1. Require platform-admin access.
2. Load groups, tenants, starter-pack assignment references, and relevant contractor group audit events with server-side helpers.
3. Recompute `buildContractorGroupProposalManualApplyServerReadiness` for the requested organization/group pair.
4. Compare the submitted fingerprint to the recomputed proposal.
5. Block stale, unavailable, not-applicable, low-confidence, archived, inactive, future-plan, future-entitlement, missing-context, and non-reviewable-organization states.
6. Check current membership before calling the RPC. If membership already exists, return already-assigned/readback and do not call the assignment RPC.
7. Require reason/notes and confirmation phrase.
8. Shape safe audit context.
9. Call the existing audited assignment path exactly once, using the Phase 6Z metadata-capable helper when structured proposal-review metadata should be recorded.
10. Revalidate `/super-admin/groups` and redirect with a safe success/readback message.

Implemented blocked states:

- `already_assigned`: no-op/readback; do not call the RPC.
- `unavailable`: blocked.
- `not_applicable`: blocked.
- `proposed` with `low` confidence: blocked.
- archived groups: blocked by wrapper and RPC.
- inactive groups: blocked by wrapper before the RPC because the current RPC blocks archived groups only.
- `future_plan` and `future_entitlement` groups: blocked.
- non-active/non-trialing organizations: blocked by server readiness.
- stale submitted fingerprint: blocked.
- recomputed proposal missing or no longer matching: blocked.

Implemented audit metadata shape:

- proposal source
- confidence
- proposal status
- reason code
- server recomputation status
- operator-reason-present flag
- group key/type/status
- blocked-state-checked flag
- safe organization label
- bounded scalar proposal fingerprint
- raw operator notes remain in the audited reason/notes field rather than duplicated as an unbounded metadata value
- no raw database errors, provider payloads, stack traces, service-role secrets, nested unsafe blobs, arrays, or unbounded JSON dumps

Current metadata support:

- the original `assign_contractor_group_membership_with_audit` RPC still writes fixed metadata generated inside the RPC and remains the unchanged manual-assignment path
- Phase 6Z adds `assign_contractor_group_membership_with_audit_metadata`, which accepts optional sanitized proposal-review metadata and writes it atomically with the membership/audit event
- Phase 7A adds a follow-up sanitizer migration so proposal-review metadata may include a bounded scalar `proposalFingerprint`
- exact proposal decision history, dismissal history, or bulk automation evidence still requires a separate future design
- do not write proposal metadata through a separate non-transactional Supabase call around the membership RPC

Implemented focused tests:

- schema rejects missing reason/notes and wrong confirmation phrase
- server readiness allows high/medium proposed active group only
- low-confidence, unavailable, not-applicable, archived, inactive, future-plan, and future-entitlement rows are blocked
- stale submitted fingerprint is blocked
- existing membership returns already-assigned without calling the assignment helper
- audit metadata shaping excludes raw errors and secrets
- successful path calls the audited assignment helper exactly once
- no starter-pack, entitlement, pricing, permission, template, catalog, tax, payroll, invoice, contract, or runtime helper is called

Implemented browser/live QA:

- opened `/super-admin/groups` with platform-admin auth on localhost
- created a deliberate active QA trade-segment group through the existing audited group-management RPC so one high-confidence proposal existed
- selected one eligible high-confidence proposal for the `jfilamonte` trialing QA organization
- submitted the single-row form with operator reason and exact `ASSIGN GROUP MANUALLY` confirmation
- confirmed exactly one current membership row and one `organization_assigned` audit event were created for the proposal apply
- confirmed audit metadata persisted `assignmentContext = proposal_manual_review`, proposal source/confidence/status/reason code, recomputation status, group key/type/status, blocked-state flag, operator-reason-present flag, organization label, and proposal fingerprint
- reloaded the same filtered proposal view and confirmed no eligible form remained because the organization was already assigned
- cleaned up the deliberate membership through the audited removal RPC and archived the deliberate QA group through the audited archive RPC
- verified template, catalog, and starter-pack provisioning counts did not change

Future browser QA for later changes:

- verify blocked states produce safe errors through the UI when deliberate blocked QA rows are available
- confirm no bulk apply or auto-assign control appears after future proposal UI changes
- confirm no entitlement, provisioning, pricing/package, contractor permission, or runtime control appears after future proposal UI changes

Security/RPC posture verified:

- no service-role key in browser/client code
- mutation path remains server-side only
- sensitive RPC execute remains unavailable to `public`, `anon`, and `authenticated`
- `contractor_groups`, `contractor_group_memberships`, and `contractor_group_audit_events` keep RLS enabled and forced
- any future RPC extension must be transaction-aware and granted to `service_role` only

No-entitlement/provisioning/runtime guardrails:

- the implemented action may create or read back one current group membership and matching audit evidence only
- it must not provision starter packs
- it must not mutate document templates or catalog items
- it must not enable modules, pricing, packages, entitlements, contractor permissions, tenant defaults, workflows, invoices, contracts, tax, payroll, or notifications
- group assignment remains platform segmentation evidence until a separate explicitly approved enforcement system exists

## Starter-Pack Assignment Interaction

Current starter-pack assignment intent can target `future_contractor_group` keys. The targeting preview checks explicit current membership only.

Future group assignment audit should support starter-pack recommendation history by showing:

- which starter-pack assignment intent rows reference the group key
- whether a selected organization belonged to the group at preview time
- whether membership changed after a dry run or approval
- whether membership was manual or future automation

Membership changes must not automatically provision starter packs. A future auto-provisioning system should create an operator-reviewed dry run and approval draft instead.

## Entitlements Interaction

Contractor groups may later inform entitlement recommendations, but they should not become the entitlement source of truth by themselves.

Before entitlements depend on contractor groups:

- entitlement semantics must be modeled explicitly
- group membership changes must be audited immutably
- entitlement changes must be previewed and approved separately
- contractor-visible behavior must be gated by server-side entitlement checks, not group membership reads in UI components

## Onboarding Profile Interaction

Contractor groups may support future onboarding profiles such as beta, region, trade segment, or package planning.

Before onboarding automation uses groups:

- onboarding profile assignment must have a durable source of truth
- auto-assignment proposals must explain why a contractor matches
- operator approval must be required before applying a profile-driven group assignment
- onboarding automation must not trigger entitlements or starter-pack provisioning without a separate approval flow

## Rollback And Undo Expectations

Current removal simply removes current membership and is not durable history.

Future undo behavior should:

- record organization removal as an audit event
- preserve the original assignment event
- record who removed the assignment and why
- show downstream references that may have used the membership while it existed
- avoid pretending that removing group membership reverses provisioning, entitlements, or runtime behavior

If a future group assignment caused downstream recommendations, removal should affect future recommendations only unless a separate audited correction flow handles downstream records.

## Observability Needs

Platform admins need:

- current group counts by status/type
- current membership counts
- organizations in multiple groups
- organizations in no groups
- recent current assignments
- group-centric member lists
- organization-centric group lists
- starter-pack assignment references by group key
- inferred history caveats until durable audit events exist
- durable event timeline once audit rows exist
- audit event counts by type, group, organization, assignment source, and actor id when available
- group-centric audit summaries with recent activity, assignment/removal counts, current membership count, and removal-history caveats
- organization-centric audit summaries that distinguish current memberships from historic assignment/removal events
- metadata coverage and missing group/organization context warnings

The current read-only readiness panel is intentionally limited. It infers group-created and organization-assigned events from current rows and explains that removed membership history and exact archive history are not durable yet.

## Audit Retention, Export, And Support Readiness

Contractor group audit events are platform evidence. They exist to help operators reconstruct why a contractor organization entered or left a group, who performed the action, what assignment source was recorded, and which downstream planning surfaces may have relied on that segmentation context. They should be treated as support and governance history, not as disposable UI activity logs.

Expected retention policy:

- keep contractor group audit events for the life of the platform account unless a later legal/compliance policy requires a narrower retention window
- preserve assignment and removal history even when current membership rows are deleted
- avoid hard-deleting audit events as a routine operations tool
- prefer additive correction events over editing or removing prior events
- document any future redaction, deletion, or retention exception with platform-admin approval and its own audit trail

Audit events should not be casually deleted because future support, entitlement, onboarding, starter-pack, and rollout investigations may need to answer what group state existed when an operator made a decision. Removing events can make later evidence misleading, especially after group membership begins to influence recommendations or approvals.

Future export formats should be planned, but no export action exists yet:

- CSV for operator-friendly review, spreadsheet filtering, and support tickets
- JSON for complete structured evidence, including ids, timestamps, event types, assignment sources, and sanitized metadata
- support bundle for a bounded investigation package containing group metadata, membership state, audit events, starter-pack assignment references, and a generated summary

Export access should be platform-admin-only at first. A future support role may receive narrower export permission, but it should be explicit, server-side, audited, and scoped to a specific support investigation. Contractor users should not directly export platform group audit history.

Fields generally safe to export for platform support:

- audit event id
- contractor group id, key, and name
- organization id and safe organization label
- membership id when present
- event type
- assignment source
- actor user id and safe platform-user label when available
- occurred timestamp
- operator reason or notes when intended for platform support
- sanitized scalar metadata summary
- starter-pack assignment intent references by group key when needed for the support question

Fields to exclude or redact from future exports:

- service-role keys, provider secrets, raw database errors, stack traces, and environment values
- raw nested metadata payloads unless a sanitizer explicitly allows each key
- private contractor business payloads unrelated to group assignment evidence
- internal notes that were not intended as platform-support context
- personal data beyond the minimum actor and organization labels needed to explain the audit event

Actor and organization labels should be handled conservatively. Exports should include stable ids plus safe labels available from current platform read models. If a user or organization has been renamed, the export should make clear whether the label is current-state context or a historical snapshot. Future audit writes may add safe label snapshots, but labels should not replace ids as evidence.

Metadata sanitization rules for export:

- include only scalar string, number, boolean, or null values unless a key-specific sanitizer is added
- cap metadata length per field for CSV/support-bundle readability
- omit nested objects and arrays by default
- never include raw provider payloads, raw service errors, auth tokens, service keys, or secrets
- prefer explicit allowlists for future support bundle metadata

Support investigation workflow should start from a specific question:

- "Why did this contractor enter this group?"
  - review current membership, `organization_assigned` events, assignment source, actor, notes, and metadata
- "Who removed this contractor?"
  - review `organization_removed` events, actor id/label, occurred timestamp, membership id, assignment source, and reason
- "Which starter-pack assignments referenced this group?"
  - review read-only starter-pack assignment intent rows with `future_contractor_group` keys and compare them to group membership at the time of preview or approval when that evidence exists
- "Did this group influence any future entitlement/provisioning decision?"
  - review group audit history together with the separate entitlement/provisioning audit trail; group membership alone must not be treated as proof that runtime behavior changed

Future retention/deletion caveats:

- deletion or anonymization rules may be required by legal, privacy, or customer-contract obligations, but they should be designed as an explicit compliance workflow rather than ad hoc database maintenance
- if an organization is deleted or anonymized, group audit events may need to preserve ids while redacting labels according to the future retention policy
- retention jobs must not remove audit events needed by active support, entitlement, onboarding, provisioning, or billing investigations
- retention behavior should be dry-run previewed before it changes any audit evidence

Future legal/compliance caveats:

- this plan is operational product guidance, not legal advice
- final retention windows, export access, and redaction rules should be reviewed before audit exports are exposed outside internal platform administration
- exports may contain personal data through actor ids, actor labels, notes, and organization labels, so access and download handling should be explicit

Future audit export QA checklist:

- verify export access is platform-admin-only and server-side
- verify unsupported roles and contractor users cannot export or read audit events directly
- verify CSV, JSON, and support bundle outputs match the same filtered event set shown in UI
- verify metadata sanitization excludes nested payloads, raw errors, and secrets
- verify actor and organization labels are marked as current labels or historical snapshots
- verify support bundle includes relevant starter-pack assignment references without provisioning anything
- verify exports are themselves audit logged before any support role or external sharing is enabled
- verify export attempts do not change contractor groups, memberships, audit events, tenant records, templates, catalogs, entitlements, pricing, or runtime behavior

## Future Release Gate

Before contractor groups power enforcement, automated assignment, starter-pack auto-provisioning, pricing/package behavior, or entitlement behavior, FloorConnector should complete:

- operator QA proving create/update/archive/assign/remove actions write safe events without changing tenant-owned records
- read-only event timeline
- rejection/failed-attempt visibility for future automation
- operator QA around assignment/removal/update/archive history
- explicit docs proving that group membership changes cannot silently mutate tenant records
