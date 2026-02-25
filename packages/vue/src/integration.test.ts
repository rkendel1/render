import { describe, it, expect } from "vitest";
import { defineComponent, h, createApp, nextTick, type VNode } from "vue";
import type { Spec } from "@json-render/core";
import {
  JSONUIProvider,
  Renderer,
  type ComponentRenderProps,
} from "./renderer.js";
import { useStateStore } from "./composables/state.js";
import { useActions } from "./composables/actions.js";
import { useBoundProp } from "./hooks.js";
import type { EventHandle } from "./catalog-types.js";

// =============================================================================
// Stub components
// =============================================================================

const Button = defineComponent({
  name: "Button",
  props: {
    element: { type: Object, required: true },
    emit: { type: Function, required: true },
    on: { type: Function, required: true },
    bindings: { type: Object, default: undefined },
    loading: { type: Boolean, default: false },
  },
  setup(props) {
    return () =>
      h(
        "button",
        {
          "data-testid": "btn",
          onClick: () => (props.emit as (e: string) => void)("press"),
        },
        (props.element as any).props.label,
      );
  },
});

const Text = defineComponent({
  name: "Text",
  props: {
    element: { type: Object, required: true },
    emit: { type: Function, required: true },
    on: { type: Function, required: true },
    bindings: { type: Object, default: undefined },
    loading: { type: Boolean, default: false },
  },
  setup(props) {
    return () => {
      const value = (props.element as any).props.text;
      return h(
        "span",
        { "data-testid": "text" },
        value == null
          ? ""
          : typeof value === "string"
            ? value
            : JSON.stringify(value),
      );
    };
  },
});

const Stack = defineComponent({
  name: "Stack",
  props: {
    element: { type: Object, required: true },
    emit: { type: Function, required: true },
    on: { type: Function, required: true },
    bindings: { type: Object, default: undefined },
    loading: { type: Boolean, default: false },
  },
  setup(_, { slots }) {
    return () => h("div", { "data-testid": "stack" }, slots.default?.());
  },
});

const Input = defineComponent({
  name: "Input",
  props: {
    element: { type: Object, required: true },
    emit: { type: Function, required: true },
    on: { type: Function, required: true },
    bindings: { type: Object, default: undefined },
    loading: { type: Boolean, default: false },
  },
  setup(props) {
    return () => {
      const elProps = (props.element as any).props;
      const [value, setValue] = useBoundProp<string>(
        elProps.value as string | undefined,
        (props.bindings as Record<string, string> | undefined)?.value,
      );
      return h("input", {
        "data-testid": "input",
        value: value ?? "",
        onInput: (e: Event) => setValue((e.target as HTMLInputElement).value),
      });
    };
  },
});

const StateProbe = defineComponent({
  name: "StateProbe",
  setup() {
    const { state } = useStateStore();
    return () =>
      h("pre", { "data-testid": "state-probe" }, JSON.stringify(state));
  },
});

import type { ComponentRegistry } from "./renderer.js";

const registry: ComponentRegistry = { Button, Text, Stack, Input } as any;

// =============================================================================
// Helpers
// =============================================================================

function mountApp(spec: Spec, initialState?: Record<string, unknown>) {
  const container = document.createElement("div");

  const App = defineComponent({
    setup() {
      return () =>
        h(
          JSONUIProvider,
          { registry, initialState: initialState ?? spec.state ?? {} },
          () => [h(Renderer, { spec, registry }), h(StateProbe)],
        );
    },
  });

  const app = createApp(App);
  app.mount(container);

  const getState = () => {
    const probe = container.querySelector("[data-testid='state-probe']");
    return JSON.parse(probe!.textContent!);
  };

  return { container, app, getState };
}

// =============================================================================
// Tests
// =============================================================================

describe("integration: basic rendering", () => {
  it("renders a simple spec with text", async () => {
    const spec: Spec = {
      root: "main",
      elements: {
        main: { type: "Text", props: { text: "Hello World" } },
      },
    };

    const { container, app } = mountApp(spec);
    await nextTick();

    const text = container.querySelector("[data-testid='text']");
    expect(text?.textContent).toBe("Hello World");

    app.unmount();
  });

  it("renders nested elements", async () => {
    const spec: Spec = {
      root: "stack",
      elements: {
        stack: { type: "Stack", props: {}, children: ["t1", "t2"] },
        t1: { type: "Text", props: { text: "First" } },
        t2: { type: "Text", props: { text: "Second" } },
      },
    };

    const { container, app } = mountApp(spec);
    await nextTick();

    const texts = container.querySelectorAll("[data-testid='text']");
    expect(texts.length).toBe(2);
    expect(texts[0]?.textContent).toBe("First");
    expect(texts[1]?.textContent).toBe("Second");

    app.unmount();
  });
});

describe("integration: state binding", () => {
  it("resolves $state expressions in props", async () => {
    const spec: Spec = {
      root: "main",
      state: { greeting: "Hello from state" },
      elements: {
        main: { type: "Text", props: { text: { $state: "/greeting" } } },
      },
    };

    const { container, app } = mountApp(spec);
    await nextTick();

    const text = container.querySelector("[data-testid='text']");
    expect(text?.textContent).toBe("Hello from state");

    app.unmount();
  });
});

describe("integration: actions", () => {
  it("executes setState via action context", async () => {
    let storeRef: ReturnType<typeof useStateStore> | undefined;
    let actionsRef: { execute: (b: any) => Promise<void> } | undefined;

    const Probe = defineComponent({
      name: "ActionProbe",
      setup() {
        storeRef = useStateStore();
        const { execute } = useActions();
        actionsRef = { execute };
        return () => null;
      },
    });

    const container = document.createElement("div");
    const App = defineComponent({
      setup() {
        return () =>
          h(
            JSONUIProvider,
            { registry, initialState: { clicked: false } },
            () => h(Probe),
          );
      },
    });

    const app = createApp(App);
    app.mount(container);
    await nextTick();

    expect(storeRef!.get("/clicked")).toBe(false);

    await actionsRef!.execute({
      action: "setState",
      params: { statePath: "/clicked", value: true },
    });

    expect(storeRef!.get("/clicked")).toBe(true);

    app.unmount();
  });

  it("chains pushState and setState with $state resolution", async () => {
    let storeRef: ReturnType<typeof useStateStore> | undefined;
    let actionsRef: { execute: (b: any) => Promise<void> } | undefined;

    const Probe = defineComponent({
      name: "ActionProbe",
      setup() {
        storeRef = useStateStore();
        const { execute } = useActions();
        actionsRef = { execute };
        return () => null;
      },
    });

    const container = document.createElement("div");
    const App = defineComponent({
      setup() {
        return () =>
          h(
            JSONUIProvider,
            {
              registry,
              initialState: { items: ["initial"], observed: "not yet set" },
            },
            () => h(Probe),
          );
      },
    });

    const app = createApp(App);
    app.mount(container);
    await nextTick();

    await actionsRef!.execute({
      action: "pushState",
      params: { statePath: "/items", value: "new-item" },
    });

    await actionsRef!.execute({
      action: "setState",
      params: {
        statePath: "/observed",
        value: { $state: "/items" },
      },
    });

    expect(storeRef!.get("/items")).toEqual(["initial", "new-item"]);
    expect(storeRef!.get("/observed")).toEqual(["initial", "new-item"]);

    app.unmount();
  });
});

describe("integration: visibility", () => {
  it("hides elements when visible is false", async () => {
    const spec: Spec = {
      root: "stack",
      state: { show: false },
      elements: {
        stack: { type: "Stack", props: {}, children: ["hidden", "visible"] },
        hidden: {
          type: "Text",
          props: { text: "Hidden" },
          visible: { $state: "/show" },
        },
        visible: { type: "Text", props: { text: "Visible" } },
      },
    };

    const { container, app } = mountApp(spec);
    await nextTick();

    const texts = container.querySelectorAll("[data-testid='text']");
    expect(texts.length).toBe(1);
    expect(texts[0]?.textContent).toBe("Visible");

    app.unmount();
  });

  it("shows elements when visible condition is true", async () => {
    const spec: Spec = {
      root: "stack",
      state: { show: true },
      elements: {
        stack: { type: "Stack", props: {}, children: ["conditional"] },
        conditional: {
          type: "Text",
          props: { text: "Shown" },
          visible: { $state: "/show" },
        },
      },
    };

    const { container, app } = mountApp(spec);
    await nextTick();

    const texts = container.querySelectorAll("[data-testid='text']");
    expect(texts.length).toBe(1);
    expect(texts[0]?.textContent).toBe("Shown");

    app.unmount();
  });
});

describe("integration: repeat", () => {
  it("renders repeated elements from state array", async () => {
    const spec: Spec = {
      root: "list",
      state: { items: ["apple", "banana", "cherry"] },
      elements: {
        list: {
          type: "Stack",
          props: {},
          repeat: { statePath: "/items" },
          children: ["item"],
        },
        item: {
          type: "Text",
          props: { text: { $item: "." } },
        },
      },
    };

    const { container, app } = mountApp(spec);
    await nextTick();

    const texts = container.querySelectorAll("[data-testid='text']");
    expect(texts.length).toBe(3);

    app.unmount();
  });
});
