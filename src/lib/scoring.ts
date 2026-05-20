import { colors } from '../theme/colors';

export type ToneBucket = 'great' | 'good' | 'par' | 'bad' | 'worse';

export type ScoreLabel =
  | 'ACE'
  | 'EAGLE'
  | 'BIRDIE'
  | 'PAR'
  | 'BOGEY'
  | 'DOUBLE'
  | 'TRIPLE'
  | `+${number}`;

/**
 * Map strokes vs par to a score label (spec §6.1). ACE wins over EAGLE
 * because the ACE row in the spec table comes first.
 */
export function scoreLabel(strokes: number, par: number): ScoreLabel {
  if (strokes === 1) return 'ACE';
  const d = strokes - par;
  if (d <= -2) return 'EAGLE';
  if (d === -1) return 'BIRDIE';
  if (d === 0) return 'PAR';
  if (d === 1) return 'BOGEY';
  if (d === 2) return 'DOUBLE';
  if (d === 3) return 'TRIPLE';
  return `+${d}` as ScoreLabel;
}

/** Map strokes vs par to a tone bucket (spec §6.1 right column). */
export function toneBucket(strokes: number, par: number): ToneBucket {
  if (strokes === 1) return 'great';
  const d = strokes - par;
  if (d <= -2) return 'great';
  if (d === -1) return 'good';
  if (d === 0) return 'par';
  if (d === 1) return 'bad';
  return 'worse';
}

/** Tone background color for a bucket. */
const bucketBg: Record<ToneBucket, string> = {
  great: colors.toneBlue,
  good: colors.toneGreen,
  par: colors.toneAmber,
  bad: colors.toneOrange,
  worse: colors.toneRed,
};

/**
 * Background + foreground colors for a score cell (spec §6.2).
 * Text is black on every tone except `toneRed`, which uses white for contrast.
 */
export function toneFill(
  strokes: number,
  par: number,
): { bg: string; fg: string; bucket: ToneBucket } {
  const bucket = toneBucket(strokes, par);
  const bg = bucketBg[bucket];
  const fg = bucket === 'worse' ? colors.inkOnRed : colors.inkOnFill;
  return { bg, fg, bucket };
}

/** Format a to-par delta for display (spec §6.3). */
export function toParString(n: number): string {
  if (n === 0) return 'E';
  if (n > 0) return `+${n}`;
  return `${n}`; // already has its minus sign
}
