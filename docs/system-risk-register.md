# FloorConnector System Risk Register

Status: Active
Doc Type: QA / Planning

This register summarizes current product, QA, operational, and architecture risks after the full system review. It is a planning artifact only. It does not authorize schema, billing, payment, portal-access, signature, RLS, tenant-isolation, or feature changes.

Use with:

- [docs/system-status-review.md](C:/FloorConnector/docs/system-status-review.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/e2e-browser-qa.md](C:/FloorConnector/docs/e2e-browser-qa.md)
- [docs/paid-early-access-plan.md](C:/FloorConnector/docs/paid-early-access-plan.md)
- [docs/saas-billing-live-launch-plan.md](C:/FloorConnector/docs/saas-billing-live-launch-plan.md)

## Risk Summary

| Risk | Impact | Likelihood | Mitigation | Next decision | Owner/operator action |
| --- | --- | --- | --- | --- | --- |
| Live SaaS billing is not launched | Founder prospects may confuse test-mode proof with production subscription readiness. | High | Keep `/super-admin/billing` as Billing Operations, keep live launch under `docs/saas-billing-live-launch-plan.md`, and state manual activation plainly. | Decide whether first paid cohort uses manual billing evidence or live Checkout after policy gates. | Do not expose live Checkout or Customer Portal until release gates are approved. |
| Activation and entitlement enforcement are not automated | Operators must manually decide tenant activation and production-action access. | High | Preserve manual activation and current activation guard while billing policy matures. | Choose whether entitlement helper starts with irreversible external actions only. | Use `/super-admin/early-access` and `/super-admin/billing` as review surfaces, not automatic activation tools. |
| Import/export readiness is not built as a trust layer | Contractors may hesitate to evaluate FloorConnector with real data if they cannot bring data in or leave with core records. | High | Treat import/export as a narrow trust/readiness slice over existing canonical records. | Decide first import/export scope, likely customer/contact/project/estimate/invoice/job CSV export plus import plan. | Gather the minimum data movement needs during contractor review. |
| Reporting is shallow | Owners may not see enough business health to commit daily use. | Medium | Keep `/reports` honest as foundation and avoid overstating analytics. | Decide whether reporting/dashboard depth outranks import/export after prospect feedback. | Ask prospects which reports they need before paid use. |
| Scheduling is not dispatch-grade | Contractors with crew-heavy operations may find `/schedule` useful but insufficient for daily dispatch. | Medium | Keep scheduling on canonical jobs/job assignments and use readiness-gated handoffs. | Decide whether dispatch board, capacity, or mobile crew planning is first. | Watch prospect feedback for scheduling as a blocker. |
| Document delivery is browser print/save, not stored PDF management | Prospects may expect generated/stored PDFs, versioning, delivery history, or file cabinet behavior. | High | State that print/save views render canonical records today; stored document/version management is future. | Decide whether stored document management becomes a near-term slice after founder review. | Use the exact caveat in founder demo scripts. |
| AI is not active/autonomous | AI expectations could outrun current deterministic cue foundation. | Medium | Keep AI as planned/gated, with deterministic cues as current implementation. | Decide AI foundations only after core trust/workflow blockers are addressed. | Do not promise autonomous quoting, scheduling, billing, messaging, or permissions. |
| Legacy customer/account contact data may need cleanup | Older customer-level email/phone records may not have primary `customer_contacts` or contact-linked portal grants. | Medium | Use non-destructive reporting queries in `docs/portal-identity-review.md` before any backfill. | Decide whether to run a contact consistency report before onboarding real founder data. | Review legacy/null-contact grants before inviting real customer contacts. |
| Mobile manager tables still rely on horizontal scroll | Owner/operators may want more card-first mobile workflows. | Medium | Current responsive QA guards page-level overflow; table-to-card conversion can be targeted later. | Decide whether manager/mobile polish is a contractor-review blocker. | Test real prospect workflows on phone widths before committing a pass. |
| Email delivery/provider behavior is not fully production-proven | Portal invites and external sends may be blocked by activation or provider config. | Medium | Keep provider email behind activation guard and copy-link fallback. | Decide whether provider delivery proof should precede broader founder access. | Verify Postmark/config only in a scoped delivery-hardening pass. |
| Live Stripe mode needs gates | Accidental live provider mutation would be high-risk. | Medium | Prefix-gate local/test actions, keep live launch planning separate, and never store secrets in docs or tables. | Approve live release policy before any live controls. | Keep local QA test-mode only and never paste keys, webhook secrets, or Checkout URLs. |
| Contractor feedback may change priorities | The next build slice could be wrong if chosen from momentum instead of observed friction. | High | Use founder prospect script and feedback worksheet before committing larger slices. | Re-rank next build options after the first one or two trusted contractor reviews. | Capture feedback same day and tag blocker type. |
| Broad docs drift can return | Recent system changes are spread across many docs and status notes. | Medium | Use this review, `current-state`, and `chat-handoff` as short maps. | Decide whether to archive or consolidate older overlapping status docs later. | Update docs in the same change set as workflow/lifecycle changes. |
| Shared file/evidence layer is not built | Attachments and print/save views do not yet form a multi-record evidence system. | Medium | Keep current record-specific attachments honest and avoid calling print/save a document source of truth. | Decide whether evidence/files follow documents or import/export. | Avoid promising a file cabinet until scoped. |
| Package/billing governance is mostly read-only | Platform admin can inspect many governance records, but runtime package activation and entitlements are not implemented. | Medium | Keep package governance labeled as inspection/readiness where applicable. | Decide whether package activation belongs after live billing policy. | Do not treat package rows as active entitlement behavior yet. |

## Recommended Risk Posture

- Keep the demo paused for external selling pressure, but keep product work moving from current truth.
- Prefer the next build slice that improves trust without requiring a specific contractor workflow preference.
- Do not use live billing, entitlement enforcement, import automation, or broad UI redesign as the next default move.
- Treat import/export readiness as the best current candidate unless the contractor review produces stronger contrary evidence.
