# Full App Experience Review

Status: Active
Doc Type: Audit Note

Date: 2026-05-25

## Scope Reviewed

- Contractor shell, workspace header, command bar, and shared empty-state patterns
- Dashboard command center and AI Operational Digest copy
- Projects Manager Page and Project Workspace Copilot panel
- Schedule CrewBoard route and job execution workspace
- Accounts Receivable collections workspace
- Communications review workspace and Copilot draft handoff language
- Daily Logs manager and Daily Log Workspace
- Settings workflow guidance and assistance controls
- Customer portal home, project workspace, estimate, contract, and invoice review surfaces

## High-Impact Issues Found

- Shared workspace headers and command bars needed a little more mobile containment so long organization names, descriptions, or action clusters do not crowd the layout.
- A few high-visibility labels overused "intelligence" or repeated "AI" where the product behavior is actually review-first guidance and draft preparation.
- Project manager copy still leaned on "lead" as a first-class label in prominent UI even though current implementation guidance prefers opportunity language for the earliest commercial stage.
- Accounts Receivable had the right non-mutating behavior, but the section framing could be clearer as a follow-up queue rather than an implied automation surface.

## Changes Made

- Tightened shared contractor workspace header wrapping and summary containment.
- Made command-bar actions align naturally on mobile while preserving right alignment on wider screens.
- Reframed Projects as project command centers and changed prominent lead-stage copy to opportunity-stage language without changing routes, statuses, data, or workflow logic.
- Reframed AR collections from "Collections intelligence" to "Collections review" and changed draft actions to "Review draft."
- Reframed Project Workspace Copilot from "Project intelligence" to "Project guidance" and made the draft composer explicitly review-first.
- Calmed Settings workflow-assistance copy so AI-related toggles read as governed advisory preferences, not autonomous capabilities.

## Remaining P1/P2 Polish Items

- P1: No P1 polish defects were found on the saved-auth routes checked in this pass.
- P2: Continue normalizing older rounded-full/rounded-2xl detail panels on Job and portal document review routes toward the Graphite/Copper 4-8px radius grammar.
- P2: Consider a small shared status/action label helper for Manager Dashboard cards after one more route inventory confirms the repeated vocabulary is stable.
- P2: Review portal document action sections on narrow mobile for button stacking and long customer/project names.

## Browser QA Summary

Saved-auth Playwright smoke was run against the local dev server on desktop and
390px mobile. The pass covered `/dashboard`, `/projects`, one Project
Workspace, `/schedule`, `/financials/accounts-receivable`, `/communications`,
`/daily-logs`, one Daily Log Workspace, one Job Workspace,
`/settings/workflows`, `/portal`, one portal Project Workspace, and portal
estimate/contract/invoice review routes. No runtime console errors or
horizontal overflow were observed on those checked routes.

This pass did not add schema, migrations, provider calls, autonomous actions,
external sends, notifications, fake/demo data, portal-only records, duplicate
business models, payment/signature/document mutation, or route architecture
changes.
