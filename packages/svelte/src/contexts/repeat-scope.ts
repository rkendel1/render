import { getContext, setContext } from "svelte";

const REPEAT_SCOPE_KEY = Symbol("json-render-repeat-scope");

/**
 * Repeat scope value provided to child elements inside a repeated element.
 */
export interface RepeatScopeValue {
  /** The current array item object */
  item: unknown;
  /** Index of the current item in the array */
  index: number;
  /** Absolute state path to the current array item (e.g. "/todos/0") */
  basePath: string;
}

/**
 * Set the repeat scope in component tree
 */
export function setRepeatScope(scope: RepeatScopeValue): void {
  setContext(REPEAT_SCOPE_KEY, scope);
}

/**
 * Get the current repeat scope (or null if not inside a repeated element)
 */
export function getRepeatScope(): RepeatScopeValue | null {
  return getContext<RepeatScopeValue | null>(REPEAT_SCOPE_KEY) ?? null;
}
