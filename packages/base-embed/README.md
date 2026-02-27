# @json-render/base-embed

Platform-ready BaseEmbed component supporting render-only Web Components with legacy React/Vue mount support.

## Overview

`@json-render/base-embed` provides a unified embedding layer for json-render that supports:

- **Render-Only Web Components**: New `mountJSON` path using `@json-render/wc-renderer`
- **Legacy React/Vue Mounts**: Backwards compatibility (placeholders for now)
- **Stateless Architecture**: All state and behavior delegated to external runtime
- **Creator-Delivered Catalogs**: Dynamic component registry updates
- **Runtime Updates**: Live context and UI updates via signals

## Installation

```bash
npm install @json-render/base-embed @json-render/contracts @json-render/wc-renderer @json-render/core
```

## Quick Start

### Basic Usage (mountJSON)

```typescript
import { createBaseEmbed } from "@json-render/base-embed";
import type { RenderFunction } from "@json-render/contracts";

// Define component registry
const registry: Record<string, RenderFunction> = {
  Card: (props, children, context) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<h3>${props.title}</h3>`;
    return div;
  },
  Button: (props, children, context) => {
    const button = document.createElement("button");
    button.textContent = String(props.label);
    button.onclick = () => {
      context.triggerAction?.("click", { id: props.id });
    };
    return button;
  },
};

// Create embed instance
const embed = createBaseEmbed({
  registry,
  runtime: {
    dispatch: (action, params) => {
      console.log("Action:", action, params);
    },
  },
  spec: {
    root: "card-1",
    elements: {
      "card-1": {
        type: "Card",
        props: { title: "Hello World" },
        children: ["button-1"],
      },
      "button-1": {
        type: "Button",
        props: { label: "Click me", id: "btn-1" },
        children: [],
      },
    },
  },
});

// Mount to DOM
const container = document.getElementById("app");
embed.mountJSON(container);
```

### With Runtime UI Resolution

```typescript
// Track context externally
let appContext = { user: "Alice", count: 0 };

const embed = createBaseEmbed({
  registry,
  context: appContext,
  runtime: {
    resolveUI: (ctx: any) => {
      // Dynamically generate UI from context
      return {
        type: "Card",
        props: { title: `Hello ${ctx.user}` },
        children: [
          {
            type: "Button",
            props: { label: `Count: ${ctx.count}` },
          },
        ],
      };
    },
    dispatch: (action, params) => {
      if (action === "increment") {
        // Update external context
        appContext = { ...appContext, count: appContext.count + 1 };
        embed.updateContext(appContext);
      }
    },
    subscribe: (signal, handler) => {
      // Subscribe to external events
      return () => {}; // unsubscribe
    },
  },
});

embed.mountJSON(container);
```

### Updating at Runtime

```typescript
// Update context (triggers re-render)
embed.updateContext({ user: "Bob", count: 5 });

// Update registry (add/replace components)
embed.updateRegistry({
  NewComponent: (props) => {
    const div = document.createElement("div");
    div.textContent = "New component!";
    return div;
  },
});

// Update runtime
embed.updateRuntime({
  dispatch: (action, params) => {
    console.log("Updated dispatch:", action, params);
  },
});

// Cleanup
embed.unmount();
```

## API

### `BaseEmbed`

Main class for embedding json-render UIs.

#### Constructor

```typescript
const embed = new BaseEmbed(props: BaseEmbedProps);
```

#### Methods

- **`mountJSON(container?: HTMLElement): HTMLElement`**  
  Mount using render-only Web Components (recommended)

- **`mountReact(container?: HTMLElement): HTMLElement`**  
  Legacy React mount (placeholder - not yet implemented)

- **`mountVue(container?: HTMLElement): HTMLElement`**  
  Legacy Vue mount (placeholder - not yet implemented)

- **`updateRuntime(runtime: Partial<BaseEmbedRuntime>): void`**  
  Update runtime configuration and re-render

- **`updateContext(context: unknown): void`**  
  Update context and re-render

- **`updateRegistry(registry: Record<string, RenderFunction>): void`**  
  Update component registry and re-render

- **`unmount(): void`**  
  Cleanup and remove from DOM

### Types

#### `BaseEmbedProps`

```typescript
interface BaseEmbedProps {
  /** External context (state, data, etc.) */
  context?: unknown;
  /** Runtime for state and action management */
  runtime?: BaseEmbedRuntime;
  /** Static UI tree */
  ui?: RenderNode;
  /** Design tokens for theming */
  tokens?: Record<string, string | number>;
  /** Component registry for WC rendering */
  registry?: Record<string, RenderFunction>;
  /** Legacy spec format */
  spec?: Spec;
  /** Container element for mounting */
  container?: HTMLElement;
}
```

#### `BaseEmbedRuntime`

```typescript
interface BaseEmbedRuntime {
  /** Resolve UI from context */
  resolveUI?: (ctx: unknown) => RenderNode;
  /** Dispatch actions to external runtime */
  dispatch?: (action: string, params?: unknown) => void;
  /** Subscribe to runtime signals/events */
  subscribe?: (signal: string, handler: Function) => () => void;
}
```

## Architecture

BaseEmbed follows the render-only architecture:

```
┌─────────────────────────────────────────────────────────┐
│                External Runtime (WASM/Host)             │
│  - State Management                                      │
│  - Action Handlers                                       │
│  - UI Resolution                                         │
└─────────────────────────────────────────────────────────┘
                             ▲
                             │ BaseEmbedRuntime
                             │ (resolveUI, dispatch, subscribe)
                             │
┌─────────────────────────────────────────────────────────┐
│                      BaseEmbed                           │
│  - mountJSON (render-only WC)                           │
│  - mountReact (legacy)                                  │
│  - mountVue (legacy)                                    │
└─────────────────────────────────────────────────────────┘
                             ▲
                             │ RenderContext
                             │
┌─────────────────────────────────────────────────────────┐
│                  @json-render/wc-renderer                │
│  - Pure presentation layer                              │
│  - No internal state                                    │
└─────────────────────────────────────────────────────────┘
```

## Design Tokens

You can pass design tokens for theming:

```typescript
const embed = createBaseEmbed({
  tokens: {
    primaryColor: "#007bff",
    fontSize: 16,
    borderRadius: 4,
  },
  // ... other props
});
```

Note: Token application is handled by component implementations.

## Legacy Mounts

React and Vue mount methods are placeholders for backwards compatibility. They currently fall back to `mountJSON`. Full React/Vue integration will be added in future releases.

## Related Packages

- [`@json-render/contracts`](../contracts) - Type contracts
- [`@json-render/wc-renderer`](../wc-renderer) - Render-only WC engine
- [`@json-render/wc-builder`](../wc-builder) - WC compiler
- [`@json-render/core`](../core) - Core types and utilities

## License

Apache-2.0
