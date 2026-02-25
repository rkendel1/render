import { describe, it, expect } from "vitest";
import { mount, unmount } from "svelte";
import { createStateContext } from "./state.svelte";
import { createVisibilityContext } from "./visibility.svelte";

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

describe("createVisibilityContext", () => {
  it(
    "provides isVisible function",
    component(() => {
      const stateCtx = createStateContext();
      const visCtx = createVisibilityContext(stateCtx);

      expect(typeof visCtx.isVisible).toBe("function");
    }),
  );

  it(
    "provides visibility context",
    component(() => {
      const stateCtx = createStateContext({ initialState: { value: true } });
      const visCtx = createVisibilityContext(stateCtx);

      expect(visCtx.ctx).toBeDefined();
      expect(visCtx.ctx.stateModel).toEqual({ value: true });
    }),
  );
});

describe("isVisible", () => {
  it(
    "returns true for undefined condition",
    component(() => {
      const stateCtx = createStateContext();
      const visCtx = createVisibilityContext(stateCtx);

      expect(visCtx.isVisible(undefined)).toBe(true);
    }),
  );

  it(
    "returns true for true condition",
    component(() => {
      const stateCtx = createStateContext();
      const visCtx = createVisibilityContext(stateCtx);

      expect(visCtx.isVisible(true)).toBe(true);
    }),
  );

  it(
    "returns false for false condition",
    component(() => {
      const stateCtx = createStateContext();
      const visCtx = createVisibilityContext(stateCtx);

      expect(visCtx.isVisible(false)).toBe(false);
    }),
  );

  it(
    "evaluates $state conditions against data",
    component(() => {
      const stateCtx = createStateContext({
        initialState: { isLoggedIn: true },
      });
      const visCtx = createVisibilityContext(stateCtx);

      expect(visCtx.isVisible({ $state: "/isLoggedIn" })).toBe(true);

      stateCtx.set("/isLoggedIn", false);

      expect(visCtx.isVisible({ $state: "/isLoggedIn" })).toBe(false);
    }),
  );

  it(
    "evaluates equality conditions",
    component(() => {
      const stateCtx = createStateContext({ initialState: { tab: "home" } });
      const visCtx = createVisibilityContext(stateCtx);

      expect(visCtx.isVisible({ $state: "/tab", eq: "home" })).toBe(true);
      expect(visCtx.isVisible({ $state: "/tab", eq: "settings" })).toBe(false);
    }),
  );

  it(
    "evaluates array conditions (implicit AND)",
    component(() => {
      const stateCtx = createStateContext({
        initialState: { a: true, b: true, c: false },
      });
      const visCtx = createVisibilityContext(stateCtx);

      expect(visCtx.isVisible([{ $state: "/a" }, { $state: "/b" }])).toBe(true);

      expect(visCtx.isVisible([{ $state: "/a" }, { $state: "/c" }])).toBe(
        false,
      );
    }),
  );

  it(
    "evaluates $and conditions",
    component(() => {
      const stateCtx = createStateContext({
        initialState: { x: true, y: false },
      });
      const visCtx = createVisibilityContext(stateCtx);

      expect(
        visCtx.isVisible({ $and: [{ $state: "/x" }, { $state: "/y" }] }),
      ).toBe(false);
    }),
  );

  it(
    "evaluates $or conditions",
    component(() => {
      const stateCtx = createStateContext({
        initialState: { x: true, y: false },
      });
      const visCtx = createVisibilityContext(stateCtx);

      expect(
        visCtx.isVisible({ $or: [{ $state: "/x" }, { $state: "/y" }] }),
      ).toBe(true);
    }),
  );
});
