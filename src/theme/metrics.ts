/**
 * Shape, radius, spacing metrics from spec §2.3 and §3.
 *
 * The 30/54 safe-area numbers from §3 are minimums; production should use
 * `useSafeAreaInsets()` and Math.max them against these.
 */
export const radius = {
  card: 14,
  pill: 28, // primary pills (height 56)
  round: 999, // small pills, chips, top-bar buttons
  chip: 12, // StatChip squares
} as const;

export const border = {
  hairline: 1,
  card: 1.5,
  pill: 2,
  stepper: 1.5,
  chip: 1,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 30,
} as const;

export const sizing = {
  /** Primary pill height (HomeButton, NavPill). */
  pill: 56,
  /** Small pill / chip height (BackButton, MetaPill). */
  pillSm: 36,
  /** Round 42 stepper / nav button diameter. */
  stepper: 42,
  /** Minimum tap target per spec §10. */
  tap: 44,
} as const;

export const safeArea = {
  /** Top reserved for status bar (spec §3). */
  top: 54,
  /** Bottom safe-area (spec §3). */
  bottom: 30,
} as const;

export const motion = {
  /** Default transition for the hole-strip indicator (spec §10). */
  holeStripMs: 200,
} as const;
