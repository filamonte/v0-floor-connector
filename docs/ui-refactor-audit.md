# Decision-First UI Refactor Audit

Status: Phase 3 audit for the decision-first UI refactor.

Scope: contractor app only. This audit is documentation-only and records risks before page-level refactors begin.

Related plan: `plan/refactor-decision-first-ui-1.md`.

Note: the prompt referenced `docs/refactor-decision-first-ui-1.md`, but the matching plan currently exists at `plan/refactor-decision-first-ui-1.md`.

## Summary

The contractor app already has a coherent black/gray/orange workspace direction, top-nav-first shell, shared Manager Page rhythm, and shared Record Workspace direction. The remaining decision-first gaps are mostly page hierarchy and action clarity, not missing data or new workflow requirements.

Safe refactor direction:
- keep project detail as the primary workflow/readiness hub
- keep Manager Pages as cross-record queues, not alternate workflow models
- place the most important next action above passive summary content
- reduce repeated summaries before removing any existing action or guardrail
- preserve current server actions, forms, permissions, readiness logic, and linked-record workflows

## Dashboard

Findings:
- Priority metrics and header stats are compact, but the current metric grid gives passive counts and action-worthy items similar weight.
- Multiple queue grids stack below the priority area, which can blur urgency once the first row is past.
- Icon usage is low risk; the surface is not especially icon-heavy.

Refactor guidance:
- introduce a focused PriorityStrip before passive metrics
- keep existing dashboard data sources only
- keep Quick-Create routed through existing canonical create flows
- avoid turning dashboard queues into module-local workflow models

## Project Detail

Findings:
- Project detail is the densest contractor surface and relies on many repeated detail panels.
- Readiness/commercial state appears in multiple places, which can bury the single next best action.
- The page contains important sequencing around estimate approval, contract, deposit or financing, job creation, scheduling, and invoicing.

Refactor guidance:
- put ActionBar, WorkflowBar, and ProjectStateSummary near the top
- group estimate, contract, job, and invoice as the core workflow
- move execution and support content below the core workflow
- preserve all readiness logic and project hub behavior

Risky areas to avoid:
- do not simplify away project readiness blockers
- do not bypass or reinterpret `assertProjectReadinessGate(projectId)`
- do not remove existing project actions, links, or connected record handoffs

## Estimates

Findings:
- Estimate manager queues have several equal-weight cards, including responses, sent approval, drafts, approved, and rejected.
- Estimate detail has multiple summaries: summary band, approval next steps, document review, and side panels.
- Estimate Editor navigation uses an icon for every section, which may feel busy during a decision-first cleanup.

Refactor guidance:
- make total, status, approval state, and the next safe action more prominent
- preserve the existing Estimate Editor, catalog/system generation, approval locking, totals, tax, discounts, and save behavior
- keep approved snapshot and contract-generation guidance intact

Risky areas to avoid:
- do not disturb catalog-backed line item insertion or generated estimate line behavior
- do not change tax, discount, total, approval, or approved-snapshot behavior
- do not introduce user-facing manual freeform estimate rows

## Invoices

Findings:
- Invoice detail repeats billing meaning across identity, summary band, invoice review, payment recording, connected records, and metadata panels.
- Payment recording, schedule, connected records, metadata, and communication create a long equal-weight panel stack.

Refactor guidance:
- make the invoice review and balance/payment state the first hierarchy
- put payment recording in the clearest next-action position when eligible
- keep connected lineage visible but secondary to review and balance

Risky areas to avoid:
- do not blur invoice lineage distinctions across SOV/progress, deposit, approved estimate, job, change order, and invoice-only adjustments
- do not make invoice creation or editing appear freeform
- preserve payment recording, statuses, balance display, and existing guards

## Jobs

Findings:
- Job manager queues give unscheduled, scheduled without crew, scheduled without assignments, and in-progress work similar visual priority.
- Job detail has a useful summary band, then repeats operational state, schedule/crew forms, field execution, billing handoff, connected records, and communication in a long stack.
- The next-action card appears near the top, but the matching actionable control may sit lower on the page.

Refactor guidance:
- make schedule/crew/execution state the leading hierarchy
- keep job action controls visually paired with the next action
- place billing and support context below execution-critical content

Risky areas to avoid:
- preserve schedule, unschedule, crew assign, and unassign behavior
- do not weaken readiness gates on job creation, scheduling, or execution transitions

## Contracts

Findings:
- Contract detail repeats status and workflow context across identity, summary band, workflow actions, schedule handoff, signer routing, connected workflow, and support panels.
- Signer routing and schedule handoff are useful, but compete with the core send/sign/countersign sequence when placed as equal panels.

Refactor guidance:
- make send, signing, onsite signature, countersign, and readiness state the primary hierarchy
- move connected workflow and schedule handoff below the signing path
- preserve portal-facing canonical contract workflow and contractor-side onsite signing

Risky areas to avoid:
- preserve internal approval, send readiness, signer routing, onsite signature, countersign, and canonical signature events
- do not create portal-only contract/signature records

## List And Manager Pages

Findings:
- Projects, customers, estimates, invoices, jobs, and contracts mostly follow the shared Manager Page pattern, but queue cards often carry similar weight.
- Header summary tiles can repeat status counts that also appear in queue cards and filters.
- Row actions often say `Review`, `View`, or `Open`; the row itself does not always name the next best action.

Refactor guidance:
- prioritize one or two action queues before passive summaries
- use status badges semantically and keep orange for primary CTAs
- add concise next-action guidance where it can be derived from existing data
- keep list pages as global queues and managers, not alternate workflow homes

## Follow-Up Plan

Recommended next phase: Phase 4 Project detail refactor.

Before editing project detail:
- inspect existing project action links and readiness calculations
- identify the smallest extraction path for ActionBar, WorkflowBar, and ProjectStateSummary
- preserve every existing action and connected-record link
- run browser QA against one real project detail page after validation passes
