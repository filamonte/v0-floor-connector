# UX Recovery Verification V1

Status: Verification complete
Branch: `stream/ux-recovery-verification-v1`
Worktree: `C:\FC-worktrees\ux-recovery-verification-v1`
Base: `origin/main` at `6cc1c19d` (`feat: organize customer portal workspace (#34)`)

## Summary Verdict

The UX Recovery Wave is stable enough to continue with the next governed slice.
The merged recovery surfaces now read as one operational command center rather
than isolated modules: Dashboard prioritizes, Lead and Project use focused
Workspace Framework V2 views, Settings owns organization setup, Invoice Review
is review-first, CrewBoard exposes calendar modes on the existing schedule
route, and Portal prioritizes customer-safe attention items.

One small stabilization was made during verification: the portal tab-strip
helper copy had low contrast on the light mobile background. It now uses the
light-surface text and border treatment already implied by the surrounding
portal chrome.

No schema, migration, route, table, loader, server action, auth, tenant access,
payment, signature, scheduling, portal access, or provider behavior changed.

## Browser And Device Coverage

Browser automation used Playwright Chromium against a current-worktree dev
server at `http://localhost:3002`.

Widths checked:

- `1366px` desktop viewport
- `390px` mobile viewport

Auth state:

- Contractor: `playwright/.auth/local-user.json`
- Portal customer: `playwright/.auth/portal-user.json`

Automated checks recorded HTTP status, login redirects, console warnings/errors,
page errors, horizontal overflow, headings, primary links/buttons, and visible
mode/attention copy.

Result:

- 34 route/width checks completed.
- No login redirects.
- No console warnings/errors captured.
- No page errors captured.
- No horizontal overflow detected at `390px` or `1366px`.

## Surfaces Checked

| Surface                     | Route checked                                            |
| --------------------------- | -------------------------------------------------------- |
| Contractor Dashboard        | `/dashboard`                                             |
| Lead list                   | `/leads`                                                 |
| Lead Workspace V2 detail    | `/leads/b497db9d-9f4d-4cd0-ac72-43817cabb308`            |
| Project list                | `/projects`                                              |
| Project Workspace V2 detail | `/projects/fe0ba4e8-97c2-4765-9259-c6de6344d82c`         |
| Settings Overview           | `/settings`                                              |
| Settings Organization       | `/settings/organization`                                 |
| Invoice Review              | `/invoices/c3b636bf-78e7-40a8-ad32-31f4568b961f`         |
| Schedule Day                | `/schedule?layout=day`                                   |
| Schedule Week               | `/schedule?layout=week`                                  |
| Schedule Crew               | `/schedule?layout=crew`                                  |
| Schedule Unscheduled        | `/schedule?layout=unscheduled&view=unscheduled`          |
| Portal home                 | `/portal`                                                |
| Portal project detail       | `/portal/projects/db77b765-4d6e-47d4-8c38-e91c041868f1`  |
| Portal invoice review       | `/portal/invoices/12be9e05-2171-428e-a280-8fe6aeb9e035`  |
| Portal estimate review      | `/portal/estimates/e50a0d99-728c-46d7-a070-f00341e3c33d` |
| Portal contract review      | `/portal/contracts/045c379c-132b-4a96-a8f0-8ed9a0d33a6c` |

The manual portal-home sweep did not expose a `/portal/change-orders/:id` link,
so the browser evidence table uses the closest visible portal records: project,
invoice, estimate, and contract. The requested `pnpm.cmd e2e:portal` validation
did cover portal change-order review through the dedicated change-order and
golden-path fixtures.

## Theme Verification

| Theme                            | Result                                                                                                                                                     |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One header/menu system           | Passed. Checked surfaces showed a single page header pattern with no competing stacked record subheaders.                                                  |
| Focused workspace navigation     | Passed. Lead and Project detail routes expose focused Workspace Framework V2 view links instead of same-page scroll-jump navigation.                       |
| Usable at 1366px                 | Passed across checked routes.                                                                                                                              |
| No 390px horizontal overflow     | Passed across checked routes.                                                                                                                              |
| Operational status colors        | Passed. Status color use was tied to readiness, attention, billing, schedule, or portal review states.                                                     |
| Clear primary actions            | Passed. Primary actions were visible in Lead, Project, Invoice Review, Schedule, and Portal review routes.                                                 |
| Secondary/risky action priority  | Passed with no new issue found. Invoice Review keeps edit/support actions below review/payment context.                                                    |
| Portal language customer-safe    | Passed. Portal copy described shared records, project-scoped access, and customer review actions without contractor-only internals.                        |
| Settings setup health/navigation | Passed. Settings Overview presented setup health and navigation, not a raw configuration dump.                                                             |
| Invoice Review review-first      | Passed. Invoice identity, payment summary, review/send workflow, readiness, and payment context appeared before support/editing depth.                     |
| Schedule modes                   | Passed. CrewBoard exposed Day, Week, Crew, and Unscheduled modes on `/schedule`. Existing `layout=board` compatibility remains out of scope for this pass. |
| Portal attention priority        | Passed. Portal home and project detail both showed Needs Your Attention before lower-priority history.                                                     |
| No fake UI states                | Passed with fixture caveat below. The app did not invent fake scores, AI states, or local-only workflow state.                                             |

## Issues Found And Stabilized

| Issue                                                                                                                                        | Scope                                     | Fix                                                                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Portal tab-strip helper copy had low contrast at 390px because the strip still used white text while sitting on the light portal background. | `apps/web/app/(portal)/portal/layout.tsx` | Changed the tab-strip border/background/text classes to light-surface contrast (`border-slate-200`, `bg-white/80`, `text-slate-600`). Rerun confirmed readable copy, no overflow, and no console errors. |

## Deferred Follow-Up Issues

- The current contractor QA organization contains seeded record names with
  `Demo`, `E2E`, and disposable test labels. These are fixture names, not
  invented UI states, but they make fake-data scanners noisy. Before any
  external beta/demo pass, use production-like fixture names or explicitly
  document that the organization is a QA tenant.
- The active portal home fixture did not expose a portal change-order review
  link for the manual visual sweep, even though the automated portal e2e suite
  covered change-order review. A future manual portal sweep should include a
  visible change-order card when change-order review placement is specifically
  in scope.
- The persistent feedback widget appears on contractor surfaces during mobile
  verification. It did not create horizontal overflow or block the primary
  route-level actions checked here, but a future global-chrome polish pass can
  decide whether it should collapse differently on dense mobile workspaces.

## Intentionally Unchanged

- No Support Center, Operations Monitor route, Reports redesign, template
  builder, Universal Capture, sales lifecycle rename, or new UX surface was
  started.
- No canonical route, schema, table, loader, server action, payment/signature
  path, scheduling mutation, portal access rule, or provider integration was
  changed.
- `docs/current-state.md` was not updated because this pass did not materially
  change implemented behavior.

## Recommended Next Slice

Run a focused global-chrome/mobile polish slice only if Jeff wants to address
the persistent feedback widget and any remaining authenticated-shell density
concerns before beta. Otherwise, the next higher-value UX Recovery continuation
is a fixture-backed portal change-order review verification pass so the portal
approval surface is covered with the same confidence as project, estimate,
contract, and invoice review.
