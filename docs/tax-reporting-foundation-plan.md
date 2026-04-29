# Tax Reporting Foundation Plan

Status: Phase B planning document for the smallest useful contractor sales and use tax reporting layer. The first internal-beta Sales Tax Summary implementation is now complete on `/reports`.

This plan does not authorize app code, schema changes, tax filing, external provider integration, jurisdictional tax engines, or invoice recalculation by itself. It defines the first reporting foundation FloorConnector should build so internal beta contractors can collect sales tax consistently and prepare usable source reports for sales/use tax returns.

Primary references:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/full-platform-feature-map.md](C:/FloorConnector/docs/full-platform-feature-map.md)
- [docs/full-build-and-launch-plan.md](C:/FloorConnector/docs/full-build-and-launch-plan.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/inventory-cost-architecture.md](C:/FloorConnector/docs/inventory-cost-architecture.md)

Canonical lifecycle remains:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Tax reporting must extend that chain. It must not become a separate accounting ledger or tax-provider-owned source of truth.

## 1. Current Implemented Tax Foundations

FloorConnector already has meaningful tax foundations, but they are intentionally simple.

Implemented now:
- platform financial defaults
- organization financial settings
- organization-scoped default tax rate
- organization-scoped default tax behavior:
  - `exclusive`
  - `inclusive`
  - `none`
- customer tax exemption status and metadata on canonical customers
- estimate tax calculations from:
  - customer exemption state
  - item taxable flags
  - organization/platform financial defaults
- invoice tax calculations from:
  - customer exemption state
  - invoice line taxability
  - organization/platform financial defaults
- estimate-level tax snapshots:
  - `tax_rate_applied`
  - `tax_behavior_applied`
  - `customer_tax_exempt_snapshot`
  - `taxable_sales_amount`
  - `exempt_sales_amount`
  - `tax_amount`
- invoice-level tax snapshots:
  - `tax_rate_applied`
  - `tax_behavior_applied`
  - `customer_tax_exempt_snapshot`
  - `taxable_sales_amount`
  - `exempt_sales_amount`
  - `tax_amount`
  - `tax_collected_amount`
- invoice line-item tax snapshots:
  - `tax_code_id`
  - `taxable`
  - `tax_rate_snapshot`
  - `tax_amount`
- approved estimate commercial snapshots carry tax-related commercial values for downstream lineage
- optional organization-scoped `tax_codes` foundation exists
- `catalog_items.taxable` exists as the simple item-level taxable flag
- `catalog_items.tax_code_id` exists as optional advanced infrastructure
- estimate and invoice item sourcing snapshots catalog tax behavior into line items
- an invoice tax reporting view foundation is present: `invoice_tax_reporting_entries`
- indexes exist to support invoice tax reporting access patterns, including invoice issue date and customer exemption snapshot fields

Current limitations:
- tax is not jurisdiction/location-aware
- project-location tax rules are not implemented
- nexus, district, local, material/labor treatment, and use-tax rules are not implemented
- exemption certificates and expiration workflows are not complete
- external tax provider integration is not active
- no filing workflow exists
- no return-generation or remittance workflow exists

## 2. First Internal-Beta Tax Report

The first tax report should be a read-only reporting surface contractors can use to prepare filings manually with their accountant or state/local portal.

Recommended report name:
- `Sales Tax Summary`

Recommended route:
- add a tax section inside `/reports`, or add a focused `/reports/tax` route if the reports page becomes too dense

Required filters:
- date range
- date basis:
  - default: invoice `issue_date`
  - optional later: payment date / cash-basis view
- invoice status:
  - all non-void
  - sent
  - partially paid
  - paid
  - draft visibility should be explicit and off by default for filing-prep summaries
- customer exemption:
  - all
  - exempt
  - non-exempt

Required summary values:
- taxable sales
- exempt sales
- tax collected
- invoice count
- void invoice exclusion count, if visible
- paid invoice count
- open/partially paid invoice count

Required drilldown rows:
- invoice reference number
- invoice issue date
- invoice status
- customer
- project
- customer exemption snapshot
- tax behavior applied
- tax rate applied
- taxable sales amount
- exempt sales amount
- tax collected amount
- total amount
- balance due amount
- payment status context:
  - paid
  - partially paid
  - open
  - draft
  - void
- link to the canonical invoice workspace

Useful secondary drilldowns:
- exempt customer invoices requiring certificate review
- invoices with tax behavior `none`
- invoices with taxable sales but zero tax collected
- invoices with exempt sales and no customer exemption metadata
- line-level taxable/non-taxable breakdown when safe to include from invoice line snapshots

Default behavior:
- default date range should be current month or last closed month depending on implementation simplicity
- include only canonical non-void invoices in filing-prep totals by default
- show draft invoices separately as "not filing-ready" context
- clearly label that the report is preparation support, not a filed return

## 3. What Sales/Use Tax Support Means In FloorConnector

For V1 and internal beta, sales/use tax support should mean:
- help contractors configure simple organization tax defaults
- help contractors mark customers as tax exempt where applicable
- help contractors mark catalog items or invoice lines as taxable/non-taxable
- snapshot tax behavior at estimate and invoice time
- preserve historical invoice tax values after settings change
- report taxable sales, exempt sales, and tax collected from canonical invoice snapshots
- give contractors and accountants a trustworthy exportable source report for manual return preparation

It should not mean in V1:
- filing returns
- remitting tax
- determining nexus
- determining jurisdictional rates automatically
- handling local/district tax boundaries
- replacing accountant review
- reconciling directly with state filing portals
- recalculating historical invoice taxes from current settings
- using an external tax provider as the source of truth

Future sales/use tax support may include:
- external provider adapter for rate lookup and filing assistance
- jurisdictional tax calculation
- project-location and customer-location tax rules
- exemption certificate lifecycle
- filing-period workflows
- export packages for accountants
- provider reconciliation against canonical invoices

Those future capabilities must attach to canonical customers, projects, invoices, invoice line items, payments, and tax snapshots.

## 4. Tax Connections Across The Lifecycle

### Estimates

Estimates are pre-invoice commercial proposals.

Tax behavior on estimates should:
- preview expected tax using current customer exemption, item taxable flags, and organization financial settings
- snapshot tax rate, behavior, exemption state, taxable sales, exempt sales, and tax amount on the estimate
- carry approved estimate tax context into approved commercial snapshots
- avoid becoming filing truth

Guardrail:
- estimate tax is proposal context only; filed/reportable sales tax should come from canonical invoice tax snapshots.

### Invoices

Invoices are the first reporting source for sales tax.

Tax behavior on invoices should:
- snapshot effective tax behavior when invoice tax is calculated
- store taxable sales, exempt sales, tax amount, and tax collected amount
- preserve customer exemption snapshot
- preserve line-level taxable and tax-rate snapshot details
- report from stored invoice values

Guardrail:
- reports must not recompute invoice tax from current organization settings, current customer exemption, or current catalog tax flags.

### Customers

Customers hold the account-level tax exemption state.

Tax behavior on customers should:
- allow contractor users to mark the customer exempt
- store exemption metadata where available
- flow into estimate and invoice snapshots at creation/update time
- make exemption visibility obvious in tax reports

Future customer tax work:
- exemption certificate attachments
- certificate expiration and renewal reminders
- customer-contact responsibility for exemption documents

Guardrail:
- changing a customer's exemption state later must not rewrite historical invoice tax snapshots.

### Catalog / Materials / Inventory

Catalog items already carry:
- `taxable`
- optional `tax_code_id`

Tax behavior on catalog/materials should:
- use the item taxable flag as the simple V1 control
- snapshot item tax behavior into estimate and invoice lines
- allow future tax-code reporting from line snapshots
- keep inventory quantity operational only; inventory state should not change tax reporting totals by itself

Future materials/use tax work:
- purchase-side use tax support when payable-side/vendor bill records exist
- material consumption and purchasing tax review
- inventory valuation and tax treatment only after purchasing/receiving is canonical

Guardrail:
- do not create purchase/use-tax reporting until canonical purchasing, receiving, vendor bills, or expense records exist.

## 5. Reporting Guardrails

Tax reports must:
- read canonical invoice and invoice-line tax snapshot data
- use tenant-scoped server-side loaders
- filter by the active organization
- make the date basis explicit
- keep draft/void invoice treatment explicit
- link every drilldown row back to canonical invoices
- clearly label totals as filing-prep support
- preserve historical invoice values exactly as stored

Tax reports must not:
- mutate invoices
- recalculate historical invoices from current settings
- update customer exemption flags
- update catalog item taxable flags
- create tax filing records in the first pass
- create tax-provider records in the first pass
- create reporting shadow tables
- infer collected tax from payment events alone
- treat estimates as filed tax truth
- claim jurisdictional accuracy before a tax engine/provider exists

## 6. First Implementation Pass

Implementation status: complete for the first read-only internal-beta pass.

Implemented shape:
- `/reports` now includes a `Sales Tax Summary` section.
- the tax summary uses a server-side tenant-scoped loader.
- the loader reads `invoice_tax_reporting_entries` for canonical invoice tax reporting snapshots.
- invoice display metadata is joined from canonical invoices for reference number, customer name, project name, and canonical invoice links.
- the shared reports date range applies to invoice `issue_date`.
- filing-prep summary totals exclude draft and void invoices.
- draft, void, exempt, open, and zero-tax/taxable invoice visibility stays explicit.
- every drilldown row links back to the canonical invoice workspace.
- no schema change, invoice mutation, provider integration, or filing workflow was introduced.

The originally recommended implementation shape is retained below as the acceptance checklist for follow-up review.

Recommended implementation shape:

1. Add a focused tax report entry under `/reports`.
2. Create a server-side tenant-scoped tax reporting loader.
3. Read from canonical invoice snapshots first:
   - prefer `invoice_tax_reporting_entries` if the current database types and RLS path make it straightforward
   - otherwise read directly from `invoices` plus optional `invoice_line_items`
4. Default to invoice `issue_date` for accrual-style filing-prep reporting.
5. Provide date range filters.
6. Exclude `void` invoices from primary totals by default.
7. Show draft invoices separately or behind a filter so users do not mistake draft tax for filing-ready tax.
8. Add top summary cards:
   - taxable sales
   - exempt sales
   - tax collected
   - invoice count
9. Add a drilldown table:
   - one row per invoice
   - status/payment context
   - customer exemption snapshot
   - tax behavior/rate
   - taxable/exempt/tax collected amounts
   - link to invoice detail
10. Add small exception queues:
   - exempt invoices
   - zero-tax invoices with taxable sales
   - open/partially paid invoices in the selected period
11. Keep export out of the first screen pass unless internal testers need it immediately; if added, CSV should export the same visible server-side rows only.
12. Update docs after implementation:
   - [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
   - [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)

Acceptance criteria:
- no schema change is required
- no invoice mutation occurs
- no provider integration is added
- all totals reconcile to invoice tax snapshot fields
- every drilldown row links to a canonical invoice
- report explains its date basis
- report explains that it supports manual return preparation but does not file returns

## 7. Risks And Controls

### Historical Tax Drift

Risk:
- reports recalculate old invoices using today's customer exemption state, tax rate, or catalog item taxable flag.

Controls:
- only read stored invoice and invoice-line snapshots
- keep current settings visible as configuration, not as historical reporting input
- add implementation review checklist item for snapshot-only reporting

### Filing Overclaim

Risk:
- users assume FloorConnector files tax returns or guarantees jurisdictional compliance.

Controls:
- use "tax reporting" and "filing preparation" language
- avoid "file", "remit", or "return submitted" actions in V1
- include no provider filing buttons

### Cash Vs Accrual Confusion

Risk:
- tax collected, invoice issue date, and payment date can imply different filing methods.

Controls:
- default to issue-date reporting
- show invoice/payment status context
- defer cash-basis tax reporting until payment allocation rules are explicit
- if payment-date filtering is introduced later, label it separately from issue-date reporting

### Exemption Evidence Gaps

Risk:
- customers are marked exempt without certificate visibility.

Controls:
- show customer exemption snapshot in tax reports
- add exception queue for exempt invoices
- plan future exemption certificate attachments and expiration reminders

### Item Taxability Gaps

Risk:
- material, labor, equipment, and service taxability varies by jurisdiction, but current V1 uses simple item flags.

Controls:
- label V1 item taxability as contractor-configured
- keep `tax_codes` optional advanced infrastructure
- defer jurisdictional rule engines until provider/jurisdiction work is explicitly scoped

### Use Tax Scope Creep

Risk:
- use tax requires purchase-side records that do not yet exist canonically.

Controls:
- first pass focuses on sales tax collected on invoices
- defer use-tax workflows until vendor bills, purchases, receiving, expenses, or material consumption records are canonical enough

## 8. Future Expansion

Future tax reporting can grow in stages:

1. Tax report export:
   - CSV export for accountant handoff
   - totals plus invoice detail rows
2. Line-level tax detail:
   - taxable/non-taxable line summary
   - tax code summary
   - item type summary
3. Exemption certificate workflow:
   - certificate attachment
   - expiration date
   - certificate status
   - renewal reminders
4. Cash-basis reporting:
   - payment-date summaries
   - partial-payment allocation policy
   - invoice/payment reconciliation notes
5. Jurisdictional tax readiness:
   - project/customer location basis
   - local/district fields
   - tax jurisdiction snapshots
6. Provider integration:
   - adapter boundary in `packages/integrations`
   - provider rate lookup
   - provider transaction posting
   - provider reconciliation
   - optional filing support
7. Use tax:
   - vendor bill or purchase records
   - inventory receiving and material consumption
   - purchase tax paid versus use tax owed

Provider integration should wait until:
- internal beta tax reports prove the source data is trusted
- contractor filing workflows are understood
- jurisdiction/date/payment basis decisions are documented
- provider metadata can attach to canonical invoices and tax snapshots without becoming the primary business truth

## Open Questions For Implementation

- Should the first report default to current month, previous month, current quarter, or a custom date range?
- Should paid invoices be the default filing-prep filter, or should all non-void issued invoices be included by default?
- Should tax collected mean stored `tax_collected_amount` on invoices, or should a future cash-basis view allocate recorded payments?
- Should draft invoices be hidden by default or visible in a "not filing-ready" section?
- Should the first report use `invoice_tax_reporting_entries` directly, or use existing invoice loaders until generated database types include the view cleanly?
- Should line-level tax-code summaries wait until internal testers use optional tax codes in real data?

## Phase B Recommendation

The first tax reporting pass is now a read-only Sales Tax Summary over canonical invoice tax snapshots, filtered by invoice issue date, with taxable sales, exempt sales, tax collected, invoice/payment context, and customer exemption visibility.

Continue to defer filing, remittance, jurisdiction engines, provider integration, and purchase-side use-tax reporting.
