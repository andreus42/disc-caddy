import { useEffect } from 'react';
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';
import { useReduceMotion } from '../lib/useReduceMotion';
import { colors } from '../theme';

// One-time enablement of LayoutAnimation on Android (no-op on iOS).
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  total: number;
  /** 0-based index of the current hole. */
  current: number;
};

/**
 * HoleStrip (spec §5.2). Row of N ticks below the hole header:
 * current is amber and wider, past are cyan, future are cyanFaint.
 *
 * A 0.2s LayoutAnimation eases the current-tick width change when `current`
 * changes — gated on `useReduceMotion()` per spec §10.
 */
export function HoleStrip({ total, current }: Props) {
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) return;
    LayoutAnimation.configureNext({
      duration: 200,
      update: { type: 'easeInEaseOut', property: 'scaleXY' },
    });
  }, [current, reduceMotion]);

  return (
    <View style={styles.row} accessibilityLabel={`Hole ${current + 1} of ${total}`}>
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
