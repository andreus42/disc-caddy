import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Course, HistoryRecord, ID, Player, Round } from '../types';

/** Persistence keys from spec §8. */
export const KEYS = {
  players: 'discgolf.players.v1',
  courses: 'discgolf.courses.v1',
  activeCourse: 'discgolf.activeCourse.v1',
  round: 'discgolf.round.v3',
  history: 'discgolf.history.v1',
} as const;

/** Spec §8 caps history at 200. */
export const HISTORY_CAP = 200;

/** Bundle of everything we read on boot / write on change. */
export type PersistedState = {
  players: Player[];
  courses: Course[];
  activeCourseId: ID | null;
  round: Round | null;
  history: HistoryRecord[];
};

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  } catch {
    // Corrupt entry — treat as missing. The caller will seed defaults.
    return null;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

/** Read all five keys in parallel. Missing values come back as null. */
export async function loadAll(): Promise<Partial<PersistedState>> {
  const [players, courses, activeCourseId, round, history] = await Promise.all([
    readJson<Player[]>(KEYS.players),
    readJson<Course[]>(KEYS.courses),
    readJson<ID>(KEYS.activeCourse),
    readJson<Round>(KEYS.round),
    readJson<HistoryRecord[]>(KEYS.history),
  ]);
  return {
    players: players ?? undefined,
    courses: courses ?? undefined,
    activeCourseId: activeCourseId ?? undefined,
    round: round ?? undefined,
    history: history ?? undefined,
  };
}

/** Write every slice. History is capped to {@link HISTORY_CAP} on the way out. */
export async function saveAll(state: PersistedState): Promise<void> {
  const cappedHistory = state.history.slice(0, HISTORY_CAP);
  await Promise.all([
    writeJson(KEYS.players, state.players),
    writeJson(KEYS.courses, state.courses),
    writeJson(KEYS.activeCourse, state.activeCourseId),
    writeJson(KEYS.round, state.round),
    writeJson(KEYS.history, cappedHistory),
  ]);
}
