import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import {
  defineRegistry,
  Renderer,
  JSONUIProvider,
} from "./renderer";
import { defineCatalog, type Spec } from "@json-render/core";
import { z } from "zod";
import { schema } from "./schema";

describe("Renderer", () => {
  it("renders null for null spec", () => {
    const element = React.createElement(Renderer, {
      spec: null,
      registry: {},
    });
    expect(element).toBeDefined();
    expect(element.props.spec).toBeNull();
  });

  it("renders null for spec without root", () => {
    const element = React.createElement(Renderer, {
      spec: { root: "", elements: {} },
      registry: {},
    });
    expect(element).toBeDefined();
  });

  it("accepts loading prop", () => {
    const element = React.createElement(Renderer, {
      spec: null,
      registry: {},
      loading: true,
    });
    expect(element.props.loading).toBe(true);
  });

  it("accepts fallback prop", () => {
    const Fallback = () =>
      React.createElement("div", null, "Unknown component");

    const element = React.createElement(Renderer, {
      spec: null,
      registry: {},
      fallback: Fallback,
    });
    expect(element.props.fallback).toBe(Fallback);
  });
});

describe("Renderer - Named Slots", () => {
  it("passes named slots to components", () => {
    const spec: Spec = {
      root: "layout",
      elements: {
        layout: {
          type: "Layout",
          props: {},
          slots: {
            header: ["header-el"],
            footer: ["footer-el"],
          },
          children: ["main-el"],
        },
        "header-el": {
          type: "Text",
          props: { content: "Header Content" },
        },
        "footer-el": {
          type: "Text",
          props: { content: "Footer Content" },
        },
        "main-el": {
          type: "Text",
          props: { content: "Main Content" },
        },
      },
    };

    const catalog = defineCatalog(schema, {
      components: {
        Layout: {
          props: z.object({}),
          slots: ["header", "footer"],
          description: "Layout component with header and footer slots",
        },
        Text: {
          props: z.object({ content: z.string() }),
          slots: [],
          description: "Text component",
        },
      },
      actions: {},
    });

    const { registry } = defineRegistry(catalog, {
      components: {
        Layout: ({ children, slots }) => (
          <div data-testid="layout">
            <header data-testid="header-slot">{slots?.header}</header>
            <main data-testid="main-slot">{children}</main>
            <footer data-testid="footer-slot">{slots?.footer}</footer>
          </div>
        ),
        Text: ({ props }: { props: { content: string } }) => (
          <span data-testid="text">{props.content}</span>
        ),
      },
    });

    const { getByTestId, getAllByTestId } = render(
      <JSONUIProvider registry={registry}>
        <Renderer spec={spec} registry={registry} />
      </JSONUIProvider>,
    );

    const layout = getByTestId("layout");
    expect(layout).toBeDefined();

    const headerSlot = getByTestId("header-slot");
    expect(headerSlot.textContent).toBe("Header Content");

    const mainSlot = getByTestId("main-slot");
    expect(mainSlot.textContent).toBe("Main Content");

    const footerSlot = getByTestId("footer-slot");
    expect(footerSlot.textContent).toBe("Footer Content");

    const texts = getAllByTestId("text");
    expect(texts.length).toBe(3);
  });

  it("warns when spec references undeclared slots", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const spec: Spec = {
      root: "layout",
      elements: {
        layout: {
          type: "Layout",
          props: {},
          slots: {
            sidebar: ["text-1"], // 'sidebar' not declared in catalog
          },
        },
        "text-1": {
          type: "Text",
          props: { content: "Test" },
        },
      },
    };

    const catalog = defineCatalog(schema, {
      components: {
        Layout: {
          props: z.object({}),
          slots: ["header", "footer"], // sidebar NOT included
          description: "Layout component",
        },
        Text: {
          props: z.object({ content: z.string() }),
          slots: [],
          description: "Text component",
        },
      },
      actions: {},
    });

    const { registry } = defineRegistry(catalog, {
      components: {
        Layout: ({ slots }) => <div>{slots?.sidebar}</div>,
        Text: ({ props }: { props: { content: string } }) => (
          <span>{props.content}</span>
        ),
      },
    });

    render(
      <JSONUIProvider registry={registry}>
        <Renderer spec={spec} registry={registry} />
      </JSONUIProvider>,
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unknown slot "sidebar" on component "Layout"'),
    );

    consoleSpy.mockRestore();
  });

  it("warns when using slots.default", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const spec: Spec = {
      root: "layout",
      elements: {
        layout: {
          type: "Layout",
          props: {},
          slots: {
            default: ["text-1"], // Should warn - slots.default is not allowed
          },
          children: ["text-2"],
        },
        "text-1": {
          type: "Text",
          props: { content: "From Default Slot" },
        },
        "text-2": {
          type: "Text",
          props: { content: "From Children" },
        },
      },
    };

    const catalog = defineCatalog(schema, {
      components: {
        Layout: {
          props: z.object({}),
          slots: ["header", "footer"], // default NOT included
          description: "Layout component",
        },
        Text: {
          props: z.object({ content: z.string() }),
          slots: [],
          description: "Text component",
        },
      },
      actions: {},
    });

    const { registry } = defineRegistry(catalog, {
      components: {
        Layout: ({ children, slots }) => (
          <div data-testid="layout">
            <div data-testid="default-slot">{slots?.default}</div>
            <div data-testid="children">{children}</div>
          </div>
        ),
        Text: ({ props }: { props: { content: string } }) => (
          <span>{props.content}</span>
        ),
      },
    });

    const { getByTestId } = render(
      <JSONUIProvider registry={registry}>
        <Renderer spec={spec} registry={registry} />
      </JSONUIProvider>,
    );

    // Should warn about slots.default
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("uses slots.default"),
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Use the "children" field instead'),
    );

    const layout = getByTestId("layout");
    expect(layout.textContent).toContain("From Children");
    expect(layout.textContent).toContain("From Default Slot");

    consoleSpy.mockRestore();
  });

  it("warns when slot references missing element", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const spec: Spec = {
      root: "layout",
      elements: {
        layout: {
          type: "Layout",
          props: {},
          slots: {
            header: ["missing-header"], // This element doesn't exist
          },
          children: ["text-1"],
        },
        "text-1": {
          type: "Text",
          props: { content: "Main Content" },
        },
      },
    };

    const catalog = defineCatalog(schema, {
      components: {
        Layout: {
          props: z.object({}),
          slots: ["header", "footer"],
          description: "Layout component",
        },
        Text: {
          props: z.object({ content: z.string() }),
          slots: [],
          description: "Text component",
        },
      },
      actions: {},
    });

    const { registry } = defineRegistry(catalog, {
      components: {
        Layout: ({ children, slots }) => (
          <div data-testid="layout">
            <header data-testid="header">{slots?.header}</header>
            <main>{children}</main>
          </div>
        ),
        Text: ({ props }: { props: { content: string } }) => (
          <span>{props.content}</span>
        ),
      },
    });

    const { getByTestId } = render(
      <JSONUIProvider registry={registry}>
        <Renderer spec={spec} registry={registry} />
      </JSONUIProvider>,
    );

    // Should warn about missing element in slot
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Missing element "missing-header" referenced in slot "header" of "Layout"',
      ),
    );

    // Layout should still render with empty header
    const layout = getByTestId("layout");
    expect(layout).toBeDefined();

    consoleSpy.mockRestore();
  });
});
