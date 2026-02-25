---
name: json-render-svelte
description: Svelte 5 renderer for json-render that turns JSON specs into Svelte components. Use when working with @json-render/svelte, building Svelte UIs from JSON, creating component catalogs, or rendering AI-generated specs.
---

# @json-render/svelte

Svelte 5 renderer that converts JSON specs into Svelte component trees. Uses runes (`$state`, `$derived`, `$props`) and modern template syntax (`{#snippet}`, `{@render}`).

## Quick Start

```svelte
<script lang="ts">
  import { Renderer, JsonUIProvider } from "@json-render/svelte";
  import type { Spec } from "@json-render/svelte";
  import Card from "./components/Card.svelte";
  import Button from "./components/Button.svelte";

  interface Props {
    spec: Spec;
  }

  let { spec }: Props = $props();

  const registry = { Card, Button };
</script>

<JsonUIProvider>
  <Renderer {spec} {registry} />
</JsonUIProvider>
```

## Creating a Catalog

```typescript
import { defineCatalog } from "@json-render/core";
import { schema, defineRegistry } from "@json-render/svelte";
import { z } from "zod";

// Create catalog with props schemas
export const catalog = defineCatalog(schema, {
  components: {
    Button: {
      props: z.object({
        label: z.string(),
        variant: z.enum(["primary", "secondary"]).nullable(),
      }),
      description: "Clickable button",
    },
    Card: {
      props: z.object({ title: z.string() }),
      description: "Card container with title",
    },
  },
});
```

## Defining Components

Components must be `.svelte` files that accept `ComponentRenderProps`:

```typescript
interface ComponentRenderProps<TProps> {
  element: UIElement<string, TProps>; // The element with resolved props
  bindings?: Record<string, string>; // Map of prop names to state paths (for $bindState)
  loading?: boolean; // True while spec is streaming
  emit: (event: string) => void; // Fire a named event
  children?: Snippet; // Child elements (use {@render children()})
}
```

```svelte
<!-- Button.svelte -->
<script lang="ts">
  import type { ComponentRenderProps } from "@json-render/svelte";

  interface Props extends ComponentRenderProps<{ label: string; variant?: string }> {}

  let { element, emit, bindings, loading }: Props = $props();
</script>

<button class={element.props.variant} onclick={() => emit("press")}>
  {element.props.label}
</button>
```

```svelte
<!-- Card.svelte -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ComponentRenderProps } from "@json-render/svelte";

  interface Props extends ComponentRenderProps<{ title: string }> {
    children?: Snippet;
  }

  let { element, children, emit, bindings, loading }: Props = $props();
</script>

<div class="card">
  <h2>{element.props.title}</h2>
  {#if children}
    {@render children()}
  {/if}
</div>
```

## Creating a Registry

```typescript
import { defineRegistry } from "@json-render/svelte";
import { catalog } from "./catalog";
import Card from "./components/Card.svelte";
import Button from "./components/Button.svelte";

const { registry, handlers, executeAction } = defineRegistry(catalog, {
  components: {
    Card,
    Button,
  },
  actions: {
    submit: async (params, setState, state) => {
      // handle action
    },
  },
});
```

## Spec Structure (Element Tree)

The Svelte schema uses the element tree format:

```json
{
  "root": "card1",
  "elements": {
    "card1": {
      "type": "Card",
      "props": { "title": "Hello" },
      "children": ["btn1"]
    },
    "btn1": {
      "type": "Button",
      "props": { "label": "Click me" }
    }
  }
}
```

## Visibility Conditions

Use `visible` on elements to show/hide based on state:

- `{ "$state": "/path" }` - truthy check
- `{ "$state": "/path", "eq": value }` - equality check
- `{ "$state": "/path", "not": true }` - falsy check
- `{ "$and": [cond1, cond2] }` - AND conditions
- `{ "$or": [cond1, cond2] }` - OR conditions

## Providers (via JsonUIProvider)

`JsonUIProvider` composes all contexts. Individual contexts:

| Context             | Purpose                                            |
| ------------------- | -------------------------------------------------- |
| `StateContext`      | Share state across components (JSON Pointer paths) |
| `ActionContext`     | Handle actions dispatched via the event system     |
| `VisibilityContext` | Enable conditional rendering based on state        |
| `ValidationContext` | Form field validation                              |

## Dynamic Prop Expressions

Any prop value can be a data-driven expression resolved before components receive props:

- **`{ "$state": "/state/key" }`** - reads from state model (one-way read)
- **`{ "$bindState": "/path" }`** - two-way binding: reads from state and enables write-back
- **`{ "$bindItem": "field" }`** - two-way binding to a repeat item field
- **`{ "$cond": <condition>, "$then": <value>, "$else": <value> }`** - conditional value

```json
{
  "type": "Input",
  "props": {
    "value": { "$bindState": "/form/email" },
    "placeholder": "Email"
  }
}
```

## Event System

Components use `emit` to fire named events. The element's `on` field maps events to action bindings:

```svelte
<!-- Button.svelte -->
<script lang="ts">
  import type { ComponentRenderProps } from "@json-render/svelte";

  interface Props extends ComponentRenderProps<{ label: string }> {}

  let { element, emit }: Props = $props();
</script>

<button onclick={() => emit("press")}>{element.props.label}</button>
```

```json
{
  "type": "Button",
  "props": { "label": "Submit" },
  "on": { "press": { "action": "submit" } }
}
```

## Built-in Actions

The `setState` action is handled automatically and updates the state model:

```json
{
  "action": "setState",
  "actionParams": { "statePath": "/activeTab", "value": "home" }
}
```

Other built-in actions: `pushState`, `removeState`, `push`, `pop`.

## Two-Way Binding in Components

For form components that need two-way binding, prefer `getBoundProp`:

```svelte
<!-- Input.svelte -->
<script lang="ts">
  import type { ComponentRenderProps } from "@json-render/svelte";
  import { getBoundProp } from "@json-render/svelte";

  interface Props extends ComponentRenderProps<{ value?: string; placeholder?: string }> {}

  let { element, bindings }: Props = $props();

  let value = getBoundProp<string>(
    () => element.props.value as string | undefined,
    bindings?.value
  );
</script>

<input
  bind:value={value.current}
  placeholder={element.props.placeholder}
/>
```

## Accessing Contexts

Prefer helpers for common operations. They return an object with a reactive `.current` property.
For `getStateValue` and `getBoundProp`, `.current` is writable:

```svelte
<script lang="ts">
  import {
    getStateValue,
    getBoundProp,
    isVisible,
    getAction,
  } from "@json-render/svelte";

  let username = getStateValue("/user/name");

  // Read state
  $effect(() => console.log(username.current));

  // Update state (writeable .current)
  function updateName(name: string) {
    username.current = name;
  }

  // Similarly ...

  // Bind a resolved prop with optional write-back path
  let valueBinding = getBoundProp<string>(() => "", "/form/name");

  // Visibility check
  let showAdmin = isVisible({ "$state": "/user/isAdmin" });

  // Read registered action handler
  let submitHandler = getAction("submit");
</script>
```

Use direct context access for advanced scenarios (bulk operations, full context APIs):

```svelte
<script lang="ts">
  import {
    getStateContext,
    getActionContext,
    getVisibilityContext,
    getValidationContext,
  } from "@json-render/svelte";

  const stateCtx = getStateContext();
  const actionCtx = getActionContext();

  // Execute action
  async function submit() {
    await actionCtx.execute({ action: "submit", params: { data: stateCtx.state } });
  }
</script>
```

## Streaming UI

```svelte
<script lang="ts">
  import { createUIStream, Renderer } from "@json-render/svelte";

  const stream = createUIStream({
    endpoint: "/api/generate-ui",
    onComplete: (spec) => console.log("Done", spec),
  });

  async function generate() {
    await stream.start({ prompt: "Create a login form" });
  }
</script>

<button onclick={generate} disabled={stream.loading}>
  {stream.loading ? "Generating..." : "Generate UI"}
</button>

{#if stream.spec}
  <Renderer spec={stream.spec} {registry} loading={stream.loading} />
{/if}
```

## Key Exports

| Export                 | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| `defineRegistry`       | Create a type-safe component registry from a catalog |
| `Renderer`             | Render a spec using a registry                       |
| `JsonUIProvider`       | Provide all contexts to the component tree           |
| `schema`               | Element tree schema                                  |
| `getStateValue`        | Read/write state via `.current` (preferred)          |
| `getBoundProp`         | Read/write bound prop via `.current` (preferred)     |
| `isVisible`            | Evaluate visibility via `.current` (preferred)       |
| `getAction`            | Read action handler via `.current` (preferred)       |
| `getStateContext`      | Access full state context (advanced)                 |
| `getActionContext`     | Access full actions context (advanced)               |
| `getVisibilityContext` | Access full visibility context (advanced)            |
| `getValidationContext` | Access validation context                            |
| `createUIStream`       | Stream specs from an API endpoint                    |
| `createChatUI`         | Chat interface with integrated UI generation         |
