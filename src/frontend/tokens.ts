/**
 * Global Design Token Primitives & UI Architecture
 *
 * This module exports the token contracts and harmonized component classes
 * mapped directly to the CSS variables in `src/index.css`.
 * 
 * Always reference these tokens when building new views, components, or features.
 */

export const TOKENS = {
  // Surfaces
  canvas: "var(--canvas-bg)",
  surfaceBase: "var(--surface-base)",
  surfaceCard: "var(--surface-card)",
  surfaceCardHover: "var(--surface-card-hover)",
  surfaceElevated: "var(--surface-elevated)",
  surfaceModal: "var(--surface-modal)",

  // Translucent Glass
  glassFillSubtle: "var(--glass-fill-subtle)",
  glassFill: "var(--glass-fill)",
  glassFillHover: "var(--glass-fill-hover)",
  glassFillActive: "var(--glass-fill-active)",

  // Borders
  borderSubtle: "var(--border-subtle)",
  borderDefault: "var(--border-default)",
  borderHover: "var(--border-hover)",
  borderFocus: "var(--border-focus)",
  borderAccent: "var(--border-accent)",

  // Brand Accent (Emerald Spark)
  accent: "var(--accent)",
  accentHover: "var(--accent-hover)",
  accentDim: "var(--accent-dim)",
  accentGlow: "var(--accent-glow)",
  accentFg: "var(--accent-fg)",

  // Typography
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  textDim: "var(--text-dim)",
  textAccent: "var(--text-accent)",

  // Radii
  radiusXs: "var(--radius-xs)",
  radiusSm: "var(--radius-sm)",
  radiusMd: "var(--radius-md)",
  radiusLg: "var(--radius-lg)",
  radiusXl: "var(--radius-xl)",
  radius2xl: "var(--radius-2xl)",
  radius3xl: "var(--radius-3xl)",
  radiusFull: "var(--radius-full)",
} as const;

/**
 * Harmonized CSS utility classes ready for direct JSX use.
 */
export const UI_CLASSES = {
  // Buttons
  btnIcon: "btn-glass-icon",
  btnPill: "btn-glass-pill",
  btnAccentCircle: "btn-accent-circle",
  btnAccentPill: "btn-accent-pill",

  // Cards & Containers
  cardCapsule: "card-capsule",
  cardPanel: "card-panel",
  popoverGlass: "popover-glass",

  // Badges
  badgeGlass: "badge-glass",
  badgeAccent: "badge-glass badge-glass-accent",
} as const;
