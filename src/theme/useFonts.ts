import {
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
  useFonts as useExpoFonts,
} from '@expo-google-fonts/quicksand';

/**
 * Loads Quicksand 500/600/700 (spec §2.2). Returns `ready` once the fonts
 * are loaded — gate the app's root render on this flag so we never flash
 * the system-font fallback (spec §11 build notes).
 */
export function useFonts(): { ready: boolean } {
  const [loaded] = useExpoFonts({
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });
  return { ready: loaded };
}
