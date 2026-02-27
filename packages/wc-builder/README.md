# @json-render/wc-builder

Build tool that compiles json-render catalogs into distributable Web Component bundles.

## Overview

`@json-render/wc-builder` transforms component catalogs into portable, framework-agnostic Web Component bundles. It generates:

- **Custom Elements**: Standards-compliant Web Components
- **Type Definitions**: TypeScript .d.ts files for type safety
- **Distributable Bundles**: Ready-to-ship JavaScript bundles

## Installation

```bash
npm install @json-render/wc-builder @json-render/contracts @json-render/core
```

## Quick Start

```typescript
import { buildCatalog, createComponentContract } from "@json-render/wc-builder";
import type { ComponentDefinition } from "@json-render/contracts";

// Define your component contracts
const catalog = {
  name: "my-components",
  components: {
    Card: {
      name: "Card",
      props: [
        { name: "title", type: "string", required: true },
      ],
    },
  },
};

// Define component implementations
const components: Record<string, ComponentDefinition> = {
  Card: {
    contract: catalog.components.Card,
    render: (props, children, context) => {
      const div = document.createElement("div");
      div.className = "card";
      
      const title = document.createElement("h3");
      title.textContent = props.title as string;
      div.appendChild(title);
      
      return div;
    },
  },
};

// Build the bundle
const result = buildCatalog(catalog, components, {
  prefix: "my",  // Generates my-card, my-button, etc.
  minify: true,
  generateTypes: true,
});

console.log(result.bundle);       // JavaScript bundle
console.log(result.types);        // TypeScript definitions
console.log(result.elementNames); // ['my-card']
```

## API

### `buildCatalog(catalog, components, options?)`

Compile a catalog into Web Components.

**Parameters:**
- `catalog`: `CatalogContract` - Component catalog metadata
- `components`: `Record<string, ComponentDefinition>` - Component implementations
- `options?`: `BuilderOptions` - Build configuration

**Returns:** `BuildResult`

### `BuilderOptions`

```typescript
interface BuilderOptions {
  /** Output bundle name */
  name?: string;
  /** Whether to minify output */
  minify?: boolean;
  /** Custom element prefix (e.g., 'jr-' for jr-card) */
  prefix?: string;
  /** Whether to generate TypeScript definitions */
  generateTypes?: boolean;
}
```

### `BuildResult`

```typescript
interface BuildResult {
  /** Generated JavaScript bundle */
  bundle: string;
  /** Generated TypeScript definitions (if requested) */
  types?: string;
  /** Catalog metadata */
  catalog: CatalogContract;
  /** List of generated custom element names */
  elementNames: string[];
}
```

## Usage Workflow

### 1. Define Catalog

```typescript
const catalog: CatalogContract = {
  name: "dashboard",
  components: {
    Card: {
      name: "Card",
      description: "A card container",
      props: [
        { name: "title", type: "string", required: true },
        { name: "elevated", type: "boolean", required: false },
      ],
      hasChildren: true,
    },
    Button: {
      name: "Button",
      description: "Clickable button",
      props: [
        { name: "label", type: "string", required: true },
      ],
      actions: [
        { name: "click", description: "Triggered when clicked" },
      ],
    },
  },
};
```

### 2. Implement Components

```typescript
const components: Record<string, ComponentDefinition> = {
  Card: {
    contract: catalog.components.Card,
    render: (props, children, context) => {
      const card = document.createElement("div");
      card.className = props.elevated ? "card elevated" : "card";
      
      const title = document.createElement("h3");
      title.textContent = props.title as string;
      card.appendChild(title);
      
      return card;
    },
  },
  Button: {
    contract: catalog.components.Button,
    render: (props, children, context) => {
      const button = document.createElement("button");
      button.textContent = props.label as string;
      button.onclick = () => {
        context.triggerAction?.("click");
      };
      return button;
    },
  },
};
```

### 3. Build Bundle

```typescript
const result = buildCatalog(catalog, components, {
  prefix: "dash",
  generateTypes: true,
});

// Write to files
import fs from "fs";
fs.writeFileSync("components.js", result.bundle);
fs.writeFileSync("components.d.ts", result.types!);
```

### 4. Use in HTML

```html
<!DOCTYPE html>
<html>
<head>
  <script src="components.js"></script>
</head>
<body>
  <dash-card title="Welcome">
    <dash-button label="Get Started"></dash-button>
  </dash-card>
</body>
</html>
```

## Generated Custom Elements

### Attributes

Component props are exposed as HTML attributes:

```html
<dash-card title="My Card" elevated="true">
  <dash-button label="Click me"></dash-button>
</dash-card>
```

### Context

Custom elements can access global context via `window.__jsonRenderContext`:

```javascript
window.__jsonRenderContext = {
  getValue: (path) => store.get(path),
  triggerAction: (action, params) => runtime.dispatch(action, params),
};
```

## Advanced Usage

### Custom Element Lifecycle

Provide lifecycle hooks when defining components:

```typescript
const component: ComponentDefinition = {
  contract: myContract,
  render: (props) => { /* ... */ },
  lifecycle: {
    connected: () => {
      console.log("Component connected to DOM");
    },
    disconnected: () => {
      console.log("Component removed from DOM");
    },
    attributeChanged: (name, oldValue, newValue) => {
      console.log(`Attribute ${name} changed: ${oldValue} → ${newValue}`);
    },
  },
};
```

### TypeScript Support

Import generated types in your TypeScript project:

```typescript
import type { CardElement, ButtonElement } from "./components";

const card: CardElement = document.querySelector("dash-card")!;
card.setAttribute("title", "Updated");
```

## Examples

See the `examples/wc-builder/` directory for complete examples.

## Limitations

### Function Serialization

The builder uses `Function.prototype.toString()` to serialize render functions into the bundle. This has some limitations:

- Functions with closures or external dependencies may not work correctly
- Complex render logic may not serialize properly
- For production use, consider using a proper bundling tool (webpack, rollup, etc.)

To work around this, keep render functions simple and self-contained, or use a build tool to bundle the components properly.

## License

Apache-2.0
