<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ActionHandler, ValidationFunction } from "@json-render/core";
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
  setStateContext(stateCtx);

  const visibilityCtx = createVisibilityContext(stateCtx);
  setVisibilityContext(visibilityCtx);

  const actionCtx = createActionContext(stateCtx, handlers, navigate);
  setActionContext(actionCtx);

  const validationCtx = createValidationContext(stateCtx, validationFunctions);
  setValidationContext(validationCtx);
</script>

{@render children()}
