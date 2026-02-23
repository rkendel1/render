import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  getByPath,
  createStateStore,
  type StateModel,
  type StateStore,
} from "@json-render/core";

export interface StateContextValue {
  state: StateModel;
  get: (path: string) => unknown;
  set: (path: string, value: unknown) => void;
  update: (updates: Record<string, unknown>) => void;
}

const StateContext = createContext<StateContextValue | null>(null);

export interface StateProviderProps {
  store?: StateStore;
  initialState?: StateModel;
  onStateChange?: (path: string, value: unknown) => void;
  children: ReactNode;
}

export function StateProvider({
  store: externalStore,
  initialState = {},
  onStateChange,
  children,
}: StateProviderProps) {
  const internalStoreRef = useRef<StateStore | undefined>(
    externalStore ? undefined : createStateStore(initialState),
  );

  const store = externalStore ?? internalStoreRef.current!;

  const prevInitialJsonRef = useRef<string>(JSON.stringify(initialState));
  if (!externalStore) {
    const json = JSON.stringify(initialState);
    if (json !== prevInitialJsonRef.current) {
      prevInitialJsonRef.current = json;
      if (initialState && Object.keys(initialState).length > 0) {
        store.update(
          Object.fromEntries(
            Object.entries(initialState).map(([k, v]) => [`/${k}`, v]),
          ),
        );
      }
    }
  }

  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);

  const onStateChangeRef = useRef(onStateChange);
  onStateChangeRef.current = onStateChange;

  const set = useCallback(
    (path: string, value: unknown) => {
      store.set(path, value);
      if (!externalStore) {
        onStateChangeRef.current?.(path, value);
      }
    },
    [store, externalStore],
  );

  const update = useCallback(
    (updates: Record<string, unknown>) => {
      store.update(updates);
      if (!externalStore) {
        for (const [path, value] of Object.entries(updates)) {
          onStateChangeRef.current?.(path, value);
        }
      }
    },
    [store, externalStore],
  );

  const get = useCallback((path: string) => store.get(path), [store]);

  const value = useMemo<StateContextValue>(
    () => ({ state, get, set, update }),
    [state, get, set, update],
  );

  return (
    <StateContext.Provider value={value}>{children}</StateContext.Provider>
  );
}

export function useStateStore(): StateContextValue {
  const ctx = useContext(StateContext);
  if (!ctx) {
    throw new Error("useStateStore must be used within a StateProvider");
  }
  return ctx;
}

export function useStateValue<T>(path: string): T | undefined {
  const { state } = useStateStore();
  return getByPath(state, path) as T | undefined;
}

export function useStateBinding<T>(
  path: string,
): [T | undefined, (value: T) => void] {
  const { state, set } = useStateStore();
  const value = getByPath(state, path) as T | undefined;
  const setValue = useCallback(
    (newValue: T) => set(path, newValue),
    [path, set],
  );
  return [value, setValue];
}
