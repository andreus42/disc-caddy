import { Platform, type TextStyle } from 'react-native';

/**
 * Amber glow for large numerals and the Disc Caddie title (spec §2.1):
 *   `text-shadow: 0 0 22px rgba(255, 160, 0, 0.35)`
 *
 * React Native's `textShadow*` props work well on iOS but are inconsistent on
 * Android. We apply the real shadow on iOS, fall back to a slight color shift
 * on Android — a deliberate trade-off, not an attempt to fake the blur.
 */
export function textGlow(opacity = 0.35): TextStyle {
  if (Platform.OS === 'ios') {
    return {
      textShadowColor: `rgba(255, 160, 0, ${opacity})`,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 22,
    };
  }

  // Android fallback — no shadow, just the amber as-is. We could brighten
  // slightly here, but per the spec we'd rather skip than fake the blur.
  return {};
}
