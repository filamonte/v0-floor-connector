# Implementation Boundaries

Status: Stable
Doc Type: AI Guidance

This document defines what AI tools must not invent when producing implementation prompts, UI passes, or code changes.

## Do Not Invent

- duplicate customer, project, invoice, payment, contract, or portal models
- portal-only copies of canonical records
- website-only lead stores or marketing-contact databases
- AI-only lead, project, estimate, calendar, payment, or communication truth
- provider-owned business truth
- localStorage or mock persistence for canonical workflows
- module-local queues that hide the shared project and record chain
- direct takeoff-to-invoice or catalog-to-normal-invoice shortcuts
- payment, signature, tax, subscription, entitlement, or runtime enforcement behavior not supported by current-state
- route changes from target IA without explicit implementation scope

## Required Boundaries

- Use canonical records first.
- Preserve tenant isolation.
- Validate external input at server boundaries.
- Keep provider SDK logic behind adapters/service boundaries.
- Human confirmation is required for risky customer-facing, commercial, legal, billing, scheduling, permission, or compliance actions unless an approved workflow explicitly says otherwise.
- Route target/future docs through current-state before treating them as implemented.
- Treat diagrams as conceptual orientation, not exhaustive schema, route, or module truth.

## Prompt Safety

When writing prompts for Codex, v0, or ChatGPT:
- include whether the task is docs-only, UI-only, or implementation
- name the docs to read first
- state what must not change
- state implemented-vs-future boundaries
- preserve the canonical lifecycle exactly
