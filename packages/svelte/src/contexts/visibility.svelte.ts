import { getContext, setContext } from "svelte";
import {
  evaluateVisibility,
  type VisibilityCondition,
  type VisibilityContext as CoreVisibilityContext,
} from "@json-render/core";
import type { StateContext } from "./state.svelte";

const VISIBILITY_KEY = Symbol("json-render-visibility");

/**
 * Visibility context value
 */
export interface VisibilityContext {
  /** Evaluate a visibility condition */
  isVisible: (condition: VisibilityCondition | undefined) => boolean;
  /** The underlying visibility context (for advanced use) */
  ctx: CoreVisibilityContext;
}

export interface CurrentValue<T> {
  readonly current: T;
}

/**
 * Create a visibility context that reads from the state context
 */
export function createVisibilityContext(
  stateCtx: StateContext,
): VisibilityContext {
  const ctx: VisibilityContext = {
    get ctx(): CoreVisibilityContext {
      return { stateModel: stateCtx.state };
    },
    isVisible: (condition: VisibilityCondition | undefined) => {
      return evaluateVisibility(condition, { stateModel: stateCtx.state });
    },
  };

  setContext(VISIBILITY_KEY, ctx);
  return ctx;
}

/**
 * Get the visibility context from component tree
 */
export function getVisibilityContext(): VisibilityContext {
  const ctx = getContext<VisibilityContext>(VISIBILITY_KEY);
  if (!ctx) {
    throw new Error(
      "getVisibilityContext must be called within a JsonUIProvider",
    );
  }
  return ctx;
}

/**
 * Convenience helper to evaluate visibility from context
 */
export function isVisible(
  condition: VisibilityCondition | undefined,
): CurrentValue<boolean> {
  const context = getVisibilityContext();
  return {
    get current() {
      return context.isVisible(condition);
    },
  };
}
