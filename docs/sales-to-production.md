# Sales To Production Workflow

Status: target sales and commercial workflow design.

This document describes the broader sales, commercial, and readiness workflow FloorConnector is intended to support from first inquiry through production readiness.

It complements:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): implemented truth
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): target platform architecture
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): phased implementation plan
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md): implemented and near-term workflow direction
- [docs/workflow-spec.md](C:/FloorConnector/docs/workflow-spec.md): primary guided contractor path
- [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md): documentation maintenance and archival rules

Use [docs/workflows.md](C:/FloorConnector/docs/workflows.md) as the canonical current and near-term contractor workflow document. This file is the broader target commercial workflow framing.

## Purpose

This document exists to capture the wider business process around contractor revenue generation so product decisions stay aligned with how specialty surface contractors actually operate.

It is not a claim that every stage below is already fully implemented. For implemented status, trust [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

## Core Principles

### 1. Single Shared Record Flow

Data should move forward through the same canonical chain:

`opportunity -> customer -> project -> estimate -> contract -> financial readiness -> job / production -> invoice -> payment`

That flow may tighten over time into a more project-centered UX, but the key rule is unchanged:
- no duplicate re-entry of core business data at later stages
- no disconnected contract, billing, or production records

### 2. Project As Operational Root

Once work becomes real enough to deliver, the project should become the operational home for:
- commercial context
- execution readiness
- job planning
- downstream billing context

### 3. Workflow Over Modules

FloorConnector should behave like one connected contractor workflow, not a stack of disconnected modules.

### 4. Financing And Financial Readiness Are Workflow Stages

Financial readiness may include:
- deposit requirements
- financing qualification or approval
- internal commercial approval
- readiness-to-schedule checks

The point is not simply whether an invoice exists. The point is whether sold work is truly ready to move into operations.

## End-To-End Workflow

### 1. Lead Intake

Possible sources:
- website contact form
- inbound phone or email
- inspection request
- manual sales entry
- future estimator or scheduler entry points

Core intake data:
- name
- contact information
- address
- service type
- notes
- source

### 2. Qualification And Customer Creation

Qualified leads become:
- canonical customer records
- optionally linked opportunities if intake started before the customer record existed

Customer becomes the shared relationship record for all future work.

### 3. Opportunity And Site Assessment

Purpose:
- preserve real job context before final scope is priced

May include:
- measurements or square footage
- photos
- substrate condition
- prep requirements
- recommended system
- scope notes

Input sources may be:
- on-site inspection
- customer-provided measurements and requirements
- future instant-estimate tooling

### 4. Estimate Creation

Estimate creation may eventually support:
- custom quote workflows
- system-based pricing
- square-foot pricing
- hybrid estimating
- reusable catalogs and assemblies

Current product direction keeps the estimate as the canonical commercial scope record.

Current implementation note:
- the live estimate workspace is inventory-first, using shared `catalog_items` plus reusable systems/components instead of disconnected manual estimate rows
- canonical pricing truth lives in `estimate_line_items`
- defaults hydrate only when estimate content is initially empty, then stop reapplying automatically after user edits

### 5. Estimate Review

The estimate stage should support:
- draft
- sent
- customer review
- revisions
- approval or rejection

### 6. Contract Generation

Approved estimates should make the work eligible for contract generation.

Contracts should be:
- generated from approved estimates
- merged with project and customer context
- editable while still in draft
- locked after signature activity begins

### 7. Contract Approval And Signature Readiness

This stage may include:
- internal approval requirements
- send readiness
- customer signature
- contractor countersign later where needed

### 8. Financial Readiness

After contract completion, the work may require:
- deposit collection
- financing approval
- internal green-light checks

This is the stage that determines whether work is actually ready for production scheduling.

### 9. Scheduling And Production Readiness

Once work is commercially and financially ready, operations should be able to:
- create or confirm the job/work order
- assign schedule readiness
- move toward crew assignment and production planning later

### 10. Job Execution

Later operational depth should support:
- field execution tracking
- crew workflows
- daily logs
- time tracking
- production visibility

### 11. Invoice, Payment, And Closeout

Billing should stay connected to the same project, customer, estimate, contract, and optional job context.

This stage should support:
- invoice creation
- payment recording
- balance tracking
- retainage-aware and future progress-billing-aware financial behavior

## Configuration Requirements

The broader workflow depends on configuration at two layers.

### Platform / Super Admin

Super admin should define:
- platform starter templates
- platform starter catalogs
- global financial defaults
- global workflow defaults
- feature and module policy

### Contractor Organization

Contractor admins should manage:
- organization-owned templates
- organization-owned reusable items
- tax defaults
- retainage defaults
- contract workflow defaults
- deposit or readiness preferences
- allowed feature overrides

## What We Avoid

FloorConnector should avoid:
- duplicate data between modules
- disconnected contract and invoice systems
- module-specific template silos
- manual re-entry of estimate or contract data downstream
- contractors depending directly on one mutable global starter record

## Future Extensions

Future workflow expansion may include:
- richer estimator tooling
- online scheduling
- customer portal flows
- full AIA/progress billing workflows
- communications and notifications
- CRM and sales pipeline depth
- deeper production and field execution tooling

## Summary

This workflow is meant to represent how contractors actually move work from inquiry through sale, readiness, production, billing, and collection.

The product should keep strengthening one connected business chain rather than letting each stage become its own isolated subsystem.
