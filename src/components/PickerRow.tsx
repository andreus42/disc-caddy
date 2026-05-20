import { Picker } from '@react-native-picker/picker';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { border, colors, fonts, radius } from '../theme';

export type PickerOption = {
  label: string;
  value: string;
};

type Props = {
  /** Label on the left (e.g. "PLAYER", "COURSE"). */
  label: string;
  /** Currently selected value. */
  value: string;
  options: PickerOption[];
  onChange: (next: string) => void;
};

/**
 * PickerRow (spec §4.8). Labeled select styled as a pill — label on the
 * left, native picker fills the rest, custom cyan caret on the right.
 *
 * The cross-platform `@react-native-picker/picker` renders a modal/wheel
 * on iOS and a dropdown on Android. We inherit the dark scheme via
 * `dropdownIconColor` and item style.
 */
export function PickerRow({ label, value, options, onChange }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={value}
          onValueChange={(v) => onChange(String(v))}
          dropdownIconColor={colors.cyan}
          mode="dropdown"
          style={styles.picker}
          itemStyle={styles.item}
        >
          {options.map((o) => (
            <Picker.Item
              key={o.value}
              label={o.label}
              value={o.value}
              color={Platform.OS === 'ios' ? colors.amber : undefined}
            />
          ))}
        </Picker>
      </View>
      <Text style={styles.caret}>{'›'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.round,
    borderWidth: border.stepper,
    borderColor: colors.cyanFaint,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.amberDim,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  pickerWrap: {
    flex: 1,
  },
  picker: {
    color: colors.amber,
    // Android needs a height to render; iOS handles it via wheel modal
    height: Platform.OS === 'android' ? 48 : undefined,
    backgroundColor: 'transparent',
  },
  item: {
    color: colors.amber,
    fontFamily: fonts.bold,
  },
  caret: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.cyan,
    transform: [{ rotate: '90deg' }],
  },
});
