# Portal Identity Review

Status: Active
Doc Type: Architecture Review

This note maps the current FloorConnector portal identity model and the safe repair path for customer contacts, portal users, invite links, and email delivery.

Use with:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/directory-contact-model-plan.md](C:/FloorConnector/docs/directory-contact-model-plan.md)
- [docs/e2e-browser-qa.md](C:/FloorConnector/docs/e2e-browser-qa.md)

## Current Model Map

FloorConnector tenant / contractor company:
- Stored in `companies`.
- Tenant owner for contractor records.
- Business tenant, not a customer account or portal user.

Contractor user:
- Supabase Auth user mirrored into `users`.
- Gains contractor app access through `company_memberships`.
- May be linked to workforce `people.membership_user_id`.
- Must not automatically imply platform-admin access or portal access.

Contractor customer:
- Stored in `customers`.
- Canonical business relationship/account for the contractor's homeowner, business client, facility manager, GC customer, or similar buyer.
- Owns commercial and financial continuity for projects, estimates, contracts, invoices, and payments.
- It is not an auth user and not a multi-contact directory row by itself.

Customer contact:
- Stored as a shared `contacts` identity linked to a customer through `customer_contacts`.
- Represents a person/contact method beneath a contractor customer, such as homeowner, site contact, signer, payer, or accounts payable.
- Tenant-scoped and contractor-owned.
- May be linked to portal access through `portal_access_grants.customer_contact_id`.
- New contractor-created portal invites require a selected customer contact. Null-contact grants remain a legacy compatibility fallback only.

Portal user:
- A Supabase Auth user mirrored into `users`.
- Becomes a customer-facing portal user only when linked to an active `portal_access_grants` row.
- Auth identity alone must not grant portal visibility.

Portal access grant:
- Stored in `portal_access_grants`.
- Canonical customer-anchored access record.
- Can be pending (`invited` with `user_id = null` and hashed invite token), active, or revoked.
- May point to one `customer_contacts` row when the grant represents a specific customer contact.
- Does not create portal-only customer, project, contract, estimate, invoice, payment, or contact copies.

Portal project access:
- Stored in `portal_project_access`.
- Explicit project visibility beneath a portal access grant.
- A portal user can only see projects with active project access under an active grant.
- Access is scoped to the contact/grant. Additional customer contacts do not receive blanket access to every project under the customer account, and they do not silently inherit the primary contact's project visibility.

Customer-contact portal permissions:
- Stored in `customer_contact_portal_permissions`.
- Current enforcement is active for linked-contact estimate decisions, change-order decisions, and contract sign/decline actions.
- Invoice view/pay and quote-request flags are stored readiness/future coverage unless the relevant workflow explicitly enforces them.

Workforce people:
- Stored in `people`.
- Current purpose is workforce/internal/subcontractor-worker identity, responsibility defaults, compliance, time, and labor context.
- Workforce `people` should stay separate from contractor customer contacts. A future Directory can show both models together without merging them into one table.

## Current Portal Grant And Invite Behavior

When a contractor creates or ensures portal access today:

1. The UI calls `createPortalAccessGrantAction`.
2. The server validates the customer, required customer contact, invited email, and selected project.
3. The app checks whether a canonical `users` row already exists for the invited email.
4. If a user exists, the system creates or reuses an active `portal_access_grants` row linked to that user and adds `portal_project_access`.
5. If no user exists, the system creates an `invited` portal grant with `user_id = null`, generates a raw app invite token, stores only `invite_token_hash`, and adds `portal_project_access`.
6. The server attempts branded portal invite email delivery when provider-backed email is configured and the organization is allowed to send externally.
7. Whether email sends or not, a fresh app invite link is returned to the contractor immediately after creation or resend as the copy-link fallback.
8. The current app does not call Supabase `auth.admin.inviteUserByEmail`.
9. The current app does not create a Supabase Auth user for the invited email.
10. Existing pending invites can be resent; resend prepares a fresh token/hash and replaces the prior pending invite hash.
11. If a same-customer, same-email legacy null-contact grant is reused, the create path now links it to the selected customer contact before adding project visibility.

Customer acceptance today:

1. The customer opens `/portal/invite?token=...`.
2. The page shows customer-safe customer/project/invited-email context from `get_portal_invite_preview`.
3. If not signed in, the customer sees a customer-safe account onboarding panel that explains they must use the invited email.
4. The invite page offers signup, sign-in, and password reset actions that preserve `next=/portal/invite?...` and prefill the invited email.
5. Signup/login uses the normal Supabase Auth email/password or Google auth routes.
6. Password reset uses the normal Supabase reset/update-password path and returns to the invite when the reset started from the invite.
7. `accept_portal_invite` activates the grant only when the signed-in canonical user email matches `invited_email`.
8. The grant becomes active, `user_id` is set, `invite_accepted_at` is recorded, and the user lands on the granted project.
9. Portal-bound auth redirects do not bootstrap a contractor company or company membership for portal-only customers. The Supabase Auth account is mirrored into `public.users` by the auth profile sync trigger, and portal visibility still comes only from the active grant.
10. Active portal-only customers with no contractor membership are returned to `/portal` if they try to open contractor workspace routes; contractor app access still requires a contractor membership instead of portal access.

Password setup today:

- New customers use the normal `/signup?next=/portal/invite?...` flow to create a password.
- Existing customers use `/login?next=/portal/invite?...`.
- Forgotten passwords use `/forgot-password?next=/portal/invite?...` and `/update-password`, preserving the safe invite return path.
- Contractor owners/admins can issue a support-only temporary portal credential for a linked customer-contact grant. This creates or updates the real Supabase Auth user from server-side privileged code, shows the generated temporary password once, and marks the account/grant for required password change.
- There is no contractor-side permanent password setter and no stored raw password in FloorConnector tables.
- Portal-bound signup/login/callback paths intentionally avoid contractor tenant bootstrap so a customer portal account does not accidentally become a contractor owner account.

Temporary credential support is intentionally a fallback, not normal onboarding. The generated password is passed only through the server action response for one-time display, while `portal_access_grants` stores only audit/status fields (`temporary_credential_issued_at`, `temporary_credential_issued_by`, `temporary_credential_requires_password_change`, and clear timestamp). Supabase Auth `app_metadata` carries the password-change-required flag, and `/login` redirects flagged portal users to `/update-password`; successful password update clears both Auth metadata and grant status.

Email delivery today:

- Portal invite creation and resend use FloorConnector's app-managed invite token model, not Supabase Auth-admin invites.
- When provider-backed email is configured and the organization is not activation-locked, the server sends a branded portal invite email through the existing notification email path.
- The email includes the contractor company name, customer/project context, a safe invite URL, and customer guidance to sign up or log in with the invited email.
- Delivery attempts are tracked through `notification_events` and `notification_deliveries` using `portal_invite.email_requested`; raw invite tokens are not stored in event payloads or delivery metadata.
- If provider-backed email is activation-locked or missing configuration, the app does not pretend an email was sent. It prepares a fresh copy-link fallback and shows truthful no-send status.
- Pending invites expose a send/resend action from customer detail and People. Resend prepares a fresh token/hash and leaves authorization on the same canonical `portal_access_grants` row.

This explains the original observed gap and the current repair boundary: normal portal access still uses app-managed invites rather than Supabase Auth invites, but owner/admin support can now create or update the real Auth user through the temporary credential fallback when invite/signup delivery is blocked.

## Target Enterprise Flow

Recommended target:

1. Contractor customer exists as the canonical `customers` account.
2. Customer has one or more `customer_contacts`.
3. Contractor chooses the contact/email and project scope from the customer account or the People cross-customer access view.
4. System creates a `portal_access_grants` row in `invited` state.
5. System sends a FloorConnector-branded app-managed invite link through the notification/email adapter when provider sending is configured and the tenant is activated.
6. UI always provides a copy-link fallback immediately after invite creation.
7. Customer signs up, logs in, or uses password reset/magic link through Supabase Auth.
8. Authenticated email must match the invited email unless a future explicit linking workflow is approved.
9. Grant becomes active only after acceptance.
10. Contractor can revoke access, adjust project visibility, inspect status, and create a fresh invite when needed.
11. For repeat/commercial customers, each customer contact can have a different explicit project list. "Copy access from primary contact" is a safe preset/action, not automatic inheritance.
12. If invite delivery fails in practice, a contractor owner/admin can issue a temporary support credential for a linked contact; the customer must replace it before continuing.

The app-managed invite-token approach best fits the current architecture because it preserves `portal_access_grants`, branded UX, project-scoped visibility, E2E fixture control, and tenant-safe acceptance rules. Supabase Auth remains the authentication provider; FloorConnector remains the portal access authority.

Supabase `inviteUserByEmail` is still a valid future option, but it should be introduced only if the team wants Auth-admin invites to be the primary delivery mechanism. That path requires server-only service-role usage, redirect URL configuration, email template decisions, and production SMTP/email-delivery readiness.

## People And Directory Recommendation

Keep the models separate:

- `people`: workforce, employees, subcontractor workers, responsibility defaults, compliance, time, labor.
- `customers`: contractor customer/account/business relationship.
- `contacts` plus `customer_contacts`: customer contact identities beneath canonical customers.
- `portal_access_grants`: explicit access bridge from auth user/email/contact/customer to portal visibility.

Do not merge workforce people and customer contacts into one broad party model in the current phase. A future Directory can be a unified read/management surface over separate canonical models, not a replacement data model.

The current enterprise UX consolidation pass keeps Directory as a read/index workspace and People as the active access command center. Customer detail may summarize contacts and portal grants, and Project detail may show project-specific visibility, but both should link back to People for full customer-contact, portal-grant, temporary-credential, and project-visibility management. See [docs/enterprise-ux-consolidation.md](C:/FloorConnector/docs/enterprise-ux-consolidation.md).

Next safe data-model step:

- Keep using existing `contacts` and `customer_contacts`.
- Lead/customer intake now treats the first captured customer person as the primary related contact where possible: direct customer creation, project inline new-customer creation, and opportunity/estimate handoff should create or link the canonical `contacts` and `customer_contacts` rows instead of leaving the person only on `customers.email` or `customers.phone`.
- Gradually attach legacy customer-level portal grants to related contacts when known.
- Keep new portal invite creation contact-centered; do not create new null-contact grants from contractor UI.
- Keep People/Directory as the customer-contact and portal-access management surface. People should present portal access as a filtered console with compact contact/grant rows and one selected management panel, not as repeated full panels for every contact. Project Workspace may show project-specific contact visibility and link back to People, but estimates, contracts, and invoices should stay contextual business surfaces rather than identity-management islands.
- Do not add another customer-contact table.
- Add resend/email delivery only as a focused provider-delivery slice with activation guard behavior, delivery events, and no raw token exposure.

Non-destructive primary-contact cleanup report:

```sql
-- Customers that have account-level contact fields but no related customer contact.
select c.company_id, c.id as customer_id, c.name, c.email, c.phone
from public.customers c
left join public.customer_contacts cc
  on cc.company_id = c.company_id
 and cc.customer_id = c.id
where cc.id is null
  and (c.email is not null or c.phone is not null);

-- Customers that have related contacts but no primary contact relationship.
select cc.company_id, cc.customer_id, count(*) as contact_count
from public.customer_contacts cc
group by cc.company_id, cc.customer_id
having bool_or(cc.is_primary) = false;

-- Duplicate contact candidates by lower-cased email within the same customer.
select cc.company_id, cc.customer_id, lower(ct.email) as email, count(*) as contact_count
from public.customer_contacts cc
join public.contacts ct
  on ct.company_id = cc.company_id
 and ct.id = cc.contact_id
where ct.email is not null
group by cc.company_id, cc.customer_id, lower(ct.email)
having count(*) > 1;

-- Legacy portal grants that still are not linked to a customer contact.
select company_id, id, customer_id, invited_email, status
from public.portal_access_grants
where customer_contact_id is null;
```

These queries are reporting aids only. Do not run an automatic destructive or blanket backfill without a dedicated data-cleanup prompt and tenant-scoped review.

## Portal E2E Fixture Impact

Portal E2E needs separate portal-customer credentials because portal users are not contractor organization members.

The fixture must validate or create:
- Supabase Auth portal user.
- Canonical `users` profile.
- Contractor-owned `customers` row.
- Canonical `contacts` and `customer_contacts` row.
- Active `portal_access_grants` row.
- Active `portal_project_access` row.
- Optional shared estimate, contract, signer, invoice, and unauthorized-project route.

Missing portal credentials are not contractor or super-admin credential problems. They mean the customer-side portal identity fixture is incomplete.

Contractor-side portal invite QA can still verify the customer detail and People
invite status UI with the normal contractor auth state. Live portal-customer
smoke requires `FLOORCONNECTOR_PORTAL_E2E_EMAIL` and
`FLOORCONNECTOR_PORTAL_E2E_PASSWORD`, plus the canonical portal fixture records.
Do not treat skipped portal auth/smoke tests as live customer portal QA.

## Follow-Up Implementation Slices

1. Invite audit and status polish:
   - Add delivery-attempt status.
   - Show last sent, copied, accepted, revoked, and expired timestamps.
   - Keep revocation explicit and tenant-scoped.

2. Customer-contact consistency:
   - Continue moving contextual send/sign/pay flows toward eligible customer contacts.
   - Preserve canonical customer/account fields as financial/commercial fallback until each workflow explicitly supports contact-level routing.

3. Temporary support credentials:
   - Add focused E2E coverage for the owner/admin action and password-change redirect once the seeded portal fixture includes a disposable linked contact for credential issuance.
   - Consider platform-admin support issuance separately; the current contractor UI path is owner/admin-scoped within the active tenant.
   - Keep normal onboarding on invite/signup/reset so temporary credentials remain a support bridge.
