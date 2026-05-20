import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { HomeButton } from '../components';
import { newRound } from '../lib/round';
import { useAppState } from '../state/AppContext';
import type { RootStackParamList } from '../nav/types';
import { colors, fonts, spacing, textGlow, type } from '../theme';

export type HomeScreenProps = {
  /** Total saved courses. */
  courseCount: number;
  /** Total players in roster. */
  playerCount: number;
  /** Whether a round is in progress (has any score or holeIndex > 0). */
  inProgress: boolean;
  /** 1-based hole number to show in the Resume label when inProgress. */
  resumeHole: number;
  /** Disable New Round when there's no active course or no players. */
  canStartRound: boolean;

  onPlayers: () => void;
  onCourses: () => void;
  onNewRound: () => void;
  onStats: () => void;
  onScorecards: () => void;
  onResume: () => void;
};

/**
 * Home screen (spec §5.1). Pure props-driven view — the Route wrapper below
 * pulls state out of context.
 */
export function HomeScreen({
  inProgress,
  resumeHole,
  canStartRound,
  onPlayers,
  onCourses,
  onNewRound,
  onStats,
  onScorecards,
  onResume,
}: HomeScreenProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, textGlow()]}>Disc Caddie</Text>
        <Text style={styles.version}>version 1.0.0</Text>
      </View>

      <View style={styles.stack}>
        <HomeButton label="Players" onPress={onPlayers} />
        <HomeButton label="Courses" onPress={onCourses} />
        <HomeButton
          label="New Round"
          onPress={onNewRound}
          disabled={!canStartRound}
        />
        <HomeButton label="Statistics" onPress={onStats} />
        <HomeButton label="Scorecards" onPress={onScorecards} />
        <HomeButton
          label={inProgress ? `Resume · H${resumeHole}` : 'Resume'}
          onPress={onResume}
          disabled={!inProgress}
        />
      </View>
    </ScrollView>
  );
}

/** Route wrapper: pulls live state out of context, hands props to HomeScreen. */
export function HomeRoute() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const app = useAppState();

  const activeCourse =
    app.courses.find((c) => c.id === app.activeCourseId) ?? null;
  const canStartRound = activeCourse != null && app.players.length > 0;

  const round = app.round;
  const hasScored =
    round != null &&
    Object.values(round.scores).some((arr) => arr.some((v) => v != null));
  const inProgress = round != null && (round.holeIndex > 0 || hasScored);
  const resumeHole = round != null ? round.holeIndex + 1 : 1;

  return (
    <HomeScreen
      courseCount={app.courses.length}
      playerCount={app.players.length}
      inProgress={inProgress}
      resumeHole={resumeHole}
      canStartRound={canStartRound}
      onPlayers={() => navigation.navigate('players')}
      onCourses={() => navigation.navigate('courses')}
      onStats={() => navigation.navigate('stats')}
      onScorecards={() => navigation.navigate('scorecards')}
      onNewRound={() => {
        if (!activeCourse) return;
        app.setRound(newRound(activeCourse, app.players));
        navigation.navigate('hole');
      }}
      onResume={() => navigation.navigate('hole')}
    />
  );
}

const styles = StyleSheet.create({
  body: {
    flexGrow: 1,
    paddingTop: 40,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: 6,
  },
  title: {
    ...type.displayNumeral,
    fontSize: 52,
    color: colors.amber,
  },
  version: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.amberDim,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  stack: {
    gap: 12,
  },
});
