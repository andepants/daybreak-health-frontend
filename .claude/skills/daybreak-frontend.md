# Daybreak Health Frontend Design System

Guide for building UI components that match the Daybreak Health brand and design language. Use this skill when implementing UI components, styling pages, or ensuring visual consistency with the Daybreak Health brand.

---

## Reference

See `docs/reference/ui-reference.jpg` for the primary visual reference.

---

## Color Palette

### Primary Colors

```css
/* Teal - Primary brand color for headlines, links, and primary buttons */
--color-teal-primary: #3AAFA9;
--color-teal-dark: #2B7A78;
--color-teal-light: #4ECDC4;

/* Orange/Yellow - Warm accent for CTAs and highlights */
--color-orange-primary: #F5A623;
--color-orange-light: #FFBE4F;
--color-orange-dark: #E09400;
```

### Background Colors

```css
/* Cream/Beige - Warm backgrounds */
--color-cream: #FDF8F3;
--color-cream-dark: #F5EDE4;

/* White variations */
--color-white: #FFFFFF;
--color-off-white: #FAFAFA;
```

### Accent Colors

```css
/* Red - Decorative elements (dots, accents) */
--color-red-accent: #E85A4F;

/* Yellow - Photo frame accents */
--color-yellow-accent: #FFD93D;
```

### Text Colors

```css
/* Body text */
--color-text-primary: #2D3436;
--color-text-secondary: #636E72;
--color-text-muted: #B2BEC3;
```

### Tailwind CSS Configuration

```typescript
// tailwind.config.ts
const colors = {
  teal: {
    DEFAULT: '#3AAFA9',
    50: '#E6F7F6',
    100: '#C2EBE9',
    200: '#9DDEDA',
    300: '#78D1CB',
    400: '#53C4BC',
    500: '#3AAFA9',
    600: '#2E8B87',
    700: '#236865',
    800: '#174543',
    900: '#0C2321',
  },
  orange: {
    DEFAULT: '#F5A623',
    50: '#FEF6E6',
    100: '#FDEACC',
    200: '#FBD499',
    300: '#F9BF66',
    400: '#F7AA33',
    500: '#F5A623',
    600: '#D4890D',
    700: '#A16809',
    800: '#6E4706',
    900: '#3B2603',
  },
  cream: {
    DEFAULT: '#FDF8F3',
    50: '#FFFFFF',
    100: '#FDF8F3',
    200: '#F5EDE4',
    300: '#EDE2D5',
    400: '#E5D7C6',
  },
  red: {
    accent: '#E85A4F',
  },
  yellow: {
    accent: '#FFD93D',
  },
};
```

---

## Typography

### Font Families

```css
/* Headlines - Serif font for warmth and approachability */
--font-headline: 'Merriweather', 'Georgia', serif;

/* Body - Clean sans-serif for readability */
--font-body: 'Inter', 'Helvetica Neue', sans-serif;

/* UI Elements - Sans-serif */
--font-ui: 'Inter', 'Helvetica Neue', sans-serif;
```

### Font Sizes

```css
/* Headings */
--text-h1: 3.5rem;    /* 56px - Hero headlines */
--text-h2: 2.5rem;    /* 40px - Section headlines */
--text-h3: 1.75rem;   /* 28px - Subsection headlines */
--text-h4: 1.25rem;   /* 20px - Card headlines */

/* Body */
--text-body-lg: 1.125rem;  /* 18px */
--text-body: 1rem;         /* 16px */
--text-body-sm: 0.875rem;  /* 14px */

/* UI */
--text-button: 1rem;       /* 16px */
--text-nav: 0.9375rem;     /* 15px */
--text-caption: 0.75rem;   /* 12px */
```

### Line Heights

```css
--leading-tight: 1.2;      /* Headlines */
--leading-normal: 1.5;     /* Body text */
--leading-relaxed: 1.75;   /* Long-form content */
```

### Tailwind Typography Classes

```html
<!-- Hero Headline -->
<h1 class="font-serif text-5xl md:text-6xl font-bold leading-tight text-teal-500">
  Mental health support to help every kid and family thrive
</h1>

<!-- Section Headline -->
<h2 class="font-serif text-3xl md:text-4xl font-semibold text-teal-600">
  Section Title
</h2>

<!-- Body Text -->
<p class="font-sans text-base md:text-lg text-gray-700 leading-relaxed">
  Body content goes here...
</p>
```

---

## Component Patterns

### Buttons

#### Primary Button (Teal)

```tsx
/**
 * Primary CTA button with teal background
 * Use for main actions like "Sign Up", "Get Started"
 */
function PrimaryButton({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        bg-teal-500 hover:bg-teal-600
        text-white font-medium
        px-8 py-3
        rounded-full
        transition-colors duration-200
        shadow-sm hover:shadow-md
      "
    >
      {children}
    </button>
  );
}
```

#### Secondary Button (Orange)

```tsx
/**
 * Secondary/warm CTA button with orange background
 * Use for alternative actions like "Book a Demo", "Learn More"
 */
function SecondaryButton({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        bg-orange-500 hover:bg-orange-600
        text-white font-medium
        px-8 py-3
        rounded-full
        transition-colors duration-200
        shadow-sm hover:shadow-md
      "
    >
      {children}
    </button>
  );
}
```

#### Outline Button

```tsx
/**
 * Outline button for tertiary actions
 */
function OutlineButton({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        border-2 border-teal-500
        text-teal-500 hover:bg-teal-50
        font-medium
        px-8 py-3
        rounded-full
        transition-colors duration-200
      "
    >
      {children}
    </button>
  );
}
```

### Navigation

```tsx
/**
 * Main navigation header component
 * Features: logo, nav links with dropdowns, language selector, CTA button
 */
function Navigation() {
  return (
    <header className="bg-white py-4 px-6 md:px-12">
      <nav className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <DaybreakLogo className="h-8 w-auto" />
          <span className="font-semibold text-teal-600 text-lg">
            Daybreak Health
          </span>
        </div>

        {/* Nav Links */}
        <ul className="hidden md:flex items-center gap-8 text-gray-700">
          <li><NavLink href="/schools">For School Districts</NavLink></li>
          <li><NavDropdown label="For Families" /></li>
          <li><NavLink href="/health-plans">For Health Plans</NavLink></li>
          <li><NavDropdown label="About" /></li>
        </ul>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <PrimaryButton>Sign Up</PrimaryButton>
        </div>
      </nav>
    </header>
  );
}
```

### Hero Section

```tsx
/**
 * Hero section with headline, subtext, and dual CTAs
 * Background: cream/beige gradient
 */
function HeroSection() {
  return (
    <section className="bg-cream-100 py-16 md:py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Content */}
        <div className="space-y-6">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-teal-500">
            Mental health support to help every kid and family thrive
          </h1>
          <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-lg">
            Daybreak partners with schools to provide therapy for kids and families,
            regardless of insured or uninsured. Our care programs are personalized to
            each individual's unique needs.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <SecondaryButton>Schools - Book a Demo</SecondaryButton>
            <PrimaryButton>Families - Sign Up</PrimaryButton>
          </div>
        </div>

        {/* Image with decorative frame */}
        <div className="relative">
          <DecoratedImage
            src="/images/hero-student.jpg"
            alt="Smiling student"
          />
        </div>
      </div>
    </section>
  );
}
```

### Decorated Image Frame

```tsx
/**
 * Image with decorative frame elements
 * Features: yellow corner accent, shadow, rounded corners
 */
function DecoratedImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative">
      {/* Yellow corner accent - positioned top-right */}
      <div
        className="
          absolute -top-4 -right-4
          w-32 h-32
          border-4 border-yellow-accent
          rounded-tr-3xl
          z-0
        "
      />

      {/* Main image container */}
      <div className="relative z-10 rounded-2xl overflow-hidden shadow-xl">
        <Image
          src={src}
          alt={alt}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Red decorative dots - bottom right */}
      <div className="absolute -bottom-8 -right-8 z-20">
        <DecorativeDots />
      </div>
    </div>
  );
}
```

### Decorative Dots Pattern

```tsx
/**
 * Red decorative dots pattern used for visual interest
 */
function DecorativeDots() {
  return (
    <div className="flex flex-col gap-2">
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex gap-2">
          {[0, 1, 2, 3].map((col) => (
            <div
              key={col}
              className="w-2 h-2 rounded-full bg-red-accent"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
```

---

## Layout Guidelines

### Container Widths

```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

### Spacing Scale

```css
/* Use consistent spacing based on 4px grid */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-24: 6rem;     /* 96px */
```

### Section Padding

```css
/* Vertical section padding */
.section-padding {
  padding-top: var(--space-16);
  padding-bottom: var(--space-16);
}

@media (min-width: 768px) {
  .section-padding {
    padding-top: var(--space-24);
    padding-bottom: var(--space-24);
  }
}
```

---

## Design Principles

### 1. Warm & Approachable
- Use cream/beige backgrounds instead of stark white
- Rounded corners on all interactive elements
- Serif fonts for headlines convey warmth and trust
- Soft shadows rather than hard borders

### 2. Clear Visual Hierarchy
- Large, bold headlines in teal grab attention
- Body text is subdued but readable
- Clear CTA buttons with distinct colors
- Adequate whitespace between sections

### 3. Trustworthy & Professional
- Consistent color palette across all pages
- High-quality imagery of real people
- Clean, uncluttered layouts
- Professional typography choices

### 4. Playful Accents
- Decorative dot patterns add visual interest
- Yellow corner frames on images add personality
- Dual-color CTA buttons create visual variety
- Subtle animations on interactions

---

## Accessibility Requirements

### Color Contrast
- All text must meet WCAG 2.1 AA standards
- Teal on cream: ensure minimum 4.5:1 contrast ratio
- Interactive elements must have visible focus states

### Focus States

```css
/* Ensure visible focus states for keyboard navigation */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2;
}
```

### Alt Text
- All images must have descriptive alt text
- Decorative elements should use `aria-hidden="true"`

---

## File Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx          # Primary, Secondary, Outline buttons
│   │   ├── Navigation.tsx      # Main nav header
│   │   ├── DecoratedImage.tsx  # Image with decorative frame
│   │   ├── DecorativeDots.tsx  # Red dot patterns
│   │   └── Card.tsx            # Content cards
│   ├── sections/
│   │   ├── HeroSection.tsx     # Hero with headline + CTAs
│   │   ├── FeaturesSection.tsx # Feature highlights
│   │   └── CTASection.tsx      # Call-to-action blocks
│   └── layout/
│       ├── Header.tsx          # Site header with nav
│       ├── Footer.tsx          # Site footer
│       └── Container.tsx       # Max-width container
├── styles/
│   ├── globals.css             # Global styles + CSS variables
│   └── fonts.css               # Font imports
└── lib/
    └── colors.ts               # Color constants for JS usage
```

---

## Quick Reference

### Most Used Classes

```tsx
// Backgrounds
"bg-cream-100"          // Warm page background
"bg-white"              // Card/section background
"bg-teal-500"           // Primary button
"bg-orange-500"         // Secondary button

// Text
"text-teal-500"         // Headline text
"text-gray-700"         // Body text
"text-gray-500"         // Muted text
"font-serif"            // Headlines
"font-sans"             // Body

// Borders & Rounded
"rounded-full"          // Buttons
"rounded-2xl"           // Cards, images
"rounded-lg"            // Smaller elements

// Spacing
"px-6 md:px-12"         // Horizontal page padding
"py-16 md:py-24"        // Section vertical padding
"gap-4"                 // Button groups
"gap-8"                 // Nav links
```

---

## Implementation Checklist

When building a new page or component:

- [ ] Use cream background for main sections (`bg-cream-100`)
- [ ] Apply serif font to all headlines (`font-serif`)
- [ ] Use teal for primary actions and headlines
- [ ] Use orange for secondary/warm CTAs
- [ ] Include decorative elements where appropriate (dots, frames)
- [ ] Ensure all buttons are pill-shaped (`rounded-full`)
- [ ] Test color contrast for accessibility
- [ ] Add appropriate whitespace between sections
- [ ] Use high-quality, authentic imagery
- [ ] Implement focus states for all interactive elements
