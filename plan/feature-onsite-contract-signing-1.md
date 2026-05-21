---
goal: Implement Onsite Contract Signing in contractor app
version: 1.0
date_created: 2026-05-03
last_updated: 2026-05-03
owner: FloorConnector Engineering
status: 'Planned'
tags: [feature, contract, signature, ui, actions]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This plan defines a canonical implementation of onsite contract signing in the contractor app. It reuses existing contract signing models, avoids schema changes, and adds client UI plus a server action to record customer signatures with the canonical `contract_signers` and `contract_signature_events` flow.

## 1. Requirements & Constraints

- REQ-001: Implement onsite signing inside `apps/web` with no new contract model.
- REQ-002: Reuse existing canonical contract signer system and signature event schema.
- REQ-003: Do not introduce PDF-based or portal-only duplicate workflows.
- REQ-004: Preserve tenant isolation and existing auth/server patterns.
- CON-001: No database schema changes.
- CON-002: No new tables or duplicate contract/signature systems.
- GUD-001: Follow the existing `apps/web/lib/contracts` and page conventions.
- GUD-002: Use `contract_signers` and `contract_signature_events` for recording audit data.

## 2. Implementation Steps

### Implementation Phase 1

- GOAL-001: Prepare canonical contract signature surface and align with current actions.

| Task | Description | Completed | Date |
| --- | --- | --- | --- |
| TASK-001 | Inspect `apps/web/app/(app)/contracts/[contractId]/page.tsx`, `apps/web/components/contract-status-actions.tsx`, `apps/web/lib/contracts/actions.ts`, `apps/web/lib/contracts/data.ts`, and `apps/web/lib/contracts/schemas.ts` to confirm data and action integration points. | ✅ | 2026-05-03 |
| TASK-002 | Identify the canonical customer signing flow in `recordCustomerSignedContract` and the contract status conditions for `sent` / `viewed` plus required customer signer state. | ✅ | 2026-05-03 |
| TASK-003 | Determine the appropriate notification pattern by reviewing `searchParams` message handling in `apps/web/app/(app)/contracts/[contractId]/page.tsx`. | ✅ | 2026-05-03 |

### Implementation Phase 2

- GOAL-002: Add frontend UI and reusable signature pad component.

| Task | Description | Completed | Date |
| --- | --- | --- | --- |
| TASK-004 | Create `apps/web/components/ui/signature-pad.tsx` with a canvas supporting mouse/touch strokes, clear, and base64 PNG export. Expose `getSignature()` and `clear()`. |  | |
| TASK-005 | Create `apps/web/components/contracts/onsite-signature-modal.tsx` as a fullscreen modal containing contract title, customer name, instructions, the signature pad, clear button, and confirm button. |  | |
| TASK-006 | Add a `Sign Onsite` button to contract review actions shown only when `contract.status` is `sent` or `viewed` and a customer signer exists in `pending`/`viewed` state without a `signed_at` timestamp. Use `apps/web/app/(app)/contracts/[contractId]/page.tsx` to render the modal trigger. |  | |

### Implementation Phase 3

- GOAL-003: Implement server action and wire the flow.

| Task | Description | Completed | Date |
| --- | --- | --- | --- |
| TASK-007 | Add `recordOnsiteContractSignatureAction` to `apps/web/lib/contracts/actions.ts` as a new server action. |  | |
| TASK-008 | Validate input with a new schema in `apps/web/lib/contracts/schemas.ts`: `contractId`, `signerId`, `signatureImage`. |  | |
| TASK-009 | In the server action, validate the contract belongs to the org, the signer is on the contract, the role is `customer`, and the signer is not already signed. |  | |
| TASK-010 | Persist the signature image in the event payload; create a `contract_signature_event` with `eventType: 'signer_signed'`, `actorType: 'organization_user'`, and `source: 'onsite'` or equivalent payload metadata. Update `signed_at` on the signer. |  | |
| TASK-011 | If all required signers are signed after the update, update `contract.status` to `signed` using the existing contract state builder or helper pattern. |  | |
| TASK-012 | Refresh the contract page and show an inline message on success via `searchParams` or local UI state: `Contract signed`. |  | |

### Implementation Phase 4

- GOAL-004: Handle UI state, loading, and error conditions.

| Task | Description | Completed | Date |
| --- | --- | --- | --- |
| TASK-013 | Disable the confirm button until the signature pad has a stroke. |  | |
| TASK-014 | Show loading state while the server action submits and error text when it fails. |  | |
| TASK-015 | Close the modal after successful signature submission and refresh the contract detail data. |  | |

## 3. Alternatives

- ALT-001: Use the portal signature action flow directly. Rejected because the requirement is onsite contractor app signing, not portal-driven workflow.
- ALT-002: Store signature images in a new table. Rejected because schema changes are forbidden.
- ALT-003: Implement signatures as SVG only. Rejected in favor of the requested PNG base64 export and existing image payload compatibility.

## 4. Dependencies

- DEP-001: `apps/web/lib/contracts/data.ts` existing contract data access and signer query helpers.
- DEP-002: `apps/web/lib/contracts/actions.ts` server action infrastructure and `FormData` handling.
- DEP-003: `apps/web/lib/contracts/schemas.ts` Zod schema conventions.
- DEP-004: `apps/web/app/(app)/contracts/[contractId]/page.tsx` contract page rendering and message handling.

## 5. Files

- FILE-001: `apps/web/components/ui/signature-pad.tsx` – signature capture canvas component.
- FILE-002: `apps/web/components/contracts/onsite-signature-modal.tsx` – onsite signature modal UI.
- FILE-003: `apps/web/lib/contracts/actions.ts` – new `recordOnsiteContractSignatureAction` server action.
- FILE-004: `apps/web/lib/contracts/schemas.ts` – new input validation schema.
- FILE-005: `apps/web/app/(app)/contracts/[contractId]/page.tsx` – button wiring and modal integration.

## 6. Testing

- TEST-001: `pnpm typecheck` should pass after implementation.
- TEST-002: `pnpm lint` should pass after implementation.
- TEST-003: Manual workflow test: create estimate → approve → generate contract → open contract → click Sign Onsite → draw signature → confirm → contract status updates to `signed` and `Contract signed` is displayed.
- TEST-004: Verify `contract_signature_events` contains a `signer_signed` or `signature_completed` event with onsite metadata.

## 7. Risks & Assumptions

- RISK-001: If the contract already has a portal signer flow active, the new onsite action must not conflict with existing signature state. Implement strict signer and status validation.
- ASSUMPTION-001: The existing `contract_signers` and `contract_signature_events` tables already support event payload storage and do not require schema changes.
- ASSUMPTION-002: The contract detail page refresh can be achieved by navigation with search params or local state update.

## 8. Related Specifications / Further Reading

- `apps/web/lib/contracts/data.ts` canonical contract signature helpers
- `apps/web/lib/contracts/actions.ts` existing server actions and portal signature flow
- `docs/developer-source-of-truth.md` canonical implementation rules
- `docs/current-state.md` current repo architecture and workflow guardrails
