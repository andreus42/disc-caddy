import { Pressable, StyleSheet, Text } from 'react-native';
import { border, colors, fonts, sizing } from '../theme';

type Props = {
  /** `+` or `−` (or any single glyph). */
  glyph: '+' | '−' | string;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

/**
 * Stepper (spec §4.4). Round 42x42 increment/decrement button.
 * 1.5px cyan border, transparent fill, amber glyph. Pressed: cyan tint bg.
 * Disabled: cyanFaint border + amberFaint glyph.
 */
export function Stepper({
  glyph,
  onPress,
  disabled = false,
  accessibilityLabel,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={accessibilityLabel ?? glyph}
      // Already 42 — give a tiny hitSlop to comfortably hit 44pt minimum.
      hitSlop={4}
      style={({ pressed }) => [
        styles.btn,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.glyph, disabled && styles.glyphDisabled]}>
        {glyph}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: sizing.stepper,
    height: sizing.stepper,
    borderRadius: sizing.stepper / 2,
    borderWidth: border.stepper,
    borderColor: colors.cyan,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    borderColor: colors.cyanFaint,
  },
  pressed: {
    backgroundColor: 'rgba(31,200,224,0.12)',
  },
  glyph: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.amber,
    lineHeight: 24,
  },
  glyphDisabled: {
    color: colors.amberFaint,
  },
});
