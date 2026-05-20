import type { Course, HistoryRecord, Player, Round } from '../types';
import { makeId } from './id';

/** Strokes are integers clamped to 1..15 per spec §7 / §9.4. */
export function clampStrokes(n: number): number {
  if (!Number.isFinite(n)) return 1;
  const i = Math.round(n);
  if (i < 1) return 1;
  if (i > 15) return 15;
  return i;
}

/**
 * Build a fresh `Round` for the given course + roster (spec §9.1):
 * every player gets a `null`-filled array of length `course.holes.length`.
 */
export function newRound(course: Course, players: Player[]): Round {
  const scores: Round['scores'] = {};
  for (const p of players) {
    scores[p.id] = new Array(course.holes.length).fill(null);
  }
  return { holeIndex: 0, scores };
}

/**
 * Auto-fill any `null` score for the given hole with that hole's par (spec
 * §9.4). Idempotent: already-entered scores are not touched.
 *
 * Returns a new Round if any score changed, otherwise the same reference so
 * React effects can bail out cheaply.
 */
export function autoFillParForHole(
  round: Round,
  course: Course,
  holeIndex: number,
): Round {
  const hole = course.holes[holeIndex];
  if (!hole) return round;

  let changed = false;
  const next: Round['scores'] = {};
  for (const [playerId, perHole] of Object.entries(round.scores)) {
    if (perHole[holeIndex] == null) {
      const copy = perHole.slice();
      copy[holeIndex] = clampStrokes(hole.par);
      next[playerId] = copy;
      changed = true;
    } else {
      next[playerId] = perHole;
    }
  }

  return changed ? { ...round, scores: next } : round;
}

/**
 * Snapshot a finished (or in-progress) round into a `HistoryRecord`
 * (spec §9.5). The player roster is snapshotted by value so future edits
 * to the live roster don't mutate historical names.
 *
 * Each player's score array is normalized to length `course.holes.length`
 * with trailing `null`s if shorter, and truncated if longer.
 */
export function recordRound(
  course: Course,
  players: Player[],
  round: Round,
): HistoryRecord {
  const holeCount = course.holes.length;
  const playerScores: HistoryRecord['playerScores'] = {};
  for (const p of players) {
    const src = round.scores[p.id] ?? [];
    const arr: Array<number | null> = new Array(holeCount).fill(null);
    for (let i = 0; i < holeCount; i++) {
      const v = src[i];
      arr[i] = v == null ? null : clampStrokes(v);
    }
    playerScores[p.id] = arr;
  }

  return {
    id: makeId('round'),
    courseId: course.id,
    courseName: course.name,
    date: new Date().toISOString(),
    players: players.map((p) => ({ ...p })),
    playerScores,
  };
}

/** Reset the in-progress round in place (spec §9.2). */
export function resetRound(round: Round): Round {
  const scores: Round['scores'] = {};
  for (const [playerId, perHole] of Object.entries(round.scores)) {
    scores[playerId] = new Array(perHole.length).fill(null);
  }
  return { holeIndex: 0, scores };
}
