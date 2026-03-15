/**
 * Ishtile — Centralized Theme
 *
 * This is the single source of truth for the entire design system.
 * Analogous to Theme.kt + ColorScheme + Typography in Jetpack Compose.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  To change a color, radius, or font → edit ONLY this file.      │
 * │  Everything else (CSS vars, Tailwind, components) derives here. │
 * └──────────────────────────────────────────────────────────────────┘
 *
 * Flow:
 *   theme.ts ──► toCssVars() ──► <style> in layout.tsx
 *                                        │
 *                                 :root  { --var: value }
 *                                 .dark  { --var: value }
 *                                        │
 *                             globals.css + Tailwind + components
 *                             all read from CSS vars — never raw values
 */

// ─── Interfaces (like data classes in Kotlin) ─────────────────────────────────

export interface ColorScheme {
  // ── Brand anchors ────────────────────────────────────────────────────────
  /** Deep warm near-black. Primary surface in header, footer, badges. */
  brandDark: string;
  /** Warm gold. Sale prices, active outlines, accents. */
  brandGold: string;
  /** Slightly darker gold for hover states. */
  brandGoldHover: string;
  /** Deep gold for subtle pressed states. */
  brandGoldDeep: string;

  // ── Surfaces ─────────────────────────────────────────────────────────────
  /** Page background. */
  background: string;
  /** Card / sheet / elevated surface. */
  surface: string;
  /** Tinted warm surface — product card bg, input fills. */
  surfaceVariant: string;

  // ── Content on surfaces ───────────────────────────────────────────────────
  /** Primary text on background. */
  onBackground: string;
  /** Primary text on surface. */
  onSurface: string;
  /** Secondary / muted text. */
  onSurfaceMuted: string;
  /** Disabled text. */
  onSurfaceDisabled: string;

  // ── Primary action (maps to shadcn --primary) ─────────────────────────────
  /** Button fill, link colour. */
  primary: string;
  /** Text on primary-coloured surfaces. */
  onPrimary: string;

  // ── Accent (gold — used for highlights, sale prices) ─────────────────────
  accent: string;
  onAccent: string;

  // ── Component tokens ──────────────────────────────────────────────────────
  border: string;
  input: string;
  ring: string;

  // ── Semantic ──────────────────────────────────────────────────────────────
  destructive: string;
  onDestructive: string;
  /** Background for error / destructive state containers. */
  errorBg: string;
  /** Text/icon colour inside errorBg containers. */
  onError: string;
  /** Background for success / active state containers. */
  successBg: string;
  /** Text/icon colour inside successBg containers. */
  onSuccess: string;
  /** Background for warning / pending state containers. */
  warningBg: string;
  /** Text/icon colour inside warningBg containers. */
  onWarning: string;
  /** Background for info / in-progress state containers. */
  infoBg: string;
  /** Text/icon colour inside infoBg containers. */
  onInfo: string;

  // ── Product-specific ──────────────────────────────────────────────────────
  /** Warm neutral bg behind product images. */
  productBg: string;
}

export interface TypographyScheme {
  /** Base sans-serif stack. */
  fontSans: string;
  /** Wide tracking used on all section labels / nav items (like letterSpacing in Compose). */
  labelTracking: string;
  /** Tight tracking for heading text. */
  headingTracking: string;
}

export interface RadiusScheme {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

export interface Theme {
  colors: ColorScheme;
  typography: TypographyScheme;
  radius: RadiusScheme;
}

// ─── Light ColorScheme ────────────────────────────────────────────────────────

export const LightColorScheme: ColorScheme = {
  // Brand
  brandDark: '#263147',
  brandGold: '#919f90',
  brandGoldHover: '#728171',
  brandGoldDeep: '#536352',

  // Surfaces
  background: '#e8ebed',
  surface: '#f0f2f4',
  surfaceVariant: '#d8dbde',

  // Content
  onBackground: '#1C1A19',
  onSurface: '#1C1A19',
  onSurfaceMuted: '#737373',
  onSurfaceDisabled: '#A3A3A3',

  // Primary
  primary: '#1C1A19',
  onPrimary: '#e8ebed',

  // Accent
  accent: '#919f90',
  onAccent: '#e8ebed',

  // Components
  border: '#c8cdd2',
  input: '#c8cdd2',
  ring: '#919f90',

  // Semantic
  destructive: '#DC2626',
  onDestructive: '#e8ebed',
  errorBg: '#fee2e2',
  onError: '#991b1b',
  successBg: '#d1fae5',
  onSuccess: '#065f46',
  warningBg: '#fef3c7',
  onWarning: '#b45309',
  infoBg: '#e0e7ff',
  onInfo: '#3730a3',

  // Product
  productBg: '#dde0e3',
};

// ─── Dark ColorScheme ─────────────────────────────────────────────────────────

export const DarkColorScheme: ColorScheme = {
  // Brand
  brandDark: '#1C1A19',
  brandGold: '#C4A882',
  brandGoldHover: '#A58C69',
  brandGoldDeep: '#8F6F4A',

  // Surfaces
  background: '#111110',
  surface: '#1C1A19',
  surfaceVariant: '#2A2826',

  // Content
  onBackground: '#F5F0E8',
  onSurface: '#F5F0E8',
  onSurfaceMuted: '#A3A3A3',
  onSurfaceDisabled: '#525252',

  // Primary
  primary: '#F5F0E8',
  onPrimary: '#1C1A19',

  // Accent
  accent: '#C4A882',
  onAccent: '#1C1A19',

  // Components
  border: '#2E2C2A',
  input: '#2E2C2A',
  ring: '#C4A882',

  // Semantic
  destructive: '#EF4444',
  onDestructive: '#fff4ef',
  errorBg: '#450a0a',
  onError: '#fca5a5',
  successBg: '#052e16',
  onSuccess: '#6ee7b7',
  warningBg: '#451a03',
  onWarning: '#fde68a',
  infoBg: '#1e1b4b',
  onInfo: '#a5b4fc',

  // Product
  productBg: '#2A2826',
};

// ─── Typography (shared across themes) ───────────────────────────────────────

export const IshtileTypography: TypographyScheme = {
  fontSans: '"Geist", "Inter", system-ui, -apple-system, sans-serif',
  labelTracking: '0.18em',
  headingTracking: '-0.02em',
};

// ─── Radius (shared across themes) ───────────────────────────────────────────
// P&Co Sharp Design: All elements have sharp corners (no rounding)

export const IshtileRadius: RadiusScheme = {
  none: '0px',
  xs: '0px',
  sm: '0px',
  md: '0px',
  lg: '0px',
  xl: '0px',
  '2xl': '0px',
  '3xl': '0px',
  full: '0px',
};

// ─── Theme objects (analogous to lightColorScheme / darkColorScheme in Compose)

export const LightTheme: Theme = {
  colors: LightColorScheme,
  typography: IshtileTypography,
  radius: IshtileRadius,
};

export const DarkTheme: Theme = {
  colors: DarkColorScheme,
  typography: IshtileTypography,
  radius: IshtileRadius,
};

// ─── CSS variable compiler ────────────────────────────────────────────────────
// Converts a Theme object → flat { '--css-var': 'value' } map.
// Called by layout.tsx to inject <style> tags — never edited manually.

export function toCssVars(theme: Theme): Record<string, string> {
  const c = theme.colors;
  const t = theme.typography;
  const r = theme.radius;

  return {
    // ── Brand ──────────────────────────────────────────────────
    '--brand-dark': c.brandDark,
    '--brand-gold': c.brandGold,
    '--brand-gold-hover': c.brandGoldHover,
    '--brand-gold-deep': c.brandGoldDeep,

    // ── Surfaces ───────────────────────────────────────────────
    '--background': c.background,
    '--surface': c.surface,
    '--surface-variant': c.surfaceVariant,

    // ── Content ────────────────────────────────────────────────
    '--on-background': c.onBackground,
    '--on-surface': c.onSurface,
    '--on-surface-muted': c.onSurfaceMuted,
    '--on-surface-disabled': c.onSurfaceDisabled,

    // ── Primary ────────────────────────────────────────────────
    '--primary': c.primary,
    '--on-primary': c.onPrimary,

    // ── Accent ─────────────────────────────────────────────────
    '--accent': c.accent,
    '--on-accent': c.onAccent,

    // ── Components ─────────────────────────────────────────────
    '--border': c.border,
    '--input': c.input,
    '--ring': c.ring,

    // ── Semantic ───────────────────────────────────────────────
    '--destructive': c.destructive,
    '--on-destructive': c.onDestructive,
    '--error-bg': c.errorBg,
    '--on-error': c.onError,
    '--success-bg': c.successBg,
    '--on-success': c.onSuccess,
    '--warning-bg': c.warningBg,
    '--on-warning': c.onWarning,
    '--info-bg': c.infoBg,
    '--on-info': c.onInfo,

    // ── Product ────────────────────────────────────────────────
    '--product-bg': c.productBg,

    // ── Typography ─────────────────────────────────────────────
    '--font-sans': t.fontSans,
    '--label-tracking': t.labelTracking,
    '--heading-tracking': t.headingTracking,

    // ── Radius ─────────────────────────────────────────────────
    '--radius-none': r.none,
    '--radius-xs': r.xs,
    '--radius-sm': r.sm,
    '--radius-md': r.md,
    '--radius-lg': r.lg,
    '--radius-xl': r.xl,
    '--radius-2xl': r['2xl'],
    '--radius-3xl': r['3xl'],
    '--radius-full': r.full,

    // ── Shadcn token aliases ────────────────────────────────────
    // Shadcn components read these — we redirect them to our tokens.
    // Keys that are already defined above (--background, --primary, etc.)
    // are omitted here to avoid duplicate-key errors; they map to the same value.
    '--foreground': c.onBackground,
    '--card': c.surface,
    '--card-foreground': c.onSurface,
    '--popover': c.surface,
    '--popover-foreground': c.onSurface,
    '--primary-foreground': c.onPrimary,
    '--secondary': c.surfaceVariant,
    '--secondary-foreground': c.onSurface,
    '--muted': c.surfaceVariant,
    '--muted-foreground': c.onSurfaceMuted,
    '--accent-foreground': c.onAccent,

    // ── Shadcn radius alias ─────────────────────────────────────
    '--radius': r.md,
  };
}

/** Converts a CSS var map to a CSS block string. Used in layout.tsx. */
export function varsToCss(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
}
