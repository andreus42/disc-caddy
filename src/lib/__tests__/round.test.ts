import type { Course, Player, Round } from '../../types';
import {
  autoFillParForHole,
  clampStrokes,
  newRound,
  recordRound,
  resetRound,
} from '../round';

function makeCourse(holeCount = 9): Course {
  return {
    id: 'course_a',
    name: 'Test Course',
    tees: 'Blue',
    holes: Array.from({ length: holeCount }, (_, i) => ({
      hole: i + 1,
      par: 3 + (i % 3), // 3, 4, 5, 3, 4, 5, ...
      dist: 0,
    })),
  };
}

const players: Player[] = [
  { id: 'p1', name: 'Alice', initials: 'A' },
  { id: 'p2', name: 'Bob', initials: 'B' },
];

describe('clampStrokes', () => {
  it('clamps to 1..15', () => {
    expect(clampStrokes(0)).toBe(1);
    expect(clampStrokes(-3)).toBe(1);
    expect(clampStrokes(16)).toBe(15);
    expect(clampStrokes(3)).toBe(3);
  });
  it('rounds non-integers', () => {
    expect(clampStrokes(3.4)).toBe(3);
    expect(clampStrokes(3.6)).toBe(4);
  });
  it('returns 1 for NaN', () => {
    expect(clampStrokes(NaN)).toBe(1);
  });
});

describe('newRound (spec §9.1)', () => {
  it('builds a null-filled per-player array of length = holeCount', () => {
    const course = makeCourse(9);
    const r = newRound(course, players);
    expect(r.holeIndex).toBe(0);
    expect(r.scores.p1).toHaveLength(9);
    expect(r.scores.p2).toHaveLength(9);
    expect(r.scores.p1.every((v) => v == null)).toBe(true);
  });
});

describe('autoFillParForHole (spec §9.4)', () => {
  it('fills null entries with that hole\'s par', () => {
    const course = makeCourse(9);
    const r = newRound(course, players);
    const next = autoFillParForHole(r, course, 0); // hole 1, par 3
    expect(next.scores.p1[0]).toBe(3);
    expect(next.scores.p2[0]).toBe(3);
    // Other holes still null
    expect(next.scores.p1[1]).toBeNull();
  });

  it('does not touch already-entered scores', () => {
    const course = makeCourse(9);
    let r = newRound(course, players);
    r = { ...r, scores: { ...r.scores, p1: [5, ...r.scores.p1.slice(1)] } };
    const next = autoFillParForHole(r, course, 0);
    expect(next.scores.p1[0]).toBe(5); // unchanged
    expect(next.scores.p2[0]).toBe(3); // null → par
  });

  it('is idempotent (calling twice == once)', () => {
    const course = makeCourse(9);
    const r = newRound(course, players);
    const once = autoFillParForHole(r, course, 0);
    const twice = autoFillParForHole(once, course, 0);
    // Same scores
    expect(twice.scores.p1[0]).toBe(once.scores.p1[0]);
    expect(twice.scores.p2[0]).toBe(once.scores.p2[0]);
    // And the second call returns the same reference (no-op)
    expect(twice).toBe(once);
  });

  it('is a no-op if holeIndex is out of range', () => {
    const course = makeCourse(3);
    const r = newRound(course, players);
    const next = autoFillParForHole(r, course, 99);
    expect(next).toBe(r);
  });
});

describe('recordRound (spec §9.5, §11)', () => {
  it('produces playerScores arrays whose length equals course.holes.length', () => {
    const course = makeCourse(18);
    const r = newRound(course, players);
    const rec = recordRound(course, players, r);
    for (const p of players) {
      expect(rec.playerScores[p.id]).toHaveLength(course.holes.length);
    }
  });

  it('preserves entered scores and clamps them', () => {
    const course = makeCourse(3);
    const r: Round = {
      holeIndex: 0,
      scores: {
        p1: [2, 99, null], // 99 → clamped to 15
        p2: [4, 5, 6],
      },
    };
    const rec = recordRound(course, players, r);
    expect(rec.playerScores.p1).toEqual([2, 15, null]);
    expect(rec.playerScores.p2).toEqual([4, 5, 6]);
  });

  it('snapshots the player roster by value', () => {
    const course = makeCourse(3);
    const r = newRound(course, players);
    const rec = recordRound(course, players, r);
    expect(rec.players).toEqual(players);
    expect(rec.players).not.toBe(players); // new array
    expect(rec.players[0]).not.toBe(players[0]); // new objects
  });

  it('captures the course name at save time', () => {
    const course = makeCourse(3);
    const r = newRound(course, players);
    const rec = recordRound(course, players, r);
    expect(rec.courseName).toBe(course.name);
    expect(rec.courseId).toBe(course.id);
  });
});

describe('resetRound (spec §9.2)', () => {
  it('clears scores and resets holeIndex but preserves player keys', () => {
    const course = makeCourse(9);
    let r = newRound(course, players);
    r = {
      holeIndex: 4,
      scores: { p1: r.scores.p1.map(() => 3), p2: r.scores.p2.map(() => 4) },
    };
    const cleared = resetRound(r);
    expect(cleared.holeIndex).toBe(0);
    expect(Object.keys(cleared.scores)).toEqual(['p1', 'p2']);
    expect(cleared.scores.p1.every((v) => v == null)).toBe(true);
    expect(cleared.scores.p1).toHaveLength(9);
  });
});
