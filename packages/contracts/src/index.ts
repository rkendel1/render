/**
 * @json-render/contracts
 *
 * Type contracts for render-only Web Components.
 * Defines the interface between UI components and external behavior/state.
 */

/**
 * RenderNode - The fundamental unit of render-only UI.
 * Replaces React props with a platform-agnostic contract.
 */
export interface RenderNode<P = Record<string, unknown>> {
  /** Component type identifier */
  type: string;
  /** Component properties (resolved, static values) */
  props?: P;
  /** Child nodes */
  children?: RenderNode[];
  /** Unique key for this node */
  key?: string;
}

/**
 * PropContract - Defines the shape of component props.
 * Used by the builder to generate strongly-typed custom elements.
 */
export interface PropContract {
  /** Property name */
  name: string;
  /** Property type */
  type: "string" | "number" | "boolean" | "object" | "array";
  /** Whether the property is required */
  required?: boolean;
  /** Default value */
  default?: unknown;
  /** Property description (for documentation) */
  description?: string;
}

/**
 * ActionContract - Defines an action that can be triggered by a component.
 * Actions are wired externally (WASM / context / host app).
 */
export interface ActionContract {
  /** Action name/identifier */
  name: string;
  /** Action parameters contract */
  params?: PropContract[];
  /** Action description */
  description?: string;
}

/**
 * ComponentContract - Full contract for a Web Component.
 * Used by the builder to generate custom elements with proper typing.
 */
export interface ComponentContract {
  /** Component name (used as custom element tag name) */
  name: string;
  /** Component description */
  description?: string;
  /** Prop contracts */
  props?: PropContract[];
  /** Actions this component can emit */
  actions?: ActionContract[];
  /** Whether this component accepts children */
  hasChildren?: boolean;
}

/**
 * RenderContext - Context passed to render functions.
 * Provides access to external state and action handlers.
 */
export interface RenderContext {
  /** Get value from external state/context */
  getValue?: (path: string) => unknown;
  /** Trigger an action */
  triggerAction?: (action: string, params?: Record<string, unknown>) => void;
  /** Whether component is in loading state */
  loading?: boolean;
}

/**
 * RenderFunction - Function signature for custom element render logic.
 */
export type RenderFunction<P = Record<string, unknown>> = (
  props: P,
  children: RenderNode[],
  context: RenderContext,
) => HTMLElement | DocumentFragment;

/**
 * ComponentDefinition - Complete definition for building a custom element.
 */
export interface ComponentDefinition<P = Record<string, unknown>> {
  /** Component contract */
  contract: ComponentContract;
  /** Render function */
  render: RenderFunction<P>;
  /** Custom element lifecycle hooks */
  lifecycle?: {
    connected?: () => void;
    disconnected?: () => void;
    attributeChanged?: (
      name: string,
      oldValue: string | null,
      newValue: string | null,
    ) => void;
  };
}

/**
 * CatalogContract - Contract for an entire component catalog.
 * Used by the builder to generate a complete custom element bundle.
 */
export interface CatalogContract {
  /** Catalog name/identifier */
  name: string;
  /** Component contracts */
  components: Record<string, ComponentContract>;
  /** Global actions available across all components */
  actions?: Record<string, ActionContract>;
}
