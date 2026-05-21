# Canonical Terminology

Status: Stable
Doc Type: AI Guidance

Use canonical FloorConnector terminology consistently.

## Lifecycle

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Route/Page Terms

- `/<resource>` routes are `<Resource> Manager Page`.
- Record detail pages are `<Resource> Workspace`.
- Focused editing surfaces are `<Resource> Editor`.
- Top-level create flows are `<Resource> Quick-Create`.
- Nested create flows are `Inline <Resource> Quick-Create`.

## Status Terms

- Stable: implemented and trusted as a current baseline.
- Active: implemented and usable, still evolving.
- Foundation: canonical structure exists but deeper workflow depth remains future work.
- Planned: not implemented yet but intended.
- Deferred: intentionally postponed.
- Archived: historical only.

## Important Distinctions

- Opportunity is the canonical pre-customer commercial record, even when UI copy says lead.
- Customer is the commercial/account record, not every contact-like identity.
- Project is the operational hub over time.
- Invoice is money owed.
- Payment is money collected.
- Portal is a surface on canonical records, not a separate system.
- Provider references are evidence/telemetry, not business truth.

