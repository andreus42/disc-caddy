import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

type Props = {
  total: number;
  /** 0-based index of the current hole. */
  current: number;
};

/**
 * HoleStrip (spec §5.2). Row of N ticks below the hole header:
 * current is amber and wider, past are cyan, future are cyanFaint.
 *
 * Transition timing per spec §10 is intentionally minimal; we use plain
 * static styles here and rely on RN's view-prop diff for the snap. A
 * subtle width animation would be added in the §10 polish pass.
 */
export function HoleStrip({ total, current }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, i) => {
        const isCurrent = i === current;
        const isPast = i < current;
        return (
          <View
            key={i}
            style={[
              styles.tick,
              isCurrent && styles.tickCurrent,
              isPast && styles.tickPast,
              !isCurrent && !isPast && styles.tickFuture,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
  },
  tick: {
    height: 3,
    width: 8,
    borderRadius: 1.5,
  },
  tickCurrent: {
    backgroundColor: colors.amber,
    width: 16,
  },
  tickPast: {
    backgroundColor: colors.cyan,
  },
  tickFuture: {
    backgroundColor: colors.cyanFaint,
  },
});
