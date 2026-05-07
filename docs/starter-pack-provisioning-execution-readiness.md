# Starter Pack Provisioning Execution Readiness

Status: readiness review with Phase 5G implementation result.

This document records the Phase 5F readiness review for starter-pack provisioning execution. Phase 5F itself did not add an execution action, RPC, migration, tenant-owned write, template copy, catalog copy, rollback action, or runtime behavior.

Phase 5G implemented the first guarded execution slice after accepting the caveats below. Execution now uses `private.execute_platform_starter_pack_provisioning_run(p_run_id uuid, p_actor_id uuid)` plus a service-role-only public wrapper for the existing server action path. The implementation creates tenant-owned copies only from approved, fresh, non-blocking audit runs and still does not add rollback/void, assignment auto-provisioning, defaults mutation, entitlement enforcement, tax/payroll behavior, financial calculation changes, invoice/contract generation changes, or runtime configuration enforcement.

## Verdict

Ready with caveats.

The current schema is ready for a first implementation pass that executes one approved starter-pack provisioning run inside a tightly scoped, platform-admin-only, server-side transaction/RPC path. The destination tables already have source-seed lineage fields, the dry-run matcher uses those fields, and the live database has uniqueness indexes for one copied destination record per organization/source seed.

The caveats are implementation guardrails, not schema blockers:
- execution must be all-or-nothing for the first real pass
- execution must recompute Phase 5C freshness immediately before any write
- execution must not rely only on unique-index errors for idempotency
- execution must not copy platform catalog seed `vendor_id` unless same-tenant/reference safety is explicitly proven
- execution must generate `created_by`, `updated_by`, timestamps, normalized fields, and null tax fields intentionally instead of copying them blindly
- execution should use a private/unexposed RPC or equivalent transaction boundary; a loose multi-step server utility is not enough for safe production execution

No additional migration is required before implementing the first conservative execution pass, based on the current live schema. A later migration may still be useful for richer execution observability or void workflows, but it is not required for safe creation of tenant-owned document template and catalog item copies from approved audit runs.

## Inspection Sources

Reviewed files:
- `supabase/migrations/20260506223000_platform_starter_packs.sql`
- `supabase/migrations/20260507001940_platform_starter_pack_provisioning_audit.sql`
- `apps/web/lib/platform-admin/starter-pack-provisioning-dry-run-core.ts`
- `apps/web/lib/platform-admin/starter-pack-provisioning-draft-core.ts`
- `apps/web/lib/platform-admin/starter-pack-provisioning-draft-review-core.ts`
- `apps/web/lib/platform-admin/data.ts`
- `apps/web/lib/platform-admin/actions.ts`
- `apps/web/lib/platform-admin/schemas.ts`
- `packages/types/src/index.ts`
- `docs/starter-pack-provisioning-plan.md`

Read-only linked Supabase metadata checks:
- `information_schema.columns` for platform seeds, tenant-owned destination tables, and provisioning audit tables
- `pg_constraint` for destination/source/audit constraints
- `pg_indexes` for destination lineage and audit indexes
- table RLS/grant metadata for source, destination, and audit tables

One parallel metadata query hit the Supabase pooler temporary auth/circuit-breaker path, then the relevant checks were retried serially and completed for columns, constraints, and indexes.

## Current Source And Destination Fields

### Platform Template Seeds

Live `platform_template_seeds` fields relevant to execution:
- `id`
- `template_type`
- `seed_key`
- `name`
- `description`
- `subject_template`
- `body_template`
- `schema_version`
- `is_default`
- `is_active`
- `merge_field_manifest`
- `metadata`
- `created_at`
- `updated_at`

Execution should read `is_active = true` seeds only. It should not copy `id`, `is_default`, `is_active`, `created_at`, or `updated_at` directly into tenant-owned lifecycle fields.

### Document Templates

Live `document_templates` fields relevant to execution:
- `id`
- `company_id`
- `template_type`
- `source_seed_id`
- `source_seed_key`
- `name`
- `description`
- `subject_template`
- `body_template`
- `schema_version`
- `status`
- `is_default`
- `merge_field_manifest`
- `metadata`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

Readiness notes:
- `source_seed_id` references `platform_template_seeds(id)` with `ON DELETE SET NULL`.
- `source_seed_key` is available for durable human-readable lineage.
- Live index `document_templates_company_seed_unique_idx` enforces one destination row per `(company_id, source_seed_id)` where `source_seed_id is not null`.
- Live index `document_templates_company_default_type_unique_idx` protects active default uniqueness, but execution should still set `is_default = false`.

### Platform Catalog Item Seeds

Live `platform_catalog_item_seeds` fields relevant to execution:
- `id`
- `item_type`
- `seed_key`
- `name`
- `description`
- `unit`
- `default_unit_price`
- `is_active`
- `is_default`
- `metadata`
- `sort_order`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`
- `default_unit_cost`
- `taxable`
- `vendor_id`
- `category`
- `markup_percent`
- `hidden_markup_percent`
- `sku`
- `internal_notes`
- `photo_storage_path`
- `cost_code`

Execution should read `is_active = true` seeds only. It should not copy `id`, `is_active`, `is_default`, `created_by`, `updated_by`, `created_at`, or `updated_at` directly into tenant-owned lifecycle fields.

### Catalog Items

Live `catalog_items` fields relevant to execution:
- `id`
- `company_id`
- `source_seed_id`
- `source_seed_key`
- `item_type`
- `name`
- `description`
- `unit`
- `default_unit_price`
- `status`
- `is_default`
- `metadata`
- `sort_order`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`
- `default_unit_cost`
- `taxable`
- `vendor_id`
- `category`
- `markup_percent`
- `hidden_markup_percent`
- `sku`
- `internal_notes`
- `photo_storage_path`
- `cost_code`
- `normalized_name`
- `normalized_sku`
- `tax_code_id`

Readiness notes:
- `source_seed_id` references `platform_catalog_item_seeds(id)` with `ON DELETE SET NULL`.
- `source_seed_key` is available for durable human-readable lineage.
- Live index `catalog_items_company_seed_unique_idx` enforces one destination row per `(company_id, source_seed_id)` where `source_seed_id is not null`.
- `tax_code_id` is destination-specific and should be generated as `null` for provisioning unless a future tax-profile feature explicitly maps it.
- `normalized_name` and `normalized_sku` are destination lookup fields and should be generated by existing database behavior if present, or intentionally inserted from normalized destination values if the existing catalog write path requires that.

## Exact Copy Mapping

### Document Template Mapping

| Destination field | Source or generation plan |
| --- | --- |
| `id` | generated by database |
| `company_id` | approved run `organization_id` |
| `template_type` | `platform_template_seeds.template_type` |
| `source_seed_id` | `platform_template_seeds.id` |
| `source_seed_key` | `platform_template_seeds.seed_key` |
| `name` | `platform_template_seeds.name` |
| `description` | `platform_template_seeds.description` |
| `subject_template` | `platform_template_seeds.subject_template` |
| `body_template` | `platform_template_seeds.body_template` |
| `schema_version` | `platform_template_seeds.schema_version` |
| `status` | generated as `active` |
| `is_default` | generated as `false` |
| `merge_field_manifest` | `platform_template_seeds.merge_field_manifest` |
| `metadata` | copied from seed metadata with optional additive provisioning provenance |
| `created_by` | execution actor user id |
| `updated_by` | execution actor user id |
| `created_at` | generated by database |
| `updated_at` | generated by database trigger/default |

Do not copy from source:
- seed `id` as destination `id`
- seed `is_default`
- seed `is_active`
- seed `created_at`
- seed `updated_at`
- run/audit snapshots as canonical template fields

### Catalog Item Mapping

| Destination field | Source or generation plan |
| --- | --- |
| `id` | generated by database |
| `company_id` | approved run `organization_id` |
| `source_seed_id` | `platform_catalog_item_seeds.id` |
| `source_seed_key` | `platform_catalog_item_seeds.seed_key` |
| `item_type` | `platform_catalog_item_seeds.item_type` |
| `name` | `platform_catalog_item_seeds.name` |
| `description` | `platform_catalog_item_seeds.description` |
| `unit` | `platform_catalog_item_seeds.unit` |
| `default_unit_price` | `platform_catalog_item_seeds.default_unit_price` |
| `status` | generated as `active` |
| `is_default` | generated as `false` |
| `metadata` | copied from seed metadata with optional additive provisioning provenance |
| `sort_order` | seed `sort_order` or append after current organization sort order; implementation must choose one deterministic rule |
| `created_by` | execution actor user id |
| `updated_by` | execution actor user id |
| `created_at` | generated by database |
| `updated_at` | generated by database trigger/default |
| `default_unit_cost` | `platform_catalog_item_seeds.default_unit_cost` |
| `taxable` | `platform_catalog_item_seeds.taxable` |
| `vendor_id` | leave `null` unless same-tenant reference safety is proven; do not blindly copy platform seed vendor references |
| `category` | `platform_catalog_item_seeds.category` |
| `markup_percent` | `platform_catalog_item_seeds.markup_percent` |
| `hidden_markup_percent` | `platform_catalog_item_seeds.hidden_markup_percent` |
| `sku` | `platform_catalog_item_seeds.sku` |
| `internal_notes` | `platform_catalog_item_seeds.internal_notes` |
| `photo_storage_path` | `platform_catalog_item_seeds.photo_storage_path` |
| `cost_code` | `platform_catalog_item_seeds.cost_code` |
| `normalized_name` | generated/derived for destination lookup, not copied from seed |
| `normalized_sku` | generated/derived from destination `sku`, not copied from seed |
| `tax_code_id` | generated as `null`; no tax-profile mapping in this phase |

Do not copy from source:
- seed `id` as destination `id`
- seed `is_default`
- seed `is_active`
- seed `created_by`
- seed `updated_by`
- seed `created_at`
- seed `updated_at`
- seed `vendor_id` unless explicitly proven safe for the destination organization

## Dry-Run And Lineage Alignment

The Phase 4D dry-run matcher is aligned with execution lineage:
- template exact match uses `document_templates.source_seed_id = platform_template_seeds.id` or `document_templates.source_seed_key = platform_template_seeds.seed_key`
- catalog exact match uses `catalog_items.source_seed_id = platform_catalog_item_seeds.id` or `catalog_items.source_seed_key = platform_catalog_item_seeds.seed_key`
- template conservative match uses no source linkage plus matching `template_type` and normalized `name`
- catalog conservative match uses no source linkage plus matching `item_type`, normalized `category`, and normalized `name`

Execution should use the same exact lineage fields and should treat conservative matches as skip/manual-review cases, not overwrite targets.

## Conflict And Duplicate Checks Before Insert

Before inserting a destination document template, execution must check:
- current run is still approved/fresh
- source seed is active
- no active or archived same-organization destination already has the same `source_seed_id`
- no same-organization destination already has the same `source_seed_key`
- dry-run conservative matching has not changed
- the insert will set `is_default = false`

Before inserting a destination catalog item, execution must check:
- current run is still approved/fresh
- source seed is active
- no active or archived same-organization destination already has the same `source_seed_id`
- no same-organization destination already has the same `source_seed_key`
- dry-run conservative matching has not changed
- destination `vendor_id` and `tax_code_id` handling is safe/null
- the insert will set `is_default = false`

The live unique indexes on `(company_id, source_seed_id)` are good defense-in-depth, but execution should check conflicts before insert so operators receive understandable errors and so `source_seed_key`-only legacy matches are handled.

## Audit Schema Readiness

`platform_starter_pack_provisioning_runs` is ready for execution state:
- supports `approved`, `running`, `completed`, `completed_with_warnings`, `failed`, and `voided`
- stores target organization and starter pack references
- stores requested/approved actor references
- stores `started_at`, `completed_at`, `voided_at`, and `error_message`
- has unique `idempotency_key` when present
- has RLS enabled and forced
- has no broad `anon` / `authenticated` table grants in the live grant check

`platform_starter_pack_provisioning_run_items` is ready for item outcomes:
- constrains template seed rows to `document_template`
- constrains catalog seed rows to `catalog_item`
- supports `would_create`, `skipped_existing`, `created`, `blocked`, `failed`, and `voided`
- supports `pending`, `completed`, `skipped`, `blocked`, `failed`, and `voided`
- stores `destination_record_id`
- stores `source_snapshot` and `destination_snapshot`
- has RLS enabled and forced
- has no broad `anon` / `authenticated` table grants in the live grant check

Readiness caveat resolved in Phase 5G: `destination_record_id` is polymorphic, so execution sets it only after verifying `destination_record_type` and source item type. The existing check constraints enforce the source/destination type pairing.

## Transaction/RPC Feasibility

The current schema supports the Phase 5E plan:
- run rows can be locked and transitioned from `approved` to `running`
- item rows can be locked by `run_id`
- destination inserts can store source seed lineage
- audit item rows can store destination ids and snapshots
- unique destination source indexes can prevent duplicate created copies

Recommended implementation remains a private/unexposed Postgres RPC, called only after the platform-admin server action recomputes and validates a fresh review. The RPC should lock the run row and item rows, perform final reads/checks, insert tenant-owned rows, update audit items, and finalize the run in one transaction.

## RLS And Grants Notes

Destination `document_templates` and `catalog_items` are tenant-owned tables with RLS enabled and forced. The provisioning audit tables also have RLS enabled and forced with broad `anon` and `authenticated` grants revoked.

Live metadata shows `platform_catalog_item_seeds` does not currently have RLS enabled, while `platform_template_seeds` does. Live grants for platform seeds and destination tables include broad inherited/default privileges, with RLS providing row protection on RLS-enabled tables. This is existing platform seed/table posture, not a blocker discovered by Phase 5F, and Phase 5G keeps execution server-side without broadening client access.

## Blockers

No schema blocker for the first conservative execution implementation was found.

## Phase 5G Caveat Resolution

Phase 5G resolved the readiness caveats this way:
- catalog `sort_order` appends after the organization's current max sort order, incrementing new provisioned catalog items by 10 in execution order
- catalog seed `vendor_id` is not copied; destination `vendor_id` is set to `null`
- skipped existing audit items store the matched `destination_record_id` when the approved snapshot has a valid same-organization match
- validation failures before RPC execution leave the run unchanged and return a safe error
- failures inside the execution function roll back the transaction; no partial tenant-owned writes should remain
- the private function lives in the `private` schema, with a `public.execute_platform_starter_pack_provisioning_run` wrapper granted only to `service_role` so the existing server-side Supabase RPC path can call it without exposing execution to `anon` or `authenticated`

## Phase 5H Hardening Result

Phase 5H did not add new provisioning features. It hardened the existing approved-run execution slice by adding focused eligibility and migration-invariant tests, confirming rejected execution attempts leave tenant-owned counts unchanged, and improving completed-run review visibility so item-level audit destination ids are visible after execution.

Verified rejection cases:
- draft run execution is rejected before any tenant-owned writes
- stale approved run execution is rejected when a source seed is already linked to an organization-owned destination record
- rejected attempts leave the run status and lifecycle timestamps unchanged
- rejected attempts do not change `document_templates` or `catalog_items` counts for the QA organization

Guardrails still unchanged:
- no rollback or void action
- no assignment-based auto-provisioning
- no defaults mutation
- no catalog `vendor_id` copy
- no entitlement, tax, payroll, financial calculation, invoice/contract generation, user preference, or runtime enforcement changes

## Phase 5I Observability Result

Phase 5I did not add new provisioning features. It adds read-only operator observability over provisioning audit runs in `/super-admin/templates`: summary counts, status filters, run health chips, destination-link counts, item outcome totals, timestamps, and safe failed-run/error display.

## Phase 5J Attempt Logging Result

Phase 5J adds a narrow operations audit table for rejected/no-op execution attempts without adding rollback, void, assignment enforcement, or new provisioning behavior. `platform_starter_pack_provisioning_attempts` records only safe messages for rejected, blocked, failed-before-execution, and already-completed no-op `execute` attempts. Successful executions remain represented by the existing provisioning run/item audit rows.

## Phase 5L Rollback/Void Readiness

Phase 5L did not add rollback or void behavior. It documents the safe future model for completed provisioning runs only.

Current schema support:
- `platform_starter_pack_provisioning_runs.status` already allows `voided`.
- `platform_starter_pack_provisioning_runs.voided_at` exists.
- `platform_starter_pack_provisioning_runs.voided_by`, `void_reason`, `void_strategy`, and `void_readiness_snapshot` exist for future audit-only void evidence.
- `platform_starter_pack_provisioning_run_items.action` and `status` already allow `voided`.
- `document_templates.status` supports `active` / `archived`.
- `catalog_items.status` supports `active` / `archived`.
- created destination records already carry `source_seed_id`, `source_seed_key`, and provisioning metadata.

Current blockers or caveats before implementing real void:
- no void action, RPC, server action, UI form, or tenant-owned mutation path exists
- no item-level void metadata fields exist; a future audit-only void can start with run-level metadata, but archive/detach strategies may need item-level retained/archived outcome fields
- no helper currently centralizes "template in use" checks across estimates, invoices, contracts, snapshots, organization defaults, and user preferences
- no helper currently centralizes "catalog item in use" checks across estimate lines, invoice lines, approved snapshots, catalog/system components, floor-system components, inventory, and future downstream material/job-cost records
- detaching source lineage would weaken future dry-run duplicate detection unless a replacement managed-lineage marker is designed

Future usage helper families needed:
- document template usage counts by destination id for `estimates`, `invoices`, `contracts`, `estimate_commercial_snapshots`, `organization_workflow_settings`, `user_estimate_template_preferences`, active default templates, and future generated-document snapshots
- catalog item usage counts by destination id for `estimate_line_items`, `invoice_line_items`, `estimate_commercial_snapshot_items`, `catalog_system_components`, `floor_system_template_components`, `inventory_items`, active default catalog items, and future material/job-cost usage
- run reconciliation from provisioning run items to same-organization destination records before any void review

Recommended readiness verdict for future void: ready for an audit-only void design after a small audit metadata migration; not ready for archive or detach behavior until usage helpers and QA coverage exist.

## Phase 5M Usage/Void-Readiness Utilities

Phase 5M adds read-only usage readiness utilities and UI visibility only. It does not add rollback, void, archive, delete, detach-lineage behavior, schema, RLS/grant changes, or tenant-owned writes.

Implemented readiness support:
- pure read model: `buildStarterPackProvisioningVoidReadiness`
- server read helper: `getStarterPackProvisioningRunUsage(runId)`
- completed-run UI panel: `/super-admin/templates` run review shows usage status, known usage counts, blocking/warning totals, and read-only audit/archive readiness signals

Known usage sources now counted:
- document templates: `estimates`, `invoices`, `contracts`, `estimate_commercial_snapshots`, `organization_workflow_settings`, `user_estimate_template_preferences`, and active default templates
- catalog items: `estimate_line_items`, `invoice_line_items`, `estimate_commercial_snapshot_items`, `catalog_system_components`, `floor_system_template_components`, `inventory_items`, and active default catalog items

Remaining future-void caveats:
- durable usage-check snapshot storage exists on the run header, but no void action captures one yet
- void actor/reason/strategy metadata fields exist on the run header, but no server action writes them yet
- no mutation path exists for audit-only void or archive-unused
- archive/detach behavior still requires separate schema, action, UI, QA, and operator approval work

## Phase 5Q Audit-Only Void Action Readiness

Phase 5Q adds design-to-implementation readiness only. It does not add a void server action, rollback action, archive/delete/detach behavior, migration, RLS/grant change, tenant-owned write, or new provisioning behavior.

Readiness verdict for first audit-only void action: ready with a narrow implementation prompt.

Ready inputs:
- run-level void metadata exists on `platform_starter_pack_provisioning_runs`
- read-only usage readiness exists through `getStarterPackProvisioningRunUsage(runId)`
- completed run detail already displays destination ids and void-readiness usage rows
- platform-admin server-action patterns already exist for approval and execution

Required next implementation boundaries:
- future action must transition only `completed` / `completed_with_warnings` to `voided`
- future action must use exact confirmation `VOID AUDIT ONLY`
- future action must recompute usage readiness immediately before update
- future action must write only run-header audit metadata
- future action must not mutate tenant-owned templates/catalog items or run item destination rows
- future action should use a locked private RPC or equivalent transaction helper to avoid concurrent metadata overwrites

Still not ready for archive/detach:
- no item-level void outcome metadata exists
- no detach-safe replacement for source lineage exists
- no archive/delete/detach server action or QA gate exists
- usage-readiness rows are sufficient evidence for audit-only void, but mutating strategies need stricter destination ownership/default/usage proofs

## Phase 5R Audit-Only Void Eligibility Read Model

Phase 5R adds deterministic eligibility/read-model coverage only. It does not add a void server action, RPC, migration, RLS/grant change, tenant-owned write, archive/delete/detach behavior, or new provisioning behavior.

Readiness behavior:
- pure helper: `evaluateStarterPackProvisioningVoidEligibility(...)`
- confirmation phrase constant: `VOID AUDIT ONLY`
- statuses: `eligible`, `blocked`, `already_voided`, and `unavailable`
- eligible statuses: `completed` and `completed_with_warnings`, only when the run has reviewable completed/destination-linked items and usage readiness is available
- blocked statuses: `draft`, `approved`, `running`, and `failed`
- already-voided runs return readback/idempotency guidance and are not eligible for another write
- used, unknown, or missing usage rows warn but do not block audit-only eligibility because audit-only void would write only run-header metadata in a future phase
- `archive_unused_future` and `detach_lineage_future` remain unavailable/future-only

Remaining before a real action:
- no void server action exists
- no private void RPC/transaction helper exists
- no UI form/control exists
- no rejected-void attempt logging exists
- no mutation path exists for archive/delete/detach

## Readiness Checklist

- Current platform template seed fields inspected: yes
- Current document template fields inspected: yes
- Current platform catalog seed fields inspected: yes
- Current catalog item fields inspected: yes
- Source lineage fields available on both destination tables: yes
- Dry-run matching uses the same lineage fields: yes
- Destination uniqueness by organization/source seed exists: yes
- Audit run/item schema supports execution statuses and destination ids: yes
- Transaction/RPC plan feasible with current tables: yes
- Additional migration required before first conservative execution: no
- Execution/provisioning behavior added in Phase 5F: no
- First guarded execution behavior added in Phase 5G: yes
- Rollback/void behavior added in Phase 5L: no
- Read-only void-readiness usage helpers added in Phase 5M: yes
- Future audit-only void metadata migration added in Phase 5O: yes
- Audit-only void implementation plan added in Phase 5Q: yes
- Audit-only void eligibility read model added in Phase 5R: yes
- Consolidated architecture/operator readiness review added in Phase 5T: yes
- Future archive/detach void requires usage snapshot/audit metadata plus separate mutation design: yes
