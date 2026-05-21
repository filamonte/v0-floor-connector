# Scripts

Repository automation and maintenance scripts will live here.

## Read-Only Reports

- `catalog-items-duplicate-normalized-name-report.sql`: reports duplicate `catalog_items.normalized_name` rows by organization. It is read-only and does not delete, archive, or merge records.

## Platform Admin Bootstrap

- `platform-admin.mjs`: explicitly grants, revokes, or reports platform-admin access for an existing canonical user by email.

Examples:

```bash
pnpm platform-admin grant platform@floorconnector.com
pnpm platform-admin revoke jfilamonte@gmail.com
pnpm platform-admin status jfilamonte@gmail.com
```

The script reads `C:\FloorConnector\.env.local`, requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, and uses only the separate `platform_user_roles` assignment layer. It does not create users, contractor organizations, or tenant memberships.

The target platform account must sign in once through the normal auth flow before `grant` can resolve it in `public.users`. For local super-admin regression QA, use `platform@floorconnector.com` as `FLOORCONNECTOR_PLATFORM_E2E_EMAIL` after granting it.
