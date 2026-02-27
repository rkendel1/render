/**
 * @json-render/wc-builder
 *
 * Build tool that compiles json-render catalogs into distributable Web Component bundles.
 * Generates strongly-typed custom elements from component definitions.
 */

import type {
  ComponentContract,
  CatalogContract,
  ComponentDefinition,
  RenderFunction,
} from "@json-render/contracts";
import type { Catalog } from "@json-render/core";

/**
 * Builder configuration options
 */
export interface BuilderOptions {
  /** Output bundle name */
  name?: string;
  /** Whether to minify output */
  minify?: boolean;
  /** Custom element prefix (e.g., 'jr-' for jr-card, jr-button) */
  prefix?: string;
  /** Whether to generate TypeScript definitions */
  generateTypes?: boolean;
}

/**
 * Builder result
 */
export interface BuildResult {
  /** Generated JavaScript bundle */
  bundle: string;
  /** Generated TypeScript definitions (if requested) */
  types?: string;
  /** Catalog metadata */
  catalog: CatalogContract;
  /** List of generated custom element names */
  elementNames: string[];
}

/**
 * ComponentBuilder - Builds individual custom elements
 */
export class ComponentBuilder {
  private contract: ComponentContract;
  private renderFn: RenderFunction;
  private prefix: string;

  constructor(
    contract: ComponentContract,
    renderFn: RenderFunction,
    prefix: string = "jr",
  ) {
    this.contract = contract;
    this.renderFn = renderFn;
    this.prefix = prefix;
  }

  /**
   * Get the custom element tag name
   */
  getTagName(): string {
    return `${this.prefix}-${this.contract.name.toLowerCase()}`;
  }

  /**
   * Generate the custom element class code
   */
  generateClass(): string {
    const className = `${this.contract.name}Element`;
    const tagName = this.getTagName();

    return `
class ${className} extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  static get observedAttributes() {
    return ${JSON.stringify(this.contract.props?.map((p) => p.name) || [])};
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    const props = this.getProps();
    const children = [];
    const context = this.getContext();
    
    const result = renderFunctions['${this.contract.name}'](props, children, context);
    
    if (this.shadowRoot) {
      // Clear existing content efficiently
      while (this.shadowRoot.firstChild) {
        this.shadowRoot.removeChild(this.shadowRoot.firstChild);
      }
      this.shadowRoot.appendChild(result);
    }
  }

  getProps() {
    const props = {};
    ${this.contract.props
      ?.map(
        (prop) => `
    if (this.hasAttribute('${prop.name}')) {
      const value = this.getAttribute('${prop.name}');
      props['${prop.name}'] = ${prop.type === "number" ? "parseFloat(value)" : prop.type === "boolean" ? "value !== 'false' && value !== null" : "value"};
    }
    `,
      )
      .join("")}
    return props;
  }

  getContext() {
    return window.__jsonRenderContext || {};
  }
}

customElements.define('${tagName}', ${className});
`;
  }

  /**
   * Generate TypeScript type definitions
   */
  generateTypes(): string {
    const tagName = this.getTagName();
    const propsInterface = this.generatePropsInterface();

    return `
declare global {
  interface HTMLElementTagNameMap {
    '${tagName}': ${this.contract.name}Element;
  }
}

${propsInterface}

export class ${this.contract.name}Element extends HTMLElement {
  connectedCallback(): void;
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
  render(): void;
  getProps(): ${this.contract.name}Props;
}
`;
  }

  /**
   * Generate props interface
   */
  private generatePropsInterface(): string {
    if (!this.contract.props || this.contract.props.length === 0) {
      return `export interface ${this.contract.name}Props {}`;
    }

    const props = this.contract.props
      .map((prop) => {
        const optional = prop.required ? "" : "?";
        let type = "unknown";
        switch (prop.type) {
          case "string":
            type = "string";
            break;
          case "number":
            type = "number";
            break;
          case "boolean":
            type = "boolean";
            break;
          case "array":
            type = "unknown[]";
            break;
          case "object":
            type = "Record<string, unknown>";
            break;
        }
        return `  ${prop.name}${optional}: ${type};`;
      })
      .join("\n");

    return `export interface ${this.contract.name}Props {\n${props}\n}`;
  }
}

/**
 * CatalogBuilder - Builds complete Web Component bundles from catalogs
 */
export class CatalogBuilder {
  private catalog: CatalogContract;
  private components: Map<string, ComponentDefinition>;
  private options: BuilderOptions;

  constructor(
    catalog: CatalogContract,
    components: Record<string, ComponentDefinition>,
    options: BuilderOptions = {},
  ) {
    this.catalog = catalog;
    this.components = new Map(Object.entries(components));
    this.options = {
      name: catalog.name,
      minify: false,
      prefix: "jr",
      generateTypes: true,
      ...options,
    };
  }

  /**
   * Build the complete bundle
   */
  build(): BuildResult {
    const elementNames: string[] = [];
    const classCode: string[] = [];
    const types: string[] = [];

    // Generate code for each component
    for (const [name, definition] of this.components) {
      const builder = new ComponentBuilder(
        definition.contract,
        definition.render,
        this.options.prefix,
      );

      elementNames.push(builder.getTagName());
      classCode.push(builder.generateClass());

      if (this.options.generateTypes) {
        types.push(builder.generateTypes());
      }
    }

    // Build the complete bundle
    const bundle = this.buildBundle(classCode);

    return {
      bundle,
      types: this.options.generateTypes ? types.join("\n\n") : undefined,
      catalog: this.catalog,
      elementNames,
    };
  }

  /**
   * Build the JavaScript bundle
   */
  private buildBundle(classCode: string[]): string {
    const renderFunctionsCode = this.generateRenderFunctionsObject();

    return `
(function() {
  'use strict';

  // Render functions registry
  const renderFunctions = ${renderFunctionsCode};

  // Component class definitions
  ${classCode.join("\n\n")}

  // Export for module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderFunctions };
  } else if (typeof window !== 'undefined') {
    window.__jsonRenderComponents = { renderFunctions };
  }
})();
`;
  }

  /**
   * Generate the render functions object
   *
   * Note: Function serialization with toString() has limitations:
   * - Functions with closures or external dependencies may not work correctly
   * - For production use, consider using a proper bundling tool
   */
  private generateRenderFunctionsObject(): string {
    const functions: string[] = [];

    for (const [name, definition] of this.components) {
      // For now, we'll serialize as a placeholder
      // In a real implementation, this would need proper serialization
      functions.push(`'${name}': ${definition.render.toString()}`);
    }

    return `{\n  ${functions.join(",\n  ")}\n}`;
  }
}

/**
 * Build a catalog into Web Components
 */
export function buildCatalog(
  catalog: CatalogContract,
  components: Record<string, ComponentDefinition>,
  options?: BuilderOptions,
): BuildResult {
  const builder = new CatalogBuilder(catalog, components, options);
  return builder.build();
}

/**
 * Create a component contract from a Zod schema (helper)
 */
export function createComponentContract(
  name: string,
  description?: string,
): ComponentContract {
  return {
    name,
    description,
    props: [],
    actions: [],
    hasChildren: false,
  };
}
