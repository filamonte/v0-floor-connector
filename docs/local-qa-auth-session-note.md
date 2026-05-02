# Local QA Auth Session Note

Use this note when a seed-free browser QA pass needs a real local contractor or portal session.

## Source Of Truth

- Local workspace: `C:\FloorConnector`
- Local web app env file: `C:\FloorConnector\.env.local`
- Auth architecture reference: [docs/auth-setup.md](C:/FloorConnector/docs/auth-setup.md)

Do not create a separate `apps/web/.env.local` for QA.

## Required Local Auth Configuration

The local app must have these env variable names available in `C:\FloorConnector\.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
```

`NEXT_PUBLIC_APP_URL` must match the dev server origin being tested. If the app is running on another port, update the value before starting the dev server.

In Supabase Auth URL configuration for the same project:

- Site URL must match the local app origin, such as `http://localhost:3000`.
- Redirect URLs must include `http://localhost:3000/auth/callback`.
- Password reset redirects must include `http://localhost:3000/update-password`.
- Google and email/password providers should remain configured through Supabase Auth, not through a local bypass.

## Refreshing A Real Browser Session

1. Start the local app from `C:\FloorConnector` with `pnpm dev`.
2. Open `http://localhost:3000/login` in the same browser used for the QA pass.
3. Sign in through the existing app flow:
   - Use Google sign-in for the primary contractor path, or
   - Use the email/password form if that account already exists and is confirmed.
4. After sign-in, open `http://localhost:3000/dashboard` or another protected contractor route.
5. Confirm the protected route renders the contractor shell instead of redirecting back to `/login`.

If the browser redirects protected routes to `/login`, the local Supabase cookie/session is missing or expired. Clear the local `localhost` cookies for the active browser, return to `/login`, and sign in again through the existing app UI.

Do not reuse old `.tmp-auth-cookies*.txt` files. Expired Supabase refresh tokens commonly produce protected-route redirects or refresh-token errors and are not suitable for QA.

## Seed-Free QA Rules

- Use existing auth routes only: `/login`, `/signup`, `/forgot-password`, `/update-password`, and `/auth/callback`.
- Do not patch application code to bypass auth.
- Do not manually insert, update, or delete business records in Supabase to simulate UI actions.
- Do not use the service-role key to create QA users or canonical workflow records.
- Create or edit customers, projects, estimates, approvals, contracts, and related workflow records through the UI being tested.
- If signup is used for a new local QA user, complete the supported confirmation flow required by Supabase before continuing.

## Estimate Editor To Contract QA Preconditions

For the contractor-side Estimate Editoror -> send/approval -> contract generation slice:

- Sign in as a real contractor user with organization access.
- Use or create a real customer through the UI.
- Use or create a real project through the UI.
- Use or create a draft estimate through the UI.
- To test the missing-recipient guard, the canonical customer record must have an empty `customers.email` value before the send attempt.
- To retry send successfully, add the recipient email on the canonical customer record through the customer UI, then retry estimate send.

The canonical `customers.email` field remains the source for estimate sending. Related contacts and portal access records do not replace that send source.

## Troubleshooting Checklist

- Visit `/api/health/auth` locally to confirm the app is reporting the expected callback and reset URLs.
- Confirm `NEXT_PUBLIC_APP_URL` matches the browser URL exactly.
- Confirm Supabase Auth URL configuration includes the same local callback origin.
- Clear expired `localhost` cookies and sign in again if protected routes loop to `/login`.
- If email/password signup is blocked by confirmation requirements, use an already confirmed QA account or complete confirmation outside the app before continuing.
