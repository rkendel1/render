<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ComponentRenderProps } from "@json-render/svelte";

  interface Props extends ComponentRenderProps<{
    columns?: "1" | "2" | "3" | "4" | null;
    gap?: "sm" | "md" | "lg" | null;
  }> {
    children?: Snippet;
  }

  let { element, children }: Props = $props();

  const colsClass = $derived(
    {
      "1": "grid-cols-1",
      "2": "grid-cols-1 md:grid-cols-2",
      "3": "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      "4": "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    }[element.props.columns ?? "3"] ?? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
  );
  const gapClass = $derived(
    { sm: "gap-2", md: "gap-4", lg: "gap-6" }[element.props.gap ?? "md"] ?? "gap-4"
  );
</script>

<div class="grid {colsClass} {gapClass}">
  {#if children}
    {@render children()}
  {/if}
</div>
