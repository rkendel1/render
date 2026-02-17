import { describe, it, expect, vi } from "vitest";
import { createStateContext } from "./state.svelte";
import { createActionContext } from "./actions.svelte";

describe("createActionContext", () => {
  it("executes built-in setState action", async () => {
    const stateCtx = createStateContext({ count: 0 });
    const actionCtx = createActionContext(stateCtx);

    await actionCtx.execute({
      action: "setState",
      params: { statePath: "/count", value: 5 },
    });

    expect(stateCtx.state.count).toBe(5);
  });

  it("executes built-in pushState action", async () => {
    const stateCtx = createStateContext({ items: ["a", "b"] });
    const actionCtx = createActionContext(stateCtx);

    await actionCtx.execute({
      action: "pushState",
      params: { statePath: "/items", value: "c" },
    });

    expect(stateCtx.state.items).toEqual(["a", "b", "c"]);
  });

  it("pushState creates array if missing", async () => {
    const stateCtx = createStateContext({});
    const actionCtx = createActionContext(stateCtx);

    await actionCtx.execute({
      action: "pushState",
      params: { statePath: "/newList", value: "first" },
    });

    expect(stateCtx.get("/newList")).toEqual(["first"]);
  });

  it("executes built-in removeState action", async () => {
    const stateCtx = createStateContext({ items: ["a", "b", "c"] });
    const actionCtx = createActionContext(stateCtx);

    await actionCtx.execute({
      action: "removeState",
      params: { statePath: "/items", index: 1 },
    });

    expect(stateCtx.state.items).toEqual(["a", "c"]);
  });

  it("executes push navigation action", async () => {
    const stateCtx = createStateContext({ currentScreen: "home" });
    const actionCtx = createActionContext(stateCtx);

    await actionCtx.execute({
      action: "push",
      params: { screen: "settings" },
    });

    expect(stateCtx.get("/currentScreen")).toBe("settings");
    expect(stateCtx.get("/navStack")).toEqual(["home"]);
  });

  it("executes pop navigation action", async () => {
    const stateCtx = createStateContext({
      currentScreen: "settings",
      navStack: ["home"],
    });
    const actionCtx = createActionContext(stateCtx);

    await actionCtx.execute({ action: "pop" });

    expect(stateCtx.get("/currentScreen")).toBe("home");
    expect(stateCtx.get("/navStack")).toEqual([]);
  });

  it("executes custom handlers", async () => {
    const stateCtx = createStateContext({});
    const customHandler = vi.fn().mockResolvedValue(undefined);
    const actionCtx = createActionContext(stateCtx, {
      myAction: customHandler,
    });

    await actionCtx.execute({
      action: "myAction",
      params: { foo: "bar" },
    });

    expect(customHandler).toHaveBeenCalledWith({ foo: "bar" });
  });

  it("warns when no handler registered", async () => {
    const stateCtx = createStateContext({});
    const actionCtx = createActionContext(stateCtx);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await actionCtx.execute({ action: "unknownAction" });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("unknownAction"),
    );
    warnSpy.mockRestore();
  });

  it("tracks loading state for actions", async () => {
    const stateCtx = createStateContext({});
    let resolveHandler: () => void;
    const slowHandler = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveHandler = resolve;
        }),
    );
    const actionCtx = createActionContext(stateCtx, {
      slowAction: slowHandler,
    });

    const executePromise = actionCtx.execute({ action: "slowAction" });

    expect(actionCtx.loadingActions.has("slowAction")).toBe(true);

    resolveHandler!();
    await executePromise;

    expect(actionCtx.loadingActions.has("slowAction")).toBe(false);
  });

  it("allows registering handlers dynamically", async () => {
    const stateCtx = createStateContext({});
    const actionCtx = createActionContext(stateCtx);
    const dynamicHandler = vi.fn();

    actionCtx.registerHandler("dynamicAction", dynamicHandler);
    await actionCtx.execute({ action: "dynamicAction", params: { x: 1 } });

    expect(dynamicHandler).toHaveBeenCalledWith({ x: 1 });
  });
});
