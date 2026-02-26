<script lang="ts">
  import type { ComponentRenderProps } from "@json-render/svelte";
  import { TrendingUp, TrendingDown, Minus } from "lucide-svelte";

  interface Props extends ComponentRenderProps<{
    label: string;
    value: string;
    detail?: string | null;
    trend?: "up" | "down" | "neutral" | null;
  }> {}

  let { element }: Props = $props();

  const trendColor = $derived(
    element.props.trend === "up"
      ? "text-green-500"
      : element.props.trend === "down"
        ? "text-red-500"
        : "text-muted-foreground"
  );
</script>

<div class="flex flex-col gap-1">
  <p class="text-sm text-muted-foreground">{element.props.label}</p>
  <div class="flex items-center gap-2">
    <span class="text-2xl font-bold">{element.props.value}</span>
    {#if element.props.trend}
      {#if element.props.trend === "up"}
        <TrendingUp class="h-4 w-4 {trendColor}" />
      {:else if element.props.trend === "down"}
        <TrendingDown class="h-4 w-4 {trendColor}" />
      {:else}
        <Minus class="h-4 w-4 {trendColor}" />
      {/if}
    {/if}
  </div>
  {#if element.props.detail}
    <p class="text-xs text-muted-foreground">{element.props.detail}</p>
  {/if}
</div>
