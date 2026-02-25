<script lang="ts">
  import type { Spec, UIElement } from "@json-render/core";
  import { getByPath } from "@json-render/core";
  import type { ComponentRegistry, ComponentRenderer } from "./types.js";
  import { getStateContext } from "./contexts/StateProvider.svelte";
  import { setRepeatScope } from "./contexts/repeat-scope.js";
  import ElementRenderer from "./ElementRenderer.svelte";

  interface Props {
    element: UIElement;
    spec: Spec;
    registry: ComponentRegistry;
    loading?: boolean;
    fallback?: ComponentRenderer;
  }

  let { element, spec, registry, loading = false, fallback }: Props = $props();

  const stateCtx = getStateContext();

  // Get items from state
  let items = $derived(
    (getByPath(stateCtx.state, element.repeat!.statePath) as
      | unknown[]
      | undefined) ?? [],
  );
</script>

{#each items as itemValue, index (element.repeat?.key && typeof itemValue === "object" && itemValue !== null ? String((itemValue as any)[element.repeat.key] ?? index) : String(index))}
  {@const basePath = `${element.repeat!.statePath}/${index}`}
  {setRepeatScope({ item: itemValue, index, basePath })}

  {#if element.children}
    {#each element.children as childKey (childKey)}
      {#if spec.elements[childKey]}
        <ElementRenderer
          element={spec.elements[childKey]}
          {spec}
          {registry}
          {loading}
          {fallback} />
      {:else if !loading}
        <!-- Missing child element warning in dev -->
      {/if}
    {/each}
  {/if}
{/each}
