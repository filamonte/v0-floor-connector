This directory contains runtime-specific Supabase access wrappers for the web app.

- `browser.ts` is for client components and browser-only usage.
- `server.ts` is for server components, route handlers, and server actions.
- `admin.ts` is server-only and must never be imported into client code.

Shared client construction lives in `@floorconnector/db` so future packages can reuse the same foundation.
