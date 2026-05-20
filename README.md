# Disc Caddie

Dark-mode disc-golf scorecard. Amber on black, cyan accents.
See [`disc-caddy-spec.md`](./disc-caddy-spec.md) for the full design spec.

## Stack

- Expo (React Native, TypeScript)
- React Navigation (native-stack)
- AsyncStorage for persistence
- Quicksand via `@expo-google-fonts/quicksand`
- Jest + `@testing-library/react-native` for tests

## Develop

```bash
npm install
npm start          # Metro + Expo dev tools
npm run ios        # iOS simulator (macOS only)
npm run android    # Android emulator
npm run web        # Web preview (limited; see spec)
```

## Test

```bash
npm test
```
