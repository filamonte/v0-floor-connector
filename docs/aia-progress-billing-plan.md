# AIA / Progress Billing Plan

Status: Active
Doc Type: Planning
Date: 2026-05-17

## Purpose

This plan records what exists today for retainage, schedule of values, progress billing, and future AIA-style pay applications. It is a discovery and implementation-readiness document only.

Do not implement real AIA G702/G703 exports, new financial calculations, schema, payment behavior, invoice status changes, or provider integrations from this plan without a dedicated approved slice.

Canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## What Exists Today

- Organization financial settings include default retainage.
- Customer records store retainage defaults.
- Invoices snapshot tax and retainage values.
- `schedule_of_values` and `schedule_of_value_items` exist as canonical SOV foundations.
- SOV rows derive from approved estimate snapshots and approved change-order snapshots.
- Progress billing workspaces exist at `/progress-billing` and `/progress-billing/[scheduleOfValuesId]`.
- Contractors can update percent complete and build or update draft progress invoices from the SOV chain.
- Progress invoices use `billing_model = "aia_progress"` and remain canonical invoices.
- Invoice detail shows read-only SOV/progress-billing lineage where relevant.
- Portal invoice review shows retainage context on canonical invoices.

## What Is Scaffolded

- Retainage percentage and retained amount fields exist at invoice and SOV item level.
- SOV lineage tracks estimate snapshot and change-order snapshot sources.
- Progress invoices preserve canonical invoice/payment continuity.
- Change-order approved scope can append to an existing SOV.
- Template merge data includes invoice retainage fields.

## Missing Workflow Pieces

- Formal draw period management.
- Pay application numbering and status lifecycle.
- Contractor review/approval states before invoice send.
- Owner/customer review flow specific to pay applications.
- Retainage release workflow.
- Stored G702/G703 style application summaries.
- Export-ready AIA form output.
- Change-order draw presentation inside formal pay-app summaries.
- Audit trail for submitted/revised pay applications beyond existing invoices and revisions.

## Missing UX Pieces

- Clear distinction between progress-billing workspace, draft invoice, and future pay application package.
- Better SOV readiness messaging when approved scope has not seeded yet.
- Draw summary panels for current application, prior applications, retainage held, and balance to finish.
- Customer-safe pay application explanation in portal once AIA depth is implemented.
- Empty states that explain whether the blocker is missing approved estimate, missing SOV, no current billable progress, or existing draft invoice.
- Reporting/export affordances that are visibly future until implemented.

## Missing Financial Safeguards

- Pay-app period close rules.
- Retainage release validation.
- Negative/credit draw rules.
- Rounding reconciliation across many draws.
- Final-payment and closeout checks.
- Submitted pay application immutability or revision policy.
- Explicit tests for multi-draw, change-order, retainage release, and partial payment scenarios.

## Financial Correctness Risks

- Treating SOV as a detached pay-app model would duplicate invoice truth.
- Letting current percent complete fall below already billed progress would corrupt prior invoices.
- Mixing draft and sent invoice totals in prior-billed calculations could overstate progress.
- Releasing retainage without invoice/payment policy could distort balance due.
- Exporting AIA-style forms before rounding and lineage tests are complete could create contractual risk.

## Phased Recommendation

1. Keep current progress billing as contractor-side SOV-to-draft-invoice workflow.
2. Improve guidance and empty states without changing math.
3. Add comprehensive tests around current SOV invoice generation and change-order append behavior.
4. Design pay-application package fields and immutability policy before schema.
5. Add AIA-style export only after draw lifecycle, retainage release, and rounding safeguards are approved.

## First 5 Safe Implementation Slices

1. Presentation-only progress-billing readiness panels on `/progress-billing` and SOV detail.
2. Focused unit tests for current progress invoice math and minimum percent-complete guard.
3. Empty-state copy for projects with no SOV explaining approved-scope prerequisite.
4. Invoice detail copy clarifying progress invoices are canonical invoices, not separate pay-app records.
5. Draft an AIA export specification with field mapping, rounding policy, and non-goals before implementation.

## Current Recommendation

The current foundation is credible for contractor-side progress billing and retainage-aware invoices, but mature AIA/pay-application workflow should remain a planned financial depth area. The next build area should be tests plus UX clarity, not new financial behavior.
