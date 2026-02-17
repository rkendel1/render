<script lang="ts">
  import type { Spec } from "@json-render/core";
  import type { ComponentRegistry, ComponentRenderer } from "./types.js";
  import ElementRenderer from "./ElementRenderer.svelte";

  interface Props {
    spec: Spec | null;
    registry: ComponentRegistry;
    loading?: boolean;
    fallback?: ComponentRenderer;
  }

  let { spec, registry, loading = false, fallback }: Props = $props();

  let rootElement = $derived(spec?.root ? spec.elements[spec.root] : undefined);
</script>

{#if spec && rootElement}
  <ElementRenderer
    element={rootElement}
    {spec}
    {registry}
    {loading}
    {fallback} />
{/if}
