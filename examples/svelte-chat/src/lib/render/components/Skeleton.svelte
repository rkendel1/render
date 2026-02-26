<script lang="ts">
  import type { ComponentRenderProps } from "@json-render/svelte";

  interface Props extends ComponentRenderProps<{
    width?: string | null;
    height?: string | null;
  }> {}

  let { element }: Props = $props();
</script>

<div 
  class="animate-pulse rounded-md bg-muted {element.props.width ?? 'w-full'} {element.props.height ?? 'h-4'}"
></div>
