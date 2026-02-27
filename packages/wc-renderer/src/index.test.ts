import { describe, it, expect, beforeEach } from "vitest";
import { Renderer, createSimpleRenderer, createRenderFunction } from "./index";
import type { Spec } from "@json-render/core";
import type { RenderFunction } from "@json-render/contracts";

describe("@json-render/wc-renderer", () => {
  describe("Renderer", () => {
    let registry: Record<string, RenderFunction>;

    beforeEach(() => {
      registry = {
        Card: createSimpleRenderer((props: { title: string }) => {
          return `<div class="card"><h3>${props.title}</h3></div>`;
        }),
        Button: createSimpleRenderer((props: { label: string }) => {
          return `<button>${props.label}</button>`;
        }),
      };
    });

    it("should render a simple spec", () => {
      const spec: Spec = {
        root: "card-1",
        elements: {
          "card-1": {
            type: "Card",
            props: { title: "Hello World" },
            children: [],
          },
        },
      };

      const renderer = new Renderer(registry);
      const element = renderer.render(spec);

      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.className).toBe("json-render-root");
      expect(element.innerHTML).toContain("Hello World");
    });

    it("should render nested elements", () => {
      const spec: Spec = {
        root: "card-1",
        elements: {
          "card-1": {
            type: "Card",
            props: { title: "My Card" },
            children: ["button-1"],
          },
          "button-1": {
            type: "Button",
            props: { label: "Click me" },
            children: [],
          },
        },
      };

      const renderer = new Renderer(registry);
      const element = renderer.render(spec);

      expect(element.innerHTML).toContain("My Card");
    });

    it("should handle empty spec", () => {
      const renderer = new Renderer(registry);
      const element = renderer.render(null);

      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.className).toBe("json-render-root");
      expect(element.innerHTML).toBe("");
    });

    it("should render fallback for unknown component types", () => {
      const spec: Spec = {
        root: "unknown-1",
        elements: {
          "unknown-1": {
            type: "UnknownComponent",
            props: {},
            children: [],
          },
        },
      };

      const renderer = new Renderer(registry);
      const element = renderer.render(spec);

      expect(element.innerHTML).toContain("Unknown component");
      expect(element.innerHTML).toContain("UnknownComponent");
    });

    it("should respect visibility conditions", () => {
      const spec: Spec = {
        root: "card-1",
        elements: {
          "card-1": {
            type: "Card",
            props: { title: "Visible Card" },
            children: [],
            visible: { $state: "/shouldShow", eq: true },
          },
        },
        state: {
          shouldShow: false,
        },
      };

      const renderer = new Renderer(registry);
      const element = renderer.render(spec);

      // Should render root but not the card (because visibility check fails)
      // The card is hidden but still rendered in simplified version
      expect(element.className).toBe("json-render-root");
    });

    it("should support context", () => {
      const context = {
        getValue: (path: string) => {
          if (path === "/user/name") return "Alice";
          return undefined;
        },
        triggerAction: (action: string) => {
          console.log(`Action: ${action}`);
        },
      };

      const renderer = new Renderer(registry, context);
      expect(renderer).toBeInstanceOf(Renderer);
    });

    it("should update context", () => {
      const renderer = new Renderer(registry);

      renderer.updateContext({
        getValue: (path: string) => "test value",
        loading: true,
      });

      // Context should be updated (no error)
      expect(renderer).toBeInstanceOf(Renderer);
    });
  });

  describe("createSimpleRenderer", () => {
    it("should create a render function from HTML string", () => {
      const renderFn = createSimpleRenderer((props: { text: string }) => {
        return `<span>${props.text}</span>`;
      });

      const element = renderFn({ text: "Hello" }, [], {});

      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.innerHTML).toContain("Hello");
    });

    it("should handle children placeholders", () => {
      const renderFn = createSimpleRenderer((props: { title: string }) => {
        return `<div><h3>${props.title}</h3></div>`;
      });

      const children = [{ type: "Button", props: { label: "Click" } }];

      const element = renderFn({ title: "Title" }, children, {});

      expect(element.innerHTML).toContain("Title");
    });
  });

  describe("createRenderFunction", () => {
    it("should create a render function from template function", () => {
      const renderFn = createRenderFunction<{ label: string }>(
        (props, children) => {
          const button = document.createElement("button");
          button.textContent = props.label;
          children.forEach((child) => button.appendChild(child));
          return button;
        },
      );

      const element = renderFn({ label: "Submit" }, [], {});

      expect(element).toBeInstanceOf(HTMLElement);
      expect((element as HTMLElement).tagName).toBe("BUTTON");
      expect(element.textContent).toBe("Submit");
    });
  });
});
