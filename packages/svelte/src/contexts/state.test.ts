import { describe, it, expect, vi } from "vitest";
import { mount, unmount } from "svelte";
import { createStateStore } from "@json-render/core";
import { createStateContext } from "./state.svelte";

function component(runTest: () => void) {
  return () => {
    const c = mount(
      (() => {
        runTest();
      }) as any,
      { target: document.body },
    );
    unmount(c);
  };
}

describe("createStateContext", () => {
  it(
    "provides initial state to consumers",
    component(() => {
      const ctx = createStateContext({
        initialState: { user: { name: "John" } },
      });

      expect(ctx.state).toEqual({ user: { name: "John" } });
    }),
  );

  it(
    "provides empty object when no initial state",
    component(() => {
      const ctx = createStateContext();

      expect(ctx.state).toEqual({});
    }),
  );
});

describe("StateContext.get", () => {
  it(
    "retrieves values by path",
    component(() => {
      const ctx = createStateContext({
        initialState: { user: { name: "John", age: 30 } },
      });

      expect(ctx.get("/user/name")).toBe("John");
      expect(ctx.get("/user/age")).toBe(30);
    }),
  );

  it(
    "returns undefined for missing path",
    component(() => {
      const ctx = createStateContext({
        initialState: { user: { name: "John" } },
      });

      expect(ctx.get("/user/email")).toBeUndefined();
      expect(ctx.get("/nonexistent")).toBeUndefined();
    }),
  );
});

describe("StateContext.set", () => {
  it(
    "updates values at path",
    component(() => {
      const ctx = createStateContext({ initialState: { count: 0 } });

      ctx.set("/count", 5);

      expect(ctx.state.count).toBe(5);
    }),
  );

  it(
    "creates nested paths",
    component(() => {
      const ctx = createStateContext({});

      ctx.set("/user/name", "Jane");

      expect(ctx.get("/user/name")).toBe("Jane");
    }),
  );

  it(
    "calls onStateChange callback with change entries",
    component(() => {
      const onStateChange = vi.fn();
      const ctx = createStateContext({
        initialState: { value: 1 },
        onStateChange,
      });

      ctx.set("/value", 2);

      expect(onStateChange).toHaveBeenCalledWith([
        { path: "/value", value: 2 },
      ]);
    }),
  );
});

describe("StateContext.update", () => {
  it(
    "handles multiple values at once",
    component(() => {
      const ctx = createStateContext({ initialState: { a: 1, b: 2 } });

      ctx.update({ "/a": 10, "/b": 20 });

      expect(ctx.state.a).toBe(10);
      expect(ctx.state.b).toBe(20);
    }),
  );

  it(
    "calls onStateChange once with all changed updates",
    component(() => {
      const onStateChange = vi.fn();
      const ctx = createStateContext({
        initialState: { x: 0, y: 0 },
        onStateChange,
      });

      ctx.update({ "/x": 1, "/y": 2 });

      expect(onStateChange).toHaveBeenCalledWith([
        { path: "/x", value: 1 },
        { path: "/y", value: 2 },
      ]);
      expect(onStateChange).toHaveBeenCalledTimes(1);
    }),
  );
});

describe("StateContext nested paths", () => {
  it(
    "handles deeply nested state paths",
    component(() => {
      const ctx = createStateContext({
        initialState: {
          app: {
            settings: {
              theme: "light",
              notifications: { enabled: true },
            },
          },
        },
      });

      expect(ctx.get("/app/settings/theme")).toBe("light");
      expect(ctx.get("/app/settings/notifications/enabled")).toBe(true);

      ctx.set("/app/settings/theme", "dark");

      expect(ctx.get("/app/settings/theme")).toBe("dark");
    }),
  );

  it(
    "handles array indices in paths",
    component(() => {
      const ctx = createStateContext({
        initialState: {
          items: ["a", "b", "c"],
        },
      });

      expect(ctx.get("/items/0")).toBe("a");
      expect(ctx.get("/items/1")).toBe("b");

      ctx.set("/items/1", "B");

      expect(ctx.get("/items/1")).toBe("B");
    }),
  );
});

describe("controlled mode", () => {
  it(
    "reads and writes through external StateStore",
    component(() => {
      const store = createStateStore({ count: 1 });
      const onStateChange = vi.fn();
      const ctx = createStateContext({ store, onStateChange });

      expect(ctx.get("/count")).toBe(1);
      ctx.set("/count", 2);
      expect(store.get("/count")).toBe(2);
      expect(onStateChange).not.toHaveBeenCalled();
    }),
  );
});
