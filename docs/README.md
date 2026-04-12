# Docs

Product, engineering, and rollout documentation lives here.

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
