import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackButton, LegendChip, ScoreGrid } from '../components';
import { useAppState } from '../state/AppContext';
import { colors, fonts, spacing, textGlow } from '../theme';
import type { Course } from '../types';
import type { RootStackParamList } from '../nav/types';
import { Screen } from './layout/Screen';

/**
 * Round view (spec §5.8). Read-only variant of Finish — same grid, date
 * label as headline, course name as subtitle, back to Scorecards.
 */
export function ViewCardScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'viewCard'>>();
  const app = useAppState();

  const record = app.history.find((r) => r.id === route.params.historyId);

  if (!record) {
    return (
      <Screen
        topBar={
          <>
            <BackButton label="Scorecards" onPress={() => navigation.goBack()} />
            <View style={{ width: 60 }} />
          </>
        }
      >
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Round not found.</Text>
        </View>
      </Screen>
    );
  }

  const course: Course =
    app.courses.find((c) => c.id === record.courseId) ?? {
      id: record.courseId,
      name: record.courseName,
      tees: '',
      holes: Array.from(
        { length: record.playerScores[record.players[0]?.id]?.length ?? 0 },
        (_, i) => ({ hole: i + 1, par: 3, dist: 0 }),
      ),
    };

  const dateLabel = formatDateHeadline(record.date);

  return (
    <Screen
      topBar={
        <>
          <BackButton label="Scorecards" onPress={() => navigation.goBack()} />
          <Text style={styles.topTitle}>Round</Text>
          <View style={{ width: 80 }} />
        </>
      }
    >
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.headline, textGlow()]}>{dateLabel}</Text>
          <Text style={styles.course} numberOfLines={1}>
            {record.courseName}
            {course.tees ? ` · ${course.tees}` : ''}
          </Text>
        </View>

        <ScoreGrid
          course={course}
          players={record.players}
          scores={record.playerScores}
        />

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

/** Date headline like "MAY 19, 2026" (matches spec §5.7's group label style). */
function formatDateHeadline(iso: string): string {
  const d = new Date(iso);
  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
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
    fontSize: 28,
    color: colors.amber,
    letterSpacing: 2,
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
