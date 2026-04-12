# Docs

Product, engineering, and rollout documentation lives here.

Canonical repository notes:
- GitHub repo: `https://github.com/filamonte/v0-floor-connector.git`
- primary branch: `main`
- local workspace root: `C:\FloorConnector`
- local web app env source of truth: `C:\FloorConnector\.env.local`

Current foundation priorities to document as the repo grows:
- Google-first authentication with email/password fallback
- package ownership and shared boundaries
- Supabase migration and RLS workflow
- environment setup and operational checks

Environment notes:
- Local `.env.local` files should use valid localhost URLs including `http://`.
- Vercel environment variables should use the live production domains including `https://`.
- Moving from local to live should be an environment-variable change, not a code change.

Available setup guides:
- `docs/auth-setup.md` for Google sign-in, email/password fallback, redirect URLs, and local auth verification routes.
