import { Pressable, StyleSheet, Text } from 'react-native';
import { border, colors, fonts, radius } from '../theme';

type Props = {
  /** Label shown to the right of the chevron (e.g. "Menu", "Courses"). */
  label: string;
  onPress: () => void;
};

/**
 * BackButton (spec §4.1). Pill in the top bar that returns to the previous
 * screen. `‹` glyph + label, 1.5px cyan border, padding 8x14, font 13/700.
 */
export function BackButton({ label, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Back to ${label}`}
      // ensure ≥ 44pt tap target around the 32pt min-height
      hitSlop={8}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
    >
      <Text style={styles.glyph}>{'‹'}</Text>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.round,
    borderWidth: border.stepper,
    borderColor: colors.cyan,
    backgroundColor: 'transparent',
    minHeight: 32,
  },
  pressed: {
    backgroundColor: 'rgba(31,200,224,0.12)',
  },
  glyph: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.amber,
    lineHeight: 16,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.amber,
  },
});
