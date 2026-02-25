<script lang="ts">
  import type { Spec, ActionHandler } from "@json-render/core";
  import type { ComponentRegistry, ComponentRenderer } from "./types.js";
  import { createStateContext } from "./contexts/state.svelte.js";
  import { createVisibilityContext } from "./contexts/visibility.svelte.js";
  import { createActionContext } from "./contexts/actions.svelte.js";
  import { createValidationContext } from "./contexts/validation.svelte.js";
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
  const stateCtx = createStateContext(() => ({ initialState }));

  createVisibilityContext(stateCtx);

  const validationCtx = createValidationContext(() => ({ stateCtx }));

  createActionContext(() => ({
    stateCtx,
    handlers,
    validation: validationCtx,
  }));
</script>

<Renderer {spec} {registry} {loading} {fallback} />
