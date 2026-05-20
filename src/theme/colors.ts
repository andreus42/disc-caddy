/**
 * Design palette from spec §2.1.
 *
 * Everything lives on pure black. Amber is the primary content tone; cyan is
 * the structural/border tone. Score tones are used as both foregrounds (hole
 * entry numerals) and as backgrounds (finish grid, stats bars).
 */
export const colors = {
  bg: '#000000',

  // Primary content
  amber: '#FFA000',
  amberDim: 'rgba(255,160,0,0.55)',
  amberFaint: 'rgba(255,160,0,0.28)',

  // Structural
  cyan: '#1FC8E0',
  cyanFaint: 'rgba(31,200,224,0.22)',

  // Score tones
  toneBlue: '#1FC8E0', // great: Eagle / Ace
  toneGreen: '#3FD17A', // good:  Birdie
  toneAmber: '#FFA000', // par:   Par
  toneOrange: '#FF8A1A', // bad:   Bogey
  toneRed: '#B8281F', // worse: Double bogey or worse

  // Foreground on filled tone cells
  inkOnFill: '#0A0A0A',
  inkOnRed: '#FFFFFF',
} as const;

export type ColorToken = keyof typeof colors;
