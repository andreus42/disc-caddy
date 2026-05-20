import { StyleSheet, Text, View } from 'react-native';
import { border, colors, fonts, radius } from '../theme';

type Props = {
  /** Tiny caption — e.g. "PAR", "FT". */
  label: string;
  /** Bigger amber value — e.g. "3", "320". */
  value: string;
};

/**
 * MetaPill (spec §4.6). Compact info pill with a caption above the value.
 * 8x18 padding, 1.5px cyan border, label 11/600 dim, value 22/700 amber.
 */
export function MetaPill({ label, value }: Props) {
  return (
    <View style={styles.pill}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: radius.round,
    borderWidth: border.stepper,
    borderColor: colors.cyan,
    alignItems: 'center',
    gap: 1,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.amberDim,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.amber,
    lineHeight: 24,
  },
});
