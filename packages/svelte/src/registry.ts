import type { Catalog } from "@json-render/core";
import type { ComponentRegistry } from "./types.js";
import type {
  BaseComponentProps,
  SetState,
  StateModel,
} from "./catalog-types.js";
import type { Component } from "svelte";

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
export interface DefineRegistryResult {
  /** Component registry for Renderer */
  registry: ComponentRegistry;
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
 * Components must accept `BaseComponentProps` as their props interface.
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
  TComponents extends Record<string, Component<BaseComponentProps<any>>>,
>(
  _catalog: C,
  options: {
    /** Svelte components that accept BaseComponentProps */
    components?: TComponents;
    /** Action handlers */
    actions?: Record<string, DefineRegistryActionFn>;
  },
): DefineRegistryResult {
  const registry: ComponentRegistry = {};

  if (options.components) {
    for (const [name, componentFn] of Object.entries(options.components)) {
      registry[name] = (_, props) =>
        (componentFn as Component<BaseComponentProps<any>>)(_, {
          get props() {
            return props.element.props;
          },
          get children() {
            return props.children;
          },
          get emit() {
            return props.emit;
          },
          // get on() {
          //   return props.on;
          // },
          get bindings() {
            return props.bindings;
          },
          get loading() {
            return props.loading;
          },
        });
    }
  }

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
