import type { TextStyle } from 'react-native';
import { colors } from './colors';

/**
 * Font family names — these match the keys exported by
 * `@expo-google-fonts/quicksand` (loaded in `useFonts`).
 */
export const fonts = {
  medium: 'Quicksand_500Medium',
  semibold: 'Quicksand_600SemiBold',
  bold: 'Quicksand_700Bold',
} as const;

/**
 * Typography presets from spec §2.2.
 *
 * Sizes are picked from the middle of each range; specific screens may
 * override `fontSize` while keeping the family/weight/letterSpacing.
 */
export const type = {
  /** Giant hole numerals, count badges. 60–110px, weight 700, tight tracking. */
  displayNumeral: {
    fontFamily: fonts.bold,
    fontSize: 110,
    color: colors.amber,
    letterSpacing: -2,
  } satisfies TextStyle,

  /** UPPERCASE section titles. 18–20px, +2 tracking. */
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.amber,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  } satisfies TextStyle,

  /** Body / button labels. 17–22px, +0.2–0.5 tracking. */
  body: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.amber,
    letterSpacing: 0.3,
  } satisfies TextStyle,

  /** UPPERCASE captions / metadata. 10–13px, weight 600, +1–1.8 tracking. */
  caption: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.amberDim,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  } satisfies TextStyle,
} as const;

export type TypePreset = keyof typeof type;
