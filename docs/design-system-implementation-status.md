# FloorConnector Design System Implementation Status

**Date:** 2026-05-10  
**Status:** Accepted visual foundation after v0 closeout

Post-v0 closeout note: the Graphite & Copper work is accepted as the contractor-app visual-token foundation. Desktop, mobile, tablet, auth, route smoke, forensic scope, and final closeout validation passed. The work preserved the existing top-nav-first contractor shell, Manager Page rhythm, and shared Record Workspace patterns. It did not change schema, RLS, auth behavior, middleware, server actions, data loading, route protection, financial logic, calculations, workflow transitions, or app navigation.

---

## What Was Completed

### 1. Design System Foundation (✓ Complete)
- **Decision:** Graphite & Copper color scheme with Soft Graphite highlights
- **Header Style:** Dark Graphite Bar (#374151) with copper accent logo
- **Icon System:** Circular backgrounds (Lucide icons)
- **Borders:** Warm Gray (#E8E6E1) for earthy, cohesive feel
- **Document:** `/docs/design-system-comprehensive-prompt.md` (comprehensive reference)

### 2. Design Tokens Implementation (✓ Complete)

**`globals.css` - 19 CSS variables available:**
```css
--graphite: #374151
--graphite-light: #4B5563
--graphite-dark: #1F2937
--copper: #B45309
--copper-light: #D97706
--cream: #FAFAF8
--highlight: #F3F4F6
--border-warm: #E8E6E1
--border-medium: #D9D5CD
--border-dark: #9CA3AF
--text-primary: #111827
--text-secondary: #6B7280
--text-tertiary: #9CA3AF
--color-success: #16A34A
--color-warning: #EA8C55
--color-error: #DC2626
--color-info: #0EA5E9
```

**`tailwind.config.ts` - Color palette extended:**
- `graphite` scale (50-900) mapped to design tokens
- `copper` scale (400-600) for accent variants

### 3. Documentation Alignment (✓ Complete)

**`floorconnector-ui-build-rules.md` updated:**
- Changed from vague "black / gray / orange / white" to specific tokens
- Added reference to `design-system-comprehensive-prompt.md`
- Specified exact hex values for each color role
- Clarified that Copper is primary action color, not used generically

### 4. Design Reference (✓ Complete)

**`/design-mockup` reference route showcases:**
- Dark Graphite Bar header (finalized)
- Soft Graphite highlights on active navigation
- Circular icon backgrounds
- Estimate workspace with all design decisions applied
- Color palette reference section

---

## What's Ready to Use

### Immediately Available:
✓ CSS variables in `globals.css` (can be used anywhere)  
✓ Tailwind color utilities (e.g., `bg-graphite-700`, `text-copper-600`)  
✓ Design token reference document  
✓ Visual reference route at `/design-mockup`

### Future Targeted Propagation
Further design work should be specific and incremental:
1. Fix verified off-system colors or contrast issues in existing surfaces.
2. Apply tokens inside existing shared Manager Page, Record Workspace, form, table, modal, and focus-state patterns.
3. Keep status colors semantic and avoid blue/cyan/indigo/teal/purple as default contractor-app accents.
4. Avoid new shells, module-local wrappers, permanent primary left sidebars, or broad redesign passes.

---

## Color Mapping Reference

| Role | Token | Hex | Usage |
|------|-------|-----|-------|
| Primary Chrome | `--graphite` | #374151 | Headers, navigation, strong text |
| Secondary Chrome | `--graphite-dark` | #1F2937 | Borders, emphasis |
| Primary Action | `--copper` | #B45309 | CTAs, save buttons, focus rings |
| Action Hover | `--copper-light` | #D97706 | Button hover states |
| Page Background | `--cream` | #FAFAF8 | Main background |
| Active/Highlight | `--highlight` | #F3F4F6 | Active navigation, selections |
| Subtle Borders | `--border-warm` | #E8E6E1 | Dividers, panel borders |
| Standard Border | `--border-medium` | #D9D5CD | Inputs and medium-emphasis controls |
| Strong Border | `--border-dark` | #9CA3AF | Hover/focus border contrast |
| Primary Text | `--text-primary` | #111827 | Body text |
| Secondary Text | `--text-secondary` | #6B7280 | Labels, hints |
| Success | `--color-success` | #16A34A | Approved, completed states |
| Warning | `--color-warning` | #EA8C55 | Pending, attention needed |
| Error | `--color-error` | #DC2626 | Errors, destructive actions |
| Info | `--color-info` | #0EA5E9 | Informational messages |

---

## Future Targeted Checklist

- [ ] Keep future visual work scoped to verified regressions or specific existing surfaces
- [ ] Reuse shared Manager Page and Record Workspace patterns
- [ ] Use Copper only for primary actions, active action emphasis, and focus treatment
- [ ] Keep semantic status colors limited to status meaning
- [ ] Verify contrast ratios (WCAG AA minimum) when changing visible styling
- [ ] Test mobile/tablet responsiveness when changing responsive layout
- [ ] Remove hardcoded legacy colors only after semantic review

---

## Files Updated

1. `/apps/web/app/globals.css` — Added 17 CSS variables
2. `/apps/web/tailwind.config.ts` — Extended color palette
3. `/docs/floorconnector-ui-build-rules.md` — Updated color section with specific tokens
4. `/docs/design-system-comprehensive-prompt.md` — Created comprehensive reference
5. `/apps/web/app/design-mockup/page.tsx` — Demonstrates the visual reference route; it is not a production work module

---

## Quick Start for Developers

**To use the new color system:**

```tsx
// CSS Variables
<div style={{ backgroundColor: 'var(--graphite)' }}>
  Content
</div>

// Tailwind Classes
<button className="bg-graphite-700 text-white hover:bg-graphite-800">
  Action
</button>

// Copper Accent
<button className="bg-copper-600 hover:bg-copper-500">
  Save
</button>
```

**Reference the complete design system:**
- See `/docs/design-system-comprehensive-prompt.md` for full specifications
- See `/design-mockup` for visual reference; do not treat it as a production contractor work route
- See `globals.css` for all available tokens
