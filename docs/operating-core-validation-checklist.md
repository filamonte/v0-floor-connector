# Operating Core Validation Checklist

Status: Active
Doc Type: QA

## Purpose

This checklist inventories the focused validation surfaces for the recent
operating-core visibility layers. It is not a release gate by itself.

## Focused Tests

Run focused tests when touching the matching helper or route:

- Schedule warnings:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test apps/web/lib/schedule/warnings.test.ts`
- FieldTrail summary:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test apps/web/lib/fieldtrail/summary.test.ts`
- MessageCenter summary:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test apps/web/lib/messagecenter/summary.test.ts`
- ProjectPulse summary:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test apps/web/lib/projectpulse/summary.test.ts`
- CloseoutTrail summary:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test apps/web/lib/closeouttrail/summary.test.ts`
- Proof Center summary:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test apps/web/lib/proofcenter/summary.test.ts`
- Send Trail summary:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test apps/web/lib/sendtrail/summary.test.ts`
- Reports operations summary:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test apps/web/lib/reports/operations-summary.test.ts`
- Schedule read model:
  `pnpm.cmd --filter @floorconnector/web exec tsx --test apps/web/lib/schedule/read-model.test.ts`

## Manual Route Checks

When browser QA is available, manually check:

- `/projects/[projectId]` for ProjectPulse, FieldTrail, MessageCenter,
  CloseoutTrail, Proof Center, and source-record handoffs.
- `/schedule` for CrewBoard list, planner/date context, selected-job panel, and
  advisory schedule warnings.
- `/reports` for operations snapshot, attention lists, source-record links, and
  existing sales tax / pipeline / payment summaries.
- `/estimates/[estimateId]`, `/contracts/[contractId]`, and
  `/invoices/[invoiceId]` for Send Trail summary and delivery evidence.

## Browser QA Caveats

Browser QA is not required for docs-only checkpoint work. When protected-route
browser QA is requested, first consult
[docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md).
Local Supabase Auth rate limits, stale Playwright storage state, base-URL
mismatch, or stale fixed fixture IDs can make protected-route QA fail before the
app route is actually broken.

## Guardrails

The operating-core validation helpers should remain deterministic and
source-record backed. Do not use this checklist to justify:

- schema or migration changes
- fake records or mock business flows in protected app routes
- duplicate project, job, document, message, delivery, or reporting models
- AI-generated summaries or autonomous next actions
- provider retry, reminder, or external calendar behavior
- payment, signature, estimate math, invoice math, portal access, auth/RLS, or
  tenant-boundary changes
