import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CourseEditRoute } from '../screens/CourseEditScreen';
import { CoursesRoute } from '../screens/CoursesScreen';
import { HoleRoute } from '../screens/HoleScreen';
import { HomeRoute } from '../screens/HomeScreen';
import { PlaceholderScreen } from '../screens/Placeholder';
import { PlayersRoute } from '../screens/PlayersScreen';
import { colors } from '../theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    border: 'transparent',
    text: colors.amber,
    primary: colors.amber,
  },
};

/**
 * Root navigator. Every screen from spec §5 has a route; non-home routes
 * render a Placeholder until their dedicated commit lands.
 */
export function RootStack() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="home" component={HomeRoute} />
        <Stack.Screen name="hole" component={HoleRoute} />
        <Stack.Screen name="players" component={PlayersRoute} />
        <Stack.Screen name="courses" component={CoursesRoute} />
        <Stack.Screen name="courseEdit" component={CourseEditRoute} />
        <Stack.Screen
          name="stats"
          children={() => <PlaceholderScreen title="Statistics" />}
        />
        <Stack.Screen
          name="scorecards"
          children={() => <PlaceholderScreen title="Scorecards" />}
        />
        <Stack.Screen
          name="viewCard"
          children={() => <PlaceholderScreen title="Round" />}
        />
        <Stack.Screen
          name="finish"
          children={() => <PlaceholderScreen title="Finish" />}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
