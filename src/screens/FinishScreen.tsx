import {
  useNavigation,
  useRoute,
  type NavigationProp,
  type RouteProp,
} from '@react-navigation/native';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LegendChip, ScoreGrid } from '../components';
import { newRound } from '../lib/round';
import { useAppState } from '../state/AppContext';
import {
  border,
  colors,
  fonts,
  radius,
  sizing,
  spacing,
  textGlow,
} from '../theme';
import type { Course, HistoryRecord, Player } from '../types';
import type { RootStackParamList } from '../nav/types';
import { Screen } from './layout/Screen';

export type FinishScreenProps = {
  course: Course;
  players: Player[];
  scores: HistoryRecord['playerScores'];
  /** True if every player has a score on every hole. */
  allScored: boolean;
  onEditScores: () => void;
  onDone: () => void;
};

/** Finish screen (spec §5.9). */
export function FinishScreen({
  course,
  players,
  scores,
  allScored,
  onEditScores,
  onDone,
}: FinishScreenProps) {
  return (
    <Screen
      bottomBar={
        <>
          <Pressable
            onPress={onEditScores}
            accessibilityRole="button"
            accessibilityLabel="Edit scores"
            style={({ pressed }) => [
              btnStyles.ghost,
              pressed && btnStyles.ghostPressed,
            ]}
          >
            <Text style={btnStyles.ghostLabel}>Edit Scores</Text>
          </Pressable>
          <Pressable
            onPress={onDone}
            accessibilityRole="button"
            accessibilityLabel="Done"
            style={({ pressed }) => [
              btnStyles.done,
              pressed && btnStyles.donePressed,
            ]}
          >
            <Text style={btnStyles.doneLabel}>Done</Text>
          </Pressable>
        </>
      }
    >
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.headline, textGlow()]}>
            {allScored ? 'FINAL' : 'SCORECARD'}
          </Text>
          <Text style={styles.subhead}>Round Results</Text>
          <Text style={styles.course} numberOfLines={1}>
            {course.name}
            {course.tees ? ` · ${course.tees}` : ''}
          </Text>
        </View>

        <ScoreGrid course={course} players={players} scores={scores} />

        <View style={styles.legend}>
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

/** Route wrapper. */
export function FinishRoute() {
  const navigation =
    useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'finish'>>();
  const app = useAppState();

  const record = app.history.find((r) => r.id === route.params.historyId);

  if (!record) {
    return (
      <Screen>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Round not found.</Text>
        </View>
      </Screen>
    );
  }

  const course =
    app.courses.find((c) => c.id === record.courseId) ?? {
      // Fallback: synthesize a course from the record's hole count if the
      // original course was deleted after the round was saved.
      id: record.courseId,
      name: record.courseName,
      tees: '',
      holes: Array.from(
        { length: record.playerScores[record.players[0]?.id]?.length ?? 0 },
        (_, i) => ({ hole: i + 1, par: 3, dist: 0 }),
      ),
    };

  // "All scored" check on this record.
  const allScored = course.holes.every((_, i) =>
    record.players.every((p) => record.playerScores[p.id]?.[i] != null),
  );

  return (
    <FinishScreen
      course={course}
      players={record.players}
      scores={record.playerScores}
      allScored={allScored}
      onEditScores={() => {
        // Re-hydrate the round from this record and go back to Hole entry.
        // (Spec §5.9: "Edit Scores (back to hole)".)
        const fresh = newRound(course, record.players);
        // Restore scores from the snapshot
        const scoresCopy: Record<string, Array<number | null>> = {};
        for (const p of record.players) {
          scoresCopy[p.id] = (record.playerScores[p.id] ?? []).slice();
        }
        app.setRound({ holeIndex: 0, scores: scoresCopy });
        // We are leaving this record behind in history (it stays as a
        // snapshot). The next Finish will produce a new record.
        navigation.reset({
          index: 0,
          routes: [{ name: 'hole' }],
        });
        // Also keep the original players in app state so the Hole screen sees them.
        app.setPlayers(record.players);
        // ignore unused local
        void fresh;
      }}
      onDone={() => {
        navigation.reset({ index: 0, routes: [{ name: 'home' }] });
      }}
    />
  );
}

// ------------------------------------------------------------------------

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: 4,
  },
  headline: {
    fontFamily: fonts.bold,
    fontSize: 38,
    color: colors.amber,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subhead: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.amberDim,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  course: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.amber,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
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

const btnStyles = StyleSheet.create({
  ghost: {
    flex: 1,
    height: sizing.pill,
    borderRadius: radius.pill,
    borderWidth: border.pill,
    borderColor: colors.cyanFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostPressed: {
    backgroundColor: 'rgba(31,200,224,0.08)',
  },
  ghostLabel: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.amberDim,
    letterSpacing: 0.5,
  },
  done: {
    flex: 1,
    height: sizing.pill,
    borderRadius: radius.pill,
    borderWidth: border.pill,
    borderColor: colors.amber,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donePressed: {
    opacity: 0.85,
  },
  doneLabel: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.inkOnFill,
    letterSpacing: 0.5,
  },
});
