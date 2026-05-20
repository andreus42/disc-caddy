import { StyleSheet, Text, View } from 'react-native';
import { border, colors, fonts, radius } from '../theme';

type Props = {
  /** UPPERCASE label, e.g. "EAGLE", "PAR LINE". */
  label: string;
  /** Swatch color. */
  color: string;
  /** If true, render a thin horizontal bar instead of a square (par line). */
  line?: boolean;
};

/**
 * LegendChip (spec §4.9). Color swatch + uppercase label.
 * 1px cyanFaint border, 999pt radius, 4x8 padding.
 * Swatch is 10x10 square by default, or a 14x2 bar when `line` is true.
 */
export function LegendChip({ label, color, line = false }: Props) {
  return (
    <View style={styles.chip}>
      <View
        style={
          line
            ? [styles.line, { backgroundColor: color }]
            : [styles.swatch, { backgroundColor: color }]
        }
      />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.round,
    borderWidth: border.chip,
    borderColor: colors.cyanFaint,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  line: {
    width: 14,
    height: 2,
    borderRadius: 1,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.amberDim,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
