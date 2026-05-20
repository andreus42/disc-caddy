import { Pressable, StyleSheet, Text, View } from 'react-native';
import { clampStrokes } from '../lib/round';
import { toneFill } from '../lib/scoring';
import { colors, fonts, spacing } from '../theme';
import { Stepper } from './Stepper';

type Props = {
  /** Player display name; ellipsized at one line. */
  name: string;
  /** Stroke count for this hole, or null if unset. */
  strokes: number | null;
  /** Par for the hole — used to tone the score. */
  par: number;
  onChange: (next: number | null) => void;
};

/**
 * PlayerRow (spec §4.11). One row per active player on the Hole screen.
 *
 * - Stepper buttons clamp strokes to 1..15.
 * - Tapping the value toggles between unset (`—`) and par.
 * - Score numeral is tinted by tone (§6) when set.
 */
export function PlayerRow({ name, strokes, par, onChange }: Props) {
  const fill = strokes != null ? toneFill(strokes, par) : null;

  const onDec = () => {
    if (strokes == null) return onChange(clampStrokes(par - 1));
    onChange(clampStrokes(strokes - 1));
  };
  const onInc = () => {
    if (strokes == null) return onChange(clampStrokes(par + 1));
    onChange(clampStrokes(strokes + 1));
  };

  const onToggle = () => {
    if (strokes == null) onChange(clampStrokes(par));
    else onChange(null);
  };

  return (
    <View style={styles.row}>
      <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
        {name}
      </Text>
      <View style={styles.right}>
        <Stepper
          glyph="−"
          onPress={onDec}
          disabled={strokes != null && strokes <= 1}
          accessibilityLabel={`Decrease ${name}'s strokes`}
        />
        <Pressable
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityLabel={`Toggle ${name}'s score`}
          hitSlop={6}
          style={({ pressed }) => [styles.value, pressed && styles.valuePressed]}
        >
          <Text
            style={[
              styles.valueText,
              { color: fill?.bg ?? colors.amberFaint },
            ]}
          >
            {strokes == null ? '—' : String(strokes)}
          </Text>
        </Pressable>
        <Stepper
          glyph="+"
          onPress={onInc}
          disabled={strokes != null && strokes >= 15}
          accessibilityLabel={`Increase ${name}'s strokes`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  name: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.amber,
    letterSpacing: 0.3,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  value: {
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valuePressed: {
    opacity: 0.6,
  },
  valueText: {
    fontFamily: fonts.bold,
    fontSize: 34,
    lineHeight: 36,
  },
});
