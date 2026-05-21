# FloorConnector Architecture

Status: Planned
Doc Type: Philosophy

This document describes the **target platform architecture** for FloorConnector.

It defines the intended end-state system design, shared data model, and platform boundaries. It does **not** imply that every surface, workflow, or module listed here is already implemented today.

Use these docs together:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): source of truth for implemented status
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): target system design
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): platform maturity roadmap
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md): target sales and commercial workflow direction
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md): target contractor app information architecture
- [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md): documentation maintenance and archival rules
- [docs/vision.md](C:/FloorConnector/docs/vision.md): long-term product direction

When implementation status matters, defer to [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

## Platform Overview

FloorConnector is intended to be a multi-tenant SaaS platform for contractor operations, public acquisition, growth, and ecosystem expansion.

The target platform includes:
- Marketing Site
- Contractor-owned public websites
- Contractor App
- Customer Portal
- Platform Admin

All surfaces are intended to share one canonical data model.

## Core Principles

### Canonical Data Model

Business data should exist once and be reused across the platform.

### Project-Centered Operations

Projects are intended to become the operational root of core delivery workflows.

In contractor UX terms, project detail should be the primary workflow and readiness hub, while other record pages should support the connected workflow and point back to the Project Workspace when broader handoff state matters.

### Cross-Module Data Flow

Modules should share and reuse the same underlying records rather than creating parallel systems.

### No Data Silos

No module should own its own duplicate version of a canonical entity.

## Canonical Entities

The target canonical model includes:
- Organization
- Membership
- User/Profile
- Opportunity
- Customer
- Project
- Estimate
- Estimate Line Item
- Job
- Invoice
- Payment
- Person
- Vendor
- Time Card
- Time Punch Event
- Daily Log
- Field Note
- Document
- Activity/Event
- Message/Conversation
- Contract
- Template
- Catalog Item
- Catalog Collection
- Compliance Record

Not all of these entities are implemented yet. This list defines the intended shared platform model.

## Target System Layers

### Platform

Platform-level concerns are intended to include:
- billing
- subscriptions
- admin tools
- super-admin oversight
- platform-level module entitlements and controls
- platform starter defaults for templates, catalogs, financial settings, and workflow settings

### Organization

Organization-level concerns are intended to include:
- users
- roles
- modules
- settings
- organization administration
- notification and workflow preferences
- reusable catalogs
- organization-owned template libraries
- organization-owned copies and overrides adopted from platform defaults

### Operations

Operational concerns are intended to include:
- customers
- projects
- estimates
- contracts
- jobs
- scheduling and calendar workflows
- crews
- daily logs
- invoices
- notifications and tasks
- time
- field execution

### Growth

Growth-oriented capabilities are intended to include:
- contractor-owned websites
- tenant-owned domains
- SEO/service/location pages
- landing pages
- public forms and lead capture
- campaign/source attribution
- AI-assisted acquisition and generated marketing content
- reviews, reputation, galleries, and project proof later

Growth is the public acquisition surface of the same contractor operating system. It should not introduce a separate marketing database, website lead model, public-contact silo, or website-only project/customer model.

### Public Edge Layer

The target public edge layer should support contractor-owned websites, tenant-owned domains, SEO/service/location pages, landing pages, public forms, media delivery, edge caching, and future public AI interactions.

Public acquisition traffic should be able to scale independently from protected operational workflows. That scaling boundary is infrastructure and delivery-oriented only; it does not split the business source of truth.

Public edge outputs should enter or enrich canonical workflows:

`public acquisition -> opportunity -> customer -> project -> estimate -> contract -> payment -> scheduling -> execution -> follow-up`

Conceptual future infrastructure may include CDN/edge delivery, image optimization, asynchronous publishing, AI generation queues, SEO publishing pipelines, webhook processing, and media processing. These should stay behind platform boundaries and should not hard-commit the architecture to one provider before implementation is scoped.

### Operational Core

The operational core remains the source of truth for auth, tenant isolation, workflows, contracts, payments, scheduling, canonical records, communications, and AI orchestration.

Public websites, forms, attribution, reviews, galleries, and public AI interactions should call into controlled platform services or produce reviewable workflow inputs. They should not bypass server-side validation, tenant boundaries, canonical workflow state, or human approval where customer commitments, pricing, scheduling, billing, permissions, or compliance are involved.

### Ecosystem

Ecosystem capabilities are intended to include:
- marketplace
- materials
- vendors

## Target Operational Flow

The intended primary operational flow is:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

This is the target workflow model, even if parts of it are still being implemented in phases.

The broader target public-acquisition flow is:

`public acquisition -> opportunity -> customer -> project -> estimate -> contract -> payment -> scheduling -> execution -> follow-up`

Additional workflow rules in the target model:
- contracts are generated from approved estimates and their connected projects rather than authored from disconnected duplicate data
- generated contracts may be edited while still in an internal draft state, but should become locked once signature activity begins
- future AIA/progress billing should derive its schedule of values from approved estimate items instead of introducing a separate estimating model for billing

## Financial System

The target financial system is intended to support:
- standard invoicing
- AIA billing
- schedule of values
- progress billing
- retainage

Financial system design rules:
- tax is a shared and reportable financial concern across estimates, invoices, contracts, and downstream reporting, not an isolated invoice-only field
- customer tax exemption belongs on the canonical customer record so downstream financial workflows can reuse it consistently
- retainage must be supported and should be configurable at least at the customer level, with future extensibility to project or contract-specific overrides
- future AIA billing must remain connected to the same canonical customer, project, estimate, invoice, and payment records
- reusable item/catalog data should support estimating, invoicing, contracts, and future schedule-of-values workflows without duplicating pricing or scope definitions in each module

## People System

The target people system is intended to include:
- shared people records for employees and vendor-linked subcontractor workers
- vendors
- certifications
- insurance
- compliance

## Time System

The target time system is intended to include:
- punch in/out
- time cards
- job attribution
- GPS tracking
- future geofencing

## Communication System

The target communication system is intended to support:
- internal communication
- operational notifications and tasks
- contractor to customer communication
- platform to contractor communication
- website forms, public AI chat, campaign inquiries, and public intake where implemented

Communication records should attach to canonical records and preserve source attribution where useful. Provider data, website events, and public AI context enrich the workflow; they do not become a separate business source of truth.

## Customer Portal

The target customer portal is intended to support:
- estimate requests
- proposal review
- contract signing
- invoice review
- payments
- messaging

The portal is a constrained customer-facing surface on canonical records. It should not become a portal-only customer, project, contract, invoice, payment, review, or communication system.

## Template System

The target template system is intended to be shared across:
- estimates
- invoices
- contracts
- future PDF and document output workflows

Template logic should remain centralized rather than duplicated across modules.

The same shared template and document editing foundation should power estimate, invoice, and contract output so formatting, reusable sections, and future document workflows stay consistent across modules.

Shared template and catalog rules:
- organizations should manage reusable template and catalog data inside their own tenant boundary
- reusable item/catalog concepts should support estimates, invoices, and contracts from one shared workflow foundation rather than separate module-specific libraries
- platform-level default catalogs and templates may exist as seed sources for new contractor organizations
- seeded defaults must become organization-owned copies after provisioning, not globally shared mutable records
- once seeded, contractor organizations should be free to edit their own copies without affecting platform defaults or other tenants

## Settings And Administration Boundaries

The target settings architecture should remain explicitly two-layered:

- `Super Admin` is the source of truth for platform-wide defaults, starter records, rollout policy, and system controls
- `Contractor Settings` manages organization-owned copies, tenant-scoped overrides, and operating preferences inside those platform rules

This boundary matters because:
- tenants must not depend directly on one mutable global template or catalog record
- platform policy and tenant configuration must stay separable
- additional modules should be able to plug into the same settings system without inventing disconnected admin models

## Contractor Workspace Direction

The target contractor app should use a shared Record Workspace pattern rather than unrelated page-by-page layouts.

Target page-shape rules:
- detail pages should separate header, workflow summary, primary workspace, context rail, and secondary sections
- project detail should remain the primary workflow and readiness hub
- estimate, contract, invoice, and job detail pages should use the same page language and reinforce project-centered continuity
- invoice detail should be review-first in structure even when edit controls remain available
