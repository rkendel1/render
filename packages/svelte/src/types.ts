import type { Component, Snippet } from "svelte";
import type { ActionHandler, StateStore, UIElement } from "@json-render/core";

/**
 * Props passed to component renderers
 */
export interface ComponentRenderProps<P = Record<string, unknown>> {
  /** The element being rendered */
  element: UIElement<string, P>;
  /** Rendered children snippet */
  children?: Snippet;
  /** Emit a named event. The renderer resolves the event to action binding(s) from the element's `on` field. */
  emit: (event: string) => void;
  /**
   * Two-way binding paths resolved from `$bindState` / `$bindItem` expressions.
   * Maps prop name → absolute state path for write-back.
   */
  bindings?: Record<string, string>;
  /** Whether the parent is loading */
  loading?: boolean;
}

/**
 * Component renderer type - a Svelte component that receives ComponentRenderProps
 */
export type ComponentRenderer<P = Record<string, unknown>> = Component<
  ComponentRenderProps<P>
>;

/**
 * Registry of component renderers.
 * Maps component type names to Svelte components.
 */
export type ComponentRegistry = Record<string, ComponentRenderer<any>>;

/**
 * Props for JSONUIProvider
 */
export interface JSONUIProviderProps {
  /** Component registry */
  registry: ComponentRegistry;
  /**
   * External store (controlled mode). When provided, `initialState` and
   * `onStateChange` are ignored.
   */
  store?: StateStore;
  /** Initial state model */
  initialState?: Record<string, unknown>;
  /** Action handlers */
  handlers?: Record<string, ActionHandler>;
  /** Navigation function */
  navigate?: (path: string) => void;
  /** Custom validation functions */
  validationFunctions?: Record<
    string,
    (value: unknown, args?: Record<string, unknown>) => boolean
  >;
  /** Callback when state changes (uncontrolled mode) */
  onStateChange?: (changes: Array<{ path: string; value: unknown }>) => void;
  /** Children snippet */
  children: Snippet;
}
