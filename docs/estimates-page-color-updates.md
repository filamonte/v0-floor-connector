# Estimates Page Color System Updates

## Overview
Applied Graphite & Copper design system tokens to both the estimates list page and estimate detail page. Replaced hardcoded colors and slate colors with design system CSS variables.

## Files Updated

### 1. `/apps/web/app/(app)/estimates/page.tsx`
The main estimates list/dashboard page.

**Changes:**
- Summary cards: Updated borders from `#e2e5e9` → `var(--border-warm)`
- Summary card labels: Updated from `#666666` → `var(--text-secondary)`
- Summary card values: Updated from `#171717` → `var(--text-primary)`
- Search input focus: Updated from `#ef7d32` → `var(--copper)`
- Search button: Updated from `#d6d6d6` → `var(--border-warm)`, text from `slate-700` → `var(--text-primary)`, hover from `slate-50` → `var(--highlight)`
- Status filter buttons: Active state from `#171717` → `var(--graphite)`, border/hover from `#d6d6d6` → `var(--border-warm)`, hover bg from `slate-50` → `var(--highlight)`
- View option buttons: Background from `slate-100` → `var(--highlight)`, text from `slate-500` → `var(--text-secondary)`
- Add estimate button: Colors from `#ef7d32` → `var(--copper)`, hover from `#de6c22` → `var(--copper-light)`
- Estimate queue section: Border from `#e2e5e9` → `var(--border-warm)`, header bg from `#f8fafc` → `var(--highlight)`
- Queue title: From `slate-950` → `var(--text-primary)`
- Queue description: From `slate-500` → `var(--text-secondary)`
- Row dividers: From `#e5e7eb` → `var(--border-warm)`
- Row hover: From `#f8fafc` → `var(--highlight)`
- Progress bars: Container from `slate-100` → `var(--highlight)`, progress from `#171717` → `var(--graphite)`
- Progress percentage: From `slate-500` → `var(--text-secondary)`

### 2. `/apps/web/app/(app)/estimates/[estimateId]/page.tsx`
The estimate detail/review page (1,233 lines).

**Changes:**
- All `border-slate-200` → `border-[var(--border-warm)]`
- All `bg-slate-50` → `bg-[var(--highlight)]`
- All `text-slate-500` → `text-[var(--text-secondary)]` (22 occurrences)
- All `text-slate-600` → `text-[var(--text-secondary)]` (5 occurrences)
- All `text-slate-700` → `text-[var(--text-primary)]` (7 occurrences)
- All `text-slate-800` → `text-[var(--text-primary)]` (4 occurrences)
- All `text-slate-950` → `text-[var(--text-primary)]` (3 occurrences)
- All `border-slate-300` → `border-[var(--border-warm)]` (5 occurrences)
- Detail page header border: From `slate-200` → `var(--border-warm)`
- Detail page header background: From `slate-200` divider → `var(--border-warm)`
- Eyebrow text: From `slate-500` → `var(--text-secondary)`
- Headings (h2, h3): From `slate-950` → `var(--text-primary)`
- Description/detail text: From `slate-600` → `var(--text-secondary)`
- Line items group: Border from `slate-200` → `var(--border-warm)`, bg from `slate-50/40` → `var(--highlight)`
- Table headers: From `slate-500` → `var(--text-secondary)`
- Table rows: Text from `slate-700` → `var(--text-primary)`, borders from `slate-200` → `var(--border-warm)`
- Financial summary sections: All borders from `slate-200` → `var(--border-warm)`, text colors updated accordingly
- Address display panel: Border from `slate-200` → `var(--border-warm)`, bg from `slate-50/70` → `var(--highlight)`
- All prose blocks: Border from `slate-200` → `var(--border-warm)`, bg from `slate-50/70` → `var(--highlight)`, text colors updated
- All panels/boxes: Borders and backgrounds updated to design tokens

## Color Mapping Applied

| Old Color | New Token | Semantic Use |
|-----------|-----------|--------------|
| `#e2e5e9` | `var(--border-warm)` | Subtle borders |
| `#e5e7eb` | `var(--border-warm)` | Dividers |
| `slate-200` | `var(--border-warm)` | Borders |
| `slate-50` | `var(--highlight)` | Background highlight |
| `#666666` | `var(--text-secondary)` | Secondary text |
| `slate-500` | `var(--text-secondary)` | Secondary text |
| `slate-600` | `var(--text-secondary)` | Secondary/detail text |
| `#171717` | `var(--graphite)` | Primary active state |
| `slate-700` | `var(--text-primary)` | Primary text |
| `slate-800` | `var(--text-primary)` | Primary text |
| `slate-950` | `var(--text-primary)` | Primary text |
| `#ef7d32` | `var(--copper)` | Primary action/active |
| `#d6d6d6` | `var(--border-warm)` | Input borders |
| `slate-100` | `var(--highlight)` | Background highlight |

## Benefits

✓ Entire estimates section now uses design system tokens
✓ Consistent warm gray borders across all pages
✓ Proper text hierarchy with primary/secondary/tertiary colors
✓ Ready for dark mode or theme switching (uses CSS variables)
✓ Design system now enforced across critical user paths

## Next Steps

1. Apply same color token replacements to other modules (Leads, Jobs, Invoices, Dashboard)
2. Update remaining components using hardcoded colors
3. Consider extracting common page patterns into reusable component layouts
4. Monitor for any missed slate color references in the codebase

---

**Last Updated:** Implementation complete
**Status:** Ready for QA and user testing
