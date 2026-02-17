import { describe, it, expect, vi } from "vitest";
import { createStateContext, type StateContext } from "./state.svelte";

describe("createStateContext", () => {
  it("provides initial state to consumers", () => {
    const ctx = createStateContext({ user: { name: "John" } });

    expect(ctx.state).toEqual({ user: { name: "John" } });
  });

  it("provides empty object when no initial state", () => {
    const ctx = createStateContext();

    expect(ctx.state).toEqual({});
  });
});

describe("StateContext.get", () => {
  it("retrieves values by path", () => {
    const ctx = createStateContext({ user: { name: "John", age: 30 } });

    expect(ctx.get("/user/name")).toBe("John");
    expect(ctx.get("/user/age")).toBe(30);
  });

  it("returns undefined for missing path", () => {
    const ctx = createStateContext({ user: { name: "John" } });

    expect(ctx.get("/user/email")).toBeUndefined();
    expect(ctx.get("/nonexistent")).toBeUndefined();
  });
});

describe("StateContext.set", () => {
  it("updates values at path", () => {
    const ctx = createStateContext({ count: 0 });

    ctx.set("/count", 5);

    expect(ctx.state.count).toBe(5);
  });

  it("creates nested paths", () => {
    const ctx = createStateContext({});

    ctx.set("/user/name", "Jane");

    expect(ctx.get("/user/name")).toBe("Jane");
  });

  it("calls onStateChange callback when state changes", () => {
    const onStateChange = vi.fn();
    const ctx = createStateContext({ value: 1 }, onStateChange);

    ctx.set("/value", 2);

    expect(onStateChange).toHaveBeenCalledWith("/value", 2);
  });
});

describe("StateContext.update", () => {
  it("handles multiple values at once", () => {
    const ctx = createStateContext({ a: 1, b: 2 });

    ctx.update({ "/a": 10, "/b": 20 });

    expect(ctx.state.a).toBe(10);
    expect(ctx.state.b).toBe(20);
  });

  it("calls onStateChange for each update", () => {
    const onStateChange = vi.fn();
    const ctx = createStateContext({ x: 0, y: 0 }, onStateChange);

    ctx.update({ "/x": 1, "/y": 2 });

    expect(onStateChange).toHaveBeenCalledWith("/x", 1);
    expect(onStateChange).toHaveBeenCalledWith("/y", 2);
    expect(onStateChange).toHaveBeenCalledTimes(2);
  });
});

describe("StateContext nested paths", () => {
  it("handles deeply nested state paths", () => {
    const ctx = createStateContext({
      app: {
        settings: {
          theme: "light",
          notifications: { enabled: true },
        },
      },
    });

    expect(ctx.get("/app/settings/theme")).toBe("light");
    expect(ctx.get("/app/settings/notifications/enabled")).toBe(true);

    ctx.set("/app/settings/theme", "dark");

    expect(ctx.get("/app/settings/theme")).toBe("dark");
  });

  it("handles array indices in paths", () => {
    const ctx = createStateContext({
      items: ["a", "b", "c"],
    });

    expect(ctx.get("/items/0")).toBe("a");
    expect(ctx.get("/items/1")).toBe("b");

    ctx.set("/items/1", "B");

    expect(ctx.get("/items/1")).toBe("B");
  });
});
