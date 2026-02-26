<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ComponentRenderProps } from "@json-render/svelte";

  interface Props extends ComponentRenderProps<{
    gap?: number;
    padding?: number;
    direction?: "vertical" | "horizontal";
    align?: "start" | "center" | "end";
  }> {
    children?: Snippet;
  }

  let { element, children }: Props = $props();
  let _props = $derived(element.props);
  let horizontal = $derived(_props.direction === "horizontal");
</script>

<div
  style="
    display: flex;
    flex-direction: {horizontal ? 'row' : 'column'};
    gap: {_props.gap ?? 0}px;
    padding: {_props.padding ?? 0}px;
    align-items: {_props.align === 'start'
    ? 'flex-start'
    : _props.align === 'end'
      ? 'flex-end'
      : horizontal
        ? 'center'
        : 'stretch'};
  ">
  {#if children}
    {@render children()}
  {/if}
</div>
