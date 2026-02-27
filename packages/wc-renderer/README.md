# @json-render/wc-renderer

Render-only Web Component engine for json-render. Zero runtime dependencies, pure presentation layer.

## Overview

`@json-render/wc-renderer` is a lightweight rendering engine that converts json-render specs into native Web Components. It is:

- **Render-only**: No internal state or side effects
- **Zero dependencies**: No React, Vue, or other framework dependencies (except @json-render/core for prop resolution)
- **Context-driven**: All state and behavior come from external context
- **Framework-agnostic**: Works with any JavaScript application

## Installation

```bash
npm install @json-render/wc-renderer @json-render/contracts @json-render/core
```

## Quick Start

```typescript
import { Renderer, createSimpleRenderer } from "@json-render/wc-renderer";
import type { RenderFunction } from "@json-render/contracts";

// Define render functions for your components
const registry: Record<string, RenderFunction> = {
  Card: createSimpleRenderer((props: { title: string }) => {
    return `
      <div class="card">
        <h3>${props.title}</h3>
      </div>
    `;
  }),
  Button: createSimpleRenderer((props: { label: string }) => {
    return `<button>${props.label}</button>`;
  }),
};

// Create renderer with context
const renderer = new Renderer(registry, {
  getValue: (path) => {
    // Return state value for the given path
    return getStateValue(path);
  },
  triggerAction: (action, params) => {
    // Handle action triggers
    handleAction(action, params);
  },
});

// Render a spec
const spec = {
  root: "card-1",
  elements: {
    "card-1": {
      type: "Card",
      props: { title: "Hello World" },
      children: ["button-1"],
    },
    "button-1": {
      type: "Button",
      props: { label: "Click me" },
      children: [],
    },
  },
};

const element = renderer.render(spec);
document.body.appendChild(element);
```

## Core Concepts

### Render-Only Architecture

Components have **no internal state**. All state lives in external context:

```typescript
const renderer = new Renderer(registry, {
  getValue: (path: string) => {
    // External state management (e.g., WASM, Redux, etc.)
    return externalStore.get(path);
  },
  triggerAction: (action: string, params?: Record<string, unknown>) => {
    // External action handling
    externalRuntime.dispatch(action, params);
  },
});
```

### Render Functions

Each component type maps to a `RenderFunction`:

```typescript
type RenderFunction<P = Record<string, unknown>> = (
  props: P,
  children: RenderNode[],
  context: RenderContext
) => HTMLElement | DocumentFragment;
```

### Custom Render Functions

For more control, create custom render functions:

```typescript
import { createRenderFunction } from "@json-render/wc-renderer";

const CardRenderer = createRenderFunction<{ title: string }>(
  (props, children) => {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h3");
    title.textContent = props.title;
    card.appendChild(title);

    children.forEach((child) => card.appendChild(child));

    return card;
  }
);
```

## API

### `Renderer`

Main rendering engine.

**Constructor:**
```typescript
new Renderer(
  registry: Record<string, RenderFunction>,
  context?: RenderContext
)
```

**Methods:**
- `render(spec: Spec): HTMLElement` - Render a spec to DOM
- `updateContext(context: RenderContext): void` - Update render context

### `RenderOnlyComponent`

Base class for custom Web Components (advanced usage).

```typescript
class MyComponent extends RenderOnlyComponent {
  protected renderContent(): HTMLElement {
    const div = document.createElement("div");
    div.textContent = "Hello from custom component";
    return div;
  }
}
```

### Helper Functions

- `createRenderFunction<P>(fn)` - Create a render function from a template function
- `createSimpleRenderer<P>(render)` - Create a simple HTML string-based renderer

## Architecture

```
┌─────────────────────────────────────────┐
│        External Runtime                 │
│    (WASM / Redux / Context API)         │
└────────────┬────────────────────────────┘
             │
             │ RenderContext
             │ (getValue, triggerAction)
             │
┌────────────▼────────────────────────────┐
│       @json-render/wc-renderer          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Renderer                        │   │
│  │  - Evaluates visibility         │   │
│  │  - Resolves props               │   │
│  │  - Calls render functions       │   │
│  └─────────────────────────────────┘   │
└────────────┬────────────────────────────┘
             │
             │ HTML Elements
             │
┌────────────▼────────────────────────────┐
│            Browser DOM                  │
└─────────────────────────────────────────┘
```

## Examples

See the `examples/` directory for complete examples:
- Simple component rendering
- Context-driven updates
- Custom render functions

## License

Apache-2.0
