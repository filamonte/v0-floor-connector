---
title: "PostgreSQL Schema Specification: System Layers"
version: "0.1"
date_created: "2026-05-05"
date_updated: "2026-05-05"
status: "Partially implemented schema specification"
tags: [schema, planning, products, systems, files, communication, delivery-proof, activity]
---

# PostgreSQL Schema Specification: System Layers

Status: partially implemented schema specification.

This document converts the approved system-layers implementation plan into a PostgreSQL schema specification. The first migration slice is implemented in `supabase/migrations/20260505120000_system_layers_first_slice.sql`. Later slices remain planning only.

For implemented status, trust [docs/current-state.md](C:/FloorConnector/docs/current-state.md). This schema spec is future direction until an approved migration task implements it.

The planned schema preserves the canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Future pre-lead visualizer selections may begin before this chain exists, but operational use must attach to the shared chain without fake customer/project records, portal copies, module silos, or duplicate cost item systems.

## Global Schema Rules

- `catalog_items` remains the cost, pricing, quantity-basis, reusable item, and estimate-expansion source.
- `finish_products` stores manufacturer/product/spec proof metadata only. It is not a second cost item database.
- `floor_system_template_components.catalog_item_id` is required; `finish_product_id` is optional when product/spec identity is needed.
- Tenant-owned tables use the existing schema convention: `company_id` referencing `public.companies(id)`. Product docs may say organization, but migration SQL should use `company_id`.
- Public/pre-auth visualizer selections must not be stored in tenant-owned tables. They use a separate handoff table and a server-only claim flow.
- Same-company alignment must be enforced in app/server validation for every cross-record write. Composite FKs may be used where existing tables already expose `(company_id, id)` uniqueness.
- Portal visibility must flow through RLS and portal-scoped loaders, not duplicate portal tables.
- Immutable snapshots and audit telemetry should be append-only; corrections use superseding/amending/voiding records rather than in-place rewrites.
- Use CHECK constraints for the first migration slice. Reason: the value sets are still product-planning vocabulary, and CHECK constraints are easier to extend safely than PostgreSQL enums during early iteration.

## Locked Migration Decisions

These decisions resolve the blockers from the migration-readiness review:

- `selected_floor_systems` is strictly tenant-owned: `company_id` is required and never nullable.
- Pre-auth visualizer state belongs in `visualizer_sessions`, not in `selected_floor_systems`.
- `files` plus `file_links` are the only canonical file relationships. Snapshot file arrays are not part of the schema plan.
- Polymorphic links are enforced by application/server validation only. PostgreSQL will not enforce cross-table FKs for `subject_type`/`subject_id` pairs in the first implementation.
- User FKs use the existing profile extension table: `public.users(id)`.
- Customer contact FKs use `public.customer_contacts(id)`.
- Only one `selected_floor_systems` row per project can have `is_primary = true`.
- Activity events remain high-signal readable memory only; they do not own business truth.

## Shared Check Values

Use CHECK constraints for the first migration slice. Do not use PostgreSQL enum types yet because the product vocabulary is still expected to evolve.

`service_family`:
- `decorative_flake`
- `metallic_epoxy`
- `decorative_quartz`
- `solid_color_coating`
- `concrete_polishing`
- `grind_and_seal`
- `future_specialty_system`

`finish_family`:
- `decorative_flake`
- `metallic_epoxy`
- `decorative_quartz`
- `solid_color`
- `none`
- `other`

`area_type`:
- `room`
- `zone`
- `phase`
- `option`
- `alternate`
- `whole_project`
- `other`

`visibility`:
- `internal`
- `customer_visible`
- `both`

`file_category`:
- `image`
- `photo`
- `render`
- `pdf`
- `document`
- `spec_sheet`
- `signed_document`
- `markup`
- `receipt`
- `other`

`file_role`:
- `product_image`
- `visualizer_render`
- `room_photo`
- `selected_finish_proof`
- `spec_sheet_reference`
- `contract_signature_evidence`
- `field_progress_evidence`
- `closeout_evidence`
- `payment_proof`
- `communication_attachment`
- `internal_reference`

`communication_channel`:
- `email`
- `sms`
- `portal`
- `app_push`
- `app_message`
- `manual_log`
- `provider_sync`

`communication_direction`:
- `outbound`
- `inbound`

`message_delivery_event_type`:
- `created`
- `queued`
- `processed`
- `sent`
- `delivered`
- `opened`
- `clicked`
- `deferred`
- `bounced`
- `blocked`
- `dropped`
- `failed`
- `provider_sync`

`activity_event_visibility`:
- `internal`
- `customer_visible`
- `both`

## Table: `finish_products`

Purpose: manufacturer/product/spec proof metadata for visual finishes, coating products, polish systems, sealers, blends, or future specialty surface products. These rows are metadata/proof only and do not own cost, price, quantity basis, estimate expansion, invoice behavior, or catalog reuse.

### Columns

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | yes | `gen_random_uuid()` | Primary key. |
| `company_id` | `uuid` | yes | none | FK to `public.companies(id)`. Tenant owner. |
| `manufacturer_name` | `text` | yes | none | Torginol-style vendor/manufacturer name without vendor-specific commitment. |
| `product_line` | `text` | no | none | Product family or line. |
| `product_code` | `text` | no | none | Manufacturer product code. |
| `sku` | `text` | no | none | Optional SKU when distinct from product code. |
| `product_name` | `text` | yes | none | Human-readable product/spec name. |
| `normalized_product_name` | `text` | yes | generated | Generated as `lower(btrim(product_name))` for lookup/search support. |
| `service_family` | `text` | no | none | Check against shared `service_family` values. |
| `finish_family` | `text` | no | none | Check against shared `finish_family` values. |
| `display_color_name` | `text` | no | none | Optional customer-facing color/blend label. |
| `customer_facing_description` | `text` | no | none | Description safe for estimate/contract/portal proof. |
| `technical_notes` | `text` | no | none | Internal or technical spec notes. |
| `metadata` | `jsonb` | yes | `'{}'::jsonb` | Extensible manufacturer/spec metadata; not pricing. |
| `status` | `text` | yes | `'draft'` | `draft`, `active`, `retired`, `archived`. |
| `created_by` | `uuid` | no | none | FK to `public.users(id)`. |
| `updated_by` | `uuid` | no | none | FK to `public.users(id)`. |
| `created_at` | `timestamptz` | yes | `now()` | Creation timestamp. |
| `updated_at` | `timestamptz` | yes | `now()` | Updated by trigger in implementation. |

### Constraints

- Primary key: `id`.
- FK: `company_id -> public.companies(id)`.
- FK: `created_by -> public.users(id)`.
- FK: `updated_by -> public.users(id)`.
- Check: `status in ('draft','active','retired','archived')`.
- Check: `service_family is null or service_family in (...)`.
- Check: `finish_family is null or finish_family in (...)`.
- Unique: partial unique index on `(company_id, lower(manufacturer_name), lower(coalesce(product_line, '')), lower(product_code)) where product_code is not null`.
- Unique: partial unique index on `(company_id, lower(manufacturer_name), lower(sku)) where sku is not null`.

### Recommended Indexes

- `(company_id, status)`.
- `(company_id, manufacturer_name)`.
- `(company_id, normalized_product_name)`.
- `(company_id, service_family, finish_family)`.
- GIN index on `metadata` only if query patterns require it.

### RLS Expectations

- Enable RLS.
- Tenant members can read rows for their active organization according to membership permissions.
- Write access should be limited to roles allowed to manage catalog/spec metadata.
- Portal users should not read this table directly; portal access should come through scoped loaders and linked selected/snapshot/file records.

### Immutable Fields

- `id`, `company_id`, `created_at`.
- Product identity fields may be edited while `draft`; once referenced by selected systems or snapshots, corrections should preserve downstream snapshot truth and may require retiring/replacing the product row.

## Table: `floor_system_templates`

Purpose: reusable sellable/installable system blueprints that can represent visual finish systems, process/service systems, or combined surface systems.

### Columns

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | yes | `gen_random_uuid()` | Primary key. |
| `company_id` | `uuid` | yes | none | FK to `public.companies(id)`. |
| `name` | `text` | yes | none | Template/system name. |
| `normalized_name` | `text` | yes | generated | Generated as `lower(btrim(name))` for lookup/search support. |
| `service_family` | `text` | yes | none | Check against shared values. |
| `finish_family` | `text` | no | none | Required only where visually applicable. |
| `customer_facing_description` | `text` | no | none | Safe estimate/contract language. |
| `internal_notes` | `text` | no | none | Internal setup/install notes. |
| `prep_requirements` | `text` | no | none | Planning notes, not a jobsite delivery model. |
| `technical_notes` | `text` | no | none | System specification notes. |
| `template_version` | `integer` | yes | `1` | Planning version marker; snapshots remain unchanged even if later versioning expands. |
| `status` | `text` | yes | `'draft'` | `draft`, `active`, `retired`, `archived`. |
| `created_by` | `uuid` | no | none | FK to `public.users(id)`. |
| `updated_by` | `uuid` | no | none | FK to `public.users(id)`. |
| `created_at` | `timestamptz` | yes | `now()` | Creation timestamp. |
| `updated_at` | `timestamptz` | yes | `now()` | Updated by trigger in implementation. |

### Constraints

- Primary key: `id`.
- FK: `company_id -> public.companies(id)`.
- FK: `created_by -> public.users(id)`.
- FK: `updated_by -> public.users(id)`.
- Check: `status in ('draft','active','retired','archived')`.
- Check: `service_family in (...)`.
- Check: `finish_family is null or finish_family in (...)`.
- Check: `template_version >= 1`.
- Unique: partial unique index on `(company_id, normalized_name) where status <> 'archived'`.

### Recommended Indexes

- `(company_id, status)`.
- `(company_id, service_family, finish_family)`.
- `(company_id, normalized_name)`.

### RLS Expectations

- Enable RLS.
- Tenant members can read organization templates.
- Writes should be limited to roles allowed to manage systems/templates.
- Platform starter/adoption behavior remains unresolved and should not weaken tenant ownership.

### Immutable Fields

- `id`, `company_id`, `created_at`.
- Historical estimate/contract snapshots never mutate when template fields or components change.

## Table: `floor_system_template_components`

Purpose: ordered reusable component definitions for system templates. Components must link to `catalog_items` for cost/pricing/quantity/estimate expansion and may optionally link to `finish_products` for spec proof.

### Columns

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | yes | `gen_random_uuid()` | Primary key. |
| `company_id` | `uuid` | yes | none | FK to `public.companies(id)`. |
| `floor_system_template_id` | `uuid` | yes | none | FK to `floor_system_templates(id)`. |
| `catalog_item_id` | `uuid` | yes | none | FK to `catalog_items(id)`. Required cost/reusable item source. |
| `finish_product_id` | `uuid` | no | none | FK to `finish_products(id)` when product/spec proof is needed. |
| `component_role` | `text` | yes | `'standard'` | `standard`, `basecoat`, `broadcast`, `topcoat`, `primer`, `prep`, `labor`, `equipment`, `add_on`, `other`. |
| `sort_order` | `integer` | yes | `0` | Ordered display/expansion sequence. |
| `quantity_basis` | `text` | yes | none | `sqft`, `linear_ft`, `each`, `fixed`, `hour`, `day`, `percentage`, `formula`. |
| `default_quantity` | `numeric(12,4)` | no | none | Optional static component quantity. |
| `formula_metadata` | `jsonb` | yes | `'{}'::jsonb` | Formula inputs and scaling notes; no customer price truth. |
| `customer_facing_label` | `text` | no | none | Optional label if component is exposed. |
| `internal_notes` | `text` | no | none | Internal install/spec notes. |
| `is_optional` | `boolean` | yes | `false` | Optional/add-on component planning flag. |
| `created_by` | `uuid` | no | none | FK to `public.users(id)`. |
| `updated_by` | `uuid` | no | none | FK to `public.users(id)`. |
| `created_at` | `timestamptz` | yes | `now()` | Creation timestamp. |
| `updated_at` | `timestamptz` | yes | `now()` | Updated by trigger in implementation. |

### Constraints

- Primary key: `id`.
- FK: `company_id -> public.companies(id)`.
- FK: `floor_system_template_id -> floor_system_templates(id)`.
- FK: `catalog_item_id -> catalog_items(id)`.
- FK: `finish_product_id -> finish_products(id)` with column-scoped `on delete set null (finish_product_id)`; finish product identity is optional metadata/proof and must not null `company_id` or block retiring/removing a metadata row.
- Check: `component_role in ('standard','basecoat','broadcast','topcoat','primer','prep','labor','equipment','add_on','other')`.
- Check: `quantity_basis in ('sqft','linear_ft','each','fixed','hour','day','percentage','formula')`.
- Check: `char_length(btrim(quantity_basis)) > 0`.
- Check: `sort_order >= 0`.
- Check: `default_quantity is null or default_quantity >= 0`.
- Unique: `(floor_system_template_id, sort_order, catalog_item_id)`.
- Same-company alignment: template, catalog item, and finish product must belong to the same `company_id`.

### Recommended Indexes

- `(company_id, floor_system_template_id, sort_order)`.
- `(company_id, catalog_item_id)`.
- `(company_id, finish_product_id) where finish_product_id is not null`.

### RLS Expectations

- Enable RLS.
- Tenant members can read components for templates in their organization.
- Writes should follow template-management permissions.
- App/server validation must prevent cross-tenant component links.

### Immutable Fields

- `id`, `company_id`, `created_at`.
- Component changes do not alter existing estimate or contract snapshots.

## Table: `visualizer_sessions`

Purpose: planning-only pre-auth handoff table for future public room visualizer or finish/product selection flows. This table stores temporary selection context before a contractor accepts the work into the tenant-owned canonical chain. It is not a business source of truth.

### Creation And Claim Flow

- A public/pre-auth visualizer creates a `visualizer_sessions` row through a narrow public endpoint or server-side ingestion path.
- The row stores only minimal handoff context: selected finish/product reference where known, selected system template reference where safe, area/room labels, and sanitized metadata.
- The row does not create or require a fake opportunity, customer, project, estimate, or contract.
- After lead/customer/project creation or attachment, a server-only claim flow validates the opaque session key and creates one or more tenant-owned `selected_floor_systems` rows.
- After claim, operational work uses `selected_floor_systems`; `visualizer_sessions` remains retained handoff context only.
- Public/portal clients must never query tenant-owned `selected_floor_systems` directly.

### Columns

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | yes | `gen_random_uuid()` | Primary key. |
| `public_session_key_hash` | `text` | yes | none | Hash of opaque handoff key; never store raw public token. |
| `selected_finish_product_hint` | `jsonb` | yes | `'{}'::jsonb` | Pre-auth finish/product metadata hint; not a FK and not business truth. |
| `floor_system_template_id` | `uuid` | no | none | Optional FK to `floor_system_templates(id)` only when a public-safe template reference is intentionally allowed. |
| `system_name` | `text` | no | none | Customer-facing selected system name or visualizer label. |
| `service_family` | `text` | no | none | Check against shared values when present. |
| `finish_family` | `text` | no | none | Check against shared values when present. |
| `area_label` | `text` | no | none | Room/area label from visualizer. |
| `area_type` | `text` | yes | `'whole_project'` | Check against shared `area_type` values. |
| `estimated_area_sqft` | `numeric(12,2)` | no | none | Optional pre-auth planning quantity. |
| `estimated_linear_ft` | `numeric(12,2)` | no | none | Optional pre-auth planning quantity. |
| `customer_contact_hint` | `jsonb` | yes | `'{}'::jsonb` | Minimal lead/contact handoff data if supplied. |
| `source_metadata` | `jsonb` | yes | `'{}'::jsonb` | Sanitized visualizer metadata only. |
| `claim_status` | `text` | yes | `'unclaimed'` | `unclaimed`, `claimed`, `expired`, `void`. |
| `claimed_company_id` | `uuid` | no | none | FK to `public.companies(id)` after server-only claim. |
| `claimed_selected_floor_system_id` | `uuid` | no | none | FK to `selected_floor_systems(id)` after creation. |
| `claimed_at` | `timestamptz` | no | none | Claim timestamp. |
| `expires_at` | `timestamptz` | no | none | Optional expiration for public handoff. |
| `created_at` | `timestamptz` | yes | `now()` | Creation timestamp. |
| `updated_at` | `timestamptz` | yes | `now()` | Updated by trigger in implementation. |

### Constraints

- Primary key: `id`.
- FK: `claimed_company_id -> public.companies(id)`.
- FK: `claimed_selected_floor_system_id -> selected_floor_systems(id)` once the second slice creates both tables.
- Circular-link note: because `selected_floor_systems.visualizer_session_id` also points back to this table, the second-slice migration should either add one FK after both tables exist or make `claimed_selected_floor_system_id` server-validated instead of a hard FK in the first selected-system migration.
- Check: `claim_status in ('unclaimed','claimed','expired','void')`.
- Check: `service_family is null or service_family in (...)`.
- Check: `finish_family is null or finish_family in (...)`.
- Check: `area_type in (...)`.
- Check: `estimated_area_sqft is null or estimated_area_sqft >= 0`.
- Check: `estimated_linear_ft is null or estimated_linear_ft >= 0`.
- Unique: `public_session_key_hash`.
- Check: if `claim_status = 'claimed'`, then `claimed_company_id`, `claimed_selected_floor_system_id`, and `claimed_at` are not null.

### Recommended Indexes

- `(claim_status, created_at desc)`.
- `(claimed_company_id, claimed_at desc) where claimed_company_id is not null`.
- `(expires_at) where claim_status = 'unclaimed' and expires_at is not null`.

### RLS Expectations

- Prefer placing this table in a private or otherwise non-exposed schema. If created in `public`, enable RLS and deny normal direct client access.
- Public creation/claim should be mediated by server routes/actions with strict validation and rate limiting.
- Tenant users should only see a claimed result through the tenant-owned `selected_floor_systems` row, not by browsing public session rows.

### Immutable Fields

- `id`, `public_session_key_hash`, `created_at`.
- Pre-auth selection payload should not be edited after claim; corrections create or amend tenant-owned selected system records through normal workflows.

## Table: `selected_floor_systems`

Purpose: tenant-owned selected finish/system/spec context after a public visualizer selection, lead intake, customer/project workflow, or contractor selection has been accepted into the canonical chain. This table does not require `project_id`, but it always requires `company_id`.

### Columns

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | yes | `gen_random_uuid()` | Primary key. |
| `company_id` | `uuid` | yes | none | FK to `public.companies(id)`. Required tenant owner. |
| `visualizer_session_id` | `uuid` | no | none | Optional FK to `visualizer_sessions(id)` after server-only claim. |
| `opportunity_id` | `uuid` | no | none | FK to `opportunities(id)`. |
| `customer_id` | `uuid` | no | none | FK to `customers(id)`. |
| `project_id` | `uuid` | no | none | FK to `projects(id)`. |
| `estimate_id` | `uuid` | no | none | FK to `estimates(id)`. |
| `contract_id` | `uuid` | no | none | FK to `contracts(id)`. |
| `job_id` | `uuid` | no | none | FK to `jobs(id)`. |
| `floor_system_template_id` | `uuid` | no | none | FK to `floor_system_templates(id)`. |
| `primary_finish_product_id` | `uuid` | no | none | FK to `finish_products(id)`. |
| `system_name` | `text` | yes | none | Working selected system name. |
| `service_family` | `text` | yes | none | Check against shared values. |
| `finish_family` | `text` | no | none | Nullable for concrete polishing/process systems. |
| `area_label` | `text` | no | none | Room/area label such as Garage, Kitchen, Phase 1. |
| `area_type` | `text` | yes | `'whole_project'` | Check against shared `area_type` values. |
| `phase_label` | `text` | no | none | Optional phase support. |
| `option_label` | `text` | no | none | Optional alternate/option support. |
| `sort_order` | `integer` | yes | `0` | Display/order within subject context. |
| `estimated_area_sqft` | `numeric(12,2)` | no | none | Planning quantity, not billing truth. |
| `estimated_linear_ft` | `numeric(12,2)` | no | none | Planning quantity, not billing truth. |
| `quantity_notes` | `text` | no | none | Area/room measurement notes. |
| `customer_facing_description` | `text` | no | none | Required before proposal-facing use. |
| `technical_notes` | `text` | no | none | Product/process/install notes. |
| `spec_completeness_status` | `text` | yes | `'incomplete'` | `incomplete`, `ready_for_proposal`, `complete`, `needs_review`. |
| `spec_completeness_checks` | `jsonb` | yes | `'{}'::jsonb` | Validation details for later draft -> proposed gate. |
| `spec_completed_at` | `timestamptz` | no | none | Set when proposed/complete requirements are satisfied. |
| `lifecycle_state` | `text` | yes | `'draft'` | `draft`, `proposed`, `selected`, `locked`, `superseded`, `amended`, `void`, `retracted`, `rejected`. |
| `is_primary` | `boolean` | yes | `false` | Primary system for the project. Scope is per project only. |
| `selected_at` | `timestamptz` | no | none | When contractor/customer selection becomes operationally selected. |
| `locked_at` | `timestamptz` | no | none | Set when estimate/contract boundary locks the selected system. |
| `claimed_at` | `timestamptz` | no | none | Set when converted from `visualizer_sessions`. |
| `claimed_by_user_id` | `uuid` | no | none | FK to `public.users(id)`. |
| `source_metadata` | `jsonb` | yes | `'{}'::jsonb` | Visualizer/import context; no provider secrets. |
| `created_at` | `timestamptz` | yes | `now()` | Creation timestamp. |
| `updated_at` | `timestamptz` | yes | `now()` | Updated by trigger in implementation. |

### Constraints

- Primary key: `id`.
- FK: `company_id -> public.companies(id)`.
- FK: `visualizer_session_id -> visualizer_sessions(id)`.
- FKs to `opportunities`, `customers`, `projects`, `estimates`, `contracts`, and `jobs` as listed above.
- FK: `floor_system_template_id -> floor_system_templates(id)`.
- FK: `primary_finish_product_id -> finish_products(id)`.
- FK: `claimed_by_user_id -> public.users(id)`.
- Check: `lifecycle_state in ('draft','proposed','selected','locked','superseded','amended','void','retracted','rejected')`.
- Check: `spec_completeness_status in ('incomplete','ready_for_proposal','complete','needs_review')`.
- Check: `service_family in (...)`.
- Check: `finish_family is null or finish_family in (...)`.
- Check: `area_type in (...)`.
- Check: `sort_order >= 0`.
- Check: `estimated_area_sqft is null or estimated_area_sqft >= 0`.
- Check: `estimated_linear_ft is null or estimated_linear_ft >= 0`.
- Planning check for future proposal validation: if `lifecycle_state in ('proposed','selected','locked')`, then `spec_completeness_status in ('ready_for_proposal','complete')`, `customer_facing_description is not null`, and `spec_completed_at is not null`.
- Same-company alignment: opportunity, customer, project, estimate, contract, job, template, and finish product links must all resolve to the same `company_id`.

### Recommended Indexes

- `(company_id, project_id, lifecycle_state) where project_id is not null`.
- `(company_id, opportunity_id) where opportunity_id is not null`.
- `(company_id, customer_id) where customer_id is not null`.
- `(company_id, estimate_id) where estimate_id is not null`.
- `(company_id, contract_id) where contract_id is not null`.
- `(company_id, job_id) where job_id is not null`.
- `(company_id, floor_system_template_id) where floor_system_template_id is not null`.
- `(company_id, primary_finish_product_id) where primary_finish_product_id is not null`.
- Partial unique primary project index: `(company_id, project_id) where is_primary = true and project_id is not null`.

### RLS Expectations

- Enable RLS.
- Tenant-owned rows require active company membership through existing company/member RLS helpers.
- No public/pre-auth rows are allowed in this table. Visualizer handoff must claim into this table through a server-only flow.
- Portal visibility should come from selected/snapshot/file visibility through scoped loaders, not direct table browsing.

### Immutable Fields

- `id`, `created_at`.
- `company_id` is immutable.
- `lifecycle_state = locked` means selected system/spec fields should not be edited in place; later changes use amendment/revision/change-order style workflow.

## Table: `estimate_system_snapshots`

Purpose: immutable proof of selected system/spec content included at a customer-facing estimate boundary.

### Columns

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | yes | `gen_random_uuid()` | Primary key. |
| `company_id` | `uuid` | yes | none | FK to `public.companies(id)`. |
| `estimate_id` | `uuid` | yes | none | FK to `estimates(id)`. |
| `selected_floor_system_id` | `uuid` | no | none | FK to `selected_floor_systems(id)`. Nullable for migration/import edge cases only. |
| `floor_system_template_id` | `uuid` | no | none | Source template reference metadata. |
| `status` | `text` | yes | `'active'` | `active`, `superseded`, `retracted`, `void`, `amended`. |
| `snapshot_trigger` | `text` | yes | none | `customer_facing_estimate`, `estimate_revision`, `option_proposed`, `manual_admin_correction`. |
| `snapshot_version` | `integer` | yes | `1` | Version within estimate/system context. |
| `system_name` | `text` | yes | none | Snapshotted selected system name. |
| `service_family` | `text` | yes | none | Snapshotted service family. |
| `finish_family` | `text` | no | none | Snapshotted finish family where applicable. |
| `manufacturer_name` | `text` | no | none | Snapshotted proof metadata. |
| `product_line` | `text` | no | none | Snapshotted proof metadata. |
| `product_code` | `text` | no | none | Snapshotted proof metadata. |
| `sku` | `text` | no | none | Snapshotted proof metadata. |
| `proof_file_summary` | `jsonb` | yes | `'{}'::jsonb` | Optional denormalized display cache only. Canonical file relationships are `files` + `file_links`. |
| `customer_facing_description` | `text` | no | none | Customer proof language. |
| `technical_notes` | `text` | no | none | Technical proof notes. |
| `area_label` | `text` | no | none | Snapshotted area/room label. |
| `area_type` | `text` | yes | `'whole_project'` | Snapshotted area type. |
| `phase_label` | `text` | no | none | Snapshotted phase label. |
| `option_label` | `text` | no | none | Snapshotted option/alternate label. |
| `estimated_area_sqft` | `numeric(12,2)` | no | none | Snapshotted planning quantity. |
| `estimated_linear_ft` | `numeric(12,2)` | no | none | Snapshotted planning quantity. |
| `component_snapshots` | `jsonb` | yes | `'[]'::jsonb` | Component/catalog item snapshot metadata. |
| `source_metadata` | `jsonb` | yes | `'{}'::jsonb` | Source selected/template/product ids and proof notes. |
| `created_by_user_id` | `uuid` | no | none | FK to `public.users(id)`. |
| `created_at` | `timestamptz` | yes | `now()` | Creation timestamp. |

### Constraints

- Primary key: `id`.
- FK: `company_id -> public.companies(id)`.
- FK: `estimate_id -> estimates(id)`.
- FK: `selected_floor_system_id -> selected_floor_systems(id)`.
- FK: `floor_system_template_id -> floor_system_templates(id)`.
- Check: `status in ('active','superseded','retracted','void','amended')`.
- Check: `snapshot_trigger in ('customer_facing_estimate','estimate_revision','option_proposed','manual_admin_correction')`.
- Check: `snapshot_version >= 1`.
- Check: `service_family in (...)`.
- Check: `finish_family is null or finish_family in (...)`.
- Check: `area_type in (...)`.
- Check: `jsonb_typeof(component_snapshots) = 'array'`.
- Check: `jsonb_typeof(proof_file_summary) = 'object'`.
- Unique: partial unique index on `(estimate_id, selected_floor_system_id) where status = 'active' and selected_floor_system_id is not null`.
- Same-company alignment: estimate, selected system, template source, and file links must resolve to the same `company_id`.

### Recommended Indexes

- `(company_id, estimate_id, status)`.
- `(company_id, selected_floor_system_id) where selected_floor_system_id is not null`.
- `(company_id, service_family, finish_family)`.
- GIN index on `component_snapshots` only if component-level search becomes necessary.

### RLS Expectations

- Enable RLS.
- Tenant users can read/write only through estimate permissions and active organization membership.
- Portal loaders may expose customer-visible snapshot fields only through estimate/portal access checks.
- Same-company alignment with estimate and selected system is mandatory.

### Immutable Fields

- Insert-only by default. All columns are immutable after insert except `status` when marking the row `superseded`, `retracted`, `void`, or `amended`, and only through restricted server write paths.
- If enforcement cannot be guaranteed at the application layer, add a database trigger that blocks normal UPDATE and DELETE on snapshot rows.
- No normal delete/soft-delete field. Retain binding/audit snapshots and mark status.

## Table: `contract_system_snapshots`

Purpose: immutable proof of selected system/spec content included at contract review/signature boundary.

### Columns

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | yes | `gen_random_uuid()` | Primary key. |
| `company_id` | `uuid` | yes | none | FK to `public.companies(id)`. |
| `contract_id` | `uuid` | yes | none | FK to `contracts(id)`. |
| `estimate_system_snapshot_id` | `uuid` | no | none | FK to `estimate_system_snapshots(id)` when copied from estimate truth. |
| `selected_floor_system_id` | `uuid` | no | none | FK to `selected_floor_systems(id)`. |
| `status` | `text` | yes | `'active'` | `active`, `superseded`, `retracted`, `void`, `amended`. |
| `snapshot_trigger` | `text` | yes | none | `contract_review`, `contract_sent`, `signature_started`, `contract_amendment`, `manual_admin_correction`. |
| `snapshot_version` | `integer` | yes | `1` | Version within contract/system context. |
| `system_name` | `text` | yes | none | Snapshotted selected system name. |
| `service_family` | `text` | yes | none | Snapshotted service family. |
| `finish_family` | `text` | no | none | Snapshotted finish family where applicable. |
| `manufacturer_name` | `text` | no | none | Snapshotted proof metadata. |
| `product_line` | `text` | no | none | Snapshotted proof metadata. |
| `product_code` | `text` | no | none | Snapshotted proof metadata. |
| `sku` | `text` | no | none | Snapshotted proof metadata. |
| `proof_file_summary` | `jsonb` | yes | `'{}'::jsonb` | Optional denormalized display cache only. Canonical file relationships are `files` + `file_links`. |
| `customer_facing_description` | `text` | no | none | Contract/customer proof language. |
| `technical_notes` | `text` | no | none | Technical proof notes. |
| `area_label` | `text` | no | none | Snapshotted area/room label. |
| `area_type` | `text` | yes | `'whole_project'` | Snapshotted area type. |
| `phase_label` | `text` | no | none | Snapshotted phase label. |
| `option_label` | `text` | no | none | Snapshotted option/alternate label. |
| `estimated_area_sqft` | `numeric(12,2)` | no | none | Snapshotted planning quantity. |
| `estimated_linear_ft` | `numeric(12,2)` | no | none | Snapshotted planning quantity. |
| `component_snapshots` | `jsonb` | yes | `'[]'::jsonb` | Component/catalog item snapshot metadata. |
| `source_metadata` | `jsonb` | yes | `'{}'::jsonb` | Source selected/template/product ids and proof notes. |
| `locked_at` | `timestamptz` | no | none | Set when sent/signature lock applies. |
| `created_by_user_id` | `uuid` | no | none | FK to `public.users(id)`. |
| `created_at` | `timestamptz` | yes | `now()` | Creation timestamp. |

### Constraints

- Primary key: `id`.
- FK: `company_id -> public.companies(id)`.
- FK: `contract_id -> contracts(id)`.
- FK: `estimate_system_snapshot_id -> estimate_system_snapshots(id)`.
- FK: `selected_floor_system_id -> selected_floor_systems(id)`.
- Check: `status in ('active','superseded','retracted','void','amended')`.
- Check: `snapshot_trigger in ('contract_review','contract_sent','signature_started','contract_amendment','manual_admin_correction')`.
- Check: `snapshot_version >= 1`.
- Check: `service_family in (...)`.
- Check: `finish_family is null or finish_family in (...)`.
- Check: `area_type in (...)`.
- Check: `jsonb_typeof(component_snapshots) = 'array'`.
- Check: `jsonb_typeof(proof_file_summary) = 'object'`.
- Unique: partial unique index on `(contract_id, selected_floor_system_id) where status = 'active' and selected_floor_system_id is not null`.
- Same-company alignment: contract, estimate snapshot, selected system, and file links must resolve to the same `company_id`.

### Recommended Indexes

- `(company_id, contract_id, status)`.
- `(company_id, estimate_system_snapshot_id) where estimate_system_snapshot_id is not null`.
- `(company_id, selected_floor_system_id) where selected_floor_system_id is not null`.
- `(company_id, service_family, finish_family)`.

### RLS Expectations

- Enable RLS.
- Tenant users can read/write only through contract permissions and active organization membership.
- Portal loaders expose customer-visible fields only through contract/portal access checks.
- Same-company alignment with contract, estimate snapshot, and selected system is mandatory.

### Immutable Fields

- Insert-only by default. All columns are immutable after insert except `status` when marking superseded/retracted/void/amended, and only through restricted server write paths.
- Once `locked_at` is set, this row is binding contract truth. Never edit in place.
- If enforcement cannot be guaranteed at the application layer, add a database trigger that blocks normal UPDATE and DELETE on snapshot rows.
- No normal delete/soft-delete field. Changes require contract amendment, estimate revision where still pre-contract, or change-order style workflow.

## Table: `files`

Purpose: one canonical file registry for product images, room photos, visualizer renders, spec sheets, signed documents, field photos, markups, closeout evidence, payment proof, and other shared evidence.

### Columns

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | yes | `gen_random_uuid()` | Primary key. |
| `company_id` | `uuid` | yes | none | FK to `public.companies(id)`. Tenant owner. |
| `storage_provider` | `text` | yes | `'supabase_storage'` | Storage backend identifier. |
| `storage_bucket` | `text` | yes | none | Supabase Storage bucket or equivalent. |
| `storage_key` | `text` | yes | none | Organization-scoped object key/path. |
| `original_filename` | `text` | yes | none | Uploaded filename. |
| `content_type` | `text` | no | none | MIME/content type. |
| `byte_size` | `bigint` | no | none | File size. |
| `checksum_sha256` | `text` | no | none | Optional content hash. |
| `file_category` | `text` | yes | `'other'` | Category describes what kind of file it is. |
| `status` | `text` | yes | `'uploaded'` | `uploaded`, `verified`, `archived`, `retained`, `void`. |
| `uploaded_by_user_id` | `uuid` | no | none | FK to `public.users(id)`. |
| `metadata` | `jsonb` | yes | `'{}'::jsonb` | File metadata without secrets. |
| `created_at` | `timestamptz` | yes | `now()` | Creation timestamp. |
| `updated_at` | `timestamptz` | yes | `now()` | Updated by trigger in implementation. |

### Constraints

- Primary key: `id`.
- FK: `company_id -> public.companies(id)`.
- FK: `uploaded_by_user_id -> public.users(id)`.
- Check: `file_category in (...)`.
- Check: `status in ('uploaded','verified','archived','retained','void')`.
- Check: `byte_size is null or byte_size >= 0`.
- Unique: `(company_id, storage_bucket, storage_key)`.

### Recommended Indexes

- `(company_id, file_category, status)`.
- `(company_id, created_at desc)`.
- `(company_id, checksum_sha256) where checksum_sha256 is not null`.

### RLS Expectations

- Enable RLS on the metadata table.
- Supabase Storage policies must separately enforce organization-scoped object access.
- Tenant users can read metadata only for files in their organization and role scope.
- Portal access should flow through `file_links.visibility` plus scoped loaders, not direct unrestricted file metadata access.

### Immutable Fields

- `id`, `company_id`, `storage_provider`, `storage_bucket`, `storage_key`, `checksum_sha256`, `created_at`.
- Use `status` to archive/void/retain; do not duplicate file rows for each module.

## Table: `file_links`

Purpose: multi-record links between canonical files and canonical business records. `files` stores the object; `file_links` stores the record-specific role, visibility, and subject link.

### Columns

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | yes | `gen_random_uuid()` | Primary key. |
| `company_id` | `uuid` | yes | none | FK to `public.companies(id)`. |
| `file_id` | `uuid` | yes | none | FK to `files(id)`. |
| `subject_type` | `text` | yes | none | Polymorphic canonical subject type. |
| `subject_id` | `uuid` | yes | none | ID of the canonical subject. |
| `file_role` | `text` | yes | none | Role describes why this file is linked here. |
| `visibility` | `text` | yes | `'internal'` | `internal`, `customer_visible`, `both`. |
| `link_status` | `text` | yes | `'active'` | `active`, `void`. |
| `linked_by_user_id` | `uuid` | no | none | FK to `public.users(id)`. |
| `linked_at` | `timestamptz` | yes | `now()` | Link timestamp. |
| `metadata` | `jsonb` | yes | `'{}'::jsonb` | Link-specific notes; no duplicate business truth. |

### Constraints

- Primary key: `id`.
- FK: `company_id -> public.companies(id)`.
- FK: `file_id -> files(id)`.
- Check: `subject_type in ('project','opportunity','customer','estimate','contract','job','invoice','payment','change_order','daily_log','field_note','selected_floor_system','finish_product','communication_message','estimate_system_snapshot','contract_system_snapshot')`.
- Check: `file_role in (...)`.
- Check: `visibility in ('internal','customer_visible','both')`.
- Check: `link_status in ('active','void')`.
- Unique: partial unique index on `(file_id, subject_type, subject_id, file_role) where link_status = 'active'`.
- Application/server validation: linked subject must belong to the same `company_id`. PostgreSQL will not enforce a cross-table FK for `subject_type`/`subject_id` in the first implementation.

### Recommended Indexes

- `(company_id, subject_type, subject_id, link_status)`.
- `(company_id, file_id)`.
- `(company_id, visibility)`.
- `(company_id, file_role)`.

### RLS Expectations

- Enable RLS.
- Tenant users can read links for their organization and according to record permissions.
- Portal users can read only links whose canonical subject is portal-visible and whose `visibility` is `customer_visible` or `both`.
- No portal-copy file/link tables.

### Immutable Fields

- `id`, `company_id`, `file_id`, `subject_type`, `subject_id`, `linked_at`.
- Use `link_status = void` for unlinking/correction; do not rewrite history for audit-critical evidence links.

## Table: `message_delivery_attempts`

Purpose: communication delivery proof for one canonical `communication_messages` row. This is not jobsite/material delivery tracking.

### Columns

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | yes | `gen_random_uuid()` | Primary key. |
| `company_id` | `uuid` | yes | none | FK to `public.companies(id)`. |
| `communication_message_id` | `uuid` | yes | none | FK to `communication_messages(id)`. Exactly one required. |
| `communication_thread_id` | `uuid` | no | none | FK to `communication_threads(id)` for query convenience. |
| `channel` | `text` | yes | none | Check against communication channel values. |
| `direction` | `text` | yes | none | `outbound` or `inbound`. |
| `recipient_type` | `text` | no | none | `customer`, `customer_contact`, `user`, `external_contact`, `manual`, `unknown`. |
| `recipient_contact_id` | `uuid` | no | none | FK to `public.customer_contacts(id)`. |
| `recipient_user_id` | `uuid` | no | none | FK to `public.users(id)`. |
| `recipient_email` | `text` | no | none | Delivery target where applicable. |
| `recipient_phone` | `text` | no | none | Delivery target where applicable. |
| `provider` | `text` | no | none | Email/SMS/app provider identifier. |
| `provider_message_id` | `text` | no | none | Provider message/delivery id. |
| `primary_subject_type` | `text` | no | none | Optional related canonical record type. |
| `primary_subject_id` | `uuid` | no | none | Optional related canonical record id. |
| `attempt_status` | `text` | yes | `'created'` | Latest known telemetry state, using delivery event values. |
| `attempted_at` | `timestamptz` | yes | `now()` | Attempt creation/send attempt timestamp. |
| `latest_event_at` | `timestamptz` | no | none | Latest provider/manual telemetry timestamp. |
| `error_code` | `text` | no | none | Normalized failure/diagnostic code. |
| `error_message` | `text` | no | none | Safe diagnostic summary. |
| `metadata` | `jsonb` | yes | `'{}'::jsonb` | Provider/manual metadata without secrets. |
| `created_at` | `timestamptz` | yes | `now()` | Creation timestamp. |

### Constraints

- Primary key: `id`.
- FK: `company_id -> public.companies(id)`.
- FK: `communication_message_id -> communication_messages(id)`.
- FK: `communication_thread_id -> communication_threads(id)`.
- FK: `recipient_contact_id -> public.customer_contacts(id)`.
- FK: `recipient_user_id -> public.users(id)`.
- Check: `channel in ('email','sms','portal','app_push','app_message','manual_log','provider_sync')`.
- Check: `direction in ('outbound','inbound')`.
- Check: `recipient_type is null or recipient_type in ('customer','customer_contact','user','external_contact','manual','unknown')`.
- Check: `attempt_status in ('created','queued','processed','sent','delivered','opened','clicked','deferred','bounced','blocked','dropped','failed','provider_sync')`.
- Check: `primary_subject_type is null or primary_subject_type in ('estimate','contract','invoice','change_order','payment','payment_request','portal_invite','portal_access_grant','project','opportunity','customer','communication_message')`.
- Check: if `direction = 'outbound'`, at least one recipient target is present: `recipient_contact_id`, `recipient_user_id`, `recipient_email`, or `recipient_phone`.
- Check: `primary_subject_type is null` iff `primary_subject_id is null`.
- Unique: partial unique index on `(company_id, provider, provider_message_id) where provider is not null and provider_message_id is not null`.
- Application/server validation: message, thread, recipient contact/user, and primary subject must belong to the same `company_id`. PostgreSQL will not enforce a cross-table FK for `primary_subject_type`/`primary_subject_id` in the first implementation.

### Recommended Indexes

- `(company_id, communication_message_id, attempted_at desc)`.
- `(company_id, communication_thread_id) where communication_thread_id is not null`.
- `(company_id, primary_subject_type, primary_subject_id) where primary_subject_type is not null`.
- `(company_id, attempt_status, latest_event_at desc)`.
- `(company_id, channel, direction)`.

### RLS Expectations

- Enable RLS.
- Tenant users can read attempts for canonical messages and records they are allowed to view.
- Provider/webhook writes should use server-side trusted paths, not public direct client writes.
- Portal users should see only scoped customer-visible delivery proof where product explicitly exposes it.

### Immutable Fields

- `id`, `company_id`, `communication_message_id`, `channel`, `direction`, `provider`, `provider_message_id`, `created_at`.
- `attempt_status` and `latest_event_at` may be maintained as summary fields from immutable events.
- Open/click telemetry must not change estimate, contract, invoice, payment, or legal/business state.

## Table: `message_delivery_events`

Purpose: immutable provider/manual telemetry events for a `message_delivery_attempts` row.

### Columns

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | yes | `gen_random_uuid()` | Primary key. |
| `company_id` | `uuid` | yes | none | FK to `public.companies(id)`. |
| `message_delivery_attempt_id` | `uuid` | yes | none | FK to `message_delivery_attempts(id)`. |
| `communication_message_id` | `uuid` | yes | none | FK to `communication_messages(id)` for query convenience. |
| `event_type` | `text` | yes | none | Check against delivery event values. |
| `event_at` | `timestamptz` | yes | `now()` | Provider/manual event timestamp. |
| `provider` | `text` | no | none | Provider identifier. |
| `provider_event_id` | `text` | no | none | Provider event/webhook id. |
| `provider_payload` | `jsonb` | yes | `'{}'::jsonb` | Sanitized telemetry payload only. |
| `normalized_reason` | `text` | no | none | Safe reason/diagnostic summary. |
| `primary_subject_type` | `text` | no | none | Optional denormalized subject type. |
| `primary_subject_id` | `uuid` | no | none | Optional denormalized subject id. |
| `created_at` | `timestamptz` | yes | `now()` | Insert timestamp. |

### Constraints

- Primary key: `id`.
- FK: `company_id -> public.companies(id)`.
- FK: `message_delivery_attempt_id -> message_delivery_attempts(id)`.
- FK: `communication_message_id -> communication_messages(id)`.
- Check: `event_type in ('created','queued','processed','sent','delivered','opened','clicked','deferred','bounced','blocked','dropped','failed','provider_sync')`.
- Check: `primary_subject_type is null or primary_subject_type in ('estimate','contract','invoice','change_order','payment','payment_request','portal_invite','portal_access_grant','project','opportunity','customer','communication_message')`.
- Check: `primary_subject_type is null` iff `primary_subject_id is null`.
- Unique: partial unique index on `(company_id, provider, provider_event_id) where provider is not null and provider_event_id is not null`.
- Application/server validation: attempt, message, and primary subject must belong to the same `company_id`. PostgreSQL will not enforce a cross-table FK for `primary_subject_type`/`primary_subject_id` in the first implementation.

### Recommended Indexes

- `(company_id, message_delivery_attempt_id, event_at desc)`.
- `(company_id, communication_message_id, event_at desc)`.
- `(company_id, event_type, event_at desc)`.
- `(company_id, primary_subject_type, primary_subject_id, event_at desc) where primary_subject_type is not null`.

### RLS Expectations

- Enable RLS.
- Tenant users can read delivery events only for canonical messages/records they can view.
- Provider writes use trusted server/webhook paths.
- Provider payloads must be sanitized to avoid leaking secrets or unnecessary PII.

### Immutable Fields

- All fields are immutable after insert.
- Corrections or late provider data create additional events, including `provider_sync`.
- Open/click events are useful signal only and never legal/business state transitions.

## Table: `activity_events`

Purpose: readable memory/index records over canonical actions. Activity events do not own business truth.

### Columns

| Column | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | yes | `gen_random_uuid()` | Primary key. |
| `company_id` | `uuid` | yes | none | FK to `public.companies(id)`. |
| `project_id` | `uuid` | no | none | Optional FK to `projects(id)` when known. |
| `customer_id` | `uuid` | no | none | Optional FK to `customers(id)` when known. |
| `source_subject_type` | `text` | yes | none | Canonical source record type. |
| `source_subject_id` | `uuid` | yes | none | Canonical source record id. |
| `secondary_subject_type` | `text` | no | none | Optional related record type. |
| `secondary_subject_id` | `uuid` | no | none | Optional related record id. |
| `event_category` | `text` | yes | none | `selected_system`, `estimate`, `contract`, `change_order`, `invoice`, `payment`, `communication`, `delivery`, `file`, `job`, `daily_log`, `closeout`. |
| `event_type` | `text` | yes | none | Specific high-signal event key within the category. |
| `headline` | `text` | yes | none | Short readable summary. |
| `summary` | `text` | no | none | Optional details. |
| `visibility` | `text` | yes | `'internal'` | `internal`, `customer_visible`, `both`. |
| `generated_from` | `text` | yes | none | Action/source name such as `estimate_sent_action` or `provider_webhook`. |
| `occurred_at` | `timestamptz` | yes | `now()` | When source action occurred. |
| `metadata` | `jsonb` | yes | `'{}'::jsonb` | Readable/index metadata; not business truth. |
| `created_at` | `timestamptz` | yes | `now()` | Insert timestamp. |

### Constraints

- Primary key: `id`.
- FK: `company_id -> public.companies(id)`.
- FK: `project_id -> projects(id)`.
- FK: `customer_id -> customers(id)`.
- Check: `visibility in ('internal','customer_visible','both')`.
- Check: `source_subject_type in ('selected_floor_system','estimate','estimate_system_snapshot','contract','contract_system_snapshot','change_order','invoice','payment','file','communication_message','message_delivery_attempt','message_delivery_event','job','daily_log','field_note')`.
- Check: `secondary_subject_type is null or secondary_subject_type in ('project','opportunity','customer','estimate','contract','job','invoice','payment','change_order','daily_log','field_note','selected_floor_system','finish_product','communication_message','file')`.
- Check: `secondary_subject_type is null` iff `secondary_subject_id is null`.
- Check: `event_category in ('selected_system','estimate','contract','change_order','invoice','payment','communication','delivery','file','job','daily_log','closeout')`.
- Check: `event_type <> ''`.
- Application/server validation: `event_type` must be a high-signal event for its category and source subject. This keeps the table extensible without a migration for every future activity type.
- Application/server validation: source and optional linked project/customer must belong to the same `company_id`. PostgreSQL will not enforce a cross-table FK for `source_subject_type`/`source_subject_id` in the first implementation.
- Optional unique/idempotency index: `(company_id, source_subject_type, source_subject_id, event_type, occurred_at)` when duplicate generation is a risk.

### Recommended Indexes

- `(company_id, project_id, occurred_at desc) where project_id is not null`.
- `(company_id, customer_id, occurred_at desc) where customer_id is not null`.
- `(company_id, source_subject_type, source_subject_id)`.
- `(company_id, event_category, event_type, occurred_at desc)`.
- `(company_id, visibility, occurred_at desc)`.

### RLS Expectations

- Enable RLS.
- Tenant users can read activity for records they are allowed to view.
- Portal users can read only activity where `visibility` is `customer_visible` or `both` and the linked canonical record is portal-visible.
- Activity writes should be generated by trusted server actions/jobs from canonical actions, not arbitrary client inserts.

### Immutable Fields

- All fields are immutable after insert.
- Corrections should update the canonical source record through approved workflows and optionally create a clarifying activity event.

## Snapshot Boundary Triggers

Estimate system snapshots are created when selected system/spec content reaches a customer-facing estimate boundary:
- selected system/spec is added to a customer-facing estimate
- estimate is sent to customer
- estimate is revised after customer-facing work begins
- alternate/option becomes proposed scope
- customer-facing approval flow needs stable proof context

Contract system snapshots are created when selected system/spec content reaches a contract review/signature boundary:
- contract is generated from an approved estimate
- selected system/spec enters contract review
- contract is sent
- signature activity begins
- amendment/change-order workflow needs preserved proof context

Lock rules:
- Estimate snapshots are immutable after creation.
- Contract snapshots become binding after send/signature lock and must never be edited in place.
- Later changes use estimate revision, contract amendment, or change-order style workflow.

Snapshot file proof:
- Snapshot rows do not store canonical `uuid[]` file references.
- Product images, room photos, visualizer renders, spec sheets, signed documents, and closeout evidence are linked through `files` + `file_links`.
- `proof_file_summary` on snapshot rows is an optional denormalized display cache only. It must be rebuildable from canonical file links and must never be treated as source of truth.
- If a migration later needs stricter snapshot-file proof, use dedicated file link rows or a normalized snapshot-file table rather than array FKs.

Snapshot immutability enforcement:
- Snapshot tables are insert-only for normal application behavior.
- The only allowed update is a restricted status transition to `superseded`, `retracted`, `void`, or `amended`, and only through approved server write paths.
- If application restrictions are not enough, add database triggers in the snapshot migration to block direct UPDATE/DELETE except for the approved status transition path.

## Activity Event Generation Rules

Generate high-signal activity only:
- selected system proposed, selected, superseded, amended, voided
- estimate sent, approved, rejected, revised
- contract sent, signed, declined, amended, voided
- change order sent, approved, rejected
- invoice sent, overdue, paid
- payment completed, failed, voided
- customer message received
- customer-facing delivery failed, bounced, blocked, or dropped
- customer-visible proof file linked
- job scheduled, started, completed
- daily log finalized
- closeout evidence added

Do not generate activity events for:
- every provider webhook
- routine opened/clicked telemetry
- internal draft edits
- low-level field changes
- catalog/template admin edits unless tied to active customer/project work
- background sync noise
- duplicate recalculations

Activity timeline is readable memory over canonical records. It is not legal, financial, communication, snapshot, file, or workflow truth.

Future extensibility:
- `event_category` is constrained to broad high-signal groups.
- `event_type` stays text so new high-signal event keys can be added without a migration for every timeline wording change.
- The activity generator service owns the allowlist of event keys and must reject noisy provider webhook, low-level draft edit, and background sync events.

## RLS And Security Planning

- Every table in this spec should have RLS enabled if created in an exposed schema such as `public`.
- Tenant-owned rows filter by `company_id` and active company membership using the existing company/member RLS helpers.
- Public/pre-auth visualizer selection is isolated in `visualizer_sessions`; tenant-owned tables do not allow nullable `company_id` for public sessions.
- Same-company foreign keys should use composite constraints where existing tables already support `(company_id, id)` uniqueness. Where polymorphic links are used, application/server validation owns integrity.
- Polymorphic links (`file_links.subject_type/subject_id`, `message_delivery_attempts.primary_subject_*`, `message_delivery_events.primary_subject_*`, and `activity_events.source_subject_*`) use server-side validation only for the first implementation. PostgreSQL will not enforce cross-table FKs for these pairs.
- Provider/webhook insert paths for delivery events must be trusted server-side paths.
- Portal visibility should be enforced through portal-scoped loaders and RLS policies over shared records, not by copying rows into portal-specific tables.
- No cross-tenant data access.

## Locked Migration Slices

This section records implementation sequencing. The first slice is now implemented; later slices remain planned.

### First Migration Slice

Implemented by `supabase/migrations/20260505120000_system_layers_first_slice.sql`:
1. `finish_products`
2. `floor_system_templates`
3. `floor_system_template_components`

Final first-slice choices:
- all three tables are tenant-owned through required `company_id`
- no public/pre-auth handoff is involved
- no polymorphic links are involved
- `catalog_items` remains the required cost/reusable item source for template components
- `finish_products` remains metadata/proof only
- `created_by` and `updated_by` reference `public.users(id)` to match current DB conventions
- generated lookup fields are `finish_products.normalized_product_name` and `floor_system_templates.normalized_name`
- `floor_system_template_components.finish_product_id` is optional and uses column-scoped `on delete set null (finish_product_id)`
- update triggers call `public.set_updated_at()` without a `WHEN` clause because first-slice tables include generated lookup columns, and PostgreSQL does not allow whole-row `OLD`/`NEW` trigger `WHEN` comparisons on tables with generated columns

### Second Migration Slice

Build only after the first slice is applied and claim/attach server paths are ready:
1. `visualizer_sessions`
2. `selected_floor_systems`

Rules for this slice:
- `visualizer_sessions` handles pre-auth/public handoff
- `selected_floor_systems.company_id` is required
- no fake opportunity/customer/project rows are created just to preserve selection context
- only one selected floor system per project can be primary

### Later Migration Slices

Defer until each workflow has an approved implementation plan:
- `estimate_system_snapshots`
- `contract_system_snapshots`
- `files`
- `file_links`
- message delivery proof: `message_delivery_attempts`, `message_delivery_events`
- `activity_events`

## Unresolved Schema Decisions Before Migrations

- Whether payment requests and portal invites should map to existing canonical `payments`, `invoices`, `portal_access_grants`, or future dedicated records.
- Whether snapshot component metadata should stay JSONB or become a normalized snapshot component table.
- Supabase Storage bucket names, company path convention, and storage RLS policy shape.
- Whether `communication_threads` and `communication_messages` need new columns or only relationships from delivery attempts/events.
- Legal retention policy for audit-critical snapshots, delivery events, provider payloads, and activity memory.
- Whether platform starter product/template metadata is copied into tenant rows, referenced as platform defaults, or handled through a separate adoption model.

## Related Documentation

- [Data Model Specification: System Layers](./spec-data-model-system-layers.md)
- [Current State](./current-state.md)
- [Developer Source Of Truth](./developer-source-of-truth.md)
- [Workflows](./workflows.md)
- [Roadmap](./Roadmap.md)
- [Sales To Production](./sales-to-production.md)
- [Target IA](./target-ia.md)
