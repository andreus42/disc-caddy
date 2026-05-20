import type { Course, HistoryRecord, Player } from '../types';
import { makeId } from './id';
import { deriveInitials } from './initials';

/**
 * Pine Ridge — the on-first-boot course (spec §8). 18 holes, mixed par 3–5,
 * total par 62. Exact pars chosen to feel like a real wooded course (mostly
 * par 3 with a couple of par 4/5 features).
 */
export function pineRidge(): Course {
  const pars = [3, 4, 3, 5, 3, 3, 4, 3, 3, 3, 4, 3, 5, 3, 4, 3, 3, 3];
  return {
    id: 'course_pine_ridge',
    name: 'Pine Ridge',
    tees: 'Blue',
    holes: pars.map((par, i) => ({ hole: i + 1, par, dist: 0 })),
  };
}

/** Default roster on first boot so screens aren't empty. */
export function defaultPlayers(): Player[] {
  return [
    { id: 'player_alex', name: 'Alex', initials: deriveInitials('Alex') },
    { id: 'player_sam', name: 'Sam', initials: deriveInitials('Sam') },
  ];
}

/**
 * Deterministic-ish per-player score for a hole: par +/- a small offset
 * based on player + hole index. Keeps the sample data realistic without
 * needing randomness (handy for tests later).
 */
function seedStroke(playerIdx: number, holeIdx: number, par: number): number {
  // simple drift pattern: alternates birdie / par / bogey / par / double
  const pattern = [-1, 0, 1, 0, 2, 0, -1, 1, 0];
  const offset = pattern[(playerIdx * 3 + holeIdx) % pattern.length];
  return Math.max(1, par + offset);
}

/**
 * Build 6 plausible historical rounds across the last few weeks so the
 * Statistics and Scorecards screens have data on first boot (spec §8).
 */
export function sampleHistory(course: Course, players: Player[]): HistoryRecord[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const offsets = [0, 1, 3, 7, 14, 21]; // days ago

  return offsets.map((daysAgo, roundIdx) => {
    const date = new Date(now - daysAgo * dayMs);
    // spread rounds across different times of day
    date.setHours(9 + ((roundIdx * 3) % 9), 30, 0, 0);

    const playerScores: HistoryRecord['playerScores'] = {};
    for (let pIdx = 0; pIdx < players.length; pIdx++) {
      const p = players[pIdx];
      playerScores[p.id] = course.holes.map((h, hIdx) =>
        seedStroke(pIdx + roundIdx, hIdx, h.par),
      );
    }

    return {
      id: makeId('round'),
      courseId: course.id,
      courseName: course.name,
      date: date.toISOString(),
      players: players.map((p) => ({ ...p })),
      playerScores,
    };
  });
}

/** Complete first-boot bundle: roster, courses, active course, history. */
export function firstBootSeed(): {
  players: Player[];
  courses: Course[];
  activeCourseId: string;
  history: HistoryRecord[];
} {
  const players = defaultPlayers();
  const course = pineRidge();
  return {
    players,
    courses: [course],
    activeCourseId: course.id,
    history: sampleHistory(course, players),
  };
}
