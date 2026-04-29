# QA Estimate Send, Approval, And Contract Prerequisites

Use this checklist before rerunning the estimate edit -> send/approval -> contract generation QA slice.

This note does not authorize database patching, fake snapshots, auth bypasses, or relaxed validation. The goal is to prepare the real UI path so the canonical workflow can run end to end.

## Canonical Sequence

1. Sign in as a contractor admin or owner.
2. Create or open one real customer/project/estimate chain.
3. Add estimate items and verify totals in the estimate editor.
4. Confirm the canonical customer has `customers.email`.
5. Grant portal access on the customer record to an authenticated portal user.
6. Add active project visibility for the estimate's project on that portal grant.
7. Send the estimate from contractor estimate detail.
8. Sign in as the portal user and approve the sent estimate from the portal estimate page.
9. Confirm approval created an approved estimate commercial snapshot.
10. Generate the contract from the approved estimate or project readiness handoff.

## Contractor-Side Setup

### Customer Email

Estimate send uses the canonical customer/account email, not related contacts and not workforce People records.

Required:
- Open the customer detail page.
- Fill the customer `Email` field in the `Edit Customer` section.
- Save the customer.
- Reopen the estimate detail and confirm the customer email appears in the estimate context.

### Portal Access Grant

Estimate send also requires a portal user who can actually view the estimate's project.

Required:
- Use a portal user email that already belongs to an authenticated FloorConnector user.
- Open the same customer detail page.
- In `Portal Access`, grant customer portal access to that email.
- Use `active` status when the QA run is ready for immediate portal review.
- Link the grant to a related customer contact when testing contact-level permissions; leave it customer-level only when intentionally testing legacy customer-level behavior.

### Project Visibility

Portal access is project-scoped.

Required:
- On the created portal grant, add project visibility for the estimate's project.
- Confirm the grant shows the project under visible projects.
- For linked-contact QA, confirm `Approve estimates` is enabled in stored permissions.

If project visibility is missing, estimate send should fail with an actionable prerequisite error.

## Portal Approval Setup

The approved estimate snapshot is created by the supported approval path.

Required:
- Sign in as the portal user attached to the customer portal grant.
- Open the portal estimate review path for the sent estimate.
- Approve the estimate using `Approve estimate`.
- Do not create snapshot records manually.
- Do not use old approved sample estimates as contract-generation fixtures unless they were approved through the current snapshot-producing path.

Expected:
- Estimate status becomes `approved`.
- Customer timeline records the approval event.
- The approved commercial snapshot exists for downstream contract, SOV, and invoice lineage.

## Contract Generation Setup

Contract generation requires:
- estimate status `approved`
- connected project and customer context
- approved estimate commercial snapshot
- approved estimate snapshot items

If an approved estimate returns `Approved estimate snapshot is missing`, do not patch a snapshot. Re-approve a sent estimate through the supported portal approval flow and retry contract generation from that freshly approved estimate.

Expected:
- One canonical contract is created.
- The contract links back to the same project, customer, and approved estimate.
- Contract content comes from the approved estimate snapshot and configured contract template.

## Negative Checks To Preserve

- Missing `customers.email` must block estimate send.
- Missing active portal user/project visibility must block estimate send.
- Contractor-side status buttons must not approve estimates directly unless a supported fallback path is explicitly exposed.
- Missing approved estimate snapshot must block contract generation.
- Invoice/progress billing must not read live `estimate_line_items` as downstream truth.

## QA Run Notes

Record these values for the slice:

```text
Contractor user:
Portal user:
Customer:
Customer email:
Related contact:
Portal grant:
Project visibility:
Project:
Estimate:
Estimate send result:
Portal approval result:
Approved snapshot present:
Contract:
Blocked step and exact message:
```
