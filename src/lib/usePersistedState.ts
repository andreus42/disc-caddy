import { useEffect, useRef, useState } from 'react';
import type { Course, HistoryRecord, ID, Player, Round } from '../types';
import { firstBootSeed } from './seed';
import { HISTORY_CAP, loadAll, saveAll } from './storage';

/**
 * Persistence write debounce. Short enough that a hole's worth of taps
 * coalesces into a single write; long enough to not thrash the disk.
 */
const WRITE_DEBOUNCE_MS = 250;

export type PersistedApi = {
  ready: boolean;

  players: Player[];
  setPlayers: (next: Player[]) => void;

  courses: Course[];
  setCourses: (next: Course[]) => void;

  activeCourseId: ID | null;
  setActiveCourseId: (next: ID | null) => void;

  round: Round | null;
  setRound: (next: Round | null) => void;

  history: HistoryRecord[];
  /** Prepends `record` and caps at {@link HISTORY_CAP}. */
  addHistory: (record: HistoryRecord) => void;
};

/**
 * Loads all persisted state on mount (seeding defaults if blank) and
 * debounces writes back to AsyncStorage on every change. The hook owns
 * the canonical state — pass setters down as props per spec §11.
 */
export function usePersistedState(): PersistedApi {
  const [ready, setReady] = useState(false);

  const [players, setPlayers] = useState<Player[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<ID | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // ---- Boot: load from disk or seed defaults ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await loadAll();
      if (cancelled) return;

      // If we have no courses *and* no players, treat as first boot and seed.
      const isFirstBoot =
        (loaded.courses == null || loaded.courses.length === 0) &&
        (loaded.players == null || loaded.players.length === 0);

      if (isFirstBoot) {
        const seed = firstBootSeed();
        setPlayers(seed.players);
        setCourses(seed.courses);
        setActiveCourseId(seed.activeCourseId);
        setHistory(seed.history);
        setRound(null);
      } else {
        setPlayers(loaded.players ?? []);
        setCourses(loaded.courses ?? []);
        setActiveCourseId(loaded.activeCourseId ?? null);
        setRound(loaded.round ?? null);
        setHistory(loaded.history ?? []);
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Debounced write on any state change after ready ----
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!ready) return;
    if (writeTimer.current) clearTimeout(writeTimer.current);
    writeTimer.current = setTimeout(() => {
      void saveAll({
        players,
        courses,
        activeCourseId,
        round,
        history,
      });
    }, WRITE_DEBOUNCE_MS);

    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current);
    };
  }, [ready, players, courses, activeCourseId, round, history]);

  const addHistory = (record: HistoryRecord) => {
    setHistory((prev) => [record, ...prev].slice(0, HISTORY_CAP));
  };

  return {
    ready,
    players,
    setPlayers,
    courses,
    setCourses,
    activeCourseId,
    setActiveCourseId,
    round,
    setRound,
    history,
    addHistory,
  };
}
