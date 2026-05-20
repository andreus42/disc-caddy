import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  BackButton,
  HoleAvgChart,
  LegendChip,
  PickerRow,
  StatChip,
  type PickerOption,
} from '../components';
import { holeAverages, roundsFor, summary } from '../lib/stats';
import { toParString } from '../lib/scoring';
import { useAppState } from '../state/AppContext';
import { colors, fonts, spacing, textGlow } from '../theme';
import { Screen } from './layout/Screen';

/** Statistics screen (spec §5.6). */
export function StatsScreen() {
  const navigation = useNavigation();
  const app = useAppState();

  const playerOptions: PickerOption[] = app.players.map((p) => ({
    label: p.name,
    value: p.id,
  }));
  const courseOptions: PickerOption[] = app.courses.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  const [playerId, setPlayerId] = useState<string>(
    app.players[0]?.id ?? '',
  );
  const [courseId, setCourseId] = useState<string>(
    app.activeCourseId ?? app.courses[0]?.id ?? '',
  );

  const player = app.players.find((p) => p.id === playerId);
  const course = app.courses.find((c) => c.id === courseId);

  const rounds = useMemo(
    () =>
      course && player
        ? roundsFor(app.history, player.id, course.id)
        : [],
    [app.history, course, player],
  );

  const averages = useMemo(
    () =>
      course && player
        ? holeAverages(rounds, player.id, course.holes.length)
        : [],
    [rounds, course, player],
  );

  const s = useMemo(
    () =>
      course && player
        ? summary(rounds, course, player.id)
        : { n: 0, avgRound: null, avgToPar: null, best: null },
    [rounds, course, player],
  );

  const empty = rounds.length === 0;

  return (
    <Screen
      topBar={
        <>
          <BackButton label="Menu" onPress={() => navigation.goBack()} />
          <Text style={styles.topTitle}>Statistics</Text>
          <View style={{ width: 80 }} />
        </>
      }
    >
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerCap}>AVG STROKES BY HOLE</Text>
          <Text style={[styles.headerName, textGlow()]} numberOfLines={1}>
            {player?.name ?? '—'}
          </Text>
        </View>

        <View style={styles.pickers}>
          <PickerRow
            label="PLAYER"
            value={playerId}
            options={playerOptions}
            onChange={setPlayerId}
          />
          <PickerRow
            label="COURSE"
            value={courseId}
            options={courseOptions}
            onChange={setCourseId}
          />
        </View>

        <View style={styles.chips}>
          <StatChip label="ROUNDS" value={String(s.n)} />
          <StatChip
            label="AVG"
            value={s.avgRound != null ? s.avgRound.toFixed(1) : '—'}
          />
          <StatChip
            label="vs PAR"
            value={s.avgToPar != null ? toParString(Math.round(s.avgToPar)) : '—'}
          />
          <StatChip
            label="BEST"
            value={s.best != null ? String(s.best) : '—'}
          />
        </View>

        {empty || !course ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No rounds yet.</Text>
            <Text style={styles.emptySub}>
              Finish a round on this course to see averages.
            </Text>
          </View>
        ) : (
          <HoleAvgChart course={course} averages={averages} />
        )}

        <View style={styles.legend}>
          <LegendChip label="PAR LINE" color={colors.amber} line />
          <LegendChip label="EAGLE+" color={colors.toneBlue} />
          <LegendChip label="BIRDIE" color={colors.toneGreen} />
          <LegendChip label="PAR" color={colors.toneAmber} />
          <LegendChip label="BOGEY" color={colors.toneOrange} />
          <LegendChip label="DOUBLE+" color={colors.toneRed} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.amber,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: 4,
  },
  headerCap: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.amberDim,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  headerName: {
    fontFamily: fonts.bold,
    fontSize: 38,
    color: colors.amber,
    letterSpacing: -1,
    textAlign: 'center',
  },
  pickers: {
    gap: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  empty: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.amberDim,
    letterSpacing: 0.5,
  },
  emptySub: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.amberFaint,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
});
