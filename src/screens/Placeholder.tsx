import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { BackButton } from '../components';
import { Screen } from './layout/Screen';
import { colors, fonts, spacing } from '../theme';

/**
 * Temporary placeholder rendered for routes not yet implemented in this
 * commit. Each later commit replaces the relevant route with its real
 * screen.
 */
export function PlaceholderScreen({ title }: { title: string }) {
  const navigation = useNavigation();
  const onBack = () => navigation.canGoBack() && navigation.goBack();
  return (
    <Screen topBar={<BackButton label="Menu" onPress={onBack} />}>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.note}>Coming in a later commit.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.amber,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  note: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.amberDim,
  },
});
