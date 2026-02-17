<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ComponentRenderProps } from "./types.js";

  interface Props extends ComponentRenderProps<{ title?: string }> {
    children?: Snippet;
  }

  let { element, children, emit, bindings, loading }: Props = $props();
</script>

<div class="test-container" data-type={element.type} data-loading={loading}>
  {#if element.props.title}
    <h2>{element.props.title}</h2>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</div>
