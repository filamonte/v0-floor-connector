# Enterprise UX Redesign Plan

Status: Planning
Doc Type: UX Strategy
Date: 2026-05-18

---

## 1. Executive Summary

FloorConnector has crossed a threshold. The backend is no longer a prototype: real multi-tenant auth, a canonical lifecycle, financial chains, scheduling, portal, payments, AI guidance infrastructure, and a locked Graphite/Copper design token system are all in place. The system architecture is sound.

The problem is that the UX has not yet caught up with what the system actually is. Individual pages are visually consistent by the standards of an iterative cleanup pass, but the product does not yet communicate as one connected contractor operating system. The surfaces still feel like assembled modules sharing a token set rather than rooms in a single cockpit.

This plan describes what needs to change, why, and how, without touching schema, business logic, financial rules, RLS, server actions, or workflow lifecycles.

The goal is one thing: make FloorConnector read and operate like a premium, purpose-built, contractor-grade operating system — from the first glance at the dashboard to the last invoice collected.

---

## 2. Current UX Problems

### 2.1 Spatial Incoherence — The System Feels Like Assembled Modules

Individual routes have been polished page by page. The result is visual consistency within a page, but not across the product. Moving from the dashboard to a project workspace to an estimate to an invoice does not feel like one operating system; it feels like visiting adjacent products. There is no unifying spatial grammar that tells the user "you are always inside FloorConnector."

### 2.2 Dashboard Does Not Feel Like Mission Control

The current dashboard correctly surfaces queue widgets, lifecycle rails, and cockpit buckets. But the visual hierarchy does not make it feel like a contractor control tower. Urgency, readiness, and next action are present, but they compete equally with lower-priority content. A busy contractor glancing at the dashboard cannot instantly answer: "What do I do right now?"

### 2.3 Project Workspace Is the Hub, But Does Not Feel Like One

The Project Workspace is the most important surface in the product. It is where all connected work converges. But visually, it still presents its sections as parallel `DetailPanel` cards with similar weight. There is no strong visual hierarchy that says "this is the operational root" and then subordinates estimate/contract/job/invoice into clear downstream lanes.

### 2.4 Estimate and Invoice Workspaces Lack Premium Financial Identity

Estimates and invoices are proposal and billing documents that customers sign and pay. They need to carry the visual gravity of premium financial instruments. The current presentation is clean and functional but not distinctly trustworthy or proposal-first in its visual language. Competitors in higher-trust segments invest in document-quality presentation; FloorConnector currently does not differentiate clearly.

### 2.5 Jobs and Schedule Feel Like a List, Not an Operational Queue

The schedule surface received a pass that cleaned up its visual drift. But it still feels like a list of jobs with filters rather than a dispatch-grade operational queue. The ready-to-schedule section, the crew assignment panel, and the planner views do not feel like they belong to one coordinated operational system.

### 2.6 Guidance Language Is Inconsistently Applied Across Surfaces

Guided/Flexible/Manual mode infrastructure is implemented on Project Workspace. But empty states across the system vary widely. Some are plain-English and action-oriented; others are blank, decorative, or tell the user what is absent without explaining what to do next. There is no shared pattern for: "this is empty because X; here is what creates content here."

### 2.7 Icon Usage Is Inconsistent and Generic

Icon selection currently relies on whatever Lucide icon feels closest. There is no intentional assignment of specific icons to domains, record types, workflow stages, or urgency levels. The visual language of iconography is therefore generic SaaS rather than contractor-specific or workflow-aware.

### 2.8 Typography Hierarchy Does Not Scale Across Density Levels

The `text-[11px] font-semibold uppercase tracking-[0.18em]` section heading pattern (from `DetailPanel`) appears across many surfaces. It is compact but becomes undifferentiated at scale — every panel feels like an equally weighted label. There is no visual hierarchy that elevates operational priority, demotes metadata, or emphasizes action zones.

### 2.9 Copper Is Used Primarily as Button Emphasis, Not as a System Language

Copper exists in the token system, but its usage is largely limited to primary action buttons. It is not used to create spatial continuity — there are no copper-tinted workflow progress indicators, no copper left-border treatments on active/focus states, and no consistent copper accent usage that makes the system feel like it has a directional personality.

### 2.10 Right Rails Are Present But Not Systematized

The enterprise UX consolidation pass created right rails with progressive disclosure on project, estimate, contract, and invoice workspaces. But the pattern is not codified as a true shared component. Each workspace implements its own right-rail shape. Context, linked records, revision history, and metadata are present but vary in density and position across surfaces.

### 2.11 Status Pills Lack Operational Weight

Status badges exist and use semantic colors correctly. But their visual weight does not communicate operational urgency well. A project that is "Blocked" and a project that is "In Progress" look similar in size and treatment. Status should carry more spatial authority on operational surfaces.

### 2.12 Empty States Do Not Guide Forward

Several manager pages and workspace sections present empty states that explain absence without routing the user toward the canonical upstream action that would produce the missing content. This is especially visible on jobs (no contract), invoices (no signed contract), and schedule (no ready jobs).

---

## 3. Design Principles for FloorConnector Going Forward

These principles are not aspirational marketing language. They are decision rules to use when choosing between two valid options.

### 3.1 Operational Clarity Over Aesthetic Minimalism

When choosing between a cleaner surface and a more informative one, default to informative. FloorConnector is a working tool. Contractors need to scan and act fast. An empty panel that looks clean but hides a blocker is a worse UX than a slightly denser panel that explains what the contractor needs to do.

### 3.2 Hierarchy Before Decoration

Every surface must establish a visual hierarchy before it adds polish. Primary action, primary record, primary status, and primary next-step must be visually dominant before secondary content is styled. Do not apply decorative treatments to secondary content while the primary action is weak.

### 3.3 Continuity Over Module Identity

No page should feel like it belongs to a separate module. Every page is inside FloorConnector. Navigating from the dashboard to a project to an estimate should feel like moving through one spatial system. Shared header patterns, shared action bar patterns, shared status treatments, and shared context rail patterns are what create that continuity.

### 3.4 Premium Does Not Mean Minimal

Premium for a contractor operating system means: structured, dense, readable, trustworthy, and purposeful. Not sparse. Not aspirational whitespace. Dense grids of real operational data, presented with clear hierarchy and restrained color, is the target.

### 3.5 Guidance Is Architecture, Not Coaching Copy

The system's guidance responsibility is not to write more sentences explaining what to do. It is to architect the surface so the next action is the most visible thing on the page at every stage. Coaching copy supports; visual architecture leads.

### 3.6 Copper Is a System Accent, Not Just a Button Color

Copper should appear wherever the system wants to draw forward motion: active workflow step indicators, next-action indicators, primary call-to-action emphasis, focus treatment, and selected state treatment. It should feel like the operational energy of the system.

### 3.7 Financial Surfaces Command Trust

Estimate, contract, invoice, and payment surfaces must look and feel like premium financial instruments. They are what the contractor sends to customers. They need proposal-quality presentation on both the contractor side and the portal side.

---

## 4. Proposed Enterprise Visual Identity

The Graphite/Copper token system is correct and locked. The problem is not the tokens — it is how they are deployed across spatial patterns, hierarchy, and iconography.

### 4.1 Spatial Grammar

The product needs one consistent spatial grammar across all contractor app surfaces:

- **Top band:** Shell nav (already correct — do not change)
- **Page identity zone:** Compact header with h1 page title, semantic status pill, and primary action — always the same height, always the same structure
- **Operational context band:** Below the header — a compact, copper-left-bordered summary of the current operational state for this record or surface. "What stage is this in? What is blocking it? What is the next action?" — one band, always in the same visual position
- **Primary workspace area:** Main content with clear section hierarchy — panels use tighter left-aligned labels, not center-weight or uppercase-spread labels for everything equally
- **Right context rail:** On detail workspaces — always at the same fixed width, always carrying the same types of content: linked records, metadata, revision timeline, people access

This grammar should be applied to every workspace. Currently each workspace assembles its own version.

### 4.2 Color Deployment Evolution

- **Graphite** (#374151): Primary chrome, headers, strong navigation — currently correct
- **Copper** (#B45309): Extend beyond buttons into: workflow progress step indicators, left-border accent on active/focus states, primary action zone visual anchor, operational context band left border
- **Soft Cream** (#FAFAF8): Page backgrounds — currently correct
- **Warm Gray** (#E8E6E1): Borders, dividers — currently correct
- **Semantic reds/ambers/greens**: Status only — currently mostly correct, minor inconsistencies exist

### 4.3 Depth and Surface Hierarchy

Current: mostly flat white cards on cream backgrounds. This produces very low surface contrast between the page background and the card content.

Proposed: introduce a three-level surface system:

- **Level 0**: Cream background (`--cream`) — page canvas
- **Level 1**: White panels (`bg-white`) — primary workspace areas (already in use)
- **Level 2**: Soft graphite inset (`bg-[var(--soft-graphite)]` or equivalent) — metadata, context, lower-priority information
- **Level 3**: Copper-tinted inset — active/focus state, operational context band, selected item, current workflow step

This does not require new tokens — it means deploying existing tokens more intentionally to create perceived depth.

### 4.4 Typography Hierarchy

Current: `text-[11px] font-semibold uppercase tracking-[0.18em]` is overused as the universal section label. All panels look equally important.

Proposed section label hierarchy:

- **Primary workspace section label** (the one that owns the primary action on this page): slightly larger, higher contrast, copper-accent left border
- **Standard section label**: current pattern is acceptable for secondary sections
- **Metadata/context label**: lighter weight, lighter color, no uppercase tracking — clearly subordinate

### 4.5 Spacing and Rhythm

Panel padding is currently `p-4 sm:p-5`. This is appropriate. But spacing between stacked panels varies across pages — some sections feel compressed, others feel padded. The recommendation is to enforce a consistent panel gap of `gap-5` or `gap-6` on all workspace column layouts to create predictable vertical rhythm.

---

## 5. Proposed Icon and Graphics System

### 5.1 Icon Philosophy

FloorConnector icons should read as **operational signals**, not generic UI decoration. Every icon should answer: "What does this tell the contractor about the state or type of this record?"

Rules:

- Use icons consistently — the same record type always gets the same icon everywhere it appears
- Icons near status should carry operational meaning (urgency, completion, blocking)
- Icons near navigation should anchor domain identity
- Do not use icons as decoration; if an icon cannot be explained operationally, remove it
- Never use emojis as icons

### 5.2 Icon Families

**Domain/Record Icons** — one icon per canonical record type, used everywhere that record appears in navigation, manager pages, linked-record cards, and workspace headers:

| Record             | Proposed Lucide Icon         | Rationale                     |
| ------------------ | ---------------------------- | ----------------------------- |
| Opportunity / Lead | `Zap` or `TrendingUp`        | Pre-project commercial energy |
| Customer           | `Building2`                  | Business/account relationship |
| Project            | `Layers`                     | The stacked operational root  |
| Estimate           | `FileText`                   | Proposal document             |
| Contract           | `FilePen` or `FileSignature` | Signed document               |
| Change Order       | `GitBranch`                  | Branch off existing scope     |
| Job                | `Hammer`                     | Production work               |
| Invoice            | `Receipt`                    | Billing document              |
| Payment            | `Banknote` or `CreditCard`   | Money collected               |
| Schedule           | `CalendarDays`               | Time-based work               |
| People             | `Users`                      | Workforce                     |
| Portal             | `ExternalLink` or `Globe`    | Customer-facing surface       |

**Workflow State Icons** — used in guidance bands, next-action indicators, and status summaries:

| State                    | Proposed Icon                  | Color            |
| ------------------------ | ------------------------------ | ---------------- |
| Blocked / Missing        | `AlertTriangle`                | Amber            |
| Error / Declined         | `XCircle`                      | Red              |
| Complete / Signed / Paid | `CheckCircle2`                 | Green            |
| In Progress / Active     | `Circle` (half) or `Clock`     | Neutral graphite |
| Ready to proceed         | `ArrowRight` or `ChevronRight` | Copper           |
| Waiting on customer      | `Hourglass`                    | Amber            |
| Draft                    | `Pencil`                       | Neutral          |

**Module / Navigation Icons** — compact icons used in the top navigation or left sidebar for module identity:

- Dashboard: `LayoutDashboard`
- Financials: `DollarSign`
- Field: `HardHat`
- People: `Users`
- Settings: `Settings2`
- Documents: `FolderOpen`
- Communications: `MessageSquare`
- AI (future): `Sparkles`

### 5.3 Icon Sizing and Weight Rules

- Navigation icons: 18px, `stroke-width-1.5`
- Linked-record card icons: 16px, `stroke-width-1.5`
- Status/urgency icons: 16px, `stroke-width-2` (slightly heavier for emphasis)
- Empty-state icons: 28–32px, `stroke-width-1.5`, muted treatment
- Inline contextual icons (next to labels, inside pills): 14px, `stroke-width-1.5`

### 5.4 What to Avoid

- Do not use icon packs outside Lucide without explicit approval
- Do not use icons as filler decoration on informational panels
- Do not use the same icon for two different record types
- Do not use color-only to distinguish icon meanings (pair color with shape changes or labels)
- Do not use animated icons for anything except intentional loading/progress states

### 5.5 Graphics Direction

FloorConnector does not need illustrations or marketing-style graphics in the contractor app. The visual language is operational data, structured hierarchy, and purposeful use of color. The closest analogy is enterprise SaaS (Linear, Notion, or Vercel) adapted for field-service density.

Empty states may use a single muted icon (28–32px, graphite at low opacity) paired with plain-English copy. They should not use illustrations, gradient blobs, or decorative backgrounds.

---

## 6. Proposed Page Architecture Patterns

All patterns below are extensions of existing patterns, not replacements. The goal is to codify and systematize what is already emergent across the best surfaces in the app.

### 6.1 Manager Page Pattern (refined)

Used for: `/projects`, `/estimates`, `/contracts`, `/invoices`, `/payments`, `/jobs`, `/schedule`, `/customers`, `/leads`, `/people`

```
[ Page identity header: h1 title | primary action button ]
[ WorkspaceSummaryBand: 3–5 compact operational metrics ]
[ WorkspaceCommandBar: search | filters | sort | perspective ]
[ Queue body: prioritized rows / cards ]
[ AppEmptyState when no records ]
```

Refinements needed:

- The `WorkspaceSummaryBand` metrics must use consistent sizing, consistent icon treatment, and consistent drill-in behavior across all manager pages
- The `WorkspaceCommandBar` must position the primary action ("New Project", "New Estimate") at the right-most position, not buried in filters
- Row/card hierarchy: record name is always the dominant text; status pill is always in a fixed position (right side of row)

### 6.2 Detail Workspace Pattern (refined)

Used for: all `[Resource] Workspace` pages

```
[ Compact header band: back link | record title | semantic status pill | primary action ]
[ Operational context band: current workflow stage | blocker if any | next action → | driving record link ]
[ Two-column layout: main workspace (2/3) | right context rail (1/3) ]
[ Main workspace: ordered sections by operational priority ]
[ Right rail: metadata, linked records, revision timeline, people/access ]
```

Refinements needed:

- The **operational context band** must exist on every detail workspace — it is the single most important addition to the current grammar. It should be a compact, copper-left-bordered strip that summarizes: stage name, blocker if any, and the one next action the system recommends
- The right rail must be truly consistent in width and structure across workspaces (currently varies)
- Section ordering within the main workspace should follow operational priority, not alphabetical or creation order

### 6.3 Financial Document Workspace Pattern (new)

Used for: Estimate Workspace, Invoice Workspace, Contract Workspace (their "document view" sections)

The document content area (line items, terms, totals) within these workspaces should be styled distinctly from the operational panels. It should feel like a premium financial document:

- White background with a subtle warm border or shadow
- Clear document header with record number, date, customer name, and total
- Line items in a clean, compact table format with proper column hierarchy (description dominates, amounts right-aligned)
- Totals section with visual separation and bold total treatment
- Footer with terms/notes in lighter weight

This is currently styled as generic detail panels. It should read as a financial document.

### 6.4 Operational Queue Pattern (new)

Used for: `/schedule` ready queue, `/dashboard` cockpit buckets, invoice/payment collections queues

The operational queue is distinct from a plain list. It should convey:

- Priority order (most urgent at top)
- Urgency signal (amber/red treatment for overdue or blocked items)
- One clear action per row
- Context about why this item is in this queue

Queue rows need: record identity (title + customer/project), status pill, aging/timing signal, and one primary action button — all within a consistent row height.

### 6.5 Empty State Pattern (refined)

Every empty state must follow this structure:

```
[ Muted domain icon, 28px ]
[ Plain-English title: what this section will contain ]
[ Explanation: what upstream action creates this content ]
[ CTA: the upstream action, if one is available from this surface ]
```

"No estimates yet" is not acceptable. "No estimates — estimates are created from projects once a customer is signed" is correct.

---

## 7. Dashboard Redesign Plan

### 7.1 Current State

The dashboard has correct sections: operational metrics, lifecycle rail, cockpit buckets, queue widgets, recent payments, and notification summary. The performance audit has progressively narrowed query payloads. The section structure is largely correct.

What is wrong:

- Visual hierarchy does not make urgency instantly scannable
- The cockpit buckets (attention, ready, waiting, field follow-up) do not have enough visual differentiation from each other
- The universal create menu is correctly present but visually underweighted
- The early-access banner is sometimes the most visible element on the page
- The lifecycle rail is informative but not spatially prominent enough for its importance

### 7.2 Proposed Dashboard Changes

**Zone 1 — Attention Zone (top of page):**

- Keep as primary position
- Add copper-left-border treatment to the "Needs Attention" cockpit section to draw the eye immediately
- Amber treatment on blocked/overdue rows within that section

**Zone 2 — Operational Metrics Band:**

- Condense to 4–5 compact metric tiles
- Standardize tile structure: icon + count + label + delta or trend signal
- Use copper for the tile that represents the most actionable queue (e.g., "Estimates Awaiting Approval")

**Zone 3 — Work Queues:**

- "Ready to Move" queue should use copper right-arrow indicators per row to signal "this is actionable right now"
- "Waiting on Customer/Payment/Signature" queue should use amber/muted treatment
- "Field/Production Follow-Up" should use a neutral graphite treatment

**Zone 4 — Lifecycle Rail:**

- Move to a more prominent position, possibly just below the metrics band
- Use a horizontal step strip with the canonical lifecycle stages, colored by current distribution of work across stages
- This is the clearest single visual that explains "this is a connected operating system"

**Zone 5 — Recent Activity:**

- Keep compact; this is Zone 5, not Zone 1
- Payments and notifications remain correct here

**What to preserve:**

- UniversalCreateMenu link-based behavior — do not replace it with a heavy modal for this pass
- EarlyAccessBanner — it exists for a reason, just ensure it does not visually dominate
- All canonical data loading patterns — no new reads or schema changes

---

## 8. Project Workspace Redesign Plan

### 8.1 Current State

Project Workspace is the product's best surface. It already has: stage/blocker/next-action summary, connected record lanes, workflow guidance panel, context rail, and revision timeline. The structure is fundamentally correct.

What is wrong:

- The operational context band (stage + blocker + next action) is present but does not visually dominate the page the way it should. It competes equally with `DetailPanel` sections for visual weight.
- The connected record lanes (estimate, contract, job, invoice, job) feel like a list of equal links rather than a visual lifecycle progression
- The right rail is not fully systematized — it varies in width and section structure compared to the target pattern

### 8.2 Proposed Project Workspace Changes

**Header:** Keep the existing compact header. Add the semantic status pill alongside the record title at full visual weight.

**Operational Context Band:** Elevate this to be the first, most prominent thing below the header. Use a copper-left-bordered band that shows:

- Current lifecycle stage (styled as a step indicator with previous stages shown in muted treatment)
- Active blocker with amber treatment if one exists
- Next action with a copper CTA arrow
- Link to the driving record (the estimate, contract, or invoice that is the current bottleneck)

**Connected Record Lanes:** Convert from a generic list to a visual lifecycle strip:

```
Estimate → [status] → Contract → [status] → Job(s) → [status] → Invoice → [status] → Payment
```

Each node in this strip shows the record status and opens the workspace. Empty nodes show what needs to happen to create the next record. This is the product's most powerful conceptual communication and it should be the most designed element on the page.

**Right Rail:** Standardize to: Project metadata | Customer contact | Portal access summary | Revision timeline | Internal notes

**Section Order (main workspace):**

1. Operational Context Band (copper-bordered, spans full width)
2. Commercial/Financial summary (estimate → contract → invoice → payment, horizontal lifecycle strip)
3. Jobs/Schedule section (what is scheduled, what is ready)
4. Field/Execution summary (daily logs, punchlists if active)
5. Change Orders (if any exist)
6. Right rail (metadata, customer, access, history)

---

## 9. Estimate and Invoice Workspace Redesign Plan

### 9.1 Estimate Workspace

The Estimate Workspace is the reference tuning fork. It already has the best header, next-action guidance, workflow summary, and context rail. The main gaps:

**Document presentation:** The estimate line items area currently uses a generic DetailPanel. It should feel like a financial proposal document — white, structured, with clear line-item columns, grouped subtotals, and a visually prominent total. This is what the customer sees when they open the PDF; the workspace should preview that quality.

**Proposal-first header:** The estimate header should lead with the commercial framing: "Proposal for [Customer Name] — [Project]" alongside the estimate number and date, not just the internal record number.

**Approval state emphasis:** When the estimate is in customer-review state, the top band should clearly show "Awaiting Customer Approval" in amber with the sent date and a "Copy Link" secondary action visible.

**Post-approval state:** When approved, a green band should show "Approved by [Customer Name] on [Date]" and the primary action should shift to "Create Contract."

### 9.2 Invoice Workspace

Invoices are money owed. The workspace must communicate financial trust.

**Invoice header:** Lead with the billing framing: "Invoice [#] for [Customer Name] — [Project]" with amount due prominently displayed.

**Balance state band:** A colored band near the top should show the current financial state: total billed, amount paid, and balance due. This band should use:

- Amber treatment when there is an outstanding balance and it is overdue
- Green treatment when fully paid
- Neutral treatment when paid on time and current

**Line items presentation:** Same financial-document treatment as estimate — structured, clean, right-aligned amounts, visual separation at subtotals and totals.

**Payment history:** Below the invoice itself — a clear payment history showing each payment event with date, amount, method, and status. Not buried in a generic DetailPanel.

---

## 10. Jobs and Schedule Redesign Plan

### 10.1 Jobs Manager

The jobs manager is currently a standard manager page. The gap is that it does not communicate job operational state well at a glance.

**Job status pills need operational weight:**

- "Unscheduled" with a specific project and a signed contract should show as "Ready to Schedule" with amber treatment — this is an actionable state
- "In Progress" jobs should show crew assignment and start date prominently in the row
- "Complete" jobs should show completion date and whether an invoice exists

**Job row structure:**
Each row should have: Job title + project name | Status pill (contextually weighted) | Scheduled date or "Unscheduled" | Crew | One primary action button

### 10.2 Schedule Surface

The schedule received a visual cleanup pass. The deeper redesign is structural.

**Current problem:** The ready queue, timeline, and day/week views are three separate things on one page without a clear hierarchy between them.

**Proposed structure:**

- **Top:** Operational summary band — how many jobs are ready to schedule, how many are scheduled this week, how many are in progress, how many are overdue
- **Middle:** Ready Work Queue — a prioritized list of jobs that are ready to be scheduled (readiness gate passed, no crew assigned yet). These should feel urgent; amber treatment for jobs ready for 3+ days
- **Below:** Scheduled Timeline — the planned work with crew context. Calendar planner remains as a view toggle.
- **Right rail/panel:** Selected job action panel — when a job is selected, the right panel shows schedule controls, crew assignment, and job context

This structure makes the dispatch workflow clear: here is what needs scheduling (top), here is what is already scheduled (bottom), select a ready job and schedule it in the right panel.

---

## 11. Manager Page System Redesign Plan

All manager pages (projects, estimates, contracts, invoices, payments, jobs, customers) currently share structural patterns but vary in execution. The proposal is to standardize the following across all of them:

### 11.1 Summary Band Standardization

Every manager page should have a `WorkspaceSummaryBand` with:

- Exactly the counts/metrics that matter for that resource (not a generic "total records" count)
- Consistent tile size and structure across pages
- Copper-tinted treatment for the tile representing the most actionable queue item

### 11.2 Command Bar Standardization

Every manager page should have a `WorkspaceCommandBar` with:

- Search always leftmost
- Status filter tabs or chips always in the middle
- Primary create action always rightmost
- Sort and perspective controls between status and primary action

### 11.3 Row/Card Density Standardization

List rows should follow: [icon] [record title (dominant)] [secondary text: customer/project] [status pill] [contextual date] [row action]

Manager card (for grid views): same content distribution but in card format.

The row action should be a single dropdown with the most common actions for that record type — not a collection of inline buttons that compete with the record title.

---

## 12. Shared Component and System Plan

These are the reusable primitives that should be designed and implemented. They should be built as genuinely shared components, not as route-local patterns.

### 12.1 `OperationalContextBand`

A copper-left-bordered summary band for use at the top of all detail workspaces.

Props: `stage`, `stageHistory`, `blocker` (optional), `nextAction` (optional), `nextActionHref` (optional), `drivingRecord` (optional)

Not a new concept — it is a codified version of the guidance panel already on Project Workspace.

### 12.2 `LifecycleStrip`

A horizontal lifecycle step strip for use on Project Workspace and optionally on the dashboard.

Shows: the canonical lifecycle steps, colored by the status of that step for the current record, with links to the associated workspaces.

### 12.3 `FinancialDocumentPanel`

A styled wrapper for financial document content (line items, totals, terms).

Used on: Estimate Workspace, Invoice Workspace, Contract Workspace.

Gives document-quality visual treatment without recreating PDF logic.

### 12.4 `OperationalQueueRow`

A standardized row component for use in manager pages, schedule queues, and dashboard widgets.

Props: `title`, `subtitle`, `status`, `statusTone`, `date`, `dateLabel`, `primaryAction`, `contextHref`

### 12.5 `WorkspaceRightRail`

A standardized right-rail container for detail workspaces.

Sections: metadata, linked records, portal/people access summary, revision timeline, internal notes.

Currently each workspace builds its own version. This codifies the pattern.

### 12.6 `StatusPillSystem`

A refined status pill with two sizes: `sm` (for rows/cards) and `md` (for workspace headers).

`md` pills should be slightly larger and carry an icon to the left of the label when status has a clear operational icon (blocked = AlertTriangle, complete = CheckCircle2, waiting = Hourglass).

### 12.7 `GuidanceEmptyState`

An extension of `AppEmptyState` with an additional `upstreamAction` prop that renders the canonical upstream create path when the section is empty because the prerequisite record does not exist yet.

---

## 13. Implementation Phases

These phases are meaningful milestones, not micro-tasks. Each phase should be scoped to produce a visually coherent and testable result.

### Phase 1 — Operational Context Band and Project Workspace Hierarchy

**Scope:**

- Design and build `OperationalContextBand` as a shared component
- Apply it to Project Workspace as the first consumer
- Elevate the connected-record lifecycle strip on Project Workspace
- Standardize the right rail on Project Workspace

**Does not include:** changes to other workspaces, new shared components beyond `OperationalContextBand`

**Why first:** Project Workspace is the most important surface. Making it read as the operational hub is the single highest-leverage change in the product.

### Phase 2 — Financial Document Quality on Estimate and Invoice

**Scope:**

- Build `FinancialDocumentPanel` as a shared component
- Apply to Estimate Workspace line items/totals section
- Apply to Invoice Workspace line items/totals/payment-history section
- Refine balance state band on Invoice Workspace
- Refine approval state treatment on Estimate Workspace

**Does not include:** changes to financial logic, estimate editor, line item behavior

**Why second:** Estimates and invoices are customer-facing surfaces. Their visual quality directly impacts contractor trust and proposal presentation.

### Phase 3 — Dashboard Mission Control

**Scope:**

- Add copper-left-border treatment to Needs Attention cockpit bucket
- Standardize cockpit bucket visual differentiation (attention vs. ready vs. waiting vs. field)
- Add operational metrics band with copper-accented most-actionable tile
- Lifecycle rail elevation above queue widgets

**Does not include:** changes to dashboard data loading, new API calls, schema

**Why third:** Dashboard is the first screen. Once Project Workspace and financial surfaces read correctly, the dashboard can connect them visually through the lifecycle rail.

### Phase 4 — Manager Page Standardization

**Scope:**

- Build `OperationalQueueRow` as a shared component
- Standardize summary bands across all manager pages
- Standardize command bar layout across all manager pages
- Apply row/card density standardization to projects, estimates, invoices

**Does not include:** per-workspace redesigns; only the manager list pages

### Phase 5 — Schedule Structural Redesign

**Scope:**

- Restructure schedule page into top summary band + ready queue + scheduled timeline + selected job rail
- Apply `OperationalQueueRow` to the ready queue
- Standardize selected job action panel

**Does not include:** scheduling logic, readiness gates, crew assignment behavior

### Phase 6 — Icon System Enforcement and Status Pill Refinement

**Scope:**

- Audit and standardize domain icon assignment across all navigation, linked-record cards, manager page headers, and workspace headers
- Build `StatusPillSystem` with `sm` and `md` sizes
- Apply icon standardization to all linked-record cards

### Phase 7 — Shared Component Cleanup and Empty State Pass

**Scope:**

- Build `GuidanceEmptyState` and apply to high-traffic empty paths
- Apply `WorkspaceRightRail` to standardize right rails on Contract and Job workspaces
- Final visual QA pass across all manager and workspace surfaces

---

## 14. Recommended First Implementation Pass

**Phase 1 is the right first pass.**

Build `OperationalContextBand`, apply it to Project Workspace, and elevate the connected-record lifecycle strip. This is the single most communicative change for the product's identity as an operating system, touches the most-used workspace, and requires no schema or logic changes.

Success criteria for Phase 1:

- A contractor opening a project workspace can instantly answer: "What stage is this in? What is blocking it? What is the next action?" without scanning the whole page
- The lifecycle strip communicates the canonical flow visually, not just as a list of linked records
- The right rail is consistent in structure with the target pattern

---

## 15. Risks and Guardrails

### 15.1 Do Not Touch During UX Redesign Phases

- Schema, migrations, RLS, auth, server actions, form payloads
- Financial calculations, readiness gates, payment/signature/portal behavior
- Canonical lifecycle logic, workflow transitions
- Route architecture, navigation structure
- Test IDs, form names, hidden inputs, server action targets
- `docs/current-state.md` implemented truth

### 15.2 Presentation Drift Risk

Each phase will add or refine shared components. There is a risk that creating new shared components causes visual drift in surfaces not yet redesigned — surfaces that currently use their own local patterns. Mitigation: each new shared component should be additive only; do not replace existing local patterns in surfaces outside the phase scope until a dedicated cleanup pass targets those surfaces.

### 15.3 Right Rail Width Consistency Risk

Standardizing the right rail width across workspaces may cause layout shifts on surfaces where the right rail is currently wider or narrower. Mitigation: measure and document the current right rail width per workspace before Phase 1; standardize only the width that fits the most constrained surface without cutting content.

### 15.4 Typography Change Risk

Changes to `DetailPanel` label typography would affect every surface that uses `DetailPanel`. Only change the `DetailPanel` component if a specific pass has carefully reviewed every consumer. Prefer adding an optional `prominence` or `accent` prop rather than changing the default.

### 15.5 Copper Overuse Risk

Expanding copper usage beyond buttons carries a risk of diluting its signal. Copper's value is precisely that it is used sparingly. Limit new copper usage to: operational context band left border, next-action indicators, and the most-actionable metric tile on dashboards/manager pages. Do not add copper to decorative elements.

---

## 16. Files Likely to Change in the First Implementation Pass (Phase 1)

These are the files most likely to be touched in Phase 1 — Project Workspace hierarchy and `OperationalContextBand` implementation. This is not a complete scope, but a starting checklist for the implementer.

### New Files (to create)

- `apps/web/components/operational-context-band.tsx` — the new shared component
- `apps/web/components/lifecycle-strip.tsx` — the connected-record lifecycle strip

### Existing Files (to modify — presentation only)

- `apps/web/components/detail-panel.tsx` — may add an optional `accent` prop for copper-left-border prominence
- `apps/web/app/(app)/projects/[projectId]/page.tsx` — consume `OperationalContextBand` and `LifecycleStrip`
- Any project workspace sub-component that currently renders the workflow summary/guidance band — to be replaced or unified with `OperationalContextBand`
- `apps/web/components/workspace-summary-band.tsx` — may need minor updates for the operational context band usage pattern
- `apps/web/components/protected-surface-header.tsx` — review whether status pill can be promoted to `md` size on workspace header usage

### Files That Should NOT Change in Phase 1

- Any file under `apps/web/lib/` (server-side data loading, business logic)
- `supabase/migrations/`
- Any file containing financial calculations, readiness gate logic, or payment/signature/portal behavior
- Route files for any workspace other than `/projects/[projectId]/`
- Manager page files (save for Phase 4)
- Dashboard files (save for Phase 3)
- Schema, RLS, auth middleware

---

## 17. What Should Not Be Changed

This is the firm do-not-touch list for this redesign initiative:

- The canonical lifecycle: `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`
- Readiness gate enforcement
- Invoice billing trigger rules
- Financial calculation logic
- Contract and signature behavior
- Payment processing, webhook handling, and Stripe integration
- Portal access model and RLS policies
- Server actions, form payloads, and server-side data loading
- Authentication and multi-tenant isolation
- The top-nav-first contractor app shell (approved and locked)
- The Graphite/Copper token system (locked — extend deployment, do not replace tokens)
- The Manager Page and Record Workspace patterns (refine, do not replace)
- The `StandardWorkspaceLayout` pattern
- `docs/current-state.md` implemented truth
- Any existing test IDs, form names, hidden inputs, or route contracts

---

_This plan was produced after a full review of `developer-source-of-truth.md`, `current-state.md`, `workflows.md`, `system-overview.md`, `chat-handoff.md`, `graphite-copper-ui-system.md`, `ai-guided-system-plan.md`, `target-ia.md`, `vision.md`, `performance-audit.md`, `enterprise-ui-system-audit.md`, `floorconnector-ui-build-rules.md`, inspection of the app shell, dashboard surface, detail panel, shared component inventory, and route map._
