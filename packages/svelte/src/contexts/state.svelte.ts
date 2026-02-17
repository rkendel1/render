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

/**
 * Create a state context using Svelte 5 $state rune
 */
export function createStateContext(
  initialState: StateModel = {},
  onStateChange?: (path: string, value: unknown) => void,
): StateContext {
  // Use $state for reactive state - creates deeply reactive object
  let state = $state<StateModel>({ ...initialState });

  return {
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
}

/**
 * Set the state context in component tree
 */
export function setStateContext(ctx: StateContext): void {
  setContext(STATE_KEY, ctx);
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
