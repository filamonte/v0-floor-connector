# AI Marketing And Onboarding

Status: target direction and planning guardrail only.

This document describes FloorConnector-facing AI for growth, sales, onboarding, activation, support, and customer success. It does not describe implemented product behavior unless [docs/current-state.md](C:/FloorConnector/docs/current-state.md) says that behavior exists.

Use this with:

- [docs/ai-assisted-operating-system.md](C:/FloorConnector/docs/ai-assisted-operating-system.md)
- [docs/communications-and-ai-intake.md](C:/FloorConnector/docs/communications-and-ai-intake.md)

## Audience

This AI direction serves FloorConnector as the platform company. It is separate from contractor-facing operations AI, which helps contractors run their own customer, project, estimate, schedule, communication, and billing workflows.

Both audiences share the same safety principles:

- AI is an operating layer, not a parallel system
- no duplicate business models
- provider and chat data are not business truth
- risky actions require human confirmation
- implemented truth remains in [docs/current-state.md](C:/FloorConnector/docs/current-state.md)

## Customer Journey

FloorConnector's own growth and activation journey should be:

`visitor -> signup -> setup -> activation -> first successful workflow -> retained customer`

AI should reduce friction along this journey without creating fake onboarding data, demo-only workflows, or duplicate account models.

## Public Marketing-Page AI Assistant

Target direction:

- answer high-level product, trade fit, workflow, pricing-plan, onboarding, and demo questions
- route qualified visitors to signup, demo request, or human sales
- capture structured qualification notes where consent and policy allow
- avoid promising unavailable product features as implemented

The marketing assistant should use approved public product knowledge and link target-only ideas back to planning docs when needed.

## Sales And Demo Q&A

Target direction:

- help sales answer contractor-specific questions about estimating, contracts, scheduling, payments, portal, field workflows, and integrations
- summarize prospect needs and likely fit
- prepare demo paths based on contractor type and pain points
- flag target-only features so sales does not overclaim implementation status

Human sales remains responsible for commercial commitments.

## Onboarding Assistant

Target direction:

- guide a new contractor through signup, company setup, billing/setup readiness, pending activation, and first app entry
- explain what information is needed and why
- route back into real setup pages and canonical organization records
- identify incomplete setup or activation blockers

The assistant should not create a separate onboarding table or sandbox-only state unless a future approved implementation explicitly scopes such support records.

## Setup Wizard Assistant

Target direction:

- recommend initial settings based on company size, trade, service mix, sales process, deposit policy, and operating model
- help configure organization profile, locations, defaults, templates, catalogs, communication preferences, and integrations where implemented
- distinguish required setup from optional progressive enrichment

Configuration writes must use approved settings workflows and server-side validation.

## Module And Plan Recommendation

Target direction:

- recommend modules or plan paths based on company needs
- explain what is implemented, planned, or unavailable
- surface setup prerequisites before enabling external communication, payment, scheduling, or integration features

Entitlement, billing, and activation changes require approved platform workflows and human/operator confirmation where risk exists.

## Configuration Guidance

Target direction:

- explain deposit readiness, contract settings, estimate templates, catalog setup, notification preferences, and future integration setup
- identify configuration gaps that block the first successful workflow
- summarize what has been configured and what remains

AI should help the user understand configuration; it should not silently change production-affecting settings.

## Support Assistant

Target direction:

- answer how-to questions from documentation and implemented product behavior
- summarize user/account context for support where permissions allow
- draft support replies and operator notes
- escalate to human support when confidence is low, account-specific mutation is needed, or a billing/security issue appears

Support AI should never expose secrets, bypass role checks, or present target-only plans as implemented behavior.

## First-Project And First-Estimate Guided Walkthrough

Target direction:

- guide new contractors through creating their first real project and estimate
- explain the canonical workflow path and where the next action lives
- help users avoid duplicate records by routing through Quick-Create and Record Workspaces
- summarize the first successful workflow milestone

The walkthrough should operate on real canonical records. It must not create fake demo business data unless the user explicitly asks for a demo/seed workflow and that workflow is separately designed.

## Migration And Import Helper

Target direction:

- help contractors map existing customer, project, catalog, estimate, invoice, and document data into FloorConnector concepts
- detect likely duplicates or missing fields
- prepare import review summaries
- route accepted imports through approved import workflows

AI should not directly write imported data into canonical records without validation, review, and tenant-safe server-side import paths.

## Human Escalation

Escalate to a human for:

- sales commitments
- billing, subscription, or activation changes
- data imports with ambiguity
- support issues requiring account mutation
- security, permission, or privacy questions
- low-confidence answers
- complaints, cancellation intent, or high-value prospects

Handoff should include transcript or summary, prospect/account context, recommended next action, and unresolved questions.

## What Is Not Implemented

Unless [docs/current-state.md](C:/FloorConnector/docs/current-state.md) says otherwise, the following remain target direction:

- public marketing AI assistant
- sales/demo Q&A assistant
- onboarding assistant
- setup wizard assistant
- module/plan recommendation AI
- support assistant
- first-project or first-estimate guided AI walkthrough
- migration/import AI helper

These should be planned as FloorConnector-facing assistance layers, not contractor operations AI and not replacement business records.
