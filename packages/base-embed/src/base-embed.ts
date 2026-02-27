/**
 * @file base-embed.ts
 * @description Platform-ready BaseEmbed supporting render-only Web Components
 *
 * Features:
 * - Legacy React/Vue mounts remain for backwards compatibility
 * - New mountJSON path renders JSON UI trees via wc-renderer
 * - Stateless: all state/behavior live in external context/runtime
 * - Supports creator-delivered catalogs and runtime updates
 */

import type {
  RenderNode,
  RenderContext,
  RenderFunction,
} from "@json-render/contracts";
import type { Spec } from "@json-render/core";
import { Renderer } from "@json-render/wc-renderer";

/**
 * Runtime interface for external state management and actions
 */
export interface BaseEmbedRuntime {
  /** Resolve UI from context (e.g., WASM, external state) */
  resolveUI?: (ctx: unknown) => RenderNode;
  /** Dispatch actions to external runtime */
  dispatch?: (action: string, params?: unknown) => void;
  /** Subscribe to runtime signals/events */
  subscribe?: (signal: string, handler: Function) => () => void;
}

/**
 * Props for BaseEmbed component
 */
export interface BaseEmbedProps {
  /** External context (state, data, etc.) */
  context?: unknown;
  /** Runtime for state and action management */
  runtime?: BaseEmbedRuntime;
  /** Static UI tree (alternative to runtime.resolveUI) */
  ui?: RenderNode;
  /** Design tokens for theming */
  tokens?: Record<string, string | number>;
  /** Component registry for WC rendering */
  registry?: Record<string, RenderFunction>;
  /** Legacy spec format (for backwards compatibility) */
  spec?: Spec;
  /** Container element for mounting */
  container?: HTMLElement;
}

/**
 * BaseEmbed - Platform-ready embed component
 *
 * Supports multiple mounting strategies:
 * 1. mountJSON - Render-only WC path (new, recommended)
 * 2. mountReact - Legacy React mount (backwards compatibility)
 * 3. mountVue - Legacy Vue mount (backwards compatibility)
 */
export class BaseEmbed {
  private props: BaseEmbedProps;
  private renderer: Renderer | null = null;
  private container: HTMLElement | null = null;
  private unsubscribers: (() => void)[] = [];

  constructor(props: BaseEmbedProps) {
    this.props = props;
  }

  /**
   * Mount using JSON UI + WC Renderer (render-only path)
   */
  mountJSON(container?: HTMLElement): HTMLElement {
    const targetContainer = container || this.props.container;
    if (!targetContainer) {
      throw new Error("BaseEmbed.mountJSON: container is required");
    }

    this.container = targetContainer;

    // Build render context from runtime
    const context: RenderContext = this.buildRenderContext();

    // Get component registry
    const registry = this.props.registry || {};

    // Create renderer
    this.renderer = new Renderer(registry, context);

    // Subscribe to runtime signals if available
    this.subscribeToRuntime();

    // Render UI
    this.render();

    return this.container;
  }

  /**
   * Legacy React mount (for backwards compatibility)
   * Placeholder - requires React integration
   */
  mountReact(container?: HTMLElement): HTMLElement {
    const targetContainer = container || this.props.container;
    if (!targetContainer) {
      throw new Error("BaseEmbed.mountReact: container is required");
    }

    // TODO: Implement React mount when React is available
    console.warn(
      "BaseEmbed.mountReact: React mount not yet implemented. Use mountJSON instead.",
    );

    // Fallback to JSON mount
    return this.mountJSON(targetContainer);
  }

  /**
   * Legacy Vue mount (for backwards compatibility)
   * Placeholder - requires Vue integration
   */
  mountVue(container?: HTMLElement): HTMLElement {
    const targetContainer = container || this.props.container;
    if (!targetContainer) {
      throw new Error("BaseEmbed.mountVue: container is required");
    }

    // TODO: Implement Vue mount when Vue is available
    console.warn(
      "BaseEmbed.mountVue: Vue mount not yet implemented. Use mountJSON instead.",
    );

    // Fallback to JSON mount
    return this.mountJSON(targetContainer);
  }

  /**
   * Update runtime (triggers re-render)
   */
  updateRuntime(runtime: Partial<BaseEmbedRuntime>): void {
    this.props.runtime = {
      ...this.props.runtime,
      ...runtime,
    };

    this.render();
  }

  /**
   * Update context (triggers re-render)
   */
  updateContext(context: unknown): void {
    this.props.context = context;
    this.render();
  }

  /**
   * Update registry (updates renderer)
   */
  updateRegistry(registry: Record<string, RenderFunction>): void {
    this.props.registry = {
      ...this.props.registry,
      ...registry,
    };

    if (this.renderer) {
      const context = this.buildRenderContext();
      this.renderer = new Renderer(this.props.registry || {}, context);
      this.render();
    }
  }

  /**
   * Unmount and cleanup
   */
  unmount(): void {
    // Unsubscribe from all runtime signals
    this.unsubscribers.forEach((unsub) => unsub());
    this.unsubscribers = [];

    // Clear container
    if (this.container) {
      while (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild);
      }
    }

    this.renderer = null;
    this.container = null;
  }

  /**
   * Build RenderContext from runtime
   */
  private buildRenderContext(): RenderContext {
    const runtime = this.props.runtime;

    return {
      getValue: runtime?.resolveUI
        ? (path: string) => {
            // Use runtime to resolve values
            // This is a simplified implementation
            return undefined;
          }
        : undefined,
      triggerAction: runtime?.dispatch
        ? (action: string, params?: Record<string, unknown>) => {
            runtime.dispatch?.(action, params);
          }
        : undefined,
    };
  }

  /**
   * Subscribe to runtime signals
   */
  private subscribeToRuntime(): void {
    const runtime = this.props.runtime;
    if (!runtime?.subscribe) {
      return;
    }

    // Subscribe to update signals
    const unsubUpdate = runtime.subscribe("update", () => {
      this.render();
    });

    if (unsubUpdate) {
      this.unsubscribers.push(unsubUpdate);
    }
  }

  /**
   * Render UI to container
   */
  private render(): void {
    if (!this.renderer || !this.container) {
      return;
    }

    // Get UI tree
    let ui: RenderNode | Spec | null = null;

    // Priority: ui prop > runtime.resolveUI > spec
    if (this.props.ui) {
      ui = this.props.ui;
    } else if (this.props.runtime?.resolveUI && this.props.context) {
      ui = this.props.runtime.resolveUI(this.props.context);
    } else if (this.props.spec) {
      ui = this.props.spec;
    }

    if (!ui) {
      return;
    }

    // Check if it's a Spec (has root property) or RenderNode
    let element: HTMLElement;
    if ("root" in ui && "elements" in ui) {
      // It's a Spec
      element = this.renderer.render(ui as Spec);
    } else {
      // It's a RenderNode - convert to Spec
      const spec = this.renderNodeToSpec(ui as RenderNode);
      element = this.renderer.render(spec);
    }

    // Clear container and append
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
    this.container.appendChild(element);
  }

  /**
   * Convert RenderNode to Spec format
   */
  private renderNodeToSpec(node: RenderNode): Spec {
    const elements: Record<string, any> = {};
    let counter = 0;

    const processNode = (n: RenderNode, parentKey?: string): string => {
      const key = `node-${counter++}`;
      const children: string[] = [];

      if (n.children && n.children.length > 0) {
        for (const child of n.children) {
          const childKey = processNode(child, key);
          children.push(childKey);
        }
      }

      elements[key] = {
        type: n.type,
        props: n.props || {},
        children,
      };

      return key;
    };

    const rootKey = processNode(node);

    return {
      root: rootKey,
      elements,
    };
  }
}

/**
 * Factory function to create BaseEmbed instance
 */
export function createBaseEmbed(props: BaseEmbedProps): BaseEmbed {
  return new BaseEmbed(props);
}
