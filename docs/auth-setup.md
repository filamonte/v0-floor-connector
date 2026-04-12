# Auth Setup

This repository currently uses Supabase Auth for both:
- Google sign-in as the primary path
- email/password as the fallback path

Canonical repository context:
- GitHub repo: `https://github.com/filamonte/v0-floor-connector.git`
- primary branch: `main`
- local workspace root: `C:\FloorConnector`

## Local Source Of Truth

For local development, the web app reads:

`C:\FloorConnector\.env.local`

Do not keep a separate `apps/web/.env.local`.

## Required Local Environment Variables

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MARKETING_URL=http://localhost:3000
NEXT_PUBLIC_SUPPORT_URL=http://localhost:3000/support
NEXT_PUBLIC_PRIVACY_POLICY_URL=http://localhost:3000/privacy-policy
NEXT_PUBLIC_TERMS_OF_SERVICE_URL=http://localhost:3000/terms-of-service
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
```

If your local dev server runs on `3001`, replace `3000` with `3001`.

## Supabase Dashboard Setup

In Supabase, configure these settings for local development:

1. `Authentication -> URL Configuration`
2. Set `Site URL` to your active local origin:
   `http://localhost:3000`
3. Add redirect URLs:
   `http://localhost:3000/auth/callback`
   `http://localhost:3000/update-password`

If your app is running on port `3001`, use the same URLs with `3001`.

## Google Sign-In

Google sign-in is configured through Supabase Auth providers, not through app-side runtime code.

In Supabase:

1. Open `Authentication -> Providers -> Google`
2. Enable the provider
3. Supply the Google client ID and client secret
4. In the Google Cloud Console, add Supabase's callback URL as an authorized redirect URI

Use the callback URL shown in the Supabase Google provider settings. This is typically:

`https://<project-ref>.supabase.co/auth/v1/callback`

## Email And Password

To make fallback auth work locally:

1. Open `Authentication -> Providers -> Email`
2. Enable email/password sign-in
3. Decide whether `Confirm email` should stay enabled during local development

Behavior:
- If confirm email is enabled, sign-up sends a confirmation email and the user must confirm before signing in.
- If confirm email is disabled, sign-up can create a session immediately.
- Password reset emails redirect through `/auth/callback` and then forward to `/update-password`.

## Local Verification Endpoints

Use these routes while developing locally:

- `/api/health`
- `/api/health/supabase`
- `/api/health/auth`

`/api/health/auth` reports the expected callback URLs and the required Supabase URL settings for the current local origin.
