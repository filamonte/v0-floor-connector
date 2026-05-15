# Import / Export Readiness

Status: Export-first foundation with audit trail implemented
Doc Type: Implementation Plan / Current Boundary

This document defines FloorConnector's export-first import/export readiness foundation. The current implementation starts with tenant-scoped exports for canonical records, a small export-history audit trail, and an import-readiness plan. It does not add broad import mutation.

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
- No import upload, no import write path, no background mutation, and no stored export file archive
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

## Import Readiness, No Mutation

Expected future import sources:

- Contractor Foreman CSV exports
- QuickBooks customer lists
- generic customer/project CSV files
- estimate line item templates

Future import must be validation-first:

- upload file to a temporary validation path only
- detect columns and map to FloorConnector field definitions
- dry-run row parsing without writes
- show duplicate candidates by email, phone, customer name, project name, and external reference
- require operator/admin confirmation
- write through canonical server-side actions only after explicit approval
- create an audit trail and rollback/undo plan before any mutation

No import mutation is implemented in this phase.

## QA Expectations

- Pure helper tests cover CSV escaping, JSON manifest metadata, sensitive field exclusions, and filename building.
- Protected E2E should verify owner/admin access to `/settings/export` and a CSV response.
- Unauthenticated users should redirect to login.
- Portal customers must not be able to open contractor Data Export.
- Exports must not print private customer data, credentials, tokens, or payment details in test logs or final responses.
