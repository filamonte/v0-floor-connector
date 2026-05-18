# Enterprise UX Redesign Plan

Status: Active
Doc Type: Design Planning
Date: 2026-05-18

This is the result of a system-wide UI/UX review commissioned after the Graphite/Copper baseline was locked in. It covers the full contractor app, portal, icon system, and visual language. It is a **planning document only**. No app code, schema, migrations, server actions, lifecycle logic, payment/signature/financial behavior, or readiness gates were changed to produce this plan.

Required prior reading before implementing any section:

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/graphite-copper-ui-system.md`
- `docs/enterprise-ui-system-audit.md`
- `docs/floorconnector-ui-build-rules.md`

---

## 1. Executive Summary

FloorConnector has a real operational foundation: multi-tenant auth, a canonical lifecycle, Graphite/Copper token baseline, shared primitives, a Cockpit-style dashboard, Project Workspace as continuity hub, Estimate Workspace as the UI/workflow reference, and a connected portal. The system direction is established.

The UX has not fully caught up. The main gap is not individual page quality — many pages are already solid — it is **system-wide coherence as a single contractor operating system**. Pages still feel like well-styled modules assembled next to each other rather than one product that shares a common visual grammar, navigation rhythm, and guidance posture.

**Visual direction:** FloorConnector should feel like Autodesk Construction Cloud, Linear, Stripe Dashboard, and Notion Enterprise — modern industrial control software with contractor operational DNA. The primary palette is the **Graphite Stack** (warm industrial grays: charcoal, gunmetal, slate graphite, soft obsidian). **Copper is an accent** — burnished, industrial, slightly desaturated — used for action emphasis and key interactive elements, not backgrounds or primary surfaces.

The redesign plan targets four areas:

1. **Identity convergence** — make every surface feel like one product, not a collection. Graphite-forward surfaces with copper accents.
2. **Operational clarity** — dashboard, project workspace, and schedule must give immediate, unambiguous answers to "what should I do next?"
3. **Financial trustworthiness** — estimates and invoices must read as premium proposal and billing documents, not styled CRUD screens.
4. **Icon and visual language** — a consistent, lightweight icon system tuned to FloorConnector's operational vocabulary (not construction-themed decoration).

---

## 2. Current UX Problems

### 2.1 System-Level Problems

**a. Mixed surface density signals.**
The dashboard uses `rounded-lg` border panels with 16px–20px padding. The Project Workspace uses `rounded-lg border border-slate-200` in many inner components — notably `OperationalCommandCenter`, `LinkedRecordRecencyPanel`, and `SectionOverview` — with hardcoded `slate-*` classes that drift from the CSS variable token system. The Estimate and Invoice workspaces use shared primitives consistently but their inner section composition varies. The result: pages look related but not identical. A user moving from Dashboard → Projects → Estimates → Invoices encounters slightly different card shapes, padding rhythm, and text hierarchy at each stop.

**b. Typography scale not uniform.**
Eyebrow/kicker labels vary between `text-[10px] tracking-[0.18em]`, `text-[11px] tracking-[0.22em]`, and `text-xs tracking-widest` across the same routes. Section titles mix `text-[17px]`, `text-lg`, and `text-base` in neighboring panels. There is no clearly declared 3-level heading hierarchy (page → section → panel) applied consistently everywhere.

**c. Hardcoded color literals persist in high-traffic pages.**
Project Workspace (`/projects/[projectId]/page.tsx`) contains multiple hardcoded hex strings: `#eadfce`, `#665446`, `#2b2118`, `#e3d6c7`, `#fbf4ea`, `#6a5645`, `#7a614a`, `#5f4d3d`, `#d7b98f`, `#ef7d32`. The `SectionOverview`, `LinkedRecordRecencyPanel`, `OperationalCommandCenter`, and `getWorkspaceActionLinkClassName` helpers use raw hex and `slate-*` Tailwind classes rather than CSS variables. This is the single largest visual drift surface in the entire app.

**d. Action classes diverge between workspaces.**
`getWorkspaceActionLinkClassName("primary")` in the Project Workspace references `bg-brand-700` and `bg-brand-900` — classes that are not defined in the Graphite/Copper token system. The secondary action uses raw `slate-200`/`slate-300`/`slate-600`/`slate-700` literals. The Estimate Workspace imports `primaryActionClassName`, `secondaryActionClassName`, and `overflowActionClassName` from `@/components/action-hierarchy`, which is the correct pattern. Project Workspace should use the same source.

**e. "Rounded-full" vs "rounded-[4px]"/"rounded-lg" inconsistency.**
The action link helpers in Project Workspace use `rounded-full`. The shared `action-hierarchy.tsx` uses `rounded-[4px]` (square-ish) or `rounded` treatment consistent with the Graphite/Copper UI. Portal cards use `rounded-2xl`. The shell uses `rounded-[4px]` for the search bar. This is a three-tier radius inconsistency across what should be one system.

**f. Empty states are inconsistent.**
Some surfaces use the shared `AppEmptyState` component correctly. Others (notably some Project Workspace sub-sections and older manager pages) render local ad-hoc empty/placeholder blocks that lack the shared visual treatment.

**g. The dashboard has too many competing section titles at the same visual weight.**
"Key metrics / Pipeline and execution snapshot", "Canonical lifecycle / Opportunity to payment continuity", "Action awareness / High-signal attention", "My project priorities / Project cue follow-up", and multiple operational cockpit sections all have the same `text-[17px] font-semibold` title weight. There is no visual hierarchy that tells the eye where to start.

### 2.2 Dashboard-Specific Problems

- The lifecycle rail (`LifecycleRail`) is visually prominent but its information density is low — five cells with a label, a number, and a detail string. It competes with the priority grid for attention without providing actionable guidance.
- The priority strip (`PriorityStrip`) sits above the key metrics grid but it is smaller and less visually dominant. The ordering (priority strip → metrics grid → lifecycle rail) does not reflect urgency priority in a way that reads naturally.
- The cockpit buckets (`OperationalGuidanceBucket`) are the most operationally useful section but are visually at the same weight as everything else.
- The `BoardPanel` widget structure (attention, project cues, work items, my work modes, commercial, operations, finance) results in 6–10 board panels visible at once on a full dashboard, all at the same visual weight. The eye has no natural starting point.
- Filter/search within the dashboard is buried and feels like an afterthought.

### 2.3 Project Workspace-Specific Problems

- `OperationalCommandCenter` uses `slate-*` Tailwind classes throughout, making it look slightly different from the rest of the page.
- `LinkedRecordRecencyPanel` also uses raw `slate-*` classes and adds `rounded-lg border border-dashed border-slate-300` empty states that don't match shared patterns.
- `SectionOverview` renders a local `rounded-full` stat badge and a `rounded-full` link button using `getWorkspaceActionLinkClassName("secondary")` — which resolves to raw `slate-*` classes. This creates drift from the shared action system.
- The readiness panel inside `OperationalCommandCenter` uses `bg-slate-50` / `border-slate-200` rather than CSS variables.
- The "Next move" panel inside `OperationalCommandCenter` uses hardcoded warm hex (`#e3d6c7`, `#fbf4ea`, `#7a614a`, `#2b2118`) rather than CSS variables. This is not wrong aesthetically but breaks the token contract.
- `getWorkspaceActionLinkClassName("primary")` uses `bg-brand-700`/`bg-brand-900` which do not exist in the CSS token system.
- The page-level action bar (`ActionBar`, `WorkflowBar`) from `@floorconnector/ui` is used correctly at the top. The lower sections drift from that standard.
- There are too many section-level `h3` / `h2` headings at similar visual weights. The page has an `h1` inside `DetailPageHeader` but the section structure below it doesn't consistently follow a single heading level schema.

### 2.4 Estimate/Invoice Workspace Problems

- The Estimate Workspace is the reference pattern and is generally well-executed.
- The main gap: the estimate line-item table inside the workspace reads as a technical data table rather than a premium proposal. The column headers, row text size, and cell padding are functional but not proposal-quality.
- Invoice line-item and SOV presentation have the same issue — they read as utility tables, not billing documents.
- `DetailPanel` sections sit on a white `bg-white shadow-sm rounded-lg` surface, which is consistent. The inner content could benefit from slightly more breathing room at section transitions.
- Status badges in both workspaces are consistent and correct.
- The revision timeline is correct in principle but visually quiet — it is below the fold and uses text weight that doesn't distinguish current vs past revisions clearly.

### 2.5 Schedule / Jobs Problems

- The Schedule page (`/schedule/page.tsx`) has local class constants (`schedulePrimaryActionClassName`, `scheduleSecondaryActionClassName`, `scheduleMutedActionClassName`, `schedulePanelClassName`, `schedulePanelHeaderClassName`, `scheduleInsetPanelClassName`, `scheduleFieldClassName`) that duplicate rather than extend the shared system. These are already flagged in the audit but not yet resolved.
- The board view, week planner, and day planner are functional but the panel composition (especially action panel / crew section) uses a different padding rhythm from other workspaces.
- The "Ready work queue" and "Scheduled timeline" sections feel like separate views glued together rather than two views within one operational surface.
- Job status badges are consistent with the shared helper.

### 2.6 Manager-Page Problems

- Most manager pages use `ContractorWorkspacePage` / shared layout correctly.
- Status filter chips vary slightly in height and padding across `/estimates`, `/invoices`, `/jobs` — some use `h-7`, some use `h-8`, some use `h-9`.
- The `WorkspaceCommandBar` treatment is broadly consistent but some routes still add route-local class overrides on top of it.
- Sort controls on estimates/invoices are functional but visually verbose.

### 2.7 Navigation and Shell Problems

- The global search is in the footer — an unusual location that is functional but counterintuitive for new users.
- The notification center is in the header nav but its icon treatment is generic (standard bell icon without a FloorConnector-specific touch).
- The mobile nav uses a hamburger + slide menu approach that is functional but generic.
- The `EarlyAccessHelpButton` is a floating element that is sometimes visually unexpected on dense workspace pages.

### 2.8 Icon System Problems

- The app currently uses Lucide icons throughout, which is correct and appropriate.
- There is no documented icon philosophy beyond "use Lucide." This means icon choices vary by whoever wrote a given component.
- Some high-value workflow concepts (readiness gate, lifecycle stage, crew dispatch, progress billing, change order) have no consistent icon treatment.
- Some icons are used interchangeably for different concepts (generic `AlertCircle` for both blockers and attention states with different urgencies).
- No module-level icon identifiers exist — `/estimates`, `/projects`, `/jobs`, `/invoices` etc. do not have a defined canonical icon.

### 2.9 Graphite/Copper Maturity Problems

- The token system is real and correct at the CSS variable level. The gap is consistent usage.
- `--cream` (`#FAFAF8`) is used as the app body background in the shell. Inside pages, some panels use `bg-[var(--highlight)]` (`#F3F4F6`) and some use `bg-slate-50` which are similar but not identical. This creates micro-differences in page depth that undermine the layered surface feel.
- `--copper` (`#B45309`) and `--copper-light` (`#D97706`) are used for primary action emphasis. Some action buttons still use generic blue or brand classes inherited from earlier code.
- Depth layering (cream body → white cards → highlight insets) is partially implemented but not consistently enforced across all surfaces.
- The `globals.css` decorative gradients on the `body` element provide a nice ambient effect but the grid-line pattern on `.fc-shell` is not applied uniformly — it appears on some surfaces and not others.

---

## 3. Design Principles for FloorConnector Going Forward

1. **One operating system, not assembled modules.** Every surface shares the same depth rhythm, type scale, token vocabulary, and action grammar. Users should not notice a visual mode shift when moving between workspaces.

2. **Graphite-forward industrial aesthetic.** The visual identity is warm industrial grays — charcoal, gunmetal, slate graphite — with copper as a controlled accent for action emphasis. This is Autodesk/Linear/Stripe territory, not generic SaaS.

3. **Operational clarity first.** The first question a contractor has when opening any page is: "what do I do next?" That answer must be visually primary — louder than everything else — before any metadata, history, or supporting records compete for attention.

4. **Premium but not decorative.** FloorConnector is handling contracts worth $5K–$500K. The visual language should convey trust, precision, and capability. This means restraint over decoration, structured information over ambient color, and document-quality presentation for proposals and invoices.

5. **Honest guidance density.** Guided, Flexible, and Manual modes must produce visually distinct but equally trustworthy pages. Reducing coaching copy must not reduce information density — facts, statuses, and blockers must remain visible.

6. **Token-first, not utility-first.** All color usage flows from CSS variables. Raw hex, `slate-*` Tailwind classes, and `brand-*` classes are permitted only as migration debt, not new patterns.

7. **Proposing is the center.** The Estimate Workspace is the UI/workflow reference. Every other workspace borrows its grammar: `DetailPageHeader` → `ActionBar/WorkflowBar` → `ProjectStateSummary` → `DetailPanel` sections → context rail → lower-frequency content.

8. **Depth layering is deliberate.** Body (warm neutral) → card surface (clean white) → inset panel (cool gray) → warning tint (amber/rose). This three-level depth system must be enforced everywhere.

9. **Icons are semantic, not decorative.** Every icon must earn its place by communicating a specific meaning that words alone would require more space to convey. No construction-themed decoration.

---

## 4. Proposed Enterprise Visual Identity

### Visual Personality Target

FloorConnector should feel like:

- **Autodesk Construction Cloud** — professional operational control software
- **Linear** — precise, dense, modern developer/ops tooling
- **Stripe Dashboard** — premium fintech-grade precision
- **Notion Enterprise** — structured workspace, confident typography
- **High-end logistics/workflow systems** — industrial clarity, warm industrial grays

...but with contractor operational DNA.

**Not:**

- "Construction-themed" (hard hats, orange vests, tool icons)
- "Toolbox UI" (fake rugged, heavy borders, thick shadows)
- "Generic SaaS template" (overly rounded, playful, startup-y)
- Neon orange, playful orange, or bright startup orange

### Color Direction — Graphite-Forward Industrial Stack

The design direction is **graphite-dominant with copper as an accent**. The primary palette is warm industrial grays (rich charcoal, gunmetal, slate graphite, soft obsidian). Copper provides action emphasis and warmth but is not the dominant tone.

#### Primary Graphite Stack

| Token              | Value     | Use                                                           |
| ------------------ | --------- | ------------------------------------------------------------- |
| `--graphite-dark`  | `#1F2937` | Primary headings, record titles, dominant text, shell accents |
| `--graphite`       | `#374151` | Primary CTAs, confirmed commits, operator action buttons      |
| `--graphite-light` | `#4B5563` | Secondary actions, hover states on graphite, supporting text  |
| `--graphite-muted` | `#6B7280` | Metadata, eyebrow labels, tertiary text                       |
| `--graphite-soft`  | `#9CA3AF` | Placeholder text, deactivated labels, subtle borders          |

#### Surface Stack (warm industrial neutrals)

| Token             | Value     | Use                                                                |
| ----------------- | --------- | ------------------------------------------------------------------ |
| `--surface-body`  | `#FAFAF8` | App body background (shell) — very slight warm tint, not pure gray |
| `--surface-card`  | `#FFFFFF` | Primary card surfaces — clean white for content panels             |
| `--surface-inset` | `#F3F4F6` | Inset panel backgrounds, table headers, subtle depth panels        |
| `--border-warm`   | `#E8E6E1` | Card/panel borders — warm gray, not cold                           |
| `--border-medium` | `#D9D5CD` | Stronger section dividers, active state borders                    |

#### Copper Accent (used sparingly)

| Token            | Value     | Use                                                                |
| ---------------- | --------- | ------------------------------------------------------------------ |
| `--copper`       | `#B45309` | Primary action emphasis (create, save, continue), links, CTA hover |
| `--copper-light` | `#D97706` | Hover state on copper elements, subtle warm highlight              |

**Copper usage rules:**

- Copper is for **action emphasis** and **key interactive elements** — not backgrounds
- One copper-accented CTA per section maximum
- Links can use copper on hover but default to graphite
- Never use neon orange, playful orange, or saturated bright orange
- The copper should feel burnished, industrial, slightly desaturated — premium, not startup

#### Semantic State Colors (unchanged)

- **Green / emerald**: accepted, approved, complete, paid, signed
- **Red / rose**: destructive, error, blocked, rejected, void
- **Amber**: warning, prerequisite, pending, needs attention
- **Neutral graphite**: draft, advisory, in-progress utility

#### Text Hierarchy

| Token              | Value     | Use                                     |
| ------------------ | --------- | --------------------------------------- |
| `--text-primary`   | `#111827` | Headings, record titles, primary values |
| `--text-secondary` | `#4B5563` | Body copy, supporting labels            |
| `--text-tertiary`  | `#6B7280` | Metadata, eyebrow labels, timestamps    |
| `--text-muted`     | `#9CA3AF` | Placeholder text, deactivated content   |

**Items to eliminate:**

- Raw `slate-*` Tailwind classes in Project Workspace, Schedule, and Settings pages
- `bg-brand-700`, `bg-brand-900` references (undefined tokens)
- `rounded-full` on workspace action buttons (reserve for badge pills only)
- Hardcoded hex strings in any protected-app TSX file
- Any neon, playful, or overly saturated orange
- Warm cream/tan backgrounds on operational panels (use graphite surface stack instead)

### Typography Direction

Proposed 3-level scale (keep current values, enforce consistently):

| Level                   | Usage                    | Class                                                                                                                                                        |
| ----------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Page title (h1)         | Route/workspace name     | `text-xl font-semibold tracking-tight text-[var(--text-primary)]` via `DetailPageHeader`                                                                     |
| Section heading (h2/h3) | Named workspace sections | `text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]` (eyebrow) + `text-base font-semibold text-[var(--text-primary)]` (title) |
| Panel subheading        | Sub-panel labels         | `text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]`                                                                          |

The eyebrow + title pairing should be the consistent section opener. The current system already uses it in shared components; the goal is enforcing it in Project Workspace custom components.

### Depth Layering — Graphite Surface Stack

Every protected page must follow this three-level visual depth using the graphite surface stack:

```
Body: bg-[var(--surface-body)]        ← outermost, shell background (warm neutral)
  Card: bg-[var(--surface-card)] border border-[var(--border-warm)]   ← primary surfaces (clean white)
    Inset: bg-[var(--surface-inset)] border border-[var(--border-warm)]  ← supporting panels (cool gray)
      Warning tint: bg-amber-50 border-amber-200  ← only when state requires it
```

This creates the "modern industrial control software" feel: predominantly gray and white surfaces with clear depth hierarchy, warm borders to prevent coldness, and copper accents only on interactive elements.

Deviation from this pattern is the primary source of visual inconsistency today.

### Action Button Hierarchy

Three levels, shared from `action-hierarchy.tsx`:

| Level     | Class source               | Use                                                                |
| --------- | -------------------------- | ------------------------------------------------------------------ |
| Primary   | `primaryActionClassName`   | One per area. **Graphite by default**, copper for key commits.     |
| Secondary | `secondaryActionClassName` | Supporting workflow actions. White bg, warm border, graphite text. |
| Overflow  | `overflowActionClassName`  | Lower-frequency or destructive actions inside menus.               |

**Button styling rules:**

- Primary actions default to **graphite** (`bg-[var(--graphite)]`) — the dominant CTA treatment
- Copper (`bg-[var(--copper)]`) reserved for key conversion moments: "Send Estimate", "Accept Contract", "Record Payment"
- `rounded-full` is reserved for: status badges, metric chips, and persona/avatar elements. Never for workflow action buttons.
- All action buttons use `rounded-[4px]` consistent with Linear/Stripe precision aesthetic

---

## 5. Proposed Icon and Graphics System

### 5.1 Icon Philosophy — Contractor Operating System

FloorConnector is an operational control system for specialty surface contractors. The icon language must support that identity:

- **Functional, not decorative.** Every icon communicates a specific workflow concept. No icon clusters as visual filler.
- **Industrial precision.** Icons should feel like control software indicators — Linear, Figma, Autodesk — not consumer app friendliness.
- **Consistent weight.** All icons at `16px` use stroke-width `1.75`, all at `20px` use `1.5`, all at `24px` use `1.5`. Never mix solid fills and strokes in the same surface.
- **Trade-aware but not themed.** Use icons that connote operational precision (workflows, gates, queues) rather than literal construction imagery (hard hats, hammers as decoration).
- **Predictable.** The same icon for the same concept, everywhere. No two different icons for "blocked."

### 5.2 Lucide as the Foundation

Lucide remains the base library. Do not add a second icon library. Custom icons (if needed) should be implemented as small SVG wrapper components in a shared `icons/` directory and documented.

### 5.3 Module Icon Vocabulary (proposed)

| Module               | Proposed Lucide Icon       | Rationale                             |
| -------------------- | -------------------------- | ------------------------------------- |
| Dashboard            | `LayoutDashboard`          | Industry standard for command center  |
| Opportunities/Leads  | `Funnel` or `Target`       | Sales pipeline/intake funnel          |
| Customers            | `Building2`                | Business/account relationship         |
| Projects             | `Folder` or `HardHat`      | Operational root; work delivery       |
| Estimates            | `FileText`                 | Proposal/document                     |
| Contracts            | `FileSignature`            | Legal document with signing context   |
| Change Orders        | `GitBranch` or `RefreshCw` | Scope change on existing chain        |
| Jobs                 | `Wrench` or `Hammer`       | Field execution                       |
| Schedule             | `CalendarDays`             | Time-based operational planning       |
| Invoices             | `Receipt`                  | Billing document                      |
| Payments             | `CreditCard` or `Banknote` | Money collected                       |
| People / Directory   | `Users`                    | Workforce management                  |
| Field / Daily Logs   | `ClipboardList`            | Field reporting                       |
| Punchlists           | `CheckSquare`              | Closeout checklist                    |
| Settings             | `Settings2`                | Configuration/admin                   |
| Notifications        | `Bell`                     | Attention center                      |
| Portal               | `ExternalLink` or `Shield` | Customer-facing safe surface          |
| Progress Billing     | `BarChart3`                | Schedule of values / payment progress |
| Time Tracking        | `Timer`                    | Punch events / time cards             |
| Communications       | `MessageSquare`            | Message threads                       |
| Cost Items / Catalog | `Package`                  | Reusable item database                |
| Vendors              | `Truck`                    | Subcontract/supply chain              |
| Reports              | `TrendingUp`               | Analytics surface                     |
| Global Search        | `Search`                   | Already correct in shell              |

### 5.4 Workflow State Icons

| State                     | Proposed Icon                     | Color              |
| ------------------------- | --------------------------------- | ------------------ |
| Complete / Paid / Signed  | `CheckCircle2`                    | Green / emerald    |
| Blocked / Error           | `XCircle` or `AlertOctagon`       | Red / rose         |
| Needs Attention (warning) | `AlertTriangle`                   | Amber              |
| In Progress / Current     | `Circle` (half-filled) or `Clock` | Neutral graphite   |
| Draft / Upcoming          | `Clock` or `Minus`                | Neutral graphite   |
| Readiness gate open       | `Unlock`                          | Green when cleared |
| Readiness gate blocked    | `Lock`                            | Amber when pending |
| Void                      | `Ban`                             | Red / rose         |

### 5.5 Sizing Rules

| Context                                         | Size                 | Stroke-width |
| ----------------------------------------------- | -------------------- | ------------ |
| Inline with 12–13px text (table rows, metadata) | `h-3.5 w-3.5` (14px) | 2            |
| Inline with body text (14–16px)                 | `h-4 w-4` (16px)     | 2            |
| Section/panel headers                           | `h-5 w-5` (20px)     | 1.5          |
| Manager Page primary action area                | `h-5 w-5` (20px)     | 1.5          |
| Module nav items in top nav                     | `h-4 w-4` (16px)     | 2            |
| Empty state illustration                        | `h-8 w-8` (32px)     | 1.25         |

### 5.6 What to Avoid

- Do not use emoji as icons (already prohibited by system doc).
- Do not use filled/solid icon variants mixed with stroke variants on the same page.
- Do not use blue, cyan, or violet icons for workflow states — the color system is graphite/copper/green/amber/red only.
- Do not create custom SVG paths for geographic maps or state boundaries — use a mapping library.
- Do not use decorative icon clusters as section filler.
- Do not use literal construction-themed icons (hard hats, tool belts, vests) as module identifiers — the operating system aesthetic is abstract operational, not trade-literal.

### 5.7 Module Identity Icons in Navigation

The top nav and mobile nav should use the proposed module icons consistently. Current implementation uses text labels only in the nav. Future: add 16px icons before each nav label for visual scanning on wider displays. This is a future enhancement, not a Phase 1 priority.

---

## 6. Navigation & Header System

The shell header and top navigation anchor the entire visual system. They must feel integrated into the graphite-forward industrial aesthetic, not like a separate chrome layer.

### 6.1 Top Navigation Styling

**Current state:** The protected app top nav uses a dark glass effect (`bg-white/8`, `text-[var(--cream)]`) with utility icon buttons that feel disconnected from the graphite surface stack.

**Target state:** A clean, graphite-integrated header that matches the operational control software aesthetic:

```
Header: bg-white border-b border-[var(--border-warm)]
  ├─ Brand/Logo section: text-[var(--text-primary)]
  ├─ Navigation menu:
  │   ├─ Menu item: text-[var(--text-secondary)], hover bg-[var(--surface-inset)]
  │   ├─ Active menu item: text-[var(--text-primary)], bg-[var(--surface-inset)]
  │   └─ Icons: 16px stroke, text-[var(--text-secondary)], hover text-[var(--text-primary)]
  ├─ Utility buttons (notifications, create, search):
  │   ├─ Default: bg-white, border border-[var(--border-warm)], text-[var(--text-secondary)]
  │   ├─ Hover: text-[var(--text-primary)], border-[var(--copper)]
  │   ├─ Active/badge count: border-[var(--copper)], text-[var(--copper)]
  │   └─ Size: h-8 w-8, rounded-[4px] (not rounded-full)
  └─ Account menu:
      ├─ Default: bg-white, border border-[var(--border-warm)], text-[var(--text-secondary)]
      ├─ Hover: text-[var(--text-primary)]
      └─ Menu trigger: always uses graphite or neutral styling (no copper)
```

**Key changes from current:**

- Replace dark glass (`bg-white/8`, `text-[var(--cream)]`) with clean white and graphite token references
- All utility icon buttons use `rounded-[4px]`, not custom border styling
- Active state uses `bg-[var(--surface-inset)]` (cool gray), not custom opacity
- Copper is used only for notification/alert badges and hover states on interactive elements
- Navigation text defaults to `text-[var(--text-secondary)]`, becomes `text-[var(--text-primary)]` on hover/active

### 6.2 Mobile Navigation

The mobile top nav (AppShellMobileNav, AppShellMobileNav menu dropdowns) must follow the same graphite-integrated pattern:

```
Menu item:
  ├─ Default: bg-transparent, text-[var(--text-secondary)]
  ├─ Hover: bg-[var(--surface-inset)], text-[var(--text-primary)]
  └─ Active: bg-[var(--surface-inset)], border-l-2 border-[var(--copper)], text-[var(--text-primary)]

Menu section divider: border-[var(--border-warm)]
Menu footer: text-[var(--text-tertiary)], text-[11px]
```

### 6.3 App Shell Body & Surfaces

**Current shell references:**

- Body background: `bg-[var(--cream)]`
- Header/footer: `bg-white`
- Global search button: `bg-[var(--highlight)]`

**Target state:** Consistent with graphite surface stack:

```
Body background: bg-[var(--surface-body)]  ← warm neutral (formerly --cream)
Header: bg-white border-b border-[var(--border-warm)]
Footer: bg-white border-t border-[var(--border-warm)]
Search button: bg-[var(--surface-inset)], border border-[var(--border-warm)], text-[var(--text-secondary)]
Search button hover: text-[var(--text-primary)], border-[var(--copper)]
```

### 6.4 Header Variants by Page Type

**Manager Page Header** (`ProtectedSurfaceHeader`):

```
bg-white/85 backdrop-blur
  Brand logo (left)
  h1 title: text-[var(--text-primary)], text-2xl font-semibold
  Description: text-[var(--text-secondary)], text-sm
  User email badge: bg-[var(--surface-inset)], border-[var(--border-warm)], rounded-full
  Sign out: graphite button
```

**Detail Workspace Header** (`DetailPageHeader`):

```
bg-white (solid, no blur)
  Brand logo (left)
  h1 title: text-[var(--text-primary)], text-xl font-semibold
  Status badge: colored pill matching state (green/amber/red), not custom
  Primary action: graphite or copper depending on workflow stage
```

### 6.5 Files Requiring Navigation/Header Updates

**Phase 1 (token cleanup, no structural changes):**

- `components/contractor-app-shell.tsx` — Replace `bg-[var(--cream)]` → `bg-[var(--surface-body)]`; update shell icon button styling to use graphite tokens
- `components/protected-app-top-nav.tsx` — Replace dark glass effect with clean white/graphite styling; update `UtilityIconFrame` to use graphite surface tokens; enforce `rounded-[4px]`
- `components/protected-surface-header.tsx` — Replace `bg-white/85` → `bg-white`; update button styling to graphite
- `components/protected-app-breadcrumbs.tsx` — Ensure text colors use `--text-*` tokens, not hardcoded
- `components/app-shell-mobile-nav.tsx` — Update menu item hover/active states to use graphite surface tokens
- `components/global-search.tsx` — Update search button styling to match surface tokens

**Phase 2 (future, structural enhancements):**

- Add 16px module icons to navigation menu items for visual scanning
- Refactor account menu to use a consistent dropdown pattern
- Consider persistent left sidebar on desktop (future, not Phase 1)

---

## 7. Proposed Page Architecture Patterns

### 7.1 Manager Page (unchanged, documented for consistency)

```
ProtectedSurfaceHeader or ContractorWorkspacePage header
  WorkspaceCommandBar (search, filters, view toggle, sort)
  WorkspaceSummaryBand or ManagerDashboardCard grid (counts/totals)
  Primary list/table/queue (with empty state via AppEmptyState)
  Quick-Create sheet trigger (WorkspaceComposerSheet)
```

All Manager Pages must use this pattern. No route-local shells.

### 7.2 Detail Workspace (tightened grammar)

```
DetailPageHeader (h1 title, status badge, primary action, secondary actions)
  ActionBar (workflow state summary, key metrics, primary/secondary actions)
  WorkflowBar (step progression)
  NeedsAttentionPanel (cues, if any)
  [Core workflow section — DetailPanel per logical group]
  [Context rail — LinkedRecordCard rows for connected records]
  [Progressive disclosure — revision timeline, lower-priority edit, history]
```

The `ActionBar` / `WorkflowBar` / `NeedsAttentionPanel` trio must appear in this order before any content panels. This is already correct in Estimate Workspace; it needs enforcing in Project, Invoice, Contract, and Job Workspaces.

### 7.3 Project Workspace (enhanced)

The Project Workspace is the continuity hub. Its structure should reflect that:

```
DetailPageHeader (project name, stage badge, primary actions)
  ActionBar (readiness state, next action, blockers count)
  WorkflowBar (opportunity → customer/project → estimate/contract → job/schedule → invoice/payment)
  OperationalGuidanceSection (cockpit buckets scoped to project, if cues exist)
  [Section: Commercial — estimate, contract, change order cards]
  [Section: Execution — job/schedule cards, crew, field execution]
  [Section: Financial — invoices, payments, progress billing]
  [Section: Customer Access — portal contacts, access state read-only]
  [Section: Internal — work items, notes, revision timeline, audit]
```

The `OperationalCommandCenter` component should be refactored to use CSS variables and shared action classes before the next design pass.

### 7.4 Settings / Admin Page (unchanged)

Compact section card → form panel → save zone. No operational workflow content.

### 7.5 Portal Review Page (unchanged)

Customer-safe, single primary action, supporting record facts. No internal language.

---

## 7. Dashboard Redesign Plan

### Current State Assessment

The dashboard has a solid operational foundation. The cockpit buckets (`OperationalGuidanceBucket`), priority strip (`PriorityStrip`), and key metrics grid are all well-conceived. The visual problem is that 8–12 board panels appear at the same visual weight with the same `BoardPanel` chrome.

### Proposed Dashboard Visual Hierarchy

**Top band (must-see zone):** Priority strip + early access banner (if active). Maximum 1 full-width section.

**First tier — Operational Cockpit:** The cockpit buckets (Needs attention, Ready to move, Waiting, Field follow-up) should be visually dominant — largest text, strongest border treatment, immediately below the priority strip. These are the "what to do now" anchors.

**Second tier — Pipeline snapshot:** Key metrics grid (5-cell responsive grid). Compact, scannable. Same as today but visually de-weighted relative to cockpit.

**Third tier — Queue widgets:** Commercial, Operations, Finance queues in a responsive two-column layout. These are the work surfaces for individual records. Board panels should use a slightly smaller title weight than cockpit buckets.

**Fourth tier — Supporting context:** Work items, lifecycle rail, recent payments, onboarding steps. These are reference surfaces, not primary action surfaces.

### Specific Changes

1. Increase visual weight of cockpit bucket section headers — use `text-base font-semibold` for bucket titles vs `text-[17px]` for all other panel titles. Consider a subtle left border accent (copper, 3px) on the cockpit section container to signal "this is mission control."
2. De-weight the lifecycle rail — move it below queue widgets or collapse it to a compact horizontal scrollable band. The lifecycle totals are useful context, not primary action triggers.
3. Add a clear visual separator (a ruled divider using `.fc-rule`) between the cockpit tier and the queue widgets tier.
4. The search/filter input inside the dashboard should be positioned at the top of the queue widgets section, not floating mid-page.
5. The `My Work` / `Company` / `Unresolved` mode tabs should be styled as clear tab controls, not radio-style buttons that are easy to miss.
6. The onboarding `StartHereCard` should appear only when it is the most important surface — gate its display to fresh accounts or accounts with zero real records. On active accounts it currently appears above the cockpit, which is the wrong priority.

---

## 8. Project Workspace Redesign Plan

### Immediate Token Cleanup (Priority 1 within Phase 1)

The following components inside `/projects/[projectId]/page.tsx` must be migrated to CSS variables:

- `OperationalCommandCenter`: replace all `slate-*` classes with `var(--*)` tokens.
- `LinkedRecordRecencyPanel`: same migration. Replace `rounded-lg border border-dashed border-slate-300 bg-slate-50` with shared empty-state treatment.
- `SectionOverview`: replace `rounded-full` action links with shared `secondaryActionClassName` from `action-hierarchy.tsx`. Replace hardcoded hex stat badge with CSS variable equivalent.
- `getWorkspaceActionLinkClassName("primary")`: remove `bg-brand-700`/`bg-brand-900` and replace with `bg-[var(--graphite)]`/`bg-[var(--graphite-light)]` or `bg-[var(--copper)]`/`bg-[var(--copper-light)]` depending on context.

### Structural Clarification

The Project Workspace currently has three large structural sections — Core Workflow, Execution, Support — plus the command center and linked record recency panel at the top. The visual separation between these sections is a border divider inside `SectionOverview` which is too subtle.

Proposed: introduce a named section band using the same pattern as other workspace sections: an eyebrow kicker + section title + optional action link. This is already partially implemented via `CoreWorkflowSection`, `ExecutionSection`, `SupportSection` — the improvement is making the visual weight of these section headers match the rest of the workspace grammar.

### Next-Action Clarity

The "Next move" panel inside `OperationalCommandCenter` is the right concept but the layout puts it at medium visual weight alongside the "Attention" panel. If there is one next action that matters, it should be visually dominant in that section — larger title text, clearer primary CTA button. The "Attention" panel (blockers count) should be secondary.

---

## 9. Estimate and Invoice Workspace Redesign Plan

### Estimate Workspace

The Estimate Workspace is already the reference pattern. The remaining gaps:

1. **Line-item table presentation.** The line-item list inside the workspace review panel reads as a utility table. Proposal: increase row padding slightly (`py-3` → `py-3.5`), add a light copper underline on hover for each row link, and tighten the column header weight so it feels more like a proposal document header and less like a data grid header.

2. **Approval state visual upgrade.** When an estimate is `approved`, the `ActionBar` correctly shows a success tone. Additionally, a full-width success state band (copper/green accent, compact, single line) at the very top of the workspace body would make the approval state immediately obvious without requiring the user to read the status badge.

3. **Revision timeline discoverability.** The revision timeline (`RevisionTimeline`) is below the fold. Consider adding a compact revision count badge near the `ActionBar` that links/scrolls to the revision section. This doesn't require moving the component.

### Invoice Workspace

1. **SOV (Schedule of Values) presentation.** Progress billing SOV rows feel more like internal accounting than a structured billing milestone view. The SOV table should distinguish payment milestone descriptions from billing amounts more clearly — stronger milestone title weight, clearer percentage/amount columns.

2. **Payment recording vs portal payment clarity.** The contractor-side manual payment entry is visually similar to the portal payment initiation. Consider a more distinct treatment for the "Record payment" action (graphite background, operator-framing copy) vs the portal-facing action (copper primary).

3. **Outstanding balance prominence.** The outstanding balance is the most important financial fact on an invoice page. It should be the largest numeric value on the surface, not one metric in a grid of four.

---

## 10. Jobs and Schedule Operational UX Redesign Plan

### Jobs Manager Page

Generally solid. Specific improvements:

1. Remove local schedule class constants (`schedulePrimaryActionClassName`, etc.) and replace with shared `action-hierarchy.tsx` exports.
2. Align filter chip height to `h-8` consistent with other manager pages.

### Schedule Page

1. **Readiness-first framing.** The summary cards at the top of the schedule page should list "Ready but unscheduled" jobs most prominently — this is the operationally urgent queue. Currently the cards present all counts equally.

2. **Selected job action panel.** The panel that appears when a job is selected should feel like a focused command surface: darker background band (graphite surface), clear job title, one primary schedule/reschedule action, crew assignment as secondary. Currently it blends into the overall page surface.

3. **Week planner day columns.** The day planner timeline view should use a cleaner visual grid — the hour markers should be lighter (less competing with job blocks), and job blocks should use a small copper left-border accent rather than a background tint to distinguish them.

4. **Empty queue states.** "No scheduled jobs for this view" should be replaced with context-aware guidance: if no jobs exist at all, link to job creation; if jobs exist but none are ready, link to the readiness blockers on the project hub.

---

## 11. Manager-Page System Redesign Plan

Manager pages are broadly consistent. The remaining items:

1. **Filter chip height uniformity.** Standardize to `h-8` across all manager pages.
2. **Sort control visibility.** The sort dropdowns on estimates/invoices should be visually lighter — a small icon + text, not a full dropdown button that competes with the filter chips.
3. **Perspective switcher.** The `My Work` / `Company` tabs should use a consistent pill-tab style: `rounded-full` pills with `bg-[var(--graphite)]` for selected, `bg-white border border-[var(--border-warm)]` for unselected.
4. **Row click targets.** All manager page rows should have a clear full-row hover state (`bg-[var(--highlight)]` on hover). Some manager pages already do this; ensure it is consistent.

---

## 12. Shared Component and System Plan

The following reusable presentation primitives should be created or enhanced:

| Primitive                | Action                                                                                                                                                                                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OperationalContextBand` | New: a full-width compact status band for workspace tops. Shows current lifecycle stage, readiness state, one key metric, and one primary action in a single row. Used above `ActionBar` on Project Workspace.                                                         |
| `WorkspaceSectionHeader` | New: standardized section header component for use inside workspace pages — eyebrow + title + optional link. Replaces custom `SectionOverview` in Project Workspace and similar ad-hoc section headers elsewhere.                                                      |
| `WorkflowGuidanceCard`   | Formalize: a structured guidance card for next-best-action presentation. Title (what to do), description (why), primary action, optional blocker copy. Currently implemented inline in Project Workspace `OperationalCommandCenter`; should become a shared primitive. |
| `QueueCard`              | New: a compact single-record queue card used in cockpit previews, schedule queue, and invoice/job sections. Uniform padding, status badge placement, trailing value.                                                                                                   |
| `InlineStatusPill`       | New: a very compact (h-5, 10px font) status pill for use inside table rows and compact lists where the current `rounded-md border` badge is too large.                                                                                                                 |
| `EmptyGuidanceState`     | New: an empty state variant that also explains what upstream workflow condition is missing, with a link to the right place. Extends `AppEmptyState` without replacing it.                                                                                              |
| `DocumentLineItemRow`    | New: a premium row style for estimate and invoice line items. Slightly more padding, hover highlight, optional copper link treatment on the item name.                                                                                                                 |
| `RevisionBadge`          | New: a compact count badge that shows the number of revisions and links to the revision timeline section. Used near the `ActionBar`.                                                                                                                                   |
| `OperationalMetricTile`  | Formalize: standardize the `ManagerDashboardCard` / PriorityGrid metric cell into one shared tile with consistent height, padding, label/value/detail composition.                                                                                                     |

---

## 13. Implementation Phases

### Phase 1 — Token Cleanup and Grammar Enforcement (Safe, High-Impact)

Focus: close the visual drift in Project Workspace, enforce depth layering across all surfaces, standardize action button classes, resolve the `brand-700`/`slate-*` issues.

**Scope:**

- Migrate `OperationalCommandCenter`, `LinkedRecordRecencyPanel`, `SectionOverview`, and `getWorkspaceActionLinkClassName` in `/projects/[projectId]/page.tsx` to CSS variable tokens and shared action classes.
- Resolve the `bg-brand-700`/`bg-brand-900` references.
- Replace `rounded-full` action link buttons in Project Workspace with `rounded-[4px]` consistent with the rest of the system.
- Standardize filter chip height to `h-8` across all manager pages that vary.
- Remove or replace local schedule class constants with shared imports from `action-hierarchy.tsx` (already flagged in audit).

**Guardrails:**

- Presentation-only. No schema, action, route, workflow, or readiness changes.
- Preserve all test IDs, form names, hidden inputs, server-action bindings, and route structure.
- No new dependencies or library additions.

### Phase 2 — Dashboard Visual Hierarchy Tightening

Focus: establish clear visual priority between cockpit buckets, key metrics, queue widgets, and supporting context.

**Scope:**

- Increase visual weight of the Operational Cockpit section.
- Add a copper left-border accent to the cockpit container.
- Move the lifecycle rail below queue widgets or condense it.
- Add a `.fc-rule` divider between cockpit and queue tiers.
- Reposition the `StartHereCard` to appear only for fresh/low-record accounts.
- Tighten the `My Work` mode tabs into a consistent pill-tab visual.

**Guardrails:**

- No changes to dashboard data loading, cockpit read model, cue derivation, or readiness semantics.
- No changes to dashboard props or server-side logic.
- Client surface only for interactive state (mode tabs already client-side).

### Phase 3 — Shared Primitive Creation

Focus: build the `WorkspaceSectionHeader`, `WorkflowGuidanceCard`, `QueueCard`, and `EmptyGuidanceState` primitives, then migrate existing usage in Project Workspace and Schedule to use them.

**Scope:**

- Create shared components in `apps/web/components/`.
- Migrate Project Workspace custom helper components to shared primitives.
- Migrate Schedule local panel classes to shared action/panel helpers.

**Guardrails:**

- Verify that all migrated components preserve existing props, behaviors, and test assertions.
- No changes to data loading, scheduling logic, readiness, or lifecycle behavior.

### Phase 4 — Icon System Enforcement

Focus: document and apply the proposed module icon vocabulary in the top nav, mobile nav, empty states, and manager page headers.

**Scope:**

- Add module icons to top nav and mobile nav links.
- Add module icons to `AppEmptyState` usage in core manager pages.
- Create a simple `icons/` index documenting canonical icon choices per module.

**Guardrails:**

- Icon choices must use existing Lucide library only. No new dependencies.
- No changes to nav routing, link structure, or auth behavior.

### Phase 5 — Estimate and Invoice Line-Item Presentation

Focus: elevate estimate and invoice line-item tables to premium proposal/billing document quality.

**Scope:**

- Create `DocumentLineItemRow` shared component.
- Apply to Estimate Workspace line-item review panel and Invoice Workspace.
- Add `RevisionBadge` near ActionBar on workspaces where revision timeline exists.
- Tighten SOV presentation in progress billing.

**Guardrails:**

- No changes to line-item data, financial calculations, or approval/billing state.
- Readonly review panels only — the Estimate Editor is out of scope for this phase.

---

## 14. Recommended First Implementation Pass

The single highest-value, lowest-risk change is **Phase 1: Token Cleanup in Project Workspace**.

Reasons:

1. The Project Workspace is the operational hub. It is the most-visited detail workspace in the app.
2. The drift (hardcoded hex, `slate-*`, `brand-700`, `rounded-full` action links) is concentrated in a few local helper functions and components at the top of the file.
3. The fix is mechanical: replace class strings with CSS variable equivalents and import shared action classes. No data, logic, or behavior changes.
4. The impact is immediately visible in the most important workspace in the product.

**Files likely touched in Phase 1:**

- `apps/web/app/(app)/projects/[projectId]/page.tsx` — primary target
- `apps/web/app/(app)/schedule/page.tsx` — schedule class constants cleanup
- `apps/web/app/(app)/estimates/page.tsx`, `invoices/page.tsx`, `jobs/page.tsx` — filter chip height uniformity check
- `apps/web/components/action-hierarchy.tsx` — verify exports are correct for workspace import
- `apps/web/app/globals.css` — no changes expected; verify `--brand` tokens do not exist (they don't; they are in `tailwind.config.ts` if at all)

---

## 15. Risks and Guardrails

| Risk                                                                                        | Mitigation                                                                                                                                            |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Visual regression on Project Workspace during token migration                               | Run `pnpm exec playwright test e2e/detail-workspace-ui.spec.js --project=chromium-protected` before and after                                         |
| Accidentally moving test IDs, form `name` attributes, or hidden inputs during JSX refactors | Read the full component before editing; never remove form structure during class migrations                                                           |
| Breaking schedule page server actions during local class cleanup                            | Local class constants are purely presentational strings; they do not affect form bindings or actions                                                  |
| Dashboard hierarchy changes affecting the cockpit read model                                | Phase 2 changes are CSS-only on the client component; no changes to props, data, or read model                                                        |
| Shared primitive extraction introducing prop drift in consuming components                  | Create new primitives alongside existing components first, migrate one consumer at a time, remove old component only after all consumers are migrated |
| Icon changes affecting E2E selectors that rely on icon aria labels                          | Audit E2E tests for icon-dependent selectors before Phase 4; use `aria-hidden="true"` on decorative icons                                             |

---

## 16. Files Likely to Change in the First Implementation Pass (Phase 1)

| File                                               | Change Type                                                            |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| `apps/web/app/(app)/projects/[projectId]/page.tsx` | CSS variable migration, action class replacement, rounded-full cleanup |
| `apps/web/app/(app)/schedule/page.tsx`             | Replace local class constants with shared imports                      |
| `apps/web/app/(app)/estimates/page.tsx`            | Filter chip height check/normalize                                     |
| `apps/web/app/(app)/invoices/page.tsx`             | Filter chip height check/normalize                                     |
| `apps/web/app/(app)/jobs/page.tsx`                 | Filter chip height check/normalize                                     |

No schema, migration, server action, route, lifecycle, RLS, auth, financial, payment, signature, readiness-gate, portal-access, or canonical workflow behavior changes are required for Phase 1.

---

## 17. What Should NOT Be Changed

The following are explicitly out of scope for all UX redesign work:

- Schema, database migrations, RLS policies
- Server actions, form payload contracts
- Auth, session, middleware, route protection
- Canonical lifecycle rules (opportunity → … → payment)
- Readiness gates (`assertProjectReadinessGate`)
- Financial calculations (totals, tax, SOV, change-order amounts)
- Payment, signature, portal-access, or checkout behavior
- Notification delivery, cue derivation, or cue suppression semantics
- Portal customer access grants or project visibility rules
- Tenant isolation, organization bootstrap, membership logic
- Super-admin platform governance, early-access activation, SaaS billing logic
- Import/export data handling
- The canonical records model (no new record types, no duplicate records)
- E2E test structure (test IDs, auth states, fixture records)
- The `graphite-copper-ui-system.md` documented baseline (additions only, no reversion)

UX redesign work must remain **presentation-only unless a separate implementation slice is explicitly approved**.
