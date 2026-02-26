<script lang="ts">
  import type { ComponentRenderProps } from "@json-render/svelte";

  interface Props extends ComponentRenderProps<{
    text: string;
    level?: "h1" | "h2" | "h3" | "h4" | null;
  }> {}

  let { element }: Props = $props();

  const level = $derived(element.props.level ?? "h2");
</script>

{#if level === "h1"}
  <h1 class="text-3xl font-bold tracking-tight">{element.props.text}</h1>
{:else if level === "h2"}
  <h2 class="text-2xl font-semibold tracking-tight">{element.props.text}</h2>
{:else if level === "h3"}
  <h3 class="text-xl font-semibold">{element.props.text}</h3>
{:else}
  <h4 class="text-lg font-medium">{element.props.text}</h4>
{/if}
