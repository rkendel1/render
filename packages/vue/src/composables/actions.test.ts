import { describe, it, expect, vi } from "vitest";
import { defineComponent, h, createApp, nextTick } from "vue";
import { ActionProvider, useActions } from "./actions.js";
import { StateProvider, useStateStore } from "./state.js";
import { VisibilityProvider } from "./visibility.js";
import { ValidationProvider } from "./validation.js";

function runInProviders<T>(
  initialState: Record<string, unknown>,
  fn: () => T,
  handlers?: Record<string, (...args: unknown[]) => void>,
): T {
  let result: T | undefined;

  const Inner = defineComponent({
    setup() {
      result = fn();
      return () => null;
    },
  });

  const App = defineComponent({
    setup() {
      return () =>
        h(StateProvider, { initialState }, () =>
          h(VisibilityProvider, null, () =>
            h(ValidationProvider, null, () =>
              h(ActionProvider, { handlers: handlers ?? {} }, () => h(Inner)),
            ),
          ),
        );
    },
  });

  const container = document.createElement("div");
  const app = createApp(App);
  app.mount(container);
  app.unmount();

  return result!;
}

describe("useActions", () => {
  it("provides execute function", () => {
    const ctx = runInProviders({}, () => useActions());
    expect(typeof ctx.execute).toBe("function");
  });

  it("provides confirm and cancel functions", () => {
    const ctx = runInProviders({}, () => useActions());
    expect(typeof ctx.confirm).toBe("function");
    expect(typeof ctx.cancel).toBe("function");
  });
});

describe("action execution", () => {
  it("executes setState action", async () => {
    let storeCtx: ReturnType<typeof useStateStore> | undefined;
    let actionsCtx: ReturnType<typeof useActions> | undefined;

    const Inner = defineComponent({
      setup() {
        storeCtx = useStateStore();
        actionsCtx = useActions();
        return () => null;
      },
    });

    const App = defineComponent({
      setup() {
        return () =>
          h(StateProvider, { initialState: { count: 0 } }, () =>
            h(VisibilityProvider, null, () =>
              h(ValidationProvider, null, () =>
                h(ActionProvider, { handlers: {} }, () => h(Inner)),
              ),
            ),
          );
      },
    });

    const container = document.createElement("div");
    const app = createApp(App);
    app.mount(container);

    await actionsCtx!.execute({
      action: "setState",
      params: { statePath: "/count", value: 42 },
    });

    expect(storeCtx!.get("/count")).toBe(42);

    app.unmount();
  });

  it("executes pushState action", async () => {
    let storeCtx: ReturnType<typeof useStateStore> | undefined;
    let actionsCtx: ReturnType<typeof useActions> | undefined;

    const Inner = defineComponent({
      setup() {
        storeCtx = useStateStore();
        actionsCtx = useActions();
        return () => null;
      },
    });

    const App = defineComponent({
      setup() {
        return () =>
          h(StateProvider, { initialState: { items: ["a"] } }, () =>
            h(VisibilityProvider, null, () =>
              h(ValidationProvider, null, () =>
                h(ActionProvider, { handlers: {} }, () => h(Inner)),
              ),
            ),
          );
      },
    });

    const container = document.createElement("div");
    const app = createApp(App);
    app.mount(container);

    await actionsCtx!.execute({
      action: "pushState",
      params: { statePath: "/items", value: "b" },
    });

    expect(storeCtx!.get("/items")).toEqual(["a", "b"]);

    app.unmount();
  });

  it("executes removeState action", async () => {
    let storeCtx: ReturnType<typeof useStateStore> | undefined;
    let actionsCtx: ReturnType<typeof useActions> | undefined;

    const Inner = defineComponent({
      setup() {
        storeCtx = useStateStore();
        actionsCtx = useActions();
        return () => null;
      },
    });

    const App = defineComponent({
      setup() {
        return () =>
          h(StateProvider, { initialState: { items: ["a", "b", "c"] } }, () =>
            h(VisibilityProvider, null, () =>
              h(ValidationProvider, null, () =>
                h(ActionProvider, { handlers: {} }, () => h(Inner)),
              ),
            ),
          );
      },
    });

    const container = document.createElement("div");
    const app = createApp(App);
    app.mount(container);

    await actionsCtx!.execute({
      action: "removeState",
      params: { statePath: "/items", index: 1 },
    });

    expect(storeCtx!.get("/items")).toEqual(["a", "c"]);

    app.unmount();
  });

  it("warns when no handler is registered for custom action", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const actionsCtx = runInProviders({}, () => useActions());

    // The provider is unmounted, but execute still runs synchronously for the warn path
    // We need a mounted tree for this test
    let actions: ReturnType<typeof useActions> | undefined;

    const Inner = defineComponent({
      setup() {
        actions = useActions();
        return () => null;
      },
    });

    const App = defineComponent({
      setup() {
        return () =>
          h(StateProvider, { initialState: {} }, () =>
            h(VisibilityProvider, null, () =>
              h(ValidationProvider, null, () =>
                h(ActionProvider, { handlers: {} }, () => h(Inner)),
              ),
            ),
          );
      },
    });

    const container = document.createElement("div");
    const app = createApp(App);
    app.mount(container);

    await actions!.execute({ action: "unknownAction" });

    expect(warnSpy).toHaveBeenCalledWith(
      "No handler registered for action: unknownAction",
    );

    warnSpy.mockRestore();
    app.unmount();
  });
});
