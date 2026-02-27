/**
 * @file base-embed.test.ts
 * @description Tests for BaseEmbed component
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { BaseEmbed, createBaseEmbed } from "./base-embed";
import type { BaseEmbedProps, BaseEmbedRuntime } from "./base-embed";
import type { RenderFunction } from "@json-render/contracts";

describe("BaseEmbed", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("should create an instance", () => {
    const embed = new BaseEmbed({ container });
    expect(embed).toBeInstanceOf(BaseEmbed);
  });

  it("should create via factory function", () => {
    const embed = createBaseEmbed({ container });
    expect(embed).toBeInstanceOf(BaseEmbed);
  });

  describe("mountJSON", () => {
    it("should mount to container", () => {
      const registry: Record<string, RenderFunction> = {
        Text: (props) => {
          const div = document.createElement("div");
          div.textContent = String(props.content || "");
          return div;
        },
      };

      const embed = new BaseEmbed({
        container,
        registry,
        spec: {
          root: "text-1",
          elements: {
            "text-1": {
              type: "Text",
              props: { content: "Hello World" },
              children: [],
            },
          },
        },
      });

      const result = embed.mountJSON();
      expect(result).toBe(container);
      expect(container.textContent).toContain("Hello World");
    });

    it("should throw if no container provided", () => {
      const embed = new BaseEmbed({});
      expect(() => embed.mountJSON()).toThrow(
        "BaseEmbed.mountJSON: container is required",
      );
    });

    it("should use provided container parameter", () => {
      const otherContainer = document.createElement("div");
      const registry: Record<string, RenderFunction> = {
        Text: (props) => {
          const div = document.createElement("div");
          div.textContent = "Test";
          return div;
        },
      };

      const embed = new BaseEmbed({
        registry,
        spec: {
          root: "text-1",
          elements: {
            "text-1": { type: "Text", props: {}, children: [] },
          },
        },
      });

      embed.mountJSON(otherContainer);
      expect(otherContainer.textContent).toContain("Test");
    });

    it("should call triggerAction when action is triggered", () => {
      const dispatch = vi.fn();
      const registry: Record<string, RenderFunction> = {
        Button: (props, children, context) => {
          const button = document.createElement("button");
          button.onclick = () => {
            context.triggerAction?.("click", { id: props.id });
          };
          return button;
        },
      };

      const embed = new BaseEmbed({
        container,
        registry,
        runtime: { dispatch },
        spec: {
          root: "btn-1",
          elements: {
            "btn-1": {
              type: "Button",
              props: { id: "test-btn" },
              children: [],
            },
          },
        },
      });

      embed.mountJSON();
      const button = container.querySelector("button");
      button?.click();

      expect(dispatch).toHaveBeenCalledWith("click", { id: "test-btn" });
    });
  });

  describe("updateContext", () => {
    it("should update context and re-render", () => {
      const resolveUI = vi.fn((ctx: unknown) => {
        const context = ctx as { message: string };
        return {
          type: "Text",
          props: { content: context.message },
        };
      });

      const registry: Record<string, RenderFunction> = {
        Text: (props) => {
          const div = document.createElement("div");
          div.textContent = String(props.content || "");
          return div;
        },
      };

      const embed = new BaseEmbed({
        container,
        registry,
        context: { message: "Initial" },
        runtime: { resolveUI },
      });

      embed.mountJSON();
      expect(container.textContent).toContain("Initial");

      embed.updateContext({ message: "Updated" });
      expect(container.textContent).toContain("Updated");
      expect(resolveUI).toHaveBeenCalledTimes(2);
    });
  });

  describe("updateRegistry", () => {
    it("should update registry and re-render", () => {
      const registry: Record<string, RenderFunction> = {
        Text: (props) => {
          const div = document.createElement("div");
          div.textContent = "Old";
          return div;
        },
      };

      const embed = new BaseEmbed({
        container,
        registry,
        spec: {
          root: "text-1",
          elements: {
            "text-1": { type: "Text", props: {}, children: [] },
          },
        },
      });

      embed.mountJSON();
      expect(container.textContent).toContain("Old");

      embed.updateRegistry({
        Text: (props) => {
          const div = document.createElement("div");
          div.textContent = "New";
          return div;
        },
      });
      expect(container.textContent).toContain("New");
    });
  });

  describe("updateRuntime", () => {
    it("should update runtime and re-render", () => {
      const dispatch1 = vi.fn();
      const dispatch2 = vi.fn();

      const embed = new BaseEmbed({
        container,
        registry: {},
        runtime: { dispatch: dispatch1 },
        spec: { root: "test", elements: {} },
      });

      embed.mountJSON();
      embed.updateRuntime({ dispatch: dispatch2 });

      // Runtime should be updated
      expect(embed["props"].runtime?.dispatch).toBe(dispatch2);
    });
  });

  describe("unmount", () => {
    it("should clear container and cleanup", () => {
      const unsubscribe = vi.fn();
      const subscribe = vi.fn(() => unsubscribe);

      const registry: Record<string, RenderFunction> = {
        Text: (props) => {
          const div = document.createElement("div");
          div.textContent = "Test";
          return div;
        },
      };

      const embed = new BaseEmbed({
        container,
        registry,
        runtime: { subscribe },
        spec: {
          root: "text-1",
          elements: {
            "text-1": { type: "Text", props: {}, children: [] },
          },
        },
      });

      embed.mountJSON();
      expect(container.children.length).toBeGreaterThan(0);

      embed.unmount();
      expect(container.children.length).toBe(0);
      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe("legacy mounts", () => {
    it("should warn for mountReact", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const embed = new BaseEmbed({
        container,
        registry: {},
        spec: { root: "test", elements: {} },
      });

      embed.mountReact();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("React mount not yet implemented"),
      );
      consoleSpy.mockRestore();
    });

    it("should warn for mountVue", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const embed = new BaseEmbed({
        container,
        registry: {},
        spec: { root: "test", elements: {} },
      });

      embed.mountVue();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Vue mount not yet implemented"),
      );
      consoleSpy.mockRestore();
    });
  });
});
