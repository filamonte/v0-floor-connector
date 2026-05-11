# Financial Architecture

Status: Active
Doc Type: Operational

This document captures the financial architecture guardrails. Use [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for implemented status and [docs/workflows.md](C:/FloorConnector/docs/workflows.md) for workflow rules.

## Canonical Financial Records

- Invoices are canonical records for money owed.
- Invoice line items preserve billing lineage.
- Payments are canonical records for money collected.
- Payment events preserve payment lifecycle history.
- Change orders extend the same project/contract/invoice chain.
- SOV/AIA and progress billing scaffolding must remain tied to approved commercial lineage.

## Snapshot Principles

- Approved estimate snapshots feed downstream contract, SOV, and invoice behavior.
- Downstream billing must not read live mutable estimate rows as billing truth.
- Tax, retainage, SOV, and invoice line values should preserve the snapshot/context that justified them.
- Historical financial records must not silently mutate when catalog defaults or estimate content changes later.

## Event Principles

Financial, payment, signature, and provider lifecycle events should be append-only or effectively immutable where they represent history.

Events should preserve:
- actor/source where known
- timestamp
- safe provider references where relevant
- before/after or status transition context where relevant
- canonical record linkage

## Provider Boundary

Payment providers, future subscriptions, accounting integrations, and tax providers are adapters. They must attach to canonical records and must not become duplicate payment, checkout, invoice, customer, or subscription truth inside FloorConnector.

## Non-Goals

- No duplicate payment model.
- No portal-only checkout model.
- No provider-owned business truth.
- No direct catalog-to-normal-invoice billing shortcut that bypasses approved commercial lineage.

