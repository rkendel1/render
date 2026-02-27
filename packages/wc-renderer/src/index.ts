/**
 * @json-render/wc-renderer
 *
 * Render-only Web Component engine.
 * Zero runtime dependencies, no internal state, pure presentation.
 */

import type {
  RenderNode,
  RenderContext,
  RenderFunction,
} from "@json-render/contracts";
import type { Spec, UIElement } from "@json-render/core";
import {
  resolveElementProps,
  evaluateVisibility,
  type PropResolutionContext,
} from "@json-render/core";

/**
 * Base class for render-only Web Components.
 * Extends HTMLElement with minimal lifecycle hooks.
 */
export abstract class RenderOnlyComponent extends HTMLElement {
  private _context: RenderContext = {};
  private _props: Record<string, unknown> = {};
  private _renderRoot: ShadowRoot | HTMLElement;

  constructor() {
    super();
    // Attach shadow DOM for style encapsulation
    this._renderRoot = this.attachShadow({ mode: "open" });
  }

  /**
   * Set the render context (external state/actions)
   */
  setContext(context: RenderContext): void {
    this._context = context;
    this.render();
  }

  /**
   * Set component props
   */
  setProps(props: Record<string, unknown>): void {
    this._props = props;
    this.render();
  }

  /**
   * Get current props
   */
  getProps(): Record<string, unknown> {
    return this._props;
  }

  /**
   * Get current context
   */
  getContext(): RenderContext {
    return this._context;
  }

  /**
   * Render the component (implemented by subclasses)
   */
  protected abstract renderContent(): HTMLElement | DocumentFragment;

  /**
   * Internal render method
   */
  private render(): void {
    const content = this.renderContent();
    this._renderRoot.innerHTML = "";
    this._renderRoot.appendChild(content);
  }

  /**
   * Called when component is connected to the DOM
   */
  connectedCallback(): void {
    this.render();
  }
}

/**
 * Renderer - Converts a json-render Spec to Web Components.
 */
export class Renderer {
  private registry: Map<string, RenderFunction>;
  private context: RenderContext;

  constructor(
    registry: Record<string, RenderFunction>,
    context?: RenderContext,
  ) {
    this.registry = new Map(Object.entries(registry));
    this.context = context || {};
  }

  /**
   * Render a spec to a DOM element
   */
  render(spec: Spec | null): HTMLElement {
    const container = document.createElement("div");
    container.className = "json-render-root";

    if (!spec || !spec.root) {
      return container;
    }

    const rootElement = spec.elements[spec.root];
    if (!rootElement) {
      return container;
    }

    const rendered = this.renderElement(rootElement, spec);
    if (rendered) {
      container.appendChild(rendered);
    }

    return container;
  }

  /**
   * Render a single element
   */
  private renderElement(
    element: UIElement,
    spec: Spec,
  ): HTMLElement | DocumentFragment | null {
    // Build state model from context
    const stateModel: Record<string, unknown> = spec.state || {};

    const propContext: PropResolutionContext = {
      stateModel,
      functions: {},
    };

    const isVisible =
      !element.visible ||
      evaluateVisibility(element.visible, {
        stateModel,
      });

    if (!isVisible) {
      return null;
    }

    // Resolve props
    const resolvedProps = resolveElementProps(element.props || {}, propContext);

    // Get render function
    const renderFn = this.registry.get(element.type);
    if (!renderFn) {
      console.warn(
        `No renderer registered for component type: ${element.type}`,
      );
      return this.renderFallback(element.type);
    }

    // Render children
    const children = this.renderChildren(element, spec);

    // Convert to RenderNode format
    const node: RenderNode = {
      type: element.type,
      props: resolvedProps,
      children: [],
    };

    // Call render function
    return renderFn(resolvedProps, children, this.context);
  }

  /**
   * Render children elements
   */
  private renderChildren(element: UIElement, spec: Spec): RenderNode[] {
    if (!element.children || element.children.length === 0) {
      return [];
    }

    const nodes: RenderNode[] = [];

    for (const childKey of element.children) {
      const childElement = spec.elements[childKey];
      if (!childElement) {
        continue;
      }

      const rendered = this.renderElement(childElement, spec);
      if (!rendered) {
        continue;
      }

      nodes.push({
        type: childElement.type,
        props: childElement.props || {},
        children: [],
      });
    }

    return nodes;
  }

  /**
   * Render a fallback for unknown component types
   */
  private renderFallback(type: string): HTMLElement {
    const div = document.createElement("div");
    div.className = "json-render-fallback";
    div.textContent = `Unknown component: ${type}`;
    div.style.border = "1px solid red";
    div.style.padding = "8px";
    div.style.color = "red";
    return div;
  }

  /**
   * Update context (triggers re-render)
   */
  updateContext(context: RenderContext): void {
    this.context = { ...this.context, ...context };
  }
}

/**
 * Create a render function from a simple template function
 */
export function createRenderFunction<P = Record<string, unknown>>(
  fn: (props: P, children: HTMLElement[]) => HTMLElement | DocumentFragment,
): RenderFunction<P> {
  return (props: P, childNodes: RenderNode[], context: RenderContext) => {
    // For now, we'll convert RenderNodes to placeholder divs
    // In a full implementation, these would be recursively rendered
    const childElements = childNodes.map(() => {
      const div = document.createElement("div");
      div.className = "json-render-child-placeholder";
      return div;
    });

    return fn(props, childElements);
  };
}

/**
 * Helper to create a simple div-based renderer
 */
export function createSimpleRenderer<P = Record<string, unknown>>(
  render: (props: P) => string,
): RenderFunction<P> {
  return (props: P, children: RenderNode[]) => {
    const div = document.createElement("div");
    div.innerHTML = render(props);

    // Append children
    children.forEach((child) => {
      const childDiv = document.createElement("div");
      childDiv.className = `child-${child.type}`;
      div.appendChild(childDiv);
    });

    return div;
  };
}
