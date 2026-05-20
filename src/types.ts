/**
 * Data model from spec §7. Ids are opaque strings (slugs or random),
 * not enforced via brand types — kept simple for v1.
 */
export type ID = string;

export type Player = {
  /** Stable across rounds (slug or random). */
  id: ID;
  name: string;
  /** Derived from name; recompute on save. */
  initials: string;
};

export type Hole = {
  /** 1-based. */
  hole: number;
  /** Clamped 2..7. */
  par: number;
  /** Feet; 0 if unknown. */
  dist: number;
};

export type Course = {
  id: ID;
  /** Required, trimmed, max 28 chars. */
  name: string;
  /** Optional label (e.g. "Blue"), max 12 chars. */
  tees: string;
  /** 1..27 entries. */
  holes: Hole[];
};

export type Round = {
  /** 0-based current hole. */
  holeIndex: number;
  /** playerId -> per-hole strokes; null = not entered yet. */
  scores: Record<ID, Array<number | null>>;
};

export type HistoryRecord = {
  /** Generated on save. */
  id: ID;
  courseId: ID;
  /** Snapshotted name at save time. */
  courseName: string;
  /** ISO timestamp. */
  date: string;
  /** Snapshot of who played. */
  players: Player[];
  playerScores: Record<ID, Array<number | null>>;
};
