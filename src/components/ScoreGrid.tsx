import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { toneFill } from '../lib/scoring';
import { colors, fonts } from '../theme';
import type { Course, ID, Player } from '../types';

type Props = {
  course: Course;
  players: Player[];
  scores: Record<ID, Array<number | null>>;
};

const HOLE_COL_WIDTH = 44;
const PLAYER_COL_WIDTH = 84;
const ROW_HEIGHT = 40;

/**
 * Shared score grid used by Finish and Round-view screens (spec §5.8, §5.9,
 * §4.13). Columns = hole-label + one per player. Tone-tinted cells with
 * black or white ink per §6.2; unscored cells show a dashed `–`.
 * Leader name gets a green ★; totals + to-par row at the bottom.
 */
export function ScoreGrid({ course, players, scores }: Props) {
  const { totals, toPars, leaderIds, allScored } = useMemo(
    () => computeTotals(course, players, scores),
    [course, players, scores],
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        {/* Header row: empty corner + player names */}
        <View style={[styles.row, styles.headerRow]}>
          <View style={[styles.cell, styles.holeCell, styles.headerCell]} />
          {players.map((p) => (
            <View
              key={p.id}
              style={[styles.cell, styles.playerCell, styles.headerCell]}
            >
              <View style={styles.nameWrap}>
                {leaderIds.includes(p.id) ? (
                  <Text style={styles.leaderStar}>★</Text>
                ) : null}
                <Text
                  style={styles.playerName}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {p.name}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* One row per hole */}
        {course.holes.map((h, hIdx) => (
          <View key={hIdx} style={styles.row}>
            <View style={[styles.cell, styles.holeCell]}>
              <Text style={styles.holeNum}>{h.hole}</Text>
              <Text style={styles.holePar}>{h.par}</Text>
            </View>
            {players.map((p) => {
              const v = scores[p.id]?.[hIdx];
              if (v == null) {
                return (
                  <View
                    key={p.id}
                    style={[styles.cell, styles.playerCell, styles.cellEmpty]}
                  >
                    <Text style={styles.emptyDash}>–</Text>
                  </View>
                );
              }
              const fill = toneFill(v, h.par);
              return (
                <View
                  key={p.id}
                  style={[
                    styles.cell,
                    styles.playerCell,
                    { backgroundColor: fill.bg },
                  ]}
                >
                  <Text style={[styles.cellValue, { color: fill.fg }]}>{v}</Text>
                </View>
              );
            })}
          </View>
        ))}

        {/* Totals row */}
        <View style={[styles.row, styles.totalsRow]}>
          <View style={[styles.cell, styles.holeCell]}>
            <Text style={styles.totalsLabel}>TOT</Text>
          </View>
          {players.map((p) => (
            <View
              key={p.id}
              style={[styles.cell, styles.playerCell, styles.totalsCell]}
            >
              <Text style={styles.totalsValue}>
                {totals[p.id] != null ? totals[p.id] : '—'}
              </Text>
              <Text style={styles.totalsToPar}>{toPars[p.id]}</Text>
            </View>
          ))}
        </View>

        {/* Status line above the grid is owned by the screen; "FINAL/SCORECARD"
            comes from there. We just expose whether everything is scored. */}
        <View style={styles.statusLine}>
          <Text style={styles.statusText}>
            {allScored ? 'ALL HOLES SCORED' : 'PARTIAL ROUND'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

/** Compute per-player totals, to-par, and leader id(s). */
function computeTotals(
  course: Course,
  players: Player[],
  scores: Record<ID, Array<number | null>>,
): {
  totals: Record<ID, number | null>;
  toPars: Record<ID, string>;
  leaderIds: ID[];
  allScored: boolean;
} {
  const totals: Record<ID, number | null> = {};
  const toPars: Record<ID, string> = {};
  let allScored = true;

  for (const p of players) {
    const arr = scores[p.id] ?? [];
    let strokeSum = 0;
    let parSum = 0;
    let any = false;
    let missing = false;
    for (let i = 0; i < course.holes.length; i++) {
      const v = arr[i];
      if (v == null) {
        missing = true;
        continue;
      }
      strokeSum += v;
      parSum += course.holes[i].par;
      any = true;
    }
    if (missing) allScored = false;
    if (!any) {
      totals[p.id] = null;
      toPars[p.id] = '';
    } else {
      totals[p.id] = strokeSum;
      const d = strokeSum - parSum;
      toPars[p.id] = d === 0 ? 'E' : d > 0 ? `+${d}` : `${d}`;
    }
  }

  // Leader = min(totals) among players with a non-null total.
  let leaderIds: ID[] = [];
  let best: number | null = null;
  for (const p of players) {
    const t = totals[p.id];
    if (t == null) continue;
    if (best == null || t < best) {
      best = t;
      leaderIds = [p.id];
    } else if (t === best) {
      leaderIds.push(p.id);
    }
  }
  // No leader if only one player has scored (mark the round but not "leader")
  // — keep it: spec just says "leader gets star".

  return { totals, toPars, leaderIds, allScored };
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    minHeight: ROW_HEIGHT,
  },
  cell: {
    minHeight: ROW_HEIGHT,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  holeCell: {
    width: HOLE_COL_WIDTH,
    backgroundColor: 'transparent',
    borderRightColor: colors.cyanFaint,
  },
  playerCell: {
    width: PLAYER_COL_WIDTH,
  },
  headerRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.cyanFaint,
  },
  headerCell: {
    backgroundColor: 'transparent',
  },
  nameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  playerName: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.amber,
    letterSpacing: 0.5,
  },
  leaderStar: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.toneGreen,
  },
  holeNum: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.amber,
    lineHeight: 16,
  },
  holePar: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: colors.amberDim,
    letterSpacing: 1,
  },
  cellEmpty: {
    backgroundColor: 'transparent',
  },
  emptyDash: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.amberFaint,
  },
  cellValue: {
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  totalsRow: {
    borderTopWidth: 1,
    borderTopColor: colors.cyanFaint,
  },
  totalsCell: {
    backgroundColor: 'transparent',
  },
  totalsLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.amberDim,
    letterSpacing: 1.5,
  },
  totalsValue: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.amber,
  },
  totalsToPar: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: colors.amberDim,
    letterSpacing: 1.2,
  },
  statusLine: {
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: 'center',
  },
  statusText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: colors.amberDim,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
