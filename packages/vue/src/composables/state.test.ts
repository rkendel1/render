import { describe, it, expect } from "vitest";
import { defineComponent, h, createApp, nextTick } from "vue";
import {
  StateProvider,
  useStateStore,
  useStateValue,
  useStateBinding,
} from "./state.js";

function runInStateProvider<T>(
  initialState: Record<string, unknown>,
  fn: () => T,
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
      return () => h(StateProvider, { initialState }, () => h(Inner));
    },
  });

  const container = document.createElement("div");
  const app = createApp(App);
  app.mount(container);
  app.unmount();

  return result!;
}

describe("StateProvider + useStateStore", () => {
  it("provides initial state and get/set round-trip", () => {
    const ctx = runInStateProvider({ count: 0 }, () => useStateStore());

    expect(ctx.get("/count")).toBe(0);
    ctx.set("/count", 42);
    expect(ctx.get("/count")).toBe(42);
  });

  it("state reflects initial values", () => {
    const ctx = runInStateProvider({ name: "Alice" }, () => useStateStore());
    expect(ctx.state.name).toBe("Alice");
  });

  it("getSnapshot returns current state", () => {
    const ctx = runInStateProvider({ x: 1 }, () => useStateStore());
    expect(ctx.getSnapshot().x).toBe(1);

    ctx.set("/x", 99);
    expect(ctx.getSnapshot().x).toBe(99);
  });

  it("update applies multiple changes", () => {
    const ctx = runInStateProvider({ a: 1, b: 2 }, () => useStateStore());

    ctx.update({ "/a": 10, "/b": 20 });
    expect(ctx.get("/a")).toBe(10);
    expect(ctx.get("/b")).toBe(20);
  });
});

describe("useStateValue", () => {
  it("reads a value from state", () => {
    const value = runInStateProvider({ name: "Alice" }, () =>
      useStateValue<string>("/name"),
    );
    expect(value).toBe("Alice");
  });

  it("returns undefined for missing path", () => {
    const value = runInStateProvider({}, () =>
      useStateValue<string>("/missing"),
    );
    expect(value).toBeUndefined();
  });
});

describe("useStateBinding", () => {
  it("returns value from state and a setter", () => {
    const [value, setValue] = runInStateProvider({ x: 42 }, () =>
      useStateBinding<number>("/x"),
    );
    expect(value).toBe(42);
    expect(typeof setValue).toBe("function");
  });

  it("returns undefined for missing path", () => {
    const [value] = runInStateProvider({}, () =>
      useStateBinding<string>("/missing"),
    );
    expect(value).toBeUndefined();
  });
});
