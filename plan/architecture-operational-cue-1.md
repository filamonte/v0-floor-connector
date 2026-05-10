---
goal: Establish Operational Cue Architecture for FloorConnector
version: 1.0
date_created: 2026-05-09
last_updated: 2026-05-09
owner: FloorConnector Team
status: Planned
tags: architecture, operational-intelligence, workflow, cue-engine
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

Establish the foundational Operational Cue Architecture to enable derived operational intelligence across FloorConnector, supporting workflow cues, custom rules, ownership, escalation, and future AI integrations without creating siloed systems.

## 1. Requirements & Constraints

- **REQ-001**: Define operational cues as derived, contextual, canonical-workflow-aware states (e.g., awaiting estimate follow-up, deposit overdue).
- **REQ-002**: Support organization-defined custom operational logic via cue rules (e.g., if estimate sent and not contacted in 3 days → follow-up cue).
- **REQ-003**: Ensure cues do not create detached tasks or duplicate workflow entities; maintain canonical continuity.
- **REQ-004**: Enable ownership assignment, escalation signals, and urgency markers derived from workflow state.
- **REQ-005**: Prepare for future AI recommendations and notification integrations as pluggable layers.
- **CON-001**: All cues must be dynamically recalculated from canonical records without manual intervention.
- **CON-002**: Architecture must prevent automation spaghetti and maintain debuggability.
- **GUD-001**: Follow anti-silo principles; unify follow-ups, reminders, readiness, and queue logic under one shared system.
- **PAT-001**: Use workflow intelligence derivation model instead of static task creation.

## 2. Implementation Steps

### Implementation Phase 1: Define Core Concepts and Data Model

- GOAL-001: Establish the conceptual foundation for operational cues, rules, and derivation logic.

| Task     | Description           | Completed | Date |
| -------- | --------------------- | --------- | ---- |
| TASK-001 | Document operational cue definition: derived states like 'awaiting estimate follow-up' with properties (type, context, urgency, ownership). |           |      |
| TASK-002 | Define cue derivation rules: how cues are calculated from canonical workflow state (e.g., based on timestamps, status transitions). |           |      |
| TASK-003 | Specify cue rules engine: organization-configurable logic for custom cues (e.g., conditional expressions on workflow events). |           |      |
| TASK-004 | Outline ownership and escalation model: how cues assign to users/roles and trigger escalations based on time/conditions. |           |      |
| TASK-005 | Design integration points for AI and notifications: pluggable interfaces for recommendations and alerts. |           |      |

### Implementation Phase 2: Schema and Engine Design

- GOAL-002: Create database schema and core engine components for cue management.

| Task     | Description           | Completed | Date |
| -------- | --------------------- | --------- | ---- |
| TASK-006 | Design cue schema: tables for cues (id, type, context, urgency, ownership, created_at, updated_at) with RLS for tenant isolation. |           |      |
| TASK-007 | Design cue rules schema: tables for organization-defined rules (conditions, actions, priority) linked to cues. |           |      |
| TASK-008 | Implement cue derivation engine: background service to recalculate cues from workflow state changes. |           |      |
| TASK-009 | Add cue ownership logic: functions to assign cues based on workflow roles and escalation rules. |           |      |
| TASK-010 | Create cue persistence layer: migrations and types for cue storage with audit trails. |           |      |

### Implementation Phase 3: Validation and Documentation

- GOAL-003: Validate the architecture and document for future implementation.

| Task     | Description           | Completed | Date |
| -------- | --------------------- | --------- | ---- |
| TASK-011 | Review architecture against anti-silo principles: ensure no duplicate entities or disconnected systems. |           |      |
| TASK-012 | Document API interfaces: cue query endpoints, rule configuration APIs, and integration hooks. |           |      |
| TASK-013 | Create example cue rules: sample configurations for common scenarios (estimate follow-up, deposit overdue). |           |      |
| TASK-014 | Validate with existing workflow: ensure cues derive correctly from current canonical records. |           |      |
| TASK-015 | Update AGENTS.md and related docs: document the operational intelligence layer in platform architecture. |           |      |

## 3. Alternatives

- **ALT-001**: Implement as a task engine with static records - rejected because it creates silos and duplicates workflow logic.
- **ALT-002**: Build separate automation frameworks per module - rejected due to spaghetti complexity and debugging issues.
- **ALT-003**: Use external workflow tools like Zapier - rejected to maintain canonical control and avoid vendor lock-in.

## 4. Dependencies

- **DEP-001**: Canonical workflow records (estimates, contracts, jobs) must exist and be queryable.
- **DEP-002**: Tenant isolation via RLS in database.
- **DEP-003**: Background job system for cue recalculation.
- **DEP-004**: Organization configuration framework for custom rules.

## 5. Files

- **FILE-001**: New schema files in supabase/migrations/ for cue and rule tables.
- **FILE-002**: Core engine files in packages/ for cue derivation logic.
- **FILE-003**: API files in apps/web/ for cue queries and rule management.
- **FILE-004**: Documentation updates in docs/ for operational intelligence architecture.

## 6. Testing

- **TEST-001**: Unit tests for cue derivation logic from mock workflow states.
- **TEST-002**: Integration tests for cue recalculation on workflow changes.
- **TEST-003**: Validation tests for custom rule execution and ownership assignment.
- **TEST-004**: Performance tests for cue engine scalability with large datasets.

## 7. Risks & Assumptions

- **RISK-001**: Cue derivation logic becoming complex and hard to debug if not properly abstracted.
- **ASSUMPTION-001**: Canonical workflow state is consistently maintained across modules.
- **ASSUMPTION-002**: Organizations will define reasonable custom rules without creating infinite loops.

## 8. Related Specifications / Further Reading

[FloorConnector AGENTS.md](AGENTS.md) - Core architecture rules and multi-tenant constraints.  
[Workflow Intelligence Infrastructure Concept](docs/architecture.md) - High-level workflow design.  
[ActiveCampaign CRM Workflows](https://www.activecampaign.com/blog/activecampaign-crm-workflows) - Industry examples of workflow complexity to avoid.
