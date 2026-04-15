# Figma Redesign Brief

This document is a design brief for future Figma work on the contractor app.

It should be read alongside:
- [workflow-spec.md](C:/FloorConnector/docs/workflow-spec.md): primary contractor journey
- [workflow-state-machine.md](C:/FloorConnector/docs/workflow-state-machine.md): stages, blockers, and transition rules
- [target-ia.md](C:/FloorConnector/docs/target-ia.md): target contractor app information architecture
- [current-state.md](C:/FloorConnector/docs/current-state.md): implemented truth today

## Purpose

The next redesign effort should not start from visual polish alone.

It should start from a clearer answer to:
- what the primary contractor journey is
- what the system should guide users to do next
- what belongs in project context versus global queues
- how sales, operations, and finance hand off work

This brief is intended to help Figma focus on workflow clarity before aesthetic exploration.

## Core Product Problem

The underlying canonical model is strong, but the current experience still exposes too many module boundaries too early.

Today, users are often asked to think in:
- customers
- projects
- estimates
- contracts
- jobs
- invoices

The target experience should instead help them think in:
- sell the job
- get it approved and signed
- make it ready for production
- schedule and execute the work
- invoice and collect

## Design Objective

Design the contractor app so it feels like one continuous operating system for flooring contractors rather than a set of separate modules.

The UI should guide users through:
- the current stage
- what is blocking forward progress
- what the next best action is
- which records are connected to the work

## Primary Workflow To Design Around

The primary contractor path should be:

`Opportunity / Intake -> Customer -> Project -> Estimate -> Contract -> Financial Readiness -> Job / Schedule -> Invoice -> Payment`

Design should reinforce this as the default path.

Fallback workflows can still exist, but should be visually secondary.

## Primary Design Principles

### 1. Project Is The Main Workspace

Once work is real enough to deliver, project should become the main operating surface.

Project should explain:
- what stage the job is in
- what is blocked
- what needs to happen next
- which estimate, contract, job, and invoice records are attached

### 2. Queues Support The Workspace

Global pages should still exist, but their role is:
- queue management
- cross-project review
- approvals
- finance oversight

They should not feel like the primary place to understand a single job lifecycle.

### 3. Show Blockers, Not Just Statuses

Statuses alone are not enough.

Users should quickly understand:
- waiting on customer
- waiting on estimate revisions
- waiting on signature
- waiting on deposit
- ready to schedule
- waiting on payment

### 4. Make Next Actions Obvious

Each major surface should answer:
- what should I do now?

Examples:
- send estimate
- revise estimate
- generate contract
- send contract
- mark ready to schedule
- create invoice
- record payment

### 5. Keep Connected Records Visible

Users should not have to remember where the related record lives.

The design should keep major connected records easy to reach from within project context:
- estimate
- contract
- jobs
- invoices
- activity

## Recommended Navigation Direction

The target contractor app navigation should remain:
- Dashboard
- Customers
- Projects
- Financials
- People
- Field
- Documents
- Communications
- Settings

For this redesign phase, the most important shift is:
- make `Projects` the primary operational root
- treat `Financials` and `Field` as cross-project queue surfaces

## Priority Screens To Redesign First

### 1. Project Workspace

This should become the main operational shell.

It should include:
- stage
- blockers
- next best action
- customer summary
- project summary
- connected commercial records
- connected operational records
- connected financial records
- recent activity

Recommended sections:
- Overview
- Estimate
- Contract
- Jobs / Work Orders
- Schedule
- Invoices
- Files
- Activity

### 2. Dashboard

Dashboard should become a role-aware action summary, not just a generic landing page.

It should answer:
- what needs attention today
- what is waiting on customer
- what is ready for operations
- what finance needs to chase

### 3. Estimate Review Surface

Estimate detail should remain readable and proposal-oriented, but should better frame:
- approval status
- revision loop
- contract generation readiness
- why the user should or should not move forward

### 4. Contract Review Surface

Contract detail should emphasize:
- signed/not signed
- editable/locked state
- source estimate context
- invoice readiness and downstream impact

### 5. Invoice Surface

Invoice detail should emphasize:
- billing source context
- payment state
- tax/retainage visibility
- collections readiness

## Desired UX Behaviors

### In Project Workspace

Users should see:
- one primary call to action
- one or two blockers
- all key linked records

Users should not need to decide between many equally weighted actions.

### In Global Queues

Users should see:
- urgent items first
- blocked items clearly labeled
- role-relevant actions

Examples:
- estimates awaiting customer
- contracts awaiting signature
- projects ready to schedule
- invoices awaiting payment

### In Detail Pages

Each detail page should answer:
- what is this
- how does it connect to the rest of the job
- what can I do now
- what is preventing the next step

## Information Hierarchy Guidance

Every major screen should prioritize this order:
1. current stage / state
2. blockers
3. next best action
4. connected records
5. supporting details

The current tendency to foreground raw record editing should be reduced over time.

## Interaction Guidance

Prefer:
- workflow actions
- explicit progression controls
- clear linked-record navigation
- visible blockers
- role-aware summaries

Avoid:
- many equal-priority creation buttons
- forcing users to infer process from record types
- hiding readiness logic inside multiple disconnected pages

## Role Considerations

### Sales View

Needs to prioritize:
- intake
- estimate progression
- customer review
- contract progression

### Operations View

Needs to prioritize:
- ready-to-schedule work
- active jobs
- blocked production work

### Finance View

Needs to prioritize:
- invoices to send
- overdue balances
- partially paid invoices
- tax and retainage visibility

## Constraints

The redesign should respect:
- the existing canonical shared data model
- multi-tenant organization scoping
- the modular-monolith architecture
- shared templates and future module toggles

The redesign should not assume:
- a totally new information architecture implemented immediately
- separate data silos per workflow
- a detached design concept that ignores current implementation reality

## What Success Looks Like

A contractor should be able to answer these questions quickly:
- where is this job in the lifecycle?
- what is blocking it?
- what do I do next?
- where do I find the connected estimate, contract, job, and invoice?
- what needs follow-up today?

If the redesign achieves that, it is moving in the right direction.

## Recommended Design Sequence

Design work should proceed in this order:
1. project workspace
2. dashboard / role queues
3. estimate review
4. contract review
5. invoice review

This keeps the redesign aligned with the real workflow rather than starting with isolated module polish.
