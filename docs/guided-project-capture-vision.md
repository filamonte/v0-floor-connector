# Guided Project Capture Vision

Status: Planned
Doc Type: Product Direction

Guided Project Capture is a future workflow stage that sits between Lead Intake
and Estimate Creation. It is not implemented unless
[docs/current-state.md](C:/FloorConnector/docs/current-state.md) explicitly says
otherwise.

Related documents:

- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): implemented truth
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md): canonical workflow direction
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md): target sales and production flow
- [docs/vision.md](C:/FloorConnector/docs/vision.md): long-term product vision
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md): target contractor app information architecture

## Purpose

Guided Project Capture formalizes a future structured assessment workflow before
estimating begins. It should help customers, sales representatives, estimators,
and field personnel create a reusable project assessment package that improves
estimating readiness without turning capture into the estimate itself.

The current broad workflow is:

`Lead -> Site Visit -> Estimate`

The future workflow direction is:

`Lead -> Guided Project Capture -> Assessment Package -> Estimate`

Guided Project Capture should reduce estimating labor, increase estimating
throughput, improve lead qualification, improve project readiness, improve data
continuity, support future AI-assisted estimating, support future customer
self-service estimating workflows, and strengthen sales-to-production
continuity.

## Core Principle

Guided Project Capture is not an estimating feature.

It is a pre-estimate workflow stage that gathers structured project context,
requirements, measurements, visuals, conditions, and readiness signals so a
human estimator can create or review estimate content with better inputs.

Assessment data may eventually inform estimates, revised estimates, change
orders, scheduling, production planning, field handoff, job execution,
invoicing, and customer communication. The estimate remains the customer-facing
commercial scope and price.

## Assessment Package

An Assessment Package is a future reusable project asset. It belongs to the
Project, not to an Estimate.

An Assessment Package may contain:

- measurements
- room or area layouts
- photos
- videos
- site-condition observations
- substrate information
- moisture observations
- crack and joint observations
- prep requirements
- product preferences
- visualizer selections
- financing interest
- customer goals
- customer requirements
- AI-generated observations
- confidence scores

Assessment Packages should be reusable across the project lifecycle. They may
eventually support:

- estimates
- revised estimates
- change orders
- scheduling
- production planning
- field handoff
- job execution
- invoicing
- customer communication

The boundary is important: the Assessment Package is source context and project
memory. It should not own pricing, become an estimate, bypass catalog or System
Template mapping, or create a detached estimating workflow.

## Area / Space Modeling

Guided Project Capture should eventually support project area modeling. A
project may contain areas or spaces such as:

- Living Room
- Kitchen
- Basement
- Bedroom 1
- Bedroom 2

Areas may eventually contain:

- measurements
- dimensions
- square footage
- perimeter
- flooring type
- substrate type
- moisture information
- prep notes
- product selections
- installation requirements
- photos
- AI observations

Area / Space Modeling is future architecture direction only. It should extend
project-scoped assessment and takeoff context without creating a duplicate
project, estimate, room, or field model disconnected from the canonical chain.

## Mobile Strategy

Mobile web should come before native applications. The preferred roadmap is:

Phase 1:

- customer mobile web capture
- Guided Project Capture
- photos
- measurements
- product selection
- Assessment Package creation

Phase 2:

- estimator mobile workflow
- onsite assessment support
- enhanced measurement collection

Phase 3:

- field execution mobile
- daily logs
- field notes
- production workflows

Phase 4:

- AI-assisted capture

Phase 5:

- high-confidence autonomous estimating assistance

Native mobile applications may become appropriate later, but the first strategic
priority is responsive, tenant-safe, portal-safe mobile web capture over the
same canonical project chain.

## AI Strategy

Future AI should assist with:

- measurement interpretation
- project qualification
- room detection
- condition detection
- risk identification
- product recommendations
- estimate preparation
- production handoff preparation

AI prepares. Humans approve.

FloorConnector should prioritize:

`Customer + AI + Human Estimator`

over:

`Customer + Fully Autonomous Estimate`

AI may recommend, summarize, classify, and prepare estimate inputs. It must not
publish customer-facing estimates, create financial commitments, bypass human
review, or become a separate AI-only estimating source of truth.

## Assessment Confidence

Assessment Confidence is a future capability for deciding whether project
capture is ready for remote estimating, estimator review, or an onsite visit.

Possible confidence dimensions include:

- Measurement Confidence
- Condition Confidence
- Product Confidence

These scores may help determine whether:

- a remote estimate is acceptable
- estimator review is required
- an onsite visit is required

Confidence scoring is advisory. It should explain evidence quality and review
needs without replacing human judgment.

## Financing Signals

Guided Project Capture may eventually collect:

- financing interest
- prequalification signals
- budget expectations

The purpose is to evaluate financial readiness earlier in the workflow and help
sales teams prioritize the right next action before estimate effort is spent.

Financing signals should remain qualification and readiness context. They should
not create financing approval, lending commitments, payment records, or invoice
state by themselves.

## AI Risk Detection

Future AI-assisted capture may identify possible:

- cracks
- moisture concerns
- floor prep requirements
- coating failures
- substrate concerns
- installation risks

These are recommendations only. Human review remains authoritative.

Risk detection should improve handoff quality and help estimators or field teams
focus attention. It should not create autonomous scope, price, warranty,
schedule, or billing decisions.

## Lead Qualification

Guided Project Capture should act as a qualification layer before estimate work
begins.

Signals may include:

- capture completion
- photo completeness
- measurement completeness
- product-selection completion
- financing interest

These signals may become future sales-priority indicators. A more complete
Assessment Package may help sales teams decide which opportunities are ready for
remote estimate review, onsite assessment, follow-up, or disqualification.

## Strategic Positioning

Guided Project Capture reinforces FloorConnector as a connected contractor
operating system that progressively reduces information collection effort.

Core philosophy:

Information should be collected once and reused throughout the project
lifecycle.

That means:

- no duplicate data entry
- no disconnected estimating workflows
- no disconnected field workflows
- no disconnected customer workflows

Guided Project Capture should strengthen the existing canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

It should add better project-scoped context before estimating, not create a
parallel lead, estimate, field, portal, or AI system.
