Status: Active
Doc Type: Product Language

# FloorConnector Product Language

## Purpose

FloorConnector should read like contractor operating software, not an
architecture guide. This document defines the approved user-facing product
language that can sit on top of the existing canonical architecture without
renaming routes, database tables, server actions, or internal domain models.

The database can stay boring. The product should speak human.

## Naming Principles

- Use product names only where they help users understand a repeated system.
- Use plain language when a branded name would feel forced.
- Keep customer-facing portal copy calmer and simpler than contractor-app copy.
- Preserve legal, financial, signature, payment, and audit precision.
- Define a product name once, then use it consistently in visible UI and docs.
- Keep internal architecture terms in developer docs, not prominent app copy.
- Do not rename routes, schema, migrations, server actions, payload keys, form
  names, hidden inputs, test ids, or database enums for product-language work.

## Approved Product Terms

| Product term          | Meaning                                                              | Use in UI                                                            | Do not use for                                                           |
| --------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| GateKeeper            | Readiness and workflow enforcement before work can move forward.     | Project readiness, schedule readiness, blockers, pre-handoff checks. | Renaming database tables, server actions, or readiness helper functions. |
| Next Move             | Suggested next action or deterministic workflow suggestion.          | Project suggestions, My Work suggestions, attention guidance.        | Autonomous AI, fake automation, or unrelated task records.               |
| Command Center        | Operating summary for a dashboard or project.                        | Dashboard/project summary areas.                                     | Every ordinary page header.                                              |
| Ready Check           | A focused readiness check for a workflow step.                       | Commercial, deposit, payment, or scheduling readiness copy.          | Legal/payment state names where precision matters.                       |
| Cost Library          | Reusable cost items, systems, and optional inventory workspace.      | Navigation and Cost Items Database surfaces.                         | Route paths or database model names.                                     |
| Payment Trail         | Payment event/history review.                                        | Invoice and payment evidence sections.                               | Payment calculation fields or provider payload names.                    |
| Signature Trail       | Contract signature event/history review.                             | Contract signature history sections.                                 | Signature actions, signer roles, or provider event enums.                |
| Customer Access       | Customer-visible project or record access.                           | Portal visibility and access-grant copy.                             | Internal auth, RLS, or invite-token implementation names.                |
| Company Controls      | Contractor settings/admin surfaces.                                  | Settings shell and visible settings navigation.                      | Route names or internal package names.                                   |
| Platform Control Room | Super-admin/platform control surfaces.                               | Platform admin shell and high-level admin labels.                    | Tenant-level contractor settings.                                        |
| Starter Settings      | Platform-owned defaults inherited or adopted by contractor accounts. | Super-admin platform defaults.                                       | Organization-owned copied settings.                                      |
| Feature Controls      | Module/feature control surfaces.                                     | Settings and super-admin module-control labels.                      | Entitlement enforcement code unless explicitly implemented.              |

## Terms To Avoid In User-Facing UI

Avoid these in prominent contractor or portal UI unless there is a specific
reason to be technical:

- tenant
- canonical
- RLS
- read model
- immutable event
- workflow cue
- cue state
- portal grant
- source-of-truth
- row-level
- server action

Developer docs may still use these terms when they are the accurate
architecture names.

## Terminology Map

| Internal / technical term         | Preferred user-facing term   | Where to use                                                        | Where not to use                              |
| --------------------------------- | ---------------------------- | ------------------------------------------------------------------- | --------------------------------------------- |
| Project readiness gate            | GateKeeper                   | Project Workspace, schedule handoff, blocker summaries.             | Database table names, readiness helper names. |
| Workflow cues / suggested actions | Next Move suggestions        | Dashboard My Work, Project Workspace suggestions, attention panels. | Internal `operational-cues` folders or types. |
| Operational command center        | Command Center               | Dashboard and project operating summaries.                          | Every manager or detail page.                 |
| Commercial readiness              | Ready Check                  | Commercial handoff summaries and project facts.                     | Stored enum/status values.                    |
| Payment events                    | Payment Trail                | Invoice/payment evidence sections.                                  | Provider event mapping or webhook code.       |
| Contract signature events         | Signature Trail              | Contract signature history sections.                                | Signature provider integration code.          |
| Portal access grants              | Customer Access              | Contractor/customer access copy.                                    | Access-grant implementation names.            |
| Cost Items Database               | Cost Library                 | Visible navigation and workspace title.                             | Route path `/cost-items-database`.            |
| Module controls                   | Feature Controls             | Settings/super-admin visible labels.                                | Low-level entitlement policy code.            |
| Platform defaults                 | Starter Settings             | Super-admin default settings.                                       | Tenant-owned settings.                        |
| Tenant/org                        | Company / Contractor Account | Customer-safe or contractor-facing copy.                            | Developer docs and database ownership docs.   |

## Candidate Future Names

These names are available for future controlled passes but are not broadly
implemented yet:

- WorkMap: lifecycle / connected record chain visualization.
- Watchlist: attention items that require review.
- Send Trail: document send/delivery history.
- Field Trail: daily logs, notes, photos, and field history.
- CrewBoard: schedule board / dispatch surface.
- Shared Projects: portal project access.
- Scope Builder: estimate builder.
- Version History: record revisions.
- Closeout Trail: final invoice/payment/warranty/closeout record.

## Implementation Notes

Phase 1 intentionally implements only the strongest labels in high-impact UI:
GateKeeper, Next Move, Command Center, Ready Check, Cost Library, Payment Trail,
Signature Trail, Customer Access, Company Controls, Platform Control Room,
Starter Settings, and Feature Controls.

The implementation is copy-only. Internal architecture, routes, schema,
actions, form payloads, hidden inputs, test ids, and database names remain
unchanged.

## Guardrails

- No schema or migration renames.
- No route renames.
- No server action or payload-key renames.
- No form field, hidden input, or test-id renames.
- No payment, signature, estimate, invoice, readiness, portal access, settings,
  platform-admin, or tenant-boundary behavior changes.
- No fake data or static mockup replacement.
