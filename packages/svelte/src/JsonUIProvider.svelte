<script lang="ts">
  import type { Snippet } from "svelte";
  import type {
    ActionHandler,
    StateStore,
    ValidationFunction,
  } from "@json-render/core";
  import StateProvider from "./contexts/StateProvider.svelte";
  import VisibilityProvider from "./contexts/VisibilityProvider.svelte";
  import ValidationProvider from "./contexts/ValidationProvider.svelte";
  import ActionProvider from "./contexts/ActionProvider.svelte";

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
</script>

<StateProvider {store} {initialState} {onStateChange}>
  <VisibilityProvider>
    <ValidationProvider customFunctions={validationFunctions}>
      <ActionProvider {handlers} {navigate}>
        {@render children()}
      </ActionProvider>
    </ValidationProvider>
  </VisibilityProvider>
</StateProvider>
