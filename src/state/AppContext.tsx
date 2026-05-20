import { createContext, useContext, type ReactNode } from 'react';
import type { PersistedApi } from '../lib/usePersistedState';

/**
 * App-wide state context. Screens themselves stay props-driven per spec §11 —
 * this context is only consumed by the thin Route wrappers that translate
 * the live state into screen props.
 */
const AppContext = createContext<PersistedApi | null>(null);

export function AppProvider({
  value,
  children,
}: {
  value: PersistedApi;
  children: ReactNode;
}) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState(): PersistedApi {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppState must be used inside <AppProvider>');
  }
  return ctx;
}
