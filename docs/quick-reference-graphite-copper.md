# Quick Reference: Graphite & Copper Design System

## Color Tokens (Use These, Not Hardcoded Values)

### Core Colors
```css
--graphite: #374151;          /* Backgrounds, headers, chrome */
--graphite-dark: #1F2937;     /* Secondary chrome, emphasis */
--graphite-light: #4B5563;    /* Hover states, accents */
--copper: #B45309;            /* Primary CTA, active states */
--copper-light: #D97706;      /* Hover on copper */
--cream: #FAFAF8;             /* Page backgrounds */
--highlight: #F3F4F6;         /* Active/selected items */
--border-warm: #E8E6E1;       /* Borders, dividers */
```

### Text & Semantic
```css
--text-primary: #111827;      /* Main body text */
--text-secondary: #6B7280;    /* Secondary info, labels */
--text-tertiary: #9CA3AF;     /* Hints, muted text */
--color-success: #16A34A;     /* Approved, paid, complete */
--color-warning: #EA8C55;     /* Pending, needs attention */
--color-error: #DC2626;       /* Errors, destructive actions */
```

## Component Patterns

### Buttons
```tsx
// Primary CTA
<button className="bg-[var(--copper)] text-white hover:bg-[var(--copper-light)]">
  Save
</button>

// Secondary
<button className="border border-[var(--border-warm)] text-[var(--text-primary)]">
  Cancel
</button>

// Destructive
<button className="bg-[var(--color-error)] text-white">
  Delete
</button>
```

### Cards & Containers
```tsx
<div className="bg-white border border-[var(--border-warm)] rounded-lg">
  {/* Content */}
</div>
```

### Text
```tsx
// Heading
<h1 className="text-[var(--text-primary)]">Title</h1>

// Body
<p className="text-[var(--text-secondary)]">Description</p>

// Hint
<span className="text-[var(--text-tertiary)]">Helper text</span>
```

### Icon Container
```tsx
import { IconContainer } from "@/components/icon-container";

// Default (light background)
<IconContainer>
  <Wallet className="h-4 w-4" />
</IconContainer>

// Active (dark background)
<IconContainer variant="active">
  <Wallet className="h-4 w-4" />
</IconContainer>

// Copper accent
<IconContainer variant="copper" size="lg">
  <Plus className="h-5 w-5" />
</IconContainer>
```

### Status Badge
```tsx
<span className="px-2 py-0.5 bg-[var(--highlight)] text-[var(--text-primary)] border border-[var(--border-warm)] rounded text-sm">
  Active
</span>

// Success
<span className="px-2 py-0.5 bg-[var(--color-success)]/10 text-[var(--color-success)]">
  Approved
</span>
```

### Form Inputs
```tsx
<input
  className="border border-[var(--border-warm)] bg-white text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
  placeholder="Enter text..."
/>
```

## Tailwind Utilities

Use these classes instead of hardcoding colors:

```tsx
// Colors
className="bg-graphite-700"           // Header background
className="bg-copper-600"             // CTA button
className="text-graphite-700"         // Heading text
className="border-graphite-300"       // Borders
className="hover:bg-copper-500"       // Hover state

// Semantic
className="text-[var(--text-primary)]"
className="border-[var(--border-warm)]"
className="bg-[var(--highlight)]"
```

## What NOT to Do ❌

Never use these hardcoded values anymore:
- ❌ `#111111` — Use `var(--graphite)` or `bg-graphite-700`
- ❌ `#ef7d32` — Use `var(--copper)` or `bg-copper-600`
- ❌ `#fbf7f1` — Use `var(--highlight)` or `bg-[var(--highlight)]`
- ❌ `slate-200` — Use `var(--border-warm)` or `border-[var(--border-warm)]`

## When to Add New Colors

Only add a new color token if:
1. It's used in 3+ places
2. It's semantic (not just "light blue")
3. It's part of the brand system

Otherwise, use existing tokens with opacity:
```tsx
<div className="bg-[var(--graphite)]/20">
  Lighter graphite background
</div>
```

## File Locations

- **Tokens:** `apps/web/app/globals.css`
- **Tailwind config:** `apps/web/tailwind.config.ts`
- **Icon component:** `apps/web/components/icon-container.tsx`
- **Reference:** `docs/design-system-comprehensive-prompt.md`
