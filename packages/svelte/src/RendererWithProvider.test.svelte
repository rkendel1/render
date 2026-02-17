<script lang="ts">
  import type { Spec, ActionHandler } from "@json-render/core";
  import type { ComponentRegistry, ComponentRenderer } from "./types.js";
  import {
    createStateContext,
    setStateContext,
  } from "./contexts/state.svelte.js";
  import {
    createVisibilityContext,
    setVisibilityContext,
  } from "./contexts/visibility.svelte.js";
  import {
    createActionContext,
    setActionContext,
  } from "./contexts/actions.svelte.js";
  import {
    createValidationContext,
    setValidationContext,
  } from "./contexts/validation.svelte.js";
  import Renderer from "./Renderer.svelte";

  interface Props {
    spec: Spec | null;
    registry: ComponentRegistry;
    loading?: boolean;
    fallback?: ComponentRenderer;
    initialState?: Record<string, unknown>;
    handlers?: Record<string, ActionHandler>;
  }

  let {
    spec,
    registry,
    loading = false,
    fallback,
    initialState = {},
    handlers = {},
  }: Props = $props();

  // Create and provide contexts
  const stateCtx = createStateContext(initialState);
  setStateContext(stateCtx);

  const visibilityCtx = createVisibilityContext(stateCtx);
  setVisibilityContext(visibilityCtx);

  const actionCtx = createActionContext(stateCtx, handlers);
  setActionContext(actionCtx);

  const validationCtx = createValidationContext(stateCtx);
  setValidationContext(validationCtx);
</script>

<Renderer {spec} {registry} {loading} {fallback} />
