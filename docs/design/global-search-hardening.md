# Global Search Hardening

Status: Active
Doc Type: QA

## Purpose

This pass hardens contractor-side global search after runtime QA found an enum
pattern-match crash:

`operator does not exist: opportunity_status ~~* unknown`

The goal is safer tenant-scoped record discovery without adding a new search
subsystem, schema, migrations, providers, AI search, embeddings, materialized
indexes, route rewrites, or workflow behavior.

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/target-ia.md`
- `docs/chat-handoff.md`
- `docs/product-language.md`
- `docs/operating-core-validation-checklist.md`
- `docs/demo/operating-core-demo-path.md`
- `docs/local-auth-qa-recovery.md`

## Files Inspected

- `apps/web/lib/global-search/data.ts`
- `apps/web/components/global-search.tsx`
- `apps/web/app/api/global-search/route.ts`
- `apps/web/app/(app)/layout.tsx`
- `apps/web/components/protected-app-top-nav.tsx`
- `packages/types/src/index.ts`
- related route availability under `apps/web/app/(app)`

## Searchable Categories

Current global search covers these contractor records:

| Category              | Text fields searched in PostgREST                                   | Status-like fields handled safely                           | Related/context fields                          |
| --------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------- |
| Leads / opportunities | title, prospect name, company, email, phone                         | opportunity status equality                                 | customer, project                               |
| Customers             | name, company, email, phone, city, state                            | none                                                        | none                                            |
| Projects              | name                                                                | project status equality                                     | customer                                        |
| Appointments          | title, location                                                     | appointment type/status equality                            | opportunity, customer, project, assigned person |
| Estimates             | reference number                                                    | estimate status equality                                    | customer, project                               |
| Contracts             | title                                                               | contract status equality                                    | customer, project, estimate                     |
| Invoices              | reference number                                                    | invoice status equality, exact ISO due date equality        | customer, project, estimate                     |
| Jobs                  | none                                                                | dispatch status equality, exact ISO scheduled date equality | customer, project, estimate                     |
| Punchlists            | title, details                                                      | punchlist status equality, exact ISO due date equality      | project, assignee                               |
| Payments              | bounded recent tenant-scoped candidates, scored in memory           | display/status scored in memory                             | invoice, customer, project                      |
| People                | display name, first name, last name, email, phone, job title, trade | none                                                        | vendor                                          |
| Vendors               | name, primary contact, email, phone                                 | vendor type equality                                        | none                                            |

Global search does not currently include change orders, service tickets, daily
logs, or reports/financials as standalone search categories.

## Enum/Status Field Handling

Status-like fields now use equality predicates against known allowed values
instead of `.ilike()` / `~~*` pattern matching:

- `opportunities.status`
- `projects.status`
- `appointments.appointment_type`
- `appointments.status`
- `estimates.status`
- `contracts.status`
- `invoices.status`
- `jobs.dispatch_status`
- `punchlist_items.status`
- `vendors.vendor_type`

Date fields now use equality only for exact `YYYY-MM-DD` input:

- `invoices.due_date`
- `jobs.scheduled_date`
- `punchlist_items.due_date`

Text fields still use escaped `.ilike()` predicates.

## Bugs Found/Fixed

- Fixed the enum/status query class that caused Postgres/PostgREST to evaluate
  `ilike` against enum-like columns.
- Removed pattern matching against date columns in global search predicates.
- Added pure helper coverage so future changes can verify status-like fields do
  not emit `.ilike()` predicates.
- Adjusted global-search empty-state copy to avoid internal implementation
  language in the UI.

## Tests Added/Updated

- Added `apps/web/lib/global-search/search-helpers.test.ts`.
- Added pure coverage for escaped text `.ilike()` predicates, enum equality
  predicates, partial status-like matches, exact date equality, and null-safe
  display helper behavior.
- Added the focused command to `docs/operating-core-validation-checklist.md`.

## Behavior Preserved

- Global search remains shell-level and tenant-scoped through the active
  organization context.
- Existing result categories and route links are preserved.
- Search still returns grouped result sets and scores results in memory after
  bounded tenant-scoped candidate queries.
- Payment activity still routes to the linked Invoice Workspace when available.
- Empty and short queries remain safe.

## Follow-Up Candidates

- Consider explicit change-order, service-ticket, and daily-log categories only
  if product scope approves them.
- Consider database-side filtering per category only after the current output
  shape and route links are preserved by tests.
- Consider partial-result UI copy if category-level database failures become a
  recurring operator issue.
