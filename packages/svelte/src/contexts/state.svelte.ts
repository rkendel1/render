import { getContext, setContext } from "svelte";
import { getByPath, setByPath, type StateModel } from "@json-render/core";

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
}

export interface CurrentValue<T> {
  current: T;
}

/**
 * Create a state context using Svelte 5 $state rune
 */
export function createStateContext(
  initialState: StateModel = {},
  onStateChange?: (path: string, value: unknown) => void,
): StateContext {
  // Use $state for reactive state - creates deeply reactive object
  let state = $state<StateModel>({ ...initialState });

  const ctx: StateContext = {
    get state() {
      return state;
    },
    get: (path: string) => getByPath(state, path),
    set: (path: string, value: unknown) => {
      setByPath(state, path, value);
      onStateChange?.(path, value);
    },
    update: (updates: Record<string, unknown>) => {
      for (const [path, value] of Object.entries(updates)) {
        setByPath(state, path, value);
        onStateChange?.(path, value);
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
