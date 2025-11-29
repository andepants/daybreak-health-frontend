# Story 1.2: Daybreak Design System and Theme Configuration

Status: drafted

## Story

As a **developer**,
I want **a fully configured Daybreak design system with brand colors, typography, and spacing tokens integrated into Tailwind CSS and shadcn/ui**,
so that **I can build UI components that are consistent with Daybreak's brand identity and accessibility standards**.

## Acceptance Criteria

1. **AC-1.2.1:** Fraunces font loaded via next/font - Font renders on page load
2. **AC-1.2.2:** Inter font loaded via next/font - Font renders on page load
3. **AC-1.2.3:** Daybreak color tokens in Tailwind config - `bg-daybreak-teal` class works
4. **AC-1.2.4:** CSS custom properties in globals.css - `var(--daybreak-teal)` resolves
5. **AC-1.2.5:** Spacing scale implemented (xs through 3xl) - Spacing classes apply correctly
6. **AC-1.2.6:** Border radius tokens configured - `rounded-sm` through `rounded-full` work
7. **AC-1.2.7:** Color contrast meets WCAG AA - Automated contrast check passes

## Tasks / Subtasks

- [ ] Task 1: Configure Google Fonts with next/font (AC: 1, 2)
  - [ ] 1.1 Import Fraunces from next/font/google in app/layout.tsx
  - [ ] 1.2 Configure Fraunces with weights [400, 600, 700] and variable axis
  - [ ] 1.3 Import Inter from next/font/google
  - [ ] 1.4 Configure Inter with weights [400, 500, 600, 700] and variable axis
  - [ ] 1.5 Set `display: 'swap'` for both fonts to prevent layout shift
  - [ ] 1.6 Apply font classes to html element
  - [ ] 1.7 Verify fonts render on dev server

- [ ] Task 2: Extend Tailwind config with Daybreak color tokens (AC: 3, 5, 6)
  - [ ] 2.1 Open tailwind.config.ts
  - [ ] 2.2 Add Daybreak color palette to theme.extend.colors
  - [ ] 2.3 Add semantic colors (success, warning, error, info) to theme.extend.colors
  - [ ] 2.4 Configure spacing scale with 4px base (xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px, 3xl: 64px)
  - [ ] 2.5 Configure border radius tokens (sm: 4px, md: 8px, lg: 12px, xl: 16px, full: 9999px)
  - [ ] 2.6 Add font family mappings for Fraunces and Inter
  - [ ] 2.7 Test classes in a component: `bg-daybreak-teal`, `text-deep-text`, `space-y-md`

- [ ] Task 3: Create CSS custom properties in globals.css (AC: 4)
  - [ ] 3.1 Open app/globals.css
  - [ ] 3.2 Add `:root` selector with CSS variables for Daybreak colors
  - [ ] 3.3 Add CSS variables for semantic colors
  - [ ] 3.4 Add CSS variables for typography (font families)
  - [ ] 3.5 Add CSS variables for spacing scale
  - [ ] 3.6 Add CSS variables for border radius
  - [ ] 3.7 Verify `var(--daybreak-teal)` works in inline styles

- [ ] Task 4: Configure shadcn/ui components.json with Daybreak theme
  - [ ] 4.1 Update components.json theme.cssVariables with Daybreak colors
  - [ ] 4.2 Map primary color to daybreak-teal
  - [ ] 4.3 Map destructive color to error
  - [ ] 4.4 Configure radius values
  - [ ] 4.5 Verify theme configuration is valid

- [ ] Task 5: Install base shadcn/ui components
  - [ ] 5.1 Install Button: `pnpm dlx shadcn@latest add button`
  - [ ] 5.2 Install Input: `pnpm dlx shadcn@latest add input`
  - [ ] 5.3 Install Card: `pnpm dlx shadcn@latest add card`
  - [ ] 5.4 Install Label: `pnpm dlx shadcn@latest add label`
  - [ ] 5.5 Install Textarea: `pnpm dlx shadcn@latest add textarea`
  - [ ] 5.6 Install Select: `pnpm dlx shadcn@latest add select`
  - [ ] 5.7 Install Checkbox: `pnpm dlx shadcn@latest add checkbox`
  - [ ] 5.8 Verify components render with Daybreak theme

- [ ] Task 6: Create design token documentation
  - [ ] 6.1 Create `docs/design-tokens.md`
  - [ ] 6.2 Document color palette with hex values and usage guidelines
  - [ ] 6.3 Document typography scale (font families, weights, sizes)
  - [ ] 6.4 Document spacing scale with examples
  - [ ] 6.5 Document border radius tokens
  - [ ] 6.6 Include visual examples for each token category

- [ ] Task 7: Verify accessibility compliance (AC: 7)
  - [ ] 7.1 Test daybreak-teal (#2A9D8F) on cream (#FEF7ED) background - verify WCAG AA for large text
  - [ ] 7.2 Test deep-text (#1A3C34) on cream (#FEF7ED) background - verify WCAG AA for body text
  - [ ] 7.3 Test warm-orange (#E9A23B) on cream (#FEF7ED) background - verify contrast
  - [ ] 7.4 Test error (#E85D5D) on cream (#FEF7ED) background - verify contrast
  - [ ] 7.5 Run Lighthouse accessibility audit
  - [ ] 7.6 Document any contrast issues and remediation in design-tokens.md

- [ ] Task 8: Create theme preview page for validation
  - [ ] 8.1 Create app/theme-preview/page.tsx
  - [ ] 8.2 Display all color tokens with backgrounds and text
  - [ ] 8.3 Display typography scale with Fraunces and Inter
  - [ ] 8.4 Display spacing scale examples
  - [ ] 8.5 Display border radius examples
  - [ ] 8.6 Display shadcn/ui components with Daybreak theme
  - [ ] 8.7 Verify all tokens render correctly on localhost:3000/theme-preview

## Dev Notes

### Architecture Alignment

This story implements the "Design System" section from the Architecture document and Tech Spec Epic 1:

**Design Token Contract (from Tech Spec):**

```css
/* Daybreak Color Tokens */
--daybreak-teal: #2A9D8F;
--teal-light: #3DBCB0;
--warm-orange: #E9A23B;
--cream: #FEF7ED;
--deep-text: #1A3C34;

/* Semantic Colors */
--success: #10B981;
--warning: #F59E0B;
--error: #E85D5D;
--info: #3B82F6;

/* Typography */
--font-fraunces: 'Fraunces', serif;
--font-inter: 'Inter', sans-serif;

/* Spacing (4px base) */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
```

**Font Configuration:**
- Use `next/font/google` for both Fraunces and Inter
- Set `display: 'swap'` to prevent FOUT and layout shift
- Fraunces: Heading font (serif) - weights 400, 600, 700
- Inter: Body font (sans-serif) - weights 400, 500, 600, 700

**Tailwind CSS 4.0 Configuration:**
- CSS-first configuration approach (Tailwind v4 paradigm)
- Extend default theme with Daybreak tokens
- Use semantic color naming for maintainability

**shadcn/ui Integration:**
- New York style (configured in Story 1.1)
- Customize components.json with Daybreak theme
- Map shadcn semantic colors to Daybreak palette

### Color Contrast Requirements (WCAG AA)

From Architecture Section "Accessibility":
- Normal text (< 18px): 4.5:1 contrast ratio minimum
- Large text (≥ 18px or bold ≥ 14px): 3:1 contrast ratio minimum

**Expected Combinations:**
| Foreground | Background | Use Case | Expected Ratio |
|------------|------------|----------|----------------|
| deep-text (#1A3C34) | cream (#FEF7ED) | Body text | ≥ 4.5:1 ✓ |
| daybreak-teal (#2A9D8F) | cream (#FEF7ED) | Headings, large text | ≥ 3:1 ✓ |
| warm-orange (#E9A23B) | cream (#FEF7ED) | Accents | ≥ 3:1 ✓ |
| error (#E85D5D) | cream (#FEF7ED) | Error messages | ≥ 4.5:1 (verify) |

Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) or Lighthouse audit to verify.

### File Locations

Per Architecture "Project Structure":
- Font configuration: `app/layout.tsx`
- Tailwind config: `tailwind.config.ts` (root)
- Global styles: `app/globals.css`
- shadcn config: `components.json` (root)
- UI components: `components/ui/*`
- Documentation: `docs/design-tokens.md`

### Dependencies

**Depends on:** Story 1.1 (project must be initialized first)

**Blocks:**
- Story 1.3 (layout components need design tokens)
- All future UI development

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Story-1.2]
- [Source: docs/architecture.md#Design-System]
- [Source: docs/prd.md#Design-Requirements]
- [Tailwind CSS 4.0 Docs](https://tailwindcss.com/docs)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- [next/font Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-11-29 | Story drafted from tech spec and epics | SM Agent (Bob) |
