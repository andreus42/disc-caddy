import {
  useNavigation,
  type NavigationProp,
} from '@react-navigation/native';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackButton, HistoryRow } from '../components';
import { groupByDay } from '../lib/dates';
import { useAppState } from '../state/AppContext';
import { colors, fonts, spacing, textGlow } from '../theme';
import type { HistoryRecord } from '../types';
import type { RootStackParamList } from '../nav/types';
import { Screen } from './layout/Screen';

export type ScorecardsScreenProps = {
  history: HistoryRecord[];
  onBack: () => void;
  onOpen: (historyId: string) => void;
};

/** Scorecards history list (spec §5.7). */
export function ScorecardsScreen({
  history,
  onBack,
  onOpen,
}: ScorecardsScreenProps) {
  const groups = useMemo(() => groupByDay(history), [history]);

  return (
    <Screen
      topBar={
        <>
          <BackButton label="Menu" onPress={onBack} />
          <Text style={styles.topTitle}>Scorecards</Text>
          <View style={{ width: 80 }} />
        </>
      }
    >
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.count, textGlow()]}>{history.length}</Text>
          <Text style={styles.caption}>
            {history.length === 1 ? 'round played' : 'rounds played'}
          </Text>
        </View>

        {history.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No rounds yet.</Text>
            <Text style={styles.emptySub}>
              Finish a round to see it appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.groups}>
            {groups.map((g) => (
              <View key={g.key} style={styles.group}>
                <Text style={styles.groupLabel}>{g.label}</Text>
                <View style={styles.groupItems}>
                  {g.items.map((r) => (
                    <HistoryRow
                      key={r.id}
                      record={r}
                      onOpen={() => onOpen(r.id)}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

/** Route wrapper. */
export function ScorecardsRoute() {
  const navigation =
    useNavigation<NavigationProp<RootStackParamList>>();
  const app = useAppState();
  return (
    <ScorecardsScreen
      history={app.history}
      onBack={() => navigation.goBack()}
      onOpen={(historyId) => navigation.navigate('viewCard', { historyId })}
    />
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
  count: {
    fontFamily: fonts.bold,
    fontSize: 60,
    color: colors.amber,
    letterSpacing: -2,
  },
  caption: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.amberDim,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  groups: {
    gap: spacing.xl,
  },
  group: {
    gap: spacing.md,
  },
  groupLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.amberDim,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingLeft: 4,
  },
  groupItems: {
    gap: spacing.md,
  },
  empty: {
    paddingVertical: 60,
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
  },
});
