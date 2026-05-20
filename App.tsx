import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootStack } from './src/nav/Stack';
import { usePersistedState } from './src/lib/usePersistedState';
import { AppProvider } from './src/state/AppContext';
import { colors, useFonts } from './src/theme';

export default function App() {
  const { ready: fontsReady } = useFonts();
  const state = usePersistedState();

  // Black screen while fonts AND persisted state load.
  if (!fontsReady || !state.ready) {
    return <View style={styles.bg} />;
  }

  return (
    <GestureHandlerRootView style={styles.bg}>
      <SafeAreaProvider>
        <AppProvider value={state}>
          <RootStack />
          <StatusBar style="light" />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
