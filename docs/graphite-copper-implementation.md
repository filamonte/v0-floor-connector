# Graphite & Copper Design System: Accepted Foundation Closeout

Status: Accepted visual foundation after v0 closeout.

This document records the visual implementation scope. It is not approval for a broad contractor-shell redesign, new module shells, new navigation systems, or business/workflow changes. The accepted work preserved the existing top-nav-first contractor shell, shared Manager Page pattern, and shared Record Workspace language.

## Completed / Verified Scope

### 1. Icon Container Component (Foundation)
**File:** `apps/web/components/icon-container.tsx`

Created reusable `IconContainer` component with:
- **Sizes:** xs (24px), sm (28px), md (32px), lg (36px), xl (48px)
- **Variants:** default, active, copper, success, error
- Uses circular backgrounds with proper color contrast
- Integrates with CSS design tokens

Example usage:
```tsx
<IconContainer size="md" variant="active">
  <Wallet className="h-4 w-4" />
</IconContainer>
```

### 2. Header Component Updated
**File:** `apps/web/components/protected-app-top-nav.tsx`

Applied Graphite & Copper design tokens:
- Header background: `var(--graphite)` instead of hardcoded #111111
- Copper accents: `var(--copper)` for active states
- Borders: `var(--border-warm)` for warm gray separation
- Utility icons: Updated to use new token colors
- CTA buttons: `var(--copper)` with `var(--copper-light)` hover

### 3. Estimate Workspace Shell Updated
**File:** `apps/web/components/estimates/estimate-workspace-shell.tsx`

Applied design tokens throughout:
- Active workspace badge/action accent: Uses `var(--highlight)` + `var(--copper)`
- Save button: `var(--copper)` background with hover state
- Text colors: `var(--text-primary)`, `var(--text-secondary)`, `var(--text-tertiary)`
- Borders: `var(--border-warm)` for consistent separation
- Input fields: Use `var(--border-medium)` for focus

### 4. Status Sidebar Updated
**File:** `apps/web/components/estimates/status-sidebar.tsx`

Replaced hardcoded Tailwind slate colors with design tokens:
- Border: `var(--border-warm)` instead of slate-200
- Text: `var(--text-primary)`, `var(--text-secondary)`, `var(--text-tertiary)`
- Background: `var(--highlight)` for subtle emphasis
- Progress bar: Maintains custom color class but now on consistent background

## Design Tokens Implemented

All tokens available in `apps/web/app/globals.css`:

| Token | Hex | Purpose |
|-------|-----|---------|
| `--graphite` | #374151 | Primary chrome, headers |
| `--graphite-dark` | #1F2937 | Secondary chrome |
| `--copper` | #B45309 | CTAs, active states |
| `--copper-light` | #D97706 | Hover states |
| `--highlight` | #F3F4F6 | Active/selection states |
| `--border-warm` | #E8E6E1 | Borders, dividers |
| `--border-medium` | #D9D5CD | Inputs and medium-emphasis controls |
| `--border-dark` | #9CA3AF | Hover/focus border contrast |
| `--text-primary` | #111827 | Body text |
| `--text-secondary` | #6B7280 | Secondary text |
| `--text-tertiary` | #9CA3AF | Hints, tertiary |

## Tailwind Configuration

Extended in `apps/web/tailwind.config.ts`:
- **Graphite scale:** 50, 100, 300, 400, 500, 600, 700, 800, 900
- **Copper scale:** 400, 500, 600
- Accessible via `bg-graphite-700`, `text-copper-600`, etc.

## What Changed Visually

✅ Header now uses true Graphite (#374151) instead of black  
✅ Copper accent (#B45309) more prominent and consistent  
✅ Warm gray borders (#E8E6E1) create earthy, cohesive feel  
✅ Soft graphite highlight (#F3F4F6) for active states instead of muted copper  
✅ All text colors now consistent and token-based  
✅ Icon backgrounds use circular containers with proper contrast  

## Future Targeted Work

Future visual work should be scoped to targeted polish or safe propagation of existing shared patterns. It must follow [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md) and must not change schema, RLS, auth, server actions, data loading, route protection, financial logic, workflow behavior, or app navigation.

Appropriate follow-up examples:
1. Apply tokens to a specific existing module surface when a visual regression or off-system accent is found.
2. Reuse existing shared Manager Page and Record Workspace patterns where a page already belongs to those patterns.
3. Improve form, table, modal, and focus-state consistency inside existing components without changing data or workflow behavior.

Do not treat this document as permission to create a new app shell, permanent primary left sidebar, module-local wrapper, or broad redesign pass.

## Files Modified

- `apps/web/app/globals.css` — Added Graphite & Copper design tokens
- `apps/web/tailwind.config.ts` — Extended color palettes
- `apps/web/components/icon-container.tsx` — NEW component
- `apps/web/components/protected-app-top-nav.tsx` — Updated colors
- `apps/web/components/estimates/estimate-workspace-shell.tsx` — Updated colors
- `apps/web/components/estimates/status-sidebar.tsx` — Updated colors
- `docs/floorconnector-ui-build-rules.md` — Updated color guidance
- `docs/design-system-comprehensive-prompt.md` — Reference doc
