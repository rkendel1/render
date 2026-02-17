import type { Snippet } from "svelte";
import type {
  Catalog,
  InferCatalogComponents,
  InferCatalogActions,
  InferComponentProps,
  InferActionParams,
  StateModel,
} from "@json-render/core";

export type { StateModel };

// =============================================================================
// State Types
// =============================================================================

/**
 * State setter function for updating application state
 */
export type SetState = (
  updater: (prev: Record<string, unknown>) => Record<string, unknown>,
) => void;

// =============================================================================
// Component Types
// =============================================================================

/**
 * Context passed to component render functions
 */
export interface ComponentContext<
  C extends Catalog,
  K extends keyof InferCatalogComponents<C>,
> {
  props: InferComponentProps<C, K>;
  children?: Snippet;
  emit: (event: string) => void;
  bindings?: Record<string, string>;
  loading?: boolean;
}

/**
 * Component render function type for Svelte
 */
export type ComponentFn<
  C extends Catalog,
  K extends keyof InferCatalogComponents<C>,
> = (ctx: ComponentContext<C, K>) => void;

/**
 * Registry of all component render functions for a catalog
 */
export type Components<C extends Catalog> = {
  [K in keyof InferCatalogComponents<C>]: ComponentFn<C, K>;
};

// =============================================================================
// Action Types
// =============================================================================

/**
 * Action handler function type
 */
export type ActionFn<
  C extends Catalog,
  K extends keyof InferCatalogActions<C>,
> = (
  params: InferActionParams<C, K> | undefined,
  setState: SetState,
  state: StateModel,
) => Promise<void>;

/**
 * Registry of all action handlers for a catalog
 */
export type Actions<C extends Catalog> = {
  [K in keyof InferCatalogActions<C>]: ActionFn<C, K>;
};
