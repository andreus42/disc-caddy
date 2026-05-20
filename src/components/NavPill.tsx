import { Pressable, StyleSheet, Text, View } from 'react-native';
import { border, colors, fonts, radius, sizing } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  /** Chevron side. Omit for no chevron. */
  dir?: 'left' | 'right';
  /** If true: inverts to amber fill + dark ink (used for Finish). */
  highlight?: boolean;
  disabled?: boolean;
};

/**
 * NavPill (spec §4.3). Bottom action pill used for Prev / Next / Finish.
 * Same metrics as HomeButton. Chevron on `dir` side.
 */
export function NavPill({
  label,
  onPress,
  dir,
  highlight = false,
  disabled = false,
}: Props) {
  const chevron = dir === 'left' ? '‹' : dir === 'right' ? '›' : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.btn,
        highlight && styles.btnHighlight,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <View style={styles.inner}>
        {dir === 'left' && chevron ? (
          <Text style={[styles.glyph, highlight && styles.glyphHighlight]}>
            {chevron}
          </Text>
        ) : null}
        <Text
          style={[
            styles.label,
            highlight && styles.labelHighlight,
            disabled && styles.labelDisabled,
          ]}
        >
          {label}
        </Text>
        {dir === 'right' && chevron ? (
          <Text style={[styles.glyph, highlight && styles.glyphHighlight]}>
            {chevron}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    height: sizing.pill,
    borderRadius: radius.pill,
    borderWidth: border.pill,
    borderColor: colors.cyan,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnHighlight: {
    backgroundColor: colors.amber,
    borderColor: colors.amber,
  },
  disabled: {
    borderColor: colors.cyanFaint,
  },
  pressed: {
    backgroundColor: 'rgba(31,200,224,0.08)',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.amber,
    letterSpacing: 0.5,
  },
  labelHighlight: {
    color: colors.inkOnFill,
  },
  labelDisabled: {
    color: colors.amberDim,
  },
  glyph: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.amber,
  },
  glyphHighlight: {
    color: colors.inkOnFill,
  },
});
