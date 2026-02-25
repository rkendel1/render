import { describe, it, expect } from "vitest";
import { defineComponent, h, createApp } from "vue";
import {
  VisibilityProvider,
  useVisibility,
  useIsVisible,
} from "./visibility.js";
import { StateProvider } from "./state.js";

function runInProviders<T>(
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
      return () =>
        h(StateProvider, { initialState }, () =>
          h(VisibilityProvider, null, () => h(Inner)),
        );
    },
  });

  const container = document.createElement("div");
  const app = createApp(App);
  app.mount(container);
  app.unmount();

  return result!;
}

describe("useVisibility", () => {
  it("provides isVisible function", () => {
    const ctx = runInProviders({}, () => useVisibility());
    expect(typeof ctx.isVisible).toBe("function");
  });

  it("provides visibility context with stateModel", () => {
    const ctx = runInProviders({ test: true }, () => useVisibility());
    expect(ctx.ctx.stateModel).toEqual({ test: true });
  });
});

describe("useIsVisible", () => {
  it("returns true for undefined condition", () => {
    const result = runInProviders({}, () => useIsVisible(undefined));
    expect(result).toBe(true);
  });

  it("returns true for true condition", () => {
    const result = runInProviders({}, () => useIsVisible(true));
    expect(result).toBe(true);
  });

  it("returns false for false condition", () => {
    const result = runInProviders({}, () => useIsVisible(false));
    expect(result).toBe(false);
  });

  it("evaluates $state conditions against state", () => {
    const trueResult = runInProviders({ isVisible: true }, () =>
      useIsVisible({ $state: "/isVisible" }),
    );
    expect(trueResult).toBe(true);

    const falseResult = runInProviders({ isVisible: false }, () =>
      useIsVisible({ $state: "/isVisible" }),
    );
    expect(falseResult).toBe(false);
  });

  it("evaluates equality conditions", () => {
    const result = runInProviders({ count: 1 }, () =>
      useIsVisible({ $state: "/count", eq: 1 }),
    );
    expect(result).toBe(true);
  });

  it("evaluates array conditions (implicit AND)", () => {
    const result = runInProviders({ user: { isAdmin: true }, count: 5 }, () =>
      useIsVisible([{ $state: "/user/isAdmin" }, { $state: "/count", eq: 5 }]),
    );
    expect(result).toBe(true);
  });
});
