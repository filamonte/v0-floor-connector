# AI Guided System Plan

Status: Active
Doc Type: Planning
Date: 2026-05-17

## Purpose

This plan defines how FloorConnector should evolve from deterministic workflow guidance into a guided operating system without creating AI-only records, autonomous actions, provider coupling, or a second workflow truth.

Current implemented truth remains in [docs/current-state.md](C:/FloorConnector/docs/current-state.md). This document is planning and does not authorize schema, provider, automation, billing, signature, payment, portal-access, readiness-gate, or lifecycle behavior changes.

Canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Current Implemented Guidance

- Project Workspace is the primary readiness and continuity hub.
- Dashboard `My Work`, record-level `Needs Attention`, Project Workspace suggested actions, and Schedule handoffs use deterministic cues over canonical records.
- Dashboard Operational Cockpit buckets now separate guidance posture into `Needs attention`, `Ready to move`, `Waiting on customer/payment/signature`, and `Field/production follow-up` without adding cue persistence or autonomous actions. The cockpit previews now use a dashboard-specific read model for bounded top-N record loading where readiness/cue semantics do not require the existing exact derivation path, project readiness previews now use a batched helper that preserves the exact existing readiness semantics for dashboard cues and ready-project handoffs, dashboard overview counts/current-person/appointment previews now use bounded dashboard reads, the remaining project/estimate/contract/invoice/job dashboard cue inputs now flow through a dashboard-specific read model with explicit selected columns, exact count-only totals where needed, and top-N preview queues, and operational cue candidate loading now skips disabled rule families while keeping deterministic cue derivation and suppression behavior authoritative.
- Project Workspace now shows current stage, blocker, next action, and related driving record in one shared guidance summary using existing readiness snapshots, linked records, and workflow guidance preferences.
- Organization workflow settings can reduce or expand guidance intensity through Guided, Flexible, and Manual modes.
- Operational cue rules and responsibility defaults are tenant-owned settings.
- Cue response state can dismiss or snooze deterministic cue identities where implemented.
- Cue-to-work-item behavior is user-confirmed and limited to approved contexts.

## Deterministic Cue Architecture

The current architecture is the correct base:

- derive cues from canonical records and rule settings at query time
- show evidence, threshold, source, urgency, and safe route
- suppress with cue-state responses instead of persisted cue-instance truth
- route to Project, Estimate, Contract, Invoice, Job, Schedule, or existing work-item forms
- keep readiness gates and financial/payment/signature rules authoritative

Do not add AI provider calls as cue detectors. Future AI should explain, summarize, and draft around deterministic evidence.

## Gaps To Close

- Guided/Flexible/Manual behavior is not yet consistent across every workspace and Manager Page.
- Dashboard guidance still mixes awareness, next action, and module entry in places.
- Some empty states explain absence, but not the upstream workflow condition that would make the record appear.
- Project Workspace is strong, but Estimate, Contract, Invoice, Job, Schedule, and Progress Billing can keep improving handoff explanations.
- Settings do not yet show a full organization-level policy model for future AI assistance boundaries.
- There is no AI approval queue, draft review system, or provider-safe send path.

## Guided / Flexible / Manual Mode Recommendation

Guided mode:

- show next-best action, readiness blockers, evidence, and suggested route
- group canonical workflow actions separately from human follow-up
- explain why unavailable actions are blocked

Flexible mode:

- keep critical status, payment, signature, portal, readiness, and security facts visible
- reduce coaching copy and secondary explanations
- keep one primary action per section where possible

Manual mode:

- keep record facts, blockers, and financial/legal/security warnings visible
- reduce next-step coaching and optional explanation panels
- never hide readiness, payment, signature, access, or tenant-safety truth

## Settings Recommendations

Organization-level settings should govern:

- default guidance mode
- next-best-action visibility
- blocker/explanation density
- future AI draft availability by category
- future approval requirements for customer-facing, billing, scheduling, permission, and legal actions

User-level settings should govern:

- personal cue snooze/dismiss preferences
- notification density
- personal dashboard queue mode
- optional personal AI assistance preferences where allowed by organization policy

Organization policy must override user preference for risky actions.

## Deterministic Vs Future AI Boundaries

Deterministic system:

- detects operational cues
- computes readiness and blockers
- routes safe next steps
- enforces visibility and suppression state

Future AI:

- summarizes project history
- explains blockers in plain language
- drafts customer or internal messages
- prepares form values for review
- proposes schedule or follow-up options

Future AI must not:

- own source of truth
- auto-send customer messages
- change estimates, contracts, invoices, payments, schedules, permissions, or portal access
- bypass readiness gates or financial correctness

## Anti-Silo Guardrails

- No `ai_leads`, `ai_projects`, `ai_estimates`, `ai_invoices`, AI-only calendars, or AI-only communication logs.
- AI outputs attach to canonical records as drafts, summaries, or proposals only after a scoped implementation.
- Customer-facing or financial actions require human approval and existing server-side workflows.
- Project remains the operational hub; AI does not become a separate work universe.

## Phased Roadmap

1. Normalize presentation language for guidance, blockers, and empty states across operational workspaces.
2. Expand deterministic cue coverage only where canonical source fields and safe routes already exist.
3. Add organization/user settings for guidance and future AI policy boundaries.
4. Add AI summaries and drafts as review-only assistance around deterministic cue evidence.
5. Add approval queues for risky AI-prepared actions after communication, consent, audit, and permission boundaries are designed.

## First 5 Safe Implementation Slices

1. Add shared guidance copy patterns to Progress Billing, Schedule, and Invoice empty/blocked states.
2. Done in part: Project Workspace now summarizes current stage, blocker, next action, and related driving record from existing canonical records. A deeper route-by-route guidance audit remains useful.
3. Done in part: Dashboard now has Operational Cockpit buckets that distinguish attention, ready handoff, waiting, and field/production follow-up. A bounded cockpit read-model pass narrows many bucket previews, a batched dashboard readiness helper reduces per-project readiness fan-out while preserving exact readiness semantics, dashboard overview counts/current-person/appointment reads are narrowed, the project-cue input read model retires broad dashboard project/estimate/contract/invoice/job list loading, and operational cue candidate reads skip disabled rule families without changing visible create behavior, suppression state, or readiness gates.
4. Add settings copy that clarifies AI assistance preferences are separate from workflow guidance and never authorize autonomous action.
5. Add tests for guidance-mode critical-fact visibility on Project Workspace and one finance workspace.
