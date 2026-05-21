# Starter Pack Provisioning Plan

Status: implemented safety plan plus future rollback/void guidance.

This document defines the safety model for starter-pack provisioning. The current product supports platform-owned starter packs, planning-only assignment intent, read-only targeting preview, read-only provisioning dry runs, audit/run tables, draft approval capture into those audit tables, audit approval, and the first guarded approved-run execution slice.

Provisioning execution is narrow and operator-controlled: a platform admin may execute only an approved, fresh, non-blocking provisioning run after exact confirmation. Execution creates only missing contractor-owned document template and catalog item copies from the approved run items. No rollback action, void action, background job, entitlement enforcement, assignment-based auto-provisioning, default mutation, tax behavior, payroll behavior, financial calculation change, invoice/contract generation change, or runtime enforcement exists.

Execution readiness review: `docs/starter-pack-provisioning-execution-readiness.md` records the Phase 5F live-schema and mapping review. Phase 5G accepted the caveats for the first execution slice: catalog copies append after the organization's current max sort order, catalog seed `vendor_id` is not copied, skipped existing audit items store matched destination ids when known, failed pre-RPC validation leaves the run unchanged, and execution uses a private function plus a service-role-only public wrapper.

Architecture/operator readiness review: `docs/starter-pack-provisioning-review.md` records the Phase 5T consolidated lifecycle review before any real void action. It summarizes current safety guarantees, remaining operational risks, and required guardrails before void, assignment auto-provisioning, tenant self-service adoption, or entitlement-driven provisioning.

## Current Foundation

Implemented today:
- `platform_starter_packs` stores platform-owned pack metadata and draft/published/archived status.
- `platform_starter_pack_items` groups existing `platform_template_seeds` and `platform_catalog_item_seeds`.
- `platform_starter_pack_assignments` stores planning-only audience intent.
- `contractor_groups` and `contractor_group_memberships` store platform-owned contractor segmentation metadata and explicit organization membership for read-only targeting previews. `contractor_group_audit_events` stores future group lifecycle and assignment history evidence, and `/super-admin/groups` exposes read-only assignment audit-readiness plus durable audit rows when present. These groups are not tenant roles, contractor permission groups, entitlements, pricing packages, module gates, or auto-provisioning triggers.
- `platform_starter_pack_provisioning_runs` stores provisioning audit/run headers with dry-run snapshots, idempotency keys, actor references, target organization, lifecycle timestamps, void/failure state, and future audit-only void metadata fields for actor, reason, strategy, and readiness snapshot evidence.
- `platform_starter_pack_provisioning_run_items` stores item-level audit rows with source seed references, source/destination snapshots, item outcomes, and optional destination ids.
- `/super-admin/templates` can manage packs, manage assignment intent, preview assignment targeting, and run a read-only provisioning dry run.
- The dry run reports which organization-owned `document_templates` and `catalog_items` would be created, which records appear already adopted, and which source seeds are blocked or unavailable.
- The dry-run area can create a platform-admin-only approval draft from a fresh server-side dry run when the selected starter pack is published and the dry run has no blocked or unavailable rows.
- Approval drafts write only `platform_starter_pack_provisioning_runs` with status `draft` and corresponding `platform_starter_pack_provisioning_run_items`; they do not approve, run, void, roll back, copy, or provision anything.
- The dry-run area shows a read-only provisioning audit observability panel for recent draft/run rows, summary counts, status filters, health chips, item outcome totals, destination-link counts, safe failed-run messages, and selected-run freshness blockers.
- Rejected, blocked, failed-before-execution, and already-completed no-op execution attempts are persisted in `platform_starter_pack_provisioning_attempts` with safe operator messages and small metadata only.
- Recent draft runs can be reviewed against a freshly recomputed server-side dry run to identify fresh, stale, invalid, or unavailable approval preparation state; current source availability blockers surface as blocking review issues.
- Fresh, non-blocking draft reviews can be marked `approved` after exact typed confirmation; this writes only the run header audit fields and does not execute provisioning.
- Approved, fresh, non-blocking runs can be executed after typing `EXECUTE STARTER PACK`; execution calls a server-only service-role path backed by `private.execute_platform_starter_pack_provisioning_run(p_run_id uuid, p_actor_id uuid)` and its locked-down public wrapper, creates only missing tenant-owned template/catalog copies, updates audit item destinations, and completes the run.
- Completed runs expose a read-only void-readiness usage check in `/super-admin/templates`; it counts known destination references and reports whether future audit-only void or archive-unused review can be considered, but it does not mutate audit rows or tenant-owned records.
- Completed/selected run review also shows a read-only void metadata foundation panel. It surfaces stored void metadata if present and explains that the first future strategy is audit-only, but it does not provide a void action.

Not implemented today:
- no rollback or void action
- no entitlement enforcement
- no automatic assignment-based provisioning
- no runtime default resolution from starter packs
- no contractor-group enforcement, contractor-side visibility, auto-assignment, entitlement mapping, pricing/package mapping, or runtime behavior

## Provisioning Workflow

Provisioning must be an explicit operator-controlled workflow:

1. Platform admin selects one contractor organization.
2. Platform admin selects one published starter pack.
3. System generates a fresh dry run from current source seeds and current organization-owned templates/catalog items.
4. Platform admin reviews every row, including `would_create`, `already_exists`, `blocked`, and `unavailable`.
5. System blocks approval unless the dry run has zero `blocked` and zero `unavailable` rows.
6. Platform admin confirms the exact organization, starter pack, dry-run summary counts, and source seed version snapshot.
7. Server creates an auditable provisioning run record and child item records.
8. Server creates only the approved missing organization-owned copies inside one transaction.
9. Server records created destination ids and final item outcomes.
10. UI shows the completed run and links to created tenant-owned records.

Assignment and targeting previews may recommend candidate packs, but they must not trigger provisioning automatically. Contractor-group assignment intent may match only explicit `contractor_group_memberships` for the selected organization and referenced group key; it does not infer membership from trade, region, plan, entitlement, or tenant-role data.

## Current Approval Draft Capture

Current approval draft capture is preparation only:
- platform admin selects one contractor organization and one starter pack in the dry-run UI
- the server revalidates platform-admin access
- the server rebuilds the dry run from current platform seeds and current organization-owned template/catalog records
- the server rejects missing organizations, missing starter packs, draft starter packs, archived starter packs, empty packs, blocked dry-run rows, and unavailable dry-run rows
- the server writes a `draft` run row and item audit rows only
- `would_create` dry-run rows become `would_create` / `pending` draft items
- `already_exists` dry-run rows become `skipped_existing` / `skipped` draft items
- draft items never set `destination_record_id`
- idempotency keys prevent repeated submission from creating duplicate drafts for the same operator, organization, starter pack, and dry-run fingerprint
- draft review is read-only and compares the stored run/items against current live dry-run output, including pack status, item count, source ids/types, actions, already-existing destination matches, and blocked/unavailable source state; changed already-existing destination matches are stale, and current source availability blockers are blocking issues for any future approval path

Current approval draft capture does not create or mutate contractor-owned `document_templates`, contractor-owned `catalog_items`, organization defaults, estimates, invoices, contracts, taxes, entitlements, modules, or workflow settings.

## Current Audit-Only Approval Gate

Current audit approval is a state transition only:
- platform admin opens an existing draft audit run in the Provisioning Audit panel
- the server recomputes the draft review from current starter-pack, source seed, organization, and tenant-owned template/catalog state at submit time
- approval is allowed only when the run is still `draft`, the starter pack is still `published`, the review is `fresh`, no blocking issues exist, the run has at least one item, and the operator types `APPROVE DRY RUN ONLY` exactly
- approval updates only the `platform_starter_pack_provisioning_runs` header fields: `status = 'approved'`, `approved_by`, `approved_at`, and `confirmation_text`
- approval does not update run items, set destination record ids, create contractor-owned `document_templates`, create contractor-owned `catalog_items`, change organization defaults, execute provisioning, copy seeds, roll back, void, or run a background job

The broader operator requirements below now apply to the guarded Phase 5G execution slice and to any later expansion of provisioning behavior.

## Phase 5G Execution Design

This section defines the implemented first execution shape for approved starter-pack provisioning runs. Phase 5G adds the private database function, service-role-only wrapper, platform-admin server action, and super-admin execution control. It still does not add rollback, void, background jobs, entitlements, assignment-based provisioning, default mutation, tax/payroll behavior, financial calculation changes, invoice/contract generation changes, or runtime enforcement.

### Execution Preconditions

Execution may start only when all of these are true:
- the selected provisioning run exists in `platform_starter_pack_provisioning_runs`
- run `status = 'approved'`
- `approved_by`, `approved_at`, and `confirmation_text` are present
- the target `organization_id` still references an existing contractor organization in `companies`
- the target organization is still active enough for platform-managed setup, using the same tenant lifecycle/status rules super admin uses at execution time
- the referenced starter pack still exists
- starter pack `status = 'published'`
- the Phase 5C review recomputed immediately before execution returns `fresh`
- the recomputed review has no `blocking` issues
- the run has at least one item
- no `would_create` run item already has `destination_record_id` set; completed runs are idempotent at the run level, but item-level resume is not implemented
- every `pending` / `would_create` item still maps to a current dry-run row with action `would_create`
- every `skipped_existing` / `skipped` item still maps to a current dry-run row with action `already_exists` and the same matched destination id
- no current dry-run row is `blocked` or `unavailable`
- no item source seed is missing, inactive, or malformed
- no other execution transaction is already running for the same run

If any precondition fails, the server action must leave tenant-owned data untouched and return a user-safe error that tells the operator to rerun review or create a new approval draft.

### Execution Actor Boundary

Execution must be:
- platform-admin only through the existing platform role layer
- server-side only
- unavailable to contractor users, customer portal users, anonymous users, and normal authenticated users
- unavailable from browser/client code except as a form/action request to a server action
- blocked before any service-role client or privileged RPC call unless `requirePlatformAdminUser` has succeeded

No service-role key, secret key, RPC credential, or privileged SQL path may be exposed through client components or `NEXT_PUBLIC_*` environment variables.

### Server Action And RPC Split

Implemented Phase 5G shape:
- Next.js server action: `executeApprovedStarterPackProvisioningRunAction(formData)`
- server utility: `executeApprovedStarterPackProvisioningRun({ runId, userId })`
- Postgres function in a private execution namespace: `private.execute_platform_starter_pack_provisioning_run(p_run_id uuid, p_actor_id uuid)`
- service-role-only public wrapper for the existing server-side Supabase RPC path: `public.execute_platform_starter_pack_provisioning_run(p_run_id uuid, p_actor_id uuid)`

The server action should:
- accept only `runId` and the exact execution confirmation phrase `EXECUTE STARTER PACK`
- require platform-admin access
- load the run, items, starter pack, organization, and fresh Phase 5C review
- reject stale, invalid, unavailable, non-approved, empty, draft-pack, archived-pack, or blocked runs before calling the RPC
- never accept client-provided dry-run rows, destination ids, source snapshots, or item outcomes
- call the RPC only after server-side preconditions pass
- redirect back to the audit detail with the returned run status and item summary

The RPC should:
- accept `p_run_id uuid` and `p_actor_user_id uuid`
- run as a privileged database function outside exposed client schemas, or otherwise be inaccessible to `anon` and `authenticated`
- validate the run row again inside the transaction
- lock the run row using `for update`
- lock run items for the run using `for update`
- validate `status = 'approved'` before changing anything
- transition the run to `running`, set `started_at`, and clear stale `error_message`
- create missing organization-owned records only for item rows currently eligible to create
- update item rows with final action/status/destination details
- transition the run to `completed` after successful create/skip processing; `completed_with_warnings` and persisted `failed` outcomes remain future expansion points
- return the run id, final status, created template count, created catalog item count, skipped count, failed count, warning count, and user-safe message

The RPC must not accept arbitrary template seed ids, catalog seed ids, destination payloads, organization ids, or starter pack ids from the client. The approved run row is the command envelope.

### Transaction Model

Preferred model: one database transaction per approved run.

Inside that single transaction:
1. lock the run row by id
2. reject if status is not `approved`
3. transition the run to `running`
4. lock all run item rows
5. re-read the starter pack, pack items, platform seeds, target organization, organization-owned document templates, and organization-owned catalog items
6. perform final conflict checks
7. insert tenant-owned document templates and catalog items for eligible create rows
8. update each item row with final action/status, destination id, destination snapshot, reason, and error if any
9. transition the run to final status
10. commit

All-or-nothing is the default. If any required create row fails, the transaction should roll back so no partial tenant-owned records exist and the run should remain `approved` or be marked `failed` only if the failure status can be written outside the rolled-back transaction without implying partial success.

If a staged model is later chosen, it must be justified in the implementation prompt and must include item-level replay protection, operator-visible partial failure state, and reconciliation before release.

### Idempotency And Replay Protection

The existing run `idempotency_key` protects draft creation, but future execution also needs run-level and item-level replay rules:
- repeated execution request for a `completed` or `completed_with_warnings` run returns the existing completed result and creates nothing
- repeated execution request for a `running` run returns a "run already in progress" response and creates nothing
- repeated execution request for an `approved` run must lock the run row so only one transaction can transition it to `running`
- any item with a non-null `destination_record_id` must be treated as already processed and must not create another destination record
- future resume support must compare destination lineage before reusing an existing destination id
- retry after `failed` must require a separate operator-reviewed path unless the failure happened before any tenant-owned write

Destination tables should prevent duplicate source adoption where practical with organization/source lineage uniqueness, but the execution plan must not rely only on uniqueness errors. It must check source linkage and conservative matches before insert.

### Document Template Copy Rules

For `template_seed` rows that remain eligible to create:
- insert into the existing organization-owned `document_templates` table
- set `company_id` / organization id to the run `organization_id`
- set `template_type` from platform seed `template_type`
- copy `name`
- copy `description`
- copy `subject_template`
- copy `body_template`
- copy `schema_version`
- copy `merge_field_manifest`
- copy `metadata` with additive provenance if needed, without replacing source-of-truth fields
- set `source_seed_id` to the platform template seed id
- set `source_seed_key` to the platform template seed key
- set `status = 'active'`
- set `is_default = false`

Document template provisioning must not:
- make the copied template the organization default
- update an existing organization-owned template
- reactivate an archived organization-owned template
- copy from inactive, missing, draft-like, or malformed seeds
- change estimate, invoice, contract, or user template selections

If an active organization-owned template already links to the seed, skip it as already adopted. If a conservative normalized match still exists with the same template type and normalized name, skip it only if the dry-run/review rules still consider that match safe.

### Catalog Item Copy Rules

For `catalog_seed` rows that remain eligible to create:
- insert into the existing organization-owned `catalog_items` table
- set `company_id` / organization id to the run `organization_id`
- set `source_seed_id` to the platform catalog seed id
- set `source_seed_key` to the platform catalog seed key
- copy `item_type`
- copy `name`
- copy `description`
- copy `internal_notes`
- copy `unit`
- copy `default_unit_cost`
- copy `default_unit_price`
- copy `markup_percent`
- copy `hidden_markup_percent`
- copy `taxable`
- copy `vendor_id` only if that reference is valid for the destination model and does not cross tenant boundaries; otherwise leave null and record the omission in the item reason/snapshot
- copy `category`
- copy `cost_code`
- copy `sku`
- copy `photo_storage_path`
- copy `metadata` with additive provenance if needed, without replacing source-of-truth fields
- copy or derive `sort_order` from the seed or append at the end of the organization's catalog ordering
- set `status = 'active'`
- set `is_default = false`

Catalog provisioning must not:
- update existing organization-owned catalog items
- reactivate archived items
- create invoice-ready billing lines
- alter estimate line snapshots
- change tax settings or tax profiles
- enforce entitlements, modules, or plan-tier access

If an active organization-owned catalog item already links to the seed, skip it as already adopted. If a conservative normalized match still exists with the same item type, category, and normalized name, skip it only if the dry-run/review rules still consider that match safe.

### Audit Item Update Rules

Execution must preserve the existing audit model:
- `would_create` / `pending` becomes `created` / `completed` only after the destination insert succeeds
- `skipped_existing` / `skipped` remains skipped and stores a matched same-organization destination id when the approved snapshot contains one
- blocked rows should not be present in an approved fresh run; Phase 5G rejects them rather than executing
- failed item persistence is reserved for a later staged failure model; Phase 5G prefers atomic rollback with no partial tenant-owned writes
- `destination_record_id` is set only after a successful insert of a new tenant-owned destination record
- `source_snapshot` should preserve the approval-time seed evidence and may include final verification fields
- `destination_snapshot` should store the inserted destination field set, destination id, organization id, source lineage, and whether the row was created or skipped

The item audit row must explain what happened; it must not become a second template or catalog model.

### Run Status Transition Rules

Allowed Phase 5G execution transitions:
- `approved` -> `running`
- `running` -> `completed`

Reserved future execution transitions:
- `running` -> `completed_with_warnings`
- `approved` -> `failed` only for pre-write execution-start failures when failure persistence is deliberately added
- `running` -> `failed` for staged execution failures if a later design supports persisted failure state without partial unsafe writes

Disallowed execution transitions:
- `draft` -> `running`
- `draft` -> `completed`
- `completed` -> `running`
- `completed_with_warnings` -> `running`
- `voided` -> `running`

Use `completed` when all create rows were created and all skip rows remained valid. Use `completed_with_warnings` only when the execution intentionally supports non-critical skips/warnings without partial unsafe writes. Use `failed` when execution cannot complete safely or when a required write fails.

### Concurrency And Locking

Execution must prevent two operators or two browser submissions from executing the same approved run:
- lock the run row with `select ... for update`
- update from `approved` to `running` with a status predicate
- lock item rows for the run
- use one transaction so competing requests wait or fail cleanly
- return a user-safe "already running" or "already completed" result for duplicate requests
- never allow two transactions to insert destination rows for the same run item

If destination table uniqueness for `(company_id, source_seed_id)` is available or added later, keep it as defense-in-depth, not as the primary concurrency strategy.

### Rollback And Void Model

Rollback and void are not implemented today. The audit schema has `voided` status fields plus metadata columns for `voided_by`, `void_reason`, `void_strategy`, and `void_readiness_snapshot`, but there is no server action, RPC, form, button, or tenant-owned mutation path for voiding a completed provisioning run.

Use these terms precisely in future work:
- Rollback: a broad undo request from an operator. In FloorConnector this should be translated into one of the explicit strategies below instead of implying automatic deletion.
- Void: an audit state that says a completed provisioning run should no longer be treated as a valid managed operation. Void does not automatically delete, archive, or detach tenant-owned records.
- Archive: a tenant-owned record lifecycle change, such as setting a provisioned `document_templates` or `catalog_items` row to `archived` or inactive. Archive is a real tenant data mutation and must require usage checks.
- Detach: preserving the tenant-owned record while removing or marking the starter-pack/source-seed lineage as no longer platform-managed. This is risky because source lineage is also used for dry-run duplicate detection.
- Delete: hard deletion of tenant-owned records. This should be avoided by default and should require proof of non-use plus an explicit product/legal decision.

Hard delete should be avoided because provisioned templates and catalog items become real contractor-owned operational records after creation. They may be selected as defaults, referenced by estimates/invoices/contracts, snapshotted into commercial records, used by catalog/system components, or used by future downstream systems. Removing them can break historical records, weaken audit lineage, and silently change contractor business context.

Future voiding should:
- be a separate platform-admin-only workflow behind the existing platform role layer
- never run automatically after execution, assignment targeting, or rejected-attempt logging
- allow only completed or `completed_with_warnings` runs to enter a void review
- require at least one destination record linked from run items
- require explicit operator confirmation and a visible impacted-record review
- record the chosen strategy, item outcomes, actor, timestamp, and user-safe reason
- preserve immutable evidence in run/item audit snapshots
- never mutate platform seeds, starter-pack definitions, assignments, dry-run rows, or existing contractor-owned records unless the chosen strategy explicitly allows it after usage checks

Void must be blocked when:
- the run is `draft`, `approved`, `running`, `failed`, or already `voided`
- the actor is not a platform admin
- the run has no destination records to review
- run item destination ids do not belong to the target organization
- destination records cannot be loaded safely
- required usage checks have not completed
- a mutating strategy is requested while any destination record is in use
- the destination record was manually changed in a way that makes ownership or lineage ambiguous

For document templates, "in use" must include at least:
- `estimates.template_id`
- `invoices.template_id`
- `contracts.template_id`
- `estimate_commercial_snapshots.template_id`
- `organization_workflow_settings.approved_estimate_contract_template_id`
- `user_estimate_template_preferences.preferred_estimate_template_id`
- active `document_templates.is_default = true`
- future generated document snapshots or signed/exported document records that store template references

For catalog items, "in use" must include at least:
- `estimate_line_items.catalog_item_id`
- `invoice_line_items.catalog_item_id`
- `estimate_commercial_snapshot_items.catalog_item_id`
- `catalog_system_components.system_catalog_item_id`
- `catalog_system_components.component_catalog_item_id`
- `floor_system_template_components.catalog_item_id`
- `inventory_items.catalog_item_id`
- future material planning, purchase, job-costing, selected-system, invoice snapshot, or production records that store catalog item references
- active `catalog_items.is_default = true`

Current Phase 5M usage readiness is read-only:
- `apps/web/lib/platform-admin/starter-pack-provisioning-void-readiness-core.ts` computes item-level `unused`, `used`, `unknown`, and `missing_destination` usage rows from supplied facts.
- `getStarterPackProvisioningRunUsage(runId)` loads completed run destinations and counts current references from the implemented tables above.
- `used`, `unknown`, and missing created destinations block archive-unused consideration; skipped-existing destinations are warnings because the provisioning run did not create those records.
- audit-only void consideration is a read-model signal only. No void action, archive action, delete action, detach action, schema change, or tenant-owned write exists.

Current Phase 5O void metadata foundation is audit-only schema and read-only UI:
- `platform_starter_pack_provisioning_runs.voided_by` can store the future platform operator who marks a run voided.
- `platform_starter_pack_provisioning_runs.void_reason` can store a future operator-safe reason.
- `platform_starter_pack_provisioning_runs.void_strategy` is constrained to `audit_only`, `archive_unused_future`, or `detach_lineage_future`.
- `platform_starter_pack_provisioning_runs.void_readiness_snapshot` stores a future durable usage/readiness snapshot as JSON evidence.
- metadata coherence constraints require voided runs to have `voided_at` and `void_strategy`, and any populated `voided_at` to have a strategy.
- no current server action writes these fields; no void, archive, delete, detach, or tenant-owned mutation path exists.

### Audit-Only Void Action Implementation Plan

This section is an implementation-ready design for a future first void action. It is not implemented today.

The first future void action must be audit-only. It may mark a completed provisioning run as voided for operator history, but it must not mutate contractor-owned `document_templates`, contractor-owned `catalog_items`, organization defaults, estimates, invoices, contracts, payments, tax records, payroll records, entitlements, module settings, user preferences, or starter-pack source records.

Future server action shape:
- `voidCompletedStarterPackProvisioningRunAction(formData)`
- accepted form fields:
  - `runId`
  - `confirmationText`
  - `voidReason`
- confirmation phrase: `VOID AUDIT ONLY`
- `voidReason` must be trimmed, non-empty, operator-safe, and length-limited before persistence. Recommended maximum: 1,000 characters.
- the action must require platform-admin access through the existing platform role layer before loading privileged run data.
- the action must recompute usage/readiness server-side immediately before any audit update. It must never trust client-provided usage rows or a client-provided snapshot.
- the action must return or redirect with user-safe copy only; it must not expose raw database errors or service-role details.

Future RPC/transaction shape:
- Preferred: a private, security-definer Postgres function mirroring the guarded execution pattern:
  - `private.audit_only_void_platform_starter_pack_provisioning_run(p_run_id uuid, p_actor_id uuid, p_void_reason text, p_void_readiness_snapshot jsonb)`
  - optional service-role-only public wrapper only if the existing Supabase RPC path requires it
- The function must lock the selected run row with `for update`.
- The function must not read arbitrary client-supplied destination ids as authority. The run and run items are the command envelope.
- The function must update only `platform_starter_pack_provisioning_runs`.
- The function must not update `platform_starter_pack_provisioning_run_items` in the first audit-only slice unless a later reviewed design adds item-level void annotations.
- The function must not touch tenant-owned template/catalog rows.

Allowed future status transitions:
- `completed` -> `voided`
- `completed_with_warnings` -> `voided`

Explicitly disallowed future status transitions:
- `draft` -> `voided`
- `approved` -> `voided`
- `running` -> `voided`
- `failed` -> `voided`
- `voided` -> `voided` as a second write

Already-voided idempotency:
- If the run is already `voided`, the future action should return the existing voided state and create no additional audit mutation.
- It must not overwrite `voided_by`, `void_reason`, `void_strategy`, `voided_at`, or `void_readiness_snapshot`.
- The UI may show "Already voided" with existing metadata.

Eligibility preconditions:
- actor is an explicit platform admin
- run exists
- run status is `completed` or `completed_with_warnings`, or already `voided` for idempotent readback only
- run has at least one run item with a non-null `destination_record_id`
- target organization still exists
- run item destination ids reconcile to the same target organization where current destination rows are visible
- current read-only usage readiness can be recomputed by `getStarterPackProvisioningRunUsage(runId)`
- `canConsiderAuditOnlyVoid = true`
- confirmation text exactly equals `VOID AUDIT ONLY`
- void reason is non-empty after trimming

Freshness and usage rules:
- Do not use the Phase 5C provisioning draft freshness result as the audit-only void gate. Completed runs are expected to differ from current dry-run output after copies exist, so Phase 5C freshness can be misleading for void decisions.
- The required freshness check for audit-only void is a fresh server-side void-readiness usage recomputation at submit time.
- Usage rows with `used`, `unknown`, or `missing_destination` must not block audit-only void because audit-only void does not mutate tenant-owned records. They must be captured in `void_readiness_snapshot` as evidence.
- Usage rows with `used`, `unknown`, or `missing_destination` must block any future archive/delete/detach strategy.
- Skipped-existing rows must remain warnings and must never be treated as records created by the run.

Required audit update:
- `status = 'voided'`
- `voided_by = actor user id`
- `void_reason = trimmed operator-safe reason`
- `void_strategy = 'audit_only'`
- `voided_at = now()`
- `void_readiness_snapshot = server-recomputed usage/readiness snapshot`
- `updated_at = now()`

Required `void_readiness_snapshot` shape:
- run id
- run status before void
- target organization id/name when available
- starter pack id/name when available
- generated timestamp
- summary counts:
  - destination item count
  - blocking usage count
  - warning count
  - used count
  - unknown count
  - missing destination count
  - skipped-existing count
- item-level rows from the read-only void-readiness model:
  - run item id
  - destination record type
  - destination record id
  - usage status
  - usage severity
  - usage counts by source
  - reason

Concurrency and locking:
- Lock the run row before checking status and before updating metadata.
- Use a status predicate so only `completed` / `completed_with_warnings` rows can transition.
- If another request voided the run first, return the already-voided state without overwriting metadata.
- Do not call the provisioning execution RPC from the void path.
- Do not create, update, archive, detach, or delete tenant-owned records under the same transaction.

Safe error handling:
- Missing or inaccessible run: "Provisioning run is unavailable."
- Wrong status: "Only completed provisioning runs can be marked audit-voided."
- Missing destinations: "This run has no destination records to review."
- Usage recomputation failure: "Void readiness could not be recomputed. Try again before marking audit-voided."
- Wrong confirmation: "Type VOID AUDIT ONLY exactly to mark this run audit-voided."
- Invalid reason: "Enter a safe reason before marking this run audit-voided."

Observability expectations:
- Void metadata must appear in the existing Provisioning Audit run detail.
- Observability health should treat `voided` as a terminal audit state, not as failed execution.
- Operation attempts logging may later record rejected void attempts, but that should be a separate narrow operations-audit pass if needed.
- Completed copy counts and destination ids should remain visible after voiding because the contractor-owned records still exist.

Current Phase 5R audit-only void eligibility read model:
- `apps/web/lib/platform-admin/starter-pack-provisioning-void-eligibility-core.ts` calculates future audit-only void eligibility from the provisioning run header/items plus the Phase 5M usage-readiness result.
- The model exports the required future confirmation phrase: `VOID AUDIT ONLY`.
- It reports `eligible`, `blocked`, `already_voided`, or `unavailable`.
- It recommends only `audit_only`; `archive_unused_future` and `detach_lineage_future` are always unavailable/future-only in this model.
- `completed` and `completed_with_warnings` runs can be eligible when usage readiness is available and the run has at least one completed or destination-linked item.
- `draft`, `approved`, `running`, and `failed` runs are blocked.
- `voided` runs return an idempotent already-voided state and must not overwrite existing void metadata in a future action.
- used, unknown, or missing destination usage rows produce warnings for audit-only eligibility rather than blockers because audit-only void would not mutate contractor-owned records.
- the model is read-only; no void server action, RPC, UI form, schema change, archive/delete/detach behavior, or tenant-owned write exists.

Operator warning copy for the future UI:
- "Audit-only void is not undo."
- "This marks the provisioning run voided for operator history only."
- "Contractor-owned templates and catalog items will remain unchanged."
- "Existing estimates, contracts, invoices, payments, defaults, tax, payroll, entitlements, and user preferences will not be changed."
- "Archive/delete/detach is not implemented."
- "Type VOID AUDIT ONLY to continue."

Future archive-unused boundaries:
- Archive-unused must be a separate implementation after audit-only void.
- Archive-unused must never touch skipped-existing records.
- Archive-unused must only consider records created by the selected provisioning run.
- Archive-unused must require all created destinations to be unused, visible in the target organization, not default records, and still linked to the expected run/source lineage.
- Archive-unused likely needs item-level void/retained outcome metadata before release.
- Detach-lineage requires a separate design because source lineage powers dry-run duplicate detection and operator explainability.

Implementation-readiness checklist:
- Existing helpers ready:
  - `getStarterPackProvisioningRunDetail(runId)`
  - `getStarterPackProvisioningRunUsage(runId)`
  - `buildStarterPackProvisioningVoidReadiness(...)`
  - platform-admin access helpers used by existing provisioning actions
- Existing server action patterns ready:
  - `approveStarterPackProvisioningDraftAction`
  - `executeStarterPackProvisioningRunAction`
  - server-side safe redirect/error handling
- Existing schema ready for audit-only void:
  - `status = 'voided'`
  - `voided_at`
  - `voided_by`
  - `void_reason`
  - `void_strategy`
  - `void_readiness_snapshot`
- Remaining blockers before real audit-only void:
  - no eligibility helper/test exists yet for `VOID AUDIT ONLY`
  - no server action exists yet
  - no private RPC/transaction helper exists yet
  - no UI form/control exists yet
  - no rejected-void attempt logging exists yet
- Additional migrations likely needed before archive/detach:
  - item-level void/retained outcome metadata if operators need per-item archive/retain evidence
  - explicit managed-lineage/detach marker if source lineage should remain useful after detach
  - optional operations-attempt expansion for void attempts if rejected-void visibility is required
- Current usage-readiness model is sufficient for audit-only void evidence because audit-only void does not mutate tenant-owned records. It is not sufficient by itself to release archive/delete/detach behavior.

Future safe void strategies:
- Audit-only void: mark the provisioning run `voided`, record a reason, and leave every tenant-owned destination record untouched. This is the safest first strategy because it preserves contractor records and historical references.
- Archive-created-records: archive only the records created by this run, only when every destination record is unused and still belongs to the same organization. This must not touch skipped-existing records.
- Archive-unused-only: for mixed runs, archive only unused created records and mark in-use records as retained/not reversible in the item audit. This introduces partial void semantics and should come after audit-only void.
- Detach lineage: preserve tenant records but remove or mark platform-managed lineage only after a separate design proves dry-run duplicate detection, audit reporting, and future starter-pack matching will remain understandable. This is not recommended as the first implementation.

Recommended first implementation: audit-only void. The first mutating strategy, if needed later, should be archive-unused-only for records that were created by the run, have no detected usage, are not defaults, and still carry the expected source/run lineage. Automatic hard delete is not recommended.

Void must never mutate estimates, estimate line items, approved estimate snapshots, contracts, invoices, invoice line items, schedule of values, payments, taxes, payroll, entitlements, module settings, organization defaults, user preferences, or existing contractor-owned templates/catalog items that were not created by the selected provisioning run.

Void idempotency rules:
- re-submitting audit-only void for an already voided run should return the existing voided state and create no tenant-owned mutations
- archive strategies must not re-archive or re-touch records already marked as archived by a previous void operation
- item-level audit rows must distinguish `voided`, retained because in use, skipped existing, and unavailable/missing destination records
- no future void path should call the provisioning execution RPC or create additional destination records

Operator UI copy for future void must be blunt:
- "Void is not undo."
- "Contractor-owned records may already be in use."
- "Hard delete is not available from this workflow."
- "Archive will be allowed only for unused records created by this run."
- "Existing estimates, contracts, invoices, payments, tax, payroll, and defaults will not be changed."

Rollback/void QA must verify:
- no void control appears for draft, approved, running, failed, or already voided runs
- completed runs with destination records can enter review only
- usage checks block archive when a template or catalog item is referenced
- audit-only void changes only the audit run state
- archive-unused-only changes only eligible created destination records and audit item rows
- in-use records remain active and linked
- defaults, estimates, invoices, contracts, taxes, payroll, entitlements, user preferences, and module settings remain unchanged

### Partial Failure Handling

All-or-nothing remains preferred for the first real execution pass.

If a future implementation moves away from all-or-nothing behavior, release must be blocked until it supports:
- item-level failed states
- reconciliation from audit rows to actual destination records
- retry that does not duplicate already-created destination rows
- operator-visible failed item detail
- no hidden background retry
- clear guidance on whether the operator should create a new approval draft or retry the same failed run

### Observability And Operations

Future super-admin operations/errors should show:
- run id
- target organization
- starter pack
- actor user id
- requested, approved, started, completed, failed, and voided timestamps
- final status
- created template count
- created catalog item count
- skipped count
- failed count
- warning count
- last user-safe error message
- link back to run review/detail

Errors should be logged with safe context only: run id, organization id, starter pack id, action name, status, and item ids. Do not log raw service-role credentials, customer private data, tax details, payroll data, or large template/catalog payloads.

### Execution QA Gate

Before expanding execution beyond the guarded Phase 5G slice, QA must continue verifying:
- contractor-only user cannot see or trigger execution
- platform admin can execute only an approved fresh run
- stale approved run is rejected
- archived/draft pack is rejected
- blocked/unavailable current dry-run state is rejected
- destination ids are null before execution and set only after successful insert
- created document templates have correct organization id, source seed lineage, active status, and `is_default = false`
- created catalog items have correct organization id, source seed lineage, active status, and `is_default = false`
- existing organization defaults are unchanged
- existing organization-owned templates/catalog items are unchanged
- estimates, estimate line items, contracts, invoices, payments, tax settings, payroll records, entitlements, module settings, and workflow settings are unchanged
- repeated execution submission does not duplicate records
- transaction failure leaves no partial tenant-owned records
- completed run detail shows created/skipped counts accurately
- no rollback/void/assignment-based auto-provisioning button appears unless the full path, QA, docs, and release guardrails are complete

Phase 5H post-execution hardening added focused regression coverage and server-path QA for this gate:
- pure execution eligibility tests cover draft, stale, invalid, unavailable, blocking-issue, wrong-confirmation, and completed-run states
- static migration guard tests cover completed-run idempotency, created/skipped destination id updates, `is_default = false`, and catalog `vendor_id` / `tax_code_id` omission
- server-path QA confirmed rejected draft and stale approved execution attempts leave tenant-owned template/catalog counts unchanged
- completed run review now surfaces item-level audit destination ids while keeping rollback/void unavailable

Phase 5I adds read-only operator observability over the same audit records:
- audit summary counts for total, draft, approved, completed, failed, attention-needed, destination-linked, and last completed run state
- audit filters for all, draft, approved, completed, failed, and attention-needed runs
- health chips for draft, approved, completed, failed, needs-review, stale, and execution-unavailable states
- selected-run detail for request/approval/start/completion timestamps, item action/status totals, destination ids, and safe error/reason copy

Phase 5J adds narrow operation-attempt persistence without changing execution behavior:
- `platform_starter_pack_provisioning_attempts` stores rejected, blocked, failed-before-execution, and already-completed no-op `execute` attempts
- the existing execute server action records schema-validation failures such as missing/wrong confirmation and invalid run ids before redirecting
- the existing server utility records run-load failures, stale/non-blocking eligibility failures, database guard rejections, and completed-run no-op attempts with safe messages
- successful executions remain represented by the provisioning run/item audit rows, not duplicated into the attempts table
- the UI surfaces recent attempts read-only with attempted time, run/pack/org labels where available, outcome, reason code, safe message, run status, and review status

## Operator Approval Requirements

The execution UI must require all of the following:
- platform admin role from the existing platform role layer
- selected organization id
- selected starter pack id
- starter pack status `published`
- a fresh dry run generated after the latest source seed and tenant-owned record read
- visible dry-run timestamp or generated-at value
- exact summary counts
- exact list of `would_create` rows
- explicit acknowledgement that contractor-owned records will be created
- typed confirmation using the exact Phase 5G phrase `EXECUTE STARTER PACK`; a future expansion may also require the contractor organization display name or slug
- final server-side revalidation immediately before writes

The approval UI must not rely on client-hidden dry-run rows as authority. The server must rebuild the dry run before creating records.

## Dry-Run Review Requirements

The dry run must remain the required input to audit approval and execution. The audit approval action verifies freshness before marking a run `approved`; the execution action verifies freshness again before writing tenant-owned records:
- selected organization still exists and is eligible for provisioning
- selected starter pack still exists and is `published`
- every included platform template seed exists and is active
- every included platform catalog seed exists and is active
- existing organization-owned document templates and catalog items are re-read before writes
- already-adopted/equivalent records are skipped, not overwritten
- summary counts shown to the operator match the server-rebuilt dry run or the approval is rejected as stale

If the dry run changes between review and audit approval, the operator must return to review. If the dry run changes between audit approval and execution, execution must be rejected until a new review/approval path is completed.

## Server-Side Guardrails

The execution server action must:
- call the existing platform-admin role check before any service-role data access
- accept only explicit `runId` and execution confirmation fields
- rebuild the dry run server-side from database state
- reject draft and archived starter packs
- reject packs with no items
- reject inactive, missing, or malformed source seed references
- reject dry runs with blocked or unavailable rows
- create only rows with action `would_create`
- skip rows with action `already_exists`
- never update or delete organization-owned records
- never mutate platform seeds, starter packs, assignment rows, estimates, invoices, contracts, taxes, entitlements, modules, or workflow defaults
- return user-safe errors that do not leak cross-tenant data

The server must not expose arbitrary template or catalog copy endpoints. Provisioning must be scoped to one approved starter pack and one organization per run.

## Permissions And Service-Role Boundary

Normal contractor users must not be able to provision starter packs. Provisioning is a platform-admin operation only.

Because platform starter-pack tables currently revoke broad `anon` and `authenticated` access, the future provisioning server path may use the service-role client only after:
- authenticated user identity is known
- `requirePlatformAdminUser` succeeds
- all input ids are validated
- the dry run is rebuilt server-side

Tenant-owned destination rows must still include the selected organization id and must be written only through this narrow server path. Service-role use must not bypass the explicit organization target or create cross-tenant records.

## Transaction Boundaries

Provisioning should run in one database transaction per organization and starter pack.

Recommended transactional shape:
- lock the existing approved provisioning run row and transition it to `running`
- lock existing item rows captured from the approved dry run
- create all missing organization-owned document templates and catalog items
- update item result rows with created destination ids and final action outcomes
- update provisioning run to `completed`

If any required write fails, the transaction should roll back so no partial tenant-owned copies are created. If the implementation cannot keep all writes in one transaction, it must explicitly support partial failure recovery before enabling production use.

## Audit Event Model

Auditable provisioning tables now exist before any real action:
- `platform_starter_pack_provisioning_runs`
- `platform_starter_pack_provisioning_run_items`

Current run fields:
- id
- starter_pack_id
- organization_id
- requested_by
- approved_by
- status: `draft`, `approved`, `running`, `completed`, `completed_with_warnings`, `failed`, `voided`
- dry_run_snapshot
- confirmation text
- idempotency_key
- requested_at
- approved_at
- started_at
- completed_at
- voided_at
- error_message nullable and user-safe
- created_at / updated_at

Current item fields:
- id
- run_id
- starter_pack_item_id
- source_item_type
- source_template_seed_id nullable
- source_catalog_seed_id nullable
- destination_record_type
- destination_record_id nullable
- action: `would_create`, `skipped_existing`, `created`, `blocked`, `failed`, `voided`
- status: `pending`, `completed`, `skipped`, `blocked`, `failed`, `voided`
- source_snapshot jsonb
- destination_snapshot jsonb
- reason
- error_message nullable and user-safe
- created_at / updated_at

Audit rows must be append-friendly. They should describe what happened without becoming a second template or catalog model.

## Idempotency Strategy

Provisioning must be safe to retry.

Required idempotency rules:
- one active run id per approval attempt
- unique idempotency key derived from organization id, starter pack id, approved dry-run fingerprint, and operator id
- database uniqueness should prevent duplicate active created copies for the same organization and source seed where existing schema supports source linkage
- retrying a completed run should return the completed result instead of creating more copies
- retrying a failed run should require server-side dry-run rebuild and operator confirmation unless no tenant-owned writes occurred

Destination records must store platform seed lineage so future dry runs can detect already-adopted copies.

## Conflict Handling

Conflicts must be handled conservatively:
- exact source linkage match means skip as already adopted
- conservative normalized match means skip only when type/category/name rules are strong enough and the dry run marks the match as conservative
- ambiguous records should not be overwritten
- duplicate names with different type/category should remain `would_create` or require manual operator review in a future enhancement
- archived organization-owned records should not be silently reactivated
- existing organization defaults must not be changed by provisioning

If a conflict appears after review but before approval, the server must reject stale approval and ask the operator to rerun the dry run.

## Tenant-Owned Record Creation Rules

Future provisioning may create:
- organization-owned `document_templates` copied from platform template seeds
- organization-owned `catalog_items` copied from platform catalog item seeds

Future provisioning must not create or mutate:
- estimates
- estimate line items
- contracts
- invoices
- invoice line items
- schedule of values
- tax profiles or tax settings
- payroll records
- entitlement records
- module settings
- organization workflow defaults
- organization financial defaults
- existing organization-owned templates/catalog items

New tenant-owned records must:
- use the selected organization id
- copy only the fields already used by the existing seed adoption paths
- store `source_seed_id` and `source_seed_key`
- start as organization-owned editable copies
- not become shared mutable global records
- not become defaults unless a future explicitly approved rule adds that behavior

## Snapshot Requirements

The future audit item record must snapshot enough source data to explain what was copied:
- source seed id
- source seed key
- source seed name
- source seed type
- source seed category for catalog items
- source seed active status
- destination type
- intended destination field set
- starter pack id and item id
- starter pack status at approval
- dry-run action and match type

The snapshot is audit evidence only. It must not replace `platform_template_seeds`, `platform_catalog_item_seeds`, `document_templates`, or `catalog_items`.

## Never Overwrite Rule

Provisioning must never overwrite:
- existing organization-owned document templates
- existing organization-owned catalog items
- organization default template settings
- organization financial settings
- organization workflow settings
- user preferences
- estimates, contracts, invoices, jobs, payments, taxes, or payroll records

If a future product requirement needs replacement or update behavior, it must be designed as a separate versioned update workflow with its own dry run, audit trail, and operator confirmation.

## Draft And Archived Pack Rules

Draft starter packs:
- may be managed and previewed
- may appear in dry runs
- must be blocked from real provisioning

Archived starter packs:
- may remain inspectable for audit/history
- may appear in dry runs
- must be blocked from real provisioning

Published starter packs:
- may be eligible for future provisioning
- still require a clean dry run, explicit approval, and server-side revalidation

## Partial Failure Handling

Preferred behavior is all-or-nothing transaction rollback. If that cannot be guaranteed, the future design must include:
- run status `failed`
- item-level success/failure rows
- retry behavior that does not duplicate already-created rows
- operator-visible failed item reasons
- no hidden background retry that can create tenant records without operator visibility
- reconciliation query that compares item audit rows with actual tenant-owned destination records

Do not enable production provisioning until partial failure behavior is implemented and tested.

## Rollback And Void Strategy

Future rollback should be called voiding, not destructive rollback, unless product/legal review approves deletion.

Recommended first strategy:
- implement audit-only void first
- allow only `completed` and `completed_with_warnings` runs with destination records into void review
- require platform-admin role, explicit confirmation, impacted-record review, and a safe void reason
- update only the provisioning run audit state for the first slice
- leave every contractor-owned `document_templates` and `catalog_items` row untouched
- keep run items as evidence of what was created or skipped

Recommended later mutating strategy:
- archive unused records created by the run only after exact usage checks pass
- never archive skipped-existing records, because those existed before the provisioning run and are not owned by the run
- never archive records that are defaults or are referenced by estimates, invoices, contracts, snapshots, user preferences, system components, inventory, or future downstream usage tables
- record item-level results for archived, retained because in use, unavailable, and skipped-existing rows

Deletion should not be the default because contractor-owned copies may become workflow inputs after creation. Detaching lineage should also wait for a separate design because source seed lineage is used for future dry-run duplicate detection and operator explainability.

Rollback/void must have its own confirmation, audit trail, idempotency behavior, usage-check report, and QA gate. It must never remove or mutate estimates, contracts, invoices, snapshots, payments, tax records, payroll records, entitlements, workflow settings, organization defaults, or user preferences.

## Assignment And Targeting Relationship

Assignment intent and targeting previews should feed recommendations only:
- all-organization, organization, region, trade-segment, plan-tier, onboarding-profile, and contractor-group intent can suggest candidate organizations or packs
- recommendations must not create runs automatically
- no entitlement, plan, or contractor-group targeting should be enforced until those semantics are explicitly designed, tested, and approved
- operators must still select one organization and one starter pack for each approval

## Required Tests Before Real Provisioning

Before any real provisioning action is enabled, add focused coverage for:
- draft pack blocked
- archived pack blocked
- published pack with active seeds allowed
- blocked/unavailable rows reject approval
- stale dry-run fingerprint rejects approval
- source-linkage matches are skipped
- conservative matches are skipped only under approved rules
- tenant-owned records are created with correct organization id
- `source_seed_id` and `source_seed_key` are stored
- existing organization defaults are unchanged
- no estimate, invoice, contract, tax, payroll, entitlement, or workflow records change
- retry does not duplicate records
- failed transaction leaves no partial records
- platform-admin role required
- contractor-only user rejected

## Release Checklist For Future Implementation

Do not enable a real provisioning action until all of these are complete:
- provisioning run and item audit schema exists
- RLS/grants are reviewed for audit tables
- service-role server path is scoped behind platform-admin role checks
- Phase 5F execution readiness report is reviewed and its caveats are resolved or explicitly accepted
- dry-run fingerprinting is implemented
- transaction behavior is proven
- idempotency behavior is proven
- stale approval rejection is proven
- rollback/void behavior is designed and tested
- browser QA confirms explicit confirmation copy and no accidental single-click provisioning
- remote Supabase migration status is verified
- docs/current-state.md and docs/chat-handoff.md are updated in the same change set
