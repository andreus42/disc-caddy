import { StyleSheet, Text, View } from 'react-native';
import { border, colors, fonts, radius } from '../theme';

type Props = {
  label: string;
  value: string;
};

/**
 * StatChip (spec §4.7). Square-ish chip used on the Statistics summary row.
 * 1.5px cyan border, 12pt radius, label 9/700 dim + value 20/700 amber,
 * flex-grow to fill the row.
 */
export function StatChip({ label, value }: Props) {
  return (
    <View style={styles.chip}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radius.chip,
    borderWidth: border.stepper,
    borderColor: colors.cyan,
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: colors.amberDim,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.amber,
  },
});
