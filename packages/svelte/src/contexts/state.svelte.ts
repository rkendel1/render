import { getContext, onDestroy, setContext } from "svelte";
import {
  createStateStore,
  type StateModel,
  type StateStore,
  getByPath,
} from "@json-render/core";
import { flattenToPointers } from "@json-render/core/store-utils";

const STATE_KEY = Symbol("json-render-state");

/**
 * State context value
 */
export interface StateContext {
  /** The current state model (reactive) */
  readonly state: StateModel;
  /** Get a value by path */
  get: (path: string) => unknown;
  /** Set a value by path */
  set: (path: string, value: unknown) => void;
  /** Update multiple values at once */
  update: (updates: Record<string, unknown>) => void;
  /** Return the live state snapshot from the underlying store. */
  getSnapshot: () => StateModel;
}

export interface CurrentValue<T> {
  current: T;
}

type CreateStateContextOptions = {
  store?: StateStore;
  initialState?: StateModel;
  onStateChange?: (changes: Array<{ path: string; value: unknown }>) => void;
};

type CreateStateContextInput =
  | CreateStateContextOptions
  | (() => CreateStateContextOptions);

/**
 * Create a state context using Svelte 5 $state rune.
 *
 * Supports two modes:
 * - **Controlled**: pass a `store` (external adapter is source of truth)
 * - **Uncontrolled**: omit `store` and optionally pass `initialState` / `onStateChange`
 */
export function createStateContext(
  optionsOrGetter?: CreateStateContextInput,
): StateContext;
export function createStateContext(
  optionsOrGetter: CreateStateContextInput = {},
) {
  const getOptions =
    typeof optionsOrGetter === "function"
      ? optionsOrGetter
      : () => optionsOrGetter;
  const initialOptions = getOptions();
  const { store: externalStore, initialState } = initialOptions;
  const isControlled = !!externalStore;
  const internalStore = !isControlled
    ? createStateStore(initialState ?? {})
    : null;
  const store: StateStore = externalStore ?? internalStore!;

  // Keep a reactive copy of the current store snapshot.
  let state = $state.raw<StateModel>(store.getSnapshot());

  const unsubscribe = store.subscribe(() => {
    state = store.getSnapshot();
  });

  onDestroy(unsubscribe);

  // In uncontrolled mode, support reactive initialState updates from options getter.
  if (!isControlled) {
    let prevFlat: Record<string, unknown> =
      initialState && Object.keys(initialState).length > 0
        ? flattenToPointers(initialState)
        : {};

    $effect.pre(() => {
      const nextInitialState = getOptions().initialState;
      if (!nextInitialState) return;
      const nextFlat =
        Object.keys(nextInitialState).length > 0
          ? flattenToPointers(nextInitialState)
          : {};
      const allKeys = new Set([
        ...Object.keys(prevFlat),
        ...Object.keys(nextFlat),
      ]);
      const updates: Record<string, unknown> = {};
      for (const key of allKeys) {
        if (prevFlat[key] !== nextFlat[key]) {
          updates[key] = key in nextFlat ? nextFlat[key] : undefined;
        }
      }
      prevFlat = nextFlat;
      if (Object.keys(updates).length > 0) {
        store.update(updates);
      }
    });
  }

  const ctx: StateContext = {
    get state() {
      return state;
    },
    get: (path: string) => getByPath(state, path),
    getSnapshot: () => store.getSnapshot(),
    set: (path: string, value: unknown) => {
      const onStateChange = getOptions().onStateChange;
      const prev = store.getSnapshot();
      store.set(path, value);
      if (!isControlled && store.getSnapshot() !== prev) {
        onStateChange?.([{ path, value }]);
      }
    },
    update: (updates: Record<string, unknown>) => {
      const onStateChange = getOptions().onStateChange;
      const prev = store.getSnapshot();
      store.update(updates);
      if (!isControlled && store.getSnapshot() !== prev) {
        const changes: Array<{ path: string; value: unknown }> = [];
        for (const [path, value] of Object.entries(updates)) {
          if (getByPath(prev, path) !== value) {
            changes.push({ path, value });
          }
        }
        if (changes.length > 0) {
          onStateChange?.(changes);
        }
      }
    },
  };

  setContext(STATE_KEY, ctx);
  return ctx;
}

/**
 * Get the state context from component tree
 */
export function getStateContext(): StateContext {
  const ctx = getContext<StateContext>(STATE_KEY);
  if (!ctx) {
    throw new Error("getStateContext must be called within a JsonUIProvider");
  }
  return ctx;
}

/**
 * Convenience helper to read a value from the state context
 */
export function getStateValue(path: string): CurrentValue<unknown> {
  const context = getStateContext();
  return {
    get current() {
      return context.get(path);
    },
    set current(value: unknown) {
      context.set(path, value);
    },
  };
}

/**
 * Two-way helper for `$bindState` / `$bindItem` bindings.
 * Mirrors `useBoundProp` from React packages.
 */
export function getBoundProp<T>(
  propValue: () => T | undefined,
  bindingPath: string | undefined,
): CurrentValue<T | undefined> {
  const context = getStateContext();
  return {
    get current() {
      return propValue();
    },
    set current(value: T | undefined) {
      if (bindingPath) {
        context.set(bindingPath, value);
      }
    },
  };
}
