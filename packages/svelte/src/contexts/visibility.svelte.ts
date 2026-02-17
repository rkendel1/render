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

/**
 * Create a visibility context that reads from the state context
 */
export function createVisibilityContext(
  stateCtx: StateContext,
): VisibilityContext {
  return {
    get ctx(): CoreVisibilityContext {
      return { stateModel: stateCtx.state };
    },
    isVisible: (condition: VisibilityCondition | undefined) => {
      return evaluateVisibility(condition, { stateModel: stateCtx.state });
    },
  };
}

/**
 * Set the visibility context in component tree
 */
export function setVisibilityContext(ctx: VisibilityContext): void {
  setContext(VISIBILITY_KEY, ctx);
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
