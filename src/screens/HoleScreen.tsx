import {
  useNavigation,
  type NavigationProp,
} from '@react-navigation/native';
import { useEffect } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  BackButton,
  HoleStrip,
  MetaPill,
  NavBtn,
  NavPill,
  PlayerRow,
} from '../components';
import {
  autoFillParForHole,
  clampStrokes,
  recordRound,
  resetRound,
} from '../lib/round';
import { useAppState } from '../state/AppContext';
import { colors, fonts, spacing, textGlow } from '../theme';
import type { Course, Player, Round } from '../types';
import type { RootStackParamList } from '../nav/types';
import { Screen } from './layout/Screen';

export type HoleScreenProps = {
  course: Course;
  players: Player[];
  round: Round;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onBack: () => void;
  onSetScore: (playerId: string, strokes: number | null) => void;
  /** Called once when entering a hole to apply auto-par for null entries. */
  onAutoPar: () => void;
};

/** Hole entry screen (spec §5.2). */
export function HoleScreen({
  course,
  players,
  round,
  onPrev,
  onNext,
  onReset,
  onBack,
  onSetScore,
  onAutoPar,
}: HoleScreenProps) {
  const holeIndex = round.holeIndex;
  const total = course.holes.length;
  const hole = course.holes[holeIndex];
  const isFirst = holeIndex === 0;
  const isLast = holeIndex === total - 1;

  // Auto-par effect (spec §9.4). The underlying util is idempotent, so this
  // is safe to re-run on every render of a given hole — but we still gate on
  // [holeIndex, course.id] so we only fire once per hole entry.
  useEffect(() => {
    onAutoPar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holeIndex, course.id]);

  function confirmReset() {
    Alert.alert(
      'Reset round?',
      'All scores will be cleared and you’ll return to hole 1.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: onReset },
      ],
    );
  }

  return (
    <Screen
      topBar={
        <>
          <BackButton label="Menu" onPress={onBack} />
          <Text style={styles.topTitle} numberOfLines={1} ellipsizeMode="tail">
            {course.name}
            {course.tees ? ` · ${course.tees}` : ''}
          </Text>
          <Pressable
            onPress={confirmReset}
            accessibilityRole="button"
            accessibilityLabel="Reset round"
            hitSlop={8}
          >
            <Text style={styles.resetAction}>Reset</Text>
          </Pressable>
        </>
      }
      bottomBar={
        <>
          <NavPill
            label="Prev"
            dir="left"
            onPress={onPrev}
            disabled={isFirst}
          />
          {isLast ? (
            <NavPill label="Finish" highlight onPress={onNext} />
          ) : (
            <NavPill label="Next" dir="right" onPress={onNext} />
          )}
        </>
      }
    >
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.holeHeader}>
          <Text style={styles.caption}>HOLE</Text>
          <View style={styles.numberRow}>
            <NavBtn
              dir="left"
              onPress={onPrev}
              disabled={isFirst}
              accessibilityLabel="Previous hole"
            />
            <Text style={[styles.bigNumber, textGlow()]}>
              {String(holeIndex + 1).padStart(2, '0')}
            </Text>
            <NavBtn
              dir="right"
              onPress={onNext}
              accessibilityLabel={isLast ? 'Finish round' : 'Next hole'}
            />
          </View>
          <Text style={styles.caption}>of {total}</Text>

          <View style={styles.pills}>
            <MetaPill label="PAR" value={String(hole.par)} />
            <MetaPill label="FT" value={hole.dist > 0 ? String(hole.dist) : '—'} />
          </View>

          <HoleStrip total={total} current={holeIndex} />
        </View>

        <View style={styles.players}>
          {players.map((p, i) => (
            <View key={p.id}>
              <PlayerRow
                name={p.name}
                strokes={round.scores[p.id]?.[holeIndex] ?? null}
                par={hole.par}
                onChange={(next) => {
                  const clamped = next == null ? null : clampStrokes(next);
                  onSetScore(p.id, clamped);
                }}
              />
              {i < players.length - 1 ? (
                <View style={styles.divider} />
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

/** Route wrapper. */
export function HoleRoute() {
  const navigation =
    useNavigation<NavigationProp<RootStackParamList>>();
  const app = useAppState();

  const course = app.courses.find((c) => c.id === app.activeCourseId);
  const round = app.round;

  // Bail to home if either is missing (defensive — shouldn't happen if Home
  // gates New Round / Resume on canStartRound).
  if (!course || !round || app.players.length === 0) {
    return (
      <Screen topBar={<BackButton label="Menu" onPress={() => navigation.goBack()} />}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No active round.</Text>
        </View>
      </Screen>
    );
  }

  function finish() {
    if (!course || !round) return;
    const rec = recordRound(course, app.players, round);
    app.addHistory(rec);
    app.setRound(null);
    navigation.reset({
      index: 0,
      routes: [{ name: 'finish', params: { historyId: rec.id } }],
    });
  }

  return (
    <HoleScreen
      course={course}
      players={app.players}
      round={round}
      onBack={() => navigation.goBack()}
      onPrev={() => {
        if (round.holeIndex === 0) return;
        app.setRound({ ...round, holeIndex: round.holeIndex - 1 });
      }}
      onNext={() => {
        const last = course.holes.length - 1;
        if (round.holeIndex >= last) {
          finish();
          return;
        }
        app.setRound({ ...round, holeIndex: round.holeIndex + 1 });
      }}
      onReset={() => app.setRound(resetRound(round))}
      onSetScore={(playerId, strokes) => {
        const arr = round.scores[playerId]?.slice() ?? [];
        arr[round.holeIndex] = strokes;
        app.setRound({
          ...round,
          scores: { ...round.scores, [playerId]: arr },
        });
      }}
      onAutoPar={() => {
        const next = autoFillParForHole(round, course, round.holeIndex);
        if (next !== round) app.setRound(next);
      }}
    />
  );
}

// ------------------------------------------------------------------------

const styles = StyleSheet.create({
  topTitle: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.amber,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginHorizontal: 8,
  },
  resetAction: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.amberDim,
    letterSpacing: 0.5,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  holeHeader: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  caption: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.amberDim,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  bigNumber: {
    fontFamily: fonts.bold,
    fontSize: 110,
    color: colors.amber,
    letterSpacing: -2,
    lineHeight: 112,
    minWidth: 130,
    textAlign: 'center',
  },
  pills: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  players: {
    gap: 0,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cyanFaint,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.amberDim,
  },
});
