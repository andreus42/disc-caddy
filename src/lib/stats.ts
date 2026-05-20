import type { Course, HistoryRecord, ID } from '../types';

/** Filter the history to rounds matching (player, course) — spec §9.6. */
export function roundsFor(
  history: HistoryRecord[],
  playerId: ID,
  courseId: ID,
): HistoryRecord[] {
  return history.filter(
    (r) => r.courseId === courseId && r.playerScores[playerId] != null,
  );
}

/**
 * Per-hole averages. For each hole index, `avg` is `null` if no round has a
 * score for that hole, otherwise the mean of non-null strokes for that hole.
 */
export function holeAverages(
  rounds: HistoryRecord[],
  playerId: ID,
  holeCount: number,
): Array<{ avg: number | null; count: number }> {
  const result: Array<{ avg: number | null; count: number }> = [];
  for (let i = 0; i < holeCount; i++) {
    let sum = 0;
    let count = 0;
    for (const r of rounds) {
      const v = r.playerScores[playerId]?.[i];
      if (v == null) continue;
      sum += v;
      count++;
    }
    result.push(count === 0 ? { avg: null, count: 0 } : { avg: sum / count, count });
  }
  return result;
}

/**
 * Summary chips for the Stats screen header (spec §9.6).
 *
 * - `n`: number of rounds for (player, course)
 * - `avgRound`: total-strokes / total-holes-scored × course-hole-count
 * - `avgToPar`: average per-round (strokes − par)
 * - `best`: lowest stroke total among rounds with a value on every hole
 */
export function summary(
  rounds: HistoryRecord[],
  course: Course,
  playerId: ID,
): {
  n: number;
  avgRound: number | null;
  avgToPar: number | null;
  best: number | null;
} {
  const n = rounds.length;
  if (n === 0) return { n, avgRound: null, avgToPar: null, best: null };

  let totalStrokes = 0;
  let totalHolesScored = 0;
  const toParDeltas: number[] = [];
  let best: number | null = null;

  const holeCount = course.holes.length;

  for (const r of rounds) {
    const arr = r.playerScores[playerId] ?? [];
    let roundStrokes = 0;
    let roundPar = 0;
    let scoredInRound = 0;
    let everyHole = true;
    for (let i = 0; i < holeCount; i++) {
      const v = arr[i];
      if (v == null) {
        everyHole = false;
        continue;
      }
      roundStrokes += v;
      roundPar += course.holes[i].par;
      scoredInRound++;
    }
    totalStrokes += roundStrokes;
    totalHolesScored += scoredInRound;
    if (scoredInRound > 0) {
      toParDeltas.push(roundStrokes - roundPar);
    }
    if (everyHole && scoredInRound === holeCount) {
      if (best == null || roundStrokes < best) best = roundStrokes;
    }
  }

  const avgRound =
    totalHolesScored > 0
      ? (totalStrokes / totalHolesScored) * holeCount
      : null;
  const avgToPar =
    toParDeltas.length > 0
      ? toParDeltas.reduce((s, d) => s + d, 0) / toParDeltas.length
      : null;

  return { n, avgRound, avgToPar, best };
}
