# FloorConnector Performance Index Review

Status: Active
Doc Type: Audit
Date: 2026-05-18

## Purpose

This report reviews the recent dashboard, schedule, Manager Page, and global-search read-model work against the current Supabase migration/index inventory. It is an evidence artifact, not a migration authorization.

No application behavior, schema, RLS policy, readiness rule, payment/signature flow, or lifecycle behavior was changed by this review.

## Source Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/chat-handoff.md`
- `docs/performance-audit.md`
- `docs/ai-guided-system-plan.md`

## Routes Reviewed

- `/dashboard`
- `/schedule`
- `/projects`
- `/estimates`
- `/invoices`
- `/jobs`
- `/customers`
- `/contracts`
- `/payments`
- `/change-orders`
- `/people`
- `/vendors`
- Shell global search through `/api/global-search`

## Read Models Reviewed

- `apps/web/lib/dashboard/operational-cockpit-read-model.ts`
- `apps/web/lib/dashboard/project-cue-input-read-model.ts`
- `apps/web/lib/dashboard/progress-billing-summary-read-model.ts`
- `apps/web/lib/global-search/data.ts`
- `apps/web/lib/projects/manager-read-model.ts`
- `apps/web/lib/estimates/manager-read-model.ts`
- `apps/web/lib/invoices/manager-read-model.ts`
- `apps/web/lib/jobs/manager-read-model.ts`
- `apps/web/lib/customers/manager-read-model.ts`
- `apps/web/lib/contracts/manager-read-model.ts`
- `apps/web/lib/payments/manager-read-model.ts`
- `apps/web/lib/change-orders/manager-read-model.ts`
- `apps/web/lib/people/manager-read-model.ts`
- `apps/web/lib/vendors/manager-read-model.ts`
- Schedule-specific loaders exposed through `apps/web/lib/jobs/data.ts`, `apps/web/lib/appointments/data.ts`, `apps/web/lib/opportunities/data.ts`, `apps/web/lib/people/data.ts`, and `apps/web/lib/vendors/data.ts`

## Common Query Patterns

The new read models mostly share these shapes:

- Tenant scope first: `eq("company_id", organizationId)`.
- Status counts: `select("id", { count: "exact", head: true })` plus `status`, `dispatch_status`, `is_active`, `is_labor_provider`, `person_type`, or `workflow_role`.
- Bounded previews: tenant/status filters ordered by `updated_at desc`, `due_date asc`, `scheduled_start_at asc`, `scheduled_date asc`, `payment_date desc`, or `occurred_at desc`, then `limit(...)`.
- Related-label search: resolve matching ids from customers/projects/estimates/vendors/people, then filter the primary table by `customer_id`, `project_id`, `estimate_id`, `vendor_id`, `assigned_person_id`, `invoice_id`, or `job_id`.
- Global search: bounded per-entity queries with `.or(...ilike...)`, then server-side scoring and five-result group caps.
- Dashboard project cues: active projects first, then project-id scoped estimate/contract/invoice/job inputs.
- Financial summaries: exact narrow scans for receivable/payment totals, where a count-only query would not preserve money totals.

## Existing Relevant Indexes Found

High-level coverage is already better than the old broad-read behavior implied:

- Customers: `customers_company_id_idx`, `customers_name_idx`, `customers_company_name_idx`, `customers_email_idx`, and `(company_id, id)` uniqueness.
- Projects: `projects_company_id_idx`, `projects_customer_id_idx`, `projects_status_idx`, `projects_name_idx`, and `(company_id, id)` uniqueness.
- Opportunities: `opportunities_company_id_idx`, `opportunities_status_idx`, `opportunities_customer_id_idx`, `opportunities_project_id_idx`, `opportunities_title_idx`, `opportunities_prospect_name_idx`, and `opportunities_company_next_follow_up_idx`.
- Estimates: `estimates_company_id_idx`, `estimates_status_idx`, `estimates_project_id_idx`, `estimates_customer_id_idx`, `estimates_company_reference_unique_idx`, `estimates_company_sent_at_idx`, and `estimates_company_customer_viewed_at_idx`.
- Contracts: `contracts_company_status_idx`, `contracts_project_idx`, `contracts_customer_idx`, `contracts_estimate_idx`, `contracts_template_idx`, and `(company_id, id)` uniqueness.
- Invoices: `invoices_company_id_idx`, `invoices_status_idx`, `invoices_due_date_idx`, `invoices_issue_date_idx`, `invoices_customer_id_idx`, `invoices_project_id_idx`, `invoices_estimate_id_idx`, `invoices_job_id_idx`, `invoices_tax_reporting_idx`, and `invoices_company_reference_unique_idx`.
- Jobs and assignments: `jobs_status_idx`, `jobs_dispatch_status_idx`, `jobs_scheduled_date_idx`, `jobs_scheduled_start_at_idx`, `jobs_project_id_idx`, `jobs_customer_id_idx`, `jobs_estimate_id_idx`, `jobs_crew_vendor_idx`, and `job_assignments_company_job_idx`.
- Appointments: `appointments_company_starts_at_idx`, `appointments_company_status_starts_at_idx`, and company-scoped opportunity/customer/project/assigned-person indexes ordered by `starts_at`.
- Payments and events: `payments_company_id_idx`, `payments_status_idx`, `payments_invoice_date_idx`, `payments_source_idx`, gateway reference indexes, `payment_events_company_type_idx`, `payment_events_company_invoice_idx`, and `payment_events_company_payment_idx`.
- Change orders: status, project, customer, contract, and invoice indexes already include `updated_at desc`.
- People/vendors/compliance: company-scoped active/type/assignable/vendor/name/email indexes plus `compliance_records_company_subject_idx`.
- Field/punchlist: company-scoped project/job/person/status/type indexes already include useful date ordering for many dashboard/schedule paths.
- Portal/access support: portal grant/project access and customer-contact permission indexes cover company/grant/project/contact joins used by People.
- Workflow cue state: user, subject, project, and user/state/snooze indexes exist.
- Progress billing: schedule-of-values has `(company_id, estimate_id)` uniqueness and project index; SOV items have schedule/sort and lineage indexes.

## Missing Or Questionable Indexes

These are the main gaps to verify:

1. Repeated status preview queries often filter `company_id + status` but order by `updated_at desc`. Several tables only have `(company_id, status)`, which may still sort within the status subset. This affects estimates and contracts most clearly.
2. Invoice queues often filter `company_id + status`, then order by `due_date asc nulls last, updated_at desc`. Existing `invoices_status_idx` and `invoices_due_date_idx` may not fully satisfy that combined shape.
3. Payments Manager orders by `payment_date desc, created_at desc`; existing payment indexes cover company, status, and `(invoice_id, payment_date desc)`, but not tenant/status/payment-date preview ordering.
4. Jobs Manager and dashboard live-job previews order by `scheduled_start_at`, `scheduled_date`, and `updated_at` under `dispatch_status`; existing indexes split these into separate tenant/status and tenant/date shapes.
5. Global search uses `ilike '%query%'`. Existing `lower(...)` btree indexes help equality/prefix-style lower lookups, not arbitrary contains search. Trigram indexes may be warranted later, but only after production-like search profiling.
6. Some exact financial totals still require narrow scans over `payments` and open `invoices`; indexes reduce filtering but do not replace aggregation cost.
7. Dashboard progress billing still scans all tenant SOV rows/items/progress invoices to preserve exact AIA math. That path is semantically correct, but aggregate/index work needs real tenant volume first.

## High-Confidence Recommendations

These are high-confidence query shapes, but this review intentionally does not add migrations without EXPLAIN/production-like row counts:

1. Add `company_id, status, updated_at desc` indexes for `estimates` and `contracts` if EXPLAIN shows repeated sort/filter cost on manager/dashboard queue previews.
2. Add a combined invoice queue index for `company_id, status, due_date asc, updated_at desc` if invoice manager/dashboard billing queues sort large status subsets.
3. Add a payments preview index for `company_id, status, payment_date desc, created_at desc` if Payments Manager or dashboard recent payments show sort cost.
4. Add a jobs dispatch/date preview index for `company_id, dispatch_status, scheduled_start_at asc, scheduled_date asc, updated_at desc` if Jobs Manager and dashboard active-job queues are hot.
5. Consider `pg_trgm` GIN indexes for high-cardinality global-search direct fields only after confirming global search is slow under production-like tenant data.

## Recommendations That Need EXPLAIN First

- Any trigram index for `customers.name`, `customers.company_name`, `projects.name`, `estimates.reference_number`, `invoices.reference_number`, `people.display_name`, or `vendors.name`.
- Composite indexes that overlap existing single-purpose indexes, especially on low-cardinality status fields.
- Partial indexes for open invoices such as `where status not in ('paid', 'void')`; useful if open receivables is hot, but it adds status-specific maintenance.
- Progress billing indexes beyond existing SOV/item lineage indexes; the math path may need aggregation/RPC design more than extra btree indexes.
- Quick-Create option list indexes; those reads are intentionally lazy and correctness-sensitive, so they should be profiled only when composer-open latency is a real issue.

## Risks Of Over-Indexing

- Extra write cost on high-write tables such as invoices, payments, payment events, jobs, appointments, and operational cue state.
- More index bloat and vacuum pressure on tenant-owned operational tables.
- Planner confusion when many similar indexes exist, especially low-selectivity status indexes.
- Migrations that look safe locally can slow production deploys or lock hot tables if created without the right Supabase/postgres rollout pattern.
- Search trigram indexes are powerful but can be large; adding them to many text columns before measuring would be wasteful.

## Recommended First 5 Index Migrations

Do not apply these blindly. Treat this as the first EXPLAIN checklist. If production-like EXPLAIN confirms the current planner is sorting/filtering too many rows, these are the first candidates:

1. `estimates_company_status_updated_idx`
   - Candidate: `create index if not exists estimates_company_status_updated_idx on public.estimates (company_id, status, updated_at desc);`
   - Supports: Estimates Manager status queues, dashboard sent/awaiting estimate previews, approved-estimate option scans.
   - Confidence: high after EXPLAIN confirmation.

2. `contracts_company_status_updated_idx`
   - Candidate: `create index if not exists contracts_company_status_updated_idx on public.contracts (company_id, status, updated_at desc);`
   - Supports: Contracts Manager queues and dashboard waiting/awaiting contract previews.
   - Confidence: high after EXPLAIN confirmation.

3. `invoices_company_status_due_updated_idx`
   - Candidate: `create index if not exists invoices_company_status_due_updated_idx on public.invoices (company_id, status, due_date asc nulls last, updated_at desc);`
   - Supports: Invoices Manager open/overdue/payment queues and dashboard open invoice previews.
   - Confidence: high after EXPLAIN confirmation.

4. `payments_company_status_date_created_idx`
   - Candidate: `create index if not exists payments_company_status_date_created_idx on public.payments (company_id, status, payment_date desc, created_at desc);`
   - Supports: Payments Manager status views, recent recorded payments, and dashboard recent payment previews.
   - Confidence: medium-high after EXPLAIN confirmation.

5. `jobs_company_dispatch_schedule_updated_idx`
   - Candidate: `create index if not exists jobs_company_dispatch_schedule_updated_idx on public.jobs (company_id, dispatch_status, scheduled_start_at asc nulls last, scheduled_date asc nulls last, updated_at desc);`
   - Supports: Jobs Manager scheduled/in-progress queues, dashboard active jobs, and schedule manager job ordering.
   - Confidence: medium-high after EXPLAIN confirmation.

## Recommended Profiling Checklist

Run this against a staging or local database with production-like tenant volume:

1. Capture route timings from a production build:
   - `pnpm.cmd --filter @floorconnector/web build`
   - `pnpm.cmd --filter @floorconnector/web start`
   - Open `/dashboard`, `/projects`, `/estimates`, `/invoices`, `/jobs`, `/payments`, `/schedule`, `/people`, `/vendors`, and shell global search.
2. In Supabase Dashboard, open Database -> Reports -> Query Performance and capture slow queries for the route load window.
3. Enable or inspect `pg_stat_statements` if available, grouped by total time and mean time.
4. For each candidate query, run `EXPLAIN (ANALYZE, BUFFERS)` with a real `company_id` and realistic filters.
5. Compare before/after plans on a throwaway branch or staging database before adding migrations to `main`.
6. Check index usage after test traffic with `pg_stat_user_indexes`.
7. Reject any index where EXPLAIN shows tiny row counts, sequential scan is cheaper, or the index duplicates an existing better index.

## Supabase SQL Checks Before Applying Indexes

Use real company ids and representative dates/statuses.

```sql
select
  schemaname,
  relname as table_name,
  indexrelname as index_name,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
from pg_stat_user_indexes
where schemaname = 'public'
  and relname in (
    'projects',
    'customers',
    'estimates',
    'contracts',
    'invoices',
    'jobs',
    'payments',
    'payment_events',
    'appointments',
    'change_orders',
    'people',
    'vendors',
    'punchlist_items',
    'field_notes',
    'schedule_of_values',
    'schedule_of_value_items'
  )
order by relname, idx_scan desc;
```

```sql
explain (analyze, buffers)
select id, reference_number, status, due_date, updated_at
from public.invoices
where company_id = '<company-id>'::uuid
  and status = 'sent'
order by due_date asc nulls last, updated_at desc
limit 3;
```

```sql
explain (analyze, buffers)
select id, dispatch_status, scheduled_start_at, scheduled_date, updated_at
from public.jobs
where company_id = '<company-id>'::uuid
  and dispatch_status = 'in_progress'
order by scheduled_start_at asc nulls last, updated_at desc
limit 5;
```

```sql
explain (analyze, buffers)
select id, amount, status, payment_date, created_at
from public.payments
where company_id = '<company-id>'::uuid
  and status = 'recorded'
order by payment_date desc, created_at desc
limit 4;
```

```sql
explain (analyze, buffers)
select id, reference_number, status, updated_at
from public.estimates
where company_id = '<company-id>'::uuid
  and status = 'sent'
order by updated_at desc
limit 5;
```

```sql
explain (analyze, buffers)
select id, title, status, updated_at
from public.contracts
where company_id = '<company-id>'::uuid
  and status in ('sent', 'viewed')
order by status asc, updated_at desc
limit 5;
```

For global-search `ilike`, test both no-trigram and proposed-trigram plans in staging before migration:

```sql
explain (analyze, buffers)
select id, name, company_name, updated_at
from public.customers
where company_id = '<company-id>'::uuid
  and (name ilike '%smith%' or company_name ilike '%smith%')
order by updated_at desc
limit 50;
```

## Current Decision

No migrations were added in this pass.

Reason: the codebase already has broad baseline tenant/status/link indexes, while the remaining likely wins are composite ordering and contains-search indexes that should be validated with production-like EXPLAIN output before adding write overhead to hot operational tables.

## Next Meaningful Build

Run the profiling checklist on staging or a seeded local tenant with realistic row counts, then add the first one or two confirmed composite indexes as a dedicated migration slice with before/after EXPLAIN evidence in this document.
