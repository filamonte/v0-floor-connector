# Architecture Principles

Status: Stable
Doc Type: Philosophy

This document captures durable FloorConnector architecture principles. It is not an implementation inventory. Use [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for current branch reality.

## Principles

- One canonical shared data model across contractor app, portal, super admin, and future surfaces.
- Modular monolith over fragmented services until a boundary clearly earns separation.
- Tenant isolation is a hard requirement at database, server, and UI boundaries.
- Project-centered continuity should increase over time while global queues remain useful.
- No module-specific silos for customers, projects, estimates, contracts, invoices, payments, messages, files, or portal records.
- Records flow forward through the canonical lifecycle instead of being recreated downstream.
- Financial, payment, signature, and delivery events extend canonical records and preserve history.
- Platform defaults may seed organization-owned copies, but platform changes must not silently mutate contractor-owned operational truth.
- Contractor app and customer portal are two surfaces on the same canonical records.
- External providers are adapters, not business sources of truth.

## Canonical Lifecycle

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

This chain is the architecture spine. Future public acquisition, AI, communications, takeoff, materials, reporting, or marketplace work must strengthen this chain instead of creating a parallel product.

## Anti-Silo Tests

Before adding a model, route, or integration, ask:
- Does a canonical record already own this business concept?
- Will this create a portal-only, website-only, AI-only, or provider-only copy?
- Does the data flow forward through the lifecycle?
- Can the contractor and customer surfaces still see the same truth with appropriate permissions?
- Will tenant isolation remain explicit and enforceable?

