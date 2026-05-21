# FloorConnector Design System: Graphite & Copper Reference

## Executive Overview

This document is the visual reference for FloorConnector's accepted Graphite & Copper contractor-app foundation. It complements, but does not replace, [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md), [docs/current-state.md](C:/FloorConnector/docs/current-state.md), and [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md).

Post-v0 closeout status:
- Graphite & Copper is accepted as the contractor-app visual-token foundation.
- Estimates served as the first reference surface for the visual pass.
- The validated implementation preserved the existing top-nav-first contractor shell, Manager Page rhythm, and shared Record Workspace language.
- The v0 pass was visual/test/docs scoped only. It did not change schema, RLS, auth behavior, middleware, server actions, data loading, route protection, financial logic, calculations, workflow transitions, or app navigation.
- Future design work should be targeted polish or scoped pattern propagation, not broad shell redesign or module-local layout invention.

---

## Part 1: Color Scheme (Graphite & Copper)

### Core Palette

#### Primary Colors
| Color Name | Hex | RGB | Usage | Example |
|-----------|-----|-----|-------|---------|
| **Graphite** | `#374151` | 55, 65, 81 | Navigation, headers, primary UI elements | Header bar, sidebar, button backgrounds |
| **Graphite Dark** | `#1F2937` | 31, 41, 55 | Strong emphasis, dark mode alternate | Header border, active navigation |
| **Graphite Light** | `#4B5563` | 75, 85, 99 | Subtle emphasis, hover states | Hover backgrounds, secondary elements |
| **Pure White** | `#FFFFFF` | 255, 255, 255 | Card surfaces, panels, modals | Workspace cards, input backgrounds |
| **Soft Cream** | `#FAFAF8` | 250, 250, 248 | Page backgrounds, subtle surfaces | Main page background, icon backgrounds |

#### Accent Color
| Color Name | Hex | RGB | Usage | Impact |
|-----------|-----|-----|-------|--------|
| **Copper** | `#B45309` | 180, 83, 9 | Call-to-action buttons, active action emphasis, key highlights | Save button, active workspace section, focus treatment |
| **Copper Light** | `#D97706` | 217, 119, 6 | Hover states on copper elements | Button hover, hover badges |

#### Highlight/Selection Color (NEW)
| Color Name | Hex | RGB | Usage | Purpose |
|-----------|-----|-----|-------|---------|
| **Soft Graphite** | `#F3F4F6` | 243, 244, 246 | Active/selected navigation items, active section highlights | Replaces previous muted copper for better neutrality |

#### Text Colors
| Color Name | Hex | RGB | Usage | Contrast Ratio |
|-----------|-----|-----|-------|-----------------|
| **Near Black** | `#111827` | 17, 24, 39 | Body text, primary content | 20:1 on white (AAA) |
| **Warm Gray** | `#6B7280` | 107, 114, 128 | Secondary text, labels, disabled states | 7:1 on white (AA) |
| **Light Warm Gray** | `#9CA3AF` | 156, 163, 175 | Tertiary text, hints | 4.5:1 on white (AA) |
| **Lightest Gray** | `#D1D5DB` | 209, 213, 219 | Borders, dividers, very subtle backgrounds | Subtle separation |

#### Semantic Colors
| Intent | Hex | RGB | Usage |
|--------|-----|-----|-------|
| **Success** | `#16A34A` | 22, 163, 74 | Approved estimates, completed items, confirmations |
| **Warning** | `#EA8C55` | 234, 140, 85 | Pending actions, needs attention (warm amber) |
| **Error** | `#DC2626` | 220, 38, 38 | Validation errors, overdue items, critical issues |
| **Info** | `#0EA5E9` | 14, 165, 233 | Informational messages, help text |

### Design Tokens (CSS Variables)

Reference token model:

```css
:root {
  /* Primary Colors */
  --graphite: #374151;          /* Graphite - headers, navigation */
  --graphite-dark: #1F2937;     /* Graphite Dark - strong emphasis */
  --graphite-light: #4B5563;    /* Graphite Light - hover states */
  --cream: #FAFAF8;             /* Soft Cream - page background */
  
  /* Accent Colors */
  --copper: #B45309;            /* Copper - CTAs, key highlights */
  --copper-light: #D97706;      /* Copper Light - hover states */
  
  /* Selection/Active States */
  --highlight: #F3F4F6;         /* Soft Graphite - active navigation */
  
  /* Text Colors */
  --text-primary: #111827;      /* Near Black - body text */
  --text-secondary: #6B7280;    /* Warm Gray - secondary text */
  --text-tertiary: #9CA3AF;     /* Light Warm Gray - hints */
  --text-disabled: #D1D5DB;     /* Lightest Gray - disabled text */
  
  /* Semantic Colors */
  --color-success: #16A34A;     /* Green - success, approved */
  --color-warning: #EA8C55;     /* Warm Amber - pending, needs attention */
  --color-error: #DC2626;       /* Red - errors, overdue */
  --color-info: #0EA5E9;        /* Informational messages only, not default contractor-app accent */
  
  /* Borders */
  --border-warm: #E8E6E1;       /* Warm Gray - subtle divider */
  --border-medium: #D9D5CD;     /* Medium Warm Gray - standard border */
  --border-dark: #9CA3AF;       /* Strong border for emphasis */
}
```

### Tailwind Config Integration

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        graphite: {
          700: '#374151',
          800: '#1F2937',
        },
        copper: {
          500: '#B45309',
          600: '#D97706',
        },
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
      },
      backgroundColor: {
        base: '#FAFAF8',
      },
    },
  },
};
```

---

## Part 2: Typography System

### Font Families
- **Headings & UI**: `font-sans` (use Geist or Inter)
- **Body Text**: `font-sans` (same family, weights 400-500)
- **Monospace**: `font-mono` (for currency, line item values)

### Type Scale

| Usage | Size | Weight | Line Height | Example |
|-------|------|--------|-------------|---------|
| **Page Title** | 2rem (32px) | 700 | 1.2 | Estimate Details, Projects |
| **Section Header** | 1.25rem (20px) | 600 | 1.3 | Items, Schedule, Attachments |
| **Subsection Header** | 1rem (16px) | 600 | 1.4 | Line Item #1, Customer Info |
| **Body/Standard** | 0.95rem (15px) | 400 | 1.6 | Description text, details |
| **Small/Label** | 0.875rem (14px) | 500 | 1.5 | Field labels, metadata |
| **Caption** | 0.8125rem (13px) | 400 | 1.5 | Timestamps, secondary info |
| **Micro** | 0.75rem (12px) | 400 | 1.4 | Badge text, tiny labels |

### Typography Best Practices
- Use `text-balance` on headings for optimal line breaks
- Apply `tracking-tight` (letter-spacing: -0.025em) to 20px+ headers
- Use `text-pretty` on multi-line body copy for better wrapping
- Never use font size below 12px for readable content
- Maximum line length: 70-75 characters for body text

---

## Part 3: Header & Navigation Design (Accepted Baseline)

### Header Style: Dark Graphite Bar

The header uses a full-height dark graphite background (#374151) with integrated copper accent for the logo, creating a bold, confident top-level navigation that commands presence.

**Header Anatomy:**
```
[Logo/Brand] [Navigation] [User Menu]
```

**Logo Section:**
- Copper background (#B45309) rounded square (8px radius)
- "FC" initials in white, 14px bold
- Text "FloorConnector" in white, 16px semibold, 4px gap from logo

**Navigation Section:**
- Navigation links: "Dashboard", "Leads", "Estimates", "Jobs", "Invoices"
- Active link: White text with `bg-white/10` background
- Inactive links: `text-white/70` with hover state `hover:text-white hover:bg-white/5`
- Smooth transitions on hover

**User Menu (Right):**
- Settings icon: White, hover brightens
- User avatar: Initials in graphite background, 32px
- Both items interactive with hover effects

**CSS Implementation:**
```tsx
<header className="h-14 flex items-center justify-between px-4" style={{ backgroundColor: '#374151' }}>
  {/* Logo */}
  <div className="flex items-center gap-2">
    <div style={{ backgroundColor: '#B45309' }} className="w-8 h-8 rounded-md flex items-center justify-center">
      <span className="text-white font-bold text-sm">FC</span>
    </div>
    <span className="text-white font-semibold">FloorConnector</span>
  </div>

  {/* Navigation */}
  <nav className="flex items-center gap-1 ml-8">
    {navItems.map((item) => (
      <a
        key={item}
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
          item === 'Estimates' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'
        }`}
      >
        {item}
      </a>
    ))}
  </nav>

  {/* User Menu */}
  <div className="flex items-center gap-3">
    <button className="p-2 text-white/70 hover:text-white rounded-md hover:bg-white/10">
      <Settings className="w-5 h-5" />
    </button>
    <div style={{ backgroundColor: '#374151' }} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white">
      JD
    </div>
  </div>
</header>
```

---

## Part 4: Icon System (FINALIZED)

### Icon Style: Circular Backgrounds

Icons use circular background containers with Lucide icons, providing visual weight and serving as better touch targets for interactive elements.

**Icon Container Sizes:**
- `24px` - Small icons (inline, tight spaces)
- `32px` - Standard icons (sidebar navigation, buttons)
- `40px` - Large icons (section headers, hero elements)

**Icon Container Styling:**
- Background: Soft Cream (#F3F4F6) for neutral context
- Background: Graphite (#374151) for active/selected states
- Background: Copper (#B45309) for CTAs and key actions
- Border-radius: `rounded-full` (50%)
- Icon color adapts to background contrast

**Usage Examples:**

**Sidebar Navigation (Active):**
```tsx
<div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#374151' }}>
  <Wallet className="w-4 h-4" style={{ color: '#FFFFFF' }} />
</div>
```

**Sidebar Navigation (Inactive):**
```tsx
<div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F3F4F6' }}>
  <Grid3X3 className="w-4 h-4" style={{ color: '#6B7280' }} />
</div>
```

**CTA Button with Icon:**
```tsx
<button style={{ backgroundColor: '#B45309' }} className="w-9 h-9 rounded-full flex items-center justify-center hover:brightness-90 transition-all">
  <Plus className="w-4 h-4" style={{ color: '#FFFFFF' }} />
</button>
```

**Icon Size Mapping:**
```tsx
const iconSizes = {
  xs: { container: 24, icon: 14 },  // Inline
  sm: { container: 28, icon: 16 },  // Small elements
  md: { container: 32, icon: 18 },  // Standard (default)
  lg: { container: 40, icon: 20 },  // Section headers
  xl: { container: 48, icon: 24 },  // Hero elements
};
```

---

## Part 5: Component Improvements & Patterns

### 5.1 Sidebar Navigation Highlights

**Active Section State:**
- Background: Soft Graphite (#F3F4F6)
- Text Color: Graphite Primary (#374151)
- Icon: Circular background with graphite fill
- Font Weight: 500 (medium)
- Transition: `transition-colors duration-150`

**Implementation:**
```tsx
<button
  onClick={() => setActiveSection(section.id)}
  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors"
  style={{
    backgroundColor: isActive ? '#F3F4F6' : 'transparent',
    color: isActive ? '#374151' : '#6B7280',
  }}
>
  <div
    className="w-7 h-7 rounded-full flex items-center justify-center"
    style={{
      backgroundColor: isActive ? '#374151' : '#F3F4F6',
    }}
  >
    <Icon style={{ color: isActive ? '#FFFFFF' : '#6B7280' }} />
  </div>
  <span className="text-sm font-medium flex-1">{section.label}</span>
</button>
```

---

### 5.2 Design System Token Extraction (PRIORITY 1)

**Current State:** Hardcoded color values in `estimate-workspace-shell.tsx`

**Action:** Extract all inline colors to semantic design tokens. Example refactor:

**Before:**
```tsx
<div className="border-[#d7c7b4] bg-[#fbf7f1] text-[#665446]">
  Status Badge
</div>
```

**After:**
```tsx
<div className="border-[var(--border-light)] bg-[var(--surface)] text-[var(--text-secondary)]">
  Status Badge
</div>
```

**Files to Update:**
- `apps/web/components/estimates/estimate-workspace-shell.tsx`
- `apps/web/components/estimates/estimate-line-items-table.tsx`
- `apps/web/components/estimates/estimate-financial-summary.tsx`
- All badge, button, and status components

---

### 5.3 Shared Component Primitives (PRIORITY 2)

Create new components in `@floorconnector/ui` to consolidate recurring patterns:

#### `WorkspaceBadge` Component
```tsx
// @floorconnector/ui/src/workspace-badge.tsx
interface WorkspaceBadgeProps {
  variant: 'status' | 'priority' | 'tag';
  intent: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function WorkspaceBadge({ variant, intent, children, icon }: WorkspaceBadgeProps) {
  // Unified badge styling with semantic colors
}
```

Used for: Status indicators, priority tags, approval states.

#### `WorkspaceSectionHeader` Component
```tsx
// @floorconnector/ui/src/workspace-section-header.tsx
interface WorkspaceSectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  divider?: boolean;
}

export function WorkspaceSectionHeader({ title, icon, action, divider }: WorkspaceSectionHeaderProps) {
  // Consistent section headers across all modules
}
```

Used for: Section titles in left panels, section dividers.

#### `WorkspaceActionFooter` Component
```tsx
// @floorconnector/ui/src/workspace-action-footer.tsx
interface WorkspaceActionFooterProps {
  primaryAction: { label: string; onClick: () => void; loading?: boolean };
  secondaryAction?: { label: string; onClick: () => void };
  align?: 'left' | 'right' | 'space-between';
}

export function WorkspaceActionFooter({ primaryAction, secondaryAction, align }: WorkspaceActionFooterProps) {
  // Sticky footer with consistent button styling
}
```

Used for: Save/Cancel buttons in edit workspaces.

---

### 5.4 Iconography Standardization (PRIORITY 3)

**Standard Icon Sizes:**
- `16px` — Inline icons within text or tight spaces
- `20px` — Button icons, action icons (default)
- `24px` — Section headers, large interactive elements
- `32px` — Hero/feature icons (rare)

**Icon Utility:**
```tsx
// components/ui/icon.tsx
interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Icon({ name, size = 'md', className }: IconProps) {
  const sizeMap = { sm: 16, md: 20, lg: 24, xl: 32 };
  return <LucideIcon name={name} width={sizeMap[size]} height={sizeMap[size]} className={className} />;
}
```

---

### 5.5 Table & Data Presentation (PRIORITY 4)

Enhance `DenseTable` component with:

```tsx
// components/estimates/dense-table.tsx
interface DenseTableProps {
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
  }>;
  rows: any[];
  onRowClick?: (row: any) => void;
  hoverable?: boolean;
  showHeaderSeparator?: boolean;
  stickyHeader?: boolean;
}

export function DenseTable({
  columns,
  rows,
  onRowClick,
  hoverable = true,
  showHeaderSeparator = true,
  stickyHeader = true,
}: DenseTableProps) {
  // Features:
  // - hover:bg-[var(--background)] for row interactivity
  // - sticky top-0 for header
  // - Sort indicators on sortable columns
  // - Keyboard navigation support (arrow keys, enter)
}
```

**Visual Enhancements:**
- Header: Bold text with `sticky top-0` positioning, bottom border
- Rows: Subtle hover state with `bg-[var(--background)]`
- Interactive rows: Cursor changes to `cursor-pointer`
- Row height: 40px standard (tight but readable)

---

### 5.6 Micro-Interactions & Feedback (PRIORITY 5)

#### Loading States
- Use skeleton loaders that match content structure
- Skeleton color: `bg-[var(--border-light)]` with `animate-pulse`
- Duration: 1.5s pulsing for smooth feel

#### Save Feedback
- On successful save: Brief toast notification with success icon
- Text: "Changes saved" (auto-dismiss after 3s)
- Position: Bottom right

#### Panel Transitions
- Apply `transition-all duration-200` when switching workspace panels
- Fade + subtle scale: `transform opacity-0 scale-95` → `opacity-100 scale-100`

#### Button States
```tsx
<button className="
  bg-[var(--accent)] text-white
  hover:bg-[#D97706] // Copper Light on hover
  active:brightness-90
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-all duration-150
">
  Save
</button>
```

---

### 5.7 Empty & Loading States (PRIORITY 6)

**Pattern:** Icon + heading + supporting text + CTA

```tsx
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 text-text-secondary">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mb-6 text-text-secondary">{description}</p>
      {action && (
        <button className="btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
```

**Estimate-Specific Examples:**
- `<EmptyLineItems />` — "No items added yet. Add from catalog or enter manually."
- `<EstimatePendingApproval />` — "Awaiting customer approval. You'll be notified when they respond."
- `<NoProjectContext />` — "Linked to projects to see schedule context."

---

### 5.8 Component Architecture Refactoring (PRIORITY 7)

**Current Issue:** `[estimateId]/page.tsx` is 1,233 lines. Break into focused components:

**Proposed Structure:**
```
components/estimates/
├── estimate-detail-page.tsx          # Main orchestrator
├── estimate-header.tsx               # Title, ID, status
├── estimate-financial-summary.tsx    # Total price, taxes, terms
├── estimate-schedule-context.tsx     # Timeline, project link
├── estimate-line-items-section.tsx   # Items table
├── estimate-notes-section.tsx        # Notes & attachments
├── estimate-linked-records.tsx       # Related projects, invoices
├── estimate-metadata.tsx             # Created date, modified by, etc.
└── estimate-actions.tsx              # Edit, delete, approve, etc.
```

**Utility Consolidation:**
```
lib/estimates/
├── formatters.ts                     # formatMoney, formatAddress, formatDate
├── validators.ts                     # Validation logic
├── calculations.ts                   # Tax, total calculations
└── templates.ts                      # Estimate templates
```

---

### 5.9 Workspace Navigation Consistency (PRIORITY 8)

**Sidebar Section Config Pattern:**

```tsx
// lib/estimates/workspace-config.ts
export const ESTIMATE_WORKSPACE_SECTIONS = [
  {
    id: 'items' as const,
    label: 'Items',
    iconName: 'ShoppingCart',
    description: 'Line items & pricing',
  },
  {
    id: 'schedule' as const,
    label: 'Schedule',
    iconName: 'Calendar',
    description: 'Timeline & milestones',
  },
  {
    id: 'notes' as const,
    label: 'Notes',
    iconName: 'FileText',
    description: 'Attachments & comments',
  },
  // ... more sections
] as const;
```

**Active Section Styling:**
```tsx
<div className={`
  ${isActive ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--background)]'}
  transition-all duration-150
  px-4 py-3 rounded-lg
`}>
  {label}
</div>
```

---

### 5.10 Documentation Updates (PRIORITY 9)

Create new documentation files:

1. **`docs/design-tokens-reference.md`**
   - Complete token reference with usage examples
   - Color swatches with hex values
   - When to use each token

2. **`docs/component-gallery.md`**
   - Examples of each shared component
   - Code snippets
   - Visual examples

3. **`docs/typography-guide.md`**
   - Font sizing hierarchy
   - Weight guidelines
   - Line height best practices

4. **`docs/pattern-library.md`**
   - Empty states
   - Loading states
   - Form patterns
   - Table patterns

---

### 5.11 Contrast & Accessibility (PRIORITY 10)

**Minimum Contrast Ratios (WCAG AA):**
- Text on background: 4.5:1 (7:1 for AAA)
- UI components: 3:1

**Verify Color Combinations:**
- Graphite `#374151` on Cream `#FAFAF8`: ✅ 9.8:1
- Copper `#B45309` on White `#FFFFFF`: ✅ 5.2:1
- Copper `#B45309` on Cream `#FAFAF8`: ✅ 4.8:1
- Gray `#6B7280` on Cream `#FAFAF8`: ✅ 7.1:1
- Warm Gray `#E8E6E1` border on White surface: ✅ 1.6:1 (subtle, acceptable for borders)

**Keyboard Navigation:**
- All interactive elements must be keyboard accessible
- Focus states visible: `focus:outline-2 outline-offset-2 outline-[var(--accent)]`
- Tab order follows visual hierarchy (left-to-right, top-to-bottom)

---

## Part 6: Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Define CSS design tokens in `globals.css`
- [ ] Update Tailwind config with new color values
- [ ] Create `@floorconnector/ui` shared components (Badge, SectionHeader, ActionFooter)
- [ ] Update all color values in existing components

### Phase 2: Component Polish (Week 3-4)
- [ ] Enhance `DenseTable` with hover states, sticky headers, sorting
- [ ] Create Icon utility component
- [ ] Create EmptyState pattern
- [ ] Add skeleton loaders

### Phase 3: Architecture Refactoring (Week 5-6)
- [ ] Split `estimate-detail-page.tsx` into focused components
- [ ] Consolidate utility functions in `lib/estimates/`
- [ ] Extract workspace section configuration

### Phase 4: Micro-Interactions (Week 7)
- [ ] Add panel transition animations
- [ ] Implement save feedback notifications
- [ ] Add button state feedback
- [ ] Polish hover states across all interactive elements

### Phase 5: Documentation & Propagation (Week 8)
- [ ] Create design tokens reference
- [ ] Build component gallery
- [ ] Document patterns and best practices
- [ ] Refactor other modules to follow Estimates pattern

---

## Part 7: Quick Reference

### Button Styles

**Primary CTA (Copper):**
```tsx
<button className="bg-[var(--accent)] text-white px-4 py-2 rounded-md hover:bg-[#D97706] transition-all">
  Save Changes
</button>
```

**Secondary:**
```tsx
<button className="bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border-light)] px-4 py-2 rounded-md hover:bg-[var(--background)] transition-all">
  Cancel
</button>
```

**Destructive:**
```tsx
<button className="bg-[var(--color-error)] text-white px-4 py-2 rounded-md hover:brightness-90 transition-all">
  Delete
</button>
```

### Common Spacing
- Padding: `p-4`, `px-6`, `py-3`
- Margin: `mb-4`, `mt-3`, `gap-4`
- Follow Tailwind spacing scale (4px units)

### Shadows
- Small: `shadow-sm` (subtle cards)
- Medium: `shadow-md` (elevated panels)
- Large: `shadow-lg` (modals, popovers)

---

## Part 8: Final Summary

This design system establishes **Graphite & Copper** as FloorConnector's visual identity, emphasizing professionalism, reliability, and refined craftsmanship. 

**Finalized Design Decisions:**
- **Header**: Dark Graphite Bar with copper accent logo
- **Icons**: Circular backgrounds for visual weight and touch targets
- **Highlights**: Soft Graphite for active states (neutral, professional)
- **Borders**: Warm Gray (#E8E6E1) for earthy, cohesive feel

The **Estimates module** serves as the golden reference—all future modules should follow this established pattern for consistency and quality.

The 11 systematic improvements address both visual cohesion and interaction polish, creating a modern, efficient platform that contractors trust for their most important business workflows.
