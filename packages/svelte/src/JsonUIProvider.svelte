<script lang="ts">
  import type { Snippet } from "svelte";
  import type {
    ActionHandler,
    StateStore,
    ValidationFunction,
  } from "@json-render/core";
  import { createStateContext } from "./contexts/state.svelte.js";
  import { createVisibilityContext } from "./contexts/visibility.svelte.js";
  import { createActionContext } from "./contexts/actions.svelte.js";
  import { createValidationContext } from "./contexts/validation.svelte.js";

  interface Props {
    store?: StateStore;
    initialState?: Record<string, unknown>;
    handlers?: Record<string, ActionHandler>;
    navigate?: (path: string) => void;
    validationFunctions?: Record<string, ValidationFunction>;
    onStateChange?: (changes: Array<{ path: string; value: unknown }>) => void;
    children: Snippet;
  }

  let {
    store,
    initialState = {},
    handlers = {},
    navigate,
    validationFunctions = {},
    onStateChange,
    children,
  }: Props = $props();

  // Create and provide contexts
  const stateCtx = createStateContext(() => ({
    store,
    initialState,
    onStateChange,
  }));

  createVisibilityContext(stateCtx);

  const validationCtx = createValidationContext(() => ({
    stateCtx,
    customFunctions: validationFunctions,
  }));

  createActionContext(() => ({
    stateCtx,
    handlers,
    navigate,
    validation: validationCtx,
  }));
</script>

{@render children()}
