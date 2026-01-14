# json-render

**JSON becomes real things.** Define your catalog, register your components, let AI generate.

```bash
npm install @json-render/core @json-render/react
```

## Why json-render?

Unlike vibe-coding tools that generate arbitrary code, json-render gives AI a **constrained vocabulary**. Perfect for enterprise apps where you need:

- **Consistency** — AI only uses your approved components
- **Safety** — Actions are declared by name, you control what they do
- **Flexibility** — Works for UI, backend, anything

## Quick Start

### 1. Define Your Catalog (what AI can use)

```typescript
import { createCatalog } from '@json-render/core';
import { z } from 'zod';

const catalog = createCatalog({
  components: {
    Card: {
      props: z.object({ title: z.string() }),
      hasChildren: true,
    },
    Metric: {
      props: z.object({
        label: z.string(),
        valuePath: z.string(),      // Binds to your data
        format: z.enum(['currency', 'percent', 'number']),
      }),
    },
    Button: {
      props: z.object({
        label: z.string(),
        action: ActionSchema,        // AI declares intent, you handle it
      }),
    },
  },
  actions: {
    export_report: { description: 'Export dashboard to PDF' },
    refresh_data: { description: 'Refresh all metrics' },
  },
});
```

### 2. Register Your Components (how they render)

```tsx
const registry = {
  Card: ({ element, children }) => (
    <div className="card">
      <h3>{element.props.title}</h3>
      {children}
    </div>
  ),
  Metric: ({ element }) => {
    const value = useDataValue(element.props.valuePath);
    return <div className="metric">{format(value)}</div>;
  },
  Button: ({ element, onAction }) => (
    <button onClick={() => onAction(element.props.action)}>
      {element.props.label}
    </button>
  ),
};
```

### 3. Let AI Generate

```tsx
import { DataProvider, ActionProvider, Renderer, useUIStream } from '@json-render/react';

function Dashboard() {
  const { tree, send } = useUIStream({ api: '/api/generate' });

  return (
    <DataProvider initialData={{ revenue: 125000, growth: 0.15 }}>
      <ActionProvider actions={{
        export_report: () => downloadPDF(),
        refresh_data: () => refetch(),
      }}>
        <input
          placeholder="Create a revenue dashboard..."
          onKeyDown={(e) => e.key === 'Enter' && send(e.target.value)}
        />
        <Renderer tree={tree} components={registry} />
      </ActionProvider>
    </DataProvider>
  );
}
```

**That's it.** AI generates JSON, you render it safely.

---

## Features

### Conditional Visibility

Show/hide components based on data, auth, or complex logic:

```json
{
  "type": "Alert",
  "props": { "message": "Error occurred" },
  "visible": {
    "and": [
      { "path": "/form/hasError" },
      { "not": { "path": "/form/errorDismissed" } }
    ]
  }
}
```

```json
{
  "type": "AdminPanel",
  "visible": { "auth": "signedIn" }
}
```

### Rich Actions

Actions with confirmation dialogs and callbacks:

```json
{
  "type": "Button",
  "props": {
    "label": "Refund Payment",
    "action": {
      "name": "refund",
      "params": {
        "paymentId": { "path": "/selected/id" },
        "amount": { "path": "/refund/amount" }
      },
      "confirm": {
        "title": "Confirm Refund",
        "message": "Refund ${/refund/amount} to customer?",
        "variant": "danger"
      },
      "onSuccess": { "set": { "/ui/success": true } },
      "onError": { "set": { "/ui/error": "$error.message" } }
    }
  }
}
```

### Built-in Validation

```json
{
  "type": "TextField",
  "props": {
    "label": "Email",
    "valuePath": "/form/email",
    "checks": [
      { "fn": "required", "message": "Email is required" },
      { "fn": "email", "message": "Invalid email" }
    ],
    "validateOn": "blur"
  }
}
```

---

## Packages

| Package | Description |
|---------|-------------|
| `@json-render/core` | Types, schemas, visibility, actions, validation |
| `@json-render/react` | React renderer, providers, hooks |

## Demo

```bash
git clone https://github.com/vercel-labs/json-render
cd json-render
pnpm install
pnpm dev
```

- http://localhost:3000 — Docs & Playground
- http://localhost:3001 — Example Dashboard

## Project Structure

```
json-render/
├── packages/
│   ├── core/        → @json-render/core
│   └── react/       → @json-render/react
├── apps/
│   └── web/         → Docs & Playground site
└── examples/
    └── dashboard/   → Example dashboard app
```

## How It Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Prompt    │────▶│  AI + Catalog│────▶│  JSON Tree  │
│ "dashboard" │     │  (constrained)    │  (safe)     │
└─────────────┘     └──────────────┘     └─────────────┘
                                               │
                    ┌──────────────┐            │
                    │  Your React  │◀───────────┘
                    │  Components  │
                    └──────────────┘
```

1. **You define the catalog** — what components exist, what props they take
2. **AI generates JSON** — constrained to your catalog
3. **You render it** — with your own components
4. **Actions are safe** — AI declares intent (`"refund"`), you implement it

## License

Apache-2.0
