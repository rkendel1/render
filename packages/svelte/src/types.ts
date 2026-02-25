import type { Component, Snippet } from "svelte";
import type {
  UIElement,
  Spec,
  ActionHandler,
  StateStore,
} from "@json-render/core";

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
export type ComponentRegistry = Record<
  string,
  ComponentRenderer<any> | undefined
>;

/**
 * Props for the Renderer component
 */
export interface RendererProps {
  /** The UI spec to render */
  spec: Spec | null;
  /** Component registry */
  registry: ComponentRegistry;
  /** Whether the spec is currently loading/streaming */
  loading?: boolean;
  /** Fallback component for unknown types */
  fallback?: ComponentRenderer;
}

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

/**
 * Props for renderers created with createRenderer
 */
export interface CreateRendererProps {
  /** The spec to render (AI-generated JSON) */
  spec: Spec | null;
  /**
   * External store (controlled mode). When provided, `state` and
   * `onStateChange` are ignored.
   */
  store?: StateStore;
  /** State context for dynamic values (uncontrolled mode) */
  state?: Record<string, unknown>;
  /** Action handler */
  onAction?: (actionName: string, params?: Record<string, unknown>) => void;
  /** Callback when state changes (uncontrolled mode) */
  onStateChange?: (changes: Array<{ path: string; value: unknown }>) => void;
  /** Whether the spec is currently loading/streaming */
  loading?: boolean;
  /** Fallback component for unknown types */
  fallback?: ComponentRenderer;
}
