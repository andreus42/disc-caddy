import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatTimeOfDay } from '../lib/dates';
import { border, colors, fonts, radius, spacing } from '../theme';
import type { HistoryRecord } from '../types';

type Props = {
  record: HistoryRecord;
  onOpen: () => void;
};

/**
 * HistoryRow (spec §4.12). Card with course name + time + chevron on row 1,
 * per-player name+total chips on row 2; the leader's chip uses amber chrome.
 */
export function HistoryRow({ record, onOpen }: Props) {
  const { totals, leaderIds } = useMemo(() => {
    const totals: Record<string, number | null> = {};
    for (const p of record.players) {
      const arr = record.playerScores[p.id] ?? [];
      let sum = 0;
      let any = false;
      for (const v of arr) {
        if (v == null) continue;
        sum += v;
        any = true;
      }
      totals[p.id] = any ? sum : null;
    }
    let best: number | null = null;
    let leaderIds: string[] = [];
    for (const p of record.players) {
      const t = totals[p.id];
      if (t == null) continue;
      if (best == null || t < best) {
        best = t;
        leaderIds = [p.id];
      } else if (t === best) {
        leaderIds.push(p.id);
      }
    }
    return { totals, leaderIds };
  }, [record]);

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Open round ${record.courseName} at ${formatTimeOfDay(record.date)}`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={1}>
          {record.courseName}
        </Text>
        <Text style={styles.time}>{formatTimeOfDay(record.date)}</Text>
        <Text style={styles.chevron}>{'›'}</Text>
      </View>
      <View style={styles.chipsRow}>
        {record.players.map((p) => {
          const isLeader = leaderIds.includes(p.id);
          return (
            <View
              key={p.id}
              style={[styles.chip, isLeader && styles.chipLeader]}
            >
              <Text
                style={[styles.chipName, isLeader && styles.chipNameLeader]}
                numberOfLines={1}
              >
                {p.initials || p.name.slice(0, 2).toUpperCase()}
              </Text>
              <Text
                style={[styles.chipTotal, isLeader && styles.chipTotalLeader]}
              >
                {totals[p.id] != null ? totals[p.id] : '—'}
              </Text>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.card,
    borderWidth: border.card,
    borderColor: colors.cyanFaint,
    gap: spacing.md,
  },
  cardPressed: {
    backgroundColor: 'rgba(31,200,224,0.05)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.amber,
  },
  time: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.amberDim,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  chevron: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.cyan,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.cyanFaint,
  },
  chipLeader: {
    borderColor: colors.amber,
    backgroundColor: 'rgba(255,160,0,0.08)',
  },
  chipName: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.amberDim,
    letterSpacing: 0.5,
  },
  chipNameLeader: {
    color: colors.amber,
  },
  chipTotal: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.amber,
  },
  chipTotalLeader: {
    color: colors.amber,
  },
});
