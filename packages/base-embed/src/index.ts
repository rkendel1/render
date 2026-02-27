/**
 * @json-render/base-embed
 *
 * Platform-ready BaseEmbed component for render-only Web Components
 * with legacy React/Vue mount support.
 */

export type { BaseEmbedProps, BaseEmbedRuntime } from "./base-embed";

export { BaseEmbed, createBaseEmbed } from "./base-embed";

// Re-export types from dependencies for convenience
export type {
  RenderNode,
  RenderContext,
  RenderFunction,
  ComponentContract,
  ComponentDefinition,
  PropContract,
  ActionContract,
} from "@json-render/contracts";
