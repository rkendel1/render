import { describe, it, expect } from "vitest";
import { h, createApp, defineComponent } from "vue";
import { Renderer, type ComponentRenderer } from "./renderer.js";

describe("Renderer", () => {
  it("renders nothing for null spec", () => {
    let rendered = false;
    const App = defineComponent({
      setup() {
        return () => {
          rendered = true;
          return h(Renderer, { spec: null, registry: {} });
        };
      },
    });

    const container = document.createElement("div");
    const app = createApp(App);
    app.mount(container);
    expect(rendered).toBe(true);
    expect(container.innerHTML).toBe("<!---->"); // Vue comment node for null
    app.unmount();
  });

  it("renders nothing for spec without root", () => {
    const App = defineComponent({
      setup() {
        return () =>
          h(Renderer, { spec: { root: "", elements: {} }, registry: {} });
      },
    });

    const container = document.createElement("div");
    const app = createApp(App);
    app.mount(container);
    expect(container.innerHTML).toBe("<!---->");
    app.unmount();
  });

  it("accepts loading prop", () => {
    const App = defineComponent({
      setup() {
        return () => h(Renderer, { spec: null, registry: {}, loading: true });
      },
    });

    const container = document.createElement("div");
    const app = createApp(App);
    app.mount(container);
    app.unmount();
  });

  it("accepts fallback prop", () => {
    const Fallback = defineComponent({
      setup() {
        return () => h("div", null, "Unknown component");
      },
    });

    const App = defineComponent({
      setup() {
        return () =>
          h(Renderer, {
            spec: null,
            registry: {},
            fallback: Fallback as unknown as ComponentRenderer,
          });
      },
    });

    const container = document.createElement("div");
    const app = createApp(App);
    app.mount(container);
    app.unmount();
  });
});
