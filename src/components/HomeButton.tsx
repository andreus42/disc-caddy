import { Pressable, StyleSheet, Text } from 'react-native';
import { border, colors, fonts, radius, sizing } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

/**
 * HomeButton (spec §4.2). Full-width primary nav pill, 100% width, 56pt
 * height, 28pt radius, 2px cyan border. Disabled: cyanFaint border,
 * amberDim text.
 */
export function HomeButton({ label, onPress, disabled = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.btn,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: '100%',
    height: sizing.pill,
    borderRadius: radius.pill,
    borderWidth: border.pill,
    borderColor: colors.cyan,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    borderColor: colors.cyanFaint,
  },
  pressed: {
    backgroundColor: 'rgba(31,200,224,0.08)',
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.amber,
    letterSpacing: 0.5,
  },
  labelDisabled: {
    color: colors.amberDim,
  },
});
