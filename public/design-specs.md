# FloorConnector Dashboard Redesign — Design Specs

## Overview
A modern, operational command center for specialty flooring contractors built on a graphite/copper industrial aesthetic with clear information hierarchy and customizable navigation.

---

## Color System

### Primary Colors
- **Graphite Dark** (`#1e242c`): Primary header background, row 1
- **Graphite** (`#2a3038`): Secondary navigation, row 2  
- **Graphite Lighter** (`#282f38` → `#23282f` gradient): Pinned links bar, row 3
- **Copper** (`#d4835f`): Primary accents, CTAs, brand
- **Copper Light** (`#e8a88f`): Secondary accents, hover states
- **Cream** (`#faf9f7`): Main content background
- **White** (`#ffffff`): Cards, inputs, elevated surfaces

### Semantic Colors
- **Text Primary**: `#1a1a1a` (dark graphite on light)
- **Text Secondary**: `#666666` (medium gray)
- **Text Tertiary**: `#999999` (light gray)
- **Border Warm**: `#e8ddd8` (cream-tinted border)
- **Highlight**: `#f5f0eb` (hover state for light buttons)

### Status Colors
- **Critical**: `#dc2626` (red)
- **Warning**: `#f59e0b` (amber)
- **Success**: `#10b981` (green)
- **Info**: `#3b82f6` (blue)

---

## Typography

### Font Stack
- **Primary**: System UI (`-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`)
- **Mono** (for technical data): `font-mono` class (Tailwind)

### Heading Hierarchy
- **H1** (Page Title): 16px, font-weight 600, tracking-tight, text-primary
- **H2** (Section Headers): 14px, font-weight 600, text-primary
- **H3** (Card Titles): 13px, font-weight 600, text-primary
- **Body**: 13–14px, font-weight 400, line-height 1.5, text-secondary
- **Small/Caption**: 11–12px, font-weight 400, opacity 0.7
- **Label**: 10px, font-weight 600, uppercase, tracking-wider

---

## Layout

### Header Structure (3 Rows)

#### Row 1 — Identity (h-16 / 64px)
- Darkest graphite background with gradient
- Left: Brand logo (40×40px, copper bg) + name/tagline
- Center: Company name (hidden on mobile)
- Right: Training links + divider + Live Chat button + user profile

#### Row 2 — Navigation (h-11 / 44px)
- Mid graphite background
- Left: Breadcrumb (Home / Dashboard)
- Center: Project Selector + Menu Dropdown
- Right: Quick action icons (Tools, Notes, Suggestions, Settings)

#### Row 3 — Pinned Links (h-9 / 36px)
- Gradient graphite background (lighter)
- "Pinned" label + customizable starred page links (Projects, Time Cards, Directory)
- "+ Add page" button for future personalization

### Content Layout (Main dashboard)

#### Health Summary Bar
- White card with copper accents
- Horizontal row: Date + 4 metric chips + Customize button
- Spacing: `gap-2` between elements, `px-4 py-3`

#### Grid Structure
- **Top Row**: 4 columns (Calendar, Weather, Appointments, Time Tracking)
- **Second Row**: 2 columns (Opportunities Stats, Punchlists)
- **Remaining**: Full-width sections (Priorities, Revenue, Production, Collections, Field Activity, Next Move, Recent Activity)

### Spacing Guidelines
- **Card Padding**: `px-5 py-4` (20px / 16px)
- **Section Gaps**: `gap-5` (20px)
- **Element Gaps**: `gap-2` to `gap-4` (8px–16px)
- **Component Inner Gap**: `gap-1.5` (6px)

---

## Components

### Buttons

#### Primary (Copper)
- Background: `bg-[var(--copper)]`
- Padding: `px-3 py-1.5` (small), `px-4 py-2` (medium)
- Radius: `rounded-md` (4px)
- Hover: `bg-[var(--copper-light)]` + slight lift (`-translate-y-0.5`)

#### Secondary (White/Light)
- Background: `border border-[var(--border-warm)] bg-white`
- Padding: `px-3 py-1.5`
- Radius: `rounded-md` (4px)
- Hover: `bg-[var(--highlight)]`

#### Icon Buttons (Header)
- Size: 32–36px
- Background: Transparent or `bg-white/8` (semi-transparent)
- Border: `border-white/15` (header only)

### Cards

#### Default Card
- Background: `bg-white`
- Border: `border border-[var(--border-warm)]` (optional, subtle)
- Radius: `rounded-[4px]`
- Padding: `px-5 py-4`
- Shadow: None (flat) or `shadow-sm` (light lift)

#### Section Header (within Card)
- Font: 13px, font-weight 600
- Color: text-primary
- Spacing: `mb-3`

### Badges & Alerts

#### Status Badge (Inline)
- Urgency: CRITICAL (red), HIGH (orange), NORMAL (gray)
- Size: `text-[10px]`, `px-2 py-0.5`, `rounded`
- Font: font-weight 600, uppercase

#### Colored Status Pill
- Background: Semi-transparent colored overlay
- Text: White
- Radius: `rounded-full`
- Size: `h-6 w-6` or `h-5 w-5`

### Form Inputs

#### Text Input / Textarea
- Border: `border border-[var(--border-warm)]`
- Radius: `rounded-md`
- Padding: `px-3 py-2`
- Focus: `ring-2 ring-[var(--copper)] ring-offset-0`

---

## Icon System

### Lucide React Icons
- Standard sizes: 16px, 20px, 24px
- Header: 16px–20px
- Section headers: 16px
- Badges/pills: 12px–16px
- Copper accent: All primary action icons

### Icon Placement
- Left of text: `gap-1.5` to `gap-2`
- Inline: `gap-1`
- Standalone: Center-aligned

---

## Responsive Breakpoints

### Mobile-First
- **Base** (mobile): Full-width, single column where possible
- **sm** (640px): Show abbreviated text, adjust font sizes
- **md** (768px): Two-column layouts, show full labels
- **lg** (1024px): Three-column grids, side navigation visible
- **xl** (1280px): Full multi-column layouts, all features visible

### Header Breakpoints
- **Hidden on mobile**: Training links (xl), User text on very small (sm)
- **Always visible**: Brand, User avatar, Menu button

---

## Animation & Transitions

### Standard Transitions
- **Default**: `transition` (all 0.2s ease)
- **Button hover**: `hover:bg-*` + optional `translate-y-0.5` lift
- **Menu open**: Dropdown with fade + slight scale
- **Icon hover**: Color shift + opacity change

### Smooth Changes
- Color changes: `transition`
- Transform: `transition-transform`
- Opacity: `transition-opacity`
- Combined: `transition` (all properties)

---

## Accessibility

### Contrast
- Text on dark: Use white or light text (`text-white/80` minimum)
- Text on light: Use dark text (`text-primary` or darker)
- Copper on graphite: Sufficient contrast (WCAG AA)

### Keyboard Navigation
- All interactive elements: Focusable with `:focus` ring
- Tab order: Logical left-to-right, top-to-bottom
- Escape: Close menus and dropdowns

### ARIA Labels
- Icon buttons: `aria-label="..."` for assistive tech
- Dropdowns: `role="menu"` or `role="listbox"`
- Cards: Semantic heading hierarchy

### Screen Readers
- Use `sr-only` for hidden text labels if needed
- Meaningful alt text for images/icons
- Status updates: Use `aria-live="polite"` for dynamic content

---

## Usage Notes

### Data Structure (Placeholder)
All example data is defined in constants at the top of the component:
- `NAV_LINKS` — Main navigation menu
- `STARRED_LINKS` — Pinned page shortcuts
- `MEGA_MENU` — 5-column categorized menu
- `USER_PROFILE` — User identity
- `COMPANY_INFO` — Organization name
- `HEALTH_SUMMARY` — KPI metrics
- `TODAY_PRIORITIES` — Priority list
- `OPPORTUNITY_STATS` — Pipeline stages
- `RECENT_ACTIVITY` — Event feed

### For Codex/Real Data
1. Replace constants with API calls or database queries
2. Wire `onClick` handlers to real navigation/actions
3. Add error states and loading skeletons
4. Integrate real-time updates (WebSocket, polling, etc.)
5. Add authentication checks in page layout

---

## Future Enhancements

- [ ] Personalization: Save pinned links to user profile
- [ ] Theming: Light/dark mode toggle
- [ ] Customizable widgets: Rearrange, hide/show sections
- [ ] Real-time notifications: Live project updates
- [ ] Export functionality: PDF, CSV, email reports
- [ ] Mobile-optimized view: Collapsible sections, touch-friendly
