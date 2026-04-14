# Auth Architecture Note

FloorConnector is planning one shared authentication system across all surfaces.

## Model
- Supabase Auth is the current runtime auth foundation in `apps/web`
- Google OAuth is the primary sign-in method
- email/password is a fully supported fallback from the beginning
- both methods must land in the same shared user/account model
- provider choice must not create separate user records, authorization rules, or tenant context models

## Boundary Rules
- authentication stays centralized and shared across marketing, contractor app, portal, and super admin surfaces
- authorization remains organization-aware and role-based
- shared auth/account logic belongs in workspace packages, not duplicated in route handlers or pages
- future provider-linking rules must preserve one user identity per person across sign-in methods

## Current Foundation
Today the web app already includes:
- Supabase SSR client wrappers for browser, server, middleware, route-handler, and admin usage
- public auth routes for sign-in, sign-up, password reset, and callback handling
- middleware and server checks protecting `/app`, `/portal`, and `/super-admin`
- health endpoints that report required callback and redirect configuration

This foundation is real, but the shared auth/account model and long-term package ownership are still being documented and hardened.

## Local Environment Source Of Truth
For local development, the web app reads:

`C:\FloorConnector\.env.local`

Do not keep a separate `apps/web/.env.local`.

## Required Runtime Values
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
```

If your local app runs on another port, update `NEXT_PUBLIC_APP_URL` to match.

## Supabase Provider Setup Notes
Configure these settings in the Supabase dashboard for each environment:

1. `Authentication -> URL Configuration`
2. Set `Site URL` to the active app origin, such as `http://localhost:3000`
3. Add redirect URLs for:
   `http://localhost:3000/auth/callback`
   `http://localhost:3000/update-password`
4. Enable both providers:
   Google
   Email

Provider-specific notes:
- Google provider setup uses the Google client ID and client secret configured in Supabase
- email/password setup does not require extra app env vars, but confirmation and password-reset behavior must be tested alongside Google flows
- both methods should be tested against the same shared user/account expectations

## Verification Endpoints
- `/api/health`
- `/api/health/supabase`
- `/api/health/auth`

`/api/health/auth` reports the callback URL, password reset callback URL, and the expected Supabase URL configuration for the current environment.
