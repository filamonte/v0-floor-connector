# Lead Appointment Workflow Audit

Status: implementation note for the lead -> appointment / site visit workflow.

## What Exists Already

- Opportunities are the canonical lead record and already store structured address fields: `address_line_1`, `address_line_2`, `city`, `state_region`, `postal_code`, and `country_code`.
- Customers and projects also already store structured address fields.
- Appointments are canonical tenant-owned records with optional links to `opportunity_id`, `customer_id`, and `project_id`.
- A site visit / inspection appointment is supporting workflow state on the lead/customer/project chain, not a replacement for the canonical business flow.

## Fix Direction

- Lead quick-create should capture structured address fields instead of a single combined address.
- Creating an appointment from a lead should preserve `opportunity_id` and should not require the lead to be converted into a customer first.
- Site visit quick-create from a lead should use a sensible default title: `Site Visit / Inspection - {customer name or company name}`.
- When a lead-linked site visit is scheduled, the linked opportunity should move into the site-assessment scheduled state so the lead workspace guidance stays aligned with real appointment activity.

## Future TODOs

- Add contractor workflow settings for configurable default appointment title templates.
- Add address autocomplete and verification behind a provider adapter. USPS or another address verification provider should not be wired directly into forms.
