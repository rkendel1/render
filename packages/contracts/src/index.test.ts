import { describe, it, expect } from "vitest";
import type {
  RenderNode,
  PropContract,
  ActionContract,
  ComponentContract,
  RenderContext,
  CatalogContract,
} from "./index";

describe("@json-render/contracts", () => {
  describe("RenderNode", () => {
    it("should allow creating a simple render node", () => {
      const node: RenderNode = {
        type: "Button",
        props: { label: "Click me" },
      };

      expect(node.type).toBe("Button");
      expect(node.props).toEqual({ label: "Click me" });
    });

    it("should allow creating a render node with children", () => {
      const node: RenderNode = {
        type: "Card",
        props: { title: "Hello" },
        children: [
          { type: "Button", props: { label: "Submit" } },
          { type: "Button", props: { label: "Cancel" } },
        ],
      };

      expect(node.children).toHaveLength(2);
      if (node.children && node.children.length > 0) {
        expect(node.children[0]!.type).toBe("Button");
      }
    });
  });

  describe("PropContract", () => {
    it("should define prop contracts correctly", () => {
      const contract: PropContract = {
        name: "title",
        type: "string",
        required: true,
        description: "The title text",
      };

      expect(contract.name).toBe("title");
      expect(contract.type).toBe("string");
      expect(contract.required).toBe(true);
    });
  });

  describe("ActionContract", () => {
    it("should define action contracts correctly", () => {
      const contract: ActionContract = {
        name: "submit",
        description: "Submit the form",
        params: [{ name: "formId", type: "string", required: true }],
      };

      expect(contract.name).toBe("submit");
      expect(contract.params).toHaveLength(1);
    });
  });

  describe("ComponentContract", () => {
    it("should define component contracts correctly", () => {
      const contract: ComponentContract = {
        name: "Button",
        description: "A clickable button",
        props: [
          { name: "label", type: "string", required: true },
          { name: "disabled", type: "boolean", required: false },
        ],
        actions: [{ name: "click", description: "Triggered when clicked" }],
        hasChildren: false,
      };

      expect(contract.name).toBe("Button");
      expect(contract.props).toHaveLength(2);
      expect(contract.actions).toHaveLength(1);
      expect(contract.hasChildren).toBe(false);
    });
  });

  describe("RenderContext", () => {
    it("should allow creating render contexts", () => {
      const context: RenderContext = {
        getValue: (path: string) => {
          if (path === "/user/name") return "Alice";
          return undefined;
        },
        triggerAction: (action: string, params?: Record<string, unknown>) => {
          console.log(`Action: ${action}`, params);
        },
        loading: false,
      };

      expect(context.getValue?.("/user/name")).toBe("Alice");
      expect(context.loading).toBe(false);
    });
  });

  describe("CatalogContract", () => {
    it("should define catalog contracts correctly", () => {
      const catalog: CatalogContract = {
        name: "my-components",
        components: {
          Card: {
            name: "Card",
            props: [{ name: "title", type: "string", required: true }],
            hasChildren: true,
          },
          Button: {
            name: "Button",
            props: [{ name: "label", type: "string", required: true }],
            actions: [{ name: "click" }],
          },
        },
        actions: {
          submit: { name: "submit", description: "Submit form" },
        },
      };

      expect(catalog.name).toBe("my-components");
      expect(Object.keys(catalog.components)).toHaveLength(2);
      if (catalog.actions && catalog.actions.submit) {
        expect(catalog.actions.submit.name).toBe("submit");
      }
    });
  });
});
