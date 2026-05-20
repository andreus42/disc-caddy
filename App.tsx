import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { usePersistedState } from './src/lib/usePersistedState';
import { colors, textGlow, type, useFonts } from './src/theme';

export default function App() {
  const { ready: fontsReady } = useFonts();
  const state = usePersistedState();

  // Black screen while fonts AND persisted state load.
  if (!fontsReady || !state.ready) {
    return <View style={styles.bg} />;
  }

  // Temporary boot-check view. The Home screen lands in commit 6.
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={[type.displayNumeral, styles.title, textGlow()]}>
          Disc Caddie
        </Text>
        <Text style={type.caption}>
          {state.courses.length} courses · {state.players.length} players ·{' '}
          {state.history.length} rounds
        </Text>
        <StatusBar style="light" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 52,
    color: colors.amber,
  },
});
