import { describe, it, expect, vi } from "vitest";
import { mount, unmount } from "svelte";
import { createStateContext } from "./state.svelte";
import { createActionContext } from "./actions.svelte";

function component(runTest: () => Promise<void>) {
  return async () => {
    let promise: Promise<void>;
    const c = mount(
      (() => {
        promise = runTest();
      }) as any,
      { target: document.body },
    );
    await promise!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    unmount(c);
  };
}

describe("createActionContext", () => {
  it(
    "executes built-in setState action",
    component(async () => {
      const stateCtx = createStateContext({ initialState: { count: 0 } });
      const actionCtx = createActionContext({ stateCtx });

      await actionCtx.execute({
        action: "setState",
        params: { statePath: "/count", value: 5 },
      });

      expect(stateCtx.state.count).toBe(5);
    }),
  );

  it(
    "executes built-in pushState action",
    component(async () => {
      const stateCtx = createStateContext({
        initialState: { items: ["a", "b"] },
      });
      const actionCtx = createActionContext({ stateCtx });

      await actionCtx.execute({
        action: "pushState",
        params: { statePath: "/items", value: "c" },
      });

      expect(stateCtx.state.items).toEqual(["a", "b", "c"]);
    }),
  );

  it(
    "pushState creates array if missing",
    component(async () => {
      const stateCtx = createStateContext();
      const actionCtx = createActionContext({ stateCtx });

      await actionCtx.execute({
        action: "pushState",
        params: { statePath: "/newList", value: "first" },
      });

      expect(stateCtx.get("/newList")).toEqual(["first"]);
    }),
  );

  it(
    "executes built-in removeState action",
    component(async () => {
      const stateCtx = createStateContext({
        initialState: { items: ["a", "b", "c"] },
      });
      const actionCtx = createActionContext({ stateCtx });

      await actionCtx.execute({
        action: "removeState",
        params: { statePath: "/items", index: 1 },
      });

      expect(stateCtx.state.items).toEqual(["a", "c"]);
    }),
  );

  it(
    "executes push navigation action",
    component(async () => {
      const stateCtx = createStateContext({
        initialState: { currentScreen: "home" },
      });
      const actionCtx = createActionContext({ stateCtx });

      await actionCtx.execute({
        action: "push",
        params: { screen: "settings" },
      });

      expect(stateCtx.get("/currentScreen")).toBe("settings");
      expect(stateCtx.get("/navStack")).toEqual(["home"]);
    }),
  );

  it(
    "executes pop navigation action",
    component(async () => {
      const stateCtx = createStateContext({
        initialState: {
          currentScreen: "settings",
          navStack: ["home"],
        },
      });
      const actionCtx = createActionContext({ stateCtx });

      await actionCtx.execute({ action: "pop" });

      expect(stateCtx.get("/currentScreen")).toBe("home");
      expect(stateCtx.get("/navStack")).toEqual([]);
    }),
  );

  it(
    "executes custom handlers",
    component(async () => {
      const stateCtx = createStateContext();
      const customHandler = vi.fn().mockResolvedValue(undefined);
      const actionCtx = createActionContext({
        stateCtx,
        handlers: {
          myAction: customHandler,
        },
      });

      await actionCtx.execute({
        action: "myAction",
        params: { foo: "bar" },
      });

      expect(customHandler).toHaveBeenCalledWith({ foo: "bar" });
    }),
  );

  it(
    "warns when no handler registered",
    component(async () => {
      const stateCtx = createStateContext();
      const actionCtx = createActionContext({ stateCtx });
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await actionCtx.execute({ action: "unknownAction" });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("unknownAction"),
      );
      warnSpy.mockRestore();
    }),
  );

  it(
    "tracks loading state for actions",
    component(async () => {
      const stateCtx = createStateContext();
      let resolveHandler: () => void;
      const slowHandler = vi.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveHandler = resolve;
          }),
      );
      const actionCtx = createActionContext({
        stateCtx,
        handlers: {
          slowAction: slowHandler,
        },
      });

      const executePromise = actionCtx.execute({ action: "slowAction" });

      expect(actionCtx.loadingActions.has("slowAction")).toBe(true);

      resolveHandler!();
      await executePromise;

      expect(actionCtx.loadingActions.has("slowAction")).toBe(false);
    }),
  );

  it(
    "allows registering handlers dynamically",
    component(async () => {
      const stateCtx = createStateContext();
      const actionCtx = createActionContext({ stateCtx });
      const dynamicHandler = vi.fn();

      actionCtx.registerHandler("dynamicAction", dynamicHandler);
      await actionCtx.execute({ action: "dynamicAction", params: { x: 1 } });

      expect(dynamicHandler).toHaveBeenCalledWith({ x: 1 });
    }),
  );

  it(
    "executes validateForm and writes result to /formValidation",
    component(async () => {
      const stateCtx = createStateContext();
      const actionCtx = createActionContext({
        stateCtx,
        validation: {
          validateAll: () => false,
          fieldStates: {
            "/form/email": {
              touched: true,
              validated: true,
              result: { valid: false, errors: ["Required"], checks: [] },
            },
          },
        },
      });

      await actionCtx.execute({ action: "validateForm" });

      expect(stateCtx.get("/formValidation")).toEqual({
        valid: false,
        errors: { "/form/email": ["Required"] },
      });
    }),
  );

  it(
    "validateForm defaults to warning when validation context is missing",
    component(async () => {
      const stateCtx = createStateContext();
      const actionCtx = createActionContext({ stateCtx });
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await actionCtx.execute({ action: "validateForm" });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("validateForm action was dispatched"),
      );
      warnSpy.mockRestore();
    }),
  );
});
