import { describe, it, expect, vi } from "vitest";
import React, { useRef, useEffect } from "react";
import { render, act } from "@testing-library/react";
import { DataProvider, useData } from "./data";
import { VisibilityProvider } from "./visibility";
import { ActionProvider } from "./actions";

/**
 * Regression test for infinite re-render bug (Issue #53).
 *
 * The Renderer component (and its context providers) caused infinite
 * re-renders when given a static spec in a non-streaming scenario.
 *
 * Root causes:
 * 1. DataProvider.get depended on `data`, causing cascading memo invalidation
 * 2. ActionProvider.execute depended on `data` and `handlers` directly,
 *    so every data change recreated the execute callback → new context value
 * 3. createRenderer created a new `actionHandlers` object on every render
 */

/** Helper component that counts how many times it renders */
function RenderCounter({ onRender }: { onRender: (count: number) => void }) {
  const countRef = useRef(0);
  countRef.current += 1;

  useEffect(() => {
    onRender(countRef.current);
  });

  return React.createElement(
    "div",
    { "data-testid": "counter" },
    `renders: ${countRef.current}`,
  );
}

/** Helper that reads from DataProvider to subscribe to context changes */
function DataConsumer({ onRender }: { onRender: (count: number) => void }) {
  const { data } = useData();
  const countRef = useRef(0);
  countRef.current += 1;

  useEffect(() => {
    onRender(countRef.current);
  });

  return React.createElement("div", null, JSON.stringify(data));
}

describe("Infinite re-render prevention", () => {
  it("DataProvider does not cause re-renders when initialData reference changes but value is the same", async () => {
    const renderCounts: number[] = [];
    const onRender = (count: number) => {
      renderCounts.push(count);
    };

    const staticData = { user: { name: "John" } };

    const { rerender } = render(
      React.createElement(
        DataProvider,
        { initialData: staticData },
        React.createElement(DataConsumer, { onRender }),
      ),
    );

    // Re-render with a new object reference but same values
    await act(async () => {
      rerender(
        React.createElement(
          DataProvider,
          { initialData: { user: { name: "John" } } },
          React.createElement(DataConsumer, { onRender }),
        ),
      );
    });

    // Should render at most twice (initial + rerender from parent),
    // NOT keep growing indefinitely
    const lastCount = renderCounts[renderCounts.length - 1];
    expect(lastCount).toBeLessThanOrEqual(3);
  });

  it("DataProvider with empty initialData does not trigger infinite updates", async () => {
    const renderCounts: number[] = [];
    const onRender = (count: number) => {
      renderCounts.push(count);
    };

    const { rerender } = render(
      React.createElement(
        DataProvider,
        { initialData: {} },
        React.createElement(DataConsumer, { onRender }),
      ),
    );

    // Re-render with a new empty object reference
    await act(async () => {
      rerender(
        React.createElement(
          DataProvider,
          { initialData: {} },
          React.createElement(DataConsumer, { onRender }),
        ),
      );
    });

    const lastCount = renderCounts[renderCounts.length - 1];
    expect(lastCount).toBeLessThanOrEqual(3);
  });

  it("full provider stack does not cause infinite re-renders with static data", async () => {
    const renderCounts: number[] = [];
    const onRender = (count: number) => {
      renderCounts.push(count);
    };

    const staticData = { items: [1, 2, 3] };

    const tree = React.createElement(
      DataProvider,
      { initialData: staticData },
      React.createElement(
        VisibilityProvider,
        null,
        React.createElement(
          ActionProvider,
          { handlers: {} },
          React.createElement(RenderCounter, { onRender }),
        ),
      ),
    );

    const { rerender } = render(tree);

    // Re-render the entire tree with same-value data but new references
    await act(async () => {
      rerender(
        React.createElement(
          DataProvider,
          { initialData: { items: [1, 2, 3] } },
          React.createElement(
            VisibilityProvider,
            null,
            React.createElement(
              ActionProvider,
              { handlers: {} },
              React.createElement(RenderCounter, { onRender }),
            ),
          ),
        ),
      );
    });

    // With the fix, render count should stabilize (not grow unbounded)
    const lastCount = renderCounts[renderCounts.length - 1];
    expect(lastCount).toBeLessThanOrEqual(4);
  });

  it("DataProvider.get callback identity is stable across data changes", async () => {
    const getCallbacks: Array<(path: string) => unknown> = [];

    function GetCollector() {
      const { get, set } = useData();
      const isFirst = useRef(true);

      getCallbacks.push(get);

      useEffect(() => {
        if (isFirst.current) {
          isFirst.current = false;
          // Trigger a data change — `get` should NOT change identity
          set("/foo", "bar");
        }
      }, [set]);

      return null;
    }

    render(
      React.createElement(
        DataProvider,
        { initialData: {} },
        React.createElement(GetCollector),
      ),
    );

    // Wait for effects
    await act(async () => {});

    // `get` should have the same reference across renders
    expect(getCallbacks.length).toBeGreaterThanOrEqual(2);
    expect(getCallbacks[0]).toBe(getCallbacks[1]);
  });
});
