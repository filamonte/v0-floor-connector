# Enterprise UX Consolidation

Status: Active
Doc Type: UI / Workflow

This note records the ownership and cleanup map for the customer, contact, access, review, and portal workflow pass. It documents implemented presentation guidance only; it does not add schema, workflow mutations, financial behavior, signature behavior, payment behavior, portal-only records, or new authorization rules.

## Ownership Model

- Directory is the read-only cross-record index and command entry point.
- People owns workforce people, customer contacts, portal account access, temporary portal credentials, stored contact permissions, and per-contact project visibility.
- Customer Workspace owns customer account summary, primary relationship context, linked project history, customer-level financial summary, and links to People for access administration.
- Project Workspace owns project state, readiness, next step, linked-record lanes, project-specific customer visibility, schedule context, and operational continuity.
- Estimate Workspace owns proposal scope, pricing, customer-facing review state, and estimate-to-contract/invoice handoff context.
- Contract Workspace owns contract review, signer routing, signature state, onsite/customer signature actions, and project handoff.
- Invoice Workspace owns billing state, line-item review, balance, payment activity, customer review/send/payment follow-through, and lower-priority internal work items.
- Portal owns customer-safe review and action. Portal pages should use simple customer language, one primary next step, and no contractor-only operational management.

## Enterprise Visual System Rules

- Estimate remains the visual and workflow reference baseline for the secured contractor app.
- The accepted system direction is premium, calm, compact, and enterprise: graphite/black structure, copper/orange action emphasis, white and warm-neutral work surfaces, semantic status color only where it carries meaning.
- Manager Pages, detail workspaces, setup, settings, portal, admin, and super-admin should reuse the same shared card/header/status/action grammar unless audience-specific differences are documented.
- Do not introduce route-local blue/green/purple/cyan visual systems. Green is only for success/approved/paid/signed/complete, red for destructive/error/blocked, amber/copper for warning/attention/action, and gray/graphite for neutral/read-only/current utility states.
- New protected pages need authenticated visual QA. Login, access denied, missing fixture, or setup-gate redirects are not successful reviews of a secured route.

## Fix-Now Map

- Customer Workspace: make the top stack a customer account summary; keep contact and portal management available through progressive disclosure and a People link.
- People: make customer contact access a filtered portal access console with access-state summaries, compact contact rows, and one selected contact/grant management panel for invite, temporary login, permissions, and project visibility controls.
- Directory: clarify that it is an index and that People owns access management.
- Project Workspace: lead with an operational command-center summary and compact connected-record lanes, while keeping customer contact access as project-specific visibility context with a People handoff.
- Intake handoff: keep the People access console healthy by ensuring direct customer creation, project inline customer creation, and opportunity handoff create or link the first captured person as a primary related customer contact instead of relying only on customer-level email/phone fields.
- Estimate and Invoice Workspaces: keep internal work-item creation secondary and collapsed so proposal or billing review remains primary.
- Portal review pages: reduce internal terms such as canonical, provider-backed, and workflow state in customer-facing copy.

## Phase 2 Right-Rail And Context-Card Map

- Right rails should support the main record workspace, not become a second page. Keep the most useful state, primary linked record, and one clear handoff visible.
- Project Workspace should show project context, project-specific portal visibility, primary continuity records, and production schedule in the rail; lower-frequency activity such as change orders, appointments, punchlist, daily logs, extended facts, history, or metadata should sit behind progressive disclosure or in the main project sections.
- Estimate Workspace should stay proposal-first. Revision history and secondary linked records should be expandable; project, current contract, current invoice, and current job can remain visible when present.
- Contract Workspace should keep signature state and signer routing as the main job. Connected workflow should show primary project/estimate/current downstream records, with extra jobs/invoices and revision history collapsed.
- Invoice Workspace should lead with amount owed, paid, and next collection action. Manual payment recording, invoice editing, extra connected records, metadata, and revision history should be expandable or clearly secondary.
- Portal pages should use plain customer language such as review estimate, sign contract, view invoice, pay balance, project shared with you, and return to portal home. Avoid internal implementation words unless they are needed for a safe customer action.

## Phase 3 Responsive And Mobile QA Map

- Detail Workspaces should remain field-usable at desktop, tablet, and mobile widths. The page itself should not create horizontal overflow; any genuinely wide data table should scroll intentionally inside its own container.
- Right rails may stack below the main workspace on smaller screens, but linked-record cards, metadata, badges, and action rows must wrap within the viewport rather than preserving desktop intrinsic widths.
- Shared record cards should allow long names, reference numbers, status badges, and metadata to wrap safely. Do not rely on one-line truncation where it can force the rail wider than its column.
- Forms on detail pages should keep inputs and customer pickers `min-width: 0` so closed or secondary edit sections remain available without making the whole mobile page wider.
- Portal pages should keep their review-first hierarchy on phones: clear title, current status, one obvious next action, supporting details, then secondary reference links.
- Responsive QA should include at least one contractor authenticated detail route and the portal customer route chain at mobile width before a UX consolidation slice is closed.

## Directory Portal Access Console Rebuild

- The People customer-access surface should not render full invite, temporary login, permissions, and project-visibility management panels for every customer contact at once.
- The default People access view is summary-first: key counts, access filters, compact contact/grant rows, and a Manage access action.
- Management opens in one focused panel for the selected contact or legacy grant. That panel owns contact profile editing, invite/resend status, temporary portal login help, stored permissions, and per-project visibility for that one contact.
- Project visibility remains explicit per contact. Repeat customers with many projects should be handled through the selected contact's project list and copy-from-primary-contact preset, not through a full repeated customer-by-project wall.
- Customer and Project workspaces should link to People with customer context instead of embedding the full access console.

## Follow-Up Map

- Customer Workspace can later move more access mutation controls fully to People after route-level handoff copy and tests are stable.
- Directory can become a more polished contact/access workspace only if it still reads from existing canonical records and does not create a replacement model.
- Contract and invoice review can continue shortening right rails by moving deeper schedule, communication, and metadata context behind expandable sections.
- Portal home and project pages should keep removing contractor-only vocabulary as customer QA surfaces more confusing copy, especially in change-order and payment edge states.
- Future mobile depth can convert dense manager tables into card summaries where the route is a work surface rather than an export-style register. Current manager tables may retain intentional inner horizontal scrolling when they do not create page-level overflow.

## Leave As Context Only

- Calendar and schedule remain the positive reference for single-job clarity.
- Estimate remains the proposal-first quality bar for contractor record workspaces.
- Project remains the operational hub, but global record workspaces remain valid queue/review surfaces.
