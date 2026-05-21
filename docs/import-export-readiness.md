# Import / Export Readiness

Status: Export-first foundation with audit trail, validation-only customer/contact import dry run, and read-only import batch review shell implemented
Doc Type: Implementation Plan / Current Boundary

This document defines FloorConnector's export-first import/export readiness foundation. The current implementation starts with tenant-scoped exports for canonical records, a small export-history audit trail, a validation-only customer/contact import dry run, and a tenant-scoped import batch review shell. It does not add import mutation.

Use with:

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)
- [docs/e2e-browser-qa.md](C:/FloorConnector/docs/e2e-browser-qa.md)

## Product Rule

Exports are read-only views over canonical tenant-owned records. They are not a source of truth, not detached snapshots, not a backup system, and not a parallel data model.

The canonical lifecycle remains:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Exports must preserve tenant boundaries, relationship keys, stored commercial values, and sensitive-field exclusions.

## Implemented Export Architecture

- Route: `/settings/export`
- Download route: `/settings/export/[module]?format=csv|json`
- Access: authenticated contractor organization owner/admin only
- Tenant scope: active organization from membership context plus explicit `company_id` filters
- Formats: CSV for tabular export; JSON manifest for metadata, field definitions, relationships, and rows
- Files: one module per download; no zip/background job yet
- Schema version: `2026-05-15.export.v1`
- No import write path, no background mutation, no stored import file, and no stored export file archive
- Export history: `data_export_events` records metadata about export attempts after the migration is applied

## Implemented Export History

`/settings/export` includes a recent export history panel for organization owners/admins. Export attempts write tenant-scoped `data_export_events` rows with metadata only:

- `company_id`
- `requested_by`
- `module_key`
- `format`
- `status`
- `record_count`
- `schema_version`
- `filename`
- safe `error_summary` for failed attempts
- safe request context such as `source = settings_export`
- `created_at`

Export history never stores exported rows, generated file contents, raw SQL, request cookies, auth headers, credentials, invite links, token material, provider payloads, card/bank details, or webhook secrets.

The table is tenant-scoped with forced RLS. Owner/admin members can read and insert rows for their active organization. Portal customers do not have access. The page shows a pending-migration notice instead of crashing if the active QA database has not applied the audit-table migration yet; that notice is a rollout guard, not an alternate storage path.

Closeout verification on May 15, 2026 confirmed the linked QA database has migration `20260515204452_data_export_events` applied, `public.data_export_events` exists with RLS enabled and forced, and the contractor owner/admin app path records visible success history rows after CSV/JSON exports.

## Implemented Export Modules

- customers
- customer_contacts
- projects
- estimates
- estimate_line_items
- invoices
- invoice_line_items
- payments
- jobs
- job_assignments

## Sensitive Exclusions

Never export:

- Supabase Auth sessions, password hashes, invite tokens, invite token hashes, raw invite links, temporary passwords, or service-role keys
- Stripe keys, webhook secrets, Checkout URLs, Customer Portal URLs, raw webhook payloads, raw provider payloads, or payment method secrets
- card numbers, bank account details, gateway payment intent references, gateway checkout session references, or raw payment payloads
- internal estimate/invoice cost fields, hidden markup fields, markup percentages, or provider-only reconciliation payloads in this first export foundation
- portal access token material or authentication state

Payment exports include canonical payment rows only: id, invoice relationship, amount, date, high-level method/source, recorded-via, safe reference, status, and timestamps.

## Field Maps

### Customers

| Export field | Source | Meaning | Include | Reason | PII/security notes | Relationship key | Format |
| --- | --- | --- | --- | --- | --- | --- | --- |
| customer_id | `customers.id` | Stable customer id | Yes | Relationship anchor | Identifier only | Yes | CSV/JSON |
| customer_name | `customers.name` | Customer account label | Yes | Contractor-readable export | PII/business identity | No | CSV/JSON |
| company_name | `customers.company_name` | Business name | Yes | Account context | PII/business identity | No | CSV/JSON |
| email, phone | `customers.email`, `customers.phone` | Account contact fallback | Yes | Data portability | PII | No | CSV/JSON |
| address fields | `customers.address_*` | Customer address | Yes | Data portability | Location/PII | No | CSV/JSON |
| tax fields | `customers.is_tax_exempt`, exemption fields | Stored tax state | Yes | Accounting continuity | Commercial data | No | CSV/JSON |
| notes | `customers.notes` | Freeform notes | No | Needs review/redaction policy | May contain sensitive text | No | Deferred |

### Contacts / Customer Contacts

| Export field | Source | Meaning | Include | Reason | PII/security notes | Relationship key | Format |
| --- | --- | --- | --- | --- | --- | --- | --- |
| customer_contact_id | `customer_contacts.id` | Relationship id | Yes | Stable relationship anchor | Identifier only | Yes | CSV/JSON |
| customer_id, contact_id | `customer_contacts.customer_id`, `contacts.id` | Linked records | Yes | Relationship reconstruction | Identifier only | Yes | CSV/JSON |
| customer_name | `customers.name` | Linked customer label | Yes | Contractor-readable context | PII/business identity | No | CSV/JSON |
| display_name, company_name, email, phone | `contacts.*` | Contact identity | Yes | Data portability | PII | No | CSV/JSON |
| relationship_label, is_primary | `customer_contacts.*` | Contact role under customer | Yes | Contact model preservation | Operational metadata | No | CSV/JSON |
| invite tokens / token hashes | `portal_access_grants.*` | Auth material | No | Security boundary | Secret/token material | No | Never |

### Projects

| Export field | Source | Meaning | Include | Reason | PII/security notes | Relationship key | Format |
| --- | --- | --- | --- | --- | --- | --- | --- |
| project_id | `projects.id` | Stable project id | Yes | Relationship anchor | Identifier only | Yes | CSV/JSON |
| project_name | `projects.name` | Project label | Yes | Contractor-readable export | May include customer/location | No | CSV/JSON |
| customer_id, customer_name | `projects.customer_id`, `customers.name` | Customer relationship | Yes | Lifecycle continuity | Identifier plus PII/business identity | Yes | CSV/JSON |
| status/readiness fields | `projects.status`, readiness fields | Project state | Yes | Operational continuity | Operational metadata | No | CSV/JSON |
| address fields | `projects.address_*` | Job/project location | Yes | Portability | Location/PII | No | CSV/JSON |
| description/notes | `projects.description` | Freeform project context | No | Needs redaction policy before broad export | May contain sensitive text | No | Deferred |

### Estimates And Estimate Line Items

| Export field | Source | Meaning | Include | Reason | PII/security notes | Relationship key | Format |
| --- | --- | --- | --- | --- | --- | --- | --- |
| estimate_id, reference_number | `estimates.id`, `reference_number` | Stable and human-readable estimate ids | Yes | Commercial continuity | Identifier/commercial metadata | Yes | CSV/JSON |
| customer/project ids and names | `estimates.*`, related records | Relationships | Yes | Lifecycle continuity | PII/business labels | Yes | CSV/JSON |
| status/dates | `estimates.status`, date fields | Estimate workflow state | Yes | Workflow continuity | Commercial metadata | No | CSV/JSON |
| stored totals | `subtotal_amount`, `tax_amount`, `discount_amount`, `total_amount` | Stored commercial values | Yes | Avoid recalculation drift | Commercial amounts | No | CSV/JSON |
| line item commercial fields | `estimate_line_items` customer-facing fields | Scope and price rows | Yes | Proposal portability | Commercial data | Yes where ids | CSV/JSON |
| internal cost/markup fields | `base_unit_cost`, `markup_percent`, hidden markup fields | Internal pricing mechanics | No | First export avoids exposing internal pricing strategy by default | Sensitive business data | No | Deferred |
| content JSON / workspace body | `estimates.content` | Rich proposal body | No | Needs richer document/export strategy | May contain unreviewed freeform text | No | Deferred |

### Contracts And Change Orders

| Export field | Source | Meaning | Include | Reason | PII/security notes | Relationship key | Format |
| --- | --- | --- | --- | --- | --- | --- | --- |
| contract summary | `contracts` | Contract id/status/relationships | Not in first UI | Contract export needs signature-state and document-body policy | Legal/commercial data | Yes | Planned |
| signature events | `contract_signers`, signature events | Signature state | No | Must not expose signature/audit details casually | Legal/PII | Yes | Planned with review |
| change-order summary | `change_orders` | Change-order ids/status/totals | Not in first UI | Current change-order depth is shallower | Commercial data | Yes | Planned |

### Invoices And Invoice Line Items

| Export field | Source | Meaning | Include | Reason | PII/security notes | Relationship key | Format |
| --- | --- | --- | --- | --- | --- | --- | --- |
| invoice_id, reference_number | `invoices.id`, `reference_number` | Stable and human-readable invoice ids | Yes | Billing continuity | Identifier/commercial metadata | Yes | CSV/JSON |
| customer/project/estimate/job ids | `invoices.*` | Lifecycle relationships | Yes | Lineage continuity | Identifier plus business labels | Yes | CSV/JSON |
| workflow role/status/dates | `invoices.*` | Invoice state | Yes | Billing continuity | Commercial metadata | No | CSV/JSON |
| stored totals/balance | `invoices.*_amount` | Stored invoice values | Yes | Avoid recalculation drift | Commercial amounts | No | CSV/JSON |
| invoice line commercial fields | `invoice_line_items` customer-facing fields | Billed scope rows | Yes | Billing portability | Commercial data | Yes where ids | CSV/JSON |
| internal cost/markup fields | `invoice_line_items` cost/markup fields | Internal pricing mechanics | No | First export avoids exposing internal pricing strategy by default | Sensitive business data | No | Deferred |

### Payments

| Export field | Source | Meaning | Include | Reason | PII/security notes | Relationship key | Format |
| --- | --- | --- | --- | --- | --- | --- | --- |
| payment_id, invoice_id | `payments.id`, `invoice_id` | Stable ids | Yes | Payment lineage | Identifier only | Yes | CSV/JSON |
| invoice_reference/customer/project names | related invoice/customer/project | Human-readable relationship context | Yes | Contractor-readable export | PII/business labels | No | CSV/JSON |
| amount/date/method/source/status | `payments.*` | Payment state | Yes | Collection continuity | Commercial data; no card/bank details | No | CSV/JSON |
| safe reference | `payments.reference` | Contractor-entered reference | Yes | Reconciliation context | Review before external sharing | No | CSV/JSON |
| gateway/provider refs and payloads | `payments.gateway_*`, `payment_events.payload` | Provider evidence | No | Avoid raw provider/payment exposure | Sensitive provider/payment data | No | Never in contractor export |

### Jobs And Job Assignments

| Export field | Source | Meaning | Include | Reason | PII/security notes | Relationship key | Format |
| --- | --- | --- | --- | --- | --- | --- | --- |
| job_id | `jobs.id` | Stable job id | Yes | Operational relationship anchor | Identifier only | Yes | CSV/JSON |
| customer/project/estimate ids and labels | `jobs.*`, related records | Job relationships | Yes | Lifecycle continuity | PII/business labels | Yes | CSV/JSON |
| dispatch/schedule fields | `jobs.*` | Schedule and job state | Yes | Operational portability | Operational metadata | No | CSV/JSON |
| assignment ids/person/vendor ids/names | `job_assignments`, related people/vendors | Crew assignment context | Yes | Scheduling continuity | Workforce/vendor PII/business data | Yes | CSV/JSON |
| schedule notes/job notes | `jobs.schedule_notes`, `jobs.notes` | Freeform job text | No | Needs redaction policy | May contain sensitive text | No | Deferred |

### Daily Logs / Field Notes / People / Portal Access / Billing

| Area | Include now | Reason |
| --- | --- | --- |
| daily logs / field notes | No | Implemented enough for future export, but freeform field text and attachments need a field-level redaction plan. |
| people/workforce | Job assignment names only | Broad people export needs workforce/PII scope review. |
| portal access metadata | Field map only | Future export may include active/revoked grant ids and project access ids, but never tokens/hashes/raw invite links. |
| billing/subscription data | No contractor export by default | SaaS billing is platform/operator data and stays separate from contractor-customer payment exports. |

## Implemented Import Dry Run, No Mutation

`/settings/export` includes a customer/contact CSV dry-run panel for organization owners/admins. The dry run:

- accepts CSV upload in the request only
- parses headers and suggests FloorConnector target fields
- validates required account fields
- normalizes email casing and trims values for preview
- lightly checks phone completeness
- compares rows against existing tenant-scoped customers and customer contacts
- reports row-level errors, warnings, and duplicate signals
- returns summary counts for total rows, valid rows, warning rows, error rows, and likely/possible duplicate candidates

The uploaded file is not stored. The dry run does not create, update, merge, delete, or stage records. It does not write to `customers`, `contacts`, `customer_contacts`, portal access tables, import tables, storage buckets, background jobs, or audit tables.

### Customer / Contact Import Field Map

| Import field | Target | Required | Meaning | Include now | Notes |
| --- | --- | --- | --- | --- | --- |
| customer_name | customer | One of customer name or customer company | Canonical customer account label | Yes | Required unless customer company is provided. |
| customer_company_name | customer | One of customer name or customer company | Optional company/business name | Yes | Can satisfy the account-name requirement for business lists. |
| primary_contact_name | contact | No | Contact display name for relationship preview | Yes | Warning if no contact name, email, or phone exists. |
| email | contact/customer fallback | No | Contact or account email candidate | Yes | Lowercased and validated when present. |
| phone | contact/customer fallback | No | Contact or account phone candidate | Yes | Light completeness warning only; no country-specific formatting mutation. |
| address_line_1, address_line_2, city, state_region, postal_code, country_code | customer | No | Customer address fields | Yes | Parsed for preview only; no record writes. |
| relationship_label | customer_contact | No | Future customer-contact relationship label | Yes | Preview only. |
| is_primary | customer_contact | No | Future primary-contact intent | Yes | Preview only. |

Excluded from import dry run: portal access, auth users, passwords, invite tokens, token hashes, payment data, invoices, estimates, jobs, internal IDs as write targets, files, attachments, communications, Stripe data, and raw provider payloads.

Duplicate detection is tenant-scoped and read-only:

- customer exact name/company match => possible duplicate
- contact email or phone match => existing contact
- customer plus contact match => likely duplicate
- customer-contact relationship match => existing relationship
- missing customer account field or invalid email => row error

Duplicate signals are advisory. They do not merge, upsert, reserve, or queue records.

## Future Import Readiness, No Mutation

Expected future import sources:

- Contractor Foreman CSV exports
- QuickBooks customer lists
- generic customer/project CSV files
- estimate line item templates

Future write-import work must remain validation-first:

- reuse dry-run parsing and mapping before writes
- show duplicate candidates by email, phone, customer name, project name, and external reference
- require operator/admin confirmation
- write through canonical server-side actions only after explicit approval
- create an audit trail and rollback/undo plan before any mutation
- require backups, row-level write preview, duplicate-resolution choices, and a preview-to-import handoff

No import mutation is implemented in this phase.

## Future Customer / Contact Import Write-Safety Plan

Import writes must not be added directly to the existing dry-run action. A future write phase should introduce a separate approval workflow and a tenant-scoped import audit model before any canonical record mutation is enabled.

### Architecture Decision

Preferred future architecture:

- Create a tenant-scoped import batch after a successful dry run only when an owner/admin explicitly chooses to prepare an import for approval.
- Store normalized preview rows, mapping choices, validation results, duplicate signals, and row decisions.
- Do not store raw uploaded source files by default.
- Do not store raw CSV text unless a later legal/support requirement explicitly approves it with retention, redaction, and access controls.
- Store only safe normalized row values needed to review and execute the import.
- Expire or archive unapproved batches after a short retention window, such as 7-30 days, with the exact duration decided before implementation.
- Require authenticated contractor organization owner/admin scope for batch creation, row decision changes, approval, execution, report viewing, and rollback review.
- Tenant scope must come from active organization membership plus `company_id` on every batch, row, and result.
- Future writes must use canonical server-side customer/contact/link logic or a tightly scoped transactional service around those same canonical models.
- Never auto-create portal access, auth users, portal grants, project access, invoices, payments, estimates, jobs, opportunities, or communications from the first customer/contact import phase.

Future implementation should treat the dry-run result as evidence, not authority. The final import action must revalidate the batch, tenant, row decisions, and current duplicate state immediately before writing because canonical data may have changed since upload.

### Implemented Import Batch Model

Migrations `20260515220057_data_import_batches.sql` and `20260515221606_data_import_batch_grant_hardening.sql` add dedicated tenant-scoped import review tables rather than extending `data_export_events`, then revoke broad default table grants so only the intended authenticated owner/admin RLS path remains exposed.

Implemented tables:

- `data_import_batches`
- `data_import_rows`

Implemented `data_import_batches` fields:

- `id`
- `company_id`
- `requested_by`
- `import_type = customer_contacts`
- `source_filename`
- `status = dry_run | review_ready | approved_pending_write | completed | failed | canceled | rolled_back`
- `total_rows`
- `valid_rows`
- `warning_rows`
- `error_rows`
- `duplicate_rows`
- `mapping_version`
- `schema_version`
- `safe_summary jsonb`
- `approved_at`
- `approved_by`
- `completed_at`
- `created_at`
- `updated_at`

Implemented `data_import_rows` fields:

- `id`
- `company_id`
- `batch_id`
- `row_number`
- `normalized_preview jsonb`
- `validation_status = valid | warning | error | duplicate | needs_review`
- `proposed_decision = create_customer | create_contact | link_contact | skip | needs_review | invalid`
- `user_decision`
- `duplicate_candidates jsonb`
- `errors jsonb`
- `warnings jsonb`
- `created_record_refs jsonb`, constrained to `null` in this phase
- `created_at`

Current review behavior:

- `/settings/export` can save a successful customer/contact dry run as a review batch.
- The save action reuses authenticated owner/admin tenant scope and stores normalized preview rows, validation status, proposed decisions, duplicate summaries, counts, filename metadata, mapping version, and schema version.
- `/settings/export` lists recent import review batches separately from export history.
- `/settings/export/imports/[batchId]` shows a read-only review shell with batch summary, row preview, duplicate/warning/error notes, and a disabled future approval control.
- No enabled final import action exists.
- No canonical customer/contact records are created, updated, merged, linked, or deleted.
- No portal access, auth users, invoices, payments, jobs, projects, estimates, contracts, or background jobs are created.

Sensitive exclusions for future import audit tables:

- no raw uploaded file bytes
- no raw CSV payload dumps
- no auth/session data
- no passwords, temporary passwords, invite tokens, token hashes, raw invite links, service-role keys, or provider secrets
- no Stripe keys, webhook secrets, Checkout URLs, Customer Portal URLs, raw provider payloads, payment method details, card/bank details, invoice payment payloads, or webhook signatures
- no portal access token material

RLS expectations:

- forced RLS on all tenant-owned import tables
- owner/admin select for active organization
- owner/admin insert/update only through narrowly scoped app paths or RPCs
- no anon access
- no portal customer access
- no platform-wide export/import behavior from the tenant import tables unless separately approved for super-admin support review

### Duplicate-Resolution States

| State | Required data | User-facing explanation | First write phase | Audit requirement | Rollback implication |
| --- | --- | --- | --- | --- | --- |
| create_new_customer | Valid customer name or company, no blocking duplicate decision | Create a new customer account and optional primary contact from this row. | Allowed | Store normalized values, decision, created ids, requester/approver. | Delete only records created by this batch if they have not been edited or used downstream. |
| create_new_contact_under_existing_customer | Existing tenant customer id, valid contact name/email/phone signal | Add a new contact under an existing customer account. | Allowed | Store matched customer id, normalized contact values, created contact/link ids. | Delete created contact/link only if untouched and not used by portal/signature/project access. |
| link_existing_contact_to_customer | Existing tenant customer id and existing tenant contact id | Link an existing contact to this customer without changing contact details. | Allowed with review | Store matched ids and link id; no contact field overwrite. | Remove only the link created by the import if untouched and not used by portal access/signature state. |
| update_existing_customer | Existing tenant customer id plus approved field differences | Update an existing customer account. | Deferred | Requires before/after diff, field-level approval, and conflict checks. | No automatic destructive rollback after user edits; support review required. |
| update_existing_contact | Existing tenant contact id plus approved field differences | Update an existing contact identity. | Deferred | Requires before/after diff, field-level approval, and conflict checks. | No automatic destructive rollback after user edits; support review required. |
| skip_row | Any row | Do not import this row. | Allowed | Store skip decision and optional reason. | No rollback action. |
| needs_review | Duplicate, incomplete, or ambiguous row | Human review required before this row can be imported. | Allowed as non-write decision | Store reason and blocking status. | No rollback action unless later approved and written. |
| invalid_row | Missing required account field, invalid email, malformed row | This row cannot be imported until fixed. | Blocked | Store validation errors. | No rollback action. |
| possible_duplicate | Customer name/company match only | Possible duplicate customer; choose create, link, or skip after review. | Review required | Store duplicate signal and matched customer id(s). | Depends on final decision. |
| likely_duplicate | Customer plus contact match, or strong email/phone match | Likely duplicate; default should be skip or link, not create. | Review required | Store duplicate signal and matched ids. | Depends on final decision; avoid duplicate creates. |

First write phase should allow create-only and link-only decisions. Update/merge behavior should be a later phase because it creates higher rollback and data-governance risk.

### Approval Workflow

Future UI workflow:

1. Owner/admin uploads CSV and runs dry run.
2. Mapping preview shows detected headers and target fields.
3. Validation summary shows valid, warning, invalid, possible duplicate, likely duplicate, and existing contact counts.
4. Duplicate review groups rows by decision risk.
5. Owner/admin chooses a row decision for each valid or warning row.
6. Invalid rows remain blocked.
7. Approval summary shows exactly how many customers, contacts, and links would be created.
8. Confirmation requires explicit phrase-style acknowledgement, such as `CREATE CUSTOMER CONTACT RECORDS`, plus an optional reason/import note.
9. Final action writes only approved rows and revalidates current duplicate state before mutation.
10. Post-import report shows created ids, skipped rows, failures, and rollback eligibility.

Required safety copy for the future approval screen:

- Import will not create portal access.
- Import will not send emails.
- Import will not create auth users or passwords.
- Import will not create invoices, payments, estimates, jobs, contracts, change orders, opportunities, or projects.
- First write phase may create customers, contacts, and customer-contact links only.
- Rows marked skipped, invalid, or needs review will not be written.

Do not add a disabled `Import now` button to the current dry-run UI. It can make the safe dry-run look broken instead of intentionally no-write.

### Rollback And Backup Plan

Before the first write-import phase:

- Recommend exporting customers and customer contacts immediately before import.
- Record the pre-import export event ids when available.
- Create an import batch id before any write.
- Record every canonical record created by the import batch.
- Support created-only rollback for the first write phase.
- Block automatic rollback if an imported customer/contact/link has been edited after import, used in portal access, used as a signer/reviewer, attached to project visibility, or referenced by downstream workflow state.
- Require support/operator review for any rollback that would affect user-edited or downstream-used records.
- Never rollback by deleting unrelated existing records that were merely matched or linked for review.

Rollback procedure should be:

1. Open import batch report.
2. Review created records and downstream usage.
3. Export affected customers/contacts again if needed.
4. Mark batch `rollback_review`.
5. Roll back only eligible created records in reverse dependency order: customer-contact links, contacts, customers.
6. Record rollback result and ineligible rows.
7. Leave an audit timeline for completed, failed, partial, or canceled rollback.

### Import Audit Trail Plan

`data_export_events` should remain export-specific. Future import audit should use dedicated import tables because import has batch lifecycle, row decisions, created ids, approval, and rollback state.

Audit must record:

- import batch metadata
- requester and approver
- tenant/company id
- uploaded filename only, not raw file contents
- row count
- mapping version
- status transitions
- created customer/contact/link counts
- skipped/invalid/duplicate counts
- safe error summaries
- row-level normalized values and decisions only where necessary for approval and rollback
- created canonical record ids
- rollback status and ineligible rollback reasons

Audit must not store secrets, token material, raw uploaded files, raw provider payloads, payment details, auth sessions, portal invite links, password values, or service-role data.

### Next Build Boundary

The next implementation slice should still avoid writes unless explicitly approved. The safest next build is row-decision review and approval-readiness behavior on saved batches, still without execution, followed by a separate explicitly approved create/link-only import execution phase with rollback and audit proof.

## QA Expectations

- Pure helper tests cover CSV escaping, JSON manifest metadata, sensitive field exclusions, filename building, CSV dry-run parsing, mapping suggestions, malformed CSV handling, invalid email/required field reporting, duplicate detection, report-cell formula safety, import batch migration guardrails, and no canonical mutation imports in the batch helper.
- Protected E2E should verify owner/admin access to `/settings/export`, a CSV response, export history visibility, the validation-only import dry-run section, saving a read-only import review batch, opening the batch review page, and no customer row count change after saving the batch.
- Unauthenticated users should redirect to login.
- Portal customers must not be able to open contractor Data Export, import dry-run UI, or import batch review routes.
- Exports must not print private customer data, credentials, tokens, or payment details in test logs or final responses.
