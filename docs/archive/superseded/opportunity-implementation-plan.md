# Opportunity Implementation Plan

Archived note:
- this document is preserved as historical planning context from before the opportunity layer was implemented
- use [docs/current-state.md](C:/FloorConnector/docs/current-state.md) and [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md) for the current implementation and next-phase plan

This document outlines the recommended plan for introducing the opportunity layer into FloorConnector.

It should be read alongside:
- [opportunity-model.md](C:/FloorConnector/docs/archive/opportunity-model.md): formal opportunity definition
- [workflow-spec.md](C:/FloorConnector/docs/workflow-spec.md): primary contractor workflow
- [workflow-state-machine.md](C:/FloorConnector/docs/workflow-state-machine.md): workflow stages and blockers
- [current-state.md](C:/FloorConnector/docs/current-state.md): implemented truth today

## Goal

Introduce a formal opportunity layer without breaking the existing canonical execution foundation.

The plan should:
- add pre-project sales structure
- preserve one shared data model
- avoid premature project creation
- improve future workflow guidance

## Planning Principles

### 1. Add Opportunity Without Replacing The Existing Foundation

Customers, projects, estimates, contracts, invoices, and jobs already exist.

Opportunity should be added in front of them, not by redefining them.

### 2. Keep Conversion Explicit

The main benefit of the opportunity layer is controlled conversion:
- opportunity -> customer
- opportunity -> project
- opportunity -> estimate flow initiation

### 3. Keep v1 Narrow

The first opportunity implementation should focus on:
- intake
- qualification
- conversion

It should not try to include every future CRM feature immediately.

## Recommended Delivery Sequence

## Phase A: Opportunity Foundation

Goal:
- introduce the canonical organization-scoped opportunity record

Recommended scope:
- schema
- RLS
- shared types
- domain status helpers
- basic create/list/read/update server utilities

Recommended starter fields:
- contact identity
- source
- service type
- address
- notes
- status
- nullable links to customer and project
- timestamps

Out of scope for this first step:
- automation
- notifications
- board UI
- advanced assignment logic

## Phase B: Opportunity Workspace Basics

Goal:
- make opportunities usable inside the contractor app

Recommended scope:
- `/opportunities` list page
- opportunity detail page
- create opportunity flow
- update opportunity flow
- empty states
- basic status progression

Key user outcomes:
- sales can capture and update real intake work
- the team can see which opportunities are qualified or blocked

## Phase C: Conversion Flows

Goal:
- connect opportunity to the existing canonical model cleanly

Recommended scope:
- convert or link to customer
- create project from opportunity
- allow estimate initiation from opportunity/project context

Important rule:
- conversion should reuse canonical customer and project records
- conversion should not duplicate data into disconnected sales-only entities

## Phase D: Workflow Guidance

Goal:
- make the opportunity layer operationally useful instead of just another record table

Recommended scope:
- next-best-action hints
- basic blockers
- qualification cues
- visibility into whether an opportunity is ready for project conversion

This is where the opportunity layer starts to reduce process ambiguity.

## Phase E: Handoff Into Project Workspace

Goal:
- preserve continuity when sales work becomes delivery work

Recommended scope:
- show origin opportunity on project detail later
- keep linked sales context available after conversion
- add timeline or activity trail later

This keeps handoff clean between sales and operations.

## Recommended Data Rules

### Customer Link

Recommended approach:
- `customer_id` remains nullable until a customer is created or linked

### Project Link

Recommended approach:
- `project_id` remains nullable until the opportunity becomes active delivery work

### Estimate Relationship

Recommended approach:
- do not make estimate depend directly on opportunity in v1 if project remains the execution root
- instead, let opportunity drive project creation and estimate initiation cleanly

This keeps the canonical execution path stable.

## Suggested v1 Status Set

For implementation simplicity, start narrower than the full conceptual list.

Recommended initial statuses:
- `new`
- `contacted`
- `qualified`
- `site_assessment_scheduled`
- `site_assessment_complete`
- `estimating`
- `lost`
- `converted`

This is enough to support real sales progression without overbuilding the first pass.

## Suggested v1 Actions

Recommended initial actions:
- create opportunity
- update opportunity
- mark contacted
- mark qualified
- mark site assessment scheduled
- mark site assessment complete
- convert to customer/project
- mark lost

## Risks To Avoid

### 1. Duplicate Customer Logic

Do not let opportunity become a second customer model.

### 2. Duplicate Project Logic

Do not let opportunity become a shadow project with separate execution semantics.

### 3. Overbuilt CRM Before Workflow Value

Do not jump straight into:
- pipeline boards
- campaign logic
- complex lead scoring
- deep communication tooling

before the basic conversion and qualification flow exists.

### 4. Premature Estimate Forking

Do not create a separate estimate-like quote object inside opportunity.

The estimate should remain the canonical priced commercial record.

## Recommended Next Build Step

The best next implementation step is:

**Opportunity Foundation**

That means:
- schema
- statuses
- RLS
- shared types
- basic CRUD
- no advanced UI beyond list/detail/create/edit

This gives the product a real sales-entry layer without destabilizing the rest of the workflow.

## After Opportunity Foundation

The recommended order after that is:
1. conversion flow to customer/project
2. basic workflow/blocker visibility
3. project workspace evolution
4. richer sales/ops/finance queue behavior

## Current Implementation Note

Opportunity is still a planned layer, not an implemented one.

This plan is intentionally written so the team can introduce it in reviewable steps without forcing a full IA refactor first.

