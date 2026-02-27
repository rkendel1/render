import { describe, it, expect } from "vitest";
import {
  ComponentBuilder,
  CatalogBuilder,
  buildCatalog,
  createComponentContract,
} from "./index";
import type {
  ComponentContract,
  CatalogContract,
  ComponentDefinition,
} from "@json-render/contracts";

describe("@json-render/wc-builder", () => {
  describe("ComponentBuilder", () => {
    it("should generate correct tag name", () => {
      const contract: ComponentContract = {
        name: "Card",
        props: [],
      };

      const renderFn = () => document.createElement("div");
      const builder = new ComponentBuilder(contract, renderFn, "my");

      expect(builder.getTagName()).toBe("my-card");
    });

    it("should generate custom element class code", () => {
      const contract: ComponentContract = {
        name: "Button",
        props: [
          { name: "label", type: "string", required: true },
          { name: "disabled", type: "boolean", required: false },
        ],
      };

      const renderFn = () => document.createElement("button");
      const builder = new ComponentBuilder(contract, renderFn);

      const classCode = builder.generateClass();

      expect(classCode).toContain("class ButtonElement extends HTMLElement");
      expect(classCode).toContain("customElements.define");
      expect(classCode).toContain("jr-button");
      expect(classCode).toContain("observedAttributes");
    });

    it("should generate TypeScript types", () => {
      const contract: ComponentContract = {
        name: "Card",
        props: [
          { name: "title", type: "string", required: true },
          { name: "elevated", type: "boolean", required: false },
        ],
      };

      const renderFn = () => document.createElement("div");
      const builder = new ComponentBuilder(contract, renderFn);

      const types = builder.generateTypes();

      expect(types).toContain("CardElement");
      expect(types).toContain("HTMLElementTagNameMap");
      expect(types).toContain("CardProps");
      expect(types).toContain("title: string");
      expect(types).toContain("elevated?: boolean");
    });

    it("should handle components with no props", () => {
      const contract: ComponentContract = {
        name: "Divider",
        props: [],
      };

      const renderFn = () => document.createElement("hr");
      const builder = new ComponentBuilder(contract, renderFn);

      const types = builder.generateTypes();

      expect(types).toContain("DividerProps");
      expect(types).toContain("{}");
    });
  });

  describe("CatalogBuilder", () => {
    it("should build a complete bundle", () => {
      const catalog: CatalogContract = {
        name: "test-components",
        components: {
          Card: {
            name: "Card",
            props: [{ name: "title", type: "string", required: true }],
          },
          Button: {
            name: "Button",
            props: [{ name: "label", type: "string", required: true }],
          },
        },
      };

      const components: Record<string, ComponentDefinition> = {
        Card: {
          contract: catalog.components.Card!,
          render: () => document.createElement("div"),
        },
        Button: {
          contract: catalog.components.Button!,
          render: () => document.createElement("button"),
        },
      };

      const builder = new CatalogBuilder(catalog, components);
      const result = builder.build();

      expect(result.bundle).toBeTruthy();
      expect(result.elementNames).toHaveLength(2);
      expect(result.elementNames).toContain("jr-card");
      expect(result.elementNames).toContain("jr-button");
      expect(result.catalog).toEqual(catalog);
    });

    it("should generate TypeScript definitions when requested", () => {
      const catalog: CatalogContract = {
        name: "my-components",
        components: {
          Alert: {
            name: "Alert",
            props: [{ name: "message", type: "string", required: true }],
          },
        },
      };

      const components: Record<string, ComponentDefinition> = {
        Alert: {
          contract: catalog.components.Alert!,
          render: () => document.createElement("div"),
        },
      };

      const builder = new CatalogBuilder(catalog, components, {
        generateTypes: true,
      });
      const result = builder.build();

      expect(result.types).toBeTruthy();
      expect(result.types).toContain("AlertElement");
      expect(result.types).toContain("AlertProps");
    });

    it("should respect custom prefix", () => {
      const catalog: CatalogContract = {
        name: "custom",
        components: {
          Card: {
            name: "Card",
            props: [],
          },
        },
      };

      const components: Record<string, ComponentDefinition> = {
        Card: {
          contract: catalog.components.Card!,
          render: () => document.createElement("div"),
        },
      };

      const builder = new CatalogBuilder(catalog, components, {
        prefix: "custom",
      });
      const result = builder.build();

      expect(result.elementNames).toContain("custom-card");
    });

    it("should include render functions in bundle", () => {
      const catalog: CatalogContract = {
        name: "test",
        components: {
          Simple: {
            name: "Simple",
            props: [],
          },
        },
      };

      const components: Record<string, ComponentDefinition> = {
        Simple: {
          contract: catalog.components.Simple!,
          render: () => document.createElement("div"),
        },
      };

      const builder = new CatalogBuilder(catalog, components);
      const result = builder.build();

      expect(result.bundle).toContain("renderFunctions");
      expect(result.bundle).toContain("customElements.define");
    });
  });

  describe("buildCatalog", () => {
    it("should build catalog with default options", () => {
      const catalog: CatalogContract = {
        name: "my-catalog",
        components: {
          Text: {
            name: "Text",
            props: [{ name: "content", type: "string", required: true }],
          },
        },
      };

      const components: Record<string, ComponentDefinition> = {
        Text: {
          contract: catalog.components.Text!,
          render: () => document.createElement("span"),
        },
      };

      const result = buildCatalog(catalog, components);

      expect(result.bundle).toBeTruthy();
      expect(result.catalog.name).toBe("my-catalog");
      expect(result.elementNames).toHaveLength(1);
    });

    it("should build catalog with custom options", () => {
      const catalog: CatalogContract = {
        name: "custom",
        components: {
          Box: {
            name: "Box",
            props: [],
          },
        },
      };

      const components: Record<string, ComponentDefinition> = {
        Box: {
          contract: catalog.components.Box!,
          render: () => document.createElement("div"),
        },
      };

      const result = buildCatalog(catalog, components, {
        prefix: "app",
        minify: true,
        generateTypes: false,
      });

      expect(result.elementNames).toContain("app-box");
      expect(result.types).toBeUndefined();
    });
  });

  describe("createComponentContract", () => {
    it("should create a basic component contract", () => {
      const contract = createComponentContract(
        "MyComponent",
        "A test component",
      );

      expect(contract.name).toBe("MyComponent");
      expect(contract.description).toBe("A test component");
      expect(contract.props).toEqual([]);
      expect(contract.actions).toEqual([]);
      expect(contract.hasChildren).toBe(false);
    });

    it("should create contract without description", () => {
      const contract = createComponentContract("Simple");

      expect(contract.name).toBe("Simple");
      expect(contract.description).toBeUndefined();
    });
  });
});
