import type { Component } from "svelte";
import type { Catalog } from "@json-render/core";
import type { ComponentRenderProps, ComponentRenderer } from "./types.js";
import type { SetState, StateModel } from "./catalog-types.js";

/**
 * Action handler function for defineRegistry
 */
type DefineRegistryActionFn = (
  params: Record<string, unknown> | undefined,
  setState: SetState,
  state: StateModel,
) => Promise<void>;

/**
 * Result returned by defineRegistry
 */
export interface DefineRegistryResult<
  TComponents extends Record<string, ComponentRenderer<any>> = Record<
    string,
    ComponentRenderer<any>
  >,
> {
  /** Component registry for Renderer */
  registry: TComponents;
  /**
   * Create ActionProvider-compatible handlers.
   */
  handlers: (
    getSetState: () => SetState | undefined,
    getState: () => StateModel,
  ) => Record<string, (params: Record<string, unknown>) => Promise<void>>;
  /**
   * Execute an action by name imperatively
   */
  executeAction: (
    actionName: string,
    params: Record<string, unknown> | undefined,
    setState: SetState,
    state?: StateModel,
  ) => Promise<void>;
}

/**
 * Create a registry from a catalog with Svelte components and/or actions.
 *
 * Components must accept `ComponentRenderProps` as their props interface.
 *
 * @example
 * ```ts
 * import { defineRegistry } from "@json-render/svelte";
 * import Card from "./components/Card.svelte";
 * import Button from "./components/Button.svelte";
 * import { myCatalog } from "./catalog";
 *
 * const { registry, handlers } = defineRegistry(myCatalog, {
 *   components: {
 *     Card,
 *     Button,
 *   },
 *   actions: {
 *     submit: async (params, setState) => {
 *       // handle action
 *     },
 *   },
 * });
 * ```
 */
export function defineRegistry<
  C extends Catalog,
  TComponents extends Record<string, ComponentRenderer<any>>,
>(
  _catalog: C,
  options: {
    /** Svelte components that accept ComponentRenderProps */
    components?: TComponents;
    /** Action handlers */
    actions?: Record<string, DefineRegistryActionFn>;
  },
): DefineRegistryResult<TComponents> {
  const registry = (options.components ?? {}) as TComponents;

  // Build action helpers
  const actionMap = options.actions
    ? (Object.entries(options.actions) as Array<
        [string, DefineRegistryActionFn]
      >)
    : [];

  const handlers = (
    getSetState: () => SetState | undefined,
    getState: () => StateModel,
  ): Record<string, (params: Record<string, unknown>) => Promise<void>> => {
    const result: Record<
      string,
      (params: Record<string, unknown>) => Promise<void>
    > = {};
    for (const [name, actionFn] of actionMap) {
      result[name] = async (params) => {
        const setState = getSetState();
        const state = getState();
        if (setState) {
          await actionFn(params, setState, state);
        }
      };
    }
    return result;
  };

  const executeAction = async (
    actionName: string,
    params: Record<string, unknown> | undefined,
    setState: SetState,
    state: StateModel = {},
  ): Promise<void> => {
    const entry = actionMap.find(([name]) => name === actionName);
    if (entry) {
      await entry[1](params, setState, state);
    } else {
      console.warn(`Unknown action: ${actionName}`);
    }
  };

  return { registry, handlers, executeAction };
}

/**
 * Component map type - maps component names to Svelte components
 * that accept ComponentRenderProps with the appropriate props type.
 */
export type ComponentMap<
  TComponents extends Record<string, { props: unknown }>,
> = {
  [K in keyof TComponents]: Component<
    ComponentRenderProps<
      TComponents[K]["props"] extends { _output: infer O }
        ? O
        : Record<string, unknown>
    >
  >;
};
