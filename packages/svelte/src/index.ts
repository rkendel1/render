// =============================================================================
// Contexts
// =============================================================================

export {
  default as StateProvider,
  getStateContext,
  getStateValue,
  getBoundProp,
  type StateContext,
} from "./contexts/StateProvider.svelte";

export {
  default as VisibilityProvider,
  getVisibilityContext,
  isVisible,
  type VisibilityContext,
} from "./contexts/VisibilityProvider.svelte";

export {
  default as ActionProvider,
  getActionContext,
  getAction,
  type ActionContext,
  type PendingConfirmation,
} from "./contexts/ActionProvider.svelte";

export {
  default as ValidationProvider,
  getValidationContext,
  getOptionalValidationContext,
  getFieldValidation,
  type ValidationContext,
  type FieldValidationState,
} from "./contexts/ValidationProvider.svelte";

export {
  default as RepeatScopeProvider,
  getRepeatScope,
  type RepeatScopeValue,
} from "./contexts/RepeatScopeProvider.svelte";

// =============================================================================
// Schema
// =============================================================================

export { schema, type SvelteSchema, type SvelteSpec } from "./schema.js";

// =============================================================================
// Components
// =============================================================================

export { default as JsonUIProvider } from "./JsonUIProvider.svelte";
export { default as ConfirmDialog } from "./ConfirmDialog.svelte";

// =============================================================================
// Types
// =============================================================================

export type {
  ComponentRenderer,
  ComponentRegistry,
  JSONUIProviderProps,
} from "./types.js";

// =============================================================================
// Catalog Types
// =============================================================================

export type {
  BaseComponentProps,
  SetState,
  StateModel,
  ComponentContext,
  ComponentFn,
  Components,
  ActionFn,
  Actions,
} from "./catalog-types.js";

// =============================================================================
// Utilities
// =============================================================================

export {
  flatToTree,
  buildSpecFromParts,
  getTextFromParts,
  type DataPart,
} from "./utils.svelte.js";

// =============================================================================
// Streaming
// =============================================================================

export {
  createUIStream,
  createChatUI,
  type UIStreamOptions,
  type UIStreamReturn,
  type UIStreamState,
  type ChatUIOptions,
  type ChatUIReturn,
  type ChatMessage,
  type TokenUsage,
} from "./streaming.svelte.js";

// =============================================================================
// Registry
// =============================================================================

export { defineRegistry, type DefineRegistryResult } from "./registry.js";

// =============================================================================
// Renderer
// =============================================================================

export { default as Renderer, type RendererProps } from "./Renderer.svelte";

// =============================================================================
// Re-exports from core
// =============================================================================

export type {
  Spec,
  UIElement,
  ActionBinding,
  ActionHandler,
} from "@json-render/core";
