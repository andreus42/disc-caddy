import type { Course, HistoryRecord, Player } from '../../types';
import { holeAverages, roundsFor, summary } from '../stats';

const course: Course = {
  id: 'c1',
  name: 'Test',
  tees: '',
  holes: [
    { hole: 1, par: 3, dist: 0 },
    { hole: 2, par: 4, dist: 0 },
    { hole: 3, par: 5, dist: 0 },
  ],
};

const alice: Player = { id: 'p1', name: 'Alice', initials: 'A' };
const bob: Player = { id: 'p2', name: 'Bob', initials: 'B' };

function rec(scores: Record<string, Array<number | null>>): HistoryRecord {
  return {
    id: 'r' + Math.random(),
    courseId: course.id,
    courseName: course.name,
    date: new Date().toISOString(),
    players: [alice, bob],
    playerScores: scores,
  };
}

describe('roundsFor (spec §9.6)', () => {
  it('filters by courseId and presence of playerScores key', () => {
    const history: HistoryRecord[] = [
      rec({ p1: [3, 4, 5], p2: [3, 4, 5] }),
      // Round on a different course — should be filtered out
      {
        ...rec({ p1: [3, 4, 5], p2: [3, 4, 5] }),
        courseId: 'other',
      },
    ];
    expect(roundsFor(history, 'p1', course.id)).toHaveLength(1);
    expect(roundsFor(history, 'p3', course.id)).toHaveLength(0); // unknown player
  });
});

describe('holeAverages (spec §9.6)', () => {
  it('returns null for holes with no values', () => {
    const history = [rec({ p1: [null, null, null], p2: [3, 4, 5] })];
    const avgs = holeAverages(history, 'p1', course.holes.length);
    expect(avgs.every((a) => a.avg === null)).toBe(true);
  });

  it('averages multiple rounds', () => {
    const history = [
      rec({ p1: [3, 5, 5], p2: [3, 4, 5] }),
      rec({ p1: [4, 4, 6], p2: [3, 4, 5] }),
    ];
    const avgs = holeAverages(history, 'p1', course.holes.length);
    expect(avgs[0].avg).toBe(3.5);
    expect(avgs[1].avg).toBe(4.5);
    expect(avgs[2].avg).toBe(5.5);
  });
});

describe('summary (spec §9.6)', () => {
  it('returns zeros / nulls for an empty roster', () => {
    const s = summary([], course, 'p1');
    expect(s).toEqual({ n: 0, avgRound: null, avgToPar: null, best: null });
  });

  it('computes avgRound, avgToPar, and best correctly', () => {
    const rounds = [
      rec({ p1: [3, 4, 5], p2: [3, 4, 5] }), // total 12 (par 12, ±0)
      rec({ p1: [4, 5, 6], p2: [3, 4, 5] }), // total 15 (par 12, +3)
    ];
    const s = summary(rounds, course, 'p1');
    expect(s.n).toBe(2);
    // avgRound = (12 + 15) / (3+3) * 3 = 27 / 6 * 3 = 13.5
    expect(s.avgRound).toBeCloseTo(13.5);
    // avgToPar = ((12-12) + (15-12)) / 2 = 1.5
    expect(s.avgToPar).toBeCloseTo(1.5);
    expect(s.best).toBe(12);
  });

  it('excludes incomplete rounds from `best`', () => {
    const rounds = [
      rec({ p1: [3, null, 5], p2: [3, 4, 5] }), // not "every hole"
      rec({ p1: [4, 5, 6], p2: [3, 4, 5] }),
    ];
    const s = summary(rounds, course, 'p1');
    expect(s.best).toBe(15); // only the complete round counts
  });
});
