<script module lang="ts">
  /**
   * Props for JSONUIProvider
   */
  export interface JSONUIProviderProps {
    /** Component registry */
    registry: ComponentRegistry;
    /**
     * External store (controlled mode). When provided, `initialState` and
     * `onStateChange` are ignored.
     */
    store?: StateStore;
    /** Initial state model */
    initialState?: Record<string, unknown>;
    /** Action handlers */
    handlers?: Record<string, ActionHandler>;
    /** Navigation function */
    navigate?: (path: string) => void;
    /** Custom validation functions */
    validationFunctions?: Record<
      string,
      (value: unknown, args?: Record<string, unknown>) => boolean
    >;
    /** Callback when state changes (uncontrolled mode) */
    onStateChange?: (changes: Array<{ path: string; value: unknown }>) => void;
    /** Children snippet */
    children: Snippet;
  }
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ActionHandler, StateStore } from "@json-render/core";
  import StateProvider from "./contexts/StateProvider.svelte";
  import VisibilityProvider from "./contexts/VisibilityProvider.svelte";
  import ValidationProvider from "./contexts/ValidationProvider.svelte";
  import ActionProvider from "./contexts/ActionProvider.svelte";
  import type { ComponentRegistry } from "./renderer.js";

  let {
    store,
    initialState = {},
    handlers = {},
    navigate,
    validationFunctions = {},
    onStateChange,
    children,
  }: JSONUIProviderProps = $props();
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
