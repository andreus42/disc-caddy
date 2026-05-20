import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors, textGlow, type, useFonts } from './src/theme';

export default function App() {
  const { ready } = useFonts();

  if (!ready) {
    // Black screen while fonts load — avoids any system-font flash.
    return <View style={styles.bg} />;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={[type.displayNumeral, styles.title, textGlow()]}>
          Disc Caddie
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
  },
  title: {
    fontSize: 52,
    color: colors.amber,
  },
});
