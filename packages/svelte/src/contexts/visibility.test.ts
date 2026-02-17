import { describe, it, expect } from "vitest";
import { createStateContext } from "./state.svelte";
import { createVisibilityContext } from "./visibility.svelte";

describe("createVisibilityContext", () => {
  it("provides isVisible function", () => {
    const stateCtx = createStateContext({});
    const visCtx = createVisibilityContext(stateCtx);

    expect(typeof visCtx.isVisible).toBe("function");
  });

  it("provides visibility context", () => {
    const stateCtx = createStateContext({ value: true });
    const visCtx = createVisibilityContext(stateCtx);

    expect(visCtx.ctx).toBeDefined();
    expect(visCtx.ctx.stateModel).toEqual({ value: true });
  });
});

describe("isVisible", () => {
  it("returns true for undefined condition", () => {
    const stateCtx = createStateContext({});
    const visCtx = createVisibilityContext(stateCtx);

    expect(visCtx.isVisible(undefined)).toBe(true);
  });

  it("returns true for true condition", () => {
    const stateCtx = createStateContext({});
    const visCtx = createVisibilityContext(stateCtx);

    expect(visCtx.isVisible(true)).toBe(true);
  });

  it("returns false for false condition", () => {
    const stateCtx = createStateContext({});
    const visCtx = createVisibilityContext(stateCtx);

    expect(visCtx.isVisible(false)).toBe(false);
  });

  it("evaluates $state conditions against data", () => {
    const stateCtx = createStateContext({ isLoggedIn: true });
    const visCtx = createVisibilityContext(stateCtx);

    expect(visCtx.isVisible({ $state: "/isLoggedIn" })).toBe(true);

    stateCtx.set("/isLoggedIn", false);

    expect(visCtx.isVisible({ $state: "/isLoggedIn" })).toBe(false);
  });

  it("evaluates equality conditions", () => {
    const stateCtx = createStateContext({ tab: "home" });
    const visCtx = createVisibilityContext(stateCtx);

    expect(visCtx.isVisible({ $state: "/tab", eq: "home" })).toBe(true);
    expect(visCtx.isVisible({ $state: "/tab", eq: "settings" })).toBe(false);
  });

  it("evaluates array conditions (implicit AND)", () => {
    const stateCtx = createStateContext({ a: true, b: true, c: false });
    const visCtx = createVisibilityContext(stateCtx);

    expect(visCtx.isVisible([{ $state: "/a" }, { $state: "/b" }])).toBe(true);

    expect(visCtx.isVisible([{ $state: "/a" }, { $state: "/c" }])).toBe(false);
  });

  it("evaluates $and conditions", () => {
    const stateCtx = createStateContext({ x: true, y: false });
    const visCtx = createVisibilityContext(stateCtx);

    expect(
      visCtx.isVisible({ $and: [{ $state: "/x" }, { $state: "/y" }] }),
    ).toBe(false);
  });

  it("evaluates $or conditions", () => {
    const stateCtx = createStateContext({ x: true, y: false });
    const visCtx = createVisibilityContext(stateCtx);

    expect(
      visCtx.isVisible({ $or: [{ $state: "/x" }, { $state: "/y" }] }),
    ).toBe(true);
  });
});
