# @json-render/contracts

Type contracts for json-render Web Components. Defines the interface between render-only UI components and external behavior/state.

## Overview

`@json-render/contracts` provides TypeScript interfaces that establish the contract between:

- **UI Layer**: Render-only Web Components (no internal state)
- **Behavior Layer**: External runtime (WASM / context / host app)

This package contains **no implementation** — only types. It ensures type safety across the json-render Web Component ecosystem.

## Core Concepts

### RenderNode

The fundamental unit of render-only UI. Replaces React props with a platform-agnostic contract.

```typescript
interface RenderNode<P = Record<string, unknown>> {
  type: string;
  props?: P;
  children?: RenderNode[];
  key?: string;
}
```

### ComponentContract

Defines the full contract for a Web Component, including props, actions, and children.

```typescript
interface ComponentContract {
  name: string;
  description?: string;
  props?: PropContract[];
  actions?: ActionContract[];
  hasChildren?: boolean;
}
```

### RenderContext

Context passed to render functions, providing access to external state and action handlers.

```typescript
interface RenderContext {
  getValue?: (path: string) => unknown;
  triggerAction?: (action: string, params?: Record<string, unknown>) => void;
  loading?: boolean;
}
```

## Usage

Install:

```bash
npm install @json-render/contracts
```

Import types:

```typescript
import type {
  RenderNode,
  ComponentContract,
  RenderContext,
  RenderFunction,
} from "@json-render/contracts";
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Host Application                      │
│  (WASM / Context / External State Management)           │
└─────────────────────────────────────────────────────────┘
                            ▲
                            │ RenderContext
                            │ (getValue, triggerAction)
                            │
┌─────────────────────────────────────────────────────────┐
│              Render-Only Web Components                  │
│  (Pure presentation, no internal state)                 │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Card     │  │ Button   │  │ Metric   │              │
│  │ WC       │  │ WC       │  │ WC       │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
                            ▲
                            │ RenderNode
                            │ (type, props, children)
                            │
┌─────────────────────────────────────────────────────────┐
│                  @json-render/core                       │
│  (Catalog, Schema, Prop Resolution)                     │
└─────────────────────────────────────────────────────────┘
```

## Packages

- `@json-render/contracts` (this package) - Type definitions
- `@json-render/wc-renderer` - Web Component render engine
- `@json-render/wc-builder` - Catalog → custom element compiler

## License

Apache-2.0
