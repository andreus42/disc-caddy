import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, safeArea, spacing } from '../../theme';

type Props = {
  /** Optional top bar — rendered just under the status bar. */
  topBar?: ReactNode;
  /**
   * Optional bottom action bar — rendered floating at the bottom with the
   * black-fade gradient mask per spec §2.3. Caller arranges its own
   * content (typically two NavPills side-by-side with gap 10).
   */
  bottomBar?: ReactNode;
  children: ReactNode;
  /**
   * If true, removes the horizontal padding from the body. Useful when the
   * screen wants its own scroll container that bleeds to the edges.
   */
  bleed?: boolean;
};

/**
 * Shared screen layout per spec §3:
 * - Black background
 * - 54pt top reserve (status bar) handled by SafeAreaView (clamped to >= 54)
 * - 30pt bottom safe-area
 * - Optional top bar pinned to the top
 * - Optional bottom bar pinned with horizontal padding
 */
export function Screen({ topBar, bottomBar, children, bleed = false }: Props) {
  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <View style={styles.root}>
        {topBar ? <View style={styles.topBar}>{topBar}</View> : null}
        <View style={[styles.body, !bleed && styles.bodyPadded]}>
          {children}
        </View>
        {bottomBar ? (
          <View style={styles.bottomBar}>{bottomBar}</View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    minHeight: safeArea.top - 20, // safe-area already covers the status bar
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  body: {
    flex: 1,
  },
  bodyPadded: {
    paddingHorizontal: spacing.xl,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    paddingTop: spacing.md,
    backgroundColor: colors.bg,
  },
});
