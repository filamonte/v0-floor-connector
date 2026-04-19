# Opportunity Model

Archived note:
- this document is preserved as historical planning context from before the opportunity layer was implemented
- use [docs/current-state.md](C:/FloorConnector/docs/current-state.md) and [docs/workflows.md](C:/FloorConnector/docs/workflows.md) for current truth

This document formalizes the **opportunity layer** that should sit in front of customer/project execution in FloorConnector.

It should be read alongside:
- [workflow-spec.md](C:/FloorConnector/docs/workflow-spec.md): primary contractor workflow
- [workflow-state-machine.md](C:/FloorConnector/docs/workflow-state-machine.md): stages, blockers, and transitions
- [sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md): broader business-process intent
- [current-state.md](C:/FloorConnector/docs/current-state.md): source of truth for what is implemented today

## Purpose

FloorConnector currently has strong canonical execution records, but it still needs a formal sales-intake layer before the system creates full operational work.

The opportunity model exists to:
- capture real pre-project sales activity
- preserve qualification and scoping context
- reduce premature project creation
- support cleaner handoff from sales into estimating and production

## Position In The Workflow

Target progression:

`Opportunity -> Customer -> Project -> Estimate -> Contract -> Financial Readiness -> Job / Schedule -> Invoice -> Payment`

The opportunity is the **pre-project commercial record**.

It should exist before the system creates an operational project.

## Conceptual Definition

An opportunity represents a potential piece of work that is not yet fully committed into active project delivery.

It should answer:
- who is asking for work
- what kind of work they want
- where it is located
- how qualified it is
- whether site assessment or estimating should happen next
- whether the opportunity was won, lost, or converted

## Why Opportunity Should Be Canonical

This should not be treated as a disposable temporary form.

Opportunity should be canonical because it becomes the shared source for:
- early customer/contact context
- lead source attribution
- qualification notes
- site-assessment readiness
- estimate initiation
- sales pipeline visibility

Without a formal opportunity layer, teams tend to:
- create projects too early
- duplicate intake notes elsewhere
- lose qualification history
- create inconsistent handoffs between sales and operations

## Relationship To Other Core Entities

### Opportunity and Customer

An opportunity may start before a canonical customer record exists.

Recommended model:
- an opportunity can exist with prospect contact data
- once sufficiently qualified, it creates or links to a canonical customer

Customer remains the long-lived relationship root.
Opportunity remains the pre-project commercial root.

### Opportunity and Project

A project should not be the first record for every inquiry.

Recommended model:
- opportunity converts into project when the work is qualified enough to become active delivery work

Project remains the operational root after conversion.

### Opportunity and Estimate

Estimates should usually begin from an opportunity that is qualified and scoped enough to price.

Recommended model:
- opportunity can progress into estimate preparation
- estimate approval later supports project/contract workflow

### Opportunity and Site Assessment

Site assessment should be treated as a key part of qualification/scoping, not as an afterthought.

Opportunity should support:
- inspection scheduling later
- site notes
- measurements
- photo capture later
- substrate/prep findings later

## Recommended Opportunity Fields

Starter fields:
- `id`
- `organization_id`
- `status`
- `title`
- `source`
- `service_type`
- `prospect_name`
- `prospect_company_name`
- `email`
- `phone`
- `address_line_1`
- `address_line_2`
- `city`
- `state_region`
- `postal_code`
- `country_code`
- `notes`
- `qualified_at`
- `converted_at`
- `lost_at`
- `created_at`
- `updated_at`

Likely relational fields:
- `customer_id` nullable until conversion/linking
- `project_id` nullable until conversion
- future `assigned_user_id`

## Recommended Opportunity Statuses

Starter statuses:
- `new`
- `contacted`
- `qualified`
- `site_assessment_scheduled`
- `site_assessment_complete`
- `estimating`
- `proposal_sent`
- `won`
- `lost`
- `converted`

These are commercial pipeline statuses, not project execution statuses.

## Conversion Rules

### Convert To Customer

Create or link a customer when:
- the opportunity is qualified enough to preserve a real relationship record
- the team has enough reliable contact data

### Convert To Project

Create a project when:
- the opportunity is qualified
- scoping has progressed enough that the work is operationally real
- estimating/contracting/delivery should happen in project context

### Convert To Estimate

Estimate preparation should be allowed when:
- enough site and scope context exists
- a responsible sales/estimating workflow is underway

## Role Ownership

### Sales

Primary ownership:
- intake
- qualification
- follow-up
- site assessment progression
- estimating handoff

### Operations

Minimal ownership before conversion:
- limited visibility
- future inspection/scheduling awareness where needed

### Finance

Usually little ownership at this stage except for reporting visibility later.

## UX Implications

Opportunity should not feel like “just another module.”

It should support:
- intake queue
- qualification board/list
- clear conversion actions
- visible blockers
- handoff into project and estimate workflow

It should reduce the need to create:
- premature customers
- premature projects
- disconnected notes outside the system

## Primary Actions

Recommended primary actions:
- create opportunity
- qualify opportunity
- schedule site assessment
- mark site assessment complete
- convert to customer
- create or convert to project
- start estimate
- mark lost

## Secondary Actions

Examples:
- editing prospect details
- reassigning ownership later
- adding notes
- updating source attribution

These matter, but they should not compete visually with progression actions.

## Blockers

Recommended opportunity blockers:
- `waiting_on_contact`
- `waiting_on_scope`
- `waiting_on_site_assessment`
- `waiting_on_internal_follow_up`
- `waiting_on_customer_response`
- `not_qualified`

## Multi-Tenant Requirements

Opportunity must follow the same organization-scoped rules as the rest of the platform:
- organization-owned record
- no cross-tenant access
- RLS required
- canonical naming across database, domain, API, and UI layers

## Current Implementation Note

Opportunity is not implemented today.

This document defines the intended model so it can be introduced cleanly without forcing project, estimate, and workflow logic to be rethought later.

