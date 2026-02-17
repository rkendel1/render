// =============================================================================
// Contexts
// =============================================================================

export {
  createStateContext,
  setStateContext,
  getStateContext,
  type StateContext,
} from "./contexts/state.svelte.js";

export {
  createVisibilityContext,
  setVisibilityContext,
  getVisibilityContext,
  type VisibilityContext,
} from "./contexts/visibility.svelte.js";

export {
  createActionContext,
  setActionContext,
  getActionContext,
  type ActionContext,
  type PendingConfirmation,
} from "./contexts/actions.svelte.js";

export {
  createValidationContext,
  setValidationContext,
  getValidationContext,
  getFieldValidation,
  type ValidationContext,
  type FieldValidationState,
} from "./contexts/validation.svelte.js";

export {
  setRepeatScope,
  getRepeatScope,
  type RepeatScopeValue,
} from "./contexts/repeat-scope.js";

// =============================================================================
// Schema
// =============================================================================

export { schema, type SvelteSchema, type SvelteSpec } from "./schema.js";

// =============================================================================
// Components
// =============================================================================

export { default as Renderer } from "./Renderer.svelte";
export { default as JsonUIProvider } from "./JsonUIProvider.svelte";
export { default as ConfirmDialog } from "./ConfirmDialog.svelte";

// =============================================================================
// Types
// =============================================================================

export type {
  ComponentRenderProps,
  ComponentRenderer,
  ComponentRegistry,
  RendererProps,
  JSONUIProviderProps,
  CreateRendererProps,
} from "./types.js";

// =============================================================================
// Catalog Types
// =============================================================================

export type {
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
} from "./utils.js";

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

export {
  defineRegistry,
  type DefineRegistryResult,
  type ComponentMap,
} from "./registry.js";

// =============================================================================
// Re-exports from core
// =============================================================================

export type {
  Spec,
  UIElement,
  ActionBinding,
  ActionHandler,
} from "@json-render/core";
