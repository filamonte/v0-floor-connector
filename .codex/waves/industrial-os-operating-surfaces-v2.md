# Industrial OS Operating Surfaces V2

Status: Setup active
Date: 2026-06-14
Base: `main` at `bac926b7`
Design source: `https://www.figma.com/design/N0tVE3uKWpHZc4dlF6ytgn`

## Goal

Run a six-stream Industrial OS Conveyor Wave 2 with only four active
implementation lanes at once. The wave is UI/UX refactor only.

## Active Streams

1. `schedule-crewboard-industrial-os-v1`
2. `communications-financial-command-v1`
3. `invoice-estimate-review-industrial-os-v1`
4. `assessment-estimate-workspace-industrial-os-v1`

## Queued / Staged Streams

5. `contract-change-order-industrial-os-v1`
6. `daily-logs-fieldtrail-industrial-os-v1`

## Shared Non-Goals

No schema changes, migrations, database/table/column renames, route renames,
canonical model changes, duplicate visual-only records, local-only persistence,
fake records, fake statuses, fake KPIs, fake health scores, fake AI/copilot
claims, fake queues/counts, auth/tenant/portal/admin guard changes,
payment/signature/scheduling business logic changes, estimate/contract/invoice
workflow logic changes, readiness gate changes, crew assignment behavior
changes, or global permanent desktop sidebar changes.

## Expected Overlap Risks

- Invoice/estimate review and assessment/estimate workspace may both touch
  estimate review/workspace files.
- Communications/financials and invoice/estimate review may both touch invoice
  or financial cards.
- Contract/change-order may overlap review/status components, so it remains
  queued.
- Daily Logs/FieldTrail may overlap schedule field-execution cards, so it
  remains queued.
- Schedule should mostly stand alone.

## Merge Order

1. `schedule-crewboard-industrial-os-v1`
2. `communications-financial-command-v1`
3. `invoice-estimate-review-industrial-os-v1`
4. `assessment-estimate-workspace-industrial-os-v1`
5. `contract-change-order-industrial-os-v1`
6. `daily-logs-fieldtrail-industrial-os-v1`
