# Operating Core Demo Path

Status: Active
Doc Type: Demo / QA

This document is the route-based demo and readiness path for the expanded
FloorConnector operating core. It should be read with
[docs/current-state.md](C:/FloorConnector/docs/current-state.md),
[docs/founder-demo-readiness.md](C:/FloorConnector/docs/founder-demo-readiness.md),
[docs/golden-workflow-demo-path.md](C:/FloorConnector/docs/golden-workflow-demo-path.md),
[docs/operating-core-validation-checklist.md](C:/FloorConnector/docs/operating-core-validation-checklist.md),
and [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md).

The goal is to show the current app as one connected contractor operating
system without creating fake records, bypassing auth, or claiming future
capability as shipped.

## Purpose

Use this path when rehearsing the current operating core for a contractor,
advisor, or prospective customer. It focuses on the implemented route chain:
Command Center, Project Workspace, CrewBoard, field execution, communications,
closeout/proof, customer portal, service, reporting, financial control,
Accounting Readiness, and print/export surfaces.

This is not a feature spec. It does not authorize schema changes, new routes,
demo-only persistence, fake data, provider calls, AI summaries, accounting sync,
payment behavior changes, signature behavior changes, portal access changes, or
workflow rule changes.

## Preconditions

- Run the local web app on one consistent origin. Manual local runs commonly
  use `http://localhost:3000`; Playwright protected route checks default to
  `http://localhost:3001` unless `PLAYWRIGHT_BASE_URL` is set.
- Use real local contractor auth. If protected routes redirect to `/login`,
  follow [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)
  instead of retrying login until Supabase Auth rate limits.
- Use real database records: project, customer, job, daily log, estimate,
  contract, invoice, payment/payment event where available, service ticket, and
  portal-visible customer records.
- Avoid stale hardcoded IDs. Start from index pages and open visible detail
  links whenever possible.
- Use a valid portal customer session and project-scoped portal access before
  showing portal routes.
- Do not print credentials, auth storage state, invite tokens, provider keys, or
  secret env values in demo notes.

## Suggested Demo Storyline

1. Open `/dashboard`.
   - Show the contractor Command Center as the operating start point.
   - Say that dashboard items link back to source records; they are not a
     separate workflow owner.

2. Open `/reports`, then `/financials`.
   - Show operations/collections visibility, Financial Control, open
     receivables, overdue/payment attention, and owner next moves.
   - Keep the language to visibility and navigation, not accounting sync.

3. Open `/financials/accounts-receivable` and
   `/financials/accounting-readiness`.
   - Show collection attention, invoice/payment review, tax/retainage snapshots
     where present, and Copy CSV / Download CSV export prep.
   - State that export is for accounting review only and does not change
     invoice/payment status or sync to accounting software.

4. Open `/projects`, then one real `/projects/[projectId]`.
   - Show Project Workspace as the continuity hub.
   - Review project health, Next Move, connected commercial records, schedule
     context, ProjectPulse, FieldTrail, MessageCenter, CloseoutTrail, Proof
     Center, Send Trail, service/warranty continuity, and source-record links.

5. Open `/schedule`.
   - Show CrewBoard as job-centered scheduling visibility with date/layout
     context, ready/scheduled work, advisory warnings, and daily-log handoffs.
   - Do not claim drag/drop dispatch, route optimization, or external calendar
     sync.

6. Open `/jobs/[jobId]`, `/daily-logs`, and one
   `/daily-logs/[dailyLogId]` when valid links exist.
   - Show job execution continuity, mobile-friendly Daily Job Log capture,
     FieldTrail evidence, field notes, attachments, labor/time context, and
     return paths to Project/Schedule.

7. Open `/communications`.
   - Show MessageCenter as a project/customer communication timeline and triage
     surface over existing messages, notifications, Send Trail, Signature Trail,
     Payment Trail, and source-record context.

8. From a project, estimate, contract, or invoice detail route, review Send
   Trail and document delivery proof where present.
   - Show delivery proof visibility only. Do not claim provider retry
     automation or new sending behavior.

9. From a project detail route, open
   `/projects/[projectId]/closeout-package/pdf`.
   - Show the contractor-side closeout package print/save route as a rendering
     of current project source records.
   - State that it is not a stored PDF library or portal closeout download.

10. Open `/service-tickets`.
    - Show Service Center visibility over existing service tickets, warranty
      documents, service jobs, project proof context, and next moves.
    - Do not claim customer service request submission unless a future
      implementation explicitly adds it.

11. Open `/portal`, then one real `/portal/projects/[projectId]` with saved
    portal auth.
    - Show the Customer Window: Customer Next Step, Project Status, Project
      Timeline, Shared Documents, and existing portal review/print routes.
    - Do not show contractor-only FieldTrail, internal Job Notes, Proof Center,
      internal blockers, or provider details as customer-facing.

12. Close on `/reports` or `/financials/accounting-readiness`.
    - Summarize the owner value: source-record continuity from sales through
      field execution, customer visibility, closeout proof, collections, and
      accounting review prep.

## Route Checklist

| Route                                        | Demo purpose                                                 | Record/auth requirement                                    | Caveat                                               |
| -------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- | ---------------------------------------------------- |
| `/dashboard`                                 | Contractor Command Center and operating queues               | Contractor auth                                            | Dashboard links should lead to canonical records.    |
| `/reports`                                   | Operations and collections visibility                        | Contractor auth                                            | Read-only reports, not a report builder.             |
| `/financials`                                | Financial Control summary                                    | Contractor auth with invoices/payments                     | No payment behavior or accounting sync.              |
| `/financials/accounts-receivable`            | Collections and payment attention                            | Open or recent invoices help                               | No reminders, retries, refunds, or disputes.         |
| `/financials/accounting-readiness`           | Accounting review and CSV export prep                        | Invoices/payments/tax or retainage snapshots where present | Export is spreadsheet review only.                   |
| `/projects`                                  | Project index and detail discovery                           | Contractor auth                                            | Use visible links, not stale IDs.                    |
| `/projects/[projectId]`                      | Project health, continuity, proof, closeout, service context | Real project with related records                          | Project is the hub, not a duplicate module.          |
| `/schedule`                                  | CrewBoard scheduling visibility                              | Jobs/appointments improve the demo                         | No drag/drop scheduling claim.                       |
| `/jobs/[jobId]`                              | Job execution continuity                                     | Real job                                                   | Respect readiness and scheduling rules.              |
| `/daily-logs`                                | Daily Log manager                                            | Daily logs improve the demo                                | No offline/native mobile claim.                      |
| `/daily-logs/[dailyLogId]`                   | Mobile Daily Job Log capture and evidence                    | Real daily log                                             | Use database records only.                           |
| `/communications`                            | MessageCenter timeline and triage                            | Communication data improves the demo                       | No customer chat or automation claim.                |
| `/service-tickets`                           | Service Center and warranty/service continuity               | Existing tickets/docs improve the demo                     | No portal request submission claim.                  |
| `/estimates/[estimateId]`                    | Proposal/source record and Send Trail context                | Real estimate                                              | Do not change estimate math.                         |
| `/contracts/[contractId]`                    | Contract/signature context and Send Trail context            | Real contract                                              | Do not trigger provider signing unless scoped.       |
| `/invoices/[invoiceId]`                      | Invoice/payment state and Payment Trail context              | Real invoice                                               | Do not start checkout unless payment QA is explicit. |
| `/projects/[projectId]/closeout-package/pdf` | Contractor print/save closeout package                       | Real project                                               | Not stored PDF/versioning.                           |
| `/portal`                                    | Customer portal home                                         | Portal customer auth                                       | Must be scoped to real portal access.                |
| `/portal/projects/[projectId]`               | Customer Window                                              | Portal project grant                                       | Customer-safe records only.                          |

## What To Say

- "FloorConnector keeps the contractor workflow connected from opportunity and
  customer through project, estimate, contract, job, invoice, payment, field
  execution, customer portal, closeout, reporting, and accounting review."
- "These summaries and next moves are deterministic and source-record backed."
- "Print/save document routes render existing records for browser export; they
  are not stored document versions."
- "Accounting export prep creates review-ready CSV output only. It does not sync
  accounting software or change financial records."
- "The portal Customer Window shows customer-safe shared project information and
  actions from existing portal access."

## What Not To Claim

- Do not claim drag/drop scheduling, automated dispatch, route optimization, or
  external calendar sync.
- Do not claim accounting sync, QuickBooks/Xero integration, ledger posting, or
  automated reconciliation.
- Do not claim AI summaries, AI recommendations, or autonomous workflow actions.
- Do not claim stored PDFs, full document management, stored closeout packages,
  or portal closeout downloads.
- Do not claim customer-facing FieldTrail, internal Job Notes, Proof Center
  evidence, internal blockers, or provider delivery details.
- Do not claim customer service request submission unless a future
  implementation adds it and `docs/current-state.md` reflects it.
- Do not claim automated reminders, notification preferences, provider retries,
  refunds, disputes, subscriptions, or live provider replay.

## Known Local QA Caveats

- Supabase Auth can rate-limit repeated login attempts. Stop retrying if
  `AuthApiError: Request rate limit reached` or `over_request_rate_limit`
  appears.
- Playwright protected checks default to `http://localhost:3001`, while manual
  dev servers often run on `http://localhost:3000`.
- Saved auth storage can become stale or origin-mismatched.
- Fixed fixture IDs can become stale or belong to a different local
  organization. Discover detail links from authenticated index pages whenever
  possible.
- Portal QA needs a valid portal customer session, active project visibility,
  and shared portal records.
- Browser QA can be counted as blocked, not passed, when auth redirects to
  `/login`, fixture records are missing, or the route is not visible to the
  active organization.

## Data Rule

No fake or dummy production data. The demo must use database-backed records.
If the environment lacks a coherent project/customer/job/commercial/portal
record set, the next task is demo data readiness through approved local/test
fixture tooling, not fake route content or placeholder dashboards.

Use [docs/demo/staging-demo-data-plan.md](C:/FloorConnector/docs/demo/staging-demo-data-plan.md)
to define the canonical demo dataset before staging or external walkthroughs.
That plan keeps demo data tenant-scoped, owner-approved, and separate from
provider actions, schema changes, fake production records, or stale hardcoded
IDs.

## Follow-Up Demo Polish Candidates

- Add a single authenticated smoke script that walks only index routes and
  reports protected-route/auth blockers without mutating data.
- Keep one approved local/test fixture set current for contractor and portal
  walkthroughs, with explicit owner approval before fixture writes.
- Add a lightweight route-discovery helper for project, estimate, contract,
  invoice, job, daily-log, and portal project detail links.
- Create a one-page operator checklist for the exact route order used in a live
  founder/prospect call.
- Refresh screenshots only after auth state and real data are verified.
