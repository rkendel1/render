<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ActionHandler, ValidationFunction } from "@json-render/core";
  import { createStateContext } from "./contexts/state.svelte.js";
  import { createVisibilityContext } from "./contexts/visibility.svelte.js";
  import { createActionContext } from "./contexts/actions.svelte.js";
  import { createValidationContext } from "./contexts/validation.svelte.js";

  interface Props {
    initialState?: Record<string, unknown>;
    handlers?: Record<string, ActionHandler>;
    navigate?: (path: string) => void;
    validationFunctions?: Record<string, ValidationFunction>;
    onStateChange?: (path: string, value: unknown) => void;
    children: Snippet;
  }

  let {
    initialState = {},
    handlers = {},
    navigate,
    validationFunctions = {},
    onStateChange,
    children,
  }: Props = $props();

  // Create and provide contexts
  const stateCtx = createStateContext(initialState, onStateChange);

  createVisibilityContext(stateCtx);

  createActionContext(stateCtx, handlers, navigate);

  createValidationContext(stateCtx, validationFunctions);
</script>

{@render children()}
