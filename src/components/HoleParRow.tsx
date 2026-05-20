import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '../theme';
import { Stepper } from './Stepper';

type Props = {
  /** 1-based hole number. */
  holeNumber: number;
  /** Par value, clamped 2..7 by the parent on change. */
  par: number;
  onChange: (nextPar: number) => void;
};

const MIN_PAR = 2;
const MAX_PAR = 7;

/**
 * HoleParRow (spec §4.10). Course-editor row:
 * - Left: hole label "H 1"
 * - Middle: small caption "PAR"
 * - Right: stepper-value-stepper triple with value 34/700 amber
 * Par clamped to 2..7.
 */
export function HoleParRow({ holeNumber, par, onChange }: Props) {
  const dec = () => onChange(Math.max(MIN_PAR, par - 1));
  const inc = () => onChange(Math.min(MAX_PAR, par + 1));

  return (
    <View style={styles.row}>
      <Text style={styles.holeLabel}>{`H ${holeNumber}`}</Text>
      <View style={styles.right}>
        <Text style={styles.parCaption}>PAR</Text>
        <Stepper
          glyph="−"
          onPress={dec}
          disabled={par <= MIN_PAR}
          accessibilityLabel={`Decrease par for hole ${holeNumber}`}
        />
        <Text style={styles.parValue}>{par}</Text>
        <Stepper
          glyph="+"
          onPress={inc}
          disabled={par >= MAX_PAR}
          accessibilityLabel={`Increase par for hole ${holeNumber}`}
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
    paddingVertical: spacing.sm,
  },
  holeLabel: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.amber,
    minWidth: 56,
    letterSpacing: 0.5,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  parCaption: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.amberDim,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  parValue: {
    fontFamily: fonts.bold,
    fontSize: 34,
    color: colors.amber,
    minWidth: 32,
    textAlign: 'center',
  },
});
