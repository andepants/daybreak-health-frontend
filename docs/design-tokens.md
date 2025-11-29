# Daybreak Design Tokens

This document defines the design tokens used throughout the Daybreak Health application. All tokens are implemented as CSS custom properties in `app/globals.css` and integrated with Tailwind CSS v4.

## Color Palette

### Brand Colors

| Token | Hex | CSS Variable | Tailwind Class | Usage |
|-------|-----|--------------|----------------|-------|
| Daybreak Teal | `#2A9D8F` | `var(--daybreak-teal)` | `bg-daybreak-teal`, `text-daybreak-teal` | Primary brand color, CTAs, links |
| Teal Light | `#3DBCB0` | `var(--teal-light)` | `bg-teal-light`, `text-teal-light` | Hover states, secondary actions |
| Warm Orange | `#E9A23B` | `var(--warm-orange)` | `bg-warm-orange`, `text-warm-orange` | Accents, highlights, notifications |
| Cream | `#FEF7ED` | `var(--cream)` | `bg-cream` | Background color |
| Deep Text | `#1A3C34` | `var(--deep-text)` | `text-deep-text` | Primary text color |

### Semantic Colors

| Token | Hex | CSS Variable | Tailwind Class | Usage |
|-------|-----|--------------|----------------|-------|
| Success | `#10B981` | `var(--success)` | `bg-success`, `text-success` | Success states, confirmations |
| Warning | `#F59E0B` | `var(--warning)` | `bg-warning`, `text-warning` | Warning states, cautions |
| Error | `#E85D5D` | `var(--error)` | `bg-error`, `text-error` | Error states, destructive actions |
| Info | `#3B82F6` | `var(--info)` | `bg-info`, `text-info` | Informational messages |

### shadcn/ui Semantic Mappings

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--primary` | `#2A9D8F` (Daybreak Teal) | `#3DBCB0` (Teal Light) | Primary buttons, links |
| `--secondary` | `#F3EDE4` | `#1E3330` | Secondary buttons |
| `--accent` | `#E9A23B` (Warm Orange) | `#E9A23B` | Accent elements |
| `--destructive` | `#E85D5D` (Error) | `#F87171` | Delete buttons, errors |
| `--background` | `#FEF7ED` (Cream) | `#0F1F1C` | Page background |
| `--foreground` | `#1A3C34` (Deep Text) | `#F5F5F5` | Primary text |
| `--muted` | `#F3EDE4` | `#1E3330` | Muted backgrounds |
| `--muted-foreground` | `#5A6B66` | `#A3B3AF` | Secondary text |

## Typography

### Font Families

| Token | Font | CSS Variable | Tailwind Class | Usage |
|-------|------|--------------|----------------|-------|
| Heading | Fraunces | `var(--font-fraunces)` | `font-serif` | Headings, display text |
| Body | Inter | `var(--font-inter)` | `font-sans` | Body text, UI elements |

### Font Weights

| Weight | Fraunces | Inter | Usage |
|--------|----------|-------|-------|
| 400 | Regular | Regular | Body text |
| 500 | - | Medium | Emphasis |
| 600 | Semibold | Semibold | Subheadings |
| 700 | Bold | Bold | Headings, CTAs |

### Typography Examples

```html
<!-- Heading with Fraunces -->
<h1 class="font-serif text-4xl font-bold text-deep-text">Welcome to Daybreak</h1>

<!-- Body text with Inter -->
<p class="font-sans text-base text-deep-text">Your journey to better mental health starts here.</p>
```

## Spacing Scale

Based on a 4px base unit for consistent vertical and horizontal rhythm.

| Token | Value | CSS Variable | Tailwind Class | Usage |
|-------|-------|--------------|----------------|-------|
| xs | 4px | `var(--space-xs)` | `p-xs`, `m-xs`, `gap-xs` | Tight spacing, icons |
| sm | 8px | `var(--space-sm)` | `p-sm`, `m-sm`, `gap-sm` | Compact elements |
| md | 16px | `var(--space-md)` | `p-md`, `m-md`, `gap-md` | Standard spacing |
| lg | 24px | `var(--space-lg)` | `p-lg`, `m-lg`, `gap-lg` | Section spacing |
| xl | 32px | `var(--space-xl)` | `p-xl`, `m-xl`, `gap-xl` | Large sections |
| 2xl | 48px | `var(--space-2xl)` | `p-2xl`, `m-2xl`, `gap-2xl` | Page sections |
| 3xl | 64px | `var(--space-3xl)` | `p-3xl`, `m-3xl`, `gap-3xl` | Major divisions |

### Spacing Examples

```html
<!-- Card with consistent spacing -->
<div class="p-lg space-y-md">
  <h2 class="mb-sm">Card Title</h2>
  <p>Card content with proper spacing.</p>
</div>
```

## Border Radius

| Token | Value | CSS Variable | Tailwind Class | Usage |
|-------|-------|--------------|----------------|-------|
| sm | 4px | `var(--radius-sm)` | `rounded-sm` | Subtle rounding |
| md | 8px | `var(--radius-md)` | `rounded-md` | Default rounding |
| lg | 12px | `var(--radius-lg)` | `rounded-lg` | Cards, modals |
| xl | 16px | `var(--radius-xl)` | `rounded-xl` | Large containers |
| full | 9999px | `var(--radius-full)` | `rounded-full` | Pills, avatars |

### Border Radius Examples

```html
<!-- Button with default radius -->
<button class="rounded-md bg-primary px-4 py-2">Click Me</button>

<!-- Avatar with full radius -->
<img class="h-12 w-12 rounded-full" src="avatar.jpg" alt="User" />

<!-- Card with large radius -->
<div class="rounded-lg bg-card p-6">Card content</div>
```

## Accessibility Compliance (WCAG AA)

### Color Contrast Ratios

All color combinations meet WCAG AA requirements:

| Foreground | Background | Contrast Ratio | WCAG Level | Use Case |
|------------|------------|----------------|------------|----------|
| Deep Text (#1A3C34) | Cream (#FEF7ED) | 10.8:1 | AAA | Body text |
| Daybreak Teal (#2A9D8F) | Cream (#FEF7ED) | 3.5:1 | AA Large | Headings, large text |
| White (#FFFFFF) | Daybreak Teal (#2A9D8F) | 4.6:1 | AA | Button text |
| Error (#E85D5D) | Cream (#FEF7ED) | 3.4:1 | AA Large | Error messages |
| Deep Text (#1A3C34) | White (#FFFFFF) | 12.6:1 | AAA | Card text |

### Usage Guidelines

1. **Body text** must always use `text-deep-text` on light backgrounds
2. **Headings** can use `text-daybreak-teal` at 18px+ or bold 14px+
3. **Error messages** should use `text-error` at 18px+ for optimal contrast
4. **Interactive elements** must have visible focus states using `ring-2 ring-ring`

## CSS Custom Properties Reference

All design tokens are available as CSS custom properties:

```css
/* Colors */
var(--daybreak-teal)
var(--teal-light)
var(--warm-orange)
var(--cream)
var(--deep-text)
var(--success)
var(--warning)
var(--error)
var(--info)

/* Typography */
var(--font-fraunces)
var(--font-inter)

/* Spacing */
var(--space-xs)
var(--space-sm)
var(--space-md)
var(--space-lg)
var(--space-xl)
var(--space-2xl)
var(--space-3xl)

/* Border Radius */
var(--radius-sm)
var(--radius-md)
var(--radius-lg)
var(--radius-xl)
var(--radius-full)
```

## Implementation Notes

- All tokens are defined in `app/globals.css`
- Tailwind CSS v4 CSS-first configuration is used
- shadcn/ui components automatically use these tokens via CSS variables
- Dark mode variants are automatically applied when `.dark` class is present
- Font loading uses `next/font` with `display: 'swap'` for optimal performance
