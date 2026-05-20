import { Pressable, StyleSheet, Text } from 'react-native';
import { border, colors, fonts, sizing } from '../theme';

type Props = {
  dir: 'left' | 'right';
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

/**
 * NavBtn (spec §4.5). Round 42x42 chevron used to flip holes from the hole
 * header. Same chrome as Stepper, glyph is `‹` or `›`.
 */
export function NavBtn({
  dir,
  onPress,
  disabled = false,
  accessibilityLabel,
}: Props) {
  const glyph = dir === 'left' ? '‹' : '›';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={
        accessibilityLabel ?? (dir === 'left' ? 'Previous' : 'Next')
      }
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
    fontSize: 26,
    color: colors.amber,
    lineHeight: 28,
  },
  glyphDisabled: {
    color: colors.amberFaint,
  },
});
